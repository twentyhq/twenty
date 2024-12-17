import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponeInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const dropdownMaxHeightComponentStateV2 = createComponentStateV2<
  number | undefined
>({
  key: 'dropdownMaxHeightComponentStateV2',
  componentInstanceContext: DropdownComponentInstanceContext,
  defaultValue: undefined,
});
