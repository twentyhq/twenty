import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { isSomeCellInEditModeState } from '../states/isSomeCellInEditModeState';

export const useSomeCellInEditMode = () => {
  const setIsSomeCellInEditMode = useSetRecoilState(isSomeCellInEditModeState);

  const getIsSomeCellInEditMode = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const loadable = snapshot.getLoadable(isSomeCellInEditModeState);
        return loadable.valueOrThrow();
      },
    [],
  );

  return {
    setIsSomeCellInEditMode,
    getIsSomeCellInEditMode,
  };
};
