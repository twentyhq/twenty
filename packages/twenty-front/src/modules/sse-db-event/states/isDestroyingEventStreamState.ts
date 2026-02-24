import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isDestroyingEventStreamState = createState<boolean>({
  key: 'isDestroyingEventStreamState',
  defaultValue: false,
});
