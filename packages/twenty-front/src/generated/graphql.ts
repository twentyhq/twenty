import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  ConnectionCursor: any;
  DateTime: string;
  JSON: any;
  JSONObject: any;
  UUID: any;
};

export type AiSystemPromptPreview = {
  __typename?: 'AISystemPromptPreview';
  estimatedTokenCount: Scalars['Int'];
  sections: Array<AiSystemPromptSection>;
};

export type AiSystemPromptSection = {
  __typename?: 'AISystemPromptSection';
  content: Scalars['String'];
  estimatedTokenCount: Scalars['Int'];
  title: Scalars['String'];
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

export type AdminPanelWorkerQueueHealth = {
  __typename?: 'AdminPanelWorkerQueueHealth';
  id: Scalars['String'];
  queueName: Scalars['String'];
  status: AdminPanelHealthServiceStatus;
};

export type Agent = {
  __typename?: 'Agent';
  applicationId?: Maybe<Scalars['UUID']>;
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  evaluationInputs: Array<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  isCustom: Scalars['Boolean'];
  label: Scalars['String'];
  modelConfiguration?: Maybe<Scalars['JSON']>;
  modelId: Scalars['String'];
  name: Scalars['String'];
  prompt: Scalars['String'];
  responseFormat?: Maybe<Scalars['JSON']>;
  roleId?: Maybe<Scalars['UUID']>;
  updatedAt: Scalars['DateTime'];
};

export type AgentChatThread = {
  __typename?: 'AgentChatThread';
  contextWindowTokens?: Maybe<Scalars['Int']>;
  conversationSize: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  title?: Maybe<Scalars['String']>;
  totalInputCredits: Scalars['Float'];
  totalInputTokens: Scalars['Int'];
  totalOutputCredits: Scalars['Float'];
  totalOutputTokens: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

export type AgentMessage = {
  __typename?: 'AgentMessage';
  agentId?: Maybe<Scalars['UUID']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  parts: Array<AgentMessagePart>;
  role: Scalars['String'];
  threadId: Scalars['UUID'];
  turnId: Scalars['UUID'];
};

export type AgentMessagePart = {
  __typename?: 'AgentMessagePart';
  createdAt: Scalars['DateTime'];
  errorDetails?: Maybe<Scalars['JSON']>;
  errorMessage?: Maybe<Scalars['String']>;
  fileFilename?: Maybe<Scalars['String']>;
  fileMediaType?: Maybe<Scalars['String']>;
  fileUrl?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  messageId: Scalars['UUID'];
  orderIndex: Scalars['Int'];
  providerMetadata?: Maybe<Scalars['JSON']>;
  reasoningContent?: Maybe<Scalars['String']>;
  sourceDocumentFilename?: Maybe<Scalars['String']>;
  sourceDocumentMediaType?: Maybe<Scalars['String']>;
  sourceDocumentSourceId?: Maybe<Scalars['String']>;
  sourceDocumentTitle?: Maybe<Scalars['String']>;
  sourceUrlSourceId?: Maybe<Scalars['String']>;
  sourceUrlTitle?: Maybe<Scalars['String']>;
  sourceUrlUrl?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  textContent?: Maybe<Scalars['String']>;
  toolCallId?: Maybe<Scalars['String']>;
  toolInput?: Maybe<Scalars['JSON']>;
  toolName?: Maybe<Scalars['String']>;
  toolOutput?: Maybe<Scalars['JSON']>;
  type: Scalars['String'];
};

export type AgentTurn = {
  __typename?: 'AgentTurn';
  agentId?: Maybe<Scalars['UUID']>;
  createdAt: Scalars['DateTime'];
  evaluations: Array<AgentTurnEvaluation>;
  id: Scalars['UUID'];
  messages: Array<AgentMessage>;
  threadId: Scalars['UUID'];
};

export type AgentTurnEvaluation = {
  __typename?: 'AgentTurnEvaluation';
  comment?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  score: Scalars['Int'];
  turnId: Scalars['UUID'];
};

export type AggregateChartConfiguration = {
  __typename?: 'AggregateChartConfiguration';
  aggregateFieldMetadataId: Scalars['UUID'];
  aggregateOperation: AggregateOperations;
  configurationType: WidgetConfigurationType;
  description?: Maybe<Scalars['String']>;
  displayDataLabel?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['JSON']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']>;
  format?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  prefix?: Maybe<Scalars['String']>;
  ratioAggregateConfig?: Maybe<RatioAggregateConfig>;
  suffix?: Maybe<Scalars['String']>;
  timezone?: Maybe<Scalars['String']>;
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

export type Analytics = {
  __typename?: 'Analytics';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type ApiConfig = {
  __typename?: 'ApiConfig';
  mutationMaximumAffectedRecords: Scalars['Float'];
};

export type ApiKey = {
  __typename?: 'ApiKey';
  createdAt: Scalars['DateTime'];
  expiresAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  name: Scalars['String'];
  revokedAt?: Maybe<Scalars['DateTime']>;
  role: Role;
  updatedAt: Scalars['DateTime'];
};

export type ApiKeyForRole = {
  __typename?: 'ApiKeyForRole';
  expiresAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  name: Scalars['String'];
  revokedAt?: Maybe<Scalars['DateTime']>;
};

export type ApiKeyToken = {
  __typename?: 'ApiKeyToken';
  token: Scalars['String'];
};

export type AppToken = {
  __typename?: 'AppToken';
  createdAt: Scalars['DateTime'];
  expiresAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type AppTokenEdge = {
  __typename?: 'AppTokenEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the AppToken */
  node: AppToken;
};

export type Application = {
  __typename?: 'Application';
  agents: Array<Agent>;
  applicationVariables: Array<ApplicationVariable>;
  availablePackages: Scalars['JSON'];
  canBeUninstalled: Scalars['Boolean'];
  defaultLogicFunctionRole?: Maybe<Role>;
  defaultRoleId?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  id: Scalars['UUID'];
  logicFunctions: Array<LogicFunction>;
  name: Scalars['String'];
  objects: Array<Object>;
  packageJsonChecksum?: Maybe<Scalars['String']>;
  packageJsonFileId?: Maybe<Scalars['UUID']>;
  universalIdentifier: Scalars['String'];
  version: Scalars['String'];
  yarnLockChecksum?: Maybe<Scalars['String']>;
  yarnLockFileId?: Maybe<Scalars['UUID']>;
};

export type ApplicationVariable = {
  __typename?: 'ApplicationVariable';
  description: Scalars['String'];
  id: Scalars['UUID'];
  isSecret: Scalars['Boolean'];
  key: Scalars['String'];
  value: Scalars['String'];
};

export type ApprovedAccessDomain = {
  __typename?: 'ApprovedAccessDomain';
  createdAt: Scalars['DateTime'];
  domain: Scalars['String'];
  id: Scalars['UUID'];
  isValidated: Scalars['Boolean'];
};

export type AuthBypassProviders = {
  __typename?: 'AuthBypassProviders';
  google: Scalars['Boolean'];
  microsoft: Scalars['Boolean'];
  password: Scalars['Boolean'];
};

export type AuthProviders = {
  __typename?: 'AuthProviders';
  google: Scalars['Boolean'];
  magicLink: Scalars['Boolean'];
  microsoft: Scalars['Boolean'];
  password: Scalars['Boolean'];
  sso: Array<SsoIdentityProvider>;
};

export type AuthToken = {
  __typename?: 'AuthToken';
  expiresAt: Scalars['DateTime'];
  token: Scalars['String'];
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

export type AuthorizeAppOutput = {
  __typename?: 'AuthorizeAppOutput';
  redirectUrl: Scalars['String'];
};

export type AutocompleteResult = {
  __typename?: 'AutocompleteResult';
  placeId: Scalars['String'];
  text: Scalars['String'];
};

export type AvailableWorkspace = {
  __typename?: 'AvailableWorkspace';
  displayName?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  inviteHash?: Maybe<Scalars['String']>;
  loginToken?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
  personalInviteToken?: Maybe<Scalars['String']>;
  sso: Array<SsoConnection>;
  workspaceUrls: WorkspaceUrls;
};

export type AvailableWorkspaces = {
  __typename?: 'AvailableWorkspaces';
  availableWorkspacesForSignIn: Array<AvailableWorkspace>;
  availableWorkspacesForSignUp: Array<AvailableWorkspace>;
};

export type AvailableWorkspacesAndAccessTokensOutput = {
  __typename?: 'AvailableWorkspacesAndAccessTokensOutput';
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
  aggregateFieldMetadataId: Scalars['UUID'];
  aggregateOperation: AggregateOperations;
  axisNameDisplay?: Maybe<AxisNameDisplay>;
  color?: Maybe<Scalars['String']>;
  configurationType: WidgetConfigurationType;
  description?: Maybe<Scalars['String']>;
  displayDataLabel?: Maybe<Scalars['Boolean']>;
  displayLegend?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['JSON']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']>;
  groupMode?: Maybe<BarChartGroupMode>;
  isCumulative?: Maybe<Scalars['Boolean']>;
  layout: BarChartLayout;
  omitNullValues?: Maybe<Scalars['Boolean']>;
  primaryAxisDateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  primaryAxisGroupByFieldMetadataId: Scalars['UUID'];
  primaryAxisGroupBySubFieldName?: Maybe<Scalars['String']>;
  primaryAxisManualSortOrder?: Maybe<Array<Scalars['String']>>;
  primaryAxisOrderBy?: Maybe<GraphOrderBy>;
  rangeMax?: Maybe<Scalars['Float']>;
  rangeMin?: Maybe<Scalars['Float']>;
  secondaryAxisGroupByDateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  secondaryAxisGroupByFieldMetadataId?: Maybe<Scalars['UUID']>;
  secondaryAxisGroupBySubFieldName?: Maybe<Scalars['String']>;
  secondaryAxisManualSortOrder?: Maybe<Array<Scalars['String']>>;
  secondaryAxisOrderBy?: Maybe<GraphOrderBy>;
  timezone?: Maybe<Scalars['String']>;
};

export type BarChartDataOutput = {
  __typename?: 'BarChartDataOutput';
  data: Array<Scalars['JSON']>;
  formattedToRawLookup: Scalars['JSON'];
  groupMode: BarChartGroupMode;
  hasTooManyGroups: Scalars['Boolean'];
  indexBy: Scalars['String'];
  keys: Array<Scalars['String']>;
  layout: BarChartLayout;
  series: Array<BarChartSeries>;
  showDataLabels: Scalars['Boolean'];
  showLegend: Scalars['Boolean'];
  xAxisLabel: Scalars['String'];
  yAxisLabel: Scalars['String'];
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
  key: Scalars['String'];
  label: Scalars['String'];
};

export type Billing = {
  __typename?: 'Billing';
  billingUrl?: Maybe<Scalars['String']>;
  isBillingEnabled: Scalars['Boolean'];
  trialPeriods: Array<BillingTrialPeriod>;
};

export type BillingEndTrialPeriodOutput = {
  __typename?: 'BillingEndTrialPeriodOutput';
  /** Billing portal URL for payment method update (returned when no payment method exists) */
  billingPortalUrl?: Maybe<Scalars['String']>;
  /** Boolean that confirms if a payment method was found */
  hasPaymentMethod: Scalars['Boolean'];
  /** Updated subscription status */
  status?: Maybe<SubscriptionStatus>;
};

export type BillingEntitlement = {
  __typename?: 'BillingEntitlement';
  key: BillingEntitlementKey;
  value: Scalars['Boolean'];
};

export enum BillingEntitlementKey {
  AUDIT_LOGS = 'AUDIT_LOGS',
  CUSTOM_DOMAIN = 'CUSTOM_DOMAIN',
  RLS = 'RLS',
  SSO = 'SSO'
}

export type BillingLicensedProduct = BillingProductDto & {
  __typename?: 'BillingLicensedProduct';
  description: Scalars['String'];
  images?: Maybe<Array<Scalars['String']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String'];
  prices?: Maybe<Array<BillingPriceLicensed>>;
};

export type BillingMeteredProduct = BillingProductDto & {
  __typename?: 'BillingMeteredProduct';
  description: Scalars['String'];
  images?: Maybe<Array<Scalars['String']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String'];
  prices?: Maybe<Array<BillingPriceMetered>>;
};

export type BillingMeteredProductUsageOutput = {
  __typename?: 'BillingMeteredProductUsageOutput';
  grantedCredits: Scalars['Float'];
  periodEnd: Scalars['DateTime'];
  periodStart: Scalars['DateTime'];
  productKey: BillingProductKey;
  rolloverCredits: Scalars['Float'];
  totalGrantedCredits: Scalars['Float'];
  unitPriceCents: Scalars['Float'];
  usedCredits: Scalars['Float'];
};

/** The different billing plans available */
export enum BillingPlanKey {
  ENTERPRISE = 'ENTERPRISE',
  PRO = 'PRO'
}

export type BillingPlanOutput = {
  __typename?: 'BillingPlanOutput';
  licensedProducts: Array<BillingLicensedProduct>;
  meteredProducts: Array<BillingMeteredProduct>;
  planKey: BillingPlanKey;
};

export type BillingPriceLicensed = {
  __typename?: 'BillingPriceLicensed';
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String'];
  unitAmount: Scalars['Float'];
};

export type BillingPriceMetered = {
  __typename?: 'BillingPriceMetered';
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String'];
  tiers: Array<BillingPriceTier>;
};

export type BillingPriceTier = {
  __typename?: 'BillingPriceTier';
  flatAmount?: Maybe<Scalars['Float']>;
  unitAmount?: Maybe<Scalars['Float']>;
  upTo?: Maybe<Scalars['Float']>;
};

export type BillingProduct = {
  __typename?: 'BillingProduct';
  description: Scalars['String'];
  images?: Maybe<Array<Scalars['String']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String'];
};

export type BillingProductDto = {
  description: Scalars['String'];
  images?: Maybe<Array<Scalars['String']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String'];
};

/** The different billing products available */
export enum BillingProductKey {
  BASE_PRODUCT = 'BASE_PRODUCT',
  WORKFLOW_NODE_EXECUTION = 'WORKFLOW_NODE_EXECUTION'
}

export type BillingProductMetadata = {
  __typename?: 'BillingProductMetadata';
  planKey: BillingPlanKey;
  priceUsageBased: BillingUsageType;
  productKey: BillingProductKey;
};

export type BillingSessionOutput = {
  __typename?: 'BillingSessionOutput';
  url?: Maybe<Scalars['String']>;
};

export type BillingSubscription = {
  __typename?: 'BillingSubscription';
  billingSubscriptionItems?: Maybe<Array<BillingSubscriptionItemDto>>;
  currentPeriodEnd?: Maybe<Scalars['DateTime']>;
  id: Scalars['UUID'];
  interval?: Maybe<SubscriptionInterval>;
  metadata: Scalars['JSON'];
  phases: Array<BillingSubscriptionSchedulePhase>;
  status: SubscriptionStatus;
};

export type BillingSubscriptionItemDto = {
  __typename?: 'BillingSubscriptionItemDTO';
  billingProduct: BillingProductDto;
  hasReachedCurrentPeriodCap: Scalars['Boolean'];
  id: Scalars['UUID'];
  quantity?: Maybe<Scalars['Float']>;
  stripePriceId: Scalars['String'];
};

export type BillingSubscriptionSchedulePhase = {
  __typename?: 'BillingSubscriptionSchedulePhase';
  end_date: Scalars['Float'];
  items: Array<BillingSubscriptionSchedulePhaseItem>;
  start_date: Scalars['Float'];
};

export type BillingSubscriptionSchedulePhaseItem = {
  __typename?: 'BillingSubscriptionSchedulePhaseItem';
  price: Scalars['String'];
  quantity?: Maybe<Scalars['Float']>;
};

export type BillingTrialPeriod = {
  __typename?: 'BillingTrialPeriod';
  duration: Scalars['Float'];
  isCreditCardRequired: Scalars['Boolean'];
};

export type BillingUpdateOutput = {
  __typename?: 'BillingUpdateOutput';
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
  is?: InputMaybe<Scalars['Boolean']>;
  isNot?: InputMaybe<Scalars['Boolean']>;
};

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING'
}

export type CalendarConfiguration = {
  __typename?: 'CalendarConfiguration';
  configurationType: WidgetConfigurationType;
};

export type Captcha = {
  __typename?: 'Captcha';
  provider?: Maybe<CaptchaDriverType>;
  siteKey?: Maybe<Scalars['String']>;
};

export enum CaptchaDriverType {
  GOOGLE_RECAPTCHA = 'GOOGLE_RECAPTCHA',
  TURNSTILE = 'TURNSTILE'
}

export type ChannelSyncSuccess = {
  __typename?: 'ChannelSyncSuccess';
  success: Scalars['Boolean'];
};

export type CheckUserExistOutput = {
  __typename?: 'CheckUserExistOutput';
  availableWorkspacesCount: Scalars['Float'];
  exists: Scalars['Boolean'];
  isEmailVerified: Scalars['Boolean'];
};

export type ClientAiModelConfig = {
  __typename?: 'ClientAIModelConfig';
  deprecated?: Maybe<Scalars['Boolean']>;
  inputCostPer1kTokensInCredits: Scalars['Float'];
  label: Scalars['String'];
  modelId: Scalars['String'];
  nativeCapabilities?: Maybe<NativeModelCapabilities>;
  outputCostPer1kTokensInCredits: Scalars['Float'];
  provider: ModelProvider;
};

export type CommandMenuItem = {
  __typename?: 'CommandMenuItem';
  applicationId?: Maybe<Scalars['UUID']>;
  availabilityObjectMetadataId?: Maybe<Scalars['UUID']>;
  availabilityType: CommandMenuItemAvailabilityType;
  createdAt: Scalars['DateTime'];
  frontComponent?: Maybe<FrontComponent>;
  frontComponentId?: Maybe<Scalars['UUID']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  isPinned: Scalars['Boolean'];
  label: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  workflowVersionId?: Maybe<Scalars['UUID']>;
};

export enum CommandMenuItemAvailabilityType {
  BULK_RECORDS = 'BULK_RECORDS',
  GLOBAL = 'GLOBAL',
  SINGLE_RECORD = 'SINGLE_RECORD'
}

export type ComputeStepOutputSchemaInput = {
  /** Step JSON format */
  step: Scalars['JSON'];
  /** Workflow version ID */
  workflowVersionId?: InputMaybe<Scalars['UUID']>;
};

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
  NUMBER = 'NUMBER',
  STRING = 'STRING'
}

export enum ConfigVariablesGroup {
  ANALYTICS_CONFIG = 'ANALYTICS_CONFIG',
  AWS_SES_SETTINGS = 'AWS_SES_SETTINGS',
  BILLING_CONFIG = 'BILLING_CONFIG',
  CAPTCHA_CONFIG = 'CAPTCHA_CONFIG',
  CLOUDFLARE_CONFIG = 'CLOUDFLARE_CONFIG',
  CODE_INTERPRETER_CONFIG = 'CODE_INTERPRETER_CONFIG',
  EMAIL_SETTINGS = 'EMAIL_SETTINGS',
  EXCEPTION_HANDLER = 'EXCEPTION_HANDLER',
  GOOGLE_AUTH = 'GOOGLE_AUTH',
  LLM = 'LLM',
  LOGGING = 'LOGGING',
  LOGIC_FUNCTION_CONFIG = 'LOGIC_FUNCTION_CONFIG',
  METERING = 'METERING',
  MICROSOFT_AUTH = 'MICROSOFT_AUTH',
  OTHER = 'OTHER',
  RATE_LIMITING = 'RATE_LIMITING',
  SERVER_CONFIG = 'SERVER_CONFIG',
  SSL = 'SSL',
  STORAGE_CONFIG = 'STORAGE_CONFIG',
  SUPPORT_CHAT_CONFIG = 'SUPPORT_CHAT_CONFIG',
  TOKENS_DURATION = 'TOKENS_DURATION',
  TWO_FACTOR_AUTHENTICATION = 'TWO_FACTOR_AUTHENTICATION'
}

export type ConfigVariablesGroupData = {
  __typename?: 'ConfigVariablesGroupData';
  description: Scalars['String'];
  isHiddenOnLoad: Scalars['Boolean'];
  name: ConfigVariablesGroup;
  variables: Array<ConfigVariable>;
};

export type ConfigVariablesOutput = {
  __typename?: 'ConfigVariablesOutput';
  groups: Array<ConfigVariablesGroupData>;
};

export type ConnectedImapSmtpCaldavAccount = {
  __typename?: 'ConnectedImapSmtpCaldavAccount';
  accountOwnerId: Scalars['UUID'];
  connectionParameters?: Maybe<ImapSmtpCaldavConnectionParameters>;
  handle: Scalars['String'];
  id: Scalars['UUID'];
  provider: Scalars['String'];
};

export type ConnectionParametersOutput = {
  __typename?: 'ConnectionParametersOutput';
  host: Scalars['String'];
  password: Scalars['String'];
  port: Scalars['Float'];
  secure?: Maybe<Scalars['Boolean']>;
  username?: Maybe<Scalars['String']>;
};

export type CoreView = {
  __typename?: 'CoreView';
  anyFieldFilterValue?: Maybe<Scalars['String']>;
  calendarFieldMetadataId?: Maybe<Scalars['UUID']>;
  calendarLayout?: Maybe<ViewCalendarLayout>;
  createdAt: Scalars['DateTime'];
  createdByUserWorkspaceId?: Maybe<Scalars['UUID']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  icon: Scalars['String'];
  id: Scalars['UUID'];
  isCompact: Scalars['Boolean'];
  isCustom: Scalars['Boolean'];
  kanbanAggregateOperation?: Maybe<AggregateOperations>;
  kanbanAggregateOperationFieldMetadataId?: Maybe<Scalars['UUID']>;
  key?: Maybe<ViewKey>;
  mainGroupByFieldMetadataId?: Maybe<Scalars['UUID']>;
  name: Scalars['String'];
  objectMetadataId: Scalars['UUID'];
  openRecordIn: ViewOpenRecordIn;
  position: Scalars['Float'];
  shouldHideEmptyGroups: Scalars['Boolean'];
  type: ViewType;
  updatedAt: Scalars['DateTime'];
  viewFields: Array<CoreViewField>;
  viewFilterGroups: Array<CoreViewFilterGroup>;
  viewFilters: Array<CoreViewFilter>;
  viewGroups: Array<CoreViewGroup>;
  viewSorts: Array<CoreViewSort>;
  visibility: ViewVisibility;
  workspaceId: Scalars['UUID'];
};

export type CoreViewField = {
  __typename?: 'CoreViewField';
  aggregateOperation?: Maybe<AggregateOperations>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  fieldMetadataId: Scalars['UUID'];
  id: Scalars['UUID'];
  isVisible: Scalars['Boolean'];
  position: Scalars['Float'];
  size: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
  viewId: Scalars['UUID'];
  workspaceId: Scalars['UUID'];
};

export type CoreViewFilter = {
  __typename?: 'CoreViewFilter';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  fieldMetadataId: Scalars['UUID'];
  id: Scalars['UUID'];
  operand: ViewFilterOperand;
  positionInViewFilterGroup?: Maybe<Scalars['Float']>;
  subFieldName?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  value: Scalars['JSON'];
  viewFilterGroupId?: Maybe<Scalars['UUID']>;
  viewId: Scalars['UUID'];
  workspaceId: Scalars['UUID'];
};

export type CoreViewFilterGroup = {
  __typename?: 'CoreViewFilterGroup';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['UUID'];
  logicalOperator: ViewFilterGroupLogicalOperator;
  parentViewFilterGroupId?: Maybe<Scalars['UUID']>;
  positionInViewFilterGroup?: Maybe<Scalars['Float']>;
  updatedAt: Scalars['DateTime'];
  viewId: Scalars['UUID'];
  workspaceId: Scalars['UUID'];
};

export type CoreViewGroup = {
  __typename?: 'CoreViewGroup';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  fieldValue: Scalars['String'];
  id: Scalars['UUID'];
  isVisible: Scalars['Boolean'];
  position: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
  viewId: Scalars['UUID'];
  workspaceId: Scalars['UUID'];
};

export type CoreViewSort = {
  __typename?: 'CoreViewSort';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  direction: ViewSortDirection;
  fieldMetadataId: Scalars['UUID'];
  id: Scalars['UUID'];
  updatedAt: Scalars['DateTime'];
  viewId: Scalars['UUID'];
  workspaceId: Scalars['UUID'];
};

export type CreateDraftFromWorkflowVersionInput = {
  /** Workflow ID */
  workflowId: Scalars['UUID'];
  /** Workflow version ID */
  workflowVersionIdToCopy: Scalars['UUID'];
};

export type CreateWorkflowVersionEdgeInput = {
  /** Workflow version source step ID */
  source: Scalars['String'];
  /** Workflow version source step connection options */
  sourceConnectionOptions?: InputMaybe<Scalars['JSON']>;
  /** Workflow version target step ID */
  target: Scalars['String'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String'];
};

export type CreateWorkflowVersionStepInput = {
  /** Default settings for the step */
  defaultSettings?: InputMaybe<Scalars['JSON']>;
  /** Step ID */
  id?: InputMaybe<Scalars['String']>;
  /** Next step ID */
  nextStepId?: InputMaybe<Scalars['UUID']>;
  /** Parent step connection options */
  parentStepConnectionOptions?: InputMaybe<Scalars['JSON']>;
  /** Parent step ID */
  parentStepId?: InputMaybe<Scalars['String']>;
  /** Step position */
  position?: InputMaybe<WorkflowStepPositionInput>;
  /** New step type */
  stepType: Scalars['String'];
  /** Workflow version ID */
  workflowVersionId: Scalars['UUID'];
};

export type CursorPaging = {
  /** Paginate after opaque cursor */
  after?: InputMaybe<Scalars['ConnectionCursor']>;
  /** Paginate before opaque cursor */
  before?: InputMaybe<Scalars['ConnectionCursor']>;
  /** Paginate first */
  first?: InputMaybe<Scalars['Int']>;
  /** Paginate last */
  last?: InputMaybe<Scalars['Int']>;
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

export type DateTimeFilter = {
  eq?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  neq?: InputMaybe<Scalars['DateTime']>;
};

export type DeleteJobsResponse = {
  __typename?: 'DeleteJobsResponse';
  deletedCount: Scalars['Int'];
  results: Array<JobOperationResult>;
};

export type DeleteSsoOutput = {
  __typename?: 'DeleteSsoOutput';
  identityProviderId: Scalars['UUID'];
};

export type DeleteTwoFactorAuthenticationMethodOutput = {
  __typename?: 'DeleteTwoFactorAuthenticationMethodOutput';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type DeleteWorkflowVersionStepInput = {
  /** Step to delete ID */
  stepId: Scalars['String'];
  /** Workflow version ID */
  workflowVersionId: Scalars['UUID'];
};

export type DeletedWorkspaceMember = {
  __typename?: 'DeletedWorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  name: FullName;
  userEmail: Scalars['String'];
  userWorkspaceId?: Maybe<Scalars['UUID']>;
};

export type DomainRecord = {
  __typename?: 'DomainRecord';
  key: Scalars['String'];
  status: Scalars['String'];
  type: Scalars['String'];
  validationType: Scalars['String'];
  value: Scalars['String'];
};

export type DomainValidRecords = {
  __typename?: 'DomainValidRecords';
  domain: Scalars['String'];
  id: Scalars['UUID'];
  records: Array<DomainRecord>;
};

export type DuplicateWorkflowInput = {
  /** Workflow ID to duplicate */
  workflowIdToDuplicate: Scalars['UUID'];
  /** Workflow version ID to copy */
  workflowVersionIdToCopy: Scalars['UUID'];
};

export type DuplicateWorkflowVersionStepInput = {
  stepId: Scalars['String'];
  workflowVersionId: Scalars['String'];
};

export type DuplicatedDashboard = {
  __typename?: 'DuplicatedDashboard';
  createdAt: Scalars['String'];
  id: Scalars['UUID'];
  pageLayoutId?: Maybe<Scalars['UUID']>;
  position: Scalars['Float'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['String'];
};

export type EditSsoOutput = {
  __typename?: 'EditSsoOutput';
  id: Scalars['UUID'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type EmailPasswordResetLinkOutput = {
  __typename?: 'EmailPasswordResetLinkOutput';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type EmailingDomain = {
  __typename?: 'EmailingDomain';
  createdAt: Scalars['DateTime'];
  domain: Scalars['String'];
  driver: EmailingDomainDriver;
  id: Scalars['UUID'];
  status: EmailingDomainStatus;
  updatedAt: Scalars['DateTime'];
  verificationRecords?: Maybe<Array<VerificationRecord>>;
  verifiedAt?: Maybe<Scalars['DateTime']>;
};

export enum EmailingDomainDriver {
  AWS_SES = 'AWS_SES'
}

export enum EmailingDomainStatus {
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  TEMPORARY_FAILURE = 'TEMPORARY_FAILURE',
  VERIFIED = 'VERIFIED'
}

export type EmailsConfiguration = {
  __typename?: 'EmailsConfiguration';
  configurationType: WidgetConfigurationType;
};

export type EventLogPageInfo = {
  __typename?: 'EventLogPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
};

export type EventLogQueryResult = {
  __typename?: 'EventLogQueryResult';
  pageInfo: EventLogPageInfo;
  records: Array<EventLogRecord>;
  totalCount: Scalars['Int'];
};

export type EventLogRecord = {
  __typename?: 'EventLogRecord';
  event: Scalars['String'];
  isCustom?: Maybe<Scalars['Boolean']>;
  objectMetadataId?: Maybe<Scalars['String']>;
  properties?: Maybe<Scalars['JSON']>;
  recordId?: Maybe<Scalars['String']>;
  timestamp: Scalars['DateTime'];
  userWorkspaceId?: Maybe<Scalars['String']>;
};

export type EventSubscription = {
  __typename?: 'EventSubscription';
  eventStreamId: Scalars['String'];
  eventWithQueryIdsList: Array<EventWithQueryIds>;
};

export type EventWithQueryIds = {
  __typename?: 'EventWithQueryIds';
  event: ObjectRecordEvent;
  queryIds: Array<Scalars['String']>;
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  id: Scalars['UUID'];
  key: FeatureFlagKey;
  value: Scalars['Boolean'];
};

export type FeatureFlagDto = {
  __typename?: 'FeatureFlagDTO';
  key: FeatureFlagKey;
  value: Scalars['Boolean'];
};

export enum FeatureFlagKey {
  IS_AI_ENABLED = 'IS_AI_ENABLED',
  IS_APPLICATION_ENABLED = 'IS_APPLICATION_ENABLED',
  IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED = 'IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED',
  IS_ATTACHMENT_MIGRATED = 'IS_ATTACHMENT_MIGRATED',
  IS_COMMAND_MENU_ITEM_ENABLED = 'IS_COMMAND_MENU_ITEM_ENABLED',
  IS_DASHBOARD_V2_ENABLED = 'IS_DASHBOARD_V2_ENABLED',
  IS_EMAILING_DOMAIN_ENABLED = 'IS_EMAILING_DOMAIN_ENABLED',
  IS_FILES_FIELD_MIGRATED = 'IS_FILES_FIELD_MIGRATED',
  IS_JSON_FILTER_ENABLED = 'IS_JSON_FILTER_ENABLED',
  IS_JUNCTION_RELATIONS_ENABLED = 'IS_JUNCTION_RELATIONS_ENABLED',
  IS_MARKETPLACE_ENABLED = 'IS_MARKETPLACE_ENABLED',
  IS_NAVIGATION_MENU_ITEM_ENABLED = 'IS_NAVIGATION_MENU_ITEM_ENABLED',
  IS_NOTE_TARGET_MIGRATED = 'IS_NOTE_TARGET_MIGRATED',
  IS_PUBLIC_DOMAIN_ENABLED = 'IS_PUBLIC_DOMAIN_ENABLED',
  IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED = 'IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED',
  IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED = 'IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED',
  IS_SSE_DB_EVENTS_ENABLED = 'IS_SSE_DB_EVENTS_ENABLED',
  IS_TASK_TARGET_MIGRATED = 'IS_TASK_TARGET_MIGRATED',
  IS_UNIQUE_INDEXES_ENABLED = 'IS_UNIQUE_INDEXES_ENABLED'
}

export type Field = {
  __typename?: 'Field';
  applicationId: Scalars['UUID'];
  createdAt: Scalars['DateTime'];
  defaultValue?: Maybe<Scalars['JSON']>;
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  isActive?: Maybe<Scalars['Boolean']>;
  isCustom?: Maybe<Scalars['Boolean']>;
  isLabelSyncedWithName?: Maybe<Scalars['Boolean']>;
  isNullable?: Maybe<Scalars['Boolean']>;
  isSystem?: Maybe<Scalars['Boolean']>;
  isUIReadOnly?: Maybe<Scalars['Boolean']>;
  isUnique?: Maybe<Scalars['Boolean']>;
  label: Scalars['String'];
  morphId?: Maybe<Scalars['UUID']>;
  morphRelations?: Maybe<Array<Relation>>;
  name: Scalars['String'];
  object?: Maybe<Object>;
  options?: Maybe<Scalars['JSON']>;
  relation?: Maybe<Relation>;
  settings?: Maybe<Scalars['JSON']>;
  standardOverrides?: Maybe<StandardOverrides>;
  type: FieldMetadataType;
  updatedAt: Scalars['DateTime'];
};

export type FieldConfiguration = {
  __typename?: 'FieldConfiguration';
  configurationType: WidgetConfigurationType;
};

export type FieldConnection = {
  __typename?: 'FieldConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type FieldEdge = {
  __typename?: 'FieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the Field */
  node: Field;
};

export type FieldFilter = {
  and?: InputMaybe<Array<FieldFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  isActive?: InputMaybe<BooleanFieldComparison>;
  isCustom?: InputMaybe<BooleanFieldComparison>;
  isSystem?: InputMaybe<BooleanFieldComparison>;
  isUIReadOnly?: InputMaybe<BooleanFieldComparison>;
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
  RICH_TEXT_V2 = 'RICH_TEXT_V2',
  SELECT = 'SELECT',
  TEXT = 'TEXT',
  TS_VECTOR = 'TS_VECTOR',
  UUID = 'UUID'
}

export type FieldPermission = {
  __typename?: 'FieldPermission';
  canReadFieldValue?: Maybe<Scalars['Boolean']>;
  canUpdateFieldValue?: Maybe<Scalars['Boolean']>;
  fieldMetadataId: Scalars['UUID'];
  id: Scalars['UUID'];
  objectMetadataId: Scalars['UUID'];
  roleId: Scalars['UUID'];
};

export type FieldRichTextConfiguration = {
  __typename?: 'FieldRichTextConfiguration';
  configurationType: WidgetConfigurationType;
};

export type FieldsConfiguration = {
  __typename?: 'FieldsConfiguration';
  configurationType: WidgetConfigurationType;
};

export type File = {
  __typename?: 'File';
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  path: Scalars['String'];
  size: Scalars['Float'];
};

export type FilesConfiguration = {
  __typename?: 'FilesConfiguration';
  configurationType: WidgetConfigurationType;
};

export enum FilterIs {
  NotNull = 'NotNull',
  Null = 'Null'
}

export type FindAvailableSsoidpOutput = {
  __typename?: 'FindAvailableSSOIDPOutput';
  id: Scalars['UUID'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
  workspace: WorkspaceNameAndId;
};

export type FrontComponent = {
  __typename?: 'FrontComponent';
  applicationId: Scalars['UUID'];
  builtComponentChecksum: Scalars['String'];
  builtComponentPath: Scalars['String'];
  componentName: Scalars['String'];
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  name: Scalars['String'];
  sourceComponentPath: Scalars['String'];
  universalIdentifier?: Maybe<Scalars['UUID']>;
  updatedAt: Scalars['DateTime'];
};

export type FrontComponentConfiguration = {
  __typename?: 'FrontComponentConfiguration';
  configurationType: WidgetConfigurationType;
  frontComponentId: Scalars['UUID'];
};

export type FullName = {
  __typename?: 'FullName';
  firstName: Scalars['String'];
  lastName: Scalars['String'];
};

export type GaugeChartConfiguration = {
  __typename?: 'GaugeChartConfiguration';
  aggregateFieldMetadataId: Scalars['UUID'];
  aggregateOperation: AggregateOperations;
  color?: Maybe<Scalars['String']>;
  configurationType: WidgetConfigurationType;
  description?: Maybe<Scalars['String']>;
  displayDataLabel?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['JSON']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']>;
  timezone?: Maybe<Scalars['String']>;
};

export type GetAuthorizationUrlForSsoOutput = {
  __typename?: 'GetAuthorizationUrlForSSOOutput';
  authorizationURL: Scalars['String'];
  id: Scalars['UUID'];
  type: Scalars['String'];
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
  column: Scalars['Float'];
  columnSpan: Scalars['Float'];
  row: Scalars['Float'];
  rowSpan: Scalars['Float'];
};

export enum HealthIndicatorId {
  app = 'app',
  connectedAccount = 'connectedAccount',
  database = 'database',
  redis = 'redis',
  worker = 'worker'
}

export enum IdentityProviderType {
  OIDC = 'OIDC',
  SAML = 'SAML'
}

export type IframeConfiguration = {
  __typename?: 'IframeConfiguration';
  configurationType: WidgetConfigurationType;
  url?: Maybe<Scalars['String']>;
};

export type ImapSmtpCaldavConnectionParameters = {
  __typename?: 'ImapSmtpCaldavConnectionParameters';
  CALDAV?: Maybe<ConnectionParametersOutput>;
  IMAP?: Maybe<ConnectionParametersOutput>;
  SMTP?: Maybe<ConnectionParametersOutput>;
};

export type ImapSmtpCaldavConnectionSuccess = {
  __typename?: 'ImapSmtpCaldavConnectionSuccess';
  connectedAccountId: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ImpersonateOutput = {
  __typename?: 'ImpersonateOutput';
  loginToken: AuthToken;
  workspace: WorkspaceUrlsAndId;
};

export type Index = {
  __typename?: 'Index';
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  indexFieldMetadataList: Array<IndexField>;
  indexFieldMetadatas: IndexIndexFieldMetadatasConnection;
  indexType: IndexType;
  indexWhereClause?: Maybe<Scalars['String']>;
  isCustom?: Maybe<Scalars['Boolean']>;
  isUnique: Scalars['Boolean'];
  name: Scalars['String'];
  objectMetadata: IndexObjectMetadataConnection;
  updatedAt: Scalars['DateTime'];
};


export type IndexIndexFieldMetadatasArgs = {
  filter?: IndexFieldFilter;
  paging?: CursorPaging;
};


export type IndexObjectMetadataArgs = {
  filter?: ObjectFilter;
  paging?: CursorPaging;
};

export type IndexConnection = {
  __typename?: 'IndexConnection';
  /** Array of edges. */
  edges: Array<IndexEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type IndexEdge = {
  __typename?: 'IndexEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the Index */
  node: Index;
};

export type IndexField = {
  __typename?: 'IndexField';
  createdAt: Scalars['DateTime'];
  fieldMetadataId: Scalars['UUID'];
  id: Scalars['UUID'];
  order: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
};

export type IndexFieldEdge = {
  __typename?: 'IndexFieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the IndexField */
  node: IndexField;
};

export type IndexFieldFilter = {
  and?: InputMaybe<Array<IndexFieldFilter>>;
  fieldMetadataId?: InputMaybe<UuidFilterComparison>;
  id?: InputMaybe<UuidFilterComparison>;
  or?: InputMaybe<Array<IndexFieldFilter>>;
};

export type IndexFilter = {
  and?: InputMaybe<Array<IndexFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  isCustom?: InputMaybe<BooleanFieldComparison>;
  or?: InputMaybe<Array<IndexFilter>>;
};

export type IndexIndexFieldMetadatasConnection = {
  __typename?: 'IndexIndexFieldMetadatasConnection';
  /** Array of edges. */
  edges: Array<IndexFieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type IndexObjectMetadataConnection = {
  __typename?: 'IndexObjectMetadataConnection';
  /** Array of edges. */
  edges: Array<ObjectEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

/** Type of the index */
export enum IndexType {
  BTREE = 'BTREE',
  GIN = 'GIN'
}

export type InitiateTwoFactorAuthenticationProvisioningOutput = {
  __typename?: 'InitiateTwoFactorAuthenticationProvisioningOutput';
  uri: Scalars['String'];
};

export type InvalidatePasswordOutput = {
  __typename?: 'InvalidatePasswordOutput';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
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

export type LineChartConfiguration = {
  __typename?: 'LineChartConfiguration';
  aggregateFieldMetadataId: Scalars['UUID'];
  aggregateOperation: AggregateOperations;
  axisNameDisplay?: Maybe<AxisNameDisplay>;
  color?: Maybe<Scalars['String']>;
  configurationType: WidgetConfigurationType;
  description?: Maybe<Scalars['String']>;
  displayDataLabel?: Maybe<Scalars['Boolean']>;
  displayLegend?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['JSON']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']>;
  isCumulative?: Maybe<Scalars['Boolean']>;
  isStacked?: Maybe<Scalars['Boolean']>;
  omitNullValues?: Maybe<Scalars['Boolean']>;
  primaryAxisDateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  primaryAxisGroupByFieldMetadataId: Scalars['UUID'];
  primaryAxisGroupBySubFieldName?: Maybe<Scalars['String']>;
  primaryAxisManualSortOrder?: Maybe<Array<Scalars['String']>>;
  primaryAxisOrderBy?: Maybe<GraphOrderBy>;
  rangeMax?: Maybe<Scalars['Float']>;
  rangeMin?: Maybe<Scalars['Float']>;
  secondaryAxisGroupByDateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  secondaryAxisGroupByFieldMetadataId?: Maybe<Scalars['UUID']>;
  secondaryAxisGroupBySubFieldName?: Maybe<Scalars['String']>;
  secondaryAxisManualSortOrder?: Maybe<Array<Scalars['String']>>;
  secondaryAxisOrderBy?: Maybe<GraphOrderBy>;
  timezone?: Maybe<Scalars['String']>;
};

export type LineChartDataOutput = {
  __typename?: 'LineChartDataOutput';
  formattedToRawLookup: Scalars['JSON'];
  hasTooManyGroups: Scalars['Boolean'];
  series: Array<LineChartSeries>;
  showDataLabels: Scalars['Boolean'];
  showLegend: Scalars['Boolean'];
  xAxisLabel: Scalars['String'];
  yAxisLabel: Scalars['String'];
};

export type LineChartDataPoint = {
  __typename?: 'LineChartDataPoint';
  x: Scalars['String'];
  y: Scalars['Float'];
};

export type LineChartSeries = {
  __typename?: 'LineChartSeries';
  data: Array<LineChartDataPoint>;
  id: Scalars['String'];
  label: Scalars['String'];
};

export type LinkMetadata = {
  __typename?: 'LinkMetadata';
  label: Scalars['String'];
  url: Scalars['String'];
};

export type LinksMetadata = {
  __typename?: 'LinksMetadata';
  primaryLinkLabel: Scalars['String'];
  primaryLinkUrl: Scalars['String'];
  secondaryLinks?: Maybe<Array<LinkMetadata>>;
};

export type Location = {
  __typename?: 'Location';
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
};

export type LogicFunction = {
  __typename?: 'LogicFunction';
  applicationId?: Maybe<Scalars['UUID']>;
  builtHandlerPath: Scalars['String'];
  createdAt: Scalars['DateTime'];
  cronTriggerSettings?: Maybe<Scalars['JSON']>;
  databaseEventTriggerSettings?: Maybe<Scalars['JSON']>;
  description?: Maybe<Scalars['String']>;
  handlerName: Scalars['String'];
  httpRouteTriggerSettings?: Maybe<Scalars['JSON']>;
  id: Scalars['UUID'];
  isTool: Scalars['Boolean'];
  name: Scalars['String'];
  runtime: Scalars['String'];
  sourceHandlerPath: Scalars['String'];
  timeoutSeconds: Scalars['Float'];
  toolInputSchema?: Maybe<Scalars['JSON']>;
  universalIdentifier?: Maybe<Scalars['UUID']>;
  updatedAt: Scalars['DateTime'];
};

export type LogicFunctionExecutionResult = {
  __typename?: 'LogicFunctionExecutionResult';
  /** Execution result in JSON format */
  data?: Maybe<Scalars['JSON']>;
  /** Execution duration in milliseconds */
  duration: Scalars['Float'];
  /** Execution error in JSON format */
  error?: Maybe<Scalars['JSON']>;
  /** Execution Logs */
  logs: Scalars['String'];
  /** Execution status */
  status: LogicFunctionExecutionStatus;
};

/** Status of the logic function execution */
export enum LogicFunctionExecutionStatus {
  ERROR = 'ERROR',
  IDLE = 'IDLE',
  SUCCESS = 'SUCCESS'
}

export type LogicFunctionLogs = {
  __typename?: 'LogicFunctionLogs';
  /** Execution Logs */
  logs: Scalars['String'];
};

export type LoginTokenOutput = {
  __typename?: 'LoginTokenOutput';
  loginToken: AuthToken;
};

export type MarketplaceApp = {
  __typename?: 'MarketplaceApp';
  aboutDescription: Scalars['String'];
  author: Scalars['String'];
  category: Scalars['String'];
  description: Scalars['String'];
  icon: Scalars['String'];
  id: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  providers: Array<Scalars['String']>;
  screenshots: Array<Scalars['String']>;
  termsUrl?: Maybe<Scalars['String']>;
  version: Scalars['String'];
  websiteUrl?: Maybe<Scalars['String']>;
};

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
  SUBJECT = 'SUBJECT'
}

export enum ModelProvider {
  ANTHROPIC = 'ANTHROPIC',
  GROQ = 'GROQ',
  NONE = 'NONE',
  OPENAI = 'OPENAI',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE',
  XAI = 'XAI'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateWorkflowVersion: Scalars['Boolean'];
  computeStepOutputSchema: Scalars['JSON'];
  createDraftFromWorkflowVersion: WorkflowVersionDto;
  createWorkflowVersionEdge: WorkflowVersionStepChanges;
  createWorkflowVersionStep: WorkflowVersionStepChanges;
  deactivateWorkflowVersion: Scalars['Boolean'];
  deleteWorkflowVersionEdge: WorkflowVersionStepChanges;
  deleteWorkflowVersionStep: WorkflowVersionStepChanges;
  dismissReconnectAccountBanner: Scalars['Boolean'];
  duplicateWorkflow: WorkflowVersionDto;
  duplicateWorkflowVersionStep: WorkflowVersionStepChanges;
  runWorkflowVersion: RunWorkflowVersionOutput;
  stopWorkflowRun: WorkflowRun;
  submitFormStep: Scalars['Boolean'];
  testHttpRequest: TestHttpRequestOutput;
  updateWorkflowRunStep: WorkflowAction;
  updateWorkflowVersionPositions: Scalars['Boolean'];
  updateWorkflowVersionStep: WorkflowAction;
};


export type MutationActivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['UUID'];
};


export type MutationComputeStepOutputSchemaArgs = {
  input: ComputeStepOutputSchemaInput;
};


export type MutationCreateDraftFromWorkflowVersionArgs = {
  input: CreateDraftFromWorkflowVersionInput;
};


export type MutationCreateWorkflowVersionEdgeArgs = {
  input: CreateWorkflowVersionEdgeInput;
};


export type MutationCreateWorkflowVersionStepArgs = {
  input: CreateWorkflowVersionStepInput;
};


export type MutationDeactivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['UUID'];
};


export type MutationDeleteWorkflowVersionEdgeArgs = {
  input: CreateWorkflowVersionEdgeInput;
};


export type MutationDeleteWorkflowVersionStepArgs = {
  input: DeleteWorkflowVersionStepInput;
};


export type MutationDismissReconnectAccountBannerArgs = {
  connectedAccountId: Scalars['UUID'];
};


export type MutationDuplicateWorkflowArgs = {
  input: DuplicateWorkflowInput;
};


export type MutationDuplicateWorkflowVersionStepArgs = {
  input: DuplicateWorkflowVersionStepInput;
};


export type MutationRunWorkflowVersionArgs = {
  input: RunWorkflowVersionInput;
};


export type MutationStopWorkflowRunArgs = {
  workflowRunId: Scalars['UUID'];
};


export type MutationSubmitFormStepArgs = {
  input: SubmitFormStepInput;
};


export type MutationTestHttpRequestArgs = {
  input: TestHttpRequestInput;
};


export type MutationUpdateWorkflowRunStepArgs = {
  input: UpdateWorkflowRunStepInput;
};


export type MutationUpdateWorkflowVersionPositionsArgs = {
  input: UpdateWorkflowVersionPositionsInput;
};


export type MutationUpdateWorkflowVersionStepArgs = {
  input: UpdateWorkflowVersionStepInput;
};

export type NativeModelCapabilities = {
  __typename?: 'NativeModelCapabilities';
  twitterSearch?: Maybe<Scalars['Boolean']>;
  webSearch?: Maybe<Scalars['Boolean']>;
};

export type NavigationMenuItem = {
  __typename?: 'NavigationMenuItem';
  applicationId?: Maybe<Scalars['UUID']>;
  createdAt: Scalars['DateTime'];
  folderId?: Maybe<Scalars['UUID']>;
  id: Scalars['UUID'];
  name?: Maybe<Scalars['String']>;
  position: Scalars['Float'];
  targetObjectMetadataId?: Maybe<Scalars['UUID']>;
  targetRecordId?: Maybe<Scalars['UUID']>;
  targetRecordIdentifier?: Maybe<RecordIdentifier>;
  updatedAt: Scalars['DateTime'];
  userWorkspaceId?: Maybe<Scalars['UUID']>;
  viewId?: Maybe<Scalars['UUID']>;
};

export type NotesConfiguration = {
  __typename?: 'NotesConfiguration';
  configurationType: WidgetConfigurationType;
};

export type Object = {
  __typename?: 'Object';
  applicationId: Scalars['UUID'];
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  duplicateCriteria?: Maybe<Array<Array<Scalars['String']>>>;
  fields: ObjectFieldsConnection;
  fieldsList: Array<Field>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  imageIdentifierFieldMetadataId?: Maybe<Scalars['UUID']>;
  indexMetadataList: Array<Index>;
  indexMetadatas: ObjectIndexMetadatasConnection;
  isActive: Scalars['Boolean'];
  isCustom: Scalars['Boolean'];
  isLabelSyncedWithName: Scalars['Boolean'];
  isRemote: Scalars['Boolean'];
  isSearchable: Scalars['Boolean'];
  isSystem: Scalars['Boolean'];
  isUIReadOnly: Scalars['Boolean'];
  labelIdentifierFieldMetadataId?: Maybe<Scalars['UUID']>;
  labelPlural: Scalars['String'];
  labelSingular: Scalars['String'];
  namePlural: Scalars['String'];
  nameSingular: Scalars['String'];
  shortcut?: Maybe<Scalars['String']>;
  standardOverrides?: Maybe<ObjectStandardOverrides>;
  updatedAt: Scalars['DateTime'];
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
  cursor: Scalars['ConnectionCursor'];
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
  isCustom?: InputMaybe<BooleanFieldComparison>;
  isRemote?: InputMaybe<BooleanFieldComparison>;
  isSearchable?: InputMaybe<BooleanFieldComparison>;
  isSystem?: InputMaybe<BooleanFieldComparison>;
  isUIReadOnly?: InputMaybe<BooleanFieldComparison>;
  or?: InputMaybe<Array<ObjectFilter>>;
};

export type ObjectIndexMetadatasConnection = {
  __typename?: 'ObjectIndexMetadatasConnection';
  /** Array of edges. */
  edges: Array<IndexEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectPermission = {
  __typename?: 'ObjectPermission';
  canDestroyObjectRecords?: Maybe<Scalars['Boolean']>;
  canReadObjectRecords?: Maybe<Scalars['Boolean']>;
  canSoftDeleteObjectRecords?: Maybe<Scalars['Boolean']>;
  canUpdateObjectRecords?: Maybe<Scalars['Boolean']>;
  objectMetadataId: Scalars['UUID'];
  restrictedFields?: Maybe<Scalars['JSON']>;
  rowLevelPermissionPredicateGroups?: Maybe<Array<RowLevelPermissionPredicateGroup>>;
  rowLevelPermissionPredicates?: Maybe<Array<RowLevelPermissionPredicate>>;
};

export type ObjectRecordEvent = {
  __typename?: 'ObjectRecordEvent';
  action: DatabaseEventAction;
  objectNameSingular: Scalars['String'];
  properties: ObjectRecordEventProperties;
  recordId: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
  workspaceMemberId?: Maybe<Scalars['String']>;
};

export type ObjectRecordEventProperties = {
  __typename?: 'ObjectRecordEventProperties';
  after?: Maybe<Scalars['JSON']>;
  before?: Maybe<Scalars['JSON']>;
  diff?: Maybe<Scalars['JSON']>;
  updatedFields?: Maybe<Array<Scalars['String']>>;
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

export type ObjectStandardOverrides = {
  __typename?: 'ObjectStandardOverrides';
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  labelPlural?: Maybe<Scalars['String']>;
  labelSingular?: Maybe<Scalars['String']>;
  translations?: Maybe<Scalars['JSON']>;
};

export type OnDbEvent = {
  __typename?: 'OnDbEvent';
  action: DatabaseEventAction;
  eventDate: Scalars['DateTime'];
  objectNameSingular: Scalars['String'];
  record: Scalars['JSON'];
  updatedFields?: Maybe<Array<Scalars['String']>>;
};

/** Onboarding status */
export enum OnboardingStatus {
  BOOK_ONBOARDING = 'BOOK_ONBOARDING',
  COMPLETED = 'COMPLETED',
  INVITE_TEAM = 'INVITE_TEAM',
  PLAN_REQUIRED = 'PLAN_REQUIRED',
  PROFILE_CREATION = 'PROFILE_CREATION',
  SYNC_EMAIL = 'SYNC_EMAIL',
  WORKSPACE_ACTIVATION = 'WORKSPACE_ACTIVATION'
}

export type OnboardingStepSuccess = {
  __typename?: 'OnboardingStepSuccess';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** The cursor of the last returned record. */
  endCursor?: Maybe<Scalars['ConnectionCursor']>;
  /** true if paging forward and there are more records. */
  hasNextPage?: Maybe<Scalars['Boolean']>;
  /** true if paging backwards and there are more records. */
  hasPreviousPage?: Maybe<Scalars['Boolean']>;
  /** The cursor of the first returned record. */
  startCursor?: Maybe<Scalars['ConnectionCursor']>;
};

export type PageLayout = {
  __typename?: 'PageLayout';
  createdAt: Scalars['DateTime'];
  defaultTabToFocusOnMobileAndSidePanelId?: Maybe<Scalars['UUID']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['UUID'];
  name: Scalars['String'];
  objectMetadataId?: Maybe<Scalars['UUID']>;
  tabs?: Maybe<Array<PageLayoutTab>>;
  type: PageLayoutType;
  updatedAt: Scalars['DateTime'];
};

export type PageLayoutTab = {
  __typename?: 'PageLayoutTab';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  layoutMode?: Maybe<PageLayoutTabLayoutMode>;
  pageLayoutId: Scalars['UUID'];
  position: Scalars['Float'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  widgets?: Maybe<Array<PageLayoutWidget>>;
};

export enum PageLayoutTabLayoutMode {
  CANVAS = 'CANVAS',
  GRID = 'GRID',
  VERTICAL_LIST = 'VERTICAL_LIST'
}

export enum PageLayoutType {
  DASHBOARD = 'DASHBOARD',
  RECORD_INDEX = 'RECORD_INDEX',
  RECORD_PAGE = 'RECORD_PAGE'
}

export type PageLayoutWidget = {
  __typename?: 'PageLayoutWidget';
  conditionalDisplay?: Maybe<Scalars['JSON']>;
  configuration: WidgetConfiguration;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  gridPosition: GridPosition;
  id: Scalars['UUID'];
  objectMetadataId?: Maybe<Scalars['UUID']>;
  pageLayoutTabId: Scalars['UUID'];
  position?: Maybe<PageLayoutWidgetPosition>;
  title: Scalars['String'];
  type: WidgetType;
  updatedAt: Scalars['DateTime'];
};

export type PageLayoutWidgetCanvasPosition = {
  __typename?: 'PageLayoutWidgetCanvasPosition';
  layoutMode: PageLayoutTabLayoutMode;
};

export type PageLayoutWidgetGridPosition = {
  __typename?: 'PageLayoutWidgetGridPosition';
  column: Scalars['Int'];
  columnSpan: Scalars['Int'];
  layoutMode: PageLayoutTabLayoutMode;
  row: Scalars['Int'];
  rowSpan: Scalars['Int'];
};

export type PageLayoutWidgetPosition = PageLayoutWidgetCanvasPosition | PageLayoutWidgetGridPosition | PageLayoutWidgetVerticalListPosition;

export type PageLayoutWidgetVerticalListPosition = {
  __typename?: 'PageLayoutWidgetVerticalListPosition';
  index: Scalars['Int'];
  layoutMode: PageLayoutTabLayoutMode;
};

export type PermissionFlag = {
  __typename?: 'PermissionFlag';
  flag: PermissionFlagType;
  id: Scalars['UUID'];
  roleId: Scalars['UUID'];
};

export enum PermissionFlagType {
  AI = 'AI',
  AI_SETTINGS = 'AI_SETTINGS',
  API_KEYS_AND_WEBHOOKS = 'API_KEYS_AND_WEBHOOKS',
  APPLICATIONS = 'APPLICATIONS',
  BILLING = 'BILLING',
  CODE_INTERPRETER_TOOL = 'CODE_INTERPRETER_TOOL',
  CONNECTED_ACCOUNTS = 'CONNECTED_ACCOUNTS',
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
  aggregateFieldMetadataId: Scalars['UUID'];
  aggregateOperation: AggregateOperations;
  color?: Maybe<Scalars['String']>;
  configurationType: WidgetConfigurationType;
  dateGranularity?: Maybe<ObjectRecordGroupByDateGranularity>;
  description?: Maybe<Scalars['String']>;
  displayDataLabel?: Maybe<Scalars['Boolean']>;
  displayLegend?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Scalars['JSON']>;
  firstDayOfTheWeek?: Maybe<Scalars['Int']>;
  groupByFieldMetadataId: Scalars['UUID'];
  groupBySubFieldName?: Maybe<Scalars['String']>;
  hideEmptyCategory?: Maybe<Scalars['Boolean']>;
  manualSortOrder?: Maybe<Array<Scalars['String']>>;
  orderBy?: Maybe<GraphOrderBy>;
  showCenterMetric?: Maybe<Scalars['Boolean']>;
  timezone?: Maybe<Scalars['String']>;
};

export type PieChartDataItem = {
  __typename?: 'PieChartDataItem';
  id: Scalars['String'];
  value: Scalars['Float'];
};

export type PieChartDataOutput = {
  __typename?: 'PieChartDataOutput';
  data: Array<PieChartDataItem>;
  formattedToRawLookup: Scalars['JSON'];
  hasTooManyGroups: Scalars['Boolean'];
  showCenterMetric: Scalars['Boolean'];
  showDataLabels: Scalars['Boolean'];
  showLegend: Scalars['Boolean'];
};

export type PlaceDetailsResult = {
  __typename?: 'PlaceDetailsResult';
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  location?: Maybe<Location>;
  postcode?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
};

export type PostgresCredentials = {
  __typename?: 'PostgresCredentials';
  id: Scalars['UUID'];
  password: Scalars['String'];
  user: Scalars['String'];
  workspaceId: Scalars['UUID'];
};

export type PublicDomain = {
  __typename?: 'PublicDomain';
  createdAt: Scalars['DateTime'];
  domain: Scalars['String'];
  id: Scalars['UUID'];
  isValidated: Scalars['Boolean'];
};

export type PublicFeatureFlag = {
  __typename?: 'PublicFeatureFlag';
  key: FeatureFlagKey;
  metadata: PublicFeatureFlagMetadata;
};

export type PublicFeatureFlagMetadata = {
  __typename?: 'PublicFeatureFlagMetadata';
  description: Scalars['String'];
  imagePath?: Maybe<Scalars['String']>;
  label: Scalars['String'];
};

export type PublicWorkspaceDataOutput = {
  __typename?: 'PublicWorkspaceDataOutput';
  authBypassProviders?: Maybe<AuthBypassProviders>;
  authProviders: AuthProviders;
  displayName?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  logo?: Maybe<Scalars['String']>;
  workspaceUrls: WorkspaceUrls;
};

export type Query = {
  __typename?: 'Query';
  getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromOpportunityId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal;
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromOpportunityId: TimelineThreadsWithTotal;
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  search: SearchResultConnection;
};


export type QueryGetTimelineCalendarEventsFromCompanyIdArgs = {
  companyId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
};


export type QueryGetTimelineCalendarEventsFromOpportunityIdArgs = {
  opportunityId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
};


export type QueryGetTimelineCalendarEventsFromPersonIdArgs = {
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  personId: Scalars['UUID'];
};


export type QueryGetTimelineThreadsFromCompanyIdArgs = {
  companyId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
};


export type QueryGetTimelineThreadsFromOpportunityIdArgs = {
  opportunityId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
};


export type QueryGetTimelineThreadsFromPersonIdArgs = {
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  personId: Scalars['UUID'];
};


export type QuerySearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']>>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  searchInput: Scalars['String'];
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

export type RatioAggregateConfig = {
  __typename?: 'RatioAggregateConfig';
  fieldMetadataId: Scalars['UUID'];
  optionValue: Scalars['String'];
};

export type RecordIdentifier = {
  __typename?: 'RecordIdentifier';
  id: Scalars['UUID'];
  imageIdentifier?: Maybe<Scalars['String']>;
  labelIdentifier: Scalars['String'];
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

export type ResendEmailVerificationTokenOutput = {
  __typename?: 'ResendEmailVerificationTokenOutput';
  success: Scalars['Boolean'];
};

export type RetryJobsResponse = {
  __typename?: 'RetryJobsResponse';
  results: Array<JobOperationResult>;
  retriedCount: Scalars['Int'];
};

export type RichTextV2Body = {
  __typename?: 'RichTextV2Body';
  blocknote?: Maybe<Scalars['String']>;
  markdown?: Maybe<Scalars['String']>;
};

export type Role = {
  __typename?: 'Role';
  agents: Array<Agent>;
  apiKeys: Array<ApiKeyForRole>;
  canAccessAllTools: Scalars['Boolean'];
  canBeAssignedToAgents: Scalars['Boolean'];
  canBeAssignedToApiKeys: Scalars['Boolean'];
  canBeAssignedToUsers: Scalars['Boolean'];
  canDestroyAllObjectRecords: Scalars['Boolean'];
  canReadAllObjectRecords: Scalars['Boolean'];
  canSoftDeleteAllObjectRecords: Scalars['Boolean'];
  canUpdateAllObjectRecords: Scalars['Boolean'];
  canUpdateAllSettings: Scalars['Boolean'];
  description?: Maybe<Scalars['String']>;
  fieldPermissions?: Maybe<Array<FieldPermission>>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  isEditable: Scalars['Boolean'];
  label: Scalars['String'];
  objectPermissions?: Maybe<Array<ObjectPermission>>;
  permissionFlags?: Maybe<Array<PermissionFlag>>;
  rowLevelPermissionPredicateGroups?: Maybe<Array<RowLevelPermissionPredicateGroup>>;
  rowLevelPermissionPredicates?: Maybe<Array<RowLevelPermissionPredicate>>;
  universalIdentifier?: Maybe<Scalars['UUID']>;
  workspaceMembers: Array<WorkspaceMember>;
};

export type RowLevelPermissionPredicate = {
  __typename?: 'RowLevelPermissionPredicate';
  fieldMetadataId: Scalars['String'];
  id: Scalars['String'];
  objectMetadataId: Scalars['String'];
  operand: RowLevelPermissionPredicateOperand;
  positionInRowLevelPermissionPredicateGroup?: Maybe<Scalars['Float']>;
  roleId: Scalars['String'];
  rowLevelPermissionPredicateGroupId?: Maybe<Scalars['String']>;
  subFieldName?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['JSON']>;
  workspaceMemberFieldMetadataId?: Maybe<Scalars['String']>;
  workspaceMemberSubFieldName?: Maybe<Scalars['String']>;
};

export type RowLevelPermissionPredicateGroup = {
  __typename?: 'RowLevelPermissionPredicateGroup';
  id: Scalars['String'];
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  objectMetadataId: Scalars['String'];
  parentRowLevelPermissionPredicateGroupId?: Maybe<Scalars['String']>;
  positionInRowLevelPermissionPredicateGroup?: Maybe<Scalars['Float']>;
  roleId: Scalars['String'];
};

export enum RowLevelPermissionPredicateGroupLogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

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

export type RunWorkflowVersionInput = {
  /** Execution result in JSON format */
  payload?: InputMaybe<Scalars['JSON']>;
  /** Workflow run ID */
  workflowRunId?: InputMaybe<Scalars['UUID']>;
  /** Workflow version ID */
  workflowVersionId: Scalars['UUID'];
};

export type RunWorkflowVersionOutput = {
  __typename?: 'RunWorkflowVersionOutput';
  workflowRunId: Scalars['UUID'];
};

export type SsoConnection = {
  __typename?: 'SSOConnection';
  id: Scalars['UUID'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type SsoIdentityProvider = {
  __typename?: 'SSOIdentityProvider';
  id: Scalars['UUID'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export enum SsoIdentityProviderStatus {
  Active = 'Active',
  Error = 'Error',
  Inactive = 'Inactive'
}

export type SearchRecord = {
  __typename?: 'SearchRecord';
  imageUrl?: Maybe<Scalars['String']>;
  label: Scalars['String'];
  objectLabelSingular: Scalars['String'];
  objectNameSingular: Scalars['String'];
  recordId: Scalars['UUID'];
  tsRank: Scalars['Float'];
  tsRankCD: Scalars['Float'];
};

export type SearchResultConnection = {
  __typename?: 'SearchResultConnection';
  edges: Array<SearchResultEdge>;
  pageInfo: SearchResultPageInfo;
};

export type SearchResultEdge = {
  __typename?: 'SearchResultEdge';
  cursor: Scalars['String'];
  node: SearchRecord;
};

export type SearchResultPageInfo = {
  __typename?: 'SearchResultPageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
};

export type SendInvitationsOutput = {
  __typename?: 'SendInvitationsOutput';
  errors: Array<Scalars['String']>;
  result: Array<WorkspaceInvitation>;
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type Sentry = {
  __typename?: 'Sentry';
  dsn?: Maybe<Scalars['String']>;
  environment?: Maybe<Scalars['String']>;
  release?: Maybe<Scalars['String']>;
};

export type SetupSsoOutput = {
  __typename?: 'SetupSsoOutput';
  id: Scalars['UUID'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type SignUpOutput = {
  __typename?: 'SignUpOutput';
  loginToken: AuthToken;
  workspace: WorkspaceUrlsAndId;
};

export type SignedFile = {
  __typename?: 'SignedFile';
  path: Scalars['String'];
  token: Scalars['String'];
};

export type Skill = {
  __typename?: 'Skill';
  applicationId?: Maybe<Scalars['UUID']>;
  content: Scalars['String'];
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  isActive: Scalars['Boolean'];
  isCustom: Scalars['Boolean'];
  label: Scalars['String'];
  name: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type StandaloneRichTextConfiguration = {
  __typename?: 'StandaloneRichTextConfiguration';
  body: RichTextV2Body;
  configurationType: WidgetConfigurationType;
};

export type StandardOverrides = {
  __typename?: 'StandardOverrides';
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  translations?: Maybe<Scalars['JSON']>;
};

export type SubmitFormStepInput = {
  /** Form response in JSON format */
  response: Scalars['JSON'];
  /** Workflow step ID */
  stepId: Scalars['UUID'];
  /** Workflow run ID */
  workflowRunId: Scalars['UUID'];
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
  supportFrontChatId?: Maybe<Scalars['String']>;
};

export enum SupportDriver {
  FRONT = 'FRONT',
  NONE = 'NONE'
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

export type TasksConfiguration = {
  __typename?: 'TasksConfiguration';
  configurationType: WidgetConfigurationType;
};

export type TestHttpRequestInput = {
  /** Request body */
  body?: InputMaybe<Scalars['JSON']>;
  /** HTTP headers */
  headers?: InputMaybe<Scalars['JSON']>;
  /** HTTP method */
  method: Scalars['String'];
  /** URL to make the request to */
  url: Scalars['String'];
};

export type TestHttpRequestOutput = {
  __typename?: 'TestHttpRequestOutput';
  /** Error information */
  error?: Maybe<Scalars['JSON']>;
  /** Response headers */
  headers?: Maybe<Scalars['JSON']>;
  /** Message describing the result */
  message: Scalars['String'];
  /** Response data */
  result?: Maybe<Scalars['JSON']>;
  /** HTTP status code */
  status?: Maybe<Scalars['Float']>;
  /** HTTP status text */
  statusText?: Maybe<Scalars['String']>;
  /** Whether the request was successful */
  success: Scalars['Boolean'];
};

export type TimelineCalendarEvent = {
  __typename?: 'TimelineCalendarEvent';
  conferenceLink: LinksMetadata;
  conferenceSolution: Scalars['String'];
  description: Scalars['String'];
  endsAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  isCanceled: Scalars['Boolean'];
  isFullDay: Scalars['Boolean'];
  location: Scalars['String'];
  participants: Array<TimelineCalendarEventParticipant>;
  startsAt: Scalars['DateTime'];
  title: Scalars['String'];
  visibility: CalendarChannelVisibility;
};

export type TimelineCalendarEventParticipant = {
  __typename?: 'TimelineCalendarEventParticipant';
  avatarUrl: Scalars['String'];
  displayName: Scalars['String'];
  firstName: Scalars['String'];
  handle: Scalars['String'];
  lastName: Scalars['String'];
  personId?: Maybe<Scalars['UUID']>;
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

export type TimelineCalendarEventsWithTotal = {
  __typename?: 'TimelineCalendarEventsWithTotal';
  timelineCalendarEvents: Array<TimelineCalendarEvent>;
  totalNumberOfCalendarEvents: Scalars['Int'];
};

export type TimelineConfiguration = {
  __typename?: 'TimelineConfiguration';
  configurationType: WidgetConfigurationType;
};

export type TimelineThread = {
  __typename?: 'TimelineThread';
  firstParticipant: TimelineThreadParticipant;
  id: Scalars['UUID'];
  lastMessageBody: Scalars['String'];
  lastMessageReceivedAt: Scalars['DateTime'];
  lastTwoParticipants: Array<TimelineThreadParticipant>;
  numberOfMessagesInThread: Scalars['Float'];
  participantCount: Scalars['Float'];
  read: Scalars['Boolean'];
  subject: Scalars['String'];
  visibility: MessageChannelVisibility;
};

export type TimelineThreadParticipant = {
  __typename?: 'TimelineThreadParticipant';
  avatarUrl: Scalars['String'];
  displayName: Scalars['String'];
  firstName: Scalars['String'];
  handle: Scalars['String'];
  lastName: Scalars['String'];
  personId?: Maybe<Scalars['UUID']>;
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

export type TimelineThreadsWithTotal = {
  __typename?: 'TimelineThreadsWithTotal';
  timelineThreads: Array<TimelineThread>;
  totalNumberOfThreads: Scalars['Int'];
};

export type ToolIndexEntry = {
  __typename?: 'ToolIndexEntry';
  category: Scalars['String'];
  description: Scalars['String'];
  inputSchema?: Maybe<Scalars['JSON']>;
  name: Scalars['String'];
  objectName?: Maybe<Scalars['String']>;
};

export type TransientTokenOutput = {
  __typename?: 'TransientTokenOutput';
  transientToken: AuthToken;
};

export type TwoFactorAuthenticationMethodDto = {
  __typename?: 'TwoFactorAuthenticationMethodDTO';
  status: Scalars['String'];
  strategy: Scalars['String'];
  twoFactorAuthenticationMethodId: Scalars['UUID'];
};

export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']>;
  gt?: InputMaybe<Scalars['UUID']>;
  gte?: InputMaybe<Scalars['UUID']>;
  in?: InputMaybe<Array<Scalars['UUID']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['UUID']>;
  lte?: InputMaybe<Scalars['UUID']>;
  neq?: InputMaybe<Scalars['UUID']>;
};

export type UuidFilterComparison = {
  eq?: InputMaybe<Scalars['UUID']>;
  gt?: InputMaybe<Scalars['UUID']>;
  gte?: InputMaybe<Scalars['UUID']>;
  iLike?: InputMaybe<Scalars['UUID']>;
  in?: InputMaybe<Array<Scalars['UUID']>>;
  is?: InputMaybe<Scalars['Boolean']>;
  isNot?: InputMaybe<Scalars['Boolean']>;
  like?: InputMaybe<Scalars['UUID']>;
  lt?: InputMaybe<Scalars['UUID']>;
  lte?: InputMaybe<Scalars['UUID']>;
  neq?: InputMaybe<Scalars['UUID']>;
  notILike?: InputMaybe<Scalars['UUID']>;
  notIn?: InputMaybe<Array<Scalars['UUID']>>;
  notLike?: InputMaybe<Scalars['UUID']>;
};

export type UpdateWorkflowRunStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON'];
  /** Workflow run ID */
  workflowRunId: Scalars['UUID'];
};

export type UpdateWorkflowVersionPositionsInput = {
  /** Workflow version updated positions */
  positions: Array<WorkflowStepPositionUpdateInput>;
  /** Workflow version ID */
  workflowVersionId: Scalars['UUID'];
};

export type UpdateWorkflowVersionStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON'];
  /** Workflow version ID */
  workflowVersionId: Scalars['UUID'];
};

export type UpsertRowLevelPermissionPredicatesResult = {
  __typename?: 'UpsertRowLevelPermissionPredicatesResult';
  predicateGroups: Array<RowLevelPermissionPredicateGroup>;
  predicates: Array<RowLevelPermissionPredicate>;
};

export type User = {
  __typename?: 'User';
  availableWorkspaces: AvailableWorkspaces;
  canAccessFullAdminPanel: Scalars['Boolean'];
  canImpersonate: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  currentUserWorkspace?: Maybe<UserWorkspace>;
  currentWorkspace?: Maybe<Workspace>;
  defaultAvatarUrl?: Maybe<Scalars['String']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  deletedWorkspaceMembers?: Maybe<Array<DeletedWorkspaceMember>>;
  disabled?: Maybe<Scalars['Boolean']>;
  email: Scalars['String'];
  firstName: Scalars['String'];
  hasPassword: Scalars['Boolean'];
  id: Scalars['UUID'];
  isEmailVerified: Scalars['Boolean'];
  lastName: Scalars['String'];
  locale: Scalars['String'];
  onboardingStatus?: Maybe<OnboardingStatus>;
  passwordHash?: Maybe<Scalars['String']>;
  supportUserHash?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  userVars?: Maybe<Scalars['JSONObject']>;
  userWorkspaces: Array<UserWorkspace>;
  workspaceMember?: Maybe<WorkspaceMember>;
  workspaceMembers?: Maybe<Array<WorkspaceMember>>;
  workspaces: Array<UserWorkspace>;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the User */
  node: User;
};

export type UserInfo = {
  __typename?: 'UserInfo';
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  lastName?: Maybe<Scalars['String']>;
};

export type UserLookup = {
  __typename?: 'UserLookup';
  user: UserInfo;
  workspaces: Array<WorkspaceInfo>;
};

export type UserWorkspace = {
  __typename?: 'UserWorkspace';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['UUID'];
  locale: Scalars['String'];
  objectPermissions?: Maybe<Array<ObjectPermission>>;
  objectsPermissions?: Maybe<Array<ObjectPermission>>;
  permissionFlags?: Maybe<Array<PermissionFlagType>>;
  twoFactorAuthenticationMethodSummary?: Maybe<Array<TwoFactorAuthenticationMethodDto>>;
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['UUID'];
};

export type ValidatePasswordResetTokenOutput = {
  __typename?: 'ValidatePasswordResetTokenOutput';
  email: Scalars['String'];
  hasPassword: Scalars['Boolean'];
  id: Scalars['UUID'];
};

export type VerificationRecord = {
  __typename?: 'VerificationRecord';
  key: Scalars['String'];
  priority?: Maybe<Scalars['Float']>;
  type: Scalars['String'];
  value: Scalars['String'];
};

export type VerifyEmailAndGetLoginTokenOutput = {
  __typename?: 'VerifyEmailAndGetLoginTokenOutput';
  loginToken: AuthToken;
  workspaceUrls: WorkspaceUrls;
};

export type VerifyTwoFactorAuthenticationMethodOutput = {
  __typename?: 'VerifyTwoFactorAuthenticationMethodOutput';
  success: Scalars['Boolean'];
};

export type VersionInfo = {
  __typename?: 'VersionInfo';
  currentVersion?: Maybe<Scalars['String']>;
  latestVersion: Scalars['String'];
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

export enum ViewKey {
  INDEX = 'INDEX'
}

export enum ViewOpenRecordIn {
  RECORD_PAGE = 'RECORD_PAGE',
  SIDE_PANEL = 'SIDE_PANEL'
}

export enum ViewSortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum ViewType {
  CALENDAR = 'CALENDAR',
  KANBAN = 'KANBAN',
  TABLE = 'TABLE'
}

export enum ViewVisibility {
  UNLISTED = 'UNLISTED',
  WORKSPACE = 'WORKSPACE'
}

export type Webhook = {
  __typename?: 'Webhook';
  applicationId: Scalars['UUID'];
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  operations: Array<Scalars['String']>;
  secret: Scalars['String'];
  targetUrl: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type WidgetConfiguration = AggregateChartConfiguration | BarChartConfiguration | CalendarConfiguration | EmailsConfiguration | FieldConfiguration | FieldRichTextConfiguration | FieldsConfiguration | FilesConfiguration | FrontComponentConfiguration | GaugeChartConfiguration | IframeConfiguration | LineChartConfiguration | NotesConfiguration | PieChartConfiguration | StandaloneRichTextConfiguration | TasksConfiguration | TimelineConfiguration | ViewConfiguration | WorkflowConfiguration | WorkflowRunConfiguration | WorkflowVersionConfiguration;

export enum WidgetConfigurationType {
  AGGREGATE_CHART = 'AGGREGATE_CHART',
  BAR_CHART = 'BAR_CHART',
  CALENDAR = 'CALENDAR',
  EMAILS = 'EMAILS',
  FIELD = 'FIELD',
  FIELDS = 'FIELDS',
  FIELD_RICH_TEXT = 'FIELD_RICH_TEXT',
  FILES = 'FILES',
  FRONT_COMPONENT = 'FRONT_COMPONENT',
  GAUGE_CHART = 'GAUGE_CHART',
  IFRAME = 'IFRAME',
  LINE_CHART = 'LINE_CHART',
  NOTES = 'NOTES',
  PIE_CHART = 'PIE_CHART',
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
  EMAILS = 'EMAILS',
  FIELD = 'FIELD',
  FIELDS = 'FIELDS',
  FIELD_RICH_TEXT = 'FIELD_RICH_TEXT',
  FILES = 'FILES',
  FRONT_COMPONENT = 'FRONT_COMPONENT',
  GRAPH = 'GRAPH',
  IFRAME = 'IFRAME',
  NOTES = 'NOTES',
  STANDALONE_RICH_TEXT = 'STANDALONE_RICH_TEXT',
  TASKS = 'TASKS',
  TIMELINE = 'TIMELINE',
  VIEW = 'VIEW',
  WORKFLOW = 'WORKFLOW',
  WORKFLOW_RUN = 'WORKFLOW_RUN',
  WORKFLOW_VERSION = 'WORKFLOW_VERSION'
}

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

export type WorkflowAction = {
  __typename?: 'WorkflowAction';
  id: Scalars['UUID'];
  name: Scalars['String'];
  nextStepIds?: Maybe<Array<Scalars['UUID']>>;
  position?: Maybe<WorkflowStepPosition>;
  settings: Scalars['JSON'];
  type: WorkflowActionType;
  valid: Scalars['Boolean'];
};

export enum WorkflowActionType {
  AI_AGENT = 'AI_AGENT',
  CODE = 'CODE',
  CREATE_RECORD = 'CREATE_RECORD',
  DELAY = 'DELAY',
  DELETE_RECORD = 'DELETE_RECORD',
  EMPTY = 'EMPTY',
  FILTER = 'FILTER',
  FIND_RECORDS = 'FIND_RECORDS',
  FORM = 'FORM',
  HTTP_REQUEST = 'HTTP_REQUEST',
  IF_ELSE = 'IF_ELSE',
  ITERATOR = 'ITERATOR',
  LOGIC_FUNCTION = 'LOGIC_FUNCTION',
  SEND_EMAIL = 'SEND_EMAIL',
  UPDATE_RECORD = 'UPDATE_RECORD',
  UPSERT_RECORD = 'UPSERT_RECORD'
}

export type WorkflowConfiguration = {
  __typename?: 'WorkflowConfiguration';
  configurationType: WidgetConfigurationType;
};

export type WorkflowRun = {
  __typename?: 'WorkflowRun';
  id: Scalars['UUID'];
  status: WorkflowRunStatusEnum;
};

export type WorkflowRunConfiguration = {
  __typename?: 'WorkflowRunConfiguration';
  configurationType: WidgetConfigurationType;
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
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type WorkflowStepPositionInput = {
  x: Scalars['Float'];
  y: Scalars['Float'];
};

export type WorkflowStepPositionUpdateInput = {
  /** Step or trigger ID */
  id: Scalars['String'];
  /** Position of the step or trigger */
  position: WorkflowStepPositionInput;
};

export type WorkflowVersionConfiguration = {
  __typename?: 'WorkflowVersionConfiguration';
  configurationType: WidgetConfigurationType;
};

export type WorkflowVersionDto = {
  __typename?: 'WorkflowVersionDTO';
  createdAt: Scalars['String'];
  id: Scalars['UUID'];
  name: Scalars['String'];
  status: Scalars['String'];
  steps?: Maybe<Scalars['JSON']>;
  trigger?: Maybe<Scalars['JSON']>;
  updatedAt: Scalars['String'];
  workflowId: Scalars['UUID'];
};

export type WorkflowVersionStepChanges = {
  __typename?: 'WorkflowVersionStepChanges';
  stepsDiff?: Maybe<Scalars['JSON']>;
  triggerDiff?: Maybe<Scalars['JSON']>;
};

export type Workspace = {
  __typename?: 'Workspace';
  activationStatus: WorkspaceActivationStatus;
  aiAdditionalInstructions?: Maybe<Scalars['String']>;
  allowImpersonation: Scalars['Boolean'];
  billingEntitlements: Array<BillingEntitlement>;
  billingSubscriptions: Array<BillingSubscription>;
  createdAt: Scalars['DateTime'];
  currentBillingSubscription?: Maybe<BillingSubscription>;
  customDomain?: Maybe<Scalars['String']>;
  databaseSchema: Scalars['String'];
  databaseUrl: Scalars['String'];
  defaultRole?: Maybe<Role>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  displayName?: Maybe<Scalars['String']>;
  editableProfileFields?: Maybe<Array<Scalars['String']>>;
  eventLogRetentionDays: Scalars['Float'];
  fastModel: Scalars['String'];
  featureFlags?: Maybe<Array<FeatureFlagDto>>;
  hasValidEnterpriseKey: Scalars['Boolean'];
  id: Scalars['UUID'];
  inviteHash?: Maybe<Scalars['String']>;
  isCustomDomainEnabled: Scalars['Boolean'];
  isGoogleAuthBypassEnabled: Scalars['Boolean'];
  isGoogleAuthEnabled: Scalars['Boolean'];
  isMicrosoftAuthBypassEnabled: Scalars['Boolean'];
  isMicrosoftAuthEnabled: Scalars['Boolean'];
  isPasswordAuthBypassEnabled: Scalars['Boolean'];
  isPasswordAuthEnabled: Scalars['Boolean'];
  isPublicInviteLinkEnabled: Scalars['Boolean'];
  isTwoFactorAuthenticationEnforced: Scalars['Boolean'];
  logo?: Maybe<Scalars['String']>;
  metadataVersion: Scalars['Float'];
  routerModel: Scalars['String'];
  smartModel: Scalars['String'];
  subdomain: Scalars['String'];
  trashRetentionDays: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
  version?: Maybe<Scalars['String']>;
  viewFields?: Maybe<Array<CoreViewField>>;
  viewFilterGroups?: Maybe<Array<CoreViewFilterGroup>>;
  viewFilters?: Maybe<Array<CoreViewFilter>>;
  viewGroups?: Maybe<Array<CoreViewGroup>>;
  viewSorts?: Maybe<Array<CoreViewSort>>;
  views?: Maybe<Array<CoreView>>;
  workspaceCustomApplication?: Maybe<Application>;
  workspaceCustomApplicationId: Scalars['String'];
  workspaceMembersCount?: Maybe<Scalars['Float']>;
  workspaceUrls: WorkspaceUrls;
};

export enum WorkspaceActivationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ONGOING_CREATION = 'ONGOING_CREATION',
  PENDING_CREATION = 'PENDING_CREATION',
  SUSPENDED = 'SUSPENDED'
}

export type WorkspaceEdge = {
  __typename?: 'WorkspaceEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the Workspace */
  node: Workspace;
};

export type WorkspaceInfo = {
  __typename?: 'WorkspaceInfo';
  allowImpersonation: Scalars['Boolean'];
  featureFlags: Array<FeatureFlag>;
  id: Scalars['UUID'];
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  totalUsers: Scalars['Float'];
  users: Array<UserInfo>;
  workspaceUrls: WorkspaceUrls;
};

export type WorkspaceInvitation = {
  __typename?: 'WorkspaceInvitation';
  email: Scalars['String'];
  expiresAt: Scalars['DateTime'];
  id: Scalars['UUID'];
};

export type WorkspaceInviteHashValidOutput = {
  __typename?: 'WorkspaceInviteHashValidOutput';
  isValid: Scalars['Boolean'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']>;
  calendarStartDay?: Maybe<Scalars['Int']>;
  colorScheme: Scalars['String'];
  dateFormat?: Maybe<WorkspaceMemberDateFormatEnum>;
  id: Scalars['UUID'];
  locale?: Maybe<Scalars['String']>;
  name: FullName;
  numberFormat?: Maybe<WorkspaceMemberNumberFormatEnum>;
  roles?: Maybe<Array<Role>>;
  timeFormat?: Maybe<WorkspaceMemberTimeFormatEnum>;
  timeZone?: Maybe<Scalars['String']>;
  userEmail: Scalars['String'];
  userWorkspaceId?: Maybe<Scalars['UUID']>;
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

export type WorkspaceNameAndId = {
  __typename?: 'WorkspaceNameAndId';
  displayName?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
};

export type WorkspaceUrls = {
  __typename?: 'WorkspaceUrls';
  customUrl?: Maybe<Scalars['String']>;
  subdomainUrl: Scalars['String'];
};

export type WorkspaceUrlsAndId = {
  __typename?: 'WorkspaceUrlsAndId';
  id: Scalars['UUID'];
  workspaceUrls: WorkspaceUrls;
};

export type TimelineCalendarEventFragmentFragment = { __typename?: 'TimelineCalendarEvent', id: any, title: string, description: string, location: string, startsAt: string, endsAt: string, isFullDay: boolean, visibility: CalendarChannelVisibility, participants: Array<{ __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> };

export type TimelineCalendarEventParticipantFragmentFragment = { __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string };

export type TimelineCalendarEventsWithTotalFragmentFragment = { __typename?: 'TimelineCalendarEventsWithTotal', totalNumberOfCalendarEvents: number, timelineCalendarEvents: Array<{ __typename?: 'TimelineCalendarEvent', id: any, title: string, description: string, location: string, startsAt: string, endsAt: string, isFullDay: boolean, visibility: CalendarChannelVisibility, participants: Array<{ __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> };

export type GetTimelineCalendarEventsFromCompanyIdQueryVariables = Exact<{
  companyId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineCalendarEventsFromCompanyIdQuery = { __typename?: 'Query', getTimelineCalendarEventsFromCompanyId: { __typename?: 'TimelineCalendarEventsWithTotal', totalNumberOfCalendarEvents: number, timelineCalendarEvents: Array<{ __typename?: 'TimelineCalendarEvent', id: any, title: string, description: string, location: string, startsAt: string, endsAt: string, isFullDay: boolean, visibility: CalendarChannelVisibility, participants: Array<{ __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> } };

export type GetTimelineCalendarEventsFromOpportunityIdQueryVariables = Exact<{
  opportunityId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineCalendarEventsFromOpportunityIdQuery = { __typename?: 'Query', getTimelineCalendarEventsFromOpportunityId: { __typename?: 'TimelineCalendarEventsWithTotal', totalNumberOfCalendarEvents: number, timelineCalendarEvents: Array<{ __typename?: 'TimelineCalendarEvent', id: any, title: string, description: string, location: string, startsAt: string, endsAt: string, isFullDay: boolean, visibility: CalendarChannelVisibility, participants: Array<{ __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> } };

export type GetTimelineCalendarEventsFromPersonIdQueryVariables = Exact<{
  personId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineCalendarEventsFromPersonIdQuery = { __typename?: 'Query', getTimelineCalendarEventsFromPersonId: { __typename?: 'TimelineCalendarEventsWithTotal', totalNumberOfCalendarEvents: number, timelineCalendarEvents: Array<{ __typename?: 'TimelineCalendarEvent', id: any, title: string, description: string, location: string, startsAt: string, endsAt: string, isFullDay: boolean, visibility: CalendarChannelVisibility, participants: Array<{ __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> } };

export type ParticipantFragmentFragment = { __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string };

export type TimelineThreadFragmentFragment = { __typename?: 'TimelineThread', id: any, read: boolean, visibility: MessageChannelVisibility, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> };

export type TimelineThreadsWithTotalFragmentFragment = { __typename?: 'TimelineThreadsWithTotal', totalNumberOfThreads: number, timelineThreads: Array<{ __typename?: 'TimelineThread', id: any, read: boolean, visibility: MessageChannelVisibility, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> };

export type GetTimelineThreadsFromCompanyIdQueryVariables = Exact<{
  companyId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineThreadsFromCompanyIdQuery = { __typename?: 'Query', getTimelineThreadsFromCompanyId: { __typename?: 'TimelineThreadsWithTotal', totalNumberOfThreads: number, timelineThreads: Array<{ __typename?: 'TimelineThread', id: any, read: boolean, visibility: MessageChannelVisibility, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> } };

export type GetTimelineThreadsFromOpportunityIdQueryVariables = Exact<{
  opportunityId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineThreadsFromOpportunityIdQuery = { __typename?: 'Query', getTimelineThreadsFromOpportunityId: { __typename?: 'TimelineThreadsWithTotal', totalNumberOfThreads: number, timelineThreads: Array<{ __typename?: 'TimelineThread', id: any, read: boolean, visibility: MessageChannelVisibility, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> } };

export type GetTimelineThreadsFromPersonIdQueryVariables = Exact<{
  personId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineThreadsFromPersonIdQuery = { __typename?: 'Query', getTimelineThreadsFromPersonId: { __typename?: 'TimelineThreadsWithTotal', totalNumberOfThreads: number, timelineThreads: Array<{ __typename?: 'TimelineThread', id: any, read: boolean, visibility: MessageChannelVisibility, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> } };

export type SearchQueryVariables = Exact<{
  searchInput: Scalars['String'];
  limit: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
}>;


export type SearchQuery = { __typename?: 'Query', search: { __typename?: 'SearchResultConnection', edges: Array<{ __typename?: 'SearchResultEdge', cursor: string, node: { __typename?: 'SearchRecord', recordId: any, objectNameSingular: string, objectLabelSingular: string, label: string, imageUrl?: string | null, tsRankCD: number, tsRank: number } }>, pageInfo: { __typename?: 'SearchResultPageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type WorkflowDiffFragmentFragment = { __typename?: 'WorkflowVersionStepChanges', triggerDiff?: any | null, stepsDiff?: any | null };

export type ActivateWorkflowVersionMutationVariables = Exact<{
  workflowVersionId: Scalars['UUID'];
}>;


export type ActivateWorkflowVersionMutation = { __typename?: 'Mutation', activateWorkflowVersion: boolean };

export type ComputeStepOutputSchemaMutationVariables = Exact<{
  input: ComputeStepOutputSchemaInput;
}>;


export type ComputeStepOutputSchemaMutation = { __typename?: 'Mutation', computeStepOutputSchema: any };

export type CreateDraftFromWorkflowVersionMutationVariables = Exact<{
  input: CreateDraftFromWorkflowVersionInput;
}>;


export type CreateDraftFromWorkflowVersionMutation = { __typename?: 'Mutation', createDraftFromWorkflowVersion: { __typename?: 'WorkflowVersionDTO', id: any, name: string, status: string, trigger?: any | null, steps?: any | null, createdAt: string, updatedAt: string } };

export type CreateWorkflowVersionEdgeMutationVariables = Exact<{
  input: CreateWorkflowVersionEdgeInput;
}>;


export type CreateWorkflowVersionEdgeMutation = { __typename?: 'Mutation', createWorkflowVersionEdge: { __typename?: 'WorkflowVersionStepChanges', triggerDiff?: any | null, stepsDiff?: any | null } };

export type CreateWorkflowVersionStepMutationVariables = Exact<{
  input: CreateWorkflowVersionStepInput;
}>;


export type CreateWorkflowVersionStepMutation = { __typename?: 'Mutation', createWorkflowVersionStep: { __typename?: 'WorkflowVersionStepChanges', triggerDiff?: any | null, stepsDiff?: any | null } };

export type DeactivateWorkflowVersionMutationVariables = Exact<{
  workflowVersionId: Scalars['UUID'];
}>;


export type DeactivateWorkflowVersionMutation = { __typename?: 'Mutation', deactivateWorkflowVersion: boolean };

export type DeleteWorkflowVersionEdgeMutationVariables = Exact<{
  input: CreateWorkflowVersionEdgeInput;
}>;


export type DeleteWorkflowVersionEdgeMutation = { __typename?: 'Mutation', deleteWorkflowVersionEdge: { __typename?: 'WorkflowVersionStepChanges', triggerDiff?: any | null, stepsDiff?: any | null } };

export type DeleteWorkflowVersionStepMutationVariables = Exact<{
  input: DeleteWorkflowVersionStepInput;
}>;


export type DeleteWorkflowVersionStepMutation = { __typename?: 'Mutation', deleteWorkflowVersionStep: { __typename?: 'WorkflowVersionStepChanges', triggerDiff?: any | null, stepsDiff?: any | null } };

export type DuplicateWorkflowMutationVariables = Exact<{
  input: DuplicateWorkflowInput;
}>;


export type DuplicateWorkflowMutation = { __typename?: 'Mutation', duplicateWorkflow: { __typename?: 'WorkflowVersionDTO', id: any, name: string, status: string, trigger?: any | null, steps?: any | null, createdAt: string, updatedAt: string, workflowId: any } };

export type DuplicateWorkflowVersionStepMutationVariables = Exact<{
  input: DuplicateWorkflowVersionStepInput;
}>;


export type DuplicateWorkflowVersionStepMutation = { __typename?: 'Mutation', duplicateWorkflowVersionStep: { __typename?: 'WorkflowVersionStepChanges', triggerDiff?: any | null, stepsDiff?: any | null } };

export type RunWorkflowVersionMutationVariables = Exact<{
  input: RunWorkflowVersionInput;
}>;


export type RunWorkflowVersionMutation = { __typename?: 'Mutation', runWorkflowVersion: { __typename?: 'RunWorkflowVersionOutput', workflowRunId: any } };

export type StopWorkflowRunMutationVariables = Exact<{
  workflowRunId: Scalars['UUID'];
}>;


export type StopWorkflowRunMutation = { __typename?: 'Mutation', stopWorkflowRun: { __typename: 'WorkflowRun', id: any, status: WorkflowRunStatusEnum } };

export type UpdateWorkflowRunStepMutationVariables = Exact<{
  input: UpdateWorkflowRunStepInput;
}>;


export type UpdateWorkflowRunStepMutation = { __typename?: 'Mutation', updateWorkflowRunStep: { __typename?: 'WorkflowAction', id: any, name: string, type: WorkflowActionType, settings: any, valid: boolean, nextStepIds?: Array<any> | null, position?: { __typename?: 'WorkflowStepPosition', x: number, y: number } | null } };

export type UpdateWorkflowVersionStepMutationVariables = Exact<{
  input: UpdateWorkflowVersionStepInput;
}>;


export type UpdateWorkflowVersionStepMutation = { __typename?: 'Mutation', updateWorkflowVersionStep: { __typename?: 'WorkflowAction', id: any, name: string, type: WorkflowActionType, settings: any, valid: boolean, nextStepIds?: Array<any> | null, position?: { __typename?: 'WorkflowStepPosition', x: number, y: number } | null } };

export type SubmitFormStepMutationVariables = Exact<{
  input: SubmitFormStepInput;
}>;


export type SubmitFormStepMutation = { __typename?: 'Mutation', submitFormStep: boolean };

export type TestHttpRequestMutationVariables = Exact<{
  input: TestHttpRequestInput;
}>;


export type TestHttpRequestMutation = { __typename?: 'Mutation', testHttpRequest: { __typename?: 'TestHttpRequestOutput', success: boolean, message: string, result?: any | null, error?: any | null, status?: number | null, statusText?: string | null, headers?: any | null } };

export type UpdateWorkflowVersionPositionsMutationVariables = Exact<{
  input: UpdateWorkflowVersionPositionsInput;
}>;


export type UpdateWorkflowVersionPositionsMutation = { __typename?: 'Mutation', updateWorkflowVersionPositions: boolean };

export const TimelineCalendarEventParticipantFragmentFragmentDoc = gql`
    fragment TimelineCalendarEventParticipantFragment on TimelineCalendarEventParticipant {
  personId
  workspaceMemberId
  firstName
  lastName
  displayName
  avatarUrl
  handle
}
    `;
export const TimelineCalendarEventFragmentFragmentDoc = gql`
    fragment TimelineCalendarEventFragment on TimelineCalendarEvent {
  id
  title
  description
  location
  startsAt
  endsAt
  isFullDay
  visibility
  participants {
    ...TimelineCalendarEventParticipantFragment
  }
}
    ${TimelineCalendarEventParticipantFragmentFragmentDoc}`;
export const TimelineCalendarEventsWithTotalFragmentFragmentDoc = gql`
    fragment TimelineCalendarEventsWithTotalFragment on TimelineCalendarEventsWithTotal {
  totalNumberOfCalendarEvents
  timelineCalendarEvents {
    ...TimelineCalendarEventFragment
  }
}
    ${TimelineCalendarEventFragmentFragmentDoc}`;
export const ParticipantFragmentFragmentDoc = gql`
    fragment ParticipantFragment on TimelineThreadParticipant {
  personId
  workspaceMemberId
  firstName
  lastName
  displayName
  avatarUrl
  handle
}
    `;
export const TimelineThreadFragmentFragmentDoc = gql`
    fragment TimelineThreadFragment on TimelineThread {
  id
  read
  visibility
  firstParticipant {
    ...ParticipantFragment
  }
  lastTwoParticipants {
    ...ParticipantFragment
  }
  lastMessageReceivedAt
  lastMessageBody
  subject
  numberOfMessagesInThread
  participantCount
}
    ${ParticipantFragmentFragmentDoc}`;
export const TimelineThreadsWithTotalFragmentFragmentDoc = gql`
    fragment TimelineThreadsWithTotalFragment on TimelineThreadsWithTotal {
  totalNumberOfThreads
  timelineThreads {
    ...TimelineThreadFragment
  }
}
    ${TimelineThreadFragmentFragmentDoc}`;
export const WorkflowDiffFragmentFragmentDoc = gql`
    fragment WorkflowDiffFragment on WorkflowVersionStepChanges {
  triggerDiff
  stepsDiff
}
    `;
export const GetTimelineCalendarEventsFromCompanyIdDocument = gql`
    query GetTimelineCalendarEventsFromCompanyId($companyId: UUID!, $page: Int!, $pageSize: Int!) {
  getTimelineCalendarEventsFromCompanyId(
    companyId: $companyId
    page: $page
    pageSize: $pageSize
  ) {
    ...TimelineCalendarEventsWithTotalFragment
  }
}
    ${TimelineCalendarEventsWithTotalFragmentFragmentDoc}`;

/**
 * __useGetTimelineCalendarEventsFromCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetTimelineCalendarEventsFromCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTimelineCalendarEventsFromCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTimelineCalendarEventsFromCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      page: // value for 'page'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetTimelineCalendarEventsFromCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<GetTimelineCalendarEventsFromCompanyIdQuery, GetTimelineCalendarEventsFromCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTimelineCalendarEventsFromCompanyIdQuery, GetTimelineCalendarEventsFromCompanyIdQueryVariables>(GetTimelineCalendarEventsFromCompanyIdDocument, options);
      }
export function useGetTimelineCalendarEventsFromCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTimelineCalendarEventsFromCompanyIdQuery, GetTimelineCalendarEventsFromCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTimelineCalendarEventsFromCompanyIdQuery, GetTimelineCalendarEventsFromCompanyIdQueryVariables>(GetTimelineCalendarEventsFromCompanyIdDocument, options);
        }
export type GetTimelineCalendarEventsFromCompanyIdQueryHookResult = ReturnType<typeof useGetTimelineCalendarEventsFromCompanyIdQuery>;
export type GetTimelineCalendarEventsFromCompanyIdLazyQueryHookResult = ReturnType<typeof useGetTimelineCalendarEventsFromCompanyIdLazyQuery>;
export type GetTimelineCalendarEventsFromCompanyIdQueryResult = Apollo.QueryResult<GetTimelineCalendarEventsFromCompanyIdQuery, GetTimelineCalendarEventsFromCompanyIdQueryVariables>;
export const GetTimelineCalendarEventsFromOpportunityIdDocument = gql`
    query GetTimelineCalendarEventsFromOpportunityId($opportunityId: UUID!, $page: Int!, $pageSize: Int!) {
  getTimelineCalendarEventsFromOpportunityId(
    opportunityId: $opportunityId
    page: $page
    pageSize: $pageSize
  ) {
    ...TimelineCalendarEventsWithTotalFragment
  }
}
    ${TimelineCalendarEventsWithTotalFragmentFragmentDoc}`;

/**
 * __useGetTimelineCalendarEventsFromOpportunityIdQuery__
 *
 * To run a query within a React component, call `useGetTimelineCalendarEventsFromOpportunityIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTimelineCalendarEventsFromOpportunityIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTimelineCalendarEventsFromOpportunityIdQuery({
 *   variables: {
 *      opportunityId: // value for 'opportunityId'
 *      page: // value for 'page'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetTimelineCalendarEventsFromOpportunityIdQuery(baseOptions: Apollo.QueryHookOptions<GetTimelineCalendarEventsFromOpportunityIdQuery, GetTimelineCalendarEventsFromOpportunityIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTimelineCalendarEventsFromOpportunityIdQuery, GetTimelineCalendarEventsFromOpportunityIdQueryVariables>(GetTimelineCalendarEventsFromOpportunityIdDocument, options);
      }
export function useGetTimelineCalendarEventsFromOpportunityIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTimelineCalendarEventsFromOpportunityIdQuery, GetTimelineCalendarEventsFromOpportunityIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTimelineCalendarEventsFromOpportunityIdQuery, GetTimelineCalendarEventsFromOpportunityIdQueryVariables>(GetTimelineCalendarEventsFromOpportunityIdDocument, options);
        }
export type GetTimelineCalendarEventsFromOpportunityIdQueryHookResult = ReturnType<typeof useGetTimelineCalendarEventsFromOpportunityIdQuery>;
export type GetTimelineCalendarEventsFromOpportunityIdLazyQueryHookResult = ReturnType<typeof useGetTimelineCalendarEventsFromOpportunityIdLazyQuery>;
export type GetTimelineCalendarEventsFromOpportunityIdQueryResult = Apollo.QueryResult<GetTimelineCalendarEventsFromOpportunityIdQuery, GetTimelineCalendarEventsFromOpportunityIdQueryVariables>;
export const GetTimelineCalendarEventsFromPersonIdDocument = gql`
    query GetTimelineCalendarEventsFromPersonId($personId: UUID!, $page: Int!, $pageSize: Int!) {
  getTimelineCalendarEventsFromPersonId(
    personId: $personId
    page: $page
    pageSize: $pageSize
  ) {
    ...TimelineCalendarEventsWithTotalFragment
  }
}
    ${TimelineCalendarEventsWithTotalFragmentFragmentDoc}`;

/**
 * __useGetTimelineCalendarEventsFromPersonIdQuery__
 *
 * To run a query within a React component, call `useGetTimelineCalendarEventsFromPersonIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTimelineCalendarEventsFromPersonIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTimelineCalendarEventsFromPersonIdQuery({
 *   variables: {
 *      personId: // value for 'personId'
 *      page: // value for 'page'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetTimelineCalendarEventsFromPersonIdQuery(baseOptions: Apollo.QueryHookOptions<GetTimelineCalendarEventsFromPersonIdQuery, GetTimelineCalendarEventsFromPersonIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTimelineCalendarEventsFromPersonIdQuery, GetTimelineCalendarEventsFromPersonIdQueryVariables>(GetTimelineCalendarEventsFromPersonIdDocument, options);
      }
export function useGetTimelineCalendarEventsFromPersonIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTimelineCalendarEventsFromPersonIdQuery, GetTimelineCalendarEventsFromPersonIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTimelineCalendarEventsFromPersonIdQuery, GetTimelineCalendarEventsFromPersonIdQueryVariables>(GetTimelineCalendarEventsFromPersonIdDocument, options);
        }
export type GetTimelineCalendarEventsFromPersonIdQueryHookResult = ReturnType<typeof useGetTimelineCalendarEventsFromPersonIdQuery>;
export type GetTimelineCalendarEventsFromPersonIdLazyQueryHookResult = ReturnType<typeof useGetTimelineCalendarEventsFromPersonIdLazyQuery>;
export type GetTimelineCalendarEventsFromPersonIdQueryResult = Apollo.QueryResult<GetTimelineCalendarEventsFromPersonIdQuery, GetTimelineCalendarEventsFromPersonIdQueryVariables>;
export const GetTimelineThreadsFromCompanyIdDocument = gql`
    query GetTimelineThreadsFromCompanyId($companyId: UUID!, $page: Int!, $pageSize: Int!) {
  getTimelineThreadsFromCompanyId(
    companyId: $companyId
    page: $page
    pageSize: $pageSize
  ) {
    ...TimelineThreadsWithTotalFragment
  }
}
    ${TimelineThreadsWithTotalFragmentFragmentDoc}`;

/**
 * __useGetTimelineThreadsFromCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetTimelineThreadsFromCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTimelineThreadsFromCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTimelineThreadsFromCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      page: // value for 'page'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetTimelineThreadsFromCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<GetTimelineThreadsFromCompanyIdQuery, GetTimelineThreadsFromCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTimelineThreadsFromCompanyIdQuery, GetTimelineThreadsFromCompanyIdQueryVariables>(GetTimelineThreadsFromCompanyIdDocument, options);
      }
export function useGetTimelineThreadsFromCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTimelineThreadsFromCompanyIdQuery, GetTimelineThreadsFromCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTimelineThreadsFromCompanyIdQuery, GetTimelineThreadsFromCompanyIdQueryVariables>(GetTimelineThreadsFromCompanyIdDocument, options);
        }
export type GetTimelineThreadsFromCompanyIdQueryHookResult = ReturnType<typeof useGetTimelineThreadsFromCompanyIdQuery>;
export type GetTimelineThreadsFromCompanyIdLazyQueryHookResult = ReturnType<typeof useGetTimelineThreadsFromCompanyIdLazyQuery>;
export type GetTimelineThreadsFromCompanyIdQueryResult = Apollo.QueryResult<GetTimelineThreadsFromCompanyIdQuery, GetTimelineThreadsFromCompanyIdQueryVariables>;
export const GetTimelineThreadsFromOpportunityIdDocument = gql`
    query GetTimelineThreadsFromOpportunityId($opportunityId: UUID!, $page: Int!, $pageSize: Int!) {
  getTimelineThreadsFromOpportunityId(
    opportunityId: $opportunityId
    page: $page
    pageSize: $pageSize
  ) {
    ...TimelineThreadsWithTotalFragment
  }
}
    ${TimelineThreadsWithTotalFragmentFragmentDoc}`;

/**
 * __useGetTimelineThreadsFromOpportunityIdQuery__
 *
 * To run a query within a React component, call `useGetTimelineThreadsFromOpportunityIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTimelineThreadsFromOpportunityIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTimelineThreadsFromOpportunityIdQuery({
 *   variables: {
 *      opportunityId: // value for 'opportunityId'
 *      page: // value for 'page'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetTimelineThreadsFromOpportunityIdQuery(baseOptions: Apollo.QueryHookOptions<GetTimelineThreadsFromOpportunityIdQuery, GetTimelineThreadsFromOpportunityIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTimelineThreadsFromOpportunityIdQuery, GetTimelineThreadsFromOpportunityIdQueryVariables>(GetTimelineThreadsFromOpportunityIdDocument, options);
      }
export function useGetTimelineThreadsFromOpportunityIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTimelineThreadsFromOpportunityIdQuery, GetTimelineThreadsFromOpportunityIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTimelineThreadsFromOpportunityIdQuery, GetTimelineThreadsFromOpportunityIdQueryVariables>(GetTimelineThreadsFromOpportunityIdDocument, options);
        }
export type GetTimelineThreadsFromOpportunityIdQueryHookResult = ReturnType<typeof useGetTimelineThreadsFromOpportunityIdQuery>;
export type GetTimelineThreadsFromOpportunityIdLazyQueryHookResult = ReturnType<typeof useGetTimelineThreadsFromOpportunityIdLazyQuery>;
export type GetTimelineThreadsFromOpportunityIdQueryResult = Apollo.QueryResult<GetTimelineThreadsFromOpportunityIdQuery, GetTimelineThreadsFromOpportunityIdQueryVariables>;
export const GetTimelineThreadsFromPersonIdDocument = gql`
    query GetTimelineThreadsFromPersonId($personId: UUID!, $page: Int!, $pageSize: Int!) {
  getTimelineThreadsFromPersonId(
    personId: $personId
    page: $page
    pageSize: $pageSize
  ) {
    ...TimelineThreadsWithTotalFragment
  }
}
    ${TimelineThreadsWithTotalFragmentFragmentDoc}`;

/**
 * __useGetTimelineThreadsFromPersonIdQuery__
 *
 * To run a query within a React component, call `useGetTimelineThreadsFromPersonIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTimelineThreadsFromPersonIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTimelineThreadsFromPersonIdQuery({
 *   variables: {
 *      personId: // value for 'personId'
 *      page: // value for 'page'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetTimelineThreadsFromPersonIdQuery(baseOptions: Apollo.QueryHookOptions<GetTimelineThreadsFromPersonIdQuery, GetTimelineThreadsFromPersonIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTimelineThreadsFromPersonIdQuery, GetTimelineThreadsFromPersonIdQueryVariables>(GetTimelineThreadsFromPersonIdDocument, options);
      }
export function useGetTimelineThreadsFromPersonIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTimelineThreadsFromPersonIdQuery, GetTimelineThreadsFromPersonIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTimelineThreadsFromPersonIdQuery, GetTimelineThreadsFromPersonIdQueryVariables>(GetTimelineThreadsFromPersonIdDocument, options);
        }
export type GetTimelineThreadsFromPersonIdQueryHookResult = ReturnType<typeof useGetTimelineThreadsFromPersonIdQuery>;
export type GetTimelineThreadsFromPersonIdLazyQueryHookResult = ReturnType<typeof useGetTimelineThreadsFromPersonIdLazyQuery>;
export type GetTimelineThreadsFromPersonIdQueryResult = Apollo.QueryResult<GetTimelineThreadsFromPersonIdQuery, GetTimelineThreadsFromPersonIdQueryVariables>;
export const SearchDocument = gql`
    query Search($searchInput: String!, $limit: Int!, $after: String, $excludedObjectNameSingulars: [String!], $includedObjectNameSingulars: [String!], $filter: ObjectRecordFilterInput) {
  search(
    searchInput: $searchInput
    limit: $limit
    after: $after
    excludedObjectNameSingulars: $excludedObjectNameSingulars
    includedObjectNameSingulars: $includedObjectNameSingulars
    filter: $filter
  ) {
    edges {
      node {
        recordId
        objectNameSingular
        objectLabelSingular
        label
        imageUrl
        tsRankCD
        tsRank
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useSearchQuery__
 *
 * To run a query within a React component, call `useSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchQuery({
 *   variables: {
 *      searchInput: // value for 'searchInput'
 *      limit: // value for 'limit'
 *      after: // value for 'after'
 *      excludedObjectNameSingulars: // value for 'excludedObjectNameSingulars'
 *      includedObjectNameSingulars: // value for 'includedObjectNameSingulars'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useSearchQuery(baseOptions: Apollo.QueryHookOptions<SearchQuery, SearchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchQuery, SearchQueryVariables>(SearchDocument, options);
      }
export function useSearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchQuery, SearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchQuery, SearchQueryVariables>(SearchDocument, options);
        }
export type SearchQueryHookResult = ReturnType<typeof useSearchQuery>;
export type SearchLazyQueryHookResult = ReturnType<typeof useSearchLazyQuery>;
export type SearchQueryResult = Apollo.QueryResult<SearchQuery, SearchQueryVariables>;
export const ActivateWorkflowVersionDocument = gql`
    mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
  activateWorkflowVersion(workflowVersionId: $workflowVersionId)
}
    `;
export type ActivateWorkflowVersionMutationFn = Apollo.MutationFunction<ActivateWorkflowVersionMutation, ActivateWorkflowVersionMutationVariables>;

/**
 * __useActivateWorkflowVersionMutation__
 *
 * To run a mutation, you first call `useActivateWorkflowVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateWorkflowVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateWorkflowVersionMutation, { data, loading, error }] = useActivateWorkflowVersionMutation({
 *   variables: {
 *      workflowVersionId: // value for 'workflowVersionId'
 *   },
 * });
 */
export function useActivateWorkflowVersionMutation(baseOptions?: Apollo.MutationHookOptions<ActivateWorkflowVersionMutation, ActivateWorkflowVersionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ActivateWorkflowVersionMutation, ActivateWorkflowVersionMutationVariables>(ActivateWorkflowVersionDocument, options);
      }
export type ActivateWorkflowVersionMutationHookResult = ReturnType<typeof useActivateWorkflowVersionMutation>;
export type ActivateWorkflowVersionMutationResult = Apollo.MutationResult<ActivateWorkflowVersionMutation>;
export type ActivateWorkflowVersionMutationOptions = Apollo.BaseMutationOptions<ActivateWorkflowVersionMutation, ActivateWorkflowVersionMutationVariables>;
export const ComputeStepOutputSchemaDocument = gql`
    mutation ComputeStepOutputSchema($input: ComputeStepOutputSchemaInput!) {
  computeStepOutputSchema(input: $input)
}
    `;
export type ComputeStepOutputSchemaMutationFn = Apollo.MutationFunction<ComputeStepOutputSchemaMutation, ComputeStepOutputSchemaMutationVariables>;

/**
 * __useComputeStepOutputSchemaMutation__
 *
 * To run a mutation, you first call `useComputeStepOutputSchemaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useComputeStepOutputSchemaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [computeStepOutputSchemaMutation, { data, loading, error }] = useComputeStepOutputSchemaMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useComputeStepOutputSchemaMutation(baseOptions?: Apollo.MutationHookOptions<ComputeStepOutputSchemaMutation, ComputeStepOutputSchemaMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ComputeStepOutputSchemaMutation, ComputeStepOutputSchemaMutationVariables>(ComputeStepOutputSchemaDocument, options);
      }
export type ComputeStepOutputSchemaMutationHookResult = ReturnType<typeof useComputeStepOutputSchemaMutation>;
export type ComputeStepOutputSchemaMutationResult = Apollo.MutationResult<ComputeStepOutputSchemaMutation>;
export type ComputeStepOutputSchemaMutationOptions = Apollo.BaseMutationOptions<ComputeStepOutputSchemaMutation, ComputeStepOutputSchemaMutationVariables>;
export const CreateDraftFromWorkflowVersionDocument = gql`
    mutation CreateDraftFromWorkflowVersion($input: CreateDraftFromWorkflowVersionInput!) {
  createDraftFromWorkflowVersion(input: $input) {
    id
    name
    status
    trigger
    steps
    createdAt
    updatedAt
  }
}
    `;
export type CreateDraftFromWorkflowVersionMutationFn = Apollo.MutationFunction<CreateDraftFromWorkflowVersionMutation, CreateDraftFromWorkflowVersionMutationVariables>;

/**
 * __useCreateDraftFromWorkflowVersionMutation__
 *
 * To run a mutation, you first call `useCreateDraftFromWorkflowVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDraftFromWorkflowVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDraftFromWorkflowVersionMutation, { data, loading, error }] = useCreateDraftFromWorkflowVersionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateDraftFromWorkflowVersionMutation(baseOptions?: Apollo.MutationHookOptions<CreateDraftFromWorkflowVersionMutation, CreateDraftFromWorkflowVersionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDraftFromWorkflowVersionMutation, CreateDraftFromWorkflowVersionMutationVariables>(CreateDraftFromWorkflowVersionDocument, options);
      }
export type CreateDraftFromWorkflowVersionMutationHookResult = ReturnType<typeof useCreateDraftFromWorkflowVersionMutation>;
export type CreateDraftFromWorkflowVersionMutationResult = Apollo.MutationResult<CreateDraftFromWorkflowVersionMutation>;
export type CreateDraftFromWorkflowVersionMutationOptions = Apollo.BaseMutationOptions<CreateDraftFromWorkflowVersionMutation, CreateDraftFromWorkflowVersionMutationVariables>;
export const CreateWorkflowVersionEdgeDocument = gql`
    mutation CreateWorkflowVersionEdge($input: CreateWorkflowVersionEdgeInput!) {
  createWorkflowVersionEdge(input: $input) {
    ...WorkflowDiffFragment
  }
}
    ${WorkflowDiffFragmentFragmentDoc}`;
export type CreateWorkflowVersionEdgeMutationFn = Apollo.MutationFunction<CreateWorkflowVersionEdgeMutation, CreateWorkflowVersionEdgeMutationVariables>;

/**
 * __useCreateWorkflowVersionEdgeMutation__
 *
 * To run a mutation, you first call `useCreateWorkflowVersionEdgeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkflowVersionEdgeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkflowVersionEdgeMutation, { data, loading, error }] = useCreateWorkflowVersionEdgeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWorkflowVersionEdgeMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkflowVersionEdgeMutation, CreateWorkflowVersionEdgeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkflowVersionEdgeMutation, CreateWorkflowVersionEdgeMutationVariables>(CreateWorkflowVersionEdgeDocument, options);
      }
export type CreateWorkflowVersionEdgeMutationHookResult = ReturnType<typeof useCreateWorkflowVersionEdgeMutation>;
export type CreateWorkflowVersionEdgeMutationResult = Apollo.MutationResult<CreateWorkflowVersionEdgeMutation>;
export type CreateWorkflowVersionEdgeMutationOptions = Apollo.BaseMutationOptions<CreateWorkflowVersionEdgeMutation, CreateWorkflowVersionEdgeMutationVariables>;
export const CreateWorkflowVersionStepDocument = gql`
    mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
  createWorkflowVersionStep(input: $input) {
    ...WorkflowDiffFragment
  }
}
    ${WorkflowDiffFragmentFragmentDoc}`;
export type CreateWorkflowVersionStepMutationFn = Apollo.MutationFunction<CreateWorkflowVersionStepMutation, CreateWorkflowVersionStepMutationVariables>;

/**
 * __useCreateWorkflowVersionStepMutation__
 *
 * To run a mutation, you first call `useCreateWorkflowVersionStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkflowVersionStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkflowVersionStepMutation, { data, loading, error }] = useCreateWorkflowVersionStepMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWorkflowVersionStepMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkflowVersionStepMutation, CreateWorkflowVersionStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkflowVersionStepMutation, CreateWorkflowVersionStepMutationVariables>(CreateWorkflowVersionStepDocument, options);
      }
export type CreateWorkflowVersionStepMutationHookResult = ReturnType<typeof useCreateWorkflowVersionStepMutation>;
export type CreateWorkflowVersionStepMutationResult = Apollo.MutationResult<CreateWorkflowVersionStepMutation>;
export type CreateWorkflowVersionStepMutationOptions = Apollo.BaseMutationOptions<CreateWorkflowVersionStepMutation, CreateWorkflowVersionStepMutationVariables>;
export const DeactivateWorkflowVersionDocument = gql`
    mutation DeactivateWorkflowVersion($workflowVersionId: UUID!) {
  deactivateWorkflowVersion(workflowVersionId: $workflowVersionId)
}
    `;
export type DeactivateWorkflowVersionMutationFn = Apollo.MutationFunction<DeactivateWorkflowVersionMutation, DeactivateWorkflowVersionMutationVariables>;

/**
 * __useDeactivateWorkflowVersionMutation__
 *
 * To run a mutation, you first call `useDeactivateWorkflowVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeactivateWorkflowVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deactivateWorkflowVersionMutation, { data, loading, error }] = useDeactivateWorkflowVersionMutation({
 *   variables: {
 *      workflowVersionId: // value for 'workflowVersionId'
 *   },
 * });
 */
export function useDeactivateWorkflowVersionMutation(baseOptions?: Apollo.MutationHookOptions<DeactivateWorkflowVersionMutation, DeactivateWorkflowVersionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeactivateWorkflowVersionMutation, DeactivateWorkflowVersionMutationVariables>(DeactivateWorkflowVersionDocument, options);
      }
export type DeactivateWorkflowVersionMutationHookResult = ReturnType<typeof useDeactivateWorkflowVersionMutation>;
export type DeactivateWorkflowVersionMutationResult = Apollo.MutationResult<DeactivateWorkflowVersionMutation>;
export type DeactivateWorkflowVersionMutationOptions = Apollo.BaseMutationOptions<DeactivateWorkflowVersionMutation, DeactivateWorkflowVersionMutationVariables>;
export const DeleteWorkflowVersionEdgeDocument = gql`
    mutation DeleteWorkflowVersionEdge($input: CreateWorkflowVersionEdgeInput!) {
  deleteWorkflowVersionEdge(input: $input) {
    ...WorkflowDiffFragment
  }
}
    ${WorkflowDiffFragmentFragmentDoc}`;
export type DeleteWorkflowVersionEdgeMutationFn = Apollo.MutationFunction<DeleteWorkflowVersionEdgeMutation, DeleteWorkflowVersionEdgeMutationVariables>;

/**
 * __useDeleteWorkflowVersionEdgeMutation__
 *
 * To run a mutation, you first call `useDeleteWorkflowVersionEdgeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWorkflowVersionEdgeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWorkflowVersionEdgeMutation, { data, loading, error }] = useDeleteWorkflowVersionEdgeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteWorkflowVersionEdgeMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWorkflowVersionEdgeMutation, DeleteWorkflowVersionEdgeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWorkflowVersionEdgeMutation, DeleteWorkflowVersionEdgeMutationVariables>(DeleteWorkflowVersionEdgeDocument, options);
      }
export type DeleteWorkflowVersionEdgeMutationHookResult = ReturnType<typeof useDeleteWorkflowVersionEdgeMutation>;
export type DeleteWorkflowVersionEdgeMutationResult = Apollo.MutationResult<DeleteWorkflowVersionEdgeMutation>;
export type DeleteWorkflowVersionEdgeMutationOptions = Apollo.BaseMutationOptions<DeleteWorkflowVersionEdgeMutation, DeleteWorkflowVersionEdgeMutationVariables>;
export const DeleteWorkflowVersionStepDocument = gql`
    mutation DeleteWorkflowVersionStep($input: DeleteWorkflowVersionStepInput!) {
  deleteWorkflowVersionStep(input: $input) {
    ...WorkflowDiffFragment
  }
}
    ${WorkflowDiffFragmentFragmentDoc}`;
export type DeleteWorkflowVersionStepMutationFn = Apollo.MutationFunction<DeleteWorkflowVersionStepMutation, DeleteWorkflowVersionStepMutationVariables>;

/**
 * __useDeleteWorkflowVersionStepMutation__
 *
 * To run a mutation, you first call `useDeleteWorkflowVersionStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWorkflowVersionStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWorkflowVersionStepMutation, { data, loading, error }] = useDeleteWorkflowVersionStepMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteWorkflowVersionStepMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWorkflowVersionStepMutation, DeleteWorkflowVersionStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWorkflowVersionStepMutation, DeleteWorkflowVersionStepMutationVariables>(DeleteWorkflowVersionStepDocument, options);
      }
export type DeleteWorkflowVersionStepMutationHookResult = ReturnType<typeof useDeleteWorkflowVersionStepMutation>;
export type DeleteWorkflowVersionStepMutationResult = Apollo.MutationResult<DeleteWorkflowVersionStepMutation>;
export type DeleteWorkflowVersionStepMutationOptions = Apollo.BaseMutationOptions<DeleteWorkflowVersionStepMutation, DeleteWorkflowVersionStepMutationVariables>;
export const DuplicateWorkflowDocument = gql`
    mutation DuplicateWorkflow($input: DuplicateWorkflowInput!) {
  duplicateWorkflow(input: $input) {
    id
    name
    status
    trigger
    steps
    createdAt
    updatedAt
    workflowId
  }
}
    `;
export type DuplicateWorkflowMutationFn = Apollo.MutationFunction<DuplicateWorkflowMutation, DuplicateWorkflowMutationVariables>;

/**
 * __useDuplicateWorkflowMutation__
 *
 * To run a mutation, you first call `useDuplicateWorkflowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDuplicateWorkflowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [duplicateWorkflowMutation, { data, loading, error }] = useDuplicateWorkflowMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDuplicateWorkflowMutation(baseOptions?: Apollo.MutationHookOptions<DuplicateWorkflowMutation, DuplicateWorkflowMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DuplicateWorkflowMutation, DuplicateWorkflowMutationVariables>(DuplicateWorkflowDocument, options);
      }
export type DuplicateWorkflowMutationHookResult = ReturnType<typeof useDuplicateWorkflowMutation>;
export type DuplicateWorkflowMutationResult = Apollo.MutationResult<DuplicateWorkflowMutation>;
export type DuplicateWorkflowMutationOptions = Apollo.BaseMutationOptions<DuplicateWorkflowMutation, DuplicateWorkflowMutationVariables>;
export const DuplicateWorkflowVersionStepDocument = gql`
    mutation DuplicateWorkflowVersionStep($input: DuplicateWorkflowVersionStepInput!) {
  duplicateWorkflowVersionStep(input: $input) {
    ...WorkflowDiffFragment
  }
}
    ${WorkflowDiffFragmentFragmentDoc}`;
export type DuplicateWorkflowVersionStepMutationFn = Apollo.MutationFunction<DuplicateWorkflowVersionStepMutation, DuplicateWorkflowVersionStepMutationVariables>;

/**
 * __useDuplicateWorkflowVersionStepMutation__
 *
 * To run a mutation, you first call `useDuplicateWorkflowVersionStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDuplicateWorkflowVersionStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [duplicateWorkflowVersionStepMutation, { data, loading, error }] = useDuplicateWorkflowVersionStepMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDuplicateWorkflowVersionStepMutation(baseOptions?: Apollo.MutationHookOptions<DuplicateWorkflowVersionStepMutation, DuplicateWorkflowVersionStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DuplicateWorkflowVersionStepMutation, DuplicateWorkflowVersionStepMutationVariables>(DuplicateWorkflowVersionStepDocument, options);
      }
export type DuplicateWorkflowVersionStepMutationHookResult = ReturnType<typeof useDuplicateWorkflowVersionStepMutation>;
export type DuplicateWorkflowVersionStepMutationResult = Apollo.MutationResult<DuplicateWorkflowVersionStepMutation>;
export type DuplicateWorkflowVersionStepMutationOptions = Apollo.BaseMutationOptions<DuplicateWorkflowVersionStepMutation, DuplicateWorkflowVersionStepMutationVariables>;
export const RunWorkflowVersionDocument = gql`
    mutation RunWorkflowVersion($input: RunWorkflowVersionInput!) {
  runWorkflowVersion(input: $input) {
    workflowRunId
  }
}
    `;
export type RunWorkflowVersionMutationFn = Apollo.MutationFunction<RunWorkflowVersionMutation, RunWorkflowVersionMutationVariables>;

/**
 * __useRunWorkflowVersionMutation__
 *
 * To run a mutation, you first call `useRunWorkflowVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRunWorkflowVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [runWorkflowVersionMutation, { data, loading, error }] = useRunWorkflowVersionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRunWorkflowVersionMutation(baseOptions?: Apollo.MutationHookOptions<RunWorkflowVersionMutation, RunWorkflowVersionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RunWorkflowVersionMutation, RunWorkflowVersionMutationVariables>(RunWorkflowVersionDocument, options);
      }
export type RunWorkflowVersionMutationHookResult = ReturnType<typeof useRunWorkflowVersionMutation>;
export type RunWorkflowVersionMutationResult = Apollo.MutationResult<RunWorkflowVersionMutation>;
export type RunWorkflowVersionMutationOptions = Apollo.BaseMutationOptions<RunWorkflowVersionMutation, RunWorkflowVersionMutationVariables>;
export const StopWorkflowRunDocument = gql`
    mutation StopWorkflowRun($workflowRunId: UUID!) {
  stopWorkflowRun(workflowRunId: $workflowRunId) {
    id
    status
    __typename
  }
}
    `;
export type StopWorkflowRunMutationFn = Apollo.MutationFunction<StopWorkflowRunMutation, StopWorkflowRunMutationVariables>;

/**
 * __useStopWorkflowRunMutation__
 *
 * To run a mutation, you first call `useStopWorkflowRunMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStopWorkflowRunMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [stopWorkflowRunMutation, { data, loading, error }] = useStopWorkflowRunMutation({
 *   variables: {
 *      workflowRunId: // value for 'workflowRunId'
 *   },
 * });
 */
export function useStopWorkflowRunMutation(baseOptions?: Apollo.MutationHookOptions<StopWorkflowRunMutation, StopWorkflowRunMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StopWorkflowRunMutation, StopWorkflowRunMutationVariables>(StopWorkflowRunDocument, options);
      }
export type StopWorkflowRunMutationHookResult = ReturnType<typeof useStopWorkflowRunMutation>;
export type StopWorkflowRunMutationResult = Apollo.MutationResult<StopWorkflowRunMutation>;
export type StopWorkflowRunMutationOptions = Apollo.BaseMutationOptions<StopWorkflowRunMutation, StopWorkflowRunMutationVariables>;
export const UpdateWorkflowRunStepDocument = gql`
    mutation UpdateWorkflowRunStep($input: UpdateWorkflowRunStepInput!) {
  updateWorkflowRunStep(input: $input) {
    id
    name
    type
    settings
    valid
    nextStepIds
    position {
      x
      y
    }
  }
}
    `;
export type UpdateWorkflowRunStepMutationFn = Apollo.MutationFunction<UpdateWorkflowRunStepMutation, UpdateWorkflowRunStepMutationVariables>;

/**
 * __useUpdateWorkflowRunStepMutation__
 *
 * To run a mutation, you first call `useUpdateWorkflowRunStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkflowRunStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkflowRunStepMutation, { data, loading, error }] = useUpdateWorkflowRunStepMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWorkflowRunStepMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkflowRunStepMutation, UpdateWorkflowRunStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkflowRunStepMutation, UpdateWorkflowRunStepMutationVariables>(UpdateWorkflowRunStepDocument, options);
      }
export type UpdateWorkflowRunStepMutationHookResult = ReturnType<typeof useUpdateWorkflowRunStepMutation>;
export type UpdateWorkflowRunStepMutationResult = Apollo.MutationResult<UpdateWorkflowRunStepMutation>;
export type UpdateWorkflowRunStepMutationOptions = Apollo.BaseMutationOptions<UpdateWorkflowRunStepMutation, UpdateWorkflowRunStepMutationVariables>;
export const UpdateWorkflowVersionStepDocument = gql`
    mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
  updateWorkflowVersionStep(input: $input) {
    id
    name
    type
    settings
    valid
    nextStepIds
    position {
      x
      y
    }
  }
}
    `;
export type UpdateWorkflowVersionStepMutationFn = Apollo.MutationFunction<UpdateWorkflowVersionStepMutation, UpdateWorkflowVersionStepMutationVariables>;

/**
 * __useUpdateWorkflowVersionStepMutation__
 *
 * To run a mutation, you first call `useUpdateWorkflowVersionStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkflowVersionStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkflowVersionStepMutation, { data, loading, error }] = useUpdateWorkflowVersionStepMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWorkflowVersionStepMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkflowVersionStepMutation, UpdateWorkflowVersionStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkflowVersionStepMutation, UpdateWorkflowVersionStepMutationVariables>(UpdateWorkflowVersionStepDocument, options);
      }
export type UpdateWorkflowVersionStepMutationHookResult = ReturnType<typeof useUpdateWorkflowVersionStepMutation>;
export type UpdateWorkflowVersionStepMutationResult = Apollo.MutationResult<UpdateWorkflowVersionStepMutation>;
export type UpdateWorkflowVersionStepMutationOptions = Apollo.BaseMutationOptions<UpdateWorkflowVersionStepMutation, UpdateWorkflowVersionStepMutationVariables>;
export const SubmitFormStepDocument = gql`
    mutation SubmitFormStep($input: SubmitFormStepInput!) {
  submitFormStep(input: $input)
}
    `;
export type SubmitFormStepMutationFn = Apollo.MutationFunction<SubmitFormStepMutation, SubmitFormStepMutationVariables>;

/**
 * __useSubmitFormStepMutation__
 *
 * To run a mutation, you first call `useSubmitFormStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitFormStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitFormStepMutation, { data, loading, error }] = useSubmitFormStepMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitFormStepMutation(baseOptions?: Apollo.MutationHookOptions<SubmitFormStepMutation, SubmitFormStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitFormStepMutation, SubmitFormStepMutationVariables>(SubmitFormStepDocument, options);
      }
export type SubmitFormStepMutationHookResult = ReturnType<typeof useSubmitFormStepMutation>;
export type SubmitFormStepMutationResult = Apollo.MutationResult<SubmitFormStepMutation>;
export type SubmitFormStepMutationOptions = Apollo.BaseMutationOptions<SubmitFormStepMutation, SubmitFormStepMutationVariables>;
export const TestHttpRequestDocument = gql`
    mutation TestHttpRequest($input: TestHttpRequestInput!) {
  testHttpRequest(input: $input) {
    success
    message
    result
    error
    status
    statusText
    headers
  }
}
    `;
export type TestHttpRequestMutationFn = Apollo.MutationFunction<TestHttpRequestMutation, TestHttpRequestMutationVariables>;

/**
 * __useTestHttpRequestMutation__
 *
 * To run a mutation, you first call `useTestHttpRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTestHttpRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [testHttpRequestMutation, { data, loading, error }] = useTestHttpRequestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useTestHttpRequestMutation(baseOptions?: Apollo.MutationHookOptions<TestHttpRequestMutation, TestHttpRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TestHttpRequestMutation, TestHttpRequestMutationVariables>(TestHttpRequestDocument, options);
      }
export type TestHttpRequestMutationHookResult = ReturnType<typeof useTestHttpRequestMutation>;
export type TestHttpRequestMutationResult = Apollo.MutationResult<TestHttpRequestMutation>;
export type TestHttpRequestMutationOptions = Apollo.BaseMutationOptions<TestHttpRequestMutation, TestHttpRequestMutationVariables>;
export const UpdateWorkflowVersionPositionsDocument = gql`
    mutation UpdateWorkflowVersionPositions($input: UpdateWorkflowVersionPositionsInput!) {
  updateWorkflowVersionPositions(input: $input)
}
    `;
export type UpdateWorkflowVersionPositionsMutationFn = Apollo.MutationFunction<UpdateWorkflowVersionPositionsMutation, UpdateWorkflowVersionPositionsMutationVariables>;

/**
 * __useUpdateWorkflowVersionPositionsMutation__
 *
 * To run a mutation, you first call `useUpdateWorkflowVersionPositionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkflowVersionPositionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkflowVersionPositionsMutation, { data, loading, error }] = useUpdateWorkflowVersionPositionsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWorkflowVersionPositionsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkflowVersionPositionsMutation, UpdateWorkflowVersionPositionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkflowVersionPositionsMutation, UpdateWorkflowVersionPositionsMutationVariables>(UpdateWorkflowVersionPositionsDocument, options);
      }
export type UpdateWorkflowVersionPositionsMutationHookResult = ReturnType<typeof useUpdateWorkflowVersionPositionsMutation>;
export type UpdateWorkflowVersionPositionsMutationResult = Apollo.MutationResult<UpdateWorkflowVersionPositionsMutation>;
export type UpdateWorkflowVersionPositionsMutationOptions = Apollo.BaseMutationOptions<UpdateWorkflowVersionPositionsMutation, UpdateWorkflowVersionPositionsMutationVariables>;