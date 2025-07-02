// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    RawJSONScalar: any,
    BigFloat: any,
    UUID: any,
    DateTime: any,
    ID: string,
    Float: number,
    Boolean: boolean,
    Int: number,
    Position: any,
    TSVector: any,
    BigInt: any,
    Cursor: any,
    ConnectionCursor: any,
    Date: any,
}

export interface Links {
    primaryLinkLabel: (Scalars['String'] | null)
    primaryLinkUrl: (Scalars['String'] | null)
    secondaryLinks: (Scalars['RawJSONScalar'] | null)
    __typename: 'Links'
}

export interface Currency {
    amountMicros: (Scalars['BigFloat'] | null)
    currencyCode: (Scalars['String'] | null)
    __typename: 'Currency'
}

export interface FullName {
    firstName: (Scalars['String'] | null)
    lastName: (Scalars['String'] | null)
    __typename: 'FullName'
}

export interface Address {
    addressStreet1: (Scalars['String'] | null)
    addressStreet2: (Scalars['String'] | null)
    addressCity: (Scalars['String'] | null)
    addressPostcode: (Scalars['String'] | null)
    addressState: (Scalars['String'] | null)
    addressCountry: (Scalars['String'] | null)
    addressLat: (Scalars['BigFloat'] | null)
    addressLng: (Scalars['BigFloat'] | null)
    __typename: 'Address'
}

export interface Actor {
    source: (ActorSourceEnum | null)
    workspaceMemberId: (Scalars['UUID'] | null)
    name: (Scalars['String'] | null)
    context: (Scalars['RawJSONScalar'] | null)
    __typename: 'Actor'
}

export type ActorSourceEnum = 'EMAIL' | 'CALENDAR' | 'WORKFLOW' | 'API' | 'IMPORT' | 'MANUAL' | 'SYSTEM' | 'WEBHOOK'

export interface Emails {
    primaryEmail: (Scalars['String'] | null)
    additionalEmails: (Scalars['RawJSONScalar'] | null)
    __typename: 'Emails'
}

export interface Phones {
    primaryPhoneNumber: (Scalars['String'] | null)
    primaryPhoneCountryCode: (Scalars['String'] | null)
    primaryPhoneCallingCode: (Scalars['String'] | null)
    additionalPhones: (Scalars['RawJSONScalar'] | null)
    __typename: 'Phones'
}

export interface RichTextV2 {
    blocknote: (Scalars['String'] | null)
    markdown: (Scalars['String'] | null)
    __typename: 'RichTextV2'
}


/** An API key */
export interface ApiKey {
    /** ApiKey name */
    name: (Scalars['String'] | null)
    /** ApiKey expiration date */
    expiresAt: (Scalars['DateTime'] | null)
    /** ApiKey revocation date */
    revokedAt: (Scalars['DateTime'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'ApiKey'
}


/** An attachment */
export interface Attachment {
    /** Attachment name */
    name: (Scalars['String'] | null)
    /** Attachment full path */
    fullPath: (Scalars['String'] | null)
    /** Attachment type */
    type: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Attachment author */
    authorId: (Scalars['ID'] | null)
    /** Attachment author */
    author: (WorkspaceMember | null)
    /** Attachment task */
    taskId: (Scalars['ID'] | null)
    /** Attachment task */
    task: (Task | null)
    /** Attachment note */
    noteId: (Scalars['ID'] | null)
    /** Attachment note */
    note: (Note | null)
    /** Attachment person */
    personId: (Scalars['ID'] | null)
    /** Attachment person */
    person: (Person | null)
    /** Attachment company */
    companyId: (Scalars['ID'] | null)
    /** Attachment company */
    company: (Company | null)
    /** Attachment opportunity */
    opportunityId: (Scalars['ID'] | null)
    /** Attachment opportunity */
    opportunity: (Opportunity | null)
    /** Attachments Rocket */
    rocketId: (Scalars['ID'] | null)
    /** Attachments Rocket */
    rocket: (Rocket | null)
    /** Attachments Pet */
    petId: (Scalars['ID'] | null)
    /** Attachments Pet */
    pet: (Pet | null)
    /** Attachments Survey result */
    surveyResultId: (Scalars['ID'] | null)
    /** Attachments Survey result */
    surveyResult: (SurveyResult | null)
    __typename: 'Attachment'
}

export interface Pet {
    coco: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Name */
    name: (Scalars['String'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Deletion date */
    deletedAt: (Scalars['DateTime'] | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Position */
    position: (Scalars['Position'] | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    species: (PetSpeciesEnum | null)
    traits: ((PetTraitsEnum | null)[] | null)
    comments: (Scalars['String'] | null)
    age: (Scalars['Float'] | null)
    location: (Address | null)
    vetPhone: (Phones | null)
    vetEmail: (Emails | null)
    birthday: (Scalars['DateTime'] | null)
    isGoodWithKids: (Scalars['Boolean'] | null)
    pictures: (Links | null)
    averageCostOfKibblePerMonth: (Currency | null)
    makesOwnerThinkOf: (FullName | null)
    soundSwag: (PetSoundSwagEnum | null)
    bio: (Scalars['String'] | null)
    interestingFacts: ((Scalars['String'] | null)[] | null)
    extraData: (Scalars['RawJSONScalar'] | null)
    /** TimelineActivities tied to the Pet */
    timelineActivities: (TimelineActivityConnection | null)
    /** TaskTargets tied to the Pet */
    taskTargets: (TaskTargetConnection | null)
    /** NoteTargets tied to the Pet */
    noteTargets: (NoteTargetConnection | null)
    /** Favorites tied to the Pet */
    favorites: (FavoriteConnection | null)
    /** Attachments tied to the Pet */
    attachments: (AttachmentConnection | null)
    __typename: 'Pet'
}

export type PetSpeciesEnum = 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'RABBIT' | 'HAMSTER'

export type PetTraitsEnum = 'PLAYFUL' | 'FRIENDLY' | 'PROTECTIVE' | 'SHY' | 'BRAVE' | 'CURIOUS'

export type PetSoundSwagEnum = 'RATING_1' | 'RATING_2' | 'RATING_3' | 'RATING_4' | 'RATING_5'


/** Blocklist */
export interface Blocklist {
    /** Handle */
    handle: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** WorkspaceMember */
    workspaceMemberId: (Scalars['ID'] | null)
    /** WorkspaceMember */
    workspaceMember: (WorkspaceMember | null)
    __typename: 'Blocklist'
}


/** Calendar events */
export interface CalendarEvent {
    /** Title */
    title: (Scalars['String'] | null)
    /** Is canceled */
    isCanceled: (Scalars['Boolean'] | null)
    /** Is Full Day */
    isFullDay: (Scalars['Boolean'] | null)
    /** Start Date */
    startsAt: (Scalars['DateTime'] | null)
    /** End Date */
    endsAt: (Scalars['DateTime'] | null)
    /** Creation DateTime */
    externalCreatedAt: (Scalars['DateTime'] | null)
    /** Update DateTime */
    externalUpdatedAt: (Scalars['DateTime'] | null)
    /** Description */
    description: (Scalars['String'] | null)
    /** Location */
    location: (Scalars['String'] | null)
    /** iCal UID */
    iCalUID: (Scalars['String'] | null)
    /** Conference Solution */
    conferenceSolution: (Scalars['String'] | null)
    /** Meet Link */
    conferenceLink: (Links | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Calendar Channel Event Associations */
    calendarChannelEventAssociations: (CalendarChannelEventAssociationConnection | null)
    /** Event Participants */
    calendarEventParticipants: (CalendarEventParticipantConnection | null)
    __typename: 'CalendarEvent'
}


/** Calendar Channels */
export interface CalendarChannel {
    /** Handle */
    handle: (Scalars['String'] | null)
    /** Sync status */
    syncStatus: (CalendarChannelSyncStatusEnum | null)
    /** Sync stage */
    syncStage: (CalendarChannelSyncStageEnum | null)
    /** Visibility */
    visibility: (CalendarChannelVisibilityEnum | null)
    /** Is Contact Auto Creation Enabled */
    isContactAutoCreationEnabled: (Scalars['Boolean'] | null)
    /** Automatically create records for people you participated with in an event. */
    contactAutoCreationPolicy: (CalendarChannelContactAutoCreationPolicyEnum | null)
    /** Is Sync Enabled */
    isSyncEnabled: (Scalars['Boolean'] | null)
    /** Sync Cursor. Used for syncing events from the calendar provider */
    syncCursor: (Scalars['String'] | null)
    /** Last sync date */
    syncedAt: (Scalars['DateTime'] | null)
    /** Sync stage started at */
    syncStageStartedAt: (Scalars['DateTime'] | null)
    /** Throttle Failure Count */
    throttleFailureCount: (Scalars['Float'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Connected Account */
    connectedAccountId: (Scalars['ID'] | null)
    /** Connected Account */
    connectedAccount: (ConnectedAccount | null)
    /** Calendar Channel Event Associations */
    calendarChannelEventAssociations: (CalendarChannelEventAssociationConnection | null)
    __typename: 'CalendarChannel'
}


/** Sync status */
export type CalendarChannelSyncStatusEnum = 'ONGOING' | 'NOT_SYNCED' | 'ACTIVE' | 'FAILED_INSUFFICIENT_PERMISSIONS' | 'FAILED_UNKNOWN'


/** Sync stage */
export type CalendarChannelSyncStageEnum = 'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING' | 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING' | 'CALENDAR_EVENT_LIST_FETCH_ONGOING' | 'CALENDAR_EVENTS_IMPORT_PENDING' | 'CALENDAR_EVENTS_IMPORT_ONGOING' | 'FAILED'


/** Visibility */
export type CalendarChannelVisibilityEnum = 'METADATA' | 'SHARE_EVERYTHING'


/** Automatically create records for people you participated with in an event. */
export type CalendarChannelContactAutoCreationPolicyEnum = 'AS_PARTICIPANT_AND_ORGANIZER' | 'AS_PARTICIPANT' | 'AS_ORGANIZER' | 'NONE'


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociation {
    /** Event external ID */
    eventExternalId: (Scalars['String'] | null)
    /** Recurring Event ID */
    recurringEventExternalId: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Channel ID */
    calendarChannelId: (Scalars['ID'] | null)
    /** Channel ID */
    calendarChannel: (CalendarChannel | null)
    /** Event ID */
    calendarEventId: (Scalars['ID'] | null)
    /** Event ID */
    calendarEvent: (CalendarEvent | null)
    __typename: 'CalendarChannelEventAssociation'
}


/** Calendar event participants */
export interface CalendarEventParticipant {
    /** Handle */
    handle: (Scalars['String'] | null)
    /** Display Name */
    displayName: (Scalars['String'] | null)
    /** Is Organizer */
    isOrganizer: (Scalars['Boolean'] | null)
    /** Response Status */
    responseStatus: (CalendarEventParticipantResponseStatusEnum | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Event ID */
    calendarEventId: (Scalars['ID'] | null)
    /** Event ID */
    calendarEvent: (CalendarEvent | null)
    /** Person */
    personId: (Scalars['ID'] | null)
    /** Person */
    person: (Person | null)
    /** Workspace Member */
    workspaceMemberId: (Scalars['ID'] | null)
    /** Workspace Member */
    workspaceMember: (WorkspaceMember | null)
    __typename: 'CalendarEventParticipant'
}


/** Response Status */
export type CalendarEventParticipantResponseStatusEnum = 'NEEDS_ACTION' | 'DECLINED' | 'TENTATIVE' | 'ACCEPTED'


/** A company */
export interface Company {
    /** The company name */
    name: (Scalars['String'] | null)
    /** The company website URL. We use this url to fetch the company icon */
    domainName: (Links | null)
    /** Number of employees in the company */
    employees: (Scalars['Float'] | null)
    /** The company Linkedin account */
    linkedinLink: (Links | null)
    /** The company Twitter/X account */
    xLink: (Links | null)
    /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
    annualRecurringRevenue: (Currency | null)
    /** Address of the company */
    address: (Address | null)
    /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
    idealCustomerProfile: (Scalars['Boolean'] | null)
    /** Company record position */
    position: (Scalars['Position'] | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Your team member responsible for managing the company account */
    accountOwnerId: (Scalars['ID'] | null)
    /** Your team member responsible for managing the company account */
    accountOwner: (WorkspaceMember | null)
    tagline: (Scalars['String'] | null)
    introVideo: (Links | null)
    workPolicy: ((CompanyWorkPolicyEnum | null)[] | null)
    visaSponsorship: (Scalars['Boolean'] | null)
    /** People linked to the company. */
    people: (PersonConnection | null)
    /** Tasks tied to the company */
    taskTargets: (TaskTargetConnection | null)
    /** Notes tied to the company */
    noteTargets: (NoteTargetConnection | null)
    /** Opportunities linked to the company. */
    opportunities: (OpportunityConnection | null)
    /** Favorites linked to the company */
    favorites: (FavoriteConnection | null)
    /** Attachments linked to the company */
    attachments: (AttachmentConnection | null)
    /** Timeline Activities linked to the company */
    timelineActivities: (TimelineActivityConnection | null)
    __typename: 'Company'
}

export type CompanyWorkPolicyEnum = 'ON_SITE' | 'HYBRID' | 'REMOTE_WORK'


/** A connected account */
export interface ConnectedAccount {
    /** The account handle (email, username, phone number, etc.) */
    handle: (Scalars['String'] | null)
    /** The account provider */
    provider: (Scalars['String'] | null)
    /** Messaging provider access token */
    accessToken: (Scalars['String'] | null)
    /** Messaging provider refresh token */
    refreshToken: (Scalars['String'] | null)
    /** Last sync history ID */
    lastSyncHistoryId: (Scalars['String'] | null)
    /** Auth failed at */
    authFailedAt: (Scalars['DateTime'] | null)
    /** Handle Aliases */
    handleAliases: (Scalars['String'] | null)
    /** Scopes */
    scopes: ((Scalars['String'] | null)[] | null)
    /** JSON object containing custom connection parameters */
    connectionParameters: (Scalars['RawJSONScalar'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Account Owner */
    accountOwnerId: (Scalars['ID'] | null)
    /** Account Owner */
    accountOwner: (WorkspaceMember | null)
    /** Message Channels */
    messageChannels: (MessageChannelConnection | null)
    /** Calendar Channels */
    calendarChannels: (CalendarChannelConnection | null)
    __typename: 'ConnectedAccount'
}


/** A favorite that can be accessed from the left menu */
export interface Favorite {
    /** Favorite position */
    position: (Scalars['Float'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Favorite task */
    taskId: (Scalars['ID'] | null)
    /** Favorite task */
    task: (Task | null)
    /** Favorite note */
    noteId: (Scalars['ID'] | null)
    /** Favorite note */
    note: (Note | null)
    /** Favorite workspace member */
    forWorkspaceMemberId: (Scalars['ID'] | null)
    /** Favorite workspace member */
    forWorkspaceMember: (WorkspaceMember | null)
    /** Favorite person */
    personId: (Scalars['ID'] | null)
    /** Favorite person */
    person: (Person | null)
    /** Favorite company */
    companyId: (Scalars['ID'] | null)
    /** Favorite company */
    company: (Company | null)
    /** The folder this favorite belongs to */
    favoriteFolderId: (Scalars['ID'] | null)
    /** The folder this favorite belongs to */
    favoriteFolder: (FavoriteFolder | null)
    /** Favorite opportunity */
    opportunityId: (Scalars['ID'] | null)
    /** Favorite opportunity */
    opportunity: (Opportunity | null)
    /** Favorite workflow */
    workflowId: (Scalars['ID'] | null)
    /** Favorite workflow */
    workflow: (Workflow | null)
    /** Favorite workflow version */
    workflowVersionId: (Scalars['ID'] | null)
    /** Favorite workflow version */
    workflowVersion: (WorkflowVersion | null)
    /** Favorite workflow run */
    workflowRunId: (Scalars['ID'] | null)
    /** Favorite workflow run */
    workflowRun: (WorkflowRun | null)
    /** Favorite view */
    viewId: (Scalars['ID'] | null)
    /** Favorite view */
    view: (View | null)
    /** Favorites Rocket */
    rocketId: (Scalars['ID'] | null)
    /** Favorites Rocket */
    rocket: (Rocket | null)
    /** Favorites Pet */
    petId: (Scalars['ID'] | null)
    /** Favorites Pet */
    pet: (Pet | null)
    /** Favorites Survey result */
    surveyResultId: (Scalars['ID'] | null)
    /** Favorites Survey result */
    surveyResult: (SurveyResult | null)
    __typename: 'Favorite'
}


/** A Folder of favorites */
export interface FavoriteFolder {
    /** Favorite folder position */
    position: (Scalars['Float'] | null)
    /** Name of the favorite folder */
    name: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Favorites in this folder */
    favorites: (FavoriteConnection | null)
    __typename: 'FavoriteFolder'
}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivity {
    /** Creation date */
    happensAt: (Scalars['DateTime'] | null)
    /** Event name */
    name: (Scalars['String'] | null)
    /** Json value for event details */
    properties: (Scalars['RawJSONScalar'] | null)
    /** Cached record name */
    linkedRecordCachedName: (Scalars['String'] | null)
    /** Linked Record id */
    linkedRecordId: (Scalars['UUID'] | null)
    /** Linked Object Metadata Id */
    linkedObjectMetadataId: (Scalars['UUID'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Event workspace member */
    workspaceMemberId: (Scalars['ID'] | null)
    /** Event workspace member */
    workspaceMember: (WorkspaceMember | null)
    /** Event person */
    personId: (Scalars['ID'] | null)
    /** Event person */
    person: (Person | null)
    /** Event company */
    companyId: (Scalars['ID'] | null)
    /** Event company */
    company: (Company | null)
    /** Event opportunity */
    opportunityId: (Scalars['ID'] | null)
    /** Event opportunity */
    opportunity: (Opportunity | null)
    /** Event note */
    noteId: (Scalars['ID'] | null)
    /** Event note */
    note: (Note | null)
    /** Event task */
    taskId: (Scalars['ID'] | null)
    /** Event task */
    task: (Task | null)
    /** Event workflow */
    workflowId: (Scalars['ID'] | null)
    /** Event workflow */
    workflow: (Workflow | null)
    /** Event workflow version */
    workflowVersionId: (Scalars['ID'] | null)
    /** Event workflow version */
    workflowVersion: (WorkflowVersion | null)
    /** Event workflow run */
    workflowRunId: (Scalars['ID'] | null)
    /** Event workflow run */
    workflowRun: (WorkflowRun | null)
    /** TimelineActivities Rocket */
    rocketId: (Scalars['ID'] | null)
    /** TimelineActivities Rocket */
    rocket: (Rocket | null)
    /** TimelineActivities Pet */
    petId: (Scalars['ID'] | null)
    /** TimelineActivities Pet */
    pet: (Pet | null)
    /** TimelineActivities Survey result */
    surveyResultId: (Scalars['ID'] | null)
    /** TimelineActivities Survey result */
    surveyResult: (SurveyResult | null)
    __typename: 'TimelineActivity'
}


/** (System) View Fields */
export interface ViewField {
    /** View Field target field */
    fieldMetadataId: (Scalars['UUID'] | null)
    /** View Field visibility */
    isVisible: (Scalars['Boolean'] | null)
    /** View Field size */
    size: (Scalars['Float'] | null)
    /** View Field position */
    position: (Scalars['Float'] | null)
    /** Optional aggregate operation */
    aggregateOperation: (ViewFieldAggregateOperationEnum | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** View Field related view */
    viewId: (Scalars['ID'] | null)
    /** View Field related view */
    view: (View | null)
    __typename: 'ViewField'
}


/** Optional aggregate operation */
export type ViewFieldAggregateOperationEnum = 'AVG' | 'COUNT' | 'MAX' | 'MIN' | 'SUM' | 'COUNT_EMPTY' | 'COUNT_NOT_EMPTY' | 'COUNT_UNIQUE_VALUES' | 'PERCENTAGE_EMPTY' | 'PERCENTAGE_NOT_EMPTY' | 'COUNT_TRUE' | 'COUNT_FALSE'


/** (System) View Filter Groups */
export interface ViewFilterGroup {
    /** Logical operator for the filter group */
    logicalOperator: (ViewFilterGroupLogicalOperatorEnum | null)
    /** Position in the parent view filter group */
    positionInViewFilterGroup: (Scalars['Float'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Parent View Filter Group */
    parentViewFilterGroupId: (Scalars['UUID'] | null)
    /** View */
    viewId: (Scalars['ID'] | null)
    /** View */
    view: (View | null)
    __typename: 'ViewFilterGroup'
}


/** Logical operator for the filter group */
export type ViewFilterGroupLogicalOperatorEnum = 'AND' | 'OR' | 'NOT'


/** (System) View Groups */
export interface ViewGroup {
    /** View Group target field */
    fieldMetadataId: (Scalars['UUID'] | null)
    /** View Group visibility */
    isVisible: (Scalars['Boolean'] | null)
    /** Group by this field value */
    fieldValue: (Scalars['String'] | null)
    /** View Field position */
    position: (Scalars['Float'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** View Group related view */
    viewId: (Scalars['ID'] | null)
    /** View Group related view */
    view: (View | null)
    __typename: 'ViewGroup'
}


/** (System) View Filters */
export interface ViewFilter {
    /** View Filter target field */
    fieldMetadataId: (Scalars['UUID'] | null)
    /** View Filter operand */
    operand: (Scalars['String'] | null)
    /** View Filter value */
    value: (Scalars['String'] | null)
    /** View Filter Display Value */
    displayValue: (Scalars['String'] | null)
    /** View Filter Group */
    viewFilterGroupId: (Scalars['UUID'] | null)
    /** Position in the view filter group */
    positionInViewFilterGroup: (Scalars['Float'] | null)
    /** Sub field name */
    subFieldName: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** View Filter related view */
    viewId: (Scalars['ID'] | null)
    /** View Filter related view */
    view: (View | null)
    __typename: 'ViewFilter'
}


/** (System) View Sorts */
export interface ViewSort {
    /** View Sort target field */
    fieldMetadataId: (Scalars['UUID'] | null)
    /** View Sort direction */
    direction: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** View Sort related view */
    viewId: (Scalars['ID'] | null)
    /** View Sort related view */
    view: (View | null)
    __typename: 'ViewSort'
}


/** (System) Views */
export interface View {
    /** View name */
    name: (Scalars['String'] | null)
    /** View target object */
    objectMetadataId: (Scalars['UUID'] | null)
    /** View type */
    type: (Scalars['String'] | null)
    /** View key */
    key: (ViewKeyEnum | null)
    /** View icon */
    icon: (Scalars['String'] | null)
    /** View Kanban column field */
    kanbanFieldMetadataId: (Scalars['String'] | null)
    /** View position */
    position: (Scalars['Position'] | null)
    /** Describes if the view is in compact mode */
    isCompact: (Scalars['Boolean'] | null)
    /** Display the records in a side panel or in a record page */
    openRecordIn: (ViewOpenRecordInEnum | null)
    /** Optional aggregate operation */
    kanbanAggregateOperation: (ViewKanbanAggregateOperationEnum | null)
    /** Field metadata used for aggregate operation */
    kanbanAggregateOperationFieldMetadataId: (Scalars['UUID'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** View Fields */
    viewFields: (ViewFieldConnection | null)
    /** View Groups */
    viewGroups: (ViewGroupConnection | null)
    /** View Filters */
    viewFilters: (ViewFilterConnection | null)
    /** View Filter Groups */
    viewFilterGroups: (ViewFilterGroupConnection | null)
    /** View Sorts */
    viewSorts: (ViewSortConnection | null)
    /** Favorites linked to the view */
    favorites: (FavoriteConnection | null)
    __typename: 'View'
}


/** View key */
export type ViewKeyEnum = 'INDEX'


/** Display the records in a side panel or in a record page */
export type ViewOpenRecordInEnum = 'SIDE_PANEL' | 'RECORD_PAGE'


/** Optional aggregate operation */
export type ViewKanbanAggregateOperationEnum = 'AVG' | 'COUNT' | 'MAX' | 'MIN' | 'SUM' | 'COUNT_EMPTY' | 'COUNT_NOT_EMPTY' | 'COUNT_UNIQUE_VALUES' | 'PERCENTAGE_EMPTY' | 'PERCENTAGE_NOT_EMPTY' | 'COUNT_TRUE' | 'COUNT_FALSE'


/** A webhook */
export interface Webhook {
    /** Webhook target url */
    targetUrl: (Scalars['String'] | null)
    /** Webhook operations */
    operations: ((Scalars['String'] | null)[] | null)
    description: (Scalars['String'] | null)
    /** Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests. */
    secret: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    __typename: 'Webhook'
}


/** A workflow */
export interface Workflow {
    /** The workflow name */
    name: (Scalars['String'] | null)
    /** The workflow last published version id */
    lastPublishedVersionId: (Scalars['String'] | null)
    /** The current statuses of the workflow versions */
    statuses: ((WorkflowStatusesEnum | null)[] | null)
    /** Workflow record position */
    position: (Scalars['Position'] | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Workflow versions linked to the workflow. */
    versions: (WorkflowVersionConnection | null)
    /** Workflow runs linked to the workflow. */
    runs: (WorkflowRunConnection | null)
    /** Workflow automated triggers linked to the workflow. */
    automatedTriggers: (WorkflowAutomatedTriggerConnection | null)
    /** Favorites linked to the workflow */
    favorites: (FavoriteConnection | null)
    /** Timeline activities linked to the workflow */
    timelineActivities: (TimelineActivityConnection | null)
    __typename: 'Workflow'
}


/** The current statuses of the workflow versions */
export type WorkflowStatusesEnum = 'DRAFT' | 'ACTIVE' | 'DEACTIVATED'


/** A workflow version */
export interface WorkflowVersion {
    /** The workflow version name */
    name: (Scalars['String'] | null)
    /** Json object to provide trigger */
    trigger: (Scalars['RawJSONScalar'] | null)
    /** Json object to provide steps */
    steps: (Scalars['RawJSONScalar'] | null)
    /** The workflow version status */
    status: (WorkflowVersionStatusEnum | null)
    /** Workflow version position */
    position: (Scalars['Position'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** WorkflowVersion workflow */
    workflowId: (Scalars['ID'] | null)
    /** WorkflowVersion workflow */
    workflow: (Workflow | null)
    /** Workflow runs linked to the version. */
    runs: (WorkflowRunConnection | null)
    /** Favorites linked to the workflow version */
    favorites: (FavoriteConnection | null)
    /** Timeline activities linked to the version */
    timelineActivities: (TimelineActivityConnection | null)
    __typename: 'WorkflowVersion'
}


/** The workflow version status */
export type WorkflowVersionStatusEnum = 'DRAFT' | 'ACTIVE' | 'DEACTIVATED' | 'ARCHIVED'


/** A workflow run */
export interface WorkflowRun {
    /** Name of the workflow run */
    name: (Scalars['String'] | null)
    /** Workflow run started at */
    startedAt: (Scalars['DateTime'] | null)
    /** Workflow run ended at */
    endedAt: (Scalars['DateTime'] | null)
    /** Workflow run status */
    status: (WorkflowRunStatusEnum | null)
    /** The executor of the workflow */
    createdBy: (Actor | null)
    /** Json object to provide output of the workflow run */
    output: (Scalars['RawJSONScalar'] | null)
    /** Context */
    context: (Scalars['RawJSONScalar'] | null)
    /** Workflow run position */
    position: (Scalars['Position'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Workflow version linked to the run. */
    workflowVersionId: (Scalars['ID'] | null)
    /** Workflow version linked to the run. */
    workflowVersion: (WorkflowVersion | null)
    /** Workflow linked to the run. */
    workflowId: (Scalars['ID'] | null)
    /** Workflow linked to the run. */
    workflow: (Workflow | null)
    /** Favorites linked to the workflow run */
    favorites: (FavoriteConnection | null)
    /** Timeline activities linked to the run */
    timelineActivities: (TimelineActivityConnection | null)
    __typename: 'WorkflowRun'
}


/** Workflow run status */
export type WorkflowRunStatusEnum = 'NOT_STARTED' | 'RUNNING' | 'COMPLETED' | 'FAILED'


/** A workflow automated trigger */
export interface WorkflowAutomatedTrigger {
    /** The workflow automated trigger type */
    type: (WorkflowAutomatedTriggerTypeEnum | null)
    /** The workflow automated trigger settings */
    settings: (Scalars['RawJSONScalar'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** WorkflowAutomatedTrigger workflow */
    workflowId: (Scalars['ID'] | null)
    /** WorkflowAutomatedTrigger workflow */
    workflow: (Workflow | null)
    __typename: 'WorkflowAutomatedTrigger'
}


/** The workflow automated trigger type */
export type WorkflowAutomatedTriggerTypeEnum = 'DATABASE_EVENT' | 'CRON'


/** A workspace member */
export interface WorkspaceMember {
    /** Workspace member position */
    position: (Scalars['Position'] | null)
    /** Workspace member name */
    name: (FullName | null)
    /** Preferred color scheme */
    colorScheme: (Scalars['String'] | null)
    /** Preferred language */
    locale: (Scalars['String'] | null)
    /** Workspace member avatar */
    avatarUrl: (Scalars['String'] | null)
    /** Related user email address */
    userEmail: (Scalars['String'] | null)
    /** Associated User Id */
    userId: (Scalars['UUID'] | null)
    /** User time zone */
    timeZone: (Scalars['String'] | null)
    /** User's preferred date format */
    dateFormat: (WorkspaceMemberDateFormatEnum | null)
    /** User's preferred time format */
    timeFormat: (WorkspaceMemberTimeFormatEnum | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Tasks assigned to the workspace member */
    assignedTasks: (TaskConnection | null)
    /** Favorites linked to the workspace member */
    favorites: (FavoriteConnection | null)
    /** Account owner for companies */
    accountOwnerForCompanies: (CompanyConnection | null)
    /** Attachments created by the workspace member */
    authoredAttachments: (AttachmentConnection | null)
    /** Connected accounts */
    connectedAccounts: (ConnectedAccountConnection | null)
    /** Message Participants */
    messageParticipants: (MessageParticipantConnection | null)
    /** Blocklisted handles */
    blocklist: (BlocklistConnection | null)
    /** Calendar Event Participants */
    calendarEventParticipants: (CalendarEventParticipantConnection | null)
    /** Events linked to the workspace member */
    timelineActivities: (TimelineActivityConnection | null)
    __typename: 'WorkspaceMember'
}


/** User's preferred date format */
export type WorkspaceMemberDateFormatEnum = 'SYSTEM' | 'MONTH_FIRST' | 'DAY_FIRST' | 'YEAR_FIRST'


/** User's preferred time format */
export type WorkspaceMemberTimeFormatEnum = 'SYSTEM' | 'HOUR_24' | 'HOUR_12'


/** A note */
export interface Note {
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Note record position */
    position: (Scalars['Position'] | null)
    /** Note title */
    title: (Scalars['String'] | null)
    /** Note body */
    body: (Scalars['String'] | null)
    /** Note body */
    bodyV2: (RichTextV2 | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Note targets */
    noteTargets: (NoteTargetConnection | null)
    /** Note attachments */
    attachments: (AttachmentConnection | null)
    /** Timeline Activities linked to the note. */
    timelineActivities: (TimelineActivityConnection | null)
    /** Favorites linked to the note */
    favorites: (FavoriteConnection | null)
    __typename: 'Note'
}


/** A task target */
export interface TaskTarget {
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** TaskTarget task */
    taskId: (Scalars['ID'] | null)
    /** TaskTarget task */
    task: (Task | null)
    /** TaskTarget person */
    personId: (Scalars['ID'] | null)
    /** TaskTarget person */
    person: (Person | null)
    /** TaskTarget company */
    companyId: (Scalars['ID'] | null)
    /** TaskTarget company */
    company: (Company | null)
    /** TaskTarget opportunity */
    opportunityId: (Scalars['ID'] | null)
    /** TaskTarget opportunity */
    opportunity: (Opportunity | null)
    /** TaskTargets Rocket */
    rocketId: (Scalars['ID'] | null)
    /** TaskTargets Rocket */
    rocket: (Rocket | null)
    /** TaskTargets Pet */
    petId: (Scalars['ID'] | null)
    /** TaskTargets Pet */
    pet: (Pet | null)
    /** TaskTargets Survey result */
    surveyResultId: (Scalars['ID'] | null)
    /** TaskTargets Survey result */
    surveyResult: (SurveyResult | null)
    __typename: 'TaskTarget'
}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThread {
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Messages from the thread. */
    messages: (MessageConnection | null)
    __typename: 'MessageThread'
}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface Message {
    /** Message id from the message header */
    headerMessageId: (Scalars['String'] | null)
    /** Subject */
    subject: (Scalars['String'] | null)
    /** Text */
    text: (Scalars['String'] | null)
    /** The date the message was received */
    receivedAt: (Scalars['DateTime'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Message Thread Id */
    messageThreadId: (Scalars['ID'] | null)
    /** Message Thread Id */
    messageThread: (MessageThread | null)
    /** Message Participants */
    messageParticipants: (MessageParticipantConnection | null)
    /** Messages from the channel. */
    messageChannelMessageAssociations: (MessageChannelMessageAssociationConnection | null)
    __typename: 'Message'
}


/** Message Channels */
export interface MessageChannel {
    /** Visibility */
    visibility: (MessageChannelVisibilityEnum | null)
    /** Handle */
    handle: (Scalars['String'] | null)
    /** Channel Type */
    type: (MessageChannelTypeEnum | null)
    /** Is Contact Auto Creation Enabled */
    isContactAutoCreationEnabled: (Scalars['Boolean'] | null)
    /** Automatically create People records when receiving or sending emails */
    contactAutoCreationPolicy: (MessageChannelContactAutoCreationPolicyEnum | null)
    /** Exclude non professional emails */
    excludeNonProfessionalEmails: (Scalars['Boolean'] | null)
    /** Exclude group emails */
    excludeGroupEmails: (Scalars['Boolean'] | null)
    /** Is Sync Enabled */
    isSyncEnabled: (Scalars['Boolean'] | null)
    /** Last sync cursor */
    syncCursor: (Scalars['String'] | null)
    /** Last sync date */
    syncedAt: (Scalars['DateTime'] | null)
    /** Sync status */
    syncStatus: (MessageChannelSyncStatusEnum | null)
    /** Sync stage */
    syncStage: (MessageChannelSyncStageEnum | null)
    /** Sync stage started at */
    syncStageStartedAt: (Scalars['DateTime'] | null)
    /** Throttle Failure Count */
    throttleFailureCount: (Scalars['Float'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Connected Account */
    connectedAccountId: (Scalars['ID'] | null)
    /** Connected Account */
    connectedAccount: (ConnectedAccount | null)
    /** Messages from the channel. */
    messageChannelMessageAssociations: (MessageChannelMessageAssociationConnection | null)
    /** Message Folders */
    messageFolders: (MessageFolderConnection | null)
    __typename: 'MessageChannel'
}


/** Visibility */
export type MessageChannelVisibilityEnum = 'METADATA' | 'SUBJECT' | 'SHARE_EVERYTHING'


/** Channel Type */
export type MessageChannelTypeEnum = 'email' | 'sms'


/** Automatically create People records when receiving or sending emails */
export type MessageChannelContactAutoCreationPolicyEnum = 'SENT_AND_RECEIVED' | 'SENT' | 'NONE'


/** Sync status */
export type MessageChannelSyncStatusEnum = 'ONGOING' | 'NOT_SYNCED' | 'ACTIVE' | 'FAILED_INSUFFICIENT_PERMISSIONS' | 'FAILED_UNKNOWN'


/** Sync stage */
export type MessageChannelSyncStageEnum = 'FULL_MESSAGE_LIST_FETCH_PENDING' | 'PARTIAL_MESSAGE_LIST_FETCH_PENDING' | 'MESSAGE_LIST_FETCH_ONGOING' | 'MESSAGES_IMPORT_PENDING' | 'MESSAGES_IMPORT_ONGOING' | 'FAILED'


/** Message Participants */
export interface MessageParticipant {
    /** Role */
    role: (MessageParticipantRoleEnum | null)
    /** Handle */
    handle: (Scalars['String'] | null)
    /** Display Name */
    displayName: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Message */
    messageId: (Scalars['ID'] | null)
    /** Message */
    message: (Message | null)
    /** Person */
    personId: (Scalars['ID'] | null)
    /** Person */
    person: (Person | null)
    /** Workspace member */
    workspaceMemberId: (Scalars['ID'] | null)
    /** Workspace member */
    workspaceMember: (WorkspaceMember | null)
    __typename: 'MessageParticipant'
}


/** Role */
export type MessageParticipantRoleEnum = 'from' | 'to' | 'cc' | 'bcc'


/** Folder for Message Channel */
export interface MessageFolder {
    /** Folder name */
    name: (Scalars['String'] | null)
    /** Sync Cursor */
    syncCursor: (Scalars['String'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Message Channel */
    messageChannelId: (Scalars['ID'] | null)
    /** Message Channel */
    messageChannel: (MessageChannel | null)
    __typename: 'MessageFolder'
}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociation {
    /** Message id from the messaging provider */
    messageExternalId: (Scalars['String'] | null)
    /** Thread id from the messaging provider */
    messageThreadExternalId: (Scalars['String'] | null)
    /** Message Direction */
    direction: (MessageChannelMessageAssociationDirectionEnum | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Message Channel Id */
    messageChannelId: (Scalars['ID'] | null)
    /** Message Channel Id */
    messageChannel: (MessageChannel | null)
    /** Message Id */
    messageId: (Scalars['ID'] | null)
    /** Message Id */
    message: (Message | null)
    __typename: 'MessageChannelMessageAssociation'
}


/** Message Direction */
export type MessageChannelMessageAssociationDirectionEnum = 'INCOMING' | 'OUTGOING'


/** A note target */
export interface NoteTarget {
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** NoteTarget note */
    noteId: (Scalars['ID'] | null)
    /** NoteTarget note */
    note: (Note | null)
    /** NoteTarget person */
    personId: (Scalars['ID'] | null)
    /** NoteTarget person */
    person: (Person | null)
    /** NoteTarget company */
    companyId: (Scalars['ID'] | null)
    /** NoteTarget company */
    company: (Company | null)
    /** NoteTarget opportunity */
    opportunityId: (Scalars['ID'] | null)
    /** NoteTarget opportunity */
    opportunity: (Opportunity | null)
    /** NoteTargets Rocket */
    rocketId: (Scalars['ID'] | null)
    /** NoteTargets Rocket */
    rocket: (Rocket | null)
    /** NoteTargets Pet */
    petId: (Scalars['ID'] | null)
    /** NoteTargets Pet */
    pet: (Pet | null)
    /** NoteTargets Survey result */
    surveyResultId: (Scalars['ID'] | null)
    /** NoteTargets Survey result */
    surveyResult: (SurveyResult | null)
    __typename: 'NoteTarget'
}


/** An opportunity */
export interface Opportunity {
    /** The opportunity name */
    name: (Scalars['String'] | null)
    /** Opportunity amount */
    amount: (Currency | null)
    /** Opportunity close date */
    closeDate: (Scalars['DateTime'] | null)
    /** Opportunity stage */
    stage: (OpportunityStageEnum | null)
    /** Opportunity record position */
    position: (Scalars['Position'] | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Opportunity point of contact */
    pointOfContactId: (Scalars['ID'] | null)
    /** Opportunity point of contact */
    pointOfContact: (Person | null)
    /** Opportunity company */
    companyId: (Scalars['ID'] | null)
    /** Opportunity company */
    company: (Company | null)
    /** Favorites linked to the opportunity */
    favorites: (FavoriteConnection | null)
    /** Tasks tied to the opportunity */
    taskTargets: (TaskTargetConnection | null)
    /** Notes tied to the opportunity */
    noteTargets: (NoteTargetConnection | null)
    /** Attachments linked to the opportunity */
    attachments: (AttachmentConnection | null)
    /** Timeline Activities linked to the opportunity. */
    timelineActivities: (TimelineActivityConnection | null)
    __typename: 'Opportunity'
}


/** Opportunity stage */
export type OpportunityStageEnum = 'NEW' | 'SCREENING' | 'MEETING' | 'PROPOSAL' | 'CUSTOMER'


/** A person */
export interface Person {
    /** Contact’s name */
    name: (FullName | null)
    /** Contact’s Emails */
    emails: (Emails | null)
    /** Contact’s Linkedin account */
    linkedinLink: (Links | null)
    /** Contact’s X/Twitter account */
    xLink: (Links | null)
    /** Contact’s job title */
    jobTitle: (Scalars['String'] | null)
    /** Contact’s phone numbers */
    phones: (Phones | null)
    /** Contact’s city */
    city: (Scalars['String'] | null)
    /** Contact’s avatar */
    avatarUrl: (Scalars['String'] | null)
    /** Person record Position */
    position: (Scalars['Position'] | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Contact’s company */
    companyId: (Scalars['ID'] | null)
    /** Contact’s company */
    company: (Company | null)
    intro: (Scalars['String'] | null)
    whatsapp: (Phones | null)
    workPreference: ((PersonWorkPreferenceEnum | null)[] | null)
    performanceRating: (PersonPerformanceRatingEnum | null)
    /** List of opportunities for which that person is the point of contact */
    pointOfContactForOpportunities: (OpportunityConnection | null)
    /** Tasks tied to the contact */
    taskTargets: (TaskTargetConnection | null)
    /** Notes tied to the contact */
    noteTargets: (NoteTargetConnection | null)
    /** Favorites linked to the contact */
    favorites: (FavoriteConnection | null)
    /** Attachments linked to the contact. */
    attachments: (AttachmentConnection | null)
    /** Message Participants */
    messageParticipants: (MessageParticipantConnection | null)
    /** Calendar Event Participants */
    calendarEventParticipants: (CalendarEventParticipantConnection | null)
    /** Events linked to the person */
    timelineActivities: (TimelineActivityConnection | null)
    __typename: 'Person'
}

export type PersonWorkPreferenceEnum = 'ON_SITE' | 'HYBRID' | 'REMOTE_WORK'

export type PersonPerformanceRatingEnum = 'RATING_1' | 'RATING_2' | 'RATING_3' | 'RATING_4' | 'RATING_5'


/** A task */
export interface Task {
    /** Task record position */
    position: (Scalars['Position'] | null)
    /** Task title */
    title: (Scalars['String'] | null)
    /** Task body */
    body: (Scalars['String'] | null)
    /** Task body */
    bodyV2: (RichTextV2 | null)
    /** Task due date */
    dueAt: (Scalars['DateTime'] | null)
    /** Task status */
    status: (TaskStatusEnum | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Date when the record was deleted */
    deletedAt: (Scalars['DateTime'] | null)
    /** Task assignee */
    assigneeId: (Scalars['ID'] | null)
    /** Task assignee */
    assignee: (WorkspaceMember | null)
    /** Favorites linked to the task */
    favorites: (FavoriteConnection | null)
    /** Task targets */
    taskTargets: (TaskTargetConnection | null)
    /** Task attachments */
    attachments: (AttachmentConnection | null)
    /** Timeline Activities linked to the task. */
    timelineActivities: (TimelineActivityConnection | null)
    __typename: 'Task'
}


/** Task status */
export type TaskStatusEnum = 'TODO' | 'IN_PROGRESS' | 'DONE'


/** A rocket */
export interface Rocket {
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Name */
    name: (Scalars['String'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Deletion date */
    deletedAt: (Scalars['DateTime'] | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Position */
    position: (Scalars['Position'] | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    /** TimelineActivities tied to the Rocket */
    timelineActivities: (TimelineActivityConnection | null)
    /** Favorites tied to the Rocket */
    favorites: (FavoriteConnection | null)
    /** Attachments tied to the Rocket */
    attachments: (AttachmentConnection | null)
    /** TaskTargets tied to the Rocket */
    taskTargets: (TaskTargetConnection | null)
    /** NoteTargets tied to the Rocket */
    noteTargets: (NoteTargetConnection | null)
    __typename: 'Rocket'
}

export interface SurveyResult {
    /** Id */
    id: (Scalars['UUID'] | null)
    /** Name */
    name: (Scalars['String'] | null)
    /** Creation date */
    createdAt: (Scalars['DateTime'] | null)
    /** Last time the record was changed */
    updatedAt: (Scalars['DateTime'] | null)
    /** Deletion date */
    deletedAt: (Scalars['DateTime'] | null)
    /** The creator of the record */
    createdBy: (Actor | null)
    /** Position */
    position: (Scalars['Position'] | null)
    /** Field used for full-text search */
    searchVector: (Scalars['TSVector'] | null)
    score: (Scalars['Float'] | null)
    percentageOfCompletion: (Scalars['Float'] | null)
    participants: (Scalars['Int'] | null)
    averageEstimatedNumberOfAtomsInTheUniverse: (Scalars['BigInt'] | null)
    comments: (Scalars['String'] | null)
    shortNotes: (Scalars['String'] | null)
    /** Attachments tied to the Survey result */
    attachments: (AttachmentConnection | null)
    /** TimelineActivities tied to the Survey result */
    timelineActivities: (TimelineActivityConnection | null)
    /** Favorites tied to the Survey result */
    favorites: (FavoriteConnection | null)
    /** TaskTargets tied to the Survey result */
    taskTargets: (TaskTargetConnection | null)
    /** NoteTargets tied to the Survey result */
    noteTargets: (NoteTargetConnection | null)
    __typename: 'SurveyResult'
}


/** An API key */
export interface ApiKeyEdge {
    node: (ApiKey | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'ApiKeyEdge'
}


/** An attachment */
export interface AttachmentEdge {
    node: (Attachment | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'AttachmentEdge'
}

export interface PetEdge {
    node: (Pet | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'PetEdge'
}


/** Blocklist */
export interface BlocklistEdge {
    node: (Blocklist | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'BlocklistEdge'
}


/** Calendar events */
export interface CalendarEventEdge {
    node: (CalendarEvent | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'CalendarEventEdge'
}


/** Calendar Channels */
export interface CalendarChannelEdge {
    node: (CalendarChannel | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'CalendarChannelEdge'
}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationEdge {
    node: (CalendarChannelEventAssociation | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'CalendarChannelEventAssociationEdge'
}


/** Calendar event participants */
export interface CalendarEventParticipantEdge {
    node: (CalendarEventParticipant | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'CalendarEventParticipantEdge'
}


/** A company */
export interface CompanyEdge {
    node: (Company | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'CompanyEdge'
}


/** A connected account */
export interface ConnectedAccountEdge {
    node: (ConnectedAccount | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'ConnectedAccountEdge'
}


/** A favorite that can be accessed from the left menu */
export interface FavoriteEdge {
    node: (Favorite | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'FavoriteEdge'
}


/** A Folder of favorites */
export interface FavoriteFolderEdge {
    node: (FavoriteFolder | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'FavoriteFolderEdge'
}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityEdge {
    node: (TimelineActivity | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'TimelineActivityEdge'
}


/** (System) View Fields */
export interface ViewFieldEdge {
    node: (ViewField | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'ViewFieldEdge'
}


/** (System) View Filter Groups */
export interface ViewFilterGroupEdge {
    node: (ViewFilterGroup | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'ViewFilterGroupEdge'
}


/** (System) View Groups */
export interface ViewGroupEdge {
    node: (ViewGroup | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'ViewGroupEdge'
}


/** (System) View Filters */
export interface ViewFilterEdge {
    node: (ViewFilter | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'ViewFilterEdge'
}


/** (System) View Sorts */
export interface ViewSortEdge {
    node: (ViewSort | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'ViewSortEdge'
}


/** (System) Views */
export interface ViewEdge {
    node: (View | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'ViewEdge'
}


/** A webhook */
export interface WebhookEdge {
    node: (Webhook | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'WebhookEdge'
}


/** A workflow */
export interface WorkflowEdge {
    node: (Workflow | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'WorkflowEdge'
}


/** A workflow version */
export interface WorkflowVersionEdge {
    node: (WorkflowVersion | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'WorkflowVersionEdge'
}


/** A workflow run */
export interface WorkflowRunEdge {
    node: (WorkflowRun | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'WorkflowRunEdge'
}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerEdge {
    node: (WorkflowAutomatedTrigger | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'WorkflowAutomatedTriggerEdge'
}


/** A workspace member */
export interface WorkspaceMemberEdge {
    node: (WorkspaceMember | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'WorkspaceMemberEdge'
}


/** A note */
export interface NoteEdge {
    node: (Note | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'NoteEdge'
}


/** A task target */
export interface TaskTargetEdge {
    node: (TaskTarget | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'TaskTargetEdge'
}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadEdge {
    node: (MessageThread | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'MessageThreadEdge'
}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageEdge {
    node: (Message | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'MessageEdge'
}


/** Message Channels */
export interface MessageChannelEdge {
    node: (MessageChannel | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'MessageChannelEdge'
}


/** Message Participants */
export interface MessageParticipantEdge {
    node: (MessageParticipant | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'MessageParticipantEdge'
}


/** Folder for Message Channel */
export interface MessageFolderEdge {
    node: (MessageFolder | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'MessageFolderEdge'
}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationEdge {
    node: (MessageChannelMessageAssociation | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'MessageChannelMessageAssociationEdge'
}


/** A note target */
export interface NoteTargetEdge {
    node: (NoteTarget | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'NoteTargetEdge'
}


/** An opportunity */
export interface OpportunityEdge {
    node: (Opportunity | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'OpportunityEdge'
}


/** A person */
export interface PersonEdge {
    node: (Person | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'PersonEdge'
}


/** A task */
export interface TaskEdge {
    node: (Task | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'TaskEdge'
}


/** A rocket */
export interface RocketEdge {
    node: (Rocket | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'RocketEdge'
}

export interface SurveyResultEdge {
    node: (SurveyResult | null)
    cursor: (Scalars['Cursor'] | null)
    __typename: 'SurveyResultEdge'
}


/** An API key */
export interface ApiKeyConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for expiresAt */
    countUniqueValuesExpiresAt: (Scalars['Int'] | null)
    /** Number of empty values for expiresAt */
    countEmptyExpiresAt: (Scalars['Int'] | null)
    /** Number of non-empty values for expiresAt */
    countNotEmptyExpiresAt: (Scalars['Int'] | null)
    /** Percentage of empty values for expiresAt */
    percentageEmptyExpiresAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for expiresAt */
    percentageNotEmptyExpiresAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field expiresAt */
    minExpiresAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field expiresAt */
    maxExpiresAt: (Scalars['DateTime'] | null)
    /** Number of unique values for revokedAt */
    countUniqueValuesRevokedAt: (Scalars['Int'] | null)
    /** Number of empty values for revokedAt */
    countEmptyRevokedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for revokedAt */
    countNotEmptyRevokedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for revokedAt */
    percentageEmptyRevokedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for revokedAt */
    percentageNotEmptyRevokedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field revokedAt */
    minRevokedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field revokedAt */
    maxRevokedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (ApiKeyEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'ApiKeyConnection'
}

export interface PageInfo {
    startCursor: (Scalars['ConnectionCursor'] | null)
    endCursor: (Scalars['ConnectionCursor'] | null)
    hasNextPage: Scalars['Boolean']
    hasPreviousPage: Scalars['Boolean']
    __typename: 'PageInfo'
}


/** An attachment */
export interface AttachmentConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for fullPath */
    countUniqueValuesFullPath: (Scalars['Int'] | null)
    /** Number of empty values for fullPath */
    countEmptyFullPath: (Scalars['Int'] | null)
    /** Number of non-empty values for fullPath */
    countNotEmptyFullPath: (Scalars['Int'] | null)
    /** Percentage of empty values for fullPath */
    percentageEmptyFullPath: (Scalars['Float'] | null)
    /** Percentage of non-empty values for fullPath */
    percentageNotEmptyFullPath: (Scalars['Float'] | null)
    /** Number of unique values for type */
    countUniqueValuesType: (Scalars['Int'] | null)
    /** Number of empty values for type */
    countEmptyType: (Scalars['Int'] | null)
    /** Number of non-empty values for type */
    countNotEmptyType: (Scalars['Int'] | null)
    /** Percentage of empty values for type */
    percentageEmptyType: (Scalars['Float'] | null)
    /** Percentage of non-empty values for type */
    percentageNotEmptyType: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (AttachmentEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'AttachmentConnection'
}

export interface PetConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for coco */
    countUniqueValuesCoco: (Scalars['Int'] | null)
    /** Number of empty values for coco */
    countEmptyCoco: (Scalars['Int'] | null)
    /** Number of non-empty values for coco */
    countNotEmptyCoco: (Scalars['Int'] | null)
    /** Percentage of empty values for coco */
    percentageEmptyCoco: (Scalars['Float'] | null)
    /** Percentage of non-empty values for coco */
    percentageNotEmptyCoco: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    /** Number of unique values for species */
    countUniqueValuesSpecies: (Scalars['Int'] | null)
    /** Number of empty values for species */
    countEmptySpecies: (Scalars['Int'] | null)
    /** Number of non-empty values for species */
    countNotEmptySpecies: (Scalars['Int'] | null)
    /** Percentage of empty values for species */
    percentageEmptySpecies: (Scalars['Float'] | null)
    /** Percentage of non-empty values for species */
    percentageNotEmptySpecies: (Scalars['Float'] | null)
    /** Number of unique values for traits */
    countUniqueValuesTraits: (Scalars['Int'] | null)
    /** Number of empty values for traits */
    countEmptyTraits: (Scalars['Int'] | null)
    /** Number of non-empty values for traits */
    countNotEmptyTraits: (Scalars['Int'] | null)
    /** Percentage of empty values for traits */
    percentageEmptyTraits: (Scalars['Float'] | null)
    /** Percentage of non-empty values for traits */
    percentageNotEmptyTraits: (Scalars['Float'] | null)
    /** Number of unique values for comments */
    countUniqueValuesComments: (Scalars['Int'] | null)
    /** Number of empty values for comments */
    countEmptyComments: (Scalars['Int'] | null)
    /** Number of non-empty values for comments */
    countNotEmptyComments: (Scalars['Int'] | null)
    /** Percentage of empty values for comments */
    percentageEmptyComments: (Scalars['Float'] | null)
    /** Percentage of non-empty values for comments */
    percentageNotEmptyComments: (Scalars['Float'] | null)
    /** Number of unique values for age */
    countUniqueValuesAge: (Scalars['Int'] | null)
    /** Number of empty values for age */
    countEmptyAge: (Scalars['Int'] | null)
    /** Number of non-empty values for age */
    countNotEmptyAge: (Scalars['Int'] | null)
    /** Percentage of empty values for age */
    percentageEmptyAge: (Scalars['Float'] | null)
    /** Percentage of non-empty values for age */
    percentageNotEmptyAge: (Scalars['Float'] | null)
    /** Minimum amount contained in the field age */
    minAge: (Scalars['Float'] | null)
    /** Maximum amount contained in the field age */
    maxAge: (Scalars['Float'] | null)
    /** Average amount contained in the field age */
    avgAge: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field age */
    sumAge: (Scalars['Float'] | null)
    /** Number of unique values for location */
    countUniqueValuesLocation: (Scalars['Int'] | null)
    /** Number of empty values for location */
    countEmptyLocation: (Scalars['Int'] | null)
    /** Number of non-empty values for location */
    countNotEmptyLocation: (Scalars['Int'] | null)
    /** Percentage of empty values for location */
    percentageEmptyLocation: (Scalars['Float'] | null)
    /** Percentage of non-empty values for location */
    percentageNotEmptyLocation: (Scalars['Float'] | null)
    /** Number of unique values for vetPhone */
    countUniqueValuesVetPhone: (Scalars['Int'] | null)
    /** Number of empty values for vetPhone */
    countEmptyVetPhone: (Scalars['Int'] | null)
    /** Number of non-empty values for vetPhone */
    countNotEmptyVetPhone: (Scalars['Int'] | null)
    /** Percentage of empty values for vetPhone */
    percentageEmptyVetPhone: (Scalars['Float'] | null)
    /** Percentage of non-empty values for vetPhone */
    percentageNotEmptyVetPhone: (Scalars['Float'] | null)
    /** Number of unique values for vetEmail */
    countUniqueValuesVetEmail: (Scalars['Int'] | null)
    /** Number of empty values for vetEmail */
    countEmptyVetEmail: (Scalars['Int'] | null)
    /** Number of non-empty values for vetEmail */
    countNotEmptyVetEmail: (Scalars['Int'] | null)
    /** Percentage of empty values for vetEmail */
    percentageEmptyVetEmail: (Scalars['Float'] | null)
    /** Percentage of non-empty values for vetEmail */
    percentageNotEmptyVetEmail: (Scalars['Float'] | null)
    /** Number of unique values for birthday */
    countUniqueValuesBirthday: (Scalars['Int'] | null)
    /** Number of empty values for birthday */
    countEmptyBirthday: (Scalars['Int'] | null)
    /** Number of non-empty values for birthday */
    countNotEmptyBirthday: (Scalars['Int'] | null)
    /** Percentage of empty values for birthday */
    percentageEmptyBirthday: (Scalars['Float'] | null)
    /** Percentage of non-empty values for birthday */
    percentageNotEmptyBirthday: (Scalars['Float'] | null)
    /** Earliest date contained in the field birthday */
    minBirthday: (Scalars['DateTime'] | null)
    /** Latest date contained in the field birthday */
    maxBirthday: (Scalars['DateTime'] | null)
    /** Number of unique values for isGoodWithKids */
    countUniqueValuesIsGoodWithKids: (Scalars['Int'] | null)
    /** Number of empty values for isGoodWithKids */
    countEmptyIsGoodWithKids: (Scalars['Int'] | null)
    /** Number of non-empty values for isGoodWithKids */
    countNotEmptyIsGoodWithKids: (Scalars['Int'] | null)
    /** Percentage of empty values for isGoodWithKids */
    percentageEmptyIsGoodWithKids: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isGoodWithKids */
    percentageNotEmptyIsGoodWithKids: (Scalars['Float'] | null)
    /** Count of true values in the field isGoodWithKids */
    countTrueIsGoodWithKids: (Scalars['Int'] | null)
    /** Count of false values in the field isGoodWithKids */
    countFalseIsGoodWithKids: (Scalars['Int'] | null)
    /** Number of unique values for pictures */
    countUniqueValuesPictures: (Scalars['Int'] | null)
    /** Number of empty values for pictures */
    countEmptyPictures: (Scalars['Int'] | null)
    /** Number of non-empty values for pictures */
    countNotEmptyPictures: (Scalars['Int'] | null)
    /** Percentage of empty values for pictures */
    percentageEmptyPictures: (Scalars['Float'] | null)
    /** Percentage of non-empty values for pictures */
    percentageNotEmptyPictures: (Scalars['Float'] | null)
    /** Number of unique values for averageCostOfKibblePerMonth */
    countUniqueValuesAverageCostOfKibblePerMonth: (Scalars['Int'] | null)
    /** Number of empty values for averageCostOfKibblePerMonth */
    countEmptyAverageCostOfKibblePerMonth: (Scalars['Int'] | null)
    /** Number of non-empty values for averageCostOfKibblePerMonth */
    countNotEmptyAverageCostOfKibblePerMonth: (Scalars['Int'] | null)
    /** Percentage of empty values for averageCostOfKibblePerMonth */
    percentageEmptyAverageCostOfKibblePerMonth: (Scalars['Float'] | null)
    /** Percentage of non-empty values for averageCostOfKibblePerMonth */
    percentageNotEmptyAverageCostOfKibblePerMonth: (Scalars['Float'] | null)
    /** Minimum amount contained in the field averageCostOfKibblePerMonth */
    minAverageCostOfKibblePerMonthAmountMicros: (Scalars['Float'] | null)
    /** Maximal amount contained in the field averageCostOfKibblePerMonth */
    maxAverageCostOfKibblePerMonthAmountMicros: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field averageCostOfKibblePerMonth */
    sumAverageCostOfKibblePerMonthAmountMicros: (Scalars['Float'] | null)
    /** Average amount contained in the field averageCostOfKibblePerMonth */
    avgAverageCostOfKibblePerMonthAmountMicros: (Scalars['Float'] | null)
    /** Number of unique values for makesOwnerThinkOf */
    countUniqueValuesMakesOwnerThinkOf: (Scalars['Int'] | null)
    /** Number of empty values for makesOwnerThinkOf */
    countEmptyMakesOwnerThinkOf: (Scalars['Int'] | null)
    /** Number of non-empty values for makesOwnerThinkOf */
    countNotEmptyMakesOwnerThinkOf: (Scalars['Int'] | null)
    /** Percentage of empty values for makesOwnerThinkOf */
    percentageEmptyMakesOwnerThinkOf: (Scalars['Float'] | null)
    /** Percentage of non-empty values for makesOwnerThinkOf */
    percentageNotEmptyMakesOwnerThinkOf: (Scalars['Float'] | null)
    /** Number of unique values for soundSwag */
    countUniqueValuesSoundSwag: (Scalars['Int'] | null)
    /** Number of empty values for soundSwag */
    countEmptySoundSwag: (Scalars['Int'] | null)
    /** Number of non-empty values for soundSwag */
    countNotEmptySoundSwag: (Scalars['Int'] | null)
    /** Percentage of empty values for soundSwag */
    percentageEmptySoundSwag: (Scalars['Float'] | null)
    /** Percentage of non-empty values for soundSwag */
    percentageNotEmptySoundSwag: (Scalars['Float'] | null)
    /** Number of unique values for bio */
    countUniqueValuesBio: (Scalars['Int'] | null)
    /** Number of empty values for bio */
    countEmptyBio: (Scalars['Int'] | null)
    /** Number of non-empty values for bio */
    countNotEmptyBio: (Scalars['Int'] | null)
    /** Percentage of empty values for bio */
    percentageEmptyBio: (Scalars['Float'] | null)
    /** Percentage of non-empty values for bio */
    percentageNotEmptyBio: (Scalars['Float'] | null)
    /** Number of unique values for interestingFacts */
    countUniqueValuesInterestingFacts: (Scalars['Int'] | null)
    /** Number of empty values for interestingFacts */
    countEmptyInterestingFacts: (Scalars['Int'] | null)
    /** Number of non-empty values for interestingFacts */
    countNotEmptyInterestingFacts: (Scalars['Int'] | null)
    /** Percentage of empty values for interestingFacts */
    percentageEmptyInterestingFacts: (Scalars['Float'] | null)
    /** Percentage of non-empty values for interestingFacts */
    percentageNotEmptyInterestingFacts: (Scalars['Float'] | null)
    /** Number of unique values for extraData */
    countUniqueValuesExtraData: (Scalars['Int'] | null)
    /** Number of empty values for extraData */
    countEmptyExtraData: (Scalars['Int'] | null)
    /** Number of non-empty values for extraData */
    countNotEmptyExtraData: (Scalars['Int'] | null)
    /** Percentage of empty values for extraData */
    percentageEmptyExtraData: (Scalars['Float'] | null)
    /** Percentage of non-empty values for extraData */
    percentageNotEmptyExtraData: (Scalars['Float'] | null)
    edges: (PetEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'PetConnection'
}


/** Blocklist */
export interface BlocklistConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for handle */
    countUniqueValuesHandle: (Scalars['Int'] | null)
    /** Number of empty values for handle */
    countEmptyHandle: (Scalars['Int'] | null)
    /** Number of non-empty values for handle */
    countNotEmptyHandle: (Scalars['Int'] | null)
    /** Percentage of empty values for handle */
    percentageEmptyHandle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (BlocklistEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'BlocklistConnection'
}


/** Calendar events */
export interface CalendarEventConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for title */
    countUniqueValuesTitle: (Scalars['Int'] | null)
    /** Number of empty values for title */
    countEmptyTitle: (Scalars['Int'] | null)
    /** Number of non-empty values for title */
    countNotEmptyTitle: (Scalars['Int'] | null)
    /** Percentage of empty values for title */
    percentageEmptyTitle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for title */
    percentageNotEmptyTitle: (Scalars['Float'] | null)
    /** Number of unique values for isCanceled */
    countUniqueValuesIsCanceled: (Scalars['Int'] | null)
    /** Number of empty values for isCanceled */
    countEmptyIsCanceled: (Scalars['Int'] | null)
    /** Number of non-empty values for isCanceled */
    countNotEmptyIsCanceled: (Scalars['Int'] | null)
    /** Percentage of empty values for isCanceled */
    percentageEmptyIsCanceled: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isCanceled */
    percentageNotEmptyIsCanceled: (Scalars['Float'] | null)
    /** Count of true values in the field isCanceled */
    countTrueIsCanceled: (Scalars['Int'] | null)
    /** Count of false values in the field isCanceled */
    countFalseIsCanceled: (Scalars['Int'] | null)
    /** Number of unique values for isFullDay */
    countUniqueValuesIsFullDay: (Scalars['Int'] | null)
    /** Number of empty values for isFullDay */
    countEmptyIsFullDay: (Scalars['Int'] | null)
    /** Number of non-empty values for isFullDay */
    countNotEmptyIsFullDay: (Scalars['Int'] | null)
    /** Percentage of empty values for isFullDay */
    percentageEmptyIsFullDay: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isFullDay */
    percentageNotEmptyIsFullDay: (Scalars['Float'] | null)
    /** Count of true values in the field isFullDay */
    countTrueIsFullDay: (Scalars['Int'] | null)
    /** Count of false values in the field isFullDay */
    countFalseIsFullDay: (Scalars['Int'] | null)
    /** Number of unique values for startsAt */
    countUniqueValuesStartsAt: (Scalars['Int'] | null)
    /** Number of empty values for startsAt */
    countEmptyStartsAt: (Scalars['Int'] | null)
    /** Number of non-empty values for startsAt */
    countNotEmptyStartsAt: (Scalars['Int'] | null)
    /** Percentage of empty values for startsAt */
    percentageEmptyStartsAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for startsAt */
    percentageNotEmptyStartsAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field startsAt */
    minStartsAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field startsAt */
    maxStartsAt: (Scalars['DateTime'] | null)
    /** Number of unique values for endsAt */
    countUniqueValuesEndsAt: (Scalars['Int'] | null)
    /** Number of empty values for endsAt */
    countEmptyEndsAt: (Scalars['Int'] | null)
    /** Number of non-empty values for endsAt */
    countNotEmptyEndsAt: (Scalars['Int'] | null)
    /** Percentage of empty values for endsAt */
    percentageEmptyEndsAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for endsAt */
    percentageNotEmptyEndsAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field endsAt */
    minEndsAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field endsAt */
    maxEndsAt: (Scalars['DateTime'] | null)
    /** Number of unique values for externalCreatedAt */
    countUniqueValuesExternalCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for externalCreatedAt */
    countEmptyExternalCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for externalCreatedAt */
    countNotEmptyExternalCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for externalCreatedAt */
    percentageEmptyExternalCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for externalCreatedAt */
    percentageNotEmptyExternalCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field externalCreatedAt */
    minExternalCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field externalCreatedAt */
    maxExternalCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for externalUpdatedAt */
    countUniqueValuesExternalUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for externalUpdatedAt */
    countEmptyExternalUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for externalUpdatedAt */
    countNotEmptyExternalUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for externalUpdatedAt */
    percentageEmptyExternalUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for externalUpdatedAt */
    percentageNotEmptyExternalUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field externalUpdatedAt */
    minExternalUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field externalUpdatedAt */
    maxExternalUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for description */
    countUniqueValuesDescription: (Scalars['Int'] | null)
    /** Number of empty values for description */
    countEmptyDescription: (Scalars['Int'] | null)
    /** Number of non-empty values for description */
    countNotEmptyDescription: (Scalars['Int'] | null)
    /** Percentage of empty values for description */
    percentageEmptyDescription: (Scalars['Float'] | null)
    /** Percentage of non-empty values for description */
    percentageNotEmptyDescription: (Scalars['Float'] | null)
    /** Number of unique values for location */
    countUniqueValuesLocation: (Scalars['Int'] | null)
    /** Number of empty values for location */
    countEmptyLocation: (Scalars['Int'] | null)
    /** Number of non-empty values for location */
    countNotEmptyLocation: (Scalars['Int'] | null)
    /** Percentage of empty values for location */
    percentageEmptyLocation: (Scalars['Float'] | null)
    /** Percentage of non-empty values for location */
    percentageNotEmptyLocation: (Scalars['Float'] | null)
    /** Number of unique values for iCalUID */
    countUniqueValuesICalUID: (Scalars['Int'] | null)
    /** Number of empty values for iCalUID */
    countEmptyICalUID: (Scalars['Int'] | null)
    /** Number of non-empty values for iCalUID */
    countNotEmptyICalUID: (Scalars['Int'] | null)
    /** Percentage of empty values for iCalUID */
    percentageEmptyICalUID: (Scalars['Float'] | null)
    /** Percentage of non-empty values for iCalUID */
    percentageNotEmptyICalUID: (Scalars['Float'] | null)
    /** Number of unique values for conferenceSolution */
    countUniqueValuesConferenceSolution: (Scalars['Int'] | null)
    /** Number of empty values for conferenceSolution */
    countEmptyConferenceSolution: (Scalars['Int'] | null)
    /** Number of non-empty values for conferenceSolution */
    countNotEmptyConferenceSolution: (Scalars['Int'] | null)
    /** Percentage of empty values for conferenceSolution */
    percentageEmptyConferenceSolution: (Scalars['Float'] | null)
    /** Percentage of non-empty values for conferenceSolution */
    percentageNotEmptyConferenceSolution: (Scalars['Float'] | null)
    /** Number of unique values for conferenceLink */
    countUniqueValuesConferenceLink: (Scalars['Int'] | null)
    /** Number of empty values for conferenceLink */
    countEmptyConferenceLink: (Scalars['Int'] | null)
    /** Number of non-empty values for conferenceLink */
    countNotEmptyConferenceLink: (Scalars['Int'] | null)
    /** Percentage of empty values for conferenceLink */
    percentageEmptyConferenceLink: (Scalars['Float'] | null)
    /** Percentage of non-empty values for conferenceLink */
    percentageNotEmptyConferenceLink: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (CalendarEventEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'CalendarEventConnection'
}


/** Calendar Channels */
export interface CalendarChannelConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for handle */
    countUniqueValuesHandle: (Scalars['Int'] | null)
    /** Number of empty values for handle */
    countEmptyHandle: (Scalars['Int'] | null)
    /** Number of non-empty values for handle */
    countNotEmptyHandle: (Scalars['Int'] | null)
    /** Percentage of empty values for handle */
    percentageEmptyHandle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle: (Scalars['Float'] | null)
    /** Number of unique values for syncStatus */
    countUniqueValuesSyncStatus: (Scalars['Int'] | null)
    /** Number of empty values for syncStatus */
    countEmptySyncStatus: (Scalars['Int'] | null)
    /** Number of non-empty values for syncStatus */
    countNotEmptySyncStatus: (Scalars['Int'] | null)
    /** Percentage of empty values for syncStatus */
    percentageEmptySyncStatus: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncStatus */
    percentageNotEmptySyncStatus: (Scalars['Float'] | null)
    /** Number of unique values for syncStage */
    countUniqueValuesSyncStage: (Scalars['Int'] | null)
    /** Number of empty values for syncStage */
    countEmptySyncStage: (Scalars['Int'] | null)
    /** Number of non-empty values for syncStage */
    countNotEmptySyncStage: (Scalars['Int'] | null)
    /** Percentage of empty values for syncStage */
    percentageEmptySyncStage: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncStage */
    percentageNotEmptySyncStage: (Scalars['Float'] | null)
    /** Number of unique values for visibility */
    countUniqueValuesVisibility: (Scalars['Int'] | null)
    /** Number of empty values for visibility */
    countEmptyVisibility: (Scalars['Int'] | null)
    /** Number of non-empty values for visibility */
    countNotEmptyVisibility: (Scalars['Int'] | null)
    /** Percentage of empty values for visibility */
    percentageEmptyVisibility: (Scalars['Float'] | null)
    /** Percentage of non-empty values for visibility */
    percentageNotEmptyVisibility: (Scalars['Float'] | null)
    /** Number of unique values for isContactAutoCreationEnabled */
    countUniqueValuesIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Number of empty values for isContactAutoCreationEnabled */
    countEmptyIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Number of non-empty values for isContactAutoCreationEnabled */
    countNotEmptyIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Percentage of empty values for isContactAutoCreationEnabled */
    percentageEmptyIsContactAutoCreationEnabled: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isContactAutoCreationEnabled */
    percentageNotEmptyIsContactAutoCreationEnabled: (Scalars['Float'] | null)
    /** Count of true values in the field isContactAutoCreationEnabled */
    countTrueIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Count of false values in the field isContactAutoCreationEnabled */
    countFalseIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Number of unique values for contactAutoCreationPolicy */
    countUniqueValuesContactAutoCreationPolicy: (Scalars['Int'] | null)
    /** Number of empty values for contactAutoCreationPolicy */
    countEmptyContactAutoCreationPolicy: (Scalars['Int'] | null)
    /** Number of non-empty values for contactAutoCreationPolicy */
    countNotEmptyContactAutoCreationPolicy: (Scalars['Int'] | null)
    /** Percentage of empty values for contactAutoCreationPolicy */
    percentageEmptyContactAutoCreationPolicy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for contactAutoCreationPolicy */
    percentageNotEmptyContactAutoCreationPolicy: (Scalars['Float'] | null)
    /** Number of unique values for isSyncEnabled */
    countUniqueValuesIsSyncEnabled: (Scalars['Int'] | null)
    /** Number of empty values for isSyncEnabled */
    countEmptyIsSyncEnabled: (Scalars['Int'] | null)
    /** Number of non-empty values for isSyncEnabled */
    countNotEmptyIsSyncEnabled: (Scalars['Int'] | null)
    /** Percentage of empty values for isSyncEnabled */
    percentageEmptyIsSyncEnabled: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isSyncEnabled */
    percentageNotEmptyIsSyncEnabled: (Scalars['Float'] | null)
    /** Count of true values in the field isSyncEnabled */
    countTrueIsSyncEnabled: (Scalars['Int'] | null)
    /** Count of false values in the field isSyncEnabled */
    countFalseIsSyncEnabled: (Scalars['Int'] | null)
    /** Number of unique values for syncCursor */
    countUniqueValuesSyncCursor: (Scalars['Int'] | null)
    /** Number of empty values for syncCursor */
    countEmptySyncCursor: (Scalars['Int'] | null)
    /** Number of non-empty values for syncCursor */
    countNotEmptySyncCursor: (Scalars['Int'] | null)
    /** Percentage of empty values for syncCursor */
    percentageEmptySyncCursor: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncCursor */
    percentageNotEmptySyncCursor: (Scalars['Float'] | null)
    /** Number of unique values for syncedAt */
    countUniqueValuesSyncedAt: (Scalars['Int'] | null)
    /** Number of empty values for syncedAt */
    countEmptySyncedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for syncedAt */
    countNotEmptySyncedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for syncedAt */
    percentageEmptySyncedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncedAt */
    percentageNotEmptySyncedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field syncedAt */
    minSyncedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field syncedAt */
    maxSyncedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for syncStageStartedAt */
    countUniqueValuesSyncStageStartedAt: (Scalars['Int'] | null)
    /** Number of empty values for syncStageStartedAt */
    countEmptySyncStageStartedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for syncStageStartedAt */
    countNotEmptySyncStageStartedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for syncStageStartedAt */
    percentageEmptySyncStageStartedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncStageStartedAt */
    percentageNotEmptySyncStageStartedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field syncStageStartedAt */
    minSyncStageStartedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field syncStageStartedAt */
    maxSyncStageStartedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for throttleFailureCount */
    countUniqueValuesThrottleFailureCount: (Scalars['Int'] | null)
    /** Number of empty values for throttleFailureCount */
    countEmptyThrottleFailureCount: (Scalars['Int'] | null)
    /** Number of non-empty values for throttleFailureCount */
    countNotEmptyThrottleFailureCount: (Scalars['Int'] | null)
    /** Percentage of empty values for throttleFailureCount */
    percentageEmptyThrottleFailureCount: (Scalars['Float'] | null)
    /** Percentage of non-empty values for throttleFailureCount */
    percentageNotEmptyThrottleFailureCount: (Scalars['Float'] | null)
    /** Minimum amount contained in the field throttleFailureCount */
    minThrottleFailureCount: (Scalars['Float'] | null)
    /** Maximum amount contained in the field throttleFailureCount */
    maxThrottleFailureCount: (Scalars['Float'] | null)
    /** Average amount contained in the field throttleFailureCount */
    avgThrottleFailureCount: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field throttleFailureCount */
    sumThrottleFailureCount: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (CalendarChannelEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'CalendarChannelConnection'
}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for eventExternalId */
    countUniqueValuesEventExternalId: (Scalars['Int'] | null)
    /** Number of empty values for eventExternalId */
    countEmptyEventExternalId: (Scalars['Int'] | null)
    /** Number of non-empty values for eventExternalId */
    countNotEmptyEventExternalId: (Scalars['Int'] | null)
    /** Percentage of empty values for eventExternalId */
    percentageEmptyEventExternalId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for eventExternalId */
    percentageNotEmptyEventExternalId: (Scalars['Float'] | null)
    /** Number of unique values for recurringEventExternalId */
    countUniqueValuesRecurringEventExternalId: (Scalars['Int'] | null)
    /** Number of empty values for recurringEventExternalId */
    countEmptyRecurringEventExternalId: (Scalars['Int'] | null)
    /** Number of non-empty values for recurringEventExternalId */
    countNotEmptyRecurringEventExternalId: (Scalars['Int'] | null)
    /** Percentage of empty values for recurringEventExternalId */
    percentageEmptyRecurringEventExternalId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for recurringEventExternalId */
    percentageNotEmptyRecurringEventExternalId: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (CalendarChannelEventAssociationEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'CalendarChannelEventAssociationConnection'
}


/** Calendar event participants */
export interface CalendarEventParticipantConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for handle */
    countUniqueValuesHandle: (Scalars['Int'] | null)
    /** Number of empty values for handle */
    countEmptyHandle: (Scalars['Int'] | null)
    /** Number of non-empty values for handle */
    countNotEmptyHandle: (Scalars['Int'] | null)
    /** Percentage of empty values for handle */
    percentageEmptyHandle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle: (Scalars['Float'] | null)
    /** Number of unique values for displayName */
    countUniqueValuesDisplayName: (Scalars['Int'] | null)
    /** Number of empty values for displayName */
    countEmptyDisplayName: (Scalars['Int'] | null)
    /** Number of non-empty values for displayName */
    countNotEmptyDisplayName: (Scalars['Int'] | null)
    /** Percentage of empty values for displayName */
    percentageEmptyDisplayName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for displayName */
    percentageNotEmptyDisplayName: (Scalars['Float'] | null)
    /** Number of unique values for isOrganizer */
    countUniqueValuesIsOrganizer: (Scalars['Int'] | null)
    /** Number of empty values for isOrganizer */
    countEmptyIsOrganizer: (Scalars['Int'] | null)
    /** Number of non-empty values for isOrganizer */
    countNotEmptyIsOrganizer: (Scalars['Int'] | null)
    /** Percentage of empty values for isOrganizer */
    percentageEmptyIsOrganizer: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isOrganizer */
    percentageNotEmptyIsOrganizer: (Scalars['Float'] | null)
    /** Count of true values in the field isOrganizer */
    countTrueIsOrganizer: (Scalars['Int'] | null)
    /** Count of false values in the field isOrganizer */
    countFalseIsOrganizer: (Scalars['Int'] | null)
    /** Number of unique values for responseStatus */
    countUniqueValuesResponseStatus: (Scalars['Int'] | null)
    /** Number of empty values for responseStatus */
    countEmptyResponseStatus: (Scalars['Int'] | null)
    /** Number of non-empty values for responseStatus */
    countNotEmptyResponseStatus: (Scalars['Int'] | null)
    /** Percentage of empty values for responseStatus */
    percentageEmptyResponseStatus: (Scalars['Float'] | null)
    /** Percentage of non-empty values for responseStatus */
    percentageNotEmptyResponseStatus: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (CalendarEventParticipantEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'CalendarEventParticipantConnection'
}


/** A company */
export interface CompanyConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for domainName */
    countUniqueValuesDomainName: (Scalars['Int'] | null)
    /** Number of empty values for domainName */
    countEmptyDomainName: (Scalars['Int'] | null)
    /** Number of non-empty values for domainName */
    countNotEmptyDomainName: (Scalars['Int'] | null)
    /** Percentage of empty values for domainName */
    percentageEmptyDomainName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for domainName */
    percentageNotEmptyDomainName: (Scalars['Float'] | null)
    /** Number of unique values for employees */
    countUniqueValuesEmployees: (Scalars['Int'] | null)
    /** Number of empty values for employees */
    countEmptyEmployees: (Scalars['Int'] | null)
    /** Number of non-empty values for employees */
    countNotEmptyEmployees: (Scalars['Int'] | null)
    /** Percentage of empty values for employees */
    percentageEmptyEmployees: (Scalars['Float'] | null)
    /** Percentage of non-empty values for employees */
    percentageNotEmptyEmployees: (Scalars['Float'] | null)
    /** Minimum amount contained in the field employees */
    minEmployees: (Scalars['Float'] | null)
    /** Maximum amount contained in the field employees */
    maxEmployees: (Scalars['Float'] | null)
    /** Average amount contained in the field employees */
    avgEmployees: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field employees */
    sumEmployees: (Scalars['Float'] | null)
    /** Number of unique values for linkedinLink */
    countUniqueValuesLinkedinLink: (Scalars['Int'] | null)
    /** Number of empty values for linkedinLink */
    countEmptyLinkedinLink: (Scalars['Int'] | null)
    /** Number of non-empty values for linkedinLink */
    countNotEmptyLinkedinLink: (Scalars['Int'] | null)
    /** Percentage of empty values for linkedinLink */
    percentageEmptyLinkedinLink: (Scalars['Float'] | null)
    /** Percentage of non-empty values for linkedinLink */
    percentageNotEmptyLinkedinLink: (Scalars['Float'] | null)
    /** Number of unique values for xLink */
    countUniqueValuesXLink: (Scalars['Int'] | null)
    /** Number of empty values for xLink */
    countEmptyXLink: (Scalars['Int'] | null)
    /** Number of non-empty values for xLink */
    countNotEmptyXLink: (Scalars['Int'] | null)
    /** Percentage of empty values for xLink */
    percentageEmptyXLink: (Scalars['Float'] | null)
    /** Percentage of non-empty values for xLink */
    percentageNotEmptyXLink: (Scalars['Float'] | null)
    /** Number of unique values for annualRecurringRevenue */
    countUniqueValuesAnnualRecurringRevenue: (Scalars['Int'] | null)
    /** Number of empty values for annualRecurringRevenue */
    countEmptyAnnualRecurringRevenue: (Scalars['Int'] | null)
    /** Number of non-empty values for annualRecurringRevenue */
    countNotEmptyAnnualRecurringRevenue: (Scalars['Int'] | null)
    /** Percentage of empty values for annualRecurringRevenue */
    percentageEmptyAnnualRecurringRevenue: (Scalars['Float'] | null)
    /** Percentage of non-empty values for annualRecurringRevenue */
    percentageNotEmptyAnnualRecurringRevenue: (Scalars['Float'] | null)
    /** Minimum amount contained in the field annualRecurringRevenue */
    minAnnualRecurringRevenueAmountMicros: (Scalars['Float'] | null)
    /** Maximal amount contained in the field annualRecurringRevenue */
    maxAnnualRecurringRevenueAmountMicros: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field annualRecurringRevenue */
    sumAnnualRecurringRevenueAmountMicros: (Scalars['Float'] | null)
    /** Average amount contained in the field annualRecurringRevenue */
    avgAnnualRecurringRevenueAmountMicros: (Scalars['Float'] | null)
    /** Number of unique values for address */
    countUniqueValuesAddress: (Scalars['Int'] | null)
    /** Number of empty values for address */
    countEmptyAddress: (Scalars['Int'] | null)
    /** Number of non-empty values for address */
    countNotEmptyAddress: (Scalars['Int'] | null)
    /** Percentage of empty values for address */
    percentageEmptyAddress: (Scalars['Float'] | null)
    /** Percentage of non-empty values for address */
    percentageNotEmptyAddress: (Scalars['Float'] | null)
    /** Number of unique values for idealCustomerProfile */
    countUniqueValuesIdealCustomerProfile: (Scalars['Int'] | null)
    /** Number of empty values for idealCustomerProfile */
    countEmptyIdealCustomerProfile: (Scalars['Int'] | null)
    /** Number of non-empty values for idealCustomerProfile */
    countNotEmptyIdealCustomerProfile: (Scalars['Int'] | null)
    /** Percentage of empty values for idealCustomerProfile */
    percentageEmptyIdealCustomerProfile: (Scalars['Float'] | null)
    /** Percentage of non-empty values for idealCustomerProfile */
    percentageNotEmptyIdealCustomerProfile: (Scalars['Float'] | null)
    /** Count of true values in the field idealCustomerProfile */
    countTrueIdealCustomerProfile: (Scalars['Int'] | null)
    /** Count of false values in the field idealCustomerProfile */
    countFalseIdealCustomerProfile: (Scalars['Int'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for tagline */
    countUniqueValuesTagline: (Scalars['Int'] | null)
    /** Number of empty values for tagline */
    countEmptyTagline: (Scalars['Int'] | null)
    /** Number of non-empty values for tagline */
    countNotEmptyTagline: (Scalars['Int'] | null)
    /** Percentage of empty values for tagline */
    percentageEmptyTagline: (Scalars['Float'] | null)
    /** Percentage of non-empty values for tagline */
    percentageNotEmptyTagline: (Scalars['Float'] | null)
    /** Number of unique values for introVideo */
    countUniqueValuesIntroVideo: (Scalars['Int'] | null)
    /** Number of empty values for introVideo */
    countEmptyIntroVideo: (Scalars['Int'] | null)
    /** Number of non-empty values for introVideo */
    countNotEmptyIntroVideo: (Scalars['Int'] | null)
    /** Percentage of empty values for introVideo */
    percentageEmptyIntroVideo: (Scalars['Float'] | null)
    /** Percentage of non-empty values for introVideo */
    percentageNotEmptyIntroVideo: (Scalars['Float'] | null)
    /** Number of unique values for workPolicy */
    countUniqueValuesWorkPolicy: (Scalars['Int'] | null)
    /** Number of empty values for workPolicy */
    countEmptyWorkPolicy: (Scalars['Int'] | null)
    /** Number of non-empty values for workPolicy */
    countNotEmptyWorkPolicy: (Scalars['Int'] | null)
    /** Percentage of empty values for workPolicy */
    percentageEmptyWorkPolicy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for workPolicy */
    percentageNotEmptyWorkPolicy: (Scalars['Float'] | null)
    /** Number of unique values for visaSponsorship */
    countUniqueValuesVisaSponsorship: (Scalars['Int'] | null)
    /** Number of empty values for visaSponsorship */
    countEmptyVisaSponsorship: (Scalars['Int'] | null)
    /** Number of non-empty values for visaSponsorship */
    countNotEmptyVisaSponsorship: (Scalars['Int'] | null)
    /** Percentage of empty values for visaSponsorship */
    percentageEmptyVisaSponsorship: (Scalars['Float'] | null)
    /** Percentage of non-empty values for visaSponsorship */
    percentageNotEmptyVisaSponsorship: (Scalars['Float'] | null)
    /** Count of true values in the field visaSponsorship */
    countTrueVisaSponsorship: (Scalars['Int'] | null)
    /** Count of false values in the field visaSponsorship */
    countFalseVisaSponsorship: (Scalars['Int'] | null)
    edges: (CompanyEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'CompanyConnection'
}


/** A connected account */
export interface ConnectedAccountConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for handle */
    countUniqueValuesHandle: (Scalars['Int'] | null)
    /** Number of empty values for handle */
    countEmptyHandle: (Scalars['Int'] | null)
    /** Number of non-empty values for handle */
    countNotEmptyHandle: (Scalars['Int'] | null)
    /** Percentage of empty values for handle */
    percentageEmptyHandle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle: (Scalars['Float'] | null)
    /** Number of unique values for provider */
    countUniqueValuesProvider: (Scalars['Int'] | null)
    /** Number of empty values for provider */
    countEmptyProvider: (Scalars['Int'] | null)
    /** Number of non-empty values for provider */
    countNotEmptyProvider: (Scalars['Int'] | null)
    /** Percentage of empty values for provider */
    percentageEmptyProvider: (Scalars['Float'] | null)
    /** Percentage of non-empty values for provider */
    percentageNotEmptyProvider: (Scalars['Float'] | null)
    /** Number of unique values for accessToken */
    countUniqueValuesAccessToken: (Scalars['Int'] | null)
    /** Number of empty values for accessToken */
    countEmptyAccessToken: (Scalars['Int'] | null)
    /** Number of non-empty values for accessToken */
    countNotEmptyAccessToken: (Scalars['Int'] | null)
    /** Percentage of empty values for accessToken */
    percentageEmptyAccessToken: (Scalars['Float'] | null)
    /** Percentage of non-empty values for accessToken */
    percentageNotEmptyAccessToken: (Scalars['Float'] | null)
    /** Number of unique values for refreshToken */
    countUniqueValuesRefreshToken: (Scalars['Int'] | null)
    /** Number of empty values for refreshToken */
    countEmptyRefreshToken: (Scalars['Int'] | null)
    /** Number of non-empty values for refreshToken */
    countNotEmptyRefreshToken: (Scalars['Int'] | null)
    /** Percentage of empty values for refreshToken */
    percentageEmptyRefreshToken: (Scalars['Float'] | null)
    /** Percentage of non-empty values for refreshToken */
    percentageNotEmptyRefreshToken: (Scalars['Float'] | null)
    /** Number of unique values for lastSyncHistoryId */
    countUniqueValuesLastSyncHistoryId: (Scalars['Int'] | null)
    /** Number of empty values for lastSyncHistoryId */
    countEmptyLastSyncHistoryId: (Scalars['Int'] | null)
    /** Number of non-empty values for lastSyncHistoryId */
    countNotEmptyLastSyncHistoryId: (Scalars['Int'] | null)
    /** Percentage of empty values for lastSyncHistoryId */
    percentageEmptyLastSyncHistoryId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for lastSyncHistoryId */
    percentageNotEmptyLastSyncHistoryId: (Scalars['Float'] | null)
    /** Number of unique values for authFailedAt */
    countUniqueValuesAuthFailedAt: (Scalars['Int'] | null)
    /** Number of empty values for authFailedAt */
    countEmptyAuthFailedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for authFailedAt */
    countNotEmptyAuthFailedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for authFailedAt */
    percentageEmptyAuthFailedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for authFailedAt */
    percentageNotEmptyAuthFailedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field authFailedAt */
    minAuthFailedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field authFailedAt */
    maxAuthFailedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for handleAliases */
    countUniqueValuesHandleAliases: (Scalars['Int'] | null)
    /** Number of empty values for handleAliases */
    countEmptyHandleAliases: (Scalars['Int'] | null)
    /** Number of non-empty values for handleAliases */
    countNotEmptyHandleAliases: (Scalars['Int'] | null)
    /** Percentage of empty values for handleAliases */
    percentageEmptyHandleAliases: (Scalars['Float'] | null)
    /** Percentage of non-empty values for handleAliases */
    percentageNotEmptyHandleAliases: (Scalars['Float'] | null)
    /** Number of unique values for scopes */
    countUniqueValuesScopes: (Scalars['Int'] | null)
    /** Number of empty values for scopes */
    countEmptyScopes: (Scalars['Int'] | null)
    /** Number of non-empty values for scopes */
    countNotEmptyScopes: (Scalars['Int'] | null)
    /** Percentage of empty values for scopes */
    percentageEmptyScopes: (Scalars['Float'] | null)
    /** Percentage of non-empty values for scopes */
    percentageNotEmptyScopes: (Scalars['Float'] | null)
    /** Number of unique values for connectionParameters */
    countUniqueValuesConnectionParameters: (Scalars['Int'] | null)
    /** Number of empty values for connectionParameters */
    countEmptyConnectionParameters: (Scalars['Int'] | null)
    /** Number of non-empty values for connectionParameters */
    countNotEmptyConnectionParameters: (Scalars['Int'] | null)
    /** Percentage of empty values for connectionParameters */
    percentageEmptyConnectionParameters: (Scalars['Float'] | null)
    /** Percentage of non-empty values for connectionParameters */
    percentageNotEmptyConnectionParameters: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (ConnectedAccountEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'ConnectedAccountConnection'
}


/** A favorite that can be accessed from the left menu */
export interface FavoriteConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Minimum amount contained in the field position */
    minPosition: (Scalars['Float'] | null)
    /** Maximum amount contained in the field position */
    maxPosition: (Scalars['Float'] | null)
    /** Average amount contained in the field position */
    avgPosition: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field position */
    sumPosition: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (FavoriteEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'FavoriteConnection'
}


/** A Folder of favorites */
export interface FavoriteFolderConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Minimum amount contained in the field position */
    minPosition: (Scalars['Float'] | null)
    /** Maximum amount contained in the field position */
    maxPosition: (Scalars['Float'] | null)
    /** Average amount contained in the field position */
    avgPosition: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field position */
    sumPosition: (Scalars['Float'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (FavoriteFolderEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'FavoriteFolderConnection'
}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for happensAt */
    countUniqueValuesHappensAt: (Scalars['Int'] | null)
    /** Number of empty values for happensAt */
    countEmptyHappensAt: (Scalars['Int'] | null)
    /** Number of non-empty values for happensAt */
    countNotEmptyHappensAt: (Scalars['Int'] | null)
    /** Percentage of empty values for happensAt */
    percentageEmptyHappensAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for happensAt */
    percentageNotEmptyHappensAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field happensAt */
    minHappensAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field happensAt */
    maxHappensAt: (Scalars['DateTime'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for properties */
    countUniqueValuesProperties: (Scalars['Int'] | null)
    /** Number of empty values for properties */
    countEmptyProperties: (Scalars['Int'] | null)
    /** Number of non-empty values for properties */
    countNotEmptyProperties: (Scalars['Int'] | null)
    /** Percentage of empty values for properties */
    percentageEmptyProperties: (Scalars['Float'] | null)
    /** Percentage of non-empty values for properties */
    percentageNotEmptyProperties: (Scalars['Float'] | null)
    /** Number of unique values for linkedRecordCachedName */
    countUniqueValuesLinkedRecordCachedName: (Scalars['Int'] | null)
    /** Number of empty values for linkedRecordCachedName */
    countEmptyLinkedRecordCachedName: (Scalars['Int'] | null)
    /** Number of non-empty values for linkedRecordCachedName */
    countNotEmptyLinkedRecordCachedName: (Scalars['Int'] | null)
    /** Percentage of empty values for linkedRecordCachedName */
    percentageEmptyLinkedRecordCachedName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for linkedRecordCachedName */
    percentageNotEmptyLinkedRecordCachedName: (Scalars['Float'] | null)
    /** Number of unique values for linkedRecordId */
    countUniqueValuesLinkedRecordId: (Scalars['Int'] | null)
    /** Number of empty values for linkedRecordId */
    countEmptyLinkedRecordId: (Scalars['Int'] | null)
    /** Number of non-empty values for linkedRecordId */
    countNotEmptyLinkedRecordId: (Scalars['Int'] | null)
    /** Percentage of empty values for linkedRecordId */
    percentageEmptyLinkedRecordId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for linkedRecordId */
    percentageNotEmptyLinkedRecordId: (Scalars['Float'] | null)
    /** Number of unique values for linkedObjectMetadataId */
    countUniqueValuesLinkedObjectMetadataId: (Scalars['Int'] | null)
    /** Number of empty values for linkedObjectMetadataId */
    countEmptyLinkedObjectMetadataId: (Scalars['Int'] | null)
    /** Number of non-empty values for linkedObjectMetadataId */
    countNotEmptyLinkedObjectMetadataId: (Scalars['Int'] | null)
    /** Percentage of empty values for linkedObjectMetadataId */
    percentageEmptyLinkedObjectMetadataId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for linkedObjectMetadataId */
    percentageNotEmptyLinkedObjectMetadataId: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (TimelineActivityEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'TimelineActivityConnection'
}


/** (System) View Fields */
export interface ViewFieldConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for fieldMetadataId */
    countUniqueValuesFieldMetadataId: (Scalars['Int'] | null)
    /** Number of empty values for fieldMetadataId */
    countEmptyFieldMetadataId: (Scalars['Int'] | null)
    /** Number of non-empty values for fieldMetadataId */
    countNotEmptyFieldMetadataId: (Scalars['Int'] | null)
    /** Percentage of empty values for fieldMetadataId */
    percentageEmptyFieldMetadataId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for fieldMetadataId */
    percentageNotEmptyFieldMetadataId: (Scalars['Float'] | null)
    /** Number of unique values for isVisible */
    countUniqueValuesIsVisible: (Scalars['Int'] | null)
    /** Number of empty values for isVisible */
    countEmptyIsVisible: (Scalars['Int'] | null)
    /** Number of non-empty values for isVisible */
    countNotEmptyIsVisible: (Scalars['Int'] | null)
    /** Percentage of empty values for isVisible */
    percentageEmptyIsVisible: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isVisible */
    percentageNotEmptyIsVisible: (Scalars['Float'] | null)
    /** Count of true values in the field isVisible */
    countTrueIsVisible: (Scalars['Int'] | null)
    /** Count of false values in the field isVisible */
    countFalseIsVisible: (Scalars['Int'] | null)
    /** Number of unique values for size */
    countUniqueValuesSize: (Scalars['Int'] | null)
    /** Number of empty values for size */
    countEmptySize: (Scalars['Int'] | null)
    /** Number of non-empty values for size */
    countNotEmptySize: (Scalars['Int'] | null)
    /** Percentage of empty values for size */
    percentageEmptySize: (Scalars['Float'] | null)
    /** Percentage of non-empty values for size */
    percentageNotEmptySize: (Scalars['Float'] | null)
    /** Minimum amount contained in the field size */
    minSize: (Scalars['Float'] | null)
    /** Maximum amount contained in the field size */
    maxSize: (Scalars['Float'] | null)
    /** Average amount contained in the field size */
    avgSize: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field size */
    sumSize: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Minimum amount contained in the field position */
    minPosition: (Scalars['Float'] | null)
    /** Maximum amount contained in the field position */
    maxPosition: (Scalars['Float'] | null)
    /** Average amount contained in the field position */
    avgPosition: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field position */
    sumPosition: (Scalars['Float'] | null)
    /** Number of unique values for aggregateOperation */
    countUniqueValuesAggregateOperation: (Scalars['Int'] | null)
    /** Number of empty values for aggregateOperation */
    countEmptyAggregateOperation: (Scalars['Int'] | null)
    /** Number of non-empty values for aggregateOperation */
    countNotEmptyAggregateOperation: (Scalars['Int'] | null)
    /** Percentage of empty values for aggregateOperation */
    percentageEmptyAggregateOperation: (Scalars['Float'] | null)
    /** Percentage of non-empty values for aggregateOperation */
    percentageNotEmptyAggregateOperation: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (ViewFieldEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'ViewFieldConnection'
}


/** (System) View Filter Groups */
export interface ViewFilterGroupConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for logicalOperator */
    countUniqueValuesLogicalOperator: (Scalars['Int'] | null)
    /** Number of empty values for logicalOperator */
    countEmptyLogicalOperator: (Scalars['Int'] | null)
    /** Number of non-empty values for logicalOperator */
    countNotEmptyLogicalOperator: (Scalars['Int'] | null)
    /** Percentage of empty values for logicalOperator */
    percentageEmptyLogicalOperator: (Scalars['Float'] | null)
    /** Percentage of non-empty values for logicalOperator */
    percentageNotEmptyLogicalOperator: (Scalars['Float'] | null)
    /** Number of unique values for positionInViewFilterGroup */
    countUniqueValuesPositionInViewFilterGroup: (Scalars['Int'] | null)
    /** Number of empty values for positionInViewFilterGroup */
    countEmptyPositionInViewFilterGroup: (Scalars['Int'] | null)
    /** Number of non-empty values for positionInViewFilterGroup */
    countNotEmptyPositionInViewFilterGroup: (Scalars['Int'] | null)
    /** Percentage of empty values for positionInViewFilterGroup */
    percentageEmptyPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Percentage of non-empty values for positionInViewFilterGroup */
    percentageNotEmptyPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Minimum amount contained in the field positionInViewFilterGroup */
    minPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Maximum amount contained in the field positionInViewFilterGroup */
    maxPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Average amount contained in the field positionInViewFilterGroup */
    avgPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field positionInViewFilterGroup */
    sumPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for parentViewFilterGroupId */
    countUniqueValuesParentViewFilterGroupId: (Scalars['Int'] | null)
    /** Number of empty values for parentViewFilterGroupId */
    countEmptyParentViewFilterGroupId: (Scalars['Int'] | null)
    /** Number of non-empty values for parentViewFilterGroupId */
    countNotEmptyParentViewFilterGroupId: (Scalars['Int'] | null)
    /** Percentage of empty values for parentViewFilterGroupId */
    percentageEmptyParentViewFilterGroupId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for parentViewFilterGroupId */
    percentageNotEmptyParentViewFilterGroupId: (Scalars['Float'] | null)
    edges: (ViewFilterGroupEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'ViewFilterGroupConnection'
}


/** (System) View Groups */
export interface ViewGroupConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for fieldMetadataId */
    countUniqueValuesFieldMetadataId: (Scalars['Int'] | null)
    /** Number of empty values for fieldMetadataId */
    countEmptyFieldMetadataId: (Scalars['Int'] | null)
    /** Number of non-empty values for fieldMetadataId */
    countNotEmptyFieldMetadataId: (Scalars['Int'] | null)
    /** Percentage of empty values for fieldMetadataId */
    percentageEmptyFieldMetadataId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for fieldMetadataId */
    percentageNotEmptyFieldMetadataId: (Scalars['Float'] | null)
    /** Number of unique values for isVisible */
    countUniqueValuesIsVisible: (Scalars['Int'] | null)
    /** Number of empty values for isVisible */
    countEmptyIsVisible: (Scalars['Int'] | null)
    /** Number of non-empty values for isVisible */
    countNotEmptyIsVisible: (Scalars['Int'] | null)
    /** Percentage of empty values for isVisible */
    percentageEmptyIsVisible: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isVisible */
    percentageNotEmptyIsVisible: (Scalars['Float'] | null)
    /** Count of true values in the field isVisible */
    countTrueIsVisible: (Scalars['Int'] | null)
    /** Count of false values in the field isVisible */
    countFalseIsVisible: (Scalars['Int'] | null)
    /** Number of unique values for fieldValue */
    countUniqueValuesFieldValue: (Scalars['Int'] | null)
    /** Number of empty values for fieldValue */
    countEmptyFieldValue: (Scalars['Int'] | null)
    /** Number of non-empty values for fieldValue */
    countNotEmptyFieldValue: (Scalars['Int'] | null)
    /** Percentage of empty values for fieldValue */
    percentageEmptyFieldValue: (Scalars['Float'] | null)
    /** Percentage of non-empty values for fieldValue */
    percentageNotEmptyFieldValue: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Minimum amount contained in the field position */
    minPosition: (Scalars['Float'] | null)
    /** Maximum amount contained in the field position */
    maxPosition: (Scalars['Float'] | null)
    /** Average amount contained in the field position */
    avgPosition: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field position */
    sumPosition: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (ViewGroupEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'ViewGroupConnection'
}


/** (System) View Filters */
export interface ViewFilterConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for fieldMetadataId */
    countUniqueValuesFieldMetadataId: (Scalars['Int'] | null)
    /** Number of empty values for fieldMetadataId */
    countEmptyFieldMetadataId: (Scalars['Int'] | null)
    /** Number of non-empty values for fieldMetadataId */
    countNotEmptyFieldMetadataId: (Scalars['Int'] | null)
    /** Percentage of empty values for fieldMetadataId */
    percentageEmptyFieldMetadataId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for fieldMetadataId */
    percentageNotEmptyFieldMetadataId: (Scalars['Float'] | null)
    /** Number of unique values for operand */
    countUniqueValuesOperand: (Scalars['Int'] | null)
    /** Number of empty values for operand */
    countEmptyOperand: (Scalars['Int'] | null)
    /** Number of non-empty values for operand */
    countNotEmptyOperand: (Scalars['Int'] | null)
    /** Percentage of empty values for operand */
    percentageEmptyOperand: (Scalars['Float'] | null)
    /** Percentage of non-empty values for operand */
    percentageNotEmptyOperand: (Scalars['Float'] | null)
    /** Number of unique values for value */
    countUniqueValuesValue: (Scalars['Int'] | null)
    /** Number of empty values for value */
    countEmptyValue: (Scalars['Int'] | null)
    /** Number of non-empty values for value */
    countNotEmptyValue: (Scalars['Int'] | null)
    /** Percentage of empty values for value */
    percentageEmptyValue: (Scalars['Float'] | null)
    /** Percentage of non-empty values for value */
    percentageNotEmptyValue: (Scalars['Float'] | null)
    /** Number of unique values for displayValue */
    countUniqueValuesDisplayValue: (Scalars['Int'] | null)
    /** Number of empty values for displayValue */
    countEmptyDisplayValue: (Scalars['Int'] | null)
    /** Number of non-empty values for displayValue */
    countNotEmptyDisplayValue: (Scalars['Int'] | null)
    /** Percentage of empty values for displayValue */
    percentageEmptyDisplayValue: (Scalars['Float'] | null)
    /** Percentage of non-empty values for displayValue */
    percentageNotEmptyDisplayValue: (Scalars['Float'] | null)
    /** Number of unique values for viewFilterGroupId */
    countUniqueValuesViewFilterGroupId: (Scalars['Int'] | null)
    /** Number of empty values for viewFilterGroupId */
    countEmptyViewFilterGroupId: (Scalars['Int'] | null)
    /** Number of non-empty values for viewFilterGroupId */
    countNotEmptyViewFilterGroupId: (Scalars['Int'] | null)
    /** Percentage of empty values for viewFilterGroupId */
    percentageEmptyViewFilterGroupId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for viewFilterGroupId */
    percentageNotEmptyViewFilterGroupId: (Scalars['Float'] | null)
    /** Number of unique values for positionInViewFilterGroup */
    countUniqueValuesPositionInViewFilterGroup: (Scalars['Int'] | null)
    /** Number of empty values for positionInViewFilterGroup */
    countEmptyPositionInViewFilterGroup: (Scalars['Int'] | null)
    /** Number of non-empty values for positionInViewFilterGroup */
    countNotEmptyPositionInViewFilterGroup: (Scalars['Int'] | null)
    /** Percentage of empty values for positionInViewFilterGroup */
    percentageEmptyPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Percentage of non-empty values for positionInViewFilterGroup */
    percentageNotEmptyPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Minimum amount contained in the field positionInViewFilterGroup */
    minPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Maximum amount contained in the field positionInViewFilterGroup */
    maxPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Average amount contained in the field positionInViewFilterGroup */
    avgPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field positionInViewFilterGroup */
    sumPositionInViewFilterGroup: (Scalars['Float'] | null)
    /** Number of unique values for subFieldName */
    countUniqueValuesSubFieldName: (Scalars['Int'] | null)
    /** Number of empty values for subFieldName */
    countEmptySubFieldName: (Scalars['Int'] | null)
    /** Number of non-empty values for subFieldName */
    countNotEmptySubFieldName: (Scalars['Int'] | null)
    /** Percentage of empty values for subFieldName */
    percentageEmptySubFieldName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for subFieldName */
    percentageNotEmptySubFieldName: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (ViewFilterEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'ViewFilterConnection'
}


/** (System) View Sorts */
export interface ViewSortConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for fieldMetadataId */
    countUniqueValuesFieldMetadataId: (Scalars['Int'] | null)
    /** Number of empty values for fieldMetadataId */
    countEmptyFieldMetadataId: (Scalars['Int'] | null)
    /** Number of non-empty values for fieldMetadataId */
    countNotEmptyFieldMetadataId: (Scalars['Int'] | null)
    /** Percentage of empty values for fieldMetadataId */
    percentageEmptyFieldMetadataId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for fieldMetadataId */
    percentageNotEmptyFieldMetadataId: (Scalars['Float'] | null)
    /** Number of unique values for direction */
    countUniqueValuesDirection: (Scalars['Int'] | null)
    /** Number of empty values for direction */
    countEmptyDirection: (Scalars['Int'] | null)
    /** Number of non-empty values for direction */
    countNotEmptyDirection: (Scalars['Int'] | null)
    /** Percentage of empty values for direction */
    percentageEmptyDirection: (Scalars['Float'] | null)
    /** Percentage of non-empty values for direction */
    percentageNotEmptyDirection: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (ViewSortEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'ViewSortConnection'
}


/** (System) Views */
export interface ViewConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for objectMetadataId */
    countUniqueValuesObjectMetadataId: (Scalars['Int'] | null)
    /** Number of empty values for objectMetadataId */
    countEmptyObjectMetadataId: (Scalars['Int'] | null)
    /** Number of non-empty values for objectMetadataId */
    countNotEmptyObjectMetadataId: (Scalars['Int'] | null)
    /** Percentage of empty values for objectMetadataId */
    percentageEmptyObjectMetadataId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for objectMetadataId */
    percentageNotEmptyObjectMetadataId: (Scalars['Float'] | null)
    /** Number of unique values for type */
    countUniqueValuesType: (Scalars['Int'] | null)
    /** Number of empty values for type */
    countEmptyType: (Scalars['Int'] | null)
    /** Number of non-empty values for type */
    countNotEmptyType: (Scalars['Int'] | null)
    /** Percentage of empty values for type */
    percentageEmptyType: (Scalars['Float'] | null)
    /** Percentage of non-empty values for type */
    percentageNotEmptyType: (Scalars['Float'] | null)
    /** Number of unique values for key */
    countUniqueValuesKey: (Scalars['Int'] | null)
    /** Number of empty values for key */
    countEmptyKey: (Scalars['Int'] | null)
    /** Number of non-empty values for key */
    countNotEmptyKey: (Scalars['Int'] | null)
    /** Percentage of empty values for key */
    percentageEmptyKey: (Scalars['Float'] | null)
    /** Percentage of non-empty values for key */
    percentageNotEmptyKey: (Scalars['Float'] | null)
    /** Number of unique values for icon */
    countUniqueValuesIcon: (Scalars['Int'] | null)
    /** Number of empty values for icon */
    countEmptyIcon: (Scalars['Int'] | null)
    /** Number of non-empty values for icon */
    countNotEmptyIcon: (Scalars['Int'] | null)
    /** Percentage of empty values for icon */
    percentageEmptyIcon: (Scalars['Float'] | null)
    /** Percentage of non-empty values for icon */
    percentageNotEmptyIcon: (Scalars['Float'] | null)
    /** Number of unique values for kanbanFieldMetadataId */
    countUniqueValuesKanbanFieldMetadataId: (Scalars['Int'] | null)
    /** Number of empty values for kanbanFieldMetadataId */
    countEmptyKanbanFieldMetadataId: (Scalars['Int'] | null)
    /** Number of non-empty values for kanbanFieldMetadataId */
    countNotEmptyKanbanFieldMetadataId: (Scalars['Int'] | null)
    /** Percentage of empty values for kanbanFieldMetadataId */
    percentageEmptyKanbanFieldMetadataId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for kanbanFieldMetadataId */
    percentageNotEmptyKanbanFieldMetadataId: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for isCompact */
    countUniqueValuesIsCompact: (Scalars['Int'] | null)
    /** Number of empty values for isCompact */
    countEmptyIsCompact: (Scalars['Int'] | null)
    /** Number of non-empty values for isCompact */
    countNotEmptyIsCompact: (Scalars['Int'] | null)
    /** Percentage of empty values for isCompact */
    percentageEmptyIsCompact: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isCompact */
    percentageNotEmptyIsCompact: (Scalars['Float'] | null)
    /** Count of true values in the field isCompact */
    countTrueIsCompact: (Scalars['Int'] | null)
    /** Count of false values in the field isCompact */
    countFalseIsCompact: (Scalars['Int'] | null)
    /** Number of unique values for openRecordIn */
    countUniqueValuesOpenRecordIn: (Scalars['Int'] | null)
    /** Number of empty values for openRecordIn */
    countEmptyOpenRecordIn: (Scalars['Int'] | null)
    /** Number of non-empty values for openRecordIn */
    countNotEmptyOpenRecordIn: (Scalars['Int'] | null)
    /** Percentage of empty values for openRecordIn */
    percentageEmptyOpenRecordIn: (Scalars['Float'] | null)
    /** Percentage of non-empty values for openRecordIn */
    percentageNotEmptyOpenRecordIn: (Scalars['Float'] | null)
    /** Number of unique values for kanbanAggregateOperation */
    countUniqueValuesKanbanAggregateOperation: (Scalars['Int'] | null)
    /** Number of empty values for kanbanAggregateOperation */
    countEmptyKanbanAggregateOperation: (Scalars['Int'] | null)
    /** Number of non-empty values for kanbanAggregateOperation */
    countNotEmptyKanbanAggregateOperation: (Scalars['Int'] | null)
    /** Percentage of empty values for kanbanAggregateOperation */
    percentageEmptyKanbanAggregateOperation: (Scalars['Float'] | null)
    /** Percentage of non-empty values for kanbanAggregateOperation */
    percentageNotEmptyKanbanAggregateOperation: (Scalars['Float'] | null)
    /** Number of unique values for kanbanAggregateOperationFieldMetadataId */
    countUniqueValuesKanbanAggregateOperationFieldMetadataId: (Scalars['Int'] | null)
    /** Number of empty values for kanbanAggregateOperationFieldMetadataId */
    countEmptyKanbanAggregateOperationFieldMetadataId: (Scalars['Int'] | null)
    /** Number of non-empty values for kanbanAggregateOperationFieldMetadataId */
    countNotEmptyKanbanAggregateOperationFieldMetadataId: (Scalars['Int'] | null)
    /** Percentage of empty values for kanbanAggregateOperationFieldMetadataId */
    percentageEmptyKanbanAggregateOperationFieldMetadataId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for kanbanAggregateOperationFieldMetadataId */
    percentageNotEmptyKanbanAggregateOperationFieldMetadataId: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (ViewEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'ViewConnection'
}


/** A webhook */
export interface WebhookConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for targetUrl */
    countUniqueValuesTargetUrl: (Scalars['Int'] | null)
    /** Number of empty values for targetUrl */
    countEmptyTargetUrl: (Scalars['Int'] | null)
    /** Number of non-empty values for targetUrl */
    countNotEmptyTargetUrl: (Scalars['Int'] | null)
    /** Percentage of empty values for targetUrl */
    percentageEmptyTargetUrl: (Scalars['Float'] | null)
    /** Percentage of non-empty values for targetUrl */
    percentageNotEmptyTargetUrl: (Scalars['Float'] | null)
    /** Number of unique values for operations */
    countUniqueValuesOperations: (Scalars['Int'] | null)
    /** Number of empty values for operations */
    countEmptyOperations: (Scalars['Int'] | null)
    /** Number of non-empty values for operations */
    countNotEmptyOperations: (Scalars['Int'] | null)
    /** Percentage of empty values for operations */
    percentageEmptyOperations: (Scalars['Float'] | null)
    /** Percentage of non-empty values for operations */
    percentageNotEmptyOperations: (Scalars['Float'] | null)
    /** Number of unique values for description */
    countUniqueValuesDescription: (Scalars['Int'] | null)
    /** Number of empty values for description */
    countEmptyDescription: (Scalars['Int'] | null)
    /** Number of non-empty values for description */
    countNotEmptyDescription: (Scalars['Int'] | null)
    /** Percentage of empty values for description */
    percentageEmptyDescription: (Scalars['Float'] | null)
    /** Percentage of non-empty values for description */
    percentageNotEmptyDescription: (Scalars['Float'] | null)
    /** Number of unique values for secret */
    countUniqueValuesSecret: (Scalars['Int'] | null)
    /** Number of empty values for secret */
    countEmptySecret: (Scalars['Int'] | null)
    /** Number of non-empty values for secret */
    countNotEmptySecret: (Scalars['Int'] | null)
    /** Percentage of empty values for secret */
    percentageEmptySecret: (Scalars['Float'] | null)
    /** Percentage of non-empty values for secret */
    percentageNotEmptySecret: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (WebhookEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'WebhookConnection'
}


/** A workflow */
export interface WorkflowConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for lastPublishedVersionId */
    countUniqueValuesLastPublishedVersionId: (Scalars['Int'] | null)
    /** Number of empty values for lastPublishedVersionId */
    countEmptyLastPublishedVersionId: (Scalars['Int'] | null)
    /** Number of non-empty values for lastPublishedVersionId */
    countNotEmptyLastPublishedVersionId: (Scalars['Int'] | null)
    /** Percentage of empty values for lastPublishedVersionId */
    percentageEmptyLastPublishedVersionId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for lastPublishedVersionId */
    percentageNotEmptyLastPublishedVersionId: (Scalars['Float'] | null)
    /** Number of unique values for statuses */
    countUniqueValuesStatuses: (Scalars['Int'] | null)
    /** Number of empty values for statuses */
    countEmptyStatuses: (Scalars['Int'] | null)
    /** Number of non-empty values for statuses */
    countNotEmptyStatuses: (Scalars['Int'] | null)
    /** Percentage of empty values for statuses */
    percentageEmptyStatuses: (Scalars['Float'] | null)
    /** Percentage of non-empty values for statuses */
    percentageNotEmptyStatuses: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (WorkflowEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'WorkflowConnection'
}


/** A workflow version */
export interface WorkflowVersionConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for trigger */
    countUniqueValuesTrigger: (Scalars['Int'] | null)
    /** Number of empty values for trigger */
    countEmptyTrigger: (Scalars['Int'] | null)
    /** Number of non-empty values for trigger */
    countNotEmptyTrigger: (Scalars['Int'] | null)
    /** Percentage of empty values for trigger */
    percentageEmptyTrigger: (Scalars['Float'] | null)
    /** Percentage of non-empty values for trigger */
    percentageNotEmptyTrigger: (Scalars['Float'] | null)
    /** Number of unique values for steps */
    countUniqueValuesSteps: (Scalars['Int'] | null)
    /** Number of empty values for steps */
    countEmptySteps: (Scalars['Int'] | null)
    /** Number of non-empty values for steps */
    countNotEmptySteps: (Scalars['Int'] | null)
    /** Percentage of empty values for steps */
    percentageEmptySteps: (Scalars['Float'] | null)
    /** Percentage of non-empty values for steps */
    percentageNotEmptySteps: (Scalars['Float'] | null)
    /** Number of unique values for status */
    countUniqueValuesStatus: (Scalars['Int'] | null)
    /** Number of empty values for status */
    countEmptyStatus: (Scalars['Int'] | null)
    /** Number of non-empty values for status */
    countNotEmptyStatus: (Scalars['Int'] | null)
    /** Percentage of empty values for status */
    percentageEmptyStatus: (Scalars['Float'] | null)
    /** Percentage of non-empty values for status */
    percentageNotEmptyStatus: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (WorkflowVersionEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'WorkflowVersionConnection'
}


/** A workflow run */
export interface WorkflowRunConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for startedAt */
    countUniqueValuesStartedAt: (Scalars['Int'] | null)
    /** Number of empty values for startedAt */
    countEmptyStartedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for startedAt */
    countNotEmptyStartedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for startedAt */
    percentageEmptyStartedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for startedAt */
    percentageNotEmptyStartedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field startedAt */
    minStartedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field startedAt */
    maxStartedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for endedAt */
    countUniqueValuesEndedAt: (Scalars['Int'] | null)
    /** Number of empty values for endedAt */
    countEmptyEndedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for endedAt */
    countNotEmptyEndedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for endedAt */
    percentageEmptyEndedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for endedAt */
    percentageNotEmptyEndedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field endedAt */
    minEndedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field endedAt */
    maxEndedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for status */
    countUniqueValuesStatus: (Scalars['Int'] | null)
    /** Number of empty values for status */
    countEmptyStatus: (Scalars['Int'] | null)
    /** Number of non-empty values for status */
    countNotEmptyStatus: (Scalars['Int'] | null)
    /** Percentage of empty values for status */
    percentageEmptyStatus: (Scalars['Float'] | null)
    /** Percentage of non-empty values for status */
    percentageNotEmptyStatus: (Scalars['Float'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for output */
    countUniqueValuesOutput: (Scalars['Int'] | null)
    /** Number of empty values for output */
    countEmptyOutput: (Scalars['Int'] | null)
    /** Number of non-empty values for output */
    countNotEmptyOutput: (Scalars['Int'] | null)
    /** Percentage of empty values for output */
    percentageEmptyOutput: (Scalars['Float'] | null)
    /** Percentage of non-empty values for output */
    percentageNotEmptyOutput: (Scalars['Float'] | null)
    /** Number of unique values for context */
    countUniqueValuesContext: (Scalars['Int'] | null)
    /** Number of empty values for context */
    countEmptyContext: (Scalars['Int'] | null)
    /** Number of non-empty values for context */
    countNotEmptyContext: (Scalars['Int'] | null)
    /** Percentage of empty values for context */
    percentageEmptyContext: (Scalars['Float'] | null)
    /** Percentage of non-empty values for context */
    percentageNotEmptyContext: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (WorkflowRunEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'WorkflowRunConnection'
}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for type */
    countUniqueValuesType: (Scalars['Int'] | null)
    /** Number of empty values for type */
    countEmptyType: (Scalars['Int'] | null)
    /** Number of non-empty values for type */
    countNotEmptyType: (Scalars['Int'] | null)
    /** Percentage of empty values for type */
    percentageEmptyType: (Scalars['Float'] | null)
    /** Percentage of non-empty values for type */
    percentageNotEmptyType: (Scalars['Float'] | null)
    /** Number of unique values for settings */
    countUniqueValuesSettings: (Scalars['Int'] | null)
    /** Number of empty values for settings */
    countEmptySettings: (Scalars['Int'] | null)
    /** Number of non-empty values for settings */
    countNotEmptySettings: (Scalars['Int'] | null)
    /** Percentage of empty values for settings */
    percentageEmptySettings: (Scalars['Float'] | null)
    /** Percentage of non-empty values for settings */
    percentageNotEmptySettings: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (WorkflowAutomatedTriggerEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'WorkflowAutomatedTriggerConnection'
}


/** A workspace member */
export interface WorkspaceMemberConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for colorScheme */
    countUniqueValuesColorScheme: (Scalars['Int'] | null)
    /** Number of empty values for colorScheme */
    countEmptyColorScheme: (Scalars['Int'] | null)
    /** Number of non-empty values for colorScheme */
    countNotEmptyColorScheme: (Scalars['Int'] | null)
    /** Percentage of empty values for colorScheme */
    percentageEmptyColorScheme: (Scalars['Float'] | null)
    /** Percentage of non-empty values for colorScheme */
    percentageNotEmptyColorScheme: (Scalars['Float'] | null)
    /** Number of unique values for locale */
    countUniqueValuesLocale: (Scalars['Int'] | null)
    /** Number of empty values for locale */
    countEmptyLocale: (Scalars['Int'] | null)
    /** Number of non-empty values for locale */
    countNotEmptyLocale: (Scalars['Int'] | null)
    /** Percentage of empty values for locale */
    percentageEmptyLocale: (Scalars['Float'] | null)
    /** Percentage of non-empty values for locale */
    percentageNotEmptyLocale: (Scalars['Float'] | null)
    /** Number of unique values for avatarUrl */
    countUniqueValuesAvatarUrl: (Scalars['Int'] | null)
    /** Number of empty values for avatarUrl */
    countEmptyAvatarUrl: (Scalars['Int'] | null)
    /** Number of non-empty values for avatarUrl */
    countNotEmptyAvatarUrl: (Scalars['Int'] | null)
    /** Percentage of empty values for avatarUrl */
    percentageEmptyAvatarUrl: (Scalars['Float'] | null)
    /** Percentage of non-empty values for avatarUrl */
    percentageNotEmptyAvatarUrl: (Scalars['Float'] | null)
    /** Number of unique values for userEmail */
    countUniqueValuesUserEmail: (Scalars['Int'] | null)
    /** Number of empty values for userEmail */
    countEmptyUserEmail: (Scalars['Int'] | null)
    /** Number of non-empty values for userEmail */
    countNotEmptyUserEmail: (Scalars['Int'] | null)
    /** Percentage of empty values for userEmail */
    percentageEmptyUserEmail: (Scalars['Float'] | null)
    /** Percentage of non-empty values for userEmail */
    percentageNotEmptyUserEmail: (Scalars['Float'] | null)
    /** Number of unique values for userId */
    countUniqueValuesUserId: (Scalars['Int'] | null)
    /** Number of empty values for userId */
    countEmptyUserId: (Scalars['Int'] | null)
    /** Number of non-empty values for userId */
    countNotEmptyUserId: (Scalars['Int'] | null)
    /** Percentage of empty values for userId */
    percentageEmptyUserId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for userId */
    percentageNotEmptyUserId: (Scalars['Float'] | null)
    /** Number of unique values for timeZone */
    countUniqueValuesTimeZone: (Scalars['Int'] | null)
    /** Number of empty values for timeZone */
    countEmptyTimeZone: (Scalars['Int'] | null)
    /** Number of non-empty values for timeZone */
    countNotEmptyTimeZone: (Scalars['Int'] | null)
    /** Percentage of empty values for timeZone */
    percentageEmptyTimeZone: (Scalars['Float'] | null)
    /** Percentage of non-empty values for timeZone */
    percentageNotEmptyTimeZone: (Scalars['Float'] | null)
    /** Number of unique values for dateFormat */
    countUniqueValuesDateFormat: (Scalars['Int'] | null)
    /** Number of empty values for dateFormat */
    countEmptyDateFormat: (Scalars['Int'] | null)
    /** Number of non-empty values for dateFormat */
    countNotEmptyDateFormat: (Scalars['Int'] | null)
    /** Percentage of empty values for dateFormat */
    percentageEmptyDateFormat: (Scalars['Float'] | null)
    /** Percentage of non-empty values for dateFormat */
    percentageNotEmptyDateFormat: (Scalars['Float'] | null)
    /** Number of unique values for timeFormat */
    countUniqueValuesTimeFormat: (Scalars['Int'] | null)
    /** Number of empty values for timeFormat */
    countEmptyTimeFormat: (Scalars['Int'] | null)
    /** Number of non-empty values for timeFormat */
    countNotEmptyTimeFormat: (Scalars['Int'] | null)
    /** Percentage of empty values for timeFormat */
    percentageEmptyTimeFormat: (Scalars['Float'] | null)
    /** Percentage of non-empty values for timeFormat */
    percentageNotEmptyTimeFormat: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (WorkspaceMemberEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'WorkspaceMemberConnection'
}


/** A note */
export interface NoteConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for title */
    countUniqueValuesTitle: (Scalars['Int'] | null)
    /** Number of empty values for title */
    countEmptyTitle: (Scalars['Int'] | null)
    /** Number of non-empty values for title */
    countNotEmptyTitle: (Scalars['Int'] | null)
    /** Percentage of empty values for title */
    percentageEmptyTitle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for title */
    percentageNotEmptyTitle: (Scalars['Float'] | null)
    /** Number of unique values for body */
    countUniqueValuesBody: (Scalars['Int'] | null)
    /** Number of empty values for body */
    countEmptyBody: (Scalars['Int'] | null)
    /** Number of non-empty values for body */
    countNotEmptyBody: (Scalars['Int'] | null)
    /** Percentage of empty values for body */
    percentageEmptyBody: (Scalars['Float'] | null)
    /** Percentage of non-empty values for body */
    percentageNotEmptyBody: (Scalars['Float'] | null)
    /** Number of unique values for bodyV2 */
    countUniqueValuesBodyV2: (Scalars['Int'] | null)
    /** Number of empty values for bodyV2 */
    countEmptyBodyV2: (Scalars['Int'] | null)
    /** Number of non-empty values for bodyV2 */
    countNotEmptyBodyV2: (Scalars['Int'] | null)
    /** Percentage of empty values for bodyV2 */
    percentageEmptyBodyV2: (Scalars['Float'] | null)
    /** Percentage of non-empty values for bodyV2 */
    percentageNotEmptyBodyV2: (Scalars['Float'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    edges: (NoteEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'NoteConnection'
}


/** A task target */
export interface TaskTargetConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (TaskTargetEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'TaskTargetConnection'
}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (MessageThreadEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'MessageThreadConnection'
}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for headerMessageId */
    countUniqueValuesHeaderMessageId: (Scalars['Int'] | null)
    /** Number of empty values for headerMessageId */
    countEmptyHeaderMessageId: (Scalars['Int'] | null)
    /** Number of non-empty values for headerMessageId */
    countNotEmptyHeaderMessageId: (Scalars['Int'] | null)
    /** Percentage of empty values for headerMessageId */
    percentageEmptyHeaderMessageId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for headerMessageId */
    percentageNotEmptyHeaderMessageId: (Scalars['Float'] | null)
    /** Number of unique values for subject */
    countUniqueValuesSubject: (Scalars['Int'] | null)
    /** Number of empty values for subject */
    countEmptySubject: (Scalars['Int'] | null)
    /** Number of non-empty values for subject */
    countNotEmptySubject: (Scalars['Int'] | null)
    /** Percentage of empty values for subject */
    percentageEmptySubject: (Scalars['Float'] | null)
    /** Percentage of non-empty values for subject */
    percentageNotEmptySubject: (Scalars['Float'] | null)
    /** Number of unique values for text */
    countUniqueValuesText: (Scalars['Int'] | null)
    /** Number of empty values for text */
    countEmptyText: (Scalars['Int'] | null)
    /** Number of non-empty values for text */
    countNotEmptyText: (Scalars['Int'] | null)
    /** Percentage of empty values for text */
    percentageEmptyText: (Scalars['Float'] | null)
    /** Percentage of non-empty values for text */
    percentageNotEmptyText: (Scalars['Float'] | null)
    /** Number of unique values for receivedAt */
    countUniqueValuesReceivedAt: (Scalars['Int'] | null)
    /** Number of empty values for receivedAt */
    countEmptyReceivedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for receivedAt */
    countNotEmptyReceivedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for receivedAt */
    percentageEmptyReceivedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for receivedAt */
    percentageNotEmptyReceivedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field receivedAt */
    minReceivedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field receivedAt */
    maxReceivedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (MessageEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'MessageConnection'
}


/** Message Channels */
export interface MessageChannelConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for visibility */
    countUniqueValuesVisibility: (Scalars['Int'] | null)
    /** Number of empty values for visibility */
    countEmptyVisibility: (Scalars['Int'] | null)
    /** Number of non-empty values for visibility */
    countNotEmptyVisibility: (Scalars['Int'] | null)
    /** Percentage of empty values for visibility */
    percentageEmptyVisibility: (Scalars['Float'] | null)
    /** Percentage of non-empty values for visibility */
    percentageNotEmptyVisibility: (Scalars['Float'] | null)
    /** Number of unique values for handle */
    countUniqueValuesHandle: (Scalars['Int'] | null)
    /** Number of empty values for handle */
    countEmptyHandle: (Scalars['Int'] | null)
    /** Number of non-empty values for handle */
    countNotEmptyHandle: (Scalars['Int'] | null)
    /** Percentage of empty values for handle */
    percentageEmptyHandle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle: (Scalars['Float'] | null)
    /** Number of unique values for type */
    countUniqueValuesType: (Scalars['Int'] | null)
    /** Number of empty values for type */
    countEmptyType: (Scalars['Int'] | null)
    /** Number of non-empty values for type */
    countNotEmptyType: (Scalars['Int'] | null)
    /** Percentage of empty values for type */
    percentageEmptyType: (Scalars['Float'] | null)
    /** Percentage of non-empty values for type */
    percentageNotEmptyType: (Scalars['Float'] | null)
    /** Number of unique values for isContactAutoCreationEnabled */
    countUniqueValuesIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Number of empty values for isContactAutoCreationEnabled */
    countEmptyIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Number of non-empty values for isContactAutoCreationEnabled */
    countNotEmptyIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Percentage of empty values for isContactAutoCreationEnabled */
    percentageEmptyIsContactAutoCreationEnabled: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isContactAutoCreationEnabled */
    percentageNotEmptyIsContactAutoCreationEnabled: (Scalars['Float'] | null)
    /** Count of true values in the field isContactAutoCreationEnabled */
    countTrueIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Count of false values in the field isContactAutoCreationEnabled */
    countFalseIsContactAutoCreationEnabled: (Scalars['Int'] | null)
    /** Number of unique values for contactAutoCreationPolicy */
    countUniqueValuesContactAutoCreationPolicy: (Scalars['Int'] | null)
    /** Number of empty values for contactAutoCreationPolicy */
    countEmptyContactAutoCreationPolicy: (Scalars['Int'] | null)
    /** Number of non-empty values for contactAutoCreationPolicy */
    countNotEmptyContactAutoCreationPolicy: (Scalars['Int'] | null)
    /** Percentage of empty values for contactAutoCreationPolicy */
    percentageEmptyContactAutoCreationPolicy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for contactAutoCreationPolicy */
    percentageNotEmptyContactAutoCreationPolicy: (Scalars['Float'] | null)
    /** Number of unique values for excludeNonProfessionalEmails */
    countUniqueValuesExcludeNonProfessionalEmails: (Scalars['Int'] | null)
    /** Number of empty values for excludeNonProfessionalEmails */
    countEmptyExcludeNonProfessionalEmails: (Scalars['Int'] | null)
    /** Number of non-empty values for excludeNonProfessionalEmails */
    countNotEmptyExcludeNonProfessionalEmails: (Scalars['Int'] | null)
    /** Percentage of empty values for excludeNonProfessionalEmails */
    percentageEmptyExcludeNonProfessionalEmails: (Scalars['Float'] | null)
    /** Percentage of non-empty values for excludeNonProfessionalEmails */
    percentageNotEmptyExcludeNonProfessionalEmails: (Scalars['Float'] | null)
    /** Count of true values in the field excludeNonProfessionalEmails */
    countTrueExcludeNonProfessionalEmails: (Scalars['Int'] | null)
    /** Count of false values in the field excludeNonProfessionalEmails */
    countFalseExcludeNonProfessionalEmails: (Scalars['Int'] | null)
    /** Number of unique values for excludeGroupEmails */
    countUniqueValuesExcludeGroupEmails: (Scalars['Int'] | null)
    /** Number of empty values for excludeGroupEmails */
    countEmptyExcludeGroupEmails: (Scalars['Int'] | null)
    /** Number of non-empty values for excludeGroupEmails */
    countNotEmptyExcludeGroupEmails: (Scalars['Int'] | null)
    /** Percentage of empty values for excludeGroupEmails */
    percentageEmptyExcludeGroupEmails: (Scalars['Float'] | null)
    /** Percentage of non-empty values for excludeGroupEmails */
    percentageNotEmptyExcludeGroupEmails: (Scalars['Float'] | null)
    /** Count of true values in the field excludeGroupEmails */
    countTrueExcludeGroupEmails: (Scalars['Int'] | null)
    /** Count of false values in the field excludeGroupEmails */
    countFalseExcludeGroupEmails: (Scalars['Int'] | null)
    /** Number of unique values for isSyncEnabled */
    countUniqueValuesIsSyncEnabled: (Scalars['Int'] | null)
    /** Number of empty values for isSyncEnabled */
    countEmptyIsSyncEnabled: (Scalars['Int'] | null)
    /** Number of non-empty values for isSyncEnabled */
    countNotEmptyIsSyncEnabled: (Scalars['Int'] | null)
    /** Percentage of empty values for isSyncEnabled */
    percentageEmptyIsSyncEnabled: (Scalars['Float'] | null)
    /** Percentage of non-empty values for isSyncEnabled */
    percentageNotEmptyIsSyncEnabled: (Scalars['Float'] | null)
    /** Count of true values in the field isSyncEnabled */
    countTrueIsSyncEnabled: (Scalars['Int'] | null)
    /** Count of false values in the field isSyncEnabled */
    countFalseIsSyncEnabled: (Scalars['Int'] | null)
    /** Number of unique values for syncCursor */
    countUniqueValuesSyncCursor: (Scalars['Int'] | null)
    /** Number of empty values for syncCursor */
    countEmptySyncCursor: (Scalars['Int'] | null)
    /** Number of non-empty values for syncCursor */
    countNotEmptySyncCursor: (Scalars['Int'] | null)
    /** Percentage of empty values for syncCursor */
    percentageEmptySyncCursor: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncCursor */
    percentageNotEmptySyncCursor: (Scalars['Float'] | null)
    /** Number of unique values for syncedAt */
    countUniqueValuesSyncedAt: (Scalars['Int'] | null)
    /** Number of empty values for syncedAt */
    countEmptySyncedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for syncedAt */
    countNotEmptySyncedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for syncedAt */
    percentageEmptySyncedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncedAt */
    percentageNotEmptySyncedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field syncedAt */
    minSyncedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field syncedAt */
    maxSyncedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for syncStatus */
    countUniqueValuesSyncStatus: (Scalars['Int'] | null)
    /** Number of empty values for syncStatus */
    countEmptySyncStatus: (Scalars['Int'] | null)
    /** Number of non-empty values for syncStatus */
    countNotEmptySyncStatus: (Scalars['Int'] | null)
    /** Percentage of empty values for syncStatus */
    percentageEmptySyncStatus: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncStatus */
    percentageNotEmptySyncStatus: (Scalars['Float'] | null)
    /** Number of unique values for syncStage */
    countUniqueValuesSyncStage: (Scalars['Int'] | null)
    /** Number of empty values for syncStage */
    countEmptySyncStage: (Scalars['Int'] | null)
    /** Number of non-empty values for syncStage */
    countNotEmptySyncStage: (Scalars['Int'] | null)
    /** Percentage of empty values for syncStage */
    percentageEmptySyncStage: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncStage */
    percentageNotEmptySyncStage: (Scalars['Float'] | null)
    /** Number of unique values for syncStageStartedAt */
    countUniqueValuesSyncStageStartedAt: (Scalars['Int'] | null)
    /** Number of empty values for syncStageStartedAt */
    countEmptySyncStageStartedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for syncStageStartedAt */
    countNotEmptySyncStageStartedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for syncStageStartedAt */
    percentageEmptySyncStageStartedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncStageStartedAt */
    percentageNotEmptySyncStageStartedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field syncStageStartedAt */
    minSyncStageStartedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field syncStageStartedAt */
    maxSyncStageStartedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for throttleFailureCount */
    countUniqueValuesThrottleFailureCount: (Scalars['Int'] | null)
    /** Number of empty values for throttleFailureCount */
    countEmptyThrottleFailureCount: (Scalars['Int'] | null)
    /** Number of non-empty values for throttleFailureCount */
    countNotEmptyThrottleFailureCount: (Scalars['Int'] | null)
    /** Percentage of empty values for throttleFailureCount */
    percentageEmptyThrottleFailureCount: (Scalars['Float'] | null)
    /** Percentage of non-empty values for throttleFailureCount */
    percentageNotEmptyThrottleFailureCount: (Scalars['Float'] | null)
    /** Minimum amount contained in the field throttleFailureCount */
    minThrottleFailureCount: (Scalars['Float'] | null)
    /** Maximum amount contained in the field throttleFailureCount */
    maxThrottleFailureCount: (Scalars['Float'] | null)
    /** Average amount contained in the field throttleFailureCount */
    avgThrottleFailureCount: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field throttleFailureCount */
    sumThrottleFailureCount: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (MessageChannelEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'MessageChannelConnection'
}


/** Message Participants */
export interface MessageParticipantConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for role */
    countUniqueValuesRole: (Scalars['Int'] | null)
    /** Number of empty values for role */
    countEmptyRole: (Scalars['Int'] | null)
    /** Number of non-empty values for role */
    countNotEmptyRole: (Scalars['Int'] | null)
    /** Percentage of empty values for role */
    percentageEmptyRole: (Scalars['Float'] | null)
    /** Percentage of non-empty values for role */
    percentageNotEmptyRole: (Scalars['Float'] | null)
    /** Number of unique values for handle */
    countUniqueValuesHandle: (Scalars['Int'] | null)
    /** Number of empty values for handle */
    countEmptyHandle: (Scalars['Int'] | null)
    /** Number of non-empty values for handle */
    countNotEmptyHandle: (Scalars['Int'] | null)
    /** Percentage of empty values for handle */
    percentageEmptyHandle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle: (Scalars['Float'] | null)
    /** Number of unique values for displayName */
    countUniqueValuesDisplayName: (Scalars['Int'] | null)
    /** Number of empty values for displayName */
    countEmptyDisplayName: (Scalars['Int'] | null)
    /** Number of non-empty values for displayName */
    countNotEmptyDisplayName: (Scalars['Int'] | null)
    /** Percentage of empty values for displayName */
    percentageEmptyDisplayName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for displayName */
    percentageNotEmptyDisplayName: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (MessageParticipantEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'MessageParticipantConnection'
}


/** Folder for Message Channel */
export interface MessageFolderConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for syncCursor */
    countUniqueValuesSyncCursor: (Scalars['Int'] | null)
    /** Number of empty values for syncCursor */
    countEmptySyncCursor: (Scalars['Int'] | null)
    /** Number of non-empty values for syncCursor */
    countNotEmptySyncCursor: (Scalars['Int'] | null)
    /** Percentage of empty values for syncCursor */
    percentageEmptySyncCursor: (Scalars['Float'] | null)
    /** Percentage of non-empty values for syncCursor */
    percentageNotEmptySyncCursor: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (MessageFolderEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'MessageFolderConnection'
}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for messageExternalId */
    countUniqueValuesMessageExternalId: (Scalars['Int'] | null)
    /** Number of empty values for messageExternalId */
    countEmptyMessageExternalId: (Scalars['Int'] | null)
    /** Number of non-empty values for messageExternalId */
    countNotEmptyMessageExternalId: (Scalars['Int'] | null)
    /** Percentage of empty values for messageExternalId */
    percentageEmptyMessageExternalId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for messageExternalId */
    percentageNotEmptyMessageExternalId: (Scalars['Float'] | null)
    /** Number of unique values for messageThreadExternalId */
    countUniqueValuesMessageThreadExternalId: (Scalars['Int'] | null)
    /** Number of empty values for messageThreadExternalId */
    countEmptyMessageThreadExternalId: (Scalars['Int'] | null)
    /** Number of non-empty values for messageThreadExternalId */
    countNotEmptyMessageThreadExternalId: (Scalars['Int'] | null)
    /** Percentage of empty values for messageThreadExternalId */
    percentageEmptyMessageThreadExternalId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for messageThreadExternalId */
    percentageNotEmptyMessageThreadExternalId: (Scalars['Float'] | null)
    /** Number of unique values for direction */
    countUniqueValuesDirection: (Scalars['Int'] | null)
    /** Number of empty values for direction */
    countEmptyDirection: (Scalars['Int'] | null)
    /** Number of non-empty values for direction */
    countNotEmptyDirection: (Scalars['Int'] | null)
    /** Percentage of empty values for direction */
    percentageEmptyDirection: (Scalars['Float'] | null)
    /** Percentage of non-empty values for direction */
    percentageNotEmptyDirection: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (MessageChannelMessageAssociationEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'MessageChannelMessageAssociationConnection'
}


/** A note target */
export interface NoteTargetConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (NoteTargetEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'NoteTargetConnection'
}


/** An opportunity */
export interface OpportunityConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for amount */
    countUniqueValuesAmount: (Scalars['Int'] | null)
    /** Number of empty values for amount */
    countEmptyAmount: (Scalars['Int'] | null)
    /** Number of non-empty values for amount */
    countNotEmptyAmount: (Scalars['Int'] | null)
    /** Percentage of empty values for amount */
    percentageEmptyAmount: (Scalars['Float'] | null)
    /** Percentage of non-empty values for amount */
    percentageNotEmptyAmount: (Scalars['Float'] | null)
    /** Minimum amount contained in the field amount */
    minAmountAmountMicros: (Scalars['Float'] | null)
    /** Maximal amount contained in the field amount */
    maxAmountAmountMicros: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field amount */
    sumAmountAmountMicros: (Scalars['Float'] | null)
    /** Average amount contained in the field amount */
    avgAmountAmountMicros: (Scalars['Float'] | null)
    /** Number of unique values for closeDate */
    countUniqueValuesCloseDate: (Scalars['Int'] | null)
    /** Number of empty values for closeDate */
    countEmptyCloseDate: (Scalars['Int'] | null)
    /** Number of non-empty values for closeDate */
    countNotEmptyCloseDate: (Scalars['Int'] | null)
    /** Percentage of empty values for closeDate */
    percentageEmptyCloseDate: (Scalars['Float'] | null)
    /** Percentage of non-empty values for closeDate */
    percentageNotEmptyCloseDate: (Scalars['Float'] | null)
    /** Earliest date contained in the field closeDate */
    minCloseDate: (Scalars['DateTime'] | null)
    /** Latest date contained in the field closeDate */
    maxCloseDate: (Scalars['DateTime'] | null)
    /** Number of unique values for stage */
    countUniqueValuesStage: (Scalars['Int'] | null)
    /** Number of empty values for stage */
    countEmptyStage: (Scalars['Int'] | null)
    /** Number of non-empty values for stage */
    countNotEmptyStage: (Scalars['Int'] | null)
    /** Percentage of empty values for stage */
    percentageEmptyStage: (Scalars['Float'] | null)
    /** Percentage of non-empty values for stage */
    percentageNotEmptyStage: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (OpportunityEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'OpportunityConnection'
}


/** A person */
export interface PersonConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for emails */
    countUniqueValuesEmails: (Scalars['Int'] | null)
    /** Number of empty values for emails */
    countEmptyEmails: (Scalars['Int'] | null)
    /** Number of non-empty values for emails */
    countNotEmptyEmails: (Scalars['Int'] | null)
    /** Percentage of empty values for emails */
    percentageEmptyEmails: (Scalars['Float'] | null)
    /** Percentage of non-empty values for emails */
    percentageNotEmptyEmails: (Scalars['Float'] | null)
    /** Number of unique values for linkedinLink */
    countUniqueValuesLinkedinLink: (Scalars['Int'] | null)
    /** Number of empty values for linkedinLink */
    countEmptyLinkedinLink: (Scalars['Int'] | null)
    /** Number of non-empty values for linkedinLink */
    countNotEmptyLinkedinLink: (Scalars['Int'] | null)
    /** Percentage of empty values for linkedinLink */
    percentageEmptyLinkedinLink: (Scalars['Float'] | null)
    /** Percentage of non-empty values for linkedinLink */
    percentageNotEmptyLinkedinLink: (Scalars['Float'] | null)
    /** Number of unique values for xLink */
    countUniqueValuesXLink: (Scalars['Int'] | null)
    /** Number of empty values for xLink */
    countEmptyXLink: (Scalars['Int'] | null)
    /** Number of non-empty values for xLink */
    countNotEmptyXLink: (Scalars['Int'] | null)
    /** Percentage of empty values for xLink */
    percentageEmptyXLink: (Scalars['Float'] | null)
    /** Percentage of non-empty values for xLink */
    percentageNotEmptyXLink: (Scalars['Float'] | null)
    /** Number of unique values for jobTitle */
    countUniqueValuesJobTitle: (Scalars['Int'] | null)
    /** Number of empty values for jobTitle */
    countEmptyJobTitle: (Scalars['Int'] | null)
    /** Number of non-empty values for jobTitle */
    countNotEmptyJobTitle: (Scalars['Int'] | null)
    /** Percentage of empty values for jobTitle */
    percentageEmptyJobTitle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for jobTitle */
    percentageNotEmptyJobTitle: (Scalars['Float'] | null)
    /** Number of unique values for phones */
    countUniqueValuesPhones: (Scalars['Int'] | null)
    /** Number of empty values for phones */
    countEmptyPhones: (Scalars['Int'] | null)
    /** Number of non-empty values for phones */
    countNotEmptyPhones: (Scalars['Int'] | null)
    /** Percentage of empty values for phones */
    percentageEmptyPhones: (Scalars['Float'] | null)
    /** Percentage of non-empty values for phones */
    percentageNotEmptyPhones: (Scalars['Float'] | null)
    /** Number of unique values for city */
    countUniqueValuesCity: (Scalars['Int'] | null)
    /** Number of empty values for city */
    countEmptyCity: (Scalars['Int'] | null)
    /** Number of non-empty values for city */
    countNotEmptyCity: (Scalars['Int'] | null)
    /** Percentage of empty values for city */
    percentageEmptyCity: (Scalars['Float'] | null)
    /** Percentage of non-empty values for city */
    percentageNotEmptyCity: (Scalars['Float'] | null)
    /** Number of unique values for avatarUrl */
    countUniqueValuesAvatarUrl: (Scalars['Int'] | null)
    /** Number of empty values for avatarUrl */
    countEmptyAvatarUrl: (Scalars['Int'] | null)
    /** Number of non-empty values for avatarUrl */
    countNotEmptyAvatarUrl: (Scalars['Int'] | null)
    /** Percentage of empty values for avatarUrl */
    percentageEmptyAvatarUrl: (Scalars['Float'] | null)
    /** Percentage of non-empty values for avatarUrl */
    percentageNotEmptyAvatarUrl: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for intro */
    countUniqueValuesIntro: (Scalars['Int'] | null)
    /** Number of empty values for intro */
    countEmptyIntro: (Scalars['Int'] | null)
    /** Number of non-empty values for intro */
    countNotEmptyIntro: (Scalars['Int'] | null)
    /** Percentage of empty values for intro */
    percentageEmptyIntro: (Scalars['Float'] | null)
    /** Percentage of non-empty values for intro */
    percentageNotEmptyIntro: (Scalars['Float'] | null)
    /** Number of unique values for whatsapp */
    countUniqueValuesWhatsapp: (Scalars['Int'] | null)
    /** Number of empty values for whatsapp */
    countEmptyWhatsapp: (Scalars['Int'] | null)
    /** Number of non-empty values for whatsapp */
    countNotEmptyWhatsapp: (Scalars['Int'] | null)
    /** Percentage of empty values for whatsapp */
    percentageEmptyWhatsapp: (Scalars['Float'] | null)
    /** Percentage of non-empty values for whatsapp */
    percentageNotEmptyWhatsapp: (Scalars['Float'] | null)
    /** Number of unique values for workPreference */
    countUniqueValuesWorkPreference: (Scalars['Int'] | null)
    /** Number of empty values for workPreference */
    countEmptyWorkPreference: (Scalars['Int'] | null)
    /** Number of non-empty values for workPreference */
    countNotEmptyWorkPreference: (Scalars['Int'] | null)
    /** Percentage of empty values for workPreference */
    percentageEmptyWorkPreference: (Scalars['Float'] | null)
    /** Percentage of non-empty values for workPreference */
    percentageNotEmptyWorkPreference: (Scalars['Float'] | null)
    /** Number of unique values for performanceRating */
    countUniqueValuesPerformanceRating: (Scalars['Int'] | null)
    /** Number of empty values for performanceRating */
    countEmptyPerformanceRating: (Scalars['Int'] | null)
    /** Number of non-empty values for performanceRating */
    countNotEmptyPerformanceRating: (Scalars['Int'] | null)
    /** Percentage of empty values for performanceRating */
    percentageEmptyPerformanceRating: (Scalars['Float'] | null)
    /** Percentage of non-empty values for performanceRating */
    percentageNotEmptyPerformanceRating: (Scalars['Float'] | null)
    edges: (PersonEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'PersonConnection'
}


/** A task */
export interface TaskConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for title */
    countUniqueValuesTitle: (Scalars['Int'] | null)
    /** Number of empty values for title */
    countEmptyTitle: (Scalars['Int'] | null)
    /** Number of non-empty values for title */
    countNotEmptyTitle: (Scalars['Int'] | null)
    /** Percentage of empty values for title */
    percentageEmptyTitle: (Scalars['Float'] | null)
    /** Percentage of non-empty values for title */
    percentageNotEmptyTitle: (Scalars['Float'] | null)
    /** Number of unique values for body */
    countUniqueValuesBody: (Scalars['Int'] | null)
    /** Number of empty values for body */
    countEmptyBody: (Scalars['Int'] | null)
    /** Number of non-empty values for body */
    countNotEmptyBody: (Scalars['Int'] | null)
    /** Percentage of empty values for body */
    percentageEmptyBody: (Scalars['Float'] | null)
    /** Percentage of non-empty values for body */
    percentageNotEmptyBody: (Scalars['Float'] | null)
    /** Number of unique values for bodyV2 */
    countUniqueValuesBodyV2: (Scalars['Int'] | null)
    /** Number of empty values for bodyV2 */
    countEmptyBodyV2: (Scalars['Int'] | null)
    /** Number of non-empty values for bodyV2 */
    countNotEmptyBodyV2: (Scalars['Int'] | null)
    /** Percentage of empty values for bodyV2 */
    percentageEmptyBodyV2: (Scalars['Float'] | null)
    /** Percentage of non-empty values for bodyV2 */
    percentageNotEmptyBodyV2: (Scalars['Float'] | null)
    /** Number of unique values for dueAt */
    countUniqueValuesDueAt: (Scalars['Int'] | null)
    /** Number of empty values for dueAt */
    countEmptyDueAt: (Scalars['Int'] | null)
    /** Number of non-empty values for dueAt */
    countNotEmptyDueAt: (Scalars['Int'] | null)
    /** Percentage of empty values for dueAt */
    percentageEmptyDueAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for dueAt */
    percentageNotEmptyDueAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field dueAt */
    minDueAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field dueAt */
    maxDueAt: (Scalars['DateTime'] | null)
    /** Number of unique values for status */
    countUniqueValuesStatus: (Scalars['Int'] | null)
    /** Number of empty values for status */
    countEmptyStatus: (Scalars['Int'] | null)
    /** Number of non-empty values for status */
    countNotEmptyStatus: (Scalars['Int'] | null)
    /** Percentage of empty values for status */
    percentageEmptyStatus: (Scalars['Float'] | null)
    /** Percentage of non-empty values for status */
    percentageNotEmptyStatus: (Scalars['Float'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    edges: (TaskEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'TaskConnection'
}


/** A rocket */
export interface RocketConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    edges: (RocketEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'RocketConnection'
}

export interface SurveyResultConnection {
    /** Total number of records in the connection */
    totalCount: (Scalars['Int'] | null)
    /** Number of unique values for id */
    countUniqueValuesId: (Scalars['Int'] | null)
    /** Number of empty values for id */
    countEmptyId: (Scalars['Int'] | null)
    /** Number of non-empty values for id */
    countNotEmptyId: (Scalars['Int'] | null)
    /** Percentage of empty values for id */
    percentageEmptyId: (Scalars['Float'] | null)
    /** Percentage of non-empty values for id */
    percentageNotEmptyId: (Scalars['Float'] | null)
    /** Number of unique values for name */
    countUniqueValuesName: (Scalars['Int'] | null)
    /** Number of empty values for name */
    countEmptyName: (Scalars['Int'] | null)
    /** Number of non-empty values for name */
    countNotEmptyName: (Scalars['Int'] | null)
    /** Percentage of empty values for name */
    percentageEmptyName: (Scalars['Float'] | null)
    /** Percentage of non-empty values for name */
    percentageNotEmptyName: (Scalars['Float'] | null)
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt: (Scalars['Int'] | null)
    /** Number of empty values for createdAt */
    countEmptyCreatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field createdAt */
    minCreatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field createdAt */
    maxCreatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt: (Scalars['Int'] | null)
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt: (Scalars['Int'] | null)
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt: (Scalars['Int'] | null)
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt: (Scalars['Int'] | null)
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt: (Scalars['Float'] | null)
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt: (Scalars['Float'] | null)
    /** Earliest date contained in the field deletedAt */
    minDeletedAt: (Scalars['DateTime'] | null)
    /** Latest date contained in the field deletedAt */
    maxDeletedAt: (Scalars['DateTime'] | null)
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy: (Scalars['Int'] | null)
    /** Number of empty values for createdBy */
    countEmptyCreatedBy: (Scalars['Int'] | null)
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy: (Scalars['Int'] | null)
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy: (Scalars['Float'] | null)
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy: (Scalars['Float'] | null)
    /** Number of unique values for position */
    countUniqueValuesPosition: (Scalars['Int'] | null)
    /** Number of empty values for position */
    countEmptyPosition: (Scalars['Int'] | null)
    /** Number of non-empty values for position */
    countNotEmptyPosition: (Scalars['Int'] | null)
    /** Percentage of empty values for position */
    percentageEmptyPosition: (Scalars['Float'] | null)
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition: (Scalars['Float'] | null)
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector: (Scalars['Int'] | null)
    /** Number of empty values for searchVector */
    countEmptySearchVector: (Scalars['Int'] | null)
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector: (Scalars['Int'] | null)
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector: (Scalars['Float'] | null)
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector: (Scalars['Float'] | null)
    /** Number of unique values for score */
    countUniqueValuesScore: (Scalars['Int'] | null)
    /** Number of empty values for score */
    countEmptyScore: (Scalars['Int'] | null)
    /** Number of non-empty values for score */
    countNotEmptyScore: (Scalars['Int'] | null)
    /** Percentage of empty values for score */
    percentageEmptyScore: (Scalars['Float'] | null)
    /** Percentage of non-empty values for score */
    percentageNotEmptyScore: (Scalars['Float'] | null)
    /** Minimum amount contained in the field score */
    minScore: (Scalars['Float'] | null)
    /** Maximum amount contained in the field score */
    maxScore: (Scalars['Float'] | null)
    /** Average amount contained in the field score */
    avgScore: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field score */
    sumScore: (Scalars['Float'] | null)
    /** Number of unique values for percentageOfCompletion */
    countUniqueValuesPercentageOfCompletion: (Scalars['Int'] | null)
    /** Number of empty values for percentageOfCompletion */
    countEmptyPercentageOfCompletion: (Scalars['Int'] | null)
    /** Number of non-empty values for percentageOfCompletion */
    countNotEmptyPercentageOfCompletion: (Scalars['Int'] | null)
    /** Percentage of empty values for percentageOfCompletion */
    percentageEmptyPercentageOfCompletion: (Scalars['Float'] | null)
    /** Percentage of non-empty values for percentageOfCompletion */
    percentageNotEmptyPercentageOfCompletion: (Scalars['Float'] | null)
    /** Minimum amount contained in the field percentageOfCompletion */
    minPercentageOfCompletion: (Scalars['Float'] | null)
    /** Maximum amount contained in the field percentageOfCompletion */
    maxPercentageOfCompletion: (Scalars['Float'] | null)
    /** Average amount contained in the field percentageOfCompletion */
    avgPercentageOfCompletion: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field percentageOfCompletion */
    sumPercentageOfCompletion: (Scalars['Float'] | null)
    /** Number of unique values for participants */
    countUniqueValuesParticipants: (Scalars['Int'] | null)
    /** Number of empty values for participants */
    countEmptyParticipants: (Scalars['Int'] | null)
    /** Number of non-empty values for participants */
    countNotEmptyParticipants: (Scalars['Int'] | null)
    /** Percentage of empty values for participants */
    percentageEmptyParticipants: (Scalars['Float'] | null)
    /** Percentage of non-empty values for participants */
    percentageNotEmptyParticipants: (Scalars['Float'] | null)
    /** Minimum amount contained in the field participants */
    minParticipants: (Scalars['Float'] | null)
    /** Maximum amount contained in the field participants */
    maxParticipants: (Scalars['Float'] | null)
    /** Average amount contained in the field participants */
    avgParticipants: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field participants */
    sumParticipants: (Scalars['Float'] | null)
    /** Number of unique values for averageEstimatedNumberOfAtomsInTheUniverse */
    countUniqueValuesAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Int'] | null)
    /** Number of empty values for averageEstimatedNumberOfAtomsInTheUniverse */
    countEmptyAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Int'] | null)
    /** Number of non-empty values for averageEstimatedNumberOfAtomsInTheUniverse */
    countNotEmptyAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Int'] | null)
    /** Percentage of empty values for averageEstimatedNumberOfAtomsInTheUniverse */
    percentageEmptyAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Float'] | null)
    /** Percentage of non-empty values for averageEstimatedNumberOfAtomsInTheUniverse */
    percentageNotEmptyAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Float'] | null)
    /** Minimum amount contained in the field averageEstimatedNumberOfAtomsInTheUniverse */
    minAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Float'] | null)
    /** Maximum amount contained in the field averageEstimatedNumberOfAtomsInTheUniverse */
    maxAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Float'] | null)
    /** Average amount contained in the field averageEstimatedNumberOfAtomsInTheUniverse */
    avgAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Float'] | null)
    /** Sum of amounts contained in the field averageEstimatedNumberOfAtomsInTheUniverse */
    sumAverageEstimatedNumberOfAtomsInTheUniverse: (Scalars['Float'] | null)
    /** Number of unique values for comments */
    countUniqueValuesComments: (Scalars['Int'] | null)
    /** Number of empty values for comments */
    countEmptyComments: (Scalars['Int'] | null)
    /** Number of non-empty values for comments */
    countNotEmptyComments: (Scalars['Int'] | null)
    /** Percentage of empty values for comments */
    percentageEmptyComments: (Scalars['Float'] | null)
    /** Percentage of non-empty values for comments */
    percentageNotEmptyComments: (Scalars['Float'] | null)
    /** Number of unique values for shortNotes */
    countUniqueValuesShortNotes: (Scalars['Int'] | null)
    /** Number of empty values for shortNotes */
    countEmptyShortNotes: (Scalars['Int'] | null)
    /** Number of non-empty values for shortNotes */
    countNotEmptyShortNotes: (Scalars['Int'] | null)
    /** Percentage of empty values for shortNotes */
    percentageEmptyShortNotes: (Scalars['Float'] | null)
    /** Percentage of non-empty values for shortNotes */
    percentageNotEmptyShortNotes: (Scalars['Float'] | null)
    edges: (SurveyResultEdge[] | null)
    pageInfo: (PageInfo | null)
    __typename: 'SurveyResultConnection'
}


/** This enum to filter by nullability */
export type FilterIs = 'NULL' | 'NOT_NULL'


/** This enum is used to specify the order of results */
export type OrderByDirection = 'AscNullsFirst' | 'AscNullsLast' | 'DescNullsFirst' | 'DescNullsLast'

export interface Query {
    apiKeys: (ApiKeyConnection | null)
    apiKey: (ApiKey | null)
    attachments: (AttachmentConnection | null)
    attachment: (Attachment | null)
    pets: (PetConnection | null)
    pet: (Pet | null)
    blocklists: (BlocklistConnection | null)
    blocklist: (Blocklist | null)
    calendarEvents: (CalendarEventConnection | null)
    calendarEvent: (CalendarEvent | null)
    calendarChannels: (CalendarChannelConnection | null)
    calendarChannel: (CalendarChannel | null)
    calendarChannelEventAssociations: (CalendarChannelEventAssociationConnection | null)
    calendarChannelEventAssociation: (CalendarChannelEventAssociation | null)
    calendarEventParticipants: (CalendarEventParticipantConnection | null)
    calendarEventParticipant: (CalendarEventParticipant | null)
    companies: (CompanyConnection | null)
    company: (Company | null)
    companyDuplicates: (CompanyConnection[] | null)
    connectedAccounts: (ConnectedAccountConnection | null)
    connectedAccount: (ConnectedAccount | null)
    favorites: (FavoriteConnection | null)
    favorite: (Favorite | null)
    favoriteFolders: (FavoriteFolderConnection | null)
    favoriteFolder: (FavoriteFolder | null)
    timelineActivities: (TimelineActivityConnection | null)
    timelineActivity: (TimelineActivity | null)
    viewFields: (ViewFieldConnection | null)
    viewField: (ViewField | null)
    viewFilterGroups: (ViewFilterGroupConnection | null)
    viewFilterGroup: (ViewFilterGroup | null)
    viewGroups: (ViewGroupConnection | null)
    viewGroup: (ViewGroup | null)
    viewFilters: (ViewFilterConnection | null)
    viewFilter: (ViewFilter | null)
    viewSorts: (ViewSortConnection | null)
    viewSort: (ViewSort | null)
    views: (ViewConnection | null)
    view: (View | null)
    webhooks: (WebhookConnection | null)
    webhook: (Webhook | null)
    workflows: (WorkflowConnection | null)
    workflow: (Workflow | null)
    workflowVersions: (WorkflowVersionConnection | null)
    workflowVersion: (WorkflowVersion | null)
    workflowRuns: (WorkflowRunConnection | null)
    workflowRun: (WorkflowRun | null)
    workflowAutomatedTriggers: (WorkflowAutomatedTriggerConnection | null)
    workflowAutomatedTrigger: (WorkflowAutomatedTrigger | null)
    workspaceMembers: (WorkspaceMemberConnection | null)
    workspaceMember: (WorkspaceMember | null)
    notes: (NoteConnection | null)
    note: (Note | null)
    taskTargets: (TaskTargetConnection | null)
    taskTarget: (TaskTarget | null)
    messageThreads: (MessageThreadConnection | null)
    messageThread: (MessageThread | null)
    messages: (MessageConnection | null)
    message: (Message | null)
    messageChannels: (MessageChannelConnection | null)
    messageChannel: (MessageChannel | null)
    messageParticipants: (MessageParticipantConnection | null)
    messageParticipant: (MessageParticipant | null)
    messageFolders: (MessageFolderConnection | null)
    messageFolder: (MessageFolder | null)
    messageChannelMessageAssociations: (MessageChannelMessageAssociationConnection | null)
    messageChannelMessageAssociation: (MessageChannelMessageAssociation | null)
    noteTargets: (NoteTargetConnection | null)
    noteTarget: (NoteTarget | null)
    opportunities: (OpportunityConnection | null)
    opportunity: (Opportunity | null)
    people: (PersonConnection | null)
    person: (Person | null)
    personDuplicates: (PersonConnection[] | null)
    tasks: (TaskConnection | null)
    task: (Task | null)
    rockets: (RocketConnection | null)
    rocket: (Rocket | null)
    surveyResults: (SurveyResultConnection | null)
    surveyResult: (SurveyResult | null)
    __typename: 'Query'
}

export interface Mutation {
    createApiKeys: (ApiKey[] | null)
    createApiKey: (ApiKey | null)
    updateApiKey: (ApiKey | null)
    deleteApiKey: (ApiKey | null)
    updateApiKeys: (ApiKey[] | null)
    deleteApiKeys: (ApiKey[] | null)
    destroyApiKey: (ApiKey | null)
    destroyApiKeys: (ApiKey[] | null)
    restoreApiKey: (ApiKey | null)
    restoreApiKeys: (ApiKey[] | null)
    createAttachments: (Attachment[] | null)
    createAttachment: (Attachment | null)
    updateAttachment: (Attachment | null)
    deleteAttachment: (Attachment | null)
    updateAttachments: (Attachment[] | null)
    deleteAttachments: (Attachment[] | null)
    destroyAttachment: (Attachment | null)
    destroyAttachments: (Attachment[] | null)
    restoreAttachment: (Attachment | null)
    restoreAttachments: (Attachment[] | null)
    createPets: (Pet[] | null)
    createPet: (Pet | null)
    updatePet: (Pet | null)
    deletePet: (Pet | null)
    updatePets: (Pet[] | null)
    deletePets: (Pet[] | null)
    destroyPet: (Pet | null)
    destroyPets: (Pet[] | null)
    restorePet: (Pet | null)
    restorePets: (Pet[] | null)
    createBlocklists: (Blocklist[] | null)
    createBlocklist: (Blocklist | null)
    updateBlocklist: (Blocklist | null)
    deleteBlocklist: (Blocklist | null)
    updateBlocklists: (Blocklist[] | null)
    deleteBlocklists: (Blocklist[] | null)
    destroyBlocklist: (Blocklist | null)
    destroyBlocklists: (Blocklist[] | null)
    restoreBlocklist: (Blocklist | null)
    restoreBlocklists: (Blocklist[] | null)
    createCalendarEvents: (CalendarEvent[] | null)
    createCalendarEvent: (CalendarEvent | null)
    updateCalendarEvent: (CalendarEvent | null)
    deleteCalendarEvent: (CalendarEvent | null)
    updateCalendarEvents: (CalendarEvent[] | null)
    deleteCalendarEvents: (CalendarEvent[] | null)
    destroyCalendarEvent: (CalendarEvent | null)
    destroyCalendarEvents: (CalendarEvent[] | null)
    restoreCalendarEvent: (CalendarEvent | null)
    restoreCalendarEvents: (CalendarEvent[] | null)
    createCalendarChannels: (CalendarChannel[] | null)
    createCalendarChannel: (CalendarChannel | null)
    updateCalendarChannel: (CalendarChannel | null)
    deleteCalendarChannel: (CalendarChannel | null)
    updateCalendarChannels: (CalendarChannel[] | null)
    deleteCalendarChannels: (CalendarChannel[] | null)
    destroyCalendarChannel: (CalendarChannel | null)
    destroyCalendarChannels: (CalendarChannel[] | null)
    restoreCalendarChannel: (CalendarChannel | null)
    restoreCalendarChannels: (CalendarChannel[] | null)
    createCalendarChannelEventAssociations: (CalendarChannelEventAssociation[] | null)
    createCalendarChannelEventAssociation: (CalendarChannelEventAssociation | null)
    updateCalendarChannelEventAssociation: (CalendarChannelEventAssociation | null)
    deleteCalendarChannelEventAssociation: (CalendarChannelEventAssociation | null)
    updateCalendarChannelEventAssociations: (CalendarChannelEventAssociation[] | null)
    deleteCalendarChannelEventAssociations: (CalendarChannelEventAssociation[] | null)
    destroyCalendarChannelEventAssociation: (CalendarChannelEventAssociation | null)
    destroyCalendarChannelEventAssociations: (CalendarChannelEventAssociation[] | null)
    restoreCalendarChannelEventAssociation: (CalendarChannelEventAssociation | null)
    restoreCalendarChannelEventAssociations: (CalendarChannelEventAssociation[] | null)
    createCalendarEventParticipants: (CalendarEventParticipant[] | null)
    createCalendarEventParticipant: (CalendarEventParticipant | null)
    updateCalendarEventParticipant: (CalendarEventParticipant | null)
    deleteCalendarEventParticipant: (CalendarEventParticipant | null)
    updateCalendarEventParticipants: (CalendarEventParticipant[] | null)
    deleteCalendarEventParticipants: (CalendarEventParticipant[] | null)
    destroyCalendarEventParticipant: (CalendarEventParticipant | null)
    destroyCalendarEventParticipants: (CalendarEventParticipant[] | null)
    restoreCalendarEventParticipant: (CalendarEventParticipant | null)
    restoreCalendarEventParticipants: (CalendarEventParticipant[] | null)
    createCompanies: (Company[] | null)
    createCompany: (Company | null)
    updateCompany: (Company | null)
    deleteCompany: (Company | null)
    updateCompanies: (Company[] | null)
    deleteCompanies: (Company[] | null)
    destroyCompany: (Company | null)
    destroyCompanies: (Company[] | null)
    restoreCompany: (Company | null)
    restoreCompanies: (Company[] | null)
    createConnectedAccounts: (ConnectedAccount[] | null)
    createConnectedAccount: (ConnectedAccount | null)
    updateConnectedAccount: (ConnectedAccount | null)
    deleteConnectedAccount: (ConnectedAccount | null)
    updateConnectedAccounts: (ConnectedAccount[] | null)
    deleteConnectedAccounts: (ConnectedAccount[] | null)
    destroyConnectedAccount: (ConnectedAccount | null)
    destroyConnectedAccounts: (ConnectedAccount[] | null)
    restoreConnectedAccount: (ConnectedAccount | null)
    restoreConnectedAccounts: (ConnectedAccount[] | null)
    createFavorites: (Favorite[] | null)
    createFavorite: (Favorite | null)
    updateFavorite: (Favorite | null)
    deleteFavorite: (Favorite | null)
    updateFavorites: (Favorite[] | null)
    deleteFavorites: (Favorite[] | null)
    destroyFavorite: (Favorite | null)
    destroyFavorites: (Favorite[] | null)
    restoreFavorite: (Favorite | null)
    restoreFavorites: (Favorite[] | null)
    createFavoriteFolders: (FavoriteFolder[] | null)
    createFavoriteFolder: (FavoriteFolder | null)
    updateFavoriteFolder: (FavoriteFolder | null)
    deleteFavoriteFolder: (FavoriteFolder | null)
    updateFavoriteFolders: (FavoriteFolder[] | null)
    deleteFavoriteFolders: (FavoriteFolder[] | null)
    destroyFavoriteFolder: (FavoriteFolder | null)
    destroyFavoriteFolders: (FavoriteFolder[] | null)
    restoreFavoriteFolder: (FavoriteFolder | null)
    restoreFavoriteFolders: (FavoriteFolder[] | null)
    createTimelineActivities: (TimelineActivity[] | null)
    createTimelineActivity: (TimelineActivity | null)
    updateTimelineActivity: (TimelineActivity | null)
    deleteTimelineActivity: (TimelineActivity | null)
    updateTimelineActivities: (TimelineActivity[] | null)
    deleteTimelineActivities: (TimelineActivity[] | null)
    destroyTimelineActivity: (TimelineActivity | null)
    destroyTimelineActivities: (TimelineActivity[] | null)
    restoreTimelineActivity: (TimelineActivity | null)
    restoreTimelineActivities: (TimelineActivity[] | null)
    createViewFields: (ViewField[] | null)
    createViewField: (ViewField | null)
    updateViewField: (ViewField | null)
    deleteViewField: (ViewField | null)
    updateViewFields: (ViewField[] | null)
    deleteViewFields: (ViewField[] | null)
    destroyViewField: (ViewField | null)
    destroyViewFields: (ViewField[] | null)
    restoreViewField: (ViewField | null)
    restoreViewFields: (ViewField[] | null)
    createViewFilterGroups: (ViewFilterGroup[] | null)
    createViewFilterGroup: (ViewFilterGroup | null)
    updateViewFilterGroup: (ViewFilterGroup | null)
    deleteViewFilterGroup: (ViewFilterGroup | null)
    updateViewFilterGroups: (ViewFilterGroup[] | null)
    deleteViewFilterGroups: (ViewFilterGroup[] | null)
    destroyViewFilterGroup: (ViewFilterGroup | null)
    destroyViewFilterGroups: (ViewFilterGroup[] | null)
    restoreViewFilterGroup: (ViewFilterGroup | null)
    restoreViewFilterGroups: (ViewFilterGroup[] | null)
    createViewGroups: (ViewGroup[] | null)
    createViewGroup: (ViewGroup | null)
    updateViewGroup: (ViewGroup | null)
    deleteViewGroup: (ViewGroup | null)
    updateViewGroups: (ViewGroup[] | null)
    deleteViewGroups: (ViewGroup[] | null)
    destroyViewGroup: (ViewGroup | null)
    destroyViewGroups: (ViewGroup[] | null)
    restoreViewGroup: (ViewGroup | null)
    restoreViewGroups: (ViewGroup[] | null)
    createViewFilters: (ViewFilter[] | null)
    createViewFilter: (ViewFilter | null)
    updateViewFilter: (ViewFilter | null)
    deleteViewFilter: (ViewFilter | null)
    updateViewFilters: (ViewFilter[] | null)
    deleteViewFilters: (ViewFilter[] | null)
    destroyViewFilter: (ViewFilter | null)
    destroyViewFilters: (ViewFilter[] | null)
    restoreViewFilter: (ViewFilter | null)
    restoreViewFilters: (ViewFilter[] | null)
    createViewSorts: (ViewSort[] | null)
    createViewSort: (ViewSort | null)
    updateViewSort: (ViewSort | null)
    deleteViewSort: (ViewSort | null)
    updateViewSorts: (ViewSort[] | null)
    deleteViewSorts: (ViewSort[] | null)
    destroyViewSort: (ViewSort | null)
    destroyViewSorts: (ViewSort[] | null)
    restoreViewSort: (ViewSort | null)
    restoreViewSorts: (ViewSort[] | null)
    createViews: (View[] | null)
    createView: (View | null)
    updateView: (View | null)
    deleteView: (View | null)
    updateViews: (View[] | null)
    deleteViews: (View[] | null)
    destroyView: (View | null)
    destroyViews: (View[] | null)
    restoreView: (View | null)
    restoreViews: (View[] | null)
    createWebhooks: (Webhook[] | null)
    createWebhook: (Webhook | null)
    updateWebhook: (Webhook | null)
    deleteWebhook: (Webhook | null)
    updateWebhooks: (Webhook[] | null)
    deleteWebhooks: (Webhook[] | null)
    destroyWebhook: (Webhook | null)
    destroyWebhooks: (Webhook[] | null)
    restoreWebhook: (Webhook | null)
    restoreWebhooks: (Webhook[] | null)
    createWorkflows: (Workflow[] | null)
    createWorkflow: (Workflow | null)
    updateWorkflow: (Workflow | null)
    deleteWorkflow: (Workflow | null)
    updateWorkflows: (Workflow[] | null)
    deleteWorkflows: (Workflow[] | null)
    destroyWorkflow: (Workflow | null)
    destroyWorkflows: (Workflow[] | null)
    restoreWorkflow: (Workflow | null)
    restoreWorkflows: (Workflow[] | null)
    createWorkflowVersions: (WorkflowVersion[] | null)
    createWorkflowVersion: (WorkflowVersion | null)
    updateWorkflowVersion: (WorkflowVersion | null)
    deleteWorkflowVersion: (WorkflowVersion | null)
    updateWorkflowVersions: (WorkflowVersion[] | null)
    deleteWorkflowVersions: (WorkflowVersion[] | null)
    destroyWorkflowVersion: (WorkflowVersion | null)
    destroyWorkflowVersions: (WorkflowVersion[] | null)
    restoreWorkflowVersion: (WorkflowVersion | null)
    restoreWorkflowVersions: (WorkflowVersion[] | null)
    createWorkflowRuns: (WorkflowRun[] | null)
    createWorkflowRun: (WorkflowRun | null)
    updateWorkflowRun: (WorkflowRun | null)
    deleteWorkflowRun: (WorkflowRun | null)
    updateWorkflowRuns: (WorkflowRun[] | null)
    deleteWorkflowRuns: (WorkflowRun[] | null)
    destroyWorkflowRun: (WorkflowRun | null)
    destroyWorkflowRuns: (WorkflowRun[] | null)
    restoreWorkflowRun: (WorkflowRun | null)
    restoreWorkflowRuns: (WorkflowRun[] | null)
    createWorkflowAutomatedTriggers: (WorkflowAutomatedTrigger[] | null)
    createWorkflowAutomatedTrigger: (WorkflowAutomatedTrigger | null)
    updateWorkflowAutomatedTrigger: (WorkflowAutomatedTrigger | null)
    deleteWorkflowAutomatedTrigger: (WorkflowAutomatedTrigger | null)
    updateWorkflowAutomatedTriggers: (WorkflowAutomatedTrigger[] | null)
    deleteWorkflowAutomatedTriggers: (WorkflowAutomatedTrigger[] | null)
    destroyWorkflowAutomatedTrigger: (WorkflowAutomatedTrigger | null)
    destroyWorkflowAutomatedTriggers: (WorkflowAutomatedTrigger[] | null)
    restoreWorkflowAutomatedTrigger: (WorkflowAutomatedTrigger | null)
    restoreWorkflowAutomatedTriggers: (WorkflowAutomatedTrigger[] | null)
    createWorkspaceMembers: (WorkspaceMember[] | null)
    createWorkspaceMember: (WorkspaceMember | null)
    updateWorkspaceMember: (WorkspaceMember | null)
    deleteWorkspaceMember: (WorkspaceMember | null)
    updateWorkspaceMembers: (WorkspaceMember[] | null)
    deleteWorkspaceMembers: (WorkspaceMember[] | null)
    destroyWorkspaceMember: (WorkspaceMember | null)
    destroyWorkspaceMembers: (WorkspaceMember[] | null)
    restoreWorkspaceMember: (WorkspaceMember | null)
    restoreWorkspaceMembers: (WorkspaceMember[] | null)
    createNotes: (Note[] | null)
    createNote: (Note | null)
    updateNote: (Note | null)
    deleteNote: (Note | null)
    updateNotes: (Note[] | null)
    deleteNotes: (Note[] | null)
    destroyNote: (Note | null)
    destroyNotes: (Note[] | null)
    restoreNote: (Note | null)
    restoreNotes: (Note[] | null)
    createTaskTargets: (TaskTarget[] | null)
    createTaskTarget: (TaskTarget | null)
    updateTaskTarget: (TaskTarget | null)
    deleteTaskTarget: (TaskTarget | null)
    updateTaskTargets: (TaskTarget[] | null)
    deleteTaskTargets: (TaskTarget[] | null)
    destroyTaskTarget: (TaskTarget | null)
    destroyTaskTargets: (TaskTarget[] | null)
    restoreTaskTarget: (TaskTarget | null)
    restoreTaskTargets: (TaskTarget[] | null)
    createMessageThreads: (MessageThread[] | null)
    createMessageThread: (MessageThread | null)
    updateMessageThread: (MessageThread | null)
    deleteMessageThread: (MessageThread | null)
    updateMessageThreads: (MessageThread[] | null)
    deleteMessageThreads: (MessageThread[] | null)
    destroyMessageThread: (MessageThread | null)
    destroyMessageThreads: (MessageThread[] | null)
    restoreMessageThread: (MessageThread | null)
    restoreMessageThreads: (MessageThread[] | null)
    createMessages: (Message[] | null)
    createMessage: (Message | null)
    updateMessage: (Message | null)
    deleteMessage: (Message | null)
    updateMessages: (Message[] | null)
    deleteMessages: (Message[] | null)
    destroyMessage: (Message | null)
    destroyMessages: (Message[] | null)
    restoreMessage: (Message | null)
    restoreMessages: (Message[] | null)
    createMessageChannels: (MessageChannel[] | null)
    createMessageChannel: (MessageChannel | null)
    updateMessageChannel: (MessageChannel | null)
    deleteMessageChannel: (MessageChannel | null)
    updateMessageChannels: (MessageChannel[] | null)
    deleteMessageChannels: (MessageChannel[] | null)
    destroyMessageChannel: (MessageChannel | null)
    destroyMessageChannels: (MessageChannel[] | null)
    restoreMessageChannel: (MessageChannel | null)
    restoreMessageChannels: (MessageChannel[] | null)
    createMessageParticipants: (MessageParticipant[] | null)
    createMessageParticipant: (MessageParticipant | null)
    updateMessageParticipant: (MessageParticipant | null)
    deleteMessageParticipant: (MessageParticipant | null)
    updateMessageParticipants: (MessageParticipant[] | null)
    deleteMessageParticipants: (MessageParticipant[] | null)
    destroyMessageParticipant: (MessageParticipant | null)
    destroyMessageParticipants: (MessageParticipant[] | null)
    restoreMessageParticipant: (MessageParticipant | null)
    restoreMessageParticipants: (MessageParticipant[] | null)
    createMessageFolders: (MessageFolder[] | null)
    createMessageFolder: (MessageFolder | null)
    updateMessageFolder: (MessageFolder | null)
    deleteMessageFolder: (MessageFolder | null)
    updateMessageFolders: (MessageFolder[] | null)
    deleteMessageFolders: (MessageFolder[] | null)
    destroyMessageFolder: (MessageFolder | null)
    destroyMessageFolders: (MessageFolder[] | null)
    restoreMessageFolder: (MessageFolder | null)
    restoreMessageFolders: (MessageFolder[] | null)
    createMessageChannelMessageAssociations: (MessageChannelMessageAssociation[] | null)
    createMessageChannelMessageAssociation: (MessageChannelMessageAssociation | null)
    updateMessageChannelMessageAssociation: (MessageChannelMessageAssociation | null)
    deleteMessageChannelMessageAssociation: (MessageChannelMessageAssociation | null)
    updateMessageChannelMessageAssociations: (MessageChannelMessageAssociation[] | null)
    deleteMessageChannelMessageAssociations: (MessageChannelMessageAssociation[] | null)
    destroyMessageChannelMessageAssociation: (MessageChannelMessageAssociation | null)
    destroyMessageChannelMessageAssociations: (MessageChannelMessageAssociation[] | null)
    restoreMessageChannelMessageAssociation: (MessageChannelMessageAssociation | null)
    restoreMessageChannelMessageAssociations: (MessageChannelMessageAssociation[] | null)
    createNoteTargets: (NoteTarget[] | null)
    createNoteTarget: (NoteTarget | null)
    updateNoteTarget: (NoteTarget | null)
    deleteNoteTarget: (NoteTarget | null)
    updateNoteTargets: (NoteTarget[] | null)
    deleteNoteTargets: (NoteTarget[] | null)
    destroyNoteTarget: (NoteTarget | null)
    destroyNoteTargets: (NoteTarget[] | null)
    restoreNoteTarget: (NoteTarget | null)
    restoreNoteTargets: (NoteTarget[] | null)
    createOpportunities: (Opportunity[] | null)
    createOpportunity: (Opportunity | null)
    updateOpportunity: (Opportunity | null)
    deleteOpportunity: (Opportunity | null)
    updateOpportunities: (Opportunity[] | null)
    deleteOpportunities: (Opportunity[] | null)
    destroyOpportunity: (Opportunity | null)
    destroyOpportunities: (Opportunity[] | null)
    restoreOpportunity: (Opportunity | null)
    restoreOpportunities: (Opportunity[] | null)
    createPeople: (Person[] | null)
    createPerson: (Person | null)
    updatePerson: (Person | null)
    deletePerson: (Person | null)
    updatePeople: (Person[] | null)
    deletePeople: (Person[] | null)
    destroyPerson: (Person | null)
    destroyPeople: (Person[] | null)
    restorePerson: (Person | null)
    restorePeople: (Person[] | null)
    createTasks: (Task[] | null)
    createTask: (Task | null)
    updateTask: (Task | null)
    deleteTask: (Task | null)
    updateTasks: (Task[] | null)
    deleteTasks: (Task[] | null)
    destroyTask: (Task | null)
    destroyTasks: (Task[] | null)
    restoreTask: (Task | null)
    restoreTasks: (Task[] | null)
    createRockets: (Rocket[] | null)
    createRocket: (Rocket | null)
    updateRocket: (Rocket | null)
    deleteRocket: (Rocket | null)
    updateRockets: (Rocket[] | null)
    deleteRockets: (Rocket[] | null)
    destroyRocket: (Rocket | null)
    destroyRockets: (Rocket[] | null)
    restoreRocket: (Rocket | null)
    restoreRockets: (Rocket[] | null)
    createSurveyResults: (SurveyResult[] | null)
    createSurveyResult: (SurveyResult | null)
    updateSurveyResult: (SurveyResult | null)
    deleteSurveyResult: (SurveyResult | null)
    updateSurveyResults: (SurveyResult[] | null)
    deleteSurveyResults: (SurveyResult[] | null)
    destroySurveyResult: (SurveyResult | null)
    destroySurveyResults: (SurveyResult[] | null)
    restoreSurveyResult: (SurveyResult | null)
    restoreSurveyResults: (SurveyResult[] | null)
    __typename: 'Mutation'
}

export interface LinksGenqlSelection{
    primaryLinkLabel?: boolean | number
    primaryLinkUrl?: boolean | number
    secondaryLinks?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CurrencyGenqlSelection{
    amountMicros?: boolean | number
    currencyCode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface FullNameGenqlSelection{
    firstName?: boolean | number
    lastName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface AddressGenqlSelection{
    addressStreet1?: boolean | number
    addressStreet2?: boolean | number
    addressCity?: boolean | number
    addressPostcode?: boolean | number
    addressState?: boolean | number
    addressCountry?: boolean | number
    addressLat?: boolean | number
    addressLng?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ActorGenqlSelection{
    source?: boolean | number
    workspaceMemberId?: boolean | number
    name?: boolean | number
    context?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EmailsGenqlSelection{
    primaryEmail?: boolean | number
    additionalEmails?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PhonesGenqlSelection{
    primaryPhoneNumber?: boolean | number
    primaryPhoneCountryCode?: boolean | number
    primaryPhoneCallingCode?: boolean | number
    additionalPhones?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RichTextV2GenqlSelection{
    blocknote?: boolean | number
    markdown?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An API key */
export interface ApiKeyGenqlSelection{
    /** ApiKey name */
    name?: boolean | number
    /** ApiKey expiration date */
    expiresAt?: boolean | number
    /** ApiKey revocation date */
    revokedAt?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An attachment */
export interface AttachmentGenqlSelection{
    /** Attachment name */
    name?: boolean | number
    /** Attachment full path */
    fullPath?: boolean | number
    /** Attachment type */
    type?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Attachment author */
    authorId?: boolean | number
    /** Attachment author */
    author?: WorkspaceMemberGenqlSelection
    /** Attachment task */
    taskId?: boolean | number
    /** Attachment task */
    task?: TaskGenqlSelection
    /** Attachment note */
    noteId?: boolean | number
    /** Attachment note */
    note?: NoteGenqlSelection
    /** Attachment person */
    personId?: boolean | number
    /** Attachment person */
    person?: PersonGenqlSelection
    /** Attachment company */
    companyId?: boolean | number
    /** Attachment company */
    company?: CompanyGenqlSelection
    /** Attachment opportunity */
    opportunityId?: boolean | number
    /** Attachment opportunity */
    opportunity?: OpportunityGenqlSelection
    /** Attachments Rocket */
    rocketId?: boolean | number
    /** Attachments Rocket */
    rocket?: RocketGenqlSelection
    /** Attachments Pet */
    petId?: boolean | number
    /** Attachments Pet */
    pet?: PetGenqlSelection
    /** Attachments Survey result */
    surveyResultId?: boolean | number
    /** Attachments Survey result */
    surveyResult?: SurveyResultGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PetGenqlSelection{
    coco?: boolean | number
    /** Id */
    id?: boolean | number
    /** Name */
    name?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Deletion date */
    deletedAt?: boolean | number
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Position */
    position?: boolean | number
    /** Field used for full-text search */
    searchVector?: boolean | number
    species?: boolean | number
    traits?: boolean | number
    comments?: boolean | number
    age?: boolean | number
    location?: AddressGenqlSelection
    vetPhone?: PhonesGenqlSelection
    vetEmail?: EmailsGenqlSelection
    birthday?: boolean | number
    isGoodWithKids?: boolean | number
    pictures?: LinksGenqlSelection
    averageCostOfKibblePerMonth?: CurrencyGenqlSelection
    makesOwnerThinkOf?: FullNameGenqlSelection
    soundSwag?: boolean | number
    bio?: boolean | number
    interestingFacts?: boolean | number
    extraData?: boolean | number
    /** TimelineActivities tied to the Pet */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    /** TaskTargets tied to the Pet */
    taskTargets?: (TaskTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskTargetFilterInput | null), orderBy?: ((TaskTargetOrderByInput | null)[] | null)} })
    /** NoteTargets tied to the Pet */
    noteTargets?: (NoteTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteTargetFilterInput | null), orderBy?: ((NoteTargetOrderByInput | null)[] | null)} })
    /** Favorites tied to the Pet */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Attachments tied to the Pet */
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Blocklist */
export interface BlocklistGenqlSelection{
    /** Handle */
    handle?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** WorkspaceMember */
    workspaceMemberId?: boolean | number
    /** WorkspaceMember */
    workspaceMember?: WorkspaceMemberGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar events */
export interface CalendarEventGenqlSelection{
    /** Title */
    title?: boolean | number
    /** Is canceled */
    isCanceled?: boolean | number
    /** Is Full Day */
    isFullDay?: boolean | number
    /** Start Date */
    startsAt?: boolean | number
    /** End Date */
    endsAt?: boolean | number
    /** Creation DateTime */
    externalCreatedAt?: boolean | number
    /** Update DateTime */
    externalUpdatedAt?: boolean | number
    /** Description */
    description?: boolean | number
    /** Location */
    location?: boolean | number
    /** iCal UID */
    iCalUID?: boolean | number
    /** Conference Solution */
    conferenceSolution?: boolean | number
    /** Meet Link */
    conferenceLink?: LinksGenqlSelection
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Calendar Channel Event Associations */
    calendarChannelEventAssociations?: (CalendarChannelEventAssociationConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarChannelEventAssociationFilterInput | null), orderBy?: ((CalendarChannelEventAssociationOrderByInput | null)[] | null)} })
    /** Event Participants */
    calendarEventParticipants?: (CalendarEventParticipantConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarEventParticipantFilterInput | null), orderBy?: ((CalendarEventParticipantOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar Channels */
export interface CalendarChannelGenqlSelection{
    /** Handle */
    handle?: boolean | number
    /** Sync status */
    syncStatus?: boolean | number
    /** Sync stage */
    syncStage?: boolean | number
    /** Visibility */
    visibility?: boolean | number
    /** Is Contact Auto Creation Enabled */
    isContactAutoCreationEnabled?: boolean | number
    /** Automatically create records for people you participated with in an event. */
    contactAutoCreationPolicy?: boolean | number
    /** Is Sync Enabled */
    isSyncEnabled?: boolean | number
    /** Sync Cursor. Used for syncing events from the calendar provider */
    syncCursor?: boolean | number
    /** Last sync date */
    syncedAt?: boolean | number
    /** Sync stage started at */
    syncStageStartedAt?: boolean | number
    /** Throttle Failure Count */
    throttleFailureCount?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Connected Account */
    connectedAccountId?: boolean | number
    /** Connected Account */
    connectedAccount?: ConnectedAccountGenqlSelection
    /** Calendar Channel Event Associations */
    calendarChannelEventAssociations?: (CalendarChannelEventAssociationConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarChannelEventAssociationFilterInput | null), orderBy?: ((CalendarChannelEventAssociationOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationGenqlSelection{
    /** Event external ID */
    eventExternalId?: boolean | number
    /** Recurring Event ID */
    recurringEventExternalId?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Channel ID */
    calendarChannelId?: boolean | number
    /** Channel ID */
    calendarChannel?: CalendarChannelGenqlSelection
    /** Event ID */
    calendarEventId?: boolean | number
    /** Event ID */
    calendarEvent?: CalendarEventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar event participants */
export interface CalendarEventParticipantGenqlSelection{
    /** Handle */
    handle?: boolean | number
    /** Display Name */
    displayName?: boolean | number
    /** Is Organizer */
    isOrganizer?: boolean | number
    /** Response Status */
    responseStatus?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Event ID */
    calendarEventId?: boolean | number
    /** Event ID */
    calendarEvent?: CalendarEventGenqlSelection
    /** Person */
    personId?: boolean | number
    /** Person */
    person?: PersonGenqlSelection
    /** Workspace Member */
    workspaceMemberId?: boolean | number
    /** Workspace Member */
    workspaceMember?: WorkspaceMemberGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A company */
export interface CompanyGenqlSelection{
    /** The company name */
    name?: boolean | number
    /** The company website URL. We use this url to fetch the company icon */
    domainName?: LinksGenqlSelection
    /** Number of employees in the company */
    employees?: boolean | number
    /** The company Linkedin account */
    linkedinLink?: LinksGenqlSelection
    /** The company Twitter/X account */
    xLink?: LinksGenqlSelection
    /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
    annualRecurringRevenue?: CurrencyGenqlSelection
    /** Address of the company */
    address?: AddressGenqlSelection
    /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
    idealCustomerProfile?: boolean | number
    /** Company record position */
    position?: boolean | number
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Field used for full-text search */
    searchVector?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Your team member responsible for managing the company account */
    accountOwnerId?: boolean | number
    /** Your team member responsible for managing the company account */
    accountOwner?: WorkspaceMemberGenqlSelection
    tagline?: boolean | number
    introVideo?: LinksGenqlSelection
    workPolicy?: boolean | number
    visaSponsorship?: boolean | number
    /** People linked to the company. */
    people?: (PersonConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (PersonFilterInput | null), orderBy?: ((PersonOrderByInput | null)[] | null)} })
    /** Tasks tied to the company */
    taskTargets?: (TaskTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskTargetFilterInput | null), orderBy?: ((TaskTargetOrderByInput | null)[] | null)} })
    /** Notes tied to the company */
    noteTargets?: (NoteTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteTargetFilterInput | null), orderBy?: ((NoteTargetOrderByInput | null)[] | null)} })
    /** Opportunities linked to the company. */
    opportunities?: (OpportunityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (OpportunityFilterInput | null), orderBy?: ((OpportunityOrderByInput | null)[] | null)} })
    /** Favorites linked to the company */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Attachments linked to the company */
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    /** Timeline Activities linked to the company */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connected account */
export interface ConnectedAccountGenqlSelection{
    /** The account handle (email, username, phone number, etc.) */
    handle?: boolean | number
    /** The account provider */
    provider?: boolean | number
    /** Messaging provider access token */
    accessToken?: boolean | number
    /** Messaging provider refresh token */
    refreshToken?: boolean | number
    /** Last sync history ID */
    lastSyncHistoryId?: boolean | number
    /** Auth failed at */
    authFailedAt?: boolean | number
    /** Handle Aliases */
    handleAliases?: boolean | number
    /** Scopes */
    scopes?: boolean | number
    /** JSON object containing custom connection parameters */
    connectionParameters?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Account Owner */
    accountOwnerId?: boolean | number
    /** Account Owner */
    accountOwner?: WorkspaceMemberGenqlSelection
    /** Message Channels */
    messageChannels?: (MessageChannelConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageChannelFilterInput | null), orderBy?: ((MessageChannelOrderByInput | null)[] | null)} })
    /** Calendar Channels */
    calendarChannels?: (CalendarChannelConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarChannelFilterInput | null), orderBy?: ((CalendarChannelOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A favorite that can be accessed from the left menu */
export interface FavoriteGenqlSelection{
    /** Favorite position */
    position?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Favorite task */
    taskId?: boolean | number
    /** Favorite task */
    task?: TaskGenqlSelection
    /** Favorite note */
    noteId?: boolean | number
    /** Favorite note */
    note?: NoteGenqlSelection
    /** Favorite workspace member */
    forWorkspaceMemberId?: boolean | number
    /** Favorite workspace member */
    forWorkspaceMember?: WorkspaceMemberGenqlSelection
    /** Favorite person */
    personId?: boolean | number
    /** Favorite person */
    person?: PersonGenqlSelection
    /** Favorite company */
    companyId?: boolean | number
    /** Favorite company */
    company?: CompanyGenqlSelection
    /** The folder this favorite belongs to */
    favoriteFolderId?: boolean | number
    /** The folder this favorite belongs to */
    favoriteFolder?: FavoriteFolderGenqlSelection
    /** Favorite opportunity */
    opportunityId?: boolean | number
    /** Favorite opportunity */
    opportunity?: OpportunityGenqlSelection
    /** Favorite workflow */
    workflowId?: boolean | number
    /** Favorite workflow */
    workflow?: WorkflowGenqlSelection
    /** Favorite workflow version */
    workflowVersionId?: boolean | number
    /** Favorite workflow version */
    workflowVersion?: WorkflowVersionGenqlSelection
    /** Favorite workflow run */
    workflowRunId?: boolean | number
    /** Favorite workflow run */
    workflowRun?: WorkflowRunGenqlSelection
    /** Favorite view */
    viewId?: boolean | number
    /** Favorite view */
    view?: ViewGenqlSelection
    /** Favorites Rocket */
    rocketId?: boolean | number
    /** Favorites Rocket */
    rocket?: RocketGenqlSelection
    /** Favorites Pet */
    petId?: boolean | number
    /** Favorites Pet */
    pet?: PetGenqlSelection
    /** Favorites Survey result */
    surveyResultId?: boolean | number
    /** Favorites Survey result */
    surveyResult?: SurveyResultGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A Folder of favorites */
export interface FavoriteFolderGenqlSelection{
    /** Favorite folder position */
    position?: boolean | number
    /** Name of the favorite folder */
    name?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Favorites in this folder */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityGenqlSelection{
    /** Creation date */
    happensAt?: boolean | number
    /** Event name */
    name?: boolean | number
    /** Json value for event details */
    properties?: boolean | number
    /** Cached record name */
    linkedRecordCachedName?: boolean | number
    /** Linked Record id */
    linkedRecordId?: boolean | number
    /** Linked Object Metadata Id */
    linkedObjectMetadataId?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Event workspace member */
    workspaceMemberId?: boolean | number
    /** Event workspace member */
    workspaceMember?: WorkspaceMemberGenqlSelection
    /** Event person */
    personId?: boolean | number
    /** Event person */
    person?: PersonGenqlSelection
    /** Event company */
    companyId?: boolean | number
    /** Event company */
    company?: CompanyGenqlSelection
    /** Event opportunity */
    opportunityId?: boolean | number
    /** Event opportunity */
    opportunity?: OpportunityGenqlSelection
    /** Event note */
    noteId?: boolean | number
    /** Event note */
    note?: NoteGenqlSelection
    /** Event task */
    taskId?: boolean | number
    /** Event task */
    task?: TaskGenqlSelection
    /** Event workflow */
    workflowId?: boolean | number
    /** Event workflow */
    workflow?: WorkflowGenqlSelection
    /** Event workflow version */
    workflowVersionId?: boolean | number
    /** Event workflow version */
    workflowVersion?: WorkflowVersionGenqlSelection
    /** Event workflow run */
    workflowRunId?: boolean | number
    /** Event workflow run */
    workflowRun?: WorkflowRunGenqlSelection
    /** TimelineActivities Rocket */
    rocketId?: boolean | number
    /** TimelineActivities Rocket */
    rocket?: RocketGenqlSelection
    /** TimelineActivities Pet */
    petId?: boolean | number
    /** TimelineActivities Pet */
    pet?: PetGenqlSelection
    /** TimelineActivities Survey result */
    surveyResultId?: boolean | number
    /** TimelineActivities Survey result */
    surveyResult?: SurveyResultGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Fields */
export interface ViewFieldGenqlSelection{
    /** View Field target field */
    fieldMetadataId?: boolean | number
    /** View Field visibility */
    isVisible?: boolean | number
    /** View Field size */
    size?: boolean | number
    /** View Field position */
    position?: boolean | number
    /** Optional aggregate operation */
    aggregateOperation?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** View Field related view */
    viewId?: boolean | number
    /** View Field related view */
    view?: ViewGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Filter Groups */
export interface ViewFilterGroupGenqlSelection{
    /** Logical operator for the filter group */
    logicalOperator?: boolean | number
    /** Position in the parent view filter group */
    positionInViewFilterGroup?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Parent View Filter Group */
    parentViewFilterGroupId?: boolean | number
    /** View */
    viewId?: boolean | number
    /** View */
    view?: ViewGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Groups */
export interface ViewGroupGenqlSelection{
    /** View Group target field */
    fieldMetadataId?: boolean | number
    /** View Group visibility */
    isVisible?: boolean | number
    /** Group by this field value */
    fieldValue?: boolean | number
    /** View Field position */
    position?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** View Group related view */
    viewId?: boolean | number
    /** View Group related view */
    view?: ViewGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Filters */
export interface ViewFilterGenqlSelection{
    /** View Filter target field */
    fieldMetadataId?: boolean | number
    /** View Filter operand */
    operand?: boolean | number
    /** View Filter value */
    value?: boolean | number
    /** View Filter Display Value */
    displayValue?: boolean | number
    /** View Filter Group */
    viewFilterGroupId?: boolean | number
    /** Position in the view filter group */
    positionInViewFilterGroup?: boolean | number
    /** Sub field name */
    subFieldName?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** View Filter related view */
    viewId?: boolean | number
    /** View Filter related view */
    view?: ViewGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Sorts */
export interface ViewSortGenqlSelection{
    /** View Sort target field */
    fieldMetadataId?: boolean | number
    /** View Sort direction */
    direction?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** View Sort related view */
    viewId?: boolean | number
    /** View Sort related view */
    view?: ViewGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) Views */
export interface ViewGenqlSelection{
    /** View name */
    name?: boolean | number
    /** View target object */
    objectMetadataId?: boolean | number
    /** View type */
    type?: boolean | number
    /** View key */
    key?: boolean | number
    /** View icon */
    icon?: boolean | number
    /** View Kanban column field */
    kanbanFieldMetadataId?: boolean | number
    /** View position */
    position?: boolean | number
    /** Describes if the view is in compact mode */
    isCompact?: boolean | number
    /** Display the records in a side panel or in a record page */
    openRecordIn?: boolean | number
    /** Optional aggregate operation */
    kanbanAggregateOperation?: boolean | number
    /** Field metadata used for aggregate operation */
    kanbanAggregateOperationFieldMetadataId?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** View Fields */
    viewFields?: (ViewFieldConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewFieldFilterInput | null), orderBy?: ((ViewFieldOrderByInput | null)[] | null)} })
    /** View Groups */
    viewGroups?: (ViewGroupConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewGroupFilterInput | null), orderBy?: ((ViewGroupOrderByInput | null)[] | null)} })
    /** View Filters */
    viewFilters?: (ViewFilterConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewFilterFilterInput | null), orderBy?: ((ViewFilterOrderByInput | null)[] | null)} })
    /** View Filter Groups */
    viewFilterGroups?: (ViewFilterGroupConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewFilterGroupFilterInput | null), orderBy?: ((ViewFilterGroupOrderByInput | null)[] | null)} })
    /** View Sorts */
    viewSorts?: (ViewSortConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewSortFilterInput | null), orderBy?: ((ViewSortOrderByInput | null)[] | null)} })
    /** Favorites linked to the view */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A webhook */
export interface WebhookGenqlSelection{
    /** Webhook target url */
    targetUrl?: boolean | number
    /** Webhook operations */
    operations?: boolean | number
    description?: boolean | number
    /** Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests. */
    secret?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow */
export interface WorkflowGenqlSelection{
    /** The workflow name */
    name?: boolean | number
    /** The workflow last published version id */
    lastPublishedVersionId?: boolean | number
    /** The current statuses of the workflow versions */
    statuses?: boolean | number
    /** Workflow record position */
    position?: boolean | number
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Workflow versions linked to the workflow. */
    versions?: (WorkflowVersionConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkflowVersionFilterInput | null), orderBy?: ((WorkflowVersionOrderByInput | null)[] | null)} })
    /** Workflow runs linked to the workflow. */
    runs?: (WorkflowRunConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkflowRunFilterInput | null), orderBy?: ((WorkflowRunOrderByInput | null)[] | null)} })
    /** Workflow automated triggers linked to the workflow. */
    automatedTriggers?: (WorkflowAutomatedTriggerConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkflowAutomatedTriggerFilterInput | null), orderBy?: ((WorkflowAutomatedTriggerOrderByInput | null)[] | null)} })
    /** Favorites linked to the workflow */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Timeline activities linked to the workflow */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow version */
export interface WorkflowVersionGenqlSelection{
    /** The workflow version name */
    name?: boolean | number
    /** Json object to provide trigger */
    trigger?: boolean | number
    /** Json object to provide steps */
    steps?: boolean | number
    /** The workflow version status */
    status?: boolean | number
    /** Workflow version position */
    position?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** WorkflowVersion workflow */
    workflowId?: boolean | number
    /** WorkflowVersion workflow */
    workflow?: WorkflowGenqlSelection
    /** Workflow runs linked to the version. */
    runs?: (WorkflowRunConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkflowRunFilterInput | null), orderBy?: ((WorkflowRunOrderByInput | null)[] | null)} })
    /** Favorites linked to the workflow version */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Timeline activities linked to the version */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow run */
export interface WorkflowRunGenqlSelection{
    /** Name of the workflow run */
    name?: boolean | number
    /** Workflow run started at */
    startedAt?: boolean | number
    /** Workflow run ended at */
    endedAt?: boolean | number
    /** Workflow run status */
    status?: boolean | number
    /** The executor of the workflow */
    createdBy?: ActorGenqlSelection
    /** Json object to provide output of the workflow run */
    output?: boolean | number
    /** Context */
    context?: boolean | number
    /** Workflow run position */
    position?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Workflow version linked to the run. */
    workflowVersionId?: boolean | number
    /** Workflow version linked to the run. */
    workflowVersion?: WorkflowVersionGenqlSelection
    /** Workflow linked to the run. */
    workflowId?: boolean | number
    /** Workflow linked to the run. */
    workflow?: WorkflowGenqlSelection
    /** Favorites linked to the workflow run */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Timeline activities linked to the run */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerGenqlSelection{
    /** The workflow automated trigger type */
    type?: boolean | number
    /** The workflow automated trigger settings */
    settings?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** WorkflowAutomatedTrigger workflow */
    workflowId?: boolean | number
    /** WorkflowAutomatedTrigger workflow */
    workflow?: WorkflowGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workspace member */
export interface WorkspaceMemberGenqlSelection{
    /** Workspace member position */
    position?: boolean | number
    /** Workspace member name */
    name?: FullNameGenqlSelection
    /** Preferred color scheme */
    colorScheme?: boolean | number
    /** Preferred language */
    locale?: boolean | number
    /** Workspace member avatar */
    avatarUrl?: boolean | number
    /** Related user email address */
    userEmail?: boolean | number
    /** Associated User Id */
    userId?: boolean | number
    /** User time zone */
    timeZone?: boolean | number
    /** User's preferred date format */
    dateFormat?: boolean | number
    /** User's preferred time format */
    timeFormat?: boolean | number
    /** Field used for full-text search */
    searchVector?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Tasks assigned to the workspace member */
    assignedTasks?: (TaskConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskFilterInput | null), orderBy?: ((TaskOrderByInput | null)[] | null)} })
    /** Favorites linked to the workspace member */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Account owner for companies */
    accountOwnerForCompanies?: (CompanyConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CompanyFilterInput | null), orderBy?: ((CompanyOrderByInput | null)[] | null)} })
    /** Attachments created by the workspace member */
    authoredAttachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    /** Connected accounts */
    connectedAccounts?: (ConnectedAccountConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ConnectedAccountFilterInput | null), orderBy?: ((ConnectedAccountOrderByInput | null)[] | null)} })
    /** Message Participants */
    messageParticipants?: (MessageParticipantConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageParticipantFilterInput | null), orderBy?: ((MessageParticipantOrderByInput | null)[] | null)} })
    /** Blocklisted handles */
    blocklist?: (BlocklistConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (BlocklistFilterInput | null), orderBy?: ((BlocklistOrderByInput | null)[] | null)} })
    /** Calendar Event Participants */
    calendarEventParticipants?: (CalendarEventParticipantConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarEventParticipantFilterInput | null), orderBy?: ((CalendarEventParticipantOrderByInput | null)[] | null)} })
    /** Events linked to the workspace member */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A note */
export interface NoteGenqlSelection{
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Note record position */
    position?: boolean | number
    /** Note title */
    title?: boolean | number
    /** Note body */
    body?: boolean | number
    /** Note body */
    bodyV2?: RichTextV2GenqlSelection
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Field used for full-text search */
    searchVector?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Note targets */
    noteTargets?: (NoteTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteTargetFilterInput | null), orderBy?: ((NoteTargetOrderByInput | null)[] | null)} })
    /** Note attachments */
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    /** Timeline Activities linked to the note. */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    /** Favorites linked to the note */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A task target */
export interface TaskTargetGenqlSelection{
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** TaskTarget task */
    taskId?: boolean | number
    /** TaskTarget task */
    task?: TaskGenqlSelection
    /** TaskTarget person */
    personId?: boolean | number
    /** TaskTarget person */
    person?: PersonGenqlSelection
    /** TaskTarget company */
    companyId?: boolean | number
    /** TaskTarget company */
    company?: CompanyGenqlSelection
    /** TaskTarget opportunity */
    opportunityId?: boolean | number
    /** TaskTarget opportunity */
    opportunity?: OpportunityGenqlSelection
    /** TaskTargets Rocket */
    rocketId?: boolean | number
    /** TaskTargets Rocket */
    rocket?: RocketGenqlSelection
    /** TaskTargets Pet */
    petId?: boolean | number
    /** TaskTargets Pet */
    pet?: PetGenqlSelection
    /** TaskTargets Survey result */
    surveyResultId?: boolean | number
    /** TaskTargets Survey result */
    surveyResult?: SurveyResultGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadGenqlSelection{
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Messages from the thread. */
    messages?: (MessageConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageFilterInput | null), orderBy?: ((MessageOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageGenqlSelection{
    /** Message id from the message header */
    headerMessageId?: boolean | number
    /** Subject */
    subject?: boolean | number
    /** Text */
    text?: boolean | number
    /** The date the message was received */
    receivedAt?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Message Thread Id */
    messageThreadId?: boolean | number
    /** Message Thread Id */
    messageThread?: MessageThreadGenqlSelection
    /** Message Participants */
    messageParticipants?: (MessageParticipantConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageParticipantFilterInput | null), orderBy?: ((MessageParticipantOrderByInput | null)[] | null)} })
    /** Messages from the channel. */
    messageChannelMessageAssociations?: (MessageChannelMessageAssociationConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageChannelMessageAssociationFilterInput | null), orderBy?: ((MessageChannelMessageAssociationOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Channels */
export interface MessageChannelGenqlSelection{
    /** Visibility */
    visibility?: boolean | number
    /** Handle */
    handle?: boolean | number
    /** Channel Type */
    type?: boolean | number
    /** Is Contact Auto Creation Enabled */
    isContactAutoCreationEnabled?: boolean | number
    /** Automatically create People records when receiving or sending emails */
    contactAutoCreationPolicy?: boolean | number
    /** Exclude non professional emails */
    excludeNonProfessionalEmails?: boolean | number
    /** Exclude group emails */
    excludeGroupEmails?: boolean | number
    /** Is Sync Enabled */
    isSyncEnabled?: boolean | number
    /** Last sync cursor */
    syncCursor?: boolean | number
    /** Last sync date */
    syncedAt?: boolean | number
    /** Sync status */
    syncStatus?: boolean | number
    /** Sync stage */
    syncStage?: boolean | number
    /** Sync stage started at */
    syncStageStartedAt?: boolean | number
    /** Throttle Failure Count */
    throttleFailureCount?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Connected Account */
    connectedAccountId?: boolean | number
    /** Connected Account */
    connectedAccount?: ConnectedAccountGenqlSelection
    /** Messages from the channel. */
    messageChannelMessageAssociations?: (MessageChannelMessageAssociationConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageChannelMessageAssociationFilterInput | null), orderBy?: ((MessageChannelMessageAssociationOrderByInput | null)[] | null)} })
    /** Message Folders */
    messageFolders?: (MessageFolderConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageFolderFilterInput | null), orderBy?: ((MessageFolderOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Participants */
export interface MessageParticipantGenqlSelection{
    /** Role */
    role?: boolean | number
    /** Handle */
    handle?: boolean | number
    /** Display Name */
    displayName?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Message */
    messageId?: boolean | number
    /** Message */
    message?: MessageGenqlSelection
    /** Person */
    personId?: boolean | number
    /** Person */
    person?: PersonGenqlSelection
    /** Workspace member */
    workspaceMemberId?: boolean | number
    /** Workspace member */
    workspaceMember?: WorkspaceMemberGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Folder for Message Channel */
export interface MessageFolderGenqlSelection{
    /** Folder name */
    name?: boolean | number
    /** Sync Cursor */
    syncCursor?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Message Channel */
    messageChannelId?: boolean | number
    /** Message Channel */
    messageChannel?: MessageChannelGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationGenqlSelection{
    /** Message id from the messaging provider */
    messageExternalId?: boolean | number
    /** Thread id from the messaging provider */
    messageThreadExternalId?: boolean | number
    /** Message Direction */
    direction?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Message Channel Id */
    messageChannelId?: boolean | number
    /** Message Channel Id */
    messageChannel?: MessageChannelGenqlSelection
    /** Message Id */
    messageId?: boolean | number
    /** Message Id */
    message?: MessageGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A note target */
export interface NoteTargetGenqlSelection{
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** NoteTarget note */
    noteId?: boolean | number
    /** NoteTarget note */
    note?: NoteGenqlSelection
    /** NoteTarget person */
    personId?: boolean | number
    /** NoteTarget person */
    person?: PersonGenqlSelection
    /** NoteTarget company */
    companyId?: boolean | number
    /** NoteTarget company */
    company?: CompanyGenqlSelection
    /** NoteTarget opportunity */
    opportunityId?: boolean | number
    /** NoteTarget opportunity */
    opportunity?: OpportunityGenqlSelection
    /** NoteTargets Rocket */
    rocketId?: boolean | number
    /** NoteTargets Rocket */
    rocket?: RocketGenqlSelection
    /** NoteTargets Pet */
    petId?: boolean | number
    /** NoteTargets Pet */
    pet?: PetGenqlSelection
    /** NoteTargets Survey result */
    surveyResultId?: boolean | number
    /** NoteTargets Survey result */
    surveyResult?: SurveyResultGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An opportunity */
export interface OpportunityGenqlSelection{
    /** The opportunity name */
    name?: boolean | number
    /** Opportunity amount */
    amount?: CurrencyGenqlSelection
    /** Opportunity close date */
    closeDate?: boolean | number
    /** Opportunity stage */
    stage?: boolean | number
    /** Opportunity record position */
    position?: boolean | number
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Field used for full-text search */
    searchVector?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Opportunity point of contact */
    pointOfContactId?: boolean | number
    /** Opportunity point of contact */
    pointOfContact?: PersonGenqlSelection
    /** Opportunity company */
    companyId?: boolean | number
    /** Opportunity company */
    company?: CompanyGenqlSelection
    /** Favorites linked to the opportunity */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Tasks tied to the opportunity */
    taskTargets?: (TaskTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskTargetFilterInput | null), orderBy?: ((TaskTargetOrderByInput | null)[] | null)} })
    /** Notes tied to the opportunity */
    noteTargets?: (NoteTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteTargetFilterInput | null), orderBy?: ((NoteTargetOrderByInput | null)[] | null)} })
    /** Attachments linked to the opportunity */
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    /** Timeline Activities linked to the opportunity. */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A person */
export interface PersonGenqlSelection{
    /** Contact’s name */
    name?: FullNameGenqlSelection
    /** Contact’s Emails */
    emails?: EmailsGenqlSelection
    /** Contact’s Linkedin account */
    linkedinLink?: LinksGenqlSelection
    /** Contact’s X/Twitter account */
    xLink?: LinksGenqlSelection
    /** Contact’s job title */
    jobTitle?: boolean | number
    /** Contact’s phone numbers */
    phones?: PhonesGenqlSelection
    /** Contact’s city */
    city?: boolean | number
    /** Contact’s avatar */
    avatarUrl?: boolean | number
    /** Person record Position */
    position?: boolean | number
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Field used for full-text search */
    searchVector?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Contact’s company */
    companyId?: boolean | number
    /** Contact’s company */
    company?: CompanyGenqlSelection
    intro?: boolean | number
    whatsapp?: PhonesGenqlSelection
    workPreference?: boolean | number
    performanceRating?: boolean | number
    /** List of opportunities for which that person is the point of contact */
    pointOfContactForOpportunities?: (OpportunityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (OpportunityFilterInput | null), orderBy?: ((OpportunityOrderByInput | null)[] | null)} })
    /** Tasks tied to the contact */
    taskTargets?: (TaskTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskTargetFilterInput | null), orderBy?: ((TaskTargetOrderByInput | null)[] | null)} })
    /** Notes tied to the contact */
    noteTargets?: (NoteTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteTargetFilterInput | null), orderBy?: ((NoteTargetOrderByInput | null)[] | null)} })
    /** Favorites linked to the contact */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Attachments linked to the contact. */
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    /** Message Participants */
    messageParticipants?: (MessageParticipantConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageParticipantFilterInput | null), orderBy?: ((MessageParticipantOrderByInput | null)[] | null)} })
    /** Calendar Event Participants */
    calendarEventParticipants?: (CalendarEventParticipantConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarEventParticipantFilterInput | null), orderBy?: ((CalendarEventParticipantOrderByInput | null)[] | null)} })
    /** Events linked to the person */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A task */
export interface TaskGenqlSelection{
    /** Task record position */
    position?: boolean | number
    /** Task title */
    title?: boolean | number
    /** Task body */
    body?: boolean | number
    /** Task body */
    bodyV2?: RichTextV2GenqlSelection
    /** Task due date */
    dueAt?: boolean | number
    /** Task status */
    status?: boolean | number
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Field used for full-text search */
    searchVector?: boolean | number
    /** Id */
    id?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Date when the record was deleted */
    deletedAt?: boolean | number
    /** Task assignee */
    assigneeId?: boolean | number
    /** Task assignee */
    assignee?: WorkspaceMemberGenqlSelection
    /** Favorites linked to the task */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Task targets */
    taskTargets?: (TaskTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskTargetFilterInput | null), orderBy?: ((TaskTargetOrderByInput | null)[] | null)} })
    /** Task attachments */
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    /** Timeline Activities linked to the task. */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A rocket */
export interface RocketGenqlSelection{
    /** Id */
    id?: boolean | number
    /** Name */
    name?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Deletion date */
    deletedAt?: boolean | number
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Position */
    position?: boolean | number
    /** Field used for full-text search */
    searchVector?: boolean | number
    /** TimelineActivities tied to the Rocket */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    /** Favorites tied to the Rocket */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** Attachments tied to the Rocket */
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    /** TaskTargets tied to the Rocket */
    taskTargets?: (TaskTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskTargetFilterInput | null), orderBy?: ((TaskTargetOrderByInput | null)[] | null)} })
    /** NoteTargets tied to the Rocket */
    noteTargets?: (NoteTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteTargetFilterInput | null), orderBy?: ((NoteTargetOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SurveyResultGenqlSelection{
    /** Id */
    id?: boolean | number
    /** Name */
    name?: boolean | number
    /** Creation date */
    createdAt?: boolean | number
    /** Last time the record was changed */
    updatedAt?: boolean | number
    /** Deletion date */
    deletedAt?: boolean | number
    /** The creator of the record */
    createdBy?: ActorGenqlSelection
    /** Position */
    position?: boolean | number
    /** Field used for full-text search */
    searchVector?: boolean | number
    score?: boolean | number
    percentageOfCompletion?: boolean | number
    participants?: boolean | number
    averageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    comments?: boolean | number
    shortNotes?: boolean | number
    /** Attachments tied to the Survey result */
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    /** TimelineActivities tied to the Survey result */
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    /** Favorites tied to the Survey result */
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    /** TaskTargets tied to the Survey result */
    taskTargets?: (TaskTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskTargetFilterInput | null), orderBy?: ((TaskTargetOrderByInput | null)[] | null)} })
    /** NoteTargets tied to the Survey result */
    noteTargets?: (NoteTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteTargetFilterInput | null), orderBy?: ((NoteTargetOrderByInput | null)[] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An API key */
export interface ApiKeyEdgeGenqlSelection{
    node?: ApiKeyGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An attachment */
export interface AttachmentEdgeGenqlSelection{
    node?: AttachmentGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PetEdgeGenqlSelection{
    node?: PetGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Blocklist */
export interface BlocklistEdgeGenqlSelection{
    node?: BlocklistGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar events */
export interface CalendarEventEdgeGenqlSelection{
    node?: CalendarEventGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar Channels */
export interface CalendarChannelEdgeGenqlSelection{
    node?: CalendarChannelGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationEdgeGenqlSelection{
    node?: CalendarChannelEventAssociationGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar event participants */
export interface CalendarEventParticipantEdgeGenqlSelection{
    node?: CalendarEventParticipantGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A company */
export interface CompanyEdgeGenqlSelection{
    node?: CompanyGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connected account */
export interface ConnectedAccountEdgeGenqlSelection{
    node?: ConnectedAccountGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A favorite that can be accessed from the left menu */
export interface FavoriteEdgeGenqlSelection{
    node?: FavoriteGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A Folder of favorites */
export interface FavoriteFolderEdgeGenqlSelection{
    node?: FavoriteFolderGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityEdgeGenqlSelection{
    node?: TimelineActivityGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Fields */
export interface ViewFieldEdgeGenqlSelection{
    node?: ViewFieldGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Filter Groups */
export interface ViewFilterGroupEdgeGenqlSelection{
    node?: ViewFilterGroupGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Groups */
export interface ViewGroupEdgeGenqlSelection{
    node?: ViewGroupGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Filters */
export interface ViewFilterEdgeGenqlSelection{
    node?: ViewFilterGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Sorts */
export interface ViewSortEdgeGenqlSelection{
    node?: ViewSortGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) Views */
export interface ViewEdgeGenqlSelection{
    node?: ViewGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A webhook */
export interface WebhookEdgeGenqlSelection{
    node?: WebhookGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow */
export interface WorkflowEdgeGenqlSelection{
    node?: WorkflowGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow version */
export interface WorkflowVersionEdgeGenqlSelection{
    node?: WorkflowVersionGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow run */
export interface WorkflowRunEdgeGenqlSelection{
    node?: WorkflowRunGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerEdgeGenqlSelection{
    node?: WorkflowAutomatedTriggerGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workspace member */
export interface WorkspaceMemberEdgeGenqlSelection{
    node?: WorkspaceMemberGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A note */
export interface NoteEdgeGenqlSelection{
    node?: NoteGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A task target */
export interface TaskTargetEdgeGenqlSelection{
    node?: TaskTargetGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadEdgeGenqlSelection{
    node?: MessageThreadGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageEdgeGenqlSelection{
    node?: MessageGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Channels */
export interface MessageChannelEdgeGenqlSelection{
    node?: MessageChannelGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Participants */
export interface MessageParticipantEdgeGenqlSelection{
    node?: MessageParticipantGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Folder for Message Channel */
export interface MessageFolderEdgeGenqlSelection{
    node?: MessageFolderGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationEdgeGenqlSelection{
    node?: MessageChannelMessageAssociationGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A note target */
export interface NoteTargetEdgeGenqlSelection{
    node?: NoteTargetGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An opportunity */
export interface OpportunityEdgeGenqlSelection{
    node?: OpportunityGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A person */
export interface PersonEdgeGenqlSelection{
    node?: PersonGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A task */
export interface TaskEdgeGenqlSelection{
    node?: TaskGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A rocket */
export interface RocketEdgeGenqlSelection{
    node?: RocketGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SurveyResultEdgeGenqlSelection{
    node?: SurveyResultGenqlSelection
    cursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An API key */
export interface ApiKeyConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for expiresAt */
    countUniqueValuesExpiresAt?: boolean | number
    /** Number of empty values for expiresAt */
    countEmptyExpiresAt?: boolean | number
    /** Number of non-empty values for expiresAt */
    countNotEmptyExpiresAt?: boolean | number
    /** Percentage of empty values for expiresAt */
    percentageEmptyExpiresAt?: boolean | number
    /** Percentage of non-empty values for expiresAt */
    percentageNotEmptyExpiresAt?: boolean | number
    /** Earliest date contained in the field expiresAt */
    minExpiresAt?: boolean | number
    /** Latest date contained in the field expiresAt */
    maxExpiresAt?: boolean | number
    /** Number of unique values for revokedAt */
    countUniqueValuesRevokedAt?: boolean | number
    /** Number of empty values for revokedAt */
    countEmptyRevokedAt?: boolean | number
    /** Number of non-empty values for revokedAt */
    countNotEmptyRevokedAt?: boolean | number
    /** Percentage of empty values for revokedAt */
    percentageEmptyRevokedAt?: boolean | number
    /** Percentage of non-empty values for revokedAt */
    percentageNotEmptyRevokedAt?: boolean | number
    /** Earliest date contained in the field revokedAt */
    minRevokedAt?: boolean | number
    /** Latest date contained in the field revokedAt */
    maxRevokedAt?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: ApiKeyEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageInfoGenqlSelection{
    startCursor?: boolean | number
    endCursor?: boolean | number
    hasNextPage?: boolean | number
    hasPreviousPage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An attachment */
export interface AttachmentConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for fullPath */
    countUniqueValuesFullPath?: boolean | number
    /** Number of empty values for fullPath */
    countEmptyFullPath?: boolean | number
    /** Number of non-empty values for fullPath */
    countNotEmptyFullPath?: boolean | number
    /** Percentage of empty values for fullPath */
    percentageEmptyFullPath?: boolean | number
    /** Percentage of non-empty values for fullPath */
    percentageNotEmptyFullPath?: boolean | number
    /** Number of unique values for type */
    countUniqueValuesType?: boolean | number
    /** Number of empty values for type */
    countEmptyType?: boolean | number
    /** Number of non-empty values for type */
    countNotEmptyType?: boolean | number
    /** Percentage of empty values for type */
    percentageEmptyType?: boolean | number
    /** Percentage of non-empty values for type */
    percentageNotEmptyType?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: AttachmentEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PetConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for coco */
    countUniqueValuesCoco?: boolean | number
    /** Number of empty values for coco */
    countEmptyCoco?: boolean | number
    /** Number of non-empty values for coco */
    countNotEmptyCoco?: boolean | number
    /** Percentage of empty values for coco */
    percentageEmptyCoco?: boolean | number
    /** Percentage of non-empty values for coco */
    percentageNotEmptyCoco?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    /** Number of unique values for species */
    countUniqueValuesSpecies?: boolean | number
    /** Number of empty values for species */
    countEmptySpecies?: boolean | number
    /** Number of non-empty values for species */
    countNotEmptySpecies?: boolean | number
    /** Percentage of empty values for species */
    percentageEmptySpecies?: boolean | number
    /** Percentage of non-empty values for species */
    percentageNotEmptySpecies?: boolean | number
    /** Number of unique values for traits */
    countUniqueValuesTraits?: boolean | number
    /** Number of empty values for traits */
    countEmptyTraits?: boolean | number
    /** Number of non-empty values for traits */
    countNotEmptyTraits?: boolean | number
    /** Percentage of empty values for traits */
    percentageEmptyTraits?: boolean | number
    /** Percentage of non-empty values for traits */
    percentageNotEmptyTraits?: boolean | number
    /** Number of unique values for comments */
    countUniqueValuesComments?: boolean | number
    /** Number of empty values for comments */
    countEmptyComments?: boolean | number
    /** Number of non-empty values for comments */
    countNotEmptyComments?: boolean | number
    /** Percentage of empty values for comments */
    percentageEmptyComments?: boolean | number
    /** Percentage of non-empty values for comments */
    percentageNotEmptyComments?: boolean | number
    /** Number of unique values for age */
    countUniqueValuesAge?: boolean | number
    /** Number of empty values for age */
    countEmptyAge?: boolean | number
    /** Number of non-empty values for age */
    countNotEmptyAge?: boolean | number
    /** Percentage of empty values for age */
    percentageEmptyAge?: boolean | number
    /** Percentage of non-empty values for age */
    percentageNotEmptyAge?: boolean | number
    /** Minimum amount contained in the field age */
    minAge?: boolean | number
    /** Maximum amount contained in the field age */
    maxAge?: boolean | number
    /** Average amount contained in the field age */
    avgAge?: boolean | number
    /** Sum of amounts contained in the field age */
    sumAge?: boolean | number
    /** Number of unique values for location */
    countUniqueValuesLocation?: boolean | number
    /** Number of empty values for location */
    countEmptyLocation?: boolean | number
    /** Number of non-empty values for location */
    countNotEmptyLocation?: boolean | number
    /** Percentage of empty values for location */
    percentageEmptyLocation?: boolean | number
    /** Percentage of non-empty values for location */
    percentageNotEmptyLocation?: boolean | number
    /** Number of unique values for vetPhone */
    countUniqueValuesVetPhone?: boolean | number
    /** Number of empty values for vetPhone */
    countEmptyVetPhone?: boolean | number
    /** Number of non-empty values for vetPhone */
    countNotEmptyVetPhone?: boolean | number
    /** Percentage of empty values for vetPhone */
    percentageEmptyVetPhone?: boolean | number
    /** Percentage of non-empty values for vetPhone */
    percentageNotEmptyVetPhone?: boolean | number
    /** Number of unique values for vetEmail */
    countUniqueValuesVetEmail?: boolean | number
    /** Number of empty values for vetEmail */
    countEmptyVetEmail?: boolean | number
    /** Number of non-empty values for vetEmail */
    countNotEmptyVetEmail?: boolean | number
    /** Percentage of empty values for vetEmail */
    percentageEmptyVetEmail?: boolean | number
    /** Percentage of non-empty values for vetEmail */
    percentageNotEmptyVetEmail?: boolean | number
    /** Number of unique values for birthday */
    countUniqueValuesBirthday?: boolean | number
    /** Number of empty values for birthday */
    countEmptyBirthday?: boolean | number
    /** Number of non-empty values for birthday */
    countNotEmptyBirthday?: boolean | number
    /** Percentage of empty values for birthday */
    percentageEmptyBirthday?: boolean | number
    /** Percentage of non-empty values for birthday */
    percentageNotEmptyBirthday?: boolean | number
    /** Earliest date contained in the field birthday */
    minBirthday?: boolean | number
    /** Latest date contained in the field birthday */
    maxBirthday?: boolean | number
    /** Number of unique values for isGoodWithKids */
    countUniqueValuesIsGoodWithKids?: boolean | number
    /** Number of empty values for isGoodWithKids */
    countEmptyIsGoodWithKids?: boolean | number
    /** Number of non-empty values for isGoodWithKids */
    countNotEmptyIsGoodWithKids?: boolean | number
    /** Percentage of empty values for isGoodWithKids */
    percentageEmptyIsGoodWithKids?: boolean | number
    /** Percentage of non-empty values for isGoodWithKids */
    percentageNotEmptyIsGoodWithKids?: boolean | number
    /** Count of true values in the field isGoodWithKids */
    countTrueIsGoodWithKids?: boolean | number
    /** Count of false values in the field isGoodWithKids */
    countFalseIsGoodWithKids?: boolean | number
    /** Number of unique values for pictures */
    countUniqueValuesPictures?: boolean | number
    /** Number of empty values for pictures */
    countEmptyPictures?: boolean | number
    /** Number of non-empty values for pictures */
    countNotEmptyPictures?: boolean | number
    /** Percentage of empty values for pictures */
    percentageEmptyPictures?: boolean | number
    /** Percentage of non-empty values for pictures */
    percentageNotEmptyPictures?: boolean | number
    /** Number of unique values for averageCostOfKibblePerMonth */
    countUniqueValuesAverageCostOfKibblePerMonth?: boolean | number
    /** Number of empty values for averageCostOfKibblePerMonth */
    countEmptyAverageCostOfKibblePerMonth?: boolean | number
    /** Number of non-empty values for averageCostOfKibblePerMonth */
    countNotEmptyAverageCostOfKibblePerMonth?: boolean | number
    /** Percentage of empty values for averageCostOfKibblePerMonth */
    percentageEmptyAverageCostOfKibblePerMonth?: boolean | number
    /** Percentage of non-empty values for averageCostOfKibblePerMonth */
    percentageNotEmptyAverageCostOfKibblePerMonth?: boolean | number
    /** Minimum amount contained in the field averageCostOfKibblePerMonth */
    minAverageCostOfKibblePerMonthAmountMicros?: boolean | number
    /** Maximal amount contained in the field averageCostOfKibblePerMonth */
    maxAverageCostOfKibblePerMonthAmountMicros?: boolean | number
    /** Sum of amounts contained in the field averageCostOfKibblePerMonth */
    sumAverageCostOfKibblePerMonthAmountMicros?: boolean | number
    /** Average amount contained in the field averageCostOfKibblePerMonth */
    avgAverageCostOfKibblePerMonthAmountMicros?: boolean | number
    /** Number of unique values for makesOwnerThinkOf */
    countUniqueValuesMakesOwnerThinkOf?: boolean | number
    /** Number of empty values for makesOwnerThinkOf */
    countEmptyMakesOwnerThinkOf?: boolean | number
    /** Number of non-empty values for makesOwnerThinkOf */
    countNotEmptyMakesOwnerThinkOf?: boolean | number
    /** Percentage of empty values for makesOwnerThinkOf */
    percentageEmptyMakesOwnerThinkOf?: boolean | number
    /** Percentage of non-empty values for makesOwnerThinkOf */
    percentageNotEmptyMakesOwnerThinkOf?: boolean | number
    /** Number of unique values for soundSwag */
    countUniqueValuesSoundSwag?: boolean | number
    /** Number of empty values for soundSwag */
    countEmptySoundSwag?: boolean | number
    /** Number of non-empty values for soundSwag */
    countNotEmptySoundSwag?: boolean | number
    /** Percentage of empty values for soundSwag */
    percentageEmptySoundSwag?: boolean | number
    /** Percentage of non-empty values for soundSwag */
    percentageNotEmptySoundSwag?: boolean | number
    /** Number of unique values for bio */
    countUniqueValuesBio?: boolean | number
    /** Number of empty values for bio */
    countEmptyBio?: boolean | number
    /** Number of non-empty values for bio */
    countNotEmptyBio?: boolean | number
    /** Percentage of empty values for bio */
    percentageEmptyBio?: boolean | number
    /** Percentage of non-empty values for bio */
    percentageNotEmptyBio?: boolean | number
    /** Number of unique values for interestingFacts */
    countUniqueValuesInterestingFacts?: boolean | number
    /** Number of empty values for interestingFacts */
    countEmptyInterestingFacts?: boolean | number
    /** Number of non-empty values for interestingFacts */
    countNotEmptyInterestingFacts?: boolean | number
    /** Percentage of empty values for interestingFacts */
    percentageEmptyInterestingFacts?: boolean | number
    /** Percentage of non-empty values for interestingFacts */
    percentageNotEmptyInterestingFacts?: boolean | number
    /** Number of unique values for extraData */
    countUniqueValuesExtraData?: boolean | number
    /** Number of empty values for extraData */
    countEmptyExtraData?: boolean | number
    /** Number of non-empty values for extraData */
    countNotEmptyExtraData?: boolean | number
    /** Percentage of empty values for extraData */
    percentageEmptyExtraData?: boolean | number
    /** Percentage of non-empty values for extraData */
    percentageNotEmptyExtraData?: boolean | number
    edges?: PetEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Blocklist */
export interface BlocklistConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for handle */
    countUniqueValuesHandle?: boolean | number
    /** Number of empty values for handle */
    countEmptyHandle?: boolean | number
    /** Number of non-empty values for handle */
    countNotEmptyHandle?: boolean | number
    /** Percentage of empty values for handle */
    percentageEmptyHandle?: boolean | number
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: BlocklistEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar events */
export interface CalendarEventConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for title */
    countUniqueValuesTitle?: boolean | number
    /** Number of empty values for title */
    countEmptyTitle?: boolean | number
    /** Number of non-empty values for title */
    countNotEmptyTitle?: boolean | number
    /** Percentage of empty values for title */
    percentageEmptyTitle?: boolean | number
    /** Percentage of non-empty values for title */
    percentageNotEmptyTitle?: boolean | number
    /** Number of unique values for isCanceled */
    countUniqueValuesIsCanceled?: boolean | number
    /** Number of empty values for isCanceled */
    countEmptyIsCanceled?: boolean | number
    /** Number of non-empty values for isCanceled */
    countNotEmptyIsCanceled?: boolean | number
    /** Percentage of empty values for isCanceled */
    percentageEmptyIsCanceled?: boolean | number
    /** Percentage of non-empty values for isCanceled */
    percentageNotEmptyIsCanceled?: boolean | number
    /** Count of true values in the field isCanceled */
    countTrueIsCanceled?: boolean | number
    /** Count of false values in the field isCanceled */
    countFalseIsCanceled?: boolean | number
    /** Number of unique values for isFullDay */
    countUniqueValuesIsFullDay?: boolean | number
    /** Number of empty values for isFullDay */
    countEmptyIsFullDay?: boolean | number
    /** Number of non-empty values for isFullDay */
    countNotEmptyIsFullDay?: boolean | number
    /** Percentage of empty values for isFullDay */
    percentageEmptyIsFullDay?: boolean | number
    /** Percentage of non-empty values for isFullDay */
    percentageNotEmptyIsFullDay?: boolean | number
    /** Count of true values in the field isFullDay */
    countTrueIsFullDay?: boolean | number
    /** Count of false values in the field isFullDay */
    countFalseIsFullDay?: boolean | number
    /** Number of unique values for startsAt */
    countUniqueValuesStartsAt?: boolean | number
    /** Number of empty values for startsAt */
    countEmptyStartsAt?: boolean | number
    /** Number of non-empty values for startsAt */
    countNotEmptyStartsAt?: boolean | number
    /** Percentage of empty values for startsAt */
    percentageEmptyStartsAt?: boolean | number
    /** Percentage of non-empty values for startsAt */
    percentageNotEmptyStartsAt?: boolean | number
    /** Earliest date contained in the field startsAt */
    minStartsAt?: boolean | number
    /** Latest date contained in the field startsAt */
    maxStartsAt?: boolean | number
    /** Number of unique values for endsAt */
    countUniqueValuesEndsAt?: boolean | number
    /** Number of empty values for endsAt */
    countEmptyEndsAt?: boolean | number
    /** Number of non-empty values for endsAt */
    countNotEmptyEndsAt?: boolean | number
    /** Percentage of empty values for endsAt */
    percentageEmptyEndsAt?: boolean | number
    /** Percentage of non-empty values for endsAt */
    percentageNotEmptyEndsAt?: boolean | number
    /** Earliest date contained in the field endsAt */
    minEndsAt?: boolean | number
    /** Latest date contained in the field endsAt */
    maxEndsAt?: boolean | number
    /** Number of unique values for externalCreatedAt */
    countUniqueValuesExternalCreatedAt?: boolean | number
    /** Number of empty values for externalCreatedAt */
    countEmptyExternalCreatedAt?: boolean | number
    /** Number of non-empty values for externalCreatedAt */
    countNotEmptyExternalCreatedAt?: boolean | number
    /** Percentage of empty values for externalCreatedAt */
    percentageEmptyExternalCreatedAt?: boolean | number
    /** Percentage of non-empty values for externalCreatedAt */
    percentageNotEmptyExternalCreatedAt?: boolean | number
    /** Earliest date contained in the field externalCreatedAt */
    minExternalCreatedAt?: boolean | number
    /** Latest date contained in the field externalCreatedAt */
    maxExternalCreatedAt?: boolean | number
    /** Number of unique values for externalUpdatedAt */
    countUniqueValuesExternalUpdatedAt?: boolean | number
    /** Number of empty values for externalUpdatedAt */
    countEmptyExternalUpdatedAt?: boolean | number
    /** Number of non-empty values for externalUpdatedAt */
    countNotEmptyExternalUpdatedAt?: boolean | number
    /** Percentage of empty values for externalUpdatedAt */
    percentageEmptyExternalUpdatedAt?: boolean | number
    /** Percentage of non-empty values for externalUpdatedAt */
    percentageNotEmptyExternalUpdatedAt?: boolean | number
    /** Earliest date contained in the field externalUpdatedAt */
    minExternalUpdatedAt?: boolean | number
    /** Latest date contained in the field externalUpdatedAt */
    maxExternalUpdatedAt?: boolean | number
    /** Number of unique values for description */
    countUniqueValuesDescription?: boolean | number
    /** Number of empty values for description */
    countEmptyDescription?: boolean | number
    /** Number of non-empty values for description */
    countNotEmptyDescription?: boolean | number
    /** Percentage of empty values for description */
    percentageEmptyDescription?: boolean | number
    /** Percentage of non-empty values for description */
    percentageNotEmptyDescription?: boolean | number
    /** Number of unique values for location */
    countUniqueValuesLocation?: boolean | number
    /** Number of empty values for location */
    countEmptyLocation?: boolean | number
    /** Number of non-empty values for location */
    countNotEmptyLocation?: boolean | number
    /** Percentage of empty values for location */
    percentageEmptyLocation?: boolean | number
    /** Percentage of non-empty values for location */
    percentageNotEmptyLocation?: boolean | number
    /** Number of unique values for iCalUID */
    countUniqueValuesICalUID?: boolean | number
    /** Number of empty values for iCalUID */
    countEmptyICalUID?: boolean | number
    /** Number of non-empty values for iCalUID */
    countNotEmptyICalUID?: boolean | number
    /** Percentage of empty values for iCalUID */
    percentageEmptyICalUID?: boolean | number
    /** Percentage of non-empty values for iCalUID */
    percentageNotEmptyICalUID?: boolean | number
    /** Number of unique values for conferenceSolution */
    countUniqueValuesConferenceSolution?: boolean | number
    /** Number of empty values for conferenceSolution */
    countEmptyConferenceSolution?: boolean | number
    /** Number of non-empty values for conferenceSolution */
    countNotEmptyConferenceSolution?: boolean | number
    /** Percentage of empty values for conferenceSolution */
    percentageEmptyConferenceSolution?: boolean | number
    /** Percentage of non-empty values for conferenceSolution */
    percentageNotEmptyConferenceSolution?: boolean | number
    /** Number of unique values for conferenceLink */
    countUniqueValuesConferenceLink?: boolean | number
    /** Number of empty values for conferenceLink */
    countEmptyConferenceLink?: boolean | number
    /** Number of non-empty values for conferenceLink */
    countNotEmptyConferenceLink?: boolean | number
    /** Percentage of empty values for conferenceLink */
    percentageEmptyConferenceLink?: boolean | number
    /** Percentage of non-empty values for conferenceLink */
    percentageNotEmptyConferenceLink?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: CalendarEventEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar Channels */
export interface CalendarChannelConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for handle */
    countUniqueValuesHandle?: boolean | number
    /** Number of empty values for handle */
    countEmptyHandle?: boolean | number
    /** Number of non-empty values for handle */
    countNotEmptyHandle?: boolean | number
    /** Percentage of empty values for handle */
    percentageEmptyHandle?: boolean | number
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle?: boolean | number
    /** Number of unique values for syncStatus */
    countUniqueValuesSyncStatus?: boolean | number
    /** Number of empty values for syncStatus */
    countEmptySyncStatus?: boolean | number
    /** Number of non-empty values for syncStatus */
    countNotEmptySyncStatus?: boolean | number
    /** Percentage of empty values for syncStatus */
    percentageEmptySyncStatus?: boolean | number
    /** Percentage of non-empty values for syncStatus */
    percentageNotEmptySyncStatus?: boolean | number
    /** Number of unique values for syncStage */
    countUniqueValuesSyncStage?: boolean | number
    /** Number of empty values for syncStage */
    countEmptySyncStage?: boolean | number
    /** Number of non-empty values for syncStage */
    countNotEmptySyncStage?: boolean | number
    /** Percentage of empty values for syncStage */
    percentageEmptySyncStage?: boolean | number
    /** Percentage of non-empty values for syncStage */
    percentageNotEmptySyncStage?: boolean | number
    /** Number of unique values for visibility */
    countUniqueValuesVisibility?: boolean | number
    /** Number of empty values for visibility */
    countEmptyVisibility?: boolean | number
    /** Number of non-empty values for visibility */
    countNotEmptyVisibility?: boolean | number
    /** Percentage of empty values for visibility */
    percentageEmptyVisibility?: boolean | number
    /** Percentage of non-empty values for visibility */
    percentageNotEmptyVisibility?: boolean | number
    /** Number of unique values for isContactAutoCreationEnabled */
    countUniqueValuesIsContactAutoCreationEnabled?: boolean | number
    /** Number of empty values for isContactAutoCreationEnabled */
    countEmptyIsContactAutoCreationEnabled?: boolean | number
    /** Number of non-empty values for isContactAutoCreationEnabled */
    countNotEmptyIsContactAutoCreationEnabled?: boolean | number
    /** Percentage of empty values for isContactAutoCreationEnabled */
    percentageEmptyIsContactAutoCreationEnabled?: boolean | number
    /** Percentage of non-empty values for isContactAutoCreationEnabled */
    percentageNotEmptyIsContactAutoCreationEnabled?: boolean | number
    /** Count of true values in the field isContactAutoCreationEnabled */
    countTrueIsContactAutoCreationEnabled?: boolean | number
    /** Count of false values in the field isContactAutoCreationEnabled */
    countFalseIsContactAutoCreationEnabled?: boolean | number
    /** Number of unique values for contactAutoCreationPolicy */
    countUniqueValuesContactAutoCreationPolicy?: boolean | number
    /** Number of empty values for contactAutoCreationPolicy */
    countEmptyContactAutoCreationPolicy?: boolean | number
    /** Number of non-empty values for contactAutoCreationPolicy */
    countNotEmptyContactAutoCreationPolicy?: boolean | number
    /** Percentage of empty values for contactAutoCreationPolicy */
    percentageEmptyContactAutoCreationPolicy?: boolean | number
    /** Percentage of non-empty values for contactAutoCreationPolicy */
    percentageNotEmptyContactAutoCreationPolicy?: boolean | number
    /** Number of unique values for isSyncEnabled */
    countUniqueValuesIsSyncEnabled?: boolean | number
    /** Number of empty values for isSyncEnabled */
    countEmptyIsSyncEnabled?: boolean | number
    /** Number of non-empty values for isSyncEnabled */
    countNotEmptyIsSyncEnabled?: boolean | number
    /** Percentage of empty values for isSyncEnabled */
    percentageEmptyIsSyncEnabled?: boolean | number
    /** Percentage of non-empty values for isSyncEnabled */
    percentageNotEmptyIsSyncEnabled?: boolean | number
    /** Count of true values in the field isSyncEnabled */
    countTrueIsSyncEnabled?: boolean | number
    /** Count of false values in the field isSyncEnabled */
    countFalseIsSyncEnabled?: boolean | number
    /** Number of unique values for syncCursor */
    countUniqueValuesSyncCursor?: boolean | number
    /** Number of empty values for syncCursor */
    countEmptySyncCursor?: boolean | number
    /** Number of non-empty values for syncCursor */
    countNotEmptySyncCursor?: boolean | number
    /** Percentage of empty values for syncCursor */
    percentageEmptySyncCursor?: boolean | number
    /** Percentage of non-empty values for syncCursor */
    percentageNotEmptySyncCursor?: boolean | number
    /** Number of unique values for syncedAt */
    countUniqueValuesSyncedAt?: boolean | number
    /** Number of empty values for syncedAt */
    countEmptySyncedAt?: boolean | number
    /** Number of non-empty values for syncedAt */
    countNotEmptySyncedAt?: boolean | number
    /** Percentage of empty values for syncedAt */
    percentageEmptySyncedAt?: boolean | number
    /** Percentage of non-empty values for syncedAt */
    percentageNotEmptySyncedAt?: boolean | number
    /** Earliest date contained in the field syncedAt */
    minSyncedAt?: boolean | number
    /** Latest date contained in the field syncedAt */
    maxSyncedAt?: boolean | number
    /** Number of unique values for syncStageStartedAt */
    countUniqueValuesSyncStageStartedAt?: boolean | number
    /** Number of empty values for syncStageStartedAt */
    countEmptySyncStageStartedAt?: boolean | number
    /** Number of non-empty values for syncStageStartedAt */
    countNotEmptySyncStageStartedAt?: boolean | number
    /** Percentage of empty values for syncStageStartedAt */
    percentageEmptySyncStageStartedAt?: boolean | number
    /** Percentage of non-empty values for syncStageStartedAt */
    percentageNotEmptySyncStageStartedAt?: boolean | number
    /** Earliest date contained in the field syncStageStartedAt */
    minSyncStageStartedAt?: boolean | number
    /** Latest date contained in the field syncStageStartedAt */
    maxSyncStageStartedAt?: boolean | number
    /** Number of unique values for throttleFailureCount */
    countUniqueValuesThrottleFailureCount?: boolean | number
    /** Number of empty values for throttleFailureCount */
    countEmptyThrottleFailureCount?: boolean | number
    /** Number of non-empty values for throttleFailureCount */
    countNotEmptyThrottleFailureCount?: boolean | number
    /** Percentage of empty values for throttleFailureCount */
    percentageEmptyThrottleFailureCount?: boolean | number
    /** Percentage of non-empty values for throttleFailureCount */
    percentageNotEmptyThrottleFailureCount?: boolean | number
    /** Minimum amount contained in the field throttleFailureCount */
    minThrottleFailureCount?: boolean | number
    /** Maximum amount contained in the field throttleFailureCount */
    maxThrottleFailureCount?: boolean | number
    /** Average amount contained in the field throttleFailureCount */
    avgThrottleFailureCount?: boolean | number
    /** Sum of amounts contained in the field throttleFailureCount */
    sumThrottleFailureCount?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: CalendarChannelEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for eventExternalId */
    countUniqueValuesEventExternalId?: boolean | number
    /** Number of empty values for eventExternalId */
    countEmptyEventExternalId?: boolean | number
    /** Number of non-empty values for eventExternalId */
    countNotEmptyEventExternalId?: boolean | number
    /** Percentage of empty values for eventExternalId */
    percentageEmptyEventExternalId?: boolean | number
    /** Percentage of non-empty values for eventExternalId */
    percentageNotEmptyEventExternalId?: boolean | number
    /** Number of unique values for recurringEventExternalId */
    countUniqueValuesRecurringEventExternalId?: boolean | number
    /** Number of empty values for recurringEventExternalId */
    countEmptyRecurringEventExternalId?: boolean | number
    /** Number of non-empty values for recurringEventExternalId */
    countNotEmptyRecurringEventExternalId?: boolean | number
    /** Percentage of empty values for recurringEventExternalId */
    percentageEmptyRecurringEventExternalId?: boolean | number
    /** Percentage of non-empty values for recurringEventExternalId */
    percentageNotEmptyRecurringEventExternalId?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: CalendarChannelEventAssociationEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Calendar event participants */
export interface CalendarEventParticipantConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for handle */
    countUniqueValuesHandle?: boolean | number
    /** Number of empty values for handle */
    countEmptyHandle?: boolean | number
    /** Number of non-empty values for handle */
    countNotEmptyHandle?: boolean | number
    /** Percentage of empty values for handle */
    percentageEmptyHandle?: boolean | number
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle?: boolean | number
    /** Number of unique values for displayName */
    countUniqueValuesDisplayName?: boolean | number
    /** Number of empty values for displayName */
    countEmptyDisplayName?: boolean | number
    /** Number of non-empty values for displayName */
    countNotEmptyDisplayName?: boolean | number
    /** Percentage of empty values for displayName */
    percentageEmptyDisplayName?: boolean | number
    /** Percentage of non-empty values for displayName */
    percentageNotEmptyDisplayName?: boolean | number
    /** Number of unique values for isOrganizer */
    countUniqueValuesIsOrganizer?: boolean | number
    /** Number of empty values for isOrganizer */
    countEmptyIsOrganizer?: boolean | number
    /** Number of non-empty values for isOrganizer */
    countNotEmptyIsOrganizer?: boolean | number
    /** Percentage of empty values for isOrganizer */
    percentageEmptyIsOrganizer?: boolean | number
    /** Percentage of non-empty values for isOrganizer */
    percentageNotEmptyIsOrganizer?: boolean | number
    /** Count of true values in the field isOrganizer */
    countTrueIsOrganizer?: boolean | number
    /** Count of false values in the field isOrganizer */
    countFalseIsOrganizer?: boolean | number
    /** Number of unique values for responseStatus */
    countUniqueValuesResponseStatus?: boolean | number
    /** Number of empty values for responseStatus */
    countEmptyResponseStatus?: boolean | number
    /** Number of non-empty values for responseStatus */
    countNotEmptyResponseStatus?: boolean | number
    /** Percentage of empty values for responseStatus */
    percentageEmptyResponseStatus?: boolean | number
    /** Percentage of non-empty values for responseStatus */
    percentageNotEmptyResponseStatus?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: CalendarEventParticipantEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A company */
export interface CompanyConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for domainName */
    countUniqueValuesDomainName?: boolean | number
    /** Number of empty values for domainName */
    countEmptyDomainName?: boolean | number
    /** Number of non-empty values for domainName */
    countNotEmptyDomainName?: boolean | number
    /** Percentage of empty values for domainName */
    percentageEmptyDomainName?: boolean | number
    /** Percentage of non-empty values for domainName */
    percentageNotEmptyDomainName?: boolean | number
    /** Number of unique values for employees */
    countUniqueValuesEmployees?: boolean | number
    /** Number of empty values for employees */
    countEmptyEmployees?: boolean | number
    /** Number of non-empty values for employees */
    countNotEmptyEmployees?: boolean | number
    /** Percentage of empty values for employees */
    percentageEmptyEmployees?: boolean | number
    /** Percentage of non-empty values for employees */
    percentageNotEmptyEmployees?: boolean | number
    /** Minimum amount contained in the field employees */
    minEmployees?: boolean | number
    /** Maximum amount contained in the field employees */
    maxEmployees?: boolean | number
    /** Average amount contained in the field employees */
    avgEmployees?: boolean | number
    /** Sum of amounts contained in the field employees */
    sumEmployees?: boolean | number
    /** Number of unique values for linkedinLink */
    countUniqueValuesLinkedinLink?: boolean | number
    /** Number of empty values for linkedinLink */
    countEmptyLinkedinLink?: boolean | number
    /** Number of non-empty values for linkedinLink */
    countNotEmptyLinkedinLink?: boolean | number
    /** Percentage of empty values for linkedinLink */
    percentageEmptyLinkedinLink?: boolean | number
    /** Percentage of non-empty values for linkedinLink */
    percentageNotEmptyLinkedinLink?: boolean | number
    /** Number of unique values for xLink */
    countUniqueValuesXLink?: boolean | number
    /** Number of empty values for xLink */
    countEmptyXLink?: boolean | number
    /** Number of non-empty values for xLink */
    countNotEmptyXLink?: boolean | number
    /** Percentage of empty values for xLink */
    percentageEmptyXLink?: boolean | number
    /** Percentage of non-empty values for xLink */
    percentageNotEmptyXLink?: boolean | number
    /** Number of unique values for annualRecurringRevenue */
    countUniqueValuesAnnualRecurringRevenue?: boolean | number
    /** Number of empty values for annualRecurringRevenue */
    countEmptyAnnualRecurringRevenue?: boolean | number
    /** Number of non-empty values for annualRecurringRevenue */
    countNotEmptyAnnualRecurringRevenue?: boolean | number
    /** Percentage of empty values for annualRecurringRevenue */
    percentageEmptyAnnualRecurringRevenue?: boolean | number
    /** Percentage of non-empty values for annualRecurringRevenue */
    percentageNotEmptyAnnualRecurringRevenue?: boolean | number
    /** Minimum amount contained in the field annualRecurringRevenue */
    minAnnualRecurringRevenueAmountMicros?: boolean | number
    /** Maximal amount contained in the field annualRecurringRevenue */
    maxAnnualRecurringRevenueAmountMicros?: boolean | number
    /** Sum of amounts contained in the field annualRecurringRevenue */
    sumAnnualRecurringRevenueAmountMicros?: boolean | number
    /** Average amount contained in the field annualRecurringRevenue */
    avgAnnualRecurringRevenueAmountMicros?: boolean | number
    /** Number of unique values for address */
    countUniqueValuesAddress?: boolean | number
    /** Number of empty values for address */
    countEmptyAddress?: boolean | number
    /** Number of non-empty values for address */
    countNotEmptyAddress?: boolean | number
    /** Percentage of empty values for address */
    percentageEmptyAddress?: boolean | number
    /** Percentage of non-empty values for address */
    percentageNotEmptyAddress?: boolean | number
    /** Number of unique values for idealCustomerProfile */
    countUniqueValuesIdealCustomerProfile?: boolean | number
    /** Number of empty values for idealCustomerProfile */
    countEmptyIdealCustomerProfile?: boolean | number
    /** Number of non-empty values for idealCustomerProfile */
    countNotEmptyIdealCustomerProfile?: boolean | number
    /** Percentage of empty values for idealCustomerProfile */
    percentageEmptyIdealCustomerProfile?: boolean | number
    /** Percentage of non-empty values for idealCustomerProfile */
    percentageNotEmptyIdealCustomerProfile?: boolean | number
    /** Count of true values in the field idealCustomerProfile */
    countTrueIdealCustomerProfile?: boolean | number
    /** Count of false values in the field idealCustomerProfile */
    countFalseIdealCustomerProfile?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    /** Number of unique values for tagline */
    countUniqueValuesTagline?: boolean | number
    /** Number of empty values for tagline */
    countEmptyTagline?: boolean | number
    /** Number of non-empty values for tagline */
    countNotEmptyTagline?: boolean | number
    /** Percentage of empty values for tagline */
    percentageEmptyTagline?: boolean | number
    /** Percentage of non-empty values for tagline */
    percentageNotEmptyTagline?: boolean | number
    /** Number of unique values for introVideo */
    countUniqueValuesIntroVideo?: boolean | number
    /** Number of empty values for introVideo */
    countEmptyIntroVideo?: boolean | number
    /** Number of non-empty values for introVideo */
    countNotEmptyIntroVideo?: boolean | number
    /** Percentage of empty values for introVideo */
    percentageEmptyIntroVideo?: boolean | number
    /** Percentage of non-empty values for introVideo */
    percentageNotEmptyIntroVideo?: boolean | number
    /** Number of unique values for workPolicy */
    countUniqueValuesWorkPolicy?: boolean | number
    /** Number of empty values for workPolicy */
    countEmptyWorkPolicy?: boolean | number
    /** Number of non-empty values for workPolicy */
    countNotEmptyWorkPolicy?: boolean | number
    /** Percentage of empty values for workPolicy */
    percentageEmptyWorkPolicy?: boolean | number
    /** Percentage of non-empty values for workPolicy */
    percentageNotEmptyWorkPolicy?: boolean | number
    /** Number of unique values for visaSponsorship */
    countUniqueValuesVisaSponsorship?: boolean | number
    /** Number of empty values for visaSponsorship */
    countEmptyVisaSponsorship?: boolean | number
    /** Number of non-empty values for visaSponsorship */
    countNotEmptyVisaSponsorship?: boolean | number
    /** Percentage of empty values for visaSponsorship */
    percentageEmptyVisaSponsorship?: boolean | number
    /** Percentage of non-empty values for visaSponsorship */
    percentageNotEmptyVisaSponsorship?: boolean | number
    /** Count of true values in the field visaSponsorship */
    countTrueVisaSponsorship?: boolean | number
    /** Count of false values in the field visaSponsorship */
    countFalseVisaSponsorship?: boolean | number
    edges?: CompanyEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connected account */
export interface ConnectedAccountConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for handle */
    countUniqueValuesHandle?: boolean | number
    /** Number of empty values for handle */
    countEmptyHandle?: boolean | number
    /** Number of non-empty values for handle */
    countNotEmptyHandle?: boolean | number
    /** Percentage of empty values for handle */
    percentageEmptyHandle?: boolean | number
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle?: boolean | number
    /** Number of unique values for provider */
    countUniqueValuesProvider?: boolean | number
    /** Number of empty values for provider */
    countEmptyProvider?: boolean | number
    /** Number of non-empty values for provider */
    countNotEmptyProvider?: boolean | number
    /** Percentage of empty values for provider */
    percentageEmptyProvider?: boolean | number
    /** Percentage of non-empty values for provider */
    percentageNotEmptyProvider?: boolean | number
    /** Number of unique values for accessToken */
    countUniqueValuesAccessToken?: boolean | number
    /** Number of empty values for accessToken */
    countEmptyAccessToken?: boolean | number
    /** Number of non-empty values for accessToken */
    countNotEmptyAccessToken?: boolean | number
    /** Percentage of empty values for accessToken */
    percentageEmptyAccessToken?: boolean | number
    /** Percentage of non-empty values for accessToken */
    percentageNotEmptyAccessToken?: boolean | number
    /** Number of unique values for refreshToken */
    countUniqueValuesRefreshToken?: boolean | number
    /** Number of empty values for refreshToken */
    countEmptyRefreshToken?: boolean | number
    /** Number of non-empty values for refreshToken */
    countNotEmptyRefreshToken?: boolean | number
    /** Percentage of empty values for refreshToken */
    percentageEmptyRefreshToken?: boolean | number
    /** Percentage of non-empty values for refreshToken */
    percentageNotEmptyRefreshToken?: boolean | number
    /** Number of unique values for lastSyncHistoryId */
    countUniqueValuesLastSyncHistoryId?: boolean | number
    /** Number of empty values for lastSyncHistoryId */
    countEmptyLastSyncHistoryId?: boolean | number
    /** Number of non-empty values for lastSyncHistoryId */
    countNotEmptyLastSyncHistoryId?: boolean | number
    /** Percentage of empty values for lastSyncHistoryId */
    percentageEmptyLastSyncHistoryId?: boolean | number
    /** Percentage of non-empty values for lastSyncHistoryId */
    percentageNotEmptyLastSyncHistoryId?: boolean | number
    /** Number of unique values for authFailedAt */
    countUniqueValuesAuthFailedAt?: boolean | number
    /** Number of empty values for authFailedAt */
    countEmptyAuthFailedAt?: boolean | number
    /** Number of non-empty values for authFailedAt */
    countNotEmptyAuthFailedAt?: boolean | number
    /** Percentage of empty values for authFailedAt */
    percentageEmptyAuthFailedAt?: boolean | number
    /** Percentage of non-empty values for authFailedAt */
    percentageNotEmptyAuthFailedAt?: boolean | number
    /** Earliest date contained in the field authFailedAt */
    minAuthFailedAt?: boolean | number
    /** Latest date contained in the field authFailedAt */
    maxAuthFailedAt?: boolean | number
    /** Number of unique values for handleAliases */
    countUniqueValuesHandleAliases?: boolean | number
    /** Number of empty values for handleAliases */
    countEmptyHandleAliases?: boolean | number
    /** Number of non-empty values for handleAliases */
    countNotEmptyHandleAliases?: boolean | number
    /** Percentage of empty values for handleAliases */
    percentageEmptyHandleAliases?: boolean | number
    /** Percentage of non-empty values for handleAliases */
    percentageNotEmptyHandleAliases?: boolean | number
    /** Number of unique values for scopes */
    countUniqueValuesScopes?: boolean | number
    /** Number of empty values for scopes */
    countEmptyScopes?: boolean | number
    /** Number of non-empty values for scopes */
    countNotEmptyScopes?: boolean | number
    /** Percentage of empty values for scopes */
    percentageEmptyScopes?: boolean | number
    /** Percentage of non-empty values for scopes */
    percentageNotEmptyScopes?: boolean | number
    /** Number of unique values for connectionParameters */
    countUniqueValuesConnectionParameters?: boolean | number
    /** Number of empty values for connectionParameters */
    countEmptyConnectionParameters?: boolean | number
    /** Number of non-empty values for connectionParameters */
    countNotEmptyConnectionParameters?: boolean | number
    /** Percentage of empty values for connectionParameters */
    percentageEmptyConnectionParameters?: boolean | number
    /** Percentage of non-empty values for connectionParameters */
    percentageNotEmptyConnectionParameters?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: ConnectedAccountEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A favorite that can be accessed from the left menu */
export interface FavoriteConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Minimum amount contained in the field position */
    minPosition?: boolean | number
    /** Maximum amount contained in the field position */
    maxPosition?: boolean | number
    /** Average amount contained in the field position */
    avgPosition?: boolean | number
    /** Sum of amounts contained in the field position */
    sumPosition?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: FavoriteEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A Folder of favorites */
export interface FavoriteFolderConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Minimum amount contained in the field position */
    minPosition?: boolean | number
    /** Maximum amount contained in the field position */
    maxPosition?: boolean | number
    /** Average amount contained in the field position */
    avgPosition?: boolean | number
    /** Sum of amounts contained in the field position */
    sumPosition?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: FavoriteFolderEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for happensAt */
    countUniqueValuesHappensAt?: boolean | number
    /** Number of empty values for happensAt */
    countEmptyHappensAt?: boolean | number
    /** Number of non-empty values for happensAt */
    countNotEmptyHappensAt?: boolean | number
    /** Percentage of empty values for happensAt */
    percentageEmptyHappensAt?: boolean | number
    /** Percentage of non-empty values for happensAt */
    percentageNotEmptyHappensAt?: boolean | number
    /** Earliest date contained in the field happensAt */
    minHappensAt?: boolean | number
    /** Latest date contained in the field happensAt */
    maxHappensAt?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for properties */
    countUniqueValuesProperties?: boolean | number
    /** Number of empty values for properties */
    countEmptyProperties?: boolean | number
    /** Number of non-empty values for properties */
    countNotEmptyProperties?: boolean | number
    /** Percentage of empty values for properties */
    percentageEmptyProperties?: boolean | number
    /** Percentage of non-empty values for properties */
    percentageNotEmptyProperties?: boolean | number
    /** Number of unique values for linkedRecordCachedName */
    countUniqueValuesLinkedRecordCachedName?: boolean | number
    /** Number of empty values for linkedRecordCachedName */
    countEmptyLinkedRecordCachedName?: boolean | number
    /** Number of non-empty values for linkedRecordCachedName */
    countNotEmptyLinkedRecordCachedName?: boolean | number
    /** Percentage of empty values for linkedRecordCachedName */
    percentageEmptyLinkedRecordCachedName?: boolean | number
    /** Percentage of non-empty values for linkedRecordCachedName */
    percentageNotEmptyLinkedRecordCachedName?: boolean | number
    /** Number of unique values for linkedRecordId */
    countUniqueValuesLinkedRecordId?: boolean | number
    /** Number of empty values for linkedRecordId */
    countEmptyLinkedRecordId?: boolean | number
    /** Number of non-empty values for linkedRecordId */
    countNotEmptyLinkedRecordId?: boolean | number
    /** Percentage of empty values for linkedRecordId */
    percentageEmptyLinkedRecordId?: boolean | number
    /** Percentage of non-empty values for linkedRecordId */
    percentageNotEmptyLinkedRecordId?: boolean | number
    /** Number of unique values for linkedObjectMetadataId */
    countUniqueValuesLinkedObjectMetadataId?: boolean | number
    /** Number of empty values for linkedObjectMetadataId */
    countEmptyLinkedObjectMetadataId?: boolean | number
    /** Number of non-empty values for linkedObjectMetadataId */
    countNotEmptyLinkedObjectMetadataId?: boolean | number
    /** Percentage of empty values for linkedObjectMetadataId */
    percentageEmptyLinkedObjectMetadataId?: boolean | number
    /** Percentage of non-empty values for linkedObjectMetadataId */
    percentageNotEmptyLinkedObjectMetadataId?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: TimelineActivityEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Fields */
export interface ViewFieldConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for fieldMetadataId */
    countUniqueValuesFieldMetadataId?: boolean | number
    /** Number of empty values for fieldMetadataId */
    countEmptyFieldMetadataId?: boolean | number
    /** Number of non-empty values for fieldMetadataId */
    countNotEmptyFieldMetadataId?: boolean | number
    /** Percentage of empty values for fieldMetadataId */
    percentageEmptyFieldMetadataId?: boolean | number
    /** Percentage of non-empty values for fieldMetadataId */
    percentageNotEmptyFieldMetadataId?: boolean | number
    /** Number of unique values for isVisible */
    countUniqueValuesIsVisible?: boolean | number
    /** Number of empty values for isVisible */
    countEmptyIsVisible?: boolean | number
    /** Number of non-empty values for isVisible */
    countNotEmptyIsVisible?: boolean | number
    /** Percentage of empty values for isVisible */
    percentageEmptyIsVisible?: boolean | number
    /** Percentage of non-empty values for isVisible */
    percentageNotEmptyIsVisible?: boolean | number
    /** Count of true values in the field isVisible */
    countTrueIsVisible?: boolean | number
    /** Count of false values in the field isVisible */
    countFalseIsVisible?: boolean | number
    /** Number of unique values for size */
    countUniqueValuesSize?: boolean | number
    /** Number of empty values for size */
    countEmptySize?: boolean | number
    /** Number of non-empty values for size */
    countNotEmptySize?: boolean | number
    /** Percentage of empty values for size */
    percentageEmptySize?: boolean | number
    /** Percentage of non-empty values for size */
    percentageNotEmptySize?: boolean | number
    /** Minimum amount contained in the field size */
    minSize?: boolean | number
    /** Maximum amount contained in the field size */
    maxSize?: boolean | number
    /** Average amount contained in the field size */
    avgSize?: boolean | number
    /** Sum of amounts contained in the field size */
    sumSize?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Minimum amount contained in the field position */
    minPosition?: boolean | number
    /** Maximum amount contained in the field position */
    maxPosition?: boolean | number
    /** Average amount contained in the field position */
    avgPosition?: boolean | number
    /** Sum of amounts contained in the field position */
    sumPosition?: boolean | number
    /** Number of unique values for aggregateOperation */
    countUniqueValuesAggregateOperation?: boolean | number
    /** Number of empty values for aggregateOperation */
    countEmptyAggregateOperation?: boolean | number
    /** Number of non-empty values for aggregateOperation */
    countNotEmptyAggregateOperation?: boolean | number
    /** Percentage of empty values for aggregateOperation */
    percentageEmptyAggregateOperation?: boolean | number
    /** Percentage of non-empty values for aggregateOperation */
    percentageNotEmptyAggregateOperation?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: ViewFieldEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Filter Groups */
export interface ViewFilterGroupConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for logicalOperator */
    countUniqueValuesLogicalOperator?: boolean | number
    /** Number of empty values for logicalOperator */
    countEmptyLogicalOperator?: boolean | number
    /** Number of non-empty values for logicalOperator */
    countNotEmptyLogicalOperator?: boolean | number
    /** Percentage of empty values for logicalOperator */
    percentageEmptyLogicalOperator?: boolean | number
    /** Percentage of non-empty values for logicalOperator */
    percentageNotEmptyLogicalOperator?: boolean | number
    /** Number of unique values for positionInViewFilterGroup */
    countUniqueValuesPositionInViewFilterGroup?: boolean | number
    /** Number of empty values for positionInViewFilterGroup */
    countEmptyPositionInViewFilterGroup?: boolean | number
    /** Number of non-empty values for positionInViewFilterGroup */
    countNotEmptyPositionInViewFilterGroup?: boolean | number
    /** Percentage of empty values for positionInViewFilterGroup */
    percentageEmptyPositionInViewFilterGroup?: boolean | number
    /** Percentage of non-empty values for positionInViewFilterGroup */
    percentageNotEmptyPositionInViewFilterGroup?: boolean | number
    /** Minimum amount contained in the field positionInViewFilterGroup */
    minPositionInViewFilterGroup?: boolean | number
    /** Maximum amount contained in the field positionInViewFilterGroup */
    maxPositionInViewFilterGroup?: boolean | number
    /** Average amount contained in the field positionInViewFilterGroup */
    avgPositionInViewFilterGroup?: boolean | number
    /** Sum of amounts contained in the field positionInViewFilterGroup */
    sumPositionInViewFilterGroup?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    /** Number of unique values for parentViewFilterGroupId */
    countUniqueValuesParentViewFilterGroupId?: boolean | number
    /** Number of empty values for parentViewFilterGroupId */
    countEmptyParentViewFilterGroupId?: boolean | number
    /** Number of non-empty values for parentViewFilterGroupId */
    countNotEmptyParentViewFilterGroupId?: boolean | number
    /** Percentage of empty values for parentViewFilterGroupId */
    percentageEmptyParentViewFilterGroupId?: boolean | number
    /** Percentage of non-empty values for parentViewFilterGroupId */
    percentageNotEmptyParentViewFilterGroupId?: boolean | number
    edges?: ViewFilterGroupEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Groups */
export interface ViewGroupConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for fieldMetadataId */
    countUniqueValuesFieldMetadataId?: boolean | number
    /** Number of empty values for fieldMetadataId */
    countEmptyFieldMetadataId?: boolean | number
    /** Number of non-empty values for fieldMetadataId */
    countNotEmptyFieldMetadataId?: boolean | number
    /** Percentage of empty values for fieldMetadataId */
    percentageEmptyFieldMetadataId?: boolean | number
    /** Percentage of non-empty values for fieldMetadataId */
    percentageNotEmptyFieldMetadataId?: boolean | number
    /** Number of unique values for isVisible */
    countUniqueValuesIsVisible?: boolean | number
    /** Number of empty values for isVisible */
    countEmptyIsVisible?: boolean | number
    /** Number of non-empty values for isVisible */
    countNotEmptyIsVisible?: boolean | number
    /** Percentage of empty values for isVisible */
    percentageEmptyIsVisible?: boolean | number
    /** Percentage of non-empty values for isVisible */
    percentageNotEmptyIsVisible?: boolean | number
    /** Count of true values in the field isVisible */
    countTrueIsVisible?: boolean | number
    /** Count of false values in the field isVisible */
    countFalseIsVisible?: boolean | number
    /** Number of unique values for fieldValue */
    countUniqueValuesFieldValue?: boolean | number
    /** Number of empty values for fieldValue */
    countEmptyFieldValue?: boolean | number
    /** Number of non-empty values for fieldValue */
    countNotEmptyFieldValue?: boolean | number
    /** Percentage of empty values for fieldValue */
    percentageEmptyFieldValue?: boolean | number
    /** Percentage of non-empty values for fieldValue */
    percentageNotEmptyFieldValue?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Minimum amount contained in the field position */
    minPosition?: boolean | number
    /** Maximum amount contained in the field position */
    maxPosition?: boolean | number
    /** Average amount contained in the field position */
    avgPosition?: boolean | number
    /** Sum of amounts contained in the field position */
    sumPosition?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: ViewGroupEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Filters */
export interface ViewFilterConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for fieldMetadataId */
    countUniqueValuesFieldMetadataId?: boolean | number
    /** Number of empty values for fieldMetadataId */
    countEmptyFieldMetadataId?: boolean | number
    /** Number of non-empty values for fieldMetadataId */
    countNotEmptyFieldMetadataId?: boolean | number
    /** Percentage of empty values for fieldMetadataId */
    percentageEmptyFieldMetadataId?: boolean | number
    /** Percentage of non-empty values for fieldMetadataId */
    percentageNotEmptyFieldMetadataId?: boolean | number
    /** Number of unique values for operand */
    countUniqueValuesOperand?: boolean | number
    /** Number of empty values for operand */
    countEmptyOperand?: boolean | number
    /** Number of non-empty values for operand */
    countNotEmptyOperand?: boolean | number
    /** Percentage of empty values for operand */
    percentageEmptyOperand?: boolean | number
    /** Percentage of non-empty values for operand */
    percentageNotEmptyOperand?: boolean | number
    /** Number of unique values for value */
    countUniqueValuesValue?: boolean | number
    /** Number of empty values for value */
    countEmptyValue?: boolean | number
    /** Number of non-empty values for value */
    countNotEmptyValue?: boolean | number
    /** Percentage of empty values for value */
    percentageEmptyValue?: boolean | number
    /** Percentage of non-empty values for value */
    percentageNotEmptyValue?: boolean | number
    /** Number of unique values for displayValue */
    countUniqueValuesDisplayValue?: boolean | number
    /** Number of empty values for displayValue */
    countEmptyDisplayValue?: boolean | number
    /** Number of non-empty values for displayValue */
    countNotEmptyDisplayValue?: boolean | number
    /** Percentage of empty values for displayValue */
    percentageEmptyDisplayValue?: boolean | number
    /** Percentage of non-empty values for displayValue */
    percentageNotEmptyDisplayValue?: boolean | number
    /** Number of unique values for viewFilterGroupId */
    countUniqueValuesViewFilterGroupId?: boolean | number
    /** Number of empty values for viewFilterGroupId */
    countEmptyViewFilterGroupId?: boolean | number
    /** Number of non-empty values for viewFilterGroupId */
    countNotEmptyViewFilterGroupId?: boolean | number
    /** Percentage of empty values for viewFilterGroupId */
    percentageEmptyViewFilterGroupId?: boolean | number
    /** Percentage of non-empty values for viewFilterGroupId */
    percentageNotEmptyViewFilterGroupId?: boolean | number
    /** Number of unique values for positionInViewFilterGroup */
    countUniqueValuesPositionInViewFilterGroup?: boolean | number
    /** Number of empty values for positionInViewFilterGroup */
    countEmptyPositionInViewFilterGroup?: boolean | number
    /** Number of non-empty values for positionInViewFilterGroup */
    countNotEmptyPositionInViewFilterGroup?: boolean | number
    /** Percentage of empty values for positionInViewFilterGroup */
    percentageEmptyPositionInViewFilterGroup?: boolean | number
    /** Percentage of non-empty values for positionInViewFilterGroup */
    percentageNotEmptyPositionInViewFilterGroup?: boolean | number
    /** Minimum amount contained in the field positionInViewFilterGroup */
    minPositionInViewFilterGroup?: boolean | number
    /** Maximum amount contained in the field positionInViewFilterGroup */
    maxPositionInViewFilterGroup?: boolean | number
    /** Average amount contained in the field positionInViewFilterGroup */
    avgPositionInViewFilterGroup?: boolean | number
    /** Sum of amounts contained in the field positionInViewFilterGroup */
    sumPositionInViewFilterGroup?: boolean | number
    /** Number of unique values for subFieldName */
    countUniqueValuesSubFieldName?: boolean | number
    /** Number of empty values for subFieldName */
    countEmptySubFieldName?: boolean | number
    /** Number of non-empty values for subFieldName */
    countNotEmptySubFieldName?: boolean | number
    /** Percentage of empty values for subFieldName */
    percentageEmptySubFieldName?: boolean | number
    /** Percentage of non-empty values for subFieldName */
    percentageNotEmptySubFieldName?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: ViewFilterEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) View Sorts */
export interface ViewSortConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for fieldMetadataId */
    countUniqueValuesFieldMetadataId?: boolean | number
    /** Number of empty values for fieldMetadataId */
    countEmptyFieldMetadataId?: boolean | number
    /** Number of non-empty values for fieldMetadataId */
    countNotEmptyFieldMetadataId?: boolean | number
    /** Percentage of empty values for fieldMetadataId */
    percentageEmptyFieldMetadataId?: boolean | number
    /** Percentage of non-empty values for fieldMetadataId */
    percentageNotEmptyFieldMetadataId?: boolean | number
    /** Number of unique values for direction */
    countUniqueValuesDirection?: boolean | number
    /** Number of empty values for direction */
    countEmptyDirection?: boolean | number
    /** Number of non-empty values for direction */
    countNotEmptyDirection?: boolean | number
    /** Percentage of empty values for direction */
    percentageEmptyDirection?: boolean | number
    /** Percentage of non-empty values for direction */
    percentageNotEmptyDirection?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: ViewSortEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** (System) Views */
export interface ViewConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for objectMetadataId */
    countUniqueValuesObjectMetadataId?: boolean | number
    /** Number of empty values for objectMetadataId */
    countEmptyObjectMetadataId?: boolean | number
    /** Number of non-empty values for objectMetadataId */
    countNotEmptyObjectMetadataId?: boolean | number
    /** Percentage of empty values for objectMetadataId */
    percentageEmptyObjectMetadataId?: boolean | number
    /** Percentage of non-empty values for objectMetadataId */
    percentageNotEmptyObjectMetadataId?: boolean | number
    /** Number of unique values for type */
    countUniqueValuesType?: boolean | number
    /** Number of empty values for type */
    countEmptyType?: boolean | number
    /** Number of non-empty values for type */
    countNotEmptyType?: boolean | number
    /** Percentage of empty values for type */
    percentageEmptyType?: boolean | number
    /** Percentage of non-empty values for type */
    percentageNotEmptyType?: boolean | number
    /** Number of unique values for key */
    countUniqueValuesKey?: boolean | number
    /** Number of empty values for key */
    countEmptyKey?: boolean | number
    /** Number of non-empty values for key */
    countNotEmptyKey?: boolean | number
    /** Percentage of empty values for key */
    percentageEmptyKey?: boolean | number
    /** Percentage of non-empty values for key */
    percentageNotEmptyKey?: boolean | number
    /** Number of unique values for icon */
    countUniqueValuesIcon?: boolean | number
    /** Number of empty values for icon */
    countEmptyIcon?: boolean | number
    /** Number of non-empty values for icon */
    countNotEmptyIcon?: boolean | number
    /** Percentage of empty values for icon */
    percentageEmptyIcon?: boolean | number
    /** Percentage of non-empty values for icon */
    percentageNotEmptyIcon?: boolean | number
    /** Number of unique values for kanbanFieldMetadataId */
    countUniqueValuesKanbanFieldMetadataId?: boolean | number
    /** Number of empty values for kanbanFieldMetadataId */
    countEmptyKanbanFieldMetadataId?: boolean | number
    /** Number of non-empty values for kanbanFieldMetadataId */
    countNotEmptyKanbanFieldMetadataId?: boolean | number
    /** Percentage of empty values for kanbanFieldMetadataId */
    percentageEmptyKanbanFieldMetadataId?: boolean | number
    /** Percentage of non-empty values for kanbanFieldMetadataId */
    percentageNotEmptyKanbanFieldMetadataId?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for isCompact */
    countUniqueValuesIsCompact?: boolean | number
    /** Number of empty values for isCompact */
    countEmptyIsCompact?: boolean | number
    /** Number of non-empty values for isCompact */
    countNotEmptyIsCompact?: boolean | number
    /** Percentage of empty values for isCompact */
    percentageEmptyIsCompact?: boolean | number
    /** Percentage of non-empty values for isCompact */
    percentageNotEmptyIsCompact?: boolean | number
    /** Count of true values in the field isCompact */
    countTrueIsCompact?: boolean | number
    /** Count of false values in the field isCompact */
    countFalseIsCompact?: boolean | number
    /** Number of unique values for openRecordIn */
    countUniqueValuesOpenRecordIn?: boolean | number
    /** Number of empty values for openRecordIn */
    countEmptyOpenRecordIn?: boolean | number
    /** Number of non-empty values for openRecordIn */
    countNotEmptyOpenRecordIn?: boolean | number
    /** Percentage of empty values for openRecordIn */
    percentageEmptyOpenRecordIn?: boolean | number
    /** Percentage of non-empty values for openRecordIn */
    percentageNotEmptyOpenRecordIn?: boolean | number
    /** Number of unique values for kanbanAggregateOperation */
    countUniqueValuesKanbanAggregateOperation?: boolean | number
    /** Number of empty values for kanbanAggregateOperation */
    countEmptyKanbanAggregateOperation?: boolean | number
    /** Number of non-empty values for kanbanAggregateOperation */
    countNotEmptyKanbanAggregateOperation?: boolean | number
    /** Percentage of empty values for kanbanAggregateOperation */
    percentageEmptyKanbanAggregateOperation?: boolean | number
    /** Percentage of non-empty values for kanbanAggregateOperation */
    percentageNotEmptyKanbanAggregateOperation?: boolean | number
    /** Number of unique values for kanbanAggregateOperationFieldMetadataId */
    countUniqueValuesKanbanAggregateOperationFieldMetadataId?: boolean | number
    /** Number of empty values for kanbanAggregateOperationFieldMetadataId */
    countEmptyKanbanAggregateOperationFieldMetadataId?: boolean | number
    /** Number of non-empty values for kanbanAggregateOperationFieldMetadataId */
    countNotEmptyKanbanAggregateOperationFieldMetadataId?: boolean | number
    /** Percentage of empty values for kanbanAggregateOperationFieldMetadataId */
    percentageEmptyKanbanAggregateOperationFieldMetadataId?: boolean | number
    /** Percentage of non-empty values for kanbanAggregateOperationFieldMetadataId */
    percentageNotEmptyKanbanAggregateOperationFieldMetadataId?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: ViewEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A webhook */
export interface WebhookConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for targetUrl */
    countUniqueValuesTargetUrl?: boolean | number
    /** Number of empty values for targetUrl */
    countEmptyTargetUrl?: boolean | number
    /** Number of non-empty values for targetUrl */
    countNotEmptyTargetUrl?: boolean | number
    /** Percentage of empty values for targetUrl */
    percentageEmptyTargetUrl?: boolean | number
    /** Percentage of non-empty values for targetUrl */
    percentageNotEmptyTargetUrl?: boolean | number
    /** Number of unique values for operations */
    countUniqueValuesOperations?: boolean | number
    /** Number of empty values for operations */
    countEmptyOperations?: boolean | number
    /** Number of non-empty values for operations */
    countNotEmptyOperations?: boolean | number
    /** Percentage of empty values for operations */
    percentageEmptyOperations?: boolean | number
    /** Percentage of non-empty values for operations */
    percentageNotEmptyOperations?: boolean | number
    /** Number of unique values for description */
    countUniqueValuesDescription?: boolean | number
    /** Number of empty values for description */
    countEmptyDescription?: boolean | number
    /** Number of non-empty values for description */
    countNotEmptyDescription?: boolean | number
    /** Percentage of empty values for description */
    percentageEmptyDescription?: boolean | number
    /** Percentage of non-empty values for description */
    percentageNotEmptyDescription?: boolean | number
    /** Number of unique values for secret */
    countUniqueValuesSecret?: boolean | number
    /** Number of empty values for secret */
    countEmptySecret?: boolean | number
    /** Number of non-empty values for secret */
    countNotEmptySecret?: boolean | number
    /** Percentage of empty values for secret */
    percentageEmptySecret?: boolean | number
    /** Percentage of non-empty values for secret */
    percentageNotEmptySecret?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: WebhookEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow */
export interface WorkflowConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for lastPublishedVersionId */
    countUniqueValuesLastPublishedVersionId?: boolean | number
    /** Number of empty values for lastPublishedVersionId */
    countEmptyLastPublishedVersionId?: boolean | number
    /** Number of non-empty values for lastPublishedVersionId */
    countNotEmptyLastPublishedVersionId?: boolean | number
    /** Percentage of empty values for lastPublishedVersionId */
    percentageEmptyLastPublishedVersionId?: boolean | number
    /** Percentage of non-empty values for lastPublishedVersionId */
    percentageNotEmptyLastPublishedVersionId?: boolean | number
    /** Number of unique values for statuses */
    countUniqueValuesStatuses?: boolean | number
    /** Number of empty values for statuses */
    countEmptyStatuses?: boolean | number
    /** Number of non-empty values for statuses */
    countNotEmptyStatuses?: boolean | number
    /** Percentage of empty values for statuses */
    percentageEmptyStatuses?: boolean | number
    /** Percentage of non-empty values for statuses */
    percentageNotEmptyStatuses?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: WorkflowEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow version */
export interface WorkflowVersionConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for trigger */
    countUniqueValuesTrigger?: boolean | number
    /** Number of empty values for trigger */
    countEmptyTrigger?: boolean | number
    /** Number of non-empty values for trigger */
    countNotEmptyTrigger?: boolean | number
    /** Percentage of empty values for trigger */
    percentageEmptyTrigger?: boolean | number
    /** Percentage of non-empty values for trigger */
    percentageNotEmptyTrigger?: boolean | number
    /** Number of unique values for steps */
    countUniqueValuesSteps?: boolean | number
    /** Number of empty values for steps */
    countEmptySteps?: boolean | number
    /** Number of non-empty values for steps */
    countNotEmptySteps?: boolean | number
    /** Percentage of empty values for steps */
    percentageEmptySteps?: boolean | number
    /** Percentage of non-empty values for steps */
    percentageNotEmptySteps?: boolean | number
    /** Number of unique values for status */
    countUniqueValuesStatus?: boolean | number
    /** Number of empty values for status */
    countEmptyStatus?: boolean | number
    /** Number of non-empty values for status */
    countNotEmptyStatus?: boolean | number
    /** Percentage of empty values for status */
    percentageEmptyStatus?: boolean | number
    /** Percentage of non-empty values for status */
    percentageNotEmptyStatus?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: WorkflowVersionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow run */
export interface WorkflowRunConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for startedAt */
    countUniqueValuesStartedAt?: boolean | number
    /** Number of empty values for startedAt */
    countEmptyStartedAt?: boolean | number
    /** Number of non-empty values for startedAt */
    countNotEmptyStartedAt?: boolean | number
    /** Percentage of empty values for startedAt */
    percentageEmptyStartedAt?: boolean | number
    /** Percentage of non-empty values for startedAt */
    percentageNotEmptyStartedAt?: boolean | number
    /** Earliest date contained in the field startedAt */
    minStartedAt?: boolean | number
    /** Latest date contained in the field startedAt */
    maxStartedAt?: boolean | number
    /** Number of unique values for endedAt */
    countUniqueValuesEndedAt?: boolean | number
    /** Number of empty values for endedAt */
    countEmptyEndedAt?: boolean | number
    /** Number of non-empty values for endedAt */
    countNotEmptyEndedAt?: boolean | number
    /** Percentage of empty values for endedAt */
    percentageEmptyEndedAt?: boolean | number
    /** Percentage of non-empty values for endedAt */
    percentageNotEmptyEndedAt?: boolean | number
    /** Earliest date contained in the field endedAt */
    minEndedAt?: boolean | number
    /** Latest date contained in the field endedAt */
    maxEndedAt?: boolean | number
    /** Number of unique values for status */
    countUniqueValuesStatus?: boolean | number
    /** Number of empty values for status */
    countEmptyStatus?: boolean | number
    /** Number of non-empty values for status */
    countNotEmptyStatus?: boolean | number
    /** Percentage of empty values for status */
    percentageEmptyStatus?: boolean | number
    /** Percentage of non-empty values for status */
    percentageNotEmptyStatus?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for output */
    countUniqueValuesOutput?: boolean | number
    /** Number of empty values for output */
    countEmptyOutput?: boolean | number
    /** Number of non-empty values for output */
    countNotEmptyOutput?: boolean | number
    /** Percentage of empty values for output */
    percentageEmptyOutput?: boolean | number
    /** Percentage of non-empty values for output */
    percentageNotEmptyOutput?: boolean | number
    /** Number of unique values for context */
    countUniqueValuesContext?: boolean | number
    /** Number of empty values for context */
    countEmptyContext?: boolean | number
    /** Number of non-empty values for context */
    countNotEmptyContext?: boolean | number
    /** Percentage of empty values for context */
    percentageEmptyContext?: boolean | number
    /** Percentage of non-empty values for context */
    percentageNotEmptyContext?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: WorkflowRunEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for type */
    countUniqueValuesType?: boolean | number
    /** Number of empty values for type */
    countEmptyType?: boolean | number
    /** Number of non-empty values for type */
    countNotEmptyType?: boolean | number
    /** Percentage of empty values for type */
    percentageEmptyType?: boolean | number
    /** Percentage of non-empty values for type */
    percentageNotEmptyType?: boolean | number
    /** Number of unique values for settings */
    countUniqueValuesSettings?: boolean | number
    /** Number of empty values for settings */
    countEmptySettings?: boolean | number
    /** Number of non-empty values for settings */
    countNotEmptySettings?: boolean | number
    /** Percentage of empty values for settings */
    percentageEmptySettings?: boolean | number
    /** Percentage of non-empty values for settings */
    percentageNotEmptySettings?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: WorkflowAutomatedTriggerEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A workspace member */
export interface WorkspaceMemberConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for colorScheme */
    countUniqueValuesColorScheme?: boolean | number
    /** Number of empty values for colorScheme */
    countEmptyColorScheme?: boolean | number
    /** Number of non-empty values for colorScheme */
    countNotEmptyColorScheme?: boolean | number
    /** Percentage of empty values for colorScheme */
    percentageEmptyColorScheme?: boolean | number
    /** Percentage of non-empty values for colorScheme */
    percentageNotEmptyColorScheme?: boolean | number
    /** Number of unique values for locale */
    countUniqueValuesLocale?: boolean | number
    /** Number of empty values for locale */
    countEmptyLocale?: boolean | number
    /** Number of non-empty values for locale */
    countNotEmptyLocale?: boolean | number
    /** Percentage of empty values for locale */
    percentageEmptyLocale?: boolean | number
    /** Percentage of non-empty values for locale */
    percentageNotEmptyLocale?: boolean | number
    /** Number of unique values for avatarUrl */
    countUniqueValuesAvatarUrl?: boolean | number
    /** Number of empty values for avatarUrl */
    countEmptyAvatarUrl?: boolean | number
    /** Number of non-empty values for avatarUrl */
    countNotEmptyAvatarUrl?: boolean | number
    /** Percentage of empty values for avatarUrl */
    percentageEmptyAvatarUrl?: boolean | number
    /** Percentage of non-empty values for avatarUrl */
    percentageNotEmptyAvatarUrl?: boolean | number
    /** Number of unique values for userEmail */
    countUniqueValuesUserEmail?: boolean | number
    /** Number of empty values for userEmail */
    countEmptyUserEmail?: boolean | number
    /** Number of non-empty values for userEmail */
    countNotEmptyUserEmail?: boolean | number
    /** Percentage of empty values for userEmail */
    percentageEmptyUserEmail?: boolean | number
    /** Percentage of non-empty values for userEmail */
    percentageNotEmptyUserEmail?: boolean | number
    /** Number of unique values for userId */
    countUniqueValuesUserId?: boolean | number
    /** Number of empty values for userId */
    countEmptyUserId?: boolean | number
    /** Number of non-empty values for userId */
    countNotEmptyUserId?: boolean | number
    /** Percentage of empty values for userId */
    percentageEmptyUserId?: boolean | number
    /** Percentage of non-empty values for userId */
    percentageNotEmptyUserId?: boolean | number
    /** Number of unique values for timeZone */
    countUniqueValuesTimeZone?: boolean | number
    /** Number of empty values for timeZone */
    countEmptyTimeZone?: boolean | number
    /** Number of non-empty values for timeZone */
    countNotEmptyTimeZone?: boolean | number
    /** Percentage of empty values for timeZone */
    percentageEmptyTimeZone?: boolean | number
    /** Percentage of non-empty values for timeZone */
    percentageNotEmptyTimeZone?: boolean | number
    /** Number of unique values for dateFormat */
    countUniqueValuesDateFormat?: boolean | number
    /** Number of empty values for dateFormat */
    countEmptyDateFormat?: boolean | number
    /** Number of non-empty values for dateFormat */
    countNotEmptyDateFormat?: boolean | number
    /** Percentage of empty values for dateFormat */
    percentageEmptyDateFormat?: boolean | number
    /** Percentage of non-empty values for dateFormat */
    percentageNotEmptyDateFormat?: boolean | number
    /** Number of unique values for timeFormat */
    countUniqueValuesTimeFormat?: boolean | number
    /** Number of empty values for timeFormat */
    countEmptyTimeFormat?: boolean | number
    /** Number of non-empty values for timeFormat */
    countNotEmptyTimeFormat?: boolean | number
    /** Percentage of empty values for timeFormat */
    percentageEmptyTimeFormat?: boolean | number
    /** Percentage of non-empty values for timeFormat */
    percentageNotEmptyTimeFormat?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: WorkspaceMemberEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A note */
export interface NoteConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for title */
    countUniqueValuesTitle?: boolean | number
    /** Number of empty values for title */
    countEmptyTitle?: boolean | number
    /** Number of non-empty values for title */
    countNotEmptyTitle?: boolean | number
    /** Percentage of empty values for title */
    percentageEmptyTitle?: boolean | number
    /** Percentage of non-empty values for title */
    percentageNotEmptyTitle?: boolean | number
    /** Number of unique values for body */
    countUniqueValuesBody?: boolean | number
    /** Number of empty values for body */
    countEmptyBody?: boolean | number
    /** Number of non-empty values for body */
    countNotEmptyBody?: boolean | number
    /** Percentage of empty values for body */
    percentageEmptyBody?: boolean | number
    /** Percentage of non-empty values for body */
    percentageNotEmptyBody?: boolean | number
    /** Number of unique values for bodyV2 */
    countUniqueValuesBodyV2?: boolean | number
    /** Number of empty values for bodyV2 */
    countEmptyBodyV2?: boolean | number
    /** Number of non-empty values for bodyV2 */
    countNotEmptyBodyV2?: boolean | number
    /** Percentage of empty values for bodyV2 */
    percentageEmptyBodyV2?: boolean | number
    /** Percentage of non-empty values for bodyV2 */
    percentageNotEmptyBodyV2?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    edges?: NoteEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A task target */
export interface TaskTargetConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: TaskTargetEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: MessageThreadEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for headerMessageId */
    countUniqueValuesHeaderMessageId?: boolean | number
    /** Number of empty values for headerMessageId */
    countEmptyHeaderMessageId?: boolean | number
    /** Number of non-empty values for headerMessageId */
    countNotEmptyHeaderMessageId?: boolean | number
    /** Percentage of empty values for headerMessageId */
    percentageEmptyHeaderMessageId?: boolean | number
    /** Percentage of non-empty values for headerMessageId */
    percentageNotEmptyHeaderMessageId?: boolean | number
    /** Number of unique values for subject */
    countUniqueValuesSubject?: boolean | number
    /** Number of empty values for subject */
    countEmptySubject?: boolean | number
    /** Number of non-empty values for subject */
    countNotEmptySubject?: boolean | number
    /** Percentage of empty values for subject */
    percentageEmptySubject?: boolean | number
    /** Percentage of non-empty values for subject */
    percentageNotEmptySubject?: boolean | number
    /** Number of unique values for text */
    countUniqueValuesText?: boolean | number
    /** Number of empty values for text */
    countEmptyText?: boolean | number
    /** Number of non-empty values for text */
    countNotEmptyText?: boolean | number
    /** Percentage of empty values for text */
    percentageEmptyText?: boolean | number
    /** Percentage of non-empty values for text */
    percentageNotEmptyText?: boolean | number
    /** Number of unique values for receivedAt */
    countUniqueValuesReceivedAt?: boolean | number
    /** Number of empty values for receivedAt */
    countEmptyReceivedAt?: boolean | number
    /** Number of non-empty values for receivedAt */
    countNotEmptyReceivedAt?: boolean | number
    /** Percentage of empty values for receivedAt */
    percentageEmptyReceivedAt?: boolean | number
    /** Percentage of non-empty values for receivedAt */
    percentageNotEmptyReceivedAt?: boolean | number
    /** Earliest date contained in the field receivedAt */
    minReceivedAt?: boolean | number
    /** Latest date contained in the field receivedAt */
    maxReceivedAt?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: MessageEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Channels */
export interface MessageChannelConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for visibility */
    countUniqueValuesVisibility?: boolean | number
    /** Number of empty values for visibility */
    countEmptyVisibility?: boolean | number
    /** Number of non-empty values for visibility */
    countNotEmptyVisibility?: boolean | number
    /** Percentage of empty values for visibility */
    percentageEmptyVisibility?: boolean | number
    /** Percentage of non-empty values for visibility */
    percentageNotEmptyVisibility?: boolean | number
    /** Number of unique values for handle */
    countUniqueValuesHandle?: boolean | number
    /** Number of empty values for handle */
    countEmptyHandle?: boolean | number
    /** Number of non-empty values for handle */
    countNotEmptyHandle?: boolean | number
    /** Percentage of empty values for handle */
    percentageEmptyHandle?: boolean | number
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle?: boolean | number
    /** Number of unique values for type */
    countUniqueValuesType?: boolean | number
    /** Number of empty values for type */
    countEmptyType?: boolean | number
    /** Number of non-empty values for type */
    countNotEmptyType?: boolean | number
    /** Percentage of empty values for type */
    percentageEmptyType?: boolean | number
    /** Percentage of non-empty values for type */
    percentageNotEmptyType?: boolean | number
    /** Number of unique values for isContactAutoCreationEnabled */
    countUniqueValuesIsContactAutoCreationEnabled?: boolean | number
    /** Number of empty values for isContactAutoCreationEnabled */
    countEmptyIsContactAutoCreationEnabled?: boolean | number
    /** Number of non-empty values for isContactAutoCreationEnabled */
    countNotEmptyIsContactAutoCreationEnabled?: boolean | number
    /** Percentage of empty values for isContactAutoCreationEnabled */
    percentageEmptyIsContactAutoCreationEnabled?: boolean | number
    /** Percentage of non-empty values for isContactAutoCreationEnabled */
    percentageNotEmptyIsContactAutoCreationEnabled?: boolean | number
    /** Count of true values in the field isContactAutoCreationEnabled */
    countTrueIsContactAutoCreationEnabled?: boolean | number
    /** Count of false values in the field isContactAutoCreationEnabled */
    countFalseIsContactAutoCreationEnabled?: boolean | number
    /** Number of unique values for contactAutoCreationPolicy */
    countUniqueValuesContactAutoCreationPolicy?: boolean | number
    /** Number of empty values for contactAutoCreationPolicy */
    countEmptyContactAutoCreationPolicy?: boolean | number
    /** Number of non-empty values for contactAutoCreationPolicy */
    countNotEmptyContactAutoCreationPolicy?: boolean | number
    /** Percentage of empty values for contactAutoCreationPolicy */
    percentageEmptyContactAutoCreationPolicy?: boolean | number
    /** Percentage of non-empty values for contactAutoCreationPolicy */
    percentageNotEmptyContactAutoCreationPolicy?: boolean | number
    /** Number of unique values for excludeNonProfessionalEmails */
    countUniqueValuesExcludeNonProfessionalEmails?: boolean | number
    /** Number of empty values for excludeNonProfessionalEmails */
    countEmptyExcludeNonProfessionalEmails?: boolean | number
    /** Number of non-empty values for excludeNonProfessionalEmails */
    countNotEmptyExcludeNonProfessionalEmails?: boolean | number
    /** Percentage of empty values for excludeNonProfessionalEmails */
    percentageEmptyExcludeNonProfessionalEmails?: boolean | number
    /** Percentage of non-empty values for excludeNonProfessionalEmails */
    percentageNotEmptyExcludeNonProfessionalEmails?: boolean | number
    /** Count of true values in the field excludeNonProfessionalEmails */
    countTrueExcludeNonProfessionalEmails?: boolean | number
    /** Count of false values in the field excludeNonProfessionalEmails */
    countFalseExcludeNonProfessionalEmails?: boolean | number
    /** Number of unique values for excludeGroupEmails */
    countUniqueValuesExcludeGroupEmails?: boolean | number
    /** Number of empty values for excludeGroupEmails */
    countEmptyExcludeGroupEmails?: boolean | number
    /** Number of non-empty values for excludeGroupEmails */
    countNotEmptyExcludeGroupEmails?: boolean | number
    /** Percentage of empty values for excludeGroupEmails */
    percentageEmptyExcludeGroupEmails?: boolean | number
    /** Percentage of non-empty values for excludeGroupEmails */
    percentageNotEmptyExcludeGroupEmails?: boolean | number
    /** Count of true values in the field excludeGroupEmails */
    countTrueExcludeGroupEmails?: boolean | number
    /** Count of false values in the field excludeGroupEmails */
    countFalseExcludeGroupEmails?: boolean | number
    /** Number of unique values for isSyncEnabled */
    countUniqueValuesIsSyncEnabled?: boolean | number
    /** Number of empty values for isSyncEnabled */
    countEmptyIsSyncEnabled?: boolean | number
    /** Number of non-empty values for isSyncEnabled */
    countNotEmptyIsSyncEnabled?: boolean | number
    /** Percentage of empty values for isSyncEnabled */
    percentageEmptyIsSyncEnabled?: boolean | number
    /** Percentage of non-empty values for isSyncEnabled */
    percentageNotEmptyIsSyncEnabled?: boolean | number
    /** Count of true values in the field isSyncEnabled */
    countTrueIsSyncEnabled?: boolean | number
    /** Count of false values in the field isSyncEnabled */
    countFalseIsSyncEnabled?: boolean | number
    /** Number of unique values for syncCursor */
    countUniqueValuesSyncCursor?: boolean | number
    /** Number of empty values for syncCursor */
    countEmptySyncCursor?: boolean | number
    /** Number of non-empty values for syncCursor */
    countNotEmptySyncCursor?: boolean | number
    /** Percentage of empty values for syncCursor */
    percentageEmptySyncCursor?: boolean | number
    /** Percentage of non-empty values for syncCursor */
    percentageNotEmptySyncCursor?: boolean | number
    /** Number of unique values for syncedAt */
    countUniqueValuesSyncedAt?: boolean | number
    /** Number of empty values for syncedAt */
    countEmptySyncedAt?: boolean | number
    /** Number of non-empty values for syncedAt */
    countNotEmptySyncedAt?: boolean | number
    /** Percentage of empty values for syncedAt */
    percentageEmptySyncedAt?: boolean | number
    /** Percentage of non-empty values for syncedAt */
    percentageNotEmptySyncedAt?: boolean | number
    /** Earliest date contained in the field syncedAt */
    minSyncedAt?: boolean | number
    /** Latest date contained in the field syncedAt */
    maxSyncedAt?: boolean | number
    /** Number of unique values for syncStatus */
    countUniqueValuesSyncStatus?: boolean | number
    /** Number of empty values for syncStatus */
    countEmptySyncStatus?: boolean | number
    /** Number of non-empty values for syncStatus */
    countNotEmptySyncStatus?: boolean | number
    /** Percentage of empty values for syncStatus */
    percentageEmptySyncStatus?: boolean | number
    /** Percentage of non-empty values for syncStatus */
    percentageNotEmptySyncStatus?: boolean | number
    /** Number of unique values for syncStage */
    countUniqueValuesSyncStage?: boolean | number
    /** Number of empty values for syncStage */
    countEmptySyncStage?: boolean | number
    /** Number of non-empty values for syncStage */
    countNotEmptySyncStage?: boolean | number
    /** Percentage of empty values for syncStage */
    percentageEmptySyncStage?: boolean | number
    /** Percentage of non-empty values for syncStage */
    percentageNotEmptySyncStage?: boolean | number
    /** Number of unique values for syncStageStartedAt */
    countUniqueValuesSyncStageStartedAt?: boolean | number
    /** Number of empty values for syncStageStartedAt */
    countEmptySyncStageStartedAt?: boolean | number
    /** Number of non-empty values for syncStageStartedAt */
    countNotEmptySyncStageStartedAt?: boolean | number
    /** Percentage of empty values for syncStageStartedAt */
    percentageEmptySyncStageStartedAt?: boolean | number
    /** Percentage of non-empty values for syncStageStartedAt */
    percentageNotEmptySyncStageStartedAt?: boolean | number
    /** Earliest date contained in the field syncStageStartedAt */
    minSyncStageStartedAt?: boolean | number
    /** Latest date contained in the field syncStageStartedAt */
    maxSyncStageStartedAt?: boolean | number
    /** Number of unique values for throttleFailureCount */
    countUniqueValuesThrottleFailureCount?: boolean | number
    /** Number of empty values for throttleFailureCount */
    countEmptyThrottleFailureCount?: boolean | number
    /** Number of non-empty values for throttleFailureCount */
    countNotEmptyThrottleFailureCount?: boolean | number
    /** Percentage of empty values for throttleFailureCount */
    percentageEmptyThrottleFailureCount?: boolean | number
    /** Percentage of non-empty values for throttleFailureCount */
    percentageNotEmptyThrottleFailureCount?: boolean | number
    /** Minimum amount contained in the field throttleFailureCount */
    minThrottleFailureCount?: boolean | number
    /** Maximum amount contained in the field throttleFailureCount */
    maxThrottleFailureCount?: boolean | number
    /** Average amount contained in the field throttleFailureCount */
    avgThrottleFailureCount?: boolean | number
    /** Sum of amounts contained in the field throttleFailureCount */
    sumThrottleFailureCount?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: MessageChannelEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Participants */
export interface MessageParticipantConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for role */
    countUniqueValuesRole?: boolean | number
    /** Number of empty values for role */
    countEmptyRole?: boolean | number
    /** Number of non-empty values for role */
    countNotEmptyRole?: boolean | number
    /** Percentage of empty values for role */
    percentageEmptyRole?: boolean | number
    /** Percentage of non-empty values for role */
    percentageNotEmptyRole?: boolean | number
    /** Number of unique values for handle */
    countUniqueValuesHandle?: boolean | number
    /** Number of empty values for handle */
    countEmptyHandle?: boolean | number
    /** Number of non-empty values for handle */
    countNotEmptyHandle?: boolean | number
    /** Percentage of empty values for handle */
    percentageEmptyHandle?: boolean | number
    /** Percentage of non-empty values for handle */
    percentageNotEmptyHandle?: boolean | number
    /** Number of unique values for displayName */
    countUniqueValuesDisplayName?: boolean | number
    /** Number of empty values for displayName */
    countEmptyDisplayName?: boolean | number
    /** Number of non-empty values for displayName */
    countNotEmptyDisplayName?: boolean | number
    /** Percentage of empty values for displayName */
    percentageEmptyDisplayName?: boolean | number
    /** Percentage of non-empty values for displayName */
    percentageNotEmptyDisplayName?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: MessageParticipantEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Folder for Message Channel */
export interface MessageFolderConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for syncCursor */
    countUniqueValuesSyncCursor?: boolean | number
    /** Number of empty values for syncCursor */
    countEmptySyncCursor?: boolean | number
    /** Number of non-empty values for syncCursor */
    countNotEmptySyncCursor?: boolean | number
    /** Percentage of empty values for syncCursor */
    percentageEmptySyncCursor?: boolean | number
    /** Percentage of non-empty values for syncCursor */
    percentageNotEmptySyncCursor?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: MessageFolderEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for messageExternalId */
    countUniqueValuesMessageExternalId?: boolean | number
    /** Number of empty values for messageExternalId */
    countEmptyMessageExternalId?: boolean | number
    /** Number of non-empty values for messageExternalId */
    countNotEmptyMessageExternalId?: boolean | number
    /** Percentage of empty values for messageExternalId */
    percentageEmptyMessageExternalId?: boolean | number
    /** Percentage of non-empty values for messageExternalId */
    percentageNotEmptyMessageExternalId?: boolean | number
    /** Number of unique values for messageThreadExternalId */
    countUniqueValuesMessageThreadExternalId?: boolean | number
    /** Number of empty values for messageThreadExternalId */
    countEmptyMessageThreadExternalId?: boolean | number
    /** Number of non-empty values for messageThreadExternalId */
    countNotEmptyMessageThreadExternalId?: boolean | number
    /** Percentage of empty values for messageThreadExternalId */
    percentageEmptyMessageThreadExternalId?: boolean | number
    /** Percentage of non-empty values for messageThreadExternalId */
    percentageNotEmptyMessageThreadExternalId?: boolean | number
    /** Number of unique values for direction */
    countUniqueValuesDirection?: boolean | number
    /** Number of empty values for direction */
    countEmptyDirection?: boolean | number
    /** Number of non-empty values for direction */
    countNotEmptyDirection?: boolean | number
    /** Percentage of empty values for direction */
    percentageEmptyDirection?: boolean | number
    /** Percentage of non-empty values for direction */
    percentageNotEmptyDirection?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: MessageChannelMessageAssociationEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A note target */
export interface NoteTargetConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: NoteTargetEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An opportunity */
export interface OpportunityConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for amount */
    countUniqueValuesAmount?: boolean | number
    /** Number of empty values for amount */
    countEmptyAmount?: boolean | number
    /** Number of non-empty values for amount */
    countNotEmptyAmount?: boolean | number
    /** Percentage of empty values for amount */
    percentageEmptyAmount?: boolean | number
    /** Percentage of non-empty values for amount */
    percentageNotEmptyAmount?: boolean | number
    /** Minimum amount contained in the field amount */
    minAmountAmountMicros?: boolean | number
    /** Maximal amount contained in the field amount */
    maxAmountAmountMicros?: boolean | number
    /** Sum of amounts contained in the field amount */
    sumAmountAmountMicros?: boolean | number
    /** Average amount contained in the field amount */
    avgAmountAmountMicros?: boolean | number
    /** Number of unique values for closeDate */
    countUniqueValuesCloseDate?: boolean | number
    /** Number of empty values for closeDate */
    countEmptyCloseDate?: boolean | number
    /** Number of non-empty values for closeDate */
    countNotEmptyCloseDate?: boolean | number
    /** Percentage of empty values for closeDate */
    percentageEmptyCloseDate?: boolean | number
    /** Percentage of non-empty values for closeDate */
    percentageNotEmptyCloseDate?: boolean | number
    /** Earliest date contained in the field closeDate */
    minCloseDate?: boolean | number
    /** Latest date contained in the field closeDate */
    maxCloseDate?: boolean | number
    /** Number of unique values for stage */
    countUniqueValuesStage?: boolean | number
    /** Number of empty values for stage */
    countEmptyStage?: boolean | number
    /** Number of non-empty values for stage */
    countNotEmptyStage?: boolean | number
    /** Percentage of empty values for stage */
    percentageEmptyStage?: boolean | number
    /** Percentage of non-empty values for stage */
    percentageNotEmptyStage?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: OpportunityEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A person */
export interface PersonConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for emails */
    countUniqueValuesEmails?: boolean | number
    /** Number of empty values for emails */
    countEmptyEmails?: boolean | number
    /** Number of non-empty values for emails */
    countNotEmptyEmails?: boolean | number
    /** Percentage of empty values for emails */
    percentageEmptyEmails?: boolean | number
    /** Percentage of non-empty values for emails */
    percentageNotEmptyEmails?: boolean | number
    /** Number of unique values for linkedinLink */
    countUniqueValuesLinkedinLink?: boolean | number
    /** Number of empty values for linkedinLink */
    countEmptyLinkedinLink?: boolean | number
    /** Number of non-empty values for linkedinLink */
    countNotEmptyLinkedinLink?: boolean | number
    /** Percentage of empty values for linkedinLink */
    percentageEmptyLinkedinLink?: boolean | number
    /** Percentage of non-empty values for linkedinLink */
    percentageNotEmptyLinkedinLink?: boolean | number
    /** Number of unique values for xLink */
    countUniqueValuesXLink?: boolean | number
    /** Number of empty values for xLink */
    countEmptyXLink?: boolean | number
    /** Number of non-empty values for xLink */
    countNotEmptyXLink?: boolean | number
    /** Percentage of empty values for xLink */
    percentageEmptyXLink?: boolean | number
    /** Percentage of non-empty values for xLink */
    percentageNotEmptyXLink?: boolean | number
    /** Number of unique values for jobTitle */
    countUniqueValuesJobTitle?: boolean | number
    /** Number of empty values for jobTitle */
    countEmptyJobTitle?: boolean | number
    /** Number of non-empty values for jobTitle */
    countNotEmptyJobTitle?: boolean | number
    /** Percentage of empty values for jobTitle */
    percentageEmptyJobTitle?: boolean | number
    /** Percentage of non-empty values for jobTitle */
    percentageNotEmptyJobTitle?: boolean | number
    /** Number of unique values for phones */
    countUniqueValuesPhones?: boolean | number
    /** Number of empty values for phones */
    countEmptyPhones?: boolean | number
    /** Number of non-empty values for phones */
    countNotEmptyPhones?: boolean | number
    /** Percentage of empty values for phones */
    percentageEmptyPhones?: boolean | number
    /** Percentage of non-empty values for phones */
    percentageNotEmptyPhones?: boolean | number
    /** Number of unique values for city */
    countUniqueValuesCity?: boolean | number
    /** Number of empty values for city */
    countEmptyCity?: boolean | number
    /** Number of non-empty values for city */
    countNotEmptyCity?: boolean | number
    /** Percentage of empty values for city */
    percentageEmptyCity?: boolean | number
    /** Percentage of non-empty values for city */
    percentageNotEmptyCity?: boolean | number
    /** Number of unique values for avatarUrl */
    countUniqueValuesAvatarUrl?: boolean | number
    /** Number of empty values for avatarUrl */
    countEmptyAvatarUrl?: boolean | number
    /** Number of non-empty values for avatarUrl */
    countNotEmptyAvatarUrl?: boolean | number
    /** Percentage of empty values for avatarUrl */
    percentageEmptyAvatarUrl?: boolean | number
    /** Percentage of non-empty values for avatarUrl */
    percentageNotEmptyAvatarUrl?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    /** Number of unique values for intro */
    countUniqueValuesIntro?: boolean | number
    /** Number of empty values for intro */
    countEmptyIntro?: boolean | number
    /** Number of non-empty values for intro */
    countNotEmptyIntro?: boolean | number
    /** Percentage of empty values for intro */
    percentageEmptyIntro?: boolean | number
    /** Percentage of non-empty values for intro */
    percentageNotEmptyIntro?: boolean | number
    /** Number of unique values for whatsapp */
    countUniqueValuesWhatsapp?: boolean | number
    /** Number of empty values for whatsapp */
    countEmptyWhatsapp?: boolean | number
    /** Number of non-empty values for whatsapp */
    countNotEmptyWhatsapp?: boolean | number
    /** Percentage of empty values for whatsapp */
    percentageEmptyWhatsapp?: boolean | number
    /** Percentage of non-empty values for whatsapp */
    percentageNotEmptyWhatsapp?: boolean | number
    /** Number of unique values for workPreference */
    countUniqueValuesWorkPreference?: boolean | number
    /** Number of empty values for workPreference */
    countEmptyWorkPreference?: boolean | number
    /** Number of non-empty values for workPreference */
    countNotEmptyWorkPreference?: boolean | number
    /** Percentage of empty values for workPreference */
    percentageEmptyWorkPreference?: boolean | number
    /** Percentage of non-empty values for workPreference */
    percentageNotEmptyWorkPreference?: boolean | number
    /** Number of unique values for performanceRating */
    countUniqueValuesPerformanceRating?: boolean | number
    /** Number of empty values for performanceRating */
    countEmptyPerformanceRating?: boolean | number
    /** Number of non-empty values for performanceRating */
    countNotEmptyPerformanceRating?: boolean | number
    /** Percentage of empty values for performanceRating */
    percentageEmptyPerformanceRating?: boolean | number
    /** Percentage of non-empty values for performanceRating */
    percentageNotEmptyPerformanceRating?: boolean | number
    edges?: PersonEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A task */
export interface TaskConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for title */
    countUniqueValuesTitle?: boolean | number
    /** Number of empty values for title */
    countEmptyTitle?: boolean | number
    /** Number of non-empty values for title */
    countNotEmptyTitle?: boolean | number
    /** Percentage of empty values for title */
    percentageEmptyTitle?: boolean | number
    /** Percentage of non-empty values for title */
    percentageNotEmptyTitle?: boolean | number
    /** Number of unique values for body */
    countUniqueValuesBody?: boolean | number
    /** Number of empty values for body */
    countEmptyBody?: boolean | number
    /** Number of non-empty values for body */
    countNotEmptyBody?: boolean | number
    /** Percentage of empty values for body */
    percentageEmptyBody?: boolean | number
    /** Percentage of non-empty values for body */
    percentageNotEmptyBody?: boolean | number
    /** Number of unique values for bodyV2 */
    countUniqueValuesBodyV2?: boolean | number
    /** Number of empty values for bodyV2 */
    countEmptyBodyV2?: boolean | number
    /** Number of non-empty values for bodyV2 */
    countNotEmptyBodyV2?: boolean | number
    /** Percentage of empty values for bodyV2 */
    percentageEmptyBodyV2?: boolean | number
    /** Percentage of non-empty values for bodyV2 */
    percentageNotEmptyBodyV2?: boolean | number
    /** Number of unique values for dueAt */
    countUniqueValuesDueAt?: boolean | number
    /** Number of empty values for dueAt */
    countEmptyDueAt?: boolean | number
    /** Number of non-empty values for dueAt */
    countNotEmptyDueAt?: boolean | number
    /** Percentage of empty values for dueAt */
    percentageEmptyDueAt?: boolean | number
    /** Percentage of non-empty values for dueAt */
    percentageNotEmptyDueAt?: boolean | number
    /** Earliest date contained in the field dueAt */
    minDueAt?: boolean | number
    /** Latest date contained in the field dueAt */
    maxDueAt?: boolean | number
    /** Number of unique values for status */
    countUniqueValuesStatus?: boolean | number
    /** Number of empty values for status */
    countEmptyStatus?: boolean | number
    /** Number of non-empty values for status */
    countNotEmptyStatus?: boolean | number
    /** Percentage of empty values for status */
    percentageEmptyStatus?: boolean | number
    /** Percentage of non-empty values for status */
    percentageNotEmptyStatus?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    edges?: TaskEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A rocket */
export interface RocketConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    edges?: RocketEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SurveyResultConnectionGenqlSelection{
    /** Total number of records in the connection */
    totalCount?: boolean | number
    /** Number of unique values for id */
    countUniqueValuesId?: boolean | number
    /** Number of empty values for id */
    countEmptyId?: boolean | number
    /** Number of non-empty values for id */
    countNotEmptyId?: boolean | number
    /** Percentage of empty values for id */
    percentageEmptyId?: boolean | number
    /** Percentage of non-empty values for id */
    percentageNotEmptyId?: boolean | number
    /** Number of unique values for name */
    countUniqueValuesName?: boolean | number
    /** Number of empty values for name */
    countEmptyName?: boolean | number
    /** Number of non-empty values for name */
    countNotEmptyName?: boolean | number
    /** Percentage of empty values for name */
    percentageEmptyName?: boolean | number
    /** Percentage of non-empty values for name */
    percentageNotEmptyName?: boolean | number
    /** Number of unique values for createdAt */
    countUniqueValuesCreatedAt?: boolean | number
    /** Number of empty values for createdAt */
    countEmptyCreatedAt?: boolean | number
    /** Number of non-empty values for createdAt */
    countNotEmptyCreatedAt?: boolean | number
    /** Percentage of empty values for createdAt */
    percentageEmptyCreatedAt?: boolean | number
    /** Percentage of non-empty values for createdAt */
    percentageNotEmptyCreatedAt?: boolean | number
    /** Earliest date contained in the field createdAt */
    minCreatedAt?: boolean | number
    /** Latest date contained in the field createdAt */
    maxCreatedAt?: boolean | number
    /** Number of unique values for updatedAt */
    countUniqueValuesUpdatedAt?: boolean | number
    /** Number of empty values for updatedAt */
    countEmptyUpdatedAt?: boolean | number
    /** Number of non-empty values for updatedAt */
    countNotEmptyUpdatedAt?: boolean | number
    /** Percentage of empty values for updatedAt */
    percentageEmptyUpdatedAt?: boolean | number
    /** Percentage of non-empty values for updatedAt */
    percentageNotEmptyUpdatedAt?: boolean | number
    /** Earliest date contained in the field updatedAt */
    minUpdatedAt?: boolean | number
    /** Latest date contained in the field updatedAt */
    maxUpdatedAt?: boolean | number
    /** Number of unique values for deletedAt */
    countUniqueValuesDeletedAt?: boolean | number
    /** Number of empty values for deletedAt */
    countEmptyDeletedAt?: boolean | number
    /** Number of non-empty values for deletedAt */
    countNotEmptyDeletedAt?: boolean | number
    /** Percentage of empty values for deletedAt */
    percentageEmptyDeletedAt?: boolean | number
    /** Percentage of non-empty values for deletedAt */
    percentageNotEmptyDeletedAt?: boolean | number
    /** Earliest date contained in the field deletedAt */
    minDeletedAt?: boolean | number
    /** Latest date contained in the field deletedAt */
    maxDeletedAt?: boolean | number
    /** Number of unique values for createdBy */
    countUniqueValuesCreatedBy?: boolean | number
    /** Number of empty values for createdBy */
    countEmptyCreatedBy?: boolean | number
    /** Number of non-empty values for createdBy */
    countNotEmptyCreatedBy?: boolean | number
    /** Percentage of empty values for createdBy */
    percentageEmptyCreatedBy?: boolean | number
    /** Percentage of non-empty values for createdBy */
    percentageNotEmptyCreatedBy?: boolean | number
    /** Number of unique values for position */
    countUniqueValuesPosition?: boolean | number
    /** Number of empty values for position */
    countEmptyPosition?: boolean | number
    /** Number of non-empty values for position */
    countNotEmptyPosition?: boolean | number
    /** Percentage of empty values for position */
    percentageEmptyPosition?: boolean | number
    /** Percentage of non-empty values for position */
    percentageNotEmptyPosition?: boolean | number
    /** Number of unique values for searchVector */
    countUniqueValuesSearchVector?: boolean | number
    /** Number of empty values for searchVector */
    countEmptySearchVector?: boolean | number
    /** Number of non-empty values for searchVector */
    countNotEmptySearchVector?: boolean | number
    /** Percentage of empty values for searchVector */
    percentageEmptySearchVector?: boolean | number
    /** Percentage of non-empty values for searchVector */
    percentageNotEmptySearchVector?: boolean | number
    /** Number of unique values for score */
    countUniqueValuesScore?: boolean | number
    /** Number of empty values for score */
    countEmptyScore?: boolean | number
    /** Number of non-empty values for score */
    countNotEmptyScore?: boolean | number
    /** Percentage of empty values for score */
    percentageEmptyScore?: boolean | number
    /** Percentage of non-empty values for score */
    percentageNotEmptyScore?: boolean | number
    /** Minimum amount contained in the field score */
    minScore?: boolean | number
    /** Maximum amount contained in the field score */
    maxScore?: boolean | number
    /** Average amount contained in the field score */
    avgScore?: boolean | number
    /** Sum of amounts contained in the field score */
    sumScore?: boolean | number
    /** Number of unique values for percentageOfCompletion */
    countUniqueValuesPercentageOfCompletion?: boolean | number
    /** Number of empty values for percentageOfCompletion */
    countEmptyPercentageOfCompletion?: boolean | number
    /** Number of non-empty values for percentageOfCompletion */
    countNotEmptyPercentageOfCompletion?: boolean | number
    /** Percentage of empty values for percentageOfCompletion */
    percentageEmptyPercentageOfCompletion?: boolean | number
    /** Percentage of non-empty values for percentageOfCompletion */
    percentageNotEmptyPercentageOfCompletion?: boolean | number
    /** Minimum amount contained in the field percentageOfCompletion */
    minPercentageOfCompletion?: boolean | number
    /** Maximum amount contained in the field percentageOfCompletion */
    maxPercentageOfCompletion?: boolean | number
    /** Average amount contained in the field percentageOfCompletion */
    avgPercentageOfCompletion?: boolean | number
    /** Sum of amounts contained in the field percentageOfCompletion */
    sumPercentageOfCompletion?: boolean | number
    /** Number of unique values for participants */
    countUniqueValuesParticipants?: boolean | number
    /** Number of empty values for participants */
    countEmptyParticipants?: boolean | number
    /** Number of non-empty values for participants */
    countNotEmptyParticipants?: boolean | number
    /** Percentage of empty values for participants */
    percentageEmptyParticipants?: boolean | number
    /** Percentage of non-empty values for participants */
    percentageNotEmptyParticipants?: boolean | number
    /** Minimum amount contained in the field participants */
    minParticipants?: boolean | number
    /** Maximum amount contained in the field participants */
    maxParticipants?: boolean | number
    /** Average amount contained in the field participants */
    avgParticipants?: boolean | number
    /** Sum of amounts contained in the field participants */
    sumParticipants?: boolean | number
    /** Number of unique values for averageEstimatedNumberOfAtomsInTheUniverse */
    countUniqueValuesAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Number of empty values for averageEstimatedNumberOfAtomsInTheUniverse */
    countEmptyAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Number of non-empty values for averageEstimatedNumberOfAtomsInTheUniverse */
    countNotEmptyAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Percentage of empty values for averageEstimatedNumberOfAtomsInTheUniverse */
    percentageEmptyAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Percentage of non-empty values for averageEstimatedNumberOfAtomsInTheUniverse */
    percentageNotEmptyAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Minimum amount contained in the field averageEstimatedNumberOfAtomsInTheUniverse */
    minAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Maximum amount contained in the field averageEstimatedNumberOfAtomsInTheUniverse */
    maxAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Average amount contained in the field averageEstimatedNumberOfAtomsInTheUniverse */
    avgAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Sum of amounts contained in the field averageEstimatedNumberOfAtomsInTheUniverse */
    sumAverageEstimatedNumberOfAtomsInTheUniverse?: boolean | number
    /** Number of unique values for comments */
    countUniqueValuesComments?: boolean | number
    /** Number of empty values for comments */
    countEmptyComments?: boolean | number
    /** Number of non-empty values for comments */
    countNotEmptyComments?: boolean | number
    /** Percentage of empty values for comments */
    percentageEmptyComments?: boolean | number
    /** Percentage of non-empty values for comments */
    percentageNotEmptyComments?: boolean | number
    /** Number of unique values for shortNotes */
    countUniqueValuesShortNotes?: boolean | number
    /** Number of empty values for shortNotes */
    countEmptyShortNotes?: boolean | number
    /** Number of non-empty values for shortNotes */
    countNotEmptyShortNotes?: boolean | number
    /** Percentage of empty values for shortNotes */
    percentageEmptyShortNotes?: boolean | number
    /** Percentage of non-empty values for shortNotes */
    percentageNotEmptyShortNotes?: boolean | number
    edges?: SurveyResultEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LinksCreateInput {primaryLinkLabel?: (Scalars['String'] | null),primaryLinkUrl?: (Scalars['String'] | null),secondaryLinks?: (Scalars['RawJSONScalar'] | null)}

export interface LinksUpdateInput {primaryLinkLabel?: (Scalars['String'] | null),primaryLinkUrl?: (Scalars['String'] | null),secondaryLinks?: (Scalars['RawJSONScalar'] | null)}

export interface LinksFilterInput {primaryLinkLabel?: (StringFilter | null),primaryLinkUrl?: (StringFilter | null),secondaryLinks?: (RawJsonFilter | null)}

export interface StringFilter {eq?: (Scalars['String'] | null),gt?: (Scalars['String'] | null),gte?: (Scalars['String'] | null),in?: (Scalars['String'][] | null),lt?: (Scalars['String'] | null),lte?: (Scalars['String'] | null),neq?: (Scalars['String'] | null),startsWith?: (Scalars['String'] | null),like?: (Scalars['String'] | null),ilike?: (Scalars['String'] | null),regex?: (Scalars['String'] | null),iregex?: (Scalars['String'] | null),is?: (FilterIs | null)}

export interface RawJsonFilter {is?: (FilterIs | null),like?: (Scalars['String'] | null)}

export interface LinksOrderByInput {primaryLinkLabel?: (OrderByDirection | null),primaryLinkUrl?: (OrderByDirection | null),secondaryLinks?: (OrderByDirection | null)}

export interface CurrencyCreateInput {amountMicros?: (Scalars['BigFloat'] | null),currencyCode?: (Scalars['String'] | null)}

export interface CurrencyUpdateInput {amountMicros?: (Scalars['BigFloat'] | null),currencyCode?: (Scalars['String'] | null)}

export interface CurrencyFilterInput {amountMicros?: (BigFloatFilter | null),currencyCode?: (StringFilter | null)}

export interface BigFloatFilter {eq?: (Scalars['BigFloat'] | null),gt?: (Scalars['BigFloat'] | null),gte?: (Scalars['BigFloat'] | null),in?: (Scalars['BigFloat'][] | null),lt?: (Scalars['BigFloat'] | null),lte?: (Scalars['BigFloat'] | null),neq?: (Scalars['BigFloat'] | null),is?: (FilterIs | null)}

export interface CurrencyOrderByInput {amountMicros?: (OrderByDirection | null),currencyCode?: (OrderByDirection | null)}

export interface FullNameCreateInput {firstName?: (Scalars['String'] | null),lastName?: (Scalars['String'] | null)}

export interface FullNameUpdateInput {firstName?: (Scalars['String'] | null),lastName?: (Scalars['String'] | null)}

export interface FullNameFilterInput {firstName?: (StringFilter | null),lastName?: (StringFilter | null)}

export interface FullNameOrderByInput {firstName?: (OrderByDirection | null),lastName?: (OrderByDirection | null)}

export interface AddressCreateInput {addressStreet1?: (Scalars['String'] | null),addressStreet2?: (Scalars['String'] | null),addressCity?: (Scalars['String'] | null),addressPostcode?: (Scalars['String'] | null),addressState?: (Scalars['String'] | null),addressCountry?: (Scalars['String'] | null),addressLat?: (Scalars['BigFloat'] | null),addressLng?: (Scalars['BigFloat'] | null)}

export interface AddressUpdateInput {addressStreet1?: (Scalars['String'] | null),addressStreet2?: (Scalars['String'] | null),addressCity?: (Scalars['String'] | null),addressPostcode?: (Scalars['String'] | null),addressState?: (Scalars['String'] | null),addressCountry?: (Scalars['String'] | null),addressLat?: (Scalars['BigFloat'] | null),addressLng?: (Scalars['BigFloat'] | null)}

export interface AddressFilterInput {addressStreet1?: (StringFilter | null),addressStreet2?: (StringFilter | null),addressCity?: (StringFilter | null),addressPostcode?: (StringFilter | null),addressState?: (StringFilter | null),addressCountry?: (StringFilter | null),addressLat?: (BigFloatFilter | null),addressLng?: (BigFloatFilter | null)}

export interface AddressOrderByInput {addressStreet1?: (OrderByDirection | null),addressStreet2?: (OrderByDirection | null),addressCity?: (OrderByDirection | null),addressPostcode?: (OrderByDirection | null),addressState?: (OrderByDirection | null),addressCountry?: (OrderByDirection | null),addressLat?: (OrderByDirection | null),addressLng?: (OrderByDirection | null)}

export interface ActorCreateInput {source?: (ActorSourceEnum | null),context?: (Scalars['RawJSONScalar'] | null)}

export interface ActorUpdateInput {source?: (ActorSourceEnum | null),context?: (Scalars['RawJSONScalar'] | null)}

export interface ActorFilterInput {source?: (ActorSourceEnumFilter | null),workspaceMemberId?: (UUIDFilter | null),name?: (StringFilter | null),context?: (RawJsonFilter | null)}

export interface ActorSourceEnumFilter {eq?: (ActorSourceEnum | null),neq?: (ActorSourceEnum | null),in?: ((ActorSourceEnum | null)[] | null),containsAny?: ((ActorSourceEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface UUIDFilter {eq?: (Scalars['UUID'] | null),gt?: (Scalars['UUID'] | null),gte?: (Scalars['UUID'] | null),in?: ((Scalars['UUID'] | null)[] | null),lt?: (Scalars['UUID'] | null),lte?: (Scalars['UUID'] | null),neq?: (Scalars['UUID'] | null),is?: (FilterIs | null)}

export interface ActorOrderByInput {source?: (OrderByDirection | null),workspaceMemberId?: (OrderByDirection | null),name?: (OrderByDirection | null),context?: (OrderByDirection | null)}

export interface EmailsCreateInput {primaryEmail?: (Scalars['String'] | null),additionalEmails?: (Scalars['RawJSONScalar'] | null)}

export interface EmailsUpdateInput {primaryEmail?: (Scalars['String'] | null),additionalEmails?: (Scalars['RawJSONScalar'] | null)}

export interface EmailsFilterInput {primaryEmail?: (StringFilter | null),additionalEmails?: (RawJsonFilter | null)}

export interface EmailsOrderByInput {primaryEmail?: (OrderByDirection | null),additionalEmails?: (OrderByDirection | null)}

export interface PhonesCreateInput {primaryPhoneNumber?: (Scalars['String'] | null),primaryPhoneCountryCode?: (Scalars['String'] | null),primaryPhoneCallingCode?: (Scalars['String'] | null),additionalPhones?: (Scalars['RawJSONScalar'] | null)}

export interface PhonesUpdateInput {primaryPhoneNumber?: (Scalars['String'] | null),primaryPhoneCountryCode?: (Scalars['String'] | null),primaryPhoneCallingCode?: (Scalars['String'] | null),additionalPhones?: (Scalars['RawJSONScalar'] | null)}

export interface PhonesFilterInput {primaryPhoneNumber?: (StringFilter | null),primaryPhoneCountryCode?: (StringFilter | null),primaryPhoneCallingCode?: (StringFilter | null),additionalPhones?: (RawJsonFilter | null)}

export interface PhonesOrderByInput {primaryPhoneNumber?: (OrderByDirection | null),primaryPhoneCountryCode?: (OrderByDirection | null),primaryPhoneCallingCode?: (OrderByDirection | null),additionalPhones?: (OrderByDirection | null)}

export interface RichTextV2CreateInput {blocknote?: (Scalars['String'] | null),markdown?: (Scalars['String'] | null)}

export interface RichTextV2UpdateInput {blocknote?: (Scalars['String'] | null),markdown?: (Scalars['String'] | null)}

export interface RichTextV2FilterInput {blocknote?: (StringFilter | null),markdown?: (StringFilter | null)}

export interface RichTextV2OrderByInput {blocknote?: (OrderByDirection | null),markdown?: (OrderByDirection | null)}


/** An API key */
export interface ApiKeyCreateInput {
/** ApiKey name */
name?: (Scalars['String'] | null),
/** ApiKey expiration date */
expiresAt: Scalars['DateTime'],
/** ApiKey revocation date */
revokedAt?: (Scalars['DateTime'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** An API key */
export interface ApiKeyUpdateInput {
/** ApiKey name */
name?: (Scalars['String'] | null),
/** ApiKey expiration date */
expiresAt?: (Scalars['DateTime'] | null),
/** ApiKey revocation date */
revokedAt?: (Scalars['DateTime'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** An API key */
export interface ApiKeyFilterInput {
/** ApiKey name */
name?: (StringFilter | null),
/** ApiKey expiration date */
expiresAt?: (DateFilter | null),
/** ApiKey revocation date */
revokedAt?: (DateFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),and?: ((ApiKeyFilterInput | null)[] | null),or?: ((ApiKeyFilterInput | null)[] | null),not?: (ApiKeyFilterInput | null)}

export interface DateFilter {eq?: (Scalars['Date'] | null),gt?: (Scalars['Date'] | null),gte?: (Scalars['Date'] | null),in?: (Scalars['Date'][] | null),lt?: (Scalars['Date'] | null),lte?: (Scalars['Date'] | null),neq?: (Scalars['Date'] | null),is?: (FilterIs | null)}


/** An API key */
export interface ApiKeyOrderByInput {
/** ApiKey name */
name?: (OrderByDirection | null),
/** ApiKey expiration date */
expiresAt?: (OrderByDirection | null),
/** ApiKey revocation date */
revokedAt?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null)}


/** An attachment */
export interface AttachmentCreateInput {
/** Attachment name */
name?: (Scalars['String'] | null),
/** Attachment full path */
fullPath?: (Scalars['String'] | null),
/** Attachment type */
type?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Attachment author */
authorId?: (Scalars['ID'] | null),
/** Attachment author */
author?: (Scalars['ID'] | null),
/** Attachment task */
taskId?: (Scalars['ID'] | null),
/** Attachment task */
task?: (Scalars['ID'] | null),
/** Attachment note */
noteId?: (Scalars['ID'] | null),
/** Attachment note */
note?: (Scalars['ID'] | null),
/** Attachment person */
personId?: (Scalars['ID'] | null),
/** Attachment person */
person?: (Scalars['ID'] | null),
/** Attachment company */
companyId?: (Scalars['ID'] | null),
/** Attachment company */
company?: (Scalars['ID'] | null),
/** Attachment opportunity */
opportunityId?: (Scalars['ID'] | null),
/** Attachment opportunity */
opportunity?: (Scalars['ID'] | null),
/** Attachments Rocket */
rocketId?: (Scalars['ID'] | null),
/** Attachments Rocket */
rocket?: (Scalars['ID'] | null),
/** Attachments Pet */
petId?: (Scalars['ID'] | null),
/** Attachments Pet */
pet?: (Scalars['ID'] | null),
/** Attachments Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** Attachments Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** An attachment */
export interface AttachmentUpdateInput {
/** Attachment name */
name?: (Scalars['String'] | null),
/** Attachment full path */
fullPath?: (Scalars['String'] | null),
/** Attachment type */
type?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Attachment author */
authorId?: (Scalars['ID'] | null),
/** Attachment author */
author?: (Scalars['ID'] | null),
/** Attachment task */
taskId?: (Scalars['ID'] | null),
/** Attachment task */
task?: (Scalars['ID'] | null),
/** Attachment note */
noteId?: (Scalars['ID'] | null),
/** Attachment note */
note?: (Scalars['ID'] | null),
/** Attachment person */
personId?: (Scalars['ID'] | null),
/** Attachment person */
person?: (Scalars['ID'] | null),
/** Attachment company */
companyId?: (Scalars['ID'] | null),
/** Attachment company */
company?: (Scalars['ID'] | null),
/** Attachment opportunity */
opportunityId?: (Scalars['ID'] | null),
/** Attachment opportunity */
opportunity?: (Scalars['ID'] | null),
/** Attachments Rocket */
rocketId?: (Scalars['ID'] | null),
/** Attachments Rocket */
rocket?: (Scalars['ID'] | null),
/** Attachments Pet */
petId?: (Scalars['ID'] | null),
/** Attachments Pet */
pet?: (Scalars['ID'] | null),
/** Attachments Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** Attachments Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** An attachment */
export interface AttachmentFilterInput {
/** Attachment name */
name?: (StringFilter | null),
/** Attachment full path */
fullPath?: (StringFilter | null),
/** Attachment type */
type?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Attachment author */
authorId?: (UUIDFilter | null),
/** Attachment author */
author?: (UUIDFilter | null),
/** Attachment task */
taskId?: (UUIDFilter | null),
/** Attachment task */
task?: (UUIDFilter | null),
/** Attachment note */
noteId?: (UUIDFilter | null),
/** Attachment note */
note?: (UUIDFilter | null),
/** Attachment person */
personId?: (UUIDFilter | null),
/** Attachment person */
person?: (UUIDFilter | null),
/** Attachment company */
companyId?: (UUIDFilter | null),
/** Attachment company */
company?: (UUIDFilter | null),
/** Attachment opportunity */
opportunityId?: (UUIDFilter | null),
/** Attachment opportunity */
opportunity?: (UUIDFilter | null),
/** Attachments Rocket */
rocketId?: (UUIDFilter | null),
/** Attachments Rocket */
rocket?: (UUIDFilter | null),
/** Attachments Pet */
petId?: (UUIDFilter | null),
/** Attachments Pet */
pet?: (UUIDFilter | null),
/** Attachments Survey result */
surveyResultId?: (UUIDFilter | null),
/** Attachments Survey result */
surveyResult?: (UUIDFilter | null),and?: ((AttachmentFilterInput | null)[] | null),or?: ((AttachmentFilterInput | null)[] | null),not?: (AttachmentFilterInput | null)}


/** An attachment */
export interface AttachmentOrderByInput {
/** Attachment name */
name?: (OrderByDirection | null),
/** Attachment full path */
fullPath?: (OrderByDirection | null),
/** Attachment type */
type?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Attachment author */
authorId?: (OrderByDirection | null),
/** Attachment author */
author?: (OrderByDirection | null),
/** Attachment task */
taskId?: (OrderByDirection | null),
/** Attachment task */
task?: (OrderByDirection | null),
/** Attachment note */
noteId?: (OrderByDirection | null),
/** Attachment note */
note?: (OrderByDirection | null),
/** Attachment person */
personId?: (OrderByDirection | null),
/** Attachment person */
person?: (OrderByDirection | null),
/** Attachment company */
companyId?: (OrderByDirection | null),
/** Attachment company */
company?: (OrderByDirection | null),
/** Attachment opportunity */
opportunityId?: (OrderByDirection | null),
/** Attachment opportunity */
opportunity?: (OrderByDirection | null),
/** Attachments Rocket */
rocketId?: (OrderByDirection | null),
/** Attachments Rocket */
rocket?: (OrderByDirection | null),
/** Attachments Pet */
petId?: (OrderByDirection | null),
/** Attachments Pet */
pet?: (OrderByDirection | null),
/** Attachments Survey result */
surveyResultId?: (OrderByDirection | null),
/** Attachments Survey result */
surveyResult?: (OrderByDirection | null)}

export interface PetCreateInput {coco?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Name */
name?: (Scalars['String'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Deletion date */
deletedAt?: (Scalars['DateTime'] | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Position */
position?: (Scalars['Position'] | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),species?: (PetSpeciesEnum | null),traits?: ((PetTraitsEnum | null)[] | null),comments?: (Scalars['String'] | null),age?: (Scalars['Float'] | null),location?: (AddressCreateInput | null),vetPhone?: (PhonesCreateInput | null),vetEmail?: (EmailsCreateInput | null),birthday?: (Scalars['DateTime'] | null),isGoodWithKids?: (Scalars['Boolean'] | null),pictures?: (LinksCreateInput | null),averageCostOfKibblePerMonth?: (CurrencyCreateInput | null),makesOwnerThinkOf?: (FullNameCreateInput | null),soundSwag?: (PetSoundSwagEnum | null),bio?: (Scalars['String'] | null),interestingFacts?: ((Scalars['String'] | null)[] | null),extraData?: (Scalars['RawJSONScalar'] | null)}

export interface PetUpdateInput {coco?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Name */
name?: (Scalars['String'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Deletion date */
deletedAt?: (Scalars['DateTime'] | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Position */
position?: (Scalars['Position'] | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),species?: (PetSpeciesEnum | null),traits?: ((PetTraitsEnum | null)[] | null),comments?: (Scalars['String'] | null),age?: (Scalars['Float'] | null),location?: (AddressUpdateInput | null),vetPhone?: (PhonesUpdateInput | null),vetEmail?: (EmailsUpdateInput | null),birthday?: (Scalars['DateTime'] | null),isGoodWithKids?: (Scalars['Boolean'] | null),pictures?: (LinksUpdateInput | null),averageCostOfKibblePerMonth?: (CurrencyUpdateInput | null),makesOwnerThinkOf?: (FullNameUpdateInput | null),soundSwag?: (PetSoundSwagEnum | null),bio?: (Scalars['String'] | null),interestingFacts?: ((Scalars['String'] | null)[] | null),extraData?: (Scalars['RawJSONScalar'] | null)}

export interface PetFilterInput {coco?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Name */
name?: (StringFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Deletion date */
deletedAt?: (DateFilter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Position */
position?: (FloatFilter | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),species?: (PetSpeciesEnumFilter | null),traits?: (PetTraitsEnumFilter | null),comments?: (StringFilter | null),age?: (FloatFilter | null),location?: (AddressFilterInput | null),vetPhone?: (PhonesFilterInput | null),vetEmail?: (EmailsFilterInput | null),birthday?: (DateFilter | null),isGoodWithKids?: (BooleanFilter | null),pictures?: (LinksFilterInput | null),averageCostOfKibblePerMonth?: (CurrencyFilterInput | null),makesOwnerThinkOf?: (FullNameFilterInput | null),soundSwag?: (PetSoundSwagEnumFilter | null),bio?: (StringFilter | null),interestingFacts?: (ArrayFilter | null),extraData?: (RawJsonFilter | null),and?: ((PetFilterInput | null)[] | null),or?: ((PetFilterInput | null)[] | null),not?: (PetFilterInput | null)}

export interface FloatFilter {eq?: (Scalars['Float'] | null),gt?: (Scalars['Float'] | null),gte?: (Scalars['Float'] | null),in?: (Scalars['Float'][] | null),lt?: (Scalars['Float'] | null),lte?: (Scalars['Float'] | null),neq?: (Scalars['Float'] | null),is?: (FilterIs | null)}

export interface TSVectorFilter {search?: (Scalars['String'] | null)}

export interface PetSpeciesEnumFilter {eq?: (PetSpeciesEnum | null),neq?: (PetSpeciesEnum | null),in?: ((PetSpeciesEnum | null)[] | null),containsAny?: ((PetSpeciesEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface PetTraitsEnumFilter {eq?: (PetTraitsEnum | null),neq?: (PetTraitsEnum | null),in?: ((PetTraitsEnum | null)[] | null),containsAny?: ((PetTraitsEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface BooleanFilter {eq?: (Scalars['Boolean'] | null),is?: (FilterIs | null)}

export interface PetSoundSwagEnumFilter {eq?: (PetSoundSwagEnum | null),neq?: (PetSoundSwagEnum | null),in?: ((PetSoundSwagEnum | null)[] | null),containsAny?: ((PetSoundSwagEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface ArrayFilter {containsIlike?: (Scalars['String'] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface PetOrderByInput {coco?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Name */
name?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Deletion date */
deletedAt?: (OrderByDirection | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Position */
position?: (OrderByDirection | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null),species?: (OrderByDirection | null),traits?: ((OrderByDirection | null)[] | null),comments?: (OrderByDirection | null),age?: (OrderByDirection | null),location?: (AddressOrderByInput | null),vetPhone?: (PhonesOrderByInput | null),vetEmail?: (EmailsOrderByInput | null),birthday?: (OrderByDirection | null),isGoodWithKids?: (OrderByDirection | null),pictures?: (LinksOrderByInput | null),averageCostOfKibblePerMonth?: (CurrencyOrderByInput | null),makesOwnerThinkOf?: (FullNameOrderByInput | null),soundSwag?: (OrderByDirection | null),bio?: (OrderByDirection | null),interestingFacts?: (OrderByDirection | null),extraData?: (OrderByDirection | null)}


/** Blocklist */
export interface BlocklistCreateInput {
/** Handle */
handle?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** WorkspaceMember */
workspaceMemberId?: (Scalars['ID'] | null),
/** WorkspaceMember */
workspaceMember?: (Scalars['ID'] | null)}


/** Blocklist */
export interface BlocklistUpdateInput {
/** Handle */
handle?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** WorkspaceMember */
workspaceMemberId?: (Scalars['ID'] | null),
/** WorkspaceMember */
workspaceMember?: (Scalars['ID'] | null)}


/** Blocklist */
export interface BlocklistFilterInput {
/** Handle */
handle?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** WorkspaceMember */
workspaceMemberId?: (UUIDFilter | null),
/** WorkspaceMember */
workspaceMember?: (UUIDFilter | null),and?: ((BlocklistFilterInput | null)[] | null),or?: ((BlocklistFilterInput | null)[] | null),not?: (BlocklistFilterInput | null)}


/** Blocklist */
export interface BlocklistOrderByInput {
/** Handle */
handle?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** WorkspaceMember */
workspaceMemberId?: (OrderByDirection | null),
/** WorkspaceMember */
workspaceMember?: (OrderByDirection | null)}


/** Calendar events */
export interface CalendarEventCreateInput {
/** Title */
title?: (Scalars['String'] | null),
/** Is canceled */
isCanceled?: (Scalars['Boolean'] | null),
/** Is Full Day */
isFullDay?: (Scalars['Boolean'] | null),
/** Start Date */
startsAt?: (Scalars['DateTime'] | null),
/** End Date */
endsAt?: (Scalars['DateTime'] | null),
/** Creation DateTime */
externalCreatedAt?: (Scalars['DateTime'] | null),
/** Update DateTime */
externalUpdatedAt?: (Scalars['DateTime'] | null),
/** Description */
description?: (Scalars['String'] | null),
/** Location */
location?: (Scalars['String'] | null),
/** iCal UID */
iCalUID?: (Scalars['String'] | null),
/** Conference Solution */
conferenceSolution?: (Scalars['String'] | null),
/** Meet Link */
conferenceLink?: (LinksCreateInput | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** Calendar events */
export interface CalendarEventUpdateInput {
/** Title */
title?: (Scalars['String'] | null),
/** Is canceled */
isCanceled?: (Scalars['Boolean'] | null),
/** Is Full Day */
isFullDay?: (Scalars['Boolean'] | null),
/** Start Date */
startsAt?: (Scalars['DateTime'] | null),
/** End Date */
endsAt?: (Scalars['DateTime'] | null),
/** Creation DateTime */
externalCreatedAt?: (Scalars['DateTime'] | null),
/** Update DateTime */
externalUpdatedAt?: (Scalars['DateTime'] | null),
/** Description */
description?: (Scalars['String'] | null),
/** Location */
location?: (Scalars['String'] | null),
/** iCal UID */
iCalUID?: (Scalars['String'] | null),
/** Conference Solution */
conferenceSolution?: (Scalars['String'] | null),
/** Meet Link */
conferenceLink?: (LinksUpdateInput | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** Calendar events */
export interface CalendarEventFilterInput {
/** Title */
title?: (StringFilter | null),
/** Is canceled */
isCanceled?: (BooleanFilter | null),
/** Is Full Day */
isFullDay?: (BooleanFilter | null),
/** Start Date */
startsAt?: (DateFilter | null),
/** End Date */
endsAt?: (DateFilter | null),
/** Creation DateTime */
externalCreatedAt?: (DateFilter | null),
/** Update DateTime */
externalUpdatedAt?: (DateFilter | null),
/** Description */
description?: (StringFilter | null),
/** Location */
location?: (StringFilter | null),
/** iCal UID */
iCalUID?: (StringFilter | null),
/** Conference Solution */
conferenceSolution?: (StringFilter | null),
/** Meet Link */
conferenceLink?: (LinksFilterInput | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),and?: ((CalendarEventFilterInput | null)[] | null),or?: ((CalendarEventFilterInput | null)[] | null),not?: (CalendarEventFilterInput | null)}


/** Calendar events */
export interface CalendarEventOrderByInput {
/** Title */
title?: (OrderByDirection | null),
/** Is canceled */
isCanceled?: (OrderByDirection | null),
/** Is Full Day */
isFullDay?: (OrderByDirection | null),
/** Start Date */
startsAt?: (OrderByDirection | null),
/** End Date */
endsAt?: (OrderByDirection | null),
/** Creation DateTime */
externalCreatedAt?: (OrderByDirection | null),
/** Update DateTime */
externalUpdatedAt?: (OrderByDirection | null),
/** Description */
description?: (OrderByDirection | null),
/** Location */
location?: (OrderByDirection | null),
/** iCal UID */
iCalUID?: (OrderByDirection | null),
/** Conference Solution */
conferenceSolution?: (OrderByDirection | null),
/** Meet Link */
conferenceLink?: (LinksOrderByInput | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null)}


/** Calendar Channels */
export interface CalendarChannelCreateInput {
/** Handle */
handle?: (Scalars['String'] | null),
/** Sync status */
syncStatus?: (CalendarChannelSyncStatusEnum | null),
/** Sync stage */
syncStage?: (CalendarChannelSyncStageEnum | null),
/** Visibility */
visibility?: (CalendarChannelVisibilityEnum | null),
/** Is Contact Auto Creation Enabled */
isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),
/** Automatically create records for people you participated with in an event. */
contactAutoCreationPolicy?: (CalendarChannelContactAutoCreationPolicyEnum | null),
/** Is Sync Enabled */
isSyncEnabled?: (Scalars['Boolean'] | null),
/** Sync Cursor. Used for syncing events from the calendar provider */
syncCursor?: (Scalars['String'] | null),
/** Last sync date */
syncedAt?: (Scalars['DateTime'] | null),
/** Sync stage started at */
syncStageStartedAt?: (Scalars['DateTime'] | null),
/** Throttle Failure Count */
throttleFailureCount?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Connected Account */
connectedAccountId?: (Scalars['ID'] | null),
/** Connected Account */
connectedAccount?: (Scalars['ID'] | null)}


/** Calendar Channels */
export interface CalendarChannelUpdateInput {
/** Handle */
handle?: (Scalars['String'] | null),
/** Sync status */
syncStatus?: (CalendarChannelSyncStatusEnum | null),
/** Sync stage */
syncStage?: (CalendarChannelSyncStageEnum | null),
/** Visibility */
visibility?: (CalendarChannelVisibilityEnum | null),
/** Is Contact Auto Creation Enabled */
isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),
/** Automatically create records for people you participated with in an event. */
contactAutoCreationPolicy?: (CalendarChannelContactAutoCreationPolicyEnum | null),
/** Is Sync Enabled */
isSyncEnabled?: (Scalars['Boolean'] | null),
/** Sync Cursor. Used for syncing events from the calendar provider */
syncCursor?: (Scalars['String'] | null),
/** Last sync date */
syncedAt?: (Scalars['DateTime'] | null),
/** Sync stage started at */
syncStageStartedAt?: (Scalars['DateTime'] | null),
/** Throttle Failure Count */
throttleFailureCount?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Connected Account */
connectedAccountId?: (Scalars['ID'] | null),
/** Connected Account */
connectedAccount?: (Scalars['ID'] | null)}


/** Calendar Channels */
export interface CalendarChannelFilterInput {
/** Handle */
handle?: (StringFilter | null),
/** Sync status */
syncStatus?: (CalendarChannelSyncStatusEnumFilter | null),
/** Sync stage */
syncStage?: (CalendarChannelSyncStageEnumFilter | null),
/** Visibility */
visibility?: (CalendarChannelVisibilityEnumFilter | null),
/** Is Contact Auto Creation Enabled */
isContactAutoCreationEnabled?: (BooleanFilter | null),
/** Automatically create records for people you participated with in an event. */
contactAutoCreationPolicy?: (CalendarChannelContactAutoCreationPolicyEnumFilter | null),
/** Is Sync Enabled */
isSyncEnabled?: (BooleanFilter | null),
/** Sync Cursor. Used for syncing events from the calendar provider */
syncCursor?: (StringFilter | null),
/** Last sync date */
syncedAt?: (DateFilter | null),
/** Sync stage started at */
syncStageStartedAt?: (DateFilter | null),
/** Throttle Failure Count */
throttleFailureCount?: (FloatFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Connected Account */
connectedAccountId?: (UUIDFilter | null),
/** Connected Account */
connectedAccount?: (UUIDFilter | null),and?: ((CalendarChannelFilterInput | null)[] | null),or?: ((CalendarChannelFilterInput | null)[] | null),not?: (CalendarChannelFilterInput | null)}

export interface CalendarChannelSyncStatusEnumFilter {eq?: (CalendarChannelSyncStatusEnum | null),neq?: (CalendarChannelSyncStatusEnum | null),in?: ((CalendarChannelSyncStatusEnum | null)[] | null),containsAny?: ((CalendarChannelSyncStatusEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface CalendarChannelSyncStageEnumFilter {eq?: (CalendarChannelSyncStageEnum | null),neq?: (CalendarChannelSyncStageEnum | null),in?: ((CalendarChannelSyncStageEnum | null)[] | null),containsAny?: ((CalendarChannelSyncStageEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface CalendarChannelVisibilityEnumFilter {eq?: (CalendarChannelVisibilityEnum | null),neq?: (CalendarChannelVisibilityEnum | null),in?: ((CalendarChannelVisibilityEnum | null)[] | null),containsAny?: ((CalendarChannelVisibilityEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface CalendarChannelContactAutoCreationPolicyEnumFilter {eq?: (CalendarChannelContactAutoCreationPolicyEnum | null),neq?: (CalendarChannelContactAutoCreationPolicyEnum | null),in?: ((CalendarChannelContactAutoCreationPolicyEnum | null)[] | null),containsAny?: ((CalendarChannelContactAutoCreationPolicyEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** Calendar Channels */
export interface CalendarChannelOrderByInput {
/** Handle */
handle?: (OrderByDirection | null),
/** Sync status */
syncStatus?: (OrderByDirection | null),
/** Sync stage */
syncStage?: (OrderByDirection | null),
/** Visibility */
visibility?: (OrderByDirection | null),
/** Is Contact Auto Creation Enabled */
isContactAutoCreationEnabled?: (OrderByDirection | null),
/** Automatically create records for people you participated with in an event. */
contactAutoCreationPolicy?: (OrderByDirection | null),
/** Is Sync Enabled */
isSyncEnabled?: (OrderByDirection | null),
/** Sync Cursor. Used for syncing events from the calendar provider */
syncCursor?: (OrderByDirection | null),
/** Last sync date */
syncedAt?: (OrderByDirection | null),
/** Sync stage started at */
syncStageStartedAt?: (OrderByDirection | null),
/** Throttle Failure Count */
throttleFailureCount?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Connected Account */
connectedAccountId?: (OrderByDirection | null),
/** Connected Account */
connectedAccount?: (OrderByDirection | null)}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationCreateInput {
/** Event external ID */
eventExternalId?: (Scalars['String'] | null),
/** Recurring Event ID */
recurringEventExternalId?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Channel ID */
calendarChannelId?: (Scalars['ID'] | null),
/** Channel ID */
calendarChannel?: (Scalars['ID'] | null),
/** Event ID */
calendarEventId?: (Scalars['ID'] | null),
/** Event ID */
calendarEvent?: (Scalars['ID'] | null)}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationUpdateInput {
/** Event external ID */
eventExternalId?: (Scalars['String'] | null),
/** Recurring Event ID */
recurringEventExternalId?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Channel ID */
calendarChannelId?: (Scalars['ID'] | null),
/** Channel ID */
calendarChannel?: (Scalars['ID'] | null),
/** Event ID */
calendarEventId?: (Scalars['ID'] | null),
/** Event ID */
calendarEvent?: (Scalars['ID'] | null)}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationFilterInput {
/** Event external ID */
eventExternalId?: (StringFilter | null),
/** Recurring Event ID */
recurringEventExternalId?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Channel ID */
calendarChannelId?: (UUIDFilter | null),
/** Channel ID */
calendarChannel?: (UUIDFilter | null),
/** Event ID */
calendarEventId?: (UUIDFilter | null),
/** Event ID */
calendarEvent?: (UUIDFilter | null),and?: ((CalendarChannelEventAssociationFilterInput | null)[] | null),or?: ((CalendarChannelEventAssociationFilterInput | null)[] | null),not?: (CalendarChannelEventAssociationFilterInput | null)}


/** Calendar Channel Event Associations */
export interface CalendarChannelEventAssociationOrderByInput {
/** Event external ID */
eventExternalId?: (OrderByDirection | null),
/** Recurring Event ID */
recurringEventExternalId?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Channel ID */
calendarChannelId?: (OrderByDirection | null),
/** Channel ID */
calendarChannel?: (OrderByDirection | null),
/** Event ID */
calendarEventId?: (OrderByDirection | null),
/** Event ID */
calendarEvent?: (OrderByDirection | null)}


/** Calendar event participants */
export interface CalendarEventParticipantCreateInput {
/** Handle */
handle?: (Scalars['String'] | null),
/** Display Name */
displayName?: (Scalars['String'] | null),
/** Is Organizer */
isOrganizer?: (Scalars['Boolean'] | null),
/** Response Status */
responseStatus?: (CalendarEventParticipantResponseStatusEnum | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Event ID */
calendarEventId?: (Scalars['ID'] | null),
/** Event ID */
calendarEvent?: (Scalars['ID'] | null),
/** Person */
personId?: (Scalars['ID'] | null),
/** Person */
person?: (Scalars['ID'] | null),
/** Workspace Member */
workspaceMemberId?: (Scalars['ID'] | null),
/** Workspace Member */
workspaceMember?: (Scalars['ID'] | null)}


/** Calendar event participants */
export interface CalendarEventParticipantUpdateInput {
/** Handle */
handle?: (Scalars['String'] | null),
/** Display Name */
displayName?: (Scalars['String'] | null),
/** Is Organizer */
isOrganizer?: (Scalars['Boolean'] | null),
/** Response Status */
responseStatus?: (CalendarEventParticipantResponseStatusEnum | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Event ID */
calendarEventId?: (Scalars['ID'] | null),
/** Event ID */
calendarEvent?: (Scalars['ID'] | null),
/** Person */
personId?: (Scalars['ID'] | null),
/** Person */
person?: (Scalars['ID'] | null),
/** Workspace Member */
workspaceMemberId?: (Scalars['ID'] | null),
/** Workspace Member */
workspaceMember?: (Scalars['ID'] | null)}


/** Calendar event participants */
export interface CalendarEventParticipantFilterInput {
/** Handle */
handle?: (StringFilter | null),
/** Display Name */
displayName?: (StringFilter | null),
/** Is Organizer */
isOrganizer?: (BooleanFilter | null),
/** Response Status */
responseStatus?: (CalendarEventParticipantResponseStatusEnumFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Event ID */
calendarEventId?: (UUIDFilter | null),
/** Event ID */
calendarEvent?: (UUIDFilter | null),
/** Person */
personId?: (UUIDFilter | null),
/** Person */
person?: (UUIDFilter | null),
/** Workspace Member */
workspaceMemberId?: (UUIDFilter | null),
/** Workspace Member */
workspaceMember?: (UUIDFilter | null),and?: ((CalendarEventParticipantFilterInput | null)[] | null),or?: ((CalendarEventParticipantFilterInput | null)[] | null),not?: (CalendarEventParticipantFilterInput | null)}

export interface CalendarEventParticipantResponseStatusEnumFilter {eq?: (CalendarEventParticipantResponseStatusEnum | null),neq?: (CalendarEventParticipantResponseStatusEnum | null),in?: ((CalendarEventParticipantResponseStatusEnum | null)[] | null),containsAny?: ((CalendarEventParticipantResponseStatusEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** Calendar event participants */
export interface CalendarEventParticipantOrderByInput {
/** Handle */
handle?: (OrderByDirection | null),
/** Display Name */
displayName?: (OrderByDirection | null),
/** Is Organizer */
isOrganizer?: (OrderByDirection | null),
/** Response Status */
responseStatus?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Event ID */
calendarEventId?: (OrderByDirection | null),
/** Event ID */
calendarEvent?: (OrderByDirection | null),
/** Person */
personId?: (OrderByDirection | null),
/** Person */
person?: (OrderByDirection | null),
/** Workspace Member */
workspaceMemberId?: (OrderByDirection | null),
/** Workspace Member */
workspaceMember?: (OrderByDirection | null)}


/** A company */
export interface CompanyCreateInput {
/** The company name */
name?: (Scalars['String'] | null),
/** The company website URL. We use this url to fetch the company icon */
domainName?: (LinksCreateInput | null),
/** Number of employees in the company */
employees?: (Scalars['Float'] | null),
/** The company Linkedin account */
linkedinLink?: (LinksCreateInput | null),
/** The company Twitter/X account */
xLink?: (LinksCreateInput | null),
/** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
annualRecurringRevenue?: (CurrencyCreateInput | null),
/** Address of the company */
address?: (AddressCreateInput | null),
/** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
idealCustomerProfile?: (Scalars['Boolean'] | null),
/** Company record position */
position?: (Scalars['Position'] | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Your team member responsible for managing the company account */
accountOwnerId?: (Scalars['ID'] | null),
/** Your team member responsible for managing the company account */
accountOwner?: (Scalars['ID'] | null),tagline?: (Scalars['String'] | null),introVideo?: (LinksCreateInput | null),workPolicy?: ((CompanyWorkPolicyEnum | null)[] | null),visaSponsorship?: (Scalars['Boolean'] | null)}


/** A company */
export interface CompanyUpdateInput {
/** The company name */
name?: (Scalars['String'] | null),
/** The company website URL. We use this url to fetch the company icon */
domainName?: (LinksUpdateInput | null),
/** Number of employees in the company */
employees?: (Scalars['Float'] | null),
/** The company Linkedin account */
linkedinLink?: (LinksUpdateInput | null),
/** The company Twitter/X account */
xLink?: (LinksUpdateInput | null),
/** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
annualRecurringRevenue?: (CurrencyUpdateInput | null),
/** Address of the company */
address?: (AddressUpdateInput | null),
/** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
idealCustomerProfile?: (Scalars['Boolean'] | null),
/** Company record position */
position?: (Scalars['Position'] | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Your team member responsible for managing the company account */
accountOwnerId?: (Scalars['ID'] | null),
/** Your team member responsible for managing the company account */
accountOwner?: (Scalars['ID'] | null),tagline?: (Scalars['String'] | null),introVideo?: (LinksUpdateInput | null),workPolicy?: ((CompanyWorkPolicyEnum | null)[] | null),visaSponsorship?: (Scalars['Boolean'] | null)}


/** A company */
export interface CompanyFilterInput {
/** The company name */
name?: (StringFilter | null),
/** The company website URL. We use this url to fetch the company icon */
domainName?: (LinksFilterInput | null),
/** Number of employees in the company */
employees?: (FloatFilter | null),
/** The company Linkedin account */
linkedinLink?: (LinksFilterInput | null),
/** The company Twitter/X account */
xLink?: (LinksFilterInput | null),
/** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
annualRecurringRevenue?: (CurrencyFilterInput | null),
/** Address of the company */
address?: (AddressFilterInput | null),
/** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
idealCustomerProfile?: (BooleanFilter | null),
/** Company record position */
position?: (FloatFilter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Your team member responsible for managing the company account */
accountOwnerId?: (UUIDFilter | null),
/** Your team member responsible for managing the company account */
accountOwner?: (UUIDFilter | null),tagline?: (StringFilter | null),introVideo?: (LinksFilterInput | null),workPolicy?: (CompanyWorkPolicyEnumFilter | null),visaSponsorship?: (BooleanFilter | null),and?: ((CompanyFilterInput | null)[] | null),or?: ((CompanyFilterInput | null)[] | null),not?: (CompanyFilterInput | null)}

export interface CompanyWorkPolicyEnumFilter {eq?: (CompanyWorkPolicyEnum | null),neq?: (CompanyWorkPolicyEnum | null),in?: ((CompanyWorkPolicyEnum | null)[] | null),containsAny?: ((CompanyWorkPolicyEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** A company */
export interface CompanyOrderByInput {
/** The company name */
name?: (OrderByDirection | null),
/** The company website URL. We use this url to fetch the company icon */
domainName?: (LinksOrderByInput | null),
/** Number of employees in the company */
employees?: (OrderByDirection | null),
/** The company Linkedin account */
linkedinLink?: (LinksOrderByInput | null),
/** The company Twitter/X account */
xLink?: (LinksOrderByInput | null),
/** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
annualRecurringRevenue?: (CurrencyOrderByInput | null),
/** Address of the company */
address?: (AddressOrderByInput | null),
/** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
idealCustomerProfile?: (OrderByDirection | null),
/** Company record position */
position?: (OrderByDirection | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Your team member responsible for managing the company account */
accountOwnerId?: (OrderByDirection | null),
/** Your team member responsible for managing the company account */
accountOwner?: (OrderByDirection | null),tagline?: (OrderByDirection | null),introVideo?: (LinksOrderByInput | null),workPolicy?: ((OrderByDirection | null)[] | null),visaSponsorship?: (OrderByDirection | null)}


/** A connected account */
export interface ConnectedAccountCreateInput {
/** The account handle (email, username, phone number, etc.) */
handle?: (Scalars['String'] | null),
/** The account provider */
provider?: (Scalars['String'] | null),
/** Messaging provider access token */
accessToken?: (Scalars['String'] | null),
/** Messaging provider refresh token */
refreshToken?: (Scalars['String'] | null),
/** Last sync history ID */
lastSyncHistoryId?: (Scalars['String'] | null),
/** Auth failed at */
authFailedAt?: (Scalars['DateTime'] | null),
/** Handle Aliases */
handleAliases?: (Scalars['String'] | null),
/** Scopes */
scopes?: ((Scalars['String'] | null)[] | null),
/** JSON object containing custom connection parameters */
connectionParameters?: (Scalars['RawJSONScalar'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Account Owner */
accountOwnerId?: (Scalars['ID'] | null),
/** Account Owner */
accountOwner?: (Scalars['ID'] | null)}


/** A connected account */
export interface ConnectedAccountUpdateInput {
/** The account handle (email, username, phone number, etc.) */
handle?: (Scalars['String'] | null),
/** The account provider */
provider?: (Scalars['String'] | null),
/** Messaging provider access token */
accessToken?: (Scalars['String'] | null),
/** Messaging provider refresh token */
refreshToken?: (Scalars['String'] | null),
/** Last sync history ID */
lastSyncHistoryId?: (Scalars['String'] | null),
/** Auth failed at */
authFailedAt?: (Scalars['DateTime'] | null),
/** Handle Aliases */
handleAliases?: (Scalars['String'] | null),
/** Scopes */
scopes?: ((Scalars['String'] | null)[] | null),
/** JSON object containing custom connection parameters */
connectionParameters?: (Scalars['RawJSONScalar'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Account Owner */
accountOwnerId?: (Scalars['ID'] | null),
/** Account Owner */
accountOwner?: (Scalars['ID'] | null)}


/** A connected account */
export interface ConnectedAccountFilterInput {
/** The account handle (email, username, phone number, etc.) */
handle?: (StringFilter | null),
/** The account provider */
provider?: (StringFilter | null),
/** Messaging provider access token */
accessToken?: (StringFilter | null),
/** Messaging provider refresh token */
refreshToken?: (StringFilter | null),
/** Last sync history ID */
lastSyncHistoryId?: (StringFilter | null),
/** Auth failed at */
authFailedAt?: (DateFilter | null),
/** Handle Aliases */
handleAliases?: (StringFilter | null),
/** Scopes */
scopes?: (ArrayFilter | null),
/** JSON object containing custom connection parameters */
connectionParameters?: (RawJsonFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Account Owner */
accountOwnerId?: (UUIDFilter | null),
/** Account Owner */
accountOwner?: (UUIDFilter | null),and?: ((ConnectedAccountFilterInput | null)[] | null),or?: ((ConnectedAccountFilterInput | null)[] | null),not?: (ConnectedAccountFilterInput | null)}


/** A connected account */
export interface ConnectedAccountOrderByInput {
/** The account handle (email, username, phone number, etc.) */
handle?: (OrderByDirection | null),
/** The account provider */
provider?: (OrderByDirection | null),
/** Messaging provider access token */
accessToken?: (OrderByDirection | null),
/** Messaging provider refresh token */
refreshToken?: (OrderByDirection | null),
/** Last sync history ID */
lastSyncHistoryId?: (OrderByDirection | null),
/** Auth failed at */
authFailedAt?: (OrderByDirection | null),
/** Handle Aliases */
handleAliases?: (OrderByDirection | null),
/** Scopes */
scopes?: (OrderByDirection | null),
/** JSON object containing custom connection parameters */
connectionParameters?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Account Owner */
accountOwnerId?: (OrderByDirection | null),
/** Account Owner */
accountOwner?: (OrderByDirection | null)}


/** A favorite that can be accessed from the left menu */
export interface FavoriteCreateInput {
/** Favorite position */
position?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Favorite task */
taskId?: (Scalars['ID'] | null),
/** Favorite task */
task?: (Scalars['ID'] | null),
/** Favorite note */
noteId?: (Scalars['ID'] | null),
/** Favorite note */
note?: (Scalars['ID'] | null),
/** Favorite workspace member */
forWorkspaceMemberId?: (Scalars['ID'] | null),
/** Favorite workspace member */
forWorkspaceMember?: (Scalars['ID'] | null),
/** Favorite person */
personId?: (Scalars['ID'] | null),
/** Favorite person */
person?: (Scalars['ID'] | null),
/** Favorite company */
companyId?: (Scalars['ID'] | null),
/** Favorite company */
company?: (Scalars['ID'] | null),
/** The folder this favorite belongs to */
favoriteFolderId?: (Scalars['ID'] | null),
/** The folder this favorite belongs to */
favoriteFolder?: (Scalars['ID'] | null),
/** Favorite opportunity */
opportunityId?: (Scalars['ID'] | null),
/** Favorite opportunity */
opportunity?: (Scalars['ID'] | null),
/** Favorite workflow */
workflowId?: (Scalars['ID'] | null),
/** Favorite workflow */
workflow?: (Scalars['ID'] | null),
/** Favorite workflow version */
workflowVersionId?: (Scalars['ID'] | null),
/** Favorite workflow version */
workflowVersion?: (Scalars['ID'] | null),
/** Favorite workflow run */
workflowRunId?: (Scalars['ID'] | null),
/** Favorite workflow run */
workflowRun?: (Scalars['ID'] | null),
/** Favorite view */
viewId?: (Scalars['ID'] | null),
/** Favorite view */
view?: (Scalars['ID'] | null),
/** Favorites Rocket */
rocketId?: (Scalars['ID'] | null),
/** Favorites Rocket */
rocket?: (Scalars['ID'] | null),
/** Favorites Pet */
petId?: (Scalars['ID'] | null),
/** Favorites Pet */
pet?: (Scalars['ID'] | null),
/** Favorites Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** Favorites Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** A favorite that can be accessed from the left menu */
export interface FavoriteUpdateInput {
/** Favorite position */
position?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Favorite task */
taskId?: (Scalars['ID'] | null),
/** Favorite task */
task?: (Scalars['ID'] | null),
/** Favorite note */
noteId?: (Scalars['ID'] | null),
/** Favorite note */
note?: (Scalars['ID'] | null),
/** Favorite workspace member */
forWorkspaceMemberId?: (Scalars['ID'] | null),
/** Favorite workspace member */
forWorkspaceMember?: (Scalars['ID'] | null),
/** Favorite person */
personId?: (Scalars['ID'] | null),
/** Favorite person */
person?: (Scalars['ID'] | null),
/** Favorite company */
companyId?: (Scalars['ID'] | null),
/** Favorite company */
company?: (Scalars['ID'] | null),
/** The folder this favorite belongs to */
favoriteFolderId?: (Scalars['ID'] | null),
/** The folder this favorite belongs to */
favoriteFolder?: (Scalars['ID'] | null),
/** Favorite opportunity */
opportunityId?: (Scalars['ID'] | null),
/** Favorite opportunity */
opportunity?: (Scalars['ID'] | null),
/** Favorite workflow */
workflowId?: (Scalars['ID'] | null),
/** Favorite workflow */
workflow?: (Scalars['ID'] | null),
/** Favorite workflow version */
workflowVersionId?: (Scalars['ID'] | null),
/** Favorite workflow version */
workflowVersion?: (Scalars['ID'] | null),
/** Favorite workflow run */
workflowRunId?: (Scalars['ID'] | null),
/** Favorite workflow run */
workflowRun?: (Scalars['ID'] | null),
/** Favorite view */
viewId?: (Scalars['ID'] | null),
/** Favorite view */
view?: (Scalars['ID'] | null),
/** Favorites Rocket */
rocketId?: (Scalars['ID'] | null),
/** Favorites Rocket */
rocket?: (Scalars['ID'] | null),
/** Favorites Pet */
petId?: (Scalars['ID'] | null),
/** Favorites Pet */
pet?: (Scalars['ID'] | null),
/** Favorites Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** Favorites Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** A favorite that can be accessed from the left menu */
export interface FavoriteFilterInput {
/** Favorite position */
position?: (FloatFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Favorite task */
taskId?: (UUIDFilter | null),
/** Favorite task */
task?: (UUIDFilter | null),
/** Favorite note */
noteId?: (UUIDFilter | null),
/** Favorite note */
note?: (UUIDFilter | null),
/** Favorite workspace member */
forWorkspaceMemberId?: (UUIDFilter | null),
/** Favorite workspace member */
forWorkspaceMember?: (UUIDFilter | null),
/** Favorite person */
personId?: (UUIDFilter | null),
/** Favorite person */
person?: (UUIDFilter | null),
/** Favorite company */
companyId?: (UUIDFilter | null),
/** Favorite company */
company?: (UUIDFilter | null),
/** The folder this favorite belongs to */
favoriteFolderId?: (UUIDFilter | null),
/** The folder this favorite belongs to */
favoriteFolder?: (UUIDFilter | null),
/** Favorite opportunity */
opportunityId?: (UUIDFilter | null),
/** Favorite opportunity */
opportunity?: (UUIDFilter | null),
/** Favorite workflow */
workflowId?: (UUIDFilter | null),
/** Favorite workflow */
workflow?: (UUIDFilter | null),
/** Favorite workflow version */
workflowVersionId?: (UUIDFilter | null),
/** Favorite workflow version */
workflowVersion?: (UUIDFilter | null),
/** Favorite workflow run */
workflowRunId?: (UUIDFilter | null),
/** Favorite workflow run */
workflowRun?: (UUIDFilter | null),
/** Favorite view */
viewId?: (UUIDFilter | null),
/** Favorite view */
view?: (UUIDFilter | null),
/** Favorites Rocket */
rocketId?: (UUIDFilter | null),
/** Favorites Rocket */
rocket?: (UUIDFilter | null),
/** Favorites Pet */
petId?: (UUIDFilter | null),
/** Favorites Pet */
pet?: (UUIDFilter | null),
/** Favorites Survey result */
surveyResultId?: (UUIDFilter | null),
/** Favorites Survey result */
surveyResult?: (UUIDFilter | null),and?: ((FavoriteFilterInput | null)[] | null),or?: ((FavoriteFilterInput | null)[] | null),not?: (FavoriteFilterInput | null)}


/** A favorite that can be accessed from the left menu */
export interface FavoriteOrderByInput {
/** Favorite position */
position?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Favorite task */
taskId?: (OrderByDirection | null),
/** Favorite task */
task?: (OrderByDirection | null),
/** Favorite note */
noteId?: (OrderByDirection | null),
/** Favorite note */
note?: (OrderByDirection | null),
/** Favorite workspace member */
forWorkspaceMemberId?: (OrderByDirection | null),
/** Favorite workspace member */
forWorkspaceMember?: (OrderByDirection | null),
/** Favorite person */
personId?: (OrderByDirection | null),
/** Favorite person */
person?: (OrderByDirection | null),
/** Favorite company */
companyId?: (OrderByDirection | null),
/** Favorite company */
company?: (OrderByDirection | null),
/** The folder this favorite belongs to */
favoriteFolderId?: (OrderByDirection | null),
/** The folder this favorite belongs to */
favoriteFolder?: (OrderByDirection | null),
/** Favorite opportunity */
opportunityId?: (OrderByDirection | null),
/** Favorite opportunity */
opportunity?: (OrderByDirection | null),
/** Favorite workflow */
workflowId?: (OrderByDirection | null),
/** Favorite workflow */
workflow?: (OrderByDirection | null),
/** Favorite workflow version */
workflowVersionId?: (OrderByDirection | null),
/** Favorite workflow version */
workflowVersion?: (OrderByDirection | null),
/** Favorite workflow run */
workflowRunId?: (OrderByDirection | null),
/** Favorite workflow run */
workflowRun?: (OrderByDirection | null),
/** Favorite view */
viewId?: (OrderByDirection | null),
/** Favorite view */
view?: (OrderByDirection | null),
/** Favorites Rocket */
rocketId?: (OrderByDirection | null),
/** Favorites Rocket */
rocket?: (OrderByDirection | null),
/** Favorites Pet */
petId?: (OrderByDirection | null),
/** Favorites Pet */
pet?: (OrderByDirection | null),
/** Favorites Survey result */
surveyResultId?: (OrderByDirection | null),
/** Favorites Survey result */
surveyResult?: (OrderByDirection | null)}


/** A Folder of favorites */
export interface FavoriteFolderCreateInput {
/** Favorite folder position */
position?: (Scalars['Float'] | null),
/** Name of the favorite folder */
name?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A Folder of favorites */
export interface FavoriteFolderUpdateInput {
/** Favorite folder position */
position?: (Scalars['Float'] | null),
/** Name of the favorite folder */
name?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A Folder of favorites */
export interface FavoriteFolderFilterInput {
/** Favorite folder position */
position?: (FloatFilter | null),
/** Name of the favorite folder */
name?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),and?: ((FavoriteFolderFilterInput | null)[] | null),or?: ((FavoriteFolderFilterInput | null)[] | null),not?: (FavoriteFolderFilterInput | null)}


/** A Folder of favorites */
export interface FavoriteFolderOrderByInput {
/** Favorite folder position */
position?: (OrderByDirection | null),
/** Name of the favorite folder */
name?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null)}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityCreateInput {
/** Creation date */
happensAt?: (Scalars['DateTime'] | null),
/** Event name */
name?: (Scalars['String'] | null),
/** Json value for event details */
properties?: (Scalars['RawJSONScalar'] | null),
/** Cached record name */
linkedRecordCachedName?: (Scalars['String'] | null),
/** Linked Record id */
linkedRecordId?: (Scalars['UUID'] | null),
/** Linked Object Metadata Id */
linkedObjectMetadataId?: (Scalars['UUID'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Event workspace member */
workspaceMemberId?: (Scalars['ID'] | null),
/** Event workspace member */
workspaceMember?: (Scalars['ID'] | null),
/** Event person */
personId?: (Scalars['ID'] | null),
/** Event person */
person?: (Scalars['ID'] | null),
/** Event company */
companyId?: (Scalars['ID'] | null),
/** Event company */
company?: (Scalars['ID'] | null),
/** Event opportunity */
opportunityId?: (Scalars['ID'] | null),
/** Event opportunity */
opportunity?: (Scalars['ID'] | null),
/** Event note */
noteId?: (Scalars['ID'] | null),
/** Event note */
note?: (Scalars['ID'] | null),
/** Event task */
taskId?: (Scalars['ID'] | null),
/** Event task */
task?: (Scalars['ID'] | null),
/** Event workflow */
workflowId?: (Scalars['ID'] | null),
/** Event workflow */
workflow?: (Scalars['ID'] | null),
/** Event workflow version */
workflowVersionId?: (Scalars['ID'] | null),
/** Event workflow version */
workflowVersion?: (Scalars['ID'] | null),
/** Event workflow run */
workflowRunId?: (Scalars['ID'] | null),
/** Event workflow run */
workflowRun?: (Scalars['ID'] | null),
/** TimelineActivities Rocket */
rocketId?: (Scalars['ID'] | null),
/** TimelineActivities Rocket */
rocket?: (Scalars['ID'] | null),
/** TimelineActivities Pet */
petId?: (Scalars['ID'] | null),
/** TimelineActivities Pet */
pet?: (Scalars['ID'] | null),
/** TimelineActivities Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** TimelineActivities Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityUpdateInput {
/** Creation date */
happensAt?: (Scalars['DateTime'] | null),
/** Event name */
name?: (Scalars['String'] | null),
/** Json value for event details */
properties?: (Scalars['RawJSONScalar'] | null),
/** Cached record name */
linkedRecordCachedName?: (Scalars['String'] | null),
/** Linked Record id */
linkedRecordId?: (Scalars['UUID'] | null),
/** Linked Object Metadata Id */
linkedObjectMetadataId?: (Scalars['UUID'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Event workspace member */
workspaceMemberId?: (Scalars['ID'] | null),
/** Event workspace member */
workspaceMember?: (Scalars['ID'] | null),
/** Event person */
personId?: (Scalars['ID'] | null),
/** Event person */
person?: (Scalars['ID'] | null),
/** Event company */
companyId?: (Scalars['ID'] | null),
/** Event company */
company?: (Scalars['ID'] | null),
/** Event opportunity */
opportunityId?: (Scalars['ID'] | null),
/** Event opportunity */
opportunity?: (Scalars['ID'] | null),
/** Event note */
noteId?: (Scalars['ID'] | null),
/** Event note */
note?: (Scalars['ID'] | null),
/** Event task */
taskId?: (Scalars['ID'] | null),
/** Event task */
task?: (Scalars['ID'] | null),
/** Event workflow */
workflowId?: (Scalars['ID'] | null),
/** Event workflow */
workflow?: (Scalars['ID'] | null),
/** Event workflow version */
workflowVersionId?: (Scalars['ID'] | null),
/** Event workflow version */
workflowVersion?: (Scalars['ID'] | null),
/** Event workflow run */
workflowRunId?: (Scalars['ID'] | null),
/** Event workflow run */
workflowRun?: (Scalars['ID'] | null),
/** TimelineActivities Rocket */
rocketId?: (Scalars['ID'] | null),
/** TimelineActivities Rocket */
rocket?: (Scalars['ID'] | null),
/** TimelineActivities Pet */
petId?: (Scalars['ID'] | null),
/** TimelineActivities Pet */
pet?: (Scalars['ID'] | null),
/** TimelineActivities Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** TimelineActivities Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityFilterInput {
/** Creation date */
happensAt?: (DateFilter | null),
/** Event name */
name?: (StringFilter | null),
/** Json value for event details */
properties?: (RawJsonFilter | null),
/** Cached record name */
linkedRecordCachedName?: (StringFilter | null),
/** Linked Record id */
linkedRecordId?: (UUIDFilter | null),
/** Linked Object Metadata Id */
linkedObjectMetadataId?: (UUIDFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Event workspace member */
workspaceMemberId?: (UUIDFilter | null),
/** Event workspace member */
workspaceMember?: (UUIDFilter | null),
/** Event person */
personId?: (UUIDFilter | null),
/** Event person */
person?: (UUIDFilter | null),
/** Event company */
companyId?: (UUIDFilter | null),
/** Event company */
company?: (UUIDFilter | null),
/** Event opportunity */
opportunityId?: (UUIDFilter | null),
/** Event opportunity */
opportunity?: (UUIDFilter | null),
/** Event note */
noteId?: (UUIDFilter | null),
/** Event note */
note?: (UUIDFilter | null),
/** Event task */
taskId?: (UUIDFilter | null),
/** Event task */
task?: (UUIDFilter | null),
/** Event workflow */
workflowId?: (UUIDFilter | null),
/** Event workflow */
workflow?: (UUIDFilter | null),
/** Event workflow version */
workflowVersionId?: (UUIDFilter | null),
/** Event workflow version */
workflowVersion?: (UUIDFilter | null),
/** Event workflow run */
workflowRunId?: (UUIDFilter | null),
/** Event workflow run */
workflowRun?: (UUIDFilter | null),
/** TimelineActivities Rocket */
rocketId?: (UUIDFilter | null),
/** TimelineActivities Rocket */
rocket?: (UUIDFilter | null),
/** TimelineActivities Pet */
petId?: (UUIDFilter | null),
/** TimelineActivities Pet */
pet?: (UUIDFilter | null),
/** TimelineActivities Survey result */
surveyResultId?: (UUIDFilter | null),
/** TimelineActivities Survey result */
surveyResult?: (UUIDFilter | null),and?: ((TimelineActivityFilterInput | null)[] | null),or?: ((TimelineActivityFilterInput | null)[] | null),not?: (TimelineActivityFilterInput | null)}


/** Aggregated / filtered event to be displayed on the timeline */
export interface TimelineActivityOrderByInput {
/** Creation date */
happensAt?: (OrderByDirection | null),
/** Event name */
name?: (OrderByDirection | null),
/** Json value for event details */
properties?: (OrderByDirection | null),
/** Cached record name */
linkedRecordCachedName?: (OrderByDirection | null),
/** Linked Record id */
linkedRecordId?: (OrderByDirection | null),
/** Linked Object Metadata Id */
linkedObjectMetadataId?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Event workspace member */
workspaceMemberId?: (OrderByDirection | null),
/** Event workspace member */
workspaceMember?: (OrderByDirection | null),
/** Event person */
personId?: (OrderByDirection | null),
/** Event person */
person?: (OrderByDirection | null),
/** Event company */
companyId?: (OrderByDirection | null),
/** Event company */
company?: (OrderByDirection | null),
/** Event opportunity */
opportunityId?: (OrderByDirection | null),
/** Event opportunity */
opportunity?: (OrderByDirection | null),
/** Event note */
noteId?: (OrderByDirection | null),
/** Event note */
note?: (OrderByDirection | null),
/** Event task */
taskId?: (OrderByDirection | null),
/** Event task */
task?: (OrderByDirection | null),
/** Event workflow */
workflowId?: (OrderByDirection | null),
/** Event workflow */
workflow?: (OrderByDirection | null),
/** Event workflow version */
workflowVersionId?: (OrderByDirection | null),
/** Event workflow version */
workflowVersion?: (OrderByDirection | null),
/** Event workflow run */
workflowRunId?: (OrderByDirection | null),
/** Event workflow run */
workflowRun?: (OrderByDirection | null),
/** TimelineActivities Rocket */
rocketId?: (OrderByDirection | null),
/** TimelineActivities Rocket */
rocket?: (OrderByDirection | null),
/** TimelineActivities Pet */
petId?: (OrderByDirection | null),
/** TimelineActivities Pet */
pet?: (OrderByDirection | null),
/** TimelineActivities Survey result */
surveyResultId?: (OrderByDirection | null),
/** TimelineActivities Survey result */
surveyResult?: (OrderByDirection | null)}


/** (System) View Fields */
export interface ViewFieldCreateInput {
/** View Field target field */
fieldMetadataId: Scalars['UUID'],
/** View Field visibility */
isVisible?: (Scalars['Boolean'] | null),
/** View Field size */
size?: (Scalars['Float'] | null),
/** View Field position */
position?: (Scalars['Float'] | null),
/** Optional aggregate operation */
aggregateOperation?: (ViewFieldAggregateOperationEnum | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** View Field related view */
viewId?: (Scalars['ID'] | null),
/** View Field related view */
view?: (Scalars['ID'] | null)}


/** (System) View Fields */
export interface ViewFieldUpdateInput {
/** View Field target field */
fieldMetadataId?: (Scalars['UUID'] | null),
/** View Field visibility */
isVisible?: (Scalars['Boolean'] | null),
/** View Field size */
size?: (Scalars['Float'] | null),
/** View Field position */
position?: (Scalars['Float'] | null),
/** Optional aggregate operation */
aggregateOperation?: (ViewFieldAggregateOperationEnum | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** View Field related view */
viewId?: (Scalars['ID'] | null),
/** View Field related view */
view?: (Scalars['ID'] | null)}


/** (System) View Fields */
export interface ViewFieldFilterInput {
/** View Field target field */
fieldMetadataId?: (UUIDFilter | null),
/** View Field visibility */
isVisible?: (BooleanFilter | null),
/** View Field size */
size?: (FloatFilter | null),
/** View Field position */
position?: (FloatFilter | null),
/** Optional aggregate operation */
aggregateOperation?: (ViewFieldAggregateOperationEnumFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** View Field related view */
viewId?: (UUIDFilter | null),
/** View Field related view */
view?: (UUIDFilter | null),and?: ((ViewFieldFilterInput | null)[] | null),or?: ((ViewFieldFilterInput | null)[] | null),not?: (ViewFieldFilterInput | null)}

export interface ViewFieldAggregateOperationEnumFilter {eq?: (ViewFieldAggregateOperationEnum | null),neq?: (ViewFieldAggregateOperationEnum | null),in?: ((ViewFieldAggregateOperationEnum | null)[] | null),containsAny?: ((ViewFieldAggregateOperationEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** (System) View Fields */
export interface ViewFieldOrderByInput {
/** View Field target field */
fieldMetadataId?: (OrderByDirection | null),
/** View Field visibility */
isVisible?: (OrderByDirection | null),
/** View Field size */
size?: (OrderByDirection | null),
/** View Field position */
position?: (OrderByDirection | null),
/** Optional aggregate operation */
aggregateOperation?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** View Field related view */
viewId?: (OrderByDirection | null),
/** View Field related view */
view?: (OrderByDirection | null)}


/** (System) View Filter Groups */
export interface ViewFilterGroupCreateInput {
/** Logical operator for the filter group */
logicalOperator?: (ViewFilterGroupLogicalOperatorEnum | null),
/** Position in the parent view filter group */
positionInViewFilterGroup?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Parent View Filter Group */
parentViewFilterGroupId?: (Scalars['UUID'] | null),
/** View */
viewId?: (Scalars['ID'] | null),
/** View */
view?: (Scalars['ID'] | null)}


/** (System) View Filter Groups */
export interface ViewFilterGroupUpdateInput {
/** Logical operator for the filter group */
logicalOperator?: (ViewFilterGroupLogicalOperatorEnum | null),
/** Position in the parent view filter group */
positionInViewFilterGroup?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Parent View Filter Group */
parentViewFilterGroupId?: (Scalars['UUID'] | null),
/** View */
viewId?: (Scalars['ID'] | null),
/** View */
view?: (Scalars['ID'] | null)}


/** (System) View Filter Groups */
export interface ViewFilterGroupFilterInput {
/** Logical operator for the filter group */
logicalOperator?: (ViewFilterGroupLogicalOperatorEnumFilter | null),
/** Position in the parent view filter group */
positionInViewFilterGroup?: (FloatFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Parent View Filter Group */
parentViewFilterGroupId?: (UUIDFilter | null),
/** View */
viewId?: (UUIDFilter | null),
/** View */
view?: (UUIDFilter | null),and?: ((ViewFilterGroupFilterInput | null)[] | null),or?: ((ViewFilterGroupFilterInput | null)[] | null),not?: (ViewFilterGroupFilterInput | null)}

export interface ViewFilterGroupLogicalOperatorEnumFilter {eq?: (ViewFilterGroupLogicalOperatorEnum | null),neq?: (ViewFilterGroupLogicalOperatorEnum | null),in?: ((ViewFilterGroupLogicalOperatorEnum | null)[] | null),containsAny?: ((ViewFilterGroupLogicalOperatorEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** (System) View Filter Groups */
export interface ViewFilterGroupOrderByInput {
/** Logical operator for the filter group */
logicalOperator?: (OrderByDirection | null),
/** Position in the parent view filter group */
positionInViewFilterGroup?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Parent View Filter Group */
parentViewFilterGroupId?: (OrderByDirection | null),
/** View */
viewId?: (OrderByDirection | null),
/** View */
view?: (OrderByDirection | null)}


/** (System) View Groups */
export interface ViewGroupCreateInput {
/** View Group target field */
fieldMetadataId: Scalars['UUID'],
/** View Group visibility */
isVisible?: (Scalars['Boolean'] | null),
/** Group by this field value */
fieldValue?: (Scalars['String'] | null),
/** View Field position */
position?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** View Group related view */
viewId?: (Scalars['ID'] | null),
/** View Group related view */
view?: (Scalars['ID'] | null)}


/** (System) View Groups */
export interface ViewGroupUpdateInput {
/** View Group target field */
fieldMetadataId?: (Scalars['UUID'] | null),
/** View Group visibility */
isVisible?: (Scalars['Boolean'] | null),
/** Group by this field value */
fieldValue?: (Scalars['String'] | null),
/** View Field position */
position?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** View Group related view */
viewId?: (Scalars['ID'] | null),
/** View Group related view */
view?: (Scalars['ID'] | null)}


/** (System) View Groups */
export interface ViewGroupFilterInput {
/** View Group target field */
fieldMetadataId?: (UUIDFilter | null),
/** View Group visibility */
isVisible?: (BooleanFilter | null),
/** Group by this field value */
fieldValue?: (StringFilter | null),
/** View Field position */
position?: (FloatFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** View Group related view */
viewId?: (UUIDFilter | null),
/** View Group related view */
view?: (UUIDFilter | null),and?: ((ViewGroupFilterInput | null)[] | null),or?: ((ViewGroupFilterInput | null)[] | null),not?: (ViewGroupFilterInput | null)}


/** (System) View Groups */
export interface ViewGroupOrderByInput {
/** View Group target field */
fieldMetadataId?: (OrderByDirection | null),
/** View Group visibility */
isVisible?: (OrderByDirection | null),
/** Group by this field value */
fieldValue?: (OrderByDirection | null),
/** View Field position */
position?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** View Group related view */
viewId?: (OrderByDirection | null),
/** View Group related view */
view?: (OrderByDirection | null)}


/** (System) View Filters */
export interface ViewFilterCreateInput {
/** View Filter target field */
fieldMetadataId: Scalars['UUID'],
/** View Filter operand */
operand?: (Scalars['String'] | null),
/** View Filter value */
value?: (Scalars['String'] | null),
/** View Filter Display Value */
displayValue?: (Scalars['String'] | null),
/** View Filter Group */
viewFilterGroupId?: (Scalars['UUID'] | null),
/** Position in the view filter group */
positionInViewFilterGroup?: (Scalars['Float'] | null),
/** Sub field name */
subFieldName?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** View Filter related view */
viewId?: (Scalars['ID'] | null),
/** View Filter related view */
view?: (Scalars['ID'] | null)}


/** (System) View Filters */
export interface ViewFilterUpdateInput {
/** View Filter target field */
fieldMetadataId?: (Scalars['UUID'] | null),
/** View Filter operand */
operand?: (Scalars['String'] | null),
/** View Filter value */
value?: (Scalars['String'] | null),
/** View Filter Display Value */
displayValue?: (Scalars['String'] | null),
/** View Filter Group */
viewFilterGroupId?: (Scalars['UUID'] | null),
/** Position in the view filter group */
positionInViewFilterGroup?: (Scalars['Float'] | null),
/** Sub field name */
subFieldName?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** View Filter related view */
viewId?: (Scalars['ID'] | null),
/** View Filter related view */
view?: (Scalars['ID'] | null)}


/** (System) View Filters */
export interface ViewFilterFilterInput {
/** View Filter target field */
fieldMetadataId?: (UUIDFilter | null),
/** View Filter operand */
operand?: (StringFilter | null),
/** View Filter value */
value?: (StringFilter | null),
/** View Filter Display Value */
displayValue?: (StringFilter | null),
/** View Filter Group */
viewFilterGroupId?: (UUIDFilter | null),
/** Position in the view filter group */
positionInViewFilterGroup?: (FloatFilter | null),
/** Sub field name */
subFieldName?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** View Filter related view */
viewId?: (UUIDFilter | null),
/** View Filter related view */
view?: (UUIDFilter | null),and?: ((ViewFilterFilterInput | null)[] | null),or?: ((ViewFilterFilterInput | null)[] | null),not?: (ViewFilterFilterInput | null)}


/** (System) View Filters */
export interface ViewFilterOrderByInput {
/** View Filter target field */
fieldMetadataId?: (OrderByDirection | null),
/** View Filter operand */
operand?: (OrderByDirection | null),
/** View Filter value */
value?: (OrderByDirection | null),
/** View Filter Display Value */
displayValue?: (OrderByDirection | null),
/** View Filter Group */
viewFilterGroupId?: (OrderByDirection | null),
/** Position in the view filter group */
positionInViewFilterGroup?: (OrderByDirection | null),
/** Sub field name */
subFieldName?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** View Filter related view */
viewId?: (OrderByDirection | null),
/** View Filter related view */
view?: (OrderByDirection | null)}


/** (System) View Sorts */
export interface ViewSortCreateInput {
/** View Sort target field */
fieldMetadataId: Scalars['UUID'],
/** View Sort direction */
direction?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** View Sort related view */
viewId?: (Scalars['ID'] | null),
/** View Sort related view */
view?: (Scalars['ID'] | null)}


/** (System) View Sorts */
export interface ViewSortUpdateInput {
/** View Sort target field */
fieldMetadataId?: (Scalars['UUID'] | null),
/** View Sort direction */
direction?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** View Sort related view */
viewId?: (Scalars['ID'] | null),
/** View Sort related view */
view?: (Scalars['ID'] | null)}


/** (System) View Sorts */
export interface ViewSortFilterInput {
/** View Sort target field */
fieldMetadataId?: (UUIDFilter | null),
/** View Sort direction */
direction?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** View Sort related view */
viewId?: (UUIDFilter | null),
/** View Sort related view */
view?: (UUIDFilter | null),and?: ((ViewSortFilterInput | null)[] | null),or?: ((ViewSortFilterInput | null)[] | null),not?: (ViewSortFilterInput | null)}


/** (System) View Sorts */
export interface ViewSortOrderByInput {
/** View Sort target field */
fieldMetadataId?: (OrderByDirection | null),
/** View Sort direction */
direction?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** View Sort related view */
viewId?: (OrderByDirection | null),
/** View Sort related view */
view?: (OrderByDirection | null)}


/** (System) Views */
export interface ViewCreateInput {
/** View name */
name?: (Scalars['String'] | null),
/** View target object */
objectMetadataId: Scalars['UUID'],
/** View type */
type?: (Scalars['String'] | null),
/** View key */
key?: (ViewKeyEnum | null),
/** View icon */
icon?: (Scalars['String'] | null),
/** View Kanban column field */
kanbanFieldMetadataId?: (Scalars['String'] | null),
/** View position */
position?: (Scalars['Position'] | null),
/** Describes if the view is in compact mode */
isCompact?: (Scalars['Boolean'] | null),
/** Display the records in a side panel or in a record page */
openRecordIn?: (ViewOpenRecordInEnum | null),
/** Optional aggregate operation */
kanbanAggregateOperation?: (ViewKanbanAggregateOperationEnum | null),
/** Field metadata used for aggregate operation */
kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** (System) Views */
export interface ViewUpdateInput {
/** View name */
name?: (Scalars['String'] | null),
/** View target object */
objectMetadataId?: (Scalars['UUID'] | null),
/** View type */
type?: (Scalars['String'] | null),
/** View key */
key?: (ViewKeyEnum | null),
/** View icon */
icon?: (Scalars['String'] | null),
/** View Kanban column field */
kanbanFieldMetadataId?: (Scalars['String'] | null),
/** View position */
position?: (Scalars['Position'] | null),
/** Describes if the view is in compact mode */
isCompact?: (Scalars['Boolean'] | null),
/** Display the records in a side panel or in a record page */
openRecordIn?: (ViewOpenRecordInEnum | null),
/** Optional aggregate operation */
kanbanAggregateOperation?: (ViewKanbanAggregateOperationEnum | null),
/** Field metadata used for aggregate operation */
kanbanAggregateOperationFieldMetadataId?: (Scalars['UUID'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** (System) Views */
export interface ViewFilterInput {
/** View name */
name?: (StringFilter | null),
/** View target object */
objectMetadataId?: (UUIDFilter | null),
/** View type */
type?: (StringFilter | null),
/** View key */
key?: (ViewKeyEnumFilter | null),
/** View icon */
icon?: (StringFilter | null),
/** View Kanban column field */
kanbanFieldMetadataId?: (StringFilter | null),
/** View position */
position?: (FloatFilter | null),
/** Describes if the view is in compact mode */
isCompact?: (BooleanFilter | null),
/** Display the records in a side panel or in a record page */
openRecordIn?: (ViewOpenRecordInEnumFilter | null),
/** Optional aggregate operation */
kanbanAggregateOperation?: (ViewKanbanAggregateOperationEnumFilter | null),
/** Field metadata used for aggregate operation */
kanbanAggregateOperationFieldMetadataId?: (UUIDFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),and?: ((ViewFilterInput | null)[] | null),or?: ((ViewFilterInput | null)[] | null),not?: (ViewFilterInput | null)}

export interface ViewKeyEnumFilter {eq?: (ViewKeyEnum | null),neq?: (ViewKeyEnum | null),in?: ((ViewKeyEnum | null)[] | null),containsAny?: ((ViewKeyEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface ViewOpenRecordInEnumFilter {eq?: (ViewOpenRecordInEnum | null),neq?: (ViewOpenRecordInEnum | null),in?: ((ViewOpenRecordInEnum | null)[] | null),containsAny?: ((ViewOpenRecordInEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface ViewKanbanAggregateOperationEnumFilter {eq?: (ViewKanbanAggregateOperationEnum | null),neq?: (ViewKanbanAggregateOperationEnum | null),in?: ((ViewKanbanAggregateOperationEnum | null)[] | null),containsAny?: ((ViewKanbanAggregateOperationEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** (System) Views */
export interface ViewOrderByInput {
/** View name */
name?: (OrderByDirection | null),
/** View target object */
objectMetadataId?: (OrderByDirection | null),
/** View type */
type?: (OrderByDirection | null),
/** View key */
key?: (OrderByDirection | null),
/** View icon */
icon?: (OrderByDirection | null),
/** View Kanban column field */
kanbanFieldMetadataId?: (OrderByDirection | null),
/** View position */
position?: (OrderByDirection | null),
/** Describes if the view is in compact mode */
isCompact?: (OrderByDirection | null),
/** Display the records in a side panel or in a record page */
openRecordIn?: (OrderByDirection | null),
/** Optional aggregate operation */
kanbanAggregateOperation?: (OrderByDirection | null),
/** Field metadata used for aggregate operation */
kanbanAggregateOperationFieldMetadataId?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null)}


/** A webhook */
export interface WebhookCreateInput {
/** Webhook target url */
targetUrl?: (Scalars['String'] | null),
/** Webhook operations */
operations?: ((Scalars['String'] | null)[] | null),description?: (Scalars['String'] | null),
/** Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests. */
secret?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A webhook */
export interface WebhookUpdateInput {
/** Webhook target url */
targetUrl?: (Scalars['String'] | null),
/** Webhook operations */
operations?: ((Scalars['String'] | null)[] | null),description?: (Scalars['String'] | null),
/** Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests. */
secret?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A webhook */
export interface WebhookFilterInput {
/** Webhook target url */
targetUrl?: (StringFilter | null),
/** Webhook operations */
operations?: (ArrayFilter | null),description?: (StringFilter | null),
/** Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests. */
secret?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),and?: ((WebhookFilterInput | null)[] | null),or?: ((WebhookFilterInput | null)[] | null),not?: (WebhookFilterInput | null)}


/** A webhook */
export interface WebhookOrderByInput {
/** Webhook target url */
targetUrl?: (OrderByDirection | null),
/** Webhook operations */
operations?: (OrderByDirection | null),description?: (OrderByDirection | null),
/** Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests. */
secret?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null)}


/** A workflow */
export interface WorkflowCreateInput {
/** The workflow name */
name?: (Scalars['String'] | null),
/** The workflow last published version id */
lastPublishedVersionId?: (Scalars['String'] | null),
/** The current statuses of the workflow versions */
statuses?: ((WorkflowStatusesEnum | null)[] | null),
/** Workflow record position */
position?: (Scalars['Position'] | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A workflow */
export interface WorkflowUpdateInput {
/** The workflow name */
name?: (Scalars['String'] | null),
/** The workflow last published version id */
lastPublishedVersionId?: (Scalars['String'] | null),
/** The current statuses of the workflow versions */
statuses?: ((WorkflowStatusesEnum | null)[] | null),
/** Workflow record position */
position?: (Scalars['Position'] | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A workflow */
export interface WorkflowFilterInput {
/** The workflow name */
name?: (StringFilter | null),
/** The workflow last published version id */
lastPublishedVersionId?: (StringFilter | null),
/** The current statuses of the workflow versions */
statuses?: (WorkflowStatusesEnumFilter | null),
/** Workflow record position */
position?: (FloatFilter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),and?: ((WorkflowFilterInput | null)[] | null),or?: ((WorkflowFilterInput | null)[] | null),not?: (WorkflowFilterInput | null)}

export interface WorkflowStatusesEnumFilter {eq?: (WorkflowStatusesEnum | null),neq?: (WorkflowStatusesEnum | null),in?: ((WorkflowStatusesEnum | null)[] | null),containsAny?: ((WorkflowStatusesEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** A workflow */
export interface WorkflowOrderByInput {
/** The workflow name */
name?: (OrderByDirection | null),
/** The workflow last published version id */
lastPublishedVersionId?: (OrderByDirection | null),
/** The current statuses of the workflow versions */
statuses?: ((OrderByDirection | null)[] | null),
/** Workflow record position */
position?: (OrderByDirection | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null)}


/** A workflow version */
export interface WorkflowVersionCreateInput {
/** The workflow version name */
name?: (Scalars['String'] | null),
/** Json object to provide trigger */
trigger?: (Scalars['RawJSONScalar'] | null),
/** Json object to provide steps */
steps?: (Scalars['RawJSONScalar'] | null),
/** The workflow version status */
status?: (WorkflowVersionStatusEnum | null),
/** Workflow version position */
position?: (Scalars['Position'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** WorkflowVersion workflow */
workflowId?: (Scalars['ID'] | null),
/** WorkflowVersion workflow */
workflow?: (Scalars['ID'] | null)}


/** A workflow version */
export interface WorkflowVersionUpdateInput {
/** The workflow version name */
name?: (Scalars['String'] | null),
/** Json object to provide trigger */
trigger?: (Scalars['RawJSONScalar'] | null),
/** Json object to provide steps */
steps?: (Scalars['RawJSONScalar'] | null),
/** The workflow version status */
status?: (WorkflowVersionStatusEnum | null),
/** Workflow version position */
position?: (Scalars['Position'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** WorkflowVersion workflow */
workflowId?: (Scalars['ID'] | null),
/** WorkflowVersion workflow */
workflow?: (Scalars['ID'] | null)}


/** A workflow version */
export interface WorkflowVersionFilterInput {
/** The workflow version name */
name?: (StringFilter | null),
/** Json object to provide trigger */
trigger?: (RawJsonFilter | null),
/** Json object to provide steps */
steps?: (RawJsonFilter | null),
/** The workflow version status */
status?: (WorkflowVersionStatusEnumFilter | null),
/** Workflow version position */
position?: (FloatFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** WorkflowVersion workflow */
workflowId?: (UUIDFilter | null),
/** WorkflowVersion workflow */
workflow?: (UUIDFilter | null),and?: ((WorkflowVersionFilterInput | null)[] | null),or?: ((WorkflowVersionFilterInput | null)[] | null),not?: (WorkflowVersionFilterInput | null)}

export interface WorkflowVersionStatusEnumFilter {eq?: (WorkflowVersionStatusEnum | null),neq?: (WorkflowVersionStatusEnum | null),in?: ((WorkflowVersionStatusEnum | null)[] | null),containsAny?: ((WorkflowVersionStatusEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** A workflow version */
export interface WorkflowVersionOrderByInput {
/** The workflow version name */
name?: (OrderByDirection | null),
/** Json object to provide trigger */
trigger?: (OrderByDirection | null),
/** Json object to provide steps */
steps?: (OrderByDirection | null),
/** The workflow version status */
status?: (OrderByDirection | null),
/** Workflow version position */
position?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** WorkflowVersion workflow */
workflowId?: (OrderByDirection | null),
/** WorkflowVersion workflow */
workflow?: (OrderByDirection | null)}


/** A workflow run */
export interface WorkflowRunCreateInput {
/** Name of the workflow run */
name?: (Scalars['String'] | null),
/** Workflow run started at */
startedAt?: (Scalars['DateTime'] | null),
/** Workflow run ended at */
endedAt?: (Scalars['DateTime'] | null),
/** Workflow run status */
status?: (WorkflowRunStatusEnum | null),
/** The executor of the workflow */
createdBy?: (ActorCreateInput | null),
/** Json object to provide output of the workflow run */
output?: (Scalars['RawJSONScalar'] | null),
/** Context */
context?: (Scalars['RawJSONScalar'] | null),
/** Workflow run position */
position?: (Scalars['Position'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Workflow version linked to the run. */
workflowVersionId?: (Scalars['ID'] | null),
/** Workflow version linked to the run. */
workflowVersion?: (Scalars['ID'] | null),
/** Workflow linked to the run. */
workflowId?: (Scalars['ID'] | null),
/** Workflow linked to the run. */
workflow?: (Scalars['ID'] | null)}


/** A workflow run */
export interface WorkflowRunUpdateInput {
/** Name of the workflow run */
name?: (Scalars['String'] | null),
/** Workflow run started at */
startedAt?: (Scalars['DateTime'] | null),
/** Workflow run ended at */
endedAt?: (Scalars['DateTime'] | null),
/** Workflow run status */
status?: (WorkflowRunStatusEnum | null),
/** The executor of the workflow */
createdBy?: (ActorUpdateInput | null),
/** Json object to provide output of the workflow run */
output?: (Scalars['RawJSONScalar'] | null),
/** Context */
context?: (Scalars['RawJSONScalar'] | null),
/** Workflow run position */
position?: (Scalars['Position'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Workflow version linked to the run. */
workflowVersionId?: (Scalars['ID'] | null),
/** Workflow version linked to the run. */
workflowVersion?: (Scalars['ID'] | null),
/** Workflow linked to the run. */
workflowId?: (Scalars['ID'] | null),
/** Workflow linked to the run. */
workflow?: (Scalars['ID'] | null)}


/** A workflow run */
export interface WorkflowRunFilterInput {
/** Name of the workflow run */
name?: (StringFilter | null),
/** Workflow run started at */
startedAt?: (DateFilter | null),
/** Workflow run ended at */
endedAt?: (DateFilter | null),
/** Workflow run status */
status?: (WorkflowRunStatusEnumFilter | null),
/** The executor of the workflow */
createdBy?: (ActorFilterInput | null),
/** Json object to provide output of the workflow run */
output?: (RawJsonFilter | null),
/** Context */
context?: (RawJsonFilter | null),
/** Workflow run position */
position?: (FloatFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Workflow version linked to the run. */
workflowVersionId?: (UUIDFilter | null),
/** Workflow version linked to the run. */
workflowVersion?: (UUIDFilter | null),
/** Workflow linked to the run. */
workflowId?: (UUIDFilter | null),
/** Workflow linked to the run. */
workflow?: (UUIDFilter | null),and?: ((WorkflowRunFilterInput | null)[] | null),or?: ((WorkflowRunFilterInput | null)[] | null),not?: (WorkflowRunFilterInput | null)}

export interface WorkflowRunStatusEnumFilter {eq?: (WorkflowRunStatusEnum | null),neq?: (WorkflowRunStatusEnum | null),in?: ((WorkflowRunStatusEnum | null)[] | null),containsAny?: ((WorkflowRunStatusEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** A workflow run */
export interface WorkflowRunOrderByInput {
/** Name of the workflow run */
name?: (OrderByDirection | null),
/** Workflow run started at */
startedAt?: (OrderByDirection | null),
/** Workflow run ended at */
endedAt?: (OrderByDirection | null),
/** Workflow run status */
status?: (OrderByDirection | null),
/** The executor of the workflow */
createdBy?: (ActorOrderByInput | null),
/** Json object to provide output of the workflow run */
output?: (OrderByDirection | null),
/** Context */
context?: (OrderByDirection | null),
/** Workflow run position */
position?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Workflow version linked to the run. */
workflowVersionId?: (OrderByDirection | null),
/** Workflow version linked to the run. */
workflowVersion?: (OrderByDirection | null),
/** Workflow linked to the run. */
workflowId?: (OrderByDirection | null),
/** Workflow linked to the run. */
workflow?: (OrderByDirection | null)}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerCreateInput {
/** The workflow automated trigger type */
type: WorkflowAutomatedTriggerTypeEnum,
/** The workflow automated trigger settings */
settings: Scalars['RawJSONScalar'],
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** WorkflowAutomatedTrigger workflow */
workflowId?: (Scalars['ID'] | null),
/** WorkflowAutomatedTrigger workflow */
workflow?: (Scalars['ID'] | null)}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerUpdateInput {
/** The workflow automated trigger type */
type?: (WorkflowAutomatedTriggerTypeEnum | null),
/** The workflow automated trigger settings */
settings?: (Scalars['RawJSONScalar'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** WorkflowAutomatedTrigger workflow */
workflowId?: (Scalars['ID'] | null),
/** WorkflowAutomatedTrigger workflow */
workflow?: (Scalars['ID'] | null)}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerFilterInput {
/** The workflow automated trigger type */
type?: (WorkflowAutomatedTriggerTypeEnumFilter | null),
/** The workflow automated trigger settings */
settings?: (RawJsonFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** WorkflowAutomatedTrigger workflow */
workflowId?: (UUIDFilter | null),
/** WorkflowAutomatedTrigger workflow */
workflow?: (UUIDFilter | null),and?: ((WorkflowAutomatedTriggerFilterInput | null)[] | null),or?: ((WorkflowAutomatedTriggerFilterInput | null)[] | null),not?: (WorkflowAutomatedTriggerFilterInput | null)}

export interface WorkflowAutomatedTriggerTypeEnumFilter {eq?: (WorkflowAutomatedTriggerTypeEnum | null),neq?: (WorkflowAutomatedTriggerTypeEnum | null),in?: ((WorkflowAutomatedTriggerTypeEnum | null)[] | null),containsAny?: ((WorkflowAutomatedTriggerTypeEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** A workflow automated trigger */
export interface WorkflowAutomatedTriggerOrderByInput {
/** The workflow automated trigger type */
type?: (OrderByDirection | null),
/** The workflow automated trigger settings */
settings?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** WorkflowAutomatedTrigger workflow */
workflowId?: (OrderByDirection | null),
/** WorkflowAutomatedTrigger workflow */
workflow?: (OrderByDirection | null)}


/** A workspace member */
export interface WorkspaceMemberCreateInput {
/** Workspace member position */
position?: (Scalars['Position'] | null),
/** Workspace member name */
name?: (FullNameCreateInput | null),
/** Preferred color scheme */
colorScheme?: (Scalars['String'] | null),
/** Preferred language */
locale?: (Scalars['String'] | null),
/** Workspace member avatar */
avatarUrl?: (Scalars['String'] | null),
/** Related user email address */
userEmail?: (Scalars['String'] | null),
/** Associated User Id */
userId: Scalars['UUID'],
/** User time zone */
timeZone?: (Scalars['String'] | null),
/** User's preferred date format */
dateFormat?: (WorkspaceMemberDateFormatEnum | null),
/** User's preferred time format */
timeFormat?: (WorkspaceMemberTimeFormatEnum | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A workspace member */
export interface WorkspaceMemberUpdateInput {
/** Workspace member position */
position?: (Scalars['Position'] | null),
/** Workspace member name */
name?: (FullNameUpdateInput | null),
/** Preferred color scheme */
colorScheme?: (Scalars['String'] | null),
/** Preferred language */
locale?: (Scalars['String'] | null),
/** Workspace member avatar */
avatarUrl?: (Scalars['String'] | null),
/** Related user email address */
userEmail?: (Scalars['String'] | null),
/** Associated User Id */
userId?: (Scalars['UUID'] | null),
/** User time zone */
timeZone?: (Scalars['String'] | null),
/** User's preferred date format */
dateFormat?: (WorkspaceMemberDateFormatEnum | null),
/** User's preferred time format */
timeFormat?: (WorkspaceMemberTimeFormatEnum | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A workspace member */
export interface WorkspaceMemberFilterInput {
/** Workspace member position */
position?: (FloatFilter | null),
/** Workspace member name */
name?: (FullNameFilterInput | null),
/** Preferred color scheme */
colorScheme?: (StringFilter | null),
/** Preferred language */
locale?: (StringFilter | null),
/** Workspace member avatar */
avatarUrl?: (StringFilter | null),
/** Related user email address */
userEmail?: (StringFilter | null),
/** Associated User Id */
userId?: (UUIDFilter | null),
/** User time zone */
timeZone?: (StringFilter | null),
/** User's preferred date format */
dateFormat?: (WorkspaceMemberDateFormatEnumFilter | null),
/** User's preferred time format */
timeFormat?: (WorkspaceMemberTimeFormatEnumFilter | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),and?: ((WorkspaceMemberFilterInput | null)[] | null),or?: ((WorkspaceMemberFilterInput | null)[] | null),not?: (WorkspaceMemberFilterInput | null)}

export interface WorkspaceMemberDateFormatEnumFilter {eq?: (WorkspaceMemberDateFormatEnum | null),neq?: (WorkspaceMemberDateFormatEnum | null),in?: ((WorkspaceMemberDateFormatEnum | null)[] | null),containsAny?: ((WorkspaceMemberDateFormatEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface WorkspaceMemberTimeFormatEnumFilter {eq?: (WorkspaceMemberTimeFormatEnum | null),neq?: (WorkspaceMemberTimeFormatEnum | null),in?: ((WorkspaceMemberTimeFormatEnum | null)[] | null),containsAny?: ((WorkspaceMemberTimeFormatEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** A workspace member */
export interface WorkspaceMemberOrderByInput {
/** Workspace member position */
position?: (OrderByDirection | null),
/** Workspace member name */
name?: (FullNameOrderByInput | null),
/** Preferred color scheme */
colorScheme?: (OrderByDirection | null),
/** Preferred language */
locale?: (OrderByDirection | null),
/** Workspace member avatar */
avatarUrl?: (OrderByDirection | null),
/** Related user email address */
userEmail?: (OrderByDirection | null),
/** Associated User Id */
userId?: (OrderByDirection | null),
/** User time zone */
timeZone?: (OrderByDirection | null),
/** User's preferred date format */
dateFormat?: (OrderByDirection | null),
/** User's preferred time format */
timeFormat?: (OrderByDirection | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null)}


/** A note */
export interface NoteCreateInput {
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Note record position */
position?: (Scalars['Position'] | null),
/** Note title */
title?: (Scalars['String'] | null),
/** Note body */
body?: (Scalars['String'] | null),
/** Note body */
bodyV2?: (RichTextV2CreateInput | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null)}


/** A note */
export interface NoteUpdateInput {
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Note record position */
position?: (Scalars['Position'] | null),
/** Note title */
title?: (Scalars['String'] | null),
/** Note body */
body?: (Scalars['String'] | null),
/** Note body */
bodyV2?: (RichTextV2UpdateInput | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null)}


/** A note */
export interface NoteFilterInput {
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Note record position */
position?: (FloatFilter | null),
/** Note title */
title?: (StringFilter | null),
/** Note body */
body?: (StringFilter | null),
/** Note body */
bodyV2?: (RichTextV2Filter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),and?: ((NoteFilterInput | null)[] | null),or?: ((NoteFilterInput | null)[] | null),not?: (NoteFilterInput | null)}

export interface RichTextV2Filter {blocknote?: (RichTextV2LeafFilter | null),markdown?: (RichTextV2LeafFilter | null)}

export interface RichTextV2LeafFilter {ilike?: (Scalars['String'] | null)}


/** A note */
export interface NoteOrderByInput {
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Note record position */
position?: (OrderByDirection | null),
/** Note title */
title?: (OrderByDirection | null),
/** Note body */
body?: (OrderByDirection | null),
/** Note body */
bodyV2?: (RichTextV2OrderByInput | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null)}


/** A task target */
export interface TaskTargetCreateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** TaskTarget task */
taskId?: (Scalars['ID'] | null),
/** TaskTarget task */
task?: (Scalars['ID'] | null),
/** TaskTarget person */
personId?: (Scalars['ID'] | null),
/** TaskTarget person */
person?: (Scalars['ID'] | null),
/** TaskTarget company */
companyId?: (Scalars['ID'] | null),
/** TaskTarget company */
company?: (Scalars['ID'] | null),
/** TaskTarget opportunity */
opportunityId?: (Scalars['ID'] | null),
/** TaskTarget opportunity */
opportunity?: (Scalars['ID'] | null),
/** TaskTargets Rocket */
rocketId?: (Scalars['ID'] | null),
/** TaskTargets Rocket */
rocket?: (Scalars['ID'] | null),
/** TaskTargets Pet */
petId?: (Scalars['ID'] | null),
/** TaskTargets Pet */
pet?: (Scalars['ID'] | null),
/** TaskTargets Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** TaskTargets Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** A task target */
export interface TaskTargetUpdateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** TaskTarget task */
taskId?: (Scalars['ID'] | null),
/** TaskTarget task */
task?: (Scalars['ID'] | null),
/** TaskTarget person */
personId?: (Scalars['ID'] | null),
/** TaskTarget person */
person?: (Scalars['ID'] | null),
/** TaskTarget company */
companyId?: (Scalars['ID'] | null),
/** TaskTarget company */
company?: (Scalars['ID'] | null),
/** TaskTarget opportunity */
opportunityId?: (Scalars['ID'] | null),
/** TaskTarget opportunity */
opportunity?: (Scalars['ID'] | null),
/** TaskTargets Rocket */
rocketId?: (Scalars['ID'] | null),
/** TaskTargets Rocket */
rocket?: (Scalars['ID'] | null),
/** TaskTargets Pet */
petId?: (Scalars['ID'] | null),
/** TaskTargets Pet */
pet?: (Scalars['ID'] | null),
/** TaskTargets Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** TaskTargets Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** A task target */
export interface TaskTargetFilterInput {
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** TaskTarget task */
taskId?: (UUIDFilter | null),
/** TaskTarget task */
task?: (UUIDFilter | null),
/** TaskTarget person */
personId?: (UUIDFilter | null),
/** TaskTarget person */
person?: (UUIDFilter | null),
/** TaskTarget company */
companyId?: (UUIDFilter | null),
/** TaskTarget company */
company?: (UUIDFilter | null),
/** TaskTarget opportunity */
opportunityId?: (UUIDFilter | null),
/** TaskTarget opportunity */
opportunity?: (UUIDFilter | null),
/** TaskTargets Rocket */
rocketId?: (UUIDFilter | null),
/** TaskTargets Rocket */
rocket?: (UUIDFilter | null),
/** TaskTargets Pet */
petId?: (UUIDFilter | null),
/** TaskTargets Pet */
pet?: (UUIDFilter | null),
/** TaskTargets Survey result */
surveyResultId?: (UUIDFilter | null),
/** TaskTargets Survey result */
surveyResult?: (UUIDFilter | null),and?: ((TaskTargetFilterInput | null)[] | null),or?: ((TaskTargetFilterInput | null)[] | null),not?: (TaskTargetFilterInput | null)}


/** A task target */
export interface TaskTargetOrderByInput {
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** TaskTarget task */
taskId?: (OrderByDirection | null),
/** TaskTarget task */
task?: (OrderByDirection | null),
/** TaskTarget person */
personId?: (OrderByDirection | null),
/** TaskTarget person */
person?: (OrderByDirection | null),
/** TaskTarget company */
companyId?: (OrderByDirection | null),
/** TaskTarget company */
company?: (OrderByDirection | null),
/** TaskTarget opportunity */
opportunityId?: (OrderByDirection | null),
/** TaskTarget opportunity */
opportunity?: (OrderByDirection | null),
/** TaskTargets Rocket */
rocketId?: (OrderByDirection | null),
/** TaskTargets Rocket */
rocket?: (OrderByDirection | null),
/** TaskTargets Pet */
petId?: (OrderByDirection | null),
/** TaskTargets Pet */
pet?: (OrderByDirection | null),
/** TaskTargets Survey result */
surveyResultId?: (OrderByDirection | null),
/** TaskTargets Survey result */
surveyResult?: (OrderByDirection | null)}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadCreateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadUpdateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null)}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadFilterInput {
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),and?: ((MessageThreadFilterInput | null)[] | null),or?: ((MessageThreadFilterInput | null)[] | null),not?: (MessageThreadFilterInput | null)}


/** A group of related messages (e.g. email thread, chat thread) */
export interface MessageThreadOrderByInput {
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null)}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageCreateInput {
/** Message id from the message header */
headerMessageId?: (Scalars['String'] | null),
/** Subject */
subject?: (Scalars['String'] | null),
/** Text */
text?: (Scalars['String'] | null),
/** The date the message was received */
receivedAt?: (Scalars['DateTime'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Message Thread Id */
messageThreadId?: (Scalars['ID'] | null),
/** Message Thread Id */
messageThread?: (Scalars['ID'] | null)}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageUpdateInput {
/** Message id from the message header */
headerMessageId?: (Scalars['String'] | null),
/** Subject */
subject?: (Scalars['String'] | null),
/** Text */
text?: (Scalars['String'] | null),
/** The date the message was received */
receivedAt?: (Scalars['DateTime'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Message Thread Id */
messageThreadId?: (Scalars['ID'] | null),
/** Message Thread Id */
messageThread?: (Scalars['ID'] | null)}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageFilterInput {
/** Message id from the message header */
headerMessageId?: (StringFilter | null),
/** Subject */
subject?: (StringFilter | null),
/** Text */
text?: (StringFilter | null),
/** The date the message was received */
receivedAt?: (DateFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Message Thread Id */
messageThreadId?: (UUIDFilter | null),
/** Message Thread Id */
messageThread?: (UUIDFilter | null),and?: ((MessageFilterInput | null)[] | null),or?: ((MessageFilterInput | null)[] | null),not?: (MessageFilterInput | null)}


/** A message sent or received through a messaging channel (email, chat, etc.) */
export interface MessageOrderByInput {
/** Message id from the message header */
headerMessageId?: (OrderByDirection | null),
/** Subject */
subject?: (OrderByDirection | null),
/** Text */
text?: (OrderByDirection | null),
/** The date the message was received */
receivedAt?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Message Thread Id */
messageThreadId?: (OrderByDirection | null),
/** Message Thread Id */
messageThread?: (OrderByDirection | null)}


/** Message Channels */
export interface MessageChannelCreateInput {
/** Visibility */
visibility?: (MessageChannelVisibilityEnum | null),
/** Handle */
handle?: (Scalars['String'] | null),
/** Channel Type */
type?: (MessageChannelTypeEnum | null),
/** Is Contact Auto Creation Enabled */
isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),
/** Automatically create People records when receiving or sending emails */
contactAutoCreationPolicy?: (MessageChannelContactAutoCreationPolicyEnum | null),
/** Exclude non professional emails */
excludeNonProfessionalEmails?: (Scalars['Boolean'] | null),
/** Exclude group emails */
excludeGroupEmails?: (Scalars['Boolean'] | null),
/** Is Sync Enabled */
isSyncEnabled?: (Scalars['Boolean'] | null),
/** Last sync cursor */
syncCursor?: (Scalars['String'] | null),
/** Last sync date */
syncedAt?: (Scalars['DateTime'] | null),
/** Sync status */
syncStatus?: (MessageChannelSyncStatusEnum | null),
/** Sync stage */
syncStage?: (MessageChannelSyncStageEnum | null),
/** Sync stage started at */
syncStageStartedAt?: (Scalars['DateTime'] | null),
/** Throttle Failure Count */
throttleFailureCount?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Connected Account */
connectedAccountId?: (Scalars['ID'] | null),
/** Connected Account */
connectedAccount?: (Scalars['ID'] | null)}


/** Message Channels */
export interface MessageChannelUpdateInput {
/** Visibility */
visibility?: (MessageChannelVisibilityEnum | null),
/** Handle */
handle?: (Scalars['String'] | null),
/** Channel Type */
type?: (MessageChannelTypeEnum | null),
/** Is Contact Auto Creation Enabled */
isContactAutoCreationEnabled?: (Scalars['Boolean'] | null),
/** Automatically create People records when receiving or sending emails */
contactAutoCreationPolicy?: (MessageChannelContactAutoCreationPolicyEnum | null),
/** Exclude non professional emails */
excludeNonProfessionalEmails?: (Scalars['Boolean'] | null),
/** Exclude group emails */
excludeGroupEmails?: (Scalars['Boolean'] | null),
/** Is Sync Enabled */
isSyncEnabled?: (Scalars['Boolean'] | null),
/** Last sync cursor */
syncCursor?: (Scalars['String'] | null),
/** Last sync date */
syncedAt?: (Scalars['DateTime'] | null),
/** Sync status */
syncStatus?: (MessageChannelSyncStatusEnum | null),
/** Sync stage */
syncStage?: (MessageChannelSyncStageEnum | null),
/** Sync stage started at */
syncStageStartedAt?: (Scalars['DateTime'] | null),
/** Throttle Failure Count */
throttleFailureCount?: (Scalars['Float'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Connected Account */
connectedAccountId?: (Scalars['ID'] | null),
/** Connected Account */
connectedAccount?: (Scalars['ID'] | null)}


/** Message Channels */
export interface MessageChannelFilterInput {
/** Visibility */
visibility?: (MessageChannelVisibilityEnumFilter | null),
/** Handle */
handle?: (StringFilter | null),
/** Channel Type */
type?: (MessageChannelTypeEnumFilter | null),
/** Is Contact Auto Creation Enabled */
isContactAutoCreationEnabled?: (BooleanFilter | null),
/** Automatically create People records when receiving or sending emails */
contactAutoCreationPolicy?: (MessageChannelContactAutoCreationPolicyEnumFilter | null),
/** Exclude non professional emails */
excludeNonProfessionalEmails?: (BooleanFilter | null),
/** Exclude group emails */
excludeGroupEmails?: (BooleanFilter | null),
/** Is Sync Enabled */
isSyncEnabled?: (BooleanFilter | null),
/** Last sync cursor */
syncCursor?: (StringFilter | null),
/** Last sync date */
syncedAt?: (DateFilter | null),
/** Sync status */
syncStatus?: (MessageChannelSyncStatusEnumFilter | null),
/** Sync stage */
syncStage?: (MessageChannelSyncStageEnumFilter | null),
/** Sync stage started at */
syncStageStartedAt?: (DateFilter | null),
/** Throttle Failure Count */
throttleFailureCount?: (FloatFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Connected Account */
connectedAccountId?: (UUIDFilter | null),
/** Connected Account */
connectedAccount?: (UUIDFilter | null),and?: ((MessageChannelFilterInput | null)[] | null),or?: ((MessageChannelFilterInput | null)[] | null),not?: (MessageChannelFilterInput | null)}

export interface MessageChannelVisibilityEnumFilter {eq?: (MessageChannelVisibilityEnum | null),neq?: (MessageChannelVisibilityEnum | null),in?: ((MessageChannelVisibilityEnum | null)[] | null),containsAny?: ((MessageChannelVisibilityEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface MessageChannelTypeEnumFilter {eq?: (MessageChannelTypeEnum | null),neq?: (MessageChannelTypeEnum | null),in?: ((MessageChannelTypeEnum | null)[] | null),containsAny?: ((MessageChannelTypeEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface MessageChannelContactAutoCreationPolicyEnumFilter {eq?: (MessageChannelContactAutoCreationPolicyEnum | null),neq?: (MessageChannelContactAutoCreationPolicyEnum | null),in?: ((MessageChannelContactAutoCreationPolicyEnum | null)[] | null),containsAny?: ((MessageChannelContactAutoCreationPolicyEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface MessageChannelSyncStatusEnumFilter {eq?: (MessageChannelSyncStatusEnum | null),neq?: (MessageChannelSyncStatusEnum | null),in?: ((MessageChannelSyncStatusEnum | null)[] | null),containsAny?: ((MessageChannelSyncStatusEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface MessageChannelSyncStageEnumFilter {eq?: (MessageChannelSyncStageEnum | null),neq?: (MessageChannelSyncStageEnum | null),in?: ((MessageChannelSyncStageEnum | null)[] | null),containsAny?: ((MessageChannelSyncStageEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** Message Channels */
export interface MessageChannelOrderByInput {
/** Visibility */
visibility?: (OrderByDirection | null),
/** Handle */
handle?: (OrderByDirection | null),
/** Channel Type */
type?: (OrderByDirection | null),
/** Is Contact Auto Creation Enabled */
isContactAutoCreationEnabled?: (OrderByDirection | null),
/** Automatically create People records when receiving or sending emails */
contactAutoCreationPolicy?: (OrderByDirection | null),
/** Exclude non professional emails */
excludeNonProfessionalEmails?: (OrderByDirection | null),
/** Exclude group emails */
excludeGroupEmails?: (OrderByDirection | null),
/** Is Sync Enabled */
isSyncEnabled?: (OrderByDirection | null),
/** Last sync cursor */
syncCursor?: (OrderByDirection | null),
/** Last sync date */
syncedAt?: (OrderByDirection | null),
/** Sync status */
syncStatus?: (OrderByDirection | null),
/** Sync stage */
syncStage?: (OrderByDirection | null),
/** Sync stage started at */
syncStageStartedAt?: (OrderByDirection | null),
/** Throttle Failure Count */
throttleFailureCount?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Connected Account */
connectedAccountId?: (OrderByDirection | null),
/** Connected Account */
connectedAccount?: (OrderByDirection | null)}


/** Message Participants */
export interface MessageParticipantCreateInput {
/** Role */
role?: (MessageParticipantRoleEnum | null),
/** Handle */
handle?: (Scalars['String'] | null),
/** Display Name */
displayName?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Message */
messageId?: (Scalars['ID'] | null),
/** Message */
message?: (Scalars['ID'] | null),
/** Person */
personId?: (Scalars['ID'] | null),
/** Person */
person?: (Scalars['ID'] | null),
/** Workspace member */
workspaceMemberId?: (Scalars['ID'] | null),
/** Workspace member */
workspaceMember?: (Scalars['ID'] | null)}


/** Message Participants */
export interface MessageParticipantUpdateInput {
/** Role */
role?: (MessageParticipantRoleEnum | null),
/** Handle */
handle?: (Scalars['String'] | null),
/** Display Name */
displayName?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Message */
messageId?: (Scalars['ID'] | null),
/** Message */
message?: (Scalars['ID'] | null),
/** Person */
personId?: (Scalars['ID'] | null),
/** Person */
person?: (Scalars['ID'] | null),
/** Workspace member */
workspaceMemberId?: (Scalars['ID'] | null),
/** Workspace member */
workspaceMember?: (Scalars['ID'] | null)}


/** Message Participants */
export interface MessageParticipantFilterInput {
/** Role */
role?: (MessageParticipantRoleEnumFilter | null),
/** Handle */
handle?: (StringFilter | null),
/** Display Name */
displayName?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Message */
messageId?: (UUIDFilter | null),
/** Message */
message?: (UUIDFilter | null),
/** Person */
personId?: (UUIDFilter | null),
/** Person */
person?: (UUIDFilter | null),
/** Workspace member */
workspaceMemberId?: (UUIDFilter | null),
/** Workspace member */
workspaceMember?: (UUIDFilter | null),and?: ((MessageParticipantFilterInput | null)[] | null),or?: ((MessageParticipantFilterInput | null)[] | null),not?: (MessageParticipantFilterInput | null)}

export interface MessageParticipantRoleEnumFilter {eq?: (MessageParticipantRoleEnum | null),neq?: (MessageParticipantRoleEnum | null),in?: ((MessageParticipantRoleEnum | null)[] | null),containsAny?: ((MessageParticipantRoleEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** Message Participants */
export interface MessageParticipantOrderByInput {
/** Role */
role?: (OrderByDirection | null),
/** Handle */
handle?: (OrderByDirection | null),
/** Display Name */
displayName?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Message */
messageId?: (OrderByDirection | null),
/** Message */
message?: (OrderByDirection | null),
/** Person */
personId?: (OrderByDirection | null),
/** Person */
person?: (OrderByDirection | null),
/** Workspace member */
workspaceMemberId?: (OrderByDirection | null),
/** Workspace member */
workspaceMember?: (OrderByDirection | null)}


/** Folder for Message Channel */
export interface MessageFolderCreateInput {
/** Folder name */
name?: (Scalars['String'] | null),
/** Sync Cursor */
syncCursor?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Message Channel */
messageChannelId?: (Scalars['ID'] | null),
/** Message Channel */
messageChannel?: (Scalars['ID'] | null)}


/** Folder for Message Channel */
export interface MessageFolderUpdateInput {
/** Folder name */
name?: (Scalars['String'] | null),
/** Sync Cursor */
syncCursor?: (Scalars['String'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Message Channel */
messageChannelId?: (Scalars['ID'] | null),
/** Message Channel */
messageChannel?: (Scalars['ID'] | null)}


/** Folder for Message Channel */
export interface MessageFolderFilterInput {
/** Folder name */
name?: (StringFilter | null),
/** Sync Cursor */
syncCursor?: (StringFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Message Channel */
messageChannelId?: (UUIDFilter | null),
/** Message Channel */
messageChannel?: (UUIDFilter | null),and?: ((MessageFolderFilterInput | null)[] | null),or?: ((MessageFolderFilterInput | null)[] | null),not?: (MessageFolderFilterInput | null)}


/** Folder for Message Channel */
export interface MessageFolderOrderByInput {
/** Folder name */
name?: (OrderByDirection | null),
/** Sync Cursor */
syncCursor?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Message Channel */
messageChannelId?: (OrderByDirection | null),
/** Message Channel */
messageChannel?: (OrderByDirection | null)}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationCreateInput {
/** Message id from the messaging provider */
messageExternalId?: (Scalars['String'] | null),
/** Thread id from the messaging provider */
messageThreadExternalId?: (Scalars['String'] | null),
/** Message Direction */
direction?: (MessageChannelMessageAssociationDirectionEnum | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Message Channel Id */
messageChannelId?: (Scalars['ID'] | null),
/** Message Channel Id */
messageChannel?: (Scalars['ID'] | null),
/** Message Id */
messageId?: (Scalars['ID'] | null),
/** Message Id */
message?: (Scalars['ID'] | null)}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationUpdateInput {
/** Message id from the messaging provider */
messageExternalId?: (Scalars['String'] | null),
/** Thread id from the messaging provider */
messageThreadExternalId?: (Scalars['String'] | null),
/** Message Direction */
direction?: (MessageChannelMessageAssociationDirectionEnum | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Message Channel Id */
messageChannelId?: (Scalars['ID'] | null),
/** Message Channel Id */
messageChannel?: (Scalars['ID'] | null),
/** Message Id */
messageId?: (Scalars['ID'] | null),
/** Message Id */
message?: (Scalars['ID'] | null)}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationFilterInput {
/** Message id from the messaging provider */
messageExternalId?: (StringFilter | null),
/** Thread id from the messaging provider */
messageThreadExternalId?: (StringFilter | null),
/** Message Direction */
direction?: (MessageChannelMessageAssociationDirectionEnumFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Message Channel Id */
messageChannelId?: (UUIDFilter | null),
/** Message Channel Id */
messageChannel?: (UUIDFilter | null),
/** Message Id */
messageId?: (UUIDFilter | null),
/** Message Id */
message?: (UUIDFilter | null),and?: ((MessageChannelMessageAssociationFilterInput | null)[] | null),or?: ((MessageChannelMessageAssociationFilterInput | null)[] | null),not?: (MessageChannelMessageAssociationFilterInput | null)}

export interface MessageChannelMessageAssociationDirectionEnumFilter {eq?: (MessageChannelMessageAssociationDirectionEnum | null),neq?: (MessageChannelMessageAssociationDirectionEnum | null),in?: ((MessageChannelMessageAssociationDirectionEnum | null)[] | null),containsAny?: ((MessageChannelMessageAssociationDirectionEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** Message Synced with a Message Channel */
export interface MessageChannelMessageAssociationOrderByInput {
/** Message id from the messaging provider */
messageExternalId?: (OrderByDirection | null),
/** Thread id from the messaging provider */
messageThreadExternalId?: (OrderByDirection | null),
/** Message Direction */
direction?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Message Channel Id */
messageChannelId?: (OrderByDirection | null),
/** Message Channel Id */
messageChannel?: (OrderByDirection | null),
/** Message Id */
messageId?: (OrderByDirection | null),
/** Message Id */
message?: (OrderByDirection | null)}


/** A note target */
export interface NoteTargetCreateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** NoteTarget note */
noteId?: (Scalars['ID'] | null),
/** NoteTarget note */
note?: (Scalars['ID'] | null),
/** NoteTarget person */
personId?: (Scalars['ID'] | null),
/** NoteTarget person */
person?: (Scalars['ID'] | null),
/** NoteTarget company */
companyId?: (Scalars['ID'] | null),
/** NoteTarget company */
company?: (Scalars['ID'] | null),
/** NoteTarget opportunity */
opportunityId?: (Scalars['ID'] | null),
/** NoteTarget opportunity */
opportunity?: (Scalars['ID'] | null),
/** NoteTargets Rocket */
rocketId?: (Scalars['ID'] | null),
/** NoteTargets Rocket */
rocket?: (Scalars['ID'] | null),
/** NoteTargets Pet */
petId?: (Scalars['ID'] | null),
/** NoteTargets Pet */
pet?: (Scalars['ID'] | null),
/** NoteTargets Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** NoteTargets Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** A note target */
export interface NoteTargetUpdateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** NoteTarget note */
noteId?: (Scalars['ID'] | null),
/** NoteTarget note */
note?: (Scalars['ID'] | null),
/** NoteTarget person */
personId?: (Scalars['ID'] | null),
/** NoteTarget person */
person?: (Scalars['ID'] | null),
/** NoteTarget company */
companyId?: (Scalars['ID'] | null),
/** NoteTarget company */
company?: (Scalars['ID'] | null),
/** NoteTarget opportunity */
opportunityId?: (Scalars['ID'] | null),
/** NoteTarget opportunity */
opportunity?: (Scalars['ID'] | null),
/** NoteTargets Rocket */
rocketId?: (Scalars['ID'] | null),
/** NoteTargets Rocket */
rocket?: (Scalars['ID'] | null),
/** NoteTargets Pet */
petId?: (Scalars['ID'] | null),
/** NoteTargets Pet */
pet?: (Scalars['ID'] | null),
/** NoteTargets Survey result */
surveyResultId?: (Scalars['ID'] | null),
/** NoteTargets Survey result */
surveyResult?: (Scalars['ID'] | null)}


/** A note target */
export interface NoteTargetFilterInput {
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** NoteTarget note */
noteId?: (UUIDFilter | null),
/** NoteTarget note */
note?: (UUIDFilter | null),
/** NoteTarget person */
personId?: (UUIDFilter | null),
/** NoteTarget person */
person?: (UUIDFilter | null),
/** NoteTarget company */
companyId?: (UUIDFilter | null),
/** NoteTarget company */
company?: (UUIDFilter | null),
/** NoteTarget opportunity */
opportunityId?: (UUIDFilter | null),
/** NoteTarget opportunity */
opportunity?: (UUIDFilter | null),
/** NoteTargets Rocket */
rocketId?: (UUIDFilter | null),
/** NoteTargets Rocket */
rocket?: (UUIDFilter | null),
/** NoteTargets Pet */
petId?: (UUIDFilter | null),
/** NoteTargets Pet */
pet?: (UUIDFilter | null),
/** NoteTargets Survey result */
surveyResultId?: (UUIDFilter | null),
/** NoteTargets Survey result */
surveyResult?: (UUIDFilter | null),and?: ((NoteTargetFilterInput | null)[] | null),or?: ((NoteTargetFilterInput | null)[] | null),not?: (NoteTargetFilterInput | null)}


/** A note target */
export interface NoteTargetOrderByInput {
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** NoteTarget note */
noteId?: (OrderByDirection | null),
/** NoteTarget note */
note?: (OrderByDirection | null),
/** NoteTarget person */
personId?: (OrderByDirection | null),
/** NoteTarget person */
person?: (OrderByDirection | null),
/** NoteTarget company */
companyId?: (OrderByDirection | null),
/** NoteTarget company */
company?: (OrderByDirection | null),
/** NoteTarget opportunity */
opportunityId?: (OrderByDirection | null),
/** NoteTarget opportunity */
opportunity?: (OrderByDirection | null),
/** NoteTargets Rocket */
rocketId?: (OrderByDirection | null),
/** NoteTargets Rocket */
rocket?: (OrderByDirection | null),
/** NoteTargets Pet */
petId?: (OrderByDirection | null),
/** NoteTargets Pet */
pet?: (OrderByDirection | null),
/** NoteTargets Survey result */
surveyResultId?: (OrderByDirection | null),
/** NoteTargets Survey result */
surveyResult?: (OrderByDirection | null)}


/** An opportunity */
export interface OpportunityCreateInput {
/** The opportunity name */
name?: (Scalars['String'] | null),
/** Opportunity amount */
amount?: (CurrencyCreateInput | null),
/** Opportunity close date */
closeDate?: (Scalars['DateTime'] | null),
/** Opportunity stage */
stage?: (OpportunityStageEnum | null),
/** Opportunity record position */
position?: (Scalars['Position'] | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Opportunity point of contact */
pointOfContactId?: (Scalars['ID'] | null),
/** Opportunity point of contact */
pointOfContact?: (Scalars['ID'] | null),
/** Opportunity company */
companyId?: (Scalars['ID'] | null),
/** Opportunity company */
company?: (Scalars['ID'] | null)}


/** An opportunity */
export interface OpportunityUpdateInput {
/** The opportunity name */
name?: (Scalars['String'] | null),
/** Opportunity amount */
amount?: (CurrencyUpdateInput | null),
/** Opportunity close date */
closeDate?: (Scalars['DateTime'] | null),
/** Opportunity stage */
stage?: (OpportunityStageEnum | null),
/** Opportunity record position */
position?: (Scalars['Position'] | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Opportunity point of contact */
pointOfContactId?: (Scalars['ID'] | null),
/** Opportunity point of contact */
pointOfContact?: (Scalars['ID'] | null),
/** Opportunity company */
companyId?: (Scalars['ID'] | null),
/** Opportunity company */
company?: (Scalars['ID'] | null)}


/** An opportunity */
export interface OpportunityFilterInput {
/** The opportunity name */
name?: (StringFilter | null),
/** Opportunity amount */
amount?: (CurrencyFilterInput | null),
/** Opportunity close date */
closeDate?: (DateFilter | null),
/** Opportunity stage */
stage?: (OpportunityStageEnumFilter | null),
/** Opportunity record position */
position?: (FloatFilter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Opportunity point of contact */
pointOfContactId?: (UUIDFilter | null),
/** Opportunity point of contact */
pointOfContact?: (UUIDFilter | null),
/** Opportunity company */
companyId?: (UUIDFilter | null),
/** Opportunity company */
company?: (UUIDFilter | null),and?: ((OpportunityFilterInput | null)[] | null),or?: ((OpportunityFilterInput | null)[] | null),not?: (OpportunityFilterInput | null)}

export interface OpportunityStageEnumFilter {eq?: (OpportunityStageEnum | null),neq?: (OpportunityStageEnum | null),in?: ((OpportunityStageEnum | null)[] | null),containsAny?: ((OpportunityStageEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** An opportunity */
export interface OpportunityOrderByInput {
/** The opportunity name */
name?: (OrderByDirection | null),
/** Opportunity amount */
amount?: (CurrencyOrderByInput | null),
/** Opportunity close date */
closeDate?: (OrderByDirection | null),
/** Opportunity stage */
stage?: (OrderByDirection | null),
/** Opportunity record position */
position?: (OrderByDirection | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Opportunity point of contact */
pointOfContactId?: (OrderByDirection | null),
/** Opportunity point of contact */
pointOfContact?: (OrderByDirection | null),
/** Opportunity company */
companyId?: (OrderByDirection | null),
/** Opportunity company */
company?: (OrderByDirection | null)}


/** A person */
export interface PersonCreateInput {
/** Contact’s name */
name?: (FullNameCreateInput | null),
/** Contact’s Emails */
emails?: (EmailsCreateInput | null),
/** Contact’s Linkedin account */
linkedinLink?: (LinksCreateInput | null),
/** Contact’s X/Twitter account */
xLink?: (LinksCreateInput | null),
/** Contact’s job title */
jobTitle?: (Scalars['String'] | null),
/** Contact’s phone numbers */
phones?: (PhonesCreateInput | null),
/** Contact’s city */
city?: (Scalars['String'] | null),
/** Contact’s avatar */
avatarUrl?: (Scalars['String'] | null),
/** Person record Position */
position?: (Scalars['Position'] | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Contact’s company */
companyId?: (Scalars['ID'] | null),
/** Contact’s company */
company?: (Scalars['ID'] | null),intro?: (Scalars['String'] | null),whatsapp?: (PhonesCreateInput | null),workPreference?: ((PersonWorkPreferenceEnum | null)[] | null),performanceRating?: (PersonPerformanceRatingEnum | null)}


/** A person */
export interface PersonUpdateInput {
/** Contact’s name */
name?: (FullNameUpdateInput | null),
/** Contact’s Emails */
emails?: (EmailsUpdateInput | null),
/** Contact’s Linkedin account */
linkedinLink?: (LinksUpdateInput | null),
/** Contact’s X/Twitter account */
xLink?: (LinksUpdateInput | null),
/** Contact’s job title */
jobTitle?: (Scalars['String'] | null),
/** Contact’s phone numbers */
phones?: (PhonesUpdateInput | null),
/** Contact’s city */
city?: (Scalars['String'] | null),
/** Contact’s avatar */
avatarUrl?: (Scalars['String'] | null),
/** Person record Position */
position?: (Scalars['Position'] | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Contact’s company */
companyId?: (Scalars['ID'] | null),
/** Contact’s company */
company?: (Scalars['ID'] | null),intro?: (Scalars['String'] | null),whatsapp?: (PhonesUpdateInput | null),workPreference?: ((PersonWorkPreferenceEnum | null)[] | null),performanceRating?: (PersonPerformanceRatingEnum | null)}


/** A person */
export interface PersonFilterInput {
/** Contact’s name */
name?: (FullNameFilterInput | null),
/** Contact’s Emails */
emails?: (EmailsFilterInput | null),
/** Contact’s Linkedin account */
linkedinLink?: (LinksFilterInput | null),
/** Contact’s X/Twitter account */
xLink?: (LinksFilterInput | null),
/** Contact’s job title */
jobTitle?: (StringFilter | null),
/** Contact’s phone numbers */
phones?: (PhonesFilterInput | null),
/** Contact’s city */
city?: (StringFilter | null),
/** Contact’s avatar */
avatarUrl?: (StringFilter | null),
/** Person record Position */
position?: (FloatFilter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Contact’s company */
companyId?: (UUIDFilter | null),
/** Contact’s company */
company?: (UUIDFilter | null),intro?: (StringFilter | null),whatsapp?: (PhonesFilterInput | null),workPreference?: (PersonWorkPreferenceEnumFilter | null),performanceRating?: (PersonPerformanceRatingEnumFilter | null),and?: ((PersonFilterInput | null)[] | null),or?: ((PersonFilterInput | null)[] | null),not?: (PersonFilterInput | null)}

export interface PersonWorkPreferenceEnumFilter {eq?: (PersonWorkPreferenceEnum | null),neq?: (PersonWorkPreferenceEnum | null),in?: ((PersonWorkPreferenceEnum | null)[] | null),containsAny?: ((PersonWorkPreferenceEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}

export interface PersonPerformanceRatingEnumFilter {eq?: (PersonPerformanceRatingEnum | null),neq?: (PersonPerformanceRatingEnum | null),in?: ((PersonPerformanceRatingEnum | null)[] | null),containsAny?: ((PersonPerformanceRatingEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** A person */
export interface PersonOrderByInput {
/** Contact’s name */
name?: (FullNameOrderByInput | null),
/** Contact’s Emails */
emails?: (EmailsOrderByInput | null),
/** Contact’s Linkedin account */
linkedinLink?: (LinksOrderByInput | null),
/** Contact’s X/Twitter account */
xLink?: (LinksOrderByInput | null),
/** Contact’s job title */
jobTitle?: (OrderByDirection | null),
/** Contact’s phone numbers */
phones?: (PhonesOrderByInput | null),
/** Contact’s city */
city?: (OrderByDirection | null),
/** Contact’s avatar */
avatarUrl?: (OrderByDirection | null),
/** Person record Position */
position?: (OrderByDirection | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Contact’s company */
companyId?: (OrderByDirection | null),
/** Contact’s company */
company?: (OrderByDirection | null),intro?: (OrderByDirection | null),whatsapp?: (PhonesOrderByInput | null),workPreference?: ((OrderByDirection | null)[] | null),performanceRating?: (OrderByDirection | null)}


/** A task */
export interface TaskCreateInput {
/** Task record position */
position?: (Scalars['Position'] | null),
/** Task title */
title?: (Scalars['String'] | null),
/** Task body */
body?: (Scalars['String'] | null),
/** Task body */
bodyV2?: (RichTextV2CreateInput | null),
/** Task due date */
dueAt?: (Scalars['DateTime'] | null),
/** Task status */
status?: (TaskStatusEnum | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Task assignee */
assigneeId?: (Scalars['ID'] | null),
/** Task assignee */
assignee?: (Scalars['ID'] | null)}


/** A task */
export interface TaskUpdateInput {
/** Task record position */
position?: (Scalars['Position'] | null),
/** Task title */
title?: (Scalars['String'] | null),
/** Task body */
body?: (Scalars['String'] | null),
/** Task body */
bodyV2?: (RichTextV2UpdateInput | null),
/** Task due date */
dueAt?: (Scalars['DateTime'] | null),
/** Task status */
status?: (TaskStatusEnum | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),
/** Id */
id?: (Scalars['ID'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Date when the record was deleted */
deletedAt?: (Scalars['DateTime'] | null),
/** Task assignee */
assigneeId?: (Scalars['ID'] | null),
/** Task assignee */
assignee?: (Scalars['ID'] | null)}


/** A task */
export interface TaskFilterInput {
/** Task record position */
position?: (FloatFilter | null),
/** Task title */
title?: (StringFilter | null),
/** Task body */
body?: (StringFilter | null),
/** Task body */
bodyV2?: (RichTextV2Filter | null),
/** Task due date */
dueAt?: (DateFilter | null),
/** Task status */
status?: (TaskStatusEnumFilter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),
/** Id */
id?: (UUIDFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Date when the record was deleted */
deletedAt?: (DateFilter | null),
/** Task assignee */
assigneeId?: (UUIDFilter | null),
/** Task assignee */
assignee?: (UUIDFilter | null),and?: ((TaskFilterInput | null)[] | null),or?: ((TaskFilterInput | null)[] | null),not?: (TaskFilterInput | null)}

export interface TaskStatusEnumFilter {eq?: (TaskStatusEnum | null),neq?: (TaskStatusEnum | null),in?: ((TaskStatusEnum | null)[] | null),containsAny?: ((TaskStatusEnum | null)[] | null),is?: (FilterIs | null),isEmptyArray?: (Scalars['Boolean'] | null)}


/** A task */
export interface TaskOrderByInput {
/** Task record position */
position?: (OrderByDirection | null),
/** Task title */
title?: (OrderByDirection | null),
/** Task body */
body?: (OrderByDirection | null),
/** Task body */
bodyV2?: (RichTextV2OrderByInput | null),
/** Task due date */
dueAt?: (OrderByDirection | null),
/** Task status */
status?: (OrderByDirection | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null),
/** Id */
id?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Date when the record was deleted */
deletedAt?: (OrderByDirection | null),
/** Task assignee */
assigneeId?: (OrderByDirection | null),
/** Task assignee */
assignee?: (OrderByDirection | null)}


/** A rocket */
export interface RocketCreateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Name */
name?: (Scalars['String'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Deletion date */
deletedAt?: (Scalars['DateTime'] | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Position */
position?: (Scalars['Position'] | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null)}


/** A rocket */
export interface RocketUpdateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Name */
name?: (Scalars['String'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Deletion date */
deletedAt?: (Scalars['DateTime'] | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Position */
position?: (Scalars['Position'] | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null)}


/** A rocket */
export interface RocketFilterInput {
/** Id */
id?: (UUIDFilter | null),
/** Name */
name?: (StringFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Deletion date */
deletedAt?: (DateFilter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Position */
position?: (FloatFilter | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),and?: ((RocketFilterInput | null)[] | null),or?: ((RocketFilterInput | null)[] | null),not?: (RocketFilterInput | null)}


/** A rocket */
export interface RocketOrderByInput {
/** Id */
id?: (OrderByDirection | null),
/** Name */
name?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Deletion date */
deletedAt?: (OrderByDirection | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Position */
position?: (OrderByDirection | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null)}

export interface SurveyResultCreateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Name */
name?: (Scalars['String'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Deletion date */
deletedAt?: (Scalars['DateTime'] | null),
/** The creator of the record */
createdBy?: (ActorCreateInput | null),
/** Position */
position?: (Scalars['Position'] | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),score?: (Scalars['Float'] | null),percentageOfCompletion?: (Scalars['Float'] | null),participants?: (Scalars['Int'] | null),averageEstimatedNumberOfAtomsInTheUniverse?: (Scalars['BigInt'] | null),comments?: (Scalars['String'] | null),shortNotes?: (Scalars['String'] | null)}

export interface SurveyResultUpdateInput {
/** Id */
id?: (Scalars['ID'] | null),
/** Name */
name?: (Scalars['String'] | null),
/** Creation date */
createdAt?: (Scalars['DateTime'] | null),
/** Last time the record was changed */
updatedAt?: (Scalars['DateTime'] | null),
/** Deletion date */
deletedAt?: (Scalars['DateTime'] | null),
/** The creator of the record */
createdBy?: (ActorUpdateInput | null),
/** Position */
position?: (Scalars['Position'] | null),
/** Field used for full-text search */
searchVector?: (Scalars['TSVector'] | null),score?: (Scalars['Float'] | null),percentageOfCompletion?: (Scalars['Float'] | null),participants?: (Scalars['Int'] | null),averageEstimatedNumberOfAtomsInTheUniverse?: (Scalars['BigInt'] | null),comments?: (Scalars['String'] | null),shortNotes?: (Scalars['String'] | null)}

export interface SurveyResultFilterInput {
/** Id */
id?: (UUIDFilter | null),
/** Name */
name?: (StringFilter | null),
/** Creation date */
createdAt?: (DateFilter | null),
/** Last time the record was changed */
updatedAt?: (DateFilter | null),
/** Deletion date */
deletedAt?: (DateFilter | null),
/** The creator of the record */
createdBy?: (ActorFilterInput | null),
/** Position */
position?: (FloatFilter | null),
/** Field used for full-text search */
searchVector?: (TSVectorFilter | null),score?: (FloatFilter | null),percentageOfCompletion?: (FloatFilter | null),participants?: (IntFilter | null),averageEstimatedNumberOfAtomsInTheUniverse?: (BigIntFilter | null),comments?: (StringFilter | null),shortNotes?: (StringFilter | null),and?: ((SurveyResultFilterInput | null)[] | null),or?: ((SurveyResultFilterInput | null)[] | null),not?: (SurveyResultFilterInput | null)}

export interface IntFilter {eq?: (Scalars['Int'] | null),gt?: (Scalars['Int'] | null),gte?: (Scalars['Int'] | null),in?: (Scalars['Int'][] | null),lt?: (Scalars['Int'] | null),lte?: (Scalars['Int'] | null),neq?: (Scalars['Int'] | null),is?: (FilterIs | null)}

export interface BigIntFilter {eq?: (Scalars['BigInt'] | null),gt?: (Scalars['BigInt'] | null),gte?: (Scalars['BigInt'] | null),in?: (Scalars['BigInt'][] | null),lt?: (Scalars['BigInt'] | null),lte?: (Scalars['BigInt'] | null),neq?: (Scalars['BigInt'] | null),is?: (FilterIs | null)}

export interface SurveyResultOrderByInput {
/** Id */
id?: (OrderByDirection | null),
/** Name */
name?: (OrderByDirection | null),
/** Creation date */
createdAt?: (OrderByDirection | null),
/** Last time the record was changed */
updatedAt?: (OrderByDirection | null),
/** Deletion date */
deletedAt?: (OrderByDirection | null),
/** The creator of the record */
createdBy?: (ActorOrderByInput | null),
/** Position */
position?: (OrderByDirection | null),
/** Field used for full-text search */
searchVector?: (OrderByDirection | null),score?: (OrderByDirection | null),percentageOfCompletion?: (OrderByDirection | null),participants?: (OrderByDirection | null),averageEstimatedNumberOfAtomsInTheUniverse?: (OrderByDirection | null),comments?: (OrderByDirection | null),shortNotes?: (OrderByDirection | null)}

export interface QueryGenqlSelection{
    apiKeys?: (ApiKeyConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ApiKeyFilterInput | null), orderBy?: ((ApiKeyOrderByInput | null)[] | null)} })
    apiKey?: (ApiKeyGenqlSelection & { __args?: {filter?: (ApiKeyFilterInput | null)} })
    attachments?: (AttachmentConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (AttachmentFilterInput | null), orderBy?: ((AttachmentOrderByInput | null)[] | null)} })
    attachment?: (AttachmentGenqlSelection & { __args?: {filter?: (AttachmentFilterInput | null)} })
    pets?: (PetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (PetFilterInput | null), orderBy?: ((PetOrderByInput | null)[] | null)} })
    pet?: (PetGenqlSelection & { __args?: {filter?: (PetFilterInput | null)} })
    blocklists?: (BlocklistConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (BlocklistFilterInput | null), orderBy?: ((BlocklistOrderByInput | null)[] | null)} })
    blocklist?: (BlocklistGenqlSelection & { __args?: {filter?: (BlocklistFilterInput | null)} })
    calendarEvents?: (CalendarEventConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarEventFilterInput | null), orderBy?: ((CalendarEventOrderByInput | null)[] | null)} })
    calendarEvent?: (CalendarEventGenqlSelection & { __args?: {filter?: (CalendarEventFilterInput | null)} })
    calendarChannels?: (CalendarChannelConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarChannelFilterInput | null), orderBy?: ((CalendarChannelOrderByInput | null)[] | null)} })
    calendarChannel?: (CalendarChannelGenqlSelection & { __args?: {filter?: (CalendarChannelFilterInput | null)} })
    calendarChannelEventAssociations?: (CalendarChannelEventAssociationConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarChannelEventAssociationFilterInput | null), orderBy?: ((CalendarChannelEventAssociationOrderByInput | null)[] | null)} })
    calendarChannelEventAssociation?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {filter?: (CalendarChannelEventAssociationFilterInput | null)} })
    calendarEventParticipants?: (CalendarEventParticipantConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CalendarEventParticipantFilterInput | null), orderBy?: ((CalendarEventParticipantOrderByInput | null)[] | null)} })
    calendarEventParticipant?: (CalendarEventParticipantGenqlSelection & { __args?: {filter?: (CalendarEventParticipantFilterInput | null)} })
    companies?: (CompanyConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (CompanyFilterInput | null), orderBy?: ((CompanyOrderByInput | null)[] | null)} })
    company?: (CompanyGenqlSelection & { __args?: {filter?: (CompanyFilterInput | null)} })
    companyDuplicates?: (CompanyConnectionGenqlSelection & { __args?: {ids?: ((Scalars['UUID'] | null)[] | null), data?: ((CompanyCreateInput | null)[] | null)} })
    connectedAccounts?: (ConnectedAccountConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ConnectedAccountFilterInput | null), orderBy?: ((ConnectedAccountOrderByInput | null)[] | null)} })
    connectedAccount?: (ConnectedAccountGenqlSelection & { __args?: {filter?: (ConnectedAccountFilterInput | null)} })
    favorites?: (FavoriteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFilterInput | null), orderBy?: ((FavoriteOrderByInput | null)[] | null)} })
    favorite?: (FavoriteGenqlSelection & { __args?: {filter?: (FavoriteFilterInput | null)} })
    favoriteFolders?: (FavoriteFolderConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (FavoriteFolderFilterInput | null), orderBy?: ((FavoriteFolderOrderByInput | null)[] | null)} })
    favoriteFolder?: (FavoriteFolderGenqlSelection & { __args?: {filter?: (FavoriteFolderFilterInput | null)} })
    timelineActivities?: (TimelineActivityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TimelineActivityFilterInput | null), orderBy?: ((TimelineActivityOrderByInput | null)[] | null)} })
    timelineActivity?: (TimelineActivityGenqlSelection & { __args?: {filter?: (TimelineActivityFilterInput | null)} })
    viewFields?: (ViewFieldConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewFieldFilterInput | null), orderBy?: ((ViewFieldOrderByInput | null)[] | null)} })
    viewField?: (ViewFieldGenqlSelection & { __args?: {filter?: (ViewFieldFilterInput | null)} })
    viewFilterGroups?: (ViewFilterGroupConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewFilterGroupFilterInput | null), orderBy?: ((ViewFilterGroupOrderByInput | null)[] | null)} })
    viewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args?: {filter?: (ViewFilterGroupFilterInput | null)} })
    viewGroups?: (ViewGroupConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewGroupFilterInput | null), orderBy?: ((ViewGroupOrderByInput | null)[] | null)} })
    viewGroup?: (ViewGroupGenqlSelection & { __args?: {filter?: (ViewGroupFilterInput | null)} })
    viewFilters?: (ViewFilterConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewFilterFilterInput | null), orderBy?: ((ViewFilterOrderByInput | null)[] | null)} })
    viewFilter?: (ViewFilterGenqlSelection & { __args?: {filter?: (ViewFilterFilterInput | null)} })
    viewSorts?: (ViewSortConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewSortFilterInput | null), orderBy?: ((ViewSortOrderByInput | null)[] | null)} })
    viewSort?: (ViewSortGenqlSelection & { __args?: {filter?: (ViewSortFilterInput | null)} })
    views?: (ViewConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (ViewFilterInput | null), orderBy?: ((ViewOrderByInput | null)[] | null)} })
    view?: (ViewGenqlSelection & { __args?: {filter?: (ViewFilterInput | null)} })
    webhooks?: (WebhookConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WebhookFilterInput | null), orderBy?: ((WebhookOrderByInput | null)[] | null)} })
    webhook?: (WebhookGenqlSelection & { __args?: {filter?: (WebhookFilterInput | null)} })
    workflows?: (WorkflowConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkflowFilterInput | null), orderBy?: ((WorkflowOrderByInput | null)[] | null)} })
    workflow?: (WorkflowGenqlSelection & { __args?: {filter?: (WorkflowFilterInput | null)} })
    workflowVersions?: (WorkflowVersionConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkflowVersionFilterInput | null), orderBy?: ((WorkflowVersionOrderByInput | null)[] | null)} })
    workflowVersion?: (WorkflowVersionGenqlSelection & { __args?: {filter?: (WorkflowVersionFilterInput | null)} })
    workflowRuns?: (WorkflowRunConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkflowRunFilterInput | null), orderBy?: ((WorkflowRunOrderByInput | null)[] | null)} })
    workflowRun?: (WorkflowRunGenqlSelection & { __args?: {filter?: (WorkflowRunFilterInput | null)} })
    workflowAutomatedTriggers?: (WorkflowAutomatedTriggerConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkflowAutomatedTriggerFilterInput | null), orderBy?: ((WorkflowAutomatedTriggerOrderByInput | null)[] | null)} })
    workflowAutomatedTrigger?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {filter?: (WorkflowAutomatedTriggerFilterInput | null)} })
    workspaceMembers?: (WorkspaceMemberConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (WorkspaceMemberFilterInput | null), orderBy?: ((WorkspaceMemberOrderByInput | null)[] | null)} })
    workspaceMember?: (WorkspaceMemberGenqlSelection & { __args?: {filter?: (WorkspaceMemberFilterInput | null)} })
    notes?: (NoteConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteFilterInput | null), orderBy?: ((NoteOrderByInput | null)[] | null)} })
    note?: (NoteGenqlSelection & { __args?: {filter?: (NoteFilterInput | null)} })
    taskTargets?: (TaskTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskTargetFilterInput | null), orderBy?: ((TaskTargetOrderByInput | null)[] | null)} })
    taskTarget?: (TaskTargetGenqlSelection & { __args?: {filter?: (TaskTargetFilterInput | null)} })
    messageThreads?: (MessageThreadConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageThreadFilterInput | null), orderBy?: ((MessageThreadOrderByInput | null)[] | null)} })
    messageThread?: (MessageThreadGenqlSelection & { __args?: {filter?: (MessageThreadFilterInput | null)} })
    messages?: (MessageConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageFilterInput | null), orderBy?: ((MessageOrderByInput | null)[] | null)} })
    message?: (MessageGenqlSelection & { __args?: {filter?: (MessageFilterInput | null)} })
    messageChannels?: (MessageChannelConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageChannelFilterInput | null), orderBy?: ((MessageChannelOrderByInput | null)[] | null)} })
    messageChannel?: (MessageChannelGenqlSelection & { __args?: {filter?: (MessageChannelFilterInput | null)} })
    messageParticipants?: (MessageParticipantConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageParticipantFilterInput | null), orderBy?: ((MessageParticipantOrderByInput | null)[] | null)} })
    messageParticipant?: (MessageParticipantGenqlSelection & { __args?: {filter?: (MessageParticipantFilterInput | null)} })
    messageFolders?: (MessageFolderConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageFolderFilterInput | null), orderBy?: ((MessageFolderOrderByInput | null)[] | null)} })
    messageFolder?: (MessageFolderGenqlSelection & { __args?: {filter?: (MessageFolderFilterInput | null)} })
    messageChannelMessageAssociations?: (MessageChannelMessageAssociationConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (MessageChannelMessageAssociationFilterInput | null), orderBy?: ((MessageChannelMessageAssociationOrderByInput | null)[] | null)} })
    messageChannelMessageAssociation?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {filter?: (MessageChannelMessageAssociationFilterInput | null)} })
    noteTargets?: (NoteTargetConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (NoteTargetFilterInput | null), orderBy?: ((NoteTargetOrderByInput | null)[] | null)} })
    noteTarget?: (NoteTargetGenqlSelection & { __args?: {filter?: (NoteTargetFilterInput | null)} })
    opportunities?: (OpportunityConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (OpportunityFilterInput | null), orderBy?: ((OpportunityOrderByInput | null)[] | null)} })
    opportunity?: (OpportunityGenqlSelection & { __args?: {filter?: (OpportunityFilterInput | null)} })
    people?: (PersonConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (PersonFilterInput | null), orderBy?: ((PersonOrderByInput | null)[] | null)} })
    person?: (PersonGenqlSelection & { __args?: {filter?: (PersonFilterInput | null)} })
    personDuplicates?: (PersonConnectionGenqlSelection & { __args?: {ids?: ((Scalars['UUID'] | null)[] | null), data?: ((PersonCreateInput | null)[] | null)} })
    tasks?: (TaskConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (TaskFilterInput | null), orderBy?: ((TaskOrderByInput | null)[] | null)} })
    task?: (TaskGenqlSelection & { __args?: {filter?: (TaskFilterInput | null)} })
    rockets?: (RocketConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (RocketFilterInput | null), orderBy?: ((RocketOrderByInput | null)[] | null)} })
    rocket?: (RocketGenqlSelection & { __args?: {filter?: (RocketFilterInput | null)} })
    surveyResults?: (SurveyResultConnectionGenqlSelection & { __args?: {first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), before?: (Scalars['String'] | null), after?: (Scalars['String'] | null), limit?: (Scalars['Int'] | null), filter?: (SurveyResultFilterInput | null), orderBy?: ((SurveyResultOrderByInput | null)[] | null)} })
    surveyResult?: (SurveyResultGenqlSelection & { __args?: {filter?: (SurveyResultFilterInput | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    createApiKeys?: (ApiKeyGenqlSelection & { __args?: {data?: (ApiKeyCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createApiKey?: (ApiKeyGenqlSelection & { __args?: {data?: (ApiKeyCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateApiKey?: (ApiKeyGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (ApiKeyUpdateInput | null)} })
    deleteApiKey?: (ApiKeyGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateApiKeys?: (ApiKeyGenqlSelection & { __args?: {data?: (ApiKeyUpdateInput | null), filter?: (ApiKeyFilterInput | null)} })
    deleteApiKeys?: (ApiKeyGenqlSelection & { __args?: {filter?: (ApiKeyFilterInput | null)} })
    destroyApiKey?: (ApiKeyGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyApiKeys?: (ApiKeyGenqlSelection & { __args?: {filter?: (ApiKeyFilterInput | null)} })
    restoreApiKey?: (ApiKeyGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreApiKeys?: (ApiKeyGenqlSelection & { __args?: {filter?: (ApiKeyFilterInput | null)} })
    createAttachments?: (AttachmentGenqlSelection & { __args?: {data?: (AttachmentCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createAttachment?: (AttachmentGenqlSelection & { __args?: {data?: (AttachmentCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateAttachment?: (AttachmentGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (AttachmentUpdateInput | null)} })
    deleteAttachment?: (AttachmentGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateAttachments?: (AttachmentGenqlSelection & { __args?: {data?: (AttachmentUpdateInput | null), filter?: (AttachmentFilterInput | null)} })
    deleteAttachments?: (AttachmentGenqlSelection & { __args?: {filter?: (AttachmentFilterInput | null)} })
    destroyAttachment?: (AttachmentGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyAttachments?: (AttachmentGenqlSelection & { __args?: {filter?: (AttachmentFilterInput | null)} })
    restoreAttachment?: (AttachmentGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreAttachments?: (AttachmentGenqlSelection & { __args?: {filter?: (AttachmentFilterInput | null)} })
    createPets?: (PetGenqlSelection & { __args?: {data?: (PetCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createPet?: (PetGenqlSelection & { __args?: {data?: (PetCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updatePet?: (PetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (PetUpdateInput | null)} })
    deletePet?: (PetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updatePets?: (PetGenqlSelection & { __args?: {data?: (PetUpdateInput | null), filter?: (PetFilterInput | null)} })
    deletePets?: (PetGenqlSelection & { __args?: {filter?: (PetFilterInput | null)} })
    destroyPet?: (PetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyPets?: (PetGenqlSelection & { __args?: {filter?: (PetFilterInput | null)} })
    restorePet?: (PetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restorePets?: (PetGenqlSelection & { __args?: {filter?: (PetFilterInput | null)} })
    createBlocklists?: (BlocklistGenqlSelection & { __args?: {data?: (BlocklistCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createBlocklist?: (BlocklistGenqlSelection & { __args?: {data?: (BlocklistCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateBlocklist?: (BlocklistGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (BlocklistUpdateInput | null)} })
    deleteBlocklist?: (BlocklistGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateBlocklists?: (BlocklistGenqlSelection & { __args?: {data?: (BlocklistUpdateInput | null), filter?: (BlocklistFilterInput | null)} })
    deleteBlocklists?: (BlocklistGenqlSelection & { __args?: {filter?: (BlocklistFilterInput | null)} })
    destroyBlocklist?: (BlocklistGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyBlocklists?: (BlocklistGenqlSelection & { __args?: {filter?: (BlocklistFilterInput | null)} })
    restoreBlocklist?: (BlocklistGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreBlocklists?: (BlocklistGenqlSelection & { __args?: {filter?: (BlocklistFilterInput | null)} })
    createCalendarEvents?: (CalendarEventGenqlSelection & { __args?: {data?: (CalendarEventCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createCalendarEvent?: (CalendarEventGenqlSelection & { __args?: {data?: (CalendarEventCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateCalendarEvent?: (CalendarEventGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (CalendarEventUpdateInput | null)} })
    deleteCalendarEvent?: (CalendarEventGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateCalendarEvents?: (CalendarEventGenqlSelection & { __args?: {data?: (CalendarEventUpdateInput | null), filter?: (CalendarEventFilterInput | null)} })
    deleteCalendarEvents?: (CalendarEventGenqlSelection & { __args?: {filter?: (CalendarEventFilterInput | null)} })
    destroyCalendarEvent?: (CalendarEventGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyCalendarEvents?: (CalendarEventGenqlSelection & { __args?: {filter?: (CalendarEventFilterInput | null)} })
    restoreCalendarEvent?: (CalendarEventGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreCalendarEvents?: (CalendarEventGenqlSelection & { __args?: {filter?: (CalendarEventFilterInput | null)} })
    createCalendarChannels?: (CalendarChannelGenqlSelection & { __args?: {data?: (CalendarChannelCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createCalendarChannel?: (CalendarChannelGenqlSelection & { __args?: {data?: (CalendarChannelCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateCalendarChannel?: (CalendarChannelGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (CalendarChannelUpdateInput | null)} })
    deleteCalendarChannel?: (CalendarChannelGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateCalendarChannels?: (CalendarChannelGenqlSelection & { __args?: {data?: (CalendarChannelUpdateInput | null), filter?: (CalendarChannelFilterInput | null)} })
    deleteCalendarChannels?: (CalendarChannelGenqlSelection & { __args?: {filter?: (CalendarChannelFilterInput | null)} })
    destroyCalendarChannel?: (CalendarChannelGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyCalendarChannels?: (CalendarChannelGenqlSelection & { __args?: {filter?: (CalendarChannelFilterInput | null)} })
    restoreCalendarChannel?: (CalendarChannelGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreCalendarChannels?: (CalendarChannelGenqlSelection & { __args?: {filter?: (CalendarChannelFilterInput | null)} })
    createCalendarChannelEventAssociations?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {data?: (CalendarChannelEventAssociationCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createCalendarChannelEventAssociation?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {data?: (CalendarChannelEventAssociationCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateCalendarChannelEventAssociation?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (CalendarChannelEventAssociationUpdateInput | null)} })
    deleteCalendarChannelEventAssociation?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateCalendarChannelEventAssociations?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {data?: (CalendarChannelEventAssociationUpdateInput | null), filter?: (CalendarChannelEventAssociationFilterInput | null)} })
    deleteCalendarChannelEventAssociations?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {filter?: (CalendarChannelEventAssociationFilterInput | null)} })
    destroyCalendarChannelEventAssociation?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyCalendarChannelEventAssociations?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {filter?: (CalendarChannelEventAssociationFilterInput | null)} })
    restoreCalendarChannelEventAssociation?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreCalendarChannelEventAssociations?: (CalendarChannelEventAssociationGenqlSelection & { __args?: {filter?: (CalendarChannelEventAssociationFilterInput | null)} })
    createCalendarEventParticipants?: (CalendarEventParticipantGenqlSelection & { __args?: {data?: (CalendarEventParticipantCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createCalendarEventParticipant?: (CalendarEventParticipantGenqlSelection & { __args?: {data?: (CalendarEventParticipantCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateCalendarEventParticipant?: (CalendarEventParticipantGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (CalendarEventParticipantUpdateInput | null)} })
    deleteCalendarEventParticipant?: (CalendarEventParticipantGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateCalendarEventParticipants?: (CalendarEventParticipantGenqlSelection & { __args?: {data?: (CalendarEventParticipantUpdateInput | null), filter?: (CalendarEventParticipantFilterInput | null)} })
    deleteCalendarEventParticipants?: (CalendarEventParticipantGenqlSelection & { __args?: {filter?: (CalendarEventParticipantFilterInput | null)} })
    destroyCalendarEventParticipant?: (CalendarEventParticipantGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyCalendarEventParticipants?: (CalendarEventParticipantGenqlSelection & { __args?: {filter?: (CalendarEventParticipantFilterInput | null)} })
    restoreCalendarEventParticipant?: (CalendarEventParticipantGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreCalendarEventParticipants?: (CalendarEventParticipantGenqlSelection & { __args?: {filter?: (CalendarEventParticipantFilterInput | null)} })
    createCompanies?: (CompanyGenqlSelection & { __args?: {data?: (CompanyCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createCompany?: (CompanyGenqlSelection & { __args?: {data?: (CompanyCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateCompany?: (CompanyGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (CompanyUpdateInput | null)} })
    deleteCompany?: (CompanyGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateCompanies?: (CompanyGenqlSelection & { __args?: {data?: (CompanyUpdateInput | null), filter?: (CompanyFilterInput | null)} })
    deleteCompanies?: (CompanyGenqlSelection & { __args?: {filter?: (CompanyFilterInput | null)} })
    destroyCompany?: (CompanyGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyCompanies?: (CompanyGenqlSelection & { __args?: {filter?: (CompanyFilterInput | null)} })
    restoreCompany?: (CompanyGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreCompanies?: (CompanyGenqlSelection & { __args?: {filter?: (CompanyFilterInput | null)} })
    createConnectedAccounts?: (ConnectedAccountGenqlSelection & { __args?: {data?: (ConnectedAccountCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createConnectedAccount?: (ConnectedAccountGenqlSelection & { __args?: {data?: (ConnectedAccountCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateConnectedAccount?: (ConnectedAccountGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (ConnectedAccountUpdateInput | null)} })
    deleteConnectedAccount?: (ConnectedAccountGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateConnectedAccounts?: (ConnectedAccountGenqlSelection & { __args?: {data?: (ConnectedAccountUpdateInput | null), filter?: (ConnectedAccountFilterInput | null)} })
    deleteConnectedAccounts?: (ConnectedAccountGenqlSelection & { __args?: {filter?: (ConnectedAccountFilterInput | null)} })
    destroyConnectedAccount?: (ConnectedAccountGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyConnectedAccounts?: (ConnectedAccountGenqlSelection & { __args?: {filter?: (ConnectedAccountFilterInput | null)} })
    restoreConnectedAccount?: (ConnectedAccountGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreConnectedAccounts?: (ConnectedAccountGenqlSelection & { __args?: {filter?: (ConnectedAccountFilterInput | null)} })
    createFavorites?: (FavoriteGenqlSelection & { __args?: {data?: (FavoriteCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createFavorite?: (FavoriteGenqlSelection & { __args?: {data?: (FavoriteCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateFavorite?: (FavoriteGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (FavoriteUpdateInput | null)} })
    deleteFavorite?: (FavoriteGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateFavorites?: (FavoriteGenqlSelection & { __args?: {data?: (FavoriteUpdateInput | null), filter?: (FavoriteFilterInput | null)} })
    deleteFavorites?: (FavoriteGenqlSelection & { __args?: {filter?: (FavoriteFilterInput | null)} })
    destroyFavorite?: (FavoriteGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyFavorites?: (FavoriteGenqlSelection & { __args?: {filter?: (FavoriteFilterInput | null)} })
    restoreFavorite?: (FavoriteGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreFavorites?: (FavoriteGenqlSelection & { __args?: {filter?: (FavoriteFilterInput | null)} })
    createFavoriteFolders?: (FavoriteFolderGenqlSelection & { __args?: {data?: (FavoriteFolderCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createFavoriteFolder?: (FavoriteFolderGenqlSelection & { __args?: {data?: (FavoriteFolderCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateFavoriteFolder?: (FavoriteFolderGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (FavoriteFolderUpdateInput | null)} })
    deleteFavoriteFolder?: (FavoriteFolderGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateFavoriteFolders?: (FavoriteFolderGenqlSelection & { __args?: {data?: (FavoriteFolderUpdateInput | null), filter?: (FavoriteFolderFilterInput | null)} })
    deleteFavoriteFolders?: (FavoriteFolderGenqlSelection & { __args?: {filter?: (FavoriteFolderFilterInput | null)} })
    destroyFavoriteFolder?: (FavoriteFolderGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyFavoriteFolders?: (FavoriteFolderGenqlSelection & { __args?: {filter?: (FavoriteFolderFilterInput | null)} })
    restoreFavoriteFolder?: (FavoriteFolderGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreFavoriteFolders?: (FavoriteFolderGenqlSelection & { __args?: {filter?: (FavoriteFolderFilterInput | null)} })
    createTimelineActivities?: (TimelineActivityGenqlSelection & { __args?: {data?: (TimelineActivityCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createTimelineActivity?: (TimelineActivityGenqlSelection & { __args?: {data?: (TimelineActivityCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateTimelineActivity?: (TimelineActivityGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (TimelineActivityUpdateInput | null)} })
    deleteTimelineActivity?: (TimelineActivityGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateTimelineActivities?: (TimelineActivityGenqlSelection & { __args?: {data?: (TimelineActivityUpdateInput | null), filter?: (TimelineActivityFilterInput | null)} })
    deleteTimelineActivities?: (TimelineActivityGenqlSelection & { __args?: {filter?: (TimelineActivityFilterInput | null)} })
    destroyTimelineActivity?: (TimelineActivityGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyTimelineActivities?: (TimelineActivityGenqlSelection & { __args?: {filter?: (TimelineActivityFilterInput | null)} })
    restoreTimelineActivity?: (TimelineActivityGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreTimelineActivities?: (TimelineActivityGenqlSelection & { __args?: {filter?: (TimelineActivityFilterInput | null)} })
    createViewFields?: (ViewFieldGenqlSelection & { __args?: {data?: (ViewFieldCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createViewField?: (ViewFieldGenqlSelection & { __args?: {data?: (ViewFieldCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateViewField?: (ViewFieldGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (ViewFieldUpdateInput | null)} })
    deleteViewField?: (ViewFieldGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateViewFields?: (ViewFieldGenqlSelection & { __args?: {data?: (ViewFieldUpdateInput | null), filter?: (ViewFieldFilterInput | null)} })
    deleteViewFields?: (ViewFieldGenqlSelection & { __args?: {filter?: (ViewFieldFilterInput | null)} })
    destroyViewField?: (ViewFieldGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyViewFields?: (ViewFieldGenqlSelection & { __args?: {filter?: (ViewFieldFilterInput | null)} })
    restoreViewField?: (ViewFieldGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreViewFields?: (ViewFieldGenqlSelection & { __args?: {filter?: (ViewFieldFilterInput | null)} })
    createViewFilterGroups?: (ViewFilterGroupGenqlSelection & { __args?: {data?: (ViewFilterGroupCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args?: {data?: (ViewFilterGroupCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (ViewFilterGroupUpdateInput | null)} })
    deleteViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateViewFilterGroups?: (ViewFilterGroupGenqlSelection & { __args?: {data?: (ViewFilterGroupUpdateInput | null), filter?: (ViewFilterGroupFilterInput | null)} })
    deleteViewFilterGroups?: (ViewFilterGroupGenqlSelection & { __args?: {filter?: (ViewFilterGroupFilterInput | null)} })
    destroyViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyViewFilterGroups?: (ViewFilterGroupGenqlSelection & { __args?: {filter?: (ViewFilterGroupFilterInput | null)} })
    restoreViewFilterGroup?: (ViewFilterGroupGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreViewFilterGroups?: (ViewFilterGroupGenqlSelection & { __args?: {filter?: (ViewFilterGroupFilterInput | null)} })
    createViewGroups?: (ViewGroupGenqlSelection & { __args?: {data?: (ViewGroupCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createViewGroup?: (ViewGroupGenqlSelection & { __args?: {data?: (ViewGroupCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateViewGroup?: (ViewGroupGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (ViewGroupUpdateInput | null)} })
    deleteViewGroup?: (ViewGroupGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateViewGroups?: (ViewGroupGenqlSelection & { __args?: {data?: (ViewGroupUpdateInput | null), filter?: (ViewGroupFilterInput | null)} })
    deleteViewGroups?: (ViewGroupGenqlSelection & { __args?: {filter?: (ViewGroupFilterInput | null)} })
    destroyViewGroup?: (ViewGroupGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyViewGroups?: (ViewGroupGenqlSelection & { __args?: {filter?: (ViewGroupFilterInput | null)} })
    restoreViewGroup?: (ViewGroupGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreViewGroups?: (ViewGroupGenqlSelection & { __args?: {filter?: (ViewGroupFilterInput | null)} })
    createViewFilters?: (ViewFilterGenqlSelection & { __args?: {data?: (ViewFilterCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createViewFilter?: (ViewFilterGenqlSelection & { __args?: {data?: (ViewFilterCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateViewFilter?: (ViewFilterGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (ViewFilterUpdateInput | null)} })
    deleteViewFilter?: (ViewFilterGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateViewFilters?: (ViewFilterGenqlSelection & { __args?: {data?: (ViewFilterUpdateInput | null), filter?: (ViewFilterFilterInput | null)} })
    deleteViewFilters?: (ViewFilterGenqlSelection & { __args?: {filter?: (ViewFilterFilterInput | null)} })
    destroyViewFilter?: (ViewFilterGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyViewFilters?: (ViewFilterGenqlSelection & { __args?: {filter?: (ViewFilterFilterInput | null)} })
    restoreViewFilter?: (ViewFilterGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreViewFilters?: (ViewFilterGenqlSelection & { __args?: {filter?: (ViewFilterFilterInput | null)} })
    createViewSorts?: (ViewSortGenqlSelection & { __args?: {data?: (ViewSortCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createViewSort?: (ViewSortGenqlSelection & { __args?: {data?: (ViewSortCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateViewSort?: (ViewSortGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (ViewSortUpdateInput | null)} })
    deleteViewSort?: (ViewSortGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateViewSorts?: (ViewSortGenqlSelection & { __args?: {data?: (ViewSortUpdateInput | null), filter?: (ViewSortFilterInput | null)} })
    deleteViewSorts?: (ViewSortGenqlSelection & { __args?: {filter?: (ViewSortFilterInput | null)} })
    destroyViewSort?: (ViewSortGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyViewSorts?: (ViewSortGenqlSelection & { __args?: {filter?: (ViewSortFilterInput | null)} })
    restoreViewSort?: (ViewSortGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreViewSorts?: (ViewSortGenqlSelection & { __args?: {filter?: (ViewSortFilterInput | null)} })
    createViews?: (ViewGenqlSelection & { __args?: {data?: (ViewCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createView?: (ViewGenqlSelection & { __args?: {data?: (ViewCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateView?: (ViewGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (ViewUpdateInput | null)} })
    deleteView?: (ViewGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateViews?: (ViewGenqlSelection & { __args?: {data?: (ViewUpdateInput | null), filter?: (ViewFilterInput | null)} })
    deleteViews?: (ViewGenqlSelection & { __args?: {filter?: (ViewFilterInput | null)} })
    destroyView?: (ViewGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyViews?: (ViewGenqlSelection & { __args?: {filter?: (ViewFilterInput | null)} })
    restoreView?: (ViewGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreViews?: (ViewGenqlSelection & { __args?: {filter?: (ViewFilterInput | null)} })
    createWebhooks?: (WebhookGenqlSelection & { __args?: {data?: (WebhookCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createWebhook?: (WebhookGenqlSelection & { __args?: {data?: (WebhookCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateWebhook?: (WebhookGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (WebhookUpdateInput | null)} })
    deleteWebhook?: (WebhookGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateWebhooks?: (WebhookGenqlSelection & { __args?: {data?: (WebhookUpdateInput | null), filter?: (WebhookFilterInput | null)} })
    deleteWebhooks?: (WebhookGenqlSelection & { __args?: {filter?: (WebhookFilterInput | null)} })
    destroyWebhook?: (WebhookGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyWebhooks?: (WebhookGenqlSelection & { __args?: {filter?: (WebhookFilterInput | null)} })
    restoreWebhook?: (WebhookGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreWebhooks?: (WebhookGenqlSelection & { __args?: {filter?: (WebhookFilterInput | null)} })
    createWorkflows?: (WorkflowGenqlSelection & { __args?: {data?: (WorkflowCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createWorkflow?: (WorkflowGenqlSelection & { __args?: {data?: (WorkflowCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateWorkflow?: (WorkflowGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (WorkflowUpdateInput | null)} })
    deleteWorkflow?: (WorkflowGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateWorkflows?: (WorkflowGenqlSelection & { __args?: {data?: (WorkflowUpdateInput | null), filter?: (WorkflowFilterInput | null)} })
    deleteWorkflows?: (WorkflowGenqlSelection & { __args?: {filter?: (WorkflowFilterInput | null)} })
    destroyWorkflow?: (WorkflowGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyWorkflows?: (WorkflowGenqlSelection & { __args?: {filter?: (WorkflowFilterInput | null)} })
    restoreWorkflow?: (WorkflowGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreWorkflows?: (WorkflowGenqlSelection & { __args?: {filter?: (WorkflowFilterInput | null)} })
    createWorkflowVersions?: (WorkflowVersionGenqlSelection & { __args?: {data?: (WorkflowVersionCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createWorkflowVersion?: (WorkflowVersionGenqlSelection & { __args?: {data?: (WorkflowVersionCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateWorkflowVersion?: (WorkflowVersionGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (WorkflowVersionUpdateInput | null)} })
    deleteWorkflowVersion?: (WorkflowVersionGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateWorkflowVersions?: (WorkflowVersionGenqlSelection & { __args?: {data?: (WorkflowVersionUpdateInput | null), filter?: (WorkflowVersionFilterInput | null)} })
    deleteWorkflowVersions?: (WorkflowVersionGenqlSelection & { __args?: {filter?: (WorkflowVersionFilterInput | null)} })
    destroyWorkflowVersion?: (WorkflowVersionGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyWorkflowVersions?: (WorkflowVersionGenqlSelection & { __args?: {filter?: (WorkflowVersionFilterInput | null)} })
    restoreWorkflowVersion?: (WorkflowVersionGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreWorkflowVersions?: (WorkflowVersionGenqlSelection & { __args?: {filter?: (WorkflowVersionFilterInput | null)} })
    createWorkflowRuns?: (WorkflowRunGenqlSelection & { __args?: {data?: (WorkflowRunCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createWorkflowRun?: (WorkflowRunGenqlSelection & { __args?: {data?: (WorkflowRunCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateWorkflowRun?: (WorkflowRunGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (WorkflowRunUpdateInput | null)} })
    deleteWorkflowRun?: (WorkflowRunGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateWorkflowRuns?: (WorkflowRunGenqlSelection & { __args?: {data?: (WorkflowRunUpdateInput | null), filter?: (WorkflowRunFilterInput | null)} })
    deleteWorkflowRuns?: (WorkflowRunGenqlSelection & { __args?: {filter?: (WorkflowRunFilterInput | null)} })
    destroyWorkflowRun?: (WorkflowRunGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyWorkflowRuns?: (WorkflowRunGenqlSelection & { __args?: {filter?: (WorkflowRunFilterInput | null)} })
    restoreWorkflowRun?: (WorkflowRunGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreWorkflowRuns?: (WorkflowRunGenqlSelection & { __args?: {filter?: (WorkflowRunFilterInput | null)} })
    createWorkflowAutomatedTriggers?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {data?: (WorkflowAutomatedTriggerCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createWorkflowAutomatedTrigger?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {data?: (WorkflowAutomatedTriggerCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateWorkflowAutomatedTrigger?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (WorkflowAutomatedTriggerUpdateInput | null)} })
    deleteWorkflowAutomatedTrigger?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateWorkflowAutomatedTriggers?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {data?: (WorkflowAutomatedTriggerUpdateInput | null), filter?: (WorkflowAutomatedTriggerFilterInput | null)} })
    deleteWorkflowAutomatedTriggers?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {filter?: (WorkflowAutomatedTriggerFilterInput | null)} })
    destroyWorkflowAutomatedTrigger?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyWorkflowAutomatedTriggers?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {filter?: (WorkflowAutomatedTriggerFilterInput | null)} })
    restoreWorkflowAutomatedTrigger?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreWorkflowAutomatedTriggers?: (WorkflowAutomatedTriggerGenqlSelection & { __args?: {filter?: (WorkflowAutomatedTriggerFilterInput | null)} })
    createWorkspaceMembers?: (WorkspaceMemberGenqlSelection & { __args?: {data?: (WorkspaceMemberCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createWorkspaceMember?: (WorkspaceMemberGenqlSelection & { __args?: {data?: (WorkspaceMemberCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateWorkspaceMember?: (WorkspaceMemberGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (WorkspaceMemberUpdateInput | null)} })
    deleteWorkspaceMember?: (WorkspaceMemberGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateWorkspaceMembers?: (WorkspaceMemberGenqlSelection & { __args?: {data?: (WorkspaceMemberUpdateInput | null), filter?: (WorkspaceMemberFilterInput | null)} })
    deleteWorkspaceMembers?: (WorkspaceMemberGenqlSelection & { __args?: {filter?: (WorkspaceMemberFilterInput | null)} })
    destroyWorkspaceMember?: (WorkspaceMemberGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyWorkspaceMembers?: (WorkspaceMemberGenqlSelection & { __args?: {filter?: (WorkspaceMemberFilterInput | null)} })
    restoreWorkspaceMember?: (WorkspaceMemberGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreWorkspaceMembers?: (WorkspaceMemberGenqlSelection & { __args?: {filter?: (WorkspaceMemberFilterInput | null)} })
    createNotes?: (NoteGenqlSelection & { __args?: {data?: (NoteCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createNote?: (NoteGenqlSelection & { __args?: {data?: (NoteCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateNote?: (NoteGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (NoteUpdateInput | null)} })
    deleteNote?: (NoteGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateNotes?: (NoteGenqlSelection & { __args?: {data?: (NoteUpdateInput | null), filter?: (NoteFilterInput | null)} })
    deleteNotes?: (NoteGenqlSelection & { __args?: {filter?: (NoteFilterInput | null)} })
    destroyNote?: (NoteGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyNotes?: (NoteGenqlSelection & { __args?: {filter?: (NoteFilterInput | null)} })
    restoreNote?: (NoteGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreNotes?: (NoteGenqlSelection & { __args?: {filter?: (NoteFilterInput | null)} })
    createTaskTargets?: (TaskTargetGenqlSelection & { __args?: {data?: (TaskTargetCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createTaskTarget?: (TaskTargetGenqlSelection & { __args?: {data?: (TaskTargetCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateTaskTarget?: (TaskTargetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (TaskTargetUpdateInput | null)} })
    deleteTaskTarget?: (TaskTargetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateTaskTargets?: (TaskTargetGenqlSelection & { __args?: {data?: (TaskTargetUpdateInput | null), filter?: (TaskTargetFilterInput | null)} })
    deleteTaskTargets?: (TaskTargetGenqlSelection & { __args?: {filter?: (TaskTargetFilterInput | null)} })
    destroyTaskTarget?: (TaskTargetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyTaskTargets?: (TaskTargetGenqlSelection & { __args?: {filter?: (TaskTargetFilterInput | null)} })
    restoreTaskTarget?: (TaskTargetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreTaskTargets?: (TaskTargetGenqlSelection & { __args?: {filter?: (TaskTargetFilterInput | null)} })
    createMessageThreads?: (MessageThreadGenqlSelection & { __args?: {data?: (MessageThreadCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createMessageThread?: (MessageThreadGenqlSelection & { __args?: {data?: (MessageThreadCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateMessageThread?: (MessageThreadGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (MessageThreadUpdateInput | null)} })
    deleteMessageThread?: (MessageThreadGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateMessageThreads?: (MessageThreadGenqlSelection & { __args?: {data?: (MessageThreadUpdateInput | null), filter?: (MessageThreadFilterInput | null)} })
    deleteMessageThreads?: (MessageThreadGenqlSelection & { __args?: {filter?: (MessageThreadFilterInput | null)} })
    destroyMessageThread?: (MessageThreadGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyMessageThreads?: (MessageThreadGenqlSelection & { __args?: {filter?: (MessageThreadFilterInput | null)} })
    restoreMessageThread?: (MessageThreadGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreMessageThreads?: (MessageThreadGenqlSelection & { __args?: {filter?: (MessageThreadFilterInput | null)} })
    createMessages?: (MessageGenqlSelection & { __args?: {data?: (MessageCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createMessage?: (MessageGenqlSelection & { __args?: {data?: (MessageCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateMessage?: (MessageGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (MessageUpdateInput | null)} })
    deleteMessage?: (MessageGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateMessages?: (MessageGenqlSelection & { __args?: {data?: (MessageUpdateInput | null), filter?: (MessageFilterInput | null)} })
    deleteMessages?: (MessageGenqlSelection & { __args?: {filter?: (MessageFilterInput | null)} })
    destroyMessage?: (MessageGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyMessages?: (MessageGenqlSelection & { __args?: {filter?: (MessageFilterInput | null)} })
    restoreMessage?: (MessageGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreMessages?: (MessageGenqlSelection & { __args?: {filter?: (MessageFilterInput | null)} })
    createMessageChannels?: (MessageChannelGenqlSelection & { __args?: {data?: (MessageChannelCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createMessageChannel?: (MessageChannelGenqlSelection & { __args?: {data?: (MessageChannelCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateMessageChannel?: (MessageChannelGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (MessageChannelUpdateInput | null)} })
    deleteMessageChannel?: (MessageChannelGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateMessageChannels?: (MessageChannelGenqlSelection & { __args?: {data?: (MessageChannelUpdateInput | null), filter?: (MessageChannelFilterInput | null)} })
    deleteMessageChannels?: (MessageChannelGenqlSelection & { __args?: {filter?: (MessageChannelFilterInput | null)} })
    destroyMessageChannel?: (MessageChannelGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyMessageChannels?: (MessageChannelGenqlSelection & { __args?: {filter?: (MessageChannelFilterInput | null)} })
    restoreMessageChannel?: (MessageChannelGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreMessageChannels?: (MessageChannelGenqlSelection & { __args?: {filter?: (MessageChannelFilterInput | null)} })
    createMessageParticipants?: (MessageParticipantGenqlSelection & { __args?: {data?: (MessageParticipantCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createMessageParticipant?: (MessageParticipantGenqlSelection & { __args?: {data?: (MessageParticipantCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateMessageParticipant?: (MessageParticipantGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (MessageParticipantUpdateInput | null)} })
    deleteMessageParticipant?: (MessageParticipantGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateMessageParticipants?: (MessageParticipantGenqlSelection & { __args?: {data?: (MessageParticipantUpdateInput | null), filter?: (MessageParticipantFilterInput | null)} })
    deleteMessageParticipants?: (MessageParticipantGenqlSelection & { __args?: {filter?: (MessageParticipantFilterInput | null)} })
    destroyMessageParticipant?: (MessageParticipantGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyMessageParticipants?: (MessageParticipantGenqlSelection & { __args?: {filter?: (MessageParticipantFilterInput | null)} })
    restoreMessageParticipant?: (MessageParticipantGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreMessageParticipants?: (MessageParticipantGenqlSelection & { __args?: {filter?: (MessageParticipantFilterInput | null)} })
    createMessageFolders?: (MessageFolderGenqlSelection & { __args?: {data?: (MessageFolderCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createMessageFolder?: (MessageFolderGenqlSelection & { __args?: {data?: (MessageFolderCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateMessageFolder?: (MessageFolderGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (MessageFolderUpdateInput | null)} })
    deleteMessageFolder?: (MessageFolderGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateMessageFolders?: (MessageFolderGenqlSelection & { __args?: {data?: (MessageFolderUpdateInput | null), filter?: (MessageFolderFilterInput | null)} })
    deleteMessageFolders?: (MessageFolderGenqlSelection & { __args?: {filter?: (MessageFolderFilterInput | null)} })
    destroyMessageFolder?: (MessageFolderGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyMessageFolders?: (MessageFolderGenqlSelection & { __args?: {filter?: (MessageFolderFilterInput | null)} })
    restoreMessageFolder?: (MessageFolderGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreMessageFolders?: (MessageFolderGenqlSelection & { __args?: {filter?: (MessageFolderFilterInput | null)} })
    createMessageChannelMessageAssociations?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {data?: (MessageChannelMessageAssociationCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createMessageChannelMessageAssociation?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {data?: (MessageChannelMessageAssociationCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateMessageChannelMessageAssociation?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (MessageChannelMessageAssociationUpdateInput | null)} })
    deleteMessageChannelMessageAssociation?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateMessageChannelMessageAssociations?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {data?: (MessageChannelMessageAssociationUpdateInput | null), filter?: (MessageChannelMessageAssociationFilterInput | null)} })
    deleteMessageChannelMessageAssociations?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {filter?: (MessageChannelMessageAssociationFilterInput | null)} })
    destroyMessageChannelMessageAssociation?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyMessageChannelMessageAssociations?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {filter?: (MessageChannelMessageAssociationFilterInput | null)} })
    restoreMessageChannelMessageAssociation?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreMessageChannelMessageAssociations?: (MessageChannelMessageAssociationGenqlSelection & { __args?: {filter?: (MessageChannelMessageAssociationFilterInput | null)} })
    createNoteTargets?: (NoteTargetGenqlSelection & { __args?: {data?: (NoteTargetCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createNoteTarget?: (NoteTargetGenqlSelection & { __args?: {data?: (NoteTargetCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateNoteTarget?: (NoteTargetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (NoteTargetUpdateInput | null)} })
    deleteNoteTarget?: (NoteTargetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateNoteTargets?: (NoteTargetGenqlSelection & { __args?: {data?: (NoteTargetUpdateInput | null), filter?: (NoteTargetFilterInput | null)} })
    deleteNoteTargets?: (NoteTargetGenqlSelection & { __args?: {filter?: (NoteTargetFilterInput | null)} })
    destroyNoteTarget?: (NoteTargetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyNoteTargets?: (NoteTargetGenqlSelection & { __args?: {filter?: (NoteTargetFilterInput | null)} })
    restoreNoteTarget?: (NoteTargetGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreNoteTargets?: (NoteTargetGenqlSelection & { __args?: {filter?: (NoteTargetFilterInput | null)} })
    createOpportunities?: (OpportunityGenqlSelection & { __args?: {data?: (OpportunityCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createOpportunity?: (OpportunityGenqlSelection & { __args?: {data?: (OpportunityCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateOpportunity?: (OpportunityGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (OpportunityUpdateInput | null)} })
    deleteOpportunity?: (OpportunityGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateOpportunities?: (OpportunityGenqlSelection & { __args?: {data?: (OpportunityUpdateInput | null), filter?: (OpportunityFilterInput | null)} })
    deleteOpportunities?: (OpportunityGenqlSelection & { __args?: {filter?: (OpportunityFilterInput | null)} })
    destroyOpportunity?: (OpportunityGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyOpportunities?: (OpportunityGenqlSelection & { __args?: {filter?: (OpportunityFilterInput | null)} })
    restoreOpportunity?: (OpportunityGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreOpportunities?: (OpportunityGenqlSelection & { __args?: {filter?: (OpportunityFilterInput | null)} })
    createPeople?: (PersonGenqlSelection & { __args?: {data?: (PersonCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createPerson?: (PersonGenqlSelection & { __args?: {data?: (PersonCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updatePerson?: (PersonGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (PersonUpdateInput | null)} })
    deletePerson?: (PersonGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updatePeople?: (PersonGenqlSelection & { __args?: {data?: (PersonUpdateInput | null), filter?: (PersonFilterInput | null)} })
    deletePeople?: (PersonGenqlSelection & { __args?: {filter?: (PersonFilterInput | null)} })
    destroyPerson?: (PersonGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyPeople?: (PersonGenqlSelection & { __args?: {filter?: (PersonFilterInput | null)} })
    restorePerson?: (PersonGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restorePeople?: (PersonGenqlSelection & { __args?: {filter?: (PersonFilterInput | null)} })
    createTasks?: (TaskGenqlSelection & { __args?: {data?: (TaskCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createTask?: (TaskGenqlSelection & { __args?: {data?: (TaskCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateTask?: (TaskGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (TaskUpdateInput | null)} })
    deleteTask?: (TaskGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateTasks?: (TaskGenqlSelection & { __args?: {data?: (TaskUpdateInput | null), filter?: (TaskFilterInput | null)} })
    deleteTasks?: (TaskGenqlSelection & { __args?: {filter?: (TaskFilterInput | null)} })
    destroyTask?: (TaskGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyTasks?: (TaskGenqlSelection & { __args?: {filter?: (TaskFilterInput | null)} })
    restoreTask?: (TaskGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreTasks?: (TaskGenqlSelection & { __args?: {filter?: (TaskFilterInput | null)} })
    createRockets?: (RocketGenqlSelection & { __args?: {data?: (RocketCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createRocket?: (RocketGenqlSelection & { __args?: {data?: (RocketCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateRocket?: (RocketGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (RocketUpdateInput | null)} })
    deleteRocket?: (RocketGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateRockets?: (RocketGenqlSelection & { __args?: {data?: (RocketUpdateInput | null), filter?: (RocketFilterInput | null)} })
    deleteRockets?: (RocketGenqlSelection & { __args?: {filter?: (RocketFilterInput | null)} })
    destroyRocket?: (RocketGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroyRockets?: (RocketGenqlSelection & { __args?: {filter?: (RocketFilterInput | null)} })
    restoreRocket?: (RocketGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreRockets?: (RocketGenqlSelection & { __args?: {filter?: (RocketFilterInput | null)} })
    createSurveyResults?: (SurveyResultGenqlSelection & { __args?: {data?: (SurveyResultCreateInput[] | null), upsert?: (Scalars['Boolean'] | null)} })
    createSurveyResult?: (SurveyResultGenqlSelection & { __args?: {data?: (SurveyResultCreateInput | null), upsert?: (Scalars['Boolean'] | null)} })
    updateSurveyResult?: (SurveyResultGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null), data?: (SurveyResultUpdateInput | null)} })
    deleteSurveyResult?: (SurveyResultGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    updateSurveyResults?: (SurveyResultGenqlSelection & { __args?: {data?: (SurveyResultUpdateInput | null), filter?: (SurveyResultFilterInput | null)} })
    deleteSurveyResults?: (SurveyResultGenqlSelection & { __args?: {filter?: (SurveyResultFilterInput | null)} })
    destroySurveyResult?: (SurveyResultGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    destroySurveyResults?: (SurveyResultGenqlSelection & { __args?: {filter?: (SurveyResultFilterInput | null)} })
    restoreSurveyResult?: (SurveyResultGenqlSelection & { __args?: {id?: (Scalars['UUID'] | null)} })
    restoreSurveyResults?: (SurveyResultGenqlSelection & { __args?: {filter?: (SurveyResultFilterInput | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Links_possibleTypes: string[] = ['Links']
    export const isLinks = (obj?: { __typename?: any } | null): obj is Links => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLinks"')
      return Links_possibleTypes.includes(obj.__typename)
    }
    


    const Currency_possibleTypes: string[] = ['Currency']
    export const isCurrency = (obj?: { __typename?: any } | null): obj is Currency => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCurrency"')
      return Currency_possibleTypes.includes(obj.__typename)
    }
    


    const FullName_possibleTypes: string[] = ['FullName']
    export const isFullName = (obj?: { __typename?: any } | null): obj is FullName => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFullName"')
      return FullName_possibleTypes.includes(obj.__typename)
    }
    


    const Address_possibleTypes: string[] = ['Address']
    export const isAddress = (obj?: { __typename?: any } | null): obj is Address => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAddress"')
      return Address_possibleTypes.includes(obj.__typename)
    }
    


    const Actor_possibleTypes: string[] = ['Actor']
    export const isActor = (obj?: { __typename?: any } | null): obj is Actor => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isActor"')
      return Actor_possibleTypes.includes(obj.__typename)
    }
    


    const Emails_possibleTypes: string[] = ['Emails']
    export const isEmails = (obj?: { __typename?: any } | null): obj is Emails => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEmails"')
      return Emails_possibleTypes.includes(obj.__typename)
    }
    


    const Phones_possibleTypes: string[] = ['Phones']
    export const isPhones = (obj?: { __typename?: any } | null): obj is Phones => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPhones"')
      return Phones_possibleTypes.includes(obj.__typename)
    }
    


    const RichTextV2_possibleTypes: string[] = ['RichTextV2']
    export const isRichTextV2 = (obj?: { __typename?: any } | null): obj is RichTextV2 => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRichTextV2"')
      return RichTextV2_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKey_possibleTypes: string[] = ['ApiKey']
    export const isApiKey = (obj?: { __typename?: any } | null): obj is ApiKey => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKey"')
      return ApiKey_possibleTypes.includes(obj.__typename)
    }
    


    const Attachment_possibleTypes: string[] = ['Attachment']
    export const isAttachment = (obj?: { __typename?: any } | null): obj is Attachment => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAttachment"')
      return Attachment_possibleTypes.includes(obj.__typename)
    }
    


    const Pet_possibleTypes: string[] = ['Pet']
    export const isPet = (obj?: { __typename?: any } | null): obj is Pet => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPet"')
      return Pet_possibleTypes.includes(obj.__typename)
    }
    


    const Blocklist_possibleTypes: string[] = ['Blocklist']
    export const isBlocklist = (obj?: { __typename?: any } | null): obj is Blocklist => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBlocklist"')
      return Blocklist_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarEvent_possibleTypes: string[] = ['CalendarEvent']
    export const isCalendarEvent = (obj?: { __typename?: any } | null): obj is CalendarEvent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarEvent"')
      return CalendarEvent_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarChannel_possibleTypes: string[] = ['CalendarChannel']
    export const isCalendarChannel = (obj?: { __typename?: any } | null): obj is CalendarChannel => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarChannel"')
      return CalendarChannel_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarChannelEventAssociation_possibleTypes: string[] = ['CalendarChannelEventAssociation']
    export const isCalendarChannelEventAssociation = (obj?: { __typename?: any } | null): obj is CalendarChannelEventAssociation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarChannelEventAssociation"')
      return CalendarChannelEventAssociation_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarEventParticipant_possibleTypes: string[] = ['CalendarEventParticipant']
    export const isCalendarEventParticipant = (obj?: { __typename?: any } | null): obj is CalendarEventParticipant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarEventParticipant"')
      return CalendarEventParticipant_possibleTypes.includes(obj.__typename)
    }
    


    const Company_possibleTypes: string[] = ['Company']
    export const isCompany = (obj?: { __typename?: any } | null): obj is Company => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCompany"')
      return Company_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedAccount_possibleTypes: string[] = ['ConnectedAccount']
    export const isConnectedAccount = (obj?: { __typename?: any } | null): obj is ConnectedAccount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedAccount"')
      return ConnectedAccount_possibleTypes.includes(obj.__typename)
    }
    


    const Favorite_possibleTypes: string[] = ['Favorite']
    export const isFavorite = (obj?: { __typename?: any } | null): obj is Favorite => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFavorite"')
      return Favorite_possibleTypes.includes(obj.__typename)
    }
    


    const FavoriteFolder_possibleTypes: string[] = ['FavoriteFolder']
    export const isFavoriteFolder = (obj?: { __typename?: any } | null): obj is FavoriteFolder => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFavoriteFolder"')
      return FavoriteFolder_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineActivity_possibleTypes: string[] = ['TimelineActivity']
    export const isTimelineActivity = (obj?: { __typename?: any } | null): obj is TimelineActivity => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineActivity"')
      return TimelineActivity_possibleTypes.includes(obj.__typename)
    }
    


    const ViewField_possibleTypes: string[] = ['ViewField']
    export const isViewField = (obj?: { __typename?: any } | null): obj is ViewField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewField"')
      return ViewField_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilterGroup_possibleTypes: string[] = ['ViewFilterGroup']
    export const isViewFilterGroup = (obj?: { __typename?: any } | null): obj is ViewFilterGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilterGroup"')
      return ViewFilterGroup_possibleTypes.includes(obj.__typename)
    }
    


    const ViewGroup_possibleTypes: string[] = ['ViewGroup']
    export const isViewGroup = (obj?: { __typename?: any } | null): obj is ViewGroup => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewGroup"')
      return ViewGroup_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilter_possibleTypes: string[] = ['ViewFilter']
    export const isViewFilter = (obj?: { __typename?: any } | null): obj is ViewFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilter"')
      return ViewFilter_possibleTypes.includes(obj.__typename)
    }
    


    const ViewSort_possibleTypes: string[] = ['ViewSort']
    export const isViewSort = (obj?: { __typename?: any } | null): obj is ViewSort => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewSort"')
      return ViewSort_possibleTypes.includes(obj.__typename)
    }
    


    const View_possibleTypes: string[] = ['View']
    export const isView = (obj?: { __typename?: any } | null): obj is View => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isView"')
      return View_possibleTypes.includes(obj.__typename)
    }
    


    const Webhook_possibleTypes: string[] = ['Webhook']
    export const isWebhook = (obj?: { __typename?: any } | null): obj is Webhook => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWebhook"')
      return Webhook_possibleTypes.includes(obj.__typename)
    }
    


    const Workflow_possibleTypes: string[] = ['Workflow']
    export const isWorkflow = (obj?: { __typename?: any } | null): obj is Workflow => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflow"')
      return Workflow_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowVersion_possibleTypes: string[] = ['WorkflowVersion']
    export const isWorkflowVersion = (obj?: { __typename?: any } | null): obj is WorkflowVersion => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowVersion"')
      return WorkflowVersion_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowRun_possibleTypes: string[] = ['WorkflowRun']
    export const isWorkflowRun = (obj?: { __typename?: any } | null): obj is WorkflowRun => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowRun"')
      return WorkflowRun_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowAutomatedTrigger_possibleTypes: string[] = ['WorkflowAutomatedTrigger']
    export const isWorkflowAutomatedTrigger = (obj?: { __typename?: any } | null): obj is WorkflowAutomatedTrigger => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowAutomatedTrigger"')
      return WorkflowAutomatedTrigger_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceMember_possibleTypes: string[] = ['WorkspaceMember']
    export const isWorkspaceMember = (obj?: { __typename?: any } | null): obj is WorkspaceMember => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceMember"')
      return WorkspaceMember_possibleTypes.includes(obj.__typename)
    }
    


    const Note_possibleTypes: string[] = ['Note']
    export const isNote = (obj?: { __typename?: any } | null): obj is Note => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNote"')
      return Note_possibleTypes.includes(obj.__typename)
    }
    


    const TaskTarget_possibleTypes: string[] = ['TaskTarget']
    export const isTaskTarget = (obj?: { __typename?: any } | null): obj is TaskTarget => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTaskTarget"')
      return TaskTarget_possibleTypes.includes(obj.__typename)
    }
    


    const MessageThread_possibleTypes: string[] = ['MessageThread']
    export const isMessageThread = (obj?: { __typename?: any } | null): obj is MessageThread => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageThread"')
      return MessageThread_possibleTypes.includes(obj.__typename)
    }
    


    const Message_possibleTypes: string[] = ['Message']
    export const isMessage = (obj?: { __typename?: any } | null): obj is Message => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessage"')
      return Message_possibleTypes.includes(obj.__typename)
    }
    


    const MessageChannel_possibleTypes: string[] = ['MessageChannel']
    export const isMessageChannel = (obj?: { __typename?: any } | null): obj is MessageChannel => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageChannel"')
      return MessageChannel_possibleTypes.includes(obj.__typename)
    }
    


    const MessageParticipant_possibleTypes: string[] = ['MessageParticipant']
    export const isMessageParticipant = (obj?: { __typename?: any } | null): obj is MessageParticipant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageParticipant"')
      return MessageParticipant_possibleTypes.includes(obj.__typename)
    }
    


    const MessageFolder_possibleTypes: string[] = ['MessageFolder']
    export const isMessageFolder = (obj?: { __typename?: any } | null): obj is MessageFolder => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageFolder"')
      return MessageFolder_possibleTypes.includes(obj.__typename)
    }
    


    const MessageChannelMessageAssociation_possibleTypes: string[] = ['MessageChannelMessageAssociation']
    export const isMessageChannelMessageAssociation = (obj?: { __typename?: any } | null): obj is MessageChannelMessageAssociation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageChannelMessageAssociation"')
      return MessageChannelMessageAssociation_possibleTypes.includes(obj.__typename)
    }
    


    const NoteTarget_possibleTypes: string[] = ['NoteTarget']
    export const isNoteTarget = (obj?: { __typename?: any } | null): obj is NoteTarget => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNoteTarget"')
      return NoteTarget_possibleTypes.includes(obj.__typename)
    }
    


    const Opportunity_possibleTypes: string[] = ['Opportunity']
    export const isOpportunity = (obj?: { __typename?: any } | null): obj is Opportunity => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOpportunity"')
      return Opportunity_possibleTypes.includes(obj.__typename)
    }
    


    const Person_possibleTypes: string[] = ['Person']
    export const isPerson = (obj?: { __typename?: any } | null): obj is Person => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPerson"')
      return Person_possibleTypes.includes(obj.__typename)
    }
    


    const Task_possibleTypes: string[] = ['Task']
    export const isTask = (obj?: { __typename?: any } | null): obj is Task => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTask"')
      return Task_possibleTypes.includes(obj.__typename)
    }
    


    const Rocket_possibleTypes: string[] = ['Rocket']
    export const isRocket = (obj?: { __typename?: any } | null): obj is Rocket => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRocket"')
      return Rocket_possibleTypes.includes(obj.__typename)
    }
    


    const SurveyResult_possibleTypes: string[] = ['SurveyResult']
    export const isSurveyResult = (obj?: { __typename?: any } | null): obj is SurveyResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSurveyResult"')
      return SurveyResult_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKeyEdge_possibleTypes: string[] = ['ApiKeyEdge']
    export const isApiKeyEdge = (obj?: { __typename?: any } | null): obj is ApiKeyEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKeyEdge"')
      return ApiKeyEdge_possibleTypes.includes(obj.__typename)
    }
    


    const AttachmentEdge_possibleTypes: string[] = ['AttachmentEdge']
    export const isAttachmentEdge = (obj?: { __typename?: any } | null): obj is AttachmentEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAttachmentEdge"')
      return AttachmentEdge_possibleTypes.includes(obj.__typename)
    }
    


    const PetEdge_possibleTypes: string[] = ['PetEdge']
    export const isPetEdge = (obj?: { __typename?: any } | null): obj is PetEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPetEdge"')
      return PetEdge_possibleTypes.includes(obj.__typename)
    }
    


    const BlocklistEdge_possibleTypes: string[] = ['BlocklistEdge']
    export const isBlocklistEdge = (obj?: { __typename?: any } | null): obj is BlocklistEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBlocklistEdge"')
      return BlocklistEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarEventEdge_possibleTypes: string[] = ['CalendarEventEdge']
    export const isCalendarEventEdge = (obj?: { __typename?: any } | null): obj is CalendarEventEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarEventEdge"')
      return CalendarEventEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarChannelEdge_possibleTypes: string[] = ['CalendarChannelEdge']
    export const isCalendarChannelEdge = (obj?: { __typename?: any } | null): obj is CalendarChannelEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarChannelEdge"')
      return CalendarChannelEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarChannelEventAssociationEdge_possibleTypes: string[] = ['CalendarChannelEventAssociationEdge']
    export const isCalendarChannelEventAssociationEdge = (obj?: { __typename?: any } | null): obj is CalendarChannelEventAssociationEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarChannelEventAssociationEdge"')
      return CalendarChannelEventAssociationEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarEventParticipantEdge_possibleTypes: string[] = ['CalendarEventParticipantEdge']
    export const isCalendarEventParticipantEdge = (obj?: { __typename?: any } | null): obj is CalendarEventParticipantEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarEventParticipantEdge"')
      return CalendarEventParticipantEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CompanyEdge_possibleTypes: string[] = ['CompanyEdge']
    export const isCompanyEdge = (obj?: { __typename?: any } | null): obj is CompanyEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCompanyEdge"')
      return CompanyEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedAccountEdge_possibleTypes: string[] = ['ConnectedAccountEdge']
    export const isConnectedAccountEdge = (obj?: { __typename?: any } | null): obj is ConnectedAccountEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedAccountEdge"')
      return ConnectedAccountEdge_possibleTypes.includes(obj.__typename)
    }
    


    const FavoriteEdge_possibleTypes: string[] = ['FavoriteEdge']
    export const isFavoriteEdge = (obj?: { __typename?: any } | null): obj is FavoriteEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFavoriteEdge"')
      return FavoriteEdge_possibleTypes.includes(obj.__typename)
    }
    


    const FavoriteFolderEdge_possibleTypes: string[] = ['FavoriteFolderEdge']
    export const isFavoriteFolderEdge = (obj?: { __typename?: any } | null): obj is FavoriteFolderEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFavoriteFolderEdge"')
      return FavoriteFolderEdge_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineActivityEdge_possibleTypes: string[] = ['TimelineActivityEdge']
    export const isTimelineActivityEdge = (obj?: { __typename?: any } | null): obj is TimelineActivityEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineActivityEdge"')
      return TimelineActivityEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFieldEdge_possibleTypes: string[] = ['ViewFieldEdge']
    export const isViewFieldEdge = (obj?: { __typename?: any } | null): obj is ViewFieldEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFieldEdge"')
      return ViewFieldEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilterGroupEdge_possibleTypes: string[] = ['ViewFilterGroupEdge']
    export const isViewFilterGroupEdge = (obj?: { __typename?: any } | null): obj is ViewFilterGroupEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilterGroupEdge"')
      return ViewFilterGroupEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ViewGroupEdge_possibleTypes: string[] = ['ViewGroupEdge']
    export const isViewGroupEdge = (obj?: { __typename?: any } | null): obj is ViewGroupEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewGroupEdge"')
      return ViewGroupEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilterEdge_possibleTypes: string[] = ['ViewFilterEdge']
    export const isViewFilterEdge = (obj?: { __typename?: any } | null): obj is ViewFilterEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilterEdge"')
      return ViewFilterEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ViewSortEdge_possibleTypes: string[] = ['ViewSortEdge']
    export const isViewSortEdge = (obj?: { __typename?: any } | null): obj is ViewSortEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewSortEdge"')
      return ViewSortEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ViewEdge_possibleTypes: string[] = ['ViewEdge']
    export const isViewEdge = (obj?: { __typename?: any } | null): obj is ViewEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewEdge"')
      return ViewEdge_possibleTypes.includes(obj.__typename)
    }
    


    const WebhookEdge_possibleTypes: string[] = ['WebhookEdge']
    export const isWebhookEdge = (obj?: { __typename?: any } | null): obj is WebhookEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWebhookEdge"')
      return WebhookEdge_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowEdge_possibleTypes: string[] = ['WorkflowEdge']
    export const isWorkflowEdge = (obj?: { __typename?: any } | null): obj is WorkflowEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowEdge"')
      return WorkflowEdge_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowVersionEdge_possibleTypes: string[] = ['WorkflowVersionEdge']
    export const isWorkflowVersionEdge = (obj?: { __typename?: any } | null): obj is WorkflowVersionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowVersionEdge"')
      return WorkflowVersionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowRunEdge_possibleTypes: string[] = ['WorkflowRunEdge']
    export const isWorkflowRunEdge = (obj?: { __typename?: any } | null): obj is WorkflowRunEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowRunEdge"')
      return WorkflowRunEdge_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowAutomatedTriggerEdge_possibleTypes: string[] = ['WorkflowAutomatedTriggerEdge']
    export const isWorkflowAutomatedTriggerEdge = (obj?: { __typename?: any } | null): obj is WorkflowAutomatedTriggerEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowAutomatedTriggerEdge"')
      return WorkflowAutomatedTriggerEdge_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceMemberEdge_possibleTypes: string[] = ['WorkspaceMemberEdge']
    export const isWorkspaceMemberEdge = (obj?: { __typename?: any } | null): obj is WorkspaceMemberEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceMemberEdge"')
      return WorkspaceMemberEdge_possibleTypes.includes(obj.__typename)
    }
    


    const NoteEdge_possibleTypes: string[] = ['NoteEdge']
    export const isNoteEdge = (obj?: { __typename?: any } | null): obj is NoteEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNoteEdge"')
      return NoteEdge_possibleTypes.includes(obj.__typename)
    }
    


    const TaskTargetEdge_possibleTypes: string[] = ['TaskTargetEdge']
    export const isTaskTargetEdge = (obj?: { __typename?: any } | null): obj is TaskTargetEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTaskTargetEdge"')
      return TaskTargetEdge_possibleTypes.includes(obj.__typename)
    }
    


    const MessageThreadEdge_possibleTypes: string[] = ['MessageThreadEdge']
    export const isMessageThreadEdge = (obj?: { __typename?: any } | null): obj is MessageThreadEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageThreadEdge"')
      return MessageThreadEdge_possibleTypes.includes(obj.__typename)
    }
    


    const MessageEdge_possibleTypes: string[] = ['MessageEdge']
    export const isMessageEdge = (obj?: { __typename?: any } | null): obj is MessageEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageEdge"')
      return MessageEdge_possibleTypes.includes(obj.__typename)
    }
    


    const MessageChannelEdge_possibleTypes: string[] = ['MessageChannelEdge']
    export const isMessageChannelEdge = (obj?: { __typename?: any } | null): obj is MessageChannelEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageChannelEdge"')
      return MessageChannelEdge_possibleTypes.includes(obj.__typename)
    }
    


    const MessageParticipantEdge_possibleTypes: string[] = ['MessageParticipantEdge']
    export const isMessageParticipantEdge = (obj?: { __typename?: any } | null): obj is MessageParticipantEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageParticipantEdge"')
      return MessageParticipantEdge_possibleTypes.includes(obj.__typename)
    }
    


    const MessageFolderEdge_possibleTypes: string[] = ['MessageFolderEdge']
    export const isMessageFolderEdge = (obj?: { __typename?: any } | null): obj is MessageFolderEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageFolderEdge"')
      return MessageFolderEdge_possibleTypes.includes(obj.__typename)
    }
    


    const MessageChannelMessageAssociationEdge_possibleTypes: string[] = ['MessageChannelMessageAssociationEdge']
    export const isMessageChannelMessageAssociationEdge = (obj?: { __typename?: any } | null): obj is MessageChannelMessageAssociationEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageChannelMessageAssociationEdge"')
      return MessageChannelMessageAssociationEdge_possibleTypes.includes(obj.__typename)
    }
    


    const NoteTargetEdge_possibleTypes: string[] = ['NoteTargetEdge']
    export const isNoteTargetEdge = (obj?: { __typename?: any } | null): obj is NoteTargetEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNoteTargetEdge"')
      return NoteTargetEdge_possibleTypes.includes(obj.__typename)
    }
    


    const OpportunityEdge_possibleTypes: string[] = ['OpportunityEdge']
    export const isOpportunityEdge = (obj?: { __typename?: any } | null): obj is OpportunityEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOpportunityEdge"')
      return OpportunityEdge_possibleTypes.includes(obj.__typename)
    }
    


    const PersonEdge_possibleTypes: string[] = ['PersonEdge']
    export const isPersonEdge = (obj?: { __typename?: any } | null): obj is PersonEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPersonEdge"')
      return PersonEdge_possibleTypes.includes(obj.__typename)
    }
    


    const TaskEdge_possibleTypes: string[] = ['TaskEdge']
    export const isTaskEdge = (obj?: { __typename?: any } | null): obj is TaskEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTaskEdge"')
      return TaskEdge_possibleTypes.includes(obj.__typename)
    }
    


    const RocketEdge_possibleTypes: string[] = ['RocketEdge']
    export const isRocketEdge = (obj?: { __typename?: any } | null): obj is RocketEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRocketEdge"')
      return RocketEdge_possibleTypes.includes(obj.__typename)
    }
    


    const SurveyResultEdge_possibleTypes: string[] = ['SurveyResultEdge']
    export const isSurveyResultEdge = (obj?: { __typename?: any } | null): obj is SurveyResultEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSurveyResultEdge"')
      return SurveyResultEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ApiKeyConnection_possibleTypes: string[] = ['ApiKeyConnection']
    export const isApiKeyConnection = (obj?: { __typename?: any } | null): obj is ApiKeyConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isApiKeyConnection"')
      return ApiKeyConnection_possibleTypes.includes(obj.__typename)
    }
    


    const PageInfo_possibleTypes: string[] = ['PageInfo']
    export const isPageInfo = (obj?: { __typename?: any } | null): obj is PageInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageInfo"')
      return PageInfo_possibleTypes.includes(obj.__typename)
    }
    


    const AttachmentConnection_possibleTypes: string[] = ['AttachmentConnection']
    export const isAttachmentConnection = (obj?: { __typename?: any } | null): obj is AttachmentConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAttachmentConnection"')
      return AttachmentConnection_possibleTypes.includes(obj.__typename)
    }
    


    const PetConnection_possibleTypes: string[] = ['PetConnection']
    export const isPetConnection = (obj?: { __typename?: any } | null): obj is PetConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPetConnection"')
      return PetConnection_possibleTypes.includes(obj.__typename)
    }
    


    const BlocklistConnection_possibleTypes: string[] = ['BlocklistConnection']
    export const isBlocklistConnection = (obj?: { __typename?: any } | null): obj is BlocklistConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBlocklistConnection"')
      return BlocklistConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarEventConnection_possibleTypes: string[] = ['CalendarEventConnection']
    export const isCalendarEventConnection = (obj?: { __typename?: any } | null): obj is CalendarEventConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarEventConnection"')
      return CalendarEventConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarChannelConnection_possibleTypes: string[] = ['CalendarChannelConnection']
    export const isCalendarChannelConnection = (obj?: { __typename?: any } | null): obj is CalendarChannelConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarChannelConnection"')
      return CalendarChannelConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarChannelEventAssociationConnection_possibleTypes: string[] = ['CalendarChannelEventAssociationConnection']
    export const isCalendarChannelEventAssociationConnection = (obj?: { __typename?: any } | null): obj is CalendarChannelEventAssociationConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarChannelEventAssociationConnection"')
      return CalendarChannelEventAssociationConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CalendarEventParticipantConnection_possibleTypes: string[] = ['CalendarEventParticipantConnection']
    export const isCalendarEventParticipantConnection = (obj?: { __typename?: any } | null): obj is CalendarEventParticipantConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCalendarEventParticipantConnection"')
      return CalendarEventParticipantConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CompanyConnection_possibleTypes: string[] = ['CompanyConnection']
    export const isCompanyConnection = (obj?: { __typename?: any } | null): obj is CompanyConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCompanyConnection"')
      return CompanyConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ConnectedAccountConnection_possibleTypes: string[] = ['ConnectedAccountConnection']
    export const isConnectedAccountConnection = (obj?: { __typename?: any } | null): obj is ConnectedAccountConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isConnectedAccountConnection"')
      return ConnectedAccountConnection_possibleTypes.includes(obj.__typename)
    }
    


    const FavoriteConnection_possibleTypes: string[] = ['FavoriteConnection']
    export const isFavoriteConnection = (obj?: { __typename?: any } | null): obj is FavoriteConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFavoriteConnection"')
      return FavoriteConnection_possibleTypes.includes(obj.__typename)
    }
    


    const FavoriteFolderConnection_possibleTypes: string[] = ['FavoriteFolderConnection']
    export const isFavoriteFolderConnection = (obj?: { __typename?: any } | null): obj is FavoriteFolderConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFavoriteFolderConnection"')
      return FavoriteFolderConnection_possibleTypes.includes(obj.__typename)
    }
    


    const TimelineActivityConnection_possibleTypes: string[] = ['TimelineActivityConnection']
    export const isTimelineActivityConnection = (obj?: { __typename?: any } | null): obj is TimelineActivityConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTimelineActivityConnection"')
      return TimelineActivityConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFieldConnection_possibleTypes: string[] = ['ViewFieldConnection']
    export const isViewFieldConnection = (obj?: { __typename?: any } | null): obj is ViewFieldConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFieldConnection"')
      return ViewFieldConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilterGroupConnection_possibleTypes: string[] = ['ViewFilterGroupConnection']
    export const isViewFilterGroupConnection = (obj?: { __typename?: any } | null): obj is ViewFilterGroupConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilterGroupConnection"')
      return ViewFilterGroupConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ViewGroupConnection_possibleTypes: string[] = ['ViewGroupConnection']
    export const isViewGroupConnection = (obj?: { __typename?: any } | null): obj is ViewGroupConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewGroupConnection"')
      return ViewGroupConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ViewFilterConnection_possibleTypes: string[] = ['ViewFilterConnection']
    export const isViewFilterConnection = (obj?: { __typename?: any } | null): obj is ViewFilterConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewFilterConnection"')
      return ViewFilterConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ViewSortConnection_possibleTypes: string[] = ['ViewSortConnection']
    export const isViewSortConnection = (obj?: { __typename?: any } | null): obj is ViewSortConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewSortConnection"')
      return ViewSortConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ViewConnection_possibleTypes: string[] = ['ViewConnection']
    export const isViewConnection = (obj?: { __typename?: any } | null): obj is ViewConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isViewConnection"')
      return ViewConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WebhookConnection_possibleTypes: string[] = ['WebhookConnection']
    export const isWebhookConnection = (obj?: { __typename?: any } | null): obj is WebhookConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWebhookConnection"')
      return WebhookConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowConnection_possibleTypes: string[] = ['WorkflowConnection']
    export const isWorkflowConnection = (obj?: { __typename?: any } | null): obj is WorkflowConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowConnection"')
      return WorkflowConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowVersionConnection_possibleTypes: string[] = ['WorkflowVersionConnection']
    export const isWorkflowVersionConnection = (obj?: { __typename?: any } | null): obj is WorkflowVersionConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowVersionConnection"')
      return WorkflowVersionConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowRunConnection_possibleTypes: string[] = ['WorkflowRunConnection']
    export const isWorkflowRunConnection = (obj?: { __typename?: any } | null): obj is WorkflowRunConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowRunConnection"')
      return WorkflowRunConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WorkflowAutomatedTriggerConnection_possibleTypes: string[] = ['WorkflowAutomatedTriggerConnection']
    export const isWorkflowAutomatedTriggerConnection = (obj?: { __typename?: any } | null): obj is WorkflowAutomatedTriggerConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkflowAutomatedTriggerConnection"')
      return WorkflowAutomatedTriggerConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WorkspaceMemberConnection_possibleTypes: string[] = ['WorkspaceMemberConnection']
    export const isWorkspaceMemberConnection = (obj?: { __typename?: any } | null): obj is WorkspaceMemberConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWorkspaceMemberConnection"')
      return WorkspaceMemberConnection_possibleTypes.includes(obj.__typename)
    }
    


    const NoteConnection_possibleTypes: string[] = ['NoteConnection']
    export const isNoteConnection = (obj?: { __typename?: any } | null): obj is NoteConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNoteConnection"')
      return NoteConnection_possibleTypes.includes(obj.__typename)
    }
    


    const TaskTargetConnection_possibleTypes: string[] = ['TaskTargetConnection']
    export const isTaskTargetConnection = (obj?: { __typename?: any } | null): obj is TaskTargetConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTaskTargetConnection"')
      return TaskTargetConnection_possibleTypes.includes(obj.__typename)
    }
    


    const MessageThreadConnection_possibleTypes: string[] = ['MessageThreadConnection']
    export const isMessageThreadConnection = (obj?: { __typename?: any } | null): obj is MessageThreadConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageThreadConnection"')
      return MessageThreadConnection_possibleTypes.includes(obj.__typename)
    }
    


    const MessageConnection_possibleTypes: string[] = ['MessageConnection']
    export const isMessageConnection = (obj?: { __typename?: any } | null): obj is MessageConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageConnection"')
      return MessageConnection_possibleTypes.includes(obj.__typename)
    }
    


    const MessageChannelConnection_possibleTypes: string[] = ['MessageChannelConnection']
    export const isMessageChannelConnection = (obj?: { __typename?: any } | null): obj is MessageChannelConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageChannelConnection"')
      return MessageChannelConnection_possibleTypes.includes(obj.__typename)
    }
    


    const MessageParticipantConnection_possibleTypes: string[] = ['MessageParticipantConnection']
    export const isMessageParticipantConnection = (obj?: { __typename?: any } | null): obj is MessageParticipantConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageParticipantConnection"')
      return MessageParticipantConnection_possibleTypes.includes(obj.__typename)
    }
    


    const MessageFolderConnection_possibleTypes: string[] = ['MessageFolderConnection']
    export const isMessageFolderConnection = (obj?: { __typename?: any } | null): obj is MessageFolderConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageFolderConnection"')
      return MessageFolderConnection_possibleTypes.includes(obj.__typename)
    }
    


    const MessageChannelMessageAssociationConnection_possibleTypes: string[] = ['MessageChannelMessageAssociationConnection']
    export const isMessageChannelMessageAssociationConnection = (obj?: { __typename?: any } | null): obj is MessageChannelMessageAssociationConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMessageChannelMessageAssociationConnection"')
      return MessageChannelMessageAssociationConnection_possibleTypes.includes(obj.__typename)
    }
    


    const NoteTargetConnection_possibleTypes: string[] = ['NoteTargetConnection']
    export const isNoteTargetConnection = (obj?: { __typename?: any } | null): obj is NoteTargetConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNoteTargetConnection"')
      return NoteTargetConnection_possibleTypes.includes(obj.__typename)
    }
    


    const OpportunityConnection_possibleTypes: string[] = ['OpportunityConnection']
    export const isOpportunityConnection = (obj?: { __typename?: any } | null): obj is OpportunityConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOpportunityConnection"')
      return OpportunityConnection_possibleTypes.includes(obj.__typename)
    }
    


    const PersonConnection_possibleTypes: string[] = ['PersonConnection']
    export const isPersonConnection = (obj?: { __typename?: any } | null): obj is PersonConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPersonConnection"')
      return PersonConnection_possibleTypes.includes(obj.__typename)
    }
    


    const TaskConnection_possibleTypes: string[] = ['TaskConnection']
    export const isTaskConnection = (obj?: { __typename?: any } | null): obj is TaskConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTaskConnection"')
      return TaskConnection_possibleTypes.includes(obj.__typename)
    }
    


    const RocketConnection_possibleTypes: string[] = ['RocketConnection']
    export const isRocketConnection = (obj?: { __typename?: any } | null): obj is RocketConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRocketConnection"')
      return RocketConnection_possibleTypes.includes(obj.__typename)
    }
    


    const SurveyResultConnection_possibleTypes: string[] = ['SurveyResultConnection']
    export const isSurveyResultConnection = (obj?: { __typename?: any } | null): obj is SurveyResultConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSurveyResultConnection"')
      return SurveyResultConnection_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    

export const enumActorSourceEnum = {
   EMAIL: 'EMAIL' as const,
   CALENDAR: 'CALENDAR' as const,
   WORKFLOW: 'WORKFLOW' as const,
   API: 'API' as const,
   IMPORT: 'IMPORT' as const,
   MANUAL: 'MANUAL' as const,
   SYSTEM: 'SYSTEM' as const,
   WEBHOOK: 'WEBHOOK' as const
}

export const enumPetSpeciesEnum = {
   DOG: 'DOG' as const,
   CAT: 'CAT' as const,
   BIRD: 'BIRD' as const,
   FISH: 'FISH' as const,
   RABBIT: 'RABBIT' as const,
   HAMSTER: 'HAMSTER' as const
}

export const enumPetTraitsEnum = {
   PLAYFUL: 'PLAYFUL' as const,
   FRIENDLY: 'FRIENDLY' as const,
   PROTECTIVE: 'PROTECTIVE' as const,
   SHY: 'SHY' as const,
   BRAVE: 'BRAVE' as const,
   CURIOUS: 'CURIOUS' as const
}

export const enumPetSoundSwagEnum = {
   RATING_1: 'RATING_1' as const,
   RATING_2: 'RATING_2' as const,
   RATING_3: 'RATING_3' as const,
   RATING_4: 'RATING_4' as const,
   RATING_5: 'RATING_5' as const
}

export const enumCalendarChannelSyncStatusEnum = {
   ONGOING: 'ONGOING' as const,
   NOT_SYNCED: 'NOT_SYNCED' as const,
   ACTIVE: 'ACTIVE' as const,
   FAILED_INSUFFICIENT_PERMISSIONS: 'FAILED_INSUFFICIENT_PERMISSIONS' as const,
   FAILED_UNKNOWN: 'FAILED_UNKNOWN' as const
}

export const enumCalendarChannelSyncStageEnum = {
   FULL_CALENDAR_EVENT_LIST_FETCH_PENDING: 'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING' as const,
   PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING: 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING' as const,
   CALENDAR_EVENT_LIST_FETCH_ONGOING: 'CALENDAR_EVENT_LIST_FETCH_ONGOING' as const,
   CALENDAR_EVENTS_IMPORT_PENDING: 'CALENDAR_EVENTS_IMPORT_PENDING' as const,
   CALENDAR_EVENTS_IMPORT_ONGOING: 'CALENDAR_EVENTS_IMPORT_ONGOING' as const,
   FAILED: 'FAILED' as const
}

export const enumCalendarChannelVisibilityEnum = {
   METADATA: 'METADATA' as const,
   SHARE_EVERYTHING: 'SHARE_EVERYTHING' as const
}

export const enumCalendarChannelContactAutoCreationPolicyEnum = {
   AS_PARTICIPANT_AND_ORGANIZER: 'AS_PARTICIPANT_AND_ORGANIZER' as const,
   AS_PARTICIPANT: 'AS_PARTICIPANT' as const,
   AS_ORGANIZER: 'AS_ORGANIZER' as const,
   NONE: 'NONE' as const
}

export const enumCalendarEventParticipantResponseStatusEnum = {
   NEEDS_ACTION: 'NEEDS_ACTION' as const,
   DECLINED: 'DECLINED' as const,
   TENTATIVE: 'TENTATIVE' as const,
   ACCEPTED: 'ACCEPTED' as const
}

export const enumCompanyWorkPolicyEnum = {
   ON_SITE: 'ON_SITE' as const,
   HYBRID: 'HYBRID' as const,
   REMOTE_WORK: 'REMOTE_WORK' as const
}

export const enumViewFieldAggregateOperationEnum = {
   AVG: 'AVG' as const,
   COUNT: 'COUNT' as const,
   MAX: 'MAX' as const,
   MIN: 'MIN' as const,
   SUM: 'SUM' as const,
   COUNT_EMPTY: 'COUNT_EMPTY' as const,
   COUNT_NOT_EMPTY: 'COUNT_NOT_EMPTY' as const,
   COUNT_UNIQUE_VALUES: 'COUNT_UNIQUE_VALUES' as const,
   PERCENTAGE_EMPTY: 'PERCENTAGE_EMPTY' as const,
   PERCENTAGE_NOT_EMPTY: 'PERCENTAGE_NOT_EMPTY' as const,
   COUNT_TRUE: 'COUNT_TRUE' as const,
   COUNT_FALSE: 'COUNT_FALSE' as const
}

export const enumViewFilterGroupLogicalOperatorEnum = {
   AND: 'AND' as const,
   OR: 'OR' as const,
   NOT: 'NOT' as const
}

export const enumViewKeyEnum = {
   INDEX: 'INDEX' as const
}

export const enumViewOpenRecordInEnum = {
   SIDE_PANEL: 'SIDE_PANEL' as const,
   RECORD_PAGE: 'RECORD_PAGE' as const
}

export const enumViewKanbanAggregateOperationEnum = {
   AVG: 'AVG' as const,
   COUNT: 'COUNT' as const,
   MAX: 'MAX' as const,
   MIN: 'MIN' as const,
   SUM: 'SUM' as const,
   COUNT_EMPTY: 'COUNT_EMPTY' as const,
   COUNT_NOT_EMPTY: 'COUNT_NOT_EMPTY' as const,
   COUNT_UNIQUE_VALUES: 'COUNT_UNIQUE_VALUES' as const,
   PERCENTAGE_EMPTY: 'PERCENTAGE_EMPTY' as const,
   PERCENTAGE_NOT_EMPTY: 'PERCENTAGE_NOT_EMPTY' as const,
   COUNT_TRUE: 'COUNT_TRUE' as const,
   COUNT_FALSE: 'COUNT_FALSE' as const
}

export const enumWorkflowStatusesEnum = {
   DRAFT: 'DRAFT' as const,
   ACTIVE: 'ACTIVE' as const,
   DEACTIVATED: 'DEACTIVATED' as const
}

export const enumWorkflowVersionStatusEnum = {
   DRAFT: 'DRAFT' as const,
   ACTIVE: 'ACTIVE' as const,
   DEACTIVATED: 'DEACTIVATED' as const,
   ARCHIVED: 'ARCHIVED' as const
}

export const enumWorkflowRunStatusEnum = {
   NOT_STARTED: 'NOT_STARTED' as const,
   RUNNING: 'RUNNING' as const,
   COMPLETED: 'COMPLETED' as const,
   FAILED: 'FAILED' as const
}

export const enumWorkflowAutomatedTriggerTypeEnum = {
   DATABASE_EVENT: 'DATABASE_EVENT' as const,
   CRON: 'CRON' as const
}

export const enumWorkspaceMemberDateFormatEnum = {
   SYSTEM: 'SYSTEM' as const,
   MONTH_FIRST: 'MONTH_FIRST' as const,
   DAY_FIRST: 'DAY_FIRST' as const,
   YEAR_FIRST: 'YEAR_FIRST' as const
}

export const enumWorkspaceMemberTimeFormatEnum = {
   SYSTEM: 'SYSTEM' as const,
   HOUR_24: 'HOUR_24' as const,
   HOUR_12: 'HOUR_12' as const
}

export const enumMessageChannelVisibilityEnum = {
   METADATA: 'METADATA' as const,
   SUBJECT: 'SUBJECT' as const,
   SHARE_EVERYTHING: 'SHARE_EVERYTHING' as const
}

export const enumMessageChannelTypeEnum = {
   email: 'email' as const,
   sms: 'sms' as const
}

export const enumMessageChannelContactAutoCreationPolicyEnum = {
   SENT_AND_RECEIVED: 'SENT_AND_RECEIVED' as const,
   SENT: 'SENT' as const,
   NONE: 'NONE' as const
}

export const enumMessageChannelSyncStatusEnum = {
   ONGOING: 'ONGOING' as const,
   NOT_SYNCED: 'NOT_SYNCED' as const,
   ACTIVE: 'ACTIVE' as const,
   FAILED_INSUFFICIENT_PERMISSIONS: 'FAILED_INSUFFICIENT_PERMISSIONS' as const,
   FAILED_UNKNOWN: 'FAILED_UNKNOWN' as const
}

export const enumMessageChannelSyncStageEnum = {
   FULL_MESSAGE_LIST_FETCH_PENDING: 'FULL_MESSAGE_LIST_FETCH_PENDING' as const,
   PARTIAL_MESSAGE_LIST_FETCH_PENDING: 'PARTIAL_MESSAGE_LIST_FETCH_PENDING' as const,
   MESSAGE_LIST_FETCH_ONGOING: 'MESSAGE_LIST_FETCH_ONGOING' as const,
   MESSAGES_IMPORT_PENDING: 'MESSAGES_IMPORT_PENDING' as const,
   MESSAGES_IMPORT_ONGOING: 'MESSAGES_IMPORT_ONGOING' as const,
   FAILED: 'FAILED' as const
}

export const enumMessageParticipantRoleEnum = {
   from: 'from' as const,
   to: 'to' as const,
   cc: 'cc' as const,
   bcc: 'bcc' as const
}

export const enumMessageChannelMessageAssociationDirectionEnum = {
   INCOMING: 'INCOMING' as const,
   OUTGOING: 'OUTGOING' as const
}

export const enumOpportunityStageEnum = {
   NEW: 'NEW' as const,
   SCREENING: 'SCREENING' as const,
   MEETING: 'MEETING' as const,
   PROPOSAL: 'PROPOSAL' as const,
   CUSTOMER: 'CUSTOMER' as const
}

export const enumPersonWorkPreferenceEnum = {
   ON_SITE: 'ON_SITE' as const,
   HYBRID: 'HYBRID' as const,
   REMOTE_WORK: 'REMOTE_WORK' as const
}

export const enumPersonPerformanceRatingEnum = {
   RATING_1: 'RATING_1' as const,
   RATING_2: 'RATING_2' as const,
   RATING_3: 'RATING_3' as const,
   RATING_4: 'RATING_4' as const,
   RATING_5: 'RATING_5' as const
}

export const enumTaskStatusEnum = {
   TODO: 'TODO' as const,
   IN_PROGRESS: 'IN_PROGRESS' as const,
   DONE: 'DONE' as const
}

export const enumFilterIs = {
   NULL: 'NULL' as const,
   NOT_NULL: 'NOT_NULL' as const
}

export const enumOrderByDirection = {
   AscNullsFirst: 'AscNullsFirst' as const,
   AscNullsLast: 'AscNullsLast' as const,
   DescNullsFirst: 'DescNullsFirst' as const,
   DescNullsLast: 'DescNullsLast' as const
}
