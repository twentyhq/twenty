import { useCancelLayoutCustomization } from '@/app/hooks/useCancelLayoutCustomization';
import { Command } from '@/command-menu-item/display/components/Command';

export const CancelRecordPageLayoutSingleRecordCommand = () => {
  // redundant as of now
  // keeping it because EngineComponentKeyComponentMap still uses it
  const { cancel } = useCancelLayoutCustomization();

  return <Command onClick={cancel} />;
};
