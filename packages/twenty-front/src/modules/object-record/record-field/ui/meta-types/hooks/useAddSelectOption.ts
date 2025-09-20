import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useAddSelectOption = (fieldName: string | undefined) => {
  const { objectNamePlural } = useParams();
  const navigateSettings = useNavigateSettings();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const onAddSelectOption = useCallback(
    (optionName: string) => {
      if (!fieldName || !objectNamePlural) return;

      setNavigationMemorizedUrl({
        url: window.location.pathname + window.location.search,
        isAddingFieldOption: true,
      });

      navigateSettings(
        SettingsPath.ObjectFieldEdit,
        { objectNamePlural, fieldName },
        undefined,
        { state: { createNewOption: optionName } },
      );
    },
    [fieldName, objectNamePlural, navigateSettings, setNavigationMemorizedUrl],
  );

  return {
    onAddSelectOption:
      fieldName && objectNamePlural ? onAddSelectOption : undefined,
  };
};
