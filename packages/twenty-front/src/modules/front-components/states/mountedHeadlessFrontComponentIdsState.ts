import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const mountedHeadlessFrontComponentIdsState = createState<Set<string>>({
  key: 'mountedHeadlessFrontComponentIdsState',
  defaultValue: new Set(),
});
