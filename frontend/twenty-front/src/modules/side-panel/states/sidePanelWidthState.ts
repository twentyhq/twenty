import { SIDE_PANEL_CONSTRAINTS } from '@/side-panel/constants/SidePanelConstraints';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const SIDE_PANEL_WIDTH_VAR = '--side-panel-width';

export const sidePanelWidthState = createAtomState<number>({
  key: 'sidePanelWidth',
  defaultValue: SIDE_PANEL_CONSTRAINTS.default,
  useLocalStorage: true,
});
