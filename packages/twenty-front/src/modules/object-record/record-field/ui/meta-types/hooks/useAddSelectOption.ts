import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { shouldNavigateBackToMemorizedUrlOnSaveState } from '@/ui/navigation/states/shouldNavigateBackToMemorizedUrlOnSaveState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useAddSelectOption = (fieldName: string) => {
  const { objectNamePlural } = useParams();
  const navigateSettings = useNavigateSettings();
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  const setShouldNavigateBackToMemorizedUrlOnSave = useSetAtomState(
    shouldNavigateBackToMemorizedUrlOnSaveState,
  );

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
