import { describe, expect, it } from 'vitest';
import {
  migrateRecordsForObject,
  migrateSkills,
  migrateViews,
  migrateWebhooks,
} from 'src/logic-functions/entry-point';
import { FieldMetadataType } from 'src/logic-functions/types/field-metadata-type.enum';
import { FieldsListType, ObjectOpenRecordIn, ObjectType } from 'src/logic-functions/types/find-objects-fields.type';
import { View } from 'src/logic-functions/types/view-entities.type';
import { Skill } from 'src/logic-functions/types/skill.type';
import { Webhook } from 'src/logic-functions/types/webhook.type';
import { createMockGraphqlClient } from 'src/__tests__/utils/mock-graphql-client';

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

    await migrateWebhooks(client, [webhook], []);

    const createCalls = calls.filter((call) => call.operationName === 'createWebhook');
    expect(createCalls).toHaveLength(1);
    const input = createCalls[0].variables.input as Record<string, unknown>;
    expect(input).toMatchObject({ id: 'webhook-1', targetUrl: webhook.targetUrl, operations: webhook.operations });
    // Regression: forwarding the source secret would make both workspaces share one HMAC key.
    expect('secret' in input).toBe(false);
  });

  it('skips a webhook that already exists in the target (matched by reused id)', async () => {
    const { client, calls } = createMockGraphqlClient({});

    await migrateWebhooks(client, [webhook], [webhook]);

    expect(calls).toHaveLength(0);
  });
});

describe('migrateViews', () => {
  const view: View = {
    id: 'view-1',
    name: 'All People',
    objectMetadataId: 'source-object-1',
    type: 'TABLE',
    key: 'INDEX',
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
