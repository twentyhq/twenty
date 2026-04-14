import type DataLoader from 'dataloader';

import {
  type FieldMetadataLoaderPayload,
  type IndexFieldMetadataLoaderPayload,
  type IndexMetadataLoaderPayload,
  type MorphRelationLoaderPayload,
  type ObjectMetadataLoaderPayload,
  type RelationLoaderPayload,
  type ViewFieldGroupsByViewIdLoaderPayload,
  type ViewFieldsByViewFieldGroupIdLoaderPayload,
  type ViewFieldsByViewIdLoaderPayload,
  type ViewFilterGroupsByViewIdLoaderPayload,
  type ViewFiltersByViewIdLoaderPayload,
  type ViewGroupsByViewIdLoaderPayload,
  type ViewSortsByViewIdLoaderPayload,
} from 'src/engine/dataloaders/dataloader.service';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { type ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';
import { type ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { type ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { type ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { type ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';

export interface IDataloaders {
  relationLoader: DataLoader<RelationLoaderPayload, RelationDTO | null>;

  morphRelationLoader: DataLoader<
    MorphRelationLoaderPayload,
    RelationDTO[] | null
  >;

  fieldMetadataLoader: DataLoader<
    FieldMetadataLoaderPayload,
    FieldMetadataDTO[]
  >;

  indexMetadataLoader: DataLoader<
    IndexMetadataLoaderPayload,
    IndexMetadataDTO[]
  >;

  indexFieldMetadataLoader: DataLoader<
    IndexFieldMetadataLoaderPayload,
    IndexFieldMetadataDTO[]
  >;

  objectMetadataLoader: DataLoader<
    ObjectMetadataLoaderPayload,
    ObjectMetadataDTO | null
  >;

  viewFieldGroupsByViewIdLoader: DataLoader<
    ViewFieldGroupsByViewIdLoaderPayload,
    ViewFieldGroupDTO[]
  >;

  viewFieldsByViewFieldGroupIdLoader: DataLoader<
    ViewFieldsByViewFieldGroupIdLoaderPayload,
    ViewFieldDTO[]
  >;

  viewFieldsByViewIdLoader: DataLoader<
    ViewFieldsByViewIdLoaderPayload,
    ViewFieldDTO[]
  >;

  viewFiltersByViewIdLoader: DataLoader<
    ViewFiltersByViewIdLoaderPayload,
    ViewFilterDTO[]
  >;

  viewSortsByViewIdLoader: DataLoader<
    ViewSortsByViewIdLoaderPayload,
    ViewSortDTO[]
  >;

  viewGroupsByViewIdLoader: DataLoader<
    ViewGroupsByViewIdLoaderPayload,
    ViewGroupDTO[]
  >;

  viewFilterGroupsByViewIdLoader: DataLoader<
    ViewFilterGroupsByViewIdLoaderPayload,
    ViewFilterGroupDTO[]
  >;
}
