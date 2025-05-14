import { ModalComponentInstanceContext } from '@/ui/layout/modal/contexts/ModalComponentInstanceContext';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const modalHotkeyScopeComponentState = createComponentStateV2<
  HotkeyScope | null | undefined
>({
  key: 'modalHotkeyScopeComponentState',
  defaultValue: null,
  componentInstanceContext: ModalComponentInstanceContext,
});
