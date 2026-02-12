import { createState } from '@/ui/utilities/state/utils/createState';

export const isDestroyingEventStreamState = createState<boolean>({
  key: 'isDestroyingEventStreamState',
  defaultValue: false,
});
