import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useEffect } from 'react';
import { useSingleRecordActions } from '../hooks/useSingleRecordActions';

export const SingleRecordActionMenuEntrySetterEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { registerSingleRecordActions, unregisterSingleRecordActions } =
    useSingleRecordActions({
      objectMetadataItem,
    });

  useEffect(() => {
    registerSingleRecordActions();

    return () => {
      unregisterSingleRecordActions();
    };
  }, [registerSingleRecordActions, unregisterSingleRecordActions]);

  return null;
};
