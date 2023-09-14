import { type Context, useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';

import { ViewBarContext } from '../contexts/ViewBarContext';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { viewsScopedState } from '../states/viewsScopedState';

export const useRemoveView = ({
  scopeContext,
}: {
  scopeContext: Context<string | null>;
}) => {
  const { onViewRemove } = useContext(ViewBarContext);
  const recoilScopeId = useContextScopeId(scopeContext);

  const removeView = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const currentViewId = await snapshot.getPromise(
          currentViewIdScopedState(recoilScopeId),
        );

        if (currentViewId === viewId)
          set(currentViewIdScopedState(recoilScopeId), undefined);

        set(viewsScopedState(recoilScopeId), (previousViews) =>
          previousViews.filter((view) => view.id !== viewId),
        );
        await onViewRemove?.(viewId);
      },
    [onViewRemove, recoilScopeId],
  );

  return { removeView };
};
