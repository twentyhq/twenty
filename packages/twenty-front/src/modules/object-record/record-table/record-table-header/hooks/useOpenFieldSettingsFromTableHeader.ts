import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { shouldNavigateBackToMemorizedUrlOnSaveState } from '@/ui/navigation/states/shouldNavigateBackToMemorizedUrlOnSaveState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useOpenFieldSettingsFromTableHeader = () => {
  const location = useLocation();
  const navigateSettings = useNavigateSettings();

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  const setShouldNavigateBackToMemorizedUrlOnSave = useSetAtomState(
    shouldNavigateBackToMemorizedUrlOnSaveState,
  );

  const openFieldSettingsFromTableHeader = (fieldMetadataItemId: string) => {
    const { fieldMetadataItem, objectMetadataItem } =
      getFieldMetadataItemByIdOrThrow(fieldMetadataItemId);

    setNavigationMemorizedUrl(location.pathname + location.search);
    setShouldNavigateBackToMemorizedUrlOnSave(true);

    navigateSettings(SettingsPath.ObjectFieldEdit, {
      objectNamePlural: objectMetadataItem.namePlural,
      fieldName: fieldMetadataItem.name,
    });
  };

  return { openFieldSettingsFromTableHeader };
};
