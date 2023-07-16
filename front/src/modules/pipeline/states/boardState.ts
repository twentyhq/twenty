import { atom } from 'recoil';

import { BoardPipelineStageColumn } from '@/ui/board/components/Board';

export const boardState = atom<BoardPipelineStageColumn[] | undefined>({
  key: 'boardState',
  default: undefined,
});
