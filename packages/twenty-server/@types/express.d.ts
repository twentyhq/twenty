import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    workspace?: Workspace;
    cacheVersion?: string | null;
  }
}
