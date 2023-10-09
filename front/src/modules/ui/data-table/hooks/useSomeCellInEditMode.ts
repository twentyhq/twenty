import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { isSomeCellInEditModeState } from '../states/isSomeCellInEditModeState';

export const useSomeCellInEditMode = () => {
  const setIsSomeCellInEditMode = useSetRecoilState(isSomeCellInEditModeState);

  const useIsSomeCellInEditMode = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const loadable = snapshot.getLoadable(isSomeCellInEditModeState);
        if (loadable.state === 'hasValue') {
          return loadable.contents;
        }
        return null;
      },
  );

  return {
    setIsSomeCellInEditMode,
    useIsSomeCellInEditMode,
  };
};
