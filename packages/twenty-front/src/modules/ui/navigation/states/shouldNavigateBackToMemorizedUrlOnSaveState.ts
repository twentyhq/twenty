import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const shouldNavigateBackToMemorizedUrlOnSaveState =
  createStateV2<boolean>({
    key: 'shouldNavigateBackToMemorizedUrlOnSaveState',
    defaultValue: false,
  });
