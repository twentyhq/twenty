import { createState } from '@/ui/utilities/state/utils/createState';

export const shouldDestroyEventStreamState = createState<boolean>({
  key: 'shouldDestroyEventStreamState',
  defaultValue: false,
});
