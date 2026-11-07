import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { GenerateTransientTokenDocument } from '~/generated-metadata/graphql';

type McpServerAccountScope = 'USER' | 'WORKSPACE';

export const useTriggerMcpServerOAuth = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { redirect } = useRedirect();
  const [generateTransientToken] = useMutation(GenerateTransientTokenDocument);

  const triggerMcpServerOAuth = async ({
    mcpServerId,
    accountScope,
  }: {
    mcpServerId: string;
    accountScope: McpServerAccountScope;
  }) => {
    try {
      const transient = await generateTransientToken();
      const token = transient.data?.generateTransientToken.transientToken.token;

      if (!isDefined(token)) {
        enqueueToast({
          status: 'error',
          children: t`Could not start signing in to the MCP server`,
        });

        return;
      }

      const params = new URLSearchParams({
        mcpServerId,
        transientToken: token,
        accountScope,
        redirectLocation: getSettingsPath(SettingsPath.AiMcpServerDetail, {
          mcpServerId,
        }),
      });

      redirect(
        `${REACT_APP_SERVER_BASE_URL}/auth/mcp-servers/authorize?${params.toString()}`,
      );
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { triggerMcpServerOAuth };
};
