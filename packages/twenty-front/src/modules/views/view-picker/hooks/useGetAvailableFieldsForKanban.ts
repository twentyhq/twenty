import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const useGetAvailableFieldsForKanban = () => {
  const viewObjectMetadataId = useRecoilComponentValueV2(
    viewObjectMetadataIdComponentState,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );
  const location = useLocation();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadata) => objectMetadata.id === viewObjectMetadataId,
  );

  const availableFieldsForKanban =
    objectMetadataItem?.fields.filter(
      (field) => field.type === FieldMetadataType.Select,
    ) ?? [];

  const navigate = useNavigate();

  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);

    if (isDefined(objectMetadataItem?.namePlural)) {
      navigate(
        `/settings/objects/${
          objectMetadataItem.namePlural
        }/new-field/configure?fieldType=${FieldMetadataType.Select}`,
      );
    } else {
      navigate(`/settings/objects`);
    }
  }, [
    setNavigationMemorizedUrl,
    location.pathname,
    location.search,
    objectMetadataItem,
    navigate,
  ]);

  return {
    availableFieldsForKanban,
    navigateToSelectSettings,
  };
};
