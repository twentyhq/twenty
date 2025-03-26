import { createState } from 'twenty-ui';

export const isAppWaitingForFreshObjectMetadataState = createState<boolean>({
  key: 'isAppWaitingForFreshObjectMetadataState',
  defaultValue: false,
});
