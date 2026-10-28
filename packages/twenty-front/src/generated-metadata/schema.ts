export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  ConnectionCursor: { input: any; output: any; }
  DateTime: { input: string; output: string; }
  JSON: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  UUID: { input: string; output: string; }
  Upload: { input: any; output: any; }
};

export type ActivateWorkspaceInput = {
  /** Deprecated: the workspace name is set at creation (signUpInNewWorkspace) and this field is ignored during activation. Kept for backward compatibility. */
  displayName?: InputMaybe<Scalars['String']['input']>;
};

export type AddQuerySubscriptionInput = {
  eventStreamId: Scalars['String']['input'];
  operationSignature: Scalars['JSON']['input'];
  queryId: Scalars['String']['input'];
};

export type Agent = {
  __typename?: 'Agent';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** @deprecated Derived from applicationId and removed in 2.54: compare applicationId with the workspace custom application instead. */
  isCustom: Scalars['Boolean']['output'];
  isSystem: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  modelConfiguration?: Maybe<Scalars['JSON']['output']>;
  modelId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  prompt: Scalars['String']['output'];
  responseFormat?: Maybe<Scalars['JSON']['output']>;
  roleId?: Maybe<Scalars['UUID']['output']>;
  triggers: Array<Scalars['JSON']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AgentChatChannel = {
  __typename?: 'AgentChatChannel';
  applicationId: Scalars['UUID']['output'];
  color?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isAccessible?: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated Derived from applicationId and removed in 2.54: compare applicationId with the workspace custom application instead. */
  isCustom: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Float']['output'];
  roleIds: Array<Scalars['UUID']['output']>;
};

export enum AgentChatChannelAssignmentFilter {
  ANY = 'ANY',
  ASSIGNED_TO_ME = 'ASSIGNED_TO_ME',
  UNASSIGNED = 'UNASSIGNED'
}

export type AgentChatChannelRole = {
  __typename?: 'AgentChatChannelRole';
  canAccessAllAgentChatChannels: Scalars['Boolean']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  label: Scalars['String']['output'];
};

export type AgentChatChannelSummary = {
  __typename?: 'AgentChatChannelSummary';
  assignedToMeCount: Scalars['Int']['output'];
  channelId: Scalars['UUID']['output'];
  doneCount: Scalars['Int']['output'];
  hasUnreadAssignedToMe: Scalars['Boolean']['output'];
  hasUnreadOpen: Scalars['Boolean']['output'];
  openCount: Scalars['Int']['output'];
  snoozedCount: Scalars['Int']['output'];
};

export type AgentChatChannelThreadIds = {
  __typename?: 'AgentChatChannelThreadIds';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  threadIds: Array<Scalars['UUID']['output']>;
};

export enum AgentChatChannelThreadStatus {
  DONE = 'DONE',
  OPEN = 'OPEN',
  SNOOZED = 'SNOOZED'
}

export type AgentChatEvent = {
  __typename?: 'AgentChatEvent';
  event: Scalars['JSON']['output'];
  threadId: Scalars['String']['output'];
};

export enum AgentChatInboxAction {
  ARCHIVE = 'ARCHIVE',
  MOVE_TO_INBOX = 'MOVE_TO_INBOX',
  READ = 'READ',
  SNOOZE = 'SNOOZE',
  SUBSCRIBE = 'SUBSCRIBE',
  UNREAD = 'UNREAD',
  UNSUBSCRIBE = 'UNSUBSCRIBE'
}

export type AgentChatOpenThreadsSummary = {
  __typename?: 'AgentChatOpenThreadsSummary';
  hasUnreadAssignedThread: Scalars['Boolean']['output'];
  hasUnreadMentionThread: Scalars['Boolean']['output'];
  hasUnreadOpenThread: Scalars['Boolean']['output'];
  needsInputThreadCount: Scalars['Int']['output'];
  openThreadCount: Scalars['Int']['output'];
  unreadOpenThreadCount: Scalars['Int']['output'];
};

export type AgentChatThread = {
  __typename?: 'AgentChatThread';
  contextWindowTokens?: Maybe<Scalars['Int']['output']>;
  conversationSize: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  title?: Maybe<Scalars['String']['output']>;
  totalCacheReadTokens: Scalars['Int']['output'];
  totalInputCredits: Scalars['Float']['output'];
  totalInputTokens: Scalars['Int']['output'];
  totalOutputCredits: Scalars['Float']['output'];
  totalOutputTokens: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AgentChatThreadParticipant = {
  __typename?: 'AgentChatThreadParticipant';
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isSubscribed: Scalars['Boolean']['output'];
  lastMentionedAt?: Maybe<Scalars['DateTime']['output']>;
  lastReadAt?: Maybe<Scalars['DateTime']['output']>;
  snoozedUntil?: Maybe<Scalars['DateTime']['output']>;
  threadId: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AgentIdInput = {
  /** The id of the agent. */
  id: Scalars['UUID']['input'];
};

export type AgentMessage = {
  __typename?: 'AgentMessage';
  agentId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  parts: Array<AgentMessagePart>;
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  reactions: Array<AgentMessageReactionSummary>;
  role: Scalars['String']['output'];
  senderUserWorkspaceId?: Maybe<Scalars['UUID']['output']>;
  senderWorkspaceMemberId?: Maybe<Scalars['UUID']['output']>;
  status: Scalars['String']['output'];
  threadId: Scalars['UUID']['output'];
  turnId?: Maybe<Scalars['UUID']['output']>;
};

export type AgentMessagePart = {
  __typename?: 'AgentMessagePart';
  createdAt: Scalars['DateTime']['output'];
  errorMessage?: Maybe<Scalars['String']['output']>;
  fileFilename?: Maybe<Scalars['String']['output']>;
  fileId?: Maybe<Scalars['UUID']['output']>;
  fileMediaType?: Maybe<Scalars['String']['output']>;
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  messageId: Scalars['UUID']['output'];
  orderIndex: Scalars['Int']['output'];
  providerExecuted?: Maybe<Scalars['Boolean']['output']>;
  providerMetadata?: Maybe<Scalars['JSON']['output']>;
  reasoningContent?: Maybe<Scalars['String']['output']>;
  sourceDocumentFilename?: Maybe<Scalars['String']['output']>;
  sourceDocumentMediaType?: Maybe<Scalars['String']['output']>;
  sourceDocumentSourceId?: Maybe<Scalars['String']['output']>;
  sourceDocumentTitle?: Maybe<Scalars['String']['output']>;
  sourceUrlSourceId?: Maybe<Scalars['String']['output']>;
  sourceUrlTitle?: Maybe<Scalars['String']['output']>;
  sourceUrlUrl?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  textContent?: Maybe<Scalars['String']['output']>;
  toolCallId?: Maybe<Scalars['String']['output']>;
  toolInput?: Maybe<Scalars['JSON']['output']>;
  toolName?: Maybe<Scalars['String']['output']>;
  toolOutput?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
};

export type AgentMessageReactionSummary = {
  __typename?: 'AgentMessageReactionSummary';
  agentIds: Array<Scalars['UUID']['output']>;
  emoji: Scalars['String']['output'];
  hasAssistantReacted: Scalars['Boolean']['output'];
  workspaceMemberIds: Array<Scalars['UUID']['output']>;
};

export type AgentRun = {
  __typename?: 'AgentRun';
  createdAt: Scalars['DateTime']['output'];
  creatorName: Scalars['String']['output'];
  creatorSource: Scalars['String']['output'];
  credits?: Maybe<Scalars['Float']['output']>;
  endedAt?: Maybe<Scalars['DateTime']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  input?: Maybe<Scalars['String']['output']>;
  inputTokens?: Maybe<Scalars['Int']['output']>;
  modelId?: Maybe<Scalars['String']['output']>;
  outputTokens?: Maybe<Scalars['Int']['output']>;
  reply?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: AgentTurnStatus;
  threadId: Scalars['UUID']['output'];
  threadTitle?: Maybe<Scalars['String']['output']>;
  toolNames: Array<Scalars['String']['output']>;
};

export enum AgentTurnStatus {
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  WAITING_FOR_INPUT = 'WAITING_FOR_INPUT'
}

export type AggregateChartConfiguration = {
  __typename?: 'AggregateChartConfiguration';
  aggregateFieldMetadataId: Scalars['UUID']['output'];
  aggregateOperation: AggregateOperations;
  configurationType: WidgetConfigurationType;
  description?: Maybe<Scalars['String']['output']>;
  displayDataLabel?: Maybe<Scalars['Boolean']['output']>;
  filter?: Maybe<Scalars['JSON']['output']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  numberFormat?: Maybe<ChartNumberFormat>;
  prefix?: Maybe<Scalars['String']['output']>;
  ratioAggregateConfig?: Maybe<RatioAggregateConfig>;
  suffix?: Maybe<Scalars['String']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
};

export enum AggregateOperations {
  AVG = 'AVG',
  COUNT = 'COUNT',
  COUNT_EMPTY = 'COUNT_EMPTY',
  COUNT_FALSE = 'COUNT_FALSE',
  COUNT_NOT_EMPTY = 'COUNT_NOT_EMPTY',
  COUNT_TRUE = 'COUNT_TRUE',
  COUNT_UNIQUE_VALUES = 'COUNT_UNIQUE_VALUES',
  MAX = 'MAX',
  MIN = 'MIN',
  PERCENTAGE_EMPTY = 'PERCENTAGE_EMPTY',
  PERCENTAGE_NOT_EMPTY = 'PERCENTAGE_NOT_EMPTY',
  SUM = 'SUM'
}

export type AiChatUsage = {
  __typename?: 'AiChatUsage';
  consumedValue?: Maybe<Scalars['BigInt']['output']>;
  kind: Scalars['String']['output'];
  limitValue: Scalars['BigInt']['output'];
  periodEnd?: Maybe<Scalars['DateTime']['output']>;
};

export type AiChatUserCreditsUsage = {
  __typename?: 'AiChatUserCreditsUsage';
  consumedValue?: Maybe<Scalars['BigInt']['output']>;
  limitValue: Scalars['BigInt']['output'];
  periodEnd: Scalars['DateTime']['output'];
};

export enum AiModelTier {
  balanced = 'balanced',
  extraFast = 'extraFast',
  extraSmart = 'extraSmart',
  fast = 'fast',
  smart = 'smart'
}

export type AiSystemPromptPreview = {
  __typename?: 'AiSystemPromptPreview';
  estimatedTokenCount: Scalars['Int']['output'];
  sections: Array<AiSystemPromptSection>;
};

export type AiSystemPromptSection = {
  __typename?: 'AiSystemPromptSection';
  content: Scalars['String']['output'];
  estimatedTokenCount: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export enum AllMetadataName {
  agent = 'agent',
  agentChatChannel = 'agentChatChannel',
  agentChatChannelRole = 'agentChatChannelRole',
  applicationVariable = 'applicationVariable',
  commandMenuItem = 'commandMenuItem',
  connectionProvider = 'connectionProvider',
  fieldMetadata = 'fieldMetadata',
  fieldPermission = 'fieldPermission',
  frontComponent = 'frontComponent',
  index = 'index',
  logicFunction = 'logicFunction',
  mcpServer = 'mcpServer',
  messagingProvider = 'messagingProvider',
  navigationMenuItem = 'navigationMenuItem',
  objectMetadata = 'objectMetadata',
  objectPermission = 'objectPermission',
  pageLayout = 'pageLayout',
  pageLayoutTab = 'pageLayoutTab',
  pageLayoutWidget = 'pageLayoutWidget',
  permissionFlag = 'permissionFlag',
  role = 'role',
  rolePermissionFlag = 'rolePermissionFlag',
  roleTarget = 'roleTarget',
  rowLevelPermissionPredicate = 'rowLevelPermissionPredicate',
  rowLevelPermissionPredicateGroup = 'rowLevelPermissionPredicateGroup',
  searchFieldMetadata = 'searchFieldMetadata',
  settingsMenuItem = 'settingsMenuItem',
  skill = 'skill',
  timelineActivityType = 'timelineActivityType',
  validationRule = 'validationRule',
  view = 'view',
  viewField = 'viewField',
  viewFieldGroup = 'viewFieldGroup',
  viewFilter = 'viewFilter',
  viewFilterGroup = 'viewFilterGroup',
  viewGroup = 'viewGroup',
  viewSort = 'viewSort',
  webhook = 'webhook',
  workflow = 'workflow',
  workflowVersion = 'workflowVersion'
}

export type Analytics = {
  __typename?: 'Analytics';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export enum AnalyticsType {
  PAGEVIEW = 'PAGEVIEW',
  TRACK = 'TRACK'
}

export type ApiConfig = {
  __typename?: 'ApiConfig';
  mutationMaximumAffectedRecords: Scalars['Float']['output'];
};

export type ApiKey = {
  __typename?: 'ApiKey';
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
  role: Role;
  updatedAt: Scalars['DateTime']['output'];
};

export type ApiKeyForRole = {
  __typename?: 'ApiKeyForRole';
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ApiKeyToken = {
  __typename?: 'ApiKeyToken';
  token: Scalars['String']['output'];
};

export type AppConnection = {
  __typename?: 'AppConnection';
  accessToken?: Maybe<Scalars['String']['output']>;
  authFailedAt?: Maybe<Scalars['String']['output']>;
  authFailedReason?: Maybe<Scalars['String']['output']>;
  externalAccountId?: Maybe<Scalars['String']['output']>;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  providerName: Scalars['String']['output'];
  providerType: Scalars['String']['output'];
  scope: ConnectedAccountScope;
  scopes: Array<Scalars['String']['output']>;
  userWorkspaceId: Scalars['String']['output'];
  /** @deprecated Use scope instead. */
  visibility: Scalars['String']['output'];
  workspaceMemberId?: Maybe<Scalars['String']['output']>;
};

export type AppKeyValue = {
  __typename?: 'AppKeyValue';
  key: Scalars['String']['output'];
  scope: AppKeyValueScope;
  value?: Maybe<Scalars['JSON']['output']>;
};

/** WORKSPACE entries are private to one workspace install of the application. SERVER entries are shared across every install: the value is always the claiming workspaceId and only that workspace can overwrite or delete the key. */
export enum AppKeyValueScope {
  SERVER = 'SERVER',
  WORKSPACE = 'WORKSPACE'
}

export type AppMessageFolderInput = {
  externalId: Scalars['String']['input'];
  isSynced?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type AppMessageInput = {
  externalId: Scalars['String']['input'];
  folderExternalIds?: InputMaybe<Array<Scalars['String']['input']>>;
  participants: Array<AppMessageParticipantInput>;
  receivedAt: Scalars['DateTime']['input'];
  subject?: InputMaybe<Scalars['String']['input']>;
  text: Scalars['String']['input'];
  threadExternalId: Scalars['String']['input'];
};

export type AppMessageParticipantInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  handle: Scalars['String']['input'];
  personId?: InputMaybe<Scalars['UUID']['input']>;
  role: MessageParticipantRole;
  workspaceMemberId?: InputMaybe<Scalars['UUID']['input']>;
};

export type Application = {
  __typename?: 'Application';
  agents: Array<Agent>;
  applicationRegistration?: Maybe<ApplicationRegistrationSummary>;
  applicationRegistrationId?: Maybe<Scalars['UUID']['output']>;
  applicationVariables: Array<ApplicationVariable>;
  autoUpgrade: Scalars['Boolean']['output'];
  availablePackages: Scalars['JSON']['output'];
  canBeUninstalled: Scalars['Boolean']['output'];
  commandMenuItems: Array<CommandMenuItem>;
  createdAt: Scalars['DateTime']['output'];
  defaultLogicFunctionRole?: Maybe<Role>;
  defaultRoleId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  frontComponents: Array<FrontComponent>;
  healthCheckLogicFunctionId?: Maybe<Scalars['UUID']['output']>;
  id: Scalars['UUID']['output'];
  isUninstallBlockedByOtherWorkspaceInstallations: Scalars['Boolean']['output'];
  logicFunctions: Array<LogicFunction>;
  logoFileId?: Maybe<Scalars['UUID']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  objects: Array<Object>;
  packageJsonChecksum?: Maybe<Scalars['String']['output']>;
  packageJsonFileId?: Maybe<Scalars['UUID']['output']>;
  settingsCustomTabFrontComponentId?: Maybe<Scalars['UUID']['output']>;
  settingsMenuItems?: Maybe<Array<SettingsMenuItem>>;
  universalIdentifier: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
  yarnLockChecksum?: Maybe<Scalars['String']['output']>;
  yarnLockFileId?: Maybe<Scalars['UUID']['output']>;
};

export type ApplicationAuthorization = {
  __typename?: 'ApplicationAuthorization';
  applicationId: Scalars['UUID']['output'];
  applicationName: Scalars['String']['output'];
  applicationUniversalIdentifier?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  lastAuthorizedAt?: Maybe<Scalars['DateTime']['output']>;
  lastUsedAt: Scalars['DateTime']['output'];
  scopes?: Maybe<Array<Scalars['String']['output']>>;
  workspaceId: Scalars['UUID']['output'];
};

export type ApplicationCapabilityGrant = {
  __typename?: 'ApplicationCapabilityGrant';
  grantedCapabilities: Array<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
};

export type ApplicationConnectedAccountDto = {
  __typename?: 'ApplicationConnectedAccountDTO';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  authFailedAt?: Maybe<Scalars['DateTime']['output']>;
  authFailedReason?: Maybe<Scalars['String']['output']>;
  connectionParameters?: Maybe<PublicImapSmtpCaldavConnectionParameters>;
  connectionProviderId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  handle: Scalars['String']['output'];
  handleAliases?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['UUID']['output'];
  /** @deprecated Ownership no longer gates connection actions, every application admin manages a workspace-shared connection */
  isOwnedByCurrentUser: Scalars['Boolean']['output'];
  lastCredentialsRefreshedAt?: Maybe<Scalars['DateTime']['output']>;
  lastSignedInAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  scope: ConnectedAccountScope;
  scopes?: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Scalars['DateTime']['output'];
  userWorkspaceId: Scalars['UUID']['output'];
  /** @deprecated Use scope instead. */
  visibility: Scalars['String']['output'];
};

export type ApplicationConnectionProvider = {
  __typename?: 'ApplicationConnectionProvider';
  applicationId: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  oauth?: Maybe<ApplicationConnectionProviderOAuthConfig>;
  scope: ConnectionProviderScope;
  type: Scalars['String']['output'];
};

export type ApplicationConnectionProviderOAuthConfig = {
  __typename?: 'ApplicationConnectionProviderOAuthConfig';
  isClientCredentialsConfigured: Scalars['Boolean']['output'];
  scopes: Array<Scalars['String']['output']>;
};

export type ApplicationExport = {
  __typename?: 'ApplicationExport';
  application: ApplicationExportApplication;
  coverage: Array<ApplicationExportCoverageEntry>;
  files: Array<ApplicationExportFile>;
  manifest: Scalars['JSON']['output'];
};

export type ApplicationExportApplication = {
  __typename?: 'ApplicationExportApplication';
  displayName: Scalars['String']['output'];
  sourceType: ApplicationRegistrationSourceType;
  universalIdentifier: Scalars['String']['output'];
};

export type ApplicationExportCoverageEntry = {
  __typename?: 'ApplicationExportCoverageEntry';
  metadataName: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  status: ApplicationExportCoverageStatus;
  universalIdentifier: Scalars['String']['output'];
};

export enum ApplicationExportCoverageStatus {
  ENGINE_DERIVED = 'ENGINE_DERIVED',
  EXCLUDED = 'EXCLUDED',
  EXPORTED = 'EXPORTED',
  FOREIGN_OWNED = 'FOREIGN_OWNED',
  UNSUPPORTED = 'UNSUPPORTED'
}

export type ApplicationExportFile = {
  __typename?: 'ApplicationExportFile';
  content: Scalars['String']['output'];
  folder: Scalars['String']['output'];
  path: Scalars['String']['output'];
};

export type ApplicationFileCompletionError = {
  __typename?: 'ApplicationFileCompletionError';
  fileId: Scalars['UUID']['output'];
  message: Scalars['String']['output'];
};

export type ApplicationFileUploadError = {
  __typename?: 'ApplicationFileUploadError';
  fileFolder: FileFolder;
  filePath: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type ApplicationFileUploadRequestInput = {
  fileFolder: FileFolder;
  filePath: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};

export type ApplicationFileUploadTarget = {
  __typename?: 'ApplicationFileUploadTarget';
  contentType: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  fileFolder: FileFolder;
  fileId: Scalars['UUID']['output'];
  filePath: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type ApplicationHealthCheckAction = {
  __typename?: 'ApplicationHealthCheckAction';
  label: Scalars['String']['output'];
  location?: Maybe<Scalars['String']['output']>;
};

export type ApplicationHealthCheckResult = {
  __typename?: 'ApplicationHealthCheckResult';
  action?: Maybe<ApplicationHealthCheckAction>;
  description?: Maybe<Scalars['String']['output']>;
  status: ApplicationHealthStatus;
  title?: Maybe<Scalars['String']['output']>;
};

export enum ApplicationHealthStatus {
  ERROR = 'ERROR',
  INFO = 'INFO',
  NEUTRAL = 'NEUTRAL',
  OK = 'OK',
  SUCCESS = 'SUCCESS',
  UNKNOWN = 'UNKNOWN',
  WARNING = 'WARNING'
}

export type ApplicationMonitoring = {
  __typename?: 'ApplicationMonitoring';
  activity: Array<ApplicationMonitoringActivityBucket>;
  bucketSizeInSeconds: Scalars['Int']['output'];
  creditUsage?: Maybe<Array<ApplicationMonitoringCreditBucket>>;
  creditsUsed?: Maybe<Scalars['Float']['output']>;
  failedRunCount: Scalars['Int']['output'];
  functions: Array<ApplicationMonitoringFunction>;
  issues: Array<ApplicationMonitoringIssue>;
  lifecycle: Array<ApplicationMonitoringLifecycleBucket>;
  lifecycleFailureCount: Scalars['Int']['output'];
  lookbackInHours: Scalars['Int']['output'];
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
  rateLimitEventCount: Scalars['Int']['output'];
  runCount: Scalars['Int']['output'];
  versions: Array<ApplicationMonitoringVersion>;
};

export type ApplicationMonitoringActivityBucket = {
  __typename?: 'ApplicationMonitoringActivityBucket';
  bucketStart: Scalars['DateTime']['output'];
  errorCount: Scalars['Int']['output'];
  rateLimitedJobCount: Scalars['Int']['output'];
  rateLimitedRequestCount: Scalars['Int']['output'];
};

export type ApplicationMonitoringCreditBucket = {
  __typename?: 'ApplicationMonitoringCreditBucket';
  bucketStart: Scalars['DateTime']['output'];
  creditsUsed: Scalars['Float']['output'];
  operationType: Scalars['String']['output'];
};

export type ApplicationMonitoringFunction = {
  __typename?: 'ApplicationMonitoringFunction';
  failedRunCount: Scalars['Int']['output'];
  logicFunctionName: Scalars['String']['output'];
  p95DurationMs: Scalars['Float']['output'];
  runCount: Scalars['Int']['output'];
};

export type ApplicationMonitoringIssue = {
  __typename?: 'ApplicationMonitoringIssue';
  affectedInstallCount: Scalars['Int']['output'];
  errorCode: Scalars['String']['output'];
  eventCount: Scalars['Int']['output'];
  lastSeenAt: Scalars['DateTime']['output'];
  level: Scalars['String']['output'];
  logicFunctionName: Scalars['String']['output'];
  source: Scalars['String']['output'];
  versions: Array<Scalars['String']['output']>;
};

export type ApplicationMonitoringLifecycleBucket = {
  __typename?: 'ApplicationMonitoringLifecycleBucket';
  bucketStart: Scalars['DateTime']['output'];
  failedCount: Scalars['Int']['output'];
  installCount: Scalars['Int']['output'];
  uninstallCount: Scalars['Int']['output'];
  upgradeCount: Scalars['Int']['output'];
};

export type ApplicationMonitoringVersion = {
  __typename?: 'ApplicationMonitoringVersion';
  activeInstallCount: Scalars['Int']['output'];
  failedRunCount: Scalars['Int']['output'];
  runCount: Scalars['Int']['output'];
  version: Scalars['String']['output'];
};

export type ApplicationPreferences = {
  __typename?: 'ApplicationPreferences';
  applicationId: Scalars['UUID']['output'];
  connectionProviders: Array<ApplicationConnectionProvider>;
  settingsMenuItems: Array<SettingsMenuItem>;
  variables: Array<UserApplicationVariableValue>;
};

export type ApplicationRegistration = {
  __typename?: 'ApplicationRegistration';
  createdAt: Scalars['DateTime']['output'];
  galleryImagesUrls: Array<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isConfigured: Scalars['Boolean']['output'];
  isListed: Scalars['Boolean']['output'];
  isPreInstalled: Scalars['Boolean']['output'];
  isVetted: Scalars['Boolean']['output'];
  latestAvailableVersion?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  oAuthClientId: Scalars['String']['output'];
  oAuthRedirectUris: Array<Scalars['String']['output']>;
  oAuthScopes: Array<Scalars['String']['output']>;
  ownerWorkspaceId?: Maybe<Scalars['UUID']['output']>;
  sourcePackage?: Maybe<Scalars['String']['output']>;
  sourceType: ApplicationRegistrationSourceType;
  universalIdentifier: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum ApplicationRegistrationSourceType {
  LOCAL = 'LOCAL',
  NPM = 'NPM',
  OAUTH_ONLY = 'OAUTH_ONLY',
  TARBALL = 'TARBALL'
}

export type ApplicationRegistrationStats = {
  __typename?: 'ApplicationRegistrationStats';
  activeInstalls: Scalars['Int']['output'];
  autoUpdateEnabled: Scalars['Int']['output'];
  creditsUsedBreakdown?: Maybe<Array<CreditUsedItem>>;
  mostInstalledVersion?: Maybe<Scalars['String']['output']>;
  suspendedInstalls: Scalars['Int']['output'];
  totalCreditsUsed?: Maybe<Scalars['Float']['output']>;
  versionDistribution: Array<VersionDistributionEntry>;
};

export type ApplicationRegistrationSummary = {
  __typename?: 'ApplicationRegistrationSummary';
  id: Scalars['UUID']['output'];
  latestAvailableVersion?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  sourceType: ApplicationRegistrationSourceType;
};

export type ApplicationRegistrationVariable = {
  __typename?: 'ApplicationRegistrationVariable';
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isDeprecated: Scalars['Boolean']['output'];
  isFilled: Scalars['Boolean']['output'];
  isRequired: Scalars['Boolean']['output'];
  isSecret: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  options?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type ApplicationTokenPair = {
  __typename?: 'ApplicationTokenPair';
  applicationAccessToken: AuthToken;
  applicationRefreshToken: AuthToken;
};

export type ApplicationVariable = {
  __typename?: 'ApplicationVariable';
  description: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isDeprecated: Scalars['Boolean']['output'];
  isRequired: Scalars['Boolean']['output'];
  isSecret: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  options?: Maybe<Scalars['JSON']['output']>;
  scope: ApplicationVariableScope;
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export enum ApplicationVariableScope {
  USER = 'USER',
  WORKSPACE = 'WORKSPACE'
}

export type ApprovedAccessDomain = {
  __typename?: 'ApprovedAccessDomain';
  createdAt: Scalars['DateTime']['output'];
  domain: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isValidated: Scalars['Boolean']['output'];
};

export type AuthBypassProviders = {
  __typename?: 'AuthBypassProviders';
  google: Scalars['Boolean']['output'];
  microsoft: Scalars['Boolean']['output'];
  password: Scalars['Boolean']['output'];
};

export type AuthProviders = {
  __typename?: 'AuthProviders';
  google: Scalars['Boolean']['output'];
  magicLink: Scalars['Boolean']['output'];
  microsoft: Scalars['Boolean']['output'];
  password: Scalars['Boolean']['output'];
  sso: Array<SsoIdentityProvider>;
};

export type AuthToken = {
  __typename?: 'AuthToken';
  expiresAt: Scalars['DateTime']['output'];
  token: Scalars['String']['output'];
};

export type AuthTokenPair = {
  __typename?: 'AuthTokenPair';
  accessOrWorkspaceAgnosticToken: AuthToken;
  refreshToken: AuthToken;
};

export type AuthTokens = {
  __typename?: 'AuthTokens';
  tokens: AuthTokenPair;
};

export type AuthorizeApp = {
  __typename?: 'AuthorizeApp';
  redirectUrl: Scalars['String']['output'];
};

export type AutocompleteResult = {
  __typename?: 'AutocompleteResult';
  placeId: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type AvailableWorkspace = {
  __typename?: 'AvailableWorkspace';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  inviteHash?: Maybe<Scalars['String']['output']>;
  loginToken?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  personalInviteToken?: Maybe<Scalars['String']['output']>;
  sso: Array<SsoConnection>;
  workspaceUrls: WorkspaceUrls;
};

export type AvailableWorkspaces = {
  __typename?: 'AvailableWorkspaces';
  availableWorkspacesForSignIn: Array<AvailableWorkspace>;
  availableWorkspacesForSignUp: Array<AvailableWorkspace>;
};

export type AvailableWorkspacesAndAccessTokens = {
  __typename?: 'AvailableWorkspacesAndAccessTokens';
  availableWorkspaces: AvailableWorkspaces;
  tokens: AuthTokenPair;
};

/** Which axes should display labels */
export enum AxisNameDisplay {
  BOTH = 'BOTH',
  NONE = 'NONE',
  X = 'X',
  Y = 'Y'
}

export type BarChartConfiguration = {
  __typename?: 'BarChartConfiguration';
  aggregateFieldMetadataId: Scalars['UUID']['output'];
  aggregateOperation: AggregateOperations;
  axisNameDisplay?: Maybe<AxisNameDisplay>;
  color?: Maybe<Scalars['String']['output']>;
  configurationType: WidgetConfigurationType;
  description?: Maybe<Scalars['String']['output']>;
  displayDataLabel?: Maybe<Scalars['Boolean']['output']>;
  displayLegend?: Maybe<Scalars['Boolean']['output']>;
  filter?: Maybe<Scalars['JSON']['output']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']['output']>;
  groupMode?: Maybe<BarChartGroupMode>;
  isCumulative?: Maybe<Scalars['Boolean']['output']>;
  layout: BarChartLayout;
  numberFormat?: Maybe<ChartNumberFormat>;
  omitNullValues?: Maybe<Scalars['Boolean']['output']>;
  primaryAxisDateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  primaryAxisGroupByFieldMetadataId: Scalars['UUID']['output'];
  primaryAxisGroupBySubFieldName?: Maybe<Scalars['String']['output']>;
  primaryAxisManualSortOrder?: Maybe<Array<Scalars['String']['output']>>;
  primaryAxisOrderBy?: Maybe<GraphOrderBy>;
  rangeMax?: Maybe<Scalars['Float']['output']>;
  rangeMin?: Maybe<Scalars['Float']['output']>;
  secondaryAxisGroupByDateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  secondaryAxisGroupByFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  secondaryAxisGroupBySubFieldName?: Maybe<Scalars['String']['output']>;
  secondaryAxisManualSortOrder?: Maybe<Array<Scalars['String']['output']>>;
  secondaryAxisOrderBy?: Maybe<GraphOrderBy>;
  splitMultiValueFields?: Maybe<Scalars['Boolean']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
};

export type BarChartData = {
  __typename?: 'BarChartData';
  data: Array<Scalars['JSON']['output']>;
  formattedToRawLookup: Scalars['JSON']['output'];
  groupMode: BarChartGroupMode;
  hasTooManyGroups: Scalars['Boolean']['output'];
  indexBy: Scalars['String']['output'];
  keys: Array<Scalars['String']['output']>;
  layout: BarChartLayout;
  series: Array<BarChartSeries>;
  showDataLabels: Scalars['Boolean']['output'];
  showLegend: Scalars['Boolean']['output'];
  xAxisLabel: Scalars['String']['output'];
  yAxisLabel: Scalars['String']['output'];
};

export type BarChartDataInput = {
  configuration: Scalars['JSON']['input'];
  objectMetadataId: Scalars['UUID']['input'];
};

/** Display mode for bar charts with secondary grouping */
export enum BarChartGroupMode {
  GROUPED = 'GROUPED',
  STACKED = 'STACKED'
}

/** Layout orientation for bar charts */
export enum BarChartLayout {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

export type BarChartSeries = {
  __typename?: 'BarChartSeries';
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type Billing = {
  __typename?: 'Billing';
  billingUrl?: Maybe<Scalars['String']['output']>;
  isBillingEnabled: Scalars['Boolean']['output'];
  stripePublishableKey?: Maybe<Scalars['String']['output']>;
  trialPeriods: Array<BillingTrialPeriod>;
};

export type BillingCustomer = {
  __typename?: 'BillingCustomer';
  hasPaymentMethod?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['UUID']['output'];
  userCreditsFallback: UserCreditsFallback;
};

export type BillingEndTrialPeriod = {
  __typename?: 'BillingEndTrialPeriod';
  /** Billing portal URL for payment method update (returned when no payment method exists) */
  billingPortalUrl?: Maybe<Scalars['String']['output']>;
  /** All billing subscriptions */
  billingSubscriptions?: Maybe<Array<BillingSubscription>>;
  /** Updated current billing subscription */
  currentBillingSubscription?: Maybe<BillingSubscription>;
  /** Boolean that confirms if a payment method was found */
  hasPaymentMethod: Scalars['Boolean']['output'];
  /** Updated subscription status */
  status?: Maybe<SubscriptionStatus>;
};

export type BillingEntitlement = {
  __typename?: 'BillingEntitlement';
  key: BillingEntitlementKey;
  value: Scalars['Boolean']['output'];
};

export enum BillingEntitlementKey {
  AUDIT_LOGS = 'AUDIT_LOGS',
  CUSTOM_DOMAIN = 'CUSTOM_DOMAIN',
  CUSTOM_ROLES = 'CUSTOM_ROLES',
  RECORD_SHARING = 'RECORD_SHARING',
  RLS = 'RLS',
  SSO = 'SSO',
  USAGE_LIMIT = 'USAGE_LIMIT',
  VALIDATION_RULES = 'VALIDATION_RULES'
}

export type BillingLicensedProduct = BillingProductDto & {
  __typename?: 'BillingLicensedProduct';
  description: Scalars['String']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String']['output'];
  prices?: Maybe<Array<BillingPriceLicensed>>;
};

export type BillingMeteredProduct = BillingProductDto & {
  __typename?: 'BillingMeteredProduct';
  description: Scalars['String']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String']['output'];
  prices?: Maybe<Array<BillingPriceMetered>>;
};

export type BillingPaymentIntent = {
  __typename?: 'BillingPaymentIntent';
  clientSecret: Scalars['String']['output'];
  paymentIntentType: Scalars['String']['output'];
};

export type BillingPlan = {
  __typename?: 'BillingPlan';
  baseProducts: Array<BillingLicensedProduct>;
  downgradePlanKeys: Array<BillingPlanKey>;
  isCheckoutDefault: Scalars['Boolean']['output'];
  isSellable: Scalars['Boolean']['output'];
  meteredProducts: Array<BillingMeteredProduct>;
  planKey: BillingPlanKey;
  resourceCreditProducts: Array<BillingLicensedProduct>;
  upgradePlanKeys: Array<BillingPlanKey>;
};

/** The different billing plans available */
export enum BillingPlanKey {
  ENTERPRISE = 'ENTERPRISE',
  ORGANIZATION_V2 = 'ORGANIZATION_V2',
  PRO = 'PRO',
  PRO_V2 = 'PRO_V2'
}

export type BillingPriceLicensed = {
  __typename?: 'BillingPriceLicensed';
  creditAmount?: Maybe<Scalars['Float']['output']>;
  isSellable: Scalars['Boolean']['output'];
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String']['output'];
  unitAmount: Scalars['Float']['output'];
};

export type BillingPriceMetered = {
  __typename?: 'BillingPriceMetered';
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String']['output'];
  tiers: Array<BillingPriceTier>;
};

export type BillingPriceTier = {
  __typename?: 'BillingPriceTier';
  flatAmount?: Maybe<Scalars['Float']['output']>;
  unitAmount?: Maybe<Scalars['Float']['output']>;
  upTo?: Maybe<Scalars['Float']['output']>;
};

export type BillingProduct = {
  __typename?: 'BillingProduct';
  description: Scalars['String']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String']['output'];
};

export type BillingProductDto = {
  description: Scalars['String']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String']['output'];
};

/** The different billing products available */
export enum BillingProductKey {
  BASE_PRODUCT = 'BASE_PRODUCT',
  RESOURCE_CREDIT = 'RESOURCE_CREDIT'
}

export type BillingProductMetadata = {
  __typename?: 'BillingProductMetadata';
  isLegacy?: Maybe<Scalars['String']['output']>;
  planKey: BillingPlanKey;
  priceUsageBased: BillingUsageType;
  productKey: BillingProductKey;
};

export type BillingResourceCreditUsage = {
  __typename?: 'BillingResourceCreditUsage';
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
  productKey: BillingProductKey;
  unitPriceCents: Scalars['Float']['output'];
  userCreditsUsed: Scalars['Float']['output'];
  workspaceCreditsExtraGranted: Scalars['Float']['output'];
  workspaceCreditsGranted: Scalars['Float']['output'];
  workspaceCreditsGrantedForSeats: Scalars['Float']['output'];
  workspaceCreditsSeats: Scalars['Int']['output'];
  workspaceCreditsTotalGranted: Scalars['Float']['output'];
  workspaceCreditsUsed: Scalars['Float']['output'];
};

export type BillingSession = {
  __typename?: 'BillingSession';
  url?: Maybe<Scalars['String']['output']>;
};

export type BillingSubscription = {
  __typename?: 'BillingSubscription';
  billingSubscriptionItems?: Maybe<Array<BillingSubscriptionItem>>;
  cancelAt?: Maybe<Scalars['DateTime']['output']>;
  collectionMethod?: Maybe<BillingSubscriptionCollectionMethod>;
  currentPeriodEnd?: Maybe<Scalars['DateTime']['output']>;
  hasUserCredits?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['UUID']['output'];
  interval?: Maybe<SubscriptionInterval>;
  metadata: Scalars['JSON']['output'];
  phases: Array<BillingSubscriptionSchedulePhase>;
  status: SubscriptionStatus;
};

export enum BillingSubscriptionCollectionMethod {
  CHARGE_AUTOMATICALLY = 'CHARGE_AUTOMATICALLY',
  SEND_INVOICE = 'SEND_INVOICE'
}

export type BillingSubscriptionItem = {
  __typename?: 'BillingSubscriptionItem';
  billingProduct: BillingProductDto;
  creditAmount?: Maybe<Scalars['Float']['output']>;
  hasReachedCurrentPeriodCap: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  quantity?: Maybe<Scalars['Float']['output']>;
  stripePriceId: Scalars['String']['output'];
  unitAmount?: Maybe<Scalars['Float']['output']>;
};

export type BillingSubscriptionSchedulePhase = {
  __typename?: 'BillingSubscriptionSchedulePhase';
  end_date: Scalars['Float']['output'];
  items: Array<BillingSubscriptionSchedulePhaseItem>;
  start_date: Scalars['Float']['output'];
};

export type BillingSubscriptionSchedulePhaseItem = {
  __typename?: 'BillingSubscriptionSchedulePhaseItem';
  price: Scalars['String']['output'];
  quantity?: Maybe<Scalars['Float']['output']>;
};

export type BillingTrialPeriod = {
  __typename?: 'BillingTrialPeriod';
  duration: Scalars['Float']['output'];
  isCreditCardRequired: Scalars['Boolean']['output'];
};

export type BillingUpdate = {
  __typename?: 'BillingUpdate';
  /** All billing subscriptions */
  billingSubscriptions: Array<BillingSubscription>;
  /** Current billing subscription */
  currentBillingSubscription: BillingSubscription;
};

export enum BillingUsageType {
  LICENSED = 'LICENSED',
  METERED = 'METERED'
}

export type BooleanFieldComparison = {
  is?: InputMaybe<Scalars['Boolean']['input']>;
  isNot?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CalendarChannel = {
  __typename?: 'CalendarChannel';
  connectedAccountId: Scalars['UUID']['output'];
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;
  createdAt: Scalars['DateTime']['output'];
  excludePrivateEvents: Scalars['Boolean']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isContactAutoCreationEnabled: Scalars['Boolean']['output'];
  isSyncEnabled: Scalars['Boolean']['output'];
  syncStage: CalendarChannelSyncStage;
  syncStageStartedAt?: Maybe<Scalars['DateTime']['output']>;
  syncStatus: CalendarChannelSyncStatus;
  syncedAt?: Maybe<Scalars['DateTime']['output']>;
  throttleFailureCount: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  visibility: CalendarChannelVisibility;
};

export enum CalendarChannelContactAutoCreationPolicy {
  AS_ORGANIZER = 'AS_ORGANIZER',
  AS_PARTICIPANT = 'AS_PARTICIPANT',
  AS_PARTICIPANT_AND_ORGANIZER = 'AS_PARTICIPANT_AND_ORGANIZER',
  NONE = 'NONE'
}

export enum CalendarChannelSyncStage {
  CALENDAR_EVENTS_IMPORT_ONGOING = 'CALENDAR_EVENTS_IMPORT_ONGOING',
  CALENDAR_EVENTS_IMPORT_PENDING = 'CALENDAR_EVENTS_IMPORT_PENDING',
  CALENDAR_EVENTS_IMPORT_SCHEDULED = 'CALENDAR_EVENTS_IMPORT_SCHEDULED',
  CALENDAR_EVENT_LIST_FETCH_ONGOING = 'CALENDAR_EVENT_LIST_FETCH_ONGOING',
  CALENDAR_EVENT_LIST_FETCH_PENDING = 'CALENDAR_EVENT_LIST_FETCH_PENDING',
  CALENDAR_EVENT_LIST_FETCH_SCHEDULED = 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED',
  FAILED = 'FAILED',
  PENDING_CONFIGURATION = 'PENDING_CONFIGURATION'
}

export enum CalendarChannelSyncStatus {
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING'
}

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING'
}

export type CalendarConfiguration = {
  __typename?: 'CalendarConfiguration';
  configurationType: WidgetConfigurationType;
};

export type CallRecordingSummaryConfiguration = {
  __typename?: 'CallRecordingSummaryConfiguration';
  configurationType: WidgetConfigurationType;
};

export type CallRecordingTranscriptConfiguration = {
  __typename?: 'CallRecordingTranscriptConfiguration';
  configurationType: WidgetConfigurationType;
};

export type CampaignAudiencePreviewDto = {
  __typename?: 'CampaignAudiencePreviewDTO';
  duplicateEmails: Scalars['Int']['output'];
  globallyUnsubscribed: Scalars['Int']['output'];
  hardSuppressed: Scalars['Int']['output'];
  sendable: Scalars['Int']['output'];
  topicUnsubscribed: Scalars['Int']['output'];
  totalMembers: Scalars['Int']['output'];
  trackingRefused: Scalars['Int']['output'];
  withoutEmail: Scalars['Int']['output'];
};

export type CancelMessageCampaignInput = {
  campaignId: Scalars['String']['input'];
};

export type CancelMessageCampaignOutputDto = {
  __typename?: 'CancelMessageCampaignOutputDTO';
  campaignId: Scalars['String']['output'];
  canceledMessageCount: Scalars['Int']['output'];
};

export type Captcha = {
  __typename?: 'Captcha';
  provider?: Maybe<CaptchaDriverType>;
  siteKey?: Maybe<Scalars['String']['output']>;
};

export enum CaptchaDriverType {
  GOOGLE_RECAPTCHA = 'GOOGLE_RECAPTCHA',
  TURNSTILE = 'TURNSTILE'
}

export type ChannelSyncSuccess = {
  __typename?: 'ChannelSyncSuccess';
  success: Scalars['Boolean']['output'];
};

/** Format used to display the chart value */
export enum ChartNumberFormat {
  FULL = 'FULL',
  SHORT = 'SHORT'
}

export type ChatConfiguration = {
  __typename?: 'ChatConfiguration';
  configurationType: WidgetConfigurationType;
};

export type ChatStreamCatchupChunks = {
  __typename?: 'ChatStreamCatchupChunks';
  chunks: Array<Scalars['JSON']['output']>;
  error?: Maybe<ChatStreamError>;
  maxSeq: Scalars['Int']['output'];
};

export type ChatStreamError = {
  __typename?: 'ChatStreamError';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type ChatThreadsConfiguration = {
  __typename?: 'ChatThreadsConfiguration';
  configurationType: WidgetConfigurationType;
};

export type CheckUserExist = {
  __typename?: 'CheckUserExist';
  availableWorkspacesCount: Scalars['Float']['output'];
  exists: Scalars['Boolean']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
};

export type ClaimableApplicationRegistration = {
  __typename?: 'ClaimableApplicationRegistration';
  author?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isOwned: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  sourcePackage?: Maybe<Scalars['String']['output']>;
  universalIdentifier: Scalars['String']['output'];
};

export type ClientAiEvaluationModelConfig = {
  __typename?: 'ClientAiEvaluationModelConfig';
  description?: Maybe<Scalars['String']['output']>;
  inputCostPerMillionTokens?: Maybe<Scalars['Float']['output']>;
  isAvailable: Scalars['Boolean']['output'];
  isDeprecated?: Maybe<Scalars['Boolean']['output']>;
  label: Scalars['String']['output'];
  maxCriteriaPerQuestion?: Maybe<Scalars['Float']['output']>;
  maxScoreLevels?: Maybe<Scalars['Float']['output']>;
  medianLatencyMs?: Maybe<Scalars['Float']['output']>;
  modelId: Scalars['String']['output'];
  outputCostPerMillionTokens?: Maybe<Scalars['Float']['output']>;
  providerLabel?: Maybe<Scalars['String']['output']>;
  supportedQuestionTypes: Array<Scalars['String']['output']>;
};

export type ClientAiModelConfig = {
  __typename?: 'ClientAiModelConfig';
  contextWindowTokens?: Maybe<Scalars['Float']['output']>;
  costPerTask?: Maybe<Scalars['Float']['output']>;
  dataResidency?: Maybe<Scalars['String']['output']>;
  effort?: Maybe<Scalars['String']['output']>;
  efforts?: Maybe<Array<Scalars['String']['output']>>;
  inputCostPerMillionTokens?: Maybe<Scalars['Float']['output']>;
  intelligenceIndex?: Maybe<Scalars['Float']['output']>;
  isBenchmarkInherited?: Maybe<Scalars['Boolean']['output']>;
  isDeprecated?: Maybe<Scalars['Boolean']['output']>;
  label: Scalars['String']['output'];
  maxOutputTokens?: Maybe<Scalars['Float']['output']>;
  modelFamily?: Maybe<ModelFamily>;
  modelFamilyLabel?: Maybe<Scalars['String']['output']>;
  modelId: Scalars['String']['output'];
  nativeCapabilities?: Maybe<NativeModelCapabilities>;
  outputCostPerMillionTokens?: Maybe<Scalars['Float']['output']>;
  outputTokensPerSecond?: Maybe<Scalars['Float']['output']>;
  providerLabel?: Maybe<Scalars['String']['output']>;
  providerName?: Maybe<Scalars['String']['output']>;
  sdkPackage?: Maybe<Scalars['String']['output']>;
};

export type ClientAiModelTierConfig = {
  __typename?: 'ClientAiModelTierConfig';
  modelId: Scalars['String']['output'];
  tier: AiModelTier;
};

export type ClientConfig = {
  __typename?: 'ClientConfig';
  aiEvaluationModels: Array<ClientAiEvaluationModelConfig>;
  aiModelTiers: Array<ClientAiModelTierConfig>;
  aiModels: Array<ClientAiModelConfig>;
  allowRequestsToTwentyIcons: Scalars['Boolean']['output'];
  analyticsEnabled: Scalars['Boolean']['output'];
  api: ApiConfig;
  appVersion?: Maybe<Scalars['String']['output']>;
  authProviders: AuthProviders;
  billing: Billing;
  calendarBookingPageId?: Maybe<Scalars['String']['output']>;
  canManageFeatureFlags: Scalars['Boolean']['output'];
  captcha: Captcha;
  defaultSubdomain?: Maybe<Scalars['String']['output']>;
  enterpriseInstanceType: Scalars['String']['output'];
  frontDomain: Scalars['String']['output'];
  isAttachmentPreviewEnabled: Scalars['Boolean']['output'];
  isBookCallOnboardingStepEnabled: Scalars['Boolean']['output'];
  isClickHouseConfigured: Scalars['Boolean']['output'];
  isCloudflareIntegrationEnabled: Scalars['Boolean']['output'];
  isCompanyEnrichmentEnabled: Scalars['Boolean']['output'];
  isConfigVariablesInDbEnabled: Scalars['Boolean']['output'];
  isCookieSessionEnabled: Scalars['Boolean']['output'];
  isEmailVerificationRequired: Scalars['Boolean']['output'];
  isEmailingDomainInDemoMode: Scalars['Boolean']['output'];
  isGoogleCalendarEnabled: Scalars['Boolean']['output'];
  isGoogleMessagingEnabled: Scalars['Boolean']['output'];
  isImapSmtpCaldavEnabled: Scalars['Boolean']['output'];
  isMicrosoftCalendarEnabled: Scalars['Boolean']['output'];
  isMicrosoftMessagingEnabled: Scalars['Boolean']['output'];
  isMultiWorkspaceEnabled: Scalars['Boolean']['output'];
  isOnboardingAiChatEnabled: Scalars['Boolean']['output'];
  isWorkspaceSchemaDDLLocked: Scalars['Boolean']['output'];
  maintenance?: Maybe<ClientConfigMaintenanceMode>;
  publicFeatureFlags: Array<PublicFeatureFlag>;
  publicFunctionDomain?: Maybe<Scalars['String']['output']>;
  sentry: Sentry;
  serverUrl: Scalars['String']['output'];
  signInPrefilled: Scalars['Boolean']['output'];
  support: Support;
};

export type ClientConfigMaintenanceMode = {
  __typename?: 'ClientConfigMaintenanceMode';
  endAt: Scalars['DateTime']['output'];
  link?: Maybe<Scalars['String']['output']>;
  startAt: Scalars['DateTime']['output'];
};

export type CollectionHash = {
  __typename?: 'CollectionHash';
  collectionName: AllMetadataName;
  hash: Scalars['String']['output'];
};

export type CommandMenuItem = {
  __typename?: 'CommandMenuItem';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  availabilityObjectMetadataId?: Maybe<Scalars['UUID']['output']>;
  availabilityType: CommandMenuItemAvailabilityType;
  conditionalAvailabilityExpression?: Maybe<Scalars['String']['output']>;
  conditionalPinnedExpression?: Maybe<Scalars['String']['output']>;
  coreWorkflowVersionId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  engineComponentKey: EngineComponentKey;
  frontComponent?: Maybe<FrontComponent>;
  frontComponentId?: Maybe<Scalars['UUID']['output']>;
  hotKeys?: Maybe<Array<Scalars['String']['output']>>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isPinned: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  navigationTargetObjectMetadataId?: Maybe<Scalars['UUID']['output']>;
  pageLayoutId?: Maybe<Scalars['UUID']['output']>;
  payload?: Maybe<CommandMenuItemPayload>;
  position: Scalars['Float']['output'];
  shortLabel?: Maybe<Scalars['String']['output']>;
  universalIdentifier?: Maybe<Scalars['UUID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  workflowVersionId?: Maybe<Scalars['UUID']['output']>;
};

export enum CommandMenuItemAvailabilityType {
  FALLBACK = 'FALLBACK',
  GLOBAL = 'GLOBAL',
  GLOBAL_OBJECT_CONTEXT = 'GLOBAL_OBJECT_CONTEXT',
  RECORD_SELECTION = 'RECORD_SELECTION'
}

export type CommandMenuItemPayload = ObjectMetadataCommandMenuItemPayload | PathCommandMenuItemPayload;

export type CompleteApplicationFileUploadsResult = {
  __typename?: 'CompleteApplicationFileUploadsResult';
  errors: Array<ApplicationFileCompletionError>;
  files: Array<File>;
};

export type ConnectedAccountPublicDto = {
  __typename?: 'ConnectedAccountPublicDTO';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  authFailedAt?: Maybe<Scalars['DateTime']['output']>;
  authFailedReason?: Maybe<Scalars['String']['output']>;
  connectionParameters?: Maybe<PublicImapSmtpCaldavConnectionParameters>;
  connectionProviderId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  handle: Scalars['String']['output'];
  handleAliases?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['UUID']['output'];
  lastCredentialsRefreshedAt?: Maybe<Scalars['DateTime']['output']>;
  lastSignedInAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  scope: ConnectedAccountScope;
  scopes?: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Scalars['DateTime']['output'];
  userWorkspaceId: Scalars['UUID']['output'];
  /** @deprecated Use scope instead. */
  visibility: Scalars['String']['output'];
};

export enum ConnectedAccountScope {
  USER = 'USER',
  WORKSPACE = 'WORKSPACE'
}

export type ConnectedImapSmtpCaldavAccount = {
  __typename?: 'ConnectedImapSmtpCaldavAccount';
  connectionParameters?: Maybe<ImapSmtpCaldavPublicConnectionParameters>;
  handle: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  provider: Scalars['String']['output'];
  userWorkspaceId: Scalars['UUID']['output'];
};

export type ConnectionParametersInput = {
  connectionSecurity?: InputMaybe<EmailConnectionSecurity>;
  host: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  port: Scalars['Float']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
};

export enum ConnectionProviderScope {
  USER = 'USER',
  WORKSPACE = 'WORKSPACE'
}

export type CreateAgentChatChannelInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  roleIds?: Array<Scalars['UUID']['input']>;
};

export type CreateAgentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  modelConfiguration?: InputMaybe<Scalars['JSON']['input']>;
  modelId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  prompt: Scalars['String']['input'];
  responseFormat?: InputMaybe<Scalars['JSON']['input']>;
  roleId?: InputMaybe<Scalars['UUID']['input']>;
  triggers?: InputMaybe<Array<Scalars['JSON']['input']>>;
};

export type CreateApiKeyInput = {
  expiresAt: Scalars['String']['input'];
  name: Scalars['String']['input'];
  revokedAt?: InputMaybe<Scalars['String']['input']>;
  roleId: Scalars['UUID']['input'];
};

export type CreateAppMessageChannelInput = {
  connectedAccountId: Scalars['UUID']['input'];
  displayName?: InputMaybe<Scalars['String']['input']>;
  handle: Scalars['String']['input'];
  messagingProviderUniversalIdentifier?: InputMaybe<Scalars['UUID']['input']>;
  participantHandleFieldUniversalIdentifier?: InputMaybe<Scalars['UUID']['input']>;
  visibility: MessageChannelVisibility;
};

export type CreateApplicationFileUploadsResult = {
  __typename?: 'CreateApplicationFileUploadsResult';
  errors: Array<ApplicationFileUploadError>;
  targets: Array<ApplicationFileUploadTarget>;
};

export type CreateApplicationRegistration = {
  __typename?: 'CreateApplicationRegistration';
  applicationRegistration: ApplicationRegistration;
  clientSecret: Scalars['String']['output'];
};

export type CreateApplicationRegistrationInput = {
  name: Scalars['String']['input'];
  oAuthRedirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  oAuthScopes?: InputMaybe<Array<Scalars['String']['input']>>;
  universalIdentifier?: InputMaybe<Scalars['String']['input']>;
};

export type CreateApprovedAccessDomainInput = {
  domain: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type CreateCalendarEventInput = {
  addConferencing?: InputMaybe<Scalars['Boolean']['input']>;
  attendees?: InputMaybe<Scalars['String']['input']>;
  connectedAccountId: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['String']['input'];
  isFullDay?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  sendInvitations?: InputMaybe<Scalars['Boolean']['input']>;
  startsAt: Scalars['String']['input'];
  timeZone?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateCalendarEventOutput = {
  __typename?: 'CreateCalendarEventOutput';
  calendarEventId?: Maybe<Scalars['String']['output']>;
  conferenceLink?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  iCalUid?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CreateCommandMenuItemInput = {
  availabilityObjectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  availabilityType?: InputMaybe<CommandMenuItemAvailabilityType>;
  conditionalAvailabilityExpression?: InputMaybe<Scalars['String']['input']>;
  conditionalPinnedExpression?: InputMaybe<Scalars['String']['input']>;
  coreWorkflowVersionId?: InputMaybe<Scalars['UUID']['input']>;
  engineComponentKey: EngineComponentKey;
  frontComponentId?: InputMaybe<Scalars['UUID']['input']>;
  hotKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  navigationTargetObjectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  pageLayoutId?: InputMaybe<Scalars['UUID']['input']>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  shortLabel?: InputMaybe<Scalars['String']['input']>;
  workflowVersionId?: InputMaybe<Scalars['UUID']['input']>;
};

export type CreateEmailGroupChannelInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  handle: Scalars['String']['input'];
};

export type CreateEmailGroupChannelOutput = {
  __typename?: 'CreateEmailGroupChannelOutput';
  forwardingAddress: Scalars['String']['output'];
  messageChannel: MessageChannel;
};

export type CreateEmailingDomainInput = {
  domain: Scalars['String']['input'];
};

export type CreateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isAuditLogged?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isNullable?: InputMaybe<Scalars['Boolean']['input']>;
  isRemoteCreation?: InputMaybe<Scalars['Boolean']['input']>;
  isSearchable?: InputMaybe<Scalars['Boolean']['input']>;
  isSystem?: InputMaybe<Scalars['Boolean']['input']>;
  isUIEditable?: InputMaybe<Scalars['Boolean']['input']>;
  isUIReadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  isUnique?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  morphRelationsCreationPayload?: InputMaybe<Array<Scalars['JSON']['input']>>;
  name: Scalars['String']['input'];
  objectMetadataId: Scalars['UUID']['input'];
  options?: InputMaybe<Scalars['JSON']['input']>;
  relationCreationPayload?: InputMaybe<Scalars['JSON']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  type: FieldMetadataType;
};

export type CreateFrontComponentInput = {
  builtComponentChecksum: Scalars['String']['input'];
  builtComponentPath: Scalars['String']['input'];
  componentName: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name: Scalars['String']['input'];
  sourceComponentPath: Scalars['String']['input'];
};

export type CreateIndexFieldInput = {
  fieldMetadataId: Scalars['UUID']['input'];
  subFieldName?: InputMaybe<Scalars['String']['input']>;
};

export type CreateIndexInput = {
  fields: Array<CreateIndexFieldInput>;
  indexType?: IndexType;
  objectMetadataId: Scalars['UUID']['input'];
};

export type CreateLogicFunctionFromSourceInput = {
  cronTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  databaseEventTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  httpRouteTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name: Scalars['String']['input'];
  serverRouteTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  source?: InputMaybe<Scalars['JSON']['input']>;
  timeoutSeconds?: InputMaybe<Scalars['Float']['input']>;
  toolTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  universalIdentifier?: InputMaybe<Scalars['UUID']['input']>;
  workflowActionTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
};

export type CreateMcpServerInput = {
  connectionProviderId?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type CreateMessageSuppressionInput = {
  emailAddress: Scalars['String']['input'];
  unsubscribeTopicId?: InputMaybe<Scalars['UUID']['input']>;
};

export type CreateNavigationMenuItemInput = {
  agentChatChannelId?: InputMaybe<Scalars['UUID']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['UUID']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageLayoutId?: InputMaybe<Scalars['UUID']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  targetObjectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  targetRecordId?: InputMaybe<Scalars['UUID']['input']>;
  type: NavigationMenuItemType;
  userWorkspaceId?: InputMaybe<Scalars['UUID']['input']>;
  viewId?: InputMaybe<Scalars['UUID']['input']>;
};

export type CreateObjectInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isRemote?: InputMaybe<Scalars['Boolean']['input']>;
  labelPlural: Scalars['String']['input'];
  labelSingular: Scalars['String']['input'];
  namePlural: Scalars['String']['input'];
  nameSingular: Scalars['String']['input'];
  primaryKeyColumnType?: InputMaybe<Scalars['String']['input']>;
  primaryKeyFieldMetadataSettings?: InputMaybe<Scalars['JSON']['input']>;
  shortcut?: InputMaybe<Scalars['String']['input']>;
  skipNameField?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateOneFieldMetadataInput = {
  /** The record to create */
  field: CreateFieldInput;
};

export type CreateOneIndexInput = {
  /** The custom index to create */
  index: CreateIndexInput;
};

export type CreateOneObjectInput = {
  /** The object to create */
  object: CreateObjectInput;
};

export type CreatePageLayoutInput = {
  name: Scalars['String']['input'];
  objectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<PageLayoutType>;
};

export type CreatePageLayoutTabInput = {
  layoutMode?: InputMaybe<PageLayoutTabLayoutMode>;
  pageLayoutId: Scalars['UUID']['input'];
  position?: InputMaybe<Scalars['Float']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePageLayoutWidgetInput = {
  configuration: Scalars['JSON']['input'];
  objectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  pageLayoutTabId: Scalars['UUID']['input'];
  position?: InputMaybe<Scalars['JSON']['input']>;
  title: Scalars['String']['input'];
  type: WidgetType;
};

export type CreateRecordExportInput = {
  fieldMetadataIds: Array<Scalars['UUID']['input']>;
  filter?: InputMaybe<Scalars['JSON']['input']>;
  objectMetadataId: Scalars['UUID']['input'];
  orderBy?: InputMaybe<Scalars['JSON']['input']>;
};

export type CreateRoleInput = {
  canAccessAllAgentChatChannels?: InputMaybe<Scalars['Boolean']['input']>;
  canAccessAllTools?: InputMaybe<Scalars['Boolean']['input']>;
  canBeAssignedToAgents?: InputMaybe<Scalars['Boolean']['input']>;
  canBeAssignedToApiKeys?: InputMaybe<Scalars['Boolean']['input']>;
  canBeAssignedToUsers?: InputMaybe<Scalars['Boolean']['input']>;
  canDestroyAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canReadAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canSoftDeleteAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllSettings?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
};

export type CreateSkillInput = {
  content: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  label: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateUnsubscribeTopicInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  visibility?: InputMaybe<UnsubscribeTopicVisibility>;
};

export type CreateUsageLimitInput = {
  burstValue?: InputMaybe<Scalars['BigInt']['input']>;
  limitKind: Scalars['String']['input'];
  limitValue: Scalars['BigInt']['input'];
  operationType: UsageOperationType;
  periodCount: Scalars['Int']['input'];
  periodUnit: Scalars['String']['input'];
  resourceType: UsageResourceType;
  spenderId?: InputMaybe<Scalars['String']['input']>;
  spenderType: Scalars['String']['input'];
  unit: UsageUnit;
};

export type CreateValidationRuleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  errorFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  expression: Scalars['String']['input'];
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
  objectMetadataId: Scalars['UUID']['input'];
};

export type CreateViewFieldGroupInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  position?: InputMaybe<Scalars['Float']['input']>;
  viewId: Scalars['UUID']['input'];
};

export type CreateViewFieldInput = {
  aggregateOperation?: InputMaybe<AggregateOperations>;
  fieldMetadataId: Scalars['UUID']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  size?: InputMaybe<Scalars['Float']['input']>;
  viewFieldGroupId?: InputMaybe<Scalars['UUID']['input']>;
  viewId: Scalars['UUID']['input'];
};

export type CreateViewFilterGroupInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  logicalOperator?: InputMaybe<ViewFilterGroupLogicalOperator>;
  parentViewFilterGroupId?: InputMaybe<Scalars['UUID']['input']>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']['input']>;
  viewId: Scalars['UUID']['input'];
};

export type CreateViewFilterInput = {
  fieldMetadataId: Scalars['UUID']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  operand?: InputMaybe<ViewFilterOperand>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']['input']>;
  relationTargetFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  subFieldName?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['JSON']['input'];
  viewFilterGroupId?: InputMaybe<Scalars['UUID']['input']>;
  viewId: Scalars['UUID']['input'];
};

export type CreateViewGroupInput = {
  fieldValue: Scalars['String']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  viewId: Scalars['UUID']['input'];
};

export type CreateViewInput = {
  anyFieldFilterValue?: InputMaybe<Scalars['String']['input']>;
  calendarEndFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  calendarFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  calendarLayout?: InputMaybe<ViewCalendarLayout>;
  groupLoadLimit?: InputMaybe<Scalars['Int']['input']>;
  icon: Scalars['String']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  isCompact?: InputMaybe<Scalars['Boolean']['input']>;
  kanbanAggregateOperation?: InputMaybe<AggregateOperations>;
  kanbanAggregateOperationFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  kanbanColumnWidth?: InputMaybe<Scalars['Int']['input']>;
  key?: InputMaybe<ViewKey>;
  mainGroupByFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  name: Scalars['String']['input'];
  objectMetadataId: Scalars['UUID']['input'];
  /** Deprecated: Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
  openRecordIn?: InputMaybe<ViewOpenRecordIn>;
  position?: InputMaybe<Scalars['Float']['input']>;
  shouldHideEmptyGroups?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<ViewType>;
  visibility?: InputMaybe<ViewVisibility>;
};

export type CreateViewSortInput = {
  direction?: InputMaybe<ViewSortDirection>;
  fieldMetadataId: Scalars['UUID']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  subFieldName?: InputMaybe<Scalars['String']['input']>;
  viewId: Scalars['UUID']['input'];
};

export type CreateWebhookInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  operations: Array<Scalars['String']['input']>;
  secret?: InputMaybe<Scalars['String']['input']>;
  targetUrl: Scalars['String']['input'];
};

export type CreditUsedItem = {
  __typename?: 'CreditUsedItem';
  creditsUsed: Scalars['Float']['output'];
  label?: Maybe<Scalars['String']['output']>;
  operation?: Maybe<UsageOperationType>;
  resource?: Maybe<UsageResourceType>;
};

export type CursorPaging = {
  /** Paginate after opaque cursor */
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  /** Paginate before opaque cursor */
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  /** Paginate first */
  first?: InputMaybe<Scalars['Int']['input']>;
  /** Paginate last */
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Database Event Action */
export enum DatabaseEventAction {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  DESTROYED = 'DESTROYED',
  RESTORED = 'RESTORED',
  UPDATED = 'UPDATED',
  UPSERTED = 'UPSERTED'
}

export type DeleteApprovedAccessDomainInput = {
  id: Scalars['UUID']['input'];
};

export type DeleteOneFieldInput = {
  /** The id of the field to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteOneIndexInput = {
  /** The id of the custom index to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteOneObjectInput = {
  /** The id of the record to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteSso = {
  __typename?: 'DeleteSso';
  identityProviderId: Scalars['UUID']['output'];
};

export type DeleteSsoInput = {
  identityProviderId: Scalars['UUID']['input'];
};

export type DeleteTwoFactorAuthenticationMethod = {
  __typename?: 'DeleteTwoFactorAuthenticationMethod';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type DeleteViewFieldGroupInput = {
  /** The id of the view field group to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteViewFieldInput = {
  /** The id of the view field to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteViewFilterInput = {
  /** The id of the view filter to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteViewGroupInput = {
  /** The id of the view group to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteViewSortInput = {
  /** The id of the view sort to delete. */
  id: Scalars['UUID']['input'];
};

export type DeletedWorkspaceMember = {
  __typename?: 'DeletedWorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name: FullName;
  userEmail: Scalars['String']['output'];
  userWorkspaceId?: Maybe<Scalars['UUID']['output']>;
};

export type DestroyViewFieldGroupInput = {
  /** The id of the view field group to destroy. */
  id: Scalars['UUID']['input'];
};

export type DestroyViewFieldInput = {
  /** The id of the view field to destroy. */
  id: Scalars['UUID']['input'];
};

export type DestroyViewFilterInput = {
  /** The id of the view filter to destroy. */
  id: Scalars['UUID']['input'];
};

export type DestroyViewGroupInput = {
  /** The id of the view group to destroy. */
  id: Scalars['UUID']['input'];
};

export type DestroyViewSortInput = {
  /** The id of the view sort to destroy. */
  id: Scalars['UUID']['input'];
};

export type DevelopmentApplication = {
  __typename?: 'DevelopmentApplication';
  id: Scalars['String']['output'];
  universalIdentifier: Scalars['String']['output'];
};

export type DomainRecord = {
  __typename?: 'DomainRecord';
  key: Scalars['String']['output'];
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
  validationType: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type DomainValidRecords = {
  __typename?: 'DomainValidRecords';
  domain: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isCustomDomainEnabled?: Maybe<Scalars['Boolean']['output']>;
  records: Array<DomainRecord>;
};

export type DuplicatedDashboard = {
  __typename?: 'DuplicatedDashboard';
  createdAt: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  pageLayoutId?: Maybe<Scalars['UUID']['output']>;
  position: Scalars['Float']['output'];
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type DuplicatedMessageList = {
  __typename?: 'DuplicatedMessageList';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  memberCount: Scalars['Float']['output'];
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
};

export type EditSso = {
  __typename?: 'EditSso';
  id: Scalars['UUID']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type EditSsoInput = {
  id: Scalars['UUID']['input'];
  status: SsoIdentityProviderStatus;
};

export type EmailAccountConnectionParameters = {
  CALDAV?: InputMaybe<ConnectionParametersInput>;
  IMAP?: InputMaybe<ConnectionParametersInput>;
  SMTP?: InputMaybe<ConnectionParametersInput>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export enum EmailConnectionSecurity {
  NONE = 'NONE',
  SSL_TLS = 'SSL_TLS',
  STARTTLS = 'STARTTLS'
}

export type EmailPasswordResetLink = {
  __typename?: 'EmailPasswordResetLink';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type EmailThreadConfiguration = {
  __typename?: 'EmailThreadConfiguration';
  configurationType: WidgetConfigurationType;
};

export type EmailingDomain = {
  __typename?: 'EmailingDomain';
  createdAt: Scalars['DateTime']['output'];
  domain: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  status: EmailingDomainStatus;
  tenantStatus: EmailingDomainTenantStatus;
  unsubscribeHostnameStatus?: Maybe<UnsubscribeHostnameStatus>;
  updatedAt: Scalars['DateTime']['output'];
  verificationRecords?: Maybe<Array<VerificationRecord>>;
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum EmailingDomainStatus {
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  TEMPORARY_FAILURE = 'TEMPORARY_FAILURE',
  VERIFIED = 'VERIFIED'
}

export enum EmailingDomainTenantStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SANDBOX = 'SANDBOX'
}

export type EmailsConfiguration = {
  __typename?: 'EmailsConfiguration';
  configurationType: WidgetConfigurationType;
};

export enum EngineComponentKey {
  ACTIVATE_WORKFLOW = 'ACTIVATE_WORKFLOW',
  ADD_NODE_WORKFLOW = 'ADD_NODE_WORKFLOW',
  ADD_TO_FAVORITES = 'ADD_TO_FAVORITES',
  ADD_TO_MESSAGE_LIST = 'ADD_TO_MESSAGE_LIST',
  ADD_VIEW_TO_MESSAGE_LIST = 'ADD_VIEW_TO_MESSAGE_LIST',
  ASK_AI = 'ASK_AI',
  ASSIGN_AI_CHAT = 'ASSIGN_AI_CHAT',
  CANCEL_DASHBOARD_LAYOUT = 'CANCEL_DASHBOARD_LAYOUT',
  CANCEL_MESSAGE_CAMPAIGN = 'CANCEL_MESSAGE_CAMPAIGN',
  COMPOSE_CAMPAIGN = 'COMPOSE_CAMPAIGN',
  COMPOSE_EMAIL = 'COMPOSE_EMAIL',
  CREATE_NEW_RECORD = 'CREATE_NEW_RECORD',
  CREATE_NEW_VIEW = 'CREATE_NEW_VIEW',
  DEACTIVATE_WORKFLOW = 'DEACTIVATE_WORKFLOW',
  DELETE_MULTIPLE_RECORDS = 'DELETE_MULTIPLE_RECORDS',
  DELETE_RECORDS = 'DELETE_RECORDS',
  DELETE_SINGLE_RECORD = 'DELETE_SINGLE_RECORD',
  DESTROY_MULTIPLE_RECORDS = 'DESTROY_MULTIPLE_RECORDS',
  DESTROY_RECORDS = 'DESTROY_RECORDS',
  DESTROY_SINGLE_RECORD = 'DESTROY_SINGLE_RECORD',
  DISCARD_DRAFT_WORKFLOW = 'DISCARD_DRAFT_WORKFLOW',
  DUPLICATE_DASHBOARD = 'DUPLICATE_DASHBOARD',
  DUPLICATE_MESSAGE_CAMPAIGN = 'DUPLICATE_MESSAGE_CAMPAIGN',
  DUPLICATE_MESSAGE_LIST = 'DUPLICATE_MESSAGE_LIST',
  DUPLICATE_WORKFLOW = 'DUPLICATE_WORKFLOW',
  EDIT_DASHBOARD_LAYOUT = 'EDIT_DASHBOARD_LAYOUT',
  EDIT_RECORD_PAGE_LAYOUT = 'EDIT_RECORD_PAGE_LAYOUT',
  EMAIL_BLOCK_SETTINGS = 'EMAIL_BLOCK_SETTINGS',
  EMAIL_PAGE_STYLE = 'EMAIL_PAGE_STYLE',
  EXPORT_FROM_RECORD_INDEX = 'EXPORT_FROM_RECORD_INDEX',
  EXPORT_FROM_RECORD_SHOW = 'EXPORT_FROM_RECORD_SHOW',
  EXPORT_MULTIPLE_RECORDS = 'EXPORT_MULTIPLE_RECORDS',
  EXPORT_RECORDS = 'EXPORT_RECORDS',
  EXPORT_VIEW = 'EXPORT_VIEW',
  FRONT_COMPONENT_RENDERER = 'FRONT_COMPONENT_RENDERER',
  GO_TO_COMPANIES = 'GO_TO_COMPANIES',
  GO_TO_DASHBOARDS = 'GO_TO_DASHBOARDS',
  GO_TO_NOTES = 'GO_TO_NOTES',
  GO_TO_OPPORTUNITIES = 'GO_TO_OPPORTUNITIES',
  GO_TO_PEOPLE = 'GO_TO_PEOPLE',
  GO_TO_RUNS = 'GO_TO_RUNS',
  GO_TO_SETTINGS = 'GO_TO_SETTINGS',
  GO_TO_TASKS = 'GO_TO_TASKS',
  GO_TO_WORKFLOWS = 'GO_TO_WORKFLOWS',
  HIDE_DELETED_RECORDS = 'HIDE_DELETED_RECORDS',
  IMPORT_RECORDS = 'IMPORT_RECORDS',
  MARK_AI_CHAT_AS_DONE = 'MARK_AI_CHAT_AS_DONE',
  MARK_AI_CHAT_AS_READ = 'MARK_AI_CHAT_AS_READ',
  MARK_AI_CHAT_AS_UNREAD = 'MARK_AI_CHAT_AS_UNREAD',
  MERGE_MULTIPLE_RECORDS = 'MERGE_MULTIPLE_RECORDS',
  NAVIGATE_TO_NEXT_RECORD = 'NAVIGATE_TO_NEXT_RECORD',
  NAVIGATE_TO_PREVIOUS_RECORD = 'NAVIGATE_TO_PREVIOUS_RECORD',
  NAVIGATION = 'NAVIGATION',
  NEW_AI_CHAT = 'NEW_AI_CHAT',
  REMOVE_FROM_FAVORITES = 'REMOVE_FROM_FAVORITES',
  REOPEN_AI_CHAT = 'REOPEN_AI_CHAT',
  REPLY_TO_EMAIL_THREAD = 'REPLY_TO_EMAIL_THREAD',
  RESTORE_MULTIPLE_RECORDS = 'RESTORE_MULTIPLE_RECORDS',
  RESTORE_RECORDS = 'RESTORE_RECORDS',
  RESTORE_SINGLE_RECORD = 'RESTORE_SINGLE_RECORD',
  RETRY_WORKFLOW_RUN = 'RETRY_WORKFLOW_RUN',
  SAVE_DASHBOARD_LAYOUT = 'SAVE_DASHBOARD_LAYOUT',
  SEARCH_RECORDS = 'SEARCH_RECORDS',
  SEARCH_RECORDS_FALLBACK = 'SEARCH_RECORDS_FALLBACK',
  SEE_ACTIVE_VERSION_WORKFLOW = 'SEE_ACTIVE_VERSION_WORKFLOW',
  SEE_DELETED_RECORDS = 'SEE_DELETED_RECORDS',
  SEE_RUNS_WORKFLOW = 'SEE_RUNS_WORKFLOW',
  SEE_RUNS_WORKFLOW_VERSION = 'SEE_RUNS_WORKFLOW_VERSION',
  SEE_VERSIONS_WORKFLOW = 'SEE_VERSIONS_WORKFLOW',
  SEE_VERSIONS_WORKFLOW_VERSION = 'SEE_VERSIONS_WORKFLOW_VERSION',
  SEE_VERSION_WORKFLOW_RUN = 'SEE_VERSION_WORKFLOW_RUN',
  SEE_WORKFLOW_WORKFLOW_RUN = 'SEE_WORKFLOW_WORKFLOW_RUN',
  SEE_WORKFLOW_WORKFLOW_VERSION = 'SEE_WORKFLOW_WORKFLOW_VERSION',
  SEND_MESSAGE_CAMPAIGN = 'SEND_MESSAGE_CAMPAIGN',
  SEND_MESSAGE_CAMPAIGN_TEST = 'SEND_MESSAGE_CAMPAIGN_TEST',
  SHARE_RECORD = 'SHARE_RECORD',
  SNOOZE_AI_CHAT = 'SNOOZE_AI_CHAT',
  STOP_WORKFLOW_RUN = 'STOP_WORKFLOW_RUN',
  SUBSCRIBE_TO_AI_CHAT = 'SUBSCRIBE_TO_AI_CHAT',
  TEST_WORKFLOW = 'TEST_WORKFLOW',
  TIDY_UP_WORKFLOW = 'TIDY_UP_WORKFLOW',
  TOGGLE_WORKFLOW_VISIBILITY = 'TOGGLE_WORKFLOW_VISIBILITY',
  TRIGGER_WORKFLOW_VERSION = 'TRIGGER_WORKFLOW_VERSION',
  UNSUBSCRIBE_FROM_AI_CHAT = 'UNSUBSCRIBE_FROM_AI_CHAT',
  UPDATE_MULTIPLE_RECORDS = 'UPDATE_MULTIPLE_RECORDS',
  USE_AS_DRAFT_WORKFLOW_VERSION = 'USE_AS_DRAFT_WORKFLOW_VERSION',
  VIEW_PREVIOUS_AI_CHATS = 'VIEW_PREVIOUS_AI_CHATS'
}

export type EnqueueJobInput = {
  delayMs?: InputMaybe<Scalars['Int']['input']>;
  jobId?: InputMaybe<Scalars['String']['input']>;
  logicFunctionUniversalIdentifier: Scalars['String']['input'];
  payload?: InputMaybe<Scalars['JSON']['input']>;
  retryLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type EnqueueJobItemInput = {
  jobId?: InputMaybe<Scalars['String']['input']>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
};

export type EnqueueJobResult = {
  __typename?: 'EnqueueJobResult';
  enqueued: Scalars['Boolean']['output'];
  jobId: Scalars['String']['output'];
  logicFunctionUniversalIdentifier: Scalars['String']['output'];
};

export type EnqueueJobsInput = {
  delayMs?: InputMaybe<Scalars['Int']['input']>;
  jobs?: InputMaybe<Array<EnqueueJobItemInput>>;
  logicFunctionUniversalIdentifier: Scalars['String']['input'];
  retryLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type EnqueueJobsResult = {
  __typename?: 'EnqueueJobsResult';
  enqueued: Scalars['Boolean']['output'];
  enqueuedJobsCount: Scalars['Int']['output'];
  jobIds: Array<Scalars['String']['output']>;
  logicFunctionUniversalIdentifier: Scalars['String']['output'];
};

export type EnterpriseLicenseInfoDto = {
  __typename?: 'EnterpriseLicenseInfoDTO';
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  isValid: Scalars['Boolean']['output'];
  licensee?: Maybe<Scalars['String']['output']>;
  subscriptionId?: Maybe<Scalars['String']['output']>;
};

export type EnterpriseSubscriptionStatusDto = {
  __typename?: 'EnterpriseSubscriptionStatusDTO';
  cancelAt?: Maybe<Scalars['DateTime']['output']>;
  currentPeriodEnd?: Maybe<Scalars['DateTime']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  isCancellationScheduled: Scalars['Boolean']['output'];
  licensee?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type EventLogDateRangeInput = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

export type EventLogFieldFilterInput = {
  field: Scalars['String']['input'];
  operand: EventLogFilterOperand;
  values: Array<Scalars['String']['input']>;
};

export enum EventLogFilterOperand {
  IS = 'IS',
  IS_NOT = 'IS_NOT'
}

export type EventLogFiltersInput = {
  dateRange?: InputMaybe<EventLogDateRangeInput>;
  eventType?: InputMaybe<Scalars['String']['input']>;
  fieldFilters?: InputMaybe<Array<EventLogFieldFilterInput>>;
  objectMetadataId?: InputMaybe<Scalars['String']['input']>;
  recordId?: InputMaybe<Scalars['String']['input']>;
  userWorkspaceId?: InputMaybe<Scalars['String']['input']>;
};

export type EventLogPageInfo = {
  __typename?: 'EventLogPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type EventLogQueryInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<EventLogFiltersInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  table: EventLogTable;
};

export type EventLogQueryResult = {
  __typename?: 'EventLogQueryResult';
  pageInfo: EventLogPageInfo;
  records: Array<EventLogRecord>;
  totalCount: Scalars['Int']['output'];
};

export type EventLogRecord = {
  __typename?: 'EventLogRecord';
  event: Scalars['String']['output'];
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  objectMetadataId?: Maybe<Scalars['String']['output']>;
  properties?: Maybe<Scalars['JSON']['output']>;
  recordId?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['DateTime']['output'];
  userId?: Maybe<Scalars['String']['output']>;
};

export enum EventLogTable {
  APPLICATION_LOG = 'APPLICATION_LOG',
  OBJECT_EVENT = 'OBJECT_EVENT',
  PAGEVIEW = 'PAGEVIEW',
  USAGE_EVENT = 'USAGE_EVENT',
  WORKSPACE_EVENT = 'WORKSPACE_EVENT'
}

export type EventSubscription = {
  __typename?: 'EventSubscription';
  eventStreamId: Scalars['String']['output'];
  metadataEvents: Array<MetadataEvent>;
  objectRecordEventsWithQueryIds: Array<ObjectRecordEventWithQueryIds>;
  queueJobEvents: Array<JobStatus>;
};

export type ExecuteOneLogicFunctionInput = {
  /** Id of the logic function to execute */
  id: Scalars['UUID']['input'];
  /** Payload in JSON format */
  payload: Scalars['JSON']['input'];
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  key: FeatureFlagKey;
  value: Scalars['Boolean']['output'];
};

export enum FeatureFlagKey {
  IS_AI_CHAT_INBOX_ENABLED = 'IS_AI_CHAT_INBOX_ENABLED',
  IS_APP_PREFERENCES_ENABLED = 'IS_APP_PREFERENCES_ENABLED',
  IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED = 'IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED',
  IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED = 'IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED',
  IS_MCP_SERVERS_ENABLED = 'IS_MCP_SERVERS_ENABLED',
  IS_MESSAGE_CAMPAIGN_ENABLED = 'IS_MESSAGE_CAMPAIGN_ENABLED',
  IS_RECORD_CREATION_FORM_ENABLED = 'IS_RECORD_CREATION_FORM_ENABLED',
  IS_RECORD_LEVEL_SHARING_ENABLED = 'IS_RECORD_LEVEL_SHARING_ENABLED',
  IS_REST_METADATA_API_NEW_FORMAT_DIRECT = 'IS_REST_METADATA_API_NEW_FORMAT_DIRECT'
}

export type Field = {
  __typename?: 'Field';
  applicationId: Scalars['UUID']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultValue?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  disabledFieldPermissionActions?: Maybe<Array<Scalars['String']['output']>>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isAuditLogged?: Maybe<Scalars['Boolean']['output']>;
  isLabelSyncedWithName?: Maybe<Scalars['Boolean']['output']>;
  isNullable?: Maybe<Scalars['Boolean']['output']>;
  isSearchable?: Maybe<Scalars['Boolean']['output']>;
  isSystem?: Maybe<Scalars['Boolean']['output']>;
  isUIEditable?: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated Use isUIEditable */
  isUIReadOnly?: Maybe<Scalars['Boolean']['output']>;
  isUnique?: Maybe<Scalars['Boolean']['output']>;
  label: Scalars['String']['output'];
  morphId?: Maybe<Scalars['UUID']['output']>;
  morphRelations?: Maybe<Array<Relation>>;
  name: Scalars['String']['output'];
  object?: Maybe<Object>;
  objectMetadataId: Scalars['UUID']['output'];
  options?: Maybe<Scalars['JSON']['output']>;
  relation?: Maybe<Relation>;
  settings?: Maybe<Scalars['JSON']['output']>;
  type: FieldMetadataType;
  universalIdentifier: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  writability?: Maybe<MetadataWritability>;
};

export type FieldConfiguration = {
  __typename?: 'FieldConfiguration';
  configurationType: WidgetConfigurationType;
  fieldDisplayMode: FieldDisplayMode;
  fieldMetadataId: Scalars['String']['output'];
  isUIEditable?: Maybe<Scalars['Boolean']['output']>;
  nestedRelationFieldMetadataId?: Maybe<Scalars['String']['output']>;
  viewId?: Maybe<Scalars['String']['output']>;
};

export type FieldConnection = {
  __typename?: 'FieldConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

/** Display mode for field configuration widgets */
export enum FieldDisplayMode {
  CARD = 'CARD',
  EDITOR = 'EDITOR',
  FIELD = 'FIELD',
  TABLE = 'TABLE',
  VIEW = 'VIEW'
}

export type FieldEdge = {
  __typename?: 'FieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the Field */
  node: Field;
};

export type FieldFilter = {
  and?: InputMaybe<Array<FieldFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  isActive?: InputMaybe<BooleanFieldComparison>;
  isSystem?: InputMaybe<BooleanFieldComparison>;
  isUIEditable?: InputMaybe<BooleanFieldComparison>;
  isUIReadOnly?: InputMaybe<BooleanFieldComparison>;
  objectMetadataId?: InputMaybe<UuidFilterComparison>;
  or?: InputMaybe<Array<FieldFilter>>;
};

/** Type of the field */
export enum FieldMetadataType {
  ACTOR = 'ACTOR',
  ADDRESS = 'ADDRESS',
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN',
  CURRENCY = 'CURRENCY',
  DATE = 'DATE',
  DATE_TIME = 'DATE_TIME',
  EMAILS = 'EMAILS',
  FILES = 'FILES',
  FULL_NAME = 'FULL_NAME',
  LINKS = 'LINKS',
  MORPH_RELATION = 'MORPH_RELATION',
  MULTI_SELECT = 'MULTI_SELECT',
  NUMBER = 'NUMBER',
  NUMERIC = 'NUMERIC',
  PHONES = 'PHONES',
  POSITION = 'POSITION',
  RATING = 'RATING',
  RAW_JSON = 'RAW_JSON',
  RELATION = 'RELATION',
  RICH_TEXT = 'RICH_TEXT',
  SELECT = 'SELECT',
  TEXT = 'TEXT',
  TS_VECTOR = 'TS_VECTOR',
  UUID = 'UUID'
}

export type FieldPermission = {
  __typename?: 'FieldPermission';
  canReadFieldValue?: Maybe<Scalars['Boolean']['output']>;
  canUpdateFieldValue?: Maybe<Scalars['Boolean']['output']>;
  fieldMetadataId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  objectMetadataId: Scalars['UUID']['output'];
  roleId: Scalars['UUID']['output'];
};

export type FieldPermissionInput = {
  canReadFieldValue?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateFieldValue?: InputMaybe<Scalars['Boolean']['input']>;
  fieldMetadataId: Scalars['UUID']['input'];
  objectMetadataId: Scalars['UUID']['input'];
};

export type FieldRichTextConfiguration = {
  __typename?: 'FieldRichTextConfiguration';
  configurationType: WidgetConfigurationType;
};

export type FieldsConfiguration = {
  __typename?: 'FieldsConfiguration';
  configurationType: WidgetConfigurationType;
  newFieldDefaultVisibility?: Maybe<Scalars['Boolean']['output']>;
  shouldAllowUserToSeeHiddenFields?: Maybe<Scalars['Boolean']['output']>;
  viewId?: Maybe<Scalars['String']['output']>;
};

export type File = {
  __typename?: 'File';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Float']['output'];
};

export type FileAttachmentInput = {
  filename: Scalars['String']['input'];
  id: Scalars['UUID']['input'];
};

export enum FileFolder {
  AgentChat = 'AgentChat',
  AppTarball = 'AppTarball',
  BuiltFrontComponent = 'BuiltFrontComponent',
  BuiltLogicFunction = 'BuiltLogicFunction',
  CorePicture = 'CorePicture',
  Dependencies = 'Dependencies',
  Dpa = 'Dpa',
  EmailAttachment = 'EmailAttachment',
  EmailImage = 'EmailImage',
  FilesField = 'FilesField',
  GeneratedSdkClient = 'GeneratedSdkClient',
  PublicAsset = 'PublicAsset',
  RecordExport = 'RecordExport',
  Source = 'Source',
  Workflow = 'Workflow',
  WorkspaceDataExport = 'WorkspaceDataExport'
}

export type FileUploadTarget = {
  __typename?: 'FileUploadTarget';
  contentType: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  fileId: Scalars['UUID']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type FileWithSignedUrl = {
  __typename?: 'FileWithSignedUrl';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Float']['output'];
  url: Scalars['String']['output'];
};

export type FilesConfiguration = {
  __typename?: 'FilesConfiguration';
  configurationType: WidgetConfigurationType;
};

export type FindAvailableSsoidp = {
  __typename?: 'FindAvailableSSOIDP';
  id: Scalars['UUID']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
  workspace: WorkspaceNameAndId;
};

export type FindMessageSuppressionsInput = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  reason?: InputMaybe<MessageSuppressionReason>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  unsubscribeTopicId?: InputMaybe<Scalars['UUID']['input']>;
};

export type FormFieldConfiguration = {
  __typename?: 'FormFieldConfiguration';
  configurationType: WidgetConfigurationType;
  fieldMetadataId: Scalars['String']['output'];
};

export type FrontComponent = {
  __typename?: 'FrontComponent';
  applicationGrantedCapabilities?: Maybe<Array<Scalars['String']['output']>>;
  applicationId: Scalars['UUID']['output'];
  applicationName?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use generateFrontComponentApplicationTokenPair */
  applicationTokenPair?: Maybe<ApplicationTokenPair>;
  applicationVariables?: Maybe<Scalars['JSON']['output']>;
  builtComponentChecksum: Scalars['String']['output'];
  builtComponentPath: Scalars['String']['output'];
  componentName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  frontComponentSharedDependenciesChecksum?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isHeadless: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sourceComponentPath: Scalars['String']['output'];
  universalIdentifier?: Maybe<Scalars['UUID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  usesSdkClient: Scalars['Boolean']['output'];
  widgetAvailability: Array<FrontComponentWidgetAvailability>;
};

export type FrontComponentConfiguration = {
  __typename?: 'FrontComponentConfiguration';
  configurationType: WidgetConfigurationType;
  frontComponentId: Scalars['UUID']['output'];
  headerCommandMenuItemUniversalIdentifiers?: Maybe<Array<Scalars['UUID']['output']>>;
};

export type FrontComponentWidgetAvailability = {
  __typename?: 'FrontComponentWidgetAvailability';
  objectMetadataId?: Maybe<Scalars['UUID']['output']>;
  pageLayoutType: PageLayoutType;
};

export type FullName = {
  __typename?: 'FullName';
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
};

export type GetApiKeyInput = {
  id: Scalars['UUID']['input'];
};

export type GetAuthorizationUrlForSso = {
  __typename?: 'GetAuthorizationUrlForSSO';
  authorizationURL: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  type: Scalars['String']['output'];
};

export type GetAuthorizationUrlForSsoInput = {
  identityProviderId: Scalars['UUID']['input'];
  workspaceInviteHash?: InputMaybe<Scalars['String']['input']>;
};

export type GrantApplicationCapabilitiesInput = {
  applicationId: Scalars['UUID']['input'];
  capabilities: Array<Scalars['String']['input']>;
};

/** Order by options for graph widgets */
export enum GraphOrderBy {
  FIELD_ASC = 'FIELD_ASC',
  FIELD_DESC = 'FIELD_DESC',
  FIELD_POSITION_ASC = 'FIELD_POSITION_ASC',
  FIELD_POSITION_DESC = 'FIELD_POSITION_DESC',
  MANUAL = 'MANUAL',
  VALUE_ASC = 'VALUE_ASC',
  VALUE_DESC = 'VALUE_DESC'
}

export type GridPosition = {
  __typename?: 'GridPosition';
  column: Scalars['Float']['output'];
  columnSpan: Scalars['Float']['output'];
  row: Scalars['Float']['output'];
  rowSpan: Scalars['Float']['output'];
};

export enum IdentityProviderType {
  OIDC = 'OIDC',
  SAML = 'SAML'
}

export type IframeConfiguration = {
  __typename?: 'IframeConfiguration';
  configurationType: WidgetConfigurationType;
  url?: Maybe<Scalars['String']['output']>;
};

export type ImapSmtpCaldavConnectionSuccess = {
  __typename?: 'ImapSmtpCaldavConnectionSuccess';
  connectedAccountId: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ImapSmtpCaldavPublicConnectionParameters = {
  __typename?: 'ImapSmtpCaldavPublicConnectionParameters';
  CALDAV?: Maybe<ImapSmtpCaldavPublicConnectionParams>;
  IMAP?: Maybe<ImapSmtpCaldavPublicConnectionParams>;
  SMTP?: Maybe<ImapSmtpCaldavPublicConnectionParams>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ImapSmtpCaldavPublicConnectionParams = {
  __typename?: 'ImapSmtpCaldavPublicConnectionParams';
  connectionSecurity?: Maybe<EmailConnectionSecurity>;
  host: Scalars['String']['output'];
  port: Scalars['Float']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type Impersonate = {
  __typename?: 'Impersonate';
  loginToken: AuthToken;
  workspace: WorkspaceUrlsAndId;
};

export type Index = {
  __typename?: 'Index';
  applicationId: Scalars['UUID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  indexFieldMetadataList: Array<IndexField>;
  indexType: IndexType;
  indexWhereClause?: Maybe<Scalars['String']['output']>;
  /** @deprecated Derived from applicationId and removed in 2.54: compare applicationId with the workspace custom application instead. */
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  isSystemSideEffect: Scalars['Boolean']['output'];
  isUnique: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type IndexEdge = {
  __typename?: 'IndexEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the Index */
  node: Index;
};

export type IndexField = {
  __typename?: 'IndexField';
  createdAt: Scalars['DateTime']['output'];
  fieldMetadataId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  order: Scalars['Float']['output'];
  subFieldName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type IndexFilter = {
  and?: InputMaybe<Array<IndexFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  or?: InputMaybe<Array<IndexFilter>>;
};

/** Type of the index */
export enum IndexType {
  BTREE = 'BTREE',
  GIN = 'GIN'
}

export type IngestAppMessagesInput = {
  messageChannelId: Scalars['UUID']['input'];
  messages: Array<AppMessageInput>;
};

export type IngestAppMessagesOutput = {
  __typename?: 'IngestAppMessagesOutput';
  messages: Array<IngestedAppMessage>;
};

export type IngestedAppMessage = {
  __typename?: 'IngestedAppMessage';
  externalId: Scalars['String']['output'];
  messageId: Scalars['UUID']['output'];
  messageThreadId: Scalars['UUID']['output'];
};

export type InitiateTwoFactorAuthenticationProvisioning = {
  __typename?: 'InitiateTwoFactorAuthenticationProvisioning';
  uri: Scalars['String']['output'];
};

export type InvalidatePassword = {
  __typename?: 'InvalidatePassword';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type InviteSuggestion = {
  __typename?: 'InviteSuggestion';
  displayName?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
};

/** Job state in the queue */
export enum JobState {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  FAILED = 'FAILED',
  PRIORITIZED = 'PRIORITIZED',
  WAITING = 'WAITING',
  WAITING_CHILDREN = 'WAITING_CHILDREN'
}

export type JobStatus = {
  __typename?: 'JobStatus';
  attemptsMade: Scalars['Int']['output'];
  enqueuedAt: Scalars['Float']['output'];
  failedReason?: Maybe<Scalars['String']['output']>;
  finishedAt?: Maybe<Scalars['Float']['output']>;
  jobId: Scalars['String']['output'];
  progress?: Maybe<Scalars['Int']['output']>;
  startedAt?: Maybe<Scalars['Float']['output']>;
  state: JobState;
};

export type LineChartConfiguration = {
  __typename?: 'LineChartConfiguration';
  aggregateFieldMetadataId: Scalars['UUID']['output'];
  aggregateOperation: AggregateOperations;
  axisNameDisplay?: Maybe<AxisNameDisplay>;
  color?: Maybe<Scalars['String']['output']>;
  configurationType: WidgetConfigurationType;
  description?: Maybe<Scalars['String']['output']>;
  displayDataLabel?: Maybe<Scalars['Boolean']['output']>;
  displayLegend?: Maybe<Scalars['Boolean']['output']>;
  filter?: Maybe<Scalars['JSON']['output']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']['output']>;
  isCumulative?: Maybe<Scalars['Boolean']['output']>;
  isStacked?: Maybe<Scalars['Boolean']['output']>;
  numberFormat?: Maybe<ChartNumberFormat>;
  omitNullValues?: Maybe<Scalars['Boolean']['output']>;
  primaryAxisDateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  primaryAxisGroupByFieldMetadataId: Scalars['UUID']['output'];
  primaryAxisGroupBySubFieldName?: Maybe<Scalars['String']['output']>;
  primaryAxisManualSortOrder?: Maybe<Array<Scalars['String']['output']>>;
  primaryAxisOrderBy?: Maybe<GraphOrderBy>;
  rangeMax?: Maybe<Scalars['Float']['output']>;
  rangeMin?: Maybe<Scalars['Float']['output']>;
  secondaryAxisGroupByDateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  secondaryAxisGroupByFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  secondaryAxisGroupBySubFieldName?: Maybe<Scalars['String']['output']>;
  secondaryAxisManualSortOrder?: Maybe<Array<Scalars['String']['output']>>;
  secondaryAxisOrderBy?: Maybe<GraphOrderBy>;
  splitMultiValueFields?: Maybe<Scalars['Boolean']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
};

export type LineChartData = {
  __typename?: 'LineChartData';
  formattedToRawLookup: Scalars['JSON']['output'];
  hasTooManyGroups: Scalars['Boolean']['output'];
  series: Array<LineChartSeries>;
  showDataLabels: Scalars['Boolean']['output'];
  showLegend: Scalars['Boolean']['output'];
  xAxisLabel: Scalars['String']['output'];
  yAxisLabel: Scalars['String']['output'];
};

export type LineChartDataInput = {
  configuration: Scalars['JSON']['input'];
  objectMetadataId: Scalars['UUID']['input'];
};

export type LineChartDataPoint = {
  __typename?: 'LineChartDataPoint';
  x: Scalars['String']['output'];
  y: Scalars['Float']['output'];
};

export type LineChartSeries = {
  __typename?: 'LineChartSeries';
  data: Array<LineChartDataPoint>;
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type ListAppConnectionsInput = {
  providerName?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<ConnectedAccountScope>;
  userWorkspaceId?: InputMaybe<Scalars['String']['input']>;
};

export type ListAppMessageChannelsInput = {
  connectedAccountId?: InputMaybe<Scalars['UUID']['input']>;
};

export type ListAppMessageFoldersInput = {
  messageChannelId?: InputMaybe<Scalars['UUID']['input']>;
};

export type Location = {
  __typename?: 'Location';
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
};

export type LogicFunction = {
  __typename?: 'LogicFunction';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  canRunOnDemand?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['DateTime']['output'];
  cronTriggerSettings?: Maybe<Scalars['JSON']['output']>;
  databaseEventTriggerSettings?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  executionMode: LogicFunctionExecutionMode;
  handlerName: Scalars['String']['output'];
  httpRouteTriggerSettings?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  runtime: Scalars['String']['output'];
  sourceHandlerPath: Scalars['String']['output'];
  timeoutSeconds: Scalars['Float']['output'];
  toolTriggerSettings?: Maybe<Scalars['JSON']['output']>;
  universalIdentifier?: Maybe<Scalars['UUID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  workflowActionTriggerSettings?: Maybe<Scalars['JSON']['output']>;
};

export enum LogicFunctionExecutionMode {
  LIVE = 'LIVE',
  PREBUILT = 'PREBUILT'
}

export type LogicFunctionExecutionResult = {
  __typename?: 'LogicFunctionExecutionResult';
  /** Execution result in JSON format */
  data?: Maybe<Scalars['JSON']['output']>;
  /** Execution duration in milliseconds */
  duration: Scalars['Float']['output'];
  /** Execution error in JSON format */
  error?: Maybe<Scalars['JSON']['output']>;
  /** Execution Logs */
  logs: Scalars['String']['output'];
  /** Execution status */
  status: LogicFunctionExecutionStatus;
};

/** Status of the logic function execution */
export enum LogicFunctionExecutionStatus {
  ERROR = 'ERROR',
  IDLE = 'IDLE',
  SUCCESS = 'SUCCESS'
}

export type LogicFunctionIdInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
};

export type LogicFunctionLogs = {
  __typename?: 'LogicFunctionLogs';
  /** Execution Logs */
  logs: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  universalIdentifier?: Maybe<Scalars['UUID']['output']>;
};

export type LogicFunctionLogsInput = {
  applicationId?: InputMaybe<Scalars['UUID']['input']>;
  applicationUniversalIdentifier?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  universalIdentifier?: InputMaybe<Scalars['UUID']['input']>;
};

export type LoginToken = {
  __typename?: 'LoginToken';
  loginToken: AuthToken;
};

export type MarketplaceApp = {
  __typename?: 'MarketplaceApp';
  author: Scalars['String']['output'];
  category: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isVetted: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  sourcePackage?: Maybe<Scalars['String']['output']>;
};

export type MarketplaceAppDetail = {
  __typename?: 'MarketplaceAppDetail';
  aboutDescription?: Maybe<Scalars['String']['output']>;
  author?: Maybe<Scalars['String']['output']>;
  billsCredits: Scalars['Boolean']['output'];
  category?: Maybe<Scalars['String']['output']>;
  defaultRoleUniversalIdentifier?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  emailSupport?: Maybe<Scalars['String']['output']>;
  galleryImages: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  installCount: Scalars['Int']['output'];
  isListed: Scalars['Boolean']['output'];
  isVetted: Scalars['Boolean']['output'];
  issueReportUrl?: Maybe<Scalars['String']['output']>;
  latestAvailableVersion?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the explicit MarketplaceAppDetail fields (description, author, roles, ...) instead */
  manifest?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  objects?: Maybe<Array<MarketplaceAppObject>>;
  pricingDescription?: Maybe<Scalars['String']['output']>;
  requestedCapabilities: Array<Scalars['String']['output']>;
  roles?: Maybe<Array<MarketplaceAppRole>>;
  /** @deprecated Use galleryImages instead */
  screenshots: Array<Scalars['String']['output']>;
  sourcePackage?: Maybe<Scalars['String']['output']>;
  sourceType: ApplicationRegistrationSourceType;
  termsUrl?: Maybe<Scalars['String']['output']>;
  universalIdentifier: Scalars['String']['output'];
  websiteUrl?: Maybe<Scalars['String']['output']>;
};

export type MarketplaceAppObject = {
  __typename?: 'MarketplaceAppObject';
  labelPlural: Scalars['String']['output'];
  labelSingular: Scalars['String']['output'];
  universalIdentifier: Scalars['String']['output'];
};

export type MarketplaceAppRole = {
  __typename?: 'MarketplaceAppRole';
  canAccessAllTools?: Maybe<Scalars['Boolean']['output']>;
  canDestroyAllObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canReadAllObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canSoftDeleteAllObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canUpdateAllObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canUpdateAllSettings?: Maybe<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fieldPermissions?: Maybe<Array<MarketplaceAppRoleFieldPermission>>;
  icon?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  objectPermissions?: Maybe<Array<MarketplaceAppRoleObjectPermission>>;
  permissionFlagUniversalIdentifiers?: Maybe<Array<Scalars['String']['output']>>;
  universalIdentifier: Scalars['String']['output'];
};

export type MarketplaceAppRoleFieldPermission = {
  __typename?: 'MarketplaceAppRoleFieldPermission';
  canReadFieldValue?: Maybe<Scalars['Boolean']['output']>;
  canUpdateFieldValue?: Maybe<Scalars['Boolean']['output']>;
  fieldUniversalIdentifier: Scalars['String']['output'];
  objectUniversalIdentifier: Scalars['String']['output'];
  universalIdentifier: Scalars['String']['output'];
};

export type MarketplaceAppRoleObjectPermission = {
  __typename?: 'MarketplaceAppRoleObjectPermission';
  canDestroyObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canReadObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canSoftDeleteObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canUpdateObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  objectUniversalIdentifier: Scalars['String']['output'];
  universalIdentifier: Scalars['String']['output'];
};

export type McpServer = {
  __typename?: 'McpServer';
  applicationId: Scalars['UUID']['output'];
  connectionProviderId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
};

export type MessageCampaignBodyConfiguration = {
  __typename?: 'MessageCampaignBodyConfiguration';
  configurationType: WidgetConfigurationType;
};

export type MessageCampaignDetailsConfiguration = {
  __typename?: 'MessageCampaignDetailsConfiguration';
  configurationType: WidgetConfigurationType;
};

export type MessageCampaignSendBlockerDto = {
  __typename?: 'MessageCampaignSendBlockerDTO';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type MessageChannel = {
  __typename?: 'MessageChannel';
  connectedAccount?: Maybe<ConnectedAccountPublicDto>;
  connectedAccountId: Scalars['UUID']['output'];
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;
  createdAt: Scalars['DateTime']['output'];
  displayName?: Maybe<Scalars['String']['output']>;
  excludeGroupEmails: Scalars['Boolean']['output'];
  excludeNonProfessionalEmails: Scalars['Boolean']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  importProgress?: Maybe<Scalars['Int']['output']>;
  isContactAutoCreationEnabled: Scalars['Boolean']['output'];
  isSyncEnabled: Scalars['Boolean']['output'];
  messageFolderImportPolicy: MessageFolderImportPolicy;
  messagingProviderUniversalIdentifier?: Maybe<Scalars['UUID']['output']>;
  participantHandleFieldUniversalIdentifier?: Maybe<Scalars['UUID']['output']>;
  pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction;
  syncStage: MessageChannelSyncStage;
  syncStageStartedAt?: Maybe<Scalars['DateTime']['output']>;
  syncStatus: MessageChannelSyncStatus;
  syncedAt?: Maybe<Scalars['DateTime']['output']>;
  throttleFailureCount: Scalars['Float']['output'];
  throttleRetryAfter?: Maybe<Scalars['DateTime']['output']>;
  type: MessageChannelType;
  updatedAt: Scalars['DateTime']['output'];
  visibility: MessageChannelVisibility;
};

export enum MessageChannelContactAutoCreationPolicy {
  NONE = 'NONE',
  SENT = 'SENT',
  SENT_AND_RECEIVED = 'SENT_AND_RECEIVED'
}

export enum MessageChannelPendingGroupEmailsAction {
  GROUP_EMAILS_DELETION = 'GROUP_EMAILS_DELETION',
  GROUP_EMAILS_IMPORT = 'GROUP_EMAILS_IMPORT',
  NONE = 'NONE'
}

export enum MessageChannelSyncStage {
  FAILED = 'FAILED',
  MESSAGES_IMPORT_ONGOING = 'MESSAGES_IMPORT_ONGOING',
  MESSAGES_IMPORT_PENDING = 'MESSAGES_IMPORT_PENDING',
  MESSAGES_IMPORT_SCHEDULED = 'MESSAGES_IMPORT_SCHEDULED',
  MESSAGE_LIST_FETCH_ONGOING = 'MESSAGE_LIST_FETCH_ONGOING',
  MESSAGE_LIST_FETCH_PENDING = 'MESSAGE_LIST_FETCH_PENDING',
  MESSAGE_LIST_FETCH_SCHEDULED = 'MESSAGE_LIST_FETCH_SCHEDULED',
  PENDING_CONFIGURATION = 'PENDING_CONFIGURATION'
}

export enum MessageChannelSyncStatus {
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING'
}

export enum MessageChannelType {
  APP = 'APP',
  EMAIL = 'EMAIL',
  EMAIL_GROUP = 'EMAIL_GROUP',
  SMS = 'SMS'
}

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
  SUBJECT = 'SUBJECT'
}

export type MessageFolder = {
  __typename?: 'MessageFolder';
  createdAt: Scalars['DateTime']['output'];
  externalId?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isSentFolder: Scalars['Boolean']['output'];
  isSynced: Scalars['Boolean']['output'];
  messageChannelId: Scalars['UUID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  parentFolderId?: Maybe<Scalars['String']['output']>;
  pendingSyncAction: MessageFolderPendingSyncAction;
  updatedAt: Scalars['DateTime']['output'];
};

export enum MessageFolderImportPolicy {
  ALL_FOLDERS = 'ALL_FOLDERS',
  SELECTED_FOLDERS = 'SELECTED_FOLDERS'
}

export enum MessageFolderPendingSyncAction {
  FOLDER_DELETION = 'FOLDER_DELETION',
  FOLDER_IMPORT = 'FOLDER_IMPORT',
  NONE = 'NONE'
}

export enum MessageParticipantRole {
  BCC = 'BCC',
  CC = 'CC',
  FROM = 'FROM',
  REPLY_TO = 'REPLY_TO',
  TO = 'TO'
}

export type MessageSuppression = {
  __typename?: 'MessageSuppression';
  createdAt: Scalars['DateTime']['output'];
  emailAddress: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  reason: MessageSuppressionReason;
  source: MessageSuppressionSource;
  unsubscribeTopicId?: Maybe<Scalars['UUID']['output']>;
};

export type MessageSuppressionList = {
  __typename?: 'MessageSuppressionList';
  records: Array<MessageSuppression>;
  totalCount: Scalars['Int']['output'];
};

export enum MessageSuppressionReason {
  BOUNCE = 'BOUNCE',
  COMPLAINT = 'COMPLAINT',
  TRACKING = 'TRACKING',
  UNSUBSCRIBE = 'UNSUBSCRIBE'
}

export enum MessageSuppressionSource {
  SYSTEM = 'SYSTEM',
  WEBHOOK = 'WEBHOOK'
}

export type MetadataEvent = {
  __typename?: 'MetadataEvent';
  metadataName: Scalars['String']['output'];
  properties: ObjectRecordEventProperties;
  recordId: Scalars['String']['output'];
  type: MetadataEventAction;
  updatedCollectionHash?: Maybe<Scalars['String']['output']>;
};

/** Metadata Event Action */
export enum MetadataEventAction {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED'
}

export enum MetadataReadability {
  APPLICATION = 'APPLICATION',
  INHERITED = 'INHERITED',
  OPEN = 'OPEN',
  PRIVATE = 'PRIVATE',
  SYSTEM = 'SYSTEM'
}

export type MetadataTranslation = {
  __typename?: 'MetadataTranslation';
  canonicalValue: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  metadataName: Scalars['String']['output'];
  objectMetadataId?: Maybe<Scalars['UUID']['output']>;
  property: Scalars['String']['output'];
  provenance: MetadataTranslationProvenance;
  recordId: Scalars['UUID']['output'];
  sourceValue: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type MetadataTranslationOverrideInput = {
  locale: Scalars['String']['input'];
  property: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Where a resolved metadata label comes from: a workspace-authored translation, a shipped application catalog, or inheritance from the canonical value */
export enum MetadataTranslationProvenance {
  INHERITED = 'INHERITED',
  SHIPPED = 'SHIPPED',
  WORKSPACE = 'WORKSPACE'
}

export type MetadataTranslationsInput = {
  fieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  objectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
};

export enum MetadataWritability {
  APPLICATION = 'APPLICATION',
  OPEN = 'OPEN',
  SYSTEM = 'SYSTEM'
}

export type MinimalMetadata = {
  __typename?: 'MinimalMetadata';
  collectionHashes: Array<CollectionHash>;
  objectMetadataItems: Array<MinimalObjectMetadata>;
  views: Array<MinimalView>;
};

export type MinimalObjectMetadata = {
  __typename?: 'MinimalObjectMetadata';
  color?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isRemote: Scalars['Boolean']['output'];
  isSystem: Scalars['Boolean']['output'];
  labelPlural: Scalars['String']['output'];
  labelSingular: Scalars['String']['output'];
  namePlural: Scalars['String']['output'];
  nameSingular: Scalars['String']['output'];
};

export type MinimalView = {
  __typename?: 'MinimalView';
  id: Scalars['UUID']['output'];
  key?: Maybe<ViewKey>;
  objectMetadataId: Scalars['UUID']['output'];
  type: ViewType;
};

export enum ModelFamily {
  CLAUDE = 'CLAUDE',
  GEMINI = 'GEMINI',
  GPT = 'GPT',
  GROK = 'GROK',
  MISTRAL = 'MISTRAL'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateSkill: Skill;
  activateWorkspace: Workspace;
  addAgentChatMessageReaction: Array<AgentMessageReactionSummary>;
  addQueryToEventStream: Scalars['Boolean']['output'];
  assignAgentChatThread: Scalars['Boolean']['output'];
  assignRoleToAgent: Scalars['Boolean']['output'];
  assignRoleToApiKey: Scalars['Boolean']['output'];
  authorizeApp: AuthorizeApp;
  cancelMessageCampaign: CancelMessageCampaignOutputDto;
  cancelSwitchBillingInterval: BillingUpdate;
  cancelSwitchBillingPlan: BillingUpdate;
  cancelSwitchResourceCreditPrice: BillingUpdate;
  checkCustomDomainValidRecords?: Maybe<DomainValidRecords>;
  checkPublicDomainValidRecords?: Maybe<DomainValidRecords>;
  checkoutSession: BillingSession;
  claimApplicationRegistrationOwnership: ApplicationRegistration;
  completeAppTarballUpload: ApplicationRegistration;
  completeApplicationFileUploads: CompleteApplicationFileUploadsResult;
  completeBookCallOnboardingStep: OnboardingStepSuccess;
  completeFileUpload: FileWithSignedUrl;
  completeNewWorkspaceLogoUpload: FileWithSignedUrl;
  completeWorkspaceLogoUpload: FileWithSignedUrl;
  completeWorkspaceMemberProfilePictureUpload: FileWithSignedUrl;
  createAgentChatChannel: AgentChatChannel;
  createApiKey: ApiKey;
  createAppMessageChannel: MessageChannel;
  createApplicationFileUploads: CreateApplicationFileUploadsResult;
  createApplicationRegistration: CreateApplicationRegistration;
  createApprovedAccessDomain: ApprovedAccessDomain;
  createBillingPaymentMethodSetupIntent: BillingPaymentIntent;
  createCalendarEvent: CreateCalendarEventOutput;
  createChatThread: AgentChatThread;
  createCommandMenuItem: CommandMenuItem;
  createDevelopmentApplication: DevelopmentApplication;
  createEmailGroupChannel: CreateEmailGroupChannelOutput;
  createEmailingDomain: EmailingDomain;
  createFileUpload: FileUploadTarget;
  createFrontComponent: FrontComponent;
  createManyNavigationMenuItems: Array<NavigationMenuItem>;
  createManyViewFieldGroups: Array<ViewFieldGroup>;
  createManyViewFields: Array<ViewField>;
  createManyViewGroups: Array<ViewGroup>;
  createMcpServer: McpServer;
  createMessageSuppression: MessageSuppression;
  createNavigationMenuItem: NavigationMenuItem;
  createNewWorkspaceLogoUpload: FileUploadTarget;
  createOIDCIdentityProvider: SetupSso;
  createObjectEvent: Analytics;
  createOneAgent: Agent;
  createOneField: Field;
  createOneIndex: Index;
  createOneLogicFunction: LogicFunction;
  createOneObject: Object;
  createOneRole: Role;
  createPageLayout: PageLayout;
  createPageLayoutTab: PageLayoutTab;
  createPageLayoutWidget: PageLayoutWidget;
  createPublicDomain: PublicDomain;
  createSAMLIdentityProvider: SetupSso;
  createSkill: Skill;
  createSubscriptionPaymentIntent: BillingPaymentIntent;
  createUnsubscribeTopic: UnsubscribeTopic;
  createUsageLimit: UsageLimit;
  createValidationRule: ValidationRule;
  createView: View;
  createViewField: ViewField;
  createViewFieldGroup: ViewFieldGroup;
  createViewFilter: ViewFilter;
  createViewFilterGroup: ViewFilterGroup;
  createViewGroup: ViewGroup;
  createViewSort: ViewSort;
  createWebhook: Webhook;
  deactivateSkill: Skill;
  deleteAgentChatChannel: Scalars['Boolean']['output'];
  deleteAppKeyValue: Scalars['Boolean']['output'];
  deleteAppMessageChannel: MessageChannel;
  deleteApplicationRegistration: Scalars['Boolean']['output'];
  deleteApprovedAccessDomain: Scalars['Boolean']['output'];
  deleteCommandMenuItem: CommandMenuItem;
  deleteConnectedAccount: ConnectedAccountPublicDto;
  deleteCurrentWorkspace: Workspace;
  deleteEmailGroupChannel: MessageChannel;
  deleteEmailingDomain: Scalars['Boolean']['output'];
  deleteFrontComponent: FrontComponent;
  deleteManyNavigationMenuItems: Array<NavigationMenuItem>;
  deleteMcpServer: McpServer;
  deleteMessageSuppression: Scalars['Boolean']['output'];
  deleteNavigationMenuItem: NavigationMenuItem;
  deleteOneAgent: Agent;
  deleteOneField: Field;
  deleteOneIndex: Index;
  deleteOneLogicFunction: LogicFunction;
  deleteOneObject: Object;
  deleteOneRole: Scalars['String']['output'];
  deletePublicDomain: Scalars['Boolean']['output'];
  deleteQueuedChatMessage: Scalars['Boolean']['output'];
  deleteSSOIdentityProvider: DeleteSso;
  deleteSkill: Skill;
  deleteTwoFactorAuthenticationMethod: DeleteTwoFactorAuthenticationMethod;
  deleteUnsubscribeTopic: Scalars['Boolean']['output'];
  deleteUsageLimit: Scalars['Boolean']['output'];
  deleteUser: User;
  deleteUserFromWorkspace: UserWorkspace;
  deleteValidationRule: ValidationRule;
  deleteView: Scalars['Boolean']['output'];
  deleteViewField: ViewField;
  deleteViewFieldGroup: ViewFieldGroup;
  deleteViewFilter: ViewFilter;
  deleteViewFilterGroup: Scalars['Boolean']['output'];
  deleteViewGroup: ViewGroup;
  deleteViewSort: Scalars['Boolean']['output'];
  deleteWebhook: Webhook;
  deleteWorkspaceInvitation: Scalars['String']['output'];
  destroyPageLayout: Scalars['Boolean']['output'];
  destroyPageLayoutTab: Scalars['Boolean']['output'];
  destroyPageLayoutWidget: Scalars['Boolean']['output'];
  destroyView: Scalars['Boolean']['output'];
  destroyViewField: ViewField;
  destroyViewFieldGroup: ViewFieldGroup;
  destroyViewFilter: ViewFilter;
  destroyViewFilterGroup: Scalars['Boolean']['output'];
  destroyViewGroup: ViewGroup;
  destroyViewSort: Scalars['Boolean']['output'];
  disconnectConnectedAccount: ConnectedAccountPublicDto;
  duplicateDashboard: DuplicatedDashboard;
  duplicateMessageList: DuplicatedMessageList;
  editSSOIdentityProvider: EditSso;
  emailPasswordResetLink: EmailPasswordResetLink;
  endSubscriptionTrialPeriod: BillingEndTrialPeriod;
  /** @deprecated Use enqueueJobs instead. */
  enqueueJob: EnqueueJobResult;
  enqueueJobs: EnqueueJobsResult;
  enrichWorkspaceCompany: WorkspaceCompanyEnrichmentResult;
  executeOneLogicFunction: LogicFunctionExecutionResult;
  generateApiKeyToken: ApiKeyToken;
  generateFrontComponentApplicationTokenPair: ApplicationTokenPair;
  generatePlaygroundToken: AuthToken;
  generateTransientToken: TransientToken;
  generateTwoFactorAuthenticationRecoveryCode: TwoFactorAuthenticationRecoveryCode;
  getAuthTokensFromLoginToken: AuthTokens;
  getAuthTokensFromOTP: AuthTokens;
  getAuthTokensFromSSOExchangeToken: AuthTokens;
  getAuthTokensFromTwoFactorAuthenticationRecoveryCode: TwoFactorAuthenticationRecoveryCodeRedemption;
  getAuthorizationUrlForSSO: GetAuthorizationUrlForSso;
  getLoginTokenFromCredentials: LoginToken;
  goBackToPreviousOnboardingStep: OnboardingStepNavigation;
  grantApplicationCapabilities: ApplicationCapabilityGrant;
  impersonate: Impersonate;
  ingestAppMessages: IngestAppMessagesOutput;
  initiateOTPProvisioning: InitiateTwoFactorAuthenticationProvisioning;
  initiateOTPProvisioningForAuthenticatedUser: InitiateTwoFactorAuthenticationProvisioning;
  installApplication: Application;
  /** @deprecated Use installApplication instead */
  installMarketplaceApp: Scalars['Boolean']['output'];
  markAgentChatThreadAsDoneInChannel: Scalars['Boolean']['output'];
  moveAgentChatThreadToChannel: Scalars['Boolean']['output'];
  refreshEnterpriseValidityToken: Scalars['Boolean']['output'];
  releaseEnterpriseServerBinding: EnterpriseLicenseInfoDto;
  removeAgentChatMessageReaction: Array<AgentMessageReactionSummary>;
  removeQueryFromEventStream: Scalars['Boolean']['output'];
  removeRecordShare: RecordSharingDto;
  removeRoleFromAgent: Scalars['Boolean']['output'];
  renewApplicationToken: ApplicationTokenPair;
  renewToken: AuthTokens;
  reopenAgentChatThreadInChannel: Scalars['Boolean']['output'];
  reportAppConnectionAuthFailure: Scalars['Boolean']['output'];
  resendEmailVerificationToken: ResendEmailVerificationToken;
  resendWorkspaceInvitation: SendInvitations;
  resetCommandMenuItem: CommandMenuItem;
  resetPageLayoutTabToDefault: PageLayoutTab;
  resetPageLayoutToDefault: PageLayout;
  resetPageLayoutWidgetToDefault: PageLayoutWidget;
  resetTimelineActivityType: TimelineActivityType;
  retryChatMessage: SendChatMessageResult;
  revokeAllOtherUserSessions: Scalars['Int']['output'];
  revokeApiKey?: Maybe<ApiKey>;
  revokeApplicationAuthorization: Scalars['Boolean']['output'];
  revokeTwoFactorAuthenticationRecoveryCode: Scalars['Boolean']['output'];
  revokeUserSession: Scalars['Boolean']['output'];
  rotateApplicationRegistrationClientSecret: RotateClientSecret;
  runAgent: RunAgentResult;
  runApplicationHealthCheck?: Maybe<ApplicationHealthCheckResult>;
  saveImapSmtpCaldavAccount: ImapSmtpCaldavConnectionSuccess;
  sendAppChannelMessage: SendAppChannelMessageOutput;
  sendChatMessage: SendChatMessageResult;
  sendEmail: SendEmailOutput;
  sendInboxMessage: SendInboxMessageResult;
  sendInvitations: SendInvitations;
  sendMessageCampaign: SendMessageCampaignOutputDto;
  sendMessageCampaignTest: SendEmailViaDomainOutput;
  setAppKeyValue: AppKeyValue;
  setEnterpriseKey: EnterpriseLicenseInfoDto;
  setRecordGeneralAccess: RecordSharingDto;
  setRecordShare: RecordSharingDto;
  setResourceCreditSubscriptionPrice: BillingUpdate;
  signIn: AvailableWorkspacesAndAccessTokens;
  signOut: Scalars['Boolean']['output'];
  signUp: AvailableWorkspacesAndAccessTokens;
  signUpInNewWorkspace: SignUp;
  signUpInWorkspace: SignUp;
  skipSyncEmailOnboardingStep: OnboardingStepSuccess;
  snoozeAgentChatThreadInChannel: Scalars['Boolean']['output'];
  startChannelSync: ChannelSyncSuccess;
  startWorkspaceSetupChat: StartWorkspaceSetupChatResult;
  stopAgentChatStream: Scalars['Boolean']['output'];
  stopImpersonation: StopImpersonation;
  switchBillingPlan: BillingUpdate;
  switchSubscriptionInterval: BillingUpdate;
  syncAppMessageFolders: Array<MessageFolder>;
  syncApplication: WorkspaceMigration;
  syncMarketplaceCatalog: Scalars['Boolean']['output'];
  trackAnalytics: Analytics;
  transferApplicationRegistrationOwnership: ApplicationRegistration;
  triggerAddPeopleToMessageListJob: TriggerAddPeopleToMessageListJobResult;
  triggerInstallApplication: TriggerInstallApplicationResult;
  /** @deprecated Use triggerInstallApplication instead */
  triggerInstallApplicationJob: TriggerInstallApplicationJobResult;
  triggerUninstallApplication: TriggerUninstallApplicationResult;
  /** @deprecated Use triggerUninstallApplication instead */
  triggerUninstallApplicationJob: TriggerUninstallApplicationJobResult;
  triggerUpgradeApplication: TriggerUpgradeApplicationResult;
  uninstallApplication: Scalars['Boolean']['output'];
  updateAgentChatChannel: AgentChatChannel;
  updateAgentChatThreadInboxState: Array<AgentChatThreadParticipant>;
  updateApiKey?: Maybe<ApiKey>;
  updateAppMessageChannel: MessageChannel;
  updateApplication: Application;
  updateApplicationRegistration: ApplicationRegistration;
  updateApplicationRegistrationVariable: ApplicationRegistrationVariable;
  updateCalendarChannel: CalendarChannel;
  updateCommandMenuItem: CommandMenuItem;
  updateEmailGroupChannel: MessageChannel;
  updateFrontComponent: FrontComponent;
  updateLabPublicFeatureFlag: FeatureFlag;
  updateManyNavigationMenuItems: Array<NavigationMenuItem>;
  updateManyObjects: Array<Object>;
  updateManyViewGroups: Array<ViewGroup>;
  updateMcpServer: McpServer;
  updateMessageChannel: MessageChannel;
  updateMessageFolder: MessageFolder;
  updateMessageFolders: Array<MessageFolder>;
  updateMyUserApplicationVariable: Scalars['Boolean']['output'];
  updateNavigationMenuItem: NavigationMenuItem;
  updateOneAgent: Agent;
  updateOneApplicationVariable: Scalars['Boolean']['output'];
  updateOneField: Field;
  updateOneLogicFunction: Scalars['Boolean']['output'];
  updateOneObject: Object;
  updateOneRole: Role;
  updatePageLayout: PageLayout;
  updatePageLayoutTab: PageLayoutTab;
  updatePageLayoutWidget: PageLayoutWidget;
  updatePageLayoutWithTabsAndWidgets: PageLayout;
  updatePasswordViaResetToken: InvalidatePassword;
  updateSkill: Skill;
  updateTimelineActivityType: TimelineActivityType;
  updateUnsubscribeTopic: UnsubscribeTopic;
  updateUsageLimit: UsageLimit;
  updateUserCreditsFallback: BillingCustomer;
  updateUserEmail: Scalars['Boolean']['output'];
  updateValidationRule: ValidationRule;
  updateView: View;
  updateViewField: ViewField;
  updateViewFieldGroup: ViewFieldGroup;
  updateViewFilter: ViewFilter;
  updateViewFilterGroup: ViewFilterGroup;
  updateViewGroup: ViewGroup;
  updateViewSort: ViewSort;
  updateWebhook: Webhook;
  updateWorkspace: Workspace;
  updateWorkspaceAllowedIframeOrigins: Workspace;
  updateWorkspaceMemberRole: WorkspaceMember;
  updateWorkspaceMemberSettings: Scalars['Boolean']['output'];
  upgradeApplication: Scalars['Boolean']['output'];
  /** @deprecated Use createFileUpload with the AppTarball folder and completeAppTarballUpload, which send the tarball straight to file storage. */
  uploadAppTarball: ApplicationRegistration;
  /** @deprecated Use createApplicationFileUploads and completeApplicationFileUploads, which send the files straight to file storage. */
  uploadApplicationFile: File;
  /** @deprecated Use createFileUpload with the FilesField folder and the fieldMetadataUniversalIdentifier, then completeFileUpload, which send the file straight to file storage. */
  uploadFilesFieldFileByUniversalIdentifier: FileWithSignedUrl;
  /** @deprecated Use createNewWorkspaceLogoUpload and completeNewWorkspaceLogoUpload, which send the logo straight to file storage. */
  uploadNewWorkspaceLogo: FileWithSignedUrl;
  /** @deprecated Use createFileUpload with the CorePicture folder and completeWorkspaceLogoUpload, which send the logo straight to file storage. */
  uploadWorkspaceLogo: FileWithSignedUrl;
  /** @deprecated Use createFileUpload with the CorePicture folder and completeWorkspaceMemberProfilePictureUpload, which send the picture straight to file storage. */
  uploadWorkspaceMemberProfilePicture: FileWithSignedUrl;
  upsertFieldPermissions: Array<FieldPermission>;
  upsertFieldsWidget: View;
  upsertObjectPermissions: Array<ObjectPermission>;
  upsertPermissionFlags: Array<RolePermissionFlag>;
  upsertRowLevelPermissionPredicates: UpsertRowLevelPermissionPredicatesResult;
  upsertViewWidget: View;
  validateApprovedAccessDomain: ApprovedAccessDomain;
  verifyEmailAndGetLoginToken: VerifyEmailAndGetLoginToken;
  verifyEmailAndGetWorkspaceAgnosticToken: AvailableWorkspacesAndAccessTokens;
  verifyEmailingDomain: EmailingDomain;
  verifyTwoFactorAuthenticationMethodForAuthenticatedUser: VerifyTwoFactorAuthenticationMethod;
};


export type MutationActivateSkillArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationActivateWorkspaceArgs = {
  data: ActivateWorkspaceInput;
};


export type MutationAddAgentChatMessageReactionArgs = {
  emoji: Scalars['String']['input'];
  messageId: Scalars['UUID']['input'];
};


export type MutationAddQueryToEventStreamArgs = {
  input: AddQuerySubscriptionInput;
};


export type MutationAssignAgentChatThreadArgs = {
  assigneeWorkspaceMemberId?: InputMaybe<Scalars['UUID']['input']>;
  threadId: Scalars['UUID']['input'];
};


export type MutationAssignRoleToAgentArgs = {
  agentId: Scalars['UUID']['input'];
  roleId: Scalars['UUID']['input'];
};


export type MutationAssignRoleToApiKeyArgs = {
  apiKeyId: Scalars['UUID']['input'];
  roleId: Scalars['UUID']['input'];
};


export type MutationAuthorizeAppArgs = {
  clientId: Scalars['String']['input'];
  codeChallenge?: InputMaybe<Scalars['String']['input']>;
  issuer?: InputMaybe<Scalars['String']['input']>;
  redirectUrl: Scalars['String']['input'];
  scope?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelMessageCampaignArgs = {
  input: CancelMessageCampaignInput;
};


export type MutationCheckPublicDomainValidRecordsArgs = {
  domain: Scalars['String']['input'];
};


export type MutationCheckoutSessionArgs = {
  plan: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
  requirePaymentMethod?: Scalars['Boolean']['input'];
  successUrlPath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationClaimApplicationRegistrationOwnershipArgs = {
  applicationRegistrationId: Scalars['String']['input'];
};


export type MutationCompleteAppTarballUploadArgs = {
  fileId: Scalars['UUID']['input'];
};


export type MutationCompleteApplicationFileUploadsArgs = {
  applicationUniversalIdentifier: Scalars['String']['input'];
  fileIds: Array<Scalars['UUID']['input']>;
};


export type MutationCompleteBookCallOnboardingStepArgs = {
  hasBookedCall?: Scalars['Boolean']['input'];
  isAutoSkipped?: Scalars['Boolean']['input'];
};


export type MutationCompleteFileUploadArgs = {
  fileId: Scalars['String']['input'];
};


export type MutationCompleteNewWorkspaceLogoUploadArgs = {
  fileId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationCompleteWorkspaceLogoUploadArgs = {
  fileId: Scalars['String']['input'];
};


export type MutationCompleteWorkspaceMemberProfilePictureUploadArgs = {
  fileId: Scalars['String']['input'];
};


export type MutationCreateAgentChatChannelArgs = {
  input: CreateAgentChatChannelInput;
};


export type MutationCreateApiKeyArgs = {
  input: CreateApiKeyInput;
};


export type MutationCreateAppMessageChannelArgs = {
  input: CreateAppMessageChannelInput;
};


export type MutationCreateApplicationFileUploadsArgs = {
  applicationUniversalIdentifier: Scalars['String']['input'];
  files: Array<ApplicationFileUploadRequestInput>;
};


export type MutationCreateApplicationRegistrationArgs = {
  input: CreateApplicationRegistrationInput;
};


export type MutationCreateApprovedAccessDomainArgs = {
  input: CreateApprovedAccessDomainInput;
};


export type MutationCreateCalendarEventArgs = {
  input: CreateCalendarEventInput;
};


export type MutationCreateChatThreadArgs = {
  channelId?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCreateCommandMenuItemArgs = {
  input: CreateCommandMenuItemInput;
};


export type MutationCreateDevelopmentApplicationArgs = {
  name: Scalars['String']['input'];
  universalIdentifier: Scalars['String']['input'];
};


export type MutationCreateEmailGroupChannelArgs = {
  input: CreateEmailGroupChannelInput;
};


export type MutationCreateEmailingDomainArgs = {
  input: CreateEmailingDomainInput;
};


export type MutationCreateFileUploadArgs = {
  fieldMetadataId?: InputMaybe<Scalars['String']['input']>;
  fieldMetadataUniversalIdentifier?: InputMaybe<Scalars['String']['input']>;
  fileFolder: FileFolder;
  filename: Scalars['String']['input'];
  size: Scalars['Float']['input'];
};


export type MutationCreateFrontComponentArgs = {
  input: CreateFrontComponentInput;
};


export type MutationCreateManyNavigationMenuItemsArgs = {
  inputs: Array<CreateNavigationMenuItemInput>;
};


export type MutationCreateManyViewFieldGroupsArgs = {
  inputs: Array<CreateViewFieldGroupInput>;
};


export type MutationCreateManyViewFieldsArgs = {
  inputs: Array<CreateViewFieldInput>;
};


export type MutationCreateManyViewGroupsArgs = {
  inputs: Array<CreateViewGroupInput>;
};


export type MutationCreateMcpServerArgs = {
  input: CreateMcpServerInput;
};


export type MutationCreateMessageSuppressionArgs = {
  input: CreateMessageSuppressionInput;
};


export type MutationCreateNavigationMenuItemArgs = {
  input: CreateNavigationMenuItemInput;
};


export type MutationCreateNewWorkspaceLogoUploadArgs = {
  filename: Scalars['String']['input'];
  size: Scalars['Float']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationCreateOidcIdentityProviderArgs = {
  input: SetupOidcSsoInput;
};


export type MutationCreateObjectEventArgs = {
  event: Scalars['String']['input'];
  objectMetadataId: Scalars['UUID']['input'];
  properties?: InputMaybe<Scalars['JSON']['input']>;
  recordId: Scalars['UUID']['input'];
};


export type MutationCreateOneAgentArgs = {
  input: CreateAgentInput;
};


export type MutationCreateOneFieldArgs = {
  input: CreateOneFieldMetadataInput;
};


export type MutationCreateOneIndexArgs = {
  input: CreateOneIndexInput;
};


export type MutationCreateOneLogicFunctionArgs = {
  input: CreateLogicFunctionFromSourceInput;
};


export type MutationCreateOneObjectArgs = {
  input: CreateOneObjectInput;
};


export type MutationCreateOneRoleArgs = {
  createRoleInput: CreateRoleInput;
};


export type MutationCreatePageLayoutArgs = {
  input: CreatePageLayoutInput;
};


export type MutationCreatePageLayoutTabArgs = {
  input: CreatePageLayoutTabInput;
};


export type MutationCreatePageLayoutWidgetArgs = {
  input: CreatePageLayoutWidgetInput;
};


export type MutationCreatePublicDomainArgs = {
  applicationId: Scalars['String']['input'];
  domain: Scalars['String']['input'];
};


export type MutationCreateSamlIdentityProviderArgs = {
  input: SetupSamlSsoInput;
};


export type MutationCreateSkillArgs = {
  input: CreateSkillInput;
};


export type MutationCreateSubscriptionPaymentIntentArgs = {
  idempotencyKey: Scalars['String']['input'];
  plan: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
  requirePaymentMethod?: Scalars['Boolean']['input'];
  successUrlPath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateUnsubscribeTopicArgs = {
  input: CreateUnsubscribeTopicInput;
};


export type MutationCreateUsageLimitArgs = {
  input: CreateUsageLimitInput;
};


export type MutationCreateValidationRuleArgs = {
  input: CreateValidationRuleInput;
};


export type MutationCreateViewArgs = {
  input: CreateViewInput;
};


export type MutationCreateViewFieldArgs = {
  input: CreateViewFieldInput;
};


export type MutationCreateViewFieldGroupArgs = {
  input: CreateViewFieldGroupInput;
};


export type MutationCreateViewFilterArgs = {
  input: CreateViewFilterInput;
};


export type MutationCreateViewFilterGroupArgs = {
  input: CreateViewFilterGroupInput;
};


export type MutationCreateViewGroupArgs = {
  input: CreateViewGroupInput;
};


export type MutationCreateViewSortArgs = {
  input: CreateViewSortInput;
};


export type MutationCreateWebhookArgs = {
  input: CreateWebhookInput;
};


export type MutationDeactivateSkillArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteAgentChatChannelArgs = {
  channelId: Scalars['UUID']['input'];
  destinationChannelId?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationDeleteAppKeyValueArgs = {
  key: Scalars['String']['input'];
  scope?: InputMaybe<AppKeyValueScope>;
};


export type MutationDeleteAppMessageChannelArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteApplicationRegistrationArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteApprovedAccessDomainArgs = {
  input: DeleteApprovedAccessDomainInput;
};


export type MutationDeleteCommandMenuItemArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteConnectedAccountArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteEmailGroupChannelArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteEmailingDomainArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteFrontComponentArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteManyNavigationMenuItemsArgs = {
  ids: Array<Scalars['UUID']['input']>;
};


export type MutationDeleteMcpServerArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteMessageSuppressionArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteNavigationMenuItemArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteOneAgentArgs = {
  input: AgentIdInput;
};


export type MutationDeleteOneFieldArgs = {
  input: DeleteOneFieldInput;
};


export type MutationDeleteOneIndexArgs = {
  input: DeleteOneIndexInput;
};


export type MutationDeleteOneLogicFunctionArgs = {
  input: LogicFunctionIdInput;
};


export type MutationDeleteOneObjectArgs = {
  input: DeleteOneObjectInput;
};


export type MutationDeleteOneRoleArgs = {
  roleId: Scalars['UUID']['input'];
};


export type MutationDeletePublicDomainArgs = {
  domain: Scalars['String']['input'];
};


export type MutationDeleteQueuedChatMessageArgs = {
  messageId: Scalars['UUID']['input'];
};


export type MutationDeleteSsoIdentityProviderArgs = {
  input: DeleteSsoInput;
};


export type MutationDeleteSkillArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteTwoFactorAuthenticationMethodArgs = {
  twoFactorAuthenticationMethodId: Scalars['UUID']['input'];
};


export type MutationDeleteUnsubscribeTopicArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteUsageLimitArgs = {
  usageLimitId: Scalars['UUID']['input'];
};


export type MutationDeleteUserFromWorkspaceArgs = {
  workspaceMemberIdToDelete: Scalars['String']['input'];
};


export type MutationDeleteValidationRuleArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteViewArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteViewFieldArgs = {
  input: DeleteViewFieldInput;
};


export type MutationDeleteViewFieldGroupArgs = {
  input: DeleteViewFieldGroupInput;
};


export type MutationDeleteViewFilterArgs = {
  input: DeleteViewFilterInput;
};


export type MutationDeleteViewFilterGroupArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteViewGroupArgs = {
  input: DeleteViewGroupInput;
};


export type MutationDeleteViewSortArgs = {
  input: DeleteViewSortInput;
};


export type MutationDeleteWebhookArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteWorkspaceInvitationArgs = {
  appTokenId: Scalars['String']['input'];
};


export type MutationDestroyPageLayoutArgs = {
  id: Scalars['String']['input'];
};


export type MutationDestroyPageLayoutTabArgs = {
  id: Scalars['String']['input'];
};


export type MutationDestroyPageLayoutWidgetArgs = {
  id: Scalars['String']['input'];
};


export type MutationDestroyViewArgs = {
  id: Scalars['String']['input'];
};


export type MutationDestroyViewFieldArgs = {
  input: DestroyViewFieldInput;
};


export type MutationDestroyViewFieldGroupArgs = {
  input: DestroyViewFieldGroupInput;
};


export type MutationDestroyViewFilterArgs = {
  input: DestroyViewFilterInput;
};


export type MutationDestroyViewFilterGroupArgs = {
  id: Scalars['String']['input'];
};


export type MutationDestroyViewGroupArgs = {
  input: DestroyViewGroupInput;
};


export type MutationDestroyViewSortArgs = {
  input: DestroyViewSortInput;
};


export type MutationDisconnectConnectedAccountArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDuplicateDashboardArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDuplicateMessageListArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationEditSsoIdentityProviderArgs = {
  input: EditSsoInput;
};


export type MutationEmailPasswordResetLinkArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  workspaceId?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationEnqueueJobArgs = {
  input: EnqueueJobInput;
};


export type MutationEnqueueJobsArgs = {
  input: EnqueueJobsInput;
};


export type MutationExecuteOneLogicFunctionArgs = {
  input: ExecuteOneLogicFunctionInput;
};


export type MutationGenerateApiKeyTokenArgs = {
  apiKeyId: Scalars['UUID']['input'];
  expiresAt: Scalars['String']['input'];
};


export type MutationGenerateFrontComponentApplicationTokenPairArgs = {
  applicationId: Scalars['UUID']['input'];
};


export type MutationGenerateTwoFactorAuthenticationRecoveryCodeArgs = {
  otp?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['UUID']['input'];
};


export type MutationGetAuthTokensFromLoginTokenArgs = {
  loginToken: Scalars['String']['input'];
  origin: Scalars['String']['input'];
};


export type MutationGetAuthTokensFromOtpArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  loginToken: Scalars['String']['input'];
  origin: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};


export type MutationGetAuthTokensFromSsoExchangeTokenArgs = {
  ssoExchangeToken: Scalars['String']['input'];
};


export type MutationGetAuthTokensFromTwoFactorAuthenticationRecoveryCodeArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  loginToken: Scalars['String']['input'];
  origin: Scalars['String']['input'];
  recoveryCode: Scalars['String']['input'];
};


export type MutationGetAuthorizationUrlForSsoArgs = {
  input: GetAuthorizationUrlForSsoInput;
};


export type MutationGetLoginTokenFromCredentialsArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  origin: Scalars['String']['input'];
  password: Scalars['String']['input'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGrantApplicationCapabilitiesArgs = {
  input: GrantApplicationCapabilitiesInput;
};


export type MutationImpersonateArgs = {
  userId: Scalars['UUID']['input'];
  workspaceId: Scalars['UUID']['input'];
};


export type MutationIngestAppMessagesArgs = {
  input: IngestAppMessagesInput;
};


export type MutationInitiateOtpProvisioningArgs = {
  loginToken: Scalars['String']['input'];
  origin: Scalars['String']['input'];
};


export type MutationInstallApplicationArgs = {
  universalIdentifier: Scalars['String']['input'];
  version?: InputMaybe<Scalars['String']['input']>;
};


export type MutationInstallMarketplaceAppArgs = {
  universalIdentifier: Scalars['String']['input'];
  version?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMarkAgentChatThreadAsDoneInChannelArgs = {
  threadId: Scalars['UUID']['input'];
};


export type MutationMoveAgentChatThreadToChannelArgs = {
  channelId?: InputMaybe<Scalars['UUID']['input']>;
  threadId: Scalars['UUID']['input'];
};


export type MutationRemoveAgentChatMessageReactionArgs = {
  emoji: Scalars['String']['input'];
  messageId: Scalars['UUID']['input'];
};


export type MutationRemoveQueryFromEventStreamArgs = {
  input: RemoveQueryFromEventStreamInput;
};


export type MutationRemoveRecordShareArgs = {
  principal: RecordSharePrincipalInput;
  target: RecordTargetInput;
};


export type MutationRemoveRoleFromAgentArgs = {
  agentId: Scalars['UUID']['input'];
};


export type MutationRenewApplicationTokenArgs = {
  applicationRefreshToken: Scalars['String']['input'];
};


export type MutationRenewTokenArgs = {
  appToken: Scalars['String']['input'];
};


export type MutationReopenAgentChatThreadInChannelArgs = {
  threadId: Scalars['UUID']['input'];
};


export type MutationReportAppConnectionAuthFailureArgs = {
  input: ReportAppConnectionAuthFailureInput;
};


export type MutationResendEmailVerificationTokenArgs = {
  email: Scalars['String']['input'];
  origin: Scalars['String']['input'];
};


export type MutationResendWorkspaceInvitationArgs = {
  appTokenId: Scalars['String']['input'];
};


export type MutationResetCommandMenuItemArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationResetPageLayoutTabToDefaultArgs = {
  id: Scalars['String']['input'];
};


export type MutationResetPageLayoutToDefaultArgs = {
  id: Scalars['String']['input'];
};


export type MutationResetPageLayoutWidgetToDefaultArgs = {
  id: Scalars['String']['input'];
};


export type MutationResetTimelineActivityTypeArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationRetryChatMessageArgs = {
  modelId?: InputMaybe<Scalars['String']['input']>;
  threadId: Scalars['UUID']['input'];
};


export type MutationRevokeApiKeyArgs = {
  input: RevokeApiKeyInput;
};


export type MutationRevokeApplicationAuthorizationArgs = {
  applicationAuthorizationId: Scalars['UUID']['input'];
};


export type MutationRevokeTwoFactorAuthenticationRecoveryCodeArgs = {
  userId: Scalars['UUID']['input'];
};


export type MutationRevokeUserSessionArgs = {
  userSessionId: Scalars['UUID']['input'];
};


export type MutationRotateApplicationRegistrationClientSecretArgs = {
  id: Scalars['String']['input'];
};


export type MutationRunAgentArgs = {
  input: RunAgentInput;
};


export type MutationRunApplicationHealthCheckArgs = {
  applicationId: Scalars['UUID']['input'];
};


export type MutationSaveImapSmtpCaldavAccountArgs = {
  connectionParameters: EmailAccountConnectionParameters;
  handle: Scalars['String']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationSendAppChannelMessageArgs = {
  input: SendAppChannelMessageInput;
};


export type MutationSendChatMessageArgs = {
  browsingContext?: InputMaybe<Scalars['JSON']['input']>;
  channelId?: InputMaybe<Scalars['UUID']['input']>;
  fileAttachments?: InputMaybe<Array<FileAttachmentInput>>;
  mentionedWorkspaceMemberIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
  messageId: Scalars['UUID']['input'];
  modelId?: InputMaybe<Scalars['String']['input']>;
  shouldAssistantReply?: InputMaybe<Scalars['Boolean']['input']>;
  text: Scalars['String']['input'];
  threadId: Scalars['UUID']['input'];
};


export type MutationSendEmailArgs = {
  input: SendEmailInput;
};


export type MutationSendInboxMessageArgs = {
  input: SendInboxMessageInput;
};


export type MutationSendInvitationsArgs = {
  emails: Array<Scalars['String']['input']>;
  roleId?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationSendMessageCampaignArgs = {
  input: SendMessageCampaignInput;
};


export type MutationSendMessageCampaignTestArgs = {
  input: SendMessageCampaignTestInput;
};


export type MutationSetAppKeyValueArgs = {
  input: SetAppKeyValueInput;
};


export type MutationSetEnterpriseKeyArgs = {
  enterpriseKey: Scalars['String']['input'];
};


export type MutationSetRecordGeneralAccessArgs = {
  accessLevel: RecordShareAccessLevel;
  target: RecordTargetInput;
};


export type MutationSetRecordShareArgs = {
  accessLevel: RecordShareAccessLevel;
  principal: RecordSharePrincipalInput;
  target: RecordTargetInput;
};


export type MutationSetResourceCreditSubscriptionPriceArgs = {
  priceId: Scalars['String']['input'];
};


export type MutationSignInArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSignOutArgs = {
  refreshToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSignUpArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSignUpInNewWorkspaceArgs = {
  input?: InputMaybe<SignUpInNewWorkspaceInput>;
};


export type MutationSignUpInWorkspaceArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']['input']>;
  workspaceId?: InputMaybe<Scalars['UUID']['input']>;
  workspaceInviteHash?: InputMaybe<Scalars['String']['input']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSkipSyncEmailOnboardingStepArgs = {
  isAutoSkipped?: Scalars['Boolean']['input'];
};


export type MutationSnoozeAgentChatThreadInChannelArgs = {
  snoozedUntil: Scalars['DateTime']['input'];
  threadId: Scalars['UUID']['input'];
};


export type MutationStartChannelSyncArgs = {
  connectedAccountId: Scalars['UUID']['input'];
};


export type MutationStartWorkspaceSetupChatArgs = {
  companyContext?: InputMaybe<Scalars['JSON']['input']>;
  personContext?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationStopAgentChatStreamArgs = {
  threadId: Scalars['UUID']['input'];
};


export type MutationSwitchBillingPlanArgs = {
  plan?: InputMaybe<BillingPlanKey>;
};


export type MutationSyncAppMessageFoldersArgs = {
  input: SyncAppMessageFoldersInput;
};


export type MutationSyncApplicationArgs = {
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  inferDeletionFromMissingEntities?: InputMaybe<Scalars['Boolean']['input']>;
  manifest: Scalars['JSON']['input'];
};


export type MutationTrackAnalyticsArgs = {
  event?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  properties?: InputMaybe<Scalars['JSON']['input']>;
  type: AnalyticsType;
};


export type MutationTransferApplicationRegistrationOwnershipArgs = {
  applicationRegistrationId: Scalars['String']['input'];
  targetWorkspaceSubdomain: Scalars['String']['input'];
};


export type MutationTriggerAddPeopleToMessageListJobArgs = {
  input: TriggerAddPeopleToMessageListJobInput;
};


export type MutationTriggerInstallApplicationArgs = {
  input: TriggerInstallApplicationInput;
};


export type MutationTriggerInstallApplicationJobArgs = {
  input: TriggerInstallApplicationJobInput;
};


export type MutationTriggerUninstallApplicationArgs = {
  input: TriggerUninstallApplicationInput;
};


export type MutationTriggerUninstallApplicationJobArgs = {
  input: TriggerUninstallApplicationJobInput;
};


export type MutationTriggerUpgradeApplicationArgs = {
  input: TriggerUpgradeApplicationInput;
};


export type MutationUninstallApplicationArgs = {
  universalIdentifier: Scalars['String']['input'];
};


export type MutationUpdateAgentChatChannelArgs = {
  channelId: Scalars['UUID']['input'];
  input: UpdateAgentChatChannelInput;
};


export type MutationUpdateAgentChatThreadInboxStateArgs = {
  action: AgentChatInboxAction;
  snoozedUntil?: InputMaybe<Scalars['DateTime']['input']>;
  threadIds: Array<Scalars['UUID']['input']>;
};


export type MutationUpdateApiKeyArgs = {
  input: UpdateApiKeyInput;
};


export type MutationUpdateAppMessageChannelArgs = {
  input: UpdateAppMessageChannelInput;
};


export type MutationUpdateApplicationArgs = {
  id: Scalars['UUID']['input'];
  input: UpdateApplicationInput;
};


export type MutationUpdateApplicationRegistrationArgs = {
  input: UpdateApplicationRegistrationInput;
};


export type MutationUpdateApplicationRegistrationVariableArgs = {
  input: UpdateApplicationRegistrationVariableInput;
};


export type MutationUpdateCalendarChannelArgs = {
  input: UpdateCalendarChannelInput;
};


export type MutationUpdateCommandMenuItemArgs = {
  input: UpdateCommandMenuItemInput;
};


export type MutationUpdateEmailGroupChannelArgs = {
  input: UpdateEmailGroupChannelInput;
};


export type MutationUpdateFrontComponentArgs = {
  input: UpdateFrontComponentInput;
};


export type MutationUpdateLabPublicFeatureFlagArgs = {
  input: UpdateLabPublicFeatureFlagInput;
};


export type MutationUpdateManyNavigationMenuItemsArgs = {
  inputs: Array<UpdateOneNavigationMenuItemInput>;
};


export type MutationUpdateManyObjectsArgs = {
  inputs: Array<UpdateOneObjectInput>;
};


export type MutationUpdateManyViewGroupsArgs = {
  inputs: Array<UpdateViewGroupInput>;
};


export type MutationUpdateMcpServerArgs = {
  input: UpdateMcpServerInput;
};


export type MutationUpdateMessageChannelArgs = {
  input: UpdateMessageChannelInput;
};


export type MutationUpdateMessageFolderArgs = {
  input: UpdateMessageFolderInput;
};


export type MutationUpdateMessageFoldersArgs = {
  input: UpdateMessageFoldersInput;
};


export type MutationUpdateMyUserApplicationVariableArgs = {
  applicationUniversalIdentifier: Scalars['String']['input'];
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};


export type MutationUpdateNavigationMenuItemArgs = {
  input: UpdateOneNavigationMenuItemInput;
};


export type MutationUpdateOneAgentArgs = {
  input: UpdateAgentInput;
};


export type MutationUpdateOneApplicationVariableArgs = {
  applicationId?: InputMaybe<Scalars['UUID']['input']>;
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};


export type MutationUpdateOneFieldArgs = {
  input: UpdateOneFieldMetadataInput;
};


export type MutationUpdateOneLogicFunctionArgs = {
  input: UpdateLogicFunctionFromSourceInput;
};


export type MutationUpdateOneObjectArgs = {
  input: UpdateOneObjectInput;
};


export type MutationUpdateOneRoleArgs = {
  updateRoleInput: UpdateRoleInput;
};


export type MutationUpdatePageLayoutArgs = {
  id: Scalars['String']['input'];
  input: UpdatePageLayoutInput;
};


export type MutationUpdatePageLayoutTabArgs = {
  id: Scalars['String']['input'];
  input: UpdatePageLayoutTabInput;
};


export type MutationUpdatePageLayoutWidgetArgs = {
  id: Scalars['String']['input'];
  input: UpdatePageLayoutWidgetInput;
};


export type MutationUpdatePageLayoutWithTabsAndWidgetsArgs = {
  id: Scalars['String']['input'];
  input: UpdatePageLayoutWithTabsInput;
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String']['input'];
  passwordResetToken: Scalars['String']['input'];
};


export type MutationUpdateSkillArgs = {
  input: UpdateSkillInput;
};


export type MutationUpdateTimelineActivityTypeArgs = {
  input: UpdateTimelineActivityTypeInput;
};


export type MutationUpdateUnsubscribeTopicArgs = {
  input: UpdateUnsubscribeTopicInput;
};


export type MutationUpdateUsageLimitArgs = {
  input: UpdateUsageLimitInput;
};


export type MutationUpdateUserCreditsFallbackArgs = {
  userCreditsFallback: UserCreditsFallback;
};


export type MutationUpdateUserEmailArgs = {
  newEmail: Scalars['String']['input'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateValidationRuleArgs = {
  input: UpdateValidationRuleInput;
};


export type MutationUpdateViewArgs = {
  id: Scalars['String']['input'];
  input: UpdateViewInput;
};


export type MutationUpdateViewFieldArgs = {
  input: UpdateViewFieldInput;
};


export type MutationUpdateViewFieldGroupArgs = {
  input: UpdateViewFieldGroupInput;
};


export type MutationUpdateViewFilterArgs = {
  input: UpdateViewFilterInput;
};


export type MutationUpdateViewFilterGroupArgs = {
  id: Scalars['String']['input'];
  input: UpdateViewFilterGroupInput;
};


export type MutationUpdateViewGroupArgs = {
  input: UpdateViewGroupInput;
};


export type MutationUpdateViewSortArgs = {
  input: UpdateViewSortInput;
};


export type MutationUpdateWebhookArgs = {
  input: UpdateWebhookInput;
};


export type MutationUpdateWorkspaceArgs = {
  data: UpdateWorkspaceInput;
};


export type MutationUpdateWorkspaceAllowedIframeOriginsArgs = {
  data: UpdateWorkspaceAllowedIframeOriginsInput;
};


export type MutationUpdateWorkspaceMemberRoleArgs = {
  roleId: Scalars['UUID']['input'];
  workspaceMemberId: Scalars['UUID']['input'];
};


export type MutationUpdateWorkspaceMemberSettingsArgs = {
  input: UpdateWorkspaceMemberSettingsInput;
};


export type MutationUpgradeApplicationArgs = {
  appRegistrationId: Scalars['String']['input'];
  targetVersion: Scalars['String']['input'];
};


export type MutationUploadAppTarballArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadApplicationFileArgs = {
  applicationUniversalIdentifier: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
  fileFolder: FileFolder;
  filePath: Scalars['String']['input'];
};


export type MutationUploadFilesFieldFileByUniversalIdentifierArgs = {
  fieldMetadataUniversalIdentifier: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
};


export type MutationUploadNewWorkspaceLogoArgs = {
  file: Scalars['Upload']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationUploadWorkspaceLogoArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadWorkspaceMemberProfilePictureArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUpsertFieldPermissionsArgs = {
  upsertFieldPermissionsInput: UpsertFieldPermissionsInput;
};


export type MutationUpsertFieldsWidgetArgs = {
  input: UpsertFieldsWidgetInput;
};


export type MutationUpsertObjectPermissionsArgs = {
  upsertObjectPermissionsInput: UpsertObjectPermissionsInput;
};


export type MutationUpsertPermissionFlagsArgs = {
  upsertPermissionFlagsInput: UpsertPermissionFlagsInput;
};


export type MutationUpsertRowLevelPermissionPredicatesArgs = {
  input: UpsertRowLevelPermissionPredicatesInput;
};


export type MutationUpsertViewWidgetArgs = {
  input: UpsertViewWidgetInput;
};


export type MutationValidateApprovedAccessDomainArgs = {
  input: ValidateApprovedAccessDomainInput;
};


export type MutationVerifyEmailAndGetLoginTokenArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  emailVerificationToken: Scalars['String']['input'];
  origin: Scalars['String']['input'];
};


export type MutationVerifyEmailAndGetWorkspaceAgnosticTokenArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  emailVerificationToken: Scalars['String']['input'];
};


export type MutationVerifyEmailingDomainArgs = {
  id: Scalars['String']['input'];
};


export type MutationVerifyTwoFactorAuthenticationMethodForAuthenticatedUserArgs = {
  otp: Scalars['String']['input'];
};

export type NativeModelCapabilities = {
  __typename?: 'NativeModelCapabilities';
  twitterSearch?: Maybe<Scalars['Boolean']['output']>;
  webSearch?: Maybe<Scalars['Boolean']['output']>;
};

export type NavigationMenuItem = {
  __typename?: 'NavigationMenuItem';
  agentChatChannelId?: Maybe<Scalars['UUID']['output']>;
  applicationId?: Maybe<Scalars['UUID']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  folderId?: Maybe<Scalars['UUID']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  link?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pageLayoutId?: Maybe<Scalars['UUID']['output']>;
  position: Scalars['Float']['output'];
  targetObjectMetadataId?: Maybe<Scalars['UUID']['output']>;
  targetRecordId?: Maybe<Scalars['UUID']['output']>;
  targetRecordIdentifier?: Maybe<RecordIdentifier>;
  type: NavigationMenuItemType;
  updatedAt: Scalars['DateTime']['output'];
  userWorkspaceId?: Maybe<Scalars['UUID']['output']>;
  viewId?: Maybe<Scalars['UUID']['output']>;
};

export enum NavigationMenuItemType {
  AGENT_CHAT_CHANNEL = 'AGENT_CHAT_CHANNEL',
  FOLDER = 'FOLDER',
  LINK = 'LINK',
  OBJECT = 'OBJECT',
  PAGE_LAYOUT = 'PAGE_LAYOUT',
  RECORD = 'RECORD',
  VIEW = 'VIEW'
}

export type NotesConfiguration = {
  __typename?: 'NotesConfiguration';
  configurationType: WidgetConfigurationType;
};

export type Object = {
  __typename?: 'Object';
  applicationId: Scalars['UUID']['output'];
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  disabledObjectPermissionActions?: Maybe<Array<Scalars['String']['output']>>;
  duplicateCriteria?: Maybe<Array<Array<Scalars['String']['output']>>>;
  fields: ObjectFieldsConnection;
  fieldsList: Array<Field>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  imageIdentifierFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  indexMetadataList: Array<Index>;
  indexMetadatas: ObjectIndexMetadatasConnection;
  isActive: Scalars['Boolean']['output'];
  isAuditLogged: Scalars['Boolean']['output'];
  isLabelSyncedWithName: Scalars['Boolean']['output'];
  isRemote: Scalars['Boolean']['output'];
  isSearchable: Scalars['Boolean']['output'];
  isSystem: Scalars['Boolean']['output'];
  isUICreatable: Scalars['Boolean']['output'];
  isUIEditable: Scalars['Boolean']['output'];
  /** @deprecated Use isUIEditable */
  isUIReadOnly: Scalars['Boolean']['output'];
  labelIdentifierFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  labelPlural: Scalars['String']['output'];
  labelSingular: Scalars['String']['output'];
  namePlural: Scalars['String']['output'];
  nameSingular: Scalars['String']['output'];
  openRecordIn: ObjectOpenRecordIn;
  readability: MetadataReadability;
  readabilityParentFieldUniversalIdentifiers?: Maybe<Array<Scalars['UUID']['output']>>;
  searchFieldMetadataList: Array<SearchField>;
  sharingReach: ObjectSharingReach;
  shortcut?: Maybe<Scalars['String']['output']>;
  universalIdentifier: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  writability: MetadataWritability;
};


export type ObjectFieldsArgs = {
  filter?: FieldFilter;
  paging?: CursorPaging;
};


export type ObjectIndexMetadatasArgs = {
  filter?: IndexFilter;
  paging?: CursorPaging;
};

export type ObjectConnection = {
  __typename?: 'ObjectConnection';
  /** Array of edges. */
  edges: Array<ObjectEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectEdge = {
  __typename?: 'ObjectEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the Object */
  node: Object;
};

export type ObjectFieldsConnection = {
  __typename?: 'ObjectFieldsConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectFilter = {
  and?: InputMaybe<Array<ObjectFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  isActive?: InputMaybe<BooleanFieldComparison>;
  isRemote?: InputMaybe<BooleanFieldComparison>;
  isSearchable?: InputMaybe<BooleanFieldComparison>;
  isSystem?: InputMaybe<BooleanFieldComparison>;
  isUICreatable?: InputMaybe<BooleanFieldComparison>;
  isUIEditable?: InputMaybe<BooleanFieldComparison>;
  isUIReadOnly?: InputMaybe<BooleanFieldComparison>;
  or?: InputMaybe<Array<ObjectFilter>>;
  universalIdentifier?: InputMaybe<UuidFilterComparison>;
};

export type ObjectIndexMetadatasConnection = {
  __typename?: 'ObjectIndexMetadatasConnection';
  /** Array of edges. */
  edges: Array<IndexEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectMetadataCommandMenuItemPayload = {
  __typename?: 'ObjectMetadataCommandMenuItemPayload';
  /** @deprecated Never returned anymore: navigation targets moved to CommandMenuItem.navigationTargetObjectMetadataId. This variant only remains one release so frontends deployed after the server keep validating; it will be removed in the next release. */
  objectMetadataItemId: Scalars['UUID']['output'];
};

export enum ObjectOpenRecordIn {
  RECORD_PAGE = 'RECORD_PAGE',
  SIDE_PANEL = 'SIDE_PANEL',
  USER_CHOICE = 'USER_CHOICE'
}

export type ObjectPermission = {
  __typename?: 'ObjectPermission';
  canDestroyObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canReadObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canSoftDeleteObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canUpdateObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  objectMetadataId: Scalars['UUID']['output'];
  restrictedFields?: Maybe<Scalars['JSON']['output']>;
  rowLevelPermissionPredicateGroups?: Maybe<Array<RowLevelPermissionPredicateGroup>>;
  rowLevelPermissionPredicates?: Maybe<Array<RowLevelPermissionPredicate>>;
};

export type ObjectPermissionInput = {
  canDestroyObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canReadObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canSoftDeleteObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  objectMetadataId: Scalars['UUID']['input'];
};

export type ObjectRecordCount = {
  __typename?: 'ObjectRecordCount';
  objectNamePlural: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
};

export type ObjectRecordEvent = {
  __typename?: 'ObjectRecordEvent';
  action: DatabaseEventAction;
  objectNameSingular: Scalars['String']['output'];
  properties: ObjectRecordEventProperties;
  recordId: Scalars['String']['output'];
  userId?: Maybe<Scalars['String']['output']>;
  workspaceMemberId?: Maybe<Scalars['String']['output']>;
};

export type ObjectRecordEventProperties = {
  __typename?: 'ObjectRecordEventProperties';
  after?: Maybe<Scalars['JSON']['output']>;
  before?: Maybe<Scalars['JSON']['output']>;
  diff?: Maybe<Scalars['JSON']['output']>;
  updatedFields?: Maybe<Array<Scalars['String']['output']>>;
};

export type ObjectRecordEventWithQueryIds = {
  __typename?: 'ObjectRecordEventWithQueryIds';
  objectRecordEvent: ObjectRecordEvent;
  queryIds: Array<Scalars['String']['output']>;
};

/** Date granularity options (e.g. DAY, MONTH, QUARTER, YEAR, WEEK, DAY_OF_THE_WEEK, MONTH_OF_THE_YEAR, QUARTER_OF_THE_YEAR) */
export enum ObjectRecordGroupByDateGranularity {
  DAY = 'DAY',
  DAY_OF_THE_WEEK = 'DAY_OF_THE_WEEK',
  MONTH = 'MONTH',
  MONTH_OF_THE_YEAR = 'MONTH_OF_THE_YEAR',
  NONE = 'NONE',
  QUARTER = 'QUARTER',
  QUARTER_OF_THE_YEAR = 'QUARTER_OF_THE_YEAR',
  WEEK = 'WEEK',
  YEAR = 'YEAR'
}

export enum ObjectSharingReach {
  ROLE_ACCESS = 'ROLE_ACCESS',
  WORKSPACE = 'WORKSPACE'
}

/** Onboarding status */
export enum OnboardingStatus {
  BOOK_CALL = 'BOOK_CALL',
  COMPLETED = 'COMPLETED',
  INVITE_TEAM = 'INVITE_TEAM',
  PLAN_REQUIRED = 'PLAN_REQUIRED',
  PROFILE_CREATION = 'PROFILE_CREATION',
  SYNC_EMAIL = 'SYNC_EMAIL',
  WORKSPACE_ACTIVATION = 'WORKSPACE_ACTIVATION'
}

export type OnboardingStepNavigation = {
  __typename?: 'OnboardingStepNavigation';
  /** Onboarding status the user landed on */
  onboardingStatus?: Maybe<OnboardingStatus>;
  /** Step the user can go back to from there, if any */
  previousOnboardingStatus?: Maybe<OnboardingStatus>;
};

export type OnboardingStepSuccess = {
  __typename?: 'OnboardingStepSuccess';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export enum OpenRecordIn {
  RECORD_PAGE = 'RECORD_PAGE',
  SIDE_PANEL = 'SIDE_PANEL'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  /** The cursor of the last returned record. */
  endCursor?: Maybe<Scalars['ConnectionCursor']['output']>;
  /** true if paging forward and there are more records. */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** true if paging backwards and there are more records. */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The cursor of the first returned record. */
  startCursor?: Maybe<Scalars['ConnectionCursor']['output']>;
};

export type PageLayout = {
  __typename?: 'PageLayout';
  applicationId: Scalars['UUID']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultTabToFocusOnMobileAndSidePanelId?: Maybe<Scalars['UUID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isFirstTabPinned: Scalars['Boolean']['output'];
  isSystemSideEffect: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  objectMetadataId?: Maybe<Scalars['UUID']['output']>;
  tabs?: Maybe<Array<PageLayoutTab>>;
  type: PageLayoutType;
  universalIdentifier: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PageLayoutTab = {
  __typename?: 'PageLayoutTab';
  applicationId: Scalars['UUID']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** @deprecated isOverridden is deprecated */
  isOverridden?: Maybe<Scalars['Boolean']['output']>;
  isSystemSideEffect: Scalars['Boolean']['output'];
  layoutMode?: Maybe<PageLayoutTabLayoutMode>;
  pageLayoutId: Scalars['UUID']['output'];
  position: Scalars['Float']['output'];
  title: Scalars['String']['output'];
  universalIdentifier: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  widgets?: Maybe<Array<PageLayoutWidget>>;
};

export enum PageLayoutTabLayoutMode {
  /** @deprecated Use VERTICAL_LIST with TAB_VIEWPORT widget height behavior. */
  CANVAS = 'CANVAS',
  GRID = 'GRID',
  VERTICAL_LIST = 'VERTICAL_LIST'
}

export enum PageLayoutType {
  DASHBOARD = 'DASHBOARD',
  RECORD_FORM = 'RECORD_FORM',
  RECORD_INDEX = 'RECORD_INDEX',
  RECORD_PAGE = 'RECORD_PAGE',
  STANDALONE_PAGE = 'STANDALONE_PAGE'
}

export type PageLayoutWidget = {
  __typename?: 'PageLayoutWidget';
  applicationId: Scalars['UUID']['output'];
  conditionalAvailabilityExpression?: Maybe<Scalars['String']['output']>;
  conditionalDisplay?: Maybe<Scalars['JSON']['output']>;
  configuration: WidgetConfiguration;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  /** @deprecated Use `position` instead. */
  gridPosition?: Maybe<GridPosition>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** @deprecated isOverridden is deprecated */
  isOverridden?: Maybe<Scalars['Boolean']['output']>;
  isSystemSideEffect: Scalars['Boolean']['output'];
  objectMetadataId?: Maybe<Scalars['UUID']['output']>;
  pageLayoutTabId: Scalars['UUID']['output'];
  position?: Maybe<PageLayoutWidgetPosition>;
  title: Scalars['String']['output'];
  type: WidgetType;
  universalIdentifier: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PageLayoutWidgetCanvasPosition = {
  __typename?: 'PageLayoutWidgetCanvasPosition';
  layoutMode: PageLayoutTabLayoutMode;
};

export type PageLayoutWidgetGridPosition = {
  __typename?: 'PageLayoutWidgetGridPosition';
  column: Scalars['Int']['output'];
  columnSpan: Scalars['Int']['output'];
  layoutMode: PageLayoutTabLayoutMode;
  row: Scalars['Int']['output'];
  rowSpan: Scalars['Int']['output'];
};

export type PageLayoutWidgetPosition = PageLayoutWidgetCanvasPosition | PageLayoutWidgetGridPosition | PageLayoutWidgetVerticalListPosition;

export enum PageLayoutWidgetVerticalListHeightBehavior {
  FIT_CONTENT = 'FIT_CONTENT',
  TAB_VIEWPORT = 'TAB_VIEWPORT'
}

export type PageLayoutWidgetVerticalListPosition = {
  __typename?: 'PageLayoutWidgetVerticalListPosition';
  heightBehavior?: Maybe<PageLayoutWidgetVerticalListHeightBehavior>;
  index: Scalars['Int']['output'];
  layoutMode: PageLayoutTabLayoutMode;
};

export type PathCommandMenuItemPayload = {
  __typename?: 'PathCommandMenuItemPayload';
  path: Scalars['String']['output'];
};

export type PermissionFlag = {
  __typename?: 'PermissionFlag';
  applicationId: Scalars['UUID']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  permissionType: Scalars['String']['output'];
  universalIdentifier: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum PermissionFlagType {
  AI = 'AI',
  AI_SETTINGS = 'AI_SETTINGS',
  API_KEYS_AND_WEBHOOKS = 'API_KEYS_AND_WEBHOOKS',
  APPLICATIONS = 'APPLICATIONS',
  BILLING = 'BILLING',
  CODE_INTERPRETER_TOOL = 'CODE_INTERPRETER_TOOL',
  CONNECTED_ACCOUNTS = 'CONNECTED_ACCOUNTS',
  CREATE_CALENDAR_EVENT_TOOL = 'CREATE_CALENDAR_EVENT_TOOL',
  DATA_MODEL = 'DATA_MODEL',
  DOWNLOAD_FILE = 'DOWNLOAD_FILE',
  EXPORT_CSV = 'EXPORT_CSV',
  HTTP_REQUEST_TOOL = 'HTTP_REQUEST_TOOL',
  IMPERSONATE = 'IMPERSONATE',
  IMPORT_CSV = 'IMPORT_CSV',
  LAYOUTS = 'LAYOUTS',
  MARKETPLACE_APPS = 'MARKETPLACE_APPS',
  PROFILE_INFORMATION = 'PROFILE_INFORMATION',
  ROLES = 'ROLES',
  SECURITY = 'SECURITY',
  SEND_EMAIL_TOOL = 'SEND_EMAIL_TOOL',
  SSO_BYPASS = 'SSO_BYPASS',
  UPLOAD_FILE = 'UPLOAD_FILE',
  VIEWS = 'VIEWS',
  WORKFLOWS = 'WORKFLOWS',
  WORKSPACE = 'WORKSPACE',
  WORKSPACE_MEMBERS = 'WORKSPACE_MEMBERS'
}

export type PieChartConfiguration = {
  __typename?: 'PieChartConfiguration';
  aggregateFieldMetadataId: Scalars['UUID']['output'];
  aggregateOperation: AggregateOperations;
  color?: Maybe<Scalars['String']['output']>;
  configurationType: WidgetConfigurationType;
  dateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  description?: Maybe<Scalars['String']['output']>;
  displayDataLabel?: Maybe<Scalars['Boolean']['output']>;
  displayLegend?: Maybe<Scalars['Boolean']['output']>;
  filter?: Maybe<Scalars['JSON']['output']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']['output']>;
  groupByFieldMetadataId: Scalars['UUID']['output'];
  groupBySubFieldName?: Maybe<Scalars['String']['output']>;
  hideEmptyCategory?: Maybe<Scalars['Boolean']['output']>;
  manualSortOrder?: Maybe<Array<Scalars['String']['output']>>;
  numberFormat?: Maybe<ChartNumberFormat>;
  orderBy?: Maybe<GraphOrderBy>;
  showCenterMetric?: Maybe<Scalars['Boolean']['output']>;
  splitMultiValueFields?: Maybe<Scalars['Boolean']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
};

export type PieChartData = {
  __typename?: 'PieChartData';
  data: Array<PieChartDataItem>;
  formattedToRawLookup: Scalars['JSON']['output'];
  hasTooManyGroups: Scalars['Boolean']['output'];
  showCenterMetric: Scalars['Boolean']['output'];
  showDataLabels: Scalars['Boolean']['output'];
  showLegend: Scalars['Boolean']['output'];
};

export type PieChartDataInput = {
  configuration: Scalars['JSON']['input'];
  objectMetadataId: Scalars['UUID']['input'];
};

export type PieChartDataItem = {
  __typename?: 'PieChartDataItem';
  key: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type PlaceDetailsResult = {
  __typename?: 'PlaceDetailsResult';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
  postcode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
};

export type PreviewMessageCampaignAudienceInput = {
  listId: Scalars['String']['input'];
  unsubscribeTopicId?: InputMaybe<Scalars['String']['input']>;
};

export type PreviewMessageCampaignSendInput = {
  campaignId: Scalars['String']['input'];
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type PreviewMessageCampaignSendOutputDto = {
  __typename?: 'PreviewMessageCampaignSendOutputDTO';
  audience?: Maybe<CampaignAudiencePreviewDto>;
  blockers: Array<MessageCampaignSendBlockerDto>;
};

export type PublicApplicationRegistration = {
  __typename?: 'PublicApplicationRegistration';
  id: Scalars['UUID']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  oAuthScopes: Array<Scalars['String']['output']>;
  websiteUrl?: Maybe<Scalars['String']['output']>;
};

export type PublicConnectionParametersOutput = {
  __typename?: 'PublicConnectionParametersOutput';
  connectionSecurity?: Maybe<EmailConnectionSecurity>;
  host: Scalars['String']['output'];
  port: Scalars['Float']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type PublicDomain = {
  __typename?: 'PublicDomain';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isValidated: Scalars['Boolean']['output'];
};

export type PublicFeatureFlag = {
  __typename?: 'PublicFeatureFlag';
  key: FeatureFlagKey;
  metadata: PublicFeatureFlagMetadata;
};

export type PublicFeatureFlagMetadata = {
  __typename?: 'PublicFeatureFlagMetadata';
  description: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  imagePath?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
};

export type PublicImapSmtpCaldavConnectionParameters = {
  __typename?: 'PublicImapSmtpCaldavConnectionParameters';
  CALDAV?: Maybe<PublicConnectionParametersOutput>;
  IMAP?: Maybe<PublicConnectionParametersOutput>;
  SMTP?: Maybe<PublicConnectionParametersOutput>;
};

export type PublicWorkspaceData = {
  __typename?: 'PublicWorkspaceData';
  authBypassProviders?: Maybe<AuthBypassProviders>;
  authProviders: AuthProviders;
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  workspaceUrls: WorkspaceUrls;
};

export type PublicWorkspaceDataSummary = {
  __typename?: 'PublicWorkspaceDataSummary';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  agentChatChannelRoles: Array<AgentChatChannelRole>;
  agentChatChannelSummaries: Array<AgentChatChannelSummary>;
  agentChatChannelThreadIds: AgentChatChannelThreadIds;
  agentChatChannels: Array<AgentChatChannel>;
  agentChatOpenThreadsSummary: AgentChatOpenThreadsSummary;
  agentRuns: Array<AgentRun>;
  aiChatUsage?: Maybe<AiChatUsage>;
  aiChatUserCreditsUsage?: Maybe<AiChatUserCreditsUsage>;
  apiKey?: Maybe<ApiKey>;
  apiKeys: Array<ApiKey>;
  appConnection: AppConnection;
  appConnections: Array<AppConnection>;
  appKeyValue?: Maybe<AppKeyValue>;
  appMessageChannels: Array<MessageChannel>;
  appMessageFolders: Array<MessageFolder>;
  applicationConnectedAccounts: Array<ApplicationConnectedAccountDto>;
  applicationConnectionProviders: Array<ApplicationConnectionProvider>;
  applicationCoreGraphqlSchema: Scalars['String']['output'];
  applicationRegistrationTarballUrl?: Maybe<Scalars['String']['output']>;
  applicationSdkClientChecksums?: Maybe<SdkClientChecksums>;
  barChartData: BarChartData;
  billingPlans: Array<BillingPlan>;
  billingPortalSession: BillingSession;
  callRecordingIdForCalendarEvent?: Maybe<Scalars['UUID']['output']>;
  chatMessages: Array<AgentMessage>;
  chatStreamCatchupChunks: ChatStreamCatchupChunks;
  chatThread: AgentChatThread;
  checkUserExists: CheckUserExist;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  checkWorkspaceSubdomainAvailability: SubdomainAvailabilityDto;
  commandMenuItem?: Maybe<CommandMenuItem>;
  commandMenuItems: Array<CommandMenuItem>;
  currentUser: User;
  currentUserApplicationAuthorizations: Array<ApplicationAuthorization>;
  currentUserSessions: Array<UserSession>;
  currentWorkspace: Workspace;
  enterpriseCheckoutSession?: Maybe<Scalars['String']['output']>;
  enterprisePortalSession?: Maybe<Scalars['String']['output']>;
  enterpriseSubscriptionStatus?: Maybe<EnterpriseSubscriptionStatusDto>;
  eventLogs: EventLogQueryResult;
  exportApplication: ApplicationExport;
  field: Field;
  fields: FieldConnection;
  findApplicationRegistrationByClientId?: Maybe<PublicApplicationRegistration>;
  findApplicationRegistrationByUniversalIdentifier?: Maybe<ApplicationRegistration>;
  findApplicationRegistrationMonitoring: ApplicationMonitoring;
  findApplicationRegistrationStats: ApplicationRegistrationStats;
  findApplicationRegistrationVariables: Array<ApplicationRegistrationVariable>;
  findClaimableApplicationRegistration?: Maybe<ClaimableApplicationRegistration>;
  findInstallApplicationJobStatus?: Maybe<JobStatus>;
  findManyAgents: Array<Agent>;
  findManyApplicationRegistrations: Array<ApplicationRegistration>;
  findManyApplications: Array<Application>;
  findManyLogicFunctions: Array<LogicFunction>;
  findManyMarketplaceApps: Array<MarketplaceApp>;
  findManyPublicDomains: Array<PublicDomain>;
  findMarketplaceAppDetail: MarketplaceAppDetail;
  findOneAgent: Agent;
  findOneApplication: Application;
  findOneApplicationRegistration: ApplicationRegistration;
  findOneLogicFunction: LogicFunction;
  findUninstallApplicationJobStatus?: Maybe<JobStatus>;
  findUpgradeApplicationJobStatus?: Maybe<JobStatus>;
  findWorkspaceAiStats: WorkspaceAiStats;
  findWorkspaceFromInviteHash: Workspace;
  findWorkspaceInvitations: Array<WorkspaceInvitation>;
  frontComponent?: Maybe<FrontComponent>;
  frontComponents: Array<FrontComponent>;
  getAddressDetails: PlaceDetailsResult;
  getAiSystemPromptPreview: AiSystemPromptPreview;
  getApiKeyRoles: Array<Role>;
  getApprovedAccessDomains: Array<ApprovedAccessDomain>;
  getAutoCompleteAddress: Array<AutocompleteResult>;
  getAvailablePackages: Scalars['JSON']['output'];
  getConnectedImapSmtpCaldavAccount: ConnectedImapSmtpCaldavAccount;
  getEmailingDomains: Array<EmailingDomain>;
  getInviteSuggestions: Array<InviteSuggestion>;
  getJobs: Array<JobStatus>;
  getLogicFunctionSourceCode?: Maybe<Scalars['String']['output']>;
  getPageLayout?: Maybe<PageLayout>;
  getPageLayoutTab: PageLayoutTab;
  getPageLayoutTabs: Array<PageLayoutTab>;
  getPageLayoutWidget: PageLayoutWidget;
  getPageLayoutWidgets: Array<PageLayoutWidget>;
  getPageLayouts: Array<PageLayout>;
  getPermissionFlags: Array<PermissionFlag>;
  getPublicWorkspaceDataByDomain: PublicWorkspaceData;
  getPublicWorkspaceDataById: PublicWorkspaceDataSummary;
  getResourceCreditUsage: Array<BillingResourceCreditUsage>;
  getRole: Role;
  getRoles: Array<Role>;
  getSSOIdentityProviders: Array<FindAvailableSsoidp>;
  getToolIndex: Array<ToolIndexEntry>;
  getToolInputSchema?: Maybe<Scalars['JSON']['output']>;
  getUsageAnalytics: UsageAnalytics;
  getView?: Maybe<View>;
  getViewField?: Maybe<ViewField>;
  getViewFieldGroup?: Maybe<ViewFieldGroup>;
  getViewFieldGroups: Array<ViewFieldGroup>;
  getViewFields: Array<ViewField>;
  getViewFilter?: Maybe<ViewFilter>;
  getViewFilterGroup?: Maybe<ViewFilterGroup>;
  getViewFilterGroups: Array<ViewFilterGroup>;
  getViewFilters: Array<ViewFilter>;
  getViewGroup?: Maybe<ViewGroup>;
  getViewGroups: Array<ViewGroup>;
  getViewSort?: Maybe<ViewSort>;
  getViewSorts: Array<ViewSort>;
  getViews: Array<View>;
  getWorkspaceCreationDefaults: WorkspaceCreationDefaultsDto;
  githubClaimAuthorizationUrl: Scalars['String']['output'];
  isApplicationStopped: Scalars['Boolean']['output'];
  lineChartData: LineChartData;
  /** @deprecated Use billingPlans instead. */
  listPlans: Array<BillingPlan>;
  mcpServer?: Maybe<McpServer>;
  mcpServers: Array<McpServer>;
  messageSuppressions: MessageSuppressionList;
  metadataTranslations: Array<MetadataTranslation>;
  minimalMetadata: MinimalMetadata;
  mostlyEmptyFieldMetadataIds: Array<Scalars['UUID']['output']>;
  myApplicationPreferences: Array<ApplicationPreferences>;
  myCalendarChannels: Array<CalendarChannel>;
  myConnectedAccounts: Array<ConnectedAccountPublicDto>;
  myMessageChannels: Array<MessageChannel>;
  myMessageFolders: Array<MessageFolder>;
  myUserApplicationVariables: Array<WorkspaceMemberApplicationVariables>;
  navigationMenuItem?: Maybe<NavigationMenuItem>;
  navigationMenuItems: Array<NavigationMenuItem>;
  object: Object;
  objectRecordCounts: Array<ObjectRecordCount>;
  objects: ObjectConnection;
  pieChartData: PieChartData;
  previewMessageCampaignAudience: CampaignAudiencePreviewDto;
  previewMessageCampaignSend: PreviewMessageCampaignSendOutputDto;
  publicMarketplaceAppDetail: MarketplaceAppDetail;
  publicMarketplaceApps: Array<MarketplaceApp>;
  recordPermissions: Array<RecordPermissionsResult>;
  recordSharing: RecordSharingDto;
  skill?: Maybe<Skill>;
  skills: Array<Skill>;
  timelineActivityTypes: Array<TimelineActivityType>;
  twoFactorAuthenticationRecoveryStatus: TwoFactorAuthenticationRecoveryStatus;
  unsubscribeTopics: Array<UnsubscribeTopic>;
  usageLimits: Array<UsageLimit>;
  usageQuotaDefinitions: UsageQuotaDefinitions;
  usageQuotaScopeConsumption?: Maybe<UsageQuotaScopeConsumption>;
  usageQuotasWithConsumption: Array<UsageQuotaWithConsumption>;
  validatePasswordResetToken: ValidatePasswordResetToken;
  validationRules: Array<ValidationRule>;
  webhook?: Maybe<Webhook>;
  webhooks: Array<Webhook>;
};


export type QueryAgentChatChannelThreadIdsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  assignment?: InputMaybe<AgentChatChannelAssignmentFilter>;
  channelId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<AgentChatChannelThreadStatus>;
};


export type QueryAgentRunsArgs = {
  agentId: Scalars['UUID']['input'];
  limit?: Scalars['Int']['input'];
};


export type QueryApiKeyArgs = {
  input: GetApiKeyInput;
};


export type QueryAppConnectionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAppConnectionsArgs = {
  filter?: InputMaybe<ListAppConnectionsInput>;
};


export type QueryAppKeyValueArgs = {
  key: Scalars['String']['input'];
  scope?: InputMaybe<AppKeyValueScope>;
};


export type QueryAppMessageChannelsArgs = {
  filter?: InputMaybe<ListAppMessageChannelsInput>;
};


export type QueryAppMessageFoldersArgs = {
  filter?: InputMaybe<ListAppMessageFoldersInput>;
};


export type QueryApplicationConnectedAccountsArgs = {
  applicationId: Scalars['UUID']['input'];
};


export type QueryApplicationConnectionProvidersArgs = {
  applicationId: Scalars['UUID']['input'];
};


export type QueryApplicationCoreGraphqlSchemaArgs = {
  applicationUniversalIdentifier: Scalars['String']['input'];
};


export type QueryApplicationRegistrationTarballUrlArgs = {
  id: Scalars['String']['input'];
};


export type QueryApplicationSdkClientChecksumsArgs = {
  applicationId: Scalars['UUID']['input'];
};


export type QueryBarChartDataArgs = {
  input: BarChartDataInput;
};


export type QueryBillingPortalSessionArgs = {
  forPaymentMethodUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  returnUrlPath?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCallRecordingIdForCalendarEventArgs = {
  calendarEventId: Scalars['UUID']['input'];
};


export type QueryChatMessagesArgs = {
  threadId: Scalars['UUID']['input'];
};


export type QueryChatStreamCatchupChunksArgs = {
  threadId: Scalars['UUID']['input'];
};


export type QueryChatThreadArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryCheckUserExistsArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String']['input'];
};


export type QueryCheckWorkspaceSubdomainAvailabilityArgs = {
  subdomain: Scalars['String']['input'];
};


export type QueryCommandMenuItemArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryEnterpriseCheckoutSessionArgs = {
  billingInterval?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEnterprisePortalSessionArgs = {
  returnUrlPath?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEventLogsArgs = {
  input: EventLogQueryInput;
};


export type QueryExportApplicationArgs = {
  universalIdentifier: Scalars['UUID']['input'];
};


export type QueryFieldArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryFieldsArgs = {
  filter?: FieldFilter;
  paging?: CursorPaging;
};


export type QueryFindApplicationRegistrationByClientIdArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryFindApplicationRegistrationByUniversalIdentifierArgs = {
  universalIdentifier: Scalars['String']['input'];
};


export type QueryFindApplicationRegistrationMonitoringArgs = {
  id: Scalars['String']['input'];
  periodEnd?: InputMaybe<Scalars['DateTime']['input']>;
  periodStart?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryFindApplicationRegistrationStatsArgs = {
  id: Scalars['String']['input'];
  periodEnd?: InputMaybe<Scalars['DateTime']['input']>;
  periodStart?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryFindApplicationRegistrationVariablesArgs = {
  applicationRegistrationId: Scalars['String']['input'];
};


export type QueryFindClaimableApplicationRegistrationArgs = {
  sourcePackage?: InputMaybe<Scalars['String']['input']>;
  universalIdentifier?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindInstallApplicationJobStatusArgs = {
  jobId?: InputMaybe<Scalars['String']['input']>;
  universalIdentifier: Scalars['String']['input'];
};


export type QueryFindManyMarketplaceAppsArgs = {
  universalIdentifiers?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryFindMarketplaceAppDetailArgs = {
  universalIdentifier: Scalars['String']['input'];
};


export type QueryFindOneAgentArgs = {
  input: AgentIdInput;
};


export type QueryFindOneApplicationArgs = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  universalIdentifier?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryFindOneApplicationRegistrationArgs = {
  id: Scalars['String']['input'];
};


export type QueryFindOneLogicFunctionArgs = {
  input: LogicFunctionIdInput;
};


export type QueryFindUninstallApplicationJobStatusArgs = {
  jobId?: InputMaybe<Scalars['String']['input']>;
  universalIdentifier: Scalars['String']['input'];
};


export type QueryFindUpgradeApplicationJobStatusArgs = {
  jobId?: InputMaybe<Scalars['String']['input']>;
  universalIdentifier: Scalars['String']['input'];
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String']['input'];
};


export type QueryFrontComponentArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryGetAddressDetailsArgs = {
  placeId: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type QueryGetAutoCompleteAddressArgs = {
  address: Scalars['String']['input'];
  country?: InputMaybe<Scalars['String']['input']>;
  isFieldCity?: InputMaybe<Scalars['Boolean']['input']>;
  token: Scalars['String']['input'];
};


export type QueryGetAvailablePackagesArgs = {
  input: LogicFunctionIdInput;
};


export type QueryGetConnectedImapSmtpCaldavAccountArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryGetJobsArgs = {
  jobIds: Array<Scalars['String']['input']>;
};


export type QueryGetLogicFunctionSourceCodeArgs = {
  input: LogicFunctionIdInput;
};


export type QueryGetPageLayoutArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetPageLayoutTabArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetPageLayoutTabsArgs = {
  pageLayoutId: Scalars['String']['input'];
};


export type QueryGetPageLayoutWidgetArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetPageLayoutWidgetsArgs = {
  pageLayoutTabId: Scalars['String']['input'];
};


export type QueryGetPageLayoutsArgs = {
  objectMetadataId?: InputMaybe<Scalars['String']['input']>;
  pageLayoutType?: InputMaybe<PageLayoutType>;
};


export type QueryGetPublicWorkspaceDataByDomainArgs = {
  origin?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetPublicWorkspaceDataByIdArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryGetRoleArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryGetToolInputSchemaArgs = {
  toolName: Scalars['String']['input'];
};


export type QueryGetUsageAnalyticsArgs = {
  input?: InputMaybe<UsageAnalyticsInput>;
};


export type QueryGetViewArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetViewFieldArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetViewFieldGroupArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetViewFieldGroupsArgs = {
  viewId: Scalars['String']['input'];
};


export type QueryGetViewFieldsArgs = {
  viewId: Scalars['String']['input'];
};


export type QueryGetViewFilterArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetViewFilterGroupArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetViewFilterGroupsArgs = {
  viewId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetViewFiltersArgs = {
  viewId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetViewGroupArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetViewGroupsArgs = {
  viewId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetViewSortArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetViewSortsArgs = {
  viewId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetViewsArgs = {
  objectMetadataId?: InputMaybe<Scalars['String']['input']>;
  viewTypes?: InputMaybe<Array<ViewType>>;
};


export type QueryGithubClaimAuthorizationUrlArgs = {
  applicationRegistrationId: Scalars['String']['input'];
};


export type QueryIsApplicationStoppedArgs = {
  applicationUniversalIdentifier: Scalars['String']['input'];
};


export type QueryLineChartDataArgs = {
  input: LineChartDataInput;
};


export type QueryMcpServerArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryMessageSuppressionsArgs = {
  input: FindMessageSuppressionsInput;
};


export type QueryMetadataTranslationsArgs = {
  input: MetadataTranslationsInput;
};


export type QueryMostlyEmptyFieldMetadataIdsArgs = {
  objectMetadataId: Scalars['UUID']['input'];
};


export type QueryMyCalendarChannelsArgs = {
  connectedAccountId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryMyMessageChannelsArgs = {
  connectedAccountId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryMyMessageFoldersArgs = {
  messageChannelId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryNavigationMenuItemArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryObjectArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryObjectsArgs = {
  filter?: ObjectFilter;
  paging?: CursorPaging;
};


export type QueryPieChartDataArgs = {
  input: PieChartDataInput;
};


export type QueryPreviewMessageCampaignAudienceArgs = {
  input: PreviewMessageCampaignAudienceInput;
};


export type QueryPreviewMessageCampaignSendArgs = {
  input: PreviewMessageCampaignSendInput;
};


export type QueryPublicMarketplaceAppDetailArgs = {
  universalIdentifier: Scalars['String']['input'];
};


export type QueryPublicMarketplaceAppsArgs = {
  isVetted?: Scalars['Boolean']['input'];
};


export type QueryRecordPermissionsArgs = {
  targets: Array<RecordTargetInput>;
};


export type QueryRecordSharingArgs = {
  target: RecordTargetInput;
};


export type QuerySkillArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryTwoFactorAuthenticationRecoveryStatusArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryUsageQuotaScopeConsumptionArgs = {
  input: UsageQuotaScopeInput;
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String']['input'];
};


export type QueryValidationRulesArgs = {
  objectMetadataId: Scalars['UUID']['input'];
};


export type QueryWebhookArgs = {
  id: Scalars['UUID']['input'];
};

export type RatioAggregateConfig = {
  __typename?: 'RatioAggregateConfig';
  fieldMetadataId: Scalars['UUID']['output'];
  optionValue: Scalars['String']['output'];
};

export type RecordExport = {
  __typename?: 'RecordExport';
  downloadPath?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  filename: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  progress: Scalars['Int']['output'];
};

export type RecordIdentifier = {
  __typename?: 'RecordIdentifier';
  id: Scalars['UUID']['output'];
  imageIdentifier?: Maybe<Scalars['String']['output']>;
  labelIdentifier: Scalars['String']['output'];
};

export type RecordPermissionsDto = {
  __typename?: 'RecordPermissionsDTO';
  canDelete: Scalars['Boolean']['output'];
  canRead: Scalars['Boolean']['output'];
  canSoftDelete: Scalars['Boolean']['output'];
  canUpdate: Scalars['Boolean']['output'];
};

export type RecordPermissionsResult = {
  __typename?: 'RecordPermissionsResult';
  objectMetadataId: Scalars['UUID']['output'];
  permissions: RecordPermissionsDto;
  recordId: Scalars['UUID']['output'];
};

export enum RecordShareAccessLevel {
  FULL = 'FULL',
  NONE = 'NONE',
  READ = 'READ',
  READ_WRITE = 'READ_WRITE'
}

export type RecordSharePrincipalInput = {
  roleId?: InputMaybe<Scalars['UUID']['input']>;
  workspaceMemberId?: InputMaybe<Scalars['UUID']['input']>;
};

export enum RecordSharePrincipalType {
  EVERYONE = 'EVERYONE',
  ROLE = 'ROLE',
  WORKSPACE_MEMBER = 'WORKSPACE_MEMBER'
}

export enum RecordShareRowCause {
  APPLICATION = 'APPLICATION',
  MANUAL = 'MANUAL',
  OWNER = 'OWNER',
  RULE = 'RULE'
}

export type RecordSharingDto = {
  __typename?: 'RecordSharingDTO';
  canManageSharing: Scalars['Boolean']['output'];
  defaultGeneralAccessLevel?: Maybe<RecordShareAccessLevel>;
  generalAccessLevel?: Maybe<RecordShareAccessLevel>;
  hasManagedGeneralAccess: Scalars['Boolean']['output'];
  permissions: RecordPermissionsDto;
  roles: Array<RecordSharingRoleDto>;
  shares: Array<RecordSharingGrantDto>;
  sharingMode: RecordSharingMode;
};

export type RecordSharingGrantDto = {
  __typename?: 'RecordSharingGrantDTO';
  accessLevel: RecordShareAccessLevel;
  id: Scalars['ID']['output'];
  principalId: Scalars['UUID']['output'];
  principalRoleId?: Maybe<Scalars['UUID']['output']>;
  principalType: RecordSharePrincipalType;
  rowCause: RecordShareRowCause;
};

/** How records of an object are shared: only through roles, private until shared, readable through linked records, or open by default with per-record exceptions */
export enum RecordSharingMode {
  INHERITED = 'INHERITED',
  OPEN_BY_DEFAULT = 'OPEN_BY_DEFAULT',
  PRIVATE = 'PRIVATE',
  ROLE_ONLY = 'ROLE_ONLY'
}

export type RecordSharingRoleDto = {
  __typename?: 'RecordSharingRoleDTO';
  canRead?: Maybe<Scalars['Boolean']['output']>;
  canUpdate?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['UUID']['output'];
  label: Scalars['String']['output'];
};

export type RecordTableConfiguration = {
  __typename?: 'RecordTableConfiguration';
  configurationType: WidgetConfigurationType;
  isUIEditable?: Maybe<Scalars['Boolean']['output']>;
  recordLimit?: Maybe<Scalars['Int']['output']>;
  viewId?: Maybe<Scalars['String']['output']>;
};

export type RecordTargetInput = {
  objectMetadataId: Scalars['UUID']['input'];
  recordId: Scalars['UUID']['input'];
};

export type Relation = {
  __typename?: 'Relation';
  sourceFieldMetadata: Field;
  sourceObjectMetadata: Object;
  targetFieldMetadata: Field;
  targetObjectMetadata: Object;
  type: RelationType;
};

/** Relation type */
export enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY'
}

export type RemoveQueryFromEventStreamInput = {
  eventStreamId: Scalars['String']['input'];
  queryId: Scalars['String']['input'];
};

export type ReportAppConnectionAuthFailureInput = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type ResendEmailVerificationToken = {
  __typename?: 'ResendEmailVerificationToken';
  success: Scalars['Boolean']['output'];
};

export type RevokeApiKeyInput = {
  id: Scalars['UUID']['input'];
};

export type RichTextBody = {
  __typename?: 'RichTextBody';
  /** @deprecated Use markdown or tiptap instead. This value is cleared whenever the field is written in another format. */
  blocknote?: Maybe<Scalars['String']['output']>;
  markdown?: Maybe<Scalars['String']['output']>;
  tiptap?: Maybe<Scalars['String']['output']>;
};

export type Role = {
  __typename?: 'Role';
  agents: Array<Agent>;
  apiKeys: Array<ApiKeyForRole>;
  applicationId: Scalars['UUID']['output'];
  canAccessAllAgentChatChannels: Scalars['Boolean']['output'];
  canAccessAllTools: Scalars['Boolean']['output'];
  canBeAssignedToAgents: Scalars['Boolean']['output'];
  canBeAssignedToApiKeys: Scalars['Boolean']['output'];
  canBeAssignedToUsers: Scalars['Boolean']['output'];
  canDestroyAllObjectRecords: Scalars['Boolean']['output'];
  canReadAllObjectRecords: Scalars['Boolean']['output'];
  canSoftDeleteAllObjectRecords: Scalars['Boolean']['output'];
  canUpdateAllObjectRecords: Scalars['Boolean']['output'];
  canUpdateAllSettings: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fieldPermissions?: Maybe<Array<FieldPermission>>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isEditable: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  objectPermissions?: Maybe<Array<ObjectPermission>>;
  permissionFlags?: Maybe<Array<RolePermissionFlag>>;
  rowLevelPermissionPredicateGroups?: Maybe<Array<RowLevelPermissionPredicateGroup>>;
  rowLevelPermissionPredicates?: Maybe<Array<RowLevelPermissionPredicate>>;
  universalIdentifier?: Maybe<Scalars['UUID']['output']>;
  workspaceMembers: Array<WorkspaceMember>;
};

export type RolePermissionFlag = {
  __typename?: 'RolePermissionFlag';
  flag: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  roleId: Scalars['UUID']['output'];
};

export type RotateClientSecret = {
  __typename?: 'RotateClientSecret';
  clientSecret: Scalars['String']['output'];
};

export type RowLevelPermissionPredicate = {
  __typename?: 'RowLevelPermissionPredicate';
  fieldMetadataId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  objectMetadataId: Scalars['String']['output'];
  operand: RowLevelPermissionPredicateOperand;
  positionInRowLevelPermissionPredicateGroup?: Maybe<Scalars['Float']['output']>;
  roleId: Scalars['String']['output'];
  rowLevelPermissionPredicateGroupId?: Maybe<Scalars['String']['output']>;
  subFieldName?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['JSON']['output']>;
  workspaceMemberFieldMetadataId?: Maybe<Scalars['String']['output']>;
  workspaceMemberSubFieldName?: Maybe<Scalars['String']['output']>;
};

export type RowLevelPermissionPredicateGroup = {
  __typename?: 'RowLevelPermissionPredicateGroup';
  id: Scalars['String']['output'];
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  objectMetadataId: Scalars['String']['output'];
  parentRowLevelPermissionPredicateGroupId?: Maybe<Scalars['String']['output']>;
  positionInRowLevelPermissionPredicateGroup?: Maybe<Scalars['Float']['output']>;
  roleId: Scalars['String']['output'];
};

export type RowLevelPermissionPredicateGroupInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  objectMetadataId: Scalars['UUID']['input'];
  parentRowLevelPermissionPredicateGroupId?: InputMaybe<Scalars['UUID']['input']>;
  positionInRowLevelPermissionPredicateGroup?: InputMaybe<Scalars['Float']['input']>;
};

export enum RowLevelPermissionPredicateGroupLogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

export type RowLevelPermissionPredicateInput = {
  fieldMetadataId: Scalars['UUID']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  operand: RowLevelPermissionPredicateOperand;
  positionInRowLevelPermissionPredicateGroup?: InputMaybe<Scalars['Float']['input']>;
  rowLevelPermissionPredicateGroupId?: InputMaybe<Scalars['UUID']['input']>;
  subFieldName?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['JSON']['input']>;
  workspaceMemberFieldMetadataId?: InputMaybe<Scalars['String']['input']>;
  workspaceMemberSubFieldName?: InputMaybe<Scalars['String']['input']>;
};

export enum RowLevelPermissionPredicateOperand {
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  IS = 'IS',
  IS_AFTER = 'IS_AFTER',
  IS_BEFORE = 'IS_BEFORE',
  IS_EMPTY = 'IS_EMPTY',
  IS_IN_FUTURE = 'IS_IN_FUTURE',
  IS_IN_PAST = 'IS_IN_PAST',
  IS_NOT = 'IS_NOT',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
  IS_NOT_NULL = 'IS_NOT_NULL',
  IS_RELATIVE = 'IS_RELATIVE',
  IS_TODAY = 'IS_TODAY',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  VECTOR_SEARCH = 'VECTOR_SEARCH'
}

export type RunAgentInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  agentUniversalIdentifier: Scalars['String']['input'];
  input?: InputMaybe<Array<RunAgentMessageInput>>;
  responseFormat?: InputMaybe<Scalars['JSON']['input']>;
  runAsWorkspaceMemberId?: InputMaybe<Scalars['UUID']['input']>;
  thread?: InputMaybe<RunAgentThreadInput>;
  waitForCompletion?: InputMaybe<Scalars['Boolean']['input']>;
};

export type RunAgentMessageAttachmentInput = {
  fileId: Scalars['UUID']['input'];
  filename?: InputMaybe<Scalars['String']['input']>;
};

export type RunAgentMessageInput = {
  attachments?: InputMaybe<Array<RunAgentMessageAttachmentInput>>;
  content: Scalars['String']['input'];
  role: RunAgentMessageRole;
};

export enum RunAgentMessageRole {
  assistant = 'assistant',
  user = 'user'
}

export type RunAgentResult = {
  __typename?: 'RunAgentResult';
  error?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['JSON']['output']>;
  status: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  threadId: Scalars['UUID']['output'];
};

export type RunAgentThreadInput = {
  key: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type SsoConnection = {
  __typename?: 'SSOConnection';
  id: Scalars['UUID']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type SsoIdentityProvider = {
  __typename?: 'SSOIdentityProvider';
  id: Scalars['UUID']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export enum SsoIdentityProviderStatus {
  Active = 'Active',
  Error = 'Error',
  Inactive = 'Inactive'
}

export type SdkClientChecksums = {
  __typename?: 'SdkClientChecksums';
  core?: Maybe<Scalars['String']['output']>;
  metadata: Scalars['String']['output'];
};

export type SearchField = {
  __typename?: 'SearchField';
  createdAt: Scalars['DateTime']['output'];
  fieldMetadataId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  position: Scalars['Float']['output'];
  tsVectorFieldMetadataId: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SendAppChannelMessageInput = {
  idempotencyKey: Scalars['UUID']['input'];
  messageChannelId: Scalars['UUID']['input'];
  messageThreadId: Scalars['UUID']['input'];
  text: Scalars['String']['input'];
};

export type SendAppChannelMessageOutput = {
  __typename?: 'SendAppChannelMessageOutput';
  messageId: Scalars['UUID']['output'];
  messageThreadId: Scalars['UUID']['output'];
};

export type SendChatMessageResult = {
  __typename?: 'SendChatMessageResult';
  mentionedParticipantWorkspaceMemberIds?: Maybe<Array<Scalars['UUID']['output']>>;
  messageId?: Maybe<Scalars['String']['output']>;
  queued: Scalars['Boolean']['output'];
  streamId?: Maybe<Scalars['String']['output']>;
};

export type SendEmailAttachmentInput = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type SendEmailInput = {
  bcc?: InputMaybe<Scalars['String']['input']>;
  body: Scalars['String']['input'];
  cc?: InputMaybe<Scalars['String']['input']>;
  connectedAccountId: Scalars['String']['input'];
  draftMessageId?: InputMaybe<Scalars['String']['input']>;
  files?: InputMaybe<Array<SendEmailAttachmentInput>>;
  fromHandle?: InputMaybe<Scalars['String']['input']>;
  inReplyTo?: InputMaybe<Scalars['String']['input']>;
  subject: Scalars['String']['input'];
  targetRecord?: InputMaybe<SendEmailTargetRecordInput>;
  to: Scalars['String']['input'];
};

export type SendEmailOutput = {
  __typename?: 'SendEmailOutput';
  error?: Maybe<Scalars['String']['output']>;
  messageThreadId?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type SendEmailTargetRecordInput = {
  objectNameSingular: Scalars['String']['input'];
  recordId: Scalars['UUID']['input'];
};

export type SendEmailViaDomainOutput = {
  __typename?: 'SendEmailViaDomainOutput';
  messageId: Scalars['String']['output'];
};

export type SendInboxMessageInput = {
  idempotencyKey: Scalars['String']['input'];
  text: Scalars['String']['input'];
  threadKey: Scalars['String']['input'];
  title: Scalars['String']['input'];
  toolCall?: InputMaybe<Scalars['JSON']['input']>;
  workspaceMemberIds: Array<Scalars['UUID']['input']>;
};

export type SendInboxMessageResult = {
  __typename?: 'SendInboxMessageResult';
  threadId: Scalars['UUID']['output'];
};

export type SendInvitations = {
  __typename?: 'SendInvitations';
  errors: Array<Scalars['String']['output']>;
  result: Array<WorkspaceInvitation>;
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type SendMessageCampaignInput = {
  campaignId: Scalars['String']['input'];
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type SendMessageCampaignOutputDto = {
  __typename?: 'SendMessageCampaignOutputDTO';
  audience: CampaignAudiencePreviewDto;
  campaignId: Scalars['String']['output'];
  queuedCount: Scalars['Int']['output'];
};

export type SendMessageCampaignTestInput = {
  body: Scalars['String']['input'];
  fromAddress: Scalars['String']['input'];
  subject: Scalars['String']['input'];
  toAddress: Scalars['String']['input'];
  unsubscribeTopicId?: InputMaybe<Scalars['String']['input']>;
};

export type Sentry = {
  __typename?: 'Sentry';
  dsn?: Maybe<Scalars['String']['output']>;
  environment?: Maybe<Scalars['String']['output']>;
  release?: Maybe<Scalars['String']['output']>;
  tracesSampleRate?: Maybe<Scalars['Float']['output']>;
};

export type SetAppKeyValueInput = {
  key: Scalars['String']['input'];
  scope?: InputMaybe<AppKeyValueScope>;
  value?: InputMaybe<Scalars['JSON']['input']>;
};

export type SettingsMenuItem = {
  __typename?: 'SettingsMenuItem';
  applicationId: Scalars['UUID']['output'];
  createdAt: Scalars['DateTime']['output'];
  frontComponentId: Scalars['UUID']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  position: Scalars['Float']['output'];
  scope: SettingsMenuItemScope;
  title: Scalars['String']['output'];
  universalIdentifier: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum SettingsMenuItemScope {
  USER = 'USER',
  WORKSPACE = 'WORKSPACE'
}

export type SetupOidcSsoInput = {
  clientID: Scalars['String']['input'];
  clientSecret: Scalars['String']['input'];
  issuer: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type SetupSamlSsoInput = {
  certificate: Scalars['String']['input'];
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  issuer: Scalars['String']['input'];
  name: Scalars['String']['input'];
  ssoURL: Scalars['String']['input'];
};

export type SetupSso = {
  __typename?: 'SetupSso';
  id: Scalars['UUID']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type SignUp = {
  __typename?: 'SignUp';
  loginToken: AuthToken;
  workspace: WorkspaceUrlsAndId;
};

export type SignUpInNewWorkspaceInput = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  partner?: InputMaybe<Scalars['String']['input']>;
  subdomain?: InputMaybe<Scalars['String']['input']>;
};

export type Skill = {
  __typename?: 'Skill';
  applicationId?: Maybe<Scalars['UUID']['output']>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** @deprecated Derived from applicationId and removed in 2.54: compare applicationId with the workspace custom application instead. */
  isCustom: Scalars['Boolean']['output'];
  isSystem: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type StandaloneRichTextConfiguration = {
  __typename?: 'StandaloneRichTextConfiguration';
  body: RichTextBody;
  configurationType: WidgetConfigurationType;
};

export type StartWorkspaceSetupChatResult = {
  __typename?: 'StartWorkspaceSetupChatResult';
  outcome: WorkspaceSetupChatOutcome;
  thread?: Maybe<AgentChatThread>;
};

export type StopImpersonation = {
  __typename?: 'StopImpersonation';
  canRestoreImpersonatorSession: Scalars['Boolean']['output'];
};

export type SubdomainAvailabilityDto = {
  __typename?: 'SubdomainAvailabilityDTO';
  available: Scalars['Boolean']['output'];
  isValid: Scalars['Boolean']['output'];
  suggestedSubdomain: Scalars['String']['output'];
  suggestedSubdomains: Array<Scalars['String']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  eventLogsLive?: Maybe<Array<EventLogRecord>>;
  exportRecords: RecordExport;
  logicFunctionLogs: LogicFunctionLogs;
  onAgentChatEvent: AgentChatEvent;
  onEventSubscription?: Maybe<EventSubscription>;
};


export type SubscriptionEventLogsLiveArgs = {
  fieldFilters?: InputMaybe<Array<EventLogFieldFilterInput>>;
  table: EventLogTable;
};


export type SubscriptionExportRecordsArgs = {
  input: CreateRecordExportInput;
};


export type SubscriptionLogicFunctionLogsArgs = {
  input: LogicFunctionLogsInput;
};


export type SubscriptionOnAgentChatEventArgs = {
  threadId: Scalars['UUID']['input'];
};


export type SubscriptionOnEventSubscriptionArgs = {
  eventStreamId: Scalars['String']['input'];
};

export enum SubscriptionInterval {
  Month = 'Month',
  Year = 'Year'
}

export enum SubscriptionStatus {
  Active = 'Active',
  Canceled = 'Canceled',
  Incomplete = 'Incomplete',
  IncompleteExpired = 'IncompleteExpired',
  PastDue = 'PastDue',
  Paused = 'Paused',
  Trialing = 'Trialing',
  Unpaid = 'Unpaid'
}

export type Support = {
  __typename?: 'Support';
  supportDriver: SupportDriver;
  supportFrontChatId?: Maybe<Scalars['String']['output']>;
};

export enum SupportDriver {
  FRONT = 'FRONT',
  NONE = 'NONE'
}

export type SyncAppMessageFoldersInput = {
  folders: Array<AppMessageFolderInput>;
  messageChannelId: Scalars['UUID']['input'];
};

export type TasksConfiguration = {
  __typename?: 'TasksConfiguration';
  configurationType: WidgetConfigurationType;
};

export type TimelineActivityType = {
  __typename?: 'TimelineActivityType';
  /** @deprecated Use emit.on */
  action?: Maybe<Scalars['String']['output']>;
  applicationId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  emit?: Maybe<TimelineActivityTypeEmit>;
  frontComponentUniversalIdentifier?: Maybe<Scalars['UUID']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** @deprecated Use emit.objectUniversalIdentifier */
  objectUniversalIdentifier?: Maybe<Scalars['UUID']['output']>;
  replacesTimelineActivityTypeUniversalIdentifier?: Maybe<Scalars['UUID']['output']>;
  universalIdentifier: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TimelineActivityTypeEmit = {
  __typename?: 'TimelineActivityTypeEmit';
  objectUniversalIdentifier?: Maybe<Scalars['UUID']['output']>;
  on: Scalars['String']['output'];
  through?: Maybe<TimelineActivityTypeEmitThrough>;
};

export type TimelineActivityTypeEmitThrough = {
  __typename?: 'TimelineActivityTypeEmitThrough';
  happensAtFieldUniversalIdentifier?: Maybe<Scalars['UUID']['output']>;
  relationFieldUniversalIdentifier: Scalars['UUID']['output'];
  triggerFieldUniversalIdentifiers?: Maybe<Array<Scalars['UUID']['output']>>;
};

export type TimelineConfiguration = {
  __typename?: 'TimelineConfiguration';
  configurationType: WidgetConfigurationType;
};

export type ToolIndexEntry = {
  __typename?: 'ToolIndexEntry';
  category: Scalars['String']['output'];
  description: Scalars['String']['output'];
  frontComponentId?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  inputSchema?: Maybe<Scalars['JSON']['output']>;
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  objectName?: Maybe<Scalars['String']['output']>;
  widgetName?: Maybe<Scalars['String']['output']>;
};

export type TransientToken = {
  __typename?: 'TransientToken';
  transientToken: AuthToken;
};

export type TriggerAddPeopleToMessageListJobInput = {
  messageListId: Scalars['UUID']['input'];
  personFilter: Scalars['JSON']['input'];
};

export type TriggerAddPeopleToMessageListJobResult = {
  __typename?: 'TriggerAddPeopleToMessageListJobResult';
  jobId: Scalars['String']['output'];
};

export type TriggerInstallApplicationInput = {
  universalIdentifier: Scalars['String']['input'];
};

export type TriggerInstallApplicationJobInput = {
  universalIdentifier: Scalars['String']['input'];
};

export type TriggerInstallApplicationJobResult = {
  __typename?: 'TriggerInstallApplicationJobResult';
  jobId: Scalars['String']['output'];
};

export type TriggerInstallApplicationResult = {
  __typename?: 'TriggerInstallApplicationResult';
  jobId: Scalars['String']['output'];
};

export type TriggerUninstallApplicationInput = {
  universalIdentifier: Scalars['String']['input'];
};

export type TriggerUninstallApplicationJobInput = {
  universalIdentifier: Scalars['String']['input'];
};

export type TriggerUninstallApplicationJobResult = {
  __typename?: 'TriggerUninstallApplicationJobResult';
  jobId: Scalars['String']['output'];
};

export type TriggerUninstallApplicationResult = {
  __typename?: 'TriggerUninstallApplicationResult';
  jobId: Scalars['String']['output'];
};

export type TriggerUpgradeApplicationInput = {
  targetVersion: Scalars['String']['input'];
  universalIdentifier: Scalars['String']['input'];
};

export type TriggerUpgradeApplicationResult = {
  __typename?: 'TriggerUpgradeApplicationResult';
  jobId: Scalars['String']['output'];
};

export type TwoFactorAuthenticationMethodSummary = {
  __typename?: 'TwoFactorAuthenticationMethodSummary';
  status: Scalars['String']['output'];
  strategy: Scalars['String']['output'];
  twoFactorAuthenticationMethodId: Scalars['UUID']['output'];
};

export type TwoFactorAuthenticationRecoveryCode = {
  __typename?: 'TwoFactorAuthenticationRecoveryCode';
  expiresAt: Scalars['DateTime']['output'];
  recoveryCode: Scalars['String']['output'];
};

export type TwoFactorAuthenticationRecoveryCodeRedemption = {
  __typename?: 'TwoFactorAuthenticationRecoveryCodeRedemption';
  provisioningUri?: Maybe<Scalars['String']['output']>;
  tokens?: Maybe<AuthTokenPair>;
};

export type TwoFactorAuthenticationRecoveryStatus = {
  __typename?: 'TwoFactorAuthenticationRecoveryStatus';
  hasVerifiedTwoFactorAuthenticationMethod: Scalars['Boolean']['output'];
  isAwaitingRecoveryEnrollment: Scalars['Boolean']['output'];
  pendingRecoveryCodeExpiresAt?: Maybe<Scalars['DateTime']['output']>;
};

export type UuidFilterComparison = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  gt?: InputMaybe<Scalars['UUID']['input']>;
  gte?: InputMaybe<Scalars['UUID']['input']>;
  iLike?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
  isNot?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['UUID']['input']>;
  lt?: InputMaybe<Scalars['UUID']['input']>;
  lte?: InputMaybe<Scalars['UUID']['input']>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
  notILike?: InputMaybe<Scalars['UUID']['input']>;
  notIn?: InputMaybe<Array<Scalars['UUID']['input']>>;
  notLike?: InputMaybe<Scalars['UUID']['input']>;
};

export enum UnsubscribeHostnameStatus {
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export type UnsubscribeTopic = {
  __typename?: 'UnsubscribeTopic';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  visibility: UnsubscribeTopicVisibility;
};

export enum UnsubscribeTopicVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export type UpdateAgentChatChannelInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  roleIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type UpdateAgentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  modelConfiguration?: InputMaybe<Scalars['JSON']['input']>;
  modelId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  responseFormat?: InputMaybe<Scalars['JSON']['input']>;
  roleId?: InputMaybe<Scalars['UUID']['input']>;
  triggers?: InputMaybe<Array<Scalars['JSON']['input']>>;
};

export type UpdateApiKeyInput = {
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  revokedAt?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateAppMessageChannelInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  isSyncEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  messagingProviderUniversalIdentifier?: InputMaybe<Scalars['UUID']['input']>;
  visibility?: InputMaybe<MessageChannelVisibility>;
};

export type UpdateApplicationInput = {
  autoUpgrade?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateApplicationRegistrationInput = {
  id: Scalars['String']['input'];
  update: UpdateApplicationRegistrationPayload;
};

export type UpdateApplicationRegistrationPayload = {
  name?: InputMaybe<Scalars['String']['input']>;
  oAuthRedirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  oAuthScopes?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateApplicationRegistrationVariableInput = {
  id: Scalars['String']['input'];
  update: UpdateApplicationRegistrationVariablePayload;
};

export type UpdateApplicationRegistrationVariablePayload = {
  description?: InputMaybe<Scalars['String']['input']>;
  resetValue?: InputMaybe<Scalars['Boolean']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCalendarChannelInput = {
  id: Scalars['UUID']['input'];
  update: UpdateCalendarChannelInputUpdates;
};

export type UpdateCalendarChannelInputUpdates = {
  contactAutoCreationPolicy?: InputMaybe<CalendarChannelContactAutoCreationPolicy>;
  excludePrivateEvents?: InputMaybe<Scalars['Boolean']['input']>;
  isContactAutoCreationEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isSyncEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  visibility?: InputMaybe<CalendarChannelVisibility>;
};

export type UpdateCommandMenuItemInput = {
  availabilityObjectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  availabilityType?: InputMaybe<CommandMenuItemAvailabilityType>;
  engineComponentKey?: InputMaybe<EngineComponentKey>;
  hotKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  pageLayoutId?: InputMaybe<Scalars['UUID']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  shortLabel?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEmailGroupChannelInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
};

export type UpdateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isAuditLogged?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isNullable?: InputMaybe<Scalars['Boolean']['input']>;
  isSearchable?: InputMaybe<Scalars['Boolean']['input']>;
  isSystem?: InputMaybe<Scalars['Boolean']['input']>;
  isUIEditable?: InputMaybe<Scalars['Boolean']['input']>;
  isUIReadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  isUnique?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  morphRelationsUpdatePayload?: InputMaybe<Array<Scalars['JSON']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  objectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  options?: InputMaybe<Scalars['JSON']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  translations?: InputMaybe<Array<MetadataTranslationOverrideInput>>;
  universalIdentifier?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFrontComponentInput = {
  /** The id of the front component to update */
  id: Scalars['UUID']['input'];
  /** The front component fields to update */
  update: UpdateFrontComponentInputUpdates;
};

export type UpdateFrontComponentInputUpdates = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateLabPublicFeatureFlagInput = {
  publicFeatureFlag: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};

export type UpdateLogicFunctionFromSourceInput = {
  /** Id of the logic function to update */
  id: Scalars['UUID']['input'];
  /** The logic function updates */
  update: UpdateLogicFunctionFromSourceInputUpdates;
};

export type UpdateLogicFunctionFromSourceInputUpdates = {
  cronTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  databaseEventTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  handlerName?: InputMaybe<Scalars['String']['input']>;
  httpRouteTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sourceHandlerCode?: InputMaybe<Scalars['String']['input']>;
  sourceHandlerPath?: InputMaybe<Scalars['String']['input']>;
  timeoutSeconds?: InputMaybe<Scalars['Float']['input']>;
  toolTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
  workflowActionTriggerSettings?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateMcpServerInput = {
  id: Scalars['UUID']['input'];
  update: UpdateMcpServerInputUpdates;
};

export type UpdateMcpServerInputUpdates = {
  connectionProviderId?: InputMaybe<Scalars['UUID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMessageChannelInput = {
  id: Scalars['UUID']['input'];
  update: UpdateMessageChannelInputUpdates;
};

export type UpdateMessageChannelInputUpdates = {
  contactAutoCreationPolicy?: InputMaybe<MessageChannelContactAutoCreationPolicy>;
  excludeGroupEmails?: InputMaybe<Scalars['Boolean']['input']>;
  excludeNonProfessionalEmails?: InputMaybe<Scalars['Boolean']['input']>;
  isContactAutoCreationEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isSyncEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  messageFolderImportPolicy?: InputMaybe<MessageFolderImportPolicy>;
  visibility?: InputMaybe<MessageChannelVisibility>;
};

export type UpdateMessageFolderInput = {
  id: Scalars['UUID']['input'];
  update: UpdateMessageFolderInputUpdates;
};

export type UpdateMessageFolderInputUpdates = {
  isSynced: Scalars['Boolean']['input'];
};

export type UpdateMessageFoldersInput = {
  ids: Array<Scalars['UUID']['input']>;
  update: UpdateMessageFolderInputUpdates;
};

export type UpdateNavigationMenuItemInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  folderId?: InputMaybe<Scalars['UUID']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageLayoutId?: InputMaybe<Scalars['UUID']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateObjectPayload = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  imageIdentifierFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isSearchable?: InputMaybe<Scalars['Boolean']['input']>;
  labelIdentifierFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  labelPlural?: InputMaybe<Scalars['String']['input']>;
  labelSingular?: InputMaybe<Scalars['String']['input']>;
  namePlural?: InputMaybe<Scalars['String']['input']>;
  nameSingular?: InputMaybe<Scalars['String']['input']>;
  openRecordIn?: InputMaybe<ObjectOpenRecordIn>;
  readability?: InputMaybe<MetadataReadability>;
  sharingReach?: InputMaybe<ObjectSharingReach>;
  shortcut?: InputMaybe<Scalars['String']['input']>;
  translations?: InputMaybe<Array<MetadataTranslationOverrideInput>>;
};

export type UpdateOneFieldMetadataInput = {
  /** The id of the record to update */
  id: Scalars['UUID']['input'];
  /** The record to update */
  update: UpdateFieldInput;
};

export type UpdateOneNavigationMenuItemInput = {
  /** The id of the record to update */
  id: Scalars['UUID']['input'];
  /** The record to update */
  update: UpdateNavigationMenuItemInput;
};

export type UpdateOneObjectInput = {
  /** The id of the object to update */
  id: Scalars['UUID']['input'];
  update: UpdateObjectPayload;
};

export type UpdatePageLayoutInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  objectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  type?: InputMaybe<PageLayoutType>;
};

export type UpdatePageLayoutTabInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  layoutMode?: InputMaybe<PageLayoutTabLayoutMode>;
  position?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePageLayoutTabWithWidgetsInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  layoutMode?: InputMaybe<PageLayoutTabLayoutMode>;
  position: Scalars['Float']['input'];
  title: Scalars['String']['input'];
  widgets: Array<UpdatePageLayoutWidgetWithIdInput>;
};

export type UpdatePageLayoutWidgetInput = {
  conditionalAvailabilityExpression?: InputMaybe<Scalars['String']['input']>;
  conditionalDisplay?: InputMaybe<Scalars['JSON']['input']>;
  configuration?: InputMaybe<Scalars['JSON']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  objectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  pageLayoutTabId?: InputMaybe<Scalars['UUID']['input']>;
  position?: InputMaybe<Scalars['JSON']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<WidgetType>;
};

export type UpdatePageLayoutWidgetWithIdInput = {
  conditionalAvailabilityExpression?: InputMaybe<Scalars['String']['input']>;
  conditionalDisplay?: InputMaybe<Scalars['JSON']['input']>;
  configuration?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['UUID']['input'];
  objectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  pageLayoutTabId: Scalars['UUID']['input'];
  position?: InputMaybe<Scalars['JSON']['input']>;
  title: Scalars['String']['input'];
  type: WidgetType;
};

export type UpdatePageLayoutWithTabsInput = {
  isFirstTabPinned?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  objectMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  tabs: Array<UpdatePageLayoutTabWithWidgetsInput>;
  type: PageLayoutType;
};

export type UpdateRoleInput = {
  /** The id of the role to update */
  id: Scalars['UUID']['input'];
  update: UpdateRolePayload;
};

export type UpdateRolePayload = {
  canAccessAllAgentChatChannels?: InputMaybe<Scalars['Boolean']['input']>;
  canAccessAllTools?: InputMaybe<Scalars['Boolean']['input']>;
  canBeAssignedToAgents?: InputMaybe<Scalars['Boolean']['input']>;
  canBeAssignedToApiKeys?: InputMaybe<Scalars['Boolean']['input']>;
  canBeAssignedToUsers?: InputMaybe<Scalars['Boolean']['input']>;
  canDestroyAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canReadAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canSoftDeleteAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllSettings?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSkillInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTimelineActivityTypeInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  translations?: InputMaybe<Array<MetadataTranslationOverrideInput>>;
};

export type UpdateUnsubscribeTopicInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<UnsubscribeTopicVisibility>;
};

export type UpdateUsageLimitInput = {
  id: Scalars['UUID']['input'];
  payload: CreateUsageLimitInput;
};

export type UpdateValidationRuleInput = {
  id: Scalars['UUID']['input'];
  update: UpdateValidationRuleInputUpdates;
};

export type UpdateValidationRuleInputUpdates = {
  description?: InputMaybe<Scalars['String']['input']>;
  errorFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  expression?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateViewFieldGroupInput = {
  /** The id of the view field group to update */
  id: Scalars['UUID']['input'];
  /** The view field group to update */
  update: UpdateViewFieldGroupInputUpdates;
};

export type UpdateViewFieldGroupInputUpdates = {
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateViewFieldInput = {
  /** The id of the view field to update */
  id: Scalars['UUID']['input'];
  /** The view field to update */
  update: UpdateViewFieldInputUpdates;
};

export type UpdateViewFieldInputUpdates = {
  aggregateOperation?: InputMaybe<AggregateOperations>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  size?: InputMaybe<Scalars['Float']['input']>;
  viewFieldGroupId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UpdateViewFilterGroupInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  logicalOperator?: InputMaybe<ViewFilterGroupLogicalOperator>;
  parentViewFilterGroupId?: InputMaybe<Scalars['UUID']['input']>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']['input']>;
  viewId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UpdateViewFilterInput = {
  /** The id of the view filter to update */
  id: Scalars['UUID']['input'];
  /** The view filter to update */
  update: UpdateViewFilterInputUpdates;
};

export type UpdateViewFilterInputUpdates = {
  fieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  operand?: InputMaybe<ViewFilterOperand>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']['input']>;
  relationTargetFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  subFieldName?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['JSON']['input']>;
  viewFilterGroupId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UpdateViewGroupInput = {
  /** The id of the view group to update */
  id: Scalars['UUID']['input'];
  /** The view group to update */
  update: UpdateViewGroupInputUpdates;
};

export type UpdateViewGroupInputUpdates = {
  fieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  fieldValue?: InputMaybe<Scalars['String']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateViewInput = {
  anyFieldFilterValue?: InputMaybe<Scalars['String']['input']>;
  calendarEndFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  calendarFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  calendarLayout?: InputMaybe<ViewCalendarLayout>;
  groupLoadLimit?: InputMaybe<Scalars['Int']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  isCompact?: InputMaybe<Scalars['Boolean']['input']>;
  kanbanAggregateOperation?: InputMaybe<AggregateOperations>;
  kanbanAggregateOperationFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  kanbanColumnWidth?: InputMaybe<Scalars['Int']['input']>;
  mainGroupByFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** Deprecated: Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
  openRecordIn?: InputMaybe<ViewOpenRecordIn>;
  position?: InputMaybe<Scalars['Float']['input']>;
  shouldHideEmptyGroups?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<ViewType>;
  visibility?: InputMaybe<ViewVisibility>;
};

export type UpdateViewSortInput = {
  /** The id of the view sort to update */
  id: Scalars['UUID']['input'];
  /** The view sort to update */
  update: UpdateViewSortInputUpdates;
};

export type UpdateViewSortInputUpdates = {
  direction?: InputMaybe<ViewSortDirection>;
  subFieldName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWebhookInput = {
  /** The id of the webhook to update */
  id: Scalars['UUID']['input'];
  /** The webhook fields to update */
  update: UpdateWebhookInputUpdates;
};

export type UpdateWebhookInputUpdates = {
  description?: InputMaybe<Scalars['String']['input']>;
  operations?: InputMaybe<Array<Scalars['String']['input']>>;
  secret?: InputMaybe<Scalars['String']['input']>;
  targetUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWorkspaceAllowedIframeOriginsInput = {
  operation: Scalars['String']['input'];
  origin: Scalars['String']['input'];
};

export type UpdateWorkspaceInput = {
  aiAdditionalInstructions?: InputMaybe<Scalars['String']['input']>;
  aiAgentModelTier?: InputMaybe<AiModelTier>;
  aiChatModelTier?: InputMaybe<AiModelTier>;
  aiEvaluationModelId?: InputMaybe<Scalars['String']['input']>;
  aiModelIdByTier?: InputMaybe<Scalars['JSON']['input']>;
  allowImpersonation?: InputMaybe<Scalars['Boolean']['input']>;
  customDomain?: InputMaybe<Scalars['String']['input']>;
  defaultRoleId?: InputMaybe<Scalars['UUID']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  editableProfileFields?: InputMaybe<Array<Scalars['String']['input']>>;
  eventLogRetentionDays?: InputMaybe<Scalars['Float']['input']>;
  inviteHash?: InputMaybe<Scalars['String']['input']>;
  isAutoModelSelectionEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isCampaignClickTrackingEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isCampaignOpenTrackingEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isGoogleAuthBypassEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isGoogleAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isInternalMessagesImportEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isMicrosoftAuthBypassEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isMicrosoftAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPasswordAuthBypassEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPasswordAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPublicInviteLinkEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isTwoFactorAuthenticationEnforced?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  subdomain?: InputMaybe<Scalars['String']['input']>;
  trashRetentionDays?: InputMaybe<Scalars['Float']['input']>;
  workspaceDiscoverability?: InputMaybe<WorkspaceDiscoverability>;
};

export type UpdateWorkspaceMemberSettingsInput = {
  update: Scalars['JSON']['input'];
  workspaceMemberId: Scalars['UUID']['input'];
};

export type UpsertFieldPermissionsInput = {
  fieldPermissions: Array<FieldPermissionInput>;
  roleId: Scalars['UUID']['input'];
};

export type UpsertFieldsWidgetFieldInput = {
  /** The id of the field metadata. Used to create a new view field when viewFieldId is not provided. */
  fieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  isVisible: Scalars['Boolean']['input'];
  position: Scalars['Float']['input'];
  /** The id of the view field. Required if fieldMetadataId is not provided. */
  viewFieldId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UpsertFieldsWidgetGroupInput = {
  fields: Array<UpsertFieldsWidgetFieldInput>;
  id: Scalars['UUID']['input'];
  isVisible: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  position: Scalars['Float']['input'];
};

export type UpsertFieldsWidgetInput = {
  /** The ungrouped fields to upsert. When provided, all existing groups are deleted and fields are detached from groups. Mutually exclusive with "groups". */
  fields?: InputMaybe<Array<UpsertFieldsWidgetFieldInput>>;
  /** The groups (with nested fields) to upsert. Mutually exclusive with "fields". */
  groups?: InputMaybe<Array<UpsertFieldsWidgetGroupInput>>;
  /** The id of the fields widget whose groups and fields to upsert */
  widgetId: Scalars['UUID']['input'];
};

export type UpsertObjectPermissionsInput = {
  objectPermissions: Array<ObjectPermissionInput>;
  roleId: Scalars['UUID']['input'];
};

export type UpsertPermissionFlagsInput = {
  permissionFlagKeys: Array<Scalars['String']['input']>;
  roleId: Scalars['UUID']['input'];
};

export type UpsertRowLevelPermissionPredicatesInput = {
  objectMetadataId: Scalars['UUID']['input'];
  predicateGroups: Array<RowLevelPermissionPredicateGroupInput>;
  predicates: Array<RowLevelPermissionPredicateInput>;
  roleId: Scalars['UUID']['input'];
};

export type UpsertRowLevelPermissionPredicatesResult = {
  __typename?: 'UpsertRowLevelPermissionPredicatesResult';
  predicateGroups: Array<RowLevelPermissionPredicateGroup>;
  predicates: Array<RowLevelPermissionPredicate>;
};

export type UpsertViewWidgetInput = {
  /** View-level settings (layout type, group by, kanban and calendar settings) to apply to the widget view. */
  view?: InputMaybe<UpsertViewWidgetViewSettingsInput>;
  /** The view fields to upsert. */
  viewFields?: InputMaybe<Array<UpsertViewWidgetViewFieldInput>>;
  /** The view filter groups to upsert. */
  viewFilterGroups?: InputMaybe<Array<UpsertViewWidgetViewFilterGroupInput>>;
  /** The view filters to upsert. */
  viewFilters?: InputMaybe<Array<UpsertViewWidgetViewFilterInput>>;
  /** The view sorts to upsert. */
  viewSorts?: InputMaybe<Array<UpsertViewWidgetViewSortInput>>;
  /** The id of the view widget (page layout widget). */
  widgetId: Scalars['UUID']['input'];
};

export type UpsertViewWidgetViewFieldInput = {
  aggregateOperation?: InputMaybe<AggregateOperations>;
  /** The field metadata id. Used to create a new view field when viewFieldId is not provided. */
  fieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  isVisible: Scalars['Boolean']['input'];
  position: Scalars['Float']['input'];
  size?: InputMaybe<Scalars['Float']['input']>;
  /** The id of an existing view field to update. */
  viewFieldId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UpsertViewWidgetViewFilterGroupInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  logicalOperator?: InputMaybe<ViewFilterGroupLogicalOperator>;
  parentViewFilterGroupId?: InputMaybe<Scalars['UUID']['input']>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']['input']>;
};

export type UpsertViewWidgetViewFilterInput = {
  fieldMetadataId: Scalars['UUID']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
  operand?: InputMaybe<ViewFilterOperand>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']['input']>;
  relationTargetFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  subFieldName?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['JSON']['input'];
  viewFilterGroupId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UpsertViewWidgetViewSettingsInput = {
  calendarEndFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  calendarFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  calendarLayout?: InputMaybe<ViewCalendarLayout>;
  kanbanAggregateOperation?: InputMaybe<AggregateOperations>;
  kanbanAggregateOperationFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  kanbanColumnWidth?: InputMaybe<Scalars['Int']['input']>;
  mainGroupByFieldMetadataId?: InputMaybe<Scalars['UUID']['input']>;
  /** Deprecated: Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
  openRecordIn?: InputMaybe<ViewOpenRecordIn>;
  shouldHideEmptyGroups?: InputMaybe<Scalars['Boolean']['input']>;
  /** The layout type of the widget view. Only widget view types (TABLE_WIDGET, KANBAN_WIDGET, LIST_WIDGET, CALENDAR_WIDGET) are allowed. */
  type?: InputMaybe<ViewType>;
};

export type UpsertViewWidgetViewSortInput = {
  direction?: InputMaybe<ViewSortDirection>;
  fieldMetadataId: Scalars['UUID']['input'];
  id?: InputMaybe<Scalars['UUID']['input']>;
};

export type UsageAnalytics = {
  __typename?: 'UsageAnalytics';
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
  timeSeries: Array<UsageTimeSeries>;
  usageByApplication: Array<UsageBreakdownItem>;
  usageByModel: Array<UsageBreakdownItem>;
  usageByOperationType: Array<UsageBreakdownItem>;
  usageByUser: Array<UsageBreakdownItem>;
  userDailyUsage?: Maybe<UsageUserDaily>;
};

export type UsageAnalyticsInput = {
  operationTypes?: InputMaybe<Array<UsageOperationType>>;
  periodEnd?: InputMaybe<Scalars['DateTime']['input']>;
  periodStart?: InputMaybe<Scalars['DateTime']['input']>;
  userWorkspaceId?: InputMaybe<Scalars['String']['input']>;
};

export type UsageBreakdownItem = {
  __typename?: 'UsageBreakdownItem';
  creditsUsed: Scalars['Float']['output'];
  key: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
  userCreditsUsed: Scalars['Float']['output'];
  workspaceCreditsUsed: Scalars['Float']['output'];
};

export type UsageLimit = {
  __typename?: 'UsageLimit';
  burstValue?: Maybe<Scalars['BigInt']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  limitKind: Scalars['String']['output'];
  limitValue: Scalars['BigInt']['output'];
  operationType: UsageOperationType;
  periodCount: Scalars['Int']['output'];
  periodUnit: Scalars['String']['output'];
  resourceType: UsageResourceType;
  spenderId?: Maybe<Scalars['String']['output']>;
  spenderType: Scalars['String']['output'];
  unit: UsageUnit;
  updatedAt: Scalars['DateTime']['output'];
};

export type UsageLimitOperationDefinition = {
  __typename?: 'UsageLimitOperationDefinition';
  allowedUnits: Array<UsageUnit>;
  operationType: UsageOperationType;
};

export enum UsageOperationType {
  AI_CHAT_TOKEN = 'AI_CHAT_TOKEN',
  AI_WORKFLOW_TOKEN = 'AI_WORKFLOW_TOKEN',
  AI_WORKFLOW_WEB_SEARCH = 'AI_WORKFLOW_WEB_SEARCH',
  ALL = 'ALL',
  API_REQUEST = 'API_REQUEST',
  CALL_RECORDING = 'CALL_RECORDING',
  CODE_EXECUTION = 'CODE_EXECUTION',
  EMAIL_SEND = 'EMAIL_SEND',
  MESSAGE_CAMPAIGN_SEND = 'MESSAGE_CAMPAIGN_SEND',
  RECORD_WRITE = 'RECORD_WRITE',
  STORAGE_FILE = 'STORAGE_FILE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  WEBHOOK_CALL = 'WEBHOOK_CALL',
  WEB_SEARCH = 'WEB_SEARCH',
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION'
}

export type UsageQuotaDefinition = {
  __typename?: 'UsageQuotaDefinition';
  allowedOperations: Array<UsageLimitOperationDefinition>;
  allowedSpenderTypes: Array<Scalars['String']['output']>;
  limitKind: Scalars['String']['output'];
  operatorOnlyScopes: Array<UsageQuotaOperatorOnlyScope>;
  resourceType: UsageResourceType;
};

export type UsageQuotaDefinitions = {
  __typename?: 'UsageQuotaDefinitions';
  definitions: Array<UsageQuotaDefinition>;
  hasAllowancePeriod: Scalars['Boolean']['output'];
  isIntraWorkspaceLimitEntitled: Scalars['Boolean']['output'];
};

export type UsageQuotaOperatorOnlyScope = {
  __typename?: 'UsageQuotaOperatorOnlyScope';
  operationType: UsageOperationType;
  periodUnit: Scalars['String']['output'];
  spenderType: Scalars['String']['output'];
  unit: UsageUnit;
};

export type UsageQuotaScopeConsumption = {
  __typename?: 'UsageQuotaScopeConsumption';
  consumedValue?: Maybe<Scalars['BigInt']['output']>;
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
};

export type UsageQuotaScopeInput = {
  operationType: UsageOperationType;
  periodUnit: Scalars['String']['input'];
  resourceType: UsageResourceType;
  spenderId?: InputMaybe<Scalars['String']['input']>;
  spenderType: Scalars['String']['input'];
  unit: UsageUnit;
};

export type UsageQuotaWithConsumption = {
  __typename?: 'UsageQuotaWithConsumption';
  consumedValue?: Maybe<Scalars['BigInt']['output']>;
  id: Scalars['UUID']['output'];
  isEnforced: Scalars['Boolean']['output'];
  limitValue: Scalars['BigInt']['output'];
  operationType: UsageOperationType;
  periodEnd?: Maybe<Scalars['DateTime']['output']>;
  periodStart?: Maybe<Scalars['DateTime']['output']>;
  periodUnit: Scalars['String']['output'];
  remainingValue?: Maybe<Scalars['BigInt']['output']>;
  resourceType: UsageResourceType;
  spenderId?: Maybe<Scalars['String']['output']>;
  spenderLabel?: Maybe<Scalars['String']['output']>;
  spenderType: Scalars['String']['output'];
  unit: UsageUnit;
};

export enum UsageResourceType {
  AI = 'AI',
  ALL = 'ALL',
  API = 'API',
  APP = 'APP',
  EMAIL = 'EMAIL',
  LOGIC_FUNCTION = 'LOGIC_FUNCTION',
  RECORD = 'RECORD',
  STORAGE = 'STORAGE',
  WEBHOOK = 'WEBHOOK',
  WORKFLOW = 'WORKFLOW'
}

export type UsageTimeSeries = {
  __typename?: 'UsageTimeSeries';
  creditsUsed: Scalars['Float']['output'];
  date: Scalars['String']['output'];
  workspaceCreditsUsed: Scalars['Float']['output'];
};

export enum UsageUnit {
  BYTE = 'BYTE',
  COMPLEXITY = 'COMPLEXITY',
  CREDIT = 'CREDIT',
  FILE = 'FILE',
  INVOCATION = 'INVOCATION',
  MILLISECOND = 'MILLISECOND',
  MINUTE = 'MINUTE',
  RECORD = 'RECORD',
  REQUEST = 'REQUEST',
  SEAT = 'SEAT',
  TOKEN = 'TOKEN',
  USER_CREDIT = 'USER_CREDIT'
}

export type UsageUserDaily = {
  __typename?: 'UsageUserDaily';
  dailyUsage: Array<UsageTimeSeries>;
  userWorkspaceId: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  availableWorkspaces: AvailableWorkspaces;
  canAccessFullAdminPanel: Scalars['Boolean']['output'];
  canImpersonate: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentUserWorkspace?: Maybe<UserWorkspace>;
  currentWorkspace?: Maybe<Workspace>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedWorkspaceMembers?: Maybe<Array<DeletedWorkspaceMember>>;
  disabled?: Maybe<Scalars['Boolean']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  hasPassword: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  isWorkspaceCreator?: Maybe<Scalars['Boolean']['output']>;
  lastName: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  onboardingStatus?: Maybe<OnboardingStatus>;
  previousOnboardingStatus?: Maybe<OnboardingStatus>;
  supportUserHash?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userVars?: Maybe<Scalars['JSONObject']['output']>;
  userWorkspaces: Array<UserWorkspace>;
  workspaceMember?: Maybe<WorkspaceMember>;
  workspaceMembers?: Maybe<Array<WorkspaceMember>>;
  workspaces: Array<UserWorkspace>;
};

export type UserApplicationVariableValue = {
  __typename?: 'UserApplicationVariableValue';
  description: Scalars['String']['output'];
  isDeprecated: Scalars['Boolean']['output'];
  isRequired: Scalars['Boolean']['output'];
  isSecret: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  options?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export enum UserCreditsFallback {
  STOP = 'STOP',
  WORKSPACE_CREDITS = 'WORKSPACE_CREDITS'
}

export type UserSession = {
  __typename?: 'UserSession';
  authProvider: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  isCurrent: Scalars['Boolean']['output'];
  isImpersonating: Scalars['Boolean']['output'];
  lastActiveAt: Scalars['DateTime']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
  workspaceId?: Maybe<Scalars['UUID']['output']>;
};

export type UserWorkspace = {
  __typename?: 'UserWorkspace';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isImpersonating?: Maybe<Scalars['Boolean']['output']>;
  locale: Scalars['String']['output'];
  objectPermissions?: Maybe<Array<ObjectPermission>>;
  objectsPermissions?: Maybe<Array<ObjectPermission>>;
  permissionFlags?: Maybe<Array<PermissionFlagType>>;
  twoFactorAuthenticationMethodSummary?: Maybe<Array<TwoFactorAuthenticationMethodSummary>>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['UUID']['output'];
};

export type ValidateApprovedAccessDomainInput = {
  approvedAccessDomainId: Scalars['UUID']['input'];
  validationToken: Scalars['String']['input'];
};

export type ValidatePasswordResetToken = {
  __typename?: 'ValidatePasswordResetToken';
  email: Scalars['String']['output'];
  hasPassword: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
};

export type ValidationRule = {
  __typename?: 'ValidationRule';
  description?: Maybe<Scalars['String']['output']>;
  errorFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  expression: Scalars['String']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  name: Scalars['String']['output'];
  objectMetadataId: Scalars['UUID']['output'];
};

export type VerificationRecord = {
  __typename?: 'VerificationRecord';
  key: Scalars['String']['output'];
  priority?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type VerifyEmailAndGetLoginToken = {
  __typename?: 'VerifyEmailAndGetLoginToken';
  loginToken: AuthToken;
  workspaceUrls: WorkspaceUrls;
};

export type VerifyTwoFactorAuthenticationMethod = {
  __typename?: 'VerifyTwoFactorAuthenticationMethod';
  success: Scalars['Boolean']['output'];
};

export type VersionDistributionEntry = {
  __typename?: 'VersionDistributionEntry';
  count: Scalars['Int']['output'];
  version: Scalars['String']['output'];
};

export type View = {
  __typename?: 'View';
  anyFieldFilterValue?: Maybe<Scalars['String']['output']>;
  applicationId: Scalars['UUID']['output'];
  calendarEndFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  calendarFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  calendarLayout?: Maybe<ViewCalendarLayout>;
  createdAt: Scalars['DateTime']['output'];
  createdByUserWorkspaceId?: Maybe<Scalars['UUID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  groupLoadLimit?: Maybe<Scalars['Int']['output']>;
  icon: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isCompact: Scalars['Boolean']['output'];
  /** @deprecated Derived from applicationId and removed in 2.54: compare applicationId with the workspace custom application instead. */
  isCustom: Scalars['Boolean']['output'];
  isSystemSideEffect: Scalars['Boolean']['output'];
  kanbanAggregateOperation?: Maybe<AggregateOperations>;
  kanbanAggregateOperationFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  kanbanColumnWidth?: Maybe<Scalars['Int']['output']>;
  key?: Maybe<ViewKey>;
  mainGroupByFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  name: Scalars['String']['output'];
  objectMetadataId: Scalars['UUID']['output'];
  /** @deprecated Superseded by objectMetadata.openRecordIn and the workspace member preference; kept one release for API compatibility, no longer read by the frontend. */
  openRecordIn: ViewOpenRecordIn;
  position: Scalars['Float']['output'];
  shouldHideEmptyGroups: Scalars['Boolean']['output'];
  type: ViewType;
  universalIdentifier: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewFieldGroups: Array<ViewFieldGroup>;
  viewFields: Array<ViewField>;
  viewFilterGroups: Array<ViewFilterGroup>;
  viewFilters: Array<ViewFilter>;
  viewGroups: Array<ViewGroup>;
  viewSorts: Array<ViewSort>;
  visibility: ViewVisibility;
  workspaceId: Scalars['UUID']['output'];
};

export enum ViewCalendarLayout {
  DAY = 'DAY',
  MONTH = 'MONTH',
  WEEK = 'WEEK'
}

export type ViewConfiguration = {
  __typename?: 'ViewConfiguration';
  configurationType: WidgetConfigurationType;
};

export type ViewField = {
  __typename?: 'ViewField';
  aggregateOperation?: Maybe<AggregateOperations>;
  applicationId: Scalars['UUID']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fieldMetadataId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** @deprecated isOverridden is deprecated */
  isOverridden?: Maybe<Scalars['Boolean']['output']>;
  isSystemSideEffect: Scalars['Boolean']['output'];
  isVisible: Scalars['Boolean']['output'];
  position: Scalars['Float']['output'];
  size: Scalars['Float']['output'];
  universalIdentifier: Scalars['UUID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewFieldGroupId?: Maybe<Scalars['UUID']['output']>;
  viewId: Scalars['UUID']['output'];
  workspaceId: Scalars['UUID']['output'];
};

export type ViewFieldGroup = {
  __typename?: 'ViewFieldGroup';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** @deprecated isOverridden is deprecated */
  isOverridden: Scalars['Boolean']['output'];
  isVisible: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewFields: Array<ViewField>;
  viewId: Scalars['UUID']['output'];
  workspaceId: Scalars['UUID']['output'];
};

export type ViewFilter = {
  __typename?: 'ViewFilter';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fieldMetadataId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  operand: ViewFilterOperand;
  positionInViewFilterGroup?: Maybe<Scalars['Float']['output']>;
  relationTargetFieldMetadataId?: Maybe<Scalars['UUID']['output']>;
  subFieldName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  value: Scalars['JSON']['output'];
  viewFilterGroupId?: Maybe<Scalars['UUID']['output']>;
  viewId: Scalars['UUID']['output'];
  workspaceId: Scalars['UUID']['output'];
};

export type ViewFilterGroup = {
  __typename?: 'ViewFilterGroup';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  logicalOperator: ViewFilterGroupLogicalOperator;
  parentViewFilterGroupId?: Maybe<Scalars['UUID']['output']>;
  positionInViewFilterGroup?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  viewId: Scalars['UUID']['output'];
  workspaceId: Scalars['UUID']['output'];
};

export enum ViewFilterGroupLogicalOperator {
  AND = 'AND',
  NOT = 'NOT',
  OR = 'OR'
}

export enum ViewFilterOperand {
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  IS = 'IS',
  IS_AFTER = 'IS_AFTER',
  IS_BEFORE = 'IS_BEFORE',
  IS_EMPTY = 'IS_EMPTY',
  IS_IN_FUTURE = 'IS_IN_FUTURE',
  IS_IN_PAST = 'IS_IN_PAST',
  IS_NOT = 'IS_NOT',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
  IS_NOT_NULL = 'IS_NOT_NULL',
  IS_RELATIVE = 'IS_RELATIVE',
  IS_TODAY = 'IS_TODAY',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  VECTOR_SEARCH = 'VECTOR_SEARCH'
}

export type ViewGroup = {
  __typename?: 'ViewGroup';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fieldValue: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isVisible: Scalars['Boolean']['output'];
  position: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewId: Scalars['UUID']['output'];
  workspaceId: Scalars['UUID']['output'];
};

export enum ViewKey {
  INDEX = 'INDEX'
}

export enum ViewOpenRecordIn {
  RECORD_PAGE = 'RECORD_PAGE',
  SIDE_PANEL = 'SIDE_PANEL'
}

export type ViewSort = {
  __typename?: 'ViewSort';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  direction: ViewSortDirection;
  fieldMetadataId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  subFieldName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  viewId: Scalars['UUID']['output'];
  workspaceId: Scalars['UUID']['output'];
};

export enum ViewSortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum ViewType {
  CALENDAR = 'CALENDAR',
  CALENDAR_WIDGET = 'CALENDAR_WIDGET',
  FIELDS_WIDGET = 'FIELDS_WIDGET',
  KANBAN = 'KANBAN',
  KANBAN_WIDGET = 'KANBAN_WIDGET',
  LIST = 'LIST',
  LIST_WIDGET = 'LIST_WIDGET',
  TABLE = 'TABLE',
  TABLE_WIDGET = 'TABLE_WIDGET'
}

export enum ViewVisibility {
  UNLISTED = 'UNLISTED',
  WORKSPACE = 'WORKSPACE'
}

export type Webhook = {
  __typename?: 'Webhook';
  applicationId: Scalars['UUID']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  operations: Array<Scalars['String']['output']>;
  secret: Scalars['String']['output'];
  targetUrl: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type WidgetConfiguration = AggregateChartConfiguration | BarChartConfiguration | CalendarConfiguration | CallRecordingSummaryConfiguration | CallRecordingTranscriptConfiguration | ChatConfiguration | ChatThreadsConfiguration | EmailThreadConfiguration | EmailsConfiguration | FieldConfiguration | FieldRichTextConfiguration | FieldsConfiguration | FilesConfiguration | FormFieldConfiguration | FrontComponentConfiguration | IframeConfiguration | LineChartConfiguration | MessageCampaignBodyConfiguration | MessageCampaignDetailsConfiguration | NotesConfiguration | PieChartConfiguration | RecordTableConfiguration | StandaloneRichTextConfiguration | TasksConfiguration | TimelineConfiguration | ViewConfiguration | WorkflowConfiguration | WorkflowRunConfiguration | WorkflowVersionConfiguration;

export enum WidgetConfigurationType {
  AGGREGATE_CHART = 'AGGREGATE_CHART',
  BAR_CHART = 'BAR_CHART',
  CALENDAR = 'CALENDAR',
  CALL_RECORDING_SUMMARY = 'CALL_RECORDING_SUMMARY',
  CALL_RECORDING_TRANSCRIPT = 'CALL_RECORDING_TRANSCRIPT',
  CHAT = 'CHAT',
  CHAT_THREADS = 'CHAT_THREADS',
  EMAILS = 'EMAILS',
  EMAIL_THREAD = 'EMAIL_THREAD',
  FIELD = 'FIELD',
  FIELDS = 'FIELDS',
  FIELD_RICH_TEXT = 'FIELD_RICH_TEXT',
  FILES = 'FILES',
  FORM_FIELD = 'FORM_FIELD',
  FRONT_COMPONENT = 'FRONT_COMPONENT',
  IFRAME = 'IFRAME',
  LINE_CHART = 'LINE_CHART',
  MESSAGE_CAMPAIGN_BODY = 'MESSAGE_CAMPAIGN_BODY',
  MESSAGE_CAMPAIGN_DETAILS = 'MESSAGE_CAMPAIGN_DETAILS',
  NOTES = 'NOTES',
  PIE_CHART = 'PIE_CHART',
  RECORD_TABLE = 'RECORD_TABLE',
  STANDALONE_RICH_TEXT = 'STANDALONE_RICH_TEXT',
  TASKS = 'TASKS',
  TIMELINE = 'TIMELINE',
  VIEW = 'VIEW',
  WORKFLOW = 'WORKFLOW',
  WORKFLOW_RUN = 'WORKFLOW_RUN',
  WORKFLOW_VERSION = 'WORKFLOW_VERSION'
}

export enum WidgetType {
  CALENDAR = 'CALENDAR',
  CALL_RECORDING_SUMMARY = 'CALL_RECORDING_SUMMARY',
  CALL_RECORDING_TRANSCRIPT = 'CALL_RECORDING_TRANSCRIPT',
  CHAT = 'CHAT',
  CHAT_THREADS = 'CHAT_THREADS',
  EMAILS = 'EMAILS',
  EMAIL_THREAD = 'EMAIL_THREAD',
  FIELD = 'FIELD',
  FIELDS = 'FIELDS',
  FIELD_RICH_TEXT = 'FIELD_RICH_TEXT',
  FILES = 'FILES',
  FORM_FIELD = 'FORM_FIELD',
  FRONT_COMPONENT = 'FRONT_COMPONENT',
  GRAPH = 'GRAPH',
  IFRAME = 'IFRAME',
  MESSAGE_CAMPAIGN_BODY = 'MESSAGE_CAMPAIGN_BODY',
  MESSAGE_CAMPAIGN_DETAILS = 'MESSAGE_CAMPAIGN_DETAILS',
  NOTES = 'NOTES',
  RECORD_TABLE = 'RECORD_TABLE',
  STANDALONE_RICH_TEXT = 'STANDALONE_RICH_TEXT',
  TASKS = 'TASKS',
  TIMELINE = 'TIMELINE',
  VIEW = 'VIEW',
  WORKFLOW = 'WORKFLOW',
  WORKFLOW_RUN = 'WORKFLOW_RUN',
  WORKFLOW_VERSION = 'WORKFLOW_VERSION'
}

export type WorkflowConfiguration = {
  __typename?: 'WorkflowConfiguration';
  configurationType: WidgetConfigurationType;
};

export type WorkflowRunConfiguration = {
  __typename?: 'WorkflowRunConfiguration';
  configurationType: WidgetConfigurationType;
};

export type WorkflowVersionConfiguration = {
  __typename?: 'WorkflowVersionConfiguration';
  configurationType: WidgetConfigurationType;
};

export type Workspace = {
  __typename?: 'Workspace';
  activationStatus: WorkspaceActivationStatus;
  aiAdditionalInstructions?: Maybe<Scalars['String']['output']>;
  aiAgentModelTier: AiModelTier;
  aiChatModelTier: AiModelTier;
  aiEvaluationModelId?: Maybe<Scalars['String']['output']>;
  aiModelIdByTier: Scalars['JSON']['output'];
  allowImpersonation: Scalars['Boolean']['output'];
  allowedIframeOrigins?: Maybe<Array<Scalars['String']['output']>>;
  billingCustomer?: Maybe<BillingCustomer>;
  billingEntitlements: Array<BillingEntitlement>;
  billingSubscriptions: Array<BillingSubscription>;
  createdAt: Scalars['DateTime']['output'];
  currentBillingSubscription?: Maybe<BillingSubscription>;
  customDomain?: Maybe<Scalars['String']['output']>;
  databaseSchema?: Maybe<Scalars['String']['output']>;
  defaultRole?: Maybe<Role>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  editableProfileFields?: Maybe<Array<Scalars['String']['output']>>;
  eventLogRetentionDays: Scalars['Float']['output'];
  featureFlags?: Maybe<Array<FeatureFlag>>;
  hasValidEnterpriseValidityToken: Scalars['Boolean']['output'];
  hasValidSignedEnterpriseKey: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  installedApplications: Array<Application>;
  inviteHash?: Maybe<Scalars['String']['output']>;
  isAutoModelSelectionEnabled: Scalars['Boolean']['output'];
  isCampaignClickTrackingEnabled: Scalars['Boolean']['output'];
  isCampaignOpenTrackingEnabled: Scalars['Boolean']['output'];
  isCustomDomainEnabled: Scalars['Boolean']['output'];
  isGoogleAuthBypassEnabled: Scalars['Boolean']['output'];
  isGoogleAuthEnabled: Scalars['Boolean']['output'];
  isInternalMessagesImportEnabled: Scalars['Boolean']['output'];
  isMicrosoftAuthBypassEnabled: Scalars['Boolean']['output'];
  isMicrosoftAuthEnabled: Scalars['Boolean']['output'];
  isPasswordAuthBypassEnabled: Scalars['Boolean']['output'];
  isPasswordAuthEnabled: Scalars['Boolean']['output'];
  isPublicInviteLinkEnabled: Scalars['Boolean']['output'];
  isTrialAvailable: Scalars['Boolean']['output'];
  isTwoFactorAuthenticationEnforced: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  logoFileId?: Maybe<Scalars['UUID']['output']>;
  /** @deprecated No longer used for metadata cache invalidation, will be removed */
  metadataVersion: Scalars['Float']['output'];
  subdomain: Scalars['String']['output'];
  trashRetentionDays: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewFields?: Maybe<Array<ViewField>>;
  viewFilterGroups?: Maybe<Array<ViewFilterGroup>>;
  viewFilters?: Maybe<Array<ViewFilter>>;
  viewGroups?: Maybe<Array<ViewGroup>>;
  viewSorts?: Maybe<Array<ViewSort>>;
  views?: Maybe<Array<View>>;
  workspaceCustomApplication?: Maybe<Application>;
  workspaceCustomApplicationId: Scalars['String']['output'];
  workspaceDiscoverability: WorkspaceDiscoverability;
  workspaceMembersCount?: Maybe<Scalars['Float']['output']>;
  workspaceUrls: WorkspaceUrls;
};

export enum WorkspaceActivationStatus {
  ACTIVE = 'ACTIVE',
  CREATED = 'CREATED',
  INACTIVE = 'INACTIVE',
  ONGOING_CREATION = 'ONGOING_CREATION',
  PENDING_CREATION = 'PENDING_CREATION',
  SUSPENDED = 'SUSPENDED'
}

export type WorkspaceAiStats = {
  __typename?: 'WorkspaceAiStats';
  conversationsCount: Scalars['Int']['output'];
  skillsCount: Scalars['Int']['output'];
  toolsCount: Scalars['Int']['output'];
};

export enum WorkspaceCompanyEnrichmentOutcome {
  matched = 'matched',
  transientError = 'transientError',
  unavailable = 'unavailable'
}

export type WorkspaceCompanyEnrichmentResult = {
  __typename?: 'WorkspaceCompanyEnrichmentResult';
  enrichment?: Maybe<Scalars['JSON']['output']>;
  isBookCallOnboardingStepPending: Scalars['Boolean']['output'];
  outcome: WorkspaceCompanyEnrichmentOutcome;
  personEnrichment?: Maybe<Scalars['JSON']['output']>;
  personOutcome: WorkspacePersonEnrichmentOutcome;
};

export type WorkspaceCreationDefaultsDto = {
  __typename?: 'WorkspaceCreationDefaultsDTO';
  displayName: Scalars['String']['output'];
  subdomain: Scalars['String']['output'];
};

export enum WorkspaceDiscoverability {
  HIDDEN = 'HIDDEN',
  MEMBERS_AND_INVITEES = 'MEMBERS_AND_INVITEES',
  PUBLIC = 'PUBLIC'
}

export type WorkspaceInvitation = {
  __typename?: 'WorkspaceInvitation';
  email: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  roleId?: Maybe<Scalars['UUID']['output']>;
};

export type WorkspaceInviteHashValid = {
  __typename?: 'WorkspaceInviteHashValid';
  isValid: Scalars['Boolean']['output'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  calendarStartDay?: Maybe<Scalars['Int']['output']>;
  colorScheme: Scalars['String']['output'];
  dateFormat?: Maybe<WorkspaceMemberDateFormatEnum>;
  id: Scalars['UUID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  name: FullName;
  numberFormat?: Maybe<WorkspaceMemberNumberFormatEnum>;
  openRecordIn: OpenRecordIn;
  roles?: Maybe<Array<Role>>;
  timeFormat?: Maybe<WorkspaceMemberTimeFormatEnum>;
  timeZone?: Maybe<Scalars['String']['output']>;
  uiScale: Scalars['String']['output'];
  userEmail: Scalars['String']['output'];
  userId: Scalars['UUID']['output'];
  userWorkspaceId?: Maybe<Scalars['UUID']['output']>;
};

export type WorkspaceMemberApplicationVariables = {
  __typename?: 'WorkspaceMemberApplicationVariables';
  userWorkspaceId: Scalars['UUID']['output'];
  variables: Array<UserApplicationVariableValue>;
  workspaceMemberId: Scalars['UUID']['output'];
};

/** Date format as Month first, Day first, Year first or system as default */
export enum WorkspaceMemberDateFormatEnum {
  DAY_FIRST = 'DAY_FIRST',
  MONTH_FIRST = 'MONTH_FIRST',
  SYSTEM = 'SYSTEM',
  YEAR_FIRST = 'YEAR_FIRST'
}

/** Number format for displaying numbers */
export enum WorkspaceMemberNumberFormatEnum {
  APOSTROPHE_AND_DOT = 'APOSTROPHE_AND_DOT',
  COMMAS_AND_DOT = 'COMMAS_AND_DOT',
  DOTS_AND_COMMA = 'DOTS_AND_COMMA',
  SPACES_AND_COMMA = 'SPACES_AND_COMMA',
  SYSTEM = 'SYSTEM'
}

/** Time time as Military, Standard or system as default */
export enum WorkspaceMemberTimeFormatEnum {
  HOUR_12 = 'HOUR_12',
  HOUR_24 = 'HOUR_24',
  SYSTEM = 'SYSTEM'
}

export type WorkspaceMigration = {
  __typename?: 'WorkspaceMigration';
  actions: Scalars['JSON']['output'];
  applicationUniversalIdentifier: Scalars['String']['output'];
};

export type WorkspaceNameAndId = {
  __typename?: 'WorkspaceNameAndId';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
};

export enum WorkspacePersonEnrichmentOutcome {
  matched = 'matched',
  transientError = 'transientError',
  unavailable = 'unavailable'
}

export enum WorkspaceSetupChatOutcome {
  ALREADY_STARTED = 'ALREADY_STARTED',
  STARTED = 'STARTED',
  UNAVAILABLE = 'UNAVAILABLE'
}

export type WorkspaceUrls = {
  __typename?: 'WorkspaceUrls';
  customUrl?: Maybe<Scalars['String']['output']>;
  subdomainUrl: Scalars['String']['output'];
};

export type WorkspaceUrlsAndId = {
  __typename?: 'WorkspaceUrlsAndId';
  id: Scalars['UUID']['output'];
  workspaceUrls: WorkspaceUrls;
};
