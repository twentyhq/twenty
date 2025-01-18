import { apiKeyTokenState } from '@/settings/developers/states/generatedApiKeyTokenState';
import { SettingsPath } from '@/types/SettingsPath';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useCleanRecoilState = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const resetApiKeyToken = useResetRecoilState(apiKeyTokenState);
  const apiKeyToken = useRecoilValue(apiKeyTokenState);
  const cleanRecoilState = () => {
    if (
      !isMatchingLocation(
        getSettingsPath(SettingsPath.Developers) +
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
