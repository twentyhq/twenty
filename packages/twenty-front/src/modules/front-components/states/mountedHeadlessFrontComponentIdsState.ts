import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const mountedHeadlessFrontComponentIdsState = createStateV2<Set<string>>(
  {
    key: 'mountedHeadlessFrontComponentIdsState',
    defaultValue: new Set(),
  },
);
