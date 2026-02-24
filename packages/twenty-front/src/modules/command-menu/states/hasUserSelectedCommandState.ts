import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const hasUserSelectedCommandState = createState({
  key: 'hasUserSelectedCommandState',
  defaultValue: false,
});
