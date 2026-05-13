import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: string;
  JSON: any;
  UUID: string;
};

export type AdminAiModelConfig = {
  __typename?: 'AdminAiModelConfig';
  contextWindowTokens?: Maybe<Scalars['Float']>;
  dataResidency?: Maybe<Scalars['String']>;
  inputCostPerMillionTokens?: Maybe<Scalars['Float']>;
  isAdminEnabled: Scalars['Boolean'];
  isAvailable: Scalars['Boolean'];
  isDeprecated?: Maybe<Scalars['Boolean']>;
  isRecommended?: Maybe<Scalars['Boolean']>;
  label: Scalars['String'];
  maxOutputTokens?: Maybe<Scalars['Float']>;
  modelFamily?: Maybe<ModelFamily>;
  modelFamilyLabel?: Maybe<Scalars['String']>;
  modelId: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  outputCostPerMillionTokens?: Maybe<Scalars['Float']>;
  providerLabel?: Maybe<Scalars['String']>;
  providerName?: Maybe<Scalars['String']>;
  sdkPackage?: Maybe<Scalars['String']>;
};

export type AdminAiModels = {
  __typename?: 'AdminAiModels';
  defaultFastModelId?: Maybe<Scalars['String']>;
  defaultSmartModelId?: Maybe<Scalars['String']>;
  models: Array<AdminAiModelConfig>;
};

export type AdminChatMessage = {
  __typename?: 'AdminChatMessage';
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  parts: Array<AdminChatMessagePart>;
  role: AgentMessageRole;
};

export type AdminChatMessagePart = {
  __typename?: 'AdminChatMessagePart';
  textContent?: Maybe<Scalars['String']>;
  toolName?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type AdminChatThreadMessages = {
  __typename?: 'AdminChatThreadMessages';
  messages: Array<AdminChatMessage>;
  thread: AdminWorkspaceChatThread;
};

export type AdminPanelHealthServiceData = {
  __typename?: 'AdminPanelHealthServiceData';
  description: Scalars['String'];
  details?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  id: HealthIndicatorId;
  label: Scalars['String'];
  queues?: Maybe<Array<AdminPanelWorkerQueueHealth>>;
  status: AdminPanelHealthServiceStatus;
};

export enum AdminPanelHealthServiceStatus {
  OPERATIONAL = 'OPERATIONAL',
  OUTAGE = 'OUTAGE'
}

export type AdminPanelRecentUser = {
  __typename?: 'AdminPanelRecentUser';
  avatarUrl?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  lastName?: Maybe<Scalars['String']>;
  workspaceId?: Maybe<Scalars['UUID']>;
  workspaceLogo?: Maybe<Scalars['String']>;
  workspaceName?: Maybe<Scalars['String']>;
};

export type AdminPanelTopWorkspace = {
  __typename?: 'AdminPanelTopWorkspace';
  id: Scalars['UUID'];
  logoUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  subdomain: Scalars['String'];
  totalUsers: Scalars['Int'];
};

export type AdminPanelWorkerQueueHealth = {
  __typename?: 'AdminPanelWorkerQueueHealth';
  id: Scalars['String'];
  queueName: Scalars['String'];
  status: AdminPanelHealthServiceStatus;
};

export type AdminPanelWorkspaceBilling = {
  __typename?: 'AdminPanelWorkspaceBilling';
  creditBalance?: Maybe<Scalars['Float']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  subscription?: Maybe<AdminPanelWorkspaceSubscription>;
};

export type AdminPanelWorkspaceSubscription = {
  __typename?: 'AdminPanelWorkspaceSubscription';
  cancelAt?: Maybe<Scalars['DateTime']>;
  cancelAtPeriodEnd: Scalars['Boolean'];
  canceledAt?: Maybe<Scalars['DateTime']>;
  currency: Scalars['String'];
  currentPeriodEnd: Scalars['DateTime'];
  currentPeriodStart: Scalars['DateTime'];
  interval?: Maybe<SubscriptionInterval>;
  items: Array<AdminPanelWorkspaceSubscriptionItem>;
  planKey?: Maybe<Scalars['String']>;
  status: SubscriptionStatus;
  stripeSubscriptionId: Scalars['String'];
  trialEnd?: Maybe<Scalars['DateTime']>;
  trialStart?: Maybe<Scalars['DateTime']>;
};

export type AdminPanelWorkspaceSubscriptionItem = {
  __typename?: 'AdminPanelWorkspaceSubscriptionItem';
  includedCredits?: Maybe<Scalars['Float']>;
  productKey?: Maybe<Scalars['String']>;
  productName: Scalars['String'];
  quantity?: Maybe<Scalars['Float']>;
  stripePriceId: Scalars['String'];
  unitAmount?: Maybe<Scalars['Float']>;
};

export type AdminWorkspaceChatThread = {
  __typename?: 'AdminWorkspaceChatThread';
  conversationSize: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  title?: Maybe<Scalars['String']>;
  totalInputTokens: Scalars['Int'];
  totalOutputTokens: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

/** Role of a message in a chat thread */
export enum AgentMessageRole {
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
  USER = 'USER'
}

export enum AiModelRole {
  FAST = 'FAST',
  SMART = 'SMART'
}

export type ApplicationRegistration = {
  __typename?: 'ApplicationRegistration';
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  isConfigured: Scalars['Boolean'];
  isFeatured: Scalars['Boolean'];
  isListed: Scalars['Boolean'];
  isPreInstalled: Scalars['Boolean'];
  latestAvailableVersion?: Maybe<Scalars['String']>;
  logoUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  oAuthClientId: Scalars['String'];
  oAuthRedirectUris: Array<Scalars['String']>;
  oAuthScopes: Array<Scalars['String']>;
  ownerWorkspaceId?: Maybe<Scalars['UUID']>;
  sourcePackage?: Maybe<Scalars['String']>;
  sourceType: ApplicationRegistrationSourceType;
  universalIdentifier: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export enum ApplicationRegistrationSourceType {
  LOCAL = 'LOCAL',
  NPM = 'NPM',
  OAUTH_ONLY = 'OAUTH_ONLY',
  TARBALL = 'TARBALL'
}

export enum ConfigSource {
  DATABASE = 'DATABASE',
  DEFAULT = 'DEFAULT',
  ENVIRONMENT = 'ENVIRONMENT'
}

export type ConfigVariable = {
  __typename?: 'ConfigVariable';
  description: Scalars['String'];
  isEnvOnly: Scalars['Boolean'];
  isSensitive: Scalars['Boolean'];
  name: Scalars['String'];
  options?: Maybe<Scalars['JSON']>;
  source: ConfigSource;
  type: ConfigVariableType;
  value?: Maybe<Scalars['JSON']>;
};

export enum ConfigVariableType {
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
  JSON = 'JSON',
  NUMBER = 'NUMBER',
  STRING = 'STRING'
}

export type ConfigVariables = {
  __typename?: 'ConfigVariables';
  groups: Array<ConfigVariablesGroupData>;
};

export enum ConfigVariablesGroup {
  ADVANCED_SETTINGS = 'ADVANCED_SETTINGS',
  ANALYTICS_CONFIG = 'ANALYTICS_CONFIG',
  AWS_SES_SETTINGS = 'AWS_SES_SETTINGS',
  BILLING_CONFIG = 'BILLING_CONFIG',
  CAPTCHA_CONFIG = 'CAPTCHA_CONFIG',
  CLOUDFLARE_CONFIG = 'CLOUDFLARE_CONFIG',
  CODE_INTERPRETER_CONFIG = 'CODE_INTERPRETER_CONFIG',
  EMAIL_SETTINGS = 'EMAIL_SETTINGS',
  GOOGLE_AUTH = 'GOOGLE_AUTH',
  LLM = 'LLM',
  LOGGING = 'LOGGING',
  LOGIC_FUNCTION_CONFIG = 'LOGIC_FUNCTION_CONFIG',
  MICROSOFT_AUTH = 'MICROSOFT_AUTH',
  RATE_LIMITING = 'RATE_LIMITING',
  SERVER_CONFIG = 'SERVER_CONFIG',
  SSL = 'SSL',
  STORAGE_CONFIG = 'STORAGE_CONFIG',
  SUPPORT_CHAT_CONFIG = 'SUPPORT_CHAT_CONFIG',
  TOKENS_DURATION = 'TOKENS_DURATION'
}

export type ConfigVariablesGroupData = {
  __typename?: 'ConfigVariablesGroupData';
  description: Scalars['String'];
  isHiddenOnLoad: Scalars['Boolean'];
  name: ConfigVariablesGroup;
  variables: Array<ConfigVariable>;
};

export type DeleteJobsResponse = {
  __typename?: 'DeleteJobsResponse';
  deletedCount: Scalars['Int'];
  results: Array<JobOperationResult>;
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  key: FeatureFlagKey;
  value: Scalars['Boolean'];
};

export enum FeatureFlagKey {
  IS_EMAILING_DOMAIN_ENABLED = 'IS_EMAILING_DOMAIN_ENABLED',
  IS_EMAIL_GROUP_ENABLED = 'IS_EMAIL_GROUP_ENABLED',
  IS_JSON_FILTER_ENABLED = 'IS_JSON_FILTER_ENABLED',
  IS_JUNCTION_RELATIONS_ENABLED = 'IS_JUNCTION_RELATIONS_ENABLED',
  IS_MARKETPLACE_SETTING_TAB_VISIBLE = 'IS_MARKETPLACE_SETTING_TAB_VISIBLE',
  IS_PUBLIC_DOMAIN_ENABLED = 'IS_PUBLIC_DOMAIN_ENABLED',
  IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED = 'IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED',
  IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED = 'IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED',
  IS_REST_METADATA_API_NEW_FORMAT_DIRECT = 'IS_REST_METADATA_API_NEW_FORMAT_DIRECT',
  IS_UNIQUE_INDEXES_ENABLED = 'IS_UNIQUE_INDEXES_ENABLED'
}

export enum HealthIndicatorId {
  app = 'app',
  connectedAccount = 'connectedAccount',
  database = 'database',
  redis = 'redis',
  worker = 'worker'
}

export type InstanceAndAllWorkspacesUpgradeStatus = {
  __typename?: 'InstanceAndAllWorkspacesUpgradeStatus';
  computedAt: Scalars['DateTime'];
  instanceUpgradeStatus: InstanceUpgradeStatus;
  workspacesBehind: Array<WorkspaceUpgradeRef>;
  workspacesFailed: Array<WorkspaceUpgradeRef>;
};

export type InstanceUpgradeStatus = {
  __typename?: 'InstanceUpgradeStatus';
  health: UpgradeHealth;
  inferredVersion?: Maybe<Scalars['String']>;
  latestCommand?: Maybe<LatestUpgradeCommand>;
};

export type JobOperationResult = {
  __typename?: 'JobOperationResult';
  error?: Maybe<Scalars['String']>;
  jobId: Scalars['String'];
  success: Scalars['Boolean'];
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

export type LatestUpgradeCommand = {
  __typename?: 'LatestUpgradeCommand';
  createdAt: Scalars['DateTime'];
  errorMessage?: Maybe<Scalars['String']>;
  executedByVersion: Scalars['String'];
  name: Scalars['String'];
  status: Scalars['String'];
};

export type MaintenanceMode = {
  __typename?: 'MaintenanceMode';
  endAt: Scalars['DateTime'];
  link?: Maybe<Scalars['String']>;
  startAt: Scalars['DateTime'];
};

export enum ModelFamily {
  CLAUDE = 'CLAUDE',
  GEMINI = 'GEMINI',
  GPT = 'GPT',
  GROK = 'GROK',
  MISTRAL = 'MISTRAL'
}

export type ModelsDevModelSuggestion = {
  __typename?: 'ModelsDevModelSuggestion';
  cacheCreationCostPerMillionTokens?: Maybe<Scalars['Float']>;
  cachedInputCostPerMillionTokens?: Maybe<Scalars['Float']>;
  contextWindowTokens: Scalars['Float'];
  inputCostPerMillionTokens: Scalars['Float'];
  maxOutputTokens: Scalars['Float'];
  modalities: Array<Scalars['String']>;
  modelId: Scalars['String'];
  name: Scalars['String'];
  outputCostPerMillionTokens: Scalars['Float'];
  supportsReasoning: Scalars['Boolean'];
};

export type ModelsDevProviderSuggestion = {
  __typename?: 'ModelsDevProviderSuggestion';
  id: Scalars['String'];
  modelCount: Scalars['Float'];
  npm: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addAiProvider: Scalars['Boolean'];
  addModelToProvider: Scalars['Boolean'];
  clearMaintenanceMode: Scalars['Boolean'];
  createDatabaseConfigVariable: Scalars['Boolean'];
  deleteDatabaseConfigVariable: Scalars['Boolean'];
  deleteJobs: DeleteJobsResponse;
  refreshUpgradeStatus: InstanceAndAllWorkspacesUpgradeStatus;
  removeAiProvider: Scalars['Boolean'];
  removeModelFromProvider: Scalars['Boolean'];
  retryJobs: RetryJobsResponse;
  setAdminAiModelEnabled: Scalars['Boolean'];
  setAdminAiModelRecommended: Scalars['Boolean'];
  setAdminAiModelsEnabled: Scalars['Boolean'];
  setAdminAiModelsRecommended: Scalars['Boolean'];
  setAdminDefaultAiModel: Scalars['Boolean'];
  setMaintenanceMode: Scalars['Boolean'];
  updateDatabaseConfigVariable: Scalars['Boolean'];
  updateWorkspaceFeatureFlag: Scalars['Boolean'];
};


export type MutationAddAiProviderArgs = {
  providerConfig: Scalars['JSON'];
  providerName: Scalars['String'];
};


export type MutationAddModelToProviderArgs = {
  modelConfig: Scalars['JSON'];
  providerName: Scalars['String'];
};


export type MutationCreateDatabaseConfigVariableArgs = {
  key: Scalars['String'];
  value: Scalars['JSON'];
};


export type MutationDeleteDatabaseConfigVariableArgs = {
  key: Scalars['String'];
};


export type MutationDeleteJobsArgs = {
  jobIds: Array<Scalars['String']>;
  queueName: Scalars['String'];
};


export type MutationRemoveAiProviderArgs = {
  providerName: Scalars['String'];
};


export type MutationRemoveModelFromProviderArgs = {
  modelName: Scalars['String'];
  providerName: Scalars['String'];
};


export type MutationRetryJobsArgs = {
  jobIds: Array<Scalars['String']>;
  queueName: Scalars['String'];
};


export type MutationSetAdminAiModelEnabledArgs = {
  enabled: Scalars['Boolean'];
  modelId: Scalars['String'];
};


export type MutationSetAdminAiModelRecommendedArgs = {
  modelId: Scalars['String'];
  recommended: Scalars['Boolean'];
};


export type MutationSetAdminAiModelsEnabledArgs = {
  enabled: Scalars['Boolean'];
  modelIds: Array<Scalars['String']>;
};


export type MutationSetAdminAiModelsRecommendedArgs = {
  modelIds: Array<Scalars['String']>;
  recommended: Scalars['Boolean'];
};


export type MutationSetAdminDefaultAiModelArgs = {
  modelId: Scalars['String'];
  role: AiModelRole;
};


export type MutationSetMaintenanceModeArgs = {
  endAt: Scalars['DateTime'];
  link?: InputMaybe<Scalars['String']>;
  startAt: Scalars['DateTime'];
};


export type MutationUpdateDatabaseConfigVariableArgs = {
  key: Scalars['String'];
  value: Scalars['JSON'];
};


export type MutationUpdateWorkspaceFeatureFlagArgs = {
  featureFlag: Scalars['String'];
  value: Scalars['Boolean'];
  workspaceId: Scalars['UUID'];
};

export type Query = {
  __typename?: 'Query';
  adminPanelRecentUsers: Array<AdminPanelRecentUser>;
  adminPanelTopWorkspaces: Array<AdminPanelTopWorkspace>;
  findAllApplicationRegistrations: Array<ApplicationRegistration>;
  findOneAdminApplicationRegistration: ApplicationRegistration;
  getAdminAiModels: AdminAiModels;
  getAdminAiUsageByWorkspace: Array<UsageBreakdownItem>;
  getAdminChatThreadMessages: AdminChatThreadMessages;
  getAdminWorkspaceChatThreads: Array<AdminWorkspaceChatThread>;
  getAiProviders: Scalars['JSON'];
  getConfigVariablesGrouped: ConfigVariables;
  getDatabaseConfigVariable: ConfigVariable;
  getIndicatorHealthStatus: AdminPanelHealthServiceData;
  getInstanceAndAllWorkspacesUpgradeStatus: InstanceAndAllWorkspacesUpgradeStatus;
  getMaintenanceMode?: Maybe<MaintenanceMode>;
  getModelsDevProviders: Array<ModelsDevProviderSuggestion>;
  getModelsDevSuggestions: Array<ModelsDevModelSuggestion>;
  getQueueJobs: QueueJobsResponse;
  getQueueMetrics: QueueMetricsData;
  getSystemHealthStatus: SystemHealth;
  getUpgradeStatus: Array<WorkspaceUpgradeStatus>;
  userLookupAdminPanel: UserLookup;
  versionInfo: VersionInfo;
  workspaceBillingAdminPanel?: Maybe<AdminPanelWorkspaceBilling>;
  workspaceLookupAdminPanel: UserLookup;
};


export type QueryAdminPanelRecentUsersArgs = {
  searchTerm?: InputMaybe<Scalars['String']>;
};


export type QueryAdminPanelTopWorkspacesArgs = {
  searchTerm?: InputMaybe<Scalars['String']>;
};


export type QueryFindOneAdminApplicationRegistrationArgs = {
  id: Scalars['String'];
};


export type QueryGetAdminAiUsageByWorkspaceArgs = {
  periodEnd?: InputMaybe<Scalars['DateTime']>;
  periodStart?: InputMaybe<Scalars['DateTime']>;
};


export type QueryGetAdminChatThreadMessagesArgs = {
  threadId: Scalars['UUID'];
};


export type QueryGetAdminWorkspaceChatThreadsArgs = {
  workspaceId: Scalars['UUID'];
};


export type QueryGetDatabaseConfigVariableArgs = {
  key: Scalars['String'];
};


export type QueryGetIndicatorHealthStatusArgs = {
  indicatorId: HealthIndicatorId;
};


export type QueryGetModelsDevSuggestionsArgs = {
  providerType: Scalars['String'];
};


export type QueryGetQueueJobsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  queueName: Scalars['String'];
  state: JobState;
};


export type QueryGetQueueMetricsArgs = {
  queueName: Scalars['String'];
  timeRange?: InputMaybe<QueueMetricsTimeRange>;
};


export type QueryGetUpgradeStatusArgs = {
  workspaceIds: Array<Scalars['UUID']>;
};


export type QueryUserLookupAdminPanelArgs = {
  userIdentifier: Scalars['String'];
};


export type QueryWorkspaceBillingAdminPanelArgs = {
  workspaceId: Scalars['UUID'];
};


export type QueryWorkspaceLookupAdminPanelArgs = {
  workspaceId: Scalars['UUID'];
};

export type QueueJob = {
  __typename?: 'QueueJob';
  attemptsMade: Scalars['Float'];
  data?: Maybe<Scalars['JSON']>;
  failedReason?: Maybe<Scalars['String']>;
  finishedOn?: Maybe<Scalars['Float']>;
  id: Scalars['String'];
  logs?: Maybe<Array<Scalars['String']>>;
  name: Scalars['String'];
  processedOn?: Maybe<Scalars['Float']>;
  returnValue?: Maybe<Scalars['JSON']>;
  stackTrace?: Maybe<Array<Scalars['String']>>;
  state: JobState;
  timestamp?: Maybe<Scalars['Float']>;
};

export type QueueJobsResponse = {
  __typename?: 'QueueJobsResponse';
  count: Scalars['Float'];
  hasMore: Scalars['Boolean'];
  jobs: Array<QueueJob>;
  retentionConfig: QueueRetentionConfig;
  totalCount: Scalars['Float'];
};

export type QueueMetricsData = {
  __typename?: 'QueueMetricsData';
  data: Array<QueueMetricsSeries>;
  details?: Maybe<WorkerQueueMetrics>;
  queueName: Scalars['String'];
  timeRange: QueueMetricsTimeRange;
  workers: Scalars['Float'];
};

export type QueueMetricsDataPoint = {
  __typename?: 'QueueMetricsDataPoint';
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type QueueMetricsSeries = {
  __typename?: 'QueueMetricsSeries';
  data: Array<QueueMetricsDataPoint>;
  id: Scalars['String'];
};

export enum QueueMetricsTimeRange {
  FourHours = 'FourHours',
  OneDay = 'OneDay',
  OneHour = 'OneHour',
  SevenDays = 'SevenDays',
  TwelveHours = 'TwelveHours'
}

export type QueueRetentionConfig = {
  __typename?: 'QueueRetentionConfig';
  completedMaxAge: Scalars['Float'];
  completedMaxCount: Scalars['Float'];
  failedMaxAge: Scalars['Float'];
  failedMaxCount: Scalars['Float'];
};

export type RetryJobsResponse = {
  __typename?: 'RetryJobsResponse';
  results: Array<JobOperationResult>;
  retriedCount: Scalars['Int'];
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

export type SystemHealth = {
  __typename?: 'SystemHealth';
  services: Array<SystemHealthService>;
};

export type SystemHealthService = {
  __typename?: 'SystemHealthService';
  id: HealthIndicatorId;
  label: Scalars['String'];
  status: AdminPanelHealthServiceStatus;
};

export enum UpgradeHealth {
  BEHIND = 'BEHIND',
  FAILED = 'FAILED',
  UP_TO_DATE = 'UP_TO_DATE'
}

export type UsageBreakdownItem = {
  __typename?: 'UsageBreakdownItem';
  creditsUsed: Scalars['Float'];
  key: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};

export type UserInfo = {
  __typename?: 'UserInfo';
  avatarUrl?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  lastName?: Maybe<Scalars['String']>;
};

export type UserLookup = {
  __typename?: 'UserLookup';
  user?: Maybe<UserInfo>;
  workspaces: Array<WorkspaceInfo>;
};

export type VersionInfo = {
  __typename?: 'VersionInfo';
  currentVersion?: Maybe<Scalars['String']>;
  latestVersion: Scalars['String'];
};

export type WorkerQueueMetrics = {
  __typename?: 'WorkerQueueMetrics';
  active: Scalars['Float'];
  completed: Scalars['Float'];
  completedData?: Maybe<Array<Scalars['Float']>>;
  delayed: Scalars['Float'];
  failed: Scalars['Float'];
  failedData?: Maybe<Array<Scalars['Float']>>;
  failureRate: Scalars['Float'];
  waiting: Scalars['Float'];
};

export enum WorkspaceActivationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ONGOING_CREATION = 'ONGOING_CREATION',
  PENDING_CREATION = 'PENDING_CREATION',
  SUSPENDED = 'SUSPENDED'
}

export type WorkspaceInfo = {
  __typename?: 'WorkspaceInfo';
  activationStatus: WorkspaceActivationStatus;
  allowImpersonation: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  featureFlags: Array<FeatureFlag>;
  id: Scalars['UUID'];
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  totalUsers: Scalars['Float'];
  users: Array<UserInfo>;
  workspaceUrls: WorkspaceUrls;
};

export type WorkspaceUpgradeRef = {
  __typename?: 'WorkspaceUpgradeRef';
  id: Scalars['UUID'];
  name?: Maybe<Scalars['String']>;
};

export type WorkspaceUpgradeStatus = {
  __typename?: 'WorkspaceUpgradeStatus';
  displayName?: Maybe<Scalars['String']>;
  health: UpgradeHealth;
  inferredVersion?: Maybe<Scalars['String']>;
  latestCommand?: Maybe<LatestUpgradeCommand>;
  workspaceId: Scalars['UUID'];
};

export type WorkspaceUrls = {
  __typename?: 'WorkspaceUrls';
  customUrl?: Maybe<Scalars['String']>;
  subdomainUrl: Scalars['String'];
};

export type AddAiProviderMutationVariables = Exact<{
  providerName: Scalars['String'];
  providerConfig: Scalars['JSON'];
}>;


export type AddAiProviderMutation = { __typename?: 'Mutation', addAiProvider: boolean };

export type AddModelToProviderMutationVariables = Exact<{
  providerName: Scalars['String'];
  modelConfig: Scalars['JSON'];
}>;


export type AddModelToProviderMutation = { __typename?: 'Mutation', addModelToProvider: boolean };

export type RemoveAiProviderMutationVariables = Exact<{
  providerName: Scalars['String'];
}>;


export type RemoveAiProviderMutation = { __typename?: 'Mutation', removeAiProvider: boolean };

export type RemoveModelFromProviderMutationVariables = Exact<{
  providerName: Scalars['String'];
  modelName: Scalars['String'];
}>;


export type RemoveModelFromProviderMutation = { __typename?: 'Mutation', removeModelFromProvider: boolean };

export type SetAdminAiModelEnabledMutationVariables = Exact<{
  modelId: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetAdminAiModelEnabledMutation = { __typename?: 'Mutation', setAdminAiModelEnabled: boolean };

export type SetAdminAiModelRecommendedMutationVariables = Exact<{
  modelId: Scalars['String'];
  recommended: Scalars['Boolean'];
}>;


export type SetAdminAiModelRecommendedMutation = { __typename?: 'Mutation', setAdminAiModelRecommended: boolean };

export type SetAdminAiModelsEnabledMutationVariables = Exact<{
  modelIds: Array<Scalars['String']> | Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetAdminAiModelsEnabledMutation = { __typename?: 'Mutation', setAdminAiModelsEnabled: boolean };

export type SetAdminAiModelsRecommendedMutationVariables = Exact<{
  modelIds: Array<Scalars['String']> | Scalars['String'];
  recommended: Scalars['Boolean'];
}>;


export type SetAdminAiModelsRecommendedMutation = { __typename?: 'Mutation', setAdminAiModelsRecommended: boolean };

export type SetAdminDefaultAiModelMutationVariables = Exact<{
  role: AiModelRole;
  modelId: Scalars['String'];
}>;


export type SetAdminDefaultAiModelMutation = { __typename?: 'Mutation', setAdminDefaultAiModel: boolean };

export type GetAdminAiModelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdminAiModelsQuery = { __typename?: 'Query', getAdminAiModels: { __typename?: 'AdminAiModels', defaultSmartModelId?: string | null, defaultFastModelId?: string | null, models: Array<{ __typename?: 'AdminAiModelConfig', modelId: string, label: string, modelFamily?: ModelFamily | null, sdkPackage?: string | null, isAvailable: boolean, isAdminEnabled: boolean, isDeprecated?: boolean | null, isRecommended?: boolean | null, contextWindowTokens?: number | null, maxOutputTokens?: number | null, inputCostPerMillionTokens?: number | null, outputCostPerMillionTokens?: number | null, providerName?: string | null, providerLabel?: string | null, name?: string | null, dataResidency?: string | null }> } };

export type GetAdminAiUsageByWorkspaceQueryVariables = Exact<{
  periodStart?: InputMaybe<Scalars['DateTime']>;
  periodEnd?: InputMaybe<Scalars['DateTime']>;
}>;


export type GetAdminAiUsageByWorkspaceQuery = { __typename?: 'Query', getAdminAiUsageByWorkspace: Array<{ __typename?: 'UsageBreakdownItem', key: string, label?: string | null, creditsUsed: number }> };

export type GetAiProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAiProvidersQuery = { __typename?: 'Query', getAiProviders: any };

export type GetModelsDevProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetModelsDevProvidersQuery = { __typename?: 'Query', getModelsDevProviders: Array<{ __typename?: 'ModelsDevProviderSuggestion', id: string, modelCount: number, npm: string }> };

export type GetModelsDevSuggestionsQueryVariables = Exact<{
  providerType: Scalars['String'];
}>;


export type GetModelsDevSuggestionsQuery = { __typename?: 'Query', getModelsDevSuggestions: Array<{ __typename?: 'ModelsDevModelSuggestion', modelId: string, name: string, inputCostPerMillionTokens: number, outputCostPerMillionTokens: number, cachedInputCostPerMillionTokens?: number | null, cacheCreationCostPerMillionTokens?: number | null, contextWindowTokens: number, maxOutputTokens: number, modalities: Array<string>, supportsReasoning: boolean }> };

export type FindAllApplicationRegistrationsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindAllApplicationRegistrationsQuery = { __typename?: 'Query', findAllApplicationRegistrations: Array<{ __typename?: 'ApplicationRegistration', id: string, universalIdentifier: string, name: string, logoUrl?: string | null, oAuthClientId: string, oAuthRedirectUris: Array<string>, oAuthScopes: Array<string>, sourceType: ApplicationRegistrationSourceType, sourcePackage?: string | null, latestAvailableVersion?: string | null, isListed: boolean, isFeatured: boolean, isPreInstalled: boolean, isConfigured: boolean, ownerWorkspaceId?: string | null, createdAt: string, updatedAt: string }> };

export type CreateDatabaseConfigVariableMutationVariables = Exact<{
  key: Scalars['String'];
  value: Scalars['JSON'];
}>;


export type CreateDatabaseConfigVariableMutation = { __typename?: 'Mutation', createDatabaseConfigVariable: boolean };

export type DeleteDatabaseConfigVariableMutationVariables = Exact<{
  key: Scalars['String'];
}>;


export type DeleteDatabaseConfigVariableMutation = { __typename?: 'Mutation', deleteDatabaseConfigVariable: boolean };

export type UpdateDatabaseConfigVariableMutationVariables = Exact<{
  key: Scalars['String'];
  value: Scalars['JSON'];
}>;


export type UpdateDatabaseConfigVariableMutation = { __typename?: 'Mutation', updateDatabaseConfigVariable: boolean };

export type GetConfigVariablesGroupedQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigVariablesGroupedQuery = { __typename?: 'Query', getConfigVariablesGrouped: { __typename?: 'ConfigVariables', groups: Array<{ __typename?: 'ConfigVariablesGroupData', name: ConfigVariablesGroup, description: string, isHiddenOnLoad: boolean, variables: Array<{ __typename?: 'ConfigVariable', name: string, description: string, value?: any | null, isSensitive: boolean, isEnvOnly: boolean, type: ConfigVariableType, options?: any | null, source: ConfigSource }> }> } };

export type GetDatabaseConfigVariableQueryVariables = Exact<{
  key: Scalars['String'];
}>;


export type GetDatabaseConfigVariableQuery = { __typename?: 'Query', getDatabaseConfigVariable: { __typename?: 'ConfigVariable', name: string, description: string, value?: any | null, isSensitive: boolean, isEnvOnly: boolean, type: ConfigVariableType, options?: any | null, source: ConfigSource } };

export type UserInfoFragmentFragment = { __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null, createdAt: string };

export type UpdateWorkspaceFeatureFlagMutationVariables = Exact<{
  workspaceId: Scalars['UUID'];
  featureFlag: Scalars['String'];
  value: Scalars['Boolean'];
}>;


export type UpdateWorkspaceFeatureFlagMutation = { __typename?: 'Mutation', updateWorkspaceFeatureFlag: boolean };

export type AdminPanelRecentUsersQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']>;
}>;


export type AdminPanelRecentUsersQuery = { __typename?: 'Query', adminPanelRecentUsers: Array<{ __typename?: 'AdminPanelRecentUser', id: string, email: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null, createdAt: string, workspaceName?: string | null, workspaceId?: string | null, workspaceLogo?: string | null }> };

export type AdminPanelTopWorkspacesQueryVariables = Exact<{
  searchTerm?: InputMaybe<Scalars['String']>;
}>;


export type AdminPanelTopWorkspacesQuery = { __typename?: 'Query', adminPanelTopWorkspaces: Array<{ __typename?: 'AdminPanelTopWorkspace', id: string, logoUrl?: string | null, name: string, totalUsers: number, subdomain: string }> };

export type FindOneAdminApplicationRegistrationQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneAdminApplicationRegistrationQuery = { __typename?: 'Query', findOneAdminApplicationRegistration: { __typename?: 'ApplicationRegistration', id: string, universalIdentifier: string, name: string, logoUrl?: string | null, oAuthClientId: string, oAuthRedirectUris: Array<string>, oAuthScopes: Array<string>, sourceType: ApplicationRegistrationSourceType, sourcePackage?: string | null, latestAvailableVersion?: string | null, isListed: boolean, isFeatured: boolean, isPreInstalled: boolean, isConfigured: boolean, ownerWorkspaceId?: string | null, createdAt: string, updatedAt: string } };

export type GetAdminChatThreadMessagesQueryVariables = Exact<{
  threadId: Scalars['UUID'];
}>;


export type GetAdminChatThreadMessagesQuery = { __typename?: 'Query', getAdminChatThreadMessages: { __typename?: 'AdminChatThreadMessages', thread: { __typename?: 'AdminWorkspaceChatThread', id: string, title?: string | null, totalInputTokens: number, totalOutputTokens: number, conversationSize: number, createdAt: string, updatedAt: string }, messages: Array<{ __typename?: 'AdminChatMessage', id: string, role: AgentMessageRole, createdAt: string, parts: Array<{ __typename?: 'AdminChatMessagePart', type: string, textContent?: string | null, toolName?: string | null }> }> } };

export type GetAdminWorkspaceChatThreadsQueryVariables = Exact<{
  workspaceId: Scalars['UUID'];
}>;


export type GetAdminWorkspaceChatThreadsQuery = { __typename?: 'Query', getAdminWorkspaceChatThreads: Array<{ __typename?: 'AdminWorkspaceChatThread', id: string, title?: string | null, totalInputTokens: number, totalOutputTokens: number, conversationSize: number, createdAt: string, updatedAt: string }> };

export type GetUpgradeStatusQueryVariables = Exact<{
  workspaceIds: Array<Scalars['UUID']> | Scalars['UUID'];
}>;


export type GetUpgradeStatusQuery = { __typename?: 'Query', getUpgradeStatus: Array<{ __typename?: 'WorkspaceUpgradeStatus', workspaceId: string, displayName?: string | null, inferredVersion?: string | null, health: UpgradeHealth, latestCommand?: { __typename?: 'LatestUpgradeCommand', name: string, status: string, executedByVersion: string, errorMessage?: string | null, createdAt: string } | null }> };

export type GetVersionInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVersionInfoQuery = { __typename?: 'Query', versionInfo: { __typename?: 'VersionInfo', currentVersion?: string | null, latestVersion: string } };

export type WorkspaceBillingAdminPanelQueryVariables = Exact<{
  workspaceId: Scalars['UUID'];
}>;


export type WorkspaceBillingAdminPanelQuery = { __typename?: 'Query', workspaceBillingAdminPanel?: { __typename?: 'AdminPanelWorkspaceBilling', stripeCustomerId?: string | null, creditBalance?: number | null, subscription?: { __typename?: 'AdminPanelWorkspaceSubscription', stripeSubscriptionId: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, currency: string, planKey?: string | null, currentPeriodStart: string, currentPeriodEnd: string, trialStart?: string | null, trialEnd?: string | null, cancelAt?: string | null, canceledAt?: string | null, cancelAtPeriodEnd: boolean, items: Array<{ __typename?: 'AdminPanelWorkspaceSubscriptionItem', productName: string, productKey?: string | null, stripePriceId: string, quantity?: number | null, unitAmount?: number | null, includedCredits?: number | null }> } | null } | null };

export type UserLookupAdminPanelQueryVariables = Exact<{
  userIdentifier: Scalars['String'];
}>;


export type UserLookupAdminPanelQuery = { __typename?: 'Query', userLookupAdminPanel: { __typename?: 'UserLookup', user?: { __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null, createdAt: string } | null, workspaces: Array<{ __typename?: 'WorkspaceInfo', id: string, name: string, logo?: string | null, totalUsers: number, activationStatus: WorkspaceActivationStatus, createdAt: string, allowImpersonation: boolean, workspaceUrls: { __typename?: 'WorkspaceUrls', customUrl?: string | null, subdomainUrl: string }, users: Array<{ __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null }>, featureFlags: Array<{ __typename?: 'FeatureFlag', key: FeatureFlagKey, value: boolean }> }> } };

export type WorkspaceLookupAdminPanelQueryVariables = Exact<{
  workspaceId: Scalars['UUID'];
}>;


export type WorkspaceLookupAdminPanelQuery = { __typename?: 'Query', workspaceLookupAdminPanel: { __typename?: 'UserLookup', user?: { __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null, createdAt: string } | null, workspaces: Array<{ __typename?: 'WorkspaceInfo', id: string, name: string, allowImpersonation: boolean, logo?: string | null, totalUsers: number, activationStatus: WorkspaceActivationStatus, createdAt: string, workspaceUrls: { __typename?: 'WorkspaceUrls', customUrl?: string | null, subdomainUrl: string }, users: Array<{ __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null }>, featureFlags: Array<{ __typename?: 'FeatureFlag', key: FeatureFlagKey, value: boolean }> }> } };

export type DeleteJobsMutationVariables = Exact<{
  queueName: Scalars['String'];
  jobIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type DeleteJobsMutation = { __typename?: 'Mutation', deleteJobs: { __typename?: 'DeleteJobsResponse', deletedCount: number, results: Array<{ __typename?: 'JobOperationResult', jobId: string, success: boolean, error?: string | null }> } };

export type RefreshUpgradeStatusMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshUpgradeStatusMutation = { __typename?: 'Mutation', refreshUpgradeStatus: { __typename?: 'InstanceAndAllWorkspacesUpgradeStatus', computedAt: string, instanceUpgradeStatus: { __typename?: 'InstanceUpgradeStatus', inferredVersion?: string | null, health: UpgradeHealth, latestCommand?: { __typename?: 'LatestUpgradeCommand', name: string, status: string, executedByVersion: string, errorMessage?: string | null, createdAt: string } | null }, workspacesBehind: Array<{ __typename?: 'WorkspaceUpgradeRef', id: string, name?: string | null }>, workspacesFailed: Array<{ __typename?: 'WorkspaceUpgradeRef', id: string, name?: string | null }> } };

export type RetryJobsMutationVariables = Exact<{
  queueName: Scalars['String'];
  jobIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type RetryJobsMutation = { __typename?: 'Mutation', retryJobs: { __typename?: 'RetryJobsResponse', retriedCount: number, results: Array<{ __typename?: 'JobOperationResult', jobId: string, success: boolean, error?: string | null }> } };

export type GetIndicatorHealthStatusQueryVariables = Exact<{
  indicatorId: HealthIndicatorId;
}>;


export type GetIndicatorHealthStatusQuery = { __typename?: 'Query', getIndicatorHealthStatus: { __typename?: 'AdminPanelHealthServiceData', id: HealthIndicatorId, label: string, description: string, status: AdminPanelHealthServiceStatus, errorMessage?: string | null, details?: string | null, queues?: Array<{ __typename?: 'AdminPanelWorkerQueueHealth', id: string, queueName: string, status: AdminPanelHealthServiceStatus }> | null } };

export type GetInstanceAndAllWorkspacesUpgradeStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInstanceAndAllWorkspacesUpgradeStatusQuery = { __typename?: 'Query', getInstanceAndAllWorkspacesUpgradeStatus: { __typename?: 'InstanceAndAllWorkspacesUpgradeStatus', computedAt: string, instanceUpgradeStatus: { __typename?: 'InstanceUpgradeStatus', inferredVersion?: string | null, health: UpgradeHealth, latestCommand?: { __typename?: 'LatestUpgradeCommand', name: string, status: string, executedByVersion: string, errorMessage?: string | null, createdAt: string } | null }, workspacesBehind: Array<{ __typename?: 'WorkspaceUpgradeRef', id: string, name?: string | null }>, workspacesFailed: Array<{ __typename?: 'WorkspaceUpgradeRef', id: string, name?: string | null }> } };

export type GetQueueJobsQueryVariables = Exact<{
  queueName: Scalars['String'];
  state: JobState;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;


export type GetQueueJobsQuery = { __typename?: 'Query', getQueueJobs: { __typename?: 'QueueJobsResponse', count: number, totalCount: number, hasMore: boolean, jobs: Array<{ __typename?: 'QueueJob', id: string, name: string, data?: any | null, state: JobState, timestamp?: number | null, failedReason?: string | null, processedOn?: number | null, finishedOn?: number | null, attemptsMade: number, returnValue?: any | null, logs?: Array<string> | null, stackTrace?: Array<string> | null }>, retentionConfig: { __typename?: 'QueueRetentionConfig', completedMaxAge: number, completedMaxCount: number, failedMaxAge: number, failedMaxCount: number } } };

export type GetQueueMetricsQueryVariables = Exact<{
  queueName: Scalars['String'];
  timeRange?: InputMaybe<QueueMetricsTimeRange>;
}>;


export type GetQueueMetricsQuery = { __typename?: 'Query', getQueueMetrics: { __typename?: 'QueueMetricsData', queueName: string, timeRange: QueueMetricsTimeRange, workers: number, details?: { __typename?: 'WorkerQueueMetrics', failed: number, completed: number, waiting: number, active: number, delayed: number, failureRate: number } | null, data: Array<{ __typename?: 'QueueMetricsSeries', id: string, data: Array<{ __typename?: 'QueueMetricsDataPoint', x: number, y: number }> }> } };

export type GetSystemHealthStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSystemHealthStatusQuery = { __typename?: 'Query', getSystemHealthStatus: { __typename?: 'SystemHealth', services: Array<{ __typename?: 'SystemHealthService', id: HealthIndicatorId, label: string, status: AdminPanelHealthServiceStatus }> } };

export type ClearMaintenanceModeMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearMaintenanceModeMutation = { __typename?: 'Mutation', clearMaintenanceMode: boolean };

export type SetMaintenanceModeMutationVariables = Exact<{
  startAt: Scalars['DateTime'];
  endAt: Scalars['DateTime'];
  link?: InputMaybe<Scalars['String']>;
}>;


export type SetMaintenanceModeMutation = { __typename?: 'Mutation', setMaintenanceMode: boolean };

export type GetMaintenanceModeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMaintenanceModeQuery = { __typename?: 'Query', getMaintenanceMode?: { __typename?: 'MaintenanceMode', startAt: string, endAt: string, link?: string | null } | null };

export type ApplicationRegistrationFragmentFragment = { __typename?: 'ApplicationRegistration', id: string, universalIdentifier: string, name: string, logoUrl?: string | null, oAuthClientId: string, oAuthRedirectUris: Array<string>, oAuthScopes: Array<string>, sourceType: ApplicationRegistrationSourceType, sourcePackage?: string | null, latestAvailableVersion?: string | null, isListed: boolean, isFeatured: boolean, isPreInstalled: boolean, isConfigured: boolean, ownerWorkspaceId?: string | null, createdAt: string, updatedAt: string };

export const UserInfoFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserInfoFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UserInfoFragmentFragment, unknown>;
export const ApplicationRegistrationFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ApplicationRegistrationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationRegistration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"universalIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthClientId"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthRedirectUris"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthScopes"}},{"kind":"Field","name":{"kind":"Name","value":"sourceType"}},{"kind":"Field","name":{"kind":"Name","value":"sourcePackage"}},{"kind":"Field","name":{"kind":"Name","value":"latestAvailableVersion"}},{"kind":"Field","name":{"kind":"Name","value":"isListed"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"isPreInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"ownerWorkspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ApplicationRegistrationFragmentFragment, unknown>;
export const AddAiProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddAiProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerConfig"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addAiProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"providerName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerName"}}},{"kind":"Argument","name":{"kind":"Name","value":"providerConfig"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerConfig"}}}]}]}}]} as unknown as DocumentNode<AddAiProviderMutation, AddAiProviderMutationVariables>;
export const AddModelToProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddModelToProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelConfig"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addModelToProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"providerName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerName"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelConfig"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelConfig"}}}]}]}}]} as unknown as DocumentNode<AddModelToProviderMutation, AddModelToProviderMutationVariables>;
export const RemoveAiProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveAiProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeAiProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"providerName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerName"}}}]}]}}]} as unknown as DocumentNode<RemoveAiProviderMutation, RemoveAiProviderMutationVariables>;
export const RemoveModelFromProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveModelFromProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeModelFromProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"providerName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerName"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelName"}}}]}]}}]} as unknown as DocumentNode<RemoveModelFromProviderMutation, RemoveModelFromProviderMutationVariables>;
export const SetAdminAiModelEnabledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminAiModelEnabled"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminAiModelEnabled"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}},{"kind":"Argument","name":{"kind":"Name","value":"enabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}}}]}]}}]} as unknown as DocumentNode<SetAdminAiModelEnabledMutation, SetAdminAiModelEnabledMutationVariables>;
export const SetAdminAiModelRecommendedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminAiModelRecommended"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recommended"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminAiModelRecommended"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}},{"kind":"Argument","name":{"kind":"Name","value":"recommended"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recommended"}}}]}]}}]} as unknown as DocumentNode<SetAdminAiModelRecommendedMutation, SetAdminAiModelRecommendedMutationVariables>;
export const SetAdminAiModelsEnabledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminAiModelsEnabled"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminAiModelsEnabled"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"modelIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"enabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}}}]}]}}]} as unknown as DocumentNode<SetAdminAiModelsEnabledMutation, SetAdminAiModelsEnabledMutationVariables>;
export const SetAdminAiModelsRecommendedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminAiModelsRecommended"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recommended"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminAiModelsRecommended"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"modelIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"recommended"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recommended"}}}]}]}}]} as unknown as DocumentNode<SetAdminAiModelsRecommendedMutation, SetAdminAiModelsRecommendedMutationVariables>;
export const SetAdminDefaultAiModelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetAdminDefaultAiModel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AiModelRole"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAdminDefaultAiModel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"modelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"modelId"}}}]}]}}]} as unknown as DocumentNode<SetAdminDefaultAiModelMutation, SetAdminDefaultAiModelMutationVariables>;
export const GetAdminAiModelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminAiModels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAdminAiModels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defaultSmartModelId"}},{"kind":"Field","name":{"kind":"Name","value":"defaultFastModelId"}},{"kind":"Field","name":{"kind":"Name","value":"models"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"modelFamily"}},{"kind":"Field","name":{"kind":"Name","value":"sdkPackage"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isAdminEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isDeprecated"}},{"kind":"Field","name":{"kind":"Name","value":"isRecommended"}},{"kind":"Field","name":{"kind":"Name","value":"contextWindowTokens"}},{"kind":"Field","name":{"kind":"Name","value":"maxOutputTokens"}},{"kind":"Field","name":{"kind":"Name","value":"inputCostPerMillionTokens"}},{"kind":"Field","name":{"kind":"Name","value":"outputCostPerMillionTokens"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"providerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"dataResidency"}}]}}]}}]}}]} as unknown as DocumentNode<GetAdminAiModelsQuery, GetAdminAiModelsQueryVariables>;
export const GetAdminAiUsageByWorkspaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminAiUsageByWorkspace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodStart"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodEnd"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAdminAiUsageByWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"periodStart"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodStart"}}},{"kind":"Argument","name":{"kind":"Name","value":"periodEnd"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodEnd"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"creditsUsed"}}]}}]}}]} as unknown as DocumentNode<GetAdminAiUsageByWorkspaceQuery, GetAdminAiUsageByWorkspaceQueryVariables>;
export const GetAiProvidersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAiProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAiProviders"}}]}}]} as unknown as DocumentNode<GetAiProvidersQuery, GetAiProvidersQueryVariables>;
export const GetModelsDevProvidersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetModelsDevProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getModelsDevProviders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"modelCount"}},{"kind":"Field","name":{"kind":"Name","value":"npm"}}]}}]}}]} as unknown as DocumentNode<GetModelsDevProvidersQuery, GetModelsDevProvidersQueryVariables>;
export const GetModelsDevSuggestionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetModelsDevSuggestions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"providerType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getModelsDevSuggestions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"providerType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"providerType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inputCostPerMillionTokens"}},{"kind":"Field","name":{"kind":"Name","value":"outputCostPerMillionTokens"}},{"kind":"Field","name":{"kind":"Name","value":"cachedInputCostPerMillionTokens"}},{"kind":"Field","name":{"kind":"Name","value":"cacheCreationCostPerMillionTokens"}},{"kind":"Field","name":{"kind":"Name","value":"contextWindowTokens"}},{"kind":"Field","name":{"kind":"Name","value":"maxOutputTokens"}},{"kind":"Field","name":{"kind":"Name","value":"modalities"}},{"kind":"Field","name":{"kind":"Name","value":"supportsReasoning"}}]}}]}}]} as unknown as DocumentNode<GetModelsDevSuggestionsQuery, GetModelsDevSuggestionsQueryVariables>;
export const FindAllApplicationRegistrationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindAllApplicationRegistrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findAllApplicationRegistrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ApplicationRegistrationFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ApplicationRegistrationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationRegistration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"universalIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthClientId"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthRedirectUris"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthScopes"}},{"kind":"Field","name":{"kind":"Name","value":"sourceType"}},{"kind":"Field","name":{"kind":"Name","value":"sourcePackage"}},{"kind":"Field","name":{"kind":"Name","value":"latestAvailableVersion"}},{"kind":"Field","name":{"kind":"Name","value":"isListed"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"isPreInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"ownerWorkspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<FindAllApplicationRegistrationsQuery, FindAllApplicationRegistrationsQueryVariables>;
export const CreateDatabaseConfigVariableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDatabaseConfigVariable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"value"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDatabaseConfigVariable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}},{"kind":"Argument","name":{"kind":"Name","value":"value"},"value":{"kind":"Variable","name":{"kind":"Name","value":"value"}}}]}]}}]} as unknown as DocumentNode<CreateDatabaseConfigVariableMutation, CreateDatabaseConfigVariableMutationVariables>;
export const DeleteDatabaseConfigVariableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDatabaseConfigVariable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDatabaseConfigVariable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}]}]}}]} as unknown as DocumentNode<DeleteDatabaseConfigVariableMutation, DeleteDatabaseConfigVariableMutationVariables>;
export const UpdateDatabaseConfigVariableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDatabaseConfigVariable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"value"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDatabaseConfigVariable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}},{"kind":"Argument","name":{"kind":"Name","value":"value"},"value":{"kind":"Variable","name":{"kind":"Name","value":"value"}}}]}]}}]} as unknown as DocumentNode<UpdateDatabaseConfigVariableMutation, UpdateDatabaseConfigVariableMutationVariables>;
export const GetConfigVariablesGroupedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConfigVariablesGrouped"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConfigVariablesGrouped"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isHiddenOnLoad"}},{"kind":"Field","name":{"kind":"Name","value":"variables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"isSensitive"}},{"kind":"Field","name":{"kind":"Name","value":"isEnvOnly"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetConfigVariablesGroupedQuery, GetConfigVariablesGroupedQueryVariables>;
export const GetDatabaseConfigVariableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDatabaseConfigVariable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDatabaseConfigVariable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"isSensitive"}},{"kind":"Field","name":{"kind":"Name","value":"isEnvOnly"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]} as unknown as DocumentNode<GetDatabaseConfigVariableQuery, GetDatabaseConfigVariableQueryVariables>;
export const UpdateWorkspaceFeatureFlagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkspaceFeatureFlag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"featureFlag"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"value"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkspaceFeatureFlag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"featureFlag"},"value":{"kind":"Variable","name":{"kind":"Name","value":"featureFlag"}}},{"kind":"Argument","name":{"kind":"Name","value":"value"},"value":{"kind":"Variable","name":{"kind":"Name","value":"value"}}}]}]}}]} as unknown as DocumentNode<UpdateWorkspaceFeatureFlagMutation, UpdateWorkspaceFeatureFlagMutationVariables>;
export const AdminPanelRecentUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPanelRecentUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchTerm"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPanelRecentUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"searchTerm"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchTerm"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceName"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceLogo"}}]}}]}}]} as unknown as DocumentNode<AdminPanelRecentUsersQuery, AdminPanelRecentUsersQueryVariables>;
export const AdminPanelTopWorkspacesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPanelTopWorkspaces"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchTerm"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPanelTopWorkspaces"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"searchTerm"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchTerm"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"totalUsers"}},{"kind":"Field","name":{"kind":"Name","value":"subdomain"}}]}}]}}]} as unknown as DocumentNode<AdminPanelTopWorkspacesQuery, AdminPanelTopWorkspacesQueryVariables>;
export const FindOneAdminApplicationRegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindOneAdminApplicationRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findOneAdminApplicationRegistration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ApplicationRegistrationFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ApplicationRegistrationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationRegistration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"universalIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthClientId"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthRedirectUris"}},{"kind":"Field","name":{"kind":"Name","value":"oAuthScopes"}},{"kind":"Field","name":{"kind":"Name","value":"sourceType"}},{"kind":"Field","name":{"kind":"Name","value":"sourcePackage"}},{"kind":"Field","name":{"kind":"Name","value":"latestAvailableVersion"}},{"kind":"Field","name":{"kind":"Name","value":"isListed"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"isPreInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"isConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"ownerWorkspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<FindOneAdminApplicationRegistrationQuery, FindOneAdminApplicationRegistrationQueryVariables>;
export const GetAdminChatThreadMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminChatThreadMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAdminChatThreadMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"thread"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"totalInputTokens"}},{"kind":"Field","name":{"kind":"Name","value":"totalOutputTokens"}},{"kind":"Field","name":{"kind":"Name","value":"conversationSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"parts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"textContent"}},{"kind":"Field","name":{"kind":"Name","value":"toolName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetAdminChatThreadMessagesQuery, GetAdminChatThreadMessagesQueryVariables>;
export const GetAdminWorkspaceChatThreadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminWorkspaceChatThreads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAdminWorkspaceChatThreads"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"totalInputTokens"}},{"kind":"Field","name":{"kind":"Name","value":"totalOutputTokens"}},{"kind":"Field","name":{"kind":"Name","value":"conversationSize"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetAdminWorkspaceChatThreadsQuery, GetAdminWorkspaceChatThreadsQueryVariables>;
export const GetUpgradeStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUpgradeStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUpgradeStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspaceId"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"inferredVersion"}},{"kind":"Field","name":{"kind":"Name","value":"health"}},{"kind":"Field","name":{"kind":"Name","value":"latestCommand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"executedByVersion"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetUpgradeStatusQuery, GetUpgradeStatusQueryVariables>;
export const GetVersionInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetVersionInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"versionInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}}]}}]}}]} as unknown as DocumentNode<GetVersionInfoQuery, GetVersionInfoQueryVariables>;
export const WorkspaceBillingAdminPanelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceBillingAdminPanel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspaceBillingAdminPanel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeCustomerId"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeSubscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"interval"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"planKey"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodStart"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"trialStart"}},{"kind":"Field","name":{"kind":"Name","value":"trialEnd"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAt"}},{"kind":"Field","name":{"kind":"Name","value":"canceledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelAtPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"productKey"}},{"kind":"Field","name":{"kind":"Name","value":"stripePriceId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitAmount"}},{"kind":"Field","name":{"kind":"Name","value":"includedCredits"}}]}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceBillingAdminPanelQuery, WorkspaceBillingAdminPanelQueryVariables>;
export const UserLookupAdminPanelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserLookupAdminPanel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userIdentifier"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userLookupAdminPanel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userIdentifier"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userIdentifier"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserInfoFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"totalUsers"}},{"kind":"Field","name":{"kind":"Name","value":"activationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allowImpersonation"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceUrls"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customUrl"}},{"kind":"Field","name":{"kind":"Name","value":"subdomainUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featureFlags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserInfoFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UserLookupAdminPanelQuery, UserLookupAdminPanelQueryVariables>;
export const WorkspaceLookupAdminPanelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceLookupAdminPanel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspaceLookupAdminPanel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserInfoFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"allowImpersonation"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"totalUsers"}},{"kind":"Field","name":{"kind":"Name","value":"activationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"workspaceUrls"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customUrl"}},{"kind":"Field","name":{"kind":"Name","value":"subdomainUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featureFlags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserInfoFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<WorkspaceLookupAdminPanelQuery, WorkspaceLookupAdminPanelQueryVariables>;
export const DeleteJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteJobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"queueName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteJobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"queueName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"queueName"}}},{"kind":"Argument","name":{"kind":"Name","value":"jobIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteJobsMutation, DeleteJobsMutationVariables>;
export const RefreshUpgradeStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshUpgradeStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshUpgradeStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceUpgradeStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inferredVersion"}},{"kind":"Field","name":{"kind":"Name","value":"health"}},{"kind":"Field","name":{"kind":"Name","value":"latestCommand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"executedByVersion"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspacesBehind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspacesFailed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"computedAt"}}]}}]}}]} as unknown as DocumentNode<RefreshUpgradeStatusMutation, RefreshUpgradeStatusMutationVariables>;
export const RetryJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetryJobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"queueName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retryJobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"queueName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"queueName"}}},{"kind":"Argument","name":{"kind":"Name","value":"jobIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retriedCount"}},{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]} as unknown as DocumentNode<RetryJobsMutation, RetryJobsMutationVariables>;
export const GetIndicatorHealthStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIndicatorHealthStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"indicatorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"HealthIndicatorId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getIndicatorHealthStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"indicatorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"indicatorId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"queues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"queueName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetIndicatorHealthStatusQuery, GetIndicatorHealthStatusQueryVariables>;
export const GetInstanceAndAllWorkspacesUpgradeStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInstanceAndAllWorkspacesUpgradeStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getInstanceAndAllWorkspacesUpgradeStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceUpgradeStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inferredVersion"}},{"kind":"Field","name":{"kind":"Name","value":"health"}},{"kind":"Field","name":{"kind":"Name","value":"latestCommand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"executedByVersion"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspacesBehind"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspacesFailed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"computedAt"}}]}}]}}]} as unknown as DocumentNode<GetInstanceAndAllWorkspacesUpgradeStatusQuery, GetInstanceAndAllWorkspacesUpgradeStatusQueryVariables>;
export const GetQueueJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQueueJobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"queueName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"state"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JobState"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getQueueJobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"queueName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"queueName"}}},{"kind":"Argument","name":{"kind":"Name","value":"state"},"value":{"kind":"Variable","name":{"kind":"Name","value":"state"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"failedReason"}},{"kind":"Field","name":{"kind":"Name","value":"processedOn"}},{"kind":"Field","name":{"kind":"Name","value":"finishedOn"}},{"kind":"Field","name":{"kind":"Name","value":"attemptsMade"}},{"kind":"Field","name":{"kind":"Name","value":"returnValue"}},{"kind":"Field","name":{"kind":"Name","value":"logs"}},{"kind":"Field","name":{"kind":"Name","value":"stackTrace"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"retentionConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completedMaxAge"}},{"kind":"Field","name":{"kind":"Name","value":"completedMaxCount"}},{"kind":"Field","name":{"kind":"Name","value":"failedMaxAge"}},{"kind":"Field","name":{"kind":"Name","value":"failedMaxCount"}}]}}]}}]}}]} as unknown as DocumentNode<GetQueueJobsQuery, GetQueueJobsQueryVariables>;
export const GetQueueMetricsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQueueMetrics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"queueName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"QueueMetricsTimeRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getQueueMetrics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"queueName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"queueName"}}},{"kind":"Argument","name":{"kind":"Name","value":"timeRange"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timeRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"queueName"}},{"kind":"Field","name":{"kind":"Name","value":"timeRange"}},{"kind":"Field","name":{"kind":"Name","value":"workers"}},{"kind":"Field","name":{"kind":"Name","value":"details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"failed"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"waiting"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"delayed"}},{"kind":"Field","name":{"kind":"Name","value":"failureRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetQueueMetricsQuery, GetQueueMetricsQueryVariables>;
export const GetSystemHealthStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSystemHealthStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getSystemHealthStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"services"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetSystemHealthStatusQuery, GetSystemHealthStatusQueryVariables>;
export const ClearMaintenanceModeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearMaintenanceMode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearMaintenanceMode"}}]}}]} as unknown as DocumentNode<ClearMaintenanceModeMutation, ClearMaintenanceModeMutationVariables>;
export const SetMaintenanceModeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetMaintenanceMode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"link"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setMaintenanceMode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startAt"}}},{"kind":"Argument","name":{"kind":"Name","value":"endAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endAt"}}},{"kind":"Argument","name":{"kind":"Name","value":"link"},"value":{"kind":"Variable","name":{"kind":"Name","value":"link"}}}]}]}}]} as unknown as DocumentNode<SetMaintenanceModeMutation, SetMaintenanceModeMutationVariables>;
export const GetMaintenanceModeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMaintenanceMode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMaintenanceMode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startAt"}},{"kind":"Field","name":{"kind":"Name","value":"endAt"}},{"kind":"Field","name":{"kind":"Name","value":"link"}}]}}]}}]} as unknown as DocumentNode<GetMaintenanceModeQuery, GetMaintenanceModeQueryVariables>;