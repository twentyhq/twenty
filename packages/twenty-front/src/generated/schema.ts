export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSON: { input: any; output: any; }
  UUID: { input: any; output: any; }
};

export type AnswerToolCallInput = {
  modelId?: InputMaybe<Scalars['String']['input']>;
  /** The answer, validated against what the tool call asked */
  response: Scalars['JSON']['input'];
  threadId: Scalars['UUID']['input'];
  toolCallId: Scalars['String']['input'];
};

export type AnswerToolCallResult = {
  __typename?: 'AnswerToolCallResult';
  streamId?: Maybe<Scalars['String']['output']>;
};

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING'
}

/** Recording lifecycle status */
export enum CallRecordingStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  JOINING = 'JOINING',
  NOT_RECORDED = 'NOT_RECORDED',
  PROCESSING = 'PROCESSING',
  RECORDING = 'RECORDING',
  SCHEDULED = 'SCHEDULED'
}

export type ComputeStepOutputSchemaInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId?: InputMaybe<Scalars['UUID']['input']>;
  /** Step JSON format */
  step: Scalars['JSON']['input'];
};

export type ConnectedAccountHandleDto = {
  __typename?: 'ConnectedAccountHandleDTO';
  handle: Scalars['String']['output'];
  handleAliases?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['UUID']['output'];
  provider: Scalars['String']['output'];
};

export type CoreWorkflowConnection = {
  __typename?: 'CoreWorkflowConnection';
  edges: Array<CoreWorkflowEdge>;
  pageInfo: CoreWorkflowPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CoreWorkflowDto = {
  __typename?: 'CoreWorkflowDTO';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  canChangeVisibility: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isSystem: Scalars['Boolean']['output'];
  lastPublishedCoreWorkflowVersionId?: Maybe<Scalars['UUID']['output']>;
  lastPublishedVersionId?: Maybe<Scalars['UUID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  statuses: Array<CoreWorkflowStatus>;
  updatedAt: Scalars['String']['output'];
  visibility: WorkflowVisibility;
  workspaceWorkflowId?: Maybe<Scalars['UUID']['output']>;
};

export type CoreWorkflowEdge = {
  __typename?: 'CoreWorkflowEdge';
  cursor: Scalars['String']['output'];
  node: CoreWorkflowDto;
};

export enum CoreWorkflowFilterFieldKey {
  IS_SYSTEM = 'IS_SYSTEM',
  NAME = 'NAME',
  STATUSES = 'STATUSES',
  UPDATED_AT = 'UPDATED_AT'
}

export type CoreWorkflowFilterInput = {
  logicalOperator: CoreWorkflowFilterLogicalOperator;
  rules: Array<CoreWorkflowFilterRuleInput>;
};

export enum CoreWorkflowFilterLogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

export enum CoreWorkflowFilterOperand {
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  IS = 'IS',
  IS_AFTER = 'IS_AFTER',
  IS_BEFORE = 'IS_BEFORE',
  IS_EMPTY = 'IS_EMPTY',
  IS_IN_FUTURE = 'IS_IN_FUTURE',
  IS_IN_PAST = 'IS_IN_PAST',
  IS_NOT = 'IS_NOT',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
  IS_RELATIVE = 'IS_RELATIVE',
  IS_TODAY = 'IS_TODAY'
}

export type CoreWorkflowFilterRuleInput = {
  fieldKey: CoreWorkflowFilterFieldKey;
  operand: CoreWorkflowFilterOperand;
  timezone?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export enum CoreWorkflowOrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum CoreWorkflowOrderByField {
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT'
}

export type CoreWorkflowPageInfo = {
  __typename?: 'CoreWorkflowPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum CoreWorkflowStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  DRAFT = 'DRAFT'
}

export type CoreWorkflowVersionDto = {
  __typename?: 'CoreWorkflowVersionDTO';
  coreWorkflowId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  label: Scalars['String']['output'];
  status: CoreWorkflowVersionStatus;
  steps?: Maybe<Scalars['JSON']['output']>;
  trigger?: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['String']['output'];
  workspaceWorkflowId?: Maybe<Scalars['UUID']['output']>;
  workspaceWorkflowVersionId?: Maybe<Scalars['UUID']['output']>;
};

export enum CoreWorkflowVersionStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DEACTIVATED = 'DEACTIVATED',
  DRAFT = 'DRAFT'
}

export type CoreWorkflowWithCurrentVersionDto = {
  __typename?: 'CoreWorkflowWithCurrentVersionDTO';
  currentVersion: CoreWorkflowVersionDto;
  versions: Array<CoreWorkflowVersionDto>;
  workflow: CoreWorkflowDto;
};

export type CoreWorkflowsWithCurrentVersionsInput = {
  coreWorkflowIds: Array<Scalars['UUID']['input']>;
};

export type CreateCoreWorkflowInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<WorkflowVisibility>;
};

export type CreateCoreWorkflowVersionEdgeInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  /** Workflow version source step ID */
  source: Scalars['String']['input'];
  /** Workflow version source step connection options */
  sourceConnectionOptions?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow version target step ID */
  target: Scalars['String']['input'];
};

export type CreateCoreWorkflowVersionStepInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  /** Default settings for the step */
  defaultSettings?: InputMaybe<Scalars['JSON']['input']>;
  /** Step ID */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Next step ID */
  nextStepId?: InputMaybe<Scalars['UUID']['input']>;
  /** Parent step connection options */
  parentStepConnectionOptions?: InputMaybe<Scalars['JSON']['input']>;
  /** Parent step ID */
  parentStepId?: InputMaybe<Scalars['String']['input']>;
  /** Step position */
  position?: InputMaybe<WorkflowStepPositionInput>;
  /** New step type */
  stepType: Scalars['String']['input'];
};

export type CreateDraftFromCoreWorkflowVersionInput = {
  /** Core workflow ID */
  coreWorkflowId: Scalars['UUID']['input'];
  /** Core workflow version ID to copy */
  coreWorkflowVersionIdToCopy: Scalars['UUID']['input'];
};

export type DateTimeFilter = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DeleteCoreWorkflowVersionEdgeInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  /** Workflow version source step ID */
  source: Scalars['String']['input'];
  /** Workflow version source step connection options */
  sourceConnectionOptions?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow version target step ID */
  target: Scalars['String']['input'];
};

export type DeleteCoreWorkflowVersionStepInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  /** Step to delete ID */
  stepId: Scalars['String']['input'];
};

export type DeleteCoreWorkflowsInput = {
  coreWorkflowIds: Array<Scalars['UUID']['input']>;
};

export type DeletedCoreWorkflowDto = {
  __typename?: 'DeletedCoreWorkflowDTO';
  id: Scalars['UUID']['output'];
  workspaceWorkflowId?: Maybe<Scalars['UUID']['output']>;
};

export type DiscardCoreWorkflowDraftInput = {
  coreWorkflowVersionId: Scalars['UUID']['input'];
};

export type DpaAgreement = {
  __typename?: 'DpaAgreement';
  acceptedAt: Scalars['DateTime']['output'];
  acceptedByEmail?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customerLegalEntityName?: Maybe<Scalars['String']['output']>;
  downloadUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  processorEntity: Scalars['String']['output'];
  region: DpaRegion;
  signatoryName?: Maybe<Scalars['String']['output']>;
  signatoryTitle?: Maybe<Scalars['String']['output']>;
  signedFileId?: Maybe<Scalars['String']['output']>;
  templateVersion: Scalars['String']['output'];
  type: DpaAgreementType;
  updatedAt: Scalars['DateTime']['output'];
};

export enum DpaAgreementType {
  CLICK_THROUGH = 'CLICK_THROUGH',
  SIGNED = 'SIGNED'
}

export type DpaDocument = {
  __typename?: 'DpaDocument';
  blocks: Array<DpaDocumentBlock>;
  lastUpdatedLabel: Scalars['String']['output'];
  notice?: Maybe<Scalars['String']['output']>;
  processorEntity: Scalars['String']['output'];
  region: DpaRegion;
  sccSectionActive: Scalars['Boolean']['output'];
  templateVersion: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type DpaDocumentBlock = {
  __typename?: 'DpaDocumentBlock';
  kind: DpaDocumentBlockKind;
  label?: Maybe<Scalars['String']['output']>;
  text: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export enum DpaDocumentBlockKind {
  Heading = 'Heading',
  Paragraph = 'Paragraph',
  SignatureField = 'SignatureField'
}

export enum DpaRegion {
  EU = 'EU',
  US = 'US'
}

export type DuplicateCoreWorkflowInput = {
  /** Core workflow ID to duplicate */
  coreWorkflowIdToDuplicate: Scalars['UUID']['input'];
  /** Core workflow version ID to copy */
  coreWorkflowVersionIdToCopy: Scalars['UUID']['input'];
};

export type DuplicateCoreWorkflowVersionStepInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  stepId: Scalars['String']['input'];
};

export enum FilterIs {
  NotNull = 'NotNull',
  Null = 'Null'
}

export type GenerateSignedDpaInput = {
  customerLegalEntityName: Scalars['String']['input'];
  signatoryName: Scalars['String']['input'];
  signatoryTitle: Scalars['String']['input'];
};

export type GenerateSignedDpaResult = {
  __typename?: 'GenerateSignedDpaResult';
  agreement: DpaAgreement;
  downloadUrl: Scalars['String']['output'];
};

export type LinkMetadata = {
  __typename?: 'LinkMetadata';
  label: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type LinksMetadata = {
  __typename?: 'LinksMetadata';
  primaryLinkLabel: Scalars['String']['output'];
  primaryLinkUrl: Scalars['String']['output'];
  secondaryLinks?: Maybe<Array<LinkMetadata>>;
};

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
  SUBJECT = 'SUBJECT'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateCoreWorkflowVersion: Scalars['Boolean']['output'];
  answerToolCall: AnswerToolCallResult;
  computeStepOutputSchema: Scalars['JSON']['output'];
  createCoreWorkflow: CoreWorkflowDto;
  createCoreWorkflowVersionEdge: WorkflowVersionStepChanges;
  createCoreWorkflowVersionStep: WorkflowVersionStepChanges;
  createDraftFromCoreWorkflowVersion: CoreWorkflowVersionDto;
  deactivateCoreWorkflowVersion: Scalars['Boolean']['output'];
  deleteCoreWorkflowVersionEdge: WorkflowVersionStepChanges;
  deleteCoreWorkflowVersionStep: WorkflowVersionStepChanges;
  deleteCoreWorkflows: Array<DeletedCoreWorkflowDto>;
  discardCoreWorkflowDraft?: Maybe<CoreWorkflowDto>;
  dismissMaintenanceModeBanner: Scalars['Boolean']['output'];
  dismissReconnectAccountBanner: Scalars['Boolean']['output'];
  duplicateCoreWorkflow: CoreWorkflowDto;
  duplicateCoreWorkflowVersionStep: WorkflowVersionStepChanges;
  generateSignedDpa: GenerateSignedDpaResult;
  retryWorkflowRun: WorkflowRun;
  runCoreWorkflowVersion: RunWorkflowVersion;
  stopWorkflowRun: WorkflowRun;
  submitFormStep: Scalars['Boolean']['output'];
  testHttpRequest: TestHttpRequest;
  updateCoreWorkflow?: Maybe<CoreWorkflowDto>;
  updateCoreWorkflowVersionPositions: Scalars['Boolean']['output'];
  updateCoreWorkflowVersionStep: WorkflowAction;
  updateCoreWorkflowVersionTrigger: WorkflowVersionTrigger;
  updateCoreWorkflowVisibility?: Maybe<CoreWorkflowDto>;
  updateWorkflowRunStep: WorkflowAction;
};


export type MutationActivateCoreWorkflowVersionArgs = {
  coreWorkflowVersionId: Scalars['UUID']['input'];
};


export type MutationAnswerToolCallArgs = {
  input: AnswerToolCallInput;
};


export type MutationComputeStepOutputSchemaArgs = {
  input: ComputeStepOutputSchemaInput;
};


export type MutationCreateCoreWorkflowArgs = {
  input: CreateCoreWorkflowInput;
};


export type MutationCreateCoreWorkflowVersionEdgeArgs = {
  input: CreateCoreWorkflowVersionEdgeInput;
};


export type MutationCreateCoreWorkflowVersionStepArgs = {
  input: CreateCoreWorkflowVersionStepInput;
};


export type MutationCreateDraftFromCoreWorkflowVersionArgs = {
  input: CreateDraftFromCoreWorkflowVersionInput;
};


export type MutationDeactivateCoreWorkflowVersionArgs = {
  coreWorkflowVersionId: Scalars['UUID']['input'];
};


export type MutationDeleteCoreWorkflowVersionEdgeArgs = {
  input: DeleteCoreWorkflowVersionEdgeInput;
};


export type MutationDeleteCoreWorkflowVersionStepArgs = {
  input: DeleteCoreWorkflowVersionStepInput;
};


export type MutationDeleteCoreWorkflowsArgs = {
  input: DeleteCoreWorkflowsInput;
};


export type MutationDiscardCoreWorkflowDraftArgs = {
  input: DiscardCoreWorkflowDraftInput;
};


export type MutationDismissReconnectAccountBannerArgs = {
  connectedAccountId: Scalars['UUID']['input'];
};


export type MutationDuplicateCoreWorkflowArgs = {
  input: DuplicateCoreWorkflowInput;
};


export type MutationDuplicateCoreWorkflowVersionStepArgs = {
  input: DuplicateCoreWorkflowVersionStepInput;
};


export type MutationGenerateSignedDpaArgs = {
  input: GenerateSignedDpaInput;
};


export type MutationRetryWorkflowRunArgs = {
  workflowRunId: Scalars['UUID']['input'];
};


export type MutationRunCoreWorkflowVersionArgs = {
  input: RunCoreWorkflowVersionInput;
};


export type MutationStopWorkflowRunArgs = {
  workflowRunId: Scalars['UUID']['input'];
};


export type MutationSubmitFormStepArgs = {
  input: SubmitFormStepInput;
};


export type MutationTestHttpRequestArgs = {
  input: TestHttpRequestInput;
};


export type MutationUpdateCoreWorkflowArgs = {
  input: UpdateCoreWorkflowInput;
};


export type MutationUpdateCoreWorkflowVersionPositionsArgs = {
  input: UpdateCoreWorkflowVersionPositionsInput;
};


export type MutationUpdateCoreWorkflowVersionStepArgs = {
  input: UpdateCoreWorkflowVersionStepInput;
};


export type MutationUpdateCoreWorkflowVersionTriggerArgs = {
  input: UpdateCoreWorkflowVersionTriggerInput;
};


export type MutationUpdateCoreWorkflowVisibilityArgs = {
  input: UpdateCoreWorkflowVisibilityInput;
};


export type MutationUpdateWorkflowRunStepArgs = {
  input: UpdateWorkflowRunStepInput;
};

export type ObjectRecordFilterInput = {
  and?: InputMaybe<Array<ObjectRecordFilterInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<ObjectRecordFilterInput>;
  or?: InputMaybe<Array<ObjectRecordFilterInput>>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type Query = {
  __typename?: 'Query';
  coreWorkflow?: Maybe<CoreWorkflowDto>;
  coreWorkflowById?: Maybe<CoreWorkflowDto>;
  coreWorkflowVersion?: Maybe<CoreWorkflowVersionDto>;
  coreWorkflowVersionById?: Maybe<CoreWorkflowVersionDto>;
  coreWorkflowVersions: Array<CoreWorkflowVersionDto>;
  coreWorkflowVersionsByCoreWorkflowId: Array<CoreWorkflowVersionDto>;
  coreWorkflows: CoreWorkflowConnection;
  coreWorkflowsWithCurrentVersions: Array<CoreWorkflowWithCurrentVersionDto>;
  dpaAgreements: Array<DpaAgreement>;
  dpaPreview: DpaDocument;
  /** @deprecated Use getTimelineCalendarEventsFromObjectRecord instead */
  getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromObjectRecord: TimelineCalendarEventsWithTotal;
  /** @deprecated Use getTimelineCalendarEventsFromObjectRecord instead */
  getTimelineCalendarEventsFromOpportunityId: TimelineCalendarEventsWithTotal;
  /** @deprecated Use getTimelineCalendarEventsFromObjectRecord instead */
  getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal;
  /** @deprecated Use getTimelineThreadsFromObjectRecord instead */
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromObjectRecord: TimelineThreadsWithTotal;
  /** @deprecated Use getTimelineThreadsFromObjectRecord instead */
  getTimelineThreadsFromOpportunityId: TimelineThreadsWithTotal;
  /** @deprecated Use getTimelineThreadsFromObjectRecord instead */
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  isMaintenanceModeBannerDismissed: Scalars['Boolean']['output'];
  search: SearchResultConnection;
  searchTimelineCalendarEvents: TimelineCalendarEventSearchResult;
  searchTimelineThreads: TimelineThreadSearchResult;
  workflowStepConnectedAccountHandle?: Maybe<ConnectedAccountHandleDto>;
};


export type QueryCoreWorkflowArgs = {
  workspaceWorkflowId: Scalars['UUID']['input'];
};


export type QueryCoreWorkflowByIdArgs = {
  coreWorkflowId: Scalars['UUID']['input'];
};


export type QueryCoreWorkflowVersionArgs = {
  workspaceWorkflowVersionId: Scalars['UUID']['input'];
};


export type QueryCoreWorkflowVersionByIdArgs = {
  coreWorkflowVersionId: Scalars['UUID']['input'];
};


export type QueryCoreWorkflowVersionsArgs = {
  workspaceWorkflowId: Scalars['UUID']['input'];
};


export type QueryCoreWorkflowVersionsByCoreWorkflowIdArgs = {
  coreWorkflowId: Scalars['UUID']['input'];
};


export type QueryCoreWorkflowsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<CoreWorkflowFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CoreWorkflowOrderByField>;
  orderByDirection?: InputMaybe<CoreWorkflowOrderByDirection>;
};


export type QueryCoreWorkflowsWithCurrentVersionsArgs = {
  input: CoreWorkflowsWithCurrentVersionsInput;
};


export type QueryGetTimelineCalendarEventsFromCompanyIdArgs = {
  companyId: Scalars['UUID']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryGetTimelineCalendarEventsFromObjectRecordArgs = {
  objectNameSingular: Scalars['String']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  recordId: Scalars['UUID']['input'];
};


export type QueryGetTimelineCalendarEventsFromOpportunityIdArgs = {
  opportunityId: Scalars['UUID']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryGetTimelineCalendarEventsFromPersonIdArgs = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  personId: Scalars['UUID']['input'];
};


export type QueryGetTimelineThreadsFromCompanyIdArgs = {
  companyId: Scalars['UUID']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryGetTimelineThreadsFromObjectRecordArgs = {
  objectNameSingular: Scalars['String']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  recordId: Scalars['UUID']['input'];
};


export type QueryGetTimelineThreadsFromOpportunityIdArgs = {
  opportunityId: Scalars['UUID']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryGetTimelineThreadsFromPersonIdArgs = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  personId: Scalars['UUID']['input'];
};


export type QuerySearchArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']['input']>>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']['input']>>;
  limit: Scalars['Int']['input'];
  searchInput: Scalars['String']['input'];
};


export type QuerySearchTimelineCalendarEventsArgs = {
  objectNameSingular: Scalars['String']['input'];
  recordId: Scalars['UUID']['input'];
  searchInput?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchTimelineThreadsArgs = {
  objectNameSingular: Scalars['String']['input'];
  recordId: Scalars['UUID']['input'];
  searchInput?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkflowStepConnectedAccountHandleArgs = {
  connectedAccountId: Scalars['UUID']['input'];
};

export type RunCoreWorkflowVersionInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  /** Execution result in JSON format */
  payload?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow run ID */
  workflowRunId?: InputMaybe<Scalars['UUID']['input']>;
};

export type RunWorkflowVersion = {
  __typename?: 'RunWorkflowVersion';
  workflowRunId: Scalars['UUID']['output'];
};

export type SearchRecord = {
  __typename?: 'SearchRecord';
  imageUrl?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  objectLabelSingular: Scalars['String']['output'];
  objectNameSingular: Scalars['String']['output'];
  recordId: Scalars['UUID']['output'];
  tsRank: Scalars['Float']['output'];
  tsRankCD: Scalars['Float']['output'];
};

export type SearchResultConnection = {
  __typename?: 'SearchResultConnection';
  edges: Array<SearchResultEdge>;
  pageInfo: SearchResultPageInfo;
};

export type SearchResultEdge = {
  __typename?: 'SearchResultEdge';
  cursor: Scalars['String']['output'];
  node: SearchRecord;
};

export type SearchResultPageInfo = {
  __typename?: 'SearchResultPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type SubmitFormStepInput = {
  /** Form values keyed by field name */
  response: Scalars['JSON']['input'];
  /** Form step ID */
  stepId: Scalars['UUID']['input'];
  /** Workflow run ID */
  workflowRunId: Scalars['UUID']['input'];
};

export type TestHttpRequest = {
  __typename?: 'TestHttpRequest';
  /** Error information */
  error?: Maybe<Scalars['JSON']['output']>;
  /** Response headers */
  headers?: Maybe<Scalars['JSON']['output']>;
  /** Message describing the result */
  message: Scalars['String']['output'];
  /** Response data */
  result?: Maybe<Scalars['JSON']['output']>;
  /** HTTP status code */
  status?: Maybe<Scalars['Float']['output']>;
  /** HTTP status text */
  statusText?: Maybe<Scalars['String']['output']>;
  /** Whether the request was successful */
  success: Scalars['Boolean']['output'];
};

export type TestHttpRequestInput = {
  /** Request body */
  body?: InputMaybe<Scalars['JSON']['input']>;
  /** HTTP headers */
  headers?: InputMaybe<Scalars['JSON']['input']>;
  /** HTTP method */
  method: Scalars['String']['input'];
  /** URL to make the request to */
  url: Scalars['String']['input'];
};

export type TimelineCalendarEvent = {
  __typename?: 'TimelineCalendarEvent';
  callRecordings: Array<TimelineCalendarEventCallRecording>;
  conferenceLink: LinksMetadata;
  conferenceSolution: Scalars['String']['output'];
  description: Scalars['String']['output'];
  endsAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  isCanceled: Scalars['Boolean']['output'];
  isFullDay: Scalars['Boolean']['output'];
  location: Scalars['String']['output'];
  participants: Array<TimelineCalendarEventParticipant>;
  startsAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  visibility: CalendarChannelVisibility;
};

export type TimelineCalendarEventCallRecording = {
  __typename?: 'TimelineCalendarEventCallRecording';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  id: Scalars['UUID']['output'];
  status: CallRecordingStatus;
};

export type TimelineCalendarEventParticipant = {
  __typename?: 'TimelineCalendarEventParticipant';
  avatarUrl: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  personId?: Maybe<Scalars['UUID']['output']>;
  workspaceMemberId?: Maybe<Scalars['UUID']['output']>;
};

export type TimelineCalendarEventSearchResult = {
  __typename?: 'TimelineCalendarEventSearchResult';
  otherTimelineCalendarEvents: Array<TimelineCalendarEvent>;
  recordTimelineCalendarEvents: Array<TimelineCalendarEvent>;
};

export type TimelineCalendarEventsWithTotal = {
  __typename?: 'TimelineCalendarEventsWithTotal';
  relatedPersonIds: Array<Scalars['UUID']['output']>;
  timelineCalendarEvents: Array<TimelineCalendarEvent>;
  totalNumberOfCalendarEvents: Scalars['Int']['output'];
};

export type TimelineThread = {
  __typename?: 'TimelineThread';
  firstParticipant: TimelineThreadParticipant;
  id: Scalars['UUID']['output'];
  lastMessageBody: Scalars['String']['output'];
  lastMessageIsDraft: Scalars['Boolean']['output'];
  lastMessageReceivedAt: Scalars['DateTime']['output'];
  lastTwoParticipants: Array<TimelineThreadParticipant>;
  numberOfMessagesInThread: Scalars['Float']['output'];
  participantCount: Scalars['Float']['output'];
  read: Scalars['Boolean']['output'];
  subject: Scalars['String']['output'];
  visibility: MessageChannelVisibility;
};

export type TimelineThreadParticipant = {
  __typename?: 'TimelineThreadParticipant';
  avatarUrl: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  personId?: Maybe<Scalars['UUID']['output']>;
  workspaceMemberId?: Maybe<Scalars['UUID']['output']>;
};

export type TimelineThreadSearchResult = {
  __typename?: 'TimelineThreadSearchResult';
  otherTimelineThreads: Array<TimelineThread>;
  recordTimelineThreads: Array<TimelineThread>;
};

export type TimelineThreadsWithTotal = {
  __typename?: 'TimelineThreadsWithTotal';
  relatedPersonIds: Array<Scalars['UUID']['output']>;
  timelineThreads: Array<TimelineThread>;
  totalNumberOfThreads: Scalars['Int']['output'];
};

export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  gt?: InputMaybe<Scalars['UUID']['input']>;
  gte?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['UUID']['input']>;
  lte?: InputMaybe<Scalars['UUID']['input']>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

export type UpdateCoreWorkflowInput = {
  coreWorkflowId: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
};

export type UpdateCoreWorkflowVersionPositionsInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  /** Workflow version updated positions */
  positions: Array<WorkflowStepPositionUpdateInput>;
};

export type UpdateCoreWorkflowVersionStepInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  /** Step to update in JSON format */
  step: Scalars['JSON']['input'];
};

export type UpdateCoreWorkflowVersionTriggerInput = {
  /** Core workflow version ID */
  coreWorkflowVersionId: Scalars['UUID']['input'];
  /** Trigger to update in JSON format */
  trigger: Scalars['JSON']['input'];
};

export type UpdateCoreWorkflowVisibilityInput = {
  coreWorkflowId: Scalars['UUID']['input'];
  visibility: WorkflowVisibility;
};

export type UpdateWorkflowRunStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON']['input'];
  /** Workflow run ID */
  workflowRunId: Scalars['UUID']['input'];
};

export type WorkflowAction = {
  __typename?: 'WorkflowAction';
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  nextStepIds?: Maybe<Array<Scalars['UUID']['output']>>;
  position?: Maybe<WorkflowStepPosition>;
  settings: Scalars['JSON']['output'];
  type: WorkflowActionType;
  valid: Scalars['Boolean']['output'];
};

export enum WorkflowActionType {
  AI_AGENT = 'AI_AGENT',
  CLASSIFY = 'CLASSIFY',
  CODE = 'CODE',
  CREATE_CALENDAR_EVENT = 'CREATE_CALENDAR_EVENT',
  CREATE_RECORD = 'CREATE_RECORD',
  DELAY = 'DELAY',
  DELETE_RECORD = 'DELETE_RECORD',
  DRAFT_EMAIL = 'DRAFT_EMAIL',
  EMPTY = 'EMPTY',
  FILTER = 'FILTER',
  FIND_RECORDS = 'FIND_RECORDS',
  FORM = 'FORM',
  HTTP_REQUEST = 'HTTP_REQUEST',
  IF_ELSE = 'IF_ELSE',
  ITERATOR = 'ITERATOR',
  LOGIC_FUNCTION = 'LOGIC_FUNCTION',
  PICK_RECORD = 'PICK_RECORD',
  SEND_CHAT_MESSAGE = 'SEND_CHAT_MESSAGE',
  SEND_EMAIL = 'SEND_EMAIL',
  UPDATE_RECORD = 'UPDATE_RECORD',
  UPSERT_RECORD = 'UPSERT_RECORD',
  WAIT_FOR_EVENT = 'WAIT_FOR_EVENT'
}

export type WorkflowRun = {
  __typename?: 'WorkflowRun';
  id: Scalars['UUID']['output'];
  status: WorkflowRunStatusEnum;
};

/** Status of the workflow run */
export enum WorkflowRunStatusEnum {
  COMPLETED = 'COMPLETED',
  ENQUEUED = 'ENQUEUED',
  FAILED = 'FAILED',
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  STOPPING = 'STOPPING'
}

export type WorkflowStepPosition = {
  __typename?: 'WorkflowStepPosition';
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type WorkflowStepPositionInput = {
  x: Scalars['Float']['input'];
  y: Scalars['Float']['input'];
};

export type WorkflowStepPositionUpdateInput = {
  /** Step or trigger ID */
  id: Scalars['String']['input'];
  /** Position of the step or trigger */
  position: WorkflowStepPositionInput;
};

export type WorkflowVersionStepChanges = {
  __typename?: 'WorkflowVersionStepChanges';
  stepsDiff?: Maybe<Scalars['JSON']['output']>;
  triggerDiff?: Maybe<Scalars['JSON']['output']>;
};

export type WorkflowVersionTrigger = {
  __typename?: 'WorkflowVersionTrigger';
  trigger?: Maybe<Scalars['JSON']['output']>;
};

export enum WorkflowVisibility {
  PRIVATE = 'PRIVATE',
  WORKSPACE = 'WORKSPACE'
}
