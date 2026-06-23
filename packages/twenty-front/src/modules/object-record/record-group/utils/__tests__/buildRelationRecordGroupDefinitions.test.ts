import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import {
  buildRelationRecordGroupDefinitions,
  type RelationRecordGroupOrder,
} from '@/object-record/record-group/utils/buildRelationRecordGroupDefinitions';
import { isDefined } from 'twenty-shared/utils';

jest.mock('@/object-metadata/utils/getObjectRecordIdentifier', () => ({
  getObjectRecordIdentifier: jest.fn(),
}));

const getObjectRecordIdentifierMock = jest.mocked(getObjectRecordIdentifier);

const MAIN_GROUP_BY_FIELD_METADATA_ID = 'main-field-id';
const RELATION_FIELD_NAME = 'assignee';
const NO_VALUE_GROUP_ID = `${MAIN_GROUP_BY_FIELD_METADATA_ID}-no-value`;

type TestGroupByResultGroup = RecordGqlConnectionEdgesRequired & {
  groupByDimensionValues: (string | null)[];
};

const createGroup = (
  value: string | null,
  relationRecord?: Record<string, unknown>,
): TestGroupByResultGroup =>
  ({
    groupByDimensionValues: [value],
    edges: [
      {
        node: {
          id: `record-for-${value ?? 'no-value'}`,
          __typename: 'Task',
          ...(isDefined(relationRecord)
            ? { [RELATION_FIELD_NAME]: relationRecord }
            : {}),
        },
      },
    ],
  }) as unknown as TestGroupByResultGroup;

const buildDefinitions = ({
  groups,
  priorOrder = [],
  targetObjectMetadataItem,
}: {
  groups: TestGroupByResultGroup[];
  priorOrder?: RelationRecordGroupOrder[];
  targetObjectMetadataItem?: EnrichedObjectMetadataItem;
}) =>
  buildRelationRecordGroupDefinitions({
    groups,
    relationFieldName: RELATION_FIELD_NAME,
    mainGroupByFieldMetadataId: MAIN_GROUP_BY_FIELD_METADATA_ID,
    targetObjectMetadataItem,
    priorOrder,
  });

describe('buildRelationRecordGroupDefinitions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build one visible column per relation value with reindexed positions', () => {
    const definitions = buildDefinitions({
      groups: [createGroup('company-a'), createGroup('company-b')],
    });

    expect(definitions).toHaveLength(2);
    expect(definitions.map((definition) => definition.value)).toEqual([
      'company-a',
      'company-b',
    ]);
    expect(definitions.map((definition) => definition.position)).toEqual([
      0, 1,
    ]);
    expect(
      definitions.every((definition) => definition.isVisible === true),
    ).toBe(true);
    expect(
      definitions.every((definition) => definition.viewGroupId === undefined),
    ).toBe(true);
    expect(definitions[0].type).toBe(RecordGroupDefinitionType.Value);
    expect(definitions[0].id).toBe('company-a');
  });

  it('should append a "No value" group last by default', () => {
    const definitions = buildDefinitions({
      groups: [createGroup('company-a'), createGroup(null)],
    });

    const lastDefinition = definitions[definitions.length - 1];
    expect(lastDefinition.type).toBe(RecordGroupDefinitionType.NoValue);
    expect(lastDefinition.value).toBeNull();
    expect(lastDefinition.id).toBe(NO_VALUE_GROUP_ID);
  });

  it('should order columns by the persisted prior order and carry viewGroupId/isVisible', () => {
    const priorOrder: RelationRecordGroupOrder[] = [
      {
        value: 'company-b',
        position: 0,
        isVisible: true,
        viewGroupId: 'view-group-b',
      },
      {
        value: 'company-a',
        position: 1,
        isVisible: false,
        viewGroupId: 'view-group-a',
      },
    ];

    const definitions = buildDefinitions({
      groups: [createGroup('company-a'), createGroup('company-b')],
      priorOrder,
    });

    expect(definitions.map((definition) => definition.value)).toEqual([
      'company-b',
      'company-a',
    ]);
    expect(definitions[0].viewGroupId).toBe('view-group-b');
    expect(definitions[0].isVisible).toBe(true);
    expect(definitions[1].viewGroupId).toBe('view-group-a');
    expect(definitions[1].isVisible).toBe(false);
  });

  it('should append newly discovered values after persisted ones and before "No value"', () => {
    const priorOrder: RelationRecordGroupOrder[] = [
      {
        value: 'company-a',
        position: 0,
        isVisible: true,
        viewGroupId: 'view-group-a',
      },
    ];

    const definitions = buildDefinitions({
      groups: [
        createGroup('company-a'),
        createGroup('company-c'),
        createGroup('company-b'),
        createGroup(null),
      ],
      priorOrder,
    });

    expect(definitions.map((definition) => definition.value)).toEqual([
      'company-a',
      'company-b',
      'company-c',
      null,
    ]);
  });

  it('should honor the persisted position of the "No value" group', () => {
    const priorOrder: RelationRecordGroupOrder[] = [
      {
        value: null,
        position: 0,
        isVisible: true,
        viewGroupId: 'view-group-no-value',
      },
      {
        value: 'company-a',
        position: 1,
        isVisible: true,
        viewGroupId: 'view-group-a',
      },
    ];

    const definitions = buildDefinitions({
      groups: [createGroup('company-a'), createGroup(null)],
      priorOrder,
    });

    expect(definitions[0].type).toBe(RecordGroupDefinitionType.NoValue);
    expect(definitions[0].viewGroupId).toBe('view-group-no-value');
    expect(definitions[1].value).toBe('company-a');
  });

  it('should deduplicate repeated group values', () => {
    const definitions = buildDefinitions({
      groups: [createGroup('company-a'), createGroup('company-a')],
    });

    expect(definitions).toHaveLength(1);
    expect(definitions[0].value).toBe('company-a');
  });

  it('should resolve the column title from the related record identifier', () => {
    getObjectRecordIdentifierMock.mockReturnValue({
      name: 'Acme Inc.',
      avatarUrl: '',
      avatarType: 'rounded',
      id: 'company-a',
    });

    const relationRecord = {
      id: 'company-a',
      __typename: 'Company',
      name: 'Acme Inc.',
    };

    const definitions = buildDefinitions({
      groups: [createGroup('company-a', relationRecord)],
      targetObjectMetadataItem: {} as EnrichedObjectMetadataItem,
    });

    expect(definitions[0].title).toBe('Acme Inc.');
    expect(definitions[0].relationRecord).toMatchObject({ id: 'company-a' });
    expect(getObjectRecordIdentifierMock).toHaveBeenCalledTimes(1);
  });

  it('should fall back to the raw value as title when no target metadata is provided', () => {
    const definitions = buildDefinitions({
      groups: [createGroup('company-a', { id: 'company-a' })],
    });

    expect(definitions[0].title).toBe('company-a');
    expect(getObjectRecordIdentifierMock).not.toHaveBeenCalled();
  });
});
