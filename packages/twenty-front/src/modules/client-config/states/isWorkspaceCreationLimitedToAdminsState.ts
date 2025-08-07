import { createState } from 'twenty-ui/utilities';
export const isWorkspaceCreationLimitedToAdminsState = createState<boolean>({
  key: 'isWorkspaceCreationLimitedToAdmins',
  defaultValue: false,
});
