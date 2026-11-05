import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useNavigateToMcpServersTab } from '@/settings/mcp-servers/hooks/useNavigateToMcpServersTab';
import { DeleteMcpServerDocument } from '~/generated-metadata/graphql';

export const useDeleteMcpServer = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { navigateToMcpServersTab } = useNavigateToMcpServersTab();

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

      navigateToMcpServersTab();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { deleteMcpServer };
};
