import { createContext } from 'react';

import { BoardOptions } from '@/ui/board/types/BoardOptions';

export const BoardOptionsContext = createContext<BoardOptions | null>(null);
