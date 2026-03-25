import { createRequiredContext } from '~/utils/createRequiredContext';

type SidePanelContextType = {
  isInSidePanel: boolean;
};

export const [SidePanelProvider, useIsInSidePanelOrThrow] =
  createRequiredContext<SidePanelContextType>('SidePanel');
