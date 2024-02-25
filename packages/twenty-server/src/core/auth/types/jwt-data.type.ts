import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';

export type JwtData = {
  user?: User | undefined;
  workspace: Workspace;
};
