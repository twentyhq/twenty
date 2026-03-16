import { EngineCommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/EngineCommandComponentInstanceContext';
import { type EngineCommandExecutionContext } from '@/command-menu-item/engine-command/types/EngineCommandExecutionContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const engineCommandExecutionContextComponentState =
  createAtomComponentState<EngineCommandExecutionContext | null>({
    key: 'engineCommandExecutionContextComponentState',
    defaultValue: null,
    componentInstanceContext: EngineCommandComponentInstanceContext,
  });
