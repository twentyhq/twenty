import { createState } from 'twenty-ui/utilities';

export const isCreatingSseEventStreamState = createState<boolean>({
  key: 'isCreatingSseEventStreamState',
  defaultValue: false,
});
