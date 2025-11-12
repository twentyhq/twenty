import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { APPLICATION_ENTITY_RELATION_PROPERTIES } from 'src/engine/core-modules/application/constants/application-entity-relation-properties.constant';
import { FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

export const fromApplicationEntityToFlatApplication = (
  applicationEntity: ApplicationEntity,
): FlatApplication =>
  removePropertiesFromRecord(
    applicationEntity,
    APPLICATION_ENTITY_RELATION_PROPERTIES,
  );
