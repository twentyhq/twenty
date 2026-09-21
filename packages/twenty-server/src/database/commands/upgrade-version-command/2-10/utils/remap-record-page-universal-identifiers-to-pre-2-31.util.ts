import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

// The 2-31 record-page reconcile re-owns every standard record-page view,
// view field, view field group, page layout, tab and widget onto derived
// universal identifiers, and the shared constants now resolve to that derived
// scheme. Upgrade commands registered BEFORE 2-31 run on workspaces whose rows
// still hold the pre-derivation literals, so any standard record-page entity
// they read from the standard definitions must be remapped back to the
// pre-2.31 literals before being compared with or committed to the workspace.
const CALENDAR_EVENT_RECORD_PAGE_VIEW =
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields;
const CALL_RECORDING_RECORD_PAGE_VIEW =
  STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields;
const MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW =
  STANDARD_OBJECTS.messageCampaign.views.messageCampaignRecordPageFields;
const CALENDAR_EVENT_RECORD_PAGE_LAYOUT =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage;
const CALL_RECORDING_RECORD_PAGE_LAYOUT =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage;
const MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage;

export const PRE_2_31_RECORD_PAGE_UNIVERSAL_IDENTIFIER_BY_DERIVED: Record<
  string,
  string
> = {
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.universalIdentifier]:
    'c73668d1-022d-4eaf-b825-4e2548180db6',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFieldGroups.general.universalIdentifier]:
    'aeadeb9e-3673-4c0c-8845-f59cb1e6ca42',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFieldGroups.system.universalIdentifier]:
    'eb1aadeb-7feb-44d1-9f9a-e9929e8690fc',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.title.universalIdentifier]:
    'd17fc76f-2c3a-4c84-8249-27227bf71638',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.startsAt.universalIdentifier]:
    '7bbd3744-d870-4704-882c-071732ed23d9',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.endsAt.universalIdentifier]:
    'ed7ca7e9-c8b3-4516-be4c-6491a27af847',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.isFullDay.universalIdentifier]:
    '5d8f89b7-ec9e-41d6-9efe-96f9c32e6c20',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.isCanceled.universalIdentifier]:
    'a01f490d-cf67-4458-801e-13d81e74b45a',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.conferenceLink
    .universalIdentifier]: '5ad748ae-e1bb-47bb-ac34-d82663c31b6e',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.location.universalIdentifier]:
    '66c73e74-56e6-40c3-b776-0081ee757b8a',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.description.universalIdentifier]:
    'a09449be-b23f-48d4-b0dc-0bd36813220a',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.externalCreatedAt
    .universalIdentifier]: '689c3eba-bedf-4a52-b9f1-3e34ce718251',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.externalUpdatedAt
    .universalIdentifier]: '7823fa45-8cba-47ba-8dfb-5841bef44fc6',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.iCalUid.universalIdentifier]:
    '8be763dd-6217-47fb-a7d2-ac223af881d2',
  [CALENDAR_EVENT_RECORD_PAGE_VIEW.viewFields.conferenceSolution
    .universalIdentifier]: '795905b6-c6f8-42cf-b8ea-3e5b6d32145f',
  [CALENDAR_EVENT_RECORD_PAGE_LAYOUT.universalIdentifier]:
    'b9b10e40-9ce2-4704-8ac6-c6e92e2563c1',
  [CALENDAR_EVENT_RECORD_PAGE_LAYOUT.tabs.home.universalIdentifier]:
    'c80a0407-25f5-438b-8c32-1ce9cde95657',
  [CALENDAR_EVENT_RECORD_PAGE_LAYOUT.tabs.home.widgets.fields
    .universalIdentifier]: 'fea5c1c2-0c1d-4d2e-a14c-a10108b0db0f',
  [CALENDAR_EVENT_RECORD_PAGE_LAYOUT.tabs.home.widgets.participants
    .universalIdentifier]: '6faea537-02fa-4993-957c-f2e1654986bd',
  [CALENDAR_EVENT_RECORD_PAGE_LAYOUT.tabs.home.widgets.callRecordings
    .universalIdentifier]: 'f473b435-e2d4-4928-8d90-1db0094389f7',
  [CALENDAR_EVENT_RECORD_PAGE_LAYOUT.tabs.timeline.universalIdentifier]:
    '9cb35d6d-932d-49bc-b303-593116ca5343',
  [CALENDAR_EVENT_RECORD_PAGE_LAYOUT.tabs.timeline.widgets.timeline
    .universalIdentifier]: '8273e2c4-cc17-4d3e-ba08-5bac612b5d44',
  [CALL_RECORDING_RECORD_PAGE_VIEW.universalIdentifier]:
    '99fa8b47-3b11-4f9b-8fbc-e67a9e1da682',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFieldGroups.general.universalIdentifier]:
    '068426eb-dd20-49b0-ae9c-68727f3be2fb',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.title.universalIdentifier]:
    '6308d574-8579-4cf2-a020-c208df97cf3e',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.status.universalIdentifier]:
    '93483569-fcd2-46cf-b576-9f0318ad2b3b',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.recordingRequestStatus
    .universalIdentifier]: '364a90b1-e9aa-4606-996b-46e579ebeb28',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.startedAt.universalIdentifier]:
    '3fd00fbb-c153-45e3-b6e6-43d18d34052a',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.endedAt.universalIdentifier]:
    'ba8c8d41-c112-4173-b927-5b5c5a5c047b',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.video.universalIdentifier]:
    'acc54ade-cd26-4be2-9391-a42715ad1523',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.audio.universalIdentifier]:
    '9445a547-1d1e-4da3-916b-2c2269c951c9',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.transcript.universalIdentifier]:
    '782c97f6-e6b1-472b-8992-bbb60d25791b',
  [CALL_RECORDING_RECORD_PAGE_VIEW.viewFields.summary.universalIdentifier]:
    'a0ace064-cc72-4631-ade3-07cdded86b0e',
  [CALL_RECORDING_RECORD_PAGE_LAYOUT.universalIdentifier]:
    'fa475fb3-3fe4-4ab8-8320-495eba5b2e58',
  [CALL_RECORDING_RECORD_PAGE_LAYOUT.tabs.home.universalIdentifier]:
    'f61be659-f6f1-4f1f-b3f9-113370740f1b',
  [CALL_RECORDING_RECORD_PAGE_LAYOUT.tabs.home.widgets.fields
    .universalIdentifier]: 'e490d2dd-5b69-4518-b867-9dde815f9cb6',
  [CALL_RECORDING_RECORD_PAGE_LAYOUT.tabs.timeline.universalIdentifier]:
    '9fb360fa-bc10-430c-8425-25d4e9da4386',
  [CALL_RECORDING_RECORD_PAGE_LAYOUT.tabs.timeline.widgets.timeline
    .universalIdentifier]: '9347305a-73de-4651-a116-c67b2706beda',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW.universalIdentifier]:
    '20202020-a009-4a09-8a09-fa9de11ca901',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW.viewFieldGroups.stats.universalIdentifier]:
    '20202020-a009-4a09-8a09-fa9de11ca902',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW.viewFields.status.universalIdentifier]:
    '20202020-af09-4a09-8a09-fa9de11ca903',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW.viewFields.sentAt.universalIdentifier]:
    '20202020-af09-4a09-8a09-fa9de11ca904',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW.viewFields.sentCount.universalIdentifier]:
    '20202020-af09-4a09-8a09-fa9de11ca905',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW.viewFields.failedCount
    .universalIdentifier]: '20202020-af09-4a09-8a09-fa9de11ca906',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW.viewFields.bouncedCount
    .universalIdentifier]: '20202020-af09-4a09-8a09-fa9de11ca907',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_VIEW.viewFields.complainedCount
    .universalIdentifier]: '20202020-af09-4a09-8a09-fa9de11ca908',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT.universalIdentifier]:
    '8704b091-94bd-4f8f-82b1-e2f3eab92217',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT.tabs.home.universalIdentifier]:
    'f16785cd-a5b7-4ec1-8f20-ff8b80fb94b9',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT.tabs.home.widgets.fields
    .universalIdentifier]: '886296e0-a5b6-4054-b450-ad624180c2ef',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT.tabs.home.widgets.details
    .universalIdentifier]: 'ce2f82cc-9340-45a2-90a0-c34207e8e3b0',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT.tabs.home.widgets.recipients
    .universalIdentifier]: 'b667f20a-1d38-453e-b888-3ecab00a1044',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT.tabs.home.widgets.list
    .universalIdentifier]: 'b04fb8a5-f471-49a7-b82c-8434ea8276c5',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT.tabs.composer.universalIdentifier]:
    '5f21c19d-6c3e-4b8a-9d47-1e8f02a63b71',
  [MESSAGE_CAMPAIGN_RECORD_PAGE_LAYOUT.tabs.composer.widgets.messageCampaign
    .universalIdentifier]: '9c74d8e2-0b5f-4a19-8630-57d2ba14ce92',
};

export const toPre231RecordPageUniversalIdentifier = (
  universalIdentifier: string,
): string =>
  PRE_2_31_RECORD_PAGE_UNIVERSAL_IDENTIFIER_BY_DERIVED[universalIdentifier] ??
  universalIdentifier;

export const remapRecordPageUniversalIdentifiersToPre231 = <T>(
  flatEntity: T,
): T => {
  let serialized = JSON.stringify(flatEntity);

  for (const [
    derivedUniversalIdentifier,
    pre231UniversalIdentifier,
  ] of Object.entries(PRE_2_31_RECORD_PAGE_UNIVERSAL_IDENTIFIER_BY_DERIVED)) {
    serialized = serialized
      .split(derivedUniversalIdentifier)
      .join(pre231UniversalIdentifier);
  }

  return JSON.parse(serialized) as T;
};
