import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const shouldDestroyEventStreamState = createStateV2<boolean>({
  key: 'shouldDestroyEventStreamState',
  defaultValue: false,
});
