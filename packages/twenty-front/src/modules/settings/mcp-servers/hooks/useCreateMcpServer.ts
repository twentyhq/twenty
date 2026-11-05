import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { CreateMcpServerDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useCreateMcpServer = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enqueueToast } = useToast();

  const [createMcpServerMutation] = useMutation(CreateMcpServerDocument, {
    update: (cache) => {
      cache.evict({ id: 'ROOT_QUERY', fieldName: 'mcpServers' });
    },
  });

  const createMcpServer = async (formValues: McpServerFormValues) => {
    try {
      const { data } = await createMcpServerMutation({
        variables: { input: formValues },
      });

      if (!isDefined(data)) {
        return;
      }

      const { id, label } = data.createMcpServer;

      enqueueToast({
        status: 'success',
        children: t`MCP server ${label} created successfully`,
      });

      navigateSettings(SettingsPath.McpServerDetail, { mcpServerId: id });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { createMcpServer };
};
