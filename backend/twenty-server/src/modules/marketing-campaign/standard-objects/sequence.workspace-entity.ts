import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_SEQUENCE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum SequenceStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export class SequenceWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  status: SequenceStatus;
  targetRole: string | null;
  stepCount: number;
  enrolledCount: number;
  completedCount: number;
  searchVector: string;
}
