import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { Command } from '@/command-menu-item/display/components/Command';

export const EditNavigationSidebarNoSelectionRecordCommand = () => {
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  return (
    <Command
      onClick={() => enterLayoutCustomizationMode()}
      closeSidePanelOnCommandMenuListExecution
    />
  );
};
