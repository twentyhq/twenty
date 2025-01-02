import { createState } from '@ui/utilities/state/utils/createState';

export const updatedObjectSlugState = createState<string>({
  key: 'updatedObjectSlugState',
  defaultValue: '',
});
