import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

export type MountedEngineCommandContext = {
  engineComponentKey: EngineComponentKey;
  contextStoreInstanceId: string;
};

export const mountedEngineCommandsState = createAtomState<
  Map<string, MountedEngineCommandContext>
>({
  key: 'mountedEngineCommandsState',
  defaultValue: new Map(),
});
