import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type FlatUser } from 'src/engine/core-modules/user/types/flat-user.type';

export const fromUserEntityToFlat = (entity: UserEntity): FlatUser => ({
  id: entity.id,
  firstName: entity.firstName,
  lastName: entity.lastName,
  email: entity.email,
  isEmailVerified: entity.isEmailVerified,
  disabled: entity.disabled,
  canImpersonate: entity.canImpersonate,
  canAccessFullAdminPanel: entity.canAccessFullAdminPanel,
  locale: entity.locale,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  deletedAt: entity.deletedAt?.toISOString(),
});
