import { describe, expect, it } from 'vitest';
import { migrateWebhooks } from 'src/logic-functions/migration/migrate-webhooks.util';
import { FieldMetadataType } from 'src/logic-functions/types/field-metadata-type.enum';
import { FieldsListType, ObjectOpenRecordIn, ObjectType } from 'src/logic-functions/types/find-objects-fields.type';
import { View } from 'src/logic-functions/types/view-entities.type';
import { Skill } from 'src/logic-functions/types/skill.type';
import { Webhook } from 'src/logic-functions/types/webhook.type';
import { createMockGraphqlClient } from 'src/__tests__/utils/mock-graphql-client';
import { migrateSkills } from "src/logic-functions/migration/migrate-skills.util";
import { migrateViews } from "src/logic-functions/migration/migrate-views.util";
import { migrateRecordsForObject } from "src/logic-functions/migration/migrate-records-for-object.util";
import { migrateRecordPageLayouts } from "src/logic-functions/migration/migrate-page-record-layouts.util";
import { PageLayout, PageLayoutWidget } from "src/logic-functions/types/dashboard.type";

describe('migrateSkills', () => {
  const buildSkill = (overrides: Partial<Skill> = {}): Skill => ({
    id: 'skill-1',
    name: 'my-skill',
    label: 'My Skill',
    icon: null,
    description: null,
    content: 'Do the thing.',
    isCustom: true,
    ...overrides,
  });

  it('creates only the custom skill missing from the target, skipping standard and already-migrated ones', async () => {
    const sourceSkills = [
      buildSkill({ id: 'custom-missing', name: 'custom-missing' }),
      buildSkill({ id: 'standard-skill', name: 'standard-skill', isCustom: false }),
      buildSkill({ id: 'custom-existing', name: 'custom-existing' }),
    ];
    const targetSkills = [buildSkill({ id: 'custom-existing', name: 'custom-existing' })];

    const { client, calls } = createMockGraphqlClient({
      createSkill: { createSkill: { id: 'target-custom-missing' } },
    });

    await migrateSkills(client, sourceSkills, targetSkills);

    const createCalls = calls.filter((call) => call.operationName === 'createSkill');
    expect(createCalls).toHaveLength(1);
    expect(createCalls[0].variables.input).toMatchObject({ id: 'custom-missing', name: 'custom-missing' });
  });
});

describe('migrateWebhooks', () => {
  const webhook: Webhook = {
    id: 'webhook-1',
    targetUrl: 'https://example.com/hook',
    operations: ['person.created'],
    description: 'Notify on new people',
  };

  it('creates a missing webhook without forwarding a secret', async () => {
    const { client, calls } = createMockGraphqlClient({
      createWebhook: { createWebhook: { id: 'target-webhook-1' } },
    });

    await migrateWebhooks(client, [webhook]);

    const createCalls = calls.filter((call) => call.operationName === 'createWebhook');
    expect(createCalls).toHaveLength(1);
    const input = createCalls[0].variables.input as Record<string, unknown>;
    expect(input).toMatchObject({ id: 'webhook-1', targetUrl: webhook.targetUrl, operations: webhook.operations });
    // Regression: forwarding the source secret would make both workspaces share one HMAC key.
    expect('secret' in input).toBe(false);
  });
});

describe('migrateViews', () => {
  const view: View = {
    id: 'view-1',
    name: 'All People',
    objectMetadataId: 'source-object-1',
    type: 'TABLE',
    key: null,
    icon: 'IconList',
    position: 0,
    isCompact: false,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataId: null,
    mainGroupByFieldMetadataId: null,
    shouldHideEmptyGroups: false,
    kanbanColumnWidth: null,
    calendarFieldMetadataId: null,
    calendarEndFieldMetadataId: null,
    anyFieldFilterValue: null,
    calendarLayout: null,
    viewFields: [],
    viewFilters: [
      {
        id: 'filter-1',
        fieldMetadataId: 'source-field-1',
        operand: 'CONTAINS',
        value: 'Acme',
        viewFilterGroupId: null,
        positionInViewFilterGroup: null,
        subFieldName: null,
        relationTargetFieldMetadataId: null,
        viewId: 'view-1',
      },
    ],
    viewFilterGroups: [],
    viewSorts: [],
    viewGroups: [],
    viewFieldGroups: [],
  };

  it('creates the view and its filter with ids remapped against the target workspace', async () => {
    const { client, calls } = createMockGraphqlClient({
      createView: { createView: { id: 'view-1' } },
      createViewFilter: { createViewFilter: { id: 'filter-1' } },
    });
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);
    const targetFieldIdBySourceFieldId = new Map([['source-field-1', 'target-field-1']]);

    await migrateViews(client, [view], [], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    const createViewCalls = calls.filter((call) => call.operationName === 'createView');
    expect(createViewCalls).toHaveLength(1);
    expect(createViewCalls[0].variables.input).toMatchObject({ id: 'view-1', objectMetadataId: 'target-object-1' });

    const createFilterCalls = calls.filter((call) => call.operationName === 'createViewFilter');
    expect(createFilterCalls).toHaveLength(1);
    expect(createFilterCalls[0].variables.input).toMatchObject({ id: 'filter-1', fieldMetadataId: 'target-field-1', viewId: 'view-1' });
  });

  it('skips the whole view (and never touches its sub-entities) when its object cannot be resolved', async () => {
    const { client, calls } = createMockGraphqlClient({});

    await migrateViews(client, [view], [], new Map(), new Map());

    expect(calls).toHaveLength(0);
  });

  it('skips a view already present in the target, but still creates a sub-entity missing from it', async () => {
    // The target view exists (same id) but has no filters yet - existence is tracked per
    // sub-entity id, not inherited wholesale from the parent view being present.
    const targetViewWithoutFilters: View = { ...view, viewFilters: [] };
    const { client, calls } = createMockGraphqlClient({
      createViewFilter: { createViewFilter: { id: 'filter-1' } },
    });
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);
    const targetFieldIdBySourceFieldId = new Map([['source-field-1', 'target-field-1']]);

    await migrateViews(client, [view], [targetViewWithoutFilters], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    expect(calls.filter((call) => call.operationName === 'createView')).toHaveLength(0);
    expect(calls.filter((call) => call.operationName === 'createViewFilter')).toHaveLength(1);
  });

  it('never re-creates an INDEX view, but redirects its filter onto the target object\'s own INDEX view', async () => {
    const indexView: View = { ...view, key: 'INDEX' };
    const targetIndexView: View = {
      ...view,
      id: 'target-index-view',
      objectMetadataId: 'target-object-1',
      key: 'INDEX',
      viewFilters: [],
    };
    const { client, calls } = createMockGraphqlClient({
      createView: { createView: { id: 'view-1' } },
      createViewFilter: { createViewFilter: { id: 'filter-1' } },
    });
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);
    const targetFieldIdBySourceFieldId = new Map([['source-field-1', 'target-field-1']]);

    await migrateViews(client, [indexView], [targetIndexView], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    expect(calls.filter((call) => call.operationName === 'createView')).toHaveLength(0);
    const createFilterCalls = calls.filter((call) => call.operationName === 'createViewFilter');
    expect(createFilterCalls).toHaveLength(1);
    expect(createFilterCalls[0].variables.input).toMatchObject({ id: 'filter-1', fieldMetadataId: 'target-field-1', viewId: 'target-index-view' });
  });

  it('skips an INDEX view\'s customization entirely when the target object has no INDEX view of its own', async () => {
    const indexView: View = { ...view, key: 'INDEX' };
    const { client, calls } = createMockGraphqlClient({});
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);
    const targetFieldIdBySourceFieldId = new Map([['source-field-1', 'target-field-1']]);

    await migrateViews(client, [indexView], [], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    expect(calls).toHaveLength(0);
  });

  it('does not duplicate a viewField already present on the target INDEX view for the same field', async () => {
    const indexViewWithField: View = {
      ...view,
      key: 'INDEX',
      viewFilters: [],
      viewFields: [
        {
          id: 'source-view-field-1',
          fieldMetadataId: 'source-field-1',
          isVisible: true,
          size: 100,
          position: 0,
          aggregateOperation: null,
          viewId: 'view-1',
          viewFieldGroupId: null,
        },
      ],
    };
    const targetIndexView: View = {
      ...view,
      id: 'target-index-view',
      objectMetadataId: 'target-object-1',
      key: 'INDEX',
      viewFilters: [],
      viewFields: [
        {
          id: 'target-auto-view-field-1',
          fieldMetadataId: 'target-field-1',
          isVisible: true,
          size: 100,
          position: 0,
          aggregateOperation: null,
          viewId: 'target-index-view',
          viewFieldGroupId: null,
        },
      ],
    };
    const { client, calls } = createMockGraphqlClient({});
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);
    const targetFieldIdBySourceFieldId = new Map([['source-field-1', 'target-field-1']]);

    await migrateViews(client, [indexViewWithField], [targetIndexView], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    expect(calls.filter((call) => call.operationName === 'createViewField')).toHaveLength(0);
  });
});

describe('migrateRecordsForObject', () => {
  const buildTitleField = (): FieldsListType => ({
    applicationId: 'app-1',
    description: '',
    icon: 'IconText',
    id: 'field-title',
    isActive: true,
    isLabelSyncedWithName: false,
    isNullable: true,
    isSystem: false,
    isUIEditable: true,
    isUIReadOnly: false,
    isUnique: false,
    label: 'Title',
    morphId: null,
    name: 'title',
    objectMetadataId: 'source-object-1',
    universalIdentifier: 'universal-field-title',
    type: FieldMetadataType.TEXT,
    defaultValue: null,
    settings: null,
    options: null,
    relation: null,
    morphRelations: null,
  } as FieldsListType);

  const taskObject: ObjectType = {
    applicationId: 'app-1',
    color: 'blue',
    description: '',
    fieldsList: [buildTitleField()],
    icon: 'IconCheckbox',
    id: 'source-object-1',
    isActive: true,
    isLabelSyncedWithName: false,
    isSystem: false,
    labelIdentifierFieldMetadataId: 'field-title',
    labelPlural: 'Tasks',
    labelSingular: 'Task',
    namePlural: 'tasks',
    nameSingular: 'task',
    openRecordIn: ObjectOpenRecordIn.SIDE_PANEL,
    universalIdentifier: 'universal-object-task',
  };

  it('migrates every record in a page and populates recordIdMap by zipping source/target ids in order', async () => {
    const { client: sourceClient } = createMockGraphqlClient({
      findManyTasks: {
        tasks: {
          edges: [
            { node: { id: 'source-task-1', title: 'Task A' } },
            { node: { id: 'source-task-2', title: 'Task B' } },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({
      createTasks: { createTasks: [{ id: 'target-task-1' }, { id: 'target-task-2' }] },
    });

    const recordIdMap = new Map<string, string>();
    await migrateRecordsForObject(sourceClient, targetClient, taskObject, recordIdMap);

    expect(recordIdMap.get('source-task-1')).toBe('target-task-1');
    expect(recordIdMap.get('source-task-2')).toBe('target-task-2');
    expect(targetCalls.filter((call) => call.operationName === 'createTasks')).toHaveLength(1);
  });

  it('does not call createTasks at all when the source object has no records', async () => {
    const { client: sourceClient } = createMockGraphqlClient({
      findManyTasks: {
        tasks: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
      },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({});

    await migrateRecordsForObject(sourceClient, targetClient, taskObject, new Map());

    expect(targetCalls).toHaveLength(0);
  });
});

describe('migrateRecordPageLayouts', () => {
  const buildWidget = (overrides: Partial<PageLayoutWidget> = {}): PageLayoutWidget => ({
    id: 'fields-widget',
    pageLayoutTabId: 'source-home-tab',
    title: 'Fields',
    type: 'FIELDS',
    objectMetadataId: null,
    gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    configuration: { configurationType: 'FIELDS' },
    isSystemSideEffect: true,
    ...overrides,
  });

  const buildSystemLayout = (overrides: Partial<PageLayout> = {}): PageLayout => ({
    id: 'source-system-layout',
    name: 'Default Person Layout',
    type: 'RECORD_PAGE',
    objectMetadataId: 'source-object-1',
    isSystemSideEffect: true,
    tabs: [
      {
        id: 'source-home-tab',
        title: 'Home',
        position: 0,
        layoutMode: 'GRID',
        isSystemSideEffect: true,
        widgets: [buildWidget()],
      },
    ],
    ...overrides,
  });

  const targetHomeTab = {
    id: 'target-home-tab',
    title: 'Home',
    position: 0,
    layoutMode: 'GRID',
    isSystemSideEffect: true,
    widgets: [buildWidget({ id: 'target-fields-widget', pageLayoutTabId: 'target-home-tab' })],
  };

  it("adds a custom widget onto the target's existing system tab, never touching the tree-replace endpoint", async () => {
    const sourceLayout = buildSystemLayout({
      tabs: [
        {
          id: 'source-home-tab',
          title: 'Home',
          position: 0,
          layoutMode: 'GRID',
          isSystemSideEffect: true,
          widgets: [
            buildWidget(),
            buildWidget({
              id: 'custom-widget-1',
              title: 'Notes iframe',
              type: 'IFRAME',
              configuration: { configurationType: 'IFRAME', url: 'https://example.com' },
              isSystemSideEffect: false,
            }),
          ],
        },
      ],
    });
    const targetLayout = buildSystemLayout({
      id: 'target-system-layout',
      objectMetadataId: 'target-object-1',
      tabs: [targetHomeTab],
    });

    const { client: sourceClient } = createMockGraphqlClient({
      findPageLayouts: { getPageLayouts: [sourceLayout] },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({
      findPageLayouts: { getPageLayouts: [targetLayout] },
      createPageLayoutWidget: { createPageLayoutWidget: { id: 'target-custom-widget-1' } },
    });
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);

    await migrateRecordPageLayouts(sourceClient, targetClient, targetObjectIdBySourceObjectId, new Map());

    expect(targetCalls.filter((call) => call.operationName === 'updatePageLayoutWithTabsAndWidgets')).toHaveLength(0);
    expect(targetCalls.filter((call) => call.operationName === 'createPageLayout')).toHaveLength(0);
    expect(targetCalls.filter((call) => call.operationName === 'createPageLayoutTab')).toHaveLength(0);
    const widgetCalls = targetCalls.filter((call) => call.operationName === 'createPageLayoutWidget');
    expect(widgetCalls).toHaveLength(1);
    expect(widgetCalls[0].variables.input).toMatchObject({ pageLayoutTabId: 'target-home-tab', title: 'Notes iframe', type: 'IFRAME' });
  });

  it('creates a brand new tab (and its widget) when a user added a whole extra tab to the default page', async () => {
    const sourceLayout = buildSystemLayout({
      tabs: [
        {
          id: 'source-home-tab',
          title: 'Home',
          position: 0,
          layoutMode: 'GRID',
          isSystemSideEffect: true,
          widgets: [buildWidget()],
        },
        {
          id: 'source-custom-tab',
          title: 'Extra',
          position: 1,
          layoutMode: 'GRID',
          isSystemSideEffect: false,
          widgets: [
            buildWidget({
              id: 'extra-widget',
              title: 'Extra widget',
              type: 'IFRAME',
              configuration: { configurationType: 'IFRAME', url: 'https://example.com' },
              isSystemSideEffect: false,
            }),
          ],
        },
      ],
    });
    const targetLayout = buildSystemLayout({
      id: 'target-system-layout',
      objectMetadataId: 'target-object-1',
      tabs: [targetHomeTab],
    });

    const { client: sourceClient } = createMockGraphqlClient({
      findPageLayouts: { getPageLayouts: [sourceLayout] },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({
      findPageLayouts: { getPageLayouts: [targetLayout] },
      createPageLayoutTab: { createPageLayoutTab: { id: 'target-extra-tab' } },
      createPageLayoutWidget: { createPageLayoutWidget: { id: 'target-extra-widget' } },
    });
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);

    await migrateRecordPageLayouts(sourceClient, targetClient, targetObjectIdBySourceObjectId, new Map());

    expect(targetCalls.filter((call) => call.operationName === 'updatePageLayoutWithTabsAndWidgets')).toHaveLength(0);
    const tabCalls = targetCalls.filter((call) => call.operationName === 'createPageLayoutTab');
    expect(tabCalls).toHaveLength(1);
    expect(tabCalls[0].variables.input).toMatchObject({ title: 'Extra', pageLayoutId: 'target-system-layout' });

    const widgetCalls = targetCalls.filter((call) => call.operationName === 'createPageLayoutWidget');
    expect(widgetCalls).toHaveLength(1);
    expect(widgetCalls[0].variables.input).toMatchObject({ pageLayoutTabId: 'target-extra-tab', title: 'Extra widget' });
  });

  it('does not duplicate a custom widget already present on the target system tab', async () => {
    const customWidget = buildWidget({
      id: 'custom-widget-1',
      title: 'Notes iframe',
      type: 'IFRAME',
      configuration: { configurationType: 'IFRAME', url: 'https://example.com' },
      isSystemSideEffect: false,
    });
    const sourceLayout = buildSystemLayout({
      tabs: [
        {
          id: 'source-home-tab',
          title: 'Home',
          position: 0,
          layoutMode: 'GRID',
          isSystemSideEffect: true,
          widgets: [buildWidget(), customWidget],
        },
      ],
    });
    const targetLayout = buildSystemLayout({
      id: 'target-system-layout',
      objectMetadataId: 'target-object-1',
      tabs: [
        {
          ...targetHomeTab,
          widgets: [
            ...targetHomeTab.widgets,
            { ...customWidget, id: 'target-custom-widget-1', pageLayoutTabId: 'target-home-tab' },
          ],
        },
      ],
    });

    const { client: sourceClient } = createMockGraphqlClient({
      findPageLayouts: { getPageLayouts: [sourceLayout] },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({
      findPageLayouts: { getPageLayouts: [targetLayout] },
    });
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);

    await migrateRecordPageLayouts(sourceClient, targetClient, targetObjectIdBySourceObjectId, new Map());

    expect(targetCalls.filter((call) => call.operationName === 'createPageLayoutWidget')).toHaveLength(0);
  });

  it('still creates a wholly separate custom layout from scratch', async () => {
    const customLayout: PageLayout = {
      id: 'source-custom-layout',
      name: 'Sales Overview',
      type: 'RECORD_PAGE',
      objectMetadataId: 'source-object-1',
      isSystemSideEffect: false,
      tabs: [
        { id: 'source-tab-1', title: 'Overview', position: 0, layoutMode: 'GRID', isSystemSideEffect: false, widgets: [] },
      ],
    };

    const { client: sourceClient } = createMockGraphqlClient({
      findPageLayouts: { getPageLayouts: [customLayout] },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({
      findPageLayouts: { getPageLayouts: [] },
      createPageLayout: { createPageLayout: { id: 'target-custom-layout' } },
      updatePageLayoutWithTabsAndWidgets: { updatePageLayoutWithTabsAndWidgets: { id: 'target-custom-layout' } },
    });
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);

    await migrateRecordPageLayouts(sourceClient, targetClient, targetObjectIdBySourceObjectId, new Map());

    const createLayoutCalls = targetCalls.filter((call) => call.operationName === 'createPageLayout');
    expect(createLayoutCalls).toHaveLength(1);
    expect(createLayoutCalls[0].variables.input).toMatchObject({ name: 'Sales Overview', objectMetadataId: 'target-object-1' });
  });
});
