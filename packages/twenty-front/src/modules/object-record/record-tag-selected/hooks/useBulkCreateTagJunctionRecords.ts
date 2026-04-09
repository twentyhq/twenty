import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
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

  const junctionObjectNamePlural =
    junctionObjectMetadata?.namePlural ?? '__invalid__';

  const tagObjectNameSingular = isDefined(targetField)
    ? (targetField.relation?.targetObjectMetadata.nameSingular ?? undefined)
    : undefined;

  // Query document for checking existing junction rows — only fetches the two
  // join columns needed for deduplication.
  const junctionRecordGqlFields =
    isDefined(sourceJoinColumnName) && isDefined(targetJoinColumnName)
      ? { id: true, [sourceJoinColumnName]: true, [targetJoinColumnName]: true }
      : { id: true };

  const { findManyRecordsQuery: findManyJunctionRecordsQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: junctionObjectNameSingular,
      recordGqlFields: junctionRecordGqlFields,
    });

  const apolloCoreClient = useApolloCoreClient();

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

      // Query the backend for existing junction rows covering the exact
      // (recordId × tagId) cross-product we're about to insert. This is
      // reliable regardless of whether junction data is in the local store.
      const existingResult =
        await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
          query: findManyJunctionRecordsQuery,
          variables: {
            filter: {
              and: [
                { [sourceJoinColumnName]: { in: selectedRecordIds } },
                { [targetJoinColumnName]: { in: selectedTagIds } },
              ],
            },
            limit: selectedRecordIds.length * selectedTagIds.length + 1,
          },
          fetchPolicy: 'network-only',
        });

      // Build a Set of "sourceId:tagId" strings for O(1) lookup.
      const existingPairs = new Set(
        (existingResult.data?.[junctionObjectNamePlural]?.edges ?? []).map(
          (edge: { node: Record<string, string> }) =>
            `${edge.node[sourceJoinColumnName]}:${edge.node[targetJoinColumnName]}`,
        ),
      );

      const recordsToCreate = selectedRecordIds.flatMap((recordId) =>
        selectedTagIds
          .filter(
            (tagId) => !existingPairs.has(`${recordId}:${tagId}`),
          )
          .map((tagId) => ({
            id: v4(),
            [sourceJoinColumnName]: recordId,
            [targetJoinColumnName]: tagId,
          })),
      );

      if (recordsToCreate.length === 0) {
        return;
      }

      await createManyRecords({
        recordsToCreate,
        upsert: true,
      });
    },
    [
      isConfigValid,
      sourceJoinColumnName,
      targetJoinColumnName,
      junctionObjectNamePlural,
      findManyJunctionRecordsQuery,
      apolloCoreClient,
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
