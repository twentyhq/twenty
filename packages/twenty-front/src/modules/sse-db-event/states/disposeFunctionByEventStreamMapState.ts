import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const disposeFunctionForEventStreamState = createState<{
  dispose: () => void;
} | null>({
  key: 'disposeFunctionForEventStreamState',
  defaultValue: null,
});
