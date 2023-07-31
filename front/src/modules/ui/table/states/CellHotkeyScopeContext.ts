import { createContext } from 'react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const CellHotkeyScopeContext = createContext<HotkeyScope | null>(null);
