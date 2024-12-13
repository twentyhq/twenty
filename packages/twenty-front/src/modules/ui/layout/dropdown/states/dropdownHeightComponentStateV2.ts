import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponeInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const dropdownHeightComponentStateV2 = createComponentStateV2<
  string | undefined
>({
  key: 'dropdownHeightComponentStateV2',
  componentInstanceContext: DropdownComponentInstanceContext,
  defaultValue: '100%',
});
