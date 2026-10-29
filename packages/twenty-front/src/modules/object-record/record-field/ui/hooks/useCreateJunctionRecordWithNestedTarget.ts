import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { v4 } from 'uuid';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { type ValidJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidJunctionConfig';
import { upsertJunctionRecordInSourceRecordStore } from '@/object-record/record-field/ui/utils/junction/upsertJunctionRecordInSourceRecordStore';
import { useRecordCreationForm } from '@/object-record/record-form/hooks/useRecordCreationForm';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

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
  const [isCreatePending, setIsCreatePending] = useState(false);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { enqueueToast } = useToast();
  const { requestRecordCreation } = useRecordCreationForm();
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
        enqueueToast({
          status: 'error',
          children: t`The relation configuration could not be resolved.`,
        });
        return undefined;
      }

      const createRecord = async (draftRecord: Partial<ObjectRecord>) => {
        const targetRecordInput = {
          ...sanitizeRecordInput({
            objectMetadataItem: targetObjectMetadataItem,
            recordInput: draftRecord,
          }),
          id: v4(),
        };

        const createdJunctionRecord = await createJunctionRecord({
          id: v4(),
          [sourceJoinColumnName]: sourceRecordId,
          [targetFieldInfo.fieldName]: { create: targetRecordInput },
        });

        const targetRecord = {
          ...targetRecordInput,
          __typename: getObjectTypename(targetObjectMetadataItem.nameSingular),
          ...createdJunctionRecord[targetFieldInfo.fieldName],
        };

        upsertJunctionRecordInSourceRecordStore({
          store,
          sourceRecordId,
          sourceFieldName,
          junctionRecord: {
            ...createdJunctionRecord,
            [targetFieldInfo.fieldName]: targetRecord,
          },
        });

        return targetRecord;
      };

      setIsCreatePending(true);

      try {
        const targetRecord = await requestRecordCreation({
          objectMetadataItem: targetObjectMetadataItem,
          initialDraftRecord: {
            ...buildRecordInputFromRLSPredicates({
              objectMetadataItem: targetObjectMetadataItem,
            }),
            ...buildRecordLabelPayload({
              searchInput,
              objectMetadataItem: targetObjectMetadataItem,
            }),
          },
          createRecord,
        });

        if (!isDefined(targetRecord)) {
          return undefined;
        }

        return {
          recordId: targetRecord.id,
          objectMetadataId: targetObjectMetadataItem.id,
          isSelected: true,
          isMatchingSearchFilter: true,
        };
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
        return undefined;
      } finally {
        setIsCreatePending(false);
      }
    },
    [
      buildRecordInputFromRLSPredicates,
      createJunctionRecord,
      requestRecordCreation,
      enqueueToast,
      junctionConfig,
      objectMetadataItems,
      sourceObjectMetadataItem,
      sourceFieldName,
      sourceRecordId,
      store,
    ],
  );

  return { createJunctionRecordWithNestedTarget, isCreatePending };
};
