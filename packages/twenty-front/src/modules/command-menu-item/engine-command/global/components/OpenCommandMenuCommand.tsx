import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

export const OpenCommandMenuCommand = () => {
  const { openSidePanelMenu } = useSidePanelMenu();

  return <HeadlessEngineCommandWrapperEffect execute={openSidePanelMenu} />;
};
