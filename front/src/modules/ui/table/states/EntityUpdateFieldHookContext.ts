import { createContext } from 'react';

import { EntityUpdateFieldHook } from '../types/CellUpdateFieldHook';

export const EntityUpdateFieldHookContext =
  createContext<EntityUpdateFieldHook | null>(null);
