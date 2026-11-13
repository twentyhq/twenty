import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { ConflictError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const SERVER_ADMINS_LOCK_NAME = 'server-admins';

@Injectable()
export class ServerAdminLockService {
  constructor(
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
  ) {}

  runExclusively<T>(callback: () => Promise<T>): Promise<T> {
    return this.runWithLock(callback, { isShared: false });
  }

  runShared<T>(callback: () => Promise<T>): Promise<T> {
    return this.runWithLock(callback, { isShared: true });
  }

  private async runWithLock<T>(
    callback: () => Promise<T>,
    { isShared }: { isShared: boolean },
  ): Promise<T> {
    const lockResult = await this.postgresAdvisoryLockService.tryWithLock(
      SERVER_ADMINS_LOCK_NAME,
      callback,
      { isShared },
    );

    if (!lockResult.acquired) {
      throw new ConflictError(
        'Another server administrator change is in progress',
        {
          userFriendlyMessage: msg`Server administrators are being updated. Try again in a moment.`,
        },
      );
    }

    return lockResult.value;
  }
}
