import { useEffect } from 'react';

import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { useGroupsFromQueryParams } from '@/views/hooks/internal/useGroupsFromQueryParams';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const QueryParamsGroupsEffect = () => {
  const { hasGroupsQueryParams, getGroupsFromQueryParams, objectMetadataItem } =
    useGroupsFromQueryParams();

  const { currentView } = useGetCurrentViewOnly();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem =
    currentView?.objectMetadataId !== objectMetadataItem.id;

  useEffect(() => {
    if (
      !hasGroupsQueryParams ||
      currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem ||
      !currentView?.id
    ) {
      return;
    }

    const groupsFromParams = getGroupsFromQueryParams();
    if (groupsFromParams.length > 0) {
      setRecordGroupsFromViewGroups(
        currentView.id,
        groupsFromParams,
        objectMetadataItem,
      );
    }
  }, [
    hasGroupsQueryParams,
    getGroupsFromQueryParams,
    currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem,
    currentView?.id,
    setRecordGroupsFromViewGroups,
    objectMetadataItem,
  ]);

  return <></>;
};
