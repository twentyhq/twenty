import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useEffect } from 'react';

export const CreateNewTableRecordNoSelectionRecordActionEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  useEffect(() => {
    createNewIndexRecord();
  }, [createNewIndexRecord]);

  return null;
};
