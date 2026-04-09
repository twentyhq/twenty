import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ProjectWorkspaceEntity } from 'src/modules/project/standard-objects/project.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_PROJECT_TASK: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class ProjectTaskWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  status: string;
  priority: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  estimatedHours: number | null;
  actualHours: number;
  progress: number;
  isMilestone: boolean;
  parentTaskId: string | null;
  project: EntityRelation<ProjectWorkspaceEntity> | null;
  projectId: string | null;
  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;
  searchVector: string;
}
