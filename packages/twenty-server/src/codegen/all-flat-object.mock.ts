import { ATTACHMENT_FLAT_OBJECT_MOCK } from 'src/codegen/attachment-flat-object.mock';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/codegen/company-flat-object.mock';
import { NOTE_FLAT_OBJECT_MOCK } from 'src/codegen/note-flat-object.mock';
import { NOTETARGET_FLAT_OBJECT_MOCK } from 'src/codegen/notetarget-flat-object.mock';
import { OPPORTUNITY_FLAT_OBJECT_MOCK } from 'src/codegen/opportunity-flat-object.mock';
import { PERSON_FLAT_OBJECT_MOCK } from 'src/codegen/person-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/codegen/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/codegen/rocket-flat-object.mock';
import { TASK_FLAT_OBJECT_MOCK } from 'src/codegen/task-flat-object.mock';
import { TASKTARGET_FLAT_OBJECT_MOCK } from 'src/codegen/tasktarget-flat-object.mock';
import { TIMELINEACTIVITY_FLAT_OBJECT_MOCK } from 'src/codegen/timelineactivity-flat-object.mock';

export const ALL_FLAT_OBJECT_MOCKS_RECORD = {
  TIMELINEACTIVITY_FLAT_OBJECT_MOCK,
  NOTETARGET_FLAT_OBJECT_MOCK,
  OPPORTUNITY_FLAT_OBJECT_MOCK,
  PERSON_FLAT_OBJECT_MOCK,
  TASK_FLAT_OBJECT_MOCK,
  TASKTARGET_FLAT_OBJECT_MOCK,
  PET_FLAT_OBJECT_MOCK,
  ROCKET_FLAT_OBJECT_MOCK,
  NOTE_FLAT_OBJECT_MOCK,
  COMPANY_FLAT_OBJECT_MOCK,
  ATTACHMENT_FLAT_OBJECT_MOCK,
} as const;

export const ALL_FLAT_OBJECT_MOCKS_ARRAY = Object.values(
  ALL_FLAT_OBJECT_MOCKS_RECORD,
);
