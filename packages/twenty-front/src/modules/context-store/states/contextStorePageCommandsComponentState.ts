import { type PageCommand } from '@/command-menu-item/page-command/types/PageCommand';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

export const contextStorePageCommandsComponentState = createAtomComponentState<
  Partial<Record<EngineComponentKey, PageCommand>>
>({
  key: 'contextStorePageCommandsComponentState',
  defaultValue: {},
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
