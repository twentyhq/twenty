import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';

import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';

// Resolving a repository for an object a workspace never provisioned throws:
// TwentyOrmV2Exception(UNKNOWN_OBJECT) on the ORM v2 path, and (historically)
// TypeORM's EntityMetadataNotFoundError. Upgrade commands use this to skip such
// workspaces cleanly instead of aborting the whole upgrade.
export const isWorkspaceObjectNotFoundError = (error: unknown): boolean =>
  error instanceof EntityMetadataNotFoundError ||
  (error instanceof TwentyOrmV2Exception &&
    error.code === TwentyOrmV2ExceptionCode.UNKNOWN_OBJECT);
