import { createContext } from 'react';

export const RelationPickerRecoilScopeContext = createContext<string | null>(
  'relation-picker-context',
);
