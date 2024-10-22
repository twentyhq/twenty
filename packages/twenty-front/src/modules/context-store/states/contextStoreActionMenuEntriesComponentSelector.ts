import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreActionMenuEntriesComponentState } from '@/context-store/states/contextStoreActionMenuEntriesComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { isDefined } from 'twenty-ui';

export const contextStoreActionMenuEntriesComponentSelector =
  createComponentSelectorV2<ActionMenuEntry[]>({
    key: 'contextStoreActionMenuEntriesComponentSelector',
    instanceContext: ContextStoreComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        Array.from(
          get(
            contextStoreActionMenuEntriesComponentState.atomFamily({
              instanceId,
            }),
          ).values(),
        )
          .filter(isDefined)
          .sort((a, b) => a.position - b.position),
  });
