import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useNavigateToMcpServersList } from '@/settings/mcp-servers/hooks/useNavigateToMcpServersList';
import { DeleteMcpServerDocument } from '~/generated-metadata/graphql';

export const useDeleteMcpServer = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { navigateToMcpServersList } = useNavigateToMcpServersList();

  const [deleteMcpServerMutation] = useMutation(DeleteMcpServerDocument, {
    update: (cache) => {
      cache.evict({ id: 'ROOT_QUERY', fieldName: 'mcpServers' });
    },
  });

  const deleteMcpServer = async (mcpServerId: string) => {
    try {
      await deleteMcpServerMutation({ variables: { id: mcpServerId } });

      enqueueToast({
        status: 'success',
        children: t`MCP server deleted successfully`,
      });

      navigateToMcpServersList();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { deleteMcpServer };
};
