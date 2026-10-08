import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';

type CreateGlobalRecordCommandProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const CreateGlobalRecordCommand = ({
  objectMetadataItem,
}: CreateGlobalRecordCommandProps) => {
  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );

  const { createNewRecord } = useCreateNewRecord({ objectMetadataItem });

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={
        isRecordCreationFormEnabled
          ? () => void createNewRecord({ position: 'first' })
          : () => createNewRecord({ position: 'first' })
      }
    />
  );
};
