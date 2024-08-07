import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { SettingsPath } from '@/types/SettingsPath';
import { apiKeyTokenState } from '@/settings/developers/states/generatedApiKeyTokenState';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { AppPath } from '@/types/AppPath';
import { isDefined } from '~/utils/isDefined';

export const useCleanRecoilState = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const resetApiKeyToken = useResetRecoilState(apiKeyTokenState);
  const apiKeyToken = useRecoilValue(apiKeyTokenState);
  const cleanRecoilState = () => {
    if (
      !isMatchingLocation(
        `${AppPath.Settings}/${AppPath.Developers}/${SettingsPath.DevelopersApiKeyDetail}`,
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
