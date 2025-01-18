import { apiKeyTokenState } from '@/settings/developers/states/generatedApiKeyTokenState';
import { SettingsPath } from '@/types/SettingsPath';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const useCleanRecoilState = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const resetApiKeyToken = useResetRecoilState(apiKeyTokenState);
  const apiKeyToken = useRecoilValue(apiKeyTokenState);
  const cleanRecoilState = () => {
    if (
      !isMatchingLocation(
        settingsLink(SettingsPath.Developers) +
          SettingsPath.DevelopersApiKeyDetail,
      ) &&
      isDefined(apiKeyToken)
    ) {
      resetApiKeyToken();
    }
  };

  return {
    cleanRecoilState,
  };
};
