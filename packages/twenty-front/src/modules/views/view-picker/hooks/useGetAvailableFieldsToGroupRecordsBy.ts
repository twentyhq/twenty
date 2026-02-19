import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useGetAvailableFieldsToGroupRecordsBy = () => {
  const viewObjectMetadataId = useRecoilComponentValue(
    viewObjectMetadataIdComponentState,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const setNavigationMemorizedUrl = useSetRecoilStateV2(
    navigationMemorizedUrlState,
  );
  const location = useLocation();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadata) => objectMetadata.id === viewObjectMetadataId,
  );

  const availableFieldsForGrouping =
    objectMetadataItem?.readableFields.filter(
      (field) =>
        field.type === FieldMetadataType.SELECT && field.isActive === true,
    ) ?? [];

  const navigate = useNavigateSettings();

  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);

    if (isDefined(objectMetadataItem?.namePlural)) {
      navigate(
        SettingsPath.ObjectNewFieldConfigure,
        {
          objectNamePlural: objectMetadataItem.namePlural,
        },
        {
          fieldType: FieldMetadataType.SELECT,
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
    availableFieldsForGrouping,
    navigateToSelectSettings,
  };
};
