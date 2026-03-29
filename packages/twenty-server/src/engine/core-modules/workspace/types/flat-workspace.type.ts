import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type WORKSPACE_ENTITY_NON_CACHED_PROPERTIES } from 'src/engine/core-modules/workspace/constants/workspace-entity-non-cached-properties.constant';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type WorkspaceEntityNonCachedProperties =
  (typeof WORKSPACE_ENTITY_NON_CACHED_PROPERTIES)[number];

type WorkspaceCachedFields = Omit<
  WorkspaceEntity,
  WorkspaceEntityNonCachedProperties
>;

export type FlatWorkspace = Omit<
  WorkspaceCachedFields,
  keyof CastRecordTypeOrmDatePropertiesToString<WorkspaceCachedFields>
> &
  CastRecordTypeOrmDatePropertiesToString<WorkspaceCachedFields>;
