import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export type JwtData = {
  user?: User | undefined;
  workspace: Workspace;
};
