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

// Don't reuse a cached token if it's about to expire — give the user enough
// runway to make a few requests before they 401.
const TOKEN_FRESHNESS_BUFFER_SECONDS = 5 * 60;

// We only reuse a cached token if it's BOTH a PLAYGROUND-type JWT AND has
// enough runway left. Without the type check, an old API_KEY token left in
// localStorage from a prior version of this flow would pass the exp check
// (API_KEY JWTs are signed with a 100-year expiry) and silently get sent to
// the backend, which then rejects it via the API_KEY validation path with
// "This API Key is revoked".
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

// Centralizes the "enter the REST/GraphQL playground" flow: ensure
// playgroundApiKeyState holds a non-expiring PLAYGROUND JWT, then navigate.
// Re-minting is skipped when the cached token still has more than the
// freshness buffer left, so repeat clicks within the TTL are zero-roundtrip.
export const useOpenPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const setPlaygroundApiKey = useSetAtomState(playgroundApiKeyState);
  const cachedToken = useAtomStateValue(playgroundApiKeyState);
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
      if (!isCachedTokenUsable(cachedToken)) {
        const { data } = await generatePlaygroundToken();
        const token = data?.generatePlaygroundToken.token;
        if (!isDefined(token)) {
          // onError fires for thrown errors; this handles a malformed success.
          enqueueErrorSnackBar({
            message: t`Could not open the API playground`,
          });
          return;
        }
        setPlaygroundApiKey(token);
      }

      const path =
        type === 'graphql'
          ? SettingsPath.GraphQLPlayground
          : SettingsPath.RestPlayground;
      navigateSettings(path, { schema });
    },
    [
      cachedToken,
      enqueueErrorSnackBar,
      generatePlaygroundToken,
      navigateSettings,
      setPlaygroundApiKey,
    ],
  );
};
