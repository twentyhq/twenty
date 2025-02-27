import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

type MultipleObjectPickerComponentInstanceContextProps = ComponentStateKeyV2;

export const MultipleObjectPickerComponentInstanceContext =
  createComponentInstanceContext<MultipleObjectPickerComponentInstanceContextProps>();
