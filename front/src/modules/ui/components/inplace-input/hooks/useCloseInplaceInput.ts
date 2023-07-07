import { useRecoilCallback } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
// TODO: Remove dependancy to table
import { isSomeInputInEditModeState } from '@/ui/tables/states/isSomeInputInEditModeState';

import { isEditModeScopedState } from '../states/isEditModeScopedState';

export function useInplaceInput() {
  const [, setIsEditMode] = useRecoilScopedState(isEditModeScopedState);

  const closeInplaceInput = useRecoilCallback(
    ({ set }) =>
      async () => {
        setIsEditMode(false);

        await new Promise((resolve) => setTimeout(resolve, 20));

        set(isSomeInputInEditModeState, false);
      },
    [setIsEditMode],
  );

  const openInplaceInput = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isSomeInputInEditMode = snapshot
          .getLoadable(isSomeInputInEditModeState)
          .valueOrThrow();

        if (!isSomeInputInEditMode) {
          set(isSomeInputInEditModeState, true);

          setIsEditMode(true);
        }
      },
    [setIsEditMode],
  );

  return {
    closeInplaceInput,
    openInplaceInput,
  };
}
