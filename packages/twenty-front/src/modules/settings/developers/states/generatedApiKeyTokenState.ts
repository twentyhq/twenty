import { createState } from '@ui/utilities/state/utils/createState';

export const apiKeyTokenState = createState<string | null>({
  key: 'apiKeyTokenState',
  defaultValue: null,
});
