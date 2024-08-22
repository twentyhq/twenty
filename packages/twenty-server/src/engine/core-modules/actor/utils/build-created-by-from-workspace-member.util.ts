import { User } from 'src/engine/core-modules/user/user.entity';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

export const buildCreatedByFromWorkspaceMember = (
  workspaceMemberId: string,
  user: User,
) => ({
  workspaceMemberId,
  source: FieldActorSource.MANUAL,
  name: `${user.firstName} ${user.lastName}`,
});
