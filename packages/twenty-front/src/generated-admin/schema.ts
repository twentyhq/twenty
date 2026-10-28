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
  DateTime: { input: string; output: string; }
  JSON: { input: any; output: any; }
  UUID: { input: string; output: string; }
};

export type AdminAiModelConfig = {
  __typename?: 'AdminAiModelConfig';
  contextWindowTokens?: Maybe<Scalars['Float']['output']>;
  dataResidency?: Maybe<Scalars['String']['output']>;
  efforts?: Maybe<Array<Scalars['String']['output']>>;
  inputCostPerMillionTokens?: Maybe<Scalars['Float']['output']>;
  isAdminEnabled: Scalars['Boolean']['output'];
  isAvailable: Scalars['Boolean']['output'];
  isDeprecated?: Maybe<Scalars['Boolean']['output']>;
  kind: Scalars['String']['output'];
  label: Scalars['String']['output'];
  maxOutputTokens?: Maybe<Scalars['Float']['output']>;
  modelFamily?: Maybe<ModelFamily>;
  modelFamilyLabel?: Maybe<Scalars['String']['output']>;
  modelId: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  outputCostPerMillionTokens?: Maybe<Scalars['Float']['output']>;
  providerLabel?: Maybe<Scalars['String']['output']>;
  providerName?: Maybe<Scalars['String']['output']>;
  sdkPackage?: Maybe<Scalars['String']['output']>;
};

export type AdminAiModelTierDefault = {
  __typename?: 'AdminAiModelTierDefault';
  modelId?: Maybe<Scalars['String']['output']>;
  tier: AiModelTier;
};

export type AdminAiModels = {
  __typename?: 'AdminAiModels';
  defaultModelByTier: Array<AdminAiModelTierDefault>;
  models: Array<AdminAiModelConfig>;
};

export type AdminApplicationMonitoring = {
  __typename?: 'AdminApplicationMonitoring';
  activeWorkspaceCount: Scalars['Int']['output'];
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
  workspaces: Array<ApplicationMonitoringWorkspace>;
};

export type AdminApplicationRegistrationClaim = {
  __typename?: 'AdminApplicationRegistrationClaim';
  workspaceDisplayName?: Maybe<Scalars['String']['output']>;
  workspaceId: Scalars['String']['output'];
};

export type AdminChatMessage = {
  __typename?: 'AdminChatMessage';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  parts: Array<AdminChatMessagePart>;
  role: AgentMessageRole;
};

export type AdminChatMessagePart = {
  __typename?: 'AdminChatMessagePart';
  errorMessage?: Maybe<Scalars['String']['output']>;
  orderIndex: Scalars['Int']['output'];
  reasoningContent?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  textContent?: Maybe<Scalars['String']['output']>;
  toolCallId?: Maybe<Scalars['String']['output']>;
  toolInput?: Maybe<Scalars['JSON']['output']>;
  toolName?: Maybe<Scalars['String']['output']>;
  toolOutput?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
};

export type AdminChatThreadMessages = {
  __typename?: 'AdminChatThreadMessages';
  messages: Array<AdminChatMessage>;
  thread: AdminWorkspaceChatThread;
};

export type AdminPanelHealthServiceData = {
  __typename?: 'AdminPanelHealthServiceData';
  description: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: HealthIndicatorId;
  label: Scalars['String']['output'];
  queues?: Maybe<Array<AdminPanelWorkerQueueHealth>>;
  status: AdminPanelHealthServiceStatus;
};

export enum AdminPanelHealthServiceStatus {
  OPERATIONAL = 'OPERATIONAL',
  OUTAGE = 'OUTAGE'
}

export type AdminPanelRecentUser = {
  __typename?: 'AdminPanelRecentUser';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isAdmin?: Maybe<Scalars['Boolean']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  workspaceId?: Maybe<Scalars['UUID']['output']>;
  workspaceLogo?: Maybe<Scalars['String']['output']>;
  workspaceName?: Maybe<Scalars['String']['output']>;
};

export type AdminPanelTopWorkspace = {
  __typename?: 'AdminPanelTopWorkspace';
  id: Scalars['UUID']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  subdomain: Scalars['String']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type AdminPanelUsageLimit = {
  __typename?: 'AdminPanelUsageLimit';
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

export type AdminPanelUsageLimitDefault = {
  __typename?: 'AdminPanelUsageLimitDefault';
  isOverridable: Scalars['Boolean']['output'];
  limitKind: Scalars['String']['output'];
  limitValue: Scalars['BigInt']['output'];
  operationType: UsageOperationType;
  overriddenByUsageLimitId?: Maybe<Scalars['UUID']['output']>;
  periodCount: Scalars['Int']['output'];
  periodUnit: Scalars['String']['output'];
  resourceType: UsageResourceType;
  spenderType: Scalars['String']['output'];
  unit: UsageUnit;
};

export type AdminPanelWorkerQueueHealth = {
  __typename?: 'AdminPanelWorkerQueueHealth';
  id: Scalars['String']['output'];
  queueName: Scalars['String']['output'];
  status: AdminPanelHealthServiceStatus;
};

export type AdminPanelWorkspaceBilling = {
  __typename?: 'AdminPanelWorkspaceBilling';
  creditBalance?: Maybe<Scalars['Float']['output']>;
  creditGrants: Array<AdminPanelWorkspaceCreditGrant>;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  subscription?: Maybe<AdminPanelWorkspaceSubscription>;
  usage?: Maybe<AdminPanelWorkspaceUsage>;
};

export type AdminPanelWorkspaceCreditGrant = {
  __typename?: 'AdminPanelWorkspaceCreditGrant';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  effectiveAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
  sourceGrantId?: Maybe<Scalars['UUID']['output']>;
  type: BillingCreditGrantType;
};

export type AdminPanelWorkspaceSubscription = {
  __typename?: 'AdminPanelWorkspaceSubscription';
  cancelAt?: Maybe<Scalars['DateTime']['output']>;
  cancelAtPeriodEnd: Scalars['Boolean']['output'];
  canceledAt?: Maybe<Scalars['DateTime']['output']>;
  currency: Scalars['String']['output'];
  currentPeriodEnd: Scalars['DateTime']['output'];
  currentPeriodStart: Scalars['DateTime']['output'];
  interval?: Maybe<SubscriptionInterval>;
  items: Array<AdminPanelWorkspaceSubscriptionItem>;
  planKey?: Maybe<Scalars['String']['output']>;
  status: SubscriptionStatus;
  stripeSubscriptionId: Scalars['String']['output'];
  trialEnd?: Maybe<Scalars['DateTime']['output']>;
  trialStart?: Maybe<Scalars['DateTime']['output']>;
};

export type AdminPanelWorkspaceSubscriptionItem = {
  __typename?: 'AdminPanelWorkspaceSubscriptionItem';
  includedCredits?: Maybe<Scalars['Float']['output']>;
  productKey?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  quantity?: Maybe<Scalars['Float']['output']>;
  stripePriceId: Scalars['String']['output'];
  unitAmount?: Maybe<Scalars['Float']['output']>;
};

export type AdminPanelWorkspaceUsage = {
  __typename?: 'AdminPanelWorkspaceUsage';
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
  userCreditsUsed: Scalars['Float']['output'];
  workspaceCreditsExtraGranted: Scalars['Float']['output'];
  workspaceCreditsGranted: Scalars['Float']['output'];
  workspaceCreditsRemaining: Scalars['Float']['output'];
  workspaceCreditsTotalGranted: Scalars['Float']['output'];
  workspaceCreditsUsed: Scalars['Float']['output'];
};

export type AdminPanelWorkspaceUsageLimits = {
  __typename?: 'AdminPanelWorkspaceUsageLimits';
  defaults: Array<AdminPanelUsageLimitDefault>;
  limits: Array<AdminPanelUsageLimit>;
};

export type AdminUpdateApplicationRegistrationInput = {
  id: Scalars['String']['input'];
  update: AdminUpdateApplicationRegistrationPayload;
};

export type AdminUpdateApplicationRegistrationPayload = {
  isListed?: InputMaybe<Scalars['Boolean']['input']>;
  isPreInstalled?: InputMaybe<Scalars['Boolean']['input']>;
  isVetted?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  oAuthRedirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  oAuthScopes?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type AdminWorkspaceChatThread = {
  __typename?: 'AdminWorkspaceChatThread';
  conversationSize: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  messageCount: Scalars['Int']['output'];
  title?: Maybe<Scalars['String']['output']>;
  totalInputTokens: Scalars['Int']['output'];
  totalOutputTokens: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Role of a message in a chat thread */
export enum AgentMessageRole {
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
  USER = 'USER'
}

export enum AiModelTier {
  balanced = 'balanced',
  extraFast = 'extraFast',
  extraSmart = 'extraSmart',
  fast = 'fast',
  smart = 'smart'
}

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

export type ApplicationMonitoringWorkspace = {
  __typename?: 'ApplicationMonitoringWorkspace';
  applicationVersion: Scalars['String']['output'];
  failedRunCount: Scalars['Int']['output'];
  lastEventAt: Scalars['DateTime']['output'];
  rateLimitEventCount: Scalars['Int']['output'];
  runCount: Scalars['Int']['output'];
  workspaceId: Scalars['String']['output'];
  workspaceLogoUrl?: Maybe<Scalars['String']['output']>;
  workspaceName?: Maybe<Scalars['String']['output']>;
};

export type ApplicationRegistration = {
  __typename?: 'ApplicationRegistration';
  author?: Maybe<Scalars['String']['output']>;
  configurationIssues: Array<ApplicationRegistrationConfigurationIssue>;
  createdAt: Scalars['DateTime']['output'];
  galleryImagesUrls: Array<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  installCount: Scalars['Int']['output'];
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

export enum ApplicationRegistrationConfigurationIssue {
  MISSING_OWNER_WORKSPACE = 'MISSING_OWNER_WORKSPACE',
  MISSING_REQUIRED_SERVER_VARIABLES = 'MISSING_REQUIRED_SERVER_VARIABLES',
  NOT_INSTALLED_ON_OWNER_WORKSPACE = 'NOT_INSTALLED_ON_OWNER_WORKSPACE'
}

export type ApplicationRegistrationInstalledWorkspaces = {
  __typename?: 'ApplicationRegistrationInstalledWorkspaces';
  hasMore: Scalars['Boolean']['output'];
  totalCount: Scalars['Int']['output'];
  workspaces: Array<InstalledWorkspace>;
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

/** The origin of a batch of credits granted to a workspace */
export enum BillingCreditGrantType {
  COMPENSATION = 'COMPENSATION',
  ONBOARDING_REWARD = 'ONBOARDING_REWARD',
  PURCHASE = 'PURCHASE',
  ROLLOVER = 'ROLLOVER',
  SALES = 'SALES'
}

export enum ConfigSource {
  DATABASE = 'DATABASE',
  DEFAULT = 'DEFAULT',
  ENVIRONMENT = 'ENVIRONMENT'
}

export type ConfigVariable = {
  __typename?: 'ConfigVariable';
  description: Scalars['String']['output'];
  isEnvOnly: Scalars['Boolean']['output'];
  isSensitive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  options?: Maybe<Scalars['JSON']['output']>;
  source: ConfigSource;
  type: ConfigVariableType;
  value?: Maybe<Scalars['JSON']['output']>;
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
  RESEND_SETTINGS = 'RESEND_SETTINGS',
  SERVER_CONFIG = 'SERVER_CONFIG',
  SSL = 'SSL',
  STORAGE_CONFIG = 'STORAGE_CONFIG',
  SUPPORT_CHAT_CONFIG = 'SUPPORT_CHAT_CONFIG',
  TOKENS_DURATION = 'TOKENS_DURATION'
}

export type ConfigVariablesGroupData = {
  __typename?: 'ConfigVariablesGroupData';
  description: Scalars['String']['output'];
  isHiddenOnLoad: Scalars['Boolean']['output'];
  name: ConfigVariablesGroup;
  variables: Array<ConfigVariable>;
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

export type CreditUsedItem = {
  __typename?: 'CreditUsedItem';
  creditsUsed: Scalars['Float']['output'];
  label?: Maybe<Scalars['String']['output']>;
  operation?: Maybe<UsageOperationType>;
  resource?: Maybe<UsageResourceType>;
};

export type CustomAiProviderAccessDto = {
  __typename?: 'CustomAiProviderAccessDTO';
  hasAccess: Scalars['Boolean']['output'];
  seatCount: Scalars['Int']['output'];
  seatThreshold: Scalars['Int']['output'];
};

export type DeleteJobsResponse = {
  __typename?: 'DeleteJobsResponse';
  deletedCount: Scalars['Int']['output'];
  results: Array<JobOperationResult>;
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

export type FindApplicationRegistrationInstalledWorkspacesInput = {
  id: Scalars['String']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};

export enum HealthIndicatorId {
  app = 'app',
  connectedAccount = 'connectedAccount',
  database = 'database',
  redis = 'redis',
  worker = 'worker'
}

export type InstalledWorkspace = {
  __typename?: 'InstalledWorkspace';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export type InstanceAndAllWorkspacesUpgradeStatus = {
  __typename?: 'InstanceAndAllWorkspacesUpgradeStatus';
  computedAt: Scalars['DateTime']['output'];
  instanceUpgradeStatus: InstanceUpgradeStatus;
  upToDateWorkspaceCount: Scalars['Int']['output'];
  workspacesBehind: Array<WorkspaceUpgradeRef>;
  workspacesFailed: Array<WorkspaceUpgradeRef>;
};

export type InstanceUpgradeStatus = {
  __typename?: 'InstanceUpgradeStatus';
  health: UpgradeHealth;
  inferredVersion?: Maybe<Scalars['String']['output']>;
  latestCommand?: Maybe<LatestUpgradeCommand>;
};

export type JobOperationResult = {
  __typename?: 'JobOperationResult';
  error?: Maybe<Scalars['String']['output']>;
  jobId: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
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
  createdAt: Scalars['DateTime']['output'];
  errorMessage?: Maybe<Scalars['String']['output']>;
  executedByVersion: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type MaintenanceMode = {
  __typename?: 'MaintenanceMode';
  endAt: Scalars['DateTime']['output'];
  link?: Maybe<Scalars['String']['output']>;
  startAt: Scalars['DateTime']['output'];
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
  cacheCreationCostPerMillionTokens?: Maybe<Scalars['Float']['output']>;
  cachedInputCostPerMillionTokens?: Maybe<Scalars['Float']['output']>;
  contextWindowTokens: Scalars['Float']['output'];
  inputCostPerMillionTokens: Scalars['Float']['output'];
  maxOutputTokens: Scalars['Float']['output'];
  modalities: Array<Scalars['String']['output']>;
  modelId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  outputCostPerMillionTokens: Scalars['Float']['output'];
  supportsReasoning: Scalars['Boolean']['output'];
};

export type ModelsDevProviderSuggestion = {
  __typename?: 'ModelsDevProviderSuggestion';
  id: Scalars['String']['output'];
  modelCount: Scalars['Float']['output'];
  npm: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addAiProvider: Scalars['Boolean']['output'];
  addModelToProvider: Scalars['Boolean']['output'];
  clearMaintenanceMode: Scalars['Boolean']['output'];
  createDatabaseConfigVariable: Scalars['Boolean']['output'];
  createWorkspaceDataExport: WorkspaceDataExport;
  createWorkspaceUsageLimit: AdminPanelUsageLimit;
  deleteDatabaseConfigVariable: Scalars['Boolean']['output'];
  deleteJobs: DeleteJobsResponse;
  deleteWorkspaceUsageLimit: Scalars['Boolean']['output'];
  generateTwoFactorAuthenticationRecoveryCodeAsServerAdmin: TwoFactorAuthenticationRecoveryCode;
  grantWorkspaceCredits: AdminPanelWorkspaceCreditGrant;
  refreshUpgradeStatus: InstanceAndAllWorkspacesUpgradeStatus;
  removeAiProvider: Scalars['Boolean']['output'];
  removeModelFromProvider: Scalars['Boolean']['output'];
  retryJobs: RetryJobsResponse;
  revokeSigningKey: SigningKeyDto;
  revokeWorkspaceCreditGrant: AdminPanelWorkspaceCreditGrant;
  setAdminAiModelEnabled: Scalars['Boolean']['output'];
  setAdminAiModelsEnabled: Scalars['Boolean']['output'];
  setAdminDefaultAiModel: Scalars['Boolean']['output'];
  setMaintenanceMode: Scalars['Boolean']['output'];
  syncMarketplaceCatalog: Scalars['Boolean']['output'];
  updateAdminApplicationRegistration: ApplicationRegistration;
  updateAdminApplicationRegistrationVariable: ApplicationRegistrationVariable;
  updateDatabaseConfigVariable: Scalars['Boolean']['output'];
  updateServerAdminAccess: ServerAdmin;
  updateWorkspaceFeatureFlag: Scalars['Boolean']['output'];
  updateWorkspaceUsageLimit: AdminPanelUsageLimit;
};


export type MutationAddAiProviderArgs = {
  providerConfig: Scalars['JSON']['input'];
  providerName: Scalars['String']['input'];
};


export type MutationAddModelToProviderArgs = {
  modelConfig: Scalars['JSON']['input'];
  providerName: Scalars['String']['input'];
};


export type MutationCreateDatabaseConfigVariableArgs = {
  key: Scalars['String']['input'];
  value: Scalars['JSON']['input'];
};


export type MutationCreateWorkspaceDataExportArgs = {
  workspaceId: Scalars['UUID']['input'];
};


export type MutationCreateWorkspaceUsageLimitArgs = {
  payload: CreateUsageLimitInput;
  workspaceId: Scalars['UUID']['input'];
};


export type MutationDeleteDatabaseConfigVariableArgs = {
  key: Scalars['String']['input'];
};


export type MutationDeleteJobsArgs = {
  jobIds: Array<Scalars['String']['input']>;
  queueName: Scalars['String']['input'];
};


export type MutationDeleteWorkspaceUsageLimitArgs = {
  usageLimitId: Scalars['UUID']['input'];
  workspaceId: Scalars['UUID']['input'];
};


export type MutationGenerateTwoFactorAuthenticationRecoveryCodeAsServerAdminArgs = {
  otp?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['UUID']['input'];
  workspaceId: Scalars['UUID']['input'];
};


export type MutationGrantWorkspaceCreditsArgs = {
  amount: Scalars['Float']['input'];
  clientOperationId: Scalars['UUID']['input'];
  expiresInDays?: InputMaybe<Scalars['Int']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  type: BillingCreditGrantType;
  workspaceId: Scalars['UUID']['input'];
};


export type MutationRemoveAiProviderArgs = {
  providerName: Scalars['String']['input'];
};


export type MutationRemoveModelFromProviderArgs = {
  modelName: Scalars['String']['input'];
  providerName: Scalars['String']['input'];
};


export type MutationRetryJobsArgs = {
  jobIds: Array<Scalars['String']['input']>;
  queueName: Scalars['String']['input'];
};


export type MutationRevokeSigningKeyArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationRevokeWorkspaceCreditGrantArgs = {
  creditGrantId: Scalars['UUID']['input'];
  workspaceId: Scalars['UUID']['input'];
};


export type MutationSetAdminAiModelEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  modelId: Scalars['String']['input'];
};


export type MutationSetAdminAiModelsEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  modelIds: Array<Scalars['String']['input']>;
};


export type MutationSetAdminDefaultAiModelArgs = {
  modelId: Scalars['String']['input'];
  tier: AiModelTier;
};


export type MutationSetMaintenanceModeArgs = {
  endAt: Scalars['DateTime']['input'];
  link?: InputMaybe<Scalars['String']['input']>;
  startAt: Scalars['DateTime']['input'];
};


export type MutationUpdateAdminApplicationRegistrationArgs = {
  input: AdminUpdateApplicationRegistrationInput;
};


export type MutationUpdateAdminApplicationRegistrationVariableArgs = {
  input: UpdateApplicationRegistrationVariableInput;
};


export type MutationUpdateDatabaseConfigVariableArgs = {
  key: Scalars['String']['input'];
  value: Scalars['JSON']['input'];
};


export type MutationUpdateServerAdminAccessArgs = {
  canAccessFullAdminPanel?: InputMaybe<Scalars['Boolean']['input']>;
  canImpersonate?: InputMaybe<Scalars['Boolean']['input']>;
  otp?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['UUID']['input'];
};


export type MutationUpdateWorkspaceFeatureFlagArgs = {
  featureFlag: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
  workspaceId: Scalars['UUID']['input'];
};


export type MutationUpdateWorkspaceUsageLimitArgs = {
  payload: UpdateUsageLimitInput;
  workspaceId: Scalars['UUID']['input'];
};

export type PaginatedApplicationRegistrations = {
  __typename?: 'PaginatedApplicationRegistrations';
  hasMore: Scalars['Boolean']['output'];
  registrations: Array<ApplicationRegistration>;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  adminPanelRecentUsers: Array<AdminPanelRecentUser>;
  adminPanelTopWorkspaces: Array<AdminPanelTopWorkspace>;
  findAdminApplicationRegistrationClaims: Array<AdminApplicationRegistrationClaim>;
  findAdminApplicationRegistrationInstalledWorkspaces: ApplicationRegistrationInstalledWorkspaces;
  findAdminApplicationRegistrationMonitoring: AdminApplicationMonitoring;
  findAdminApplicationRegistrationStats: ApplicationRegistrationStats;
  findAdminApplicationRegistrationVariables: Array<ApplicationRegistrationVariable>;
  findAllApplicationRegistrations: PaginatedApplicationRegistrations;
  findOneAdminApplicationRegistration: ApplicationRegistration;
  getAdminAiModels: AdminAiModels;
  getAdminAiUsageByWorkspace: Array<UsageBreakdownItem>;
  getAdminChatThreadMessages: AdminChatThreadMessages;
  getAdminWorkspaceChatThreads: Array<AdminWorkspaceChatThread>;
  getAiProviders: Scalars['JSON']['output'];
  getConfigVariablesGrouped: ConfigVariables;
  getCustomAiProviderAccess: CustomAiProviderAccessDto;
  getDatabaseConfigVariable: ConfigVariable;
  getIndicatorHealthStatus: AdminPanelHealthServiceData;
  getInstanceAndAllWorkspacesUpgradeStatus: InstanceAndAllWorkspacesUpgradeStatus;
  getMaintenanceMode?: Maybe<MaintenanceMode>;
  getModelsDevProviders: Array<ModelsDevProviderSuggestion>;
  getModelsDevSuggestions: Array<ModelsDevModelSuggestion>;
  getQueueJobs: QueueJobsResponse;
  getQueueMetrics: QueueMetricsData;
  getServerAdmins: Array<ServerAdmin>;
  getSigningKeys: SigningKeysAdminPanelDto;
  getSystemHealthStatus: SystemHealth;
  getUpgradeStatus: Array<WorkspaceUpgradeStatus>;
  userLookupAdminPanel: UserLookup;
  versionInfo: VersionInfo;
  workspaceBillingAdminPanel?: Maybe<AdminPanelWorkspaceBilling>;
  workspaceDataExports: Array<WorkspaceDataExport>;
  workspaceLookupAdminPanel: UserLookup;
  workspaceUsageLimits: AdminPanelWorkspaceUsageLimits;
};


export type QueryAdminPanelRecentUsersArgs = {
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminPanelTopWorkspacesArgs = {
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAdminApplicationRegistrationClaimsArgs = {
  applicationRegistrationId: Scalars['String']['input'];
};


export type QueryFindAdminApplicationRegistrationInstalledWorkspacesArgs = {
  input: FindApplicationRegistrationInstalledWorkspacesInput;
};


export type QueryFindAdminApplicationRegistrationMonitoringArgs = {
  id: Scalars['String']['input'];
  periodEnd?: InputMaybe<Scalars['DateTime']['input']>;
  periodStart?: InputMaybe<Scalars['DateTime']['input']>;
  workspaceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAdminApplicationRegistrationStatsArgs = {
  id: Scalars['String']['input'];
  periodEnd?: InputMaybe<Scalars['DateTime']['input']>;
  periodStart?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryFindAdminApplicationRegistrationVariablesArgs = {
  applicationRegistrationId: Scalars['String']['input'];
};


export type QueryFindAllApplicationRegistrationsArgs = {
  isConfigured?: InputMaybe<Scalars['Boolean']['input']>;
  isListed?: InputMaybe<Scalars['Boolean']['input']>;
  isPreInstalledOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  sourceTypes?: InputMaybe<Array<ApplicationRegistrationSourceType>>;
};


export type QueryFindOneAdminApplicationRegistrationArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetAdminAiUsageByWorkspaceArgs = {
  periodEnd?: InputMaybe<Scalars['DateTime']['input']>;
  periodStart?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryGetAdminChatThreadMessagesArgs = {
  threadId: Scalars['UUID']['input'];
  workspaceId: Scalars['UUID']['input'];
};


export type QueryGetAdminWorkspaceChatThreadsArgs = {
  workspaceId: Scalars['UUID']['input'];
};


export type QueryGetDatabaseConfigVariableArgs = {
  key: Scalars['String']['input'];
};


export type QueryGetIndicatorHealthStatusArgs = {
  indicatorId: HealthIndicatorId;
};


export type QueryGetModelsDevSuggestionsArgs = {
  providerType: Scalars['String']['input'];
};


export type QueryGetQueueJobsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  queueName: Scalars['String']['input'];
  state: JobState;
};


export type QueryGetQueueMetricsArgs = {
  queueName: Scalars['String']['input'];
  timeRange?: InputMaybe<QueueMetricsTimeRange>;
};


export type QueryGetUpgradeStatusArgs = {
  workspaceIds: Array<Scalars['UUID']['input']>;
};


export type QueryUserLookupAdminPanelArgs = {
  userIdentifier: Scalars['String']['input'];
};


export type QueryWorkspaceBillingAdminPanelArgs = {
  workspaceId: Scalars['UUID']['input'];
};


export type QueryWorkspaceDataExportsArgs = {
  workspaceId: Scalars['UUID']['input'];
};


export type QueryWorkspaceLookupAdminPanelArgs = {
  workspaceId: Scalars['UUID']['input'];
};


export type QueryWorkspaceUsageLimitsArgs = {
  workspaceId: Scalars['UUID']['input'];
};

export type QueueJob = {
  __typename?: 'QueueJob';
  attemptsMade: Scalars['Float']['output'];
  data?: Maybe<Scalars['JSON']['output']>;
  failedReason?: Maybe<Scalars['String']['output']>;
  finishedOn?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  logs?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  processedOn?: Maybe<Scalars['Float']['output']>;
  returnValue?: Maybe<Scalars['JSON']['output']>;
  stackTrace?: Maybe<Array<Scalars['String']['output']>>;
  state: JobState;
  timestamp?: Maybe<Scalars['Float']['output']>;
};

export type QueueJobsResponse = {
  __typename?: 'QueueJobsResponse';
  count: Scalars['Float']['output'];
  hasMore: Scalars['Boolean']['output'];
  jobs: Array<QueueJob>;
  retentionConfig: QueueRetentionConfig;
  totalCount: Scalars['Float']['output'];
};

export type QueueMetricsData = {
  __typename?: 'QueueMetricsData';
  data: Array<QueueMetricsSeries>;
  details?: Maybe<WorkerQueueMetrics>;
  queueName: Scalars['String']['output'];
  timeRange: QueueMetricsTimeRange;
  workers: Scalars['Float']['output'];
};

export type QueueMetricsDataPoint = {
  __typename?: 'QueueMetricsDataPoint';
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type QueueMetricsSeries = {
  __typename?: 'QueueMetricsSeries';
  data: Array<QueueMetricsDataPoint>;
  id: Scalars['String']['output'];
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
  completedMaxAge: Scalars['Float']['output'];
  completedMaxCount: Scalars['Float']['output'];
  failedMaxAge: Scalars['Float']['output'];
  failedMaxCount: Scalars['Float']['output'];
};

export type RetryJobsResponse = {
  __typename?: 'RetryJobsResponse';
  results: Array<JobOperationResult>;
  retriedCount: Scalars['Int']['output'];
};

export type ServerAdmin = {
  __typename?: 'ServerAdmin';
  canAccessFullAdminPanel: Scalars['Boolean']['output'];
  canImpersonate: Scalars['Boolean']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  lastName: Scalars['String']['output'];
};

export type SigningKeyDto = {
  __typename?: 'SigningKeyDTO';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  isCurrent: Scalars['Boolean']['output'];
  publicKey: Scalars['String']['output'];
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
  verifyCountInWindow: Scalars['Int']['output'];
};

export type SigningKeysAdminPanelDto = {
  __typename?: 'SigningKeysAdminPanelDTO';
  legacyVerifyCountInWindow: Scalars['Int']['output'];
  signingKeys: Array<SigningKeyDto>;
  verifyWindowDays: Scalars['Int']['output'];
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
  label: Scalars['String']['output'];
  status: AdminPanelHealthServiceStatus;
};

export type TwoFactorAuthenticationRecoveryCode = {
  __typename?: 'TwoFactorAuthenticationRecoveryCode';
  expiresAt: Scalars['DateTime']['output'];
  recoveryCode: Scalars['String']['output'];
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

export type UpdateUsageLimitInput = {
  id: Scalars['UUID']['input'];
  payload: CreateUsageLimitInput;
};

export enum UpgradeHealth {
  BEHIND = 'BEHIND',
  FAILED = 'FAILED',
  UP_TO_DATE = 'UP_TO_DATE'
}

export type UsageBreakdownItem = {
  __typename?: 'UsageBreakdownItem';
  creditsUsed: Scalars['Float']['output'];
  key: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
  userCreditsUsed: Scalars['Float']['output'];
  workspaceCreditsUsed: Scalars['Float']['output'];
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

export type UserInfo = {
  __typename?: 'UserInfo';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isAdmin?: Maybe<Scalars['Boolean']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
};

export type UserLookup = {
  __typename?: 'UserLookup';
  user?: Maybe<UserInfo>;
  workspaces: Array<WorkspaceInfo>;
};

export type VersionDistributionEntry = {
  __typename?: 'VersionDistributionEntry';
  count: Scalars['Int']['output'];
  version: Scalars['String']['output'];
};

export type VersionInfo = {
  __typename?: 'VersionInfo';
  currentVersion?: Maybe<Scalars['String']['output']>;
  latestVersion?: Maybe<Scalars['String']['output']>;
};

export type WorkerQueueMetrics = {
  __typename?: 'WorkerQueueMetrics';
  active: Scalars['Float']['output'];
  completed: Scalars['Float']['output'];
  completedData?: Maybe<Array<Scalars['Float']['output']>>;
  delayed: Scalars['Float']['output'];
  failed: Scalars['Float']['output'];
  failedData?: Maybe<Array<Scalars['Float']['output']>>;
  failureRate: Scalars['Float']['output'];
  waiting: Scalars['Float']['output'];
};

export enum WorkspaceActivationStatus {
  ACTIVE = 'ACTIVE',
  CREATED = 'CREATED',
  INACTIVE = 'INACTIVE',
  ONGOING_CREATION = 'ONGOING_CREATION',
  PENDING_CREATION = 'PENDING_CREATION',
  SUSPENDED = 'SUSPENDED'
}

export type WorkspaceDataExport = {
  __typename?: 'WorkspaceDataExport';
  createdAt: Scalars['DateTime']['output'];
  downloadUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  objects: Array<WorkspaceDataExportObject>;
  sizeInBytes: Scalars['Float']['output'];
  status: WorkspaceDataExportStatus;
  workspaceId: Scalars['UUID']['output'];
};

export type WorkspaceDataExportObject = {
  __typename?: 'WorkspaceDataExportObject';
  fieldCount: Scalars['Int']['output'];
  isExported: Scalars['Boolean']['output'];
  labelSingular: Scalars['String']['output'];
  nameSingular: Scalars['String']['output'];
  recordCount: Scalars['Int']['output'];
};

export enum WorkspaceDataExportStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export type WorkspaceInfo = {
  __typename?: 'WorkspaceInfo';
  activationStatus: WorkspaceActivationStatus;
  allowImpersonation: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  featureFlags: Array<FeatureFlag>;
  id: Scalars['UUID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  totalUsers: Scalars['Float']['output'];
  users: Array<UserInfo>;
  workspaceUrls: WorkspaceUrls;
};

export type WorkspaceUpgradeRef = {
  __typename?: 'WorkspaceUpgradeRef';
  id: Scalars['UUID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceUpgradeStatus = {
  __typename?: 'WorkspaceUpgradeStatus';
  displayName?: Maybe<Scalars['String']['output']>;
  health: UpgradeHealth;
  inferredVersion?: Maybe<Scalars['String']['output']>;
  latestCommand?: Maybe<LatestUpgradeCommand>;
  workspaceId: Scalars['UUID']['output'];
};

export type WorkspaceUrls = {
  __typename?: 'WorkspaceUrls';
  customUrl?: Maybe<Scalars['String']['output']>;
  subdomainUrl: Scalars['String']['output'];
};
