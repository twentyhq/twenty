import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { type ValidResolvedJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidResolvedJunctionConfig';
import { type RecordTableWidgetJunctionCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

type GetFieldWidgetJunctionCreateThroughArgs = {
  junctionConfig: ValidResolvedJunctionConfig;
  sourceObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular' | 'namePlural'
  >;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular'
  >[];
  recordId: string;
};

export const getFieldWidgetJunctionCreateThrough = ({
  junctionConfig,
  sourceObjectMetadataItem,
  objectMetadataItems,
  recordId,
}: GetFieldWidgetJunctionCreateThroughArgs):
  | RecordTableWidgetJunctionCreateThrough
  | undefined => {
  const { sourceField, junctionObjectMetadata } = junctionConfig;
  const [junctionTargetField] = junctionConfig.targetFields;
  const junctionTargetRelation = junctionTargetField?.relation;

  if (
    junctionConfig.isMorphRelation ||
    !isDefined(sourceField) ||
    !isDefined(junctionTargetRelation)
  ) {
    return undefined;
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === junctionTargetRelation.targetObjectMetadata.id,
  );

  const sourceJoinColumnName = getSourceJoinColumnName({
    sourceField,
    sourceObjectMetadata: sourceObjectMetadataItem,
  });

  if (
    !isDefined(targetObjectMetadataItem) ||
    !isDefined(sourceJoinColumnName)
  ) {
    return undefined;
  }

  return {
    junctionObjectMetadataId: junctionObjectMetadata.id,
    junctionObjectMetadataNameSingular: junctionObjectMetadata.nameSingular,
    sourceJoinColumnName,
    sourceRecordId: recordId,
    targetJoinColumnName: computeRelationGqlFieldJoinColumnName({
      name: junctionTargetField.name,
    }),
    targetObjectMetadataNameSingular: targetObjectMetadataItem.nameSingular,
    targetRecordsFilter: {
      not: {
        [junctionTargetRelation.targetFieldMetadata.name]: {
          [sourceJoinColumnName]: { eq: recordId },
        },
      },
    },
  };
};
