import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationEntityRelationProperties } from 'src/engine/core-modules/application/types/application-entity-relation-properties.type';

export type FlatApplication = Omit<
  ApplicationEntity,
  ApplicationEntityRelationProperties
>;
