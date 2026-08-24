import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';

import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';

// A workspace object can be absent when upgrading from a version that predates it.
// The v1 GlobalWorkspaceDataSource throws EntityMetadataNotFoundError, while the v2
// datasource throws TwentyOrmV2Exception(UNKNOWN_OBJECT). Backfill commands must treat
// both as "object not provisioned yet" and skip rather than fail the upgrade.
export const isWorkspaceObjectNotFoundError = (error: unknown): boolean =>
  error instanceof EntityMetadataNotFoundError ||
  (error instanceof TwentyOrmV2Exception &&
    error.code === TwentyOrmV2ExceptionCode.UNKNOWN_OBJECT);
