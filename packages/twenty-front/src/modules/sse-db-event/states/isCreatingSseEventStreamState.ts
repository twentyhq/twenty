import { createState } from '@/ui/utilities/state/utils/createState';

export const isCreatingSseEventStreamState = createState<boolean>({
  key: 'isCreatingSseEventStreamState',
  defaultValue: false,
});
