import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { SidePanelPageComponentInstanceContext } from './contexts/SidePanelPageComponentInstanceContext';

export const sidePanelShouldFocusTitleInputComponentState =
  createAtomComponentState<boolean>({
    key: 'commandMenuShouldFocusTitleInputComponentState',
    defaultValue: false,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
