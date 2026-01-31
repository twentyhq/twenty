import { createState } from 'twenty-ui/utilities';

export const disposeFunctionForEventStreamState = createState<{
  dispose: () => void;
} | null>({
  key: 'disposeFunctionForEventStreamState',
  defaultValue: null,
});
