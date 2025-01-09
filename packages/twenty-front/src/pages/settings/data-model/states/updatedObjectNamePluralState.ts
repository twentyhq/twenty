import { createState } from '@ui/utilities/state/utils/createState';

export const updatedObjectNamePluralState = createState<string>({
  key: 'updatedObjectNamePluralState',
  defaultValue: '',
});
