import { type SidePanelFooterCommandMenuItem } from '@/ui/layout/side-panel/types/SidePanelFooterCommandMenuItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sidePanelWidgetFooterCommandMenuItemsState = createAtomState<
  SidePanelFooterCommandMenuItem[]
>({
  key: 'side-panel/widgetFooterCommandMenuItemsState',
  defaultValue: [],
});
