import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const CreateNewIndexRecordNoSelectionRecordCommand = () => {
  const { objectMetadataItem, recordIndexId } = useHeadlessCommandContextApi();

  // Verify the object still exists in the metadata store before proceeding.
  // The context may hold a stale reference after a metadata refresh.
  const currentObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectMetadataItem?.nameSingular ?? '',
      objectNameType: 'singular',
    },
  );

  if (
    !isDefined(objectMetadataItem) ||
    !isDefined(recordIndexId) ||
    !isDefined(currentObjectMetadataItem)
  ) {
    return null;
  }

  return (
    <CreateNewIndexRecordInner
      objectMetadataItem={objectMetadataItem}
      recordIndexId={recordIndexId}
    />
  );
};

const CreateNewIndexRecordInner = ({
  objectMetadataItem,
  recordIndexId,
}: {
  objectMetadataItem: NonNullable<
    ReturnType<typeof useHeadlessCommandContextApi>['objectMetadataItem']
  >;
  recordIndexId: string;
}) => {
  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
    instanceId: recordIndexId,
  });

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => createNewIndexRecord({ position: 'first' })}
    />
  );
};
