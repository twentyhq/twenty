import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { DialogComponentInstanceContext } from '@/ui/layout/dialog/contexts/DialogComponentInstanceContext';

export const isDialogOpenedComponentState = createAtomComponentState<boolean>({
  key: 'isDialogOpenedComponentState',
  defaultValue: false,
  componentInstanceContext: DialogComponentInstanceContext,
});
