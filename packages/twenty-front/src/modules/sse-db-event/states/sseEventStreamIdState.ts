import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const sseEventStreamIdState = createState<string | null>({
  key: 'sseEventStreamIdState',
  defaultValue: null,
});
