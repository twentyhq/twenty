import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationEntityRelationProperties } from 'src/engine/core-modules/application/types/application-entity-relation-properties.type';
import { type MakeWasRemovedInUpgradePropertiesOptional } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';

export type FlatApplication = MakeWasRemovedInUpgradePropertiesOptional<
  Omit<ApplicationEntity, ApplicationEntityRelationProperties>
>;
