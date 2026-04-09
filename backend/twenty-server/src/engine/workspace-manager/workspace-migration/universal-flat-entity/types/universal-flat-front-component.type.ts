import { type FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatFrontComponent = UniversalFlatEntityFrom<
  FrontComponentEntity,
  'frontComponent'
>;
