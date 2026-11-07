import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { DeleteMcpServerConnectionDocument } from '~/generated-metadata/graphql';

export const useDeleteMcpServerConnection = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [deleteMcpServerConnectionMutation, { loading }] = useMutation(
    DeleteMcpServerConnectionDocument,
  );

  const deleteMcpServerConnection = async (connectionId: string) => {
    try {
      await deleteMcpServerConnectionMutation({
        variables: { id: connectionId },
        update: (cache) => {
          cache.evict({
            id: cache.identify({
              __typename: 'McpServerConnection',
              id: connectionId,
            }),
          });
          cache.gc();
        },
      });

      enqueueToast({
        status: 'success',
        children: t`Disconnected from the MCP server`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return {
    deleteMcpServerConnection,
    isDeletingMcpServerConnection: loading,
  };
};
