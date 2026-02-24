import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const disposeFunctionForEventStreamState = createStateV2<{
  dispose: () => void;
} | null>({
  key: 'disposeFunctionForEventStreamState',
  defaultValue: null,
});
