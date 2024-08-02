import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { SettingsPath } from '@/types/SettingsPath';
import { apiKeyTokenState } from '@/settings/developers/states/generatedApiKeyTokenState';
import { useResetRecoilState } from 'recoil';
import { AppPath } from '@/types/AppPath';

export const useCleanRecoilState = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const resetApiKeyToken = useResetRecoilState(apiKeyTokenState);
  if (
    !isMatchingLocation(
      `${AppPath.Settings}/${AppPath.Developers}/${SettingsPath.DevelopersApiKeyDetail}`,
    )
  ) {
    resetApiKeyToken();
  }
};
