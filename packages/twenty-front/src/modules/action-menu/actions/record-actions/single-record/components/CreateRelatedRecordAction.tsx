import { Action } from '@/action-menu/actions/components/Action';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

type CreateRelatedRecordActionProps = {
  recordType: CoreObjectNameSingular;
};

export const CreateRelatedRecordAction = ({
  recordType,
}: CreateRelatedRecordActionProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: recordType,
  });

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  return (
    <Action
      onClick={createNewIndexRecord}
      closeSidePanelOnCommandMenuListActionExecution={false}
    />
  );
};
