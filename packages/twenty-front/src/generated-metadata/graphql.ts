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
  UUID: string;
  Upload: any;
};

export type ActivateWorkspaceInput = {
  displayName?: InputMaybe<Scalars['String']>;
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
  standardId?: Maybe<Scalars['UUID']>;
  updatedAt: Scalars['DateTime'];
};

export type AgentChatThread = {
  __typename?: 'AgentChatThread';
  contextWindowTokens?: Maybe<Scalars['Int']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  title?: Maybe<Scalars['String']>;
  totalInputCredits: Scalars['Int'];
  totalInputTokens: Scalars['Int'];
  totalOutputCredits: Scalars['Int'];
  totalOutputTokens: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

export type AgentIdInput = {
  /** The id of the agent. */
  id: Scalars['UUID'];
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

export enum AnalyticsType {
  PAGEVIEW = 'PAGEVIEW',
  TRACK = 'TRACK'
}

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
  canBeUninstalled: Scalars['Boolean'];
  defaultServerlessFunctionRole?: Maybe<Role>;
  defaultServerlessFunctionRoleId?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  id: Scalars['UUID'];
  name: Scalars['String'];
  objects: Array<Object>;
  serverlessFunctions: Array<ServerlessFunction>;
  universalIdentifier: Scalars['String'];
  version: Scalars['String'];
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
  METERING = 'METERING',
  MICROSOFT_AUTH = 'MICROSOFT_AUTH',
  OTHER = 'OTHER',
  RATE_LIMITING = 'RATE_LIMITING',
  SERVERLESS_CONFIG = 'SERVERLESS_CONFIG',
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

export type ConnectionParameters = {
  host: Scalars['String'];
  password: Scalars['String'];
  port: Scalars['Float'];
  secure?: InputMaybe<Scalars['Boolean']>;
  username?: InputMaybe<Scalars['String']>;
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

export type CreateAgentInput = {
  description?: InputMaybe<Scalars['String']>;
  evaluationInputs?: InputMaybe<Array<Scalars['String']>>;
  icon?: InputMaybe<Scalars['String']>;
  label: Scalars['String'];
  modelConfiguration?: InputMaybe<Scalars['JSON']>;
  modelId: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  prompt: Scalars['String'];
  responseFormat?: InputMaybe<Scalars['JSON']>;
  roleId?: InputMaybe<Scalars['UUID']>;
};

export type CreateApiKeyInput = {
  expiresAt: Scalars['String'];
  name: Scalars['String'];
  revokedAt?: InputMaybe<Scalars['String']>;
  roleId: Scalars['UUID'];
};

export type CreateAppTokenInput = {
  expiresAt: Scalars['DateTime'];
};

export type CreateApprovedAccessDomainInput = {
  domain: Scalars['String'];
  email: Scalars['String'];
};

export type CreateCronTriggerInput = {
  serverlessFunctionId: Scalars['String'];
  settings: Scalars['JSON'];
};

export type CreateDatabaseEventTriggerInput = {
  serverlessFunctionId: Scalars['String'];
  settings: Scalars['JSON'];
};

export type CreateDraftFromWorkflowVersionInput = {
  /** Workflow ID */
  workflowId: Scalars['UUID'];
  /** Workflow version ID */
  workflowVersionIdToCopy: Scalars['UUID'];
};

export type CreateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']>;
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  isCustom?: InputMaybe<Scalars['Boolean']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']>;
  isNullable?: InputMaybe<Scalars['Boolean']>;
  isRemoteCreation?: InputMaybe<Scalars['Boolean']>;
  isSystem?: InputMaybe<Scalars['Boolean']>;
  isUIReadOnly?: InputMaybe<Scalars['Boolean']>;
  isUnique?: InputMaybe<Scalars['Boolean']>;
  label: Scalars['String'];
  morphRelationsCreationPayload?: InputMaybe<Array<Scalars['JSON']>>;
  name: Scalars['String'];
  objectMetadataId: Scalars['UUID'];
  options?: InputMaybe<Scalars['JSON']>;
  relationCreationPayload?: InputMaybe<Scalars['JSON']>;
  settings?: InputMaybe<Scalars['JSON']>;
  type: FieldMetadataType;
};

export type CreateObjectInput = {
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']>;
  isRemote?: InputMaybe<Scalars['Boolean']>;
  labelPlural: Scalars['String'];
  labelSingular: Scalars['String'];
  namePlural: Scalars['String'];
  nameSingular: Scalars['String'];
  primaryKeyColumnType?: InputMaybe<Scalars['String']>;
  primaryKeyFieldMetadataSettings?: InputMaybe<Scalars['JSON']>;
  shortcut?: InputMaybe<Scalars['String']>;
};

export type CreateOneAppTokenInput = {
  /** The record to create */
  appToken: CreateAppTokenInput;
};

export type CreateOneFieldMetadataInput = {
  /** The record to create */
  field: CreateFieldInput;
};

export type CreateOneObjectInput = {
  /** The object to create */
  object: CreateObjectInput;
};

export type CreatePageLayoutInput = {
  name: Scalars['String'];
  objectMetadataId?: InputMaybe<Scalars['UUID']>;
  type?: InputMaybe<PageLayoutType>;
};

export type CreatePageLayoutTabInput = {
  pageLayoutId: Scalars['UUID'];
  position?: InputMaybe<Scalars['Float']>;
  title: Scalars['String'];
};

export type CreatePageLayoutWidgetInput = {
  configuration: Scalars['JSON'];
  gridPosition: GridPositionInput;
  objectMetadataId?: InputMaybe<Scalars['UUID']>;
  pageLayoutTabId: Scalars['UUID'];
  title: Scalars['String'];
  type: WidgetType;
};

export type CreateRemoteServerInput = {
  foreignDataWrapperOptions: Scalars['JSON'];
  foreignDataWrapperType: Scalars['String'];
  label: Scalars['String'];
  schema?: InputMaybe<Scalars['String']>;
  userMappingOptions?: InputMaybe<UserMappingOptions>;
};

export type CreateRoleInput = {
  canAccessAllTools?: InputMaybe<Scalars['Boolean']>;
  canBeAssignedToAgents?: InputMaybe<Scalars['Boolean']>;
  canBeAssignedToApiKeys?: InputMaybe<Scalars['Boolean']>;
  canBeAssignedToUsers?: InputMaybe<Scalars['Boolean']>;
  canDestroyAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canReadAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canSoftDeleteAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canUpdateAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canUpdateAllSettings?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  label: Scalars['String'];
};

export type CreateRouteTriggerInput = {
  httpMethod?: HttpMethod;
  isAuthRequired?: Scalars['Boolean'];
  path: Scalars['String'];
  serverlessFunctionId: Scalars['String'];
};

export type CreateRowLevelPermissionPredicateGroupInput = {
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  parentRowLevelPermissionPredicateGroupId?: InputMaybe<Scalars['String']>;
  positionInRowLevelPermissionPredicateGroup?: InputMaybe<Scalars['Float']>;
  roleId: Scalars['String'];
};

export type CreateRowLevelPermissionPredicateInput = {
  fieldMetadataId: Scalars['String'];
  objectMetadataId: Scalars['String'];
  operand: RowLevelPermissionPredicateOperand;
  positionInRowLevelPermissionPredicateGroup?: InputMaybe<Scalars['Float']>;
  roleId: Scalars['String'];
  rowLevelPermissionPredicateGroupId?: InputMaybe<Scalars['String']>;
  subFieldName?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['JSON']>;
  workspaceMemberFieldMetadataId?: InputMaybe<Scalars['String']>;
  workspaceMemberSubFieldName?: InputMaybe<Scalars['String']>;
};

export type CreateServerlessFunctionInput = {
  code?: InputMaybe<Scalars['JSON']>;
  description?: InputMaybe<Scalars['String']>;
  handlerName?: InputMaybe<Scalars['String']>;
  handlerPath?: InputMaybe<Scalars['String']>;
  isTool?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  timeoutSeconds?: InputMaybe<Scalars['Float']>;
  toolInputSchema?: InputMaybe<Scalars['JSON']>;
};

export type CreateSkillInput = {
  content: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  label: Scalars['String'];
  name: Scalars['String'];
};

export type CreateViewFieldInput = {
  aggregateOperation?: InputMaybe<AggregateOperations>;
  fieldMetadataId: Scalars['UUID'];
  id?: InputMaybe<Scalars['UUID']>;
  isVisible?: InputMaybe<Scalars['Boolean']>;
  position?: InputMaybe<Scalars['Float']>;
  size?: InputMaybe<Scalars['Float']>;
  viewId: Scalars['UUID'];
};

export type CreateViewFilterGroupInput = {
  id?: InputMaybe<Scalars['UUID']>;
  logicalOperator?: InputMaybe<ViewFilterGroupLogicalOperator>;
  parentViewFilterGroupId?: InputMaybe<Scalars['UUID']>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']>;
  viewId: Scalars['UUID'];
};

export type CreateViewFilterInput = {
  fieldMetadataId: Scalars['UUID'];
  id?: InputMaybe<Scalars['UUID']>;
  operand?: InputMaybe<ViewFilterOperand>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']>;
  subFieldName?: InputMaybe<Scalars['String']>;
  value: Scalars['JSON'];
  viewFilterGroupId?: InputMaybe<Scalars['UUID']>;
  viewId: Scalars['UUID'];
};

export type CreateViewGroupInput = {
  fieldValue: Scalars['String'];
  id?: InputMaybe<Scalars['UUID']>;
  isVisible?: InputMaybe<Scalars['Boolean']>;
  position?: InputMaybe<Scalars['Float']>;
  viewId: Scalars['UUID'];
};

export type CreateViewInput = {
  anyFieldFilterValue?: InputMaybe<Scalars['String']>;
  calendarFieldMetadataId?: InputMaybe<Scalars['UUID']>;
  calendarLayout?: InputMaybe<ViewCalendarLayout>;
  icon: Scalars['String'];
  id?: InputMaybe<Scalars['UUID']>;
  isCompact?: InputMaybe<Scalars['Boolean']>;
  kanbanAggregateOperation?: InputMaybe<AggregateOperations>;
  kanbanAggregateOperationFieldMetadataId?: InputMaybe<Scalars['UUID']>;
  key?: InputMaybe<ViewKey>;
  mainGroupByFieldMetadataId?: InputMaybe<Scalars['UUID']>;
  name: Scalars['String'];
  objectMetadataId: Scalars['UUID'];
  openRecordIn?: InputMaybe<ViewOpenRecordIn>;
  position?: InputMaybe<Scalars['Float']>;
  shouldHideEmptyGroups?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<ViewType>;
  visibility?: InputMaybe<ViewVisibility>;
};

export type CreateViewSortInput = {
  direction?: InputMaybe<ViewSortDirection>;
  fieldMetadataId: Scalars['UUID'];
  id?: InputMaybe<Scalars['UUID']>;
  viewId: Scalars['UUID'];
};

export type CreateWebhookInput = {
  description?: InputMaybe<Scalars['String']>;
  operations: Array<Scalars['String']>;
  secret?: InputMaybe<Scalars['String']>;
  targetUrl: Scalars['String'];
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

export type CronTrigger = {
  __typename?: 'CronTrigger';
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  settings: Scalars['JSON'];
  updatedAt: Scalars['DateTime'];
};

export type CronTriggerIdInput = {
  id: Scalars['String'];
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

export type DatabaseEventTrigger = {
  __typename?: 'DatabaseEventTrigger';
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  settings: Scalars['JSON'];
  updatedAt: Scalars['DateTime'];
};

export type DatabaseEventTriggerIdInput = {
  id: Scalars['String'];
};

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

export type DeleteApprovedAccessDomainInput = {
  id: Scalars['UUID'];
};

export type DeleteJobsResponse = {
  __typename?: 'DeleteJobsResponse';
  deletedCount: Scalars['Int'];
  results: Array<JobOperationResult>;
};

export type DeleteOneFieldInput = {
  /** The id of the field to delete. */
  id: Scalars['UUID'];
};

export type DeleteOneObjectInput = {
  /** The id of the record to delete. */
  id: Scalars['UUID'];
};

export type DeleteRowLevelPermissionPredicateGroupInput = {
  id: Scalars['String'];
};

export type DeleteRowLevelPermissionPredicateInput = {
  id: Scalars['String'];
};

export type DeleteSsoInput = {
  identityProviderId: Scalars['UUID'];
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

export type DeleteViewFieldInput = {
  /** The id of the view field to delete. */
  id: Scalars['UUID'];
};

export type DeleteViewFilterInput = {
  /** The id of the view filter to delete. */
  id: Scalars['UUID'];
};

export type DeleteViewGroupInput = {
  /** The id of the view group to delete. */
  id: Scalars['UUID'];
};

export type DeleteWebhookInput = {
  id: Scalars['UUID'];
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

export type DestroyViewFieldInput = {
  /** The id of the view field to destroy. */
  id: Scalars['UUID'];
};

export type DestroyViewFilterInput = {
  /** The id of the view filter to destroy. */
  id: Scalars['UUID'];
};

export type DestroyViewGroupInput = {
  /** The id of the view group to destroy. */
  id: Scalars['UUID'];
};

/** Schema update on a table */
export enum DistantTableUpdate {
  COLUMNS_ADDED = 'COLUMNS_ADDED',
  COLUMNS_DELETED = 'COLUMNS_DELETED',
  COLUMNS_TYPE_CHANGED = 'COLUMNS_TYPE_CHANGED',
  TABLE_DELETED = 'TABLE_DELETED'
}

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

export type EditSsoInput = {
  id: Scalars['UUID'];
  status: SsoIdentityProviderStatus;
};

export type EditSsoOutput = {
  __typename?: 'EditSsoOutput';
  id: Scalars['UUID'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type EmailAccountConnectionParameters = {
  CALDAV?: InputMaybe<ConnectionParameters>;
  IMAP?: InputMaybe<ConnectionParameters>;
  SMTP?: InputMaybe<ConnectionParameters>;
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

export type ExecuteServerlessFunctionInput = {
  /** Id of the serverless function to execute */
  id: Scalars['UUID'];
  /** Payload in JSON format */
  payload: Scalars['JSON'];
  /** Version of the serverless function to execute */
  version?: Scalars['String'];
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
  IS_AIRTABLE_INTEGRATION_ENABLED = 'IS_AIRTABLE_INTEGRATION_ENABLED',
  IS_AI_ENABLED = 'IS_AI_ENABLED',
  IS_APPLICATION_ENABLED = 'IS_APPLICATION_ENABLED',
  IS_DASHBOARD_V2_ENABLED = 'IS_DASHBOARD_V2_ENABLED',
  IS_EMAILING_DOMAIN_ENABLED = 'IS_EMAILING_DOMAIN_ENABLED',
  IS_IF_ELSE_ENABLED = 'IS_IF_ELSE_ENABLED',
  IS_JSON_FILTER_ENABLED = 'IS_JSON_FILTER_ENABLED',
  IS_PAGE_LAYOUT_ENABLED = 'IS_PAGE_LAYOUT_ENABLED',
  IS_POSTGRESQL_INTEGRATION_ENABLED = 'IS_POSTGRESQL_INTEGRATION_ENABLED',
  IS_PUBLIC_DOMAIN_ENABLED = 'IS_PUBLIC_DOMAIN_ENABLED',
  IS_RECORD_PAGE_LAYOUT_ENABLED = 'IS_RECORD_PAGE_LAYOUT_ENABLED',
  IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED = 'IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED',
  IS_STRIPE_INTEGRATION_ENABLED = 'IS_STRIPE_INTEGRATION_ENABLED',
  IS_TIMELINE_ACTIVITY_MIGRATED = 'IS_TIMELINE_ACTIVITY_MIGRATED',
  IS_UNIQUE_INDEXES_ENABLED = 'IS_UNIQUE_INDEXES_ENABLED',
  IS_WORKSPACE_CREATION_V2_ENABLED = 'IS_WORKSPACE_CREATION_V2_ENABLED'
}

export type Field = {
  __typename?: 'Field';
  applicationId?: Maybe<Scalars['UUID']>;
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

export type FieldPermissionInput = {
  canReadFieldValue?: InputMaybe<Scalars['Boolean']>;
  canUpdateFieldValue?: InputMaybe<Scalars['Boolean']>;
  fieldMetadataId: Scalars['UUID'];
  objectMetadataId: Scalars['UUID'];
};

export type File = {
  __typename?: 'File';
  createdAt: Scalars['DateTime'];
  fullPath: Scalars['String'];
  id: Scalars['UUID'];
  name: Scalars['String'];
  size: Scalars['Float'];
  type: Scalars['String'];
};

export enum FileFolder {
  AgentChat = 'AgentChat',
  Attachment = 'Attachment',
  File = 'File',
  PersonPicture = 'PersonPicture',
  ProfilePicture = 'ProfilePicture',
  ServerlessFunction = 'ServerlessFunction',
  ServerlessFunctionToDelete = 'ServerlessFunctionToDelete',
  WorkspaceLogo = 'WorkspaceLogo'
}

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

export type FindManyRemoteTablesInput = {
  /** The id of the remote server. */
  id: Scalars['ID'];
  /** Indicates if pending schema updates status should be computed. */
  shouldFetchPendingSchemaUpdates?: InputMaybe<Scalars['Boolean']>;
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

export type GetApiKeyInput = {
  id: Scalars['UUID'];
};

export type GetAuthorizationUrlForSsoInput = {
  identityProviderId: Scalars['UUID'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
};

export type GetAuthorizationUrlForSsoOutput = {
  __typename?: 'GetAuthorizationUrlForSSOOutput';
  authorizationURL: Scalars['String'];
  id: Scalars['UUID'];
  type: Scalars['String'];
};

export type GetServerlessFunctionSourceCodeInput = {
  /** The id of the function. */
  id: Scalars['ID'];
  /** The version of the function */
  version?: Scalars['String'];
};

export type GetWebhookInput = {
  id: Scalars['UUID'];
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

export type GridPositionInput = {
  column: Scalars['Float'];
  columnSpan: Scalars['Float'];
  row: Scalars['Float'];
  rowSpan: Scalars['Float'];
};

export enum HttpMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT'
}

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

export type LoginTokenOutput = {
  __typename?: 'LoginTokenOutput';
  loginToken: AuthToken;
};

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
  SUBJECT = 'SUBJECT'
}

export enum ModelProvider {
  ANTHROPIC = 'ANTHROPIC',
  NONE = 'NONE',
  OPENAI = 'OPENAI',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE',
  XAI = 'XAI'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateSkill: Skill;
  activateWorkflowVersion: Scalars['Boolean'];
  activateWorkspace: Workspace;
  assignRoleToAgent: Scalars['Boolean'];
  assignRoleToApiKey: Scalars['Boolean'];
  authorizeApp: AuthorizeAppOutput;
  cancelSwitchBillingInterval: BillingUpdateOutput;
  cancelSwitchBillingPlan: BillingUpdateOutput;
  cancelSwitchMeteredPrice: BillingUpdateOutput;
  checkCustomDomainValidRecords?: Maybe<DomainValidRecords>;
  checkPublicDomainValidRecords?: Maybe<DomainValidRecords>;
  checkoutSession: BillingSessionOutput;
  computeStepOutputSchema: Scalars['JSON'];
  createApiKey: ApiKey;
  createApprovedAccessDomain: ApprovedAccessDomain;
  createChatThread: AgentChatThread;
  createCoreView: CoreView;
  createCoreViewField: CoreViewField;
  createCoreViewFilter: CoreViewFilter;
  createCoreViewFilterGroup: CoreViewFilterGroup;
  createCoreViewGroup: CoreViewGroup;
  createCoreViewSort: CoreViewSort;
  createDatabaseConfigVariable: Scalars['Boolean'];
  createDraftFromWorkflowVersion: WorkflowVersionDto;
  createEmailingDomain: EmailingDomain;
  createFile: File;
  createManyCoreViewFields: Array<CoreViewField>;
  createManyCoreViewGroups: Array<CoreViewGroup>;
  createOIDCIdentityProvider: SetupSsoOutput;
  createObjectEvent: Analytics;
  createOneAgent: Agent;
  createOneAppToken: AppToken;
  createOneCronTrigger: CronTrigger;
  createOneDatabaseEventTrigger: DatabaseEventTrigger;
  createOneField: Field;
  createOneObject: Object;
  createOneRemoteServer: RemoteServer;
  createOneRole: Role;
  createOneRouteTrigger: RouteTrigger;
  createOneServerlessFunction: ServerlessFunction;
  createOneServerlessFunctionLayer: ServerlessFunctionLayer;
  createPageLayout: PageLayout;
  createPageLayoutTab: PageLayoutTab;
  createPageLayoutWidget: PageLayoutWidget;
  createPublicDomain: PublicDomain;
  createRowLevelPermissionPredicate: RowLevelPermissionPredicate;
  createRowLevelPermissionPredicateGroup: RowLevelPermissionPredicateGroup;
  createSAMLIdentityProvider: SetupSsoOutput;
  createSkill: Skill;
  createWebhook: Webhook;
  createWorkflowVersionEdge: WorkflowVersionStepChanges;
  createWorkflowVersionStep: WorkflowVersionStepChanges;
  deactivateSkill: Skill;
  deactivateWorkflowVersion: Scalars['Boolean'];
  deleteApprovedAccessDomain: Scalars['Boolean'];
  deleteCoreView: Scalars['Boolean'];
  deleteCoreViewField: CoreViewField;
  deleteCoreViewFilter: CoreViewFilter;
  deleteCoreViewFilterGroup: Scalars['Boolean'];
  deleteCoreViewGroup: CoreViewGroup;
  deleteCoreViewSort: Scalars['Boolean'];
  deleteCurrentWorkspace: Workspace;
  deleteDatabaseConfigVariable: Scalars['Boolean'];
  deleteEmailingDomain: Scalars['Boolean'];
  deleteFile: File;
  deleteJobs: DeleteJobsResponse;
  deleteOneAgent: Agent;
  deleteOneCronTrigger: CronTrigger;
  deleteOneDatabaseEventTrigger: DatabaseEventTrigger;
  deleteOneField: Field;
  deleteOneObject: Object;
  deleteOneRemoteServer: RemoteServer;
  deleteOneRole: Scalars['String'];
  deleteOneRouteTrigger: RouteTrigger;
  deleteOneServerlessFunction: ServerlessFunction;
  deletePageLayout: PageLayout;
  deletePageLayoutTab: Scalars['Boolean'];
  deletePageLayoutWidget: PageLayoutWidget;
  deletePublicDomain: Scalars['Boolean'];
  deleteRowLevelPermissionPredicate: RowLevelPermissionPredicate;
  deleteRowLevelPermissionPredicateGroup: RowLevelPermissionPredicateGroup;
  deleteSSOIdentityProvider: DeleteSsoOutput;
  deleteSkill: Skill;
  deleteTwoFactorAuthenticationMethod: DeleteTwoFactorAuthenticationMethodOutput;
  deleteUser: User;
  deleteUserFromWorkspace: UserWorkspace;
  deleteWebhook: Scalars['Boolean'];
  deleteWorkflowVersionEdge: WorkflowVersionStepChanges;
  deleteWorkflowVersionStep: WorkflowVersionStepChanges;
  deleteWorkspaceInvitation: Scalars['String'];
  destroyCoreView: Scalars['Boolean'];
  destroyCoreViewField: CoreViewField;
  destroyCoreViewFilter: CoreViewFilter;
  destroyCoreViewFilterGroup: Scalars['Boolean'];
  destroyCoreViewGroup: CoreViewGroup;
  destroyCoreViewSort: Scalars['Boolean'];
  destroyPageLayout: Scalars['Boolean'];
  destroyPageLayoutTab: Scalars['Boolean'];
  destroyPageLayoutWidget: Scalars['Boolean'];
  disablePostgresProxy: PostgresCredentials;
  dismissReconnectAccountBanner: Scalars['Boolean'];
  duplicateDashboard: DuplicatedDashboard;
  duplicateWorkflow: WorkflowVersionDto;
  duplicateWorkflowVersionStep: WorkflowVersionStepChanges;
  editSSOIdentityProvider: EditSsoOutput;
  emailPasswordResetLink: EmailPasswordResetLinkOutput;
  enablePostgresProxy: PostgresCredentials;
  endSubscriptionTrialPeriod: BillingEndTrialPeriodOutput;
  evaluateAgentTurn: AgentTurnEvaluation;
  executeOneServerlessFunction: ServerlessFunctionExecutionResult;
  generateApiKeyToken: ApiKeyToken;
  generateTransientToken: TransientTokenOutput;
  getAuthTokensFromLoginToken: AuthTokens;
  getAuthTokensFromOTP: AuthTokens;
  getAuthorizationUrlForSSO: GetAuthorizationUrlForSsoOutput;
  getLoginTokenFromCredentials: LoginTokenOutput;
  impersonate: ImpersonateOutput;
  initiateOTPProvisioning: InitiateTwoFactorAuthenticationProvisioningOutput;
  initiateOTPProvisioningForAuthenticatedUser: InitiateTwoFactorAuthenticationProvisioningOutput;
  publishServerlessFunction: ServerlessFunction;
  removeRoleFromAgent: Scalars['Boolean'];
  renewToken: AuthTokens;
  resendEmailVerificationToken: ResendEmailVerificationTokenOutput;
  resendWorkspaceInvitation: SendInvitationsOutput;
  restorePageLayout: PageLayout;
  restorePageLayoutTab: PageLayoutTab;
  restorePageLayoutWidget: PageLayoutWidget;
  retryJobs: RetryJobsResponse;
  revokeApiKey?: Maybe<ApiKey>;
  runEvaluationInput: AgentTurn;
  runWorkflowVersion: RunWorkflowVersionOutput;
  saveImapSmtpCaldavAccount: ImapSmtpCaldavConnectionSuccess;
  sendInvitations: SendInvitationsOutput;
  setMeteredSubscriptionPrice: BillingUpdateOutput;
  signIn: AvailableWorkspacesAndAccessTokensOutput;
  signUp: AvailableWorkspacesAndAccessTokensOutput;
  signUpInNewWorkspace: SignUpOutput;
  signUpInWorkspace: SignUpOutput;
  skipBookOnboardingStep: OnboardingStepSuccess;
  skipSyncEmailOnboardingStep: OnboardingStepSuccess;
  startChannelSync: ChannelSyncSuccess;
  stopWorkflowRun: WorkflowRun;
  submitFormStep: Scalars['Boolean'];
  switchBillingPlan: BillingUpdateOutput;
  switchSubscriptionInterval: BillingUpdateOutput;
  syncApplication: Scalars['Boolean'];
  syncRemoteTable: RemoteTable;
  syncRemoteTableSchemaChanges: RemoteTable;
  testHttpRequest: TestHttpRequestOutput;
  trackAnalytics: Analytics;
  uninstallApplication: Scalars['Boolean'];
  unsyncRemoteTable: RemoteTable;
  updateApiKey?: Maybe<ApiKey>;
  updateCoreView: CoreView;
  updateCoreViewField: CoreViewField;
  updateCoreViewFilter: CoreViewFilter;
  updateCoreViewFilterGroup: CoreViewFilterGroup;
  updateCoreViewGroup: CoreViewGroup;
  updateCoreViewSort: CoreViewSort;
  updateDatabaseConfigVariable: Scalars['Boolean'];
  updateLabPublicFeatureFlag: FeatureFlagDto;
  updateOneAgent: Agent;
  updateOneApplicationVariable: Scalars['Boolean'];
  updateOneCronTrigger: CronTrigger;
  updateOneDatabaseEventTrigger: DatabaseEventTrigger;
  updateOneField: Field;
  updateOneObject: Object;
  updateOneRemoteServer: RemoteServer;
  updateOneRole: Role;
  updateOneRouteTrigger: RouteTrigger;
  updateOneServerlessFunction: ServerlessFunction;
  updatePageLayout: PageLayout;
  updatePageLayoutTab: PageLayoutTab;
  updatePageLayoutWidget: PageLayoutWidget;
  updatePageLayoutWithTabsAndWidgets: PageLayout;
  updatePasswordViaResetToken: InvalidatePasswordOutput;
  updateRowLevelPermissionPredicate: RowLevelPermissionPredicate;
  updateRowLevelPermissionPredicateGroup: RowLevelPermissionPredicateGroup;
  updateSkill: Skill;
  updateUserEmail: Scalars['Boolean'];
  updateWebhook?: Maybe<Webhook>;
  updateWorkflowRunStep: WorkflowAction;
  updateWorkflowVersionPositions: Scalars['Boolean'];
  updateWorkflowVersionStep: WorkflowAction;
  updateWorkspace: Workspace;
  updateWorkspaceFeatureFlag: Scalars['Boolean'];
  updateWorkspaceMemberRole: WorkspaceMember;
  uploadFile: SignedFile;
  uploadImage: SignedFile;
  uploadWorkspaceLogo: SignedFile;
  uploadWorkspaceMemberProfilePicture: SignedFile;
  upsertFieldPermissions: Array<FieldPermission>;
  upsertObjectPermissions: Array<ObjectPermission>;
  upsertPermissionFlags: Array<PermissionFlag>;
  userLookupAdminPanel: UserLookup;
  validateApprovedAccessDomain: ApprovedAccessDomain;
  verifyEmailAndGetLoginToken: VerifyEmailAndGetLoginTokenOutput;
  verifyEmailAndGetWorkspaceAgnosticToken: AvailableWorkspacesAndAccessTokensOutput;
  verifyEmailingDomain: EmailingDomain;
  verifyTwoFactorAuthenticationMethodForAuthenticatedUser: VerifyTwoFactorAuthenticationMethodOutput;
};


export type MutationActivateSkillArgs = {
  id: Scalars['UUID'];
};


export type MutationActivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['UUID'];
};


export type MutationActivateWorkspaceArgs = {
  data: ActivateWorkspaceInput;
};


export type MutationAssignRoleToAgentArgs = {
  agentId: Scalars['UUID'];
  roleId: Scalars['UUID'];
};


export type MutationAssignRoleToApiKeyArgs = {
  apiKeyId: Scalars['UUID'];
  roleId: Scalars['UUID'];
};


export type MutationAuthorizeAppArgs = {
  clientId: Scalars['String'];
  codeChallenge?: InputMaybe<Scalars['String']>;
  redirectUrl: Scalars['String'];
};


export type MutationCheckPublicDomainValidRecordsArgs = {
  domain: Scalars['String'];
};


export type MutationCheckoutSessionArgs = {
  plan?: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
  requirePaymentMethod?: Scalars['Boolean'];
  successUrlPath?: InputMaybe<Scalars['String']>;
};


export type MutationComputeStepOutputSchemaArgs = {
  input: ComputeStepOutputSchemaInput;
};


export type MutationCreateApiKeyArgs = {
  input: CreateApiKeyInput;
};


export type MutationCreateApprovedAccessDomainArgs = {
  input: CreateApprovedAccessDomainInput;
};


export type MutationCreateCoreViewArgs = {
  input: CreateViewInput;
};


export type MutationCreateCoreViewFieldArgs = {
  input: CreateViewFieldInput;
};


export type MutationCreateCoreViewFilterArgs = {
  input: CreateViewFilterInput;
};


export type MutationCreateCoreViewFilterGroupArgs = {
  input: CreateViewFilterGroupInput;
};


export type MutationCreateCoreViewGroupArgs = {
  input: CreateViewGroupInput;
};


export type MutationCreateCoreViewSortArgs = {
  input: CreateViewSortInput;
};


export type MutationCreateDatabaseConfigVariableArgs = {
  key: Scalars['String'];
  value: Scalars['JSON'];
};


export type MutationCreateDraftFromWorkflowVersionArgs = {
  input: CreateDraftFromWorkflowVersionInput;
};


export type MutationCreateEmailingDomainArgs = {
  domain: Scalars['String'];
  driver: EmailingDomainDriver;
};


export type MutationCreateFileArgs = {
  file: Scalars['Upload'];
};


export type MutationCreateManyCoreViewFieldsArgs = {
  inputs: Array<CreateViewFieldInput>;
};


export type MutationCreateManyCoreViewGroupsArgs = {
  inputs: Array<CreateViewGroupInput>;
};


export type MutationCreateOidcIdentityProviderArgs = {
  input: SetupOidcSsoInput;
};


export type MutationCreateObjectEventArgs = {
  event: Scalars['String'];
  objectMetadataId: Scalars['UUID'];
  properties?: InputMaybe<Scalars['JSON']>;
  recordId: Scalars['UUID'];
};


export type MutationCreateOneAgentArgs = {
  input: CreateAgentInput;
};


export type MutationCreateOneAppTokenArgs = {
  input: CreateOneAppTokenInput;
};


export type MutationCreateOneCronTriggerArgs = {
  input: CreateCronTriggerInput;
};


export type MutationCreateOneDatabaseEventTriggerArgs = {
  input: CreateDatabaseEventTriggerInput;
};


export type MutationCreateOneFieldArgs = {
  input: CreateOneFieldMetadataInput;
};


export type MutationCreateOneObjectArgs = {
  input: CreateOneObjectInput;
};


export type MutationCreateOneRemoteServerArgs = {
  input: CreateRemoteServerInput;
};


export type MutationCreateOneRoleArgs = {
  createRoleInput: CreateRoleInput;
};


export type MutationCreateOneRouteTriggerArgs = {
  input: CreateRouteTriggerInput;
};


export type MutationCreateOneServerlessFunctionArgs = {
  input: CreateServerlessFunctionInput;
};


export type MutationCreateOneServerlessFunctionLayerArgs = {
  packageJson: Scalars['JSON'];
  yarnLock: Scalars['String'];
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
  domain: Scalars['String'];
};


export type MutationCreateRowLevelPermissionPredicateArgs = {
  input: CreateRowLevelPermissionPredicateInput;
};


export type MutationCreateRowLevelPermissionPredicateGroupArgs = {
  input: CreateRowLevelPermissionPredicateGroupInput;
};


export type MutationCreateSamlIdentityProviderArgs = {
  input: SetupSamlSsoInput;
};


export type MutationCreateSkillArgs = {
  input: CreateSkillInput;
};


export type MutationCreateWebhookArgs = {
  input: CreateWebhookInput;
};


export type MutationCreateWorkflowVersionEdgeArgs = {
  input: CreateWorkflowVersionEdgeInput;
};


export type MutationCreateWorkflowVersionStepArgs = {
  input: CreateWorkflowVersionStepInput;
};


export type MutationDeactivateSkillArgs = {
  id: Scalars['UUID'];
};


export type MutationDeactivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['UUID'];
};


export type MutationDeleteApprovedAccessDomainArgs = {
  input: DeleteApprovedAccessDomainInput;
};


export type MutationDeleteCoreViewArgs = {
  id: Scalars['String'];
};


export type MutationDeleteCoreViewFieldArgs = {
  input: DeleteViewFieldInput;
};


export type MutationDeleteCoreViewFilterArgs = {
  input: DeleteViewFilterInput;
};


export type MutationDeleteCoreViewFilterGroupArgs = {
  id: Scalars['String'];
};


export type MutationDeleteCoreViewGroupArgs = {
  input: DeleteViewGroupInput;
};


export type MutationDeleteCoreViewSortArgs = {
  id: Scalars['String'];
};


export type MutationDeleteDatabaseConfigVariableArgs = {
  key: Scalars['String'];
};


export type MutationDeleteEmailingDomainArgs = {
  id: Scalars['String'];
};


export type MutationDeleteFileArgs = {
  fileId: Scalars['UUID'];
};


export type MutationDeleteJobsArgs = {
  jobIds: Array<Scalars['String']>;
  queueName: Scalars['String'];
};


export type MutationDeleteOneAgentArgs = {
  input: AgentIdInput;
};


export type MutationDeleteOneCronTriggerArgs = {
  input: CronTriggerIdInput;
};


export type MutationDeleteOneDatabaseEventTriggerArgs = {
  input: DatabaseEventTriggerIdInput;
};


export type MutationDeleteOneFieldArgs = {
  input: DeleteOneFieldInput;
};


export type MutationDeleteOneObjectArgs = {
  input: DeleteOneObjectInput;
};


export type MutationDeleteOneRemoteServerArgs = {
  input: RemoteServerIdInput;
};


export type MutationDeleteOneRoleArgs = {
  roleId: Scalars['UUID'];
};


export type MutationDeleteOneRouteTriggerArgs = {
  input: RouteTriggerIdInput;
};


export type MutationDeleteOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type MutationDeletePageLayoutArgs = {
  id: Scalars['String'];
};


export type MutationDeletePageLayoutTabArgs = {
  id: Scalars['String'];
};


export type MutationDeletePageLayoutWidgetArgs = {
  id: Scalars['String'];
};


export type MutationDeletePublicDomainArgs = {
  domain: Scalars['String'];
};


export type MutationDeleteRowLevelPermissionPredicateArgs = {
  input: DeleteRowLevelPermissionPredicateInput;
};


export type MutationDeleteRowLevelPermissionPredicateGroupArgs = {
  input: DeleteRowLevelPermissionPredicateGroupInput;
};


export type MutationDeleteSsoIdentityProviderArgs = {
  input: DeleteSsoInput;
};


export type MutationDeleteSkillArgs = {
  id: Scalars['UUID'];
};


export type MutationDeleteTwoFactorAuthenticationMethodArgs = {
  twoFactorAuthenticationMethodId: Scalars['UUID'];
};


export type MutationDeleteUserFromWorkspaceArgs = {
  workspaceMemberIdToDelete: Scalars['String'];
};


export type MutationDeleteWebhookArgs = {
  input: DeleteWebhookInput;
};


export type MutationDeleteWorkflowVersionEdgeArgs = {
  input: CreateWorkflowVersionEdgeInput;
};


export type MutationDeleteWorkflowVersionStepArgs = {
  input: DeleteWorkflowVersionStepInput;
};


export type MutationDeleteWorkspaceInvitationArgs = {
  appTokenId: Scalars['String'];
};


export type MutationDestroyCoreViewArgs = {
  id: Scalars['String'];
};


export type MutationDestroyCoreViewFieldArgs = {
  input: DestroyViewFieldInput;
};


export type MutationDestroyCoreViewFilterArgs = {
  input: DestroyViewFilterInput;
};


export type MutationDestroyCoreViewFilterGroupArgs = {
  id: Scalars['String'];
};


export type MutationDestroyCoreViewGroupArgs = {
  input: DestroyViewGroupInput;
};


export type MutationDestroyCoreViewSortArgs = {
  id: Scalars['String'];
};


export type MutationDestroyPageLayoutArgs = {
  id: Scalars['String'];
};


export type MutationDestroyPageLayoutTabArgs = {
  id: Scalars['String'];
};


export type MutationDestroyPageLayoutWidgetArgs = {
  id: Scalars['String'];
};


export type MutationDismissReconnectAccountBannerArgs = {
  connectedAccountId: Scalars['UUID'];
};


export type MutationDuplicateDashboardArgs = {
  id: Scalars['UUID'];
};


export type MutationDuplicateWorkflowArgs = {
  input: DuplicateWorkflowInput;
};


export type MutationDuplicateWorkflowVersionStepArgs = {
  input: DuplicateWorkflowVersionStepInput;
};


export type MutationEditSsoIdentityProviderArgs = {
  input: EditSsoInput;
};


export type MutationEmailPasswordResetLinkArgs = {
  email: Scalars['String'];
  workspaceId: Scalars['UUID'];
};


export type MutationEvaluateAgentTurnArgs = {
  turnId: Scalars['UUID'];
};


export type MutationExecuteOneServerlessFunctionArgs = {
  input: ExecuteServerlessFunctionInput;
};


export type MutationGenerateApiKeyTokenArgs = {
  apiKeyId: Scalars['UUID'];
  expiresAt: Scalars['String'];
};


export type MutationGetAuthTokensFromLoginTokenArgs = {
  loginToken: Scalars['String'];
  origin: Scalars['String'];
};


export type MutationGetAuthTokensFromOtpArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  loginToken: Scalars['String'];
  origin: Scalars['String'];
  otp: Scalars['String'];
};


export type MutationGetAuthorizationUrlForSsoArgs = {
  input: GetAuthorizationUrlForSsoInput;
};


export type MutationGetLoginTokenFromCredentialsArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  origin: Scalars['String'];
  password: Scalars['String'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']>;
};


export type MutationImpersonateArgs = {
  userId: Scalars['UUID'];
  workspaceId: Scalars['UUID'];
};


export type MutationInitiateOtpProvisioningArgs = {
  loginToken: Scalars['String'];
  origin: Scalars['String'];
};


export type MutationPublishServerlessFunctionArgs = {
  input: PublishServerlessFunctionInput;
};


export type MutationRemoveRoleFromAgentArgs = {
  agentId: Scalars['UUID'];
};


export type MutationRenewTokenArgs = {
  appToken: Scalars['String'];
};


export type MutationResendEmailVerificationTokenArgs = {
  email: Scalars['String'];
  origin: Scalars['String'];
};


export type MutationResendWorkspaceInvitationArgs = {
  appTokenId: Scalars['String'];
};


export type MutationRestorePageLayoutArgs = {
  id: Scalars['String'];
};


export type MutationRestorePageLayoutTabArgs = {
  id: Scalars['String'];
};


export type MutationRestorePageLayoutWidgetArgs = {
  id: Scalars['String'];
};


export type MutationRetryJobsArgs = {
  jobIds: Array<Scalars['String']>;
  queueName: Scalars['String'];
};


export type MutationRevokeApiKeyArgs = {
  input: RevokeApiKeyInput;
};


export type MutationRunEvaluationInputArgs = {
  agentId: Scalars['UUID'];
  input: Scalars['String'];
};


export type MutationRunWorkflowVersionArgs = {
  input: RunWorkflowVersionInput;
};


export type MutationSaveImapSmtpCaldavAccountArgs = {
  accountOwnerId: Scalars['UUID'];
  connectionParameters: EmailAccountConnectionParameters;
  handle: Scalars['String'];
  id?: InputMaybe<Scalars['UUID']>;
};


export type MutationSendInvitationsArgs = {
  emails: Array<Scalars['String']>;
};


export type MutationSetMeteredSubscriptionPriceArgs = {
  priceId: Scalars['String'];
};


export type MutationSignInArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']>;
};


export type MutationSignUpArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']>;
};


export type MutationSignUpInWorkspaceArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']>;
  workspaceId?: InputMaybe<Scalars['UUID']>;
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']>;
};


export type MutationStartChannelSyncArgs = {
  connectedAccountId: Scalars['UUID'];
};


export type MutationStopWorkflowRunArgs = {
  workflowRunId: Scalars['UUID'];
};


export type MutationSubmitFormStepArgs = {
  input: SubmitFormStepInput;
};


export type MutationSyncApplicationArgs = {
  manifest: Scalars['JSON'];
  packageJson: Scalars['JSON'];
  yarnLock: Scalars['String'];
};


export type MutationSyncRemoteTableArgs = {
  input: RemoteTableInput;
};


export type MutationSyncRemoteTableSchemaChangesArgs = {
  input: RemoteTableInput;
};


export type MutationTestHttpRequestArgs = {
  input: TestHttpRequestInput;
};


export type MutationTrackAnalyticsArgs = {
  event?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  properties?: InputMaybe<Scalars['JSON']>;
  type: AnalyticsType;
};


export type MutationUninstallApplicationArgs = {
  universalIdentifier: Scalars['String'];
};


export type MutationUnsyncRemoteTableArgs = {
  input: RemoteTableInput;
};


export type MutationUpdateApiKeyArgs = {
  input: UpdateApiKeyInput;
};


export type MutationUpdateCoreViewArgs = {
  id: Scalars['String'];
  input: UpdateViewInput;
};


export type MutationUpdateCoreViewFieldArgs = {
  input: UpdateViewFieldInput;
};


export type MutationUpdateCoreViewFilterArgs = {
  input: UpdateViewFilterInput;
};


export type MutationUpdateCoreViewFilterGroupArgs = {
  id: Scalars['String'];
  input: UpdateViewFilterGroupInput;
};


export type MutationUpdateCoreViewGroupArgs = {
  input: UpdateViewGroupInput;
};


export type MutationUpdateCoreViewSortArgs = {
  id: Scalars['String'];
  input: UpdateViewSortInput;
};


export type MutationUpdateDatabaseConfigVariableArgs = {
  key: Scalars['String'];
  value: Scalars['JSON'];
};


export type MutationUpdateLabPublicFeatureFlagArgs = {
  input: UpdateLabPublicFeatureFlagInput;
};


export type MutationUpdateOneAgentArgs = {
  input: UpdateAgentInput;
};


export type MutationUpdateOneApplicationVariableArgs = {
  applicationId: Scalars['UUID'];
  key: Scalars['String'];
  value: Scalars['String'];
};


export type MutationUpdateOneCronTriggerArgs = {
  input: UpdateCronTriggerInput;
};


export type MutationUpdateOneDatabaseEventTriggerArgs = {
  input: UpdateDatabaseEventTriggerInput;
};


export type MutationUpdateOneFieldArgs = {
  input: UpdateOneFieldMetadataInput;
};


export type MutationUpdateOneObjectArgs = {
  input: UpdateOneObjectInput;
};


export type MutationUpdateOneRemoteServerArgs = {
  input: UpdateRemoteServerInput;
};


export type MutationUpdateOneRoleArgs = {
  updateRoleInput: UpdateRoleInput;
};


export type MutationUpdateOneRouteTriggerArgs = {
  input: UpdateRouteTriggerInput;
};


export type MutationUpdateOneServerlessFunctionArgs = {
  input: UpdateServerlessFunctionInput;
};


export type MutationUpdatePageLayoutArgs = {
  id: Scalars['String'];
  input: UpdatePageLayoutInput;
};


export type MutationUpdatePageLayoutTabArgs = {
  id: Scalars['String'];
  input: UpdatePageLayoutTabInput;
};


export type MutationUpdatePageLayoutWidgetArgs = {
  id: Scalars['String'];
  input: UpdatePageLayoutWidgetInput;
};


export type MutationUpdatePageLayoutWithTabsAndWidgetsArgs = {
  id: Scalars['String'];
  input: UpdatePageLayoutWithTabsInput;
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String'];
  passwordResetToken: Scalars['String'];
};


export type MutationUpdateRowLevelPermissionPredicateArgs = {
  input: UpdateRowLevelPermissionPredicateInput;
};


export type MutationUpdateRowLevelPermissionPredicateGroupArgs = {
  input: UpdateRowLevelPermissionPredicateGroupInput;
};


export type MutationUpdateSkillArgs = {
  input: UpdateSkillInput;
};


export type MutationUpdateUserEmailArgs = {
  newEmail: Scalars['String'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateWebhookArgs = {
  input: UpdateWebhookInput;
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


export type MutationUpdateWorkspaceArgs = {
  data: UpdateWorkspaceInput;
};


export type MutationUpdateWorkspaceFeatureFlagArgs = {
  featureFlag: Scalars['String'];
  value: Scalars['Boolean'];
  workspaceId: Scalars['UUID'];
};


export type MutationUpdateWorkspaceMemberRoleArgs = {
  roleId: Scalars['UUID'];
  workspaceMemberId: Scalars['UUID'];
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
};


export type MutationUploadImageArgs = {
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
};


export type MutationUploadWorkspaceLogoArgs = {
  file: Scalars['Upload'];
};


export type MutationUploadWorkspaceMemberProfilePictureArgs = {
  file: Scalars['Upload'];
};


export type MutationUpsertFieldPermissionsArgs = {
  upsertFieldPermissionsInput: UpsertFieldPermissionsInput;
};


export type MutationUpsertObjectPermissionsArgs = {
  upsertObjectPermissionsInput: UpsertObjectPermissionsInput;
};


export type MutationUpsertPermissionFlagsArgs = {
  upsertPermissionFlagsInput: UpsertPermissionFlagsInput;
};


export type MutationUserLookupAdminPanelArgs = {
  userIdentifier: Scalars['String'];
};


export type MutationValidateApprovedAccessDomainArgs = {
  input: ValidateApprovedAccessDomainInput;
};


export type MutationVerifyEmailAndGetLoginTokenArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  emailVerificationToken: Scalars['String'];
  origin: Scalars['String'];
};


export type MutationVerifyEmailAndGetWorkspaceAgnosticTokenArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  emailVerificationToken: Scalars['String'];
};


export type MutationVerifyEmailingDomainArgs = {
  id: Scalars['String'];
};


export type MutationVerifyTwoFactorAuthenticationMethodForAuthenticatedUserArgs = {
  otp: Scalars['String'];
};

export type NativeModelCapabilities = {
  __typename?: 'NativeModelCapabilities';
  twitterSearch?: Maybe<Scalars['Boolean']>;
  webSearch?: Maybe<Scalars['Boolean']>;
};

export type Object = {
  __typename?: 'Object';
  applicationId?: Maybe<Scalars['UUID']>;
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
};

export type ObjectPermissionInput = {
  canDestroyObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canReadObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canSoftDeleteObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canUpdateObjectRecords?: InputMaybe<Scalars['Boolean']>;
  objectMetadataId: Scalars['UUID'];
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

export type OnDbEventInput = {
  action?: InputMaybe<DatabaseEventAction>;
  objectNameSingular?: InputMaybe<Scalars['String']>;
  recordId?: InputMaybe<Scalars['UUID']>;
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
  id: Scalars['UUID'];
  pageLayoutId: Scalars['UUID'];
  position: Scalars['Float'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  widgets?: Maybe<Array<PageLayoutWidget>>;
};

export enum PageLayoutType {
  DASHBOARD = 'DASHBOARD',
  RECORD_INDEX = 'RECORD_INDEX',
  RECORD_PAGE = 'RECORD_PAGE'
}

export type PageLayoutWidget = {
  __typename?: 'PageLayoutWidget';
  configuration: WidgetConfiguration;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  gridPosition: GridPosition;
  id: Scalars['UUID'];
  objectMetadataId?: Maybe<Scalars['UUID']>;
  pageLayoutTabId: Scalars['UUID'];
  title: Scalars['String'];
  type: WidgetType;
  updatedAt: Scalars['DateTime'];
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
  imagePath: Scalars['String'];
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

export type PublishServerlessFunctionInput = {
  /** The id of the function. */
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  agentTurns: Array<AgentTurn>;
  apiKey?: Maybe<ApiKey>;
  apiKeys: Array<ApiKey>;
  billingPortalSession: BillingSessionOutput;
  chatMessages: Array<AgentMessage>;
  chatThread: AgentChatThread;
  chatThreads: Array<AgentChatThread>;
  checkUserExists: CheckUserExistOutput;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValidOutput;
  currentUser: User;
  currentWorkspace: Workspace;
  field: Field;
  fields: FieldConnection;
  findDistantTablesWithStatus: Array<RemoteTable>;
  findManyAgents: Array<Agent>;
  findManyApplications: Array<Application>;
  findManyCronTriggers: Array<CronTrigger>;
  findManyDatabaseEventTriggers: Array<DatabaseEventTrigger>;
  findManyPublicDomains: Array<PublicDomain>;
  findManyRemoteServersByType: Array<RemoteServer>;
  findManyRouteTriggers: Array<RouteTrigger>;
  findManyServerlessFunctions: Array<ServerlessFunction>;
  findOneAgent: Agent;
  findOneApplication: Application;
  findOneCronTrigger: CronTrigger;
  findOneDatabaseEventTrigger: DatabaseEventTrigger;
  findOneRemoteServerById: RemoteServer;
  findOneRouteTrigger: RouteTrigger;
  findOneServerlessFunction: ServerlessFunction;
  findWorkspaceFromInviteHash: Workspace;
  findWorkspaceInvitations: Array<WorkspaceInvitation>;
  getAddressDetails: PlaceDetailsResult;
  getApprovedAccessDomains: Array<ApprovedAccessDomain>;
  getAutoCompleteAddress: Array<AutocompleteResult>;
  getAvailablePackages: Scalars['JSON'];
  getConfigVariablesGrouped: ConfigVariablesOutput;
  getConnectedImapSmtpCaldavAccount: ConnectedImapSmtpCaldavAccount;
  getCoreView?: Maybe<CoreView>;
  getCoreViewField?: Maybe<CoreViewField>;
  getCoreViewFields: Array<CoreViewField>;
  getCoreViewFilter?: Maybe<CoreViewFilter>;
  getCoreViewFilterGroup?: Maybe<CoreViewFilterGroup>;
  getCoreViewFilterGroups: Array<CoreViewFilterGroup>;
  getCoreViewFilters: Array<CoreViewFilter>;
  getCoreViewGroup?: Maybe<CoreViewGroup>;
  getCoreViewGroups: Array<CoreViewGroup>;
  getCoreViewSort?: Maybe<CoreViewSort>;
  getCoreViewSorts: Array<CoreViewSort>;
  getCoreViews: Array<CoreView>;
  getDatabaseConfigVariable: ConfigVariable;
  getEmailingDomains: Array<EmailingDomain>;
  getIndicatorHealthStatus: AdminPanelHealthServiceData;
  getMeteredProductsUsage: Array<BillingMeteredProductUsageOutput>;
  getPageLayout?: Maybe<PageLayout>;
  getPageLayoutTab: PageLayoutTab;
  getPageLayoutTabs: Array<PageLayoutTab>;
  getPageLayoutWidget: PageLayoutWidget;
  getPageLayoutWidgets: Array<PageLayoutWidget>;
  getPageLayouts: Array<PageLayout>;
  getPostgresCredentials?: Maybe<PostgresCredentials>;
  getPublicWorkspaceDataByDomain: PublicWorkspaceDataOutput;
  getQueueJobs: QueueJobsResponse;
  getQueueMetrics: QueueMetricsData;
  getRoles: Array<Role>;
  getRowLevelPermissionPredicate?: Maybe<RowLevelPermissionPredicate>;
  getRowLevelPermissionPredicateGroups: Array<RowLevelPermissionPredicateGroup>;
  getRowLevelPermissionPredicates: Array<RowLevelPermissionPredicate>;
  getSSOIdentityProviders: Array<FindAvailableSsoidpOutput>;
  getServerlessFunctionSourceCode?: Maybe<Scalars['JSON']>;
  getSystemHealthStatus: SystemHealth;
  getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromOpportunityId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal;
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromOpportunityId: TimelineThreadsWithTotal;
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  getToolIndex: Array<ToolIndexEntry>;
  index: Index;
  indexMetadatas: IndexConnection;
  listPlans: Array<BillingPlanOutput>;
  object: Object;
  objects: ObjectConnection;
  search: SearchResultConnection;
  skill?: Maybe<Skill>;
  skills: Array<Skill>;
  validatePasswordResetToken: ValidatePasswordResetTokenOutput;
  versionInfo: VersionInfo;
  webhook?: Maybe<Webhook>;
  webhooks: Array<Webhook>;
};


export type QueryAgentTurnsArgs = {
  agentId: Scalars['UUID'];
};


export type QueryApiKeyArgs = {
  input: GetApiKeyInput;
};


export type QueryBillingPortalSessionArgs = {
  returnUrlPath?: InputMaybe<Scalars['String']>;
};


export type QueryChatMessagesArgs = {
  threadId: Scalars['UUID'];
};


export type QueryChatThreadArgs = {
  id: Scalars['UUID'];
};


export type QueryCheckUserExistsArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String'];
};


export type QueryFieldArgs = {
  id: Scalars['UUID'];
};


export type QueryFieldsArgs = {
  filter?: FieldFilter;
  paging?: CursorPaging;
};


export type QueryFindDistantTablesWithStatusArgs = {
  input: FindManyRemoteTablesInput;
};


export type QueryFindManyRemoteServersByTypeArgs = {
  input: RemoteServerTypeInput;
};


export type QueryFindOneAgentArgs = {
  input: AgentIdInput;
};


export type QueryFindOneApplicationArgs = {
  id: Scalars['UUID'];
};


export type QueryFindOneCronTriggerArgs = {
  input: CronTriggerIdInput;
};


export type QueryFindOneDatabaseEventTriggerArgs = {
  input: DatabaseEventTriggerIdInput;
};


export type QueryFindOneRemoteServerByIdArgs = {
  input: RemoteServerIdInput;
};


export type QueryFindOneRouteTriggerArgs = {
  input: RouteTriggerIdInput;
};


export type QueryFindOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String'];
};


export type QueryGetAddressDetailsArgs = {
  placeId: Scalars['String'];
  token: Scalars['String'];
};


export type QueryGetAutoCompleteAddressArgs = {
  address: Scalars['String'];
  country?: InputMaybe<Scalars['String']>;
  isFieldCity?: InputMaybe<Scalars['Boolean']>;
  token: Scalars['String'];
};


export type QueryGetAvailablePackagesArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryGetConnectedImapSmtpCaldavAccountArgs = {
  id: Scalars['UUID'];
};


export type QueryGetCoreViewArgs = {
  id: Scalars['String'];
};


export type QueryGetCoreViewFieldArgs = {
  id: Scalars['String'];
};


export type QueryGetCoreViewFieldsArgs = {
  viewId: Scalars['String'];
};


export type QueryGetCoreViewFilterArgs = {
  id: Scalars['String'];
};


export type QueryGetCoreViewFilterGroupArgs = {
  id: Scalars['String'];
};


export type QueryGetCoreViewFilterGroupsArgs = {
  viewId?: InputMaybe<Scalars['String']>;
};


export type QueryGetCoreViewFiltersArgs = {
  viewId?: InputMaybe<Scalars['String']>;
};


export type QueryGetCoreViewGroupArgs = {
  id: Scalars['String'];
};


export type QueryGetCoreViewGroupsArgs = {
  viewId?: InputMaybe<Scalars['String']>;
};


export type QueryGetCoreViewSortArgs = {
  id: Scalars['String'];
};


export type QueryGetCoreViewSortsArgs = {
  viewId?: InputMaybe<Scalars['String']>;
};


export type QueryGetCoreViewsArgs = {
  objectMetadataId?: InputMaybe<Scalars['String']>;
};


export type QueryGetDatabaseConfigVariableArgs = {
  key: Scalars['String'];
};


export type QueryGetIndicatorHealthStatusArgs = {
  indicatorId: HealthIndicatorId;
};


export type QueryGetPageLayoutArgs = {
  id: Scalars['String'];
};


export type QueryGetPageLayoutTabArgs = {
  id: Scalars['String'];
};


export type QueryGetPageLayoutTabsArgs = {
  pageLayoutId: Scalars['String'];
};


export type QueryGetPageLayoutWidgetArgs = {
  id: Scalars['String'];
};


export type QueryGetPageLayoutWidgetsArgs = {
  pageLayoutTabId: Scalars['String'];
};


export type QueryGetPageLayoutsArgs = {
  objectMetadataId?: InputMaybe<Scalars['String']>;
};


export type QueryGetPublicWorkspaceDataByDomainArgs = {
  origin?: InputMaybe<Scalars['String']>;
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


export type QueryGetRowLevelPermissionPredicateArgs = {
  id: Scalars['String'];
};


export type QueryGetRowLevelPermissionPredicateGroupsArgs = {
  roleId?: InputMaybe<Scalars['String']>;
};


export type QueryGetRowLevelPermissionPredicatesArgs = {
  objectMetadataId?: InputMaybe<Scalars['String']>;
  roleId?: InputMaybe<Scalars['String']>;
};


export type QueryGetServerlessFunctionSourceCodeArgs = {
  input: GetServerlessFunctionSourceCodeInput;
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


export type QueryIndexArgs = {
  id: Scalars['UUID'];
};


export type QueryIndexMetadatasArgs = {
  filter?: IndexFilter;
  paging?: CursorPaging;
};


export type QueryObjectArgs = {
  id: Scalars['UUID'];
};


export type QueryObjectsArgs = {
  filter?: ObjectFilter;
  paging?: CursorPaging;
};


export type QuerySearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']>>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  searchInput: Scalars['String'];
};


export type QuerySkillArgs = {
  id: Scalars['UUID'];
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String'];
};


export type QueryWebhookArgs = {
  input: GetWebhookInput;
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

export type RemoteServer = {
  __typename?: 'RemoteServer';
  createdAt: Scalars['DateTime'];
  foreignDataWrapperId: Scalars['UUID'];
  foreignDataWrapperOptions?: Maybe<Scalars['JSON']>;
  foreignDataWrapperType: Scalars['String'];
  id: Scalars['UUID'];
  label: Scalars['String'];
  schema?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  userMappingOptions?: Maybe<UserMappingOptionsUser>;
};

export type RemoteServerIdInput = {
  /** The id of the record. */
  id: Scalars['ID'];
};

export type RemoteServerTypeInput = {
  foreignDataWrapperType: Scalars['String'];
};

export type RemoteTable = {
  __typename?: 'RemoteTable';
  id?: Maybe<Scalars['UUID']>;
  name: Scalars['String'];
  schema?: Maybe<Scalars['String']>;
  schemaPendingUpdates?: Maybe<Array<DistantTableUpdate>>;
  status: RemoteTableStatus;
};

export type RemoteTableInput = {
  name: Scalars['String'];
  remoteServerId: Scalars['UUID'];
};

/** Status of the table */
export enum RemoteTableStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  SYNCED = 'SYNCED'
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

export type RevokeApiKeyInput = {
  id: Scalars['UUID'];
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
  standardId?: Maybe<Scalars['UUID']>;
  universalIdentifier?: Maybe<Scalars['UUID']>;
  workspaceMembers: Array<WorkspaceMember>;
};

export type RouteTrigger = {
  __typename?: 'RouteTrigger';
  createdAt: Scalars['DateTime'];
  httpMethod: HttpMethod;
  id: Scalars['ID'];
  isAuthRequired: Scalars['Boolean'];
  path: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type RouteTriggerIdInput = {
  id: Scalars['String'];
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

export type ServerlessFunction = {
  __typename?: 'ServerlessFunction';
  applicationId?: Maybe<Scalars['UUID']>;
  createdAt: Scalars['DateTime'];
  cronTriggers?: Maybe<Array<CronTrigger>>;
  databaseEventTriggers?: Maybe<Array<DatabaseEventTrigger>>;
  description?: Maybe<Scalars['String']>;
  handlerName: Scalars['String'];
  handlerPath: Scalars['String'];
  id: Scalars['UUID'];
  isTool: Scalars['Boolean'];
  latestVersion?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  publishedVersions: Array<Scalars['String']>;
  routeTriggers?: Maybe<Array<RouteTrigger>>;
  runtime: Scalars['String'];
  timeoutSeconds: Scalars['Float'];
  toolInputSchema?: Maybe<Scalars['JSON']>;
  updatedAt: Scalars['DateTime'];
};

export type ServerlessFunctionExecutionResult = {
  __typename?: 'ServerlessFunctionExecutionResult';
  /** Execution result in JSON format */
  data?: Maybe<Scalars['JSON']>;
  /** Execution duration in milliseconds */
  duration: Scalars['Float'];
  /** Execution error in JSON format */
  error?: Maybe<Scalars['JSON']>;
  /** Execution Logs */
  logs: Scalars['String'];
  /** Execution status */
  status: ServerlessFunctionExecutionStatus;
};

/** Status of the serverless function execution */
export enum ServerlessFunctionExecutionStatus {
  ERROR = 'ERROR',
  IDLE = 'IDLE',
  SUCCESS = 'SUCCESS'
}

export type ServerlessFunctionIdInput = {
  /** The id of the function. */
  id: Scalars['ID'];
};

export type ServerlessFunctionLayer = {
  __typename?: 'ServerlessFunctionLayer';
  applicationId?: Maybe<Scalars['UUID']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  updatedAt: Scalars['DateTime'];
};

export type ServerlessFunctionLogs = {
  __typename?: 'ServerlessFunctionLogs';
  /** Execution Logs */
  logs: Scalars['String'];
};

export type ServerlessFunctionLogsInput = {
  applicationId?: InputMaybe<Scalars['UUID']>;
  applicationUniversalIdentifier?: InputMaybe<Scalars['UUID']>;
  id?: InputMaybe<Scalars['UUID']>;
  name?: InputMaybe<Scalars['String']>;
  universalIdentifier?: InputMaybe<Scalars['UUID']>;
};

export type SetupOidcSsoInput = {
  clientID: Scalars['String'];
  clientSecret: Scalars['String'];
  issuer: Scalars['String'];
  name: Scalars['String'];
};

export type SetupSamlSsoInput = {
  certificate: Scalars['String'];
  fingerprint?: InputMaybe<Scalars['String']>;
  id: Scalars['UUID'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  ssoURL: Scalars['String'];
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
  standardId?: Maybe<Scalars['UUID']>;
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

export type Subscription = {
  __typename?: 'Subscription';
  onDbEvent: OnDbEvent;
  onSubscriptionMatch?: Maybe<SubscriptionMatches>;
  serverlessFunctionLogs: ServerlessFunctionLogs;
};


export type SubscriptionOnDbEventArgs = {
  input: OnDbEventInput;
};


export type SubscriptionOnSubscriptionMatchArgs = {
  subscriptions: Array<SubscriptionInput>;
};


export type SubscriptionServerlessFunctionLogsArgs = {
  input: ServerlessFunctionLogsInput;
};

export type SubscriptionInput = {
  id: Scalars['String'];
  query: Scalars['String'];
  selectedEventActions?: InputMaybe<Array<DatabaseEventAction>>;
};

export enum SubscriptionInterval {
  Month = 'Month',
  Year = 'Year'
}

export type SubscriptionMatch = {
  __typename?: 'SubscriptionMatch';
  event: OnDbEvent;
  subscriptionIds: Array<Scalars['String']>;
};

export type SubscriptionMatches = {
  __typename?: 'SubscriptionMatches';
  matches: Array<SubscriptionMatch>;
};

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

export type UpdateAgentInput = {
  description?: InputMaybe<Scalars['String']>;
  evaluationInputs?: InputMaybe<Array<Scalars['String']>>;
  icon?: InputMaybe<Scalars['String']>;
  id: Scalars['UUID'];
  label?: InputMaybe<Scalars['String']>;
  modelConfiguration?: InputMaybe<Scalars['JSON']>;
  modelId?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  prompt?: InputMaybe<Scalars['String']>;
  responseFormat?: InputMaybe<Scalars['JSON']>;
  roleId?: InputMaybe<Scalars['UUID']>;
};

export type UpdateApiKeyInput = {
  expiresAt?: InputMaybe<Scalars['String']>;
  id: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
  revokedAt?: InputMaybe<Scalars['String']>;
};

export type UpdateCronTriggerInput = {
  /** The id of the cron trigger to update */
  id: Scalars['String'];
  /** The cron trigger updates */
  update: UpdateCronTriggerInputUpdates;
};

export type UpdateCronTriggerInputUpdates = {
  settings: Scalars['JSON'];
};

export type UpdateDatabaseEventTriggerInput = {
  /** The id of the database event trigger to update */
  id: Scalars['String'];
  /** The database event trigger updates */
  update: UpdateDatabaseEventTriggerInputUpdates;
};

export type UpdateDatabaseEventTriggerInputUpdates = {
  settings: Scalars['JSON'];
};

export type UpdateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']>;
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']>;
  isNullable?: InputMaybe<Scalars['Boolean']>;
  isSystem?: InputMaybe<Scalars['Boolean']>;
  isUIReadOnly?: InputMaybe<Scalars['Boolean']>;
  isUnique?: InputMaybe<Scalars['Boolean']>;
  label?: InputMaybe<Scalars['String']>;
  morphRelationsUpdatePayload?: InputMaybe<Array<Scalars['JSON']>>;
  name?: InputMaybe<Scalars['String']>;
  options?: InputMaybe<Scalars['JSON']>;
  settings?: InputMaybe<Scalars['JSON']>;
};

export type UpdateLabPublicFeatureFlagInput = {
  publicFeatureFlag: Scalars['String'];
  value: Scalars['Boolean'];
};

export type UpdateObjectPayload = {
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  imageIdentifierFieldMetadataId?: InputMaybe<Scalars['UUID']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']>;
  labelIdentifierFieldMetadataId?: InputMaybe<Scalars['UUID']>;
  labelPlural?: InputMaybe<Scalars['String']>;
  labelSingular?: InputMaybe<Scalars['String']>;
  namePlural?: InputMaybe<Scalars['String']>;
  nameSingular?: InputMaybe<Scalars['String']>;
  shortcut?: InputMaybe<Scalars['String']>;
};

export type UpdateOneFieldMetadataInput = {
  /** The id of the record to update */
  id: Scalars['UUID'];
  /** The record to update */
  update: UpdateFieldInput;
};

export type UpdateOneObjectInput = {
  /** The id of the object to update */
  id: Scalars['UUID'];
  update: UpdateObjectPayload;
};

export type UpdatePageLayoutInput = {
  name?: InputMaybe<Scalars['String']>;
  objectMetadataId?: InputMaybe<Scalars['UUID']>;
  type?: InputMaybe<PageLayoutType>;
};

export type UpdatePageLayoutTabInput = {
  position?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
};

export type UpdatePageLayoutTabWithWidgetsInput = {
  id: Scalars['UUID'];
  position: Scalars['Float'];
  title: Scalars['String'];
  widgets: Array<UpdatePageLayoutWidgetWithIdInput>;
};

export type UpdatePageLayoutWidgetInput = {
  configuration?: InputMaybe<Scalars['JSON']>;
  gridPosition?: InputMaybe<GridPositionInput>;
  objectMetadataId?: InputMaybe<Scalars['UUID']>;
  title?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<WidgetType>;
};

export type UpdatePageLayoutWidgetWithIdInput = {
  configuration?: InputMaybe<Scalars['JSON']>;
  gridPosition: GridPositionInput;
  id: Scalars['UUID'];
  objectMetadataId?: InputMaybe<Scalars['UUID']>;
  pageLayoutTabId: Scalars['UUID'];
  title: Scalars['String'];
  type: WidgetType;
};

export type UpdatePageLayoutWithTabsInput = {
  name: Scalars['String'];
  objectMetadataId?: InputMaybe<Scalars['UUID']>;
  tabs: Array<UpdatePageLayoutTabWithWidgetsInput>;
  type: PageLayoutType;
};

export type UpdateRemoteServerInput = {
  foreignDataWrapperOptions?: InputMaybe<Scalars['JSON']>;
  id: Scalars['UUID'];
  label?: InputMaybe<Scalars['String']>;
  schema?: InputMaybe<Scalars['String']>;
  userMappingOptions?: InputMaybe<UserMappingOptionsUpdateInput>;
};

export type UpdateRoleInput = {
  /** The id of the role to update */
  id: Scalars['UUID'];
  update: UpdateRolePayload;
};

export type UpdateRolePayload = {
  canAccessAllTools?: InputMaybe<Scalars['Boolean']>;
  canBeAssignedToAgents?: InputMaybe<Scalars['Boolean']>;
  canBeAssignedToApiKeys?: InputMaybe<Scalars['Boolean']>;
  canBeAssignedToUsers?: InputMaybe<Scalars['Boolean']>;
  canDestroyAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canReadAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canSoftDeleteAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canUpdateAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canUpdateAllSettings?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  label?: InputMaybe<Scalars['String']>;
};

export type UpdateRouteTriggerInput = {
  /** The id of the route to update */
  id: Scalars['String'];
  /** The route updates */
  update: UpdateRouteTriggerInputUpdates;
};

export type UpdateRouteTriggerInputUpdates = {
  httpMethod: HttpMethod;
  isAuthRequired: Scalars['Boolean'];
  path: Scalars['String'];
};

export type UpdateRowLevelPermissionPredicateGroupInput = {
  id: Scalars['String'];
  logicalOperator?: InputMaybe<RowLevelPermissionPredicateGroupLogicalOperator>;
  parentRowLevelPermissionPredicateGroupId?: InputMaybe<Scalars['String']>;
  positionInRowLevelPermissionPredicateGroup?: InputMaybe<Scalars['Float']>;
};

export type UpdateRowLevelPermissionPredicateInput = {
  id: Scalars['String'];
  operand?: InputMaybe<RowLevelPermissionPredicateOperand>;
  positionInRowLevelPermissionPredicateGroup?: InputMaybe<Scalars['Float']>;
  rowLevelPermissionPredicateGroupId?: InputMaybe<Scalars['String']>;
  subFieldName?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['JSON']>;
  workspaceMemberFieldMetadataId?: InputMaybe<Scalars['String']>;
  workspaceMemberSubFieldName?: InputMaybe<Scalars['String']>;
};

export type UpdateServerlessFunctionInput = {
  /** Id of the serverless function to update */
  id: Scalars['UUID'];
  /** The serverless function updates */
  update: UpdateServerlessFunctionInputUpdates;
};

export type UpdateServerlessFunctionInputUpdates = {
  code: Scalars['JSON'];
  description?: InputMaybe<Scalars['String']>;
  handlerName?: InputMaybe<Scalars['String']>;
  handlerPath?: InputMaybe<Scalars['String']>;
  isTool?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  timeoutSeconds?: InputMaybe<Scalars['Float']>;
  toolInputSchema?: InputMaybe<Scalars['JSON']>;
};

export type UpdateSkillInput = {
  content?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  id: Scalars['UUID'];
  isActive?: InputMaybe<Scalars['Boolean']>;
  label?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateViewFieldInput = {
  /** The id of the view field to update */
  id: Scalars['UUID'];
  /** The view field to update */
  update: UpdateViewFieldInputUpdates;
};

export type UpdateViewFieldInputUpdates = {
  aggregateOperation?: InputMaybe<AggregateOperations>;
  isVisible?: InputMaybe<Scalars['Boolean']>;
  position?: InputMaybe<Scalars['Float']>;
  size?: InputMaybe<Scalars['Float']>;
};

export type UpdateViewFilterGroupInput = {
  id?: InputMaybe<Scalars['UUID']>;
  logicalOperator?: InputMaybe<ViewFilterGroupLogicalOperator>;
  parentViewFilterGroupId?: InputMaybe<Scalars['UUID']>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']>;
  viewId?: InputMaybe<Scalars['UUID']>;
};

export type UpdateViewFilterInput = {
  /** The id of the view filter to update */
  id: Scalars['UUID'];
  /** The view filter to update */
  update: UpdateViewFilterInputUpdates;
};

export type UpdateViewFilterInputUpdates = {
  fieldMetadataId?: InputMaybe<Scalars['UUID']>;
  operand?: InputMaybe<ViewFilterOperand>;
  positionInViewFilterGroup?: InputMaybe<Scalars['Float']>;
  subFieldName?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['JSON']>;
  viewFilterGroupId?: InputMaybe<Scalars['UUID']>;
};

export type UpdateViewGroupInput = {
  /** The id of the view group to update */
  id: Scalars['UUID'];
  /** The view group to update */
  update: UpdateViewGroupInputUpdates;
};

export type UpdateViewGroupInputUpdates = {
  fieldMetadataId?: InputMaybe<Scalars['UUID']>;
  fieldValue?: InputMaybe<Scalars['String']>;
  isVisible?: InputMaybe<Scalars['Boolean']>;
  position?: InputMaybe<Scalars['Float']>;
};

export type UpdateViewInput = {
  anyFieldFilterValue?: InputMaybe<Scalars['String']>;
  calendarFieldMetadataId?: InputMaybe<Scalars['UUID']>;
  calendarLayout?: InputMaybe<ViewCalendarLayout>;
  icon?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['UUID']>;
  isCompact?: InputMaybe<Scalars['Boolean']>;
  kanbanAggregateOperation?: InputMaybe<AggregateOperations>;
  kanbanAggregateOperationFieldMetadataId?: InputMaybe<Scalars['UUID']>;
  mainGroupByFieldMetadataId?: InputMaybe<Scalars['UUID']>;
  name?: InputMaybe<Scalars['String']>;
  openRecordIn?: InputMaybe<ViewOpenRecordIn>;
  position?: InputMaybe<Scalars['Float']>;
  shouldHideEmptyGroups?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<ViewType>;
  visibility?: InputMaybe<ViewVisibility>;
};

export type UpdateViewSortInput = {
  direction?: InputMaybe<ViewSortDirection>;
  fieldMetadataId?: InputMaybe<Scalars['UUID']>;
  id?: InputMaybe<Scalars['UUID']>;
  viewId?: InputMaybe<Scalars['UUID']>;
};

export type UpdateWebhookInput = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['UUID'];
  operations?: InputMaybe<Array<Scalars['String']>>;
  secret?: InputMaybe<Scalars['String']>;
  targetUrl?: InputMaybe<Scalars['String']>;
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

export type UpdateWorkspaceInput = {
  allowImpersonation?: InputMaybe<Scalars['Boolean']>;
  customDomain?: InputMaybe<Scalars['String']>;
  defaultRoleId?: InputMaybe<Scalars['UUID']>;
  displayName?: InputMaybe<Scalars['String']>;
  editableProfileFields?: InputMaybe<Array<Scalars['String']>>;
  fastModel?: InputMaybe<Scalars['String']>;
  inviteHash?: InputMaybe<Scalars['String']>;
  isGoogleAuthBypassEnabled?: InputMaybe<Scalars['Boolean']>;
  isGoogleAuthEnabled?: InputMaybe<Scalars['Boolean']>;
  isMicrosoftAuthBypassEnabled?: InputMaybe<Scalars['Boolean']>;
  isMicrosoftAuthEnabled?: InputMaybe<Scalars['Boolean']>;
  isPasswordAuthBypassEnabled?: InputMaybe<Scalars['Boolean']>;
  isPasswordAuthEnabled?: InputMaybe<Scalars['Boolean']>;
  isPublicInviteLinkEnabled?: InputMaybe<Scalars['Boolean']>;
  isTwoFactorAuthenticationEnforced?: InputMaybe<Scalars['Boolean']>;
  logo?: InputMaybe<Scalars['String']>;
  smartModel?: InputMaybe<Scalars['String']>;
  subdomain?: InputMaybe<Scalars['String']>;
  trashRetentionDays?: InputMaybe<Scalars['Float']>;
};

export type UpsertFieldPermissionsInput = {
  fieldPermissions: Array<FieldPermissionInput>;
  roleId: Scalars['UUID'];
};

export type UpsertObjectPermissionsInput = {
  objectPermissions: Array<ObjectPermissionInput>;
  roleId: Scalars['UUID'];
};

export type UpsertPermissionFlagsInput = {
  permissionFlagKeys: Array<PermissionFlagType>;
  roleId: Scalars['UUID'];
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

export type UserMappingOptions = {
  password?: InputMaybe<Scalars['String']>;
  user?: InputMaybe<Scalars['String']>;
};

export type UserMappingOptionsUpdateInput = {
  password?: InputMaybe<Scalars['String']>;
  user?: InputMaybe<Scalars['String']>;
};

export type UserMappingOptionsUser = {
  __typename?: 'UserMappingOptionsUser';
  user?: Maybe<Scalars['String']>;
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

export type ValidateApprovedAccessDomainInput = {
  approvedAccessDomainId: Scalars['UUID'];
  validationToken: Scalars['String'];
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
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  operations: Array<Scalars['String']>;
  secret: Scalars['String'];
  targetUrl: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type WidgetConfiguration = AggregateChartConfiguration | BarChartConfiguration | GaugeChartConfiguration | IframeConfiguration | LineChartConfiguration | PieChartConfiguration | StandaloneRichTextConfiguration;

export enum WidgetConfigurationType {
  AGGREGATE_CHART = 'AGGREGATE_CHART',
  BAR_CHART = 'BAR_CHART',
  CALENDAR = 'CALENDAR',
  EMAILS = 'EMAILS',
  FIELD = 'FIELD',
  FIELDS = 'FIELDS',
  FIELD_RICH_TEXT = 'FIELD_RICH_TEXT',
  FILES = 'FILES',
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
  SEND_EMAIL = 'SEND_EMAIL',
  UPDATE_RECORD = 'UPDATE_RECORD',
  UPSERT_RECORD = 'UPSERT_RECORD'
}

export type WorkflowRun = {
  __typename?: 'WorkflowRun';
  id: Scalars['UUID'];
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
  allowImpersonation: Scalars['Boolean'];
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

export type AgentFieldsFragment = { __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string };

export type SkillFieldsFragment = { __typename?: 'Skill', id: string, name: string, label: string, description?: string | null, icon?: string | null, content: string, isCustom: boolean, isActive: boolean, createdAt: string, updatedAt: string };

export type ActivateSkillMutationVariables = Exact<{
  id: Scalars['UUID'];
}>;


export type ActivateSkillMutation = { __typename?: 'Mutation', activateSkill: { __typename?: 'Skill', id: string, name: string, label: string, description?: string | null, icon?: string | null, content: string, isCustom: boolean, isActive: boolean, createdAt: string, updatedAt: string } };

export type AssignRoleToAgentMutationVariables = Exact<{
  agentId: Scalars['UUID'];
  roleId: Scalars['UUID'];
}>;


export type AssignRoleToAgentMutation = { __typename?: 'Mutation', assignRoleToAgent: boolean };

export type CreateChatThreadMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateChatThreadMutation = { __typename?: 'Mutation', createChatThread: { __typename?: 'AgentChatThread', id: string, title?: string | null, createdAt: string, updatedAt: string } };

export type CreateOneAgentMutationVariables = Exact<{
  input: CreateAgentInput;
}>;


export type CreateOneAgentMutation = { __typename?: 'Mutation', createOneAgent: { __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string } };

export type CreateSkillMutationVariables = Exact<{
  input: CreateSkillInput;
}>;


export type CreateSkillMutation = { __typename?: 'Mutation', createSkill: { __typename?: 'Skill', id: string, name: string, label: string, description?: string | null, icon?: string | null, content: string, isCustom: boolean, isActive: boolean, createdAt: string, updatedAt: string } };

export type DeactivateSkillMutationVariables = Exact<{
  id: Scalars['UUID'];
}>;


export type DeactivateSkillMutation = { __typename?: 'Mutation', deactivateSkill: { __typename?: 'Skill', id: string, name: string, label: string, description?: string | null, icon?: string | null, content: string, isCustom: boolean, isActive: boolean, createdAt: string, updatedAt: string } };

export type DeleteOneAgentMutationVariables = Exact<{
  input: AgentIdInput;
}>;


export type DeleteOneAgentMutation = { __typename?: 'Mutation', deleteOneAgent: { __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string } };

export type DeleteSkillMutationVariables = Exact<{
  id: Scalars['UUID'];
}>;


export type DeleteSkillMutation = { __typename?: 'Mutation', deleteSkill: { __typename?: 'Skill', id: string, name: string, label: string, description?: string | null, icon?: string | null, content: string, isCustom: boolean, isActive: boolean, createdAt: string, updatedAt: string } };

export type EvaluateAgentTurnMutationVariables = Exact<{
  turnId: Scalars['UUID'];
}>;


export type EvaluateAgentTurnMutation = { __typename?: 'Mutation', evaluateAgentTurn: { __typename?: 'AgentTurnEvaluation', id: string, turnId: string, score: number, comment?: string | null, createdAt: string } };

export type RemoveRoleFromAgentMutationVariables = Exact<{
  agentId: Scalars['UUID'];
}>;


export type RemoveRoleFromAgentMutation = { __typename?: 'Mutation', removeRoleFromAgent: boolean };

export type RunEvaluationInputMutationVariables = Exact<{
  agentId: Scalars['UUID'];
  input: Scalars['String'];
}>;


export type RunEvaluationInputMutation = { __typename?: 'Mutation', runEvaluationInput: { __typename?: 'AgentTurn', id: string, threadId: string, agentId?: string | null, createdAt: string, evaluations: Array<{ __typename?: 'AgentTurnEvaluation', id: string, score: number, comment?: string | null, createdAt: string }> } };

export type UpdateOneAgentMutationVariables = Exact<{
  input: UpdateAgentInput;
}>;


export type UpdateOneAgentMutation = { __typename?: 'Mutation', updateOneAgent: { __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string } };

export type UpdateSkillMutationVariables = Exact<{
  input: UpdateSkillInput;
}>;


export type UpdateSkillMutation = { __typename?: 'Mutation', updateSkill: { __typename?: 'Skill', id: string, name: string, label: string, description?: string | null, icon?: string | null, content: string, isCustom: boolean, isActive: boolean, createdAt: string, updatedAt: string } };

export type FindManyAgentsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindManyAgentsQuery = { __typename?: 'Query', findManyAgents: Array<{ __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string }> };

export type FindManySkillsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindManySkillsQuery = { __typename?: 'Query', skills: Array<{ __typename?: 'Skill', id: string, name: string, label: string, description?: string | null, icon?: string | null, content: string, isCustom: boolean, isActive: boolean, createdAt: string, updatedAt: string }> };

export type FindOneAgentQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;


export type FindOneAgentQuery = { __typename?: 'Query', findOneAgent: { __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string } };

export type FindOneSkillQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;


export type FindOneSkillQuery = { __typename?: 'Query', skill?: { __typename?: 'Skill', id: string, name: string, label: string, description?: string | null, icon?: string | null, content: string, isCustom: boolean, isActive: boolean, createdAt: string, updatedAt: string } | null };

export type GetAgentTurnsQueryVariables = Exact<{
  agentId: Scalars['UUID'];
}>;


export type GetAgentTurnsQuery = { __typename?: 'Query', agentTurns: Array<{ __typename?: 'AgentTurn', id: string, threadId: string, agentId?: string | null, createdAt: string, evaluations: Array<{ __typename?: 'AgentTurnEvaluation', id: string, score: number, comment?: string | null, createdAt: string }>, messages: Array<{ __typename?: 'AgentMessage', id: string, role: string, createdAt: string, parts: Array<{ __typename?: 'AgentMessagePart', id: string, type: string, textContent?: string | null, reasoningContent?: string | null, toolName?: string | null, toolCallId?: string | null, toolInput?: any | null, toolOutput?: any | null, errorMessage?: string | null, state?: string | null, errorDetails?: any | null, sourceUrlSourceId?: string | null, sourceUrlUrl?: string | null, sourceUrlTitle?: string | null, sourceDocumentSourceId?: string | null, sourceDocumentMediaType?: string | null, sourceDocumentTitle?: string | null, sourceDocumentFilename?: string | null, fileMediaType?: string | null, fileFilename?: string | null, fileUrl?: string | null, providerMetadata?: any | null }> }> }> };

export type GetChatMessagesQueryVariables = Exact<{
  threadId: Scalars['UUID'];
}>;


export type GetChatMessagesQuery = { __typename?: 'Query', chatMessages: Array<{ __typename?: 'AgentMessage', id: string, threadId: string, turnId: string, role: string, createdAt: string, parts: Array<{ __typename?: 'AgentMessagePart', id: string, messageId: string, orderIndex: number, type: string, textContent?: string | null, reasoningContent?: string | null, toolName?: string | null, toolCallId?: string | null, toolInput?: any | null, toolOutput?: any | null, state?: string | null, errorMessage?: string | null, errorDetails?: any | null, sourceUrlSourceId?: string | null, sourceUrlUrl?: string | null, sourceUrlTitle?: string | null, sourceDocumentSourceId?: string | null, sourceDocumentMediaType?: string | null, sourceDocumentTitle?: string | null, sourceDocumentFilename?: string | null, fileMediaType?: string | null, fileFilename?: string | null, fileUrl?: string | null, providerMetadata?: any | null, createdAt: string }> }> };

export type GetChatThreadsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetChatThreadsQuery = { __typename?: 'Query', chatThreads: Array<{ __typename?: 'AgentChatThread', id: string, title?: string | null, totalInputTokens: number, totalOutputTokens: number, contextWindowTokens?: number | null, totalInputCredits: number, totalOutputCredits: number, createdAt: string, updatedAt: string }> };

export type GetToolIndexQueryVariables = Exact<{ [key: string]: never; }>;


export type GetToolIndexQuery = { __typename?: 'Query', getToolIndex: Array<{ __typename?: 'ToolIndexEntry', name: string, description: string, category: string, objectName?: string | null, inputSchema?: any | null }> };

export type TrackAnalyticsMutationVariables = Exact<{
  type: AnalyticsType;
  event?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  properties?: InputMaybe<Scalars['JSON']>;
}>;


export type TrackAnalyticsMutation = { __typename?: 'Mutation', trackAnalytics: { __typename?: 'Analytics', success: boolean } };

export type UpdateOneApplicationVariableMutationVariables = Exact<{
  key: Scalars['String'];
  value: Scalars['String'];
  applicationId: Scalars['UUID'];
}>;


export type UpdateOneApplicationVariableMutation = { __typename?: 'Mutation', updateOneApplicationVariable: boolean };

export type ApplicationFieldsFragment = { __typename?: 'Application', id: string, name: string, description: string, version: string, universalIdentifier: string, canBeUninstalled: boolean, applicationVariables: Array<{ __typename?: 'ApplicationVariable', id: string, key: string, value: string, description: string, isSecret: boolean }>, agents: Array<{ __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string }>, objects: Array<{ __typename?: 'Object', id: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isRemote: boolean, isActive: boolean, isSystem: boolean, isUIReadOnly: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, applicationId?: string | null, shortcut?: string | null, isLabelSyncedWithName: boolean, isSearchable: boolean, duplicateCriteria?: Array<Array<string>> | null, indexMetadataList: Array<{ __typename?: 'Index', id: string, createdAt: string, updatedAt: string, name: string, indexWhereClause?: string | null, indexType: IndexType, isUnique: boolean, isCustom?: boolean | null, indexFieldMetadataList: Array<{ __typename?: 'IndexField', id: string, fieldMetadataId: string, createdAt: string, updatedAt: string, order: number }> }>, fieldsList: Array<{ __typename?: 'Field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isSystem?: boolean | null, isUIReadOnly?: boolean | null, isNullable?: boolean | null, isUnique?: boolean | null, createdAt: string, updatedAt: string, defaultValue?: any | null, options?: any | null, settings?: any | null, isLabelSyncedWithName?: boolean | null, applicationId?: string | null, relation?: { __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: string, name: string }, targetFieldMetadata: { __typename?: 'Field', id: string, name: string } } | null, morphRelations?: Array<{ __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: string, name: string }, targetFieldMetadata: { __typename?: 'Field', id: string, name: string } }> | null }> }>, serverlessFunctions: Array<{ __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null }> };

export type FindManyApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindManyApplicationsQuery = { __typename?: 'Query', findManyApplications: Array<{ __typename?: 'Application', id: string, name: string, description: string, version: string }> };

export type FindOneApplicationQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;


export type FindOneApplicationQuery = { __typename?: 'Query', findOneApplication: { __typename?: 'Application', id: string, name: string, description: string, version: string, universalIdentifier: string, canBeUninstalled: boolean, applicationVariables: Array<{ __typename?: 'ApplicationVariable', id: string, key: string, value: string, description: string, isSecret: boolean }>, agents: Array<{ __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string }>, objects: Array<{ __typename?: 'Object', id: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isRemote: boolean, isActive: boolean, isSystem: boolean, isUIReadOnly: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, applicationId?: string | null, shortcut?: string | null, isLabelSyncedWithName: boolean, isSearchable: boolean, duplicateCriteria?: Array<Array<string>> | null, indexMetadataList: Array<{ __typename?: 'Index', id: string, createdAt: string, updatedAt: string, name: string, indexWhereClause?: string | null, indexType: IndexType, isUnique: boolean, isCustom?: boolean | null, indexFieldMetadataList: Array<{ __typename?: 'IndexField', id: string, fieldMetadataId: string, createdAt: string, updatedAt: string, order: number }> }>, fieldsList: Array<{ __typename?: 'Field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isSystem?: boolean | null, isUIReadOnly?: boolean | null, isNullable?: boolean | null, isUnique?: boolean | null, createdAt: string, updatedAt: string, defaultValue?: any | null, options?: any | null, settings?: any | null, isLabelSyncedWithName?: boolean | null, applicationId?: string | null, relation?: { __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: string, name: string }, targetFieldMetadata: { __typename?: 'Field', id: string, name: string } } | null, morphRelations?: Array<{ __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: string, name: string }, targetFieldMetadata: { __typename?: 'Field', id: string, name: string } }> | null }> }>, serverlessFunctions: Array<{ __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null }> } };

export type UploadFileMutationVariables = Exact<{
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
}>;


export type UploadFileMutation = { __typename?: 'Mutation', uploadFile: { __typename?: 'SignedFile', path: string, token: string } };

export type UploadImageMutationVariables = Exact<{
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
}>;


export type UploadImageMutation = { __typename?: 'Mutation', uploadImage: { __typename?: 'SignedFile', path: string, token: string } };

export type AuthTokenFragmentFragment = { __typename?: 'AuthToken', token: string, expiresAt: string };

export type AuthTokenPairFragmentFragment = { __typename?: 'AuthTokenPair', accessOrWorkspaceAgnosticToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } };

export type AvailableWorkspaceFragmentFragment = { __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> };

export type AvailableWorkspacesFragmentFragment = { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> };

export type AvailableSsoIdentityProvidersFragmentFragment = { __typename?: 'FindAvailableSSOIDPOutput', id: string, issuer: string, name: string, status: SsoIdentityProviderStatus, workspace: { __typename?: 'WorkspaceNameAndId', id: string, displayName?: string | null } };

export type AuthorizeAppMutationVariables = Exact<{
  clientId: Scalars['String'];
  codeChallenge: Scalars['String'];
  redirectUrl: Scalars['String'];
}>;


export type AuthorizeAppMutation = { __typename?: 'Mutation', authorizeApp: { __typename?: 'AuthorizeAppOutput', redirectUrl: string } };

export type EmailPasswordResetLinkMutationVariables = Exact<{
  email: Scalars['String'];
  workspaceId: Scalars['UUID'];
}>;


export type EmailPasswordResetLinkMutation = { __typename?: 'Mutation', emailPasswordResetLink: { __typename?: 'EmailPasswordResetLinkOutput', success: boolean } };

export type GenerateApiKeyTokenMutationVariables = Exact<{
  apiKeyId: Scalars['UUID'];
  expiresAt: Scalars['String'];
}>;


export type GenerateApiKeyTokenMutation = { __typename?: 'Mutation', generateApiKeyToken: { __typename?: 'ApiKeyToken', token: string } };

export type GenerateTransientTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateTransientTokenMutation = { __typename?: 'Mutation', generateTransientToken: { __typename?: 'TransientTokenOutput', transientToken: { __typename?: 'AuthToken', token: string } } };

export type GetAuthTokensFromLoginTokenMutationVariables = Exact<{
  loginToken: Scalars['String'];
  origin: Scalars['String'];
}>;


export type GetAuthTokensFromLoginTokenMutation = { __typename?: 'Mutation', getAuthTokensFromLoginToken: { __typename?: 'AuthTokens', tokens: { __typename?: 'AuthTokenPair', accessOrWorkspaceAgnosticToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type GetAuthTokensFromOtpMutationVariables = Exact<{
  loginToken: Scalars['String'];
  otp: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
  origin: Scalars['String'];
}>;


export type GetAuthTokensFromOtpMutation = { __typename?: 'Mutation', getAuthTokensFromOTP: { __typename?: 'AuthTokens', tokens: { __typename?: 'AuthTokenPair', accessOrWorkspaceAgnosticToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type GetAuthorizationUrlForSsoMutationVariables = Exact<{
  input: GetAuthorizationUrlForSsoInput;
}>;


export type GetAuthorizationUrlForSsoMutation = { __typename?: 'Mutation', getAuthorizationUrlForSSO: { __typename?: 'GetAuthorizationUrlForSSOOutput', id: string, type: string, authorizationURL: string } };

export type GetLoginTokenFromCredentialsMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
  origin: Scalars['String'];
}>;


export type GetLoginTokenFromCredentialsMutation = { __typename?: 'Mutation', getLoginTokenFromCredentials: { __typename?: 'LoginTokenOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } };

export type ImpersonateMutationVariables = Exact<{
  userId: Scalars['UUID'];
  workspaceId: Scalars['UUID'];
}>;


export type ImpersonateMutation = { __typename?: 'Mutation', impersonate: { __typename?: 'ImpersonateOutput', workspace: { __typename?: 'WorkspaceUrlsAndId', id: string, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } }, loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } };

export type InitiateOtpProvisioningMutationVariables = Exact<{
  loginToken: Scalars['String'];
  origin: Scalars['String'];
}>;


export type InitiateOtpProvisioningMutation = { __typename?: 'Mutation', initiateOTPProvisioning: { __typename?: 'InitiateTwoFactorAuthenticationProvisioningOutput', uri: string } };

export type InitiateOtpProvisioningForAuthenticatedUserMutationVariables = Exact<{ [key: string]: never; }>;


export type InitiateOtpProvisioningForAuthenticatedUserMutation = { __typename?: 'Mutation', initiateOTPProvisioningForAuthenticatedUser: { __typename?: 'InitiateTwoFactorAuthenticationProvisioningOutput', uri: string } };

export type RenewTokenMutationVariables = Exact<{
  appToken: Scalars['String'];
}>;


export type RenewTokenMutation = { __typename?: 'Mutation', renewToken: { __typename?: 'AuthTokens', tokens: { __typename?: 'AuthTokenPair', accessOrWorkspaceAgnosticToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type ResendEmailVerificationTokenMutationVariables = Exact<{
  email: Scalars['String'];
  origin: Scalars['String'];
}>;


export type ResendEmailVerificationTokenMutation = { __typename?: 'Mutation', resendEmailVerificationToken: { __typename?: 'ResendEmailVerificationTokenOutput', success: boolean } };

export type DeleteTwoFactorAuthenticationMethodMutationVariables = Exact<{
  twoFactorAuthenticationMethodId: Scalars['UUID'];
}>;


export type DeleteTwoFactorAuthenticationMethodMutation = { __typename?: 'Mutation', deleteTwoFactorAuthenticationMethod: { __typename?: 'DeleteTwoFactorAuthenticationMethodOutput', success: boolean } };

export type SignInMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
}>;


export type SignInMutation = { __typename?: 'Mutation', signIn: { __typename?: 'AvailableWorkspacesAndAccessTokensOutput', availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> }, tokens: { __typename?: 'AuthTokenPair', accessOrWorkspaceAgnosticToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type SignUpMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
  locale?: InputMaybe<Scalars['String']>;
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']>;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'AvailableWorkspacesAndAccessTokensOutput', availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> }, tokens: { __typename?: 'AuthTokenPair', accessOrWorkspaceAgnosticToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type SignUpInNewWorkspaceMutationVariables = Exact<{ [key: string]: never; }>;


export type SignUpInNewWorkspaceMutation = { __typename?: 'Mutation', signUpInNewWorkspace: { __typename?: 'SignUpOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, workspace: { __typename?: 'WorkspaceUrlsAndId', id: string, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } } };

export type SignUpInWorkspaceMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']>;
  captchaToken?: InputMaybe<Scalars['String']>;
  workspaceId?: InputMaybe<Scalars['UUID']>;
  locale?: InputMaybe<Scalars['String']>;
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']>;
}>;


export type SignUpInWorkspaceMutation = { __typename?: 'Mutation', signUpInWorkspace: { __typename?: 'SignUpOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, workspace: { __typename?: 'WorkspaceUrlsAndId', id: string, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } } };

export type UpdatePasswordViaResetTokenMutationVariables = Exact<{
  token: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type UpdatePasswordViaResetTokenMutation = { __typename?: 'Mutation', updatePasswordViaResetToken: { __typename?: 'InvalidatePasswordOutput', success: boolean } };

export type VerifyEmailAndGetLoginTokenMutationVariables = Exact<{
  emailVerificationToken: Scalars['String'];
  email: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
  origin: Scalars['String'];
}>;


export type VerifyEmailAndGetLoginTokenMutation = { __typename?: 'Mutation', verifyEmailAndGetLoginToken: { __typename?: 'VerifyEmailAndGetLoginTokenOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } };

export type VerifyEmailAndGetWorkspaceAgnosticTokenMutationVariables = Exact<{
  emailVerificationToken: Scalars['String'];
  email: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
}>;


export type VerifyEmailAndGetWorkspaceAgnosticTokenMutation = { __typename?: 'Mutation', verifyEmailAndGetWorkspaceAgnosticToken: { __typename?: 'AvailableWorkspacesAndAccessTokensOutput', availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> }, tokens: { __typename?: 'AuthTokenPair', accessOrWorkspaceAgnosticToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type CheckUserExistsQueryVariables = Exact<{
  email: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
}>;


export type CheckUserExistsQuery = { __typename?: 'Query', checkUserExists: { __typename?: 'CheckUserExistOutput', exists: boolean, availableWorkspacesCount: number, isEmailVerified: boolean } };

export type GetPublicWorkspaceDataByDomainQueryVariables = Exact<{
  origin: Scalars['String'];
}>;


export type GetPublicWorkspaceDataByDomainQuery = { __typename?: 'Query', getPublicWorkspaceDataByDomain: { __typename?: 'PublicWorkspaceDataOutput', id: string, logo?: string | null, displayName?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, authProviders: { __typename?: 'AuthProviders', google: boolean, magicLink: boolean, password: boolean, microsoft: boolean, sso: Array<{ __typename?: 'SSOIdentityProvider', id: string, name: string, type: IdentityProviderType, status: SsoIdentityProviderStatus, issuer: string }> }, authBypassProviders?: { __typename?: 'AuthBypassProviders', google: boolean, password: boolean, microsoft: boolean } | null } };

export type ValidatePasswordResetTokenQueryVariables = Exact<{
  token: Scalars['String'];
}>;


export type ValidatePasswordResetTokenQuery = { __typename?: 'Query', validatePasswordResetToken: { __typename?: 'ValidatePasswordResetTokenOutput', id: string, email: string, hasPassword: boolean } };

export type BillingPriceLicensedFragmentFragment = { __typename?: 'BillingPriceLicensed', stripePriceId: string, unitAmount: number, recurringInterval: SubscriptionInterval, priceUsageType: BillingUsageType };

export type BillingPriceMeteredFragmentFragment = { __typename?: 'BillingPriceMetered', priceUsageType: BillingUsageType, recurringInterval: SubscriptionInterval, stripePriceId: string, tiers: Array<{ __typename?: 'BillingPriceTier', flatAmount?: number | null, unitAmount?: number | null, upTo?: number | null }> };

export type BillingSubscriptionSchedulePhaseFragmentFragment = { __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> };

export type BillingSubscriptionSchedulePhaseItemFragmentFragment = { __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null };

export type CancelSwitchBillingIntervalMutationVariables = Exact<{ [key: string]: never; }>;


export type CancelSwitchBillingIntervalMutation = { __typename?: 'Mutation', cancelSwitchBillingInterval: { __typename?: 'BillingUpdateOutput', currentBillingSubscription: { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null }, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> }> } };

export type CancelSwitchMeteredPriceMutationVariables = Exact<{ [key: string]: never; }>;


export type CancelSwitchMeteredPriceMutation = { __typename?: 'Mutation', cancelSwitchMeteredPrice: { __typename?: 'BillingUpdateOutput', currentBillingSubscription: { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null }, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> }> } };

export type CancelSwitchBillingPlanMutationVariables = Exact<{ [key: string]: never; }>;


export type CancelSwitchBillingPlanMutation = { __typename?: 'Mutation', cancelSwitchBillingPlan: { __typename?: 'BillingUpdateOutput', currentBillingSubscription: { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null }, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> }> } };

export type CheckoutSessionMutationVariables = Exact<{
  recurringInterval: SubscriptionInterval;
  successUrlPath?: InputMaybe<Scalars['String']>;
  plan: BillingPlanKey;
  requirePaymentMethod: Scalars['Boolean'];
}>;


export type CheckoutSessionMutation = { __typename?: 'Mutation', checkoutSession: { __typename?: 'BillingSessionOutput', url?: string | null } };

export type EndSubscriptionTrialPeriodMutationVariables = Exact<{ [key: string]: never; }>;


export type EndSubscriptionTrialPeriodMutation = { __typename?: 'Mutation', endSubscriptionTrialPeriod: { __typename?: 'BillingEndTrialPeriodOutput', status?: SubscriptionStatus | null, hasPaymentMethod: boolean, billingPortalUrl?: string | null } };

export type SetMeteredSubscriptionPriceMutationVariables = Exact<{
  priceId: Scalars['String'];
}>;


export type SetMeteredSubscriptionPriceMutation = { __typename?: 'Mutation', setMeteredSubscriptionPrice: { __typename?: 'BillingUpdateOutput', currentBillingSubscription: { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null }, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> }> } };

export type SwitchBillingPlanMutationVariables = Exact<{ [key: string]: never; }>;


export type SwitchBillingPlanMutation = { __typename?: 'Mutation', switchBillingPlan: { __typename?: 'BillingUpdateOutput', currentBillingSubscription: { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null }, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> }> } };

export type SwitchSubscriptionIntervalMutationVariables = Exact<{ [key: string]: never; }>;


export type SwitchSubscriptionIntervalMutation = { __typename?: 'Mutation', switchSubscriptionInterval: { __typename?: 'BillingUpdateOutput', currentBillingSubscription: { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null }, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> }> } };

export type BillingPortalSessionQueryVariables = Exact<{
  returnUrlPath?: InputMaybe<Scalars['String']>;
}>;


export type BillingPortalSessionQuery = { __typename?: 'Query', billingPortalSession: { __typename?: 'BillingSessionOutput', url?: string | null } };

export type GetMeteredProductsUsageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeteredProductsUsageQuery = { __typename?: 'Query', getMeteredProductsUsage: Array<{ __typename?: 'BillingMeteredProductUsageOutput', productKey: BillingProductKey, usedCredits: number, grantedCredits: number, rolloverCredits: number, totalGrantedCredits: number, unitPriceCents: number }> };

export type ListPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type ListPlansQuery = { __typename?: 'Query', listPlans: Array<{ __typename?: 'BillingPlanOutput', planKey: BillingPlanKey, licensedProducts: Array<{ __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, prices?: Array<{ __typename?: 'BillingPriceLicensed', stripePriceId: string, unitAmount: number, recurringInterval: SubscriptionInterval, priceUsageType: BillingUsageType }> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } }>, meteredProducts: Array<{ __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, prices?: Array<{ __typename?: 'BillingPriceMetered', priceUsageType: BillingUsageType, recurringInterval: SubscriptionInterval, stripePriceId: string, tiers: Array<{ __typename?: 'BillingPriceTier', flatAmount?: number | null, unitAmount?: number | null, upTo?: number | null }> }> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } }> }> };

export type RemoteServerFieldsFragment = { __typename?: 'RemoteServer', id: string, createdAt: string, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: string, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null };

export type RemoteTableFieldsFragment = { __typename?: 'RemoteTable', id?: string | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null };

export type CreateServerMutationVariables = Exact<{
  input: CreateRemoteServerInput;
}>;


export type CreateServerMutation = { __typename?: 'Mutation', createOneRemoteServer: { __typename?: 'RemoteServer', id: string, createdAt: string, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: string, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type DeleteServerMutationVariables = Exact<{
  input: RemoteServerIdInput;
}>;


export type DeleteServerMutation = { __typename?: 'Mutation', deleteOneRemoteServer: { __typename?: 'RemoteServer', id: string } };

export type SyncRemoteTableMutationVariables = Exact<{
  input: RemoteTableInput;
}>;


export type SyncRemoteTableMutation = { __typename?: 'Mutation', syncRemoteTable: { __typename?: 'RemoteTable', id?: string | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

export type SyncRemoteTableSchemaChangesMutationVariables = Exact<{
  input: RemoteTableInput;
}>;


export type SyncRemoteTableSchemaChangesMutation = { __typename?: 'Mutation', syncRemoteTableSchemaChanges: { __typename?: 'RemoteTable', id?: string | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

export type UnsyncRemoteTableMutationVariables = Exact<{
  input: RemoteTableInput;
}>;


export type UnsyncRemoteTableMutation = { __typename?: 'Mutation', unsyncRemoteTable: { __typename?: 'RemoteTable', id?: string | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

export type UpdateServerMutationVariables = Exact<{
  input: UpdateRemoteServerInput;
}>;


export type UpdateServerMutation = { __typename?: 'Mutation', updateOneRemoteServer: { __typename?: 'RemoteServer', id: string, createdAt: string, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: string, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type GetManyDatabaseConnectionsQueryVariables = Exact<{
  input: RemoteServerTypeInput;
}>;


export type GetManyDatabaseConnectionsQuery = { __typename?: 'Query', findManyRemoteServersByType: Array<{ __typename?: 'RemoteServer', id: string, createdAt: string, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: string, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null }> };

export type GetManyRemoteTablesQueryVariables = Exact<{
  input: FindManyRemoteTablesInput;
}>;


export type GetManyRemoteTablesQuery = { __typename?: 'Query', findDistantTablesWithStatus: Array<{ __typename?: 'RemoteTable', id?: string | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null }> };

export type GetOneDatabaseConnectionQueryVariables = Exact<{
  input: RemoteServerIdInput;
}>;


export type GetOneDatabaseConnectionQuery = { __typename?: 'Query', findOneRemoteServerById: { __typename?: 'RemoteServer', id: string, createdAt: string, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: string, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type CreateFileMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type CreateFileMutation = { __typename?: 'Mutation', createFile: { __typename?: 'File', id: string, name: string, fullPath: string, size: number, type: string, createdAt: string } };

export type DeleteFileMutationVariables = Exact<{
  fileId: Scalars['UUID'];
}>;


export type DeleteFileMutation = { __typename?: 'Mutation', deleteFile: { __typename?: 'File', id: string, name: string, fullPath: string, size: number, type: string, createdAt: string } };

export type ObjectMetadataFieldsFragment = { __typename?: 'Object', id: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isRemote: boolean, isActive: boolean, isSystem: boolean, isUIReadOnly: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, applicationId?: string | null, shortcut?: string | null, isLabelSyncedWithName: boolean, isSearchable: boolean, duplicateCriteria?: Array<Array<string>> | null, indexMetadataList: Array<{ __typename?: 'Index', id: string, createdAt: string, updatedAt: string, name: string, indexWhereClause?: string | null, indexType: IndexType, isUnique: boolean, isCustom?: boolean | null, indexFieldMetadataList: Array<{ __typename?: 'IndexField', id: string, fieldMetadataId: string, createdAt: string, updatedAt: string, order: number }> }>, fieldsList: Array<{ __typename?: 'Field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isSystem?: boolean | null, isUIReadOnly?: boolean | null, isNullable?: boolean | null, isUnique?: boolean | null, createdAt: string, updatedAt: string, defaultValue?: any | null, options?: any | null, settings?: any | null, isLabelSyncedWithName?: boolean | null, applicationId?: string | null, relation?: { __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: string, name: string }, targetFieldMetadata: { __typename?: 'Field', id: string, name: string } } | null, morphRelations?: Array<{ __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: string, name: string }, targetFieldMetadata: { __typename?: 'Field', id: string, name: string } }> | null }> };

export type CreateOneObjectMetadataItemMutationVariables = Exact<{
  input: CreateOneObjectInput;
}>;


export type CreateOneObjectMetadataItemMutation = { __typename?: 'Mutation', createOneObject: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type CreateOneFieldMetadataItemMutationVariables = Exact<{
  input: CreateOneFieldMetadataInput;
}>;


export type CreateOneFieldMetadataItemMutation = { __typename?: 'Mutation', createOneField: { __typename?: 'Field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isUnique?: boolean | null, isNullable?: boolean | null, createdAt: string, updatedAt: string, settings?: any | null, defaultValue?: any | null, options?: any | null, isLabelSyncedWithName?: boolean | null, applicationId?: string | null, object?: { __typename?: 'Object', id: string } | null } };

export type UpdateOneFieldMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID'];
  updatePayload: UpdateFieldInput;
}>;


export type UpdateOneFieldMetadataItemMutation = { __typename?: 'Mutation', updateOneField: { __typename?: 'Field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isUnique?: boolean | null, isNullable?: boolean | null, createdAt: string, updatedAt: string, settings?: any | null, isLabelSyncedWithName?: boolean | null, applicationId?: string | null, object?: { __typename?: 'Object', id: string } | null } };

export type UpdateOneObjectMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID'];
  updatePayload: UpdateObjectPayload;
}>;


export type UpdateOneObjectMetadataItemMutation = { __typename?: 'Mutation', updateOneObject: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type DeleteOneObjectMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID'];
}>;


export type DeleteOneObjectMetadataItemMutation = { __typename?: 'Mutation', deleteOneObject: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type DeleteOneFieldMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID'];
}>;


export type DeleteOneFieldMetadataItemMutation = { __typename?: 'Mutation', deleteOneField: { __typename?: 'Field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isUnique?: boolean | null, isNullable?: boolean | null, createdAt: string, updatedAt: string, settings?: any | null, applicationId?: string | null, object?: { __typename?: 'Object', id: string } | null } };

export type ObjectMetadataItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type ObjectMetadataItemsQuery = { __typename?: 'Query', objects: { __typename?: 'ObjectConnection', edges: Array<{ __typename?: 'ObjectEdge', node: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isRemote: boolean, isActive: boolean, isSystem: boolean, isUIReadOnly: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, applicationId?: string | null, shortcut?: string | null, isLabelSyncedWithName: boolean, isSearchable: boolean, duplicateCriteria?: Array<Array<string>> | null, indexMetadataList: Array<{ __typename?: 'Index', id: string, createdAt: string, updatedAt: string, name: string, indexWhereClause?: string | null, indexType: IndexType, isUnique: boolean, isCustom?: boolean | null, indexFieldMetadataList: Array<{ __typename?: 'IndexField', id: string, fieldMetadataId: string, createdAt: string, updatedAt: string, order: number }> }>, fieldsList: Array<{ __typename?: 'Field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isSystem?: boolean | null, isUIReadOnly?: boolean | null, isNullable?: boolean | null, isUnique?: boolean | null, createdAt: string, updatedAt: string, defaultValue?: any | null, options?: any | null, settings?: any | null, isLabelSyncedWithName?: boolean | null, applicationId?: string | null, relation?: { __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: string, name: string }, targetFieldMetadata: { __typename?: 'Field', id: string, name: string } } | null, morphRelations?: Array<{ __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: string, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: string, name: string }, targetFieldMetadata: { __typename?: 'Field', id: string, name: string } }> | null }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: any | null, endCursor?: any | null } } };

export type SkipBookOnboardingStepMutationVariables = Exact<{ [key: string]: never; }>;


export type SkipBookOnboardingStepMutation = { __typename?: 'Mutation', skipBookOnboardingStep: { __typename?: 'OnboardingStepSuccess', success: boolean } };

export type SkipSyncEmailOnboardingStepMutationVariables = Exact<{ [key: string]: never; }>;


export type SkipSyncEmailOnboardingStepMutation = { __typename?: 'Mutation', skipSyncEmailOnboardingStep: { __typename?: 'OnboardingStepSuccess', success: boolean } };

export type SaveImapSmtpCaldavAccountMutationVariables = Exact<{
  accountOwnerId: Scalars['UUID'];
  handle: Scalars['String'];
  connectionParameters: EmailAccountConnectionParameters;
  id?: InputMaybe<Scalars['UUID']>;
}>;


export type SaveImapSmtpCaldavAccountMutation = { __typename?: 'Mutation', saveImapSmtpCaldavAccount: { __typename?: 'ImapSmtpCaldavConnectionSuccess', success: boolean, connectedAccountId: string } };

export type StartChannelSyncMutationVariables = Exact<{
  connectedAccountId: Scalars['UUID'];
}>;


export type StartChannelSyncMutation = { __typename?: 'Mutation', startChannelSync: { __typename?: 'ChannelSyncSuccess', success: boolean } };

export type GetConnectedImapSmtpCaldavAccountQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;


export type GetConnectedImapSmtpCaldavAccountQuery = { __typename?: 'Query', getConnectedImapSmtpCaldavAccount: { __typename?: 'ConnectedImapSmtpCaldavAccount', id: string, handle: string, provider: string, accountOwnerId: string, connectionParameters?: { __typename?: 'ImapSmtpCaldavConnectionParameters', IMAP?: { __typename?: 'ConnectionParametersOutput', host: string, port: number, secure?: boolean | null, username?: string | null, password: string } | null, SMTP?: { __typename?: 'ConnectionParametersOutput', host: string, username?: string | null, port: number, secure?: boolean | null, password: string } | null, CALDAV?: { __typename?: 'ConnectionParametersOutput', host: string, username?: string | null, password: string } | null } | null } };

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


export type GetConfigVariablesGroupedQuery = { __typename?: 'Query', getConfigVariablesGrouped: { __typename?: 'ConfigVariablesOutput', groups: Array<{ __typename?: 'ConfigVariablesGroupData', name: ConfigVariablesGroup, description: string, isHiddenOnLoad: boolean, variables: Array<{ __typename?: 'ConfigVariable', name: string, description: string, value?: any | null, isSensitive: boolean, isEnvOnly: boolean, type: ConfigVariableType, options?: any | null, source: ConfigSource }> }> } };

export type GetDatabaseConfigVariableQueryVariables = Exact<{
  key: Scalars['String'];
}>;


export type GetDatabaseConfigVariableQuery = { __typename?: 'Query', getDatabaseConfigVariable: { __typename?: 'ConfigVariable', name: string, description: string, value?: any | null, isSensitive: boolean, isEnvOnly: boolean, type: ConfigVariableType, options?: any | null, source: ConfigSource } };

export type UpdateWorkspaceFeatureFlagMutationVariables = Exact<{
  workspaceId: Scalars['UUID'];
  featureFlag: Scalars['String'];
  value: Scalars['Boolean'];
}>;


export type UpdateWorkspaceFeatureFlagMutation = { __typename?: 'Mutation', updateWorkspaceFeatureFlag: boolean };

export type UserLookupAdminPanelMutationVariables = Exact<{
  userIdentifier: Scalars['String'];
}>;


export type UserLookupAdminPanelMutation = { __typename?: 'Mutation', userLookupAdminPanel: { __typename?: 'UserLookup', user: { __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null }, workspaces: Array<{ __typename?: 'WorkspaceInfo', id: string, name: string, logo?: string | null, totalUsers: number, allowImpersonation: boolean, workspaceUrls: { __typename?: 'WorkspaceUrls', customUrl?: string | null, subdomainUrl: string }, users: Array<{ __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null }>, featureFlags: Array<{ __typename?: 'FeatureFlag', key: FeatureFlagKey, value: boolean }> }> } };

export type GetVersionInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVersionInfoQuery = { __typename?: 'Query', versionInfo: { __typename?: 'VersionInfo', currentVersion?: string | null, latestVersion: string } };

export type DeleteJobsMutationVariables = Exact<{
  queueName: Scalars['String'];
  jobIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type DeleteJobsMutation = { __typename?: 'Mutation', deleteJobs: { __typename?: 'DeleteJobsResponse', deletedCount: number, results: Array<{ __typename?: 'JobOperationResult', jobId: string, success: boolean, error?: string | null }> } };

export type RetryJobsMutationVariables = Exact<{
  queueName: Scalars['String'];
  jobIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type RetryJobsMutation = { __typename?: 'Mutation', retryJobs: { __typename?: 'RetryJobsResponse', retriedCount: number, results: Array<{ __typename?: 'JobOperationResult', jobId: string, success: boolean, error?: string | null }> } };

export type GetIndicatorHealthStatusQueryVariables = Exact<{
  indicatorId: HealthIndicatorId;
}>;


export type GetIndicatorHealthStatusQuery = { __typename?: 'Query', getIndicatorHealthStatus: { __typename?: 'AdminPanelHealthServiceData', id: HealthIndicatorId, label: string, description: string, status: AdminPanelHealthServiceStatus, errorMessage?: string | null, details?: string | null, queues?: Array<{ __typename?: 'AdminPanelWorkerQueueHealth', id: string, queueName: string, status: AdminPanelHealthServiceStatus }> | null } };

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

export type UninstallApplicationMutationVariables = Exact<{
  universalIdentifier: Scalars['String'];
}>;


export type UninstallApplicationMutation = { __typename?: 'Mutation', uninstallApplication: boolean };

export type ApiKeyFragmentFragment = { __typename?: 'ApiKey', id: string, name: string, expiresAt: string, revokedAt?: string | null, role: { __typename?: 'Role', id: string, label: string, icon?: string | null } };

export type WebhookFragmentFragment = { __typename?: 'Webhook', id: string, targetUrl: string, operations: Array<string>, description?: string | null, secret: string };

export type AssignRoleToApiKeyMutationVariables = Exact<{
  apiKeyId: Scalars['UUID'];
  roleId: Scalars['UUID'];
}>;


export type AssignRoleToApiKeyMutation = { __typename?: 'Mutation', assignRoleToApiKey: boolean };

export type CreateApiKeyMutationVariables = Exact<{
  input: CreateApiKeyInput;
}>;


export type CreateApiKeyMutation = { __typename?: 'Mutation', createApiKey: { __typename?: 'ApiKey', id: string, name: string, expiresAt: string, revokedAt?: string | null, role: { __typename?: 'Role', id: string, label: string, icon?: string | null } } };

export type CreateWebhookMutationVariables = Exact<{
  input: CreateWebhookInput;
}>;


export type CreateWebhookMutation = { __typename?: 'Mutation', createWebhook: { __typename?: 'Webhook', id: string, targetUrl: string, operations: Array<string>, description?: string | null, secret: string } };

export type DeleteWebhookMutationVariables = Exact<{
  input: DeleteWebhookInput;
}>;


export type DeleteWebhookMutation = { __typename?: 'Mutation', deleteWebhook: boolean };

export type RevokeApiKeyMutationVariables = Exact<{
  input: RevokeApiKeyInput;
}>;


export type RevokeApiKeyMutation = { __typename?: 'Mutation', revokeApiKey?: { __typename?: 'ApiKey', id: string } | null };

export type UpdateApiKeyMutationVariables = Exact<{
  input: UpdateApiKeyInput;
}>;


export type UpdateApiKeyMutation = { __typename?: 'Mutation', updateApiKey?: { __typename?: 'ApiKey', id: string, name: string, expiresAt: string, revokedAt?: string | null, role: { __typename?: 'Role', id: string, label: string, icon?: string | null } } | null };

export type UpdateWebhookMutationVariables = Exact<{
  input: UpdateWebhookInput;
}>;


export type UpdateWebhookMutation = { __typename?: 'Mutation', updateWebhook?: { __typename?: 'Webhook', id: string, targetUrl: string, operations: Array<string>, description?: string | null, secret: string } | null };

export type GetApiKeyQueryVariables = Exact<{
  input: GetApiKeyInput;
}>;


export type GetApiKeyQuery = { __typename?: 'Query', apiKey?: { __typename?: 'ApiKey', createdAt: string, id: string, name: string, expiresAt: string, revokedAt?: string | null, role: { __typename?: 'Role', id: string, label: string, icon?: string | null } } | null };

export type GetApiKeysQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApiKeysQuery = { __typename?: 'Query', apiKeys: Array<{ __typename?: 'ApiKey', id: string, name: string, expiresAt: string, revokedAt?: string | null, role: { __typename?: 'Role', id: string, label: string, icon?: string | null } }> };

export type GetWebhookQueryVariables = Exact<{
  input: GetWebhookInput;
}>;


export type GetWebhookQuery = { __typename?: 'Query', webhook?: { __typename?: 'Webhook', id: string, targetUrl: string, operations: Array<string>, description?: string | null, secret: string } | null };

export type GetWebhooksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWebhooksQuery = { __typename?: 'Query', webhooks: Array<{ __typename?: 'Webhook', id: string, targetUrl: string, operations: Array<string>, description?: string | null, secret: string }> };

export type CheckPublicDomainValidRecordsMutationVariables = Exact<{
  domain: Scalars['String'];
}>;


export type CheckPublicDomainValidRecordsMutation = { __typename?: 'Mutation', checkPublicDomainValidRecords?: { __typename?: 'DomainValidRecords', id: string, domain: string, records: Array<{ __typename?: 'DomainRecord', type: string, key: string, value: string, validationType: string, status: string }> } | null };

export type CreatePublicDomainMutationVariables = Exact<{
  domain: Scalars['String'];
}>;


export type CreatePublicDomainMutation = { __typename?: 'Mutation', createPublicDomain: { __typename?: 'PublicDomain', id: string, domain: string, isValidated: boolean, createdAt: string } };

export type DeletePublicDomainMutationVariables = Exact<{
  domain: Scalars['String'];
}>;


export type DeletePublicDomainMutation = { __typename?: 'Mutation', deletePublicDomain: boolean };

export type FindManyPublicDomainsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindManyPublicDomainsQuery = { __typename?: 'Query', findManyPublicDomains: Array<{ __typename?: 'PublicDomain', id: string, domain: string, isValidated: boolean, createdAt: string }> };

export type CreateEmailingDomainMutationVariables = Exact<{
  domain: Scalars['String'];
  driver: EmailingDomainDriver;
}>;


export type CreateEmailingDomainMutation = { __typename?: 'Mutation', createEmailingDomain: { __typename?: 'EmailingDomain', id: string, domain: string, driver: EmailingDomainDriver, status: EmailingDomainStatus, verifiedAt?: string | null, createdAt: string, updatedAt: string, verificationRecords?: Array<{ __typename?: 'VerificationRecord', type: string, key: string, value: string, priority?: number | null }> | null } };

export type DeleteEmailingDomainMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DeleteEmailingDomainMutation = { __typename?: 'Mutation', deleteEmailingDomain: boolean };

export type VerifyEmailingDomainMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type VerifyEmailingDomainMutation = { __typename?: 'Mutation', verifyEmailingDomain: { __typename?: 'EmailingDomain', id: string, domain: string, driver: EmailingDomainDriver, status: EmailingDomainStatus, verifiedAt?: string | null, createdAt: string, updatedAt: string } };

export type GetEmailingDomainsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEmailingDomainsQuery = { __typename?: 'Query', getEmailingDomains: Array<{ __typename?: 'EmailingDomain', id: string, domain: string, driver: EmailingDomainDriver, status: EmailingDomainStatus, verifiedAt?: string | null, createdAt: string, updatedAt: string, verificationRecords?: Array<{ __typename?: 'VerificationRecord', type: string, key: string, value: string, priority?: number | null }> | null }> };

export type UpdateLabPublicFeatureFlagMutationVariables = Exact<{
  input: UpdateLabPublicFeatureFlagInput;
}>;


export type UpdateLabPublicFeatureFlagMutation = { __typename?: 'Mutation', updateLabPublicFeatureFlag: { __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean } };

export type UploadWorkspaceMemberProfilePictureMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadWorkspaceMemberProfilePictureMutation = { __typename?: 'Mutation', uploadWorkspaceMemberProfilePicture: { __typename?: 'SignedFile', path: string, token: string } };

export type UpdateUserEmailMutationVariables = Exact<{
  newEmail: Scalars['String'];
  verifyEmailRedirectPath?: InputMaybe<Scalars['String']>;
}>;


export type UpdateUserEmailMutation = { __typename?: 'Mutation', updateUserEmail: boolean };

export type ApiKeyForRoleFragmentFragment = { __typename?: 'ApiKeyForRole', id: string, name: string, expiresAt: string, revokedAt?: string | null };

export type FieldPermissionFragmentFragment = { __typename?: 'FieldPermission', objectMetadataId: string, fieldMetadataId: string, canReadFieldValue?: boolean | null, canUpdateFieldValue?: boolean | null, id: string, roleId: string };

export type ObjectPermissionFragmentFragment = { __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null, restrictedFields?: any | null };

export type PermissionFlagFragmentFragment = { __typename?: 'PermissionFlag', id: string, flag: PermissionFlagType, roleId: string };

export type RoleFragmentFragment = { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, canAccessAllTools: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, canBeAssignedToUsers: boolean, canBeAssignedToAgents: boolean, canBeAssignedToApiKeys: boolean };

export type CreateOneRoleMutationVariables = Exact<{
  createRoleInput: CreateRoleInput;
}>;


export type CreateOneRoleMutation = { __typename?: 'Mutation', createOneRole: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, canAccessAllTools: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, canBeAssignedToUsers: boolean, canBeAssignedToAgents: boolean, canBeAssignedToApiKeys: boolean } };

export type DeleteOneRoleMutationVariables = Exact<{
  roleId: Scalars['UUID'];
}>;


export type DeleteOneRoleMutation = { __typename?: 'Mutation', deleteOneRole: string };

export type UpdateOneRoleMutationVariables = Exact<{
  updateRoleInput: UpdateRoleInput;
}>;


export type UpdateOneRoleMutation = { __typename?: 'Mutation', updateOneRole: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, canAccessAllTools: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, canBeAssignedToUsers: boolean, canBeAssignedToAgents: boolean, canBeAssignedToApiKeys: boolean } };

export type UpdateWorkspaceMemberRoleMutationVariables = Exact<{
  workspaceMemberId: Scalars['UUID'];
  roleId: Scalars['UUID'];
}>;


export type UpdateWorkspaceMemberRoleMutation = { __typename?: 'Mutation', updateWorkspaceMemberRole: { __typename?: 'WorkspaceMember', id: string, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, calendarStartDay?: number | null, numberFormat?: WorkspaceMemberNumberFormatEnum | null, roles?: Array<{ __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, canAccessAllTools: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, canBeAssignedToUsers: boolean, canBeAssignedToAgents: boolean, canBeAssignedToApiKeys: boolean }> | null, name: { __typename?: 'FullName', firstName: string, lastName: string } } };

export type UpsertFieldPermissionsMutationVariables = Exact<{
  upsertFieldPermissionsInput: UpsertFieldPermissionsInput;
}>;


export type UpsertFieldPermissionsMutation = { __typename?: 'Mutation', upsertFieldPermissions: Array<{ __typename?: 'FieldPermission', objectMetadataId: string, fieldMetadataId: string, canReadFieldValue?: boolean | null, canUpdateFieldValue?: boolean | null, id: string, roleId: string }> };

export type UpsertObjectPermissionsMutationVariables = Exact<{
  upsertObjectPermissionsInput: UpsertObjectPermissionsInput;
}>;


export type UpsertObjectPermissionsMutation = { __typename?: 'Mutation', upsertObjectPermissions: Array<{ __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null, restrictedFields?: any | null }> };

export type UpsertPermissionFlagsMutationVariables = Exact<{
  upsertPermissionFlagsInput: UpsertPermissionFlagsInput;
}>;


export type UpsertPermissionFlagsMutation = { __typename?: 'Mutation', upsertPermissionFlags: Array<{ __typename?: 'PermissionFlag', id: string, flag: PermissionFlagType, roleId: string }> };

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = { __typename?: 'Query', getRoles: Array<{ __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, canAccessAllTools: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, canBeAssignedToUsers: boolean, canBeAssignedToAgents: boolean, canBeAssignedToApiKeys: boolean, workspaceMembers: Array<{ __typename?: 'WorkspaceMember', id: string, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }>, agents: Array<{ __typename?: 'Agent', id: string, name: string, label: string, description?: string | null, icon?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: string | null, isCustom: boolean, modelConfiguration?: any | null, evaluationInputs: Array<string>, applicationId?: string | null, createdAt: string, updatedAt: string }>, apiKeys: Array<{ __typename?: 'ApiKeyForRole', id: string, name: string, expiresAt: string, revokedAt?: string | null }>, permissionFlags?: Array<{ __typename?: 'PermissionFlag', id: string, flag: PermissionFlagType, roleId: string }> | null, objectPermissions?: Array<{ __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null, restrictedFields?: any | null }> | null, fieldPermissions?: Array<{ __typename?: 'FieldPermission', objectMetadataId: string, fieldMetadataId: string, canReadFieldValue?: boolean | null, canUpdateFieldValue?: boolean | null, id: string, roleId: string }> | null }> };

export type CreateApprovedAccessDomainMutationVariables = Exact<{
  input: CreateApprovedAccessDomainInput;
}>;


export type CreateApprovedAccessDomainMutation = { __typename?: 'Mutation', createApprovedAccessDomain: { __typename?: 'ApprovedAccessDomain', id: string, domain: string, isValidated: boolean, createdAt: string } };

export type CreateOidcIdentityProviderMutationVariables = Exact<{
  input: SetupOidcSsoInput;
}>;


export type CreateOidcIdentityProviderMutation = { __typename?: 'Mutation', createOIDCIdentityProvider: { __typename?: 'SetupSsoOutput', id: string, type: IdentityProviderType, issuer: string, name: string, status: SsoIdentityProviderStatus } };

export type CreateSamlIdentityProviderMutationVariables = Exact<{
  input: SetupSamlSsoInput;
}>;


export type CreateSamlIdentityProviderMutation = { __typename?: 'Mutation', createSAMLIdentityProvider: { __typename?: 'SetupSsoOutput', id: string, type: IdentityProviderType, issuer: string, name: string, status: SsoIdentityProviderStatus } };

export type DeleteApprovedAccessDomainMutationVariables = Exact<{
  input: DeleteApprovedAccessDomainInput;
}>;


export type DeleteApprovedAccessDomainMutation = { __typename?: 'Mutation', deleteApprovedAccessDomain: boolean };

export type DeleteSsoIdentityProviderMutationVariables = Exact<{
  input: DeleteSsoInput;
}>;


export type DeleteSsoIdentityProviderMutation = { __typename?: 'Mutation', deleteSSOIdentityProvider: { __typename?: 'DeleteSsoOutput', identityProviderId: string } };

export type EditSsoIdentityProviderMutationVariables = Exact<{
  input: EditSsoInput;
}>;


export type EditSsoIdentityProviderMutation = { __typename?: 'Mutation', editSSOIdentityProvider: { __typename?: 'EditSsoOutput', id: string, type: IdentityProviderType, issuer: string, name: string, status: SsoIdentityProviderStatus } };

export type ValidateApprovedAccessDomainMutationVariables = Exact<{
  input: ValidateApprovedAccessDomainInput;
}>;


export type ValidateApprovedAccessDomainMutation = { __typename?: 'Mutation', validateApprovedAccessDomain: { __typename?: 'ApprovedAccessDomain', id: string, isValidated: boolean, domain: string, createdAt: string } };

export type GetApprovedAccessDomainsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApprovedAccessDomainsQuery = { __typename?: 'Query', getApprovedAccessDomains: Array<{ __typename?: 'ApprovedAccessDomain', id: string, createdAt: string, domain: string, isValidated: boolean }> };

export type GetSsoIdentityProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSsoIdentityProvidersQuery = { __typename?: 'Query', getSSOIdentityProviders: Array<{ __typename?: 'FindAvailableSSOIDPOutput', type: IdentityProviderType, id: string, name: string, issuer: string, status: SsoIdentityProviderStatus }> };

export type ServerlessFunctionFieldsFragment = { __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null };

export type CreateOneServerlessFunctionItemMutationVariables = Exact<{
  input: CreateServerlessFunctionInput;
}>;


export type CreateOneServerlessFunctionItemMutation = { __typename?: 'Mutation', createOneServerlessFunction: { __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null } };

export type DeleteOneServerlessFunctionMutationVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type DeleteOneServerlessFunctionMutation = { __typename?: 'Mutation', deleteOneServerlessFunction: { __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null } };

export type ExecuteOneServerlessFunctionMutationVariables = Exact<{
  input: ExecuteServerlessFunctionInput;
}>;


export type ExecuteOneServerlessFunctionMutation = { __typename?: 'Mutation', executeOneServerlessFunction: { __typename?: 'ServerlessFunctionExecutionResult', data?: any | null, logs: string, duration: number, status: ServerlessFunctionExecutionStatus, error?: any | null } };

export type PublishOneServerlessFunctionMutationVariables = Exact<{
  input: PublishServerlessFunctionInput;
}>;


export type PublishOneServerlessFunctionMutation = { __typename?: 'Mutation', publishServerlessFunction: { __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null } };

export type UpdateOneServerlessFunctionMutationVariables = Exact<{
  input: UpdateServerlessFunctionInput;
}>;


export type UpdateOneServerlessFunctionMutation = { __typename?: 'Mutation', updateOneServerlessFunction: { __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null } };

export type FindManyAvailablePackagesQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type FindManyAvailablePackagesQuery = { __typename?: 'Query', getAvailablePackages: any };

export type GetManyServerlessFunctionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetManyServerlessFunctionsQuery = { __typename?: 'Query', findManyServerlessFunctions: Array<{ __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null }> };

export type GetOneServerlessFunctionQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type GetOneServerlessFunctionQuery = { __typename?: 'Query', findOneServerlessFunction: { __typename?: 'ServerlessFunction', id: string, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, publishedVersions: Array<string>, handlerPath: string, handlerName: string, toolInputSchema?: any | null, isTool: boolean, applicationId?: string | null, createdAt: string, updatedAt: string, cronTriggers?: Array<{ __typename?: 'CronTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, databaseEventTriggers?: Array<{ __typename?: 'DatabaseEventTrigger', id: string, settings: any, createdAt: string, updatedAt: string }> | null, routeTriggers?: Array<{ __typename?: 'RouteTrigger', id: string, path: string, isAuthRequired: boolean, httpMethod: HttpMethod, createdAt: string, updatedAt: string }> | null } };

export type FindOneServerlessFunctionSourceCodeQueryVariables = Exact<{
  input: GetServerlessFunctionSourceCodeInput;
}>;


export type FindOneServerlessFunctionSourceCodeQuery = { __typename?: 'Query', getServerlessFunctionSourceCode?: any | null };

export type VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationVariables = Exact<{
  otp: Scalars['String'];
}>;


export type VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation = { __typename?: 'Mutation', verifyTwoFactorAuthenticationMethodForAuthenticatedUser: { __typename?: 'VerifyTwoFactorAuthenticationMethodOutput', success: boolean } };

export type BillingSubscriptionFragmentFragment = { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> };

export type CurrentBillingSubscriptionFragmentFragment = { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null };

export type UserQueryFragmentFragment = { __typename?: 'User', id: string, firstName: string, lastName: string, email: string, hasPassword: boolean, canAccessFullAdminPanel: boolean, canImpersonate: boolean, supportUserHash?: string | null, onboardingStatus?: OnboardingStatus | null, userVars?: any | null, workspaceMember?: { __typename?: 'WorkspaceMember', id: string, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, calendarStartDay?: number | null, numberFormat?: WorkspaceMemberNumberFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } } | null, workspaceMembers?: Array<{ __typename?: 'WorkspaceMember', id: string, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }> | null, deletedWorkspaceMembers?: Array<{ __typename?: 'DeletedWorkspaceMember', id: string, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }> | null, currentUserWorkspace?: { __typename?: 'UserWorkspace', id: string, permissionFlags?: Array<PermissionFlagType> | null, objectsPermissions?: Array<{ __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null, restrictedFields?: any | null }> | null, twoFactorAuthenticationMethodSummary?: Array<{ __typename?: 'TwoFactorAuthenticationMethodDTO', twoFactorAuthenticationMethodId: string, status: string, strategy: string }> | null } | null, currentWorkspace?: { __typename?: 'Workspace', id: string, displayName?: string | null, logo?: string | null, inviteHash?: string | null, allowImpersonation: boolean, activationStatus: WorkspaceActivationStatus, isPublicInviteLinkEnabled: boolean, isGoogleAuthEnabled: boolean, isMicrosoftAuthEnabled: boolean, isPasswordAuthEnabled: boolean, isGoogleAuthBypassEnabled: boolean, isMicrosoftAuthBypassEnabled: boolean, isPasswordAuthBypassEnabled: boolean, subdomain: string, hasValidEnterpriseKey: boolean, isCustomDomainEnabled: boolean, metadataVersion: number, workspaceMembersCount?: number | null, fastModel: string, smartModel: string, isTwoFactorAuthenticationEnforced: boolean, trashRetentionDays: number, editableProfileFields?: Array<string> | null, workspaceCustomApplication?: { __typename?: 'Application', id: string } | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, featureFlags?: Array<{ __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean }> | null, currentBillingSubscription?: { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null } | null, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> }>, defaultRole?: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, canAccessAllTools: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, canBeAssignedToUsers: boolean, canBeAssignedToAgents: boolean, canBeAssignedToApiKeys: boolean } | null } | null, availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> } };

export type WorkspaceUrlsFragmentFragment = { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null };

export type DeleteUserAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserAccountMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'User', id: string } };

export type DeleteUserWorkspaceMutationVariables = Exact<{
  workspaceMemberIdToDelete: Scalars['String'];
}>;


export type DeleteUserWorkspaceMutation = { __typename?: 'Mutation', deleteUserFromWorkspace: { __typename?: 'UserWorkspace', id: string } };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string, hasPassword: boolean, canAccessFullAdminPanel: boolean, canImpersonate: boolean, supportUserHash?: string | null, onboardingStatus?: OnboardingStatus | null, userVars?: any | null, workspaceMember?: { __typename?: 'WorkspaceMember', id: string, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, calendarStartDay?: number | null, numberFormat?: WorkspaceMemberNumberFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } } | null, workspaceMembers?: Array<{ __typename?: 'WorkspaceMember', id: string, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }> | null, deletedWorkspaceMembers?: Array<{ __typename?: 'DeletedWorkspaceMember', id: string, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }> | null, currentUserWorkspace?: { __typename?: 'UserWorkspace', id: string, permissionFlags?: Array<PermissionFlagType> | null, objectsPermissions?: Array<{ __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null, restrictedFields?: any | null }> | null, twoFactorAuthenticationMethodSummary?: Array<{ __typename?: 'TwoFactorAuthenticationMethodDTO', twoFactorAuthenticationMethodId: string, status: string, strategy: string }> | null } | null, currentWorkspace?: { __typename?: 'Workspace', id: string, displayName?: string | null, logo?: string | null, inviteHash?: string | null, allowImpersonation: boolean, activationStatus: WorkspaceActivationStatus, isPublicInviteLinkEnabled: boolean, isGoogleAuthEnabled: boolean, isMicrosoftAuthEnabled: boolean, isPasswordAuthEnabled: boolean, isGoogleAuthBypassEnabled: boolean, isMicrosoftAuthBypassEnabled: boolean, isPasswordAuthBypassEnabled: boolean, subdomain: string, hasValidEnterpriseKey: boolean, isCustomDomainEnabled: boolean, metadataVersion: number, workspaceMembersCount?: number | null, fastModel: string, smartModel: string, isTwoFactorAuthenticationEnforced: boolean, trashRetentionDays: number, editableProfileFields?: Array<string> | null, workspaceCustomApplication?: { __typename?: 'Application', id: string } | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, featureFlags?: Array<{ __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean }> | null, currentBillingSubscription?: { __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, currentPeriodEnd?: string | null, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }>, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItemDTO', id: string, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, stripePriceId: string, billingProduct: { __typename?: 'BillingLicensedProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } | { __typename?: 'BillingMeteredProduct', name: string, description: string, images?: Array<string> | null, metadata: { __typename?: 'BillingProductMetadata', productKey: BillingProductKey, planKey: BillingPlanKey, priceUsageBased: BillingUsageType } } }> | null } | null, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: string, status: SubscriptionStatus, metadata: any, phases: Array<{ __typename?: 'BillingSubscriptionSchedulePhase', start_date: number, end_date: number, items: Array<{ __typename?: 'BillingSubscriptionSchedulePhaseItem', price: string, quantity?: number | null }> }> }>, defaultRole?: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, canAccessAllTools: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, canBeAssignedToUsers: boolean, canBeAssignedToAgents: boolean, canBeAssignedToApiKeys: boolean } | null } | null, availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> } } };

export type ViewFieldFragmentFragment = { __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null };

export type ViewFilterFragmentFragment = { __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null };

export type ViewFilterGroupFragmentFragment = { __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string };

export type ViewFragmentFragment = { __typename?: 'CoreView', id: string, name: string, objectMetadataId: string, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: string | null, mainGroupByFieldMetadataId?: string | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: string | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: string | null, viewFields: Array<{ __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type ViewGroupFragmentFragment = { __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null };

export type ViewSortFragmentFragment = { __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string };

export type CreateCoreViewMutationVariables = Exact<{
  input: CreateViewInput;
}>;


export type CreateCoreViewMutation = { __typename?: 'Mutation', createCoreView: { __typename?: 'CoreView', id: string, name: string, objectMetadataId: string, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: string | null, mainGroupByFieldMetadataId?: string | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: string | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: string | null, viewFields: Array<{ __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> } };

export type CreateCoreViewFieldMutationVariables = Exact<{
  input: CreateViewFieldInput;
}>;


export type CreateCoreViewFieldMutation = { __typename?: 'Mutation', createCoreViewField: { __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CreateCoreViewFilterMutationVariables = Exact<{
  input: CreateViewFilterInput;
}>;


export type CreateCoreViewFilterMutation = { __typename?: 'Mutation', createCoreViewFilter: { __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CreateCoreViewFilterGroupMutationVariables = Exact<{
  input: CreateViewFilterGroupInput;
}>;


export type CreateCoreViewFilterGroupMutation = { __typename?: 'Mutation', createCoreViewFilterGroup: { __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string } };

export type CreateCoreViewGroupMutationVariables = Exact<{
  input: CreateViewGroupInput;
}>;


export type CreateCoreViewGroupMutation = { __typename?: 'Mutation', createCoreViewGroup: { __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CreateCoreViewSortMutationVariables = Exact<{
  input: CreateViewSortInput;
}>;


export type CreateCoreViewSortMutation = { __typename?: 'Mutation', createCoreViewSort: { __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string } };

export type CreateManyCoreViewFieldsMutationVariables = Exact<{
  inputs: Array<CreateViewFieldInput> | CreateViewFieldInput;
}>;


export type CreateManyCoreViewFieldsMutation = { __typename?: 'Mutation', createManyCoreViewFields: Array<{ __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type CreateManyCoreViewGroupsMutationVariables = Exact<{
  inputs: Array<CreateViewGroupInput> | CreateViewGroupInput;
}>;


export type CreateManyCoreViewGroupsMutation = { __typename?: 'Mutation', createManyCoreViewGroups: Array<{ __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type DeleteCoreViewMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DeleteCoreViewMutation = { __typename?: 'Mutation', deleteCoreView: boolean };

export type DeleteCoreViewFieldMutationVariables = Exact<{
  input: DeleteViewFieldInput;
}>;


export type DeleteCoreViewFieldMutation = { __typename?: 'Mutation', deleteCoreViewField: { __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DeleteCoreViewFilterMutationVariables = Exact<{
  input: DeleteViewFilterInput;
}>;


export type DeleteCoreViewFilterMutation = { __typename?: 'Mutation', deleteCoreViewFilter: { __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DeleteCoreViewFilterGroupMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DeleteCoreViewFilterGroupMutation = { __typename?: 'Mutation', deleteCoreViewFilterGroup: boolean };

export type DeleteCoreViewGroupMutationVariables = Exact<{
  input: DeleteViewGroupInput;
}>;


export type DeleteCoreViewGroupMutation = { __typename?: 'Mutation', deleteCoreViewGroup: { __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DeleteCoreViewSortMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DeleteCoreViewSortMutation = { __typename?: 'Mutation', deleteCoreViewSort: boolean };

export type DestroyCoreViewMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DestroyCoreViewMutation = { __typename?: 'Mutation', destroyCoreView: boolean };

export type DestroyCoreViewFieldMutationVariables = Exact<{
  input: DestroyViewFieldInput;
}>;


export type DestroyCoreViewFieldMutation = { __typename?: 'Mutation', destroyCoreViewField: { __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DestroyCoreViewFilterMutationVariables = Exact<{
  input: DestroyViewFilterInput;
}>;


export type DestroyCoreViewFilterMutation = { __typename?: 'Mutation', destroyCoreViewFilter: { __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DestroyCoreViewFilterGroupMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DestroyCoreViewFilterGroupMutation = { __typename?: 'Mutation', destroyCoreViewFilterGroup: boolean };

export type DestroyCoreViewGroupMutationVariables = Exact<{
  input: DestroyViewGroupInput;
}>;


export type DestroyCoreViewGroupMutation = { __typename?: 'Mutation', destroyCoreViewGroup: { __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DestroyCoreViewSortMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DestroyCoreViewSortMutation = { __typename?: 'Mutation', destroyCoreViewSort: boolean };

export type UpdateCoreViewMutationVariables = Exact<{
  id: Scalars['String'];
  input: UpdateViewInput;
}>;


export type UpdateCoreViewMutation = { __typename?: 'Mutation', updateCoreView: { __typename?: 'CoreView', id: string, name: string, objectMetadataId: string, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: string | null, mainGroupByFieldMetadataId?: string | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: string | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: string | null, viewFields: Array<{ __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> } };

export type UpdateCoreViewFieldMutationVariables = Exact<{
  input: UpdateViewFieldInput;
}>;


export type UpdateCoreViewFieldMutation = { __typename?: 'Mutation', updateCoreViewField: { __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type UpdateCoreViewFilterMutationVariables = Exact<{
  input: UpdateViewFilterInput;
}>;


export type UpdateCoreViewFilterMutation = { __typename?: 'Mutation', updateCoreViewFilter: { __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type UpdateCoreViewFilterGroupMutationVariables = Exact<{
  id: Scalars['String'];
  input: UpdateViewFilterGroupInput;
}>;


export type UpdateCoreViewFilterGroupMutation = { __typename?: 'Mutation', updateCoreViewFilterGroup: { __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string } };

export type UpdateCoreViewGroupMutationVariables = Exact<{
  input: UpdateViewGroupInput;
}>;


export type UpdateCoreViewGroupMutation = { __typename?: 'Mutation', updateCoreViewGroup: { __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type UpdateCoreViewSortMutationVariables = Exact<{
  id: Scalars['String'];
  input: UpdateViewSortInput;
}>;


export type UpdateCoreViewSortMutation = { __typename?: 'Mutation', updateCoreViewSort: { __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string } };

export type FindAllCoreViewsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindAllCoreViewsQuery = { __typename?: 'Query', getCoreViews: Array<{ __typename?: 'CoreView', id: string, name: string, objectMetadataId: string, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: string | null, mainGroupByFieldMetadataId?: string | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: string | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: string | null, viewFields: Array<{ __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> }> };

export type FindManyCoreViewFieldsQueryVariables = Exact<{
  viewId: Scalars['String'];
}>;


export type FindManyCoreViewFieldsQuery = { __typename?: 'Query', getCoreViewFields: Array<{ __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type FindManyCoreViewFilterGroupsQueryVariables = Exact<{
  viewId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewFilterGroupsQuery = { __typename?: 'Query', getCoreViewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string }> };

export type FindManyCoreViewFiltersQueryVariables = Exact<{
  viewId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewFiltersQuery = { __typename?: 'Query', getCoreViewFilters: Array<{ __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type FindManyCoreViewGroupsQueryVariables = Exact<{
  viewId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewGroupsQuery = { __typename?: 'Query', getCoreViewGroups: Array<{ __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type FindManyCoreViewSortsQueryVariables = Exact<{
  viewId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewSortsQuery = { __typename?: 'Query', getCoreViewSorts: Array<{ __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string }> };

export type FindManyCoreViewsQueryVariables = Exact<{
  objectMetadataId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewsQuery = { __typename?: 'Query', getCoreViews: Array<{ __typename?: 'CoreView', id: string, name: string, objectMetadataId: string, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: string | null, mainGroupByFieldMetadataId?: string | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: string | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: string | null, viewFields: Array<{ __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> }> };

export type FindOneCoreViewQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewQuery = { __typename?: 'Query', getCoreView?: { __typename?: 'CoreView', id: string, name: string, objectMetadataId: string, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: string | null, mainGroupByFieldMetadataId?: string | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: string | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: string | null, viewFields: Array<{ __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null }> } | null };

export type FindOneCoreViewFieldQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewFieldQuery = { __typename?: 'Query', getCoreViewField?: { __typename?: 'CoreViewField', id: string, fieldMetadataId: string, viewId: string, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } | null };

export type FindOneCoreViewFilterQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewFilterQuery = { __typename?: 'Query', getCoreViewFilter?: { __typename?: 'CoreViewFilter', id: string, fieldMetadataId: string, operand: ViewFilterOperand, value: any, viewFilterGroupId?: string | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } | null };

export type FindOneCoreViewFilterGroupQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewFilterGroupQuery = { __typename?: 'Query', getCoreViewFilterGroup?: { __typename?: 'CoreViewFilterGroup', id: string, parentViewFilterGroupId?: string | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: string } | null };

export type FindOneCoreViewGroupQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewGroupQuery = { __typename?: 'Query', getCoreViewGroup?: { __typename?: 'CoreViewGroup', id: string, isVisible: boolean, fieldValue: string, position: number, viewId: string, createdAt: string, updatedAt: string, deletedAt?: string | null } | null };

export type FindOneCoreViewSortQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewSortQuery = { __typename?: 'Query', getCoreViewSort?: { __typename?: 'CoreViewSort', id: string, fieldMetadataId: string, direction: ViewSortDirection, viewId: string } | null };

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


export type CreateDraftFromWorkflowVersionMutation = { __typename?: 'Mutation', createDraftFromWorkflowVersion: { __typename?: 'WorkflowVersionDTO', id: string, name: string, status: string, trigger?: any | null, steps?: any | null, createdAt: string, updatedAt: string } };

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


export type DuplicateWorkflowMutation = { __typename?: 'Mutation', duplicateWorkflow: { __typename?: 'WorkflowVersionDTO', id: string, name: string, status: string, trigger?: any | null, steps?: any | null, createdAt: string, updatedAt: string, workflowId: string } };

export type DuplicateWorkflowVersionStepMutationVariables = Exact<{
  input: DuplicateWorkflowVersionStepInput;
}>;


export type DuplicateWorkflowVersionStepMutation = { __typename?: 'Mutation', duplicateWorkflowVersionStep: { __typename?: 'WorkflowVersionStepChanges', triggerDiff?: any | null, stepsDiff?: any | null } };

export type RunWorkflowVersionMutationVariables = Exact<{
  input: RunWorkflowVersionInput;
}>;


export type RunWorkflowVersionMutation = { __typename?: 'Mutation', runWorkflowVersion: { __typename?: 'RunWorkflowVersionOutput', workflowRunId: string } };

export type StopWorkflowRunMutationVariables = Exact<{
  workflowRunId: Scalars['UUID'];
}>;


export type StopWorkflowRunMutation = { __typename?: 'Mutation', stopWorkflowRun: { __typename: 'WorkflowRun', id: string, status: WorkflowRunStatusEnum } };

export type UpdateWorkflowRunStepMutationVariables = Exact<{
  input: UpdateWorkflowRunStepInput;
}>;


export type UpdateWorkflowRunStepMutation = { __typename?: 'Mutation', updateWorkflowRunStep: { __typename?: 'WorkflowAction', id: string, name: string, type: WorkflowActionType, settings: any, valid: boolean, nextStepIds?: Array<string> | null, position?: { __typename?: 'WorkflowStepPosition', x: number, y: number } | null } };

export type UpdateWorkflowVersionStepMutationVariables = Exact<{
  input: UpdateWorkflowVersionStepInput;
}>;


export type UpdateWorkflowVersionStepMutation = { __typename?: 'Mutation', updateWorkflowVersionStep: { __typename?: 'WorkflowAction', id: string, name: string, type: WorkflowActionType, settings: any, valid: boolean, nextStepIds?: Array<string> | null, position?: { __typename?: 'WorkflowStepPosition', x: number, y: number } | null } };

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

export type DeleteWorkspaceInvitationMutationVariables = Exact<{
  appTokenId: Scalars['String'];
}>;


export type DeleteWorkspaceInvitationMutation = { __typename?: 'Mutation', deleteWorkspaceInvitation: string };

export type ResendWorkspaceInvitationMutationVariables = Exact<{
  appTokenId: Scalars['String'];
}>;


export type ResendWorkspaceInvitationMutation = { __typename?: 'Mutation', resendWorkspaceInvitation: { __typename?: 'SendInvitationsOutput', success: boolean, errors: Array<string>, result: Array<{ __typename?: 'WorkspaceInvitation', id: string, email: string, expiresAt: string }> } };

export type SendInvitationsMutationVariables = Exact<{
  emails: Array<Scalars['String']> | Scalars['String'];
}>;


export type SendInvitationsMutation = { __typename?: 'Mutation', sendInvitations: { __typename?: 'SendInvitationsOutput', success: boolean, errors: Array<string>, result: Array<{ __typename?: 'WorkspaceInvitation', id: string, email: string, expiresAt: string }> } };

export type GetWorkspaceInvitationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspaceInvitationsQuery = { __typename?: 'Query', findWorkspaceInvitations: Array<{ __typename?: 'WorkspaceInvitation', id: string, email: string, expiresAt: string }> };

export type DeletedWorkspaceMemberQueryFragmentFragment = { __typename?: 'DeletedWorkspaceMember', id: string, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } };

export type PartialWorkspaceMemberQueryFragmentFragment = { __typename?: 'WorkspaceMember', id: string, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } };

export type WorkspaceMemberQueryFragmentFragment = { __typename?: 'WorkspaceMember', id: string, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, calendarStartDay?: number | null, numberFormat?: WorkspaceMemberNumberFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } };

export type ActivateWorkspaceMutationVariables = Exact<{
  input: ActivateWorkspaceInput;
}>;


export type ActivateWorkspaceMutation = { __typename?: 'Mutation', activateWorkspace: { __typename?: 'Workspace', id: string } };

export type DeleteCurrentWorkspaceMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteCurrentWorkspaceMutation = { __typename?: 'Mutation', deleteCurrentWorkspace: { __typename?: 'Workspace', id: string } };

export type UpdateWorkspaceMutationVariables = Exact<{
  input: UpdateWorkspaceInput;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: string, customDomain?: string | null, subdomain: string, displayName?: string | null, logo?: string | null, allowImpersonation: boolean, isPublicInviteLinkEnabled: boolean, isGoogleAuthEnabled: boolean, isMicrosoftAuthEnabled: boolean, isPasswordAuthEnabled: boolean, isTwoFactorAuthenticationEnforced: boolean, defaultRole?: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, canAccessAllTools: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, canBeAssignedToUsers: boolean, canBeAssignedToAgents: boolean, canBeAssignedToApiKeys: boolean } | null } };

export type UploadWorkspaceLogoMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadWorkspaceLogoMutation = { __typename?: 'Mutation', uploadWorkspaceLogo: { __typename?: 'SignedFile', path: string, token: string } };

export type CheckCustomDomainValidRecordsMutationVariables = Exact<{ [key: string]: never; }>;


export type CheckCustomDomainValidRecordsMutation = { __typename?: 'Mutation', checkCustomDomainValidRecords?: { __typename?: 'DomainValidRecords', id: string, domain: string, records: Array<{ __typename?: 'DomainRecord', type: string, key: string, value: string, validationType: string, status: string }> } | null };

export type GetWorkspaceFromInviteHashQueryVariables = Exact<{
  inviteHash: Scalars['String'];
}>;


export type GetWorkspaceFromInviteHashQuery = { __typename?: 'Query', findWorkspaceFromInviteHash: { __typename?: 'Workspace', id: string, displayName?: string | null, logo?: string | null, allowImpersonation: boolean } };

export const SkillFieldsFragmentDoc = gql`
    fragment SkillFields on Skill {
  id
  name
  label
  description
  icon
  content
  isCustom
  isActive
  createdAt
  updatedAt
}
    `;
export const AgentFieldsFragmentDoc = gql`
    fragment AgentFields on Agent {
  id
  name
  label
  description
  icon
  prompt
  modelId
  responseFormat
  roleId
  isCustom
  modelConfiguration
  evaluationInputs
  applicationId
  createdAt
  updatedAt
}
    `;
export const ObjectMetadataFieldsFragmentDoc = gql`
    fragment ObjectMetadataFields on Object {
  id
  nameSingular
  namePlural
  labelSingular
  labelPlural
  description
  icon
  isCustom
  isRemote
  isActive
  isSystem
  isUIReadOnly
  createdAt
  updatedAt
  labelIdentifierFieldMetadataId
  imageIdentifierFieldMetadataId
  applicationId
  shortcut
  isLabelSyncedWithName
  isSearchable
  duplicateCriteria
  indexMetadataList {
    id
    createdAt
    updatedAt
    name
    indexWhereClause
    indexType
    isUnique
    isCustom
    indexFieldMetadataList {
      id
      fieldMetadataId
      createdAt
      updatedAt
      order
    }
  }
  fieldsList {
    id
    type
    name
    label
    description
    icon
    isCustom
    isActive
    isSystem
    isUIReadOnly
    isNullable
    isUnique
    createdAt
    updatedAt
    defaultValue
    options
    settings
    isLabelSyncedWithName
    applicationId
    relation {
      type
      sourceObjectMetadata {
        id
        nameSingular
        namePlural
      }
      targetObjectMetadata {
        id
        nameSingular
        namePlural
      }
      sourceFieldMetadata {
        id
        name
      }
      targetFieldMetadata {
        id
        name
      }
    }
    morphRelations {
      type
      sourceObjectMetadata {
        id
        nameSingular
        namePlural
      }
      targetObjectMetadata {
        id
        nameSingular
        namePlural
      }
      sourceFieldMetadata {
        id
        name
      }
      targetFieldMetadata {
        id
        name
      }
    }
  }
}
    `;
export const ServerlessFunctionFieldsFragmentDoc = gql`
    fragment ServerlessFunctionFields on ServerlessFunction {
  id
  name
  description
  runtime
  timeoutSeconds
  latestVersion
  publishedVersions
  handlerPath
  handlerName
  cronTriggers {
    id
    settings
    createdAt
    updatedAt
  }
  databaseEventTriggers {
    id
    settings
    createdAt
    updatedAt
  }
  routeTriggers {
    id
    path
    isAuthRequired
    httpMethod
    createdAt
    updatedAt
  }
  toolInputSchema
  isTool
  applicationId
  createdAt
  updatedAt
}
    `;
export const ApplicationFieldsFragmentDoc = gql`
    fragment ApplicationFields on Application {
  id
  name
  description
  version
  universalIdentifier
  canBeUninstalled
  applicationVariables {
    id
    key
    value
    description
    isSecret
  }
  agents {
    ...AgentFields
  }
  objects {
    ...ObjectMetadataFields
  }
  serverlessFunctions {
    ...ServerlessFunctionFields
  }
}
    ${AgentFieldsFragmentDoc}
${ObjectMetadataFieldsFragmentDoc}
${ServerlessFunctionFieldsFragmentDoc}`;
export const AuthTokenFragmentFragmentDoc = gql`
    fragment AuthTokenFragment on AuthToken {
  token
  expiresAt
}
    `;
export const AuthTokenPairFragmentFragmentDoc = gql`
    fragment AuthTokenPairFragment on AuthTokenPair {
  accessOrWorkspaceAgnosticToken {
    ...AuthTokenFragment
  }
  refreshToken {
    ...AuthTokenFragment
  }
}
    ${AuthTokenFragmentFragmentDoc}`;
export const AvailableSsoIdentityProvidersFragmentFragmentDoc = gql`
    fragment AvailableSSOIdentityProvidersFragment on FindAvailableSSOIDPOutput {
  id
  issuer
  name
  status
  workspace {
    id
    displayName
  }
}
    `;
export const BillingPriceLicensedFragmentFragmentDoc = gql`
    fragment BillingPriceLicensedFragment on BillingPriceLicensed {
  stripePriceId
  unitAmount
  recurringInterval
  priceUsageType
}
    `;
export const BillingPriceMeteredFragmentFragmentDoc = gql`
    fragment BillingPriceMeteredFragment on BillingPriceMetered {
  priceUsageType
  recurringInterval
  stripePriceId
  tiers {
    flatAmount
    unitAmount
    upTo
  }
}
    `;
export const RemoteServerFieldsFragmentDoc = gql`
    fragment RemoteServerFields on RemoteServer {
  id
  createdAt
  foreignDataWrapperId
  foreignDataWrapperOptions
  foreignDataWrapperType
  userMappingOptions {
    user
  }
  updatedAt
  schema
  label
}
    `;
export const RemoteTableFieldsFragmentDoc = gql`
    fragment RemoteTableFields on RemoteTable {
  id
  name
  schema
  status
  schemaPendingUpdates
}
    `;
export const ApiKeyFragmentFragmentDoc = gql`
    fragment ApiKeyFragment on ApiKey {
  id
  name
  expiresAt
  revokedAt
  role {
    id
    label
    icon
  }
}
    `;
export const WebhookFragmentFragmentDoc = gql`
    fragment WebhookFragment on Webhook {
  id
  targetUrl
  operations
  description
  secret
}
    `;
export const ApiKeyForRoleFragmentFragmentDoc = gql`
    fragment ApiKeyForRoleFragment on ApiKeyForRole {
  id
  name
  expiresAt
  revokedAt
}
    `;
export const FieldPermissionFragmentFragmentDoc = gql`
    fragment FieldPermissionFragment on FieldPermission {
  objectMetadataId
  fieldMetadataId
  canReadFieldValue
  canUpdateFieldValue
  id
  roleId
}
    `;
export const PermissionFlagFragmentFragmentDoc = gql`
    fragment PermissionFlagFragment on PermissionFlag {
  id
  flag
  roleId
}
    `;
export const WorkspaceMemberQueryFragmentFragmentDoc = gql`
    fragment WorkspaceMemberQueryFragment on WorkspaceMember {
  id
  name {
    firstName
    lastName
  }
  colorScheme
  avatarUrl
  locale
  userEmail
  timeZone
  dateFormat
  timeFormat
  calendarStartDay
  numberFormat
}
    `;
export const PartialWorkspaceMemberQueryFragmentFragmentDoc = gql`
    fragment PartialWorkspaceMemberQueryFragment on WorkspaceMember {
  id
  name {
    firstName
    lastName
  }
  avatarUrl
  userEmail
}
    `;
export const DeletedWorkspaceMemberQueryFragmentFragmentDoc = gql`
    fragment DeletedWorkspaceMemberQueryFragment on DeletedWorkspaceMember {
  id
  name {
    firstName
    lastName
  }
  avatarUrl
  userEmail
}
    `;
export const ObjectPermissionFragmentFragmentDoc = gql`
    fragment ObjectPermissionFragment on ObjectPermission {
  objectMetadataId
  canReadObjectRecords
  canUpdateObjectRecords
  canSoftDeleteObjectRecords
  canDestroyObjectRecords
  restrictedFields
}
    `;
export const WorkspaceUrlsFragmentFragmentDoc = gql`
    fragment WorkspaceUrlsFragment on WorkspaceUrls {
  subdomainUrl
  customUrl
}
    `;
export const BillingSubscriptionSchedulePhaseItemFragmentFragmentDoc = gql`
    fragment BillingSubscriptionSchedulePhaseItemFragment on BillingSubscriptionSchedulePhaseItem {
  price
  quantity
}
    `;
export const BillingSubscriptionSchedulePhaseFragmentFragmentDoc = gql`
    fragment BillingSubscriptionSchedulePhaseFragment on BillingSubscriptionSchedulePhase {
  start_date
  end_date
  items {
    ...BillingSubscriptionSchedulePhaseItemFragment
  }
}
    ${BillingSubscriptionSchedulePhaseItemFragmentFragmentDoc}`;
export const CurrentBillingSubscriptionFragmentFragmentDoc = gql`
    fragment CurrentBillingSubscriptionFragment on BillingSubscription {
  id
  status
  interval
  metadata
  currentPeriodEnd
  phases {
    ...BillingSubscriptionSchedulePhaseFragment
  }
  billingSubscriptionItems {
    id
    hasReachedCurrentPeriodCap
    quantity
    stripePriceId
    billingProduct {
      name
      description
      images
      metadata {
        productKey
        planKey
        priceUsageBased
      }
    }
  }
}
    ${BillingSubscriptionSchedulePhaseFragmentFragmentDoc}`;
export const BillingSubscriptionFragmentFragmentDoc = gql`
    fragment BillingSubscriptionFragment on BillingSubscription {
  id
  status
  metadata
  phases {
    ...BillingSubscriptionSchedulePhaseFragment
  }
}
    ${BillingSubscriptionSchedulePhaseFragmentFragmentDoc}`;
export const RoleFragmentFragmentDoc = gql`
    fragment RoleFragment on Role {
  id
  label
  description
  icon
  canUpdateAllSettings
  canAccessAllTools
  isEditable
  canReadAllObjectRecords
  canUpdateAllObjectRecords
  canSoftDeleteAllObjectRecords
  canDestroyAllObjectRecords
  canBeAssignedToUsers
  canBeAssignedToAgents
  canBeAssignedToApiKeys
}
    `;
export const AvailableWorkspaceFragmentFragmentDoc = gql`
    fragment AvailableWorkspaceFragment on AvailableWorkspace {
  id
  displayName
  loginToken
  inviteHash
  personalInviteToken
  workspaceUrls {
    subdomainUrl
    customUrl
  }
  logo
  sso {
    type
    id
    issuer
    name
    status
  }
}
    `;
export const AvailableWorkspacesFragmentFragmentDoc = gql`
    fragment AvailableWorkspacesFragment on AvailableWorkspaces {
  availableWorkspacesForSignIn {
    ...AvailableWorkspaceFragment
  }
  availableWorkspacesForSignUp {
    ...AvailableWorkspaceFragment
  }
}
    ${AvailableWorkspaceFragmentFragmentDoc}`;
export const UserQueryFragmentFragmentDoc = gql`
    fragment UserQueryFragment on User {
  id
  firstName
  lastName
  email
  hasPassword
  canAccessFullAdminPanel
  canImpersonate
  supportUserHash
  onboardingStatus
  workspaceMember {
    ...WorkspaceMemberQueryFragment
  }
  workspaceMembers {
    ...PartialWorkspaceMemberQueryFragment
  }
  deletedWorkspaceMembers {
    ...DeletedWorkspaceMemberQueryFragment
  }
  currentUserWorkspace {
    id
    permissionFlags
    objectsPermissions {
      ...ObjectPermissionFragment
    }
    twoFactorAuthenticationMethodSummary {
      twoFactorAuthenticationMethodId
      status
      strategy
    }
  }
  currentWorkspace {
    id
    displayName
    logo
    inviteHash
    allowImpersonation
    activationStatus
    isPublicInviteLinkEnabled
    isGoogleAuthEnabled
    isMicrosoftAuthEnabled
    isPasswordAuthEnabled
    isGoogleAuthBypassEnabled
    isMicrosoftAuthBypassEnabled
    isPasswordAuthBypassEnabled
    subdomain
    hasValidEnterpriseKey
    workspaceCustomApplication {
      id
    }
    isCustomDomainEnabled
    workspaceUrls {
      ...WorkspaceUrlsFragment
    }
    featureFlags {
      key
      value
    }
    metadataVersion
    currentBillingSubscription {
      ...CurrentBillingSubscriptionFragment
    }
    billingSubscriptions {
      ...BillingSubscriptionFragment
    }
    workspaceMembersCount
    defaultRole {
      ...RoleFragment
    }
    fastModel
    smartModel
    isTwoFactorAuthenticationEnforced
    trashRetentionDays
    editableProfileFields
  }
  availableWorkspaces {
    ...AvailableWorkspacesFragment
  }
  userVars
}
    ${WorkspaceMemberQueryFragmentFragmentDoc}
${PartialWorkspaceMemberQueryFragmentFragmentDoc}
${DeletedWorkspaceMemberQueryFragmentFragmentDoc}
${ObjectPermissionFragmentFragmentDoc}
${WorkspaceUrlsFragmentFragmentDoc}
${CurrentBillingSubscriptionFragmentFragmentDoc}
${BillingSubscriptionFragmentFragmentDoc}
${RoleFragmentFragmentDoc}
${AvailableWorkspacesFragmentFragmentDoc}`;
export const ViewFieldFragmentFragmentDoc = gql`
    fragment ViewFieldFragment on CoreViewField {
  id
  fieldMetadataId
  viewId
  isVisible
  position
  size
  aggregateOperation
  createdAt
  updatedAt
  deletedAt
}
    `;
export const ViewFilterFragmentFragmentDoc = gql`
    fragment ViewFilterFragment on CoreViewFilter {
  id
  fieldMetadataId
  operand
  value
  viewFilterGroupId
  positionInViewFilterGroup
  subFieldName
  viewId
  createdAt
  updatedAt
  deletedAt
}
    `;
export const ViewFilterGroupFragmentFragmentDoc = gql`
    fragment ViewFilterGroupFragment on CoreViewFilterGroup {
  id
  parentViewFilterGroupId
  logicalOperator
  positionInViewFilterGroup
  viewId
}
    `;
export const ViewSortFragmentFragmentDoc = gql`
    fragment ViewSortFragment on CoreViewSort {
  id
  fieldMetadataId
  direction
  viewId
}
    `;
export const ViewGroupFragmentFragmentDoc = gql`
    fragment ViewGroupFragment on CoreViewGroup {
  id
  isVisible
  fieldValue
  position
  viewId
  createdAt
  updatedAt
  deletedAt
}
    `;
export const ViewFragmentFragmentDoc = gql`
    fragment ViewFragment on CoreView {
  id
  name
  objectMetadataId
  type
  key
  icon
  position
  isCompact
  openRecordIn
  kanbanAggregateOperation
  kanbanAggregateOperationFieldMetadataId
  mainGroupByFieldMetadataId
  shouldHideEmptyGroups
  anyFieldFilterValue
  calendarFieldMetadataId
  calendarLayout
  visibility
  createdByUserWorkspaceId
  viewFields {
    ...ViewFieldFragment
  }
  viewFilters {
    ...ViewFilterFragment
  }
  viewFilterGroups {
    ...ViewFilterGroupFragment
  }
  viewSorts {
    ...ViewSortFragment
  }
  viewGroups {
    ...ViewGroupFragment
  }
}
    ${ViewFieldFragmentFragmentDoc}
${ViewFilterFragmentFragmentDoc}
${ViewFilterGroupFragmentFragmentDoc}
${ViewSortFragmentFragmentDoc}
${ViewGroupFragmentFragmentDoc}`;
export const WorkflowDiffFragmentFragmentDoc = gql`
    fragment WorkflowDiffFragment on WorkflowVersionStepChanges {
  triggerDiff
  stepsDiff
}
    `;
export const ActivateSkillDocument = gql`
    mutation ActivateSkill($id: UUID!) {
  activateSkill(id: $id) {
    ...SkillFields
  }
}
    ${SkillFieldsFragmentDoc}`;
export type ActivateSkillMutationFn = Apollo.MutationFunction<ActivateSkillMutation, ActivateSkillMutationVariables>;

/**
 * __useActivateSkillMutation__
 *
 * To run a mutation, you first call `useActivateSkillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateSkillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateSkillMutation, { data, loading, error }] = useActivateSkillMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useActivateSkillMutation(baseOptions?: Apollo.MutationHookOptions<ActivateSkillMutation, ActivateSkillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ActivateSkillMutation, ActivateSkillMutationVariables>(ActivateSkillDocument, options);
      }
export type ActivateSkillMutationHookResult = ReturnType<typeof useActivateSkillMutation>;
export type ActivateSkillMutationResult = Apollo.MutationResult<ActivateSkillMutation>;
export type ActivateSkillMutationOptions = Apollo.BaseMutationOptions<ActivateSkillMutation, ActivateSkillMutationVariables>;
export const AssignRoleToAgentDocument = gql`
    mutation AssignRoleToAgent($agentId: UUID!, $roleId: UUID!) {
  assignRoleToAgent(agentId: $agentId, roleId: $roleId)
}
    `;
export type AssignRoleToAgentMutationFn = Apollo.MutationFunction<AssignRoleToAgentMutation, AssignRoleToAgentMutationVariables>;

/**
 * __useAssignRoleToAgentMutation__
 *
 * To run a mutation, you first call `useAssignRoleToAgentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignRoleToAgentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignRoleToAgentMutation, { data, loading, error }] = useAssignRoleToAgentMutation({
 *   variables: {
 *      agentId: // value for 'agentId'
 *      roleId: // value for 'roleId'
 *   },
 * });
 */
export function useAssignRoleToAgentMutation(baseOptions?: Apollo.MutationHookOptions<AssignRoleToAgentMutation, AssignRoleToAgentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignRoleToAgentMutation, AssignRoleToAgentMutationVariables>(AssignRoleToAgentDocument, options);
      }
export type AssignRoleToAgentMutationHookResult = ReturnType<typeof useAssignRoleToAgentMutation>;
export type AssignRoleToAgentMutationResult = Apollo.MutationResult<AssignRoleToAgentMutation>;
export type AssignRoleToAgentMutationOptions = Apollo.BaseMutationOptions<AssignRoleToAgentMutation, AssignRoleToAgentMutationVariables>;
export const CreateChatThreadDocument = gql`
    mutation CreateChatThread {
  createChatThread {
    id
    title
    createdAt
    updatedAt
  }
}
    `;
export type CreateChatThreadMutationFn = Apollo.MutationFunction<CreateChatThreadMutation, CreateChatThreadMutationVariables>;

/**
 * __useCreateChatThreadMutation__
 *
 * To run a mutation, you first call `useCreateChatThreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateChatThreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createChatThreadMutation, { data, loading, error }] = useCreateChatThreadMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateChatThreadMutation(baseOptions?: Apollo.MutationHookOptions<CreateChatThreadMutation, CreateChatThreadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateChatThreadMutation, CreateChatThreadMutationVariables>(CreateChatThreadDocument, options);
      }
export type CreateChatThreadMutationHookResult = ReturnType<typeof useCreateChatThreadMutation>;
export type CreateChatThreadMutationResult = Apollo.MutationResult<CreateChatThreadMutation>;
export type CreateChatThreadMutationOptions = Apollo.BaseMutationOptions<CreateChatThreadMutation, CreateChatThreadMutationVariables>;
export const CreateOneAgentDocument = gql`
    mutation CreateOneAgent($input: CreateAgentInput!) {
  createOneAgent(input: $input) {
    ...AgentFields
  }
}
    ${AgentFieldsFragmentDoc}`;
export type CreateOneAgentMutationFn = Apollo.MutationFunction<CreateOneAgentMutation, CreateOneAgentMutationVariables>;

/**
 * __useCreateOneAgentMutation__
 *
 * To run a mutation, you first call `useCreateOneAgentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOneAgentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOneAgentMutation, { data, loading, error }] = useCreateOneAgentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOneAgentMutation(baseOptions?: Apollo.MutationHookOptions<CreateOneAgentMutation, CreateOneAgentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOneAgentMutation, CreateOneAgentMutationVariables>(CreateOneAgentDocument, options);
      }
export type CreateOneAgentMutationHookResult = ReturnType<typeof useCreateOneAgentMutation>;
export type CreateOneAgentMutationResult = Apollo.MutationResult<CreateOneAgentMutation>;
export type CreateOneAgentMutationOptions = Apollo.BaseMutationOptions<CreateOneAgentMutation, CreateOneAgentMutationVariables>;
export const CreateSkillDocument = gql`
    mutation CreateSkill($input: CreateSkillInput!) {
  createSkill(input: $input) {
    ...SkillFields
  }
}
    ${SkillFieldsFragmentDoc}`;
export type CreateSkillMutationFn = Apollo.MutationFunction<CreateSkillMutation, CreateSkillMutationVariables>;

/**
 * __useCreateSkillMutation__
 *
 * To run a mutation, you first call `useCreateSkillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSkillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSkillMutation, { data, loading, error }] = useCreateSkillMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSkillMutation(baseOptions?: Apollo.MutationHookOptions<CreateSkillMutation, CreateSkillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSkillMutation, CreateSkillMutationVariables>(CreateSkillDocument, options);
      }
export type CreateSkillMutationHookResult = ReturnType<typeof useCreateSkillMutation>;
export type CreateSkillMutationResult = Apollo.MutationResult<CreateSkillMutation>;
export type CreateSkillMutationOptions = Apollo.BaseMutationOptions<CreateSkillMutation, CreateSkillMutationVariables>;
export const DeactivateSkillDocument = gql`
    mutation DeactivateSkill($id: UUID!) {
  deactivateSkill(id: $id) {
    ...SkillFields
  }
}
    ${SkillFieldsFragmentDoc}`;
export type DeactivateSkillMutationFn = Apollo.MutationFunction<DeactivateSkillMutation, DeactivateSkillMutationVariables>;

/**
 * __useDeactivateSkillMutation__
 *
 * To run a mutation, you first call `useDeactivateSkillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeactivateSkillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deactivateSkillMutation, { data, loading, error }] = useDeactivateSkillMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeactivateSkillMutation(baseOptions?: Apollo.MutationHookOptions<DeactivateSkillMutation, DeactivateSkillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeactivateSkillMutation, DeactivateSkillMutationVariables>(DeactivateSkillDocument, options);
      }
export type DeactivateSkillMutationHookResult = ReturnType<typeof useDeactivateSkillMutation>;
export type DeactivateSkillMutationResult = Apollo.MutationResult<DeactivateSkillMutation>;
export type DeactivateSkillMutationOptions = Apollo.BaseMutationOptions<DeactivateSkillMutation, DeactivateSkillMutationVariables>;
export const DeleteOneAgentDocument = gql`
    mutation DeleteOneAgent($input: AgentIdInput!) {
  deleteOneAgent(input: $input) {
    ...AgentFields
  }
}
    ${AgentFieldsFragmentDoc}`;
export type DeleteOneAgentMutationFn = Apollo.MutationFunction<DeleteOneAgentMutation, DeleteOneAgentMutationVariables>;

/**
 * __useDeleteOneAgentMutation__
 *
 * To run a mutation, you first call `useDeleteOneAgentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOneAgentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOneAgentMutation, { data, loading, error }] = useDeleteOneAgentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteOneAgentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOneAgentMutation, DeleteOneAgentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOneAgentMutation, DeleteOneAgentMutationVariables>(DeleteOneAgentDocument, options);
      }
export type DeleteOneAgentMutationHookResult = ReturnType<typeof useDeleteOneAgentMutation>;
export type DeleteOneAgentMutationResult = Apollo.MutationResult<DeleteOneAgentMutation>;
export type DeleteOneAgentMutationOptions = Apollo.BaseMutationOptions<DeleteOneAgentMutation, DeleteOneAgentMutationVariables>;
export const DeleteSkillDocument = gql`
    mutation DeleteSkill($id: UUID!) {
  deleteSkill(id: $id) {
    ...SkillFields
  }
}
    ${SkillFieldsFragmentDoc}`;
export type DeleteSkillMutationFn = Apollo.MutationFunction<DeleteSkillMutation, DeleteSkillMutationVariables>;

/**
 * __useDeleteSkillMutation__
 *
 * To run a mutation, you first call `useDeleteSkillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSkillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSkillMutation, { data, loading, error }] = useDeleteSkillMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSkillMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSkillMutation, DeleteSkillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSkillMutation, DeleteSkillMutationVariables>(DeleteSkillDocument, options);
      }
export type DeleteSkillMutationHookResult = ReturnType<typeof useDeleteSkillMutation>;
export type DeleteSkillMutationResult = Apollo.MutationResult<DeleteSkillMutation>;
export type DeleteSkillMutationOptions = Apollo.BaseMutationOptions<DeleteSkillMutation, DeleteSkillMutationVariables>;
export const EvaluateAgentTurnDocument = gql`
    mutation EvaluateAgentTurn($turnId: UUID!) {
  evaluateAgentTurn(turnId: $turnId) {
    id
    turnId
    score
    comment
    createdAt
  }
}
    `;
export type EvaluateAgentTurnMutationFn = Apollo.MutationFunction<EvaluateAgentTurnMutation, EvaluateAgentTurnMutationVariables>;

/**
 * __useEvaluateAgentTurnMutation__
 *
 * To run a mutation, you first call `useEvaluateAgentTurnMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEvaluateAgentTurnMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [evaluateAgentTurnMutation, { data, loading, error }] = useEvaluateAgentTurnMutation({
 *   variables: {
 *      turnId: // value for 'turnId'
 *   },
 * });
 */
export function useEvaluateAgentTurnMutation(baseOptions?: Apollo.MutationHookOptions<EvaluateAgentTurnMutation, EvaluateAgentTurnMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EvaluateAgentTurnMutation, EvaluateAgentTurnMutationVariables>(EvaluateAgentTurnDocument, options);
      }
export type EvaluateAgentTurnMutationHookResult = ReturnType<typeof useEvaluateAgentTurnMutation>;
export type EvaluateAgentTurnMutationResult = Apollo.MutationResult<EvaluateAgentTurnMutation>;
export type EvaluateAgentTurnMutationOptions = Apollo.BaseMutationOptions<EvaluateAgentTurnMutation, EvaluateAgentTurnMutationVariables>;
export const RemoveRoleFromAgentDocument = gql`
    mutation RemoveRoleFromAgent($agentId: UUID!) {
  removeRoleFromAgent(agentId: $agentId)
}
    `;
export type RemoveRoleFromAgentMutationFn = Apollo.MutationFunction<RemoveRoleFromAgentMutation, RemoveRoleFromAgentMutationVariables>;

/**
 * __useRemoveRoleFromAgentMutation__
 *
 * To run a mutation, you first call `useRemoveRoleFromAgentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveRoleFromAgentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeRoleFromAgentMutation, { data, loading, error }] = useRemoveRoleFromAgentMutation({
 *   variables: {
 *      agentId: // value for 'agentId'
 *   },
 * });
 */
export function useRemoveRoleFromAgentMutation(baseOptions?: Apollo.MutationHookOptions<RemoveRoleFromAgentMutation, RemoveRoleFromAgentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveRoleFromAgentMutation, RemoveRoleFromAgentMutationVariables>(RemoveRoleFromAgentDocument, options);
      }
export type RemoveRoleFromAgentMutationHookResult = ReturnType<typeof useRemoveRoleFromAgentMutation>;
export type RemoveRoleFromAgentMutationResult = Apollo.MutationResult<RemoveRoleFromAgentMutation>;
export type RemoveRoleFromAgentMutationOptions = Apollo.BaseMutationOptions<RemoveRoleFromAgentMutation, RemoveRoleFromAgentMutationVariables>;
export const RunEvaluationInputDocument = gql`
    mutation RunEvaluationInput($agentId: UUID!, $input: String!) {
  runEvaluationInput(agentId: $agentId, input: $input) {
    id
    threadId
    agentId
    createdAt
    evaluations {
      id
      score
      comment
      createdAt
    }
  }
}
    `;
export type RunEvaluationInputMutationFn = Apollo.MutationFunction<RunEvaluationInputMutation, RunEvaluationInputMutationVariables>;

/**
 * __useRunEvaluationInputMutation__
 *
 * To run a mutation, you first call `useRunEvaluationInputMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRunEvaluationInputMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [runEvaluationInputMutation, { data, loading, error }] = useRunEvaluationInputMutation({
 *   variables: {
 *      agentId: // value for 'agentId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRunEvaluationInputMutation(baseOptions?: Apollo.MutationHookOptions<RunEvaluationInputMutation, RunEvaluationInputMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RunEvaluationInputMutation, RunEvaluationInputMutationVariables>(RunEvaluationInputDocument, options);
      }
export type RunEvaluationInputMutationHookResult = ReturnType<typeof useRunEvaluationInputMutation>;
export type RunEvaluationInputMutationResult = Apollo.MutationResult<RunEvaluationInputMutation>;
export type RunEvaluationInputMutationOptions = Apollo.BaseMutationOptions<RunEvaluationInputMutation, RunEvaluationInputMutationVariables>;
export const UpdateOneAgentDocument = gql`
    mutation UpdateOneAgent($input: UpdateAgentInput!) {
  updateOneAgent(input: $input) {
    ...AgentFields
  }
}
    ${AgentFieldsFragmentDoc}`;
export type UpdateOneAgentMutationFn = Apollo.MutationFunction<UpdateOneAgentMutation, UpdateOneAgentMutationVariables>;

/**
 * __useUpdateOneAgentMutation__
 *
 * To run a mutation, you first call `useUpdateOneAgentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOneAgentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOneAgentMutation, { data, loading, error }] = useUpdateOneAgentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOneAgentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOneAgentMutation, UpdateOneAgentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOneAgentMutation, UpdateOneAgentMutationVariables>(UpdateOneAgentDocument, options);
      }
export type UpdateOneAgentMutationHookResult = ReturnType<typeof useUpdateOneAgentMutation>;
export type UpdateOneAgentMutationResult = Apollo.MutationResult<UpdateOneAgentMutation>;
export type UpdateOneAgentMutationOptions = Apollo.BaseMutationOptions<UpdateOneAgentMutation, UpdateOneAgentMutationVariables>;
export const UpdateSkillDocument = gql`
    mutation UpdateSkill($input: UpdateSkillInput!) {
  updateSkill(input: $input) {
    ...SkillFields
  }
}
    ${SkillFieldsFragmentDoc}`;
export type UpdateSkillMutationFn = Apollo.MutationFunction<UpdateSkillMutation, UpdateSkillMutationVariables>;

/**
 * __useUpdateSkillMutation__
 *
 * To run a mutation, you first call `useUpdateSkillMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSkillMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSkillMutation, { data, loading, error }] = useUpdateSkillMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSkillMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSkillMutation, UpdateSkillMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSkillMutation, UpdateSkillMutationVariables>(UpdateSkillDocument, options);
      }
export type UpdateSkillMutationHookResult = ReturnType<typeof useUpdateSkillMutation>;
export type UpdateSkillMutationResult = Apollo.MutationResult<UpdateSkillMutation>;
export type UpdateSkillMutationOptions = Apollo.BaseMutationOptions<UpdateSkillMutation, UpdateSkillMutationVariables>;
export const FindManyAgentsDocument = gql`
    query FindManyAgents {
  findManyAgents {
    ...AgentFields
  }
}
    ${AgentFieldsFragmentDoc}`;

/**
 * __useFindManyAgentsQuery__
 *
 * To run a query within a React component, call `useFindManyAgentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyAgentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyAgentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindManyAgentsQuery(baseOptions?: Apollo.QueryHookOptions<FindManyAgentsQuery, FindManyAgentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyAgentsQuery, FindManyAgentsQueryVariables>(FindManyAgentsDocument, options);
      }
export function useFindManyAgentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyAgentsQuery, FindManyAgentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyAgentsQuery, FindManyAgentsQueryVariables>(FindManyAgentsDocument, options);
        }
export type FindManyAgentsQueryHookResult = ReturnType<typeof useFindManyAgentsQuery>;
export type FindManyAgentsLazyQueryHookResult = ReturnType<typeof useFindManyAgentsLazyQuery>;
export type FindManyAgentsQueryResult = Apollo.QueryResult<FindManyAgentsQuery, FindManyAgentsQueryVariables>;
export const FindManySkillsDocument = gql`
    query FindManySkills {
  skills {
    ...SkillFields
  }
}
    ${SkillFieldsFragmentDoc}`;

/**
 * __useFindManySkillsQuery__
 *
 * To run a query within a React component, call `useFindManySkillsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManySkillsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManySkillsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindManySkillsQuery(baseOptions?: Apollo.QueryHookOptions<FindManySkillsQuery, FindManySkillsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManySkillsQuery, FindManySkillsQueryVariables>(FindManySkillsDocument, options);
      }
export function useFindManySkillsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManySkillsQuery, FindManySkillsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManySkillsQuery, FindManySkillsQueryVariables>(FindManySkillsDocument, options);
        }
export type FindManySkillsQueryHookResult = ReturnType<typeof useFindManySkillsQuery>;
export type FindManySkillsLazyQueryHookResult = ReturnType<typeof useFindManySkillsLazyQuery>;
export type FindManySkillsQueryResult = Apollo.QueryResult<FindManySkillsQuery, FindManySkillsQueryVariables>;
export const FindOneAgentDocument = gql`
    query FindOneAgent($id: UUID!) {
  findOneAgent(input: {id: $id}) {
    ...AgentFields
  }
}
    ${AgentFieldsFragmentDoc}`;

/**
 * __useFindOneAgentQuery__
 *
 * To run a query within a React component, call `useFindOneAgentQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneAgentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneAgentQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneAgentQuery(baseOptions: Apollo.QueryHookOptions<FindOneAgentQuery, FindOneAgentQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneAgentQuery, FindOneAgentQueryVariables>(FindOneAgentDocument, options);
      }
export function useFindOneAgentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneAgentQuery, FindOneAgentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneAgentQuery, FindOneAgentQueryVariables>(FindOneAgentDocument, options);
        }
export type FindOneAgentQueryHookResult = ReturnType<typeof useFindOneAgentQuery>;
export type FindOneAgentLazyQueryHookResult = ReturnType<typeof useFindOneAgentLazyQuery>;
export type FindOneAgentQueryResult = Apollo.QueryResult<FindOneAgentQuery, FindOneAgentQueryVariables>;
export const FindOneSkillDocument = gql`
    query FindOneSkill($id: UUID!) {
  skill(id: $id) {
    ...SkillFields
  }
}
    ${SkillFieldsFragmentDoc}`;

/**
 * __useFindOneSkillQuery__
 *
 * To run a query within a React component, call `useFindOneSkillQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneSkillQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneSkillQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneSkillQuery(baseOptions: Apollo.QueryHookOptions<FindOneSkillQuery, FindOneSkillQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneSkillQuery, FindOneSkillQueryVariables>(FindOneSkillDocument, options);
      }
export function useFindOneSkillLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneSkillQuery, FindOneSkillQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneSkillQuery, FindOneSkillQueryVariables>(FindOneSkillDocument, options);
        }
export type FindOneSkillQueryHookResult = ReturnType<typeof useFindOneSkillQuery>;
export type FindOneSkillLazyQueryHookResult = ReturnType<typeof useFindOneSkillLazyQuery>;
export type FindOneSkillQueryResult = Apollo.QueryResult<FindOneSkillQuery, FindOneSkillQueryVariables>;
export const GetAgentTurnsDocument = gql`
    query GetAgentTurns($agentId: UUID!) {
  agentTurns(agentId: $agentId) {
    id
    threadId
    agentId
    createdAt
    evaluations {
      id
      score
      comment
      createdAt
    }
    messages {
      id
      role
      createdAt
      parts {
        id
        type
        textContent
        reasoningContent
        toolName
        toolCallId
        toolInput
        toolOutput
        errorMessage
        state
        errorDetails
        sourceUrlSourceId
        sourceUrlUrl
        sourceUrlTitle
        sourceDocumentSourceId
        sourceDocumentMediaType
        sourceDocumentTitle
        sourceDocumentFilename
        fileMediaType
        fileFilename
        fileUrl
        providerMetadata
      }
    }
  }
}
    `;

/**
 * __useGetAgentTurnsQuery__
 *
 * To run a query within a React component, call `useGetAgentTurnsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAgentTurnsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAgentTurnsQuery({
 *   variables: {
 *      agentId: // value for 'agentId'
 *   },
 * });
 */
export function useGetAgentTurnsQuery(baseOptions: Apollo.QueryHookOptions<GetAgentTurnsQuery, GetAgentTurnsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAgentTurnsQuery, GetAgentTurnsQueryVariables>(GetAgentTurnsDocument, options);
      }
export function useGetAgentTurnsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAgentTurnsQuery, GetAgentTurnsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAgentTurnsQuery, GetAgentTurnsQueryVariables>(GetAgentTurnsDocument, options);
        }
export type GetAgentTurnsQueryHookResult = ReturnType<typeof useGetAgentTurnsQuery>;
export type GetAgentTurnsLazyQueryHookResult = ReturnType<typeof useGetAgentTurnsLazyQuery>;
export type GetAgentTurnsQueryResult = Apollo.QueryResult<GetAgentTurnsQuery, GetAgentTurnsQueryVariables>;
export const GetChatMessagesDocument = gql`
    query GetChatMessages($threadId: UUID!) {
  chatMessages(threadId: $threadId) {
    id
    threadId
    turnId
    role
    createdAt
    parts {
      id
      messageId
      orderIndex
      type
      textContent
      reasoningContent
      toolName
      toolCallId
      toolInput
      toolOutput
      state
      errorMessage
      errorDetails
      sourceUrlSourceId
      sourceUrlUrl
      sourceUrlTitle
      sourceDocumentSourceId
      sourceDocumentMediaType
      sourceDocumentTitle
      sourceDocumentFilename
      fileMediaType
      fileFilename
      fileUrl
      providerMetadata
      createdAt
    }
  }
}
    `;

/**
 * __useGetChatMessagesQuery__
 *
 * To run a query within a React component, call `useGetChatMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChatMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChatMessagesQuery({
 *   variables: {
 *      threadId: // value for 'threadId'
 *   },
 * });
 */
export function useGetChatMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetChatMessagesQuery, GetChatMessagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(GetChatMessagesDocument, options);
      }
export function useGetChatMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChatMessagesQuery, GetChatMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(GetChatMessagesDocument, options);
        }
export type GetChatMessagesQueryHookResult = ReturnType<typeof useGetChatMessagesQuery>;
export type GetChatMessagesLazyQueryHookResult = ReturnType<typeof useGetChatMessagesLazyQuery>;
export type GetChatMessagesQueryResult = Apollo.QueryResult<GetChatMessagesQuery, GetChatMessagesQueryVariables>;
export const GetChatThreadsDocument = gql`
    query GetChatThreads {
  chatThreads {
    id
    title
    totalInputTokens
    totalOutputTokens
    contextWindowTokens
    totalInputCredits
    totalOutputCredits
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetChatThreadsQuery__
 *
 * To run a query within a React component, call `useGetChatThreadsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChatThreadsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChatThreadsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetChatThreadsQuery(baseOptions?: Apollo.QueryHookOptions<GetChatThreadsQuery, GetChatThreadsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChatThreadsQuery, GetChatThreadsQueryVariables>(GetChatThreadsDocument, options);
      }
export function useGetChatThreadsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChatThreadsQuery, GetChatThreadsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChatThreadsQuery, GetChatThreadsQueryVariables>(GetChatThreadsDocument, options);
        }
export type GetChatThreadsQueryHookResult = ReturnType<typeof useGetChatThreadsQuery>;
export type GetChatThreadsLazyQueryHookResult = ReturnType<typeof useGetChatThreadsLazyQuery>;
export type GetChatThreadsQueryResult = Apollo.QueryResult<GetChatThreadsQuery, GetChatThreadsQueryVariables>;
export const GetToolIndexDocument = gql`
    query GetToolIndex {
  getToolIndex {
    name
    description
    category
    objectName
    inputSchema
  }
}
    `;

/**
 * __useGetToolIndexQuery__
 *
 * To run a query within a React component, call `useGetToolIndexQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetToolIndexQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetToolIndexQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetToolIndexQuery(baseOptions?: Apollo.QueryHookOptions<GetToolIndexQuery, GetToolIndexQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetToolIndexQuery, GetToolIndexQueryVariables>(GetToolIndexDocument, options);
      }
export function useGetToolIndexLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetToolIndexQuery, GetToolIndexQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetToolIndexQuery, GetToolIndexQueryVariables>(GetToolIndexDocument, options);
        }
export type GetToolIndexQueryHookResult = ReturnType<typeof useGetToolIndexQuery>;
export type GetToolIndexLazyQueryHookResult = ReturnType<typeof useGetToolIndexLazyQuery>;
export type GetToolIndexQueryResult = Apollo.QueryResult<GetToolIndexQuery, GetToolIndexQueryVariables>;
export const TrackAnalyticsDocument = gql`
    mutation TrackAnalytics($type: AnalyticsType!, $event: String, $name: String, $properties: JSON) {
  trackAnalytics(type: $type, event: $event, name: $name, properties: $properties) {
    success
  }
}
    `;
export type TrackAnalyticsMutationFn = Apollo.MutationFunction<TrackAnalyticsMutation, TrackAnalyticsMutationVariables>;

/**
 * __useTrackAnalyticsMutation__
 *
 * To run a mutation, you first call `useTrackAnalyticsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTrackAnalyticsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [trackAnalyticsMutation, { data, loading, error }] = useTrackAnalyticsMutation({
 *   variables: {
 *      type: // value for 'type'
 *      event: // value for 'event'
 *      name: // value for 'name'
 *      properties: // value for 'properties'
 *   },
 * });
 */
export function useTrackAnalyticsMutation(baseOptions?: Apollo.MutationHookOptions<TrackAnalyticsMutation, TrackAnalyticsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TrackAnalyticsMutation, TrackAnalyticsMutationVariables>(TrackAnalyticsDocument, options);
      }
export type TrackAnalyticsMutationHookResult = ReturnType<typeof useTrackAnalyticsMutation>;
export type TrackAnalyticsMutationResult = Apollo.MutationResult<TrackAnalyticsMutation>;
export type TrackAnalyticsMutationOptions = Apollo.BaseMutationOptions<TrackAnalyticsMutation, TrackAnalyticsMutationVariables>;
export const UpdateOneApplicationVariableDocument = gql`
    mutation UpdateOneApplicationVariable($key: String!, $value: String!, $applicationId: UUID!) {
  updateOneApplicationVariable(
    key: $key
    value: $value
    applicationId: $applicationId
  )
}
    `;
export type UpdateOneApplicationVariableMutationFn = Apollo.MutationFunction<UpdateOneApplicationVariableMutation, UpdateOneApplicationVariableMutationVariables>;

/**
 * __useUpdateOneApplicationVariableMutation__
 *
 * To run a mutation, you first call `useUpdateOneApplicationVariableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOneApplicationVariableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOneApplicationVariableMutation, { data, loading, error }] = useUpdateOneApplicationVariableMutation({
 *   variables: {
 *      key: // value for 'key'
 *      value: // value for 'value'
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useUpdateOneApplicationVariableMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOneApplicationVariableMutation, UpdateOneApplicationVariableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOneApplicationVariableMutation, UpdateOneApplicationVariableMutationVariables>(UpdateOneApplicationVariableDocument, options);
      }
export type UpdateOneApplicationVariableMutationHookResult = ReturnType<typeof useUpdateOneApplicationVariableMutation>;
export type UpdateOneApplicationVariableMutationResult = Apollo.MutationResult<UpdateOneApplicationVariableMutation>;
export type UpdateOneApplicationVariableMutationOptions = Apollo.BaseMutationOptions<UpdateOneApplicationVariableMutation, UpdateOneApplicationVariableMutationVariables>;
export const FindManyApplicationsDocument = gql`
    query FindManyApplications {
  findManyApplications {
    id
    name
    description
    version
  }
}
    `;

/**
 * __useFindManyApplicationsQuery__
 *
 * To run a query within a React component, call `useFindManyApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyApplicationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindManyApplicationsQuery(baseOptions?: Apollo.QueryHookOptions<FindManyApplicationsQuery, FindManyApplicationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyApplicationsQuery, FindManyApplicationsQueryVariables>(FindManyApplicationsDocument, options);
      }
export function useFindManyApplicationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyApplicationsQuery, FindManyApplicationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyApplicationsQuery, FindManyApplicationsQueryVariables>(FindManyApplicationsDocument, options);
        }
export type FindManyApplicationsQueryHookResult = ReturnType<typeof useFindManyApplicationsQuery>;
export type FindManyApplicationsLazyQueryHookResult = ReturnType<typeof useFindManyApplicationsLazyQuery>;
export type FindManyApplicationsQueryResult = Apollo.QueryResult<FindManyApplicationsQuery, FindManyApplicationsQueryVariables>;
export const FindOneApplicationDocument = gql`
    query FindOneApplication($id: UUID!) {
  findOneApplication(id: $id) {
    ...ApplicationFields
  }
}
    ${ApplicationFieldsFragmentDoc}`;

/**
 * __useFindOneApplicationQuery__
 *
 * To run a query within a React component, call `useFindOneApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneApplicationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneApplicationQuery(baseOptions: Apollo.QueryHookOptions<FindOneApplicationQuery, FindOneApplicationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneApplicationQuery, FindOneApplicationQueryVariables>(FindOneApplicationDocument, options);
      }
export function useFindOneApplicationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneApplicationQuery, FindOneApplicationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneApplicationQuery, FindOneApplicationQueryVariables>(FindOneApplicationDocument, options);
        }
export type FindOneApplicationQueryHookResult = ReturnType<typeof useFindOneApplicationQuery>;
export type FindOneApplicationLazyQueryHookResult = ReturnType<typeof useFindOneApplicationLazyQuery>;
export type FindOneApplicationQueryResult = Apollo.QueryResult<FindOneApplicationQuery, FindOneApplicationQueryVariables>;
export const UploadFileDocument = gql`
    mutation uploadFile($file: Upload!, $fileFolder: FileFolder) {
  uploadFile(file: $file, fileFolder: $fileFolder) {
    path
    token
  }
}
    `;
export type UploadFileMutationFn = Apollo.MutationFunction<UploadFileMutation, UploadFileMutationVariables>;

/**
 * __useUploadFileMutation__
 *
 * To run a mutation, you first call `useUploadFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadFileMutation, { data, loading, error }] = useUploadFileMutation({
 *   variables: {
 *      file: // value for 'file'
 *      fileFolder: // value for 'fileFolder'
 *   },
 * });
 */
export function useUploadFileMutation(baseOptions?: Apollo.MutationHookOptions<UploadFileMutation, UploadFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadFileMutation, UploadFileMutationVariables>(UploadFileDocument, options);
      }
export type UploadFileMutationHookResult = ReturnType<typeof useUploadFileMutation>;
export type UploadFileMutationResult = Apollo.MutationResult<UploadFileMutation>;
export type UploadFileMutationOptions = Apollo.BaseMutationOptions<UploadFileMutation, UploadFileMutationVariables>;
export const UploadImageDocument = gql`
    mutation uploadImage($file: Upload!, $fileFolder: FileFolder) {
  uploadImage(file: $file, fileFolder: $fileFolder) {
    path
    token
  }
}
    `;
export type UploadImageMutationFn = Apollo.MutationFunction<UploadImageMutation, UploadImageMutationVariables>;

/**
 * __useUploadImageMutation__
 *
 * To run a mutation, you first call `useUploadImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadImageMutation, { data, loading, error }] = useUploadImageMutation({
 *   variables: {
 *      file: // value for 'file'
 *      fileFolder: // value for 'fileFolder'
 *   },
 * });
 */
export function useUploadImageMutation(baseOptions?: Apollo.MutationHookOptions<UploadImageMutation, UploadImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadImageMutation, UploadImageMutationVariables>(UploadImageDocument, options);
      }
export type UploadImageMutationHookResult = ReturnType<typeof useUploadImageMutation>;
export type UploadImageMutationResult = Apollo.MutationResult<UploadImageMutation>;
export type UploadImageMutationOptions = Apollo.BaseMutationOptions<UploadImageMutation, UploadImageMutationVariables>;
export const AuthorizeAppDocument = gql`
    mutation authorizeApp($clientId: String!, $codeChallenge: String!, $redirectUrl: String!) {
  authorizeApp(
    clientId: $clientId
    codeChallenge: $codeChallenge
    redirectUrl: $redirectUrl
  ) {
    redirectUrl
  }
}
    `;
export type AuthorizeAppMutationFn = Apollo.MutationFunction<AuthorizeAppMutation, AuthorizeAppMutationVariables>;

/**
 * __useAuthorizeAppMutation__
 *
 * To run a mutation, you first call `useAuthorizeAppMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAuthorizeAppMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [authorizeAppMutation, { data, loading, error }] = useAuthorizeAppMutation({
 *   variables: {
 *      clientId: // value for 'clientId'
 *      codeChallenge: // value for 'codeChallenge'
 *      redirectUrl: // value for 'redirectUrl'
 *   },
 * });
 */
export function useAuthorizeAppMutation(baseOptions?: Apollo.MutationHookOptions<AuthorizeAppMutation, AuthorizeAppMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AuthorizeAppMutation, AuthorizeAppMutationVariables>(AuthorizeAppDocument, options);
      }
export type AuthorizeAppMutationHookResult = ReturnType<typeof useAuthorizeAppMutation>;
export type AuthorizeAppMutationResult = Apollo.MutationResult<AuthorizeAppMutation>;
export type AuthorizeAppMutationOptions = Apollo.BaseMutationOptions<AuthorizeAppMutation, AuthorizeAppMutationVariables>;
export const EmailPasswordResetLinkDocument = gql`
    mutation EmailPasswordResetLink($email: String!, $workspaceId: UUID!) {
  emailPasswordResetLink(email: $email, workspaceId: $workspaceId) {
    success
  }
}
    `;
export type EmailPasswordResetLinkMutationFn = Apollo.MutationFunction<EmailPasswordResetLinkMutation, EmailPasswordResetLinkMutationVariables>;

/**
 * __useEmailPasswordResetLinkMutation__
 *
 * To run a mutation, you first call `useEmailPasswordResetLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEmailPasswordResetLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [emailPasswordResetLinkMutation, { data, loading, error }] = useEmailPasswordResetLinkMutation({
 *   variables: {
 *      email: // value for 'email'
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useEmailPasswordResetLinkMutation(baseOptions?: Apollo.MutationHookOptions<EmailPasswordResetLinkMutation, EmailPasswordResetLinkMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EmailPasswordResetLinkMutation, EmailPasswordResetLinkMutationVariables>(EmailPasswordResetLinkDocument, options);
      }
export type EmailPasswordResetLinkMutationHookResult = ReturnType<typeof useEmailPasswordResetLinkMutation>;
export type EmailPasswordResetLinkMutationResult = Apollo.MutationResult<EmailPasswordResetLinkMutation>;
export type EmailPasswordResetLinkMutationOptions = Apollo.BaseMutationOptions<EmailPasswordResetLinkMutation, EmailPasswordResetLinkMutationVariables>;
export const GenerateApiKeyTokenDocument = gql`
    mutation GenerateApiKeyToken($apiKeyId: UUID!, $expiresAt: String!) {
  generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
    token
  }
}
    `;
export type GenerateApiKeyTokenMutationFn = Apollo.MutationFunction<GenerateApiKeyTokenMutation, GenerateApiKeyTokenMutationVariables>;

/**
 * __useGenerateApiKeyTokenMutation__
 *
 * To run a mutation, you first call `useGenerateApiKeyTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateApiKeyTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateApiKeyTokenMutation, { data, loading, error }] = useGenerateApiKeyTokenMutation({
 *   variables: {
 *      apiKeyId: // value for 'apiKeyId'
 *      expiresAt: // value for 'expiresAt'
 *   },
 * });
 */
export function useGenerateApiKeyTokenMutation(baseOptions?: Apollo.MutationHookOptions<GenerateApiKeyTokenMutation, GenerateApiKeyTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateApiKeyTokenMutation, GenerateApiKeyTokenMutationVariables>(GenerateApiKeyTokenDocument, options);
      }
export type GenerateApiKeyTokenMutationHookResult = ReturnType<typeof useGenerateApiKeyTokenMutation>;
export type GenerateApiKeyTokenMutationResult = Apollo.MutationResult<GenerateApiKeyTokenMutation>;
export type GenerateApiKeyTokenMutationOptions = Apollo.BaseMutationOptions<GenerateApiKeyTokenMutation, GenerateApiKeyTokenMutationVariables>;
export const GenerateTransientTokenDocument = gql`
    mutation generateTransientToken {
  generateTransientToken {
    transientToken {
      token
    }
  }
}
    `;
export type GenerateTransientTokenMutationFn = Apollo.MutationFunction<GenerateTransientTokenMutation, GenerateTransientTokenMutationVariables>;

/**
 * __useGenerateTransientTokenMutation__
 *
 * To run a mutation, you first call `useGenerateTransientTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateTransientTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateTransientTokenMutation, { data, loading, error }] = useGenerateTransientTokenMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateTransientTokenMutation(baseOptions?: Apollo.MutationHookOptions<GenerateTransientTokenMutation, GenerateTransientTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateTransientTokenMutation, GenerateTransientTokenMutationVariables>(GenerateTransientTokenDocument, options);
      }
export type GenerateTransientTokenMutationHookResult = ReturnType<typeof useGenerateTransientTokenMutation>;
export type GenerateTransientTokenMutationResult = Apollo.MutationResult<GenerateTransientTokenMutation>;
export type GenerateTransientTokenMutationOptions = Apollo.BaseMutationOptions<GenerateTransientTokenMutation, GenerateTransientTokenMutationVariables>;
export const GetAuthTokensFromLoginTokenDocument = gql`
    mutation getAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
  getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
    tokens {
      ...AuthTokenPairFragment
    }
  }
}
    ${AuthTokenPairFragmentFragmentDoc}`;
export type GetAuthTokensFromLoginTokenMutationFn = Apollo.MutationFunction<GetAuthTokensFromLoginTokenMutation, GetAuthTokensFromLoginTokenMutationVariables>;

/**
 * __useGetAuthTokensFromLoginTokenMutation__
 *
 * To run a mutation, you first call `useGetAuthTokensFromLoginTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGetAuthTokensFromLoginTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [getAuthTokensFromLoginTokenMutation, { data, loading, error }] = useGetAuthTokensFromLoginTokenMutation({
 *   variables: {
 *      loginToken: // value for 'loginToken'
 *      origin: // value for 'origin'
 *   },
 * });
 */
export function useGetAuthTokensFromLoginTokenMutation(baseOptions?: Apollo.MutationHookOptions<GetAuthTokensFromLoginTokenMutation, GetAuthTokensFromLoginTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GetAuthTokensFromLoginTokenMutation, GetAuthTokensFromLoginTokenMutationVariables>(GetAuthTokensFromLoginTokenDocument, options);
      }
export type GetAuthTokensFromLoginTokenMutationHookResult = ReturnType<typeof useGetAuthTokensFromLoginTokenMutation>;
export type GetAuthTokensFromLoginTokenMutationResult = Apollo.MutationResult<GetAuthTokensFromLoginTokenMutation>;
export type GetAuthTokensFromLoginTokenMutationOptions = Apollo.BaseMutationOptions<GetAuthTokensFromLoginTokenMutation, GetAuthTokensFromLoginTokenMutationVariables>;
export const GetAuthTokensFromOtpDocument = gql`
    mutation getAuthTokensFromOTP($loginToken: String!, $otp: String!, $captchaToken: String, $origin: String!) {
  getAuthTokensFromOTP(
    loginToken: $loginToken
    otp: $otp
    captchaToken: $captchaToken
    origin: $origin
  ) {
    tokens {
      ...AuthTokenPairFragment
    }
  }
}
    ${AuthTokenPairFragmentFragmentDoc}`;
export type GetAuthTokensFromOtpMutationFn = Apollo.MutationFunction<GetAuthTokensFromOtpMutation, GetAuthTokensFromOtpMutationVariables>;

/**
 * __useGetAuthTokensFromOtpMutation__
 *
 * To run a mutation, you first call `useGetAuthTokensFromOtpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGetAuthTokensFromOtpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [getAuthTokensFromOtpMutation, { data, loading, error }] = useGetAuthTokensFromOtpMutation({
 *   variables: {
 *      loginToken: // value for 'loginToken'
 *      otp: // value for 'otp'
 *      captchaToken: // value for 'captchaToken'
 *      origin: // value for 'origin'
 *   },
 * });
 */
export function useGetAuthTokensFromOtpMutation(baseOptions?: Apollo.MutationHookOptions<GetAuthTokensFromOtpMutation, GetAuthTokensFromOtpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GetAuthTokensFromOtpMutation, GetAuthTokensFromOtpMutationVariables>(GetAuthTokensFromOtpDocument, options);
      }
export type GetAuthTokensFromOtpMutationHookResult = ReturnType<typeof useGetAuthTokensFromOtpMutation>;
export type GetAuthTokensFromOtpMutationResult = Apollo.MutationResult<GetAuthTokensFromOtpMutation>;
export type GetAuthTokensFromOtpMutationOptions = Apollo.BaseMutationOptions<GetAuthTokensFromOtpMutation, GetAuthTokensFromOtpMutationVariables>;
export const GetAuthorizationUrlForSsoDocument = gql`
    mutation GetAuthorizationUrlForSSO($input: GetAuthorizationUrlForSSOInput!) {
  getAuthorizationUrlForSSO(input: $input) {
    id
    type
    authorizationURL
  }
}
    `;
export type GetAuthorizationUrlForSsoMutationFn = Apollo.MutationFunction<GetAuthorizationUrlForSsoMutation, GetAuthorizationUrlForSsoMutationVariables>;

/**
 * __useGetAuthorizationUrlForSsoMutation__
 *
 * To run a mutation, you first call `useGetAuthorizationUrlForSsoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGetAuthorizationUrlForSsoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [getAuthorizationUrlForSsoMutation, { data, loading, error }] = useGetAuthorizationUrlForSsoMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetAuthorizationUrlForSsoMutation(baseOptions?: Apollo.MutationHookOptions<GetAuthorizationUrlForSsoMutation, GetAuthorizationUrlForSsoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GetAuthorizationUrlForSsoMutation, GetAuthorizationUrlForSsoMutationVariables>(GetAuthorizationUrlForSsoDocument, options);
      }
export type GetAuthorizationUrlForSsoMutationHookResult = ReturnType<typeof useGetAuthorizationUrlForSsoMutation>;
export type GetAuthorizationUrlForSsoMutationResult = Apollo.MutationResult<GetAuthorizationUrlForSsoMutation>;
export type GetAuthorizationUrlForSsoMutationOptions = Apollo.BaseMutationOptions<GetAuthorizationUrlForSsoMutation, GetAuthorizationUrlForSsoMutationVariables>;
export const GetLoginTokenFromCredentialsDocument = gql`
    mutation GetLoginTokenFromCredentials($email: String!, $password: String!, $captchaToken: String, $origin: String!) {
  getLoginTokenFromCredentials(
    email: $email
    password: $password
    captchaToken: $captchaToken
    origin: $origin
  ) {
    loginToken {
      ...AuthTokenFragment
    }
  }
}
    ${AuthTokenFragmentFragmentDoc}`;
export type GetLoginTokenFromCredentialsMutationFn = Apollo.MutationFunction<GetLoginTokenFromCredentialsMutation, GetLoginTokenFromCredentialsMutationVariables>;

/**
 * __useGetLoginTokenFromCredentialsMutation__
 *
 * To run a mutation, you first call `useGetLoginTokenFromCredentialsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGetLoginTokenFromCredentialsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [getLoginTokenFromCredentialsMutation, { data, loading, error }] = useGetLoginTokenFromCredentialsMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      captchaToken: // value for 'captchaToken'
 *      origin: // value for 'origin'
 *   },
 * });
 */
export function useGetLoginTokenFromCredentialsMutation(baseOptions?: Apollo.MutationHookOptions<GetLoginTokenFromCredentialsMutation, GetLoginTokenFromCredentialsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GetLoginTokenFromCredentialsMutation, GetLoginTokenFromCredentialsMutationVariables>(GetLoginTokenFromCredentialsDocument, options);
      }
export type GetLoginTokenFromCredentialsMutationHookResult = ReturnType<typeof useGetLoginTokenFromCredentialsMutation>;
export type GetLoginTokenFromCredentialsMutationResult = Apollo.MutationResult<GetLoginTokenFromCredentialsMutation>;
export type GetLoginTokenFromCredentialsMutationOptions = Apollo.BaseMutationOptions<GetLoginTokenFromCredentialsMutation, GetLoginTokenFromCredentialsMutationVariables>;
export const ImpersonateDocument = gql`
    mutation Impersonate($userId: UUID!, $workspaceId: UUID!) {
  impersonate(userId: $userId, workspaceId: $workspaceId) {
    workspace {
      workspaceUrls {
        ...WorkspaceUrlsFragment
      }
      id
    }
    loginToken {
      ...AuthTokenFragment
    }
  }
}
    ${WorkspaceUrlsFragmentFragmentDoc}
${AuthTokenFragmentFragmentDoc}`;
export type ImpersonateMutationFn = Apollo.MutationFunction<ImpersonateMutation, ImpersonateMutationVariables>;

/**
 * __useImpersonateMutation__
 *
 * To run a mutation, you first call `useImpersonateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImpersonateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [impersonateMutation, { data, loading, error }] = useImpersonateMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useImpersonateMutation(baseOptions?: Apollo.MutationHookOptions<ImpersonateMutation, ImpersonateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ImpersonateMutation, ImpersonateMutationVariables>(ImpersonateDocument, options);
      }
export type ImpersonateMutationHookResult = ReturnType<typeof useImpersonateMutation>;
export type ImpersonateMutationResult = Apollo.MutationResult<ImpersonateMutation>;
export type ImpersonateMutationOptions = Apollo.BaseMutationOptions<ImpersonateMutation, ImpersonateMutationVariables>;
export const InitiateOtpProvisioningDocument = gql`
    mutation initiateOTPProvisioning($loginToken: String!, $origin: String!) {
  initiateOTPProvisioning(loginToken: $loginToken, origin: $origin) {
    uri
  }
}
    `;
export type InitiateOtpProvisioningMutationFn = Apollo.MutationFunction<InitiateOtpProvisioningMutation, InitiateOtpProvisioningMutationVariables>;

/**
 * __useInitiateOtpProvisioningMutation__
 *
 * To run a mutation, you first call `useInitiateOtpProvisioningMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInitiateOtpProvisioningMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [initiateOtpProvisioningMutation, { data, loading, error }] = useInitiateOtpProvisioningMutation({
 *   variables: {
 *      loginToken: // value for 'loginToken'
 *      origin: // value for 'origin'
 *   },
 * });
 */
export function useInitiateOtpProvisioningMutation(baseOptions?: Apollo.MutationHookOptions<InitiateOtpProvisioningMutation, InitiateOtpProvisioningMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InitiateOtpProvisioningMutation, InitiateOtpProvisioningMutationVariables>(InitiateOtpProvisioningDocument, options);
      }
export type InitiateOtpProvisioningMutationHookResult = ReturnType<typeof useInitiateOtpProvisioningMutation>;
export type InitiateOtpProvisioningMutationResult = Apollo.MutationResult<InitiateOtpProvisioningMutation>;
export type InitiateOtpProvisioningMutationOptions = Apollo.BaseMutationOptions<InitiateOtpProvisioningMutation, InitiateOtpProvisioningMutationVariables>;
export const InitiateOtpProvisioningForAuthenticatedUserDocument = gql`
    mutation initiateOTPProvisioningForAuthenticatedUser {
  initiateOTPProvisioningForAuthenticatedUser {
    uri
  }
}
    `;
export type InitiateOtpProvisioningForAuthenticatedUserMutationFn = Apollo.MutationFunction<InitiateOtpProvisioningForAuthenticatedUserMutation, InitiateOtpProvisioningForAuthenticatedUserMutationVariables>;

/**
 * __useInitiateOtpProvisioningForAuthenticatedUserMutation__
 *
 * To run a mutation, you first call `useInitiateOtpProvisioningForAuthenticatedUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInitiateOtpProvisioningForAuthenticatedUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [initiateOtpProvisioningForAuthenticatedUserMutation, { data, loading, error }] = useInitiateOtpProvisioningForAuthenticatedUserMutation({
 *   variables: {
 *   },
 * });
 */
export function useInitiateOtpProvisioningForAuthenticatedUserMutation(baseOptions?: Apollo.MutationHookOptions<InitiateOtpProvisioningForAuthenticatedUserMutation, InitiateOtpProvisioningForAuthenticatedUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InitiateOtpProvisioningForAuthenticatedUserMutation, InitiateOtpProvisioningForAuthenticatedUserMutationVariables>(InitiateOtpProvisioningForAuthenticatedUserDocument, options);
      }
export type InitiateOtpProvisioningForAuthenticatedUserMutationHookResult = ReturnType<typeof useInitiateOtpProvisioningForAuthenticatedUserMutation>;
export type InitiateOtpProvisioningForAuthenticatedUserMutationResult = Apollo.MutationResult<InitiateOtpProvisioningForAuthenticatedUserMutation>;
export type InitiateOtpProvisioningForAuthenticatedUserMutationOptions = Apollo.BaseMutationOptions<InitiateOtpProvisioningForAuthenticatedUserMutation, InitiateOtpProvisioningForAuthenticatedUserMutationVariables>;
export const RenewTokenDocument = gql`
    mutation RenewToken($appToken: String!) {
  renewToken(appToken: $appToken) {
    tokens {
      ...AuthTokenPairFragment
    }
  }
}
    ${AuthTokenPairFragmentFragmentDoc}`;
export type RenewTokenMutationFn = Apollo.MutationFunction<RenewTokenMutation, RenewTokenMutationVariables>;

/**
 * __useRenewTokenMutation__
 *
 * To run a mutation, you first call `useRenewTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRenewTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [renewTokenMutation, { data, loading, error }] = useRenewTokenMutation({
 *   variables: {
 *      appToken: // value for 'appToken'
 *   },
 * });
 */
export function useRenewTokenMutation(baseOptions?: Apollo.MutationHookOptions<RenewTokenMutation, RenewTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RenewTokenMutation, RenewTokenMutationVariables>(RenewTokenDocument, options);
      }
export type RenewTokenMutationHookResult = ReturnType<typeof useRenewTokenMutation>;
export type RenewTokenMutationResult = Apollo.MutationResult<RenewTokenMutation>;
export type RenewTokenMutationOptions = Apollo.BaseMutationOptions<RenewTokenMutation, RenewTokenMutationVariables>;
export const ResendEmailVerificationTokenDocument = gql`
    mutation ResendEmailVerificationToken($email: String!, $origin: String!) {
  resendEmailVerificationToken(email: $email, origin: $origin) {
    success
  }
}
    `;
export type ResendEmailVerificationTokenMutationFn = Apollo.MutationFunction<ResendEmailVerificationTokenMutation, ResendEmailVerificationTokenMutationVariables>;

/**
 * __useResendEmailVerificationTokenMutation__
 *
 * To run a mutation, you first call `useResendEmailVerificationTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendEmailVerificationTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendEmailVerificationTokenMutation, { data, loading, error }] = useResendEmailVerificationTokenMutation({
 *   variables: {
 *      email: // value for 'email'
 *      origin: // value for 'origin'
 *   },
 * });
 */
export function useResendEmailVerificationTokenMutation(baseOptions?: Apollo.MutationHookOptions<ResendEmailVerificationTokenMutation, ResendEmailVerificationTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResendEmailVerificationTokenMutation, ResendEmailVerificationTokenMutationVariables>(ResendEmailVerificationTokenDocument, options);
      }
export type ResendEmailVerificationTokenMutationHookResult = ReturnType<typeof useResendEmailVerificationTokenMutation>;
export type ResendEmailVerificationTokenMutationResult = Apollo.MutationResult<ResendEmailVerificationTokenMutation>;
export type ResendEmailVerificationTokenMutationOptions = Apollo.BaseMutationOptions<ResendEmailVerificationTokenMutation, ResendEmailVerificationTokenMutationVariables>;
export const DeleteTwoFactorAuthenticationMethodDocument = gql`
    mutation deleteTwoFactorAuthenticationMethod($twoFactorAuthenticationMethodId: UUID!) {
  deleteTwoFactorAuthenticationMethod(
    twoFactorAuthenticationMethodId: $twoFactorAuthenticationMethodId
  ) {
    success
  }
}
    `;
export type DeleteTwoFactorAuthenticationMethodMutationFn = Apollo.MutationFunction<DeleteTwoFactorAuthenticationMethodMutation, DeleteTwoFactorAuthenticationMethodMutationVariables>;

/**
 * __useDeleteTwoFactorAuthenticationMethodMutation__
 *
 * To run a mutation, you first call `useDeleteTwoFactorAuthenticationMethodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTwoFactorAuthenticationMethodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTwoFactorAuthenticationMethodMutation, { data, loading, error }] = useDeleteTwoFactorAuthenticationMethodMutation({
 *   variables: {
 *      twoFactorAuthenticationMethodId: // value for 'twoFactorAuthenticationMethodId'
 *   },
 * });
 */
export function useDeleteTwoFactorAuthenticationMethodMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTwoFactorAuthenticationMethodMutation, DeleteTwoFactorAuthenticationMethodMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTwoFactorAuthenticationMethodMutation, DeleteTwoFactorAuthenticationMethodMutationVariables>(DeleteTwoFactorAuthenticationMethodDocument, options);
      }
export type DeleteTwoFactorAuthenticationMethodMutationHookResult = ReturnType<typeof useDeleteTwoFactorAuthenticationMethodMutation>;
export type DeleteTwoFactorAuthenticationMethodMutationResult = Apollo.MutationResult<DeleteTwoFactorAuthenticationMethodMutation>;
export type DeleteTwoFactorAuthenticationMethodMutationOptions = Apollo.BaseMutationOptions<DeleteTwoFactorAuthenticationMethodMutation, DeleteTwoFactorAuthenticationMethodMutationVariables>;
export const SignInDocument = gql`
    mutation SignIn($email: String!, $password: String!, $captchaToken: String) {
  signIn(email: $email, password: $password, captchaToken: $captchaToken) {
    availableWorkspaces {
      ...AvailableWorkspacesFragment
    }
    tokens {
      ...AuthTokenPairFragment
    }
  }
}
    ${AvailableWorkspacesFragmentFragmentDoc}
${AuthTokenPairFragmentFragmentDoc}`;
export type SignInMutationFn = Apollo.MutationFunction<SignInMutation, SignInMutationVariables>;

/**
 * __useSignInMutation__
 *
 * To run a mutation, you first call `useSignInMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignInMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signInMutation, { data, loading, error }] = useSignInMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      captchaToken: // value for 'captchaToken'
 *   },
 * });
 */
export function useSignInMutation(baseOptions?: Apollo.MutationHookOptions<SignInMutation, SignInMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignInMutation, SignInMutationVariables>(SignInDocument, options);
      }
export type SignInMutationHookResult = ReturnType<typeof useSignInMutation>;
export type SignInMutationResult = Apollo.MutationResult<SignInMutation>;
export type SignInMutationOptions = Apollo.BaseMutationOptions<SignInMutation, SignInMutationVariables>;
export const SignUpDocument = gql`
    mutation SignUp($email: String!, $password: String!, $captchaToken: String, $locale: String, $verifyEmailRedirectPath: String) {
  signUp(
    email: $email
    password: $password
    captchaToken: $captchaToken
    locale: $locale
    verifyEmailRedirectPath: $verifyEmailRedirectPath
  ) {
    availableWorkspaces {
      ...AvailableWorkspacesFragment
    }
    tokens {
      ...AuthTokenPairFragment
    }
  }
}
    ${AvailableWorkspacesFragmentFragmentDoc}
${AuthTokenPairFragmentFragmentDoc}`;
export type SignUpMutationFn = Apollo.MutationFunction<SignUpMutation, SignUpMutationVariables>;

/**
 * __useSignUpMutation__
 *
 * To run a mutation, you first call `useSignUpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpMutation, { data, loading, error }] = useSignUpMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      captchaToken: // value for 'captchaToken'
 *      locale: // value for 'locale'
 *      verifyEmailRedirectPath: // value for 'verifyEmailRedirectPath'
 *   },
 * });
 */
export function useSignUpMutation(baseOptions?: Apollo.MutationHookOptions<SignUpMutation, SignUpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignUpMutation, SignUpMutationVariables>(SignUpDocument, options);
      }
export type SignUpMutationHookResult = ReturnType<typeof useSignUpMutation>;
export type SignUpMutationResult = Apollo.MutationResult<SignUpMutation>;
export type SignUpMutationOptions = Apollo.BaseMutationOptions<SignUpMutation, SignUpMutationVariables>;
export const SignUpInNewWorkspaceDocument = gql`
    mutation SignUpInNewWorkspace {
  signUpInNewWorkspace {
    loginToken {
      ...AuthTokenFragment
    }
    workspace {
      id
      workspaceUrls {
        ...WorkspaceUrlsFragment
      }
    }
  }
}
    ${AuthTokenFragmentFragmentDoc}
${WorkspaceUrlsFragmentFragmentDoc}`;
export type SignUpInNewWorkspaceMutationFn = Apollo.MutationFunction<SignUpInNewWorkspaceMutation, SignUpInNewWorkspaceMutationVariables>;

/**
 * __useSignUpInNewWorkspaceMutation__
 *
 * To run a mutation, you first call `useSignUpInNewWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpInNewWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpInNewWorkspaceMutation, { data, loading, error }] = useSignUpInNewWorkspaceMutation({
 *   variables: {
 *   },
 * });
 */
export function useSignUpInNewWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<SignUpInNewWorkspaceMutation, SignUpInNewWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignUpInNewWorkspaceMutation, SignUpInNewWorkspaceMutationVariables>(SignUpInNewWorkspaceDocument, options);
      }
export type SignUpInNewWorkspaceMutationHookResult = ReturnType<typeof useSignUpInNewWorkspaceMutation>;
export type SignUpInNewWorkspaceMutationResult = Apollo.MutationResult<SignUpInNewWorkspaceMutation>;
export type SignUpInNewWorkspaceMutationOptions = Apollo.BaseMutationOptions<SignUpInNewWorkspaceMutation, SignUpInNewWorkspaceMutationVariables>;
export const SignUpInWorkspaceDocument = gql`
    mutation SignUpInWorkspace($email: String!, $password: String!, $workspaceInviteHash: String, $workspacePersonalInviteToken: String = null, $captchaToken: String, $workspaceId: UUID, $locale: String, $verifyEmailRedirectPath: String) {
  signUpInWorkspace(
    email: $email
    password: $password
    workspaceInviteHash: $workspaceInviteHash
    workspacePersonalInviteToken: $workspacePersonalInviteToken
    captchaToken: $captchaToken
    workspaceId: $workspaceId
    locale: $locale
    verifyEmailRedirectPath: $verifyEmailRedirectPath
  ) {
    loginToken {
      ...AuthTokenFragment
    }
    workspace {
      id
      workspaceUrls {
        subdomainUrl
        customUrl
      }
    }
  }
}
    ${AuthTokenFragmentFragmentDoc}`;
export type SignUpInWorkspaceMutationFn = Apollo.MutationFunction<SignUpInWorkspaceMutation, SignUpInWorkspaceMutationVariables>;

/**
 * __useSignUpInWorkspaceMutation__
 *
 * To run a mutation, you first call `useSignUpInWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpInWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpInWorkspaceMutation, { data, loading, error }] = useSignUpInWorkspaceMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      workspaceInviteHash: // value for 'workspaceInviteHash'
 *      workspacePersonalInviteToken: // value for 'workspacePersonalInviteToken'
 *      captchaToken: // value for 'captchaToken'
 *      workspaceId: // value for 'workspaceId'
 *      locale: // value for 'locale'
 *      verifyEmailRedirectPath: // value for 'verifyEmailRedirectPath'
 *   },
 * });
 */
export function useSignUpInWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<SignUpInWorkspaceMutation, SignUpInWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignUpInWorkspaceMutation, SignUpInWorkspaceMutationVariables>(SignUpInWorkspaceDocument, options);
      }
export type SignUpInWorkspaceMutationHookResult = ReturnType<typeof useSignUpInWorkspaceMutation>;
export type SignUpInWorkspaceMutationResult = Apollo.MutationResult<SignUpInWorkspaceMutation>;
export type SignUpInWorkspaceMutationOptions = Apollo.BaseMutationOptions<SignUpInWorkspaceMutation, SignUpInWorkspaceMutationVariables>;
export const UpdatePasswordViaResetTokenDocument = gql`
    mutation UpdatePasswordViaResetToken($token: String!, $newPassword: String!) {
  updatePasswordViaResetToken(
    passwordResetToken: $token
    newPassword: $newPassword
  ) {
    success
  }
}
    `;
export type UpdatePasswordViaResetTokenMutationFn = Apollo.MutationFunction<UpdatePasswordViaResetTokenMutation, UpdatePasswordViaResetTokenMutationVariables>;

/**
 * __useUpdatePasswordViaResetTokenMutation__
 *
 * To run a mutation, you first call `useUpdatePasswordViaResetTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePasswordViaResetTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePasswordViaResetTokenMutation, { data, loading, error }] = useUpdatePasswordViaResetTokenMutation({
 *   variables: {
 *      token: // value for 'token'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useUpdatePasswordViaResetTokenMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePasswordViaResetTokenMutation, UpdatePasswordViaResetTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePasswordViaResetTokenMutation, UpdatePasswordViaResetTokenMutationVariables>(UpdatePasswordViaResetTokenDocument, options);
      }
export type UpdatePasswordViaResetTokenMutationHookResult = ReturnType<typeof useUpdatePasswordViaResetTokenMutation>;
export type UpdatePasswordViaResetTokenMutationResult = Apollo.MutationResult<UpdatePasswordViaResetTokenMutation>;
export type UpdatePasswordViaResetTokenMutationOptions = Apollo.BaseMutationOptions<UpdatePasswordViaResetTokenMutation, UpdatePasswordViaResetTokenMutationVariables>;
export const VerifyEmailAndGetLoginTokenDocument = gql`
    mutation VerifyEmailAndGetLoginToken($emailVerificationToken: String!, $email: String!, $captchaToken: String, $origin: String!) {
  verifyEmailAndGetLoginToken(
    emailVerificationToken: $emailVerificationToken
    email: $email
    captchaToken: $captchaToken
    origin: $origin
  ) {
    loginToken {
      ...AuthTokenFragment
    }
    workspaceUrls {
      ...WorkspaceUrlsFragment
    }
  }
}
    ${AuthTokenFragmentFragmentDoc}
${WorkspaceUrlsFragmentFragmentDoc}`;
export type VerifyEmailAndGetLoginTokenMutationFn = Apollo.MutationFunction<VerifyEmailAndGetLoginTokenMutation, VerifyEmailAndGetLoginTokenMutationVariables>;

/**
 * __useVerifyEmailAndGetLoginTokenMutation__
 *
 * To run a mutation, you first call `useVerifyEmailAndGetLoginTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyEmailAndGetLoginTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyEmailAndGetLoginTokenMutation, { data, loading, error }] = useVerifyEmailAndGetLoginTokenMutation({
 *   variables: {
 *      emailVerificationToken: // value for 'emailVerificationToken'
 *      email: // value for 'email'
 *      captchaToken: // value for 'captchaToken'
 *      origin: // value for 'origin'
 *   },
 * });
 */
export function useVerifyEmailAndGetLoginTokenMutation(baseOptions?: Apollo.MutationHookOptions<VerifyEmailAndGetLoginTokenMutation, VerifyEmailAndGetLoginTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyEmailAndGetLoginTokenMutation, VerifyEmailAndGetLoginTokenMutationVariables>(VerifyEmailAndGetLoginTokenDocument, options);
      }
export type VerifyEmailAndGetLoginTokenMutationHookResult = ReturnType<typeof useVerifyEmailAndGetLoginTokenMutation>;
export type VerifyEmailAndGetLoginTokenMutationResult = Apollo.MutationResult<VerifyEmailAndGetLoginTokenMutation>;
export type VerifyEmailAndGetLoginTokenMutationOptions = Apollo.BaseMutationOptions<VerifyEmailAndGetLoginTokenMutation, VerifyEmailAndGetLoginTokenMutationVariables>;
export const VerifyEmailAndGetWorkspaceAgnosticTokenDocument = gql`
    mutation VerifyEmailAndGetWorkspaceAgnosticToken($emailVerificationToken: String!, $email: String!, $captchaToken: String) {
  verifyEmailAndGetWorkspaceAgnosticToken(
    emailVerificationToken: $emailVerificationToken
    email: $email
    captchaToken: $captchaToken
  ) {
    availableWorkspaces {
      ...AvailableWorkspacesFragment
    }
    tokens {
      ...AuthTokenPairFragment
    }
  }
}
    ${AvailableWorkspacesFragmentFragmentDoc}
${AuthTokenPairFragmentFragmentDoc}`;
export type VerifyEmailAndGetWorkspaceAgnosticTokenMutationFn = Apollo.MutationFunction<VerifyEmailAndGetWorkspaceAgnosticTokenMutation, VerifyEmailAndGetWorkspaceAgnosticTokenMutationVariables>;

/**
 * __useVerifyEmailAndGetWorkspaceAgnosticTokenMutation__
 *
 * To run a mutation, you first call `useVerifyEmailAndGetWorkspaceAgnosticTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyEmailAndGetWorkspaceAgnosticTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyEmailAndGetWorkspaceAgnosticTokenMutation, { data, loading, error }] = useVerifyEmailAndGetWorkspaceAgnosticTokenMutation({
 *   variables: {
 *      emailVerificationToken: // value for 'emailVerificationToken'
 *      email: // value for 'email'
 *      captchaToken: // value for 'captchaToken'
 *   },
 * });
 */
export function useVerifyEmailAndGetWorkspaceAgnosticTokenMutation(baseOptions?: Apollo.MutationHookOptions<VerifyEmailAndGetWorkspaceAgnosticTokenMutation, VerifyEmailAndGetWorkspaceAgnosticTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyEmailAndGetWorkspaceAgnosticTokenMutation, VerifyEmailAndGetWorkspaceAgnosticTokenMutationVariables>(VerifyEmailAndGetWorkspaceAgnosticTokenDocument, options);
      }
export type VerifyEmailAndGetWorkspaceAgnosticTokenMutationHookResult = ReturnType<typeof useVerifyEmailAndGetWorkspaceAgnosticTokenMutation>;
export type VerifyEmailAndGetWorkspaceAgnosticTokenMutationResult = Apollo.MutationResult<VerifyEmailAndGetWorkspaceAgnosticTokenMutation>;
export type VerifyEmailAndGetWorkspaceAgnosticTokenMutationOptions = Apollo.BaseMutationOptions<VerifyEmailAndGetWorkspaceAgnosticTokenMutation, VerifyEmailAndGetWorkspaceAgnosticTokenMutationVariables>;
export const CheckUserExistsDocument = gql`
    query CheckUserExists($email: String!, $captchaToken: String) {
  checkUserExists(email: $email, captchaToken: $captchaToken) {
    exists
    availableWorkspacesCount
    isEmailVerified
  }
}
    `;

/**
 * __useCheckUserExistsQuery__
 *
 * To run a query within a React component, call `useCheckUserExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckUserExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckUserExistsQuery({
 *   variables: {
 *      email: // value for 'email'
 *      captchaToken: // value for 'captchaToken'
 *   },
 * });
 */
export function useCheckUserExistsQuery(baseOptions: Apollo.QueryHookOptions<CheckUserExistsQuery, CheckUserExistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckUserExistsQuery, CheckUserExistsQueryVariables>(CheckUserExistsDocument, options);
      }
export function useCheckUserExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckUserExistsQuery, CheckUserExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckUserExistsQuery, CheckUserExistsQueryVariables>(CheckUserExistsDocument, options);
        }
export type CheckUserExistsQueryHookResult = ReturnType<typeof useCheckUserExistsQuery>;
export type CheckUserExistsLazyQueryHookResult = ReturnType<typeof useCheckUserExistsLazyQuery>;
export type CheckUserExistsQueryResult = Apollo.QueryResult<CheckUserExistsQuery, CheckUserExistsQueryVariables>;
export const GetPublicWorkspaceDataByDomainDocument = gql`
    query GetPublicWorkspaceDataByDomain($origin: String!) {
  getPublicWorkspaceDataByDomain(origin: $origin) {
    id
    logo
    displayName
    workspaceUrls {
      ...WorkspaceUrlsFragment
    }
    authProviders {
      sso {
        id
        name
        type
        status
        issuer
      }
      google
      magicLink
      password
      microsoft
    }
    authBypassProviders {
      google
      password
      microsoft
    }
  }
}
    ${WorkspaceUrlsFragmentFragmentDoc}`;

/**
 * __useGetPublicWorkspaceDataByDomainQuery__
 *
 * To run a query within a React component, call `useGetPublicWorkspaceDataByDomainQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicWorkspaceDataByDomainQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicWorkspaceDataByDomainQuery({
 *   variables: {
 *      origin: // value for 'origin'
 *   },
 * });
 */
export function useGetPublicWorkspaceDataByDomainQuery(baseOptions: Apollo.QueryHookOptions<GetPublicWorkspaceDataByDomainQuery, GetPublicWorkspaceDataByDomainQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPublicWorkspaceDataByDomainQuery, GetPublicWorkspaceDataByDomainQueryVariables>(GetPublicWorkspaceDataByDomainDocument, options);
      }
export function useGetPublicWorkspaceDataByDomainLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPublicWorkspaceDataByDomainQuery, GetPublicWorkspaceDataByDomainQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPublicWorkspaceDataByDomainQuery, GetPublicWorkspaceDataByDomainQueryVariables>(GetPublicWorkspaceDataByDomainDocument, options);
        }
export type GetPublicWorkspaceDataByDomainQueryHookResult = ReturnType<typeof useGetPublicWorkspaceDataByDomainQuery>;
export type GetPublicWorkspaceDataByDomainLazyQueryHookResult = ReturnType<typeof useGetPublicWorkspaceDataByDomainLazyQuery>;
export type GetPublicWorkspaceDataByDomainQueryResult = Apollo.QueryResult<GetPublicWorkspaceDataByDomainQuery, GetPublicWorkspaceDataByDomainQueryVariables>;
export const ValidatePasswordResetTokenDocument = gql`
    query ValidatePasswordResetToken($token: String!) {
  validatePasswordResetToken(passwordResetToken: $token) {
    id
    email
    hasPassword
  }
}
    `;

/**
 * __useValidatePasswordResetTokenQuery__
 *
 * To run a query within a React component, call `useValidatePasswordResetTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useValidatePasswordResetTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidatePasswordResetTokenQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useValidatePasswordResetTokenQuery(baseOptions: Apollo.QueryHookOptions<ValidatePasswordResetTokenQuery, ValidatePasswordResetTokenQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ValidatePasswordResetTokenQuery, ValidatePasswordResetTokenQueryVariables>(ValidatePasswordResetTokenDocument, options);
      }
export function useValidatePasswordResetTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ValidatePasswordResetTokenQuery, ValidatePasswordResetTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ValidatePasswordResetTokenQuery, ValidatePasswordResetTokenQueryVariables>(ValidatePasswordResetTokenDocument, options);
        }
export type ValidatePasswordResetTokenQueryHookResult = ReturnType<typeof useValidatePasswordResetTokenQuery>;
export type ValidatePasswordResetTokenLazyQueryHookResult = ReturnType<typeof useValidatePasswordResetTokenLazyQuery>;
export type ValidatePasswordResetTokenQueryResult = Apollo.QueryResult<ValidatePasswordResetTokenQuery, ValidatePasswordResetTokenQueryVariables>;
export const CancelSwitchBillingIntervalDocument = gql`
    mutation CancelSwitchBillingInterval {
  cancelSwitchBillingInterval {
    currentBillingSubscription {
      ...CurrentBillingSubscriptionFragment
    }
    billingSubscriptions {
      ...BillingSubscriptionFragment
    }
  }
}
    ${CurrentBillingSubscriptionFragmentFragmentDoc}
${BillingSubscriptionFragmentFragmentDoc}`;
export type CancelSwitchBillingIntervalMutationFn = Apollo.MutationFunction<CancelSwitchBillingIntervalMutation, CancelSwitchBillingIntervalMutationVariables>;

/**
 * __useCancelSwitchBillingIntervalMutation__
 *
 * To run a mutation, you first call `useCancelSwitchBillingIntervalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelSwitchBillingIntervalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelSwitchBillingIntervalMutation, { data, loading, error }] = useCancelSwitchBillingIntervalMutation({
 *   variables: {
 *   },
 * });
 */
export function useCancelSwitchBillingIntervalMutation(baseOptions?: Apollo.MutationHookOptions<CancelSwitchBillingIntervalMutation, CancelSwitchBillingIntervalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelSwitchBillingIntervalMutation, CancelSwitchBillingIntervalMutationVariables>(CancelSwitchBillingIntervalDocument, options);
      }
export type CancelSwitchBillingIntervalMutationHookResult = ReturnType<typeof useCancelSwitchBillingIntervalMutation>;
export type CancelSwitchBillingIntervalMutationResult = Apollo.MutationResult<CancelSwitchBillingIntervalMutation>;
export type CancelSwitchBillingIntervalMutationOptions = Apollo.BaseMutationOptions<CancelSwitchBillingIntervalMutation, CancelSwitchBillingIntervalMutationVariables>;
export const CancelSwitchMeteredPriceDocument = gql`
    mutation CancelSwitchMeteredPrice {
  cancelSwitchMeteredPrice {
    currentBillingSubscription {
      ...CurrentBillingSubscriptionFragment
    }
    billingSubscriptions {
      ...BillingSubscriptionFragment
    }
  }
}
    ${CurrentBillingSubscriptionFragmentFragmentDoc}
${BillingSubscriptionFragmentFragmentDoc}`;
export type CancelSwitchMeteredPriceMutationFn = Apollo.MutationFunction<CancelSwitchMeteredPriceMutation, CancelSwitchMeteredPriceMutationVariables>;

/**
 * __useCancelSwitchMeteredPriceMutation__
 *
 * To run a mutation, you first call `useCancelSwitchMeteredPriceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelSwitchMeteredPriceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelSwitchMeteredPriceMutation, { data, loading, error }] = useCancelSwitchMeteredPriceMutation({
 *   variables: {
 *   },
 * });
 */
export function useCancelSwitchMeteredPriceMutation(baseOptions?: Apollo.MutationHookOptions<CancelSwitchMeteredPriceMutation, CancelSwitchMeteredPriceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelSwitchMeteredPriceMutation, CancelSwitchMeteredPriceMutationVariables>(CancelSwitchMeteredPriceDocument, options);
      }
export type CancelSwitchMeteredPriceMutationHookResult = ReturnType<typeof useCancelSwitchMeteredPriceMutation>;
export type CancelSwitchMeteredPriceMutationResult = Apollo.MutationResult<CancelSwitchMeteredPriceMutation>;
export type CancelSwitchMeteredPriceMutationOptions = Apollo.BaseMutationOptions<CancelSwitchMeteredPriceMutation, CancelSwitchMeteredPriceMutationVariables>;
export const CancelSwitchBillingPlanDocument = gql`
    mutation CancelSwitchBillingPlan {
  cancelSwitchBillingPlan {
    currentBillingSubscription {
      ...CurrentBillingSubscriptionFragment
    }
    billingSubscriptions {
      ...BillingSubscriptionFragment
    }
  }
}
    ${CurrentBillingSubscriptionFragmentFragmentDoc}
${BillingSubscriptionFragmentFragmentDoc}`;
export type CancelSwitchBillingPlanMutationFn = Apollo.MutationFunction<CancelSwitchBillingPlanMutation, CancelSwitchBillingPlanMutationVariables>;

/**
 * __useCancelSwitchBillingPlanMutation__
 *
 * To run a mutation, you first call `useCancelSwitchBillingPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelSwitchBillingPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelSwitchBillingPlanMutation, { data, loading, error }] = useCancelSwitchBillingPlanMutation({
 *   variables: {
 *   },
 * });
 */
export function useCancelSwitchBillingPlanMutation(baseOptions?: Apollo.MutationHookOptions<CancelSwitchBillingPlanMutation, CancelSwitchBillingPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelSwitchBillingPlanMutation, CancelSwitchBillingPlanMutationVariables>(CancelSwitchBillingPlanDocument, options);
      }
export type CancelSwitchBillingPlanMutationHookResult = ReturnType<typeof useCancelSwitchBillingPlanMutation>;
export type CancelSwitchBillingPlanMutationResult = Apollo.MutationResult<CancelSwitchBillingPlanMutation>;
export type CancelSwitchBillingPlanMutationOptions = Apollo.BaseMutationOptions<CancelSwitchBillingPlanMutation, CancelSwitchBillingPlanMutationVariables>;
export const CheckoutSessionDocument = gql`
    mutation CheckoutSession($recurringInterval: SubscriptionInterval!, $successUrlPath: String, $plan: BillingPlanKey!, $requirePaymentMethod: Boolean!) {
  checkoutSession(
    recurringInterval: $recurringInterval
    successUrlPath: $successUrlPath
    plan: $plan
    requirePaymentMethod: $requirePaymentMethod
  ) {
    url
  }
}
    `;
export type CheckoutSessionMutationFn = Apollo.MutationFunction<CheckoutSessionMutation, CheckoutSessionMutationVariables>;

/**
 * __useCheckoutSessionMutation__
 *
 * To run a mutation, you first call `useCheckoutSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckoutSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkoutSessionMutation, { data, loading, error }] = useCheckoutSessionMutation({
 *   variables: {
 *      recurringInterval: // value for 'recurringInterval'
 *      successUrlPath: // value for 'successUrlPath'
 *      plan: // value for 'plan'
 *      requirePaymentMethod: // value for 'requirePaymentMethod'
 *   },
 * });
 */
export function useCheckoutSessionMutation(baseOptions?: Apollo.MutationHookOptions<CheckoutSessionMutation, CheckoutSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckoutSessionMutation, CheckoutSessionMutationVariables>(CheckoutSessionDocument, options);
      }
export type CheckoutSessionMutationHookResult = ReturnType<typeof useCheckoutSessionMutation>;
export type CheckoutSessionMutationResult = Apollo.MutationResult<CheckoutSessionMutation>;
export type CheckoutSessionMutationOptions = Apollo.BaseMutationOptions<CheckoutSessionMutation, CheckoutSessionMutationVariables>;
export const EndSubscriptionTrialPeriodDocument = gql`
    mutation EndSubscriptionTrialPeriod {
  endSubscriptionTrialPeriod {
    status
    hasPaymentMethod
    billingPortalUrl
  }
}
    `;
export type EndSubscriptionTrialPeriodMutationFn = Apollo.MutationFunction<EndSubscriptionTrialPeriodMutation, EndSubscriptionTrialPeriodMutationVariables>;

/**
 * __useEndSubscriptionTrialPeriodMutation__
 *
 * To run a mutation, you first call `useEndSubscriptionTrialPeriodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEndSubscriptionTrialPeriodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [endSubscriptionTrialPeriodMutation, { data, loading, error }] = useEndSubscriptionTrialPeriodMutation({
 *   variables: {
 *   },
 * });
 */
export function useEndSubscriptionTrialPeriodMutation(baseOptions?: Apollo.MutationHookOptions<EndSubscriptionTrialPeriodMutation, EndSubscriptionTrialPeriodMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EndSubscriptionTrialPeriodMutation, EndSubscriptionTrialPeriodMutationVariables>(EndSubscriptionTrialPeriodDocument, options);
      }
export type EndSubscriptionTrialPeriodMutationHookResult = ReturnType<typeof useEndSubscriptionTrialPeriodMutation>;
export type EndSubscriptionTrialPeriodMutationResult = Apollo.MutationResult<EndSubscriptionTrialPeriodMutation>;
export type EndSubscriptionTrialPeriodMutationOptions = Apollo.BaseMutationOptions<EndSubscriptionTrialPeriodMutation, EndSubscriptionTrialPeriodMutationVariables>;
export const SetMeteredSubscriptionPriceDocument = gql`
    mutation SetMeteredSubscriptionPrice($priceId: String!) {
  setMeteredSubscriptionPrice(priceId: $priceId) {
    currentBillingSubscription {
      ...CurrentBillingSubscriptionFragment
    }
    billingSubscriptions {
      ...BillingSubscriptionFragment
    }
  }
}
    ${CurrentBillingSubscriptionFragmentFragmentDoc}
${BillingSubscriptionFragmentFragmentDoc}`;
export type SetMeteredSubscriptionPriceMutationFn = Apollo.MutationFunction<SetMeteredSubscriptionPriceMutation, SetMeteredSubscriptionPriceMutationVariables>;

/**
 * __useSetMeteredSubscriptionPriceMutation__
 *
 * To run a mutation, you first call `useSetMeteredSubscriptionPriceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetMeteredSubscriptionPriceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setMeteredSubscriptionPriceMutation, { data, loading, error }] = useSetMeteredSubscriptionPriceMutation({
 *   variables: {
 *      priceId: // value for 'priceId'
 *   },
 * });
 */
export function useSetMeteredSubscriptionPriceMutation(baseOptions?: Apollo.MutationHookOptions<SetMeteredSubscriptionPriceMutation, SetMeteredSubscriptionPriceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetMeteredSubscriptionPriceMutation, SetMeteredSubscriptionPriceMutationVariables>(SetMeteredSubscriptionPriceDocument, options);
      }
export type SetMeteredSubscriptionPriceMutationHookResult = ReturnType<typeof useSetMeteredSubscriptionPriceMutation>;
export type SetMeteredSubscriptionPriceMutationResult = Apollo.MutationResult<SetMeteredSubscriptionPriceMutation>;
export type SetMeteredSubscriptionPriceMutationOptions = Apollo.BaseMutationOptions<SetMeteredSubscriptionPriceMutation, SetMeteredSubscriptionPriceMutationVariables>;
export const SwitchBillingPlanDocument = gql`
    mutation SwitchBillingPlan {
  switchBillingPlan {
    currentBillingSubscription {
      ...CurrentBillingSubscriptionFragment
    }
    billingSubscriptions {
      ...BillingSubscriptionFragment
    }
  }
}
    ${CurrentBillingSubscriptionFragmentFragmentDoc}
${BillingSubscriptionFragmentFragmentDoc}`;
export type SwitchBillingPlanMutationFn = Apollo.MutationFunction<SwitchBillingPlanMutation, SwitchBillingPlanMutationVariables>;

/**
 * __useSwitchBillingPlanMutation__
 *
 * To run a mutation, you first call `useSwitchBillingPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSwitchBillingPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [switchBillingPlanMutation, { data, loading, error }] = useSwitchBillingPlanMutation({
 *   variables: {
 *   },
 * });
 */
export function useSwitchBillingPlanMutation(baseOptions?: Apollo.MutationHookOptions<SwitchBillingPlanMutation, SwitchBillingPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SwitchBillingPlanMutation, SwitchBillingPlanMutationVariables>(SwitchBillingPlanDocument, options);
      }
export type SwitchBillingPlanMutationHookResult = ReturnType<typeof useSwitchBillingPlanMutation>;
export type SwitchBillingPlanMutationResult = Apollo.MutationResult<SwitchBillingPlanMutation>;
export type SwitchBillingPlanMutationOptions = Apollo.BaseMutationOptions<SwitchBillingPlanMutation, SwitchBillingPlanMutationVariables>;
export const SwitchSubscriptionIntervalDocument = gql`
    mutation SwitchSubscriptionInterval {
  switchSubscriptionInterval {
    currentBillingSubscription {
      ...CurrentBillingSubscriptionFragment
    }
    billingSubscriptions {
      ...BillingSubscriptionFragment
    }
  }
}
    ${CurrentBillingSubscriptionFragmentFragmentDoc}
${BillingSubscriptionFragmentFragmentDoc}`;
export type SwitchSubscriptionIntervalMutationFn = Apollo.MutationFunction<SwitchSubscriptionIntervalMutation, SwitchSubscriptionIntervalMutationVariables>;

/**
 * __useSwitchSubscriptionIntervalMutation__
 *
 * To run a mutation, you first call `useSwitchSubscriptionIntervalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSwitchSubscriptionIntervalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [switchSubscriptionIntervalMutation, { data, loading, error }] = useSwitchSubscriptionIntervalMutation({
 *   variables: {
 *   },
 * });
 */
export function useSwitchSubscriptionIntervalMutation(baseOptions?: Apollo.MutationHookOptions<SwitchSubscriptionIntervalMutation, SwitchSubscriptionIntervalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SwitchSubscriptionIntervalMutation, SwitchSubscriptionIntervalMutationVariables>(SwitchSubscriptionIntervalDocument, options);
      }
export type SwitchSubscriptionIntervalMutationHookResult = ReturnType<typeof useSwitchSubscriptionIntervalMutation>;
export type SwitchSubscriptionIntervalMutationResult = Apollo.MutationResult<SwitchSubscriptionIntervalMutation>;
export type SwitchSubscriptionIntervalMutationOptions = Apollo.BaseMutationOptions<SwitchSubscriptionIntervalMutation, SwitchSubscriptionIntervalMutationVariables>;
export const BillingPortalSessionDocument = gql`
    query BillingPortalSession($returnUrlPath: String) {
  billingPortalSession(returnUrlPath: $returnUrlPath) {
    url
  }
}
    `;

/**
 * __useBillingPortalSessionQuery__
 *
 * To run a query within a React component, call `useBillingPortalSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useBillingPortalSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBillingPortalSessionQuery({
 *   variables: {
 *      returnUrlPath: // value for 'returnUrlPath'
 *   },
 * });
 */
export function useBillingPortalSessionQuery(baseOptions?: Apollo.QueryHookOptions<BillingPortalSessionQuery, BillingPortalSessionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BillingPortalSessionQuery, BillingPortalSessionQueryVariables>(BillingPortalSessionDocument, options);
      }
export function useBillingPortalSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BillingPortalSessionQuery, BillingPortalSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BillingPortalSessionQuery, BillingPortalSessionQueryVariables>(BillingPortalSessionDocument, options);
        }
export type BillingPortalSessionQueryHookResult = ReturnType<typeof useBillingPortalSessionQuery>;
export type BillingPortalSessionLazyQueryHookResult = ReturnType<typeof useBillingPortalSessionLazyQuery>;
export type BillingPortalSessionQueryResult = Apollo.QueryResult<BillingPortalSessionQuery, BillingPortalSessionQueryVariables>;
export const GetMeteredProductsUsageDocument = gql`
    query GetMeteredProductsUsage {
  getMeteredProductsUsage {
    productKey
    usedCredits
    grantedCredits
    rolloverCredits
    totalGrantedCredits
    unitPriceCents
  }
}
    `;

/**
 * __useGetMeteredProductsUsageQuery__
 *
 * To run a query within a React component, call `useGetMeteredProductsUsageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeteredProductsUsageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeteredProductsUsageQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMeteredProductsUsageQuery(baseOptions?: Apollo.QueryHookOptions<GetMeteredProductsUsageQuery, GetMeteredProductsUsageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMeteredProductsUsageQuery, GetMeteredProductsUsageQueryVariables>(GetMeteredProductsUsageDocument, options);
      }
export function useGetMeteredProductsUsageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMeteredProductsUsageQuery, GetMeteredProductsUsageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMeteredProductsUsageQuery, GetMeteredProductsUsageQueryVariables>(GetMeteredProductsUsageDocument, options);
        }
export type GetMeteredProductsUsageQueryHookResult = ReturnType<typeof useGetMeteredProductsUsageQuery>;
export type GetMeteredProductsUsageLazyQueryHookResult = ReturnType<typeof useGetMeteredProductsUsageLazyQuery>;
export type GetMeteredProductsUsageQueryResult = Apollo.QueryResult<GetMeteredProductsUsageQuery, GetMeteredProductsUsageQueryVariables>;
export const ListPlansDocument = gql`
    query listPlans {
  listPlans {
    planKey
    licensedProducts {
      name
      description
      images
      metadata {
        productKey
        planKey
        priceUsageBased
      }
      ... on BillingLicensedProduct {
        prices {
          ...BillingPriceLicensedFragment
        }
      }
    }
    meteredProducts {
      name
      description
      images
      metadata {
        productKey
        planKey
        priceUsageBased
      }
      ... on BillingMeteredProduct {
        prices {
          ...BillingPriceMeteredFragment
        }
      }
    }
  }
}
    ${BillingPriceLicensedFragmentFragmentDoc}
${BillingPriceMeteredFragmentFragmentDoc}`;

/**
 * __useListPlansQuery__
 *
 * To run a query within a React component, call `useListPlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPlansQuery({
 *   variables: {
 *   },
 * });
 */
export function useListPlansQuery(baseOptions?: Apollo.QueryHookOptions<ListPlansQuery, ListPlansQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListPlansQuery, ListPlansQueryVariables>(ListPlansDocument, options);
      }
export function useListPlansLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListPlansQuery, ListPlansQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListPlansQuery, ListPlansQueryVariables>(ListPlansDocument, options);
        }
export type ListPlansQueryHookResult = ReturnType<typeof useListPlansQuery>;
export type ListPlansLazyQueryHookResult = ReturnType<typeof useListPlansLazyQuery>;
export type ListPlansQueryResult = Apollo.QueryResult<ListPlansQuery, ListPlansQueryVariables>;
export const CreateServerDocument = gql`
    mutation createServer($input: CreateRemoteServerInput!) {
  createOneRemoteServer(input: $input) {
    ...RemoteServerFields
  }
}
    ${RemoteServerFieldsFragmentDoc}`;
export type CreateServerMutationFn = Apollo.MutationFunction<CreateServerMutation, CreateServerMutationVariables>;

/**
 * __useCreateServerMutation__
 *
 * To run a mutation, you first call `useCreateServerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateServerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createServerMutation, { data, loading, error }] = useCreateServerMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateServerMutation(baseOptions?: Apollo.MutationHookOptions<CreateServerMutation, CreateServerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateServerMutation, CreateServerMutationVariables>(CreateServerDocument, options);
      }
export type CreateServerMutationHookResult = ReturnType<typeof useCreateServerMutation>;
export type CreateServerMutationResult = Apollo.MutationResult<CreateServerMutation>;
export type CreateServerMutationOptions = Apollo.BaseMutationOptions<CreateServerMutation, CreateServerMutationVariables>;
export const DeleteServerDocument = gql`
    mutation deleteServer($input: RemoteServerIdInput!) {
  deleteOneRemoteServer(input: $input) {
    id
  }
}
    `;
export type DeleteServerMutationFn = Apollo.MutationFunction<DeleteServerMutation, DeleteServerMutationVariables>;

/**
 * __useDeleteServerMutation__
 *
 * To run a mutation, you first call `useDeleteServerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteServerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteServerMutation, { data, loading, error }] = useDeleteServerMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteServerMutation(baseOptions?: Apollo.MutationHookOptions<DeleteServerMutation, DeleteServerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteServerMutation, DeleteServerMutationVariables>(DeleteServerDocument, options);
      }
export type DeleteServerMutationHookResult = ReturnType<typeof useDeleteServerMutation>;
export type DeleteServerMutationResult = Apollo.MutationResult<DeleteServerMutation>;
export type DeleteServerMutationOptions = Apollo.BaseMutationOptions<DeleteServerMutation, DeleteServerMutationVariables>;
export const SyncRemoteTableDocument = gql`
    mutation syncRemoteTable($input: RemoteTableInput!) {
  syncRemoteTable(input: $input) {
    ...RemoteTableFields
  }
}
    ${RemoteTableFieldsFragmentDoc}`;
export type SyncRemoteTableMutationFn = Apollo.MutationFunction<SyncRemoteTableMutation, SyncRemoteTableMutationVariables>;

/**
 * __useSyncRemoteTableMutation__
 *
 * To run a mutation, you first call `useSyncRemoteTableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSyncRemoteTableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [syncRemoteTableMutation, { data, loading, error }] = useSyncRemoteTableMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSyncRemoteTableMutation(baseOptions?: Apollo.MutationHookOptions<SyncRemoteTableMutation, SyncRemoteTableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SyncRemoteTableMutation, SyncRemoteTableMutationVariables>(SyncRemoteTableDocument, options);
      }
export type SyncRemoteTableMutationHookResult = ReturnType<typeof useSyncRemoteTableMutation>;
export type SyncRemoteTableMutationResult = Apollo.MutationResult<SyncRemoteTableMutation>;
export type SyncRemoteTableMutationOptions = Apollo.BaseMutationOptions<SyncRemoteTableMutation, SyncRemoteTableMutationVariables>;
export const SyncRemoteTableSchemaChangesDocument = gql`
    mutation syncRemoteTableSchemaChanges($input: RemoteTableInput!) {
  syncRemoteTableSchemaChanges(input: $input) {
    ...RemoteTableFields
  }
}
    ${RemoteTableFieldsFragmentDoc}`;
export type SyncRemoteTableSchemaChangesMutationFn = Apollo.MutationFunction<SyncRemoteTableSchemaChangesMutation, SyncRemoteTableSchemaChangesMutationVariables>;

/**
 * __useSyncRemoteTableSchemaChangesMutation__
 *
 * To run a mutation, you first call `useSyncRemoteTableSchemaChangesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSyncRemoteTableSchemaChangesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [syncRemoteTableSchemaChangesMutation, { data, loading, error }] = useSyncRemoteTableSchemaChangesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSyncRemoteTableSchemaChangesMutation(baseOptions?: Apollo.MutationHookOptions<SyncRemoteTableSchemaChangesMutation, SyncRemoteTableSchemaChangesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SyncRemoteTableSchemaChangesMutation, SyncRemoteTableSchemaChangesMutationVariables>(SyncRemoteTableSchemaChangesDocument, options);
      }
export type SyncRemoteTableSchemaChangesMutationHookResult = ReturnType<typeof useSyncRemoteTableSchemaChangesMutation>;
export type SyncRemoteTableSchemaChangesMutationResult = Apollo.MutationResult<SyncRemoteTableSchemaChangesMutation>;
export type SyncRemoteTableSchemaChangesMutationOptions = Apollo.BaseMutationOptions<SyncRemoteTableSchemaChangesMutation, SyncRemoteTableSchemaChangesMutationVariables>;
export const UnsyncRemoteTableDocument = gql`
    mutation unsyncRemoteTable($input: RemoteTableInput!) {
  unsyncRemoteTable(input: $input) {
    ...RemoteTableFields
  }
}
    ${RemoteTableFieldsFragmentDoc}`;
export type UnsyncRemoteTableMutationFn = Apollo.MutationFunction<UnsyncRemoteTableMutation, UnsyncRemoteTableMutationVariables>;

/**
 * __useUnsyncRemoteTableMutation__
 *
 * To run a mutation, you first call `useUnsyncRemoteTableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnsyncRemoteTableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unsyncRemoteTableMutation, { data, loading, error }] = useUnsyncRemoteTableMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUnsyncRemoteTableMutation(baseOptions?: Apollo.MutationHookOptions<UnsyncRemoteTableMutation, UnsyncRemoteTableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnsyncRemoteTableMutation, UnsyncRemoteTableMutationVariables>(UnsyncRemoteTableDocument, options);
      }
export type UnsyncRemoteTableMutationHookResult = ReturnType<typeof useUnsyncRemoteTableMutation>;
export type UnsyncRemoteTableMutationResult = Apollo.MutationResult<UnsyncRemoteTableMutation>;
export type UnsyncRemoteTableMutationOptions = Apollo.BaseMutationOptions<UnsyncRemoteTableMutation, UnsyncRemoteTableMutationVariables>;
export const UpdateServerDocument = gql`
    mutation updateServer($input: UpdateRemoteServerInput!) {
  updateOneRemoteServer(input: $input) {
    ...RemoteServerFields
  }
}
    ${RemoteServerFieldsFragmentDoc}`;
export type UpdateServerMutationFn = Apollo.MutationFunction<UpdateServerMutation, UpdateServerMutationVariables>;

/**
 * __useUpdateServerMutation__
 *
 * To run a mutation, you first call `useUpdateServerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateServerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateServerMutation, { data, loading, error }] = useUpdateServerMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateServerMutation(baseOptions?: Apollo.MutationHookOptions<UpdateServerMutation, UpdateServerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateServerMutation, UpdateServerMutationVariables>(UpdateServerDocument, options);
      }
export type UpdateServerMutationHookResult = ReturnType<typeof useUpdateServerMutation>;
export type UpdateServerMutationResult = Apollo.MutationResult<UpdateServerMutation>;
export type UpdateServerMutationOptions = Apollo.BaseMutationOptions<UpdateServerMutation, UpdateServerMutationVariables>;
export const GetManyDatabaseConnectionsDocument = gql`
    query GetManyDatabaseConnections($input: RemoteServerTypeInput!) {
  findManyRemoteServersByType(input: $input) {
    ...RemoteServerFields
  }
}
    ${RemoteServerFieldsFragmentDoc}`;

/**
 * __useGetManyDatabaseConnectionsQuery__
 *
 * To run a query within a React component, call `useGetManyDatabaseConnectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetManyDatabaseConnectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetManyDatabaseConnectionsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetManyDatabaseConnectionsQuery(baseOptions: Apollo.QueryHookOptions<GetManyDatabaseConnectionsQuery, GetManyDatabaseConnectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetManyDatabaseConnectionsQuery, GetManyDatabaseConnectionsQueryVariables>(GetManyDatabaseConnectionsDocument, options);
      }
export function useGetManyDatabaseConnectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetManyDatabaseConnectionsQuery, GetManyDatabaseConnectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetManyDatabaseConnectionsQuery, GetManyDatabaseConnectionsQueryVariables>(GetManyDatabaseConnectionsDocument, options);
        }
export type GetManyDatabaseConnectionsQueryHookResult = ReturnType<typeof useGetManyDatabaseConnectionsQuery>;
export type GetManyDatabaseConnectionsLazyQueryHookResult = ReturnType<typeof useGetManyDatabaseConnectionsLazyQuery>;
export type GetManyDatabaseConnectionsQueryResult = Apollo.QueryResult<GetManyDatabaseConnectionsQuery, GetManyDatabaseConnectionsQueryVariables>;
export const GetManyRemoteTablesDocument = gql`
    query GetManyRemoteTables($input: FindManyRemoteTablesInput!) {
  findDistantTablesWithStatus(input: $input) {
    ...RemoteTableFields
  }
}
    ${RemoteTableFieldsFragmentDoc}`;

/**
 * __useGetManyRemoteTablesQuery__
 *
 * To run a query within a React component, call `useGetManyRemoteTablesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetManyRemoteTablesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetManyRemoteTablesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetManyRemoteTablesQuery(baseOptions: Apollo.QueryHookOptions<GetManyRemoteTablesQuery, GetManyRemoteTablesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetManyRemoteTablesQuery, GetManyRemoteTablesQueryVariables>(GetManyRemoteTablesDocument, options);
      }
export function useGetManyRemoteTablesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetManyRemoteTablesQuery, GetManyRemoteTablesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetManyRemoteTablesQuery, GetManyRemoteTablesQueryVariables>(GetManyRemoteTablesDocument, options);
        }
export type GetManyRemoteTablesQueryHookResult = ReturnType<typeof useGetManyRemoteTablesQuery>;
export type GetManyRemoteTablesLazyQueryHookResult = ReturnType<typeof useGetManyRemoteTablesLazyQuery>;
export type GetManyRemoteTablesQueryResult = Apollo.QueryResult<GetManyRemoteTablesQuery, GetManyRemoteTablesQueryVariables>;
export const GetOneDatabaseConnectionDocument = gql`
    query GetOneDatabaseConnection($input: RemoteServerIdInput!) {
  findOneRemoteServerById(input: $input) {
    ...RemoteServerFields
  }
}
    ${RemoteServerFieldsFragmentDoc}`;

/**
 * __useGetOneDatabaseConnectionQuery__
 *
 * To run a query within a React component, call `useGetOneDatabaseConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOneDatabaseConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOneDatabaseConnectionQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetOneDatabaseConnectionQuery(baseOptions: Apollo.QueryHookOptions<GetOneDatabaseConnectionQuery, GetOneDatabaseConnectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOneDatabaseConnectionQuery, GetOneDatabaseConnectionQueryVariables>(GetOneDatabaseConnectionDocument, options);
      }
export function useGetOneDatabaseConnectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOneDatabaseConnectionQuery, GetOneDatabaseConnectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOneDatabaseConnectionQuery, GetOneDatabaseConnectionQueryVariables>(GetOneDatabaseConnectionDocument, options);
        }
export type GetOneDatabaseConnectionQueryHookResult = ReturnType<typeof useGetOneDatabaseConnectionQuery>;
export type GetOneDatabaseConnectionLazyQueryHookResult = ReturnType<typeof useGetOneDatabaseConnectionLazyQuery>;
export type GetOneDatabaseConnectionQueryResult = Apollo.QueryResult<GetOneDatabaseConnectionQuery, GetOneDatabaseConnectionQueryVariables>;
export const CreateFileDocument = gql`
    mutation CreateFile($file: Upload!) {
  createFile(file: $file) {
    id
    name
    fullPath
    size
    type
    createdAt
  }
}
    `;
export type CreateFileMutationFn = Apollo.MutationFunction<CreateFileMutation, CreateFileMutationVariables>;

/**
 * __useCreateFileMutation__
 *
 * To run a mutation, you first call `useCreateFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFileMutation, { data, loading, error }] = useCreateFileMutation({
 *   variables: {
 *      file: // value for 'file'
 *   },
 * });
 */
export function useCreateFileMutation(baseOptions?: Apollo.MutationHookOptions<CreateFileMutation, CreateFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateFileMutation, CreateFileMutationVariables>(CreateFileDocument, options);
      }
export type CreateFileMutationHookResult = ReturnType<typeof useCreateFileMutation>;
export type CreateFileMutationResult = Apollo.MutationResult<CreateFileMutation>;
export type CreateFileMutationOptions = Apollo.BaseMutationOptions<CreateFileMutation, CreateFileMutationVariables>;
export const DeleteFileDocument = gql`
    mutation DeleteFile($fileId: UUID!) {
  deleteFile(fileId: $fileId) {
    id
    name
    fullPath
    size
    type
    createdAt
  }
}
    `;
export type DeleteFileMutationFn = Apollo.MutationFunction<DeleteFileMutation, DeleteFileMutationVariables>;

/**
 * __useDeleteFileMutation__
 *
 * To run a mutation, you first call `useDeleteFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFileMutation, { data, loading, error }] = useDeleteFileMutation({
 *   variables: {
 *      fileId: // value for 'fileId'
 *   },
 * });
 */
export function useDeleteFileMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFileMutation, DeleteFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFileMutation, DeleteFileMutationVariables>(DeleteFileDocument, options);
      }
export type DeleteFileMutationHookResult = ReturnType<typeof useDeleteFileMutation>;
export type DeleteFileMutationResult = Apollo.MutationResult<DeleteFileMutation>;
export type DeleteFileMutationOptions = Apollo.BaseMutationOptions<DeleteFileMutation, DeleteFileMutationVariables>;
export const CreateOneObjectMetadataItemDocument = gql`
    mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
  createOneObject(input: $input) {
    id
    nameSingular
    namePlural
    labelSingular
    labelPlural
    description
    icon
    isCustom
    isActive
    isSearchable
    createdAt
    updatedAt
    labelIdentifierFieldMetadataId
    imageIdentifierFieldMetadataId
    isLabelSyncedWithName
  }
}
    `;
export type CreateOneObjectMetadataItemMutationFn = Apollo.MutationFunction<CreateOneObjectMetadataItemMutation, CreateOneObjectMetadataItemMutationVariables>;

/**
 * __useCreateOneObjectMetadataItemMutation__
 *
 * To run a mutation, you first call `useCreateOneObjectMetadataItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOneObjectMetadataItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOneObjectMetadataItemMutation, { data, loading, error }] = useCreateOneObjectMetadataItemMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOneObjectMetadataItemMutation(baseOptions?: Apollo.MutationHookOptions<CreateOneObjectMetadataItemMutation, CreateOneObjectMetadataItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOneObjectMetadataItemMutation, CreateOneObjectMetadataItemMutationVariables>(CreateOneObjectMetadataItemDocument, options);
      }
export type CreateOneObjectMetadataItemMutationHookResult = ReturnType<typeof useCreateOneObjectMetadataItemMutation>;
export type CreateOneObjectMetadataItemMutationResult = Apollo.MutationResult<CreateOneObjectMetadataItemMutation>;
export type CreateOneObjectMetadataItemMutationOptions = Apollo.BaseMutationOptions<CreateOneObjectMetadataItemMutation, CreateOneObjectMetadataItemMutationVariables>;
export const CreateOneFieldMetadataItemDocument = gql`
    mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
  createOneField(input: $input) {
    id
    type
    name
    label
    description
    icon
    isCustom
    isActive
    isUnique
    isNullable
    createdAt
    updatedAt
    settings
    defaultValue
    options
    isLabelSyncedWithName
    applicationId
    object {
      id
    }
  }
}
    `;
export type CreateOneFieldMetadataItemMutationFn = Apollo.MutationFunction<CreateOneFieldMetadataItemMutation, CreateOneFieldMetadataItemMutationVariables>;

/**
 * __useCreateOneFieldMetadataItemMutation__
 *
 * To run a mutation, you first call `useCreateOneFieldMetadataItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOneFieldMetadataItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOneFieldMetadataItemMutation, { data, loading, error }] = useCreateOneFieldMetadataItemMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOneFieldMetadataItemMutation(baseOptions?: Apollo.MutationHookOptions<CreateOneFieldMetadataItemMutation, CreateOneFieldMetadataItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOneFieldMetadataItemMutation, CreateOneFieldMetadataItemMutationVariables>(CreateOneFieldMetadataItemDocument, options);
      }
export type CreateOneFieldMetadataItemMutationHookResult = ReturnType<typeof useCreateOneFieldMetadataItemMutation>;
export type CreateOneFieldMetadataItemMutationResult = Apollo.MutationResult<CreateOneFieldMetadataItemMutation>;
export type CreateOneFieldMetadataItemMutationOptions = Apollo.BaseMutationOptions<CreateOneFieldMetadataItemMutation, CreateOneFieldMetadataItemMutationVariables>;
export const UpdateOneFieldMetadataItemDocument = gql`
    mutation UpdateOneFieldMetadataItem($idToUpdate: UUID!, $updatePayload: UpdateFieldInput!) {
  updateOneField(input: {id: $idToUpdate, update: $updatePayload}) {
    id
    type
    name
    label
    description
    icon
    isCustom
    isActive
    isUnique
    isNullable
    createdAt
    updatedAt
    settings
    isLabelSyncedWithName
    applicationId
    object {
      id
    }
  }
}
    `;
export type UpdateOneFieldMetadataItemMutationFn = Apollo.MutationFunction<UpdateOneFieldMetadataItemMutation, UpdateOneFieldMetadataItemMutationVariables>;

/**
 * __useUpdateOneFieldMetadataItemMutation__
 *
 * To run a mutation, you first call `useUpdateOneFieldMetadataItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOneFieldMetadataItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOneFieldMetadataItemMutation, { data, loading, error }] = useUpdateOneFieldMetadataItemMutation({
 *   variables: {
 *      idToUpdate: // value for 'idToUpdate'
 *      updatePayload: // value for 'updatePayload'
 *   },
 * });
 */
export function useUpdateOneFieldMetadataItemMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOneFieldMetadataItemMutation, UpdateOneFieldMetadataItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOneFieldMetadataItemMutation, UpdateOneFieldMetadataItemMutationVariables>(UpdateOneFieldMetadataItemDocument, options);
      }
export type UpdateOneFieldMetadataItemMutationHookResult = ReturnType<typeof useUpdateOneFieldMetadataItemMutation>;
export type UpdateOneFieldMetadataItemMutationResult = Apollo.MutationResult<UpdateOneFieldMetadataItemMutation>;
export type UpdateOneFieldMetadataItemMutationOptions = Apollo.BaseMutationOptions<UpdateOneFieldMetadataItemMutation, UpdateOneFieldMetadataItemMutationVariables>;
export const UpdateOneObjectMetadataItemDocument = gql`
    mutation UpdateOneObjectMetadataItem($idToUpdate: UUID!, $updatePayload: UpdateObjectPayload!) {
  updateOneObject(input: {id: $idToUpdate, update: $updatePayload}) {
    id
    nameSingular
    namePlural
    labelSingular
    labelPlural
    description
    icon
    isCustom
    isActive
    isSearchable
    createdAt
    updatedAt
    labelIdentifierFieldMetadataId
    imageIdentifierFieldMetadataId
    isLabelSyncedWithName
  }
}
    `;
export type UpdateOneObjectMetadataItemMutationFn = Apollo.MutationFunction<UpdateOneObjectMetadataItemMutation, UpdateOneObjectMetadataItemMutationVariables>;

/**
 * __useUpdateOneObjectMetadataItemMutation__
 *
 * To run a mutation, you first call `useUpdateOneObjectMetadataItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOneObjectMetadataItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOneObjectMetadataItemMutation, { data, loading, error }] = useUpdateOneObjectMetadataItemMutation({
 *   variables: {
 *      idToUpdate: // value for 'idToUpdate'
 *      updatePayload: // value for 'updatePayload'
 *   },
 * });
 */
export function useUpdateOneObjectMetadataItemMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOneObjectMetadataItemMutation, UpdateOneObjectMetadataItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOneObjectMetadataItemMutation, UpdateOneObjectMetadataItemMutationVariables>(UpdateOneObjectMetadataItemDocument, options);
      }
export type UpdateOneObjectMetadataItemMutationHookResult = ReturnType<typeof useUpdateOneObjectMetadataItemMutation>;
export type UpdateOneObjectMetadataItemMutationResult = Apollo.MutationResult<UpdateOneObjectMetadataItemMutation>;
export type UpdateOneObjectMetadataItemMutationOptions = Apollo.BaseMutationOptions<UpdateOneObjectMetadataItemMutation, UpdateOneObjectMetadataItemMutationVariables>;
export const DeleteOneObjectMetadataItemDocument = gql`
    mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {
  deleteOneObject(input: {id: $idToDelete}) {
    id
    nameSingular
    namePlural
    labelSingular
    labelPlural
    description
    icon
    isCustom
    isActive
    isSearchable
    createdAt
    updatedAt
    labelIdentifierFieldMetadataId
    imageIdentifierFieldMetadataId
    isLabelSyncedWithName
  }
}
    `;
export type DeleteOneObjectMetadataItemMutationFn = Apollo.MutationFunction<DeleteOneObjectMetadataItemMutation, DeleteOneObjectMetadataItemMutationVariables>;

/**
 * __useDeleteOneObjectMetadataItemMutation__
 *
 * To run a mutation, you first call `useDeleteOneObjectMetadataItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOneObjectMetadataItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOneObjectMetadataItemMutation, { data, loading, error }] = useDeleteOneObjectMetadataItemMutation({
 *   variables: {
 *      idToDelete: // value for 'idToDelete'
 *   },
 * });
 */
export function useDeleteOneObjectMetadataItemMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOneObjectMetadataItemMutation, DeleteOneObjectMetadataItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOneObjectMetadataItemMutation, DeleteOneObjectMetadataItemMutationVariables>(DeleteOneObjectMetadataItemDocument, options);
      }
export type DeleteOneObjectMetadataItemMutationHookResult = ReturnType<typeof useDeleteOneObjectMetadataItemMutation>;
export type DeleteOneObjectMetadataItemMutationResult = Apollo.MutationResult<DeleteOneObjectMetadataItemMutation>;
export type DeleteOneObjectMetadataItemMutationOptions = Apollo.BaseMutationOptions<DeleteOneObjectMetadataItemMutation, DeleteOneObjectMetadataItemMutationVariables>;
export const DeleteOneFieldMetadataItemDocument = gql`
    mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {
  deleteOneField(input: {id: $idToDelete}) {
    id
    type
    name
    label
    description
    icon
    isCustom
    isActive
    isUnique
    isNullable
    createdAt
    updatedAt
    settings
    applicationId
    object {
      id
    }
  }
}
    `;
export type DeleteOneFieldMetadataItemMutationFn = Apollo.MutationFunction<DeleteOneFieldMetadataItemMutation, DeleteOneFieldMetadataItemMutationVariables>;

/**
 * __useDeleteOneFieldMetadataItemMutation__
 *
 * To run a mutation, you first call `useDeleteOneFieldMetadataItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOneFieldMetadataItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOneFieldMetadataItemMutation, { data, loading, error }] = useDeleteOneFieldMetadataItemMutation({
 *   variables: {
 *      idToDelete: // value for 'idToDelete'
 *   },
 * });
 */
export function useDeleteOneFieldMetadataItemMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOneFieldMetadataItemMutation, DeleteOneFieldMetadataItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOneFieldMetadataItemMutation, DeleteOneFieldMetadataItemMutationVariables>(DeleteOneFieldMetadataItemDocument, options);
      }
export type DeleteOneFieldMetadataItemMutationHookResult = ReturnType<typeof useDeleteOneFieldMetadataItemMutation>;
export type DeleteOneFieldMetadataItemMutationResult = Apollo.MutationResult<DeleteOneFieldMetadataItemMutation>;
export type DeleteOneFieldMetadataItemMutationOptions = Apollo.BaseMutationOptions<DeleteOneFieldMetadataItemMutation, DeleteOneFieldMetadataItemMutationVariables>;
export const ObjectMetadataItemsDocument = gql`
    query ObjectMetadataItems {
  objects(paging: {first: 1000}) {
    edges {
      node {
        ...ObjectMetadataFields
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    ${ObjectMetadataFieldsFragmentDoc}`;

/**
 * __useObjectMetadataItemsQuery__
 *
 * To run a query within a React component, call `useObjectMetadataItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useObjectMetadataItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useObjectMetadataItemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useObjectMetadataItemsQuery(baseOptions?: Apollo.QueryHookOptions<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>(ObjectMetadataItemsDocument, options);
      }
export function useObjectMetadataItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>(ObjectMetadataItemsDocument, options);
        }
export type ObjectMetadataItemsQueryHookResult = ReturnType<typeof useObjectMetadataItemsQuery>;
export type ObjectMetadataItemsLazyQueryHookResult = ReturnType<typeof useObjectMetadataItemsLazyQuery>;
export type ObjectMetadataItemsQueryResult = Apollo.QueryResult<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>;
export const SkipBookOnboardingStepDocument = gql`
    mutation SkipBookOnboardingStep {
  skipBookOnboardingStep {
    success
  }
}
    `;
export type SkipBookOnboardingStepMutationFn = Apollo.MutationFunction<SkipBookOnboardingStepMutation, SkipBookOnboardingStepMutationVariables>;

/**
 * __useSkipBookOnboardingStepMutation__
 *
 * To run a mutation, you first call `useSkipBookOnboardingStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSkipBookOnboardingStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [skipBookOnboardingStepMutation, { data, loading, error }] = useSkipBookOnboardingStepMutation({
 *   variables: {
 *   },
 * });
 */
export function useSkipBookOnboardingStepMutation(baseOptions?: Apollo.MutationHookOptions<SkipBookOnboardingStepMutation, SkipBookOnboardingStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SkipBookOnboardingStepMutation, SkipBookOnboardingStepMutationVariables>(SkipBookOnboardingStepDocument, options);
      }
export type SkipBookOnboardingStepMutationHookResult = ReturnType<typeof useSkipBookOnboardingStepMutation>;
export type SkipBookOnboardingStepMutationResult = Apollo.MutationResult<SkipBookOnboardingStepMutation>;
export type SkipBookOnboardingStepMutationOptions = Apollo.BaseMutationOptions<SkipBookOnboardingStepMutation, SkipBookOnboardingStepMutationVariables>;
export const SkipSyncEmailOnboardingStepDocument = gql`
    mutation SkipSyncEmailOnboardingStep {
  skipSyncEmailOnboardingStep {
    success
  }
}
    `;
export type SkipSyncEmailOnboardingStepMutationFn = Apollo.MutationFunction<SkipSyncEmailOnboardingStepMutation, SkipSyncEmailOnboardingStepMutationVariables>;

/**
 * __useSkipSyncEmailOnboardingStepMutation__
 *
 * To run a mutation, you first call `useSkipSyncEmailOnboardingStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSkipSyncEmailOnboardingStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [skipSyncEmailOnboardingStepMutation, { data, loading, error }] = useSkipSyncEmailOnboardingStepMutation({
 *   variables: {
 *   },
 * });
 */
export function useSkipSyncEmailOnboardingStepMutation(baseOptions?: Apollo.MutationHookOptions<SkipSyncEmailOnboardingStepMutation, SkipSyncEmailOnboardingStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SkipSyncEmailOnboardingStepMutation, SkipSyncEmailOnboardingStepMutationVariables>(SkipSyncEmailOnboardingStepDocument, options);
      }
export type SkipSyncEmailOnboardingStepMutationHookResult = ReturnType<typeof useSkipSyncEmailOnboardingStepMutation>;
export type SkipSyncEmailOnboardingStepMutationResult = Apollo.MutationResult<SkipSyncEmailOnboardingStepMutation>;
export type SkipSyncEmailOnboardingStepMutationOptions = Apollo.BaseMutationOptions<SkipSyncEmailOnboardingStepMutation, SkipSyncEmailOnboardingStepMutationVariables>;
export const SaveImapSmtpCaldavAccountDocument = gql`
    mutation SaveImapSmtpCaldavAccount($accountOwnerId: UUID!, $handle: String!, $connectionParameters: EmailAccountConnectionParameters!, $id: UUID) {
  saveImapSmtpCaldavAccount(
    accountOwnerId: $accountOwnerId
    handle: $handle
    connectionParameters: $connectionParameters
    id: $id
  ) {
    success
    connectedAccountId
  }
}
    `;
export type SaveImapSmtpCaldavAccountMutationFn = Apollo.MutationFunction<SaveImapSmtpCaldavAccountMutation, SaveImapSmtpCaldavAccountMutationVariables>;

/**
 * __useSaveImapSmtpCaldavAccountMutation__
 *
 * To run a mutation, you first call `useSaveImapSmtpCaldavAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveImapSmtpCaldavAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveImapSmtpCaldavAccountMutation, { data, loading, error }] = useSaveImapSmtpCaldavAccountMutation({
 *   variables: {
 *      accountOwnerId: // value for 'accountOwnerId'
 *      handle: // value for 'handle'
 *      connectionParameters: // value for 'connectionParameters'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSaveImapSmtpCaldavAccountMutation(baseOptions?: Apollo.MutationHookOptions<SaveImapSmtpCaldavAccountMutation, SaveImapSmtpCaldavAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveImapSmtpCaldavAccountMutation, SaveImapSmtpCaldavAccountMutationVariables>(SaveImapSmtpCaldavAccountDocument, options);
      }
export type SaveImapSmtpCaldavAccountMutationHookResult = ReturnType<typeof useSaveImapSmtpCaldavAccountMutation>;
export type SaveImapSmtpCaldavAccountMutationResult = Apollo.MutationResult<SaveImapSmtpCaldavAccountMutation>;
export type SaveImapSmtpCaldavAccountMutationOptions = Apollo.BaseMutationOptions<SaveImapSmtpCaldavAccountMutation, SaveImapSmtpCaldavAccountMutationVariables>;
export const StartChannelSyncDocument = gql`
    mutation StartChannelSync($connectedAccountId: UUID!) {
  startChannelSync(connectedAccountId: $connectedAccountId) {
    success
  }
}
    `;
export type StartChannelSyncMutationFn = Apollo.MutationFunction<StartChannelSyncMutation, StartChannelSyncMutationVariables>;

/**
 * __useStartChannelSyncMutation__
 *
 * To run a mutation, you first call `useStartChannelSyncMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartChannelSyncMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startChannelSyncMutation, { data, loading, error }] = useStartChannelSyncMutation({
 *   variables: {
 *      connectedAccountId: // value for 'connectedAccountId'
 *   },
 * });
 */
export function useStartChannelSyncMutation(baseOptions?: Apollo.MutationHookOptions<StartChannelSyncMutation, StartChannelSyncMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartChannelSyncMutation, StartChannelSyncMutationVariables>(StartChannelSyncDocument, options);
      }
export type StartChannelSyncMutationHookResult = ReturnType<typeof useStartChannelSyncMutation>;
export type StartChannelSyncMutationResult = Apollo.MutationResult<StartChannelSyncMutation>;
export type StartChannelSyncMutationOptions = Apollo.BaseMutationOptions<StartChannelSyncMutation, StartChannelSyncMutationVariables>;
export const GetConnectedImapSmtpCaldavAccountDocument = gql`
    query GetConnectedImapSmtpCaldavAccount($id: UUID!) {
  getConnectedImapSmtpCaldavAccount(id: $id) {
    id
    handle
    provider
    accountOwnerId
    connectionParameters {
      IMAP {
        host
        port
        secure
        username
        password
      }
      SMTP {
        host
        username
        port
        secure
        password
      }
      CALDAV {
        host
        username
        password
      }
    }
  }
}
    `;

/**
 * __useGetConnectedImapSmtpCaldavAccountQuery__
 *
 * To run a query within a React component, call `useGetConnectedImapSmtpCaldavAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConnectedImapSmtpCaldavAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConnectedImapSmtpCaldavAccountQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetConnectedImapSmtpCaldavAccountQuery(baseOptions: Apollo.QueryHookOptions<GetConnectedImapSmtpCaldavAccountQuery, GetConnectedImapSmtpCaldavAccountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetConnectedImapSmtpCaldavAccountQuery, GetConnectedImapSmtpCaldavAccountQueryVariables>(GetConnectedImapSmtpCaldavAccountDocument, options);
      }
export function useGetConnectedImapSmtpCaldavAccountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConnectedImapSmtpCaldavAccountQuery, GetConnectedImapSmtpCaldavAccountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetConnectedImapSmtpCaldavAccountQuery, GetConnectedImapSmtpCaldavAccountQueryVariables>(GetConnectedImapSmtpCaldavAccountDocument, options);
        }
export type GetConnectedImapSmtpCaldavAccountQueryHookResult = ReturnType<typeof useGetConnectedImapSmtpCaldavAccountQuery>;
export type GetConnectedImapSmtpCaldavAccountLazyQueryHookResult = ReturnType<typeof useGetConnectedImapSmtpCaldavAccountLazyQuery>;
export type GetConnectedImapSmtpCaldavAccountQueryResult = Apollo.QueryResult<GetConnectedImapSmtpCaldavAccountQuery, GetConnectedImapSmtpCaldavAccountQueryVariables>;
export const CreateDatabaseConfigVariableDocument = gql`
    mutation CreateDatabaseConfigVariable($key: String!, $value: JSON!) {
  createDatabaseConfigVariable(key: $key, value: $value)
}
    `;
export type CreateDatabaseConfigVariableMutationFn = Apollo.MutationFunction<CreateDatabaseConfigVariableMutation, CreateDatabaseConfigVariableMutationVariables>;

/**
 * __useCreateDatabaseConfigVariableMutation__
 *
 * To run a mutation, you first call `useCreateDatabaseConfigVariableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDatabaseConfigVariableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDatabaseConfigVariableMutation, { data, loading, error }] = useCreateDatabaseConfigVariableMutation({
 *   variables: {
 *      key: // value for 'key'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useCreateDatabaseConfigVariableMutation(baseOptions?: Apollo.MutationHookOptions<CreateDatabaseConfigVariableMutation, CreateDatabaseConfigVariableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDatabaseConfigVariableMutation, CreateDatabaseConfigVariableMutationVariables>(CreateDatabaseConfigVariableDocument, options);
      }
export type CreateDatabaseConfigVariableMutationHookResult = ReturnType<typeof useCreateDatabaseConfigVariableMutation>;
export type CreateDatabaseConfigVariableMutationResult = Apollo.MutationResult<CreateDatabaseConfigVariableMutation>;
export type CreateDatabaseConfigVariableMutationOptions = Apollo.BaseMutationOptions<CreateDatabaseConfigVariableMutation, CreateDatabaseConfigVariableMutationVariables>;
export const DeleteDatabaseConfigVariableDocument = gql`
    mutation DeleteDatabaseConfigVariable($key: String!) {
  deleteDatabaseConfigVariable(key: $key)
}
    `;
export type DeleteDatabaseConfigVariableMutationFn = Apollo.MutationFunction<DeleteDatabaseConfigVariableMutation, DeleteDatabaseConfigVariableMutationVariables>;

/**
 * __useDeleteDatabaseConfigVariableMutation__
 *
 * To run a mutation, you first call `useDeleteDatabaseConfigVariableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDatabaseConfigVariableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDatabaseConfigVariableMutation, { data, loading, error }] = useDeleteDatabaseConfigVariableMutation({
 *   variables: {
 *      key: // value for 'key'
 *   },
 * });
 */
export function useDeleteDatabaseConfigVariableMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDatabaseConfigVariableMutation, DeleteDatabaseConfigVariableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDatabaseConfigVariableMutation, DeleteDatabaseConfigVariableMutationVariables>(DeleteDatabaseConfigVariableDocument, options);
      }
export type DeleteDatabaseConfigVariableMutationHookResult = ReturnType<typeof useDeleteDatabaseConfigVariableMutation>;
export type DeleteDatabaseConfigVariableMutationResult = Apollo.MutationResult<DeleteDatabaseConfigVariableMutation>;
export type DeleteDatabaseConfigVariableMutationOptions = Apollo.BaseMutationOptions<DeleteDatabaseConfigVariableMutation, DeleteDatabaseConfigVariableMutationVariables>;
export const UpdateDatabaseConfigVariableDocument = gql`
    mutation UpdateDatabaseConfigVariable($key: String!, $value: JSON!) {
  updateDatabaseConfigVariable(key: $key, value: $value)
}
    `;
export type UpdateDatabaseConfigVariableMutationFn = Apollo.MutationFunction<UpdateDatabaseConfigVariableMutation, UpdateDatabaseConfigVariableMutationVariables>;

/**
 * __useUpdateDatabaseConfigVariableMutation__
 *
 * To run a mutation, you first call `useUpdateDatabaseConfigVariableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDatabaseConfigVariableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDatabaseConfigVariableMutation, { data, loading, error }] = useUpdateDatabaseConfigVariableMutation({
 *   variables: {
 *      key: // value for 'key'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useUpdateDatabaseConfigVariableMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDatabaseConfigVariableMutation, UpdateDatabaseConfigVariableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDatabaseConfigVariableMutation, UpdateDatabaseConfigVariableMutationVariables>(UpdateDatabaseConfigVariableDocument, options);
      }
export type UpdateDatabaseConfigVariableMutationHookResult = ReturnType<typeof useUpdateDatabaseConfigVariableMutation>;
export type UpdateDatabaseConfigVariableMutationResult = Apollo.MutationResult<UpdateDatabaseConfigVariableMutation>;
export type UpdateDatabaseConfigVariableMutationOptions = Apollo.BaseMutationOptions<UpdateDatabaseConfigVariableMutation, UpdateDatabaseConfigVariableMutationVariables>;
export const GetConfigVariablesGroupedDocument = gql`
    query GetConfigVariablesGrouped {
  getConfigVariablesGrouped {
    groups {
      name
      description
      isHiddenOnLoad
      variables {
        name
        description
        value
        isSensitive
        isEnvOnly
        type
        options
        source
      }
    }
  }
}
    `;

/**
 * __useGetConfigVariablesGroupedQuery__
 *
 * To run a query within a React component, call `useGetConfigVariablesGroupedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConfigVariablesGroupedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConfigVariablesGroupedQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetConfigVariablesGroupedQuery(baseOptions?: Apollo.QueryHookOptions<GetConfigVariablesGroupedQuery, GetConfigVariablesGroupedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetConfigVariablesGroupedQuery, GetConfigVariablesGroupedQueryVariables>(GetConfigVariablesGroupedDocument, options);
      }
export function useGetConfigVariablesGroupedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConfigVariablesGroupedQuery, GetConfigVariablesGroupedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetConfigVariablesGroupedQuery, GetConfigVariablesGroupedQueryVariables>(GetConfigVariablesGroupedDocument, options);
        }
export type GetConfigVariablesGroupedQueryHookResult = ReturnType<typeof useGetConfigVariablesGroupedQuery>;
export type GetConfigVariablesGroupedLazyQueryHookResult = ReturnType<typeof useGetConfigVariablesGroupedLazyQuery>;
export type GetConfigVariablesGroupedQueryResult = Apollo.QueryResult<GetConfigVariablesGroupedQuery, GetConfigVariablesGroupedQueryVariables>;
export const GetDatabaseConfigVariableDocument = gql`
    query GetDatabaseConfigVariable($key: String!) {
  getDatabaseConfigVariable(key: $key) {
    name
    description
    value
    isSensitive
    isEnvOnly
    type
    options
    source
  }
}
    `;

/**
 * __useGetDatabaseConfigVariableQuery__
 *
 * To run a query within a React component, call `useGetDatabaseConfigVariableQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDatabaseConfigVariableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDatabaseConfigVariableQuery({
 *   variables: {
 *      key: // value for 'key'
 *   },
 * });
 */
export function useGetDatabaseConfigVariableQuery(baseOptions: Apollo.QueryHookOptions<GetDatabaseConfigVariableQuery, GetDatabaseConfigVariableQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDatabaseConfigVariableQuery, GetDatabaseConfigVariableQueryVariables>(GetDatabaseConfigVariableDocument, options);
      }
export function useGetDatabaseConfigVariableLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDatabaseConfigVariableQuery, GetDatabaseConfigVariableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDatabaseConfigVariableQuery, GetDatabaseConfigVariableQueryVariables>(GetDatabaseConfigVariableDocument, options);
        }
export type GetDatabaseConfigVariableQueryHookResult = ReturnType<typeof useGetDatabaseConfigVariableQuery>;
export type GetDatabaseConfigVariableLazyQueryHookResult = ReturnType<typeof useGetDatabaseConfigVariableLazyQuery>;
export type GetDatabaseConfigVariableQueryResult = Apollo.QueryResult<GetDatabaseConfigVariableQuery, GetDatabaseConfigVariableQueryVariables>;
export const UpdateWorkspaceFeatureFlagDocument = gql`
    mutation UpdateWorkspaceFeatureFlag($workspaceId: UUID!, $featureFlag: String!, $value: Boolean!) {
  updateWorkspaceFeatureFlag(
    workspaceId: $workspaceId
    featureFlag: $featureFlag
    value: $value
  )
}
    `;
export type UpdateWorkspaceFeatureFlagMutationFn = Apollo.MutationFunction<UpdateWorkspaceFeatureFlagMutation, UpdateWorkspaceFeatureFlagMutationVariables>;

/**
 * __useUpdateWorkspaceFeatureFlagMutation__
 *
 * To run a mutation, you first call `useUpdateWorkspaceFeatureFlagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkspaceFeatureFlagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkspaceFeatureFlagMutation, { data, loading, error }] = useUpdateWorkspaceFeatureFlagMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      featureFlag: // value for 'featureFlag'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useUpdateWorkspaceFeatureFlagMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkspaceFeatureFlagMutation, UpdateWorkspaceFeatureFlagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkspaceFeatureFlagMutation, UpdateWorkspaceFeatureFlagMutationVariables>(UpdateWorkspaceFeatureFlagDocument, options);
      }
export type UpdateWorkspaceFeatureFlagMutationHookResult = ReturnType<typeof useUpdateWorkspaceFeatureFlagMutation>;
export type UpdateWorkspaceFeatureFlagMutationResult = Apollo.MutationResult<UpdateWorkspaceFeatureFlagMutation>;
export type UpdateWorkspaceFeatureFlagMutationOptions = Apollo.BaseMutationOptions<UpdateWorkspaceFeatureFlagMutation, UpdateWorkspaceFeatureFlagMutationVariables>;
export const UserLookupAdminPanelDocument = gql`
    mutation UserLookupAdminPanel($userIdentifier: String!) {
  userLookupAdminPanel(userIdentifier: $userIdentifier) {
    user {
      id
      email
      firstName
      lastName
    }
    workspaces {
      id
      name
      logo
      totalUsers
      allowImpersonation
      workspaceUrls {
        customUrl
        subdomainUrl
      }
      users {
        id
        email
        firstName
        lastName
      }
      featureFlags {
        key
        value
      }
    }
  }
}
    `;
export type UserLookupAdminPanelMutationFn = Apollo.MutationFunction<UserLookupAdminPanelMutation, UserLookupAdminPanelMutationVariables>;

/**
 * __useUserLookupAdminPanelMutation__
 *
 * To run a mutation, you first call `useUserLookupAdminPanelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserLookupAdminPanelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userLookupAdminPanelMutation, { data, loading, error }] = useUserLookupAdminPanelMutation({
 *   variables: {
 *      userIdentifier: // value for 'userIdentifier'
 *   },
 * });
 */
export function useUserLookupAdminPanelMutation(baseOptions?: Apollo.MutationHookOptions<UserLookupAdminPanelMutation, UserLookupAdminPanelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UserLookupAdminPanelMutation, UserLookupAdminPanelMutationVariables>(UserLookupAdminPanelDocument, options);
      }
export type UserLookupAdminPanelMutationHookResult = ReturnType<typeof useUserLookupAdminPanelMutation>;
export type UserLookupAdminPanelMutationResult = Apollo.MutationResult<UserLookupAdminPanelMutation>;
export type UserLookupAdminPanelMutationOptions = Apollo.BaseMutationOptions<UserLookupAdminPanelMutation, UserLookupAdminPanelMutationVariables>;
export const GetVersionInfoDocument = gql`
    query GetVersionInfo {
  versionInfo {
    currentVersion
    latestVersion
  }
}
    `;

/**
 * __useGetVersionInfoQuery__
 *
 * To run a query within a React component, call `useGetVersionInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVersionInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVersionInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetVersionInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetVersionInfoQuery, GetVersionInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVersionInfoQuery, GetVersionInfoQueryVariables>(GetVersionInfoDocument, options);
      }
export function useGetVersionInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVersionInfoQuery, GetVersionInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVersionInfoQuery, GetVersionInfoQueryVariables>(GetVersionInfoDocument, options);
        }
export type GetVersionInfoQueryHookResult = ReturnType<typeof useGetVersionInfoQuery>;
export type GetVersionInfoLazyQueryHookResult = ReturnType<typeof useGetVersionInfoLazyQuery>;
export type GetVersionInfoQueryResult = Apollo.QueryResult<GetVersionInfoQuery, GetVersionInfoQueryVariables>;
export const DeleteJobsDocument = gql`
    mutation DeleteJobs($queueName: String!, $jobIds: [String!]!) {
  deleteJobs(queueName: $queueName, jobIds: $jobIds) {
    deletedCount
    results {
      jobId
      success
      error
    }
  }
}
    `;
export type DeleteJobsMutationFn = Apollo.MutationFunction<DeleteJobsMutation, DeleteJobsMutationVariables>;

/**
 * __useDeleteJobsMutation__
 *
 * To run a mutation, you first call `useDeleteJobsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJobsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJobsMutation, { data, loading, error }] = useDeleteJobsMutation({
 *   variables: {
 *      queueName: // value for 'queueName'
 *      jobIds: // value for 'jobIds'
 *   },
 * });
 */
export function useDeleteJobsMutation(baseOptions?: Apollo.MutationHookOptions<DeleteJobsMutation, DeleteJobsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteJobsMutation, DeleteJobsMutationVariables>(DeleteJobsDocument, options);
      }
export type DeleteJobsMutationHookResult = ReturnType<typeof useDeleteJobsMutation>;
export type DeleteJobsMutationResult = Apollo.MutationResult<DeleteJobsMutation>;
export type DeleteJobsMutationOptions = Apollo.BaseMutationOptions<DeleteJobsMutation, DeleteJobsMutationVariables>;
export const RetryJobsDocument = gql`
    mutation RetryJobs($queueName: String!, $jobIds: [String!]!) {
  retryJobs(queueName: $queueName, jobIds: $jobIds) {
    retriedCount
    results {
      jobId
      success
      error
    }
  }
}
    `;
export type RetryJobsMutationFn = Apollo.MutationFunction<RetryJobsMutation, RetryJobsMutationVariables>;

/**
 * __useRetryJobsMutation__
 *
 * To run a mutation, you first call `useRetryJobsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRetryJobsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [retryJobsMutation, { data, loading, error }] = useRetryJobsMutation({
 *   variables: {
 *      queueName: // value for 'queueName'
 *      jobIds: // value for 'jobIds'
 *   },
 * });
 */
export function useRetryJobsMutation(baseOptions?: Apollo.MutationHookOptions<RetryJobsMutation, RetryJobsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RetryJobsMutation, RetryJobsMutationVariables>(RetryJobsDocument, options);
      }
export type RetryJobsMutationHookResult = ReturnType<typeof useRetryJobsMutation>;
export type RetryJobsMutationResult = Apollo.MutationResult<RetryJobsMutation>;
export type RetryJobsMutationOptions = Apollo.BaseMutationOptions<RetryJobsMutation, RetryJobsMutationVariables>;
export const GetIndicatorHealthStatusDocument = gql`
    query GetIndicatorHealthStatus($indicatorId: HealthIndicatorId!) {
  getIndicatorHealthStatus(indicatorId: $indicatorId) {
    id
    label
    description
    status
    errorMessage
    details
    queues {
      id
      queueName
      status
    }
  }
}
    `;

/**
 * __useGetIndicatorHealthStatusQuery__
 *
 * To run a query within a React component, call `useGetIndicatorHealthStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetIndicatorHealthStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetIndicatorHealthStatusQuery({
 *   variables: {
 *      indicatorId: // value for 'indicatorId'
 *   },
 * });
 */
export function useGetIndicatorHealthStatusQuery(baseOptions: Apollo.QueryHookOptions<GetIndicatorHealthStatusQuery, GetIndicatorHealthStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetIndicatorHealthStatusQuery, GetIndicatorHealthStatusQueryVariables>(GetIndicatorHealthStatusDocument, options);
      }
export function useGetIndicatorHealthStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetIndicatorHealthStatusQuery, GetIndicatorHealthStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetIndicatorHealthStatusQuery, GetIndicatorHealthStatusQueryVariables>(GetIndicatorHealthStatusDocument, options);
        }
export type GetIndicatorHealthStatusQueryHookResult = ReturnType<typeof useGetIndicatorHealthStatusQuery>;
export type GetIndicatorHealthStatusLazyQueryHookResult = ReturnType<typeof useGetIndicatorHealthStatusLazyQuery>;
export type GetIndicatorHealthStatusQueryResult = Apollo.QueryResult<GetIndicatorHealthStatusQuery, GetIndicatorHealthStatusQueryVariables>;
export const GetQueueJobsDocument = gql`
    query GetQueueJobs($queueName: String!, $state: JobState!, $limit: Int, $offset: Int) {
  getQueueJobs(
    queueName: $queueName
    state: $state
    limit: $limit
    offset: $offset
  ) {
    jobs {
      id
      name
      data
      state
      timestamp
      failedReason
      processedOn
      finishedOn
      attemptsMade
      returnValue
      logs
      stackTrace
    }
    count
    totalCount
    hasMore
    retentionConfig {
      completedMaxAge
      completedMaxCount
      failedMaxAge
      failedMaxCount
    }
  }
}
    `;

/**
 * __useGetQueueJobsQuery__
 *
 * To run a query within a React component, call `useGetQueueJobsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQueueJobsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQueueJobsQuery({
 *   variables: {
 *      queueName: // value for 'queueName'
 *      state: // value for 'state'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetQueueJobsQuery(baseOptions: Apollo.QueryHookOptions<GetQueueJobsQuery, GetQueueJobsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetQueueJobsQuery, GetQueueJobsQueryVariables>(GetQueueJobsDocument, options);
      }
export function useGetQueueJobsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetQueueJobsQuery, GetQueueJobsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetQueueJobsQuery, GetQueueJobsQueryVariables>(GetQueueJobsDocument, options);
        }
export type GetQueueJobsQueryHookResult = ReturnType<typeof useGetQueueJobsQuery>;
export type GetQueueJobsLazyQueryHookResult = ReturnType<typeof useGetQueueJobsLazyQuery>;
export type GetQueueJobsQueryResult = Apollo.QueryResult<GetQueueJobsQuery, GetQueueJobsQueryVariables>;
export const GetQueueMetricsDocument = gql`
    query GetQueueMetrics($queueName: String!, $timeRange: QueueMetricsTimeRange) {
  getQueueMetrics(queueName: $queueName, timeRange: $timeRange) {
    queueName
    timeRange
    workers
    details {
      failed
      completed
      waiting
      active
      delayed
      failureRate
    }
    data {
      id
      data {
        x
        y
      }
    }
  }
}
    `;

/**
 * __useGetQueueMetricsQuery__
 *
 * To run a query within a React component, call `useGetQueueMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQueueMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQueueMetricsQuery({
 *   variables: {
 *      queueName: // value for 'queueName'
 *      timeRange: // value for 'timeRange'
 *   },
 * });
 */
export function useGetQueueMetricsQuery(baseOptions: Apollo.QueryHookOptions<GetQueueMetricsQuery, GetQueueMetricsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetQueueMetricsQuery, GetQueueMetricsQueryVariables>(GetQueueMetricsDocument, options);
      }
export function useGetQueueMetricsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetQueueMetricsQuery, GetQueueMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetQueueMetricsQuery, GetQueueMetricsQueryVariables>(GetQueueMetricsDocument, options);
        }
export type GetQueueMetricsQueryHookResult = ReturnType<typeof useGetQueueMetricsQuery>;
export type GetQueueMetricsLazyQueryHookResult = ReturnType<typeof useGetQueueMetricsLazyQuery>;
export type GetQueueMetricsQueryResult = Apollo.QueryResult<GetQueueMetricsQuery, GetQueueMetricsQueryVariables>;
export const GetSystemHealthStatusDocument = gql`
    query GetSystemHealthStatus {
  getSystemHealthStatus {
    services {
      id
      label
      status
    }
  }
}
    `;

/**
 * __useGetSystemHealthStatusQuery__
 *
 * To run a query within a React component, call `useGetSystemHealthStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSystemHealthStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSystemHealthStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSystemHealthStatusQuery(baseOptions?: Apollo.QueryHookOptions<GetSystemHealthStatusQuery, GetSystemHealthStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSystemHealthStatusQuery, GetSystemHealthStatusQueryVariables>(GetSystemHealthStatusDocument, options);
      }
export function useGetSystemHealthStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSystemHealthStatusQuery, GetSystemHealthStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSystemHealthStatusQuery, GetSystemHealthStatusQueryVariables>(GetSystemHealthStatusDocument, options);
        }
export type GetSystemHealthStatusQueryHookResult = ReturnType<typeof useGetSystemHealthStatusQuery>;
export type GetSystemHealthStatusLazyQueryHookResult = ReturnType<typeof useGetSystemHealthStatusLazyQuery>;
export type GetSystemHealthStatusQueryResult = Apollo.QueryResult<GetSystemHealthStatusQuery, GetSystemHealthStatusQueryVariables>;
export const UninstallApplicationDocument = gql`
    mutation UninstallApplication($universalIdentifier: String!) {
  uninstallApplication(universalIdentifier: $universalIdentifier)
}
    `;
export type UninstallApplicationMutationFn = Apollo.MutationFunction<UninstallApplicationMutation, UninstallApplicationMutationVariables>;

/**
 * __useUninstallApplicationMutation__
 *
 * To run a mutation, you first call `useUninstallApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUninstallApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uninstallApplicationMutation, { data, loading, error }] = useUninstallApplicationMutation({
 *   variables: {
 *      universalIdentifier: // value for 'universalIdentifier'
 *   },
 * });
 */
export function useUninstallApplicationMutation(baseOptions?: Apollo.MutationHookOptions<UninstallApplicationMutation, UninstallApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UninstallApplicationMutation, UninstallApplicationMutationVariables>(UninstallApplicationDocument, options);
      }
export type UninstallApplicationMutationHookResult = ReturnType<typeof useUninstallApplicationMutation>;
export type UninstallApplicationMutationResult = Apollo.MutationResult<UninstallApplicationMutation>;
export type UninstallApplicationMutationOptions = Apollo.BaseMutationOptions<UninstallApplicationMutation, UninstallApplicationMutationVariables>;
export const AssignRoleToApiKeyDocument = gql`
    mutation AssignRoleToApiKey($apiKeyId: UUID!, $roleId: UUID!) {
  assignRoleToApiKey(apiKeyId: $apiKeyId, roleId: $roleId)
}
    `;
export type AssignRoleToApiKeyMutationFn = Apollo.MutationFunction<AssignRoleToApiKeyMutation, AssignRoleToApiKeyMutationVariables>;

/**
 * __useAssignRoleToApiKeyMutation__
 *
 * To run a mutation, you first call `useAssignRoleToApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignRoleToApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignRoleToApiKeyMutation, { data, loading, error }] = useAssignRoleToApiKeyMutation({
 *   variables: {
 *      apiKeyId: // value for 'apiKeyId'
 *      roleId: // value for 'roleId'
 *   },
 * });
 */
export function useAssignRoleToApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<AssignRoleToApiKeyMutation, AssignRoleToApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignRoleToApiKeyMutation, AssignRoleToApiKeyMutationVariables>(AssignRoleToApiKeyDocument, options);
      }
export type AssignRoleToApiKeyMutationHookResult = ReturnType<typeof useAssignRoleToApiKeyMutation>;
export type AssignRoleToApiKeyMutationResult = Apollo.MutationResult<AssignRoleToApiKeyMutation>;
export type AssignRoleToApiKeyMutationOptions = Apollo.BaseMutationOptions<AssignRoleToApiKeyMutation, AssignRoleToApiKeyMutationVariables>;
export const CreateApiKeyDocument = gql`
    mutation CreateApiKey($input: CreateApiKeyInput!) {
  createApiKey(input: $input) {
    ...ApiKeyFragment
  }
}
    ${ApiKeyFragmentFragmentDoc}`;
export type CreateApiKeyMutationFn = Apollo.MutationFunction<CreateApiKeyMutation, CreateApiKeyMutationVariables>;

/**
 * __useCreateApiKeyMutation__
 *
 * To run a mutation, you first call `useCreateApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApiKeyMutation, { data, loading, error }] = useCreateApiKeyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<CreateApiKeyMutation, CreateApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateApiKeyMutation, CreateApiKeyMutationVariables>(CreateApiKeyDocument, options);
      }
export type CreateApiKeyMutationHookResult = ReturnType<typeof useCreateApiKeyMutation>;
export type CreateApiKeyMutationResult = Apollo.MutationResult<CreateApiKeyMutation>;
export type CreateApiKeyMutationOptions = Apollo.BaseMutationOptions<CreateApiKeyMutation, CreateApiKeyMutationVariables>;
export const CreateWebhookDocument = gql`
    mutation CreateWebhook($input: CreateWebhookInput!) {
  createWebhook(input: $input) {
    ...WebhookFragment
  }
}
    ${WebhookFragmentFragmentDoc}`;
export type CreateWebhookMutationFn = Apollo.MutationFunction<CreateWebhookMutation, CreateWebhookMutationVariables>;

/**
 * __useCreateWebhookMutation__
 *
 * To run a mutation, you first call `useCreateWebhookMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWebhookMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWebhookMutation, { data, loading, error }] = useCreateWebhookMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWebhookMutation(baseOptions?: Apollo.MutationHookOptions<CreateWebhookMutation, CreateWebhookMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWebhookMutation, CreateWebhookMutationVariables>(CreateWebhookDocument, options);
      }
export type CreateWebhookMutationHookResult = ReturnType<typeof useCreateWebhookMutation>;
export type CreateWebhookMutationResult = Apollo.MutationResult<CreateWebhookMutation>;
export type CreateWebhookMutationOptions = Apollo.BaseMutationOptions<CreateWebhookMutation, CreateWebhookMutationVariables>;
export const DeleteWebhookDocument = gql`
    mutation DeleteWebhook($input: DeleteWebhookInput!) {
  deleteWebhook(input: $input)
}
    `;
export type DeleteWebhookMutationFn = Apollo.MutationFunction<DeleteWebhookMutation, DeleteWebhookMutationVariables>;

/**
 * __useDeleteWebhookMutation__
 *
 * To run a mutation, you first call `useDeleteWebhookMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWebhookMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWebhookMutation, { data, loading, error }] = useDeleteWebhookMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteWebhookMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWebhookMutation, DeleteWebhookMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWebhookMutation, DeleteWebhookMutationVariables>(DeleteWebhookDocument, options);
      }
export type DeleteWebhookMutationHookResult = ReturnType<typeof useDeleteWebhookMutation>;
export type DeleteWebhookMutationResult = Apollo.MutationResult<DeleteWebhookMutation>;
export type DeleteWebhookMutationOptions = Apollo.BaseMutationOptions<DeleteWebhookMutation, DeleteWebhookMutationVariables>;
export const RevokeApiKeyDocument = gql`
    mutation RevokeApiKey($input: RevokeApiKeyInput!) {
  revokeApiKey(input: $input) {
    id
  }
}
    `;
export type RevokeApiKeyMutationFn = Apollo.MutationFunction<RevokeApiKeyMutation, RevokeApiKeyMutationVariables>;

/**
 * __useRevokeApiKeyMutation__
 *
 * To run a mutation, you first call `useRevokeApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeApiKeyMutation, { data, loading, error }] = useRevokeApiKeyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRevokeApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<RevokeApiKeyMutation, RevokeApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevokeApiKeyMutation, RevokeApiKeyMutationVariables>(RevokeApiKeyDocument, options);
      }
export type RevokeApiKeyMutationHookResult = ReturnType<typeof useRevokeApiKeyMutation>;
export type RevokeApiKeyMutationResult = Apollo.MutationResult<RevokeApiKeyMutation>;
export type RevokeApiKeyMutationOptions = Apollo.BaseMutationOptions<RevokeApiKeyMutation, RevokeApiKeyMutationVariables>;
export const UpdateApiKeyDocument = gql`
    mutation UpdateApiKey($input: UpdateApiKeyInput!) {
  updateApiKey(input: $input) {
    ...ApiKeyFragment
  }
}
    ${ApiKeyFragmentFragmentDoc}`;
export type UpdateApiKeyMutationFn = Apollo.MutationFunction<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>;

/**
 * __useUpdateApiKeyMutation__
 *
 * To run a mutation, you first call `useUpdateApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateApiKeyMutation, { data, loading, error }] = useUpdateApiKeyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>(UpdateApiKeyDocument, options);
      }
export type UpdateApiKeyMutationHookResult = ReturnType<typeof useUpdateApiKeyMutation>;
export type UpdateApiKeyMutationResult = Apollo.MutationResult<UpdateApiKeyMutation>;
export type UpdateApiKeyMutationOptions = Apollo.BaseMutationOptions<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>;
export const UpdateWebhookDocument = gql`
    mutation UpdateWebhook($input: UpdateWebhookInput!) {
  updateWebhook(input: $input) {
    ...WebhookFragment
  }
}
    ${WebhookFragmentFragmentDoc}`;
export type UpdateWebhookMutationFn = Apollo.MutationFunction<UpdateWebhookMutation, UpdateWebhookMutationVariables>;

/**
 * __useUpdateWebhookMutation__
 *
 * To run a mutation, you first call `useUpdateWebhookMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWebhookMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWebhookMutation, { data, loading, error }] = useUpdateWebhookMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWebhookMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWebhookMutation, UpdateWebhookMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWebhookMutation, UpdateWebhookMutationVariables>(UpdateWebhookDocument, options);
      }
export type UpdateWebhookMutationHookResult = ReturnType<typeof useUpdateWebhookMutation>;
export type UpdateWebhookMutationResult = Apollo.MutationResult<UpdateWebhookMutation>;
export type UpdateWebhookMutationOptions = Apollo.BaseMutationOptions<UpdateWebhookMutation, UpdateWebhookMutationVariables>;
export const GetApiKeyDocument = gql`
    query GetApiKey($input: GetApiKeyInput!) {
  apiKey(input: $input) {
    ...ApiKeyFragment
    createdAt
  }
}
    ${ApiKeyFragmentFragmentDoc}`;

/**
 * __useGetApiKeyQuery__
 *
 * To run a query within a React component, call `useGetApiKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApiKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApiKeyQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetApiKeyQuery(baseOptions: Apollo.QueryHookOptions<GetApiKeyQuery, GetApiKeyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApiKeyQuery, GetApiKeyQueryVariables>(GetApiKeyDocument, options);
      }
export function useGetApiKeyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApiKeyQuery, GetApiKeyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApiKeyQuery, GetApiKeyQueryVariables>(GetApiKeyDocument, options);
        }
export type GetApiKeyQueryHookResult = ReturnType<typeof useGetApiKeyQuery>;
export type GetApiKeyLazyQueryHookResult = ReturnType<typeof useGetApiKeyLazyQuery>;
export type GetApiKeyQueryResult = Apollo.QueryResult<GetApiKeyQuery, GetApiKeyQueryVariables>;
export const GetApiKeysDocument = gql`
    query GetApiKeys {
  apiKeys {
    ...ApiKeyFragment
  }
}
    ${ApiKeyFragmentFragmentDoc}`;

/**
 * __useGetApiKeysQuery__
 *
 * To run a query within a React component, call `useGetApiKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApiKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApiKeysQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetApiKeysQuery(baseOptions?: Apollo.QueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApiKeysQuery, GetApiKeysQueryVariables>(GetApiKeysDocument, options);
      }
export function useGetApiKeysLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApiKeysQuery, GetApiKeysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApiKeysQuery, GetApiKeysQueryVariables>(GetApiKeysDocument, options);
        }
export type GetApiKeysQueryHookResult = ReturnType<typeof useGetApiKeysQuery>;
export type GetApiKeysLazyQueryHookResult = ReturnType<typeof useGetApiKeysLazyQuery>;
export type GetApiKeysQueryResult = Apollo.QueryResult<GetApiKeysQuery, GetApiKeysQueryVariables>;
export const GetWebhookDocument = gql`
    query GetWebhook($input: GetWebhookInput!) {
  webhook(input: $input) {
    ...WebhookFragment
  }
}
    ${WebhookFragmentFragmentDoc}`;

/**
 * __useGetWebhookQuery__
 *
 * To run a query within a React component, call `useGetWebhookQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWebhookQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWebhookQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetWebhookQuery(baseOptions: Apollo.QueryHookOptions<GetWebhookQuery, GetWebhookQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWebhookQuery, GetWebhookQueryVariables>(GetWebhookDocument, options);
      }
export function useGetWebhookLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWebhookQuery, GetWebhookQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWebhookQuery, GetWebhookQueryVariables>(GetWebhookDocument, options);
        }
export type GetWebhookQueryHookResult = ReturnType<typeof useGetWebhookQuery>;
export type GetWebhookLazyQueryHookResult = ReturnType<typeof useGetWebhookLazyQuery>;
export type GetWebhookQueryResult = Apollo.QueryResult<GetWebhookQuery, GetWebhookQueryVariables>;
export const GetWebhooksDocument = gql`
    query GetWebhooks {
  webhooks {
    ...WebhookFragment
  }
}
    ${WebhookFragmentFragmentDoc}`;

/**
 * __useGetWebhooksQuery__
 *
 * To run a query within a React component, call `useGetWebhooksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWebhooksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWebhooksQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWebhooksQuery(baseOptions?: Apollo.QueryHookOptions<GetWebhooksQuery, GetWebhooksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWebhooksQuery, GetWebhooksQueryVariables>(GetWebhooksDocument, options);
      }
export function useGetWebhooksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWebhooksQuery, GetWebhooksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWebhooksQuery, GetWebhooksQueryVariables>(GetWebhooksDocument, options);
        }
export type GetWebhooksQueryHookResult = ReturnType<typeof useGetWebhooksQuery>;
export type GetWebhooksLazyQueryHookResult = ReturnType<typeof useGetWebhooksLazyQuery>;
export type GetWebhooksQueryResult = Apollo.QueryResult<GetWebhooksQuery, GetWebhooksQueryVariables>;
export const CheckPublicDomainValidRecordsDocument = gql`
    mutation CheckPublicDomainValidRecords($domain: String!) {
  checkPublicDomainValidRecords(domain: $domain) {
    id
    domain
    records {
      type
      key
      value
      validationType
      status
    }
  }
}
    `;
export type CheckPublicDomainValidRecordsMutationFn = Apollo.MutationFunction<CheckPublicDomainValidRecordsMutation, CheckPublicDomainValidRecordsMutationVariables>;

/**
 * __useCheckPublicDomainValidRecordsMutation__
 *
 * To run a mutation, you first call `useCheckPublicDomainValidRecordsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckPublicDomainValidRecordsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkPublicDomainValidRecordsMutation, { data, loading, error }] = useCheckPublicDomainValidRecordsMutation({
 *   variables: {
 *      domain: // value for 'domain'
 *   },
 * });
 */
export function useCheckPublicDomainValidRecordsMutation(baseOptions?: Apollo.MutationHookOptions<CheckPublicDomainValidRecordsMutation, CheckPublicDomainValidRecordsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckPublicDomainValidRecordsMutation, CheckPublicDomainValidRecordsMutationVariables>(CheckPublicDomainValidRecordsDocument, options);
      }
export type CheckPublicDomainValidRecordsMutationHookResult = ReturnType<typeof useCheckPublicDomainValidRecordsMutation>;
export type CheckPublicDomainValidRecordsMutationResult = Apollo.MutationResult<CheckPublicDomainValidRecordsMutation>;
export type CheckPublicDomainValidRecordsMutationOptions = Apollo.BaseMutationOptions<CheckPublicDomainValidRecordsMutation, CheckPublicDomainValidRecordsMutationVariables>;
export const CreatePublicDomainDocument = gql`
    mutation CreatePublicDomain($domain: String!) {
  createPublicDomain(domain: $domain) {
    id
    domain
    isValidated
    createdAt
  }
}
    `;
export type CreatePublicDomainMutationFn = Apollo.MutationFunction<CreatePublicDomainMutation, CreatePublicDomainMutationVariables>;

/**
 * __useCreatePublicDomainMutation__
 *
 * To run a mutation, you first call `useCreatePublicDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePublicDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPublicDomainMutation, { data, loading, error }] = useCreatePublicDomainMutation({
 *   variables: {
 *      domain: // value for 'domain'
 *   },
 * });
 */
export function useCreatePublicDomainMutation(baseOptions?: Apollo.MutationHookOptions<CreatePublicDomainMutation, CreatePublicDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePublicDomainMutation, CreatePublicDomainMutationVariables>(CreatePublicDomainDocument, options);
      }
export type CreatePublicDomainMutationHookResult = ReturnType<typeof useCreatePublicDomainMutation>;
export type CreatePublicDomainMutationResult = Apollo.MutationResult<CreatePublicDomainMutation>;
export type CreatePublicDomainMutationOptions = Apollo.BaseMutationOptions<CreatePublicDomainMutation, CreatePublicDomainMutationVariables>;
export const DeletePublicDomainDocument = gql`
    mutation DeletePublicDomain($domain: String!) {
  deletePublicDomain(domain: $domain)
}
    `;
export type DeletePublicDomainMutationFn = Apollo.MutationFunction<DeletePublicDomainMutation, DeletePublicDomainMutationVariables>;

/**
 * __useDeletePublicDomainMutation__
 *
 * To run a mutation, you first call `useDeletePublicDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePublicDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePublicDomainMutation, { data, loading, error }] = useDeletePublicDomainMutation({
 *   variables: {
 *      domain: // value for 'domain'
 *   },
 * });
 */
export function useDeletePublicDomainMutation(baseOptions?: Apollo.MutationHookOptions<DeletePublicDomainMutation, DeletePublicDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePublicDomainMutation, DeletePublicDomainMutationVariables>(DeletePublicDomainDocument, options);
      }
export type DeletePublicDomainMutationHookResult = ReturnType<typeof useDeletePublicDomainMutation>;
export type DeletePublicDomainMutationResult = Apollo.MutationResult<DeletePublicDomainMutation>;
export type DeletePublicDomainMutationOptions = Apollo.BaseMutationOptions<DeletePublicDomainMutation, DeletePublicDomainMutationVariables>;
export const FindManyPublicDomainsDocument = gql`
    query FindManyPublicDomains {
  findManyPublicDomains {
    id
    domain
    isValidated
    createdAt
  }
}
    `;

/**
 * __useFindManyPublicDomainsQuery__
 *
 * To run a query within a React component, call `useFindManyPublicDomainsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyPublicDomainsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyPublicDomainsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindManyPublicDomainsQuery(baseOptions?: Apollo.QueryHookOptions<FindManyPublicDomainsQuery, FindManyPublicDomainsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyPublicDomainsQuery, FindManyPublicDomainsQueryVariables>(FindManyPublicDomainsDocument, options);
      }
export function useFindManyPublicDomainsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyPublicDomainsQuery, FindManyPublicDomainsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyPublicDomainsQuery, FindManyPublicDomainsQueryVariables>(FindManyPublicDomainsDocument, options);
        }
export type FindManyPublicDomainsQueryHookResult = ReturnType<typeof useFindManyPublicDomainsQuery>;
export type FindManyPublicDomainsLazyQueryHookResult = ReturnType<typeof useFindManyPublicDomainsLazyQuery>;
export type FindManyPublicDomainsQueryResult = Apollo.QueryResult<FindManyPublicDomainsQuery, FindManyPublicDomainsQueryVariables>;
export const CreateEmailingDomainDocument = gql`
    mutation CreateEmailingDomain($domain: String!, $driver: EmailingDomainDriver!) {
  createEmailingDomain(domain: $domain, driver: $driver) {
    id
    domain
    driver
    status
    verifiedAt
    verificationRecords {
      type
      key
      value
      priority
    }
    createdAt
    updatedAt
  }
}
    `;
export type CreateEmailingDomainMutationFn = Apollo.MutationFunction<CreateEmailingDomainMutation, CreateEmailingDomainMutationVariables>;

/**
 * __useCreateEmailingDomainMutation__
 *
 * To run a mutation, you first call `useCreateEmailingDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEmailingDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEmailingDomainMutation, { data, loading, error }] = useCreateEmailingDomainMutation({
 *   variables: {
 *      domain: // value for 'domain'
 *      driver: // value for 'driver'
 *   },
 * });
 */
export function useCreateEmailingDomainMutation(baseOptions?: Apollo.MutationHookOptions<CreateEmailingDomainMutation, CreateEmailingDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateEmailingDomainMutation, CreateEmailingDomainMutationVariables>(CreateEmailingDomainDocument, options);
      }
export type CreateEmailingDomainMutationHookResult = ReturnType<typeof useCreateEmailingDomainMutation>;
export type CreateEmailingDomainMutationResult = Apollo.MutationResult<CreateEmailingDomainMutation>;
export type CreateEmailingDomainMutationOptions = Apollo.BaseMutationOptions<CreateEmailingDomainMutation, CreateEmailingDomainMutationVariables>;
export const DeleteEmailingDomainDocument = gql`
    mutation DeleteEmailingDomain($id: String!) {
  deleteEmailingDomain(id: $id)
}
    `;
export type DeleteEmailingDomainMutationFn = Apollo.MutationFunction<DeleteEmailingDomainMutation, DeleteEmailingDomainMutationVariables>;

/**
 * __useDeleteEmailingDomainMutation__
 *
 * To run a mutation, you first call `useDeleteEmailingDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEmailingDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEmailingDomainMutation, { data, loading, error }] = useDeleteEmailingDomainMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteEmailingDomainMutation(baseOptions?: Apollo.MutationHookOptions<DeleteEmailingDomainMutation, DeleteEmailingDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteEmailingDomainMutation, DeleteEmailingDomainMutationVariables>(DeleteEmailingDomainDocument, options);
      }
export type DeleteEmailingDomainMutationHookResult = ReturnType<typeof useDeleteEmailingDomainMutation>;
export type DeleteEmailingDomainMutationResult = Apollo.MutationResult<DeleteEmailingDomainMutation>;
export type DeleteEmailingDomainMutationOptions = Apollo.BaseMutationOptions<DeleteEmailingDomainMutation, DeleteEmailingDomainMutationVariables>;
export const VerifyEmailingDomainDocument = gql`
    mutation VerifyEmailingDomain($id: String!) {
  verifyEmailingDomain(id: $id) {
    id
    domain
    driver
    status
    verifiedAt
    createdAt
    updatedAt
  }
}
    `;
export type VerifyEmailingDomainMutationFn = Apollo.MutationFunction<VerifyEmailingDomainMutation, VerifyEmailingDomainMutationVariables>;

/**
 * __useVerifyEmailingDomainMutation__
 *
 * To run a mutation, you first call `useVerifyEmailingDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyEmailingDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyEmailingDomainMutation, { data, loading, error }] = useVerifyEmailingDomainMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVerifyEmailingDomainMutation(baseOptions?: Apollo.MutationHookOptions<VerifyEmailingDomainMutation, VerifyEmailingDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyEmailingDomainMutation, VerifyEmailingDomainMutationVariables>(VerifyEmailingDomainDocument, options);
      }
export type VerifyEmailingDomainMutationHookResult = ReturnType<typeof useVerifyEmailingDomainMutation>;
export type VerifyEmailingDomainMutationResult = Apollo.MutationResult<VerifyEmailingDomainMutation>;
export type VerifyEmailingDomainMutationOptions = Apollo.BaseMutationOptions<VerifyEmailingDomainMutation, VerifyEmailingDomainMutationVariables>;
export const GetEmailingDomainsDocument = gql`
    query GetEmailingDomains {
  getEmailingDomains {
    id
    domain
    driver
    status
    verifiedAt
    verificationRecords {
      type
      key
      value
      priority
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetEmailingDomainsQuery__
 *
 * To run a query within a React component, call `useGetEmailingDomainsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailingDomainsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailingDomainsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetEmailingDomainsQuery(baseOptions?: Apollo.QueryHookOptions<GetEmailingDomainsQuery, GetEmailingDomainsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEmailingDomainsQuery, GetEmailingDomainsQueryVariables>(GetEmailingDomainsDocument, options);
      }
export function useGetEmailingDomainsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEmailingDomainsQuery, GetEmailingDomainsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEmailingDomainsQuery, GetEmailingDomainsQueryVariables>(GetEmailingDomainsDocument, options);
        }
export type GetEmailingDomainsQueryHookResult = ReturnType<typeof useGetEmailingDomainsQuery>;
export type GetEmailingDomainsLazyQueryHookResult = ReturnType<typeof useGetEmailingDomainsLazyQuery>;
export type GetEmailingDomainsQueryResult = Apollo.QueryResult<GetEmailingDomainsQuery, GetEmailingDomainsQueryVariables>;
export const UpdateLabPublicFeatureFlagDocument = gql`
    mutation UpdateLabPublicFeatureFlag($input: UpdateLabPublicFeatureFlagInput!) {
  updateLabPublicFeatureFlag(input: $input) {
    key
    value
  }
}
    `;
export type UpdateLabPublicFeatureFlagMutationFn = Apollo.MutationFunction<UpdateLabPublicFeatureFlagMutation, UpdateLabPublicFeatureFlagMutationVariables>;

/**
 * __useUpdateLabPublicFeatureFlagMutation__
 *
 * To run a mutation, you first call `useUpdateLabPublicFeatureFlagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLabPublicFeatureFlagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLabPublicFeatureFlagMutation, { data, loading, error }] = useUpdateLabPublicFeatureFlagMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateLabPublicFeatureFlagMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLabPublicFeatureFlagMutation, UpdateLabPublicFeatureFlagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateLabPublicFeatureFlagMutation, UpdateLabPublicFeatureFlagMutationVariables>(UpdateLabPublicFeatureFlagDocument, options);
      }
export type UpdateLabPublicFeatureFlagMutationHookResult = ReturnType<typeof useUpdateLabPublicFeatureFlagMutation>;
export type UpdateLabPublicFeatureFlagMutationResult = Apollo.MutationResult<UpdateLabPublicFeatureFlagMutation>;
export type UpdateLabPublicFeatureFlagMutationOptions = Apollo.BaseMutationOptions<UpdateLabPublicFeatureFlagMutation, UpdateLabPublicFeatureFlagMutationVariables>;
export const UploadWorkspaceMemberProfilePictureDocument = gql`
    mutation UploadWorkspaceMemberProfilePicture($file: Upload!) {
  uploadWorkspaceMemberProfilePicture(file: $file) {
    path
    token
  }
}
    `;
export type UploadWorkspaceMemberProfilePictureMutationFn = Apollo.MutationFunction<UploadWorkspaceMemberProfilePictureMutation, UploadWorkspaceMemberProfilePictureMutationVariables>;

/**
 * __useUploadWorkspaceMemberProfilePictureMutation__
 *
 * To run a mutation, you first call `useUploadWorkspaceMemberProfilePictureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadWorkspaceMemberProfilePictureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadWorkspaceMemberProfilePictureMutation, { data, loading, error }] = useUploadWorkspaceMemberProfilePictureMutation({
 *   variables: {
 *      file: // value for 'file'
 *   },
 * });
 */
export function useUploadWorkspaceMemberProfilePictureMutation(baseOptions?: Apollo.MutationHookOptions<UploadWorkspaceMemberProfilePictureMutation, UploadWorkspaceMemberProfilePictureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadWorkspaceMemberProfilePictureMutation, UploadWorkspaceMemberProfilePictureMutationVariables>(UploadWorkspaceMemberProfilePictureDocument, options);
      }
export type UploadWorkspaceMemberProfilePictureMutationHookResult = ReturnType<typeof useUploadWorkspaceMemberProfilePictureMutation>;
export type UploadWorkspaceMemberProfilePictureMutationResult = Apollo.MutationResult<UploadWorkspaceMemberProfilePictureMutation>;
export type UploadWorkspaceMemberProfilePictureMutationOptions = Apollo.BaseMutationOptions<UploadWorkspaceMemberProfilePictureMutation, UploadWorkspaceMemberProfilePictureMutationVariables>;
export const UpdateUserEmailDocument = gql`
    mutation UpdateUserEmail($newEmail: String!, $verifyEmailRedirectPath: String) {
  updateUserEmail(
    newEmail: $newEmail
    verifyEmailRedirectPath: $verifyEmailRedirectPath
  )
}
    `;
export type UpdateUserEmailMutationFn = Apollo.MutationFunction<UpdateUserEmailMutation, UpdateUserEmailMutationVariables>;

/**
 * __useUpdateUserEmailMutation__
 *
 * To run a mutation, you first call `useUpdateUserEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserEmailMutation, { data, loading, error }] = useUpdateUserEmailMutation({
 *   variables: {
 *      newEmail: // value for 'newEmail'
 *      verifyEmailRedirectPath: // value for 'verifyEmailRedirectPath'
 *   },
 * });
 */
export function useUpdateUserEmailMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserEmailMutation, UpdateUserEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserEmailMutation, UpdateUserEmailMutationVariables>(UpdateUserEmailDocument, options);
      }
export type UpdateUserEmailMutationHookResult = ReturnType<typeof useUpdateUserEmailMutation>;
export type UpdateUserEmailMutationResult = Apollo.MutationResult<UpdateUserEmailMutation>;
export type UpdateUserEmailMutationOptions = Apollo.BaseMutationOptions<UpdateUserEmailMutation, UpdateUserEmailMutationVariables>;
export const CreateOneRoleDocument = gql`
    mutation CreateOneRole($createRoleInput: CreateRoleInput!) {
  createOneRole(createRoleInput: $createRoleInput) {
    ...RoleFragment
  }
}
    ${RoleFragmentFragmentDoc}`;
export type CreateOneRoleMutationFn = Apollo.MutationFunction<CreateOneRoleMutation, CreateOneRoleMutationVariables>;

/**
 * __useCreateOneRoleMutation__
 *
 * To run a mutation, you first call `useCreateOneRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOneRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOneRoleMutation, { data, loading, error }] = useCreateOneRoleMutation({
 *   variables: {
 *      createRoleInput: // value for 'createRoleInput'
 *   },
 * });
 */
export function useCreateOneRoleMutation(baseOptions?: Apollo.MutationHookOptions<CreateOneRoleMutation, CreateOneRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOneRoleMutation, CreateOneRoleMutationVariables>(CreateOneRoleDocument, options);
      }
export type CreateOneRoleMutationHookResult = ReturnType<typeof useCreateOneRoleMutation>;
export type CreateOneRoleMutationResult = Apollo.MutationResult<CreateOneRoleMutation>;
export type CreateOneRoleMutationOptions = Apollo.BaseMutationOptions<CreateOneRoleMutation, CreateOneRoleMutationVariables>;
export const DeleteOneRoleDocument = gql`
    mutation DeleteOneRole($roleId: UUID!) {
  deleteOneRole(roleId: $roleId)
}
    `;
export type DeleteOneRoleMutationFn = Apollo.MutationFunction<DeleteOneRoleMutation, DeleteOneRoleMutationVariables>;

/**
 * __useDeleteOneRoleMutation__
 *
 * To run a mutation, you first call `useDeleteOneRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOneRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOneRoleMutation, { data, loading, error }] = useDeleteOneRoleMutation({
 *   variables: {
 *      roleId: // value for 'roleId'
 *   },
 * });
 */
export function useDeleteOneRoleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOneRoleMutation, DeleteOneRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOneRoleMutation, DeleteOneRoleMutationVariables>(DeleteOneRoleDocument, options);
      }
export type DeleteOneRoleMutationHookResult = ReturnType<typeof useDeleteOneRoleMutation>;
export type DeleteOneRoleMutationResult = Apollo.MutationResult<DeleteOneRoleMutation>;
export type DeleteOneRoleMutationOptions = Apollo.BaseMutationOptions<DeleteOneRoleMutation, DeleteOneRoleMutationVariables>;
export const UpdateOneRoleDocument = gql`
    mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
  updateOneRole(updateRoleInput: $updateRoleInput) {
    ...RoleFragment
  }
}
    ${RoleFragmentFragmentDoc}`;
export type UpdateOneRoleMutationFn = Apollo.MutationFunction<UpdateOneRoleMutation, UpdateOneRoleMutationVariables>;

/**
 * __useUpdateOneRoleMutation__
 *
 * To run a mutation, you first call `useUpdateOneRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOneRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOneRoleMutation, { data, loading, error }] = useUpdateOneRoleMutation({
 *   variables: {
 *      updateRoleInput: // value for 'updateRoleInput'
 *   },
 * });
 */
export function useUpdateOneRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOneRoleMutation, UpdateOneRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOneRoleMutation, UpdateOneRoleMutationVariables>(UpdateOneRoleDocument, options);
      }
export type UpdateOneRoleMutationHookResult = ReturnType<typeof useUpdateOneRoleMutation>;
export type UpdateOneRoleMutationResult = Apollo.MutationResult<UpdateOneRoleMutation>;
export type UpdateOneRoleMutationOptions = Apollo.BaseMutationOptions<UpdateOneRoleMutation, UpdateOneRoleMutationVariables>;
export const UpdateWorkspaceMemberRoleDocument = gql`
    mutation UpdateWorkspaceMemberRole($workspaceMemberId: UUID!, $roleId: UUID!) {
  updateWorkspaceMemberRole(
    workspaceMemberId: $workspaceMemberId
    roleId: $roleId
  ) {
    ...WorkspaceMemberQueryFragment
    roles {
      ...RoleFragment
    }
  }
}
    ${WorkspaceMemberQueryFragmentFragmentDoc}
${RoleFragmentFragmentDoc}`;
export type UpdateWorkspaceMemberRoleMutationFn = Apollo.MutationFunction<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>;

/**
 * __useUpdateWorkspaceMemberRoleMutation__
 *
 * To run a mutation, you first call `useUpdateWorkspaceMemberRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkspaceMemberRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkspaceMemberRoleMutation, { data, loading, error }] = useUpdateWorkspaceMemberRoleMutation({
 *   variables: {
 *      workspaceMemberId: // value for 'workspaceMemberId'
 *      roleId: // value for 'roleId'
 *   },
 * });
 */
export function useUpdateWorkspaceMemberRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>(UpdateWorkspaceMemberRoleDocument, options);
      }
export type UpdateWorkspaceMemberRoleMutationHookResult = ReturnType<typeof useUpdateWorkspaceMemberRoleMutation>;
export type UpdateWorkspaceMemberRoleMutationResult = Apollo.MutationResult<UpdateWorkspaceMemberRoleMutation>;
export type UpdateWorkspaceMemberRoleMutationOptions = Apollo.BaseMutationOptions<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>;
export const UpsertFieldPermissionsDocument = gql`
    mutation UpsertFieldPermissions($upsertFieldPermissionsInput: UpsertFieldPermissionsInput!) {
  upsertFieldPermissions(
    upsertFieldPermissionsInput: $upsertFieldPermissionsInput
  ) {
    ...FieldPermissionFragment
  }
}
    ${FieldPermissionFragmentFragmentDoc}`;
export type UpsertFieldPermissionsMutationFn = Apollo.MutationFunction<UpsertFieldPermissionsMutation, UpsertFieldPermissionsMutationVariables>;

/**
 * __useUpsertFieldPermissionsMutation__
 *
 * To run a mutation, you first call `useUpsertFieldPermissionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertFieldPermissionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertFieldPermissionsMutation, { data, loading, error }] = useUpsertFieldPermissionsMutation({
 *   variables: {
 *      upsertFieldPermissionsInput: // value for 'upsertFieldPermissionsInput'
 *   },
 * });
 */
export function useUpsertFieldPermissionsMutation(baseOptions?: Apollo.MutationHookOptions<UpsertFieldPermissionsMutation, UpsertFieldPermissionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertFieldPermissionsMutation, UpsertFieldPermissionsMutationVariables>(UpsertFieldPermissionsDocument, options);
      }
export type UpsertFieldPermissionsMutationHookResult = ReturnType<typeof useUpsertFieldPermissionsMutation>;
export type UpsertFieldPermissionsMutationResult = Apollo.MutationResult<UpsertFieldPermissionsMutation>;
export type UpsertFieldPermissionsMutationOptions = Apollo.BaseMutationOptions<UpsertFieldPermissionsMutation, UpsertFieldPermissionsMutationVariables>;
export const UpsertObjectPermissionsDocument = gql`
    mutation UpsertObjectPermissions($upsertObjectPermissionsInput: UpsertObjectPermissionsInput!) {
  upsertObjectPermissions(
    upsertObjectPermissionsInput: $upsertObjectPermissionsInput
  ) {
    ...ObjectPermissionFragment
  }
}
    ${ObjectPermissionFragmentFragmentDoc}`;
export type UpsertObjectPermissionsMutationFn = Apollo.MutationFunction<UpsertObjectPermissionsMutation, UpsertObjectPermissionsMutationVariables>;

/**
 * __useUpsertObjectPermissionsMutation__
 *
 * To run a mutation, you first call `useUpsertObjectPermissionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertObjectPermissionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertObjectPermissionsMutation, { data, loading, error }] = useUpsertObjectPermissionsMutation({
 *   variables: {
 *      upsertObjectPermissionsInput: // value for 'upsertObjectPermissionsInput'
 *   },
 * });
 */
export function useUpsertObjectPermissionsMutation(baseOptions?: Apollo.MutationHookOptions<UpsertObjectPermissionsMutation, UpsertObjectPermissionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertObjectPermissionsMutation, UpsertObjectPermissionsMutationVariables>(UpsertObjectPermissionsDocument, options);
      }
export type UpsertObjectPermissionsMutationHookResult = ReturnType<typeof useUpsertObjectPermissionsMutation>;
export type UpsertObjectPermissionsMutationResult = Apollo.MutationResult<UpsertObjectPermissionsMutation>;
export type UpsertObjectPermissionsMutationOptions = Apollo.BaseMutationOptions<UpsertObjectPermissionsMutation, UpsertObjectPermissionsMutationVariables>;
export const UpsertPermissionFlagsDocument = gql`
    mutation UpsertPermissionFlags($upsertPermissionFlagsInput: UpsertPermissionFlagsInput!) {
  upsertPermissionFlags(upsertPermissionFlagsInput: $upsertPermissionFlagsInput) {
    ...PermissionFlagFragment
  }
}
    ${PermissionFlagFragmentFragmentDoc}`;
export type UpsertPermissionFlagsMutationFn = Apollo.MutationFunction<UpsertPermissionFlagsMutation, UpsertPermissionFlagsMutationVariables>;

/**
 * __useUpsertPermissionFlagsMutation__
 *
 * To run a mutation, you first call `useUpsertPermissionFlagsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertPermissionFlagsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertPermissionFlagsMutation, { data, loading, error }] = useUpsertPermissionFlagsMutation({
 *   variables: {
 *      upsertPermissionFlagsInput: // value for 'upsertPermissionFlagsInput'
 *   },
 * });
 */
export function useUpsertPermissionFlagsMutation(baseOptions?: Apollo.MutationHookOptions<UpsertPermissionFlagsMutation, UpsertPermissionFlagsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertPermissionFlagsMutation, UpsertPermissionFlagsMutationVariables>(UpsertPermissionFlagsDocument, options);
      }
export type UpsertPermissionFlagsMutationHookResult = ReturnType<typeof useUpsertPermissionFlagsMutation>;
export type UpsertPermissionFlagsMutationResult = Apollo.MutationResult<UpsertPermissionFlagsMutation>;
export type UpsertPermissionFlagsMutationOptions = Apollo.BaseMutationOptions<UpsertPermissionFlagsMutation, UpsertPermissionFlagsMutationVariables>;
export const GetRolesDocument = gql`
    query GetRoles {
  getRoles {
    ...RoleFragment
    workspaceMembers {
      ...PartialWorkspaceMemberQueryFragment
    }
    agents {
      ...AgentFields
    }
    apiKeys {
      ...ApiKeyForRoleFragment
    }
    permissionFlags {
      ...PermissionFlagFragment
    }
    objectPermissions {
      ...ObjectPermissionFragment
    }
    fieldPermissions {
      ...FieldPermissionFragment
    }
  }
}
    ${RoleFragmentFragmentDoc}
${PartialWorkspaceMemberQueryFragmentFragmentDoc}
${AgentFieldsFragmentDoc}
${ApiKeyForRoleFragmentFragmentDoc}
${PermissionFlagFragmentFragmentDoc}
${ObjectPermissionFragmentFragmentDoc}
${FieldPermissionFragmentFragmentDoc}`;

/**
 * __useGetRolesQuery__
 *
 * To run a query within a React component, call `useGetRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRolesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRolesQuery(baseOptions?: Apollo.QueryHookOptions<GetRolesQuery, GetRolesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRolesQuery, GetRolesQueryVariables>(GetRolesDocument, options);
      }
export function useGetRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRolesQuery, GetRolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRolesQuery, GetRolesQueryVariables>(GetRolesDocument, options);
        }
export type GetRolesQueryHookResult = ReturnType<typeof useGetRolesQuery>;
export type GetRolesLazyQueryHookResult = ReturnType<typeof useGetRolesLazyQuery>;
export type GetRolesQueryResult = Apollo.QueryResult<GetRolesQuery, GetRolesQueryVariables>;
export const CreateApprovedAccessDomainDocument = gql`
    mutation CreateApprovedAccessDomain($input: CreateApprovedAccessDomainInput!) {
  createApprovedAccessDomain(input: $input) {
    id
    domain
    isValidated
    createdAt
  }
}
    `;
export type CreateApprovedAccessDomainMutationFn = Apollo.MutationFunction<CreateApprovedAccessDomainMutation, CreateApprovedAccessDomainMutationVariables>;

/**
 * __useCreateApprovedAccessDomainMutation__
 *
 * To run a mutation, you first call `useCreateApprovedAccessDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApprovedAccessDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApprovedAccessDomainMutation, { data, loading, error }] = useCreateApprovedAccessDomainMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateApprovedAccessDomainMutation(baseOptions?: Apollo.MutationHookOptions<CreateApprovedAccessDomainMutation, CreateApprovedAccessDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateApprovedAccessDomainMutation, CreateApprovedAccessDomainMutationVariables>(CreateApprovedAccessDomainDocument, options);
      }
export type CreateApprovedAccessDomainMutationHookResult = ReturnType<typeof useCreateApprovedAccessDomainMutation>;
export type CreateApprovedAccessDomainMutationResult = Apollo.MutationResult<CreateApprovedAccessDomainMutation>;
export type CreateApprovedAccessDomainMutationOptions = Apollo.BaseMutationOptions<CreateApprovedAccessDomainMutation, CreateApprovedAccessDomainMutationVariables>;
export const CreateOidcIdentityProviderDocument = gql`
    mutation CreateOIDCIdentityProvider($input: SetupOIDCSsoInput!) {
  createOIDCIdentityProvider(input: $input) {
    id
    type
    issuer
    name
    status
  }
}
    `;
export type CreateOidcIdentityProviderMutationFn = Apollo.MutationFunction<CreateOidcIdentityProviderMutation, CreateOidcIdentityProviderMutationVariables>;

/**
 * __useCreateOidcIdentityProviderMutation__
 *
 * To run a mutation, you first call `useCreateOidcIdentityProviderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOidcIdentityProviderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOidcIdentityProviderMutation, { data, loading, error }] = useCreateOidcIdentityProviderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOidcIdentityProviderMutation(baseOptions?: Apollo.MutationHookOptions<CreateOidcIdentityProviderMutation, CreateOidcIdentityProviderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOidcIdentityProviderMutation, CreateOidcIdentityProviderMutationVariables>(CreateOidcIdentityProviderDocument, options);
      }
export type CreateOidcIdentityProviderMutationHookResult = ReturnType<typeof useCreateOidcIdentityProviderMutation>;
export type CreateOidcIdentityProviderMutationResult = Apollo.MutationResult<CreateOidcIdentityProviderMutation>;
export type CreateOidcIdentityProviderMutationOptions = Apollo.BaseMutationOptions<CreateOidcIdentityProviderMutation, CreateOidcIdentityProviderMutationVariables>;
export const CreateSamlIdentityProviderDocument = gql`
    mutation CreateSAMLIdentityProvider($input: SetupSAMLSsoInput!) {
  createSAMLIdentityProvider(input: $input) {
    id
    type
    issuer
    name
    status
  }
}
    `;
export type CreateSamlIdentityProviderMutationFn = Apollo.MutationFunction<CreateSamlIdentityProviderMutation, CreateSamlIdentityProviderMutationVariables>;

/**
 * __useCreateSamlIdentityProviderMutation__
 *
 * To run a mutation, you first call `useCreateSamlIdentityProviderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSamlIdentityProviderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSamlIdentityProviderMutation, { data, loading, error }] = useCreateSamlIdentityProviderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSamlIdentityProviderMutation(baseOptions?: Apollo.MutationHookOptions<CreateSamlIdentityProviderMutation, CreateSamlIdentityProviderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSamlIdentityProviderMutation, CreateSamlIdentityProviderMutationVariables>(CreateSamlIdentityProviderDocument, options);
      }
export type CreateSamlIdentityProviderMutationHookResult = ReturnType<typeof useCreateSamlIdentityProviderMutation>;
export type CreateSamlIdentityProviderMutationResult = Apollo.MutationResult<CreateSamlIdentityProviderMutation>;
export type CreateSamlIdentityProviderMutationOptions = Apollo.BaseMutationOptions<CreateSamlIdentityProviderMutation, CreateSamlIdentityProviderMutationVariables>;
export const DeleteApprovedAccessDomainDocument = gql`
    mutation DeleteApprovedAccessDomain($input: DeleteApprovedAccessDomainInput!) {
  deleteApprovedAccessDomain(input: $input)
}
    `;
export type DeleteApprovedAccessDomainMutationFn = Apollo.MutationFunction<DeleteApprovedAccessDomainMutation, DeleteApprovedAccessDomainMutationVariables>;

/**
 * __useDeleteApprovedAccessDomainMutation__
 *
 * To run a mutation, you first call `useDeleteApprovedAccessDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApprovedAccessDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApprovedAccessDomainMutation, { data, loading, error }] = useDeleteApprovedAccessDomainMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteApprovedAccessDomainMutation(baseOptions?: Apollo.MutationHookOptions<DeleteApprovedAccessDomainMutation, DeleteApprovedAccessDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteApprovedAccessDomainMutation, DeleteApprovedAccessDomainMutationVariables>(DeleteApprovedAccessDomainDocument, options);
      }
export type DeleteApprovedAccessDomainMutationHookResult = ReturnType<typeof useDeleteApprovedAccessDomainMutation>;
export type DeleteApprovedAccessDomainMutationResult = Apollo.MutationResult<DeleteApprovedAccessDomainMutation>;
export type DeleteApprovedAccessDomainMutationOptions = Apollo.BaseMutationOptions<DeleteApprovedAccessDomainMutation, DeleteApprovedAccessDomainMutationVariables>;
export const DeleteSsoIdentityProviderDocument = gql`
    mutation DeleteSSOIdentityProvider($input: DeleteSsoInput!) {
  deleteSSOIdentityProvider(input: $input) {
    identityProviderId
  }
}
    `;
export type DeleteSsoIdentityProviderMutationFn = Apollo.MutationFunction<DeleteSsoIdentityProviderMutation, DeleteSsoIdentityProviderMutationVariables>;

/**
 * __useDeleteSsoIdentityProviderMutation__
 *
 * To run a mutation, you first call `useDeleteSsoIdentityProviderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSsoIdentityProviderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSsoIdentityProviderMutation, { data, loading, error }] = useDeleteSsoIdentityProviderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteSsoIdentityProviderMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSsoIdentityProviderMutation, DeleteSsoIdentityProviderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSsoIdentityProviderMutation, DeleteSsoIdentityProviderMutationVariables>(DeleteSsoIdentityProviderDocument, options);
      }
export type DeleteSsoIdentityProviderMutationHookResult = ReturnType<typeof useDeleteSsoIdentityProviderMutation>;
export type DeleteSsoIdentityProviderMutationResult = Apollo.MutationResult<DeleteSsoIdentityProviderMutation>;
export type DeleteSsoIdentityProviderMutationOptions = Apollo.BaseMutationOptions<DeleteSsoIdentityProviderMutation, DeleteSsoIdentityProviderMutationVariables>;
export const EditSsoIdentityProviderDocument = gql`
    mutation EditSSOIdentityProvider($input: EditSsoInput!) {
  editSSOIdentityProvider(input: $input) {
    id
    type
    issuer
    name
    status
  }
}
    `;
export type EditSsoIdentityProviderMutationFn = Apollo.MutationFunction<EditSsoIdentityProviderMutation, EditSsoIdentityProviderMutationVariables>;

/**
 * __useEditSsoIdentityProviderMutation__
 *
 * To run a mutation, you first call `useEditSsoIdentityProviderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditSsoIdentityProviderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editSsoIdentityProviderMutation, { data, loading, error }] = useEditSsoIdentityProviderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useEditSsoIdentityProviderMutation(baseOptions?: Apollo.MutationHookOptions<EditSsoIdentityProviderMutation, EditSsoIdentityProviderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EditSsoIdentityProviderMutation, EditSsoIdentityProviderMutationVariables>(EditSsoIdentityProviderDocument, options);
      }
export type EditSsoIdentityProviderMutationHookResult = ReturnType<typeof useEditSsoIdentityProviderMutation>;
export type EditSsoIdentityProviderMutationResult = Apollo.MutationResult<EditSsoIdentityProviderMutation>;
export type EditSsoIdentityProviderMutationOptions = Apollo.BaseMutationOptions<EditSsoIdentityProviderMutation, EditSsoIdentityProviderMutationVariables>;
export const ValidateApprovedAccessDomainDocument = gql`
    mutation ValidateApprovedAccessDomain($input: ValidateApprovedAccessDomainInput!) {
  validateApprovedAccessDomain(input: $input) {
    id
    isValidated
    domain
    createdAt
  }
}
    `;
export type ValidateApprovedAccessDomainMutationFn = Apollo.MutationFunction<ValidateApprovedAccessDomainMutation, ValidateApprovedAccessDomainMutationVariables>;

/**
 * __useValidateApprovedAccessDomainMutation__
 *
 * To run a mutation, you first call `useValidateApprovedAccessDomainMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useValidateApprovedAccessDomainMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [validateApprovedAccessDomainMutation, { data, loading, error }] = useValidateApprovedAccessDomainMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useValidateApprovedAccessDomainMutation(baseOptions?: Apollo.MutationHookOptions<ValidateApprovedAccessDomainMutation, ValidateApprovedAccessDomainMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ValidateApprovedAccessDomainMutation, ValidateApprovedAccessDomainMutationVariables>(ValidateApprovedAccessDomainDocument, options);
      }
export type ValidateApprovedAccessDomainMutationHookResult = ReturnType<typeof useValidateApprovedAccessDomainMutation>;
export type ValidateApprovedAccessDomainMutationResult = Apollo.MutationResult<ValidateApprovedAccessDomainMutation>;
export type ValidateApprovedAccessDomainMutationOptions = Apollo.BaseMutationOptions<ValidateApprovedAccessDomainMutation, ValidateApprovedAccessDomainMutationVariables>;
export const GetApprovedAccessDomainsDocument = gql`
    query GetApprovedAccessDomains {
  getApprovedAccessDomains {
    id
    createdAt
    domain
    isValidated
  }
}
    `;

/**
 * __useGetApprovedAccessDomainsQuery__
 *
 * To run a query within a React component, call `useGetApprovedAccessDomainsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApprovedAccessDomainsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApprovedAccessDomainsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetApprovedAccessDomainsQuery(baseOptions?: Apollo.QueryHookOptions<GetApprovedAccessDomainsQuery, GetApprovedAccessDomainsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetApprovedAccessDomainsQuery, GetApprovedAccessDomainsQueryVariables>(GetApprovedAccessDomainsDocument, options);
      }
export function useGetApprovedAccessDomainsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetApprovedAccessDomainsQuery, GetApprovedAccessDomainsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetApprovedAccessDomainsQuery, GetApprovedAccessDomainsQueryVariables>(GetApprovedAccessDomainsDocument, options);
        }
export type GetApprovedAccessDomainsQueryHookResult = ReturnType<typeof useGetApprovedAccessDomainsQuery>;
export type GetApprovedAccessDomainsLazyQueryHookResult = ReturnType<typeof useGetApprovedAccessDomainsLazyQuery>;
export type GetApprovedAccessDomainsQueryResult = Apollo.QueryResult<GetApprovedAccessDomainsQuery, GetApprovedAccessDomainsQueryVariables>;
export const GetSsoIdentityProvidersDocument = gql`
    query GetSSOIdentityProviders {
  getSSOIdentityProviders {
    type
    id
    name
    issuer
    status
  }
}
    `;

/**
 * __useGetSsoIdentityProvidersQuery__
 *
 * To run a query within a React component, call `useGetSsoIdentityProvidersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSsoIdentityProvidersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSsoIdentityProvidersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSsoIdentityProvidersQuery(baseOptions?: Apollo.QueryHookOptions<GetSsoIdentityProvidersQuery, GetSsoIdentityProvidersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSsoIdentityProvidersQuery, GetSsoIdentityProvidersQueryVariables>(GetSsoIdentityProvidersDocument, options);
      }
export function useGetSsoIdentityProvidersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSsoIdentityProvidersQuery, GetSsoIdentityProvidersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSsoIdentityProvidersQuery, GetSsoIdentityProvidersQueryVariables>(GetSsoIdentityProvidersDocument, options);
        }
export type GetSsoIdentityProvidersQueryHookResult = ReturnType<typeof useGetSsoIdentityProvidersQuery>;
export type GetSsoIdentityProvidersLazyQueryHookResult = ReturnType<typeof useGetSsoIdentityProvidersLazyQuery>;
export type GetSsoIdentityProvidersQueryResult = Apollo.QueryResult<GetSsoIdentityProvidersQuery, GetSsoIdentityProvidersQueryVariables>;
export const CreateOneServerlessFunctionItemDocument = gql`
    mutation CreateOneServerlessFunctionItem($input: CreateServerlessFunctionInput!) {
  createOneServerlessFunction(input: $input) {
    ...ServerlessFunctionFields
  }
}
    ${ServerlessFunctionFieldsFragmentDoc}`;
export type CreateOneServerlessFunctionItemMutationFn = Apollo.MutationFunction<CreateOneServerlessFunctionItemMutation, CreateOneServerlessFunctionItemMutationVariables>;

/**
 * __useCreateOneServerlessFunctionItemMutation__
 *
 * To run a mutation, you first call `useCreateOneServerlessFunctionItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOneServerlessFunctionItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOneServerlessFunctionItemMutation, { data, loading, error }] = useCreateOneServerlessFunctionItemMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOneServerlessFunctionItemMutation(baseOptions?: Apollo.MutationHookOptions<CreateOneServerlessFunctionItemMutation, CreateOneServerlessFunctionItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOneServerlessFunctionItemMutation, CreateOneServerlessFunctionItemMutationVariables>(CreateOneServerlessFunctionItemDocument, options);
      }
export type CreateOneServerlessFunctionItemMutationHookResult = ReturnType<typeof useCreateOneServerlessFunctionItemMutation>;
export type CreateOneServerlessFunctionItemMutationResult = Apollo.MutationResult<CreateOneServerlessFunctionItemMutation>;
export type CreateOneServerlessFunctionItemMutationOptions = Apollo.BaseMutationOptions<CreateOneServerlessFunctionItemMutation, CreateOneServerlessFunctionItemMutationVariables>;
export const DeleteOneServerlessFunctionDocument = gql`
    mutation DeleteOneServerlessFunction($input: ServerlessFunctionIdInput!) {
  deleteOneServerlessFunction(input: $input) {
    ...ServerlessFunctionFields
  }
}
    ${ServerlessFunctionFieldsFragmentDoc}`;
export type DeleteOneServerlessFunctionMutationFn = Apollo.MutationFunction<DeleteOneServerlessFunctionMutation, DeleteOneServerlessFunctionMutationVariables>;

/**
 * __useDeleteOneServerlessFunctionMutation__
 *
 * To run a mutation, you first call `useDeleteOneServerlessFunctionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOneServerlessFunctionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOneServerlessFunctionMutation, { data, loading, error }] = useDeleteOneServerlessFunctionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteOneServerlessFunctionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOneServerlessFunctionMutation, DeleteOneServerlessFunctionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOneServerlessFunctionMutation, DeleteOneServerlessFunctionMutationVariables>(DeleteOneServerlessFunctionDocument, options);
      }
export type DeleteOneServerlessFunctionMutationHookResult = ReturnType<typeof useDeleteOneServerlessFunctionMutation>;
export type DeleteOneServerlessFunctionMutationResult = Apollo.MutationResult<DeleteOneServerlessFunctionMutation>;
export type DeleteOneServerlessFunctionMutationOptions = Apollo.BaseMutationOptions<DeleteOneServerlessFunctionMutation, DeleteOneServerlessFunctionMutationVariables>;
export const ExecuteOneServerlessFunctionDocument = gql`
    mutation ExecuteOneServerlessFunction($input: ExecuteServerlessFunctionInput!) {
  executeOneServerlessFunction(input: $input) {
    data
    logs
    duration
    status
    error
  }
}
    `;
export type ExecuteOneServerlessFunctionMutationFn = Apollo.MutationFunction<ExecuteOneServerlessFunctionMutation, ExecuteOneServerlessFunctionMutationVariables>;

/**
 * __useExecuteOneServerlessFunctionMutation__
 *
 * To run a mutation, you first call `useExecuteOneServerlessFunctionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExecuteOneServerlessFunctionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [executeOneServerlessFunctionMutation, { data, loading, error }] = useExecuteOneServerlessFunctionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useExecuteOneServerlessFunctionMutation(baseOptions?: Apollo.MutationHookOptions<ExecuteOneServerlessFunctionMutation, ExecuteOneServerlessFunctionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExecuteOneServerlessFunctionMutation, ExecuteOneServerlessFunctionMutationVariables>(ExecuteOneServerlessFunctionDocument, options);
      }
export type ExecuteOneServerlessFunctionMutationHookResult = ReturnType<typeof useExecuteOneServerlessFunctionMutation>;
export type ExecuteOneServerlessFunctionMutationResult = Apollo.MutationResult<ExecuteOneServerlessFunctionMutation>;
export type ExecuteOneServerlessFunctionMutationOptions = Apollo.BaseMutationOptions<ExecuteOneServerlessFunctionMutation, ExecuteOneServerlessFunctionMutationVariables>;
export const PublishOneServerlessFunctionDocument = gql`
    mutation PublishOneServerlessFunction($input: PublishServerlessFunctionInput!) {
  publishServerlessFunction(input: $input) {
    ...ServerlessFunctionFields
  }
}
    ${ServerlessFunctionFieldsFragmentDoc}`;
export type PublishOneServerlessFunctionMutationFn = Apollo.MutationFunction<PublishOneServerlessFunctionMutation, PublishOneServerlessFunctionMutationVariables>;

/**
 * __usePublishOneServerlessFunctionMutation__
 *
 * To run a mutation, you first call `usePublishOneServerlessFunctionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishOneServerlessFunctionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishOneServerlessFunctionMutation, { data, loading, error }] = usePublishOneServerlessFunctionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePublishOneServerlessFunctionMutation(baseOptions?: Apollo.MutationHookOptions<PublishOneServerlessFunctionMutation, PublishOneServerlessFunctionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishOneServerlessFunctionMutation, PublishOneServerlessFunctionMutationVariables>(PublishOneServerlessFunctionDocument, options);
      }
export type PublishOneServerlessFunctionMutationHookResult = ReturnType<typeof usePublishOneServerlessFunctionMutation>;
export type PublishOneServerlessFunctionMutationResult = Apollo.MutationResult<PublishOneServerlessFunctionMutation>;
export type PublishOneServerlessFunctionMutationOptions = Apollo.BaseMutationOptions<PublishOneServerlessFunctionMutation, PublishOneServerlessFunctionMutationVariables>;
export const UpdateOneServerlessFunctionDocument = gql`
    mutation UpdateOneServerlessFunction($input: UpdateServerlessFunctionInput!) {
  updateOneServerlessFunction(input: $input) {
    ...ServerlessFunctionFields
  }
}
    ${ServerlessFunctionFieldsFragmentDoc}`;
export type UpdateOneServerlessFunctionMutationFn = Apollo.MutationFunction<UpdateOneServerlessFunctionMutation, UpdateOneServerlessFunctionMutationVariables>;

/**
 * __useUpdateOneServerlessFunctionMutation__
 *
 * To run a mutation, you first call `useUpdateOneServerlessFunctionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOneServerlessFunctionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOneServerlessFunctionMutation, { data, loading, error }] = useUpdateOneServerlessFunctionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOneServerlessFunctionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOneServerlessFunctionMutation, UpdateOneServerlessFunctionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOneServerlessFunctionMutation, UpdateOneServerlessFunctionMutationVariables>(UpdateOneServerlessFunctionDocument, options);
      }
export type UpdateOneServerlessFunctionMutationHookResult = ReturnType<typeof useUpdateOneServerlessFunctionMutation>;
export type UpdateOneServerlessFunctionMutationResult = Apollo.MutationResult<UpdateOneServerlessFunctionMutation>;
export type UpdateOneServerlessFunctionMutationOptions = Apollo.BaseMutationOptions<UpdateOneServerlessFunctionMutation, UpdateOneServerlessFunctionMutationVariables>;
export const FindManyAvailablePackagesDocument = gql`
    query FindManyAvailablePackages($input: ServerlessFunctionIdInput!) {
  getAvailablePackages(input: $input)
}
    `;

/**
 * __useFindManyAvailablePackagesQuery__
 *
 * To run a query within a React component, call `useFindManyAvailablePackagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyAvailablePackagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyAvailablePackagesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useFindManyAvailablePackagesQuery(baseOptions: Apollo.QueryHookOptions<FindManyAvailablePackagesQuery, FindManyAvailablePackagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyAvailablePackagesQuery, FindManyAvailablePackagesQueryVariables>(FindManyAvailablePackagesDocument, options);
      }
export function useFindManyAvailablePackagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyAvailablePackagesQuery, FindManyAvailablePackagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyAvailablePackagesQuery, FindManyAvailablePackagesQueryVariables>(FindManyAvailablePackagesDocument, options);
        }
export type FindManyAvailablePackagesQueryHookResult = ReturnType<typeof useFindManyAvailablePackagesQuery>;
export type FindManyAvailablePackagesLazyQueryHookResult = ReturnType<typeof useFindManyAvailablePackagesLazyQuery>;
export type FindManyAvailablePackagesQueryResult = Apollo.QueryResult<FindManyAvailablePackagesQuery, FindManyAvailablePackagesQueryVariables>;
export const GetManyServerlessFunctionsDocument = gql`
    query GetManyServerlessFunctions {
  findManyServerlessFunctions {
    ...ServerlessFunctionFields
  }
}
    ${ServerlessFunctionFieldsFragmentDoc}`;

/**
 * __useGetManyServerlessFunctionsQuery__
 *
 * To run a query within a React component, call `useGetManyServerlessFunctionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetManyServerlessFunctionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetManyServerlessFunctionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetManyServerlessFunctionsQuery(baseOptions?: Apollo.QueryHookOptions<GetManyServerlessFunctionsQuery, GetManyServerlessFunctionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetManyServerlessFunctionsQuery, GetManyServerlessFunctionsQueryVariables>(GetManyServerlessFunctionsDocument, options);
      }
export function useGetManyServerlessFunctionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetManyServerlessFunctionsQuery, GetManyServerlessFunctionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetManyServerlessFunctionsQuery, GetManyServerlessFunctionsQueryVariables>(GetManyServerlessFunctionsDocument, options);
        }
export type GetManyServerlessFunctionsQueryHookResult = ReturnType<typeof useGetManyServerlessFunctionsQuery>;
export type GetManyServerlessFunctionsLazyQueryHookResult = ReturnType<typeof useGetManyServerlessFunctionsLazyQuery>;
export type GetManyServerlessFunctionsQueryResult = Apollo.QueryResult<GetManyServerlessFunctionsQuery, GetManyServerlessFunctionsQueryVariables>;
export const GetOneServerlessFunctionDocument = gql`
    query GetOneServerlessFunction($input: ServerlessFunctionIdInput!) {
  findOneServerlessFunction(input: $input) {
    ...ServerlessFunctionFields
  }
}
    ${ServerlessFunctionFieldsFragmentDoc}`;

/**
 * __useGetOneServerlessFunctionQuery__
 *
 * To run a query within a React component, call `useGetOneServerlessFunctionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOneServerlessFunctionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOneServerlessFunctionQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetOneServerlessFunctionQuery(baseOptions: Apollo.QueryHookOptions<GetOneServerlessFunctionQuery, GetOneServerlessFunctionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOneServerlessFunctionQuery, GetOneServerlessFunctionQueryVariables>(GetOneServerlessFunctionDocument, options);
      }
export function useGetOneServerlessFunctionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOneServerlessFunctionQuery, GetOneServerlessFunctionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOneServerlessFunctionQuery, GetOneServerlessFunctionQueryVariables>(GetOneServerlessFunctionDocument, options);
        }
export type GetOneServerlessFunctionQueryHookResult = ReturnType<typeof useGetOneServerlessFunctionQuery>;
export type GetOneServerlessFunctionLazyQueryHookResult = ReturnType<typeof useGetOneServerlessFunctionLazyQuery>;
export type GetOneServerlessFunctionQueryResult = Apollo.QueryResult<GetOneServerlessFunctionQuery, GetOneServerlessFunctionQueryVariables>;
export const FindOneServerlessFunctionSourceCodeDocument = gql`
    query FindOneServerlessFunctionSourceCode($input: GetServerlessFunctionSourceCodeInput!) {
  getServerlessFunctionSourceCode(input: $input)
}
    `;

/**
 * __useFindOneServerlessFunctionSourceCodeQuery__
 *
 * To run a query within a React component, call `useFindOneServerlessFunctionSourceCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneServerlessFunctionSourceCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneServerlessFunctionSourceCodeQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useFindOneServerlessFunctionSourceCodeQuery(baseOptions: Apollo.QueryHookOptions<FindOneServerlessFunctionSourceCodeQuery, FindOneServerlessFunctionSourceCodeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneServerlessFunctionSourceCodeQuery, FindOneServerlessFunctionSourceCodeQueryVariables>(FindOneServerlessFunctionSourceCodeDocument, options);
      }
export function useFindOneServerlessFunctionSourceCodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneServerlessFunctionSourceCodeQuery, FindOneServerlessFunctionSourceCodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneServerlessFunctionSourceCodeQuery, FindOneServerlessFunctionSourceCodeQueryVariables>(FindOneServerlessFunctionSourceCodeDocument, options);
        }
export type FindOneServerlessFunctionSourceCodeQueryHookResult = ReturnType<typeof useFindOneServerlessFunctionSourceCodeQuery>;
export type FindOneServerlessFunctionSourceCodeLazyQueryHookResult = ReturnType<typeof useFindOneServerlessFunctionSourceCodeLazyQuery>;
export type FindOneServerlessFunctionSourceCodeQueryResult = Apollo.QueryResult<FindOneServerlessFunctionSourceCodeQuery, FindOneServerlessFunctionSourceCodeQueryVariables>;
export const VerifyTwoFactorAuthenticationMethodForAuthenticatedUserDocument = gql`
    mutation verifyTwoFactorAuthenticationMethodForAuthenticatedUser($otp: String!) {
  verifyTwoFactorAuthenticationMethodForAuthenticatedUser(otp: $otp) {
    success
  }
}
    `;
export type VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationFn = Apollo.MutationFunction<VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation, VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationVariables>;

/**
 * __useVerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation__
 *
 * To run a mutation, you first call `useVerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation, { data, loading, error }] = useVerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation({
 *   variables: {
 *      otp: // value for 'otp'
 *   },
 * });
 */
export function useVerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation(baseOptions?: Apollo.MutationHookOptions<VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation, VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation, VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationVariables>(VerifyTwoFactorAuthenticationMethodForAuthenticatedUserDocument, options);
      }
export type VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationHookResult = ReturnType<typeof useVerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation>;
export type VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationResult = Apollo.MutationResult<VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation>;
export type VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationOptions = Apollo.BaseMutationOptions<VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutation, VerifyTwoFactorAuthenticationMethodForAuthenticatedUserMutationVariables>;
export const DeleteUserAccountDocument = gql`
    mutation DeleteUserAccount {
  deleteUser {
    id
  }
}
    `;
export type DeleteUserAccountMutationFn = Apollo.MutationFunction<DeleteUserAccountMutation, DeleteUserAccountMutationVariables>;

/**
 * __useDeleteUserAccountMutation__
 *
 * To run a mutation, you first call `useDeleteUserAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserAccountMutation, { data, loading, error }] = useDeleteUserAccountMutation({
 *   variables: {
 *   },
 * });
 */
export function useDeleteUserAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserAccountMutation, DeleteUserAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserAccountMutation, DeleteUserAccountMutationVariables>(DeleteUserAccountDocument, options);
      }
export type DeleteUserAccountMutationHookResult = ReturnType<typeof useDeleteUserAccountMutation>;
export type DeleteUserAccountMutationResult = Apollo.MutationResult<DeleteUserAccountMutation>;
export type DeleteUserAccountMutationOptions = Apollo.BaseMutationOptions<DeleteUserAccountMutation, DeleteUserAccountMutationVariables>;
export const DeleteUserWorkspaceDocument = gql`
    mutation DeleteUserWorkspace($workspaceMemberIdToDelete: String!) {
  deleteUserFromWorkspace(workspaceMemberIdToDelete: $workspaceMemberIdToDelete) {
    id
  }
}
    `;
export type DeleteUserWorkspaceMutationFn = Apollo.MutationFunction<DeleteUserWorkspaceMutation, DeleteUserWorkspaceMutationVariables>;

/**
 * __useDeleteUserWorkspaceMutation__
 *
 * To run a mutation, you first call `useDeleteUserWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserWorkspaceMutation, { data, loading, error }] = useDeleteUserWorkspaceMutation({
 *   variables: {
 *      workspaceMemberIdToDelete: // value for 'workspaceMemberIdToDelete'
 *   },
 * });
 */
export function useDeleteUserWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserWorkspaceMutation, DeleteUserWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserWorkspaceMutation, DeleteUserWorkspaceMutationVariables>(DeleteUserWorkspaceDocument, options);
      }
export type DeleteUserWorkspaceMutationHookResult = ReturnType<typeof useDeleteUserWorkspaceMutation>;
export type DeleteUserWorkspaceMutationResult = Apollo.MutationResult<DeleteUserWorkspaceMutation>;
export type DeleteUserWorkspaceMutationOptions = Apollo.BaseMutationOptions<DeleteUserWorkspaceMutation, DeleteUserWorkspaceMutationVariables>;
export const GetCurrentUserDocument = gql`
    query GetCurrentUser {
  currentUser {
    ...UserQueryFragment
  }
}
    ${UserQueryFragmentFragmentDoc}`;

/**
 * __useGetCurrentUserQuery__
 *
 * To run a query within a React component, call `useGetCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
      }
export function useGetCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
export type GetCurrentUserQueryHookResult = ReturnType<typeof useGetCurrentUserQuery>;
export type GetCurrentUserLazyQueryHookResult = ReturnType<typeof useGetCurrentUserLazyQuery>;
export type GetCurrentUserQueryResult = Apollo.QueryResult<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
export const CreateCoreViewDocument = gql`
    mutation CreateCoreView($input: CreateViewInput!) {
  createCoreView(input: $input) {
    ...ViewFragment
  }
}
    ${ViewFragmentFragmentDoc}`;
export type CreateCoreViewMutationFn = Apollo.MutationFunction<CreateCoreViewMutation, CreateCoreViewMutationVariables>;

/**
 * __useCreateCoreViewMutation__
 *
 * To run a mutation, you first call `useCreateCoreViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCoreViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCoreViewMutation, { data, loading, error }] = useCreateCoreViewMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCoreViewMutation(baseOptions?: Apollo.MutationHookOptions<CreateCoreViewMutation, CreateCoreViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCoreViewMutation, CreateCoreViewMutationVariables>(CreateCoreViewDocument, options);
      }
export type CreateCoreViewMutationHookResult = ReturnType<typeof useCreateCoreViewMutation>;
export type CreateCoreViewMutationResult = Apollo.MutationResult<CreateCoreViewMutation>;
export type CreateCoreViewMutationOptions = Apollo.BaseMutationOptions<CreateCoreViewMutation, CreateCoreViewMutationVariables>;
export const CreateCoreViewFieldDocument = gql`
    mutation CreateCoreViewField($input: CreateViewFieldInput!) {
  createCoreViewField(input: $input) {
    ...ViewFieldFragment
  }
}
    ${ViewFieldFragmentFragmentDoc}`;
export type CreateCoreViewFieldMutationFn = Apollo.MutationFunction<CreateCoreViewFieldMutation, CreateCoreViewFieldMutationVariables>;

/**
 * __useCreateCoreViewFieldMutation__
 *
 * To run a mutation, you first call `useCreateCoreViewFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCoreViewFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCoreViewFieldMutation, { data, loading, error }] = useCreateCoreViewFieldMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCoreViewFieldMutation(baseOptions?: Apollo.MutationHookOptions<CreateCoreViewFieldMutation, CreateCoreViewFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCoreViewFieldMutation, CreateCoreViewFieldMutationVariables>(CreateCoreViewFieldDocument, options);
      }
export type CreateCoreViewFieldMutationHookResult = ReturnType<typeof useCreateCoreViewFieldMutation>;
export type CreateCoreViewFieldMutationResult = Apollo.MutationResult<CreateCoreViewFieldMutation>;
export type CreateCoreViewFieldMutationOptions = Apollo.BaseMutationOptions<CreateCoreViewFieldMutation, CreateCoreViewFieldMutationVariables>;
export const CreateCoreViewFilterDocument = gql`
    mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
  createCoreViewFilter(input: $input) {
    ...ViewFilterFragment
  }
}
    ${ViewFilterFragmentFragmentDoc}`;
export type CreateCoreViewFilterMutationFn = Apollo.MutationFunction<CreateCoreViewFilterMutation, CreateCoreViewFilterMutationVariables>;

/**
 * __useCreateCoreViewFilterMutation__
 *
 * To run a mutation, you first call `useCreateCoreViewFilterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCoreViewFilterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCoreViewFilterMutation, { data, loading, error }] = useCreateCoreViewFilterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCoreViewFilterMutation(baseOptions?: Apollo.MutationHookOptions<CreateCoreViewFilterMutation, CreateCoreViewFilterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCoreViewFilterMutation, CreateCoreViewFilterMutationVariables>(CreateCoreViewFilterDocument, options);
      }
export type CreateCoreViewFilterMutationHookResult = ReturnType<typeof useCreateCoreViewFilterMutation>;
export type CreateCoreViewFilterMutationResult = Apollo.MutationResult<CreateCoreViewFilterMutation>;
export type CreateCoreViewFilterMutationOptions = Apollo.BaseMutationOptions<CreateCoreViewFilterMutation, CreateCoreViewFilterMutationVariables>;
export const CreateCoreViewFilterGroupDocument = gql`
    mutation CreateCoreViewFilterGroup($input: CreateViewFilterGroupInput!) {
  createCoreViewFilterGroup(input: $input) {
    ...ViewFilterGroupFragment
  }
}
    ${ViewFilterGroupFragmentFragmentDoc}`;
export type CreateCoreViewFilterGroupMutationFn = Apollo.MutationFunction<CreateCoreViewFilterGroupMutation, CreateCoreViewFilterGroupMutationVariables>;

/**
 * __useCreateCoreViewFilterGroupMutation__
 *
 * To run a mutation, you first call `useCreateCoreViewFilterGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCoreViewFilterGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCoreViewFilterGroupMutation, { data, loading, error }] = useCreateCoreViewFilterGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCoreViewFilterGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateCoreViewFilterGroupMutation, CreateCoreViewFilterGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCoreViewFilterGroupMutation, CreateCoreViewFilterGroupMutationVariables>(CreateCoreViewFilterGroupDocument, options);
      }
export type CreateCoreViewFilterGroupMutationHookResult = ReturnType<typeof useCreateCoreViewFilterGroupMutation>;
export type CreateCoreViewFilterGroupMutationResult = Apollo.MutationResult<CreateCoreViewFilterGroupMutation>;
export type CreateCoreViewFilterGroupMutationOptions = Apollo.BaseMutationOptions<CreateCoreViewFilterGroupMutation, CreateCoreViewFilterGroupMutationVariables>;
export const CreateCoreViewGroupDocument = gql`
    mutation CreateCoreViewGroup($input: CreateViewGroupInput!) {
  createCoreViewGroup(input: $input) {
    ...ViewGroupFragment
  }
}
    ${ViewGroupFragmentFragmentDoc}`;
export type CreateCoreViewGroupMutationFn = Apollo.MutationFunction<CreateCoreViewGroupMutation, CreateCoreViewGroupMutationVariables>;

/**
 * __useCreateCoreViewGroupMutation__
 *
 * To run a mutation, you first call `useCreateCoreViewGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCoreViewGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCoreViewGroupMutation, { data, loading, error }] = useCreateCoreViewGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCoreViewGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateCoreViewGroupMutation, CreateCoreViewGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCoreViewGroupMutation, CreateCoreViewGroupMutationVariables>(CreateCoreViewGroupDocument, options);
      }
export type CreateCoreViewGroupMutationHookResult = ReturnType<typeof useCreateCoreViewGroupMutation>;
export type CreateCoreViewGroupMutationResult = Apollo.MutationResult<CreateCoreViewGroupMutation>;
export type CreateCoreViewGroupMutationOptions = Apollo.BaseMutationOptions<CreateCoreViewGroupMutation, CreateCoreViewGroupMutationVariables>;
export const CreateCoreViewSortDocument = gql`
    mutation CreateCoreViewSort($input: CreateViewSortInput!) {
  createCoreViewSort(input: $input) {
    ...ViewSortFragment
  }
}
    ${ViewSortFragmentFragmentDoc}`;
export type CreateCoreViewSortMutationFn = Apollo.MutationFunction<CreateCoreViewSortMutation, CreateCoreViewSortMutationVariables>;

/**
 * __useCreateCoreViewSortMutation__
 *
 * To run a mutation, you first call `useCreateCoreViewSortMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCoreViewSortMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCoreViewSortMutation, { data, loading, error }] = useCreateCoreViewSortMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCoreViewSortMutation(baseOptions?: Apollo.MutationHookOptions<CreateCoreViewSortMutation, CreateCoreViewSortMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCoreViewSortMutation, CreateCoreViewSortMutationVariables>(CreateCoreViewSortDocument, options);
      }
export type CreateCoreViewSortMutationHookResult = ReturnType<typeof useCreateCoreViewSortMutation>;
export type CreateCoreViewSortMutationResult = Apollo.MutationResult<CreateCoreViewSortMutation>;
export type CreateCoreViewSortMutationOptions = Apollo.BaseMutationOptions<CreateCoreViewSortMutation, CreateCoreViewSortMutationVariables>;
export const CreateManyCoreViewFieldsDocument = gql`
    mutation CreateManyCoreViewFields($inputs: [CreateViewFieldInput!]!) {
  createManyCoreViewFields(inputs: $inputs) {
    ...ViewFieldFragment
  }
}
    ${ViewFieldFragmentFragmentDoc}`;
export type CreateManyCoreViewFieldsMutationFn = Apollo.MutationFunction<CreateManyCoreViewFieldsMutation, CreateManyCoreViewFieldsMutationVariables>;

/**
 * __useCreateManyCoreViewFieldsMutation__
 *
 * To run a mutation, you first call `useCreateManyCoreViewFieldsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateManyCoreViewFieldsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createManyCoreViewFieldsMutation, { data, loading, error }] = useCreateManyCoreViewFieldsMutation({
 *   variables: {
 *      inputs: // value for 'inputs'
 *   },
 * });
 */
export function useCreateManyCoreViewFieldsMutation(baseOptions?: Apollo.MutationHookOptions<CreateManyCoreViewFieldsMutation, CreateManyCoreViewFieldsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateManyCoreViewFieldsMutation, CreateManyCoreViewFieldsMutationVariables>(CreateManyCoreViewFieldsDocument, options);
      }
export type CreateManyCoreViewFieldsMutationHookResult = ReturnType<typeof useCreateManyCoreViewFieldsMutation>;
export type CreateManyCoreViewFieldsMutationResult = Apollo.MutationResult<CreateManyCoreViewFieldsMutation>;
export type CreateManyCoreViewFieldsMutationOptions = Apollo.BaseMutationOptions<CreateManyCoreViewFieldsMutation, CreateManyCoreViewFieldsMutationVariables>;
export const CreateManyCoreViewGroupsDocument = gql`
    mutation CreateManyCoreViewGroups($inputs: [CreateViewGroupInput!]!) {
  createManyCoreViewGroups(inputs: $inputs) {
    ...ViewGroupFragment
  }
}
    ${ViewGroupFragmentFragmentDoc}`;
export type CreateManyCoreViewGroupsMutationFn = Apollo.MutationFunction<CreateManyCoreViewGroupsMutation, CreateManyCoreViewGroupsMutationVariables>;

/**
 * __useCreateManyCoreViewGroupsMutation__
 *
 * To run a mutation, you first call `useCreateManyCoreViewGroupsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateManyCoreViewGroupsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createManyCoreViewGroupsMutation, { data, loading, error }] = useCreateManyCoreViewGroupsMutation({
 *   variables: {
 *      inputs: // value for 'inputs'
 *   },
 * });
 */
export function useCreateManyCoreViewGroupsMutation(baseOptions?: Apollo.MutationHookOptions<CreateManyCoreViewGroupsMutation, CreateManyCoreViewGroupsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateManyCoreViewGroupsMutation, CreateManyCoreViewGroupsMutationVariables>(CreateManyCoreViewGroupsDocument, options);
      }
export type CreateManyCoreViewGroupsMutationHookResult = ReturnType<typeof useCreateManyCoreViewGroupsMutation>;
export type CreateManyCoreViewGroupsMutationResult = Apollo.MutationResult<CreateManyCoreViewGroupsMutation>;
export type CreateManyCoreViewGroupsMutationOptions = Apollo.BaseMutationOptions<CreateManyCoreViewGroupsMutation, CreateManyCoreViewGroupsMutationVariables>;
export const DeleteCoreViewDocument = gql`
    mutation DeleteCoreView($id: String!) {
  deleteCoreView(id: $id)
}
    `;
export type DeleteCoreViewMutationFn = Apollo.MutationFunction<DeleteCoreViewMutation, DeleteCoreViewMutationVariables>;

/**
 * __useDeleteCoreViewMutation__
 *
 * To run a mutation, you first call `useDeleteCoreViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCoreViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCoreViewMutation, { data, loading, error }] = useDeleteCoreViewMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCoreViewMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCoreViewMutation, DeleteCoreViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCoreViewMutation, DeleteCoreViewMutationVariables>(DeleteCoreViewDocument, options);
      }
export type DeleteCoreViewMutationHookResult = ReturnType<typeof useDeleteCoreViewMutation>;
export type DeleteCoreViewMutationResult = Apollo.MutationResult<DeleteCoreViewMutation>;
export type DeleteCoreViewMutationOptions = Apollo.BaseMutationOptions<DeleteCoreViewMutation, DeleteCoreViewMutationVariables>;
export const DeleteCoreViewFieldDocument = gql`
    mutation DeleteCoreViewField($input: DeleteViewFieldInput!) {
  deleteCoreViewField(input: $input) {
    ...ViewFieldFragment
  }
}
    ${ViewFieldFragmentFragmentDoc}`;
export type DeleteCoreViewFieldMutationFn = Apollo.MutationFunction<DeleteCoreViewFieldMutation, DeleteCoreViewFieldMutationVariables>;

/**
 * __useDeleteCoreViewFieldMutation__
 *
 * To run a mutation, you first call `useDeleteCoreViewFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCoreViewFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCoreViewFieldMutation, { data, loading, error }] = useDeleteCoreViewFieldMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteCoreViewFieldMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCoreViewFieldMutation, DeleteCoreViewFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCoreViewFieldMutation, DeleteCoreViewFieldMutationVariables>(DeleteCoreViewFieldDocument, options);
      }
export type DeleteCoreViewFieldMutationHookResult = ReturnType<typeof useDeleteCoreViewFieldMutation>;
export type DeleteCoreViewFieldMutationResult = Apollo.MutationResult<DeleteCoreViewFieldMutation>;
export type DeleteCoreViewFieldMutationOptions = Apollo.BaseMutationOptions<DeleteCoreViewFieldMutation, DeleteCoreViewFieldMutationVariables>;
export const DeleteCoreViewFilterDocument = gql`
    mutation DeleteCoreViewFilter($input: DeleteViewFilterInput!) {
  deleteCoreViewFilter(input: $input) {
    ...ViewFilterFragment
  }
}
    ${ViewFilterFragmentFragmentDoc}`;
export type DeleteCoreViewFilterMutationFn = Apollo.MutationFunction<DeleteCoreViewFilterMutation, DeleteCoreViewFilterMutationVariables>;

/**
 * __useDeleteCoreViewFilterMutation__
 *
 * To run a mutation, you first call `useDeleteCoreViewFilterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCoreViewFilterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCoreViewFilterMutation, { data, loading, error }] = useDeleteCoreViewFilterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteCoreViewFilterMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCoreViewFilterMutation, DeleteCoreViewFilterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCoreViewFilterMutation, DeleteCoreViewFilterMutationVariables>(DeleteCoreViewFilterDocument, options);
      }
export type DeleteCoreViewFilterMutationHookResult = ReturnType<typeof useDeleteCoreViewFilterMutation>;
export type DeleteCoreViewFilterMutationResult = Apollo.MutationResult<DeleteCoreViewFilterMutation>;
export type DeleteCoreViewFilterMutationOptions = Apollo.BaseMutationOptions<DeleteCoreViewFilterMutation, DeleteCoreViewFilterMutationVariables>;
export const DeleteCoreViewFilterGroupDocument = gql`
    mutation DeleteCoreViewFilterGroup($id: String!) {
  deleteCoreViewFilterGroup(id: $id)
}
    `;
export type DeleteCoreViewFilterGroupMutationFn = Apollo.MutationFunction<DeleteCoreViewFilterGroupMutation, DeleteCoreViewFilterGroupMutationVariables>;

/**
 * __useDeleteCoreViewFilterGroupMutation__
 *
 * To run a mutation, you first call `useDeleteCoreViewFilterGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCoreViewFilterGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCoreViewFilterGroupMutation, { data, loading, error }] = useDeleteCoreViewFilterGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCoreViewFilterGroupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCoreViewFilterGroupMutation, DeleteCoreViewFilterGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCoreViewFilterGroupMutation, DeleteCoreViewFilterGroupMutationVariables>(DeleteCoreViewFilterGroupDocument, options);
      }
export type DeleteCoreViewFilterGroupMutationHookResult = ReturnType<typeof useDeleteCoreViewFilterGroupMutation>;
export type DeleteCoreViewFilterGroupMutationResult = Apollo.MutationResult<DeleteCoreViewFilterGroupMutation>;
export type DeleteCoreViewFilterGroupMutationOptions = Apollo.BaseMutationOptions<DeleteCoreViewFilterGroupMutation, DeleteCoreViewFilterGroupMutationVariables>;
export const DeleteCoreViewGroupDocument = gql`
    mutation DeleteCoreViewGroup($input: DeleteViewGroupInput!) {
  deleteCoreViewGroup(input: $input) {
    ...ViewGroupFragment
  }
}
    ${ViewGroupFragmentFragmentDoc}`;
export type DeleteCoreViewGroupMutationFn = Apollo.MutationFunction<DeleteCoreViewGroupMutation, DeleteCoreViewGroupMutationVariables>;

/**
 * __useDeleteCoreViewGroupMutation__
 *
 * To run a mutation, you first call `useDeleteCoreViewGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCoreViewGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCoreViewGroupMutation, { data, loading, error }] = useDeleteCoreViewGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteCoreViewGroupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCoreViewGroupMutation, DeleteCoreViewGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCoreViewGroupMutation, DeleteCoreViewGroupMutationVariables>(DeleteCoreViewGroupDocument, options);
      }
export type DeleteCoreViewGroupMutationHookResult = ReturnType<typeof useDeleteCoreViewGroupMutation>;
export type DeleteCoreViewGroupMutationResult = Apollo.MutationResult<DeleteCoreViewGroupMutation>;
export type DeleteCoreViewGroupMutationOptions = Apollo.BaseMutationOptions<DeleteCoreViewGroupMutation, DeleteCoreViewGroupMutationVariables>;
export const DeleteCoreViewSortDocument = gql`
    mutation DeleteCoreViewSort($id: String!) {
  deleteCoreViewSort(id: $id)
}
    `;
export type DeleteCoreViewSortMutationFn = Apollo.MutationFunction<DeleteCoreViewSortMutation, DeleteCoreViewSortMutationVariables>;

/**
 * __useDeleteCoreViewSortMutation__
 *
 * To run a mutation, you first call `useDeleteCoreViewSortMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCoreViewSortMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCoreViewSortMutation, { data, loading, error }] = useDeleteCoreViewSortMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCoreViewSortMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCoreViewSortMutation, DeleteCoreViewSortMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCoreViewSortMutation, DeleteCoreViewSortMutationVariables>(DeleteCoreViewSortDocument, options);
      }
export type DeleteCoreViewSortMutationHookResult = ReturnType<typeof useDeleteCoreViewSortMutation>;
export type DeleteCoreViewSortMutationResult = Apollo.MutationResult<DeleteCoreViewSortMutation>;
export type DeleteCoreViewSortMutationOptions = Apollo.BaseMutationOptions<DeleteCoreViewSortMutation, DeleteCoreViewSortMutationVariables>;
export const DestroyCoreViewDocument = gql`
    mutation DestroyCoreView($id: String!) {
  destroyCoreView(id: $id)
}
    `;
export type DestroyCoreViewMutationFn = Apollo.MutationFunction<DestroyCoreViewMutation, DestroyCoreViewMutationVariables>;

/**
 * __useDestroyCoreViewMutation__
 *
 * To run a mutation, you first call `useDestroyCoreViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroyCoreViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroyCoreViewMutation, { data, loading, error }] = useDestroyCoreViewMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDestroyCoreViewMutation(baseOptions?: Apollo.MutationHookOptions<DestroyCoreViewMutation, DestroyCoreViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DestroyCoreViewMutation, DestroyCoreViewMutationVariables>(DestroyCoreViewDocument, options);
      }
export type DestroyCoreViewMutationHookResult = ReturnType<typeof useDestroyCoreViewMutation>;
export type DestroyCoreViewMutationResult = Apollo.MutationResult<DestroyCoreViewMutation>;
export type DestroyCoreViewMutationOptions = Apollo.BaseMutationOptions<DestroyCoreViewMutation, DestroyCoreViewMutationVariables>;
export const DestroyCoreViewFieldDocument = gql`
    mutation DestroyCoreViewField($input: DestroyViewFieldInput!) {
  destroyCoreViewField(input: $input) {
    ...ViewFieldFragment
  }
}
    ${ViewFieldFragmentFragmentDoc}`;
export type DestroyCoreViewFieldMutationFn = Apollo.MutationFunction<DestroyCoreViewFieldMutation, DestroyCoreViewFieldMutationVariables>;

/**
 * __useDestroyCoreViewFieldMutation__
 *
 * To run a mutation, you first call `useDestroyCoreViewFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroyCoreViewFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroyCoreViewFieldMutation, { data, loading, error }] = useDestroyCoreViewFieldMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDestroyCoreViewFieldMutation(baseOptions?: Apollo.MutationHookOptions<DestroyCoreViewFieldMutation, DestroyCoreViewFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DestroyCoreViewFieldMutation, DestroyCoreViewFieldMutationVariables>(DestroyCoreViewFieldDocument, options);
      }
export type DestroyCoreViewFieldMutationHookResult = ReturnType<typeof useDestroyCoreViewFieldMutation>;
export type DestroyCoreViewFieldMutationResult = Apollo.MutationResult<DestroyCoreViewFieldMutation>;
export type DestroyCoreViewFieldMutationOptions = Apollo.BaseMutationOptions<DestroyCoreViewFieldMutation, DestroyCoreViewFieldMutationVariables>;
export const DestroyCoreViewFilterDocument = gql`
    mutation DestroyCoreViewFilter($input: DestroyViewFilterInput!) {
  destroyCoreViewFilter(input: $input) {
    ...ViewFilterFragment
  }
}
    ${ViewFilterFragmentFragmentDoc}`;
export type DestroyCoreViewFilterMutationFn = Apollo.MutationFunction<DestroyCoreViewFilterMutation, DestroyCoreViewFilterMutationVariables>;

/**
 * __useDestroyCoreViewFilterMutation__
 *
 * To run a mutation, you first call `useDestroyCoreViewFilterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroyCoreViewFilterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroyCoreViewFilterMutation, { data, loading, error }] = useDestroyCoreViewFilterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDestroyCoreViewFilterMutation(baseOptions?: Apollo.MutationHookOptions<DestroyCoreViewFilterMutation, DestroyCoreViewFilterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DestroyCoreViewFilterMutation, DestroyCoreViewFilterMutationVariables>(DestroyCoreViewFilterDocument, options);
      }
export type DestroyCoreViewFilterMutationHookResult = ReturnType<typeof useDestroyCoreViewFilterMutation>;
export type DestroyCoreViewFilterMutationResult = Apollo.MutationResult<DestroyCoreViewFilterMutation>;
export type DestroyCoreViewFilterMutationOptions = Apollo.BaseMutationOptions<DestroyCoreViewFilterMutation, DestroyCoreViewFilterMutationVariables>;
export const DestroyCoreViewFilterGroupDocument = gql`
    mutation DestroyCoreViewFilterGroup($id: String!) {
  destroyCoreViewFilterGroup(id: $id)
}
    `;
export type DestroyCoreViewFilterGroupMutationFn = Apollo.MutationFunction<DestroyCoreViewFilterGroupMutation, DestroyCoreViewFilterGroupMutationVariables>;

/**
 * __useDestroyCoreViewFilterGroupMutation__
 *
 * To run a mutation, you first call `useDestroyCoreViewFilterGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroyCoreViewFilterGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroyCoreViewFilterGroupMutation, { data, loading, error }] = useDestroyCoreViewFilterGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDestroyCoreViewFilterGroupMutation(baseOptions?: Apollo.MutationHookOptions<DestroyCoreViewFilterGroupMutation, DestroyCoreViewFilterGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DestroyCoreViewFilterGroupMutation, DestroyCoreViewFilterGroupMutationVariables>(DestroyCoreViewFilterGroupDocument, options);
      }
export type DestroyCoreViewFilterGroupMutationHookResult = ReturnType<typeof useDestroyCoreViewFilterGroupMutation>;
export type DestroyCoreViewFilterGroupMutationResult = Apollo.MutationResult<DestroyCoreViewFilterGroupMutation>;
export type DestroyCoreViewFilterGroupMutationOptions = Apollo.BaseMutationOptions<DestroyCoreViewFilterGroupMutation, DestroyCoreViewFilterGroupMutationVariables>;
export const DestroyCoreViewGroupDocument = gql`
    mutation DestroyCoreViewGroup($input: DestroyViewGroupInput!) {
  destroyCoreViewGroup(input: $input) {
    ...ViewGroupFragment
  }
}
    ${ViewGroupFragmentFragmentDoc}`;
export type DestroyCoreViewGroupMutationFn = Apollo.MutationFunction<DestroyCoreViewGroupMutation, DestroyCoreViewGroupMutationVariables>;

/**
 * __useDestroyCoreViewGroupMutation__
 *
 * To run a mutation, you first call `useDestroyCoreViewGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroyCoreViewGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroyCoreViewGroupMutation, { data, loading, error }] = useDestroyCoreViewGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDestroyCoreViewGroupMutation(baseOptions?: Apollo.MutationHookOptions<DestroyCoreViewGroupMutation, DestroyCoreViewGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DestroyCoreViewGroupMutation, DestroyCoreViewGroupMutationVariables>(DestroyCoreViewGroupDocument, options);
      }
export type DestroyCoreViewGroupMutationHookResult = ReturnType<typeof useDestroyCoreViewGroupMutation>;
export type DestroyCoreViewGroupMutationResult = Apollo.MutationResult<DestroyCoreViewGroupMutation>;
export type DestroyCoreViewGroupMutationOptions = Apollo.BaseMutationOptions<DestroyCoreViewGroupMutation, DestroyCoreViewGroupMutationVariables>;
export const DestroyCoreViewSortDocument = gql`
    mutation DestroyCoreViewSort($id: String!) {
  destroyCoreViewSort(id: $id)
}
    `;
export type DestroyCoreViewSortMutationFn = Apollo.MutationFunction<DestroyCoreViewSortMutation, DestroyCoreViewSortMutationVariables>;

/**
 * __useDestroyCoreViewSortMutation__
 *
 * To run a mutation, you first call `useDestroyCoreViewSortMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroyCoreViewSortMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroyCoreViewSortMutation, { data, loading, error }] = useDestroyCoreViewSortMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDestroyCoreViewSortMutation(baseOptions?: Apollo.MutationHookOptions<DestroyCoreViewSortMutation, DestroyCoreViewSortMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DestroyCoreViewSortMutation, DestroyCoreViewSortMutationVariables>(DestroyCoreViewSortDocument, options);
      }
export type DestroyCoreViewSortMutationHookResult = ReturnType<typeof useDestroyCoreViewSortMutation>;
export type DestroyCoreViewSortMutationResult = Apollo.MutationResult<DestroyCoreViewSortMutation>;
export type DestroyCoreViewSortMutationOptions = Apollo.BaseMutationOptions<DestroyCoreViewSortMutation, DestroyCoreViewSortMutationVariables>;
export const UpdateCoreViewDocument = gql`
    mutation UpdateCoreView($id: String!, $input: UpdateViewInput!) {
  updateCoreView(id: $id, input: $input) {
    ...ViewFragment
  }
}
    ${ViewFragmentFragmentDoc}`;
export type UpdateCoreViewMutationFn = Apollo.MutationFunction<UpdateCoreViewMutation, UpdateCoreViewMutationVariables>;

/**
 * __useUpdateCoreViewMutation__
 *
 * To run a mutation, you first call `useUpdateCoreViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCoreViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCoreViewMutation, { data, loading, error }] = useUpdateCoreViewMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCoreViewMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCoreViewMutation, UpdateCoreViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCoreViewMutation, UpdateCoreViewMutationVariables>(UpdateCoreViewDocument, options);
      }
export type UpdateCoreViewMutationHookResult = ReturnType<typeof useUpdateCoreViewMutation>;
export type UpdateCoreViewMutationResult = Apollo.MutationResult<UpdateCoreViewMutation>;
export type UpdateCoreViewMutationOptions = Apollo.BaseMutationOptions<UpdateCoreViewMutation, UpdateCoreViewMutationVariables>;
export const UpdateCoreViewFieldDocument = gql`
    mutation UpdateCoreViewField($input: UpdateViewFieldInput!) {
  updateCoreViewField(input: $input) {
    ...ViewFieldFragment
  }
}
    ${ViewFieldFragmentFragmentDoc}`;
export type UpdateCoreViewFieldMutationFn = Apollo.MutationFunction<UpdateCoreViewFieldMutation, UpdateCoreViewFieldMutationVariables>;

/**
 * __useUpdateCoreViewFieldMutation__
 *
 * To run a mutation, you first call `useUpdateCoreViewFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCoreViewFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCoreViewFieldMutation, { data, loading, error }] = useUpdateCoreViewFieldMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCoreViewFieldMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCoreViewFieldMutation, UpdateCoreViewFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCoreViewFieldMutation, UpdateCoreViewFieldMutationVariables>(UpdateCoreViewFieldDocument, options);
      }
export type UpdateCoreViewFieldMutationHookResult = ReturnType<typeof useUpdateCoreViewFieldMutation>;
export type UpdateCoreViewFieldMutationResult = Apollo.MutationResult<UpdateCoreViewFieldMutation>;
export type UpdateCoreViewFieldMutationOptions = Apollo.BaseMutationOptions<UpdateCoreViewFieldMutation, UpdateCoreViewFieldMutationVariables>;
export const UpdateCoreViewFilterDocument = gql`
    mutation UpdateCoreViewFilter($input: UpdateViewFilterInput!) {
  updateCoreViewFilter(input: $input) {
    ...ViewFilterFragment
  }
}
    ${ViewFilterFragmentFragmentDoc}`;
export type UpdateCoreViewFilterMutationFn = Apollo.MutationFunction<UpdateCoreViewFilterMutation, UpdateCoreViewFilterMutationVariables>;

/**
 * __useUpdateCoreViewFilterMutation__
 *
 * To run a mutation, you first call `useUpdateCoreViewFilterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCoreViewFilterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCoreViewFilterMutation, { data, loading, error }] = useUpdateCoreViewFilterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCoreViewFilterMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCoreViewFilterMutation, UpdateCoreViewFilterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCoreViewFilterMutation, UpdateCoreViewFilterMutationVariables>(UpdateCoreViewFilterDocument, options);
      }
export type UpdateCoreViewFilterMutationHookResult = ReturnType<typeof useUpdateCoreViewFilterMutation>;
export type UpdateCoreViewFilterMutationResult = Apollo.MutationResult<UpdateCoreViewFilterMutation>;
export type UpdateCoreViewFilterMutationOptions = Apollo.BaseMutationOptions<UpdateCoreViewFilterMutation, UpdateCoreViewFilterMutationVariables>;
export const UpdateCoreViewFilterGroupDocument = gql`
    mutation UpdateCoreViewFilterGroup($id: String!, $input: UpdateViewFilterGroupInput!) {
  updateCoreViewFilterGroup(id: $id, input: $input) {
    ...ViewFilterGroupFragment
  }
}
    ${ViewFilterGroupFragmentFragmentDoc}`;
export type UpdateCoreViewFilterGroupMutationFn = Apollo.MutationFunction<UpdateCoreViewFilterGroupMutation, UpdateCoreViewFilterGroupMutationVariables>;

/**
 * __useUpdateCoreViewFilterGroupMutation__
 *
 * To run a mutation, you first call `useUpdateCoreViewFilterGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCoreViewFilterGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCoreViewFilterGroupMutation, { data, loading, error }] = useUpdateCoreViewFilterGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCoreViewFilterGroupMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCoreViewFilterGroupMutation, UpdateCoreViewFilterGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCoreViewFilterGroupMutation, UpdateCoreViewFilterGroupMutationVariables>(UpdateCoreViewFilterGroupDocument, options);
      }
export type UpdateCoreViewFilterGroupMutationHookResult = ReturnType<typeof useUpdateCoreViewFilterGroupMutation>;
export type UpdateCoreViewFilterGroupMutationResult = Apollo.MutationResult<UpdateCoreViewFilterGroupMutation>;
export type UpdateCoreViewFilterGroupMutationOptions = Apollo.BaseMutationOptions<UpdateCoreViewFilterGroupMutation, UpdateCoreViewFilterGroupMutationVariables>;
export const UpdateCoreViewGroupDocument = gql`
    mutation UpdateCoreViewGroup($input: UpdateViewGroupInput!) {
  updateCoreViewGroup(input: $input) {
    ...ViewGroupFragment
  }
}
    ${ViewGroupFragmentFragmentDoc}`;
export type UpdateCoreViewGroupMutationFn = Apollo.MutationFunction<UpdateCoreViewGroupMutation, UpdateCoreViewGroupMutationVariables>;

/**
 * __useUpdateCoreViewGroupMutation__
 *
 * To run a mutation, you first call `useUpdateCoreViewGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCoreViewGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCoreViewGroupMutation, { data, loading, error }] = useUpdateCoreViewGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCoreViewGroupMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCoreViewGroupMutation, UpdateCoreViewGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCoreViewGroupMutation, UpdateCoreViewGroupMutationVariables>(UpdateCoreViewGroupDocument, options);
      }
export type UpdateCoreViewGroupMutationHookResult = ReturnType<typeof useUpdateCoreViewGroupMutation>;
export type UpdateCoreViewGroupMutationResult = Apollo.MutationResult<UpdateCoreViewGroupMutation>;
export type UpdateCoreViewGroupMutationOptions = Apollo.BaseMutationOptions<UpdateCoreViewGroupMutation, UpdateCoreViewGroupMutationVariables>;
export const UpdateCoreViewSortDocument = gql`
    mutation UpdateCoreViewSort($id: String!, $input: UpdateViewSortInput!) {
  updateCoreViewSort(id: $id, input: $input) {
    ...ViewSortFragment
  }
}
    ${ViewSortFragmentFragmentDoc}`;
export type UpdateCoreViewSortMutationFn = Apollo.MutationFunction<UpdateCoreViewSortMutation, UpdateCoreViewSortMutationVariables>;

/**
 * __useUpdateCoreViewSortMutation__
 *
 * To run a mutation, you first call `useUpdateCoreViewSortMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCoreViewSortMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCoreViewSortMutation, { data, loading, error }] = useUpdateCoreViewSortMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCoreViewSortMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCoreViewSortMutation, UpdateCoreViewSortMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCoreViewSortMutation, UpdateCoreViewSortMutationVariables>(UpdateCoreViewSortDocument, options);
      }
export type UpdateCoreViewSortMutationHookResult = ReturnType<typeof useUpdateCoreViewSortMutation>;
export type UpdateCoreViewSortMutationResult = Apollo.MutationResult<UpdateCoreViewSortMutation>;
export type UpdateCoreViewSortMutationOptions = Apollo.BaseMutationOptions<UpdateCoreViewSortMutation, UpdateCoreViewSortMutationVariables>;
export const FindAllCoreViewsDocument = gql`
    query FindAllCoreViews {
  getCoreViews {
    ...ViewFragment
  }
}
    ${ViewFragmentFragmentDoc}`;

/**
 * __useFindAllCoreViewsQuery__
 *
 * To run a query within a React component, call `useFindAllCoreViewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllCoreViewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllCoreViewsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindAllCoreViewsQuery(baseOptions?: Apollo.QueryHookOptions<FindAllCoreViewsQuery, FindAllCoreViewsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllCoreViewsQuery, FindAllCoreViewsQueryVariables>(FindAllCoreViewsDocument, options);
      }
export function useFindAllCoreViewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllCoreViewsQuery, FindAllCoreViewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllCoreViewsQuery, FindAllCoreViewsQueryVariables>(FindAllCoreViewsDocument, options);
        }
export type FindAllCoreViewsQueryHookResult = ReturnType<typeof useFindAllCoreViewsQuery>;
export type FindAllCoreViewsLazyQueryHookResult = ReturnType<typeof useFindAllCoreViewsLazyQuery>;
export type FindAllCoreViewsQueryResult = Apollo.QueryResult<FindAllCoreViewsQuery, FindAllCoreViewsQueryVariables>;
export const FindManyCoreViewFieldsDocument = gql`
    query FindManyCoreViewFields($viewId: String!) {
  getCoreViewFields(viewId: $viewId) {
    ...ViewFieldFragment
  }
}
    ${ViewFieldFragmentFragmentDoc}`;

/**
 * __useFindManyCoreViewFieldsQuery__
 *
 * To run a query within a React component, call `useFindManyCoreViewFieldsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyCoreViewFieldsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyCoreViewFieldsQuery({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useFindManyCoreViewFieldsQuery(baseOptions: Apollo.QueryHookOptions<FindManyCoreViewFieldsQuery, FindManyCoreViewFieldsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyCoreViewFieldsQuery, FindManyCoreViewFieldsQueryVariables>(FindManyCoreViewFieldsDocument, options);
      }
export function useFindManyCoreViewFieldsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyCoreViewFieldsQuery, FindManyCoreViewFieldsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyCoreViewFieldsQuery, FindManyCoreViewFieldsQueryVariables>(FindManyCoreViewFieldsDocument, options);
        }
export type FindManyCoreViewFieldsQueryHookResult = ReturnType<typeof useFindManyCoreViewFieldsQuery>;
export type FindManyCoreViewFieldsLazyQueryHookResult = ReturnType<typeof useFindManyCoreViewFieldsLazyQuery>;
export type FindManyCoreViewFieldsQueryResult = Apollo.QueryResult<FindManyCoreViewFieldsQuery, FindManyCoreViewFieldsQueryVariables>;
export const FindManyCoreViewFilterGroupsDocument = gql`
    query FindManyCoreViewFilterGroups($viewId: String) {
  getCoreViewFilterGroups(viewId: $viewId) {
    ...ViewFilterGroupFragment
  }
}
    ${ViewFilterGroupFragmentFragmentDoc}`;

/**
 * __useFindManyCoreViewFilterGroupsQuery__
 *
 * To run a query within a React component, call `useFindManyCoreViewFilterGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyCoreViewFilterGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyCoreViewFilterGroupsQuery({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useFindManyCoreViewFilterGroupsQuery(baseOptions?: Apollo.QueryHookOptions<FindManyCoreViewFilterGroupsQuery, FindManyCoreViewFilterGroupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyCoreViewFilterGroupsQuery, FindManyCoreViewFilterGroupsQueryVariables>(FindManyCoreViewFilterGroupsDocument, options);
      }
export function useFindManyCoreViewFilterGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyCoreViewFilterGroupsQuery, FindManyCoreViewFilterGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyCoreViewFilterGroupsQuery, FindManyCoreViewFilterGroupsQueryVariables>(FindManyCoreViewFilterGroupsDocument, options);
        }
export type FindManyCoreViewFilterGroupsQueryHookResult = ReturnType<typeof useFindManyCoreViewFilterGroupsQuery>;
export type FindManyCoreViewFilterGroupsLazyQueryHookResult = ReturnType<typeof useFindManyCoreViewFilterGroupsLazyQuery>;
export type FindManyCoreViewFilterGroupsQueryResult = Apollo.QueryResult<FindManyCoreViewFilterGroupsQuery, FindManyCoreViewFilterGroupsQueryVariables>;
export const FindManyCoreViewFiltersDocument = gql`
    query FindManyCoreViewFilters($viewId: String) {
  getCoreViewFilters(viewId: $viewId) {
    ...ViewFilterFragment
  }
}
    ${ViewFilterFragmentFragmentDoc}`;

/**
 * __useFindManyCoreViewFiltersQuery__
 *
 * To run a query within a React component, call `useFindManyCoreViewFiltersQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyCoreViewFiltersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyCoreViewFiltersQuery({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useFindManyCoreViewFiltersQuery(baseOptions?: Apollo.QueryHookOptions<FindManyCoreViewFiltersQuery, FindManyCoreViewFiltersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyCoreViewFiltersQuery, FindManyCoreViewFiltersQueryVariables>(FindManyCoreViewFiltersDocument, options);
      }
export function useFindManyCoreViewFiltersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyCoreViewFiltersQuery, FindManyCoreViewFiltersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyCoreViewFiltersQuery, FindManyCoreViewFiltersQueryVariables>(FindManyCoreViewFiltersDocument, options);
        }
export type FindManyCoreViewFiltersQueryHookResult = ReturnType<typeof useFindManyCoreViewFiltersQuery>;
export type FindManyCoreViewFiltersLazyQueryHookResult = ReturnType<typeof useFindManyCoreViewFiltersLazyQuery>;
export type FindManyCoreViewFiltersQueryResult = Apollo.QueryResult<FindManyCoreViewFiltersQuery, FindManyCoreViewFiltersQueryVariables>;
export const FindManyCoreViewGroupsDocument = gql`
    query FindManyCoreViewGroups($viewId: String) {
  getCoreViewGroups(viewId: $viewId) {
    ...ViewGroupFragment
  }
}
    ${ViewGroupFragmentFragmentDoc}`;

/**
 * __useFindManyCoreViewGroupsQuery__
 *
 * To run a query within a React component, call `useFindManyCoreViewGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyCoreViewGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyCoreViewGroupsQuery({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useFindManyCoreViewGroupsQuery(baseOptions?: Apollo.QueryHookOptions<FindManyCoreViewGroupsQuery, FindManyCoreViewGroupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyCoreViewGroupsQuery, FindManyCoreViewGroupsQueryVariables>(FindManyCoreViewGroupsDocument, options);
      }
export function useFindManyCoreViewGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyCoreViewGroupsQuery, FindManyCoreViewGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyCoreViewGroupsQuery, FindManyCoreViewGroupsQueryVariables>(FindManyCoreViewGroupsDocument, options);
        }
export type FindManyCoreViewGroupsQueryHookResult = ReturnType<typeof useFindManyCoreViewGroupsQuery>;
export type FindManyCoreViewGroupsLazyQueryHookResult = ReturnType<typeof useFindManyCoreViewGroupsLazyQuery>;
export type FindManyCoreViewGroupsQueryResult = Apollo.QueryResult<FindManyCoreViewGroupsQuery, FindManyCoreViewGroupsQueryVariables>;
export const FindManyCoreViewSortsDocument = gql`
    query FindManyCoreViewSorts($viewId: String) {
  getCoreViewSorts(viewId: $viewId) {
    ...ViewSortFragment
  }
}
    ${ViewSortFragmentFragmentDoc}`;

/**
 * __useFindManyCoreViewSortsQuery__
 *
 * To run a query within a React component, call `useFindManyCoreViewSortsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyCoreViewSortsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyCoreViewSortsQuery({
 *   variables: {
 *      viewId: // value for 'viewId'
 *   },
 * });
 */
export function useFindManyCoreViewSortsQuery(baseOptions?: Apollo.QueryHookOptions<FindManyCoreViewSortsQuery, FindManyCoreViewSortsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyCoreViewSortsQuery, FindManyCoreViewSortsQueryVariables>(FindManyCoreViewSortsDocument, options);
      }
export function useFindManyCoreViewSortsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyCoreViewSortsQuery, FindManyCoreViewSortsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyCoreViewSortsQuery, FindManyCoreViewSortsQueryVariables>(FindManyCoreViewSortsDocument, options);
        }
export type FindManyCoreViewSortsQueryHookResult = ReturnType<typeof useFindManyCoreViewSortsQuery>;
export type FindManyCoreViewSortsLazyQueryHookResult = ReturnType<typeof useFindManyCoreViewSortsLazyQuery>;
export type FindManyCoreViewSortsQueryResult = Apollo.QueryResult<FindManyCoreViewSortsQuery, FindManyCoreViewSortsQueryVariables>;
export const FindManyCoreViewsDocument = gql`
    query FindManyCoreViews($objectMetadataId: String) {
  getCoreViews(objectMetadataId: $objectMetadataId) {
    ...ViewFragment
  }
}
    ${ViewFragmentFragmentDoc}`;

/**
 * __useFindManyCoreViewsQuery__
 *
 * To run a query within a React component, call `useFindManyCoreViewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindManyCoreViewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindManyCoreViewsQuery({
 *   variables: {
 *      objectMetadataId: // value for 'objectMetadataId'
 *   },
 * });
 */
export function useFindManyCoreViewsQuery(baseOptions?: Apollo.QueryHookOptions<FindManyCoreViewsQuery, FindManyCoreViewsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindManyCoreViewsQuery, FindManyCoreViewsQueryVariables>(FindManyCoreViewsDocument, options);
      }
export function useFindManyCoreViewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindManyCoreViewsQuery, FindManyCoreViewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindManyCoreViewsQuery, FindManyCoreViewsQueryVariables>(FindManyCoreViewsDocument, options);
        }
export type FindManyCoreViewsQueryHookResult = ReturnType<typeof useFindManyCoreViewsQuery>;
export type FindManyCoreViewsLazyQueryHookResult = ReturnType<typeof useFindManyCoreViewsLazyQuery>;
export type FindManyCoreViewsQueryResult = Apollo.QueryResult<FindManyCoreViewsQuery, FindManyCoreViewsQueryVariables>;
export const FindOneCoreViewDocument = gql`
    query FindOneCoreView($id: String!) {
  getCoreView(id: $id) {
    ...ViewFragment
  }
}
    ${ViewFragmentFragmentDoc}`;

/**
 * __useFindOneCoreViewQuery__
 *
 * To run a query within a React component, call `useFindOneCoreViewQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneCoreViewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneCoreViewQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneCoreViewQuery(baseOptions: Apollo.QueryHookOptions<FindOneCoreViewQuery, FindOneCoreViewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneCoreViewQuery, FindOneCoreViewQueryVariables>(FindOneCoreViewDocument, options);
      }
export function useFindOneCoreViewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneCoreViewQuery, FindOneCoreViewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneCoreViewQuery, FindOneCoreViewQueryVariables>(FindOneCoreViewDocument, options);
        }
export type FindOneCoreViewQueryHookResult = ReturnType<typeof useFindOneCoreViewQuery>;
export type FindOneCoreViewLazyQueryHookResult = ReturnType<typeof useFindOneCoreViewLazyQuery>;
export type FindOneCoreViewQueryResult = Apollo.QueryResult<FindOneCoreViewQuery, FindOneCoreViewQueryVariables>;
export const FindOneCoreViewFieldDocument = gql`
    query FindOneCoreViewField($id: String!) {
  getCoreViewField(id: $id) {
    ...ViewFieldFragment
  }
}
    ${ViewFieldFragmentFragmentDoc}`;

/**
 * __useFindOneCoreViewFieldQuery__
 *
 * To run a query within a React component, call `useFindOneCoreViewFieldQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneCoreViewFieldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneCoreViewFieldQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneCoreViewFieldQuery(baseOptions: Apollo.QueryHookOptions<FindOneCoreViewFieldQuery, FindOneCoreViewFieldQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneCoreViewFieldQuery, FindOneCoreViewFieldQueryVariables>(FindOneCoreViewFieldDocument, options);
      }
export function useFindOneCoreViewFieldLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneCoreViewFieldQuery, FindOneCoreViewFieldQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneCoreViewFieldQuery, FindOneCoreViewFieldQueryVariables>(FindOneCoreViewFieldDocument, options);
        }
export type FindOneCoreViewFieldQueryHookResult = ReturnType<typeof useFindOneCoreViewFieldQuery>;
export type FindOneCoreViewFieldLazyQueryHookResult = ReturnType<typeof useFindOneCoreViewFieldLazyQuery>;
export type FindOneCoreViewFieldQueryResult = Apollo.QueryResult<FindOneCoreViewFieldQuery, FindOneCoreViewFieldQueryVariables>;
export const FindOneCoreViewFilterDocument = gql`
    query FindOneCoreViewFilter($id: String!) {
  getCoreViewFilter(id: $id) {
    ...ViewFilterFragment
  }
}
    ${ViewFilterFragmentFragmentDoc}`;

/**
 * __useFindOneCoreViewFilterQuery__
 *
 * To run a query within a React component, call `useFindOneCoreViewFilterQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneCoreViewFilterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneCoreViewFilterQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneCoreViewFilterQuery(baseOptions: Apollo.QueryHookOptions<FindOneCoreViewFilterQuery, FindOneCoreViewFilterQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneCoreViewFilterQuery, FindOneCoreViewFilterQueryVariables>(FindOneCoreViewFilterDocument, options);
      }
export function useFindOneCoreViewFilterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneCoreViewFilterQuery, FindOneCoreViewFilterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneCoreViewFilterQuery, FindOneCoreViewFilterQueryVariables>(FindOneCoreViewFilterDocument, options);
        }
export type FindOneCoreViewFilterQueryHookResult = ReturnType<typeof useFindOneCoreViewFilterQuery>;
export type FindOneCoreViewFilterLazyQueryHookResult = ReturnType<typeof useFindOneCoreViewFilterLazyQuery>;
export type FindOneCoreViewFilterQueryResult = Apollo.QueryResult<FindOneCoreViewFilterQuery, FindOneCoreViewFilterQueryVariables>;
export const FindOneCoreViewFilterGroupDocument = gql`
    query FindOneCoreViewFilterGroup($id: String!) {
  getCoreViewFilterGroup(id: $id) {
    ...ViewFilterGroupFragment
  }
}
    ${ViewFilterGroupFragmentFragmentDoc}`;

/**
 * __useFindOneCoreViewFilterGroupQuery__
 *
 * To run a query within a React component, call `useFindOneCoreViewFilterGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneCoreViewFilterGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneCoreViewFilterGroupQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneCoreViewFilterGroupQuery(baseOptions: Apollo.QueryHookOptions<FindOneCoreViewFilterGroupQuery, FindOneCoreViewFilterGroupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneCoreViewFilterGroupQuery, FindOneCoreViewFilterGroupQueryVariables>(FindOneCoreViewFilterGroupDocument, options);
      }
export function useFindOneCoreViewFilterGroupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneCoreViewFilterGroupQuery, FindOneCoreViewFilterGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneCoreViewFilterGroupQuery, FindOneCoreViewFilterGroupQueryVariables>(FindOneCoreViewFilterGroupDocument, options);
        }
export type FindOneCoreViewFilterGroupQueryHookResult = ReturnType<typeof useFindOneCoreViewFilterGroupQuery>;
export type FindOneCoreViewFilterGroupLazyQueryHookResult = ReturnType<typeof useFindOneCoreViewFilterGroupLazyQuery>;
export type FindOneCoreViewFilterGroupQueryResult = Apollo.QueryResult<FindOneCoreViewFilterGroupQuery, FindOneCoreViewFilterGroupQueryVariables>;
export const FindOneCoreViewGroupDocument = gql`
    query FindOneCoreViewGroup($id: String!) {
  getCoreViewGroup(id: $id) {
    ...ViewGroupFragment
  }
}
    ${ViewGroupFragmentFragmentDoc}`;

/**
 * __useFindOneCoreViewGroupQuery__
 *
 * To run a query within a React component, call `useFindOneCoreViewGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneCoreViewGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneCoreViewGroupQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneCoreViewGroupQuery(baseOptions: Apollo.QueryHookOptions<FindOneCoreViewGroupQuery, FindOneCoreViewGroupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneCoreViewGroupQuery, FindOneCoreViewGroupQueryVariables>(FindOneCoreViewGroupDocument, options);
      }
export function useFindOneCoreViewGroupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneCoreViewGroupQuery, FindOneCoreViewGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneCoreViewGroupQuery, FindOneCoreViewGroupQueryVariables>(FindOneCoreViewGroupDocument, options);
        }
export type FindOneCoreViewGroupQueryHookResult = ReturnType<typeof useFindOneCoreViewGroupQuery>;
export type FindOneCoreViewGroupLazyQueryHookResult = ReturnType<typeof useFindOneCoreViewGroupLazyQuery>;
export type FindOneCoreViewGroupQueryResult = Apollo.QueryResult<FindOneCoreViewGroupQuery, FindOneCoreViewGroupQueryVariables>;
export const FindOneCoreViewSortDocument = gql`
    query FindOneCoreViewSort($id: String!) {
  getCoreViewSort(id: $id) {
    ...ViewSortFragment
  }
}
    ${ViewSortFragmentFragmentDoc}`;

/**
 * __useFindOneCoreViewSortQuery__
 *
 * To run a query within a React component, call `useFindOneCoreViewSortQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindOneCoreViewSortQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindOneCoreViewSortQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindOneCoreViewSortQuery(baseOptions: Apollo.QueryHookOptions<FindOneCoreViewSortQuery, FindOneCoreViewSortQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindOneCoreViewSortQuery, FindOneCoreViewSortQueryVariables>(FindOneCoreViewSortDocument, options);
      }
export function useFindOneCoreViewSortLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindOneCoreViewSortQuery, FindOneCoreViewSortQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindOneCoreViewSortQuery, FindOneCoreViewSortQueryVariables>(FindOneCoreViewSortDocument, options);
        }
export type FindOneCoreViewSortQueryHookResult = ReturnType<typeof useFindOneCoreViewSortQuery>;
export type FindOneCoreViewSortLazyQueryHookResult = ReturnType<typeof useFindOneCoreViewSortLazyQuery>;
export type FindOneCoreViewSortQueryResult = Apollo.QueryResult<FindOneCoreViewSortQuery, FindOneCoreViewSortQueryVariables>;
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
export const DeleteWorkspaceInvitationDocument = gql`
    mutation DeleteWorkspaceInvitation($appTokenId: String!) {
  deleteWorkspaceInvitation(appTokenId: $appTokenId)
}
    `;
export type DeleteWorkspaceInvitationMutationFn = Apollo.MutationFunction<DeleteWorkspaceInvitationMutation, DeleteWorkspaceInvitationMutationVariables>;

/**
 * __useDeleteWorkspaceInvitationMutation__
 *
 * To run a mutation, you first call `useDeleteWorkspaceInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWorkspaceInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWorkspaceInvitationMutation, { data, loading, error }] = useDeleteWorkspaceInvitationMutation({
 *   variables: {
 *      appTokenId: // value for 'appTokenId'
 *   },
 * });
 */
export function useDeleteWorkspaceInvitationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWorkspaceInvitationMutation, DeleteWorkspaceInvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWorkspaceInvitationMutation, DeleteWorkspaceInvitationMutationVariables>(DeleteWorkspaceInvitationDocument, options);
      }
export type DeleteWorkspaceInvitationMutationHookResult = ReturnType<typeof useDeleteWorkspaceInvitationMutation>;
export type DeleteWorkspaceInvitationMutationResult = Apollo.MutationResult<DeleteWorkspaceInvitationMutation>;
export type DeleteWorkspaceInvitationMutationOptions = Apollo.BaseMutationOptions<DeleteWorkspaceInvitationMutation, DeleteWorkspaceInvitationMutationVariables>;
export const ResendWorkspaceInvitationDocument = gql`
    mutation ResendWorkspaceInvitation($appTokenId: String!) {
  resendWorkspaceInvitation(appTokenId: $appTokenId) {
    success
    errors
    result {
      ... on WorkspaceInvitation {
        id
        email
        expiresAt
      }
    }
  }
}
    `;
export type ResendWorkspaceInvitationMutationFn = Apollo.MutationFunction<ResendWorkspaceInvitationMutation, ResendWorkspaceInvitationMutationVariables>;

/**
 * __useResendWorkspaceInvitationMutation__
 *
 * To run a mutation, you first call `useResendWorkspaceInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendWorkspaceInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendWorkspaceInvitationMutation, { data, loading, error }] = useResendWorkspaceInvitationMutation({
 *   variables: {
 *      appTokenId: // value for 'appTokenId'
 *   },
 * });
 */
export function useResendWorkspaceInvitationMutation(baseOptions?: Apollo.MutationHookOptions<ResendWorkspaceInvitationMutation, ResendWorkspaceInvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResendWorkspaceInvitationMutation, ResendWorkspaceInvitationMutationVariables>(ResendWorkspaceInvitationDocument, options);
      }
export type ResendWorkspaceInvitationMutationHookResult = ReturnType<typeof useResendWorkspaceInvitationMutation>;
export type ResendWorkspaceInvitationMutationResult = Apollo.MutationResult<ResendWorkspaceInvitationMutation>;
export type ResendWorkspaceInvitationMutationOptions = Apollo.BaseMutationOptions<ResendWorkspaceInvitationMutation, ResendWorkspaceInvitationMutationVariables>;
export const SendInvitationsDocument = gql`
    mutation SendInvitations($emails: [String!]!) {
  sendInvitations(emails: $emails) {
    success
    errors
    result {
      ... on WorkspaceInvitation {
        id
        email
        expiresAt
      }
    }
  }
}
    `;
export type SendInvitationsMutationFn = Apollo.MutationFunction<SendInvitationsMutation, SendInvitationsMutationVariables>;

/**
 * __useSendInvitationsMutation__
 *
 * To run a mutation, you first call `useSendInvitationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendInvitationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendInvitationsMutation, { data, loading, error }] = useSendInvitationsMutation({
 *   variables: {
 *      emails: // value for 'emails'
 *   },
 * });
 */
export function useSendInvitationsMutation(baseOptions?: Apollo.MutationHookOptions<SendInvitationsMutation, SendInvitationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendInvitationsMutation, SendInvitationsMutationVariables>(SendInvitationsDocument, options);
      }
export type SendInvitationsMutationHookResult = ReturnType<typeof useSendInvitationsMutation>;
export type SendInvitationsMutationResult = Apollo.MutationResult<SendInvitationsMutation>;
export type SendInvitationsMutationOptions = Apollo.BaseMutationOptions<SendInvitationsMutation, SendInvitationsMutationVariables>;
export const GetWorkspaceInvitationsDocument = gql`
    query GetWorkspaceInvitations {
  findWorkspaceInvitations {
    id
    email
    expiresAt
  }
}
    `;

/**
 * __useGetWorkspaceInvitationsQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceInvitationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceInvitationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceInvitationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWorkspaceInvitationsQuery(baseOptions?: Apollo.QueryHookOptions<GetWorkspaceInvitationsQuery, GetWorkspaceInvitationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceInvitationsQuery, GetWorkspaceInvitationsQueryVariables>(GetWorkspaceInvitationsDocument, options);
      }
export function useGetWorkspaceInvitationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceInvitationsQuery, GetWorkspaceInvitationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceInvitationsQuery, GetWorkspaceInvitationsQueryVariables>(GetWorkspaceInvitationsDocument, options);
        }
export type GetWorkspaceInvitationsQueryHookResult = ReturnType<typeof useGetWorkspaceInvitationsQuery>;
export type GetWorkspaceInvitationsLazyQueryHookResult = ReturnType<typeof useGetWorkspaceInvitationsLazyQuery>;
export type GetWorkspaceInvitationsQueryResult = Apollo.QueryResult<GetWorkspaceInvitationsQuery, GetWorkspaceInvitationsQueryVariables>;
export const ActivateWorkspaceDocument = gql`
    mutation ActivateWorkspace($input: ActivateWorkspaceInput!) {
  activateWorkspace(data: $input) {
    id
  }
}
    `;
export type ActivateWorkspaceMutationFn = Apollo.MutationFunction<ActivateWorkspaceMutation, ActivateWorkspaceMutationVariables>;

/**
 * __useActivateWorkspaceMutation__
 *
 * To run a mutation, you first call `useActivateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateWorkspaceMutation, { data, loading, error }] = useActivateWorkspaceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useActivateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<ActivateWorkspaceMutation, ActivateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ActivateWorkspaceMutation, ActivateWorkspaceMutationVariables>(ActivateWorkspaceDocument, options);
      }
export type ActivateWorkspaceMutationHookResult = ReturnType<typeof useActivateWorkspaceMutation>;
export type ActivateWorkspaceMutationResult = Apollo.MutationResult<ActivateWorkspaceMutation>;
export type ActivateWorkspaceMutationOptions = Apollo.BaseMutationOptions<ActivateWorkspaceMutation, ActivateWorkspaceMutationVariables>;
export const DeleteCurrentWorkspaceDocument = gql`
    mutation DeleteCurrentWorkspace {
  deleteCurrentWorkspace {
    id
  }
}
    `;
export type DeleteCurrentWorkspaceMutationFn = Apollo.MutationFunction<DeleteCurrentWorkspaceMutation, DeleteCurrentWorkspaceMutationVariables>;

/**
 * __useDeleteCurrentWorkspaceMutation__
 *
 * To run a mutation, you first call `useDeleteCurrentWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCurrentWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCurrentWorkspaceMutation, { data, loading, error }] = useDeleteCurrentWorkspaceMutation({
 *   variables: {
 *   },
 * });
 */
export function useDeleteCurrentWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCurrentWorkspaceMutation, DeleteCurrentWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCurrentWorkspaceMutation, DeleteCurrentWorkspaceMutationVariables>(DeleteCurrentWorkspaceDocument, options);
      }
export type DeleteCurrentWorkspaceMutationHookResult = ReturnType<typeof useDeleteCurrentWorkspaceMutation>;
export type DeleteCurrentWorkspaceMutationResult = Apollo.MutationResult<DeleteCurrentWorkspaceMutation>;
export type DeleteCurrentWorkspaceMutationOptions = Apollo.BaseMutationOptions<DeleteCurrentWorkspaceMutation, DeleteCurrentWorkspaceMutationVariables>;
export const UpdateWorkspaceDocument = gql`
    mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
  updateWorkspace(data: $input) {
    id
    customDomain
    subdomain
    displayName
    logo
    allowImpersonation
    isPublicInviteLinkEnabled
    isGoogleAuthEnabled
    isMicrosoftAuthEnabled
    isPasswordAuthEnabled
    isTwoFactorAuthenticationEnforced
    defaultRole {
      ...RoleFragment
    }
  }
}
    ${RoleFragmentFragmentDoc}`;
export type UpdateWorkspaceMutationFn = Apollo.MutationFunction<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;

/**
 * __useUpdateWorkspaceMutation__
 *
 * To run a mutation, you first call `useUpdateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkspaceMutation, { data, loading, error }] = useUpdateWorkspaceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>(UpdateWorkspaceDocument, options);
      }
export type UpdateWorkspaceMutationHookResult = ReturnType<typeof useUpdateWorkspaceMutation>;
export type UpdateWorkspaceMutationResult = Apollo.MutationResult<UpdateWorkspaceMutation>;
export type UpdateWorkspaceMutationOptions = Apollo.BaseMutationOptions<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;
export const UploadWorkspaceLogoDocument = gql`
    mutation UploadWorkspaceLogo($file: Upload!) {
  uploadWorkspaceLogo(file: $file) {
    path
    token
  }
}
    `;
export type UploadWorkspaceLogoMutationFn = Apollo.MutationFunction<UploadWorkspaceLogoMutation, UploadWorkspaceLogoMutationVariables>;

/**
 * __useUploadWorkspaceLogoMutation__
 *
 * To run a mutation, you first call `useUploadWorkspaceLogoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadWorkspaceLogoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadWorkspaceLogoMutation, { data, loading, error }] = useUploadWorkspaceLogoMutation({
 *   variables: {
 *      file: // value for 'file'
 *   },
 * });
 */
export function useUploadWorkspaceLogoMutation(baseOptions?: Apollo.MutationHookOptions<UploadWorkspaceLogoMutation, UploadWorkspaceLogoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadWorkspaceLogoMutation, UploadWorkspaceLogoMutationVariables>(UploadWorkspaceLogoDocument, options);
      }
export type UploadWorkspaceLogoMutationHookResult = ReturnType<typeof useUploadWorkspaceLogoMutation>;
export type UploadWorkspaceLogoMutationResult = Apollo.MutationResult<UploadWorkspaceLogoMutation>;
export type UploadWorkspaceLogoMutationOptions = Apollo.BaseMutationOptions<UploadWorkspaceLogoMutation, UploadWorkspaceLogoMutationVariables>;
export const CheckCustomDomainValidRecordsDocument = gql`
    mutation CheckCustomDomainValidRecords {
  checkCustomDomainValidRecords {
    id
    domain
    records {
      type
      key
      value
      validationType
      status
    }
  }
}
    `;
export type CheckCustomDomainValidRecordsMutationFn = Apollo.MutationFunction<CheckCustomDomainValidRecordsMutation, CheckCustomDomainValidRecordsMutationVariables>;

/**
 * __useCheckCustomDomainValidRecordsMutation__
 *
 * To run a mutation, you first call `useCheckCustomDomainValidRecordsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckCustomDomainValidRecordsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkCustomDomainValidRecordsMutation, { data, loading, error }] = useCheckCustomDomainValidRecordsMutation({
 *   variables: {
 *   },
 * });
 */
export function useCheckCustomDomainValidRecordsMutation(baseOptions?: Apollo.MutationHookOptions<CheckCustomDomainValidRecordsMutation, CheckCustomDomainValidRecordsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckCustomDomainValidRecordsMutation, CheckCustomDomainValidRecordsMutationVariables>(CheckCustomDomainValidRecordsDocument, options);
      }
export type CheckCustomDomainValidRecordsMutationHookResult = ReturnType<typeof useCheckCustomDomainValidRecordsMutation>;
export type CheckCustomDomainValidRecordsMutationResult = Apollo.MutationResult<CheckCustomDomainValidRecordsMutation>;
export type CheckCustomDomainValidRecordsMutationOptions = Apollo.BaseMutationOptions<CheckCustomDomainValidRecordsMutation, CheckCustomDomainValidRecordsMutationVariables>;
export const GetWorkspaceFromInviteHashDocument = gql`
    query GetWorkspaceFromInviteHash($inviteHash: String!) {
  findWorkspaceFromInviteHash(inviteHash: $inviteHash) {
    id
    displayName
    logo
    allowImpersonation
  }
}
    `;

/**
 * __useGetWorkspaceFromInviteHashQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceFromInviteHashQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceFromInviteHashQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceFromInviteHashQuery({
 *   variables: {
 *      inviteHash: // value for 'inviteHash'
 *   },
 * });
 */
export function useGetWorkspaceFromInviteHashQuery(baseOptions: Apollo.QueryHookOptions<GetWorkspaceFromInviteHashQuery, GetWorkspaceFromInviteHashQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceFromInviteHashQuery, GetWorkspaceFromInviteHashQueryVariables>(GetWorkspaceFromInviteHashDocument, options);
      }
export function useGetWorkspaceFromInviteHashLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceFromInviteHashQuery, GetWorkspaceFromInviteHashQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceFromInviteHashQuery, GetWorkspaceFromInviteHashQueryVariables>(GetWorkspaceFromInviteHashDocument, options);
        }
export type GetWorkspaceFromInviteHashQueryHookResult = ReturnType<typeof useGetWorkspaceFromInviteHashQuery>;
export type GetWorkspaceFromInviteHashLazyQueryHookResult = ReturnType<typeof useGetWorkspaceFromInviteHashLazyQuery>;
export type GetWorkspaceFromInviteHashQueryResult = Apollo.QueryResult<GetWorkspaceFromInviteHashQuery, GetWorkspaceFromInviteHashQueryVariables>;