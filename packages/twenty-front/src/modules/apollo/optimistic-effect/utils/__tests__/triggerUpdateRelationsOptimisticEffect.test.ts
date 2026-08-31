import { triggerAttachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { getJunctionObjectMetadataIds } from '@/object-record/record-field/ui/utils/junction/getJunctionObjectMetadataIds';
import { type ApolloCache } from '@apollo/client';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeMorphRelationGqlFieldName } from 'twenty-shared/utils';

jest.mock(
  '@/apollo/optimistic-effect/utils/triggerAttachRelationOptimisticEffect',
  () => ({ triggerAttachRelationOptimisticEffect: jest.fn() }),
);
jest.mock(
  '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect',
  () => ({ triggerDetachRelationOptimisticEffect: jest.fn() }),
);
jest.mock(
  '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect',
  () => ({ triggerDestroyRecordsOptimisticEffect: jest.fn() }),
);
jest.mock(
  '@/object-record/record-field/ui/utils/junction/getJunctionObjectMetadataIds',
  () => ({ getJunctionObjectMetadataIds: jest.fn() }),
);

const sourceObject = {
  id: 'source-object-id',
  nameSingular: 'source',
  namePlural: 'sources',
};
const targetObject = {
  id: 'target-object-id',
  nameSingular: 'target',
  namePlural: 'targets',
};

const createFields = ({ isMorph = false }: { isMorph?: boolean } = {}) => {
  const sourceFieldName = isMorph ? 'linkedTarget' : 'target';
  const relation = {
    type: RelationType.MANY_TO_ONE,
    sourceFieldMetadata: {
      id: 'source-target-field-id',
      name: sourceFieldName,
    },
    targetFieldMetadata: {
      id: 'target-sources-field-id',
      name: 'sources',
    },
    sourceObjectMetadata: sourceObject,
    targetObjectMetadata: targetObject,
  } satisfies FieldMetadataItemRelation;

  const sourceField = {
    id: relation.sourceFieldMetadata.id,
    name: sourceFieldName,
    type: isMorph
      ? FieldMetadataType.MORPH_RELATION
      : FieldMetadataType.RELATION,
    ...(isMorph ? { morphRelations: [relation] } : { relation }),
  } as FieldMetadataItem;
  const targetField = {
    id: relation.targetFieldMetadata.id,
    name: relation.targetFieldMetadata.name,
    type: isMorph
      ? FieldMetadataType.MORPH_RELATION
      : FieldMetadataType.RELATION,
  } as FieldMetadataItem;
  const recordFieldName = isMorph
    ? computeMorphRelationGqlFieldName({
        fieldName: sourceFieldName,
        relationType: relation.type,
        targetObjectMetadataNameSingular: targetObject.nameSingular,
        targetObjectMetadataNamePlural: targetObject.namePlural,
      })
    : sourceFieldName;

  return { recordFieldName, sourceField, targetField };
};

const createSourceRecord = ({
  deletedAt,
  recordFieldName,
  targetRecordId,
}: {
  deletedAt: string | null;
  recordFieldName: string;
  targetRecordId: string;
}): RecordGqlNode => ({
  id: 'source-record-id',
  __typename: 'Source',
  deletedAt,
  [recordFieldName]: {
    id: targetRecordId,
    __typename: 'Target',
  },
});

const callOptimisticEffect = ({
  currentSourceRecord,
  sourceField,
  targetField,
  updatedSourceRecord,
}: {
  currentSourceRecord: RecordGqlNode;
  sourceField: FieldMetadataItem;
  targetField: FieldMetadataItem;
  updatedSourceRecord: RecordGqlNode;
}) => {
  const sourceObjectMetadataItem = {
    ...sourceObject,
    fields: [sourceField],
  } as EnrichedObjectMetadataItem;
  const targetObjectMetadataItem = {
    ...targetObject,
    fields: [targetField],
  } as EnrichedObjectMetadataItem;

  triggerUpdateRelationsOptimisticEffect({
    cache: {} as ApolloCache,
    sourceObjectMetadataItem,
    currentSourceRecord,
    updatedSourceRecord,
    objectMetadataItems: [sourceObjectMetadataItem, targetObjectMetadataItem],
    objectPermissionsByObjectMetadataId: {},
    upsertRecordsInStore: jest.fn(),
  });
};

describe('triggerUpdateRelationsOptimisticEffect restoration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getJunctionObjectMetadataIds).mockReturnValue(new Set());
  });

  it.each([
    ['relation', false],
    ['morph relation', true],
  ])('reattaches an unchanged %s', (_, isMorph) => {
    const { recordFieldName, sourceField, targetField } = createFields({
      isMorph,
    });
    const currentSourceRecord = createSourceRecord({
      deletedAt: '2026-08-31T12:00:00.000Z',
      recordFieldName,
      targetRecordId: 'target-record-id',
    });

    callOptimisticEffect({
      currentSourceRecord,
      updatedSourceRecord: {
        ...currentSourceRecord,
        deletedAt: null,
      },
      sourceField,
      targetField,
    });

    expect(triggerDetachRelationOptimisticEffect).not.toHaveBeenCalled();
    expect(triggerAttachRelationOptimisticEffect).toHaveBeenCalledTimes(1);
    expect(triggerAttachRelationOptimisticEffect).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceRecordId: 'source-record-id',
        targetRecordId: 'target-record-id',
        fieldNameOnTargetRecord: 'sources',
      }),
    );
  });

  it('does not touch an unchanged relation during a regular update', () => {
    const { recordFieldName, sourceField, targetField } = createFields();
    const currentSourceRecord = createSourceRecord({
      deletedAt: null,
      recordFieldName,
      targetRecordId: 'target-record-id',
    });

    callOptimisticEffect({
      currentSourceRecord,
      updatedSourceRecord: { ...currentSourceRecord },
      sourceField,
      targetField,
    });

    expect(triggerDetachRelationOptimisticEffect).not.toHaveBeenCalled();
    expect(triggerAttachRelationOptimisticEffect).not.toHaveBeenCalled();
  });

  it('preserves detach and attach for a changed relation during restoration', () => {
    const { recordFieldName, sourceField, targetField } = createFields();

    callOptimisticEffect({
      currentSourceRecord: createSourceRecord({
        deletedAt: '2026-08-31T12:00:00.000Z',
        recordFieldName,
        targetRecordId: 'previous-target-record-id',
      }),
      updatedSourceRecord: createSourceRecord({
        deletedAt: null,
        recordFieldName,
        targetRecordId: 'next-target-record-id',
      }),
      sourceField,
      targetField,
    });

    expect(triggerDetachRelationOptimisticEffect).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceRecordId: 'source-record-id',
        targetRecordId: 'previous-target-record-id',
      }),
    );
    expect(triggerAttachRelationOptimisticEffect).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceRecordId: 'source-record-id',
        targetRecordId: 'next-target-record-id',
      }),
    );
  });

  it('does not reattach an unchanged cascade-deleted relation', () => {
    jest
      .mocked(getJunctionObjectMetadataIds)
      .mockReturnValue(new Set([targetObject.id]));
    const { recordFieldName, sourceField, targetField } = createFields();
    const currentSourceRecord = createSourceRecord({
      deletedAt: '2026-08-31T12:00:00.000Z',
      recordFieldName,
      targetRecordId: 'target-record-id',
    });

    callOptimisticEffect({
      currentSourceRecord,
      updatedSourceRecord: {
        ...currentSourceRecord,
        deletedAt: null,
      },
      sourceField,
      targetField,
    });

    expect(triggerDestroyRecordsOptimisticEffect).not.toHaveBeenCalled();
    expect(triggerDetachRelationOptimisticEffect).not.toHaveBeenCalled();
    expect(triggerAttachRelationOptimisticEffect).not.toHaveBeenCalled();
  });
});
