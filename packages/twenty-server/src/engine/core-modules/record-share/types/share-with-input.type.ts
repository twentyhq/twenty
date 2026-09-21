import { type RecordShareAccessLevel } from 'twenty-shared/types';

export type ShareWithInput = {
  workspaceMemberId?: string;
  roleId?: string;
  everyone?: boolean;
  accessLevel: RecordShareAccessLevel;
};
