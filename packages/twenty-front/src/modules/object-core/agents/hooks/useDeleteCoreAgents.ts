import { useApolloClient, useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { coreAgentsIsDeletingFamilyState } from '@/object-core/agents/states/coreAgentsIsDeletingFamilyState';
import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { getCoreAgentSelectionAfterDeletion } from '@/object-core/agents/utils/getCoreAgentSelectionAfterDeletion';
import { getCustomCoreAgentIds } from '@/object-core/agents/utils/getCustomCoreAgentIds';
import { refreshCoreAgentQueries } from '@/object-core/agents/utils/refreshCoreAgentQueries';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import {
  DeleteOneAgentDocument,
  FindManyAgentsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useDeleteCoreAgents = (tableId: string) => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const [deleteOneAgent] = useMutation(DeleteOneAgentDocument);
  const { enqueueToast } = useToast();
  const selectionAtom = coreAgentsSelectionFamilyState.getAtom(tableId, null);
  const isDeletingAtom = coreAgentsIsDeletingFamilyState.getAtom(tableId, null);

  const deleteCoreAgents = async ({ agentIds }: { agentIds: string[] }) => {
    const canManageAgents = store.get(permissionFlagMapSelector.atom)[
      PermissionFlagType.AI_SETTINGS
    ];

    if (!canManageAgents || store.get(isDeletingAtom)) {
      return false;
    }

    const cachedAgents =
      apolloClient.readQuery({ query: FindManyAgentsDocument })
        ?.findManyAgents ?? [];
    const deletableAgentIds = getCustomCoreAgentIds({
      agentIds,
      coreAgents: cachedAgents,
      workspaceCustomApplicationId: store.get(currentWorkspaceState.atom)
        ?.workspaceCustomApplication?.id,
    });

    if (!isNonEmptyArray(deletableAgentIds)) {
      return false;
    }

    store.set(isDeletingAtom, true);

    try {
      const deletedAgentIds: string[] = [];
      const deletionErrors: unknown[] = [];
      const unconfirmedDeletionIds: string[] = [];

      for (const agentId of deletableAgentIds) {
        try {
          const { data } = await deleteOneAgent({
            variables: { input: { id: agentId } },
          });
          const isDeletionConfirmed = data?.deleteOneAgent.id === agentId;

          if (!isDeletionConfirmed) {
            unconfirmedDeletionIds.push(agentId);

            continue;
          }

          deletedAgentIds.push(agentId);
        } catch (error) {
          deletionErrors.push(error);
        }
      }

      store.set(selectionAtom, (selection) =>
        getCoreAgentSelectionAfterDeletion({ selection, deletedAgentIds }),
      );

      const deletedAgentIdSet = new Set(deletedAgentIds);

      const removeDeletedAgentsFromCache = () =>
        apolloClient.cache.updateQuery(
          { query: FindManyAgentsDocument },
          (data) => {
            if (!isDefined(data)) {
              return data;
            }

            return {
              ...data,
              findManyAgents: data.findManyAgents.filter(
                ({ id }) => !deletedAgentIdSet.has(id),
              ),
            };
          },
        );

      removeDeletedAgentsFromCache();
      await refreshCoreAgentQueries(apolloClient).catch(logError);
      removeDeletedAgentsFromCache();

      if (isNonEmptyArray(deletionErrors)) {
        enqueueToast(getToastOptionsFromError({ error: deletionErrors[0] }));

        return false;
      }

      if (isNonEmptyArray(unconfirmedDeletionIds)) {
        enqueueToast({
          status: 'error',
          children: t`Some agents could not be deleted. Try again.`,
        });

        return false;
      }

      return true;
    } finally {
      store.set(isDeletingAtom, false);
    }
  };

  return { deleteCoreAgents };
};
