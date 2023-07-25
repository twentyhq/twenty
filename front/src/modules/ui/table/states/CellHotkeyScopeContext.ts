import { createContext } from 'react';

import { HotkeyScope } from '../../hotkey/types/HotkeyScope';

export const CellHotkeyScopeContext = createContext<HotkeyScope | null>(null);
