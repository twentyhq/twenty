import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const dropdownYPositionComponentState = createComponentState<
  number | undefined
>({
  key: 'dropdownYPositionComponentState',
  componentInstanceContext: DropdownComponentInstanceContext,
  defaultValue: undefined,
});
