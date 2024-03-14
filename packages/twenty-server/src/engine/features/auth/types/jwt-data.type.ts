import { User } from 'src/engine/features/user/user.entity';
import { Workspace } from 'src/engine/features/workspace/workspace.entity';

export type JwtData = {
  user?: User | undefined;
  workspace: Workspace;
};
