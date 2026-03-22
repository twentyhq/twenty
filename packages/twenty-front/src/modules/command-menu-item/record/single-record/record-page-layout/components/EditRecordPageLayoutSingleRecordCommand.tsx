import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { Command } from '@/command-menu-item/display/components/Command';
import { useResetLocationHash } from 'twenty-ui/utilities';

export const EditRecordPageLayoutSingleRecordCommand = () => {
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  const { resetLocationHash } = useResetLocationHash();

  const handleClick = () => {
    enterLayoutCustomizationMode();
    resetLocationHash();
  };

  return <Command onClick={handleClick} />;
};
