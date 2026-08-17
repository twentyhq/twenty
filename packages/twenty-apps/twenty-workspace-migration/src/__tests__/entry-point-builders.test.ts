import { describe, expect, it } from 'vitest';
import {
  buildFieldToCreate,
  buildPageLayoutTabsInput,
  buildRecordDataToCreate,
  remapWidgetConfiguration,
} from 'src/logic-functions/entry-point';
import { FieldMetadataType } from 'src/logic-functions/types/field-metadata-type.enum';
import { FieldsListType, RelationType } from 'src/logic-functions/types/find-objects-fields.type';
import { PageLayoutTab } from 'src/logic-functions/types/dashboard.type';

const baseField = {
  applicationId: 'app-1',
  description: '',
  icon: 'IconText',
  id: 'field-1',
  isActive: true,
  isLabelSyncedWithName: false,
  isNullable: true,
  isSystem: false,
  isUIEditable: true,
  isUIReadOnly: false,
  isUnique: false,
  label: 'Name',
  morphId: null,
  name: 'name',
  objectMetadataId: 'source-object-1',
  universalIdentifier: 'universal-field-1',
};

const buildTextField = (overrides: Partial<FieldsListType> = {}): FieldsListType => ({
  ...baseField,
  type: FieldMetadataType.TEXT,
  defaultValue: null,
  settings: null,
  options: null,
  relation: null,
  morphRelations: null,
  ...overrides,
} as FieldsListType);

const buildRelationField = (overrides: Partial<FieldsListType> = {}): FieldsListType => ({
  ...baseField,
  id: 'field-relation-1',
  name: 'company',
  type: FieldMetadataType.RELATION,
  defaultValue: null,
  settings: { relationType: RelationType.MANY_TO_ONE },
  options: null,
  relation: {
    type: RelationType.MANY_TO_ONE,
    targetObjectMetadata: { nameSingular: 'company' },
    targetFieldMetadata: { icon: 'IconBuilding', label: 'People' },
  },
  morphRelations: null,
  ...overrides,
} as FieldsListType);

const buildMorphRelationField = (overrides: Partial<FieldsListType> = {}): FieldsListType => ({
  ...baseField,
  id: 'field-morph-1',
  name: 'target',
  type: FieldMetadataType.MORPH_RELATION,
  defaultValue: null,
  settings: { relationType: RelationType.MANY_TO_ONE },
  options: null,
  relation: null,
  morphRelations: [
    { type: RelationType.MANY_TO_ONE, targetObjectMetadata: { nameSingular: 'company' }, targetFieldMetadata: { icon: 'IconBuilding', label: 'Notes' } },
    { type: RelationType.MANY_TO_ONE, targetObjectMetadata: { nameSingular: 'person' }, targetFieldMetadata: { icon: 'IconUser', label: 'Notes' } },
  ],
  ...overrides,
} as FieldsListType);

const targetObjects = [
  { nameSingular: 'company', id: 'target-company-id', universalIdentifier: 'u-company' },
  { nameSingular: 'person', id: 'target-person-id', universalIdentifier: 'u-person' },
];

describe('buildFieldToCreate', () => {
  it('builds a plain field with no relation payload', () => {
    const result = buildFieldToCreate(buildTextField(), 'target-object-1', targetObjects);
    expect(result).toMatchObject({ objectMetadataId: 'target-object-1', type: FieldMetadataType.TEXT, name: 'name' });
    expect(result).not.toHaveProperty('relationCreationPayload');
  });

  it('builds a RELATION field with the target resolved to the target workspace object id', () => {
    const result = buildFieldToCreate(buildRelationField(), 'target-object-1', targetObjects);
    expect(result?.relationCreationPayload).toEqual({
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'target-company-id',
      targetFieldLabel: 'People',
      targetFieldIcon: 'IconBuilding',
    });
  });

  it('returns undefined (not a crash) when a RELATION field targets an object not yet in the target workspace', () => {
    // Regression test: this used to `return;` from a function typed to always return a value,
    // which downstream code pushed into an array unchecked and later crashed on.
    const result = buildFieldToCreate(buildRelationField(), 'target-object-1', []);
    expect(result).toBeUndefined();
  });

  it('builds a MORPH_RELATION field with one payload entry per target', () => {
    const result = buildFieldToCreate(buildMorphRelationField(), 'target-object-1', targetObjects);
    expect(result?.morphRelationsCreationPayload).toEqual([
      { type: RelationType.MANY_TO_ONE, targetObjectMetadataId: 'target-company-id', targetFieldLabel: 'Notes', targetFieldIcon: 'IconBuilding' },
      { type: RelationType.MANY_TO_ONE, targetObjectMetadataId: 'target-person-id', targetFieldLabel: 'Notes', targetFieldIcon: 'IconUser' },
    ]);
  });

  it('abandons the whole MORPH_RELATION field if any one target is unresolvable', () => {
    const result = buildFieldToCreate(buildMorphRelationField(), 'target-object-1', [targetObjects[0]]);
    expect(result).toBeUndefined();
  });
});

describe('buildRecordDataToCreate', () => {
  const dataKeys = ['title', 'companyId'];
  const relationForeignKeyNames = ['companyId'];

  it('passes non-relation fields through unchanged', () => {
    const result = buildRecordDataToCreate({ title: 'Deal', companyId: null }, dataKeys, relationForeignKeyNames, new Map());
    expect(result.title).toBe('Deal');
  });

  it('remaps a relation foreign key using the record id map', () => {
    const recordIdMap = new Map([['source-company-1', 'target-company-1']]);
    const result = buildRecordDataToCreate({ title: 'Deal', companyId: 'source-company-1' }, dataKeys, relationForeignKeyNames, recordIdMap);
    expect(result.companyId).toBe('target-company-1');
  });

  it('passes through a null relation value as null', () => {
    const result = buildRecordDataToCreate({ title: 'Deal', companyId: null }, dataKeys, relationForeignKeyNames, new Map());
    expect(result.companyId).toBeNull();
  });

  it('drops a relation key entirely when the referenced record was not migrated', () => {
    const result = buildRecordDataToCreate({ title: 'Deal', companyId: 'source-company-unmigrated' }, dataKeys, relationForeignKeyNames, new Map());
    expect('companyId' in result).toBe(false);
    expect(result.title).toBe('Deal');
  });
});

describe('remapWidgetConfiguration', () => {
  it('remaps a known field-reference key to the target field id', () => {
    const fieldMap = new Map([['source-field-1', 'target-field-1']]);
    const result = remapWidgetConfiguration({ configurationType: 'AGGREGATE_CHART', aggregateFieldMetadataId: 'source-field-1' }, fieldMap);
    expect(result.aggregateFieldMetadataId).toBe('target-field-1');
  });

  it('nulls out a field reference that cannot be resolved in the target workspace', () => {
    const result = remapWidgetConfiguration({ configurationType: 'AGGREGATE_CHART', aggregateFieldMetadataId: 'unknown-field' }, new Map());
    expect(result.aggregateFieldMetadataId).toBeNull();
  });

  it('leaves non field-reference keys untouched', () => {
    const result = remapWidgetConfiguration({ configurationType: 'IFRAME', url: 'https://example.com' }, new Map());
    expect(result.url).toBe('https://example.com');
  });

  it('leaves viewId untouched (views keep their source id across workspaces by design)', () => {
    const result = remapWidgetConfiguration({ configurationType: 'RECORD_TABLE', viewId: 'view-1' }, new Map());
    expect(result.viewId).toBe('view-1');
  });
});

describe('buildPageLayoutTabsInput', () => {
  const targetObjectIdBySourceObjectId = new Map([['source-object-1', 'target-object-1']]);
  const targetFieldIdBySourceFieldId = new Map([['source-field-1', 'target-field-1']]);

  const sourceTabs: PageLayoutTab[] = [
    {
      id: 'source-tab-1',
      title: 'Overview',
      position: 0,
      layoutMode: 'GRID',
      widgets: [
        {
          id: 'source-widget-1',
          pageLayoutTabId: 'source-tab-1',
          title: 'Revenue',
          type: 'AGGREGATE_CHART',
          objectMetadataId: 'source-object-1',
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
          configuration: { configurationType: 'AGGREGATE_CHART', aggregateFieldMetadataId: 'source-field-1' },
        },
        {
          id: 'source-widget-2',
          pageLayoutTabId: 'source-tab-1',
          title: 'Unsupported saved view',
          type: 'VIEW',
          objectMetadataId: null,
          gridPosition: { row: 0, column: 2, rowSpan: 1, columnSpan: 1 },
          configuration: { configurationType: 'VIEW' },
        },
      ],
    },
  ];

  it('mints a fresh id for the tab and widget rather than reusing the source ids', () => {
    const [tab] = buildPageLayoutTabsInput(sourceTabs, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, 'test context');
    expect(tab.id).not.toBe('source-tab-1');
    expect(typeof tab.id).toBe('string');
  });

  it('drops VIEW-type widgets (still rejected by the API even through the bulk mutation)', () => {
    const [tab] = buildPageLayoutTabsInput(sourceTabs, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, 'test context');
    const widgets = tab.widgets as Record<string, unknown>[];
    expect(widgets).toHaveLength(1);
    expect(widgets[0].title).toBe('Revenue');
  });

  it('remaps the widget objectMetadataId and links it to the freshly minted tab id', () => {
    const [tab] = buildPageLayoutTabsInput(sourceTabs, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, 'test context');
    const widgets = tab.widgets as Record<string, unknown>[];
    expect(widgets[0].objectMetadataId).toBe('target-object-1');
    expect(widgets[0].pageLayoutTabId).toBe(tab.id);
  });

  it('remaps field references inside the widget configuration', () => {
    const [tab] = buildPageLayoutTabsInput(sourceTabs, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, 'test context');
    const widgets = tab.widgets as { configuration: Record<string, unknown> }[];
    expect(widgets[0].configuration.aggregateFieldMetadataId).toBe('target-field-1');
  });

  it('drops a widget whose object cannot be resolved in the target workspace', () => {
    const [tab] = buildPageLayoutTabsInput(sourceTabs, new Map(), targetFieldIdBySourceFieldId, 'test context');
    expect(tab.widgets).toHaveLength(0);
  });
});
