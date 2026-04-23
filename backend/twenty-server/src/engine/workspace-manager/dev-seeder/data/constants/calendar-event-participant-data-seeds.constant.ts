import { CALENDAR_EVENT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import {
  WORKSPACE_MEMBER_DATA_SEED_IDS,
  getWorkspaceMemberDataSeeds,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

export type CalendarEventParticipantDataSeed = {
  id: string;
  calendarEventId: string;
  handle: string;
  displayName: string;
  isOrganizer: boolean;
  responseStatus: CalendarEventParticipantResponseStatus;
  personId: string | null;
  workspaceMemberId: string | null;
};

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEED_COLUMNS = [
  'id',
  'calendarEventId',
  'handle',
  'displayName',
  'isOrganizer',
  'responseStatus',
  'personId',
  'workspaceMemberId',
];

const GENERATE_CALENDAR_EVENT_PARTICIPANT_IDS = (): Record<string, string> => {
  const PARTICIPANT_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 2000; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    PARTICIPANT_IDS[`ID_${INDEX}`] =
      `20202020-${HEX_INDEX}-4e7c-8001-123456789def`;
  }

  return PARTICIPANT_IDS;
};

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS =
  GENERATE_CALENDAR_EVENT_PARTICIPANT_IDS();

const FAKE_PARTICIPANTS = [
  { name: 'Alex Johnson', email: 'alex.johnson@company.com' },
  { name: 'Sarah Williams', email: 'sarah.williams@company.com' },
  { name: 'Michael Chen', email: 'michael.chen@company.com' },
  { name: 'Emily Davis', email: 'emily.davis@company.com' },
  { name: 'David Rodriguez', email: 'david.rodriguez@company.com' },
  { name: 'Lisa Anderson', email: 'lisa.anderson@company.com' },
  { name: 'James Wilson', email: 'james.wilson@company.com' },
  { name: 'Jennifer Martinez', email: 'jennifer.martinez@company.com' },
  { name: 'Robert Taylor', email: 'robert.taylor@company.com' },
  { name: 'Maria Garcia', email: 'maria.garcia@company.com' },
];

type EventParticipantData = {
  handle: string;
  displayName: string;
  personId: string | null;
  workspaceMemberId: string | null;
};

const GET_RANDOM_FAKE_PARTICIPANT = () => {
  return FAKE_PARTICIPANTS[
    Math.floor(Math.random() * FAKE_PARTICIPANTS.length)
  ];
};

const FIND_UNUSED_PERSON_ID = (
  personIds: string[],
  usedPersonIds: Set<string>,
): string | null => {
  const AVAILABLE_IDS = personIds.filter((id) => !usedPersonIds.has(id));

  if (AVAILABLE_IDS.length === 0) return null;

  return AVAILABLE_IDS[Math.floor(Math.random() * AVAILABLE_IDS.length)];
};

const FIND_UNUSED_WORKSPACE_MEMBER_ID = (
  workspaceMemberIds: string[],
  usedWorkspaceMemberIds: Set<string>,
): string | null => {
  const AVAILABLE_IDS = workspaceMemberIds.filter(
    (id) => !usedWorkspaceMemberIds.has(id),
  );

  if (AVAILABLE_IDS.length === 0) return null;

  return AVAILABLE_IDS[Math.floor(Math.random() * AVAILABLE_IDS.length)];
};

const CREATE_PERSON_EVENT_PARTICIPANT = (
  personIds: string[],
  usedPersonIds: Set<string>,
): EventParticipantData | null => {
  const PERSON_ID = FIND_UNUSED_PERSON_ID(personIds, usedPersonIds);

  if (!PERSON_ID) return null;

  usedPersonIds.add(PERSON_ID);
  const PERSON_INDEX = personIds.indexOf(PERSON_ID) + 1;

  return {
    handle: `person${PERSON_INDEX}@company.com`,
    displayName: `Person ${PERSON_INDEX}`,
    personId: PERSON_ID,
    workspaceMemberId: null,
  };
};

const CREATE_WORKSPACE_MEMBER_EVENT_PARTICIPANT = (
  workspaceMemberIds: string[],
  usedWorkspaceMemberIds: Set<string>,
): EventParticipantData | null => {
  const WORKSPACE_MEMBER_ID = FIND_UNUSED_WORKSPACE_MEMBER_ID(
    workspaceMemberIds,
    usedWorkspaceMemberIds,
  );

  if (!WORKSPACE_MEMBER_ID) return null;

  usedWorkspaceMemberIds.add(WORKSPACE_MEMBER_ID);

  switch (WORKSPACE_MEMBER_ID) {
    case WORKSPACE_MEMBER_DATA_SEED_IDS.TIM:
      return {
        handle: 'tim@apple.com',
        displayName: 'Tim Apple',
        personId: null,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      };
    case WORKSPACE_MEMBER_DATA_SEED_IDS.JONY:
      return {
        handle: 'jony.ive@apple.com',
        displayName: 'Jony Ive',
        personId: null,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      };
    case WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL:
      return {
        handle: 'phil.schiller@apple.com',
        displayName: 'Phil Schiller',
        personId: null,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      };
    default:
      return {
        handle: 'member@company.com',
        displayName: 'Workspace Member',
        personId: null,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      };
  }
};

const CREATE_FAKE_EVENT_PARTICIPANT = (): EventParticipantData => {
  const FAKE = GET_RANDOM_FAKE_PARTICIPANT();

  return {
    handle: FAKE.email,
    displayName: FAKE.name,
    personId: null,
    workspaceMemberId: null,
  };
};

const CREATE_EVENT_PARTICIPANT_DATA = (
  personIds: string[],
  workspaceMemberIds: string[],
  usedPersonIds: Set<string>,
  usedWorkspaceMemberIds: Set<string>,
): EventParticipantData => {
  const PARTICIPANT_TYPE = Math.random();

  // Try person participant (40% chance)
  if (PARTICIPANT_TYPE < 0.4) {
    const PERSON_PARTICIPANT = CREATE_PERSON_EVENT_PARTICIPANT(
      personIds,
      usedPersonIds,
    );

    if (PERSON_PARTICIPANT) return PERSON_PARTICIPANT;
  }

  // Try workspace member participant (20% chance, 0.4-0.6 range)
  if (PARTICIPANT_TYPE >= 0.4 && PARTICIPANT_TYPE < 0.6) {
    const WORKSPACE_PARTICIPANT = CREATE_WORKSPACE_MEMBER_EVENT_PARTICIPANT(
      workspaceMemberIds,
      usedWorkspaceMemberIds,
    );

    if (WORKSPACE_PARTICIPANT) return WORKSPACE_PARTICIPANT;
  }

  // Fallback to fake participant
  return CREATE_FAKE_EVENT_PARTICIPANT();
};

const GET_PARTICIPANT_COUNT = (): number => {
  const RAND = Math.random();

  if (RAND < 0.2) return 1; // 20% - single participant
  if (RAND < 0.5) return 2; // 30% - two participants
  if (RAND < 0.8) return 3; // 30% - three participants

  return 4; // 20% - four participants
};

const GET_RESPONSE_STATUS = (
  isOrganizer: boolean,
): CalendarEventParticipantResponseStatus => {
  if (isOrganizer) {
    return CalendarEventParticipantResponseStatus.ACCEPTED;
  }

  const RESPONSE_RAND = Math.random();

  if (RESPONSE_RAND < 0.7)
    return CalendarEventParticipantResponseStatus.ACCEPTED;
  if (RESPONSE_RAND < 0.85)
    return CalendarEventParticipantResponseStatus.TENTATIVE;
  if (RESPONSE_RAND < 0.95)
    return CalendarEventParticipantResponseStatus.NEEDS_ACTION;

  return CalendarEventParticipantResponseStatus.DECLINED;
};

const CREATE_EVENT_PARTICIPANTS = (
  eventId: string,
  personIds: string[],
  workspaceMemberIds: string[],
  participantIndex: number,
): { participants: CalendarEventParticipantDataSeed[]; nextIndex: number } => {
  const PARTICIPANTS: CalendarEventParticipantDataSeed[] = [];
  const PARTICIPANT_COUNT = GET_PARTICIPANT_COUNT();

  const USED_PERSON_IDS = new Set<string>();
  const USED_WORKSPACE_MEMBER_IDS = new Set<string>();

  for (let I = 0; I < PARTICIPANT_COUNT; I++) {
    const IS_ORGANIZER = I === 0;

    const PARTICIPANT_DATA = CREATE_EVENT_PARTICIPANT_DATA(
      personIds,
      workspaceMemberIds,
      USED_PERSON_IDS,
      USED_WORKSPACE_MEMBER_IDS,
    );

    const RESPONSE_STATUS = GET_RESPONSE_STATUS(IS_ORGANIZER);

    PARTICIPANTS.push({
      id: CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS[`ID_${participantIndex}`],
      calendarEventId: eventId,
      handle: PARTICIPANT_DATA.handle,
      displayName: PARTICIPANT_DATA.displayName,
      isOrganizer: IS_ORGANIZER,
      responseStatus: RESPONSE_STATUS,
      personId: PARTICIPANT_DATA.personId,
      workspaceMemberId: PARTICIPANT_DATA.workspaceMemberId,
    });

    participantIndex++;
  }

  return { participants: PARTICIPANTS, nextIndex: participantIndex };
};

const GENERATE_CALENDAR_EVENT_PARTICIPANT_SEEDS = (
  workspaceId: string,
): CalendarEventParticipantDataSeed[] => {
  const PARTICIPANT_SEEDS: CalendarEventParticipantDataSeed[] = [];
  let PARTICIPANT_INDEX = 1;

  const EVENT_IDS = Object.keys(CALENDAR_EVENT_DATA_SEED_IDS).map(
    (key) =>
      CALENDAR_EVENT_DATA_SEED_IDS[
        key as keyof typeof CALENDAR_EVENT_DATA_SEED_IDS
      ],
  );

  const PERSON_IDS = Object.keys(PERSON_DATA_SEED_IDS).map(
    (key) => PERSON_DATA_SEED_IDS[key as keyof typeof PERSON_DATA_SEED_IDS],
  );
  const WORKSPACE_MEMBER_IDS = getWorkspaceMemberDataSeeds(workspaceId).map(
    (member) => member.id,
  );

  for (const EVENT_ID of EVENT_IDS) {
    const RESULT = CREATE_EVENT_PARTICIPANTS(
      EVENT_ID,
      PERSON_IDS,
      WORKSPACE_MEMBER_IDS,
      PARTICIPANT_INDEX,
    );

    PARTICIPANT_SEEDS.push(...RESULT.participants);
    PARTICIPANT_INDEX = RESULT.nextIndex;
  }

  return PARTICIPANT_SEEDS;
};

export const getCalendarEventParticipantDataSeeds = (
  workspaceId: string,
): CalendarEventParticipantDataSeed[] => {
  return GENERATE_CALENDAR_EVENT_PARTICIPANT_SEEDS(workspaceId);
};
