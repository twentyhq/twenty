import { ComponentInstance } from '@/ui/utilities/focus/types/ComponentInstance';
import { GlobalHotkeysConfig } from '@/ui/utilities/focus/types/HotkeysConfig';

export type FocusStackItem = {
  focusId: string;
  componentInstance: ComponentInstance;
  globalHotkeysConfig: GlobalHotkeysConfig;
};
