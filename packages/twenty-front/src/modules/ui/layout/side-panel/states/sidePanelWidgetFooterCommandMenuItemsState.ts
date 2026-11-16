import { type WidgetCommandMenuItem } from '@/command-menu-item/types/WidgetCommandMenuItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sidePanelWidgetFooterCommandMenuItemsState = createAtomState<
  WidgetCommandMenuItem[]
>({
  key: 'side-panel/widgetFooterCommandMenuItemsState',
  defaultValue: [],
});
