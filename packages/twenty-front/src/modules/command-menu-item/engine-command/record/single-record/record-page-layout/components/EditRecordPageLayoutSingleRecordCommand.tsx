import { useResetLocationHash } from 'twenty-ui/utilities';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

export const EditRecordPageLayoutSingleRecordCommand = () => {
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { resetLocationHash } = useResetLocationHash();

  const handleExecute = async () => {
    await closeSidePanelMenu();

    enterLayoutCustomizationMode();
    resetLocationHash();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
