import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { UpdateMcpServerDocument } from '~/generated-metadata/graphql';

export const useUpdateMcpServer = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const [updateMcpServerMutation] = useMutation(UpdateMcpServerDocument);

  const updateMcpServer = async ({
    mcpServerId,
    formValues: { label, url, connectionProviderId, isActive },
  }: {
    mcpServerId: string;
    formValues: McpServerFormValues;
  }) => {
    try {
      const { data } = await updateMcpServerMutation({
        variables: {
          input: {
            id: mcpServerId,
            update: { label, url, connectionProviderId, isActive },
          },
        },
      });

      enqueueToast({
        status: 'success',
        children: t`MCP server ${label} updated successfully`,
      });

      return data?.updateMcpServer;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { updateMcpServer };
};
