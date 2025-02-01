import { createState } from "twenty-shared";

export const isAppWaitingForFreshObjectMetadataState = createState<boolean>({
  key: 'isAppWaitingForFreshObjectMetadataState',
  defaultValue: false,
});
