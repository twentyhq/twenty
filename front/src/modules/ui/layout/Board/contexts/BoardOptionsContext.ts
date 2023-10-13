import { createContext } from 'react';

import { BoardOptions } from '@/ui/Layout/Board/types/BoardOptions';

export const BoardOptionsContext = createContext<BoardOptions | null>(null);
