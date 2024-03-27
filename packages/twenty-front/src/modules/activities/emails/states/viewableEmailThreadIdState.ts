import { createState } from 'twenty-ui';

export const viewableEmailThreadIdState = createState<string | null>({
  key: 'viewableEmailThreadIdState',
  defaultValue: null,
});
