import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { UpdateMcpServerDocument } from '~/generated-metadata/graphql';

export const useUpdateMcpServer = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const [updateMcpServerMutation, { loading: isUpdatingMcpServer }] =
    useMutation(UpdateMcpServerDocument);

  const updateMcpServer = async ({
    mcpServerId,
    update,
  }: {
    mcpServerId: string;
    update: Partial<
      Pick<McpServerFormValues, 'label' | 'url' | 'signInScope'> & {
        isActive: boolean;
      }
    >;
  }) => {
    try {
      const { data } = await updateMcpServerMutation({
        variables: { input: { id: mcpServerId, update } },
      });

      if (!isDefined(data)) {
        enqueueToast({
          status: 'error',
          children: t`Failed to update MCP server`,
        });
        return;
      }

      const { label } = data.updateMcpServer;

      enqueueToast({
        status: 'success',
        children: t`MCP server ${label} updated successfully`,
      });

      return data.updateMcpServer;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { updateMcpServer, isUpdatingMcpServer };
};
