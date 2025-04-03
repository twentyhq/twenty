import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

export const CreateNewTableRecordNoSelectionRecordActionEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  useActionEffect(() => {
    createNewIndexRecord();
  }, [createNewIndexRecord]);

  return null;
};
