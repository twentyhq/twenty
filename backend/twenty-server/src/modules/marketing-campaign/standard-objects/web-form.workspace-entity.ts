import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type LandingPageWorkspaceEntity } from 'src/modules/marketing-campaign/standard-objects/landing-page.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WEB_FORM: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class WebFormWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  fields: string | null;
  submitAction: string;
  redirectUrl: string | null;
  notificationEmail: string | null;
  submissions: number;
  conversions: number;
  landingPage: EntityRelation<LandingPageWorkspaceEntity> | null;
  landingPageId: string | null;
  searchVector: string;
}
