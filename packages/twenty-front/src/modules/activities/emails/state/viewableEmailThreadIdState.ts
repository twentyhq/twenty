import { createState } from '@/ui/utilities/state/utils/createState';

export const viewableEmailThreadIdState = createState<string | null>({
  key: 'viewableEmailThreadIdState',
  defaultValue: null,
});
