import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type USER_WORKSPACE_ENTITY_NON_CACHED_PROPERTIES } from 'src/engine/core-modules/user-workspace/constants/user-workspace-entity-non-cached-properties.constant';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

type UserWorkspaceEntityNonCachedProperties =
  (typeof USER_WORKSPACE_ENTITY_NON_CACHED_PROPERTIES)[number];

type UserWorkspaceCachedFields = Omit<
  UserWorkspaceEntity,
  UserWorkspaceEntityNonCachedProperties
>;

export type FlatUserWorkspace = Omit<
  UserWorkspaceCachedFields,
  keyof CastRecordTypeOrmDatePropertiesToString<UserWorkspaceCachedFields>
> &
  CastRecordTypeOrmDatePropertiesToString<UserWorkspaceCachedFields>;
