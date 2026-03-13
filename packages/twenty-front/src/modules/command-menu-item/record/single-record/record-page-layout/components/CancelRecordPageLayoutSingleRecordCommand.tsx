import { useCancelLayoutCustomization } from '@/app/hooks/useCancelLayoutCustomization';
import { Command } from '@/command-menu-item/display/components/Command';

export const CancelRecordPageLayoutSingleRecordCommand = () => {
  const { cancel } = useCancelLayoutCustomization();

  return <Command onClick={cancel} />;
};
