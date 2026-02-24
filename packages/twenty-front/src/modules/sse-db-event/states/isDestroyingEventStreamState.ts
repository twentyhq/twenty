import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isDestroyingEventStreamState = createStateV2<boolean>({
  key: 'isDestroyingEventStreamState',
  defaultValue: false,
});
