import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { navigateBackToViewOnSaveState } from '@/ui/navigation/states/navigateBackToViewOnSaveState';
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

  const setNavigateBackToViewOnSave = useSetRecoilState(
    navigateBackToViewOnSaveState,
  );

  const userHasPermissionToEditDataModel = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const onAddSelectOption = useCallback(
    (optionName: string) => {
      if (!fieldName || !objectNamePlural) return;

      setNavigationMemorizedUrl(
        window.location.pathname + window.location.search,
      );
      setNavigateBackToViewOnSave(true);

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
      setNavigateBackToViewOnSave,
    ],
  );

  return {
    onAddSelectOption:
      userHasPermissionToEditDataModel && fieldName && objectNamePlural
        ? onAddSelectOption
        : undefined,
  };
};
