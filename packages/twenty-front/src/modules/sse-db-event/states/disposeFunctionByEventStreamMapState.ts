import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const disposeFunctionForEventStreamState = createAtomState<{
  dispose: () => void;
} | null>({
  key: 'disposeFunctionForEventStreamState',
  defaultValue: null,
});
