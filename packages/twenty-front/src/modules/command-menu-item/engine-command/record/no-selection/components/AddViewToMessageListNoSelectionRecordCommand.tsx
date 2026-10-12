import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useOpenAddToMessageListInSidePanel } from '@/side-panel/hooks/useOpenAddToMessageListInSidePanel';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

const AddViewToMessageListContent = ({
  objectNameSingular,
  recordIndexId,
}: {
  objectNameSingular: string;
  recordIndexId: string;
}) => {
  const { filter } = useFindManyRecordIndexTableParams(
    objectNameSingular,
    recordIndexId,
  );

  const { openAddToMessageListInSidePanel } =
    useOpenAddToMessageListInSidePanel();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => openAddToMessageListInSidePanel(filter ?? {})}
    />
  );
};

export const AddViewToMessageListNoSelectionRecordCommand = () => {
  const { objectMetadataItem, recordIndexId } = useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem) || !isDefined(recordIndexId)) {
    throw new Error(
      'Object metadata item and record index ID are required to add a view to a list',
    );
  }

  return (
    <ViewComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      <AddViewToMessageListContent
        objectNameSingular={objectMetadataItem.nameSingular}
        recordIndexId={recordIndexId}
      />
    </ViewComponentInstanceContext.Provider>
  );
};
