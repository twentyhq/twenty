import { createState } from '@/ui/utilities/state/utils/createState';

export const disposeFunctionForEventStreamState = createState<{
  dispose: () => void;
} | null>({
  key: 'disposeFunctionForEventStreamState',
  defaultValue: null,
});
