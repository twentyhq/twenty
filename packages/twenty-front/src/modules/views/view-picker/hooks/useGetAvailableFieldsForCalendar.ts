import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { FieldMetadataType, SettingsPath } from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useGetAvailableFieldsForCalendar = () => {
  const viewObjectMetadataId = useRecoilComponentValueV2(
    viewObjectMetadataIdComponentState,
  );
  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);
  const setNavigationMemorizedUrl = useSetRecoilStateV2(
    navigationMemorizedUrlState,
  );
  const location = useLocation();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadata) => objectMetadata.id === viewObjectMetadataId,
  );

  const availableFieldsForCalendar =
    objectMetadataItem?.readableFields.filter((field) =>
      isFieldMetadataDateKind(field.type),
    ) ?? [];

  const navigate = useNavigateSettings();

  const navigateToDateFieldSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);

    if (isDefined(objectMetadataItem?.namePlural)) {
      navigate(
        SettingsPath.ObjectNewFieldConfigure,
        {
          objectNamePlural: objectMetadataItem.namePlural,
        },
        {
          fieldType: FieldMetadataType.DATE,
        },
      );
    } else {
      navigate(SettingsPath.Objects);
    }
  }, [
    setNavigationMemorizedUrl,
    location.pathname,
    location.search,
    objectMetadataItem,
    navigate,
  ]);

  return {
    availableFieldsForCalendar,
    navigateToDateFieldSettings,
  };
};
