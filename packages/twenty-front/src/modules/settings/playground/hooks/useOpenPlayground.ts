import { useMutation } from '@apollo/client/react';
import { jwtDecode } from 'jwt-decode';
import { useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { type PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { GeneratePlaygroundTokenDocument } from '~/generated-metadata/graphql';

const TOKEN_FRESHNESS_BUFFER_SECONDS = 5 * 60;

// A cached token is reusable only when it is a PLAYGROUND-type JWT and has
// more than the freshness buffer of runway left.
const isCachedTokenUsable = (token: string | null): boolean => {
  if (token === null) return false;
  try {
    const decoded = jwtDecode<{ exp?: number; type?: string }>(token);
    if (decoded.type !== 'PLAYGROUND') return false;
    if (decoded.exp === undefined) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return decoded.exp - nowSeconds > TOKEN_FRESHNESS_BUFFER_SECONDS;
  } catch {
    return false;
  }
};

export const useOpenPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const setPlaygroundApiKey = useSetAtomState(playgroundApiKeyState);
  const playgroundApiKey = useAtomStateValue(playgroundApiKeyState);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [generatePlaygroundToken] = useMutation(
    GeneratePlaygroundTokenDocument,
    {
      onError: () => {
        enqueueErrorSnackBar({
          message: t`Could not open the API playground`,
        });
      },
    },
  );

  return useCallback(
    async (type: 'rest' | 'graphql', schema: PlaygroundSchemas) => {
      if (!isCachedTokenUsable(playgroundApiKey)) {
        const { data } = await generatePlaygroundToken();
        const token = data?.generatePlaygroundToken.token;
        if (!isDefined(token)) return;
        setPlaygroundApiKey(token);
      }

      const path =
        type === 'graphql'
          ? SettingsPath.GraphQLPlayground
          : SettingsPath.RestPlayground;
      navigateSettings(path, { schema });
    },
    [
      playgroundApiKey,
      generatePlaygroundToken,
      navigateSettings,
      setPlaygroundApiKey,
    ],
  );
};
