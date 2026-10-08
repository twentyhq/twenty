import { SetMetadata } from '@nestjs/common';

import { ALLOW_SUSPENDED_WORKSPACE_KEY } from 'src/engine/guards/constants/allow-suspended-workspace-key.constant';

export const AllowSuspendedWorkspace = () =>
  SetMetadata(ALLOW_SUSPENDED_WORKSPACE_KEY, true);
