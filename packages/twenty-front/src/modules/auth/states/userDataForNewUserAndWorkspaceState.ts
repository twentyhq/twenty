import { createState } from 'twenty-ui/utilities';

export const userDataForNewUserAndWorkspaceState = createState<{
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
} | null>({
  key: 'userDataForNewUserAndWorkspace',
  defaultValue: null,
});
