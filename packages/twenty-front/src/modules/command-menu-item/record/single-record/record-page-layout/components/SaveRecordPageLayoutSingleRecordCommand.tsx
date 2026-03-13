import { useSaveLayoutCustomization } from '@/app/hooks/useSaveLayoutCustomization';
import { Command } from '@/command-menu-item/display/components/Command';

export const SaveRecordPageLayoutSingleRecordCommand = () => {
  // same
  const { save } = useSaveLayoutCustomization();

  return <Command onClick={save} />;
};
