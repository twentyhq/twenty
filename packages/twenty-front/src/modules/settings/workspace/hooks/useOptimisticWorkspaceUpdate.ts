import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { isWorkspaceAppearanceShowing } from '@/settings/workspace/utils/isWorkspaceAppearanceShowing';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type WorkspaceAppearanceUpdate = Partial<
  Pick<CurrentWorkspace, 'accentColor' | 'uiScale'>
>;

export const useOptimisticWorkspaceUpdate = () => {
  const store = useStore();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const applyToCurrentWorkspace = (values: WorkspaceAppearanceUpdate) =>
    store.set(currentWorkspaceState.atom, (workspace) =>
      isDefined(workspace) ? { ...workspace, ...values } : workspace,
    );

  const updateWorkspaceOptimistically = async ({
    update,
    rollback,
  }: {
    update: WorkspaceAppearanceUpdate;
    rollback: WorkspaceAppearanceUpdate;
  }) => {
    applyToCurrentWorkspace(update);

    try {
      const result = await updateWorkspace({ variables: { input: update } });

      if (isDefined(result.error)) {
        throw result.error;
      }
    } catch (error) {
      if (
        isWorkspaceAppearanceShowing({
          workspace: store.get(currentWorkspaceState.atom),
          appearance: update,
        })
      ) {
        applyToCurrentWorkspace(rollback);
      }
      logError(error);
    }
  };

  return { updateWorkspaceOptimistically };
};
