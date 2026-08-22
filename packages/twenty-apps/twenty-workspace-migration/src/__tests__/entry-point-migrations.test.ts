import { describe, expect, it } from 'vitest';
import { migrateWebhooks } from 'src/logic-functions/migration/migrate-webhooks.util';
import { FieldMetadataType } from 'src/logic-functions/types/field-metadata-type.enum';
import { FieldsListType, ObjectOpenRecordIn, ObjectType } from 'src/logic-functions/types/find-objects-fields.type';
import { View } from 'src/logic-functions/types/view-entities.type';
import { Skill } from 'src/logic-functions/types/skill.type';
import { Webhook } from 'src/logic-functions/types/webhook.type';
import { createMockGraphqlClient } from 'src/__tests__/utils/mock-graphql-client';
import { buildTestRecordIds } from 'src/__tests__/utils/build-test-record-ids';
import { migrateSkills } from "src/logic-functions/migration/migrate-skills.util";
import { migrateViews } from "src/logic-functions/migration/migrate-views.util";
import { migrateRecordsForObject } from "src/logic-functions/migration/migrate-records-for-object.util";
import { migrateRecordPageLayouts } from "src/logic-functions/migration/migrate-page-record-layouts.util";
import { PageLayout, PageLayoutWidget } from "src/logic-functions/types/dashboard.type";
import { migrateRoles } from "src/logic-functions/migration/migrate-roles.util";
import { Role } from "src/logic-functions/types/role.type";
import { migrateDashboards } from "src/logic-functions/migration/migrate-dashboards.util";
import { migrateNavigationMenuItems } from "src/logic-functions/migration/migrate-navigation-menu-items.util";
import { NavigationMenuItem } from "src/logic-functions/types/navigation-menu-item.type";

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

  it('skips a standard skill even when the target workspace has no skill with that id', async () => {
    // Standard skills are provisioned per workspace, so their ids need not match across the
    // two - dedup by id alone would recreate them as duplicates.
    const sourceSkills = [buildSkill({ id: 'standard-only', name: 'standard-only', isCustom: false })];
    const { client, calls } = createMockGraphqlClient({});

    await migrateSkills(client, sourceSkills, []);

    expect(calls).toHaveLength(0);
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

    await migrateWebhooks(client, [webhook], []);

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

  it('batches multiple view fields, field groups and groups into one createMany call each instead of one request per row', async () => {
    const viewWithBatchableSubEntities: View = {
      ...view,
      viewFilters: [],
      viewFieldGroups: [
        { id: 'field-group-1', name: 'Group A', viewId: 'view-1', position: 0, isVisible: true },
        { id: 'field-group-2', name: 'Group B', viewId: 'view-1', position: 1, isVisible: true },
      ],
      viewFields: [
        { id: 'view-field-1', fieldMetadataId: 'source-field-1', isVisible: true, size: 100, position: 0, aggregateOperation: null, viewId: 'view-1', viewFieldGroupId: null },
        { id: 'view-field-2', fieldMetadataId: 'source-field-2', isVisible: true, size: 100, position: 1, aggregateOperation: null, viewId: 'view-1', viewFieldGroupId: null },
      ],
      viewGroups: [
        { id: 'view-group-1', isVisible: true, fieldValue: 'todo', position: 0, viewId: 'view-1' },
        { id: 'view-group-2', isVisible: true, fieldValue: 'done', position: 1, viewId: 'view-1' },
      ],
    };
    const { client, calls } = createMockGraphqlClient({
      createView: { createView: { id: 'view-1' } },
      createManyViewFieldGroups: { createManyViewFieldGroups: [{ id: 'field-group-1' }, { id: 'field-group-2' }] },
      createManyViewFields: { createManyViewFields: [{ id: 'view-field-1' }, { id: 'view-field-2' }] },
      createManyViewGroups: { createManyViewGroups: [{ id: 'view-group-1' }, { id: 'view-group-2' }] },
    });
    const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);
    const targetFieldIdBySourceFieldId = new Map([['source-field-1', 'target-field-1'], ['source-field-2', 'target-field-2']]);

    await migrateViews(client, [viewWithBatchableSubEntities], [], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    expect(calls.filter((call) => call.operationName === 'createViewFieldGroup')).toHaveLength(0);
    expect(calls.filter((call) => call.operationName === 'createViewField')).toHaveLength(0);
    expect(calls.filter((call) => call.operationName === 'createViewGroup')).toHaveLength(0);

    const fieldGroupCalls = calls.filter((call) => call.operationName === 'createManyViewFieldGroups');
    expect(fieldGroupCalls).toHaveLength(1);
    expect(fieldGroupCalls[0].variables.inputs).toHaveLength(2);

    const fieldCalls = calls.filter((call) => call.operationName === 'createManyViewFields');
    expect(fieldCalls).toHaveLength(1);
    expect(fieldCalls[0].variables.inputs).toMatchObject([
      { id: 'view-field-1', fieldMetadataId: 'target-field-1' },
      { id: 'view-field-2', fieldMetadataId: 'target-field-2' },
    ]);

    const groupCalls = calls.filter((call) => call.operationName === 'createManyViewGroups');
    expect(groupCalls).toHaveLength(1);
    expect(groupCalls[0].variables.inputs).toHaveLength(2);
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

  it('migrates every record in a page and records each source id as migrated', async () => {
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
      // The server echoes back the ids we send, because `id` is part of the create payload.
      createTasks: { createTasks: [{ id: 'source-task-1' }, { id: 'source-task-2' }] },
    });

    const recordIds = buildTestRecordIds();
    await migrateRecordsForObject(sourceClient, targetClient, taskObject, recordIds);

    expect(recordIds.migratedRecordIds.has('source-task-1')).toBe(true);
    expect(recordIds.migratedRecordIds.has('source-task-2')).toBe(true);
    expect(targetCalls.filter((call) => call.operationName === 'createTasks')).toHaveLength(1);
  });

  it('fails loudly if the target assigns a different id, since every later remap assumes identity', async () => {
    const { client: sourceClient } = createMockGraphqlClient({
      findManyTasks: {
        tasks: {
          edges: [{ node: { id: 'source-task-1', title: 'Task A' } }],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
    const { client: targetClient } = createMockGraphqlClient({
      createTasks: { createTasks: [{ id: 'server-generated-id' }] },
    });

    await expect(
      migrateRecordsForObject(sourceClient, targetClient, taskObject, buildTestRecordIds()),
    ).rejects.toThrow('created under a different id');
  });

  it('does not call createTasks at all when the source object has no records', async () => {
    const { client: sourceClient } = createMockGraphqlClient({
      findManyTasks: {
        tasks: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
      },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({});

    await migrateRecordsForObject(sourceClient, targetClient, taskObject, buildTestRecordIds());

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

    await migrateRecordPageLayouts(sourceClient, targetClient, targetObjectIdBySourceObjectId, new Map(), new Map());

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

    await migrateRecordPageLayouts(sourceClient, targetClient, targetObjectIdBySourceObjectId, new Map(), new Map());

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

    await migrateRecordPageLayouts(sourceClient, targetClient, targetObjectIdBySourceObjectId, new Map(), new Map());

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

    await migrateRecordPageLayouts(sourceClient, targetClient, targetObjectIdBySourceObjectId, new Map(), new Map());

    const createLayoutCalls = targetCalls.filter((call) => call.operationName === 'createPageLayout');
    expect(createLayoutCalls).toHaveLength(1);
    expect(createLayoutCalls[0].variables.input).toMatchObject({ name: 'Sales Overview', objectMetadataId: 'target-object-1' });
  });
});

describe('migrateRoles', () => {
  const buildRole = (overrides: Partial<Role> = {}): Role => ({
    id: 'source-role-1',
    label: 'Custom Role',
    description: null,
    icon: null,
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    canReadAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
    canBeAssignedToUsers: true,
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: false,
    permissionFlags: [],
    objectPermissions: [],
    fieldPermissions: [],
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
    ...overrides,
  });

  const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);
  const targetFieldIdBySourceFieldId = new Map([['source-field-1', 'target-field-1'], ['source-field-2', 'target-field-2']]);

  it('migrates predicates and groups, remapping fields and reusing source ids', async () => {
    const role = buildRole({
      rowLevelPermissionPredicateGroups: [
        { id: 'group-parent', parentRowLevelPermissionPredicateGroupId: null, logicalOperator: 'AND', positionInRowLevelPermissionPredicateGroup: 0, objectMetadataId: 'source-object-1' },
        { id: 'group-child', parentRowLevelPermissionPredicateGroupId: 'group-parent', logicalOperator: 'OR', positionInRowLevelPermissionPredicateGroup: 0, objectMetadataId: 'source-object-1' },
      ],
      rowLevelPermissionPredicates: [
        { id: 'predicate-1', fieldMetadataId: 'source-field-1', objectMetadataId: 'source-object-1', operand: 'IS', value: 'Acme', subFieldName: null, workspaceMemberFieldMetadataId: null, workspaceMemberSubFieldName: null, rowLevelPermissionPredicateGroupId: 'group-child', positionInRowLevelPermissionPredicateGroup: 0 },
      ],
    });
    const { client, calls } = createMockGraphqlClient({
      createOneRole: { createOneRole: { id: 'target-role-1' } },
      UpsertRowLevelPermissionPredicates: { upsertRowLevelPermissionPredicates: { predicates: [] } },
    });

    await migrateRoles(client, [role], [], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    const upsertCalls = calls.filter((call) => call.operationName === 'UpsertRowLevelPermissionPredicates');
    expect(upsertCalls).toHaveLength(1);
    const input = upsertCalls[0].variables.input as Record<string, unknown>;
    expect(input).toMatchObject({ roleId: 'target-role-1', objectMetadataId: 'target-object-1' });
    expect(input.predicateGroups).toEqual([
      { id: 'group-parent', objectMetadataId: 'target-object-1', parentRowLevelPermissionPredicateGroupId: null, logicalOperator: 'AND', positionInRowLevelPermissionPredicateGroup: 0 },
      { id: 'group-child', objectMetadataId: 'target-object-1', parentRowLevelPermissionPredicateGroupId: 'group-parent', logicalOperator: 'OR', positionInRowLevelPermissionPredicateGroup: 0 },
    ]);
    expect(input.predicates).toMatchObject([
      { id: 'predicate-1', fieldMetadataId: 'target-field-1', rowLevelPermissionPredicateGroupId: 'group-child' },
    ]);
  });

  it('drops a predicate referencing a group with an unresolved parent chain instead of sending a dangling reference', async () => {
    const role = buildRole({
      rowLevelPermissionPredicateGroups: [
        { id: 'orphan-group', parentRowLevelPermissionPredicateGroupId: 'missing-parent', logicalOperator: 'AND', positionInRowLevelPermissionPredicateGroup: 0, objectMetadataId: 'source-object-1' },
      ],
      rowLevelPermissionPredicates: [
        { id: 'predicate-1', fieldMetadataId: 'source-field-1', objectMetadataId: 'source-object-1', operand: 'IS', value: null, subFieldName: null, workspaceMemberFieldMetadataId: null, workspaceMemberSubFieldName: null, rowLevelPermissionPredicateGroupId: 'orphan-group', positionInRowLevelPermissionPredicateGroup: 0 },
      ],
    });
    const { client, calls } = createMockGraphqlClient({
      createOneRole: { createOneRole: { id: 'target-role-1' } },
      UpsertRowLevelPermissionPredicates: { upsertRowLevelPermissionPredicates: { predicates: [] } },
    });

    await migrateRoles(client, [role], [], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    const input = calls.find((call) => call.operationName === 'UpsertRowLevelPermissionPredicates')?.variables.input as Record<string, unknown>;
    expect(input.predicateGroups).toEqual([]);
    expect(input.predicates).toMatchObject([{ id: 'predicate-1', rowLevelPermissionPredicateGroupId: null }]);
  });

  it('skips a predicate whose field cannot be resolved in the target workspace, without dropping the rest', async () => {
    const role = buildRole({
      rowLevelPermissionPredicates: [
        { id: 'predicate-unresolvable', fieldMetadataId: 'unknown-field', objectMetadataId: 'source-object-1', operand: 'IS', value: null, subFieldName: null, workspaceMemberFieldMetadataId: null, workspaceMemberSubFieldName: null, rowLevelPermissionPredicateGroupId: null, positionInRowLevelPermissionPredicateGroup: 0 },
        { id: 'predicate-ok', fieldMetadataId: 'source-field-2', objectMetadataId: 'source-object-1', operand: 'IS', value: null, subFieldName: null, workspaceMemberFieldMetadataId: null, workspaceMemberSubFieldName: null, rowLevelPermissionPredicateGroupId: null, positionInRowLevelPermissionPredicateGroup: 1 },
      ],
    });
    const { client, calls } = createMockGraphqlClient({
      createOneRole: { createOneRole: { id: 'target-role-1' } },
      UpsertRowLevelPermissionPredicates: { upsertRowLevelPermissionPredicates: { predicates: [] } },
    });

    await migrateRoles(client, [role], [], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

    const input = calls.find((call) => call.operationName === 'UpsertRowLevelPermissionPredicates')?.variables.input as Record<string, unknown>;
    expect(input.predicates).toMatchObject([{ id: 'predicate-ok', fieldMetadataId: 'target-field-2' }]);
  });

  it('skips row-level permission predicates for a role without aborting the migration when the upsert fails (e.g. Enterprise feature disabled)', async () => {
    const role = buildRole({
      rowLevelPermissionPredicateGroups: [
        { id: 'group-1', parentRowLevelPermissionPredicateGroupId: null, logicalOperator: 'AND', positionInRowLevelPermissionPredicateGroup: 0, objectMetadataId: 'source-object-1' },
      ],
    });
    const client = {
      post: async (_path: string, body: { operationName: string }) => {
        if (body.operationName === 'UpsertRowLevelPermissionPredicates') {
          throw new Error('Row level permission predicate feature is disabled');
        }
        return { data: { data: { createOneRole: { id: 'target-role-1' } } } };
      },
    } as unknown as Parameters<typeof migrateRoles>[0];

    await expect(migrateRoles(client, [role], [], targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId)).resolves.not.toThrow();
  });
});

describe('migrateDashboards', () => {
  it("creates a new dashboard, mapping its id into recordIdMap and its page layout id into the page layout map", async () => {
    const { client: sourceClient } = createMockGraphqlClient({
      findManyDashboards: { dashboards: { edges: [{ node: { id: 'dash-1', title: 'My Dashboard', pageLayoutId: 'layout-1', position: 0 } }], pageInfo: { hasNextPage: false, endCursor: null } } },
      findPageLayouts: { getPageLayouts: [{ id: 'layout-1', name: 'Dashboard Layout', type: 'DASHBOARD', objectMetadataId: null, isSystemSideEffect: false, tabs: [] }] },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({
      findManyDashboards: { dashboards: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } } },
      createPageLayout: { createPageLayout: { id: 'target-layout-1' } },
      UpdatePageLayoutWithTabsAndWidgets: { updatePageLayoutWithTabsAndWidgets: { id: 'target-layout-1' } },
      createDashboards: { createDashboards: [{ id: 'dash-1' }] },
    });
    const recordIds = buildTestRecordIds();
    const targetPageLayoutIdBySourcePageLayoutId = new Map<string, string>();

    await migrateDashboards(sourceClient, targetClient, new Map(), new Map(), recordIds, targetPageLayoutIdBySourcePageLayoutId);

    expect(recordIds.migratedRecordIds.has('dash-1')).toBe(true);
    expect(targetPageLayoutIdBySourcePageLayoutId.get('layout-1')).toBe('target-layout-1');
    expect(targetCalls.filter((call) => call.operationName === 'createDashboards')).toHaveLength(1);
  });

  it("maps an already-migrated dashboard's id identically without re-creating it", async () => {
    const { client: sourceClient } = createMockGraphqlClient({
      findManyDashboards: { dashboards: { edges: [{ node: { id: 'dash-1', title: 'My Dashboard', pageLayoutId: 'layout-1', position: 0 } }], pageInfo: { hasNextPage: false, endCursor: null } } },
      findPageLayouts: { getPageLayouts: [{ id: 'layout-1', name: 'Dashboard Layout', type: 'DASHBOARD', objectMetadataId: null, isSystemSideEffect: false, tabs: [] }] },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({
      findManyDashboards: { dashboards: { edges: [{ node: { id: 'dash-1' } }], pageInfo: { hasNextPage: false, endCursor: null } } },
    });
    const recordIds = buildTestRecordIds();

    await migrateDashboards(sourceClient, targetClient, new Map(), new Map(), recordIds, new Map());

    expect(recordIds.migratedRecordIds.has('dash-1')).toBe(true);
    expect(targetCalls.filter((call) => call.operationName === 'createDashboards')).toHaveLength(0);
  });
});

describe('migrateNavigationMenuItems', () => {
  const buildItem = (overrides: Partial<NavigationMenuItem> = {}): NavigationMenuItem => ({
    id: 'nav-item-1',
    userWorkspaceId: null,
    targetRecordId: null,
    targetObjectMetadataId: null,
    viewId: null,
    type: 'PAGE',
    name: 'Dashboard link',
    link: null,
    icon: null,
    color: null,
    folderId: null,
    pageLayoutId: null,
    position: 0,
    ...overrides,
  });

  it('resolves pageLayoutId through the target page layout map instead of skipping it', async () => {
    const item = buildItem({ pageLayoutId: 'source-layout-1' });
    const { client, calls } = createMockGraphqlClient({
      createManyNavigationMenuItems: { createManyNavigationMenuItems: [{ id: 'nav-item-1' }] },
    });
    const targetPageLayoutIdBySourcePageLayoutId = new Map([['source-layout-1', 'target-layout-1']]);

    await migrateNavigationMenuItems(client, [item], [], new Map(), buildTestRecordIds(), targetPageLayoutIdBySourcePageLayoutId);

    const createCalls = calls.filter((call) => call.operationName === 'createManyNavigationMenuItems');
    expect(createCalls).toHaveLength(1);
    expect(createCalls[0].variables.inputs).toMatchObject([{ pageLayoutId: 'target-layout-1' }]);
  });

  it('skips a navigation menu item whose page layout was not migrated', async () => {
    const item = buildItem({ pageLayoutId: 'source-layout-missing' });
    const { client, calls } = createMockGraphqlClient({});

    await migrateNavigationMenuItems(client, [item], [], new Map(), buildTestRecordIds(), new Map());

    expect(calls).toHaveLength(0);
  });

  it('batches one create per folder-nesting level, parents before children', async () => {
    const items = [
      buildItem({ id: 'nested', name: 'Nested', folderId: 'folder' }),
      buildItem({ id: 'folder', name: 'Folder', type: 'FOLDER' }),
      buildItem({ id: 'top-level', name: 'Top level' }),
    ];
    const { client, calls } = createMockGraphqlClient({
      createManyNavigationMenuItems: { createManyNavigationMenuItems: [] },
    });

    await migrateNavigationMenuItems(client, items, [], new Map(), buildTestRecordIds(), new Map());

    const createCalls = calls.filter((call) => call.operationName === 'createManyNavigationMenuItems');
    expect(createCalls).toHaveLength(2);
    expect(createCalls[0].variables.inputs).toMatchObject([{ id: 'folder' }, { id: 'top-level' }]);
    expect(createCalls[1].variables.inputs).toMatchObject([{ id: 'nested' }]);
  });

  it('does not create items nested under a skipped folder', async () => {
    const items = [
      buildItem({ id: 'personal-folder', name: 'Personal', type: 'FOLDER', userWorkspaceId: 'user-workspace-1' }),
      buildItem({ id: 'under-personal', name: 'Under personal', folderId: 'personal-folder' }),
    ];
    const { client, calls } = createMockGraphqlClient({});

    await migrateNavigationMenuItems(client, items, [], new Map(), buildTestRecordIds(), new Map());

    expect(calls).toHaveLength(0);
  });
});
