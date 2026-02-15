import { createState } from '@/ui/utilities/state/utils/createState';
export const isWorkspaceCreationLimitedToServerAdminsState =
  createState<boolean>({
    key: 'isWorkspaceCreationLimitedToServerAdmins',
    defaultValue: false,
  });
