import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_AUTOMATION_RULE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class AutomationRuleWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: string;
  triggerConditions: string | null;
  actionType: string;
  actionConfig: string | null;
  position: number;
  searchVector: string;
}
