import { createState } from '@/ui/utilities/state/utils/createState';

export const sseEventStreamIdState = createState<string | null>({
  key: 'sseEventStreamIdState',
  defaultValue: null,
});
