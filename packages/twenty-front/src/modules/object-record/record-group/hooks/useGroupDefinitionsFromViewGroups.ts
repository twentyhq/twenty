import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { mapGroupDefinitionsFromViewGroups } from '@/object-record/record-group/utils/mapGroupDefinitionsFromViewGroups';

import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { View } from '@/views/types/View';
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

export const useGroupDefinitionsFromViewGroups = ({
  view,
  objectMetadataItem,
}: {
  view: View | undefined;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );
  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);
    navigate(`/settings/objects/${getObjectSlug(objectMetadataItem)}`);
  }, [
    navigate,
    objectMetadataItem,
    location.pathname,
    location.search,
    setNavigationMemorizedUrl,
  ]);

  return mapGroupDefinitionsFromViewGroups({
    viewGroups: view?.viewGroups ?? [],
    objectMetadataItem,
    navigateToSelectSettings,
  });
};
