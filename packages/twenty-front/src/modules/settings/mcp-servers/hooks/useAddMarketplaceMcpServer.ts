import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { AddMarketplaceMcpServerDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useAddMarketplaceMcpServer = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enqueueToast } = useToast();

  const [addMarketplaceMcpServerMutation, { loading: isAdding }] = useMutation(
    AddMarketplaceMcpServerDocument,
    {
      update: (cache) => {
        cache.evict({ id: 'ROOT_QUERY', fieldName: 'mcpServers' });
      },
    },
  );

  const addMarketplaceMcpServer = async (universalIdentifier: string) => {
    try {
      const { data } = await addMarketplaceMcpServerMutation({
        variables: { universalIdentifier },
      });

      if (!isDefined(data)) {
        enqueueToast({
          status: 'error',
          children: t`Failed to add MCP server`,
        });
        return;
      }

      const { id, label } = data.addMarketplaceMcpServer;

      enqueueToast({
        status: 'success',
        children: t`MCP server ${label} added`,
      });

      navigateSettings(SettingsPath.AiMcpServerDetail, { mcpServerId: id });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { addMarketplaceMcpServer, isAdding };
};
