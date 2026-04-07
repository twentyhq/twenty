import { type SidePanelFooterAction } from '@/ui/layout/side-panel/types/SidePanelFooterAction';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sidePanelWidgetFooterActionsState = createAtomState<
  SidePanelFooterAction[]
>({
  key: 'side-panel/widgetFooterActionsState',
  defaultValue: [],
});
