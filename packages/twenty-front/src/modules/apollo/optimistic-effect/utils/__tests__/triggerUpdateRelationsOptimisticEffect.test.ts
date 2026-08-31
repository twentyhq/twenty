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

const createRelation = ({
  sourceFieldId,
  sourceFieldName,
  targetFieldId,
  targetFieldName,
}: {
  sourceFieldId: string;
  sourceFieldName: string;
  targetFieldId: string;
  targetFieldName: string;
}): FieldMetadataItemRelation => ({
  type: RelationType.MANY_TO_ONE,
  sourceFieldMetadata: { id: sourceFieldId, name: sourceFieldName },
  targetFieldMetadata: { id: targetFieldId, name: targetFieldName },
  sourceObjectMetadata: sourceObject,
  targetObjectMetadata: targetObject,
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

  it('reattaches an unchanged relation when a soft-deleted record is restored', () => {
    const relation = createRelation({
      sourceFieldId: 'source-target-field-id',
      sourceFieldName: 'target',
      targetFieldId: 'target-sources-field-id',
      targetFieldName: 'sources',
    });
    const sourceField = {
      id: 'source-target-field-id',
      name: 'target',
      type: FieldMetadataType.RELATION,
      relation,
    } as FieldMetadataItem;
    const targetField = {
      id: 'target-sources-field-id',
      name: 'sources',
      type: FieldMetadataType.RELATION,
    } as FieldMetadataItem;
    const relatedRecord = {
      id: 'target-record-id',
      __typename: 'Target',
    };

    callOptimisticEffect({
      currentSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: '2026-08-31T12:00:00.000Z',
        target: relatedRecord,
      },
      updatedSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: null,
        target: relatedRecord,
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
    const relation = createRelation({
      sourceFieldId: 'source-target-field-id',
      sourceFieldName: 'target',
      targetFieldId: 'target-sources-field-id',
      targetFieldName: 'sources',
    });
    const sourceField = {
      id: 'source-target-field-id',
      name: 'target',
      type: FieldMetadataType.RELATION,
      relation,
    } as FieldMetadataItem;
    const targetField = {
      id: 'target-sources-field-id',
      name: 'sources',
      type: FieldMetadataType.RELATION,
    } as FieldMetadataItem;
    const relatedRecord = {
      id: 'target-record-id',
      __typename: 'Target',
    };

    callOptimisticEffect({
      currentSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: null,
        target: relatedRecord,
      },
      updatedSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: null,
        target: relatedRecord,
      },
      sourceField,
      targetField,
    });

    expect(triggerDetachRelationOptimisticEffect).not.toHaveBeenCalled();
    expect(triggerAttachRelationOptimisticEffect).not.toHaveBeenCalled();
  });

  it('preserves detach and attach behavior for a changed relation during restoration', () => {
    const relation = createRelation({
      sourceFieldId: 'source-target-field-id',
      sourceFieldName: 'target',
      targetFieldId: 'target-sources-field-id',
      targetFieldName: 'sources',
    });
    const sourceField = {
      id: 'source-target-field-id',
      name: 'target',
      type: FieldMetadataType.RELATION,
      relation,
    } as FieldMetadataItem;
    const targetField = {
      id: 'target-sources-field-id',
      name: 'sources',
      type: FieldMetadataType.RELATION,
    } as FieldMetadataItem;

    callOptimisticEffect({
      currentSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: '2026-08-31T12:00:00.000Z',
        target: {
          id: 'previous-target-record-id',
          __typename: 'Target',
        },
      },
      updatedSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: null,
        target: {
          id: 'next-target-record-id',
          __typename: 'Target',
        },
      },
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

  it('does not reattach an unchanged cascade-deleted relation during restoration', () => {
    jest
      .mocked(getJunctionObjectMetadataIds)
      .mockReturnValue(new Set([targetObject.id]));
    const relation = createRelation({
      sourceFieldId: 'source-target-field-id',
      sourceFieldName: 'target',
      targetFieldId: 'target-sources-field-id',
      targetFieldName: 'sources',
    });
    const sourceField = {
      id: 'source-target-field-id',
      name: 'target',
      type: FieldMetadataType.RELATION,
      relation,
    } as FieldMetadataItem;
    const targetField = {
      id: 'target-sources-field-id',
      name: 'sources',
      type: FieldMetadataType.RELATION,
    } as FieldMetadataItem;
    const relatedRecord = {
      id: 'target-record-id',
      __typename: 'Target',
    };

    callOptimisticEffect({
      currentSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: '2026-08-31T12:00:00.000Z',
        target: relatedRecord,
      },
      updatedSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: null,
        target: relatedRecord,
      },
      sourceField,
      targetField,
    });

    expect(triggerDestroyRecordsOptimisticEffect).not.toHaveBeenCalled();
    expect(triggerDetachRelationOptimisticEffect).not.toHaveBeenCalled();
    expect(triggerAttachRelationOptimisticEffect).not.toHaveBeenCalled();
  });

  it('reattaches an unchanged morph relation when a record is restored', () => {
    const relation = createRelation({
      sourceFieldId: 'source-morph-field-id',
      sourceFieldName: 'linkedTarget',
      targetFieldId: 'target-sources-field-id',
      targetFieldName: 'sources',
    });
    const sourceField = {
      id: 'source-morph-field-id',
      name: 'linkedTarget',
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [relation],
    } as FieldMetadataItem;
    const targetField = {
      id: 'target-sources-field-id',
      name: 'sources',
      type: FieldMetadataType.MORPH_RELATION,
    } as FieldMetadataItem;
    const morphFieldName = computeMorphRelationGqlFieldName({
      fieldName: sourceField.name,
      relationType: relation.type,
      targetObjectMetadataNameSingular: targetObject.nameSingular,
      targetObjectMetadataNamePlural: targetObject.namePlural,
    });
    const relatedRecord = {
      id: 'target-record-id',
      __typename: 'Target',
    };

    callOptimisticEffect({
      currentSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: '2026-08-31T12:00:00.000Z',
        [morphFieldName]: relatedRecord,
      },
      updatedSourceRecord: {
        id: 'source-record-id',
        __typename: 'Source',
        deletedAt: null,
        [morphFieldName]: relatedRecord,
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
});
