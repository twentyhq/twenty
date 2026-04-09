import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_EMAIL_TEMPLATE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class EmailTemplateWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  subject: string;
  content: string;
  contentHtml: string | null;
  preheader: string | null;
  category: string | null;
  isActive: boolean;
  variables: string | null;
  searchVector: string;
}
