import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  isPlaygroundApiKeyFresh,
  playgroundApiKeyState,
} from '@/settings/mcp-and-apis/states/playgroundApiKeyState';
import { type PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';
import { PlaygroundTypes } from '@/settings/mcp-and-apis/types/PlaygroundTypes';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useToast } from 'twenty-ui/feedback';
import { GeneratePlaygroundTokenDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

// Re-mint when less than this remains so the user never lands on a token about to expire.
const TOKEN_FRESHNESS_BUFFER_MS = 5 * 60 * 1000;

export const useOpenPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const [playgroundApiKey, setPlaygroundApiKey] = useAtomState(
    playgroundApiKeyState,
  );
  const { add: addToast } = useToast();
  const [generatePlaygroundToken] = useMutation(
    GeneratePlaygroundTokenDocument,
    {
      onError: () => {
        addToast({
          variant: 'error',
          children: t`Could not open the API playground`,
        });
      },
    },
  );

  return useCallback(
    async (type: PlaygroundTypes, schema: PlaygroundSchemas) => {
      if (
        !isPlaygroundApiKeyFresh(playgroundApiKey, TOKEN_FRESHNESS_BUFFER_MS)
      ) {
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
