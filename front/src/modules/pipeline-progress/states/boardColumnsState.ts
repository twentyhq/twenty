import { atom } from 'recoil';

import { BoardPipelineStageColumn } from '@/ui/board/components/Board';

export const boardColumnsState = atom<BoardPipelineStageColumn[]>({
  key: 'boardColumnsState',
  default: [],
});
