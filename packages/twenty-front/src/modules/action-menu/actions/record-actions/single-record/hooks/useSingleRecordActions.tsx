import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useManageFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useManageFavoritesSingleRecordAction';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useSingleRecordActions = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const {
    registerManageFavoritesSingleRecordAction,
    unregisterManageFavoritesSingleRecordAction,
  } = useManageFavoritesSingleRecordAction({
    position: 0,
    objectMetadataItem,
  });

  const {
    registerDeleteSingleRecordAction,
    unregisterDeleteSingleRecordAction,
  } = useDeleteSingleRecordAction({
    position: 1,
    objectMetadataItem,
  });

  const registerSingleRecordActions = () => {
    registerManageFavoritesSingleRecordAction();
    registerDeleteSingleRecordAction();
  };

  const unregisterSingleRecordActions = () => {
    unregisterManageFavoritesSingleRecordAction();
    unregisterDeleteSingleRecordAction();
  };

  return {
    registerSingleRecordActions,
    unregisterSingleRecordActions,
  };
};
