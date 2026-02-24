import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const shouldDestroyEventStreamState = createState<boolean>({
  key: 'shouldDestroyEventStreamState',
  defaultValue: false,
});
