import { type WidgetCommandMenuItem } from '@/command-menu-item/types/WidgetCommandMenuItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordShowPageWidgetHeaderCommandMenuItemsState = createAtomState<
  WidgetCommandMenuItem[]
>({
  key: 'record-show-page/widgetHeaderCommandMenuItemsState',
  defaultValue: [],
});
