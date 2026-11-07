import { type SidePanelFooterCommandMenuItem } from '@/ui/layout/side-panel/types/SidePanelFooterCommandMenuItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordShowPageWidgetHeaderCommandMenuItemsState = createAtomState<
  SidePanelFooterCommandMenuItem[]
>({
  key: 'record-show-page/widgetHeaderCommandMenuItemsState',
  defaultValue: [],
});
