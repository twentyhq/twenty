import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const HANDLE_FIELD_NAME = 'handle';

export const SEARCH_FIELDS_FOR_CALENDAR_EVENT_PARTICIPANT: FieldTypeAndNameMetadata[] =
  [{ name: HANDLE_FIELD_NAME, type: FieldMetadataType.TEXT }];

export enum CalendarEventParticipantResponseStatus {
  NEEDS_ACTION = 'NEEDS_ACTION',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  ACCEPTED = 'ACCEPTED',
}

export class CalendarEventParticipantWorkspaceEntity extends BaseWorkspaceEntity {
  handle: string | null;
  displayName: string | null;
  isOrganizer: boolean;
  responseStatus: string;
  calendarEvent: EntityRelation<CalendarEventWorkspaceEntity>;
  calendarEventId: string;
  person: EntityRelation<PersonWorkspaceEntity> | null;
  personId: string | null;
  workspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  workspaceMemberId: string | null;
}
