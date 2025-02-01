import { createState } from "twenty-shared";

export const isDeveloperDefaultSignInPrefilledState = createState<boolean>({
  key: 'isDeveloperDefaultSignInPrefilledState',
  defaultValue: false,
});
