import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type WorkspaceAppearanceUpdate = Partial<
  Pick<CurrentWorkspace, 'accentColor' | 'uiScale'>
>;

type UpdateWorkspaceOptimisticallyArgs = {
  update: WorkspaceAppearanceUpdate;
  rollback: WorkspaceAppearanceUpdate;
};

export const useOptimisticWorkspaceUpdate = () => {
  const store = useStore();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const applyToCurrentWorkspace = (values: WorkspaceAppearanceUpdate) =>
    store.set(currentWorkspaceState.atom, (workspace) =>
      isDefined(workspace) ? { ...workspace, ...values } : workspace,
    );

  const isStillShowing = ({
    accentColor,
    uiScale,
  }: WorkspaceAppearanceUpdate) => {
    const workspace = store.get(currentWorkspaceState.atom);

    return (
      (!isDefined(accentColor) || workspace?.accentColor === accentColor) &&
      (!isDefined(uiScale) || workspace?.uiScale === uiScale)
    );
  };

  const updateWorkspaceOptimistically = async ({
    update,
    rollback,
  }: UpdateWorkspaceOptimisticallyArgs) => {
    applyToCurrentWorkspace(update);

    try {
      const result = await updateWorkspace({ variables: { input: update } });

      if (isDefined(result.error)) {
        throw result.error;
      }
    } catch (error) {
      if (isStillShowing(update)) {
        applyToCurrentWorkspace(rollback);
      }
      logError(error);
    }
  };

  return { updateWorkspaceOptimistically };
};
