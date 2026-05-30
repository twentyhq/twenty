import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { type PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { PlaygroundTypes } from '@/settings/playground/types/PlaygroundTypes';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import {
  type AuthToken,
  GeneratePlaygroundTokenDocument,
} from '~/generated-metadata/graphql';

const TOKEN_FRESHNESS_BUFFER_MS = 5 * 60 * 1000;

const isCachedTokenFresh = (token: AuthToken | null): boolean => {
  if (token === null) return false;
  return (
    new Date(token.expiresAt).getTime() - Date.now() > TOKEN_FRESHNESS_BUFFER_MS
  );
};

export const useOpenPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const [playgroundApiKey, setPlaygroundApiKey] = useAtomState(
    playgroundApiKeyState,
  );
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
    async (type: PlaygroundTypes, schema: PlaygroundSchemas) => {
      if (!isCachedTokenFresh(playgroundApiKey)) {
        const { data } = await generatePlaygroundToken();
        const mintedToken = data?.generatePlaygroundToken;
        if (!isDefined(mintedToken)) return;
        setPlaygroundApiKey(mintedToken);
      }

      const path =
        type === PlaygroundTypes.GRAPHQL
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
