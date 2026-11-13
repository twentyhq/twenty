import { type EntityManager, Not } from 'typeorm';

import { UserEntity } from 'src/engine/core-modules/user/user.entity';

export const isLastServerAdminWithOtherUsers = async ({
  manager,
  userId,
}: {
  manager: EntityManager;
  userId: string;
}): Promise<boolean> => {
  const serverAdmins = await manager.find(UserEntity, {
    select: { id: true },
    where: { canAccessFullAdminPanel: true },
    lock: { mode: 'pessimistic_write' },
  });

  const isLastServerAdmin =
    serverAdmins.length === 1 && serverAdmins[0].id === userId;

  if (!isLastServerAdmin) {
    return false;
  }

  return manager.exists(UserEntity, { where: { id: Not(userId) } });
};
