import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type UseBulkCreateTagJunctionRecordsArgs = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const useBulkCreateTagJunctionRecords = ({
  objectMetadataItem,
}: UseBulkCreateTagJunctionRecordsArgs) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const junctionField = objectMetadataItem.fields.find((field) =>
    isJunctionRelationField(field),
  );

  const junctionConfig = isDefined(junctionField)
    ? getJunctionConfig({
        settings: junctionField.settings,
        relationObjectMetadataId:
          junctionField.relation?.targetObjectMetadata.id ?? '',
        sourceObjectMetadataId: objectMetadataItem.id,
        objectMetadataItems,
      })
    : null;

  const junctionObjectMetadata = junctionConfig?.junctionObjectMetadata;
  const sourceField = junctionConfig?.sourceField;
  const targetField = junctionConfig?.targetFields?.[0];

  const sourceJoinColumnName = isDefined(sourceField)
    ? getSourceJoinColumnName({
        sourceField,
        sourceObjectMetadata: objectMetadataItem,
      })
    : undefined;

  const targetJoinColumnName = isDefined(targetField)
    ? getJoinColumnName(targetField.settings)
    : undefined;

  const isConfigValid =
    isDefined(junctionObjectMetadata) &&
    isDefined(sourceJoinColumnName) &&
    isDefined(targetJoinColumnName);

  const junctionObjectNameSingular =
    junctionObjectMetadata?.nameSingular ?? '__invalid__';

  const tagObjectNameSingular = isDefined(targetField)
    ? (targetField.relation?.targetObjectMetadata.nameSingular ?? undefined)
    : undefined;

  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular: junctionObjectNameSingular,
    skipPostOptimisticEffect: true,
  });

  const bulkCreateTagJunctionRecords = useCallback(
    async ({
      selectedRecordIds,
      selectedTagIds,
    }: {
      selectedRecordIds: string[];
      selectedTagIds: string[];
    }) => {
      if (
        !isConfigValid ||
        selectedRecordIds.length === 0 ||
        selectedTagIds.length === 0
      ) {
        return;
      }

      const recordsToCreate = selectedRecordIds.flatMap((recordId) =>
        selectedTagIds.map((tagId) => ({
          id: v4(),
          [sourceJoinColumnName]: recordId,
          [targetJoinColumnName]: tagId,
        })),
      );

      await createManyRecords({
        recordsToCreate,
        upsert: true,
      });
    },
    [
      isConfigValid,
      sourceJoinColumnName,
      targetJoinColumnName,
      createManyRecords,
    ],
  );

  return {
    bulkCreateTagJunctionRecords,
    tagObjectNameSingular,
    isConfigValid,
    junctionFieldName: junctionField?.name,
    junctionObjectNameSingular,
    sourceJoinColumnName,
    targetJoinColumnName,
    targetFieldName: targetField?.name,
  };
};
