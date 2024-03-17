import { createContext } from 'react';
import { HotkeyScope } from 'twenty-ui';

export const CellHotkeyScopeContext = createContext<HotkeyScope | null>(null);
