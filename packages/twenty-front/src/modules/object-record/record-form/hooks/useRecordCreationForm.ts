import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordCreationFormContext } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback, useContext } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useRecordCreationForm = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const recordCreationFormContext = useContext(RecordCreationFormContext);

  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );

  const { recordFormFieldMetadataItems } = useRecordFormFieldMetadataItems({
    objectMetadataItem,
  });

  const shouldOpenRecordCreationForm =
    isRecordCreationFormEnabled &&
    isDefined(recordCreationFormContext) &&
    isNonEmptyArray(recordFormFieldMetadataItems);

  const requestRecordCreationDraft = useCallback(
    (initialDraftRecord?: Partial<ObjectRecord>) =>
      isDefined(recordCreationFormContext)
        ? recordCreationFormContext.requestRecordCreationDraft({
            objectMetadataItem,
            initialDraftRecord,
          })
        : Promise.resolve<Partial<ObjectRecord> | null>(
            initialDraftRecord ?? {},
          ),
    [recordCreationFormContext, objectMetadataItem],
  );

  return { shouldOpenRecordCreationForm, requestRecordCreationDraft };
};
