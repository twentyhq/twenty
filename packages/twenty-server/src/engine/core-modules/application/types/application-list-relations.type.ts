import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationListRelationProperties } from 'src/engine/core-modules/application/types/application-list-relation-properties.type';

export type ApplicationListRelations = Partial<
  Pick<ApplicationEntity, ApplicationListRelationProperties>
>;
