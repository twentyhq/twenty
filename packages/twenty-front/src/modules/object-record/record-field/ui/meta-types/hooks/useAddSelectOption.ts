import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { shouldNavigateBackToMemorizedUrlOnSaveState } from '@/ui/navigation/states/shouldNavigateBackToMemorizedUrlOnSaveState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useAddSelectOption = (fieldMetadataId: string) => {
  const { fieldMetadataItem, objectMetadataItem } =
    useFieldMetadataItemById(fieldMetadataId);
  const navigateSettings = useNavigateSettings();
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  const setShouldNavigateBackToMemorizedUrlOnSave = useSetAtomState(
    shouldNavigateBackToMemorizedUrlOnSaveState,
  );

  const fieldName = fieldMetadataItem?.name;
  const objectNamePlural = objectMetadataItem?.namePlural;

  const addSelectOption = useCallback(
    (optionName: string) => {
      if (!fieldName || !objectNamePlural) return;

      setNavigationMemorizedUrl(
        window.location.pathname + window.location.search,
      );
      setShouldNavigateBackToMemorizedUrlOnSave(true);

      navigateSettings(
        SettingsPath.ObjectFieldEdit,
        { objectNamePlural, fieldName },
        { newOption: optionName },
      );
    },
    [
      fieldName,
      objectNamePlural,
      navigateSettings,
      setNavigationMemorizedUrl,
      setShouldNavigateBackToMemorizedUrlOnSave,
    ],
  );

  return { addSelectOption };
};
