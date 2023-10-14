import { createContext } from 'react';

import { BoardOptions } from '@/ui/layout/board/types/BoardOptions';

export const BoardOptionsContext = createContext<BoardOptions | null>(null);
