import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { v4 } from 'uuid';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CreateOneAgentDocument } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { logError } from '~/utils/logError';

export const useCreateCoreAgent = () => {
  const canCreateCoreAgent = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );

  const [createOneAgentMutation] = useMutation(CreateOneAgentDocument);

  const [isCreatingCoreAgent, setIsCreatingCoreAgent] = useState(false);

  const navigate = useNavigateApp();

  const { enqueueToast } = useToast();

  const createCoreAgent = useCallback(async () => {
    if (isCreatingCoreAgent || !canCreateCoreAgent) {
      return;
    }

    setIsCreatingCoreAgent(true);

    let coreAgentId: string | null | undefined;

    try {
      const { data } = await createOneAgentMutation({
        variables: {
          input: {
            // Names are unique per workspace and renaming the label rewrites it
            name: `untitledAgent${v4().split('-')[0]}`,
            label: t`Untitled agent`,
            icon: 'IconLego',
            prompt: 'You are a helpful AI assistant.',
            modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
            responseFormat: { type: 'text' },
          },
        },
      });

      coreAgentId = data?.createOneAgent.id;
    } catch (error) {
      logError(error);
      enqueueToast({
        variant: 'error',
        children: t`Failed to create agent`,
      });

      return;
    } finally {
      setIsCreatingCoreAgent(false);
    }

    if (!isDefined(coreAgentId)) {
      enqueueToast({
        variant: 'error',
        children: t`Failed to create agent`,
      });

      return;
    }

    navigate(AppPath.AgentShowPage, { agentId: coreAgentId });
  }, [
    canCreateCoreAgent,
    createOneAgentMutation,
    navigate,
    enqueueToast,
    isCreatingCoreAgent,
  ]);

  return { createCoreAgent, canCreateCoreAgent, isCreatingCoreAgent };
};
