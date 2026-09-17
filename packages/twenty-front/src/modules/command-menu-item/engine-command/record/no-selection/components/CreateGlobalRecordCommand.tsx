import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateNewRecord } from '@/object-record/hooks/useCreateNewRecord';

type CreateGlobalRecordCommandProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const CreateGlobalRecordCommand = ({
  objectMetadataItem,
}: CreateGlobalRecordCommandProps) => {
  const { createNewRecord } = useCreateNewRecord({ objectMetadataItem });

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => createNewRecord({ position: 'first' })}
    />
  );
};
