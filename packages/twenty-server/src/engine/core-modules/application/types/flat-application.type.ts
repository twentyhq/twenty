import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationEntityRelationProperties } from 'src/engine/core-modules/application/types/application-entity-relation-properties.type';

export type FlatApplication = Omit<
  ApplicationEntity,
  ApplicationEntityRelationProperties
> & {
  // Computed by the flat application cache, read them through getApplicationRuntimeRoleId
  runtimeRoleId?: string | null;
  isGrantExempt?: boolean;
};
