import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { shouldNavigateBackToMemorizedUrlOnSaveState } from '@/ui/navigation/states/shouldNavigateBackToMemorizedUrlOnSaveState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useAddSelectOption = (fieldName: string | undefined) => {
  const { objectNamePlural } = useParams();
  const navigateSettings = useNavigateSettings();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const setShouldNavigateBackToMemorizedUrlOnSave = useSetRecoilState(
    shouldNavigateBackToMemorizedUrlOnSaveState,
  );

  const userHasPermissionToEditDataModel = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const navigateToFieldOption = useCallback(
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

  const canAddSelectOption =
    userHasPermissionToEditDataModel && fieldName && objectNamePlural;

  return {
    navigateToFieldOption: canAddSelectOption
      ? navigateToFieldOption
      : undefined,
    canAddSelectOption,
  };
};
