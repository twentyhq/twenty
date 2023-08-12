import { createContext } from 'react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const FieldHotkeyScopeContext = createContext<HotkeyScope | null>(null);
