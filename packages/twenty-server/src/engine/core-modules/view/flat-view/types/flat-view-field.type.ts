import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type ViewFieldEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ViewFieldEntity,
    FieldMetadataEntity | ViewEntity | Workspace
  >;

export type FlatViewField = Omit<
  ViewFieldEntity,
  ViewFieldEntityRelationProperties
> & {
  universalIdentifier: string;
};
