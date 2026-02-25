import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const contextStoreCurrentViewIdComponentState = createAtomComponentState<
  string | undefined
>({
  key: 'contextStoreCurrentViewIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
