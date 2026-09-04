import { useCallback, useState } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { v4 } from 'uuid';

import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { upsertJunctionRecordInSourceRecordStore } from '@/object-record/record-field/ui/utils/junction/upsertJunctionRecordInSourceRecordStore';
import { type ValidJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidJunctionConfig';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared/utils';

type UseCreateJunctionRecordWithNestedTargetArgs = {
  sourceRecordId: string;
  sourceFieldName: string;
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  junctionConfig?: ValidJunctionConfig;
};

export const useCreateJunctionRecordWithNestedTarget = ({
  sourceRecordId,
  sourceFieldName,
  sourceObjectMetadataItem,
  junctionConfig,
}: UseCreateJunctionRecordWithNestedTargetArgs) => {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates();
  const { createOneRecord: createJunctionRecord } = useCreateOneRecord({
    objectNameSingular:
      junctionConfig?.junctionObjectMetadata.nameSingular ??
      sourceObjectMetadataItem.nameSingular,
  });

  const createJunctionRecordWithNestedTarget = useCallback(
    async ({
      searchInput,
      targetObjectMetadataItemId,
    }: {
      searchInput?: string;
      targetObjectMetadataItemId: string;
    }): Promise<RecordPickerPickableMorphItem | undefined> => {
      if (!isDefined(junctionConfig?.sourceField)) {
        return undefined;
      }

      const targetObjectMetadataItem = objectMetadataItems.find(
        ({ id }) => id === targetObjectMetadataItemId,
      );
      const targetFieldInfo = findTargetFieldInfo(
        junctionConfig.targetFields,
        targetObjectMetadataItemId,
        objectMetadataItems,
      );
      const sourceJoinColumnName = getSourceJoinColumnName({
        sourceField: junctionConfig.sourceField,
        sourceObjectMetadata: sourceObjectMetadataItem,
      });

      if (
        !isDefined(targetObjectMetadataItem) ||
        !isDefined(targetFieldInfo) ||
        !isDefined(sourceJoinColumnName)
      ) {
        enqueueErrorSnackBar({
          message: t`The relation configuration could not be resolved.`,
        });
        return undefined;
      }

      setLoading(true);

      try {
        const targetRecordId = v4();
        const targetRecordInput = {
          ...sanitizeRecordInput({
            objectMetadataItem: targetObjectMetadataItem,
            recordInput: {
              ...buildRecordInputFromRLSPredicates({
                objectMetadataItem: targetObjectMetadataItem,
              }),
              ...buildRecordLabelPayload({
                id: targetRecordId,
                searchInput,
                objectMetadataItem: targetObjectMetadataItem,
              }),
            },
          }),
          id: targetRecordId,
        };

        const createdJunctionRecord = await createJunctionRecord({
          id: v4(),
          [sourceJoinColumnName]: sourceRecordId,
          [targetFieldInfo.fieldName]: { create: targetRecordInput },
        });

        const createdTargetRecord = createdJunctionRecord[
          targetFieldInfo.fieldName
        ] as ObjectRecord | undefined;
        const targetRecord = {
          ...targetRecordInput,
          ...(createdTargetRecord ?? {}),
          __typename:
            createdTargetRecord?.__typename ??
            getObjectTypename(targetObjectMetadataItem.nameSingular),
        };
        const junctionRecordForStore = {
          ...createdJunctionRecord,
          [targetFieldInfo.fieldName]: targetRecord,
        };

        upsertJunctionRecordInSourceRecordStore({
          store,
          sourceRecordId,
          sourceFieldName,
          junctionRecord: junctionRecordForStore,
        });

        return {
          recordId: targetRecordId,
          objectMetadataId: targetObjectMetadataItem.id,
          isSelected: true,
          isMatchingSearchFilter: true,
        };
      } catch (error) {
        enqueueErrorSnackBar(
          CombinedGraphQLErrors.is(error)
            ? { apolloError: error }
            : error instanceof Error
              ? { message: error.message }
              : {},
        );
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [
      buildRecordInputFromRLSPredicates,
      createJunctionRecord,
      enqueueErrorSnackBar,
      junctionConfig,
      objectMetadataItems,
      sourceObjectMetadataItem,
      sourceFieldName,
      sourceRecordId,
      store,
    ],
  );

  return { createJunctionRecordWithNestedTarget, loading };
};
