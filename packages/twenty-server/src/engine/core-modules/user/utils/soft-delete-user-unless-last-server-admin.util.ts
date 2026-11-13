import { Logger } from '@nestjs/common';

import { type EntityManager } from 'typeorm';

import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { isLastServerAdminWithOtherUsers } from 'src/engine/core-modules/user/utils/is-last-server-admin-with-other-users.util';

const logger = new Logger('softDeleteUserUnlessLastServerAdmin');

export const softDeleteUserUnlessLastServerAdmin = ({
  manager,
  userId,
}: {
  manager: EntityManager;
  userId: string;
}): Promise<boolean> =>
  manager.transaction(async (transactionManager) => {
    const isLastServerAdmin = await isLastServerAdminWithOtherUsers({
      manager: transactionManager,
      userId,
    });

    if (isLastServerAdmin) {
      logger.warn(`Kept user ${userId}: last server admin`);

      return false;
    }

    await transactionManager.softDelete(UserEntity, { id: userId });

    return true;
  });
