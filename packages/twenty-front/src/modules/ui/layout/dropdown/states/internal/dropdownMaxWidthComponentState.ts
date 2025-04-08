import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponeInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const dropdownMaxWidthComponentState = createComponentStateV2<
  number | undefined
>({
  key: 'dropdownMaxWidthComponentState',
  componentInstanceContext: DropdownComponentInstanceContext,
  defaultValue: undefined,
});
