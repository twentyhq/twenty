import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const dropdownMaxHeightComponentState = createComponentState<
  number | undefined
>({
  key: 'dropdownMaxHeightComponentState',
  componentInstanceContext: DropdownComponentInstanceContext,
  defaultValue: undefined,
});
