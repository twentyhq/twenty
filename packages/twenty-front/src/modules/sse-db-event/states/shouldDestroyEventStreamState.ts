import { createState } from 'twenty-ui/utilities';

export const shouldDestroyEventStreamState = createState<boolean>({
  key: 'shouldDestroyEventStreamState',
  defaultValue: false,
});
