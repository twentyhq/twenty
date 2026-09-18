import { useResetLocationHash } from 'twenty-ui/utilities';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

export const EditLayoutCommand = () => {
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { resetLocationHash } = useResetLocationHash();

  const handleExecute = async () => {
    if (!isLayoutCustomizationAllowedOnCurrentPage) {
      return;
    }

    await closeSidePanelMenu();

    enterLayoutCustomizationMode();
    resetLocationHash();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
