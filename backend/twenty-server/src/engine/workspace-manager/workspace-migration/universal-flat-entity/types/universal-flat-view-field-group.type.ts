import { type ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatViewFieldGroup = UniversalFlatEntityFrom<
  ViewFieldGroupEntity,
  'viewFieldGroup'
>;
