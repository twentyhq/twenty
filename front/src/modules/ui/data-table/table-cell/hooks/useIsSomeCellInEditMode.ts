// useIsSomeCellInEditMode.ts

import { useRecoilState } from 'recoil';

import { isSomeCellInEditModeState } from '../../states/isSomeCellInEditModeState';

export const useIsSomeCellInEditMode = () => {
  const [isSomeCellInEditMode, setIsSomeCellInEditMode] = useRecoilState(
    isSomeCellInEditModeState,
  );
  return { isSomeCellInEditMode, setIsSomeCellInEditMode };
};
