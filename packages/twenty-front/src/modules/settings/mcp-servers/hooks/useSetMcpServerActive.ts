import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useNavigateToMcpServersList } from '@/settings/mcp-servers/hooks/useNavigateToMcpServersList';
import { UpdateMcpServerDocument } from '~/generated-metadata/graphql';

export const useSetMcpServerActive = () => {
  const { enqueueToast } = useToast();
  const { navigateToMcpServersList } = useNavigateToMcpServersList();

  const [updateMcpServerMutation, { loading: isSettingMcpServerActive }] =
    useMutation(UpdateMcpServerDocument);

  const setMcpServerActive = async ({
    mcpServerId,
    isActive,
  }: {
    mcpServerId: string;
    isActive: boolean;
  }) => {
    try {
      await updateMcpServerMutation({
        variables: { input: { id: mcpServerId, update: { isActive } } },
      });

      navigateToMcpServersList();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { setMcpServerActive, isSettingMcpServerActive };
};
