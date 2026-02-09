import { createState } from 'twenty-ui/utilities';

export const isDestroyingEventStreamState = createState<boolean>({
  key: 'isDestroyingEventStreamState',
  defaultValue: false,
});
