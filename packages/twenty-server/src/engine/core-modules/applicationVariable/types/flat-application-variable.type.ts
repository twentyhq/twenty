import { type ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export type FlatApplicationVariable = FlatEntityFrom<ApplicationVariableEntity>;
