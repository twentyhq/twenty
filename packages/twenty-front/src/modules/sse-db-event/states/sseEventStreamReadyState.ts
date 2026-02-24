import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const sseEventStreamReadyState = createState<boolean>({
  key: 'sseEventStreamReadyState',
  defaultValue: false,
});
