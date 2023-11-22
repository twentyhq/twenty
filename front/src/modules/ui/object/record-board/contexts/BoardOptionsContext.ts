import { createContext } from 'react';

import { BoardOptions } from '@/ui/object/record-board/types/BoardOptions';

export const BoardOptionsContext = createContext<BoardOptions | null>(null);
