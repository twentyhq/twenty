import { FocusComponentInstance } from '@/ui/utilities/focus/types/FocusComponentInstance';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';

export type FocusStackItem = {
  focusId: string;
  componentInstance: FocusComponentInstance;
  globalHotkeysConfig: GlobalHotkeysConfig;
};
