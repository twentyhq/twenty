import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type SequenceWorkspaceEntity } from 'src/modules/marketing-campaign/standard-objects/sequence.workspace-entity';
import { type EmailTemplateWorkspaceEntity } from 'src/modules/marketing-campaign/standard-objects/email-template.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_SEQUENCE_STEP: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class SequenceStepWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  stepNumber: number;
  delayDays: number;
  emailTemplate: EntityRelation<EmailTemplateWorkspaceEntity> | null;
  emailTemplateId: string | null;
  sequence: EntityRelation<SequenceWorkspaceEntity> | null;
  sequenceId: string | null;
  searchVector: string;
}
