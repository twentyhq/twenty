import { createContext } from 'react';

import { FilterDefinition } from '../types/FilterDefinition';

export const AvailableFiltersContext = createContext<FilterDefinition[]>([]);
