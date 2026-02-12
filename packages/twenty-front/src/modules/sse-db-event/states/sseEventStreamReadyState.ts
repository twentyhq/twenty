import { createState } from '@/ui/utilities/state/utils/createState';

export const sseEventStreamReadyState = createState<boolean>({
  key: 'sseEventStreamReadyState',
  defaultValue: false,
});
