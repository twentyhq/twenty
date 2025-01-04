import { createState } from '@ui/utilities/state/utils/createState';

export const isAppWaitingForFreshObjectMetadataState = createState<boolean>({
  key: 'isAppWaitingForFreshObjectMetadataState',
  defaultValue: false,
});
