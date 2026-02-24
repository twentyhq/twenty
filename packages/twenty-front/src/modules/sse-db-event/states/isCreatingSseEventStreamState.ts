import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isCreatingSseEventStreamState = createStateV2<boolean>({
  key: 'isCreatingSseEventStreamState',
  defaultValue: false,
});
