import { FocusComponentInstance } from '@/ui/utilities/focus/types/FocusComponentInstance';
import { FocusGlobalHotkeysConfig } from '@/ui/utilities/focus/types/FocusGlobalHotkeysConfig';

export type FocusStackItem = {
  focusId: string;
  componentInstance: FocusComponentInstance;
  globalHotkeysConfig: FocusGlobalHotkeysConfig;
};
