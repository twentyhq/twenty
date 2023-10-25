import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';

import { currentViewIdScopedState } from '../../../../views/states/currentViewIdScopedState';
import { ViewBarContext } from '../contexts/ViewBarContext';
import { viewsScopedState } from '../../../../views/states/viewsScopedState';

export const useRemoveView = () => {
  const { onViewRemove, ViewBarRecoilScopeContext } =
    useContext(ViewBarContext);

  const recoilScopeId = useRecoilScopeId(ViewBarRecoilScopeContext);

  const removeView = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const currentViewId = await snapshot.getPromise(
          currentViewIdScopedState({ scopeId: recoilScopeId }),
        );

        if (currentViewId === viewId)
          set(currentViewIdScopedState({ scopeId: recoilScopeId }), undefined);

        set(viewsScopedState(recoilScopeId), (previousViews) =>
          previousViews.filter((view) => view.id !== viewId),
        );
        await onViewRemove?.(viewId);
      },
    [onViewRemove, recoilScopeId],
  );

  return { removeView };
};
