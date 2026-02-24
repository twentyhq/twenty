import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isCreatingSseEventStreamState = createState<boolean>({
  key: 'isCreatingSseEventStreamState',
  defaultValue: false,
});
