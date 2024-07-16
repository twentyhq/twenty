import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';

export type ActionBarEntry = ContextMenuEntry & {
  subActions?: ActionBarEntry[];
};
