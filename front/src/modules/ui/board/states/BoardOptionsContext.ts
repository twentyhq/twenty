import { createContext } from 'react';

import { BoardOptions } from '@/pipeline/types/BoardOptions';

export const BoardOptionsContext = createContext<BoardOptions | null>(null);
