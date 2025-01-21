import { createState } from '@ui/utilities/state/utils/createState';

export const isCheckUserExistsQueryReadyState = createState<boolean>({
  key: 'isCheckUserExistsQueryReadyState',
  defaultValue: false,
});
