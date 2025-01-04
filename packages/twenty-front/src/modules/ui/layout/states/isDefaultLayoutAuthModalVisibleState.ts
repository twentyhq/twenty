import { createState } from '@ui/utilities/state/utils/createState';

export const isDefaultLayoutAuthModalVisibleState = createState<boolean>({
  key: 'isDefaultLayoutAuthModalVisibleState',
  defaultValue: true,
});
