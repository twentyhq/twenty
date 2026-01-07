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
  createWebhook: Webhook;
  createWorkflowVersionEdge: WorkflowVersionStepChanges;
  createWorkflowVersionStep: WorkflowVersionStepChanges;
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
  testHttpRequest: TestHttpRequestOutput;
  trackAnalytics: Analytics;
  uninstallApplication: Scalars['Boolean'];
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


export type MutationCreateWebhookArgs = {
  input: CreateWebhookInput;
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
  apiKey?: Maybe<ApiKey>;
  apiKeys: Array<ApiKey>;
  billingPortalSession: BillingSessionOutput;
  checkUserExists: CheckUserExistOutput;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValidOutput;
  currentUser: User;
  currentWorkspace: Workspace;
  field: Field;
  fields: FieldConnection;
  findManyAgents: Array<Agent>;
  findManyApplications: Array<Application>;
  findManyCronTriggers: Array<CronTrigger>;
  findManyDatabaseEventTriggers: Array<DatabaseEventTrigger>;
  findManyPublicDomains: Array<PublicDomain>;
  findManyRouteTriggers: Array<RouteTrigger>;
  findManyServerlessFunctions: Array<ServerlessFunction>;
  findOneAgent: Agent;
  findOneApplication: Application;
  findOneCronTrigger: CronTrigger;
  findOneDatabaseEventTrigger: DatabaseEventTrigger;
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
  validatePasswordResetToken: ValidatePasswordResetTokenOutput;
  versionInfo: VersionInfo;
  webhook?: Maybe<Webhook>;
  webhooks: Array<Webhook>;
};


export type QueryApiKeyArgs = {
  input: GetApiKeyInput;
};


export type QueryBillingPortalSessionArgs = {
  returnUrlPath?: InputMaybe<Scalars['String']>;
};


export type QueryCheckUserExistsArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String'];
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


export type QuerySearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']>>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  searchInput: Scalars['String'];
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

export type RemoteTable = {
  __typename?: 'RemoteTable';
  id?: Maybe<Scalars['UUID']>;
  name: Scalars['String'];
  schema?: Maybe<Scalars['String']>;
  schemaPendingUpdates?: Maybe<Array<DistantTableUpdate>>;
  status: RemoteTableStatus;
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

export type SearchQueryVariables = Exact<{
  searchInput: Scalars['String'];
  limit: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
}>;


export type SearchQuery = { __typename?: 'Query', search: { __typename?: 'SearchResultConnection', edges: Array<{ __typename?: 'SearchResultEdge', cursor: string, node: { __typename?: 'SearchRecord', recordId: any, objectNameSingular: string, label: string, imageUrl?: string | null, tsRankCD: number, tsRank: number } }>, pageInfo: { __typename?: 'SearchResultPageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type PageLayoutWidgetFragmentFragment = { __typename?: 'PageLayoutWidget', id: any, title: string, type: WidgetType, objectMetadataId?: any | null, createdAt: string, updatedAt: string, deletedAt?: string | null, pageLayoutTabId: any, gridPosition: { __typename?: 'GridPosition', column: number, columnSpan: number, row: number, rowSpan: number }, configuration: { __typename?: 'AggregateChartConfiguration', configurationType: WidgetConfigurationType, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, label?: string | null, displayDataLabel?: boolean | null, format?: string | null, description?: string | null, filter?: any | null, prefix?: string | null, suffix?: string | null, timezone?: string | null, firstDayOfTheWeek?: number | null, ratioAggregateConfig?: { __typename?: 'RatioAggregateConfig', fieldMetadataId: any, optionValue: string } | null } | { __typename?: 'BarChartConfiguration', configurationType: WidgetConfigurationType, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, primaryAxisGroupByFieldMetadataId: any, primaryAxisGroupBySubFieldName?: string | null, primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null, primaryAxisOrderBy?: GraphOrderBy | null, primaryAxisManualSortOrder?: Array<string> | null, secondaryAxisGroupByFieldMetadataId?: any | null, secondaryAxisGroupBySubFieldName?: string | null, secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity | null, secondaryAxisOrderBy?: GraphOrderBy | null, secondaryAxisManualSortOrder?: Array<string> | null, omitNullValues?: boolean | null, axisNameDisplay?: AxisNameDisplay | null, displayDataLabel?: boolean | null, displayLegend?: boolean | null, rangeMin?: number | null, rangeMax?: number | null, color?: string | null, description?: string | null, filter?: any | null, groupMode?: BarChartGroupMode | null, layout: BarChartLayout, isCumulative?: boolean | null, timezone?: string | null, firstDayOfTheWeek?: number | null } | { __typename?: 'GaugeChartConfiguration', configurationType: WidgetConfigurationType, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, displayDataLabel?: boolean | null, color?: string | null, description?: string | null, filter?: any | null, timezone?: string | null, firstDayOfTheWeek?: number | null } | { __typename?: 'IframeConfiguration', configurationType: WidgetConfigurationType, url?: string | null } | { __typename?: 'LineChartConfiguration', configurationType: WidgetConfigurationType, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, primaryAxisGroupByFieldMetadataId: any, primaryAxisGroupBySubFieldName?: string | null, primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null, primaryAxisOrderBy?: GraphOrderBy | null, primaryAxisManualSortOrder?: Array<string> | null, secondaryAxisGroupByFieldMetadataId?: any | null, secondaryAxisGroupBySubFieldName?: string | null, secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity | null, secondaryAxisOrderBy?: GraphOrderBy | null, secondaryAxisManualSortOrder?: Array<string> | null, omitNullValues?: boolean | null, axisNameDisplay?: AxisNameDisplay | null, displayDataLabel?: boolean | null, displayLegend?: boolean | null, rangeMin?: number | null, rangeMax?: number | null, color?: string | null, description?: string | null, filter?: any | null, isStacked?: boolean | null, isCumulative?: boolean | null, timezone?: string | null, firstDayOfTheWeek?: number | null } | { __typename?: 'PieChartConfiguration', configurationType: WidgetConfigurationType, groupByFieldMetadataId: any, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, groupBySubFieldName?: string | null, dateGranularity?: ObjectRecordGroupByDateGranularity | null, orderBy?: GraphOrderBy | null, manualSortOrder?: Array<string> | null, displayDataLabel?: boolean | null, showCenterMetric?: boolean | null, displayLegend?: boolean | null, color?: string | null, description?: string | null, filter?: any | null, timezone?: string | null, firstDayOfTheWeek?: number | null } | { __typename?: 'StandaloneRichTextConfiguration', configurationType: WidgetConfigurationType, body: { __typename?: 'RichTextV2Body', blocknote?: string | null, markdown?: string | null } } };

export type UpdatePageLayoutWithTabsAndWidgetsMutationVariables = Exact<{
  id: Scalars['String'];
  input: UpdatePageLayoutWithTabsInput;
}>;


export type UpdatePageLayoutWithTabsAndWidgetsMutation = { __typename?: 'Mutation', updatePageLayoutWithTabsAndWidgets: { __typename?: 'PageLayout', id: any, name: string, type: PageLayoutType, objectMetadataId?: any | null, createdAt: string, updatedAt: string, deletedAt?: string | null, tabs?: Array<{ __typename?: 'PageLayoutTab', id: any, title: string, position: number, pageLayoutId: any, createdAt: string, updatedAt: string, widgets?: Array<{ __typename?: 'PageLayoutWidget', id: any, title: string, type: WidgetType, objectMetadataId?: any | null, createdAt: string, updatedAt: string, deletedAt?: string | null, pageLayoutTabId: any, gridPosition: { __typename?: 'GridPosition', column: number, columnSpan: number, row: number, rowSpan: number }, configuration: { __typename?: 'AggregateChartConfiguration', configurationType: WidgetConfigurationType, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, label?: string | null, displayDataLabel?: boolean | null, format?: string | null, description?: string | null, filter?: any | null, prefix?: string | null, suffix?: string | null, timezone?: string | null, firstDayOfTheWeek?: number | null, ratioAggregateConfig?: { __typename?: 'RatioAggregateConfig', fieldMetadataId: any, optionValue: string } | null } | { __typename?: 'BarChartConfiguration', configurationType: WidgetConfigurationType, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, primaryAxisGroupByFieldMetadataId: any, primaryAxisGroupBySubFieldName?: string | null, primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null, primaryAxisOrderBy?: GraphOrderBy | null, primaryAxisManualSortOrder?: Array<string> | null, secondaryAxisGroupByFieldMetadataId?: any | null, secondaryAxisGroupBySubFieldName?: string | null, secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity | null, secondaryAxisOrderBy?: GraphOrderBy | null, secondaryAxisManualSortOrder?: Array<string> | null, omitNullValues?: boolean | null, axisNameDisplay?: AxisNameDisplay | null, displayDataLabel?: boolean | null, displayLegend?: boolean | null, rangeMin?: number | null, rangeMax?: number | null, color?: string | null, description?: string | null, filter?: any | null, groupMode?: BarChartGroupMode | null, layout: BarChartLayout, isCumulative?: boolean | null, timezone?: string | null, firstDayOfTheWeek?: number | null } | { __typename?: 'GaugeChartConfiguration', configurationType: WidgetConfigurationType, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, displayDataLabel?: boolean | null, color?: string | null, description?: string | null, filter?: any | null, timezone?: string | null, firstDayOfTheWeek?: number | null } | { __typename?: 'IframeConfiguration', configurationType: WidgetConfigurationType, url?: string | null } | { __typename?: 'LineChartConfiguration', configurationType: WidgetConfigurationType, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, primaryAxisGroupByFieldMetadataId: any, primaryAxisGroupBySubFieldName?: string | null, primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null, primaryAxisOrderBy?: GraphOrderBy | null, primaryAxisManualSortOrder?: Array<string> | null, secondaryAxisGroupByFieldMetadataId?: any | null, secondaryAxisGroupBySubFieldName?: string | null, secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity | null, secondaryAxisOrderBy?: GraphOrderBy | null, secondaryAxisManualSortOrder?: Array<string> | null, omitNullValues?: boolean | null, axisNameDisplay?: AxisNameDisplay | null, displayDataLabel?: boolean | null, displayLegend?: boolean | null, rangeMin?: number | null, rangeMax?: number | null, color?: string | null, description?: string | null, filter?: any | null, isStacked?: boolean | null, isCumulative?: boolean | null, timezone?: string | null, firstDayOfTheWeek?: number | null } | { __typename?: 'PieChartConfiguration', configurationType: WidgetConfigurationType, groupByFieldMetadataId: any, aggregateFieldMetadataId: any, aggregateOperation: AggregateOperations, groupBySubFieldName?: string | null, dateGranularity?: ObjectRecordGroupByDateGranularity | null, orderBy?: GraphOrderBy | null, manualSortOrder?: Array<string> | null, displayDataLabel?: boolean | null, showCenterMetric?: boolean | null, displayLegend?: boolean | null, color?: string | null, description?: string | null, filter?: any | null, timezone?: string | null, firstDayOfTheWeek?: number | null } | { __typename?: 'StandaloneRichTextConfiguration', configurationType: WidgetConfigurationType, body: { __typename?: 'RichTextV2Body', blocknote?: string | null, markdown?: string | null } } }> | null }> | null } };

export type OnDbEventSubscriptionVariables = Exact<{
  input: OnDbEventInput;
}>;


export type OnDbEventSubscription = { __typename?: 'Subscription', onDbEvent: { __typename?: 'OnDbEvent', eventDate: string, action: DatabaseEventAction, objectNameSingular: string, updatedFields?: Array<string> | null, record: any } };

export type OnSubscriptionMatchSubscriptionVariables = Exact<{
  subscriptions: Array<SubscriptionInput> | SubscriptionInput;
}>;


export type OnSubscriptionMatchSubscription = { __typename?: 'Subscription', onSubscriptionMatch?: { __typename?: 'SubscriptionMatches', matches: Array<{ __typename?: 'SubscriptionMatch', subscriptionIds: Array<string>, event: { __typename?: 'OnDbEvent', action: DatabaseEventAction, objectNameSingular: string, eventDate: string, record: any, updatedFields?: Array<string> | null } }> } | null };

export type ViewFieldFragmentFragment = { __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null };

export type ViewFilterFragmentFragment = { __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null };

export type ViewFilterGroupFragmentFragment = { __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any };

export type ViewFragmentFragment = { __typename?: 'CoreView', id: any, name: string, objectMetadataId: any, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: any | null, mainGroupByFieldMetadataId?: any | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: any | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: any | null, viewFields: Array<{ __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type ViewGroupFragmentFragment = { __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null };

export type ViewSortFragmentFragment = { __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any };

export type CreateCoreViewMutationVariables = Exact<{
  input: CreateViewInput;
}>;


export type CreateCoreViewMutation = { __typename?: 'Mutation', createCoreView: { __typename?: 'CoreView', id: any, name: string, objectMetadataId: any, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: any | null, mainGroupByFieldMetadataId?: any | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: any | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: any | null, viewFields: Array<{ __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> } };

export type CreateCoreViewFieldMutationVariables = Exact<{
  input: CreateViewFieldInput;
}>;


export type CreateCoreViewFieldMutation = { __typename?: 'Mutation', createCoreViewField: { __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CreateCoreViewFilterMutationVariables = Exact<{
  input: CreateViewFilterInput;
}>;


export type CreateCoreViewFilterMutation = { __typename?: 'Mutation', createCoreViewFilter: { __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CreateCoreViewFilterGroupMutationVariables = Exact<{
  input: CreateViewFilterGroupInput;
}>;


export type CreateCoreViewFilterGroupMutation = { __typename?: 'Mutation', createCoreViewFilterGroup: { __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any } };

export type CreateCoreViewGroupMutationVariables = Exact<{
  input: CreateViewGroupInput;
}>;


export type CreateCoreViewGroupMutation = { __typename?: 'Mutation', createCoreViewGroup: { __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CreateCoreViewSortMutationVariables = Exact<{
  input: CreateViewSortInput;
}>;


export type CreateCoreViewSortMutation = { __typename?: 'Mutation', createCoreViewSort: { __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any } };

export type CreateManyCoreViewFieldsMutationVariables = Exact<{
  inputs: Array<CreateViewFieldInput> | CreateViewFieldInput;
}>;


export type CreateManyCoreViewFieldsMutation = { __typename?: 'Mutation', createManyCoreViewFields: Array<{ __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type CreateManyCoreViewGroupsMutationVariables = Exact<{
  inputs: Array<CreateViewGroupInput> | CreateViewGroupInput;
}>;


export type CreateManyCoreViewGroupsMutation = { __typename?: 'Mutation', createManyCoreViewGroups: Array<{ __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type DeleteCoreViewMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DeleteCoreViewMutation = { __typename?: 'Mutation', deleteCoreView: boolean };

export type DeleteCoreViewFieldMutationVariables = Exact<{
  input: DeleteViewFieldInput;
}>;


export type DeleteCoreViewFieldMutation = { __typename?: 'Mutation', deleteCoreViewField: { __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DeleteCoreViewFilterMutationVariables = Exact<{
  input: DeleteViewFilterInput;
}>;


export type DeleteCoreViewFilterMutation = { __typename?: 'Mutation', deleteCoreViewFilter: { __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DeleteCoreViewFilterGroupMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DeleteCoreViewFilterGroupMutation = { __typename?: 'Mutation', deleteCoreViewFilterGroup: boolean };

export type DeleteCoreViewGroupMutationVariables = Exact<{
  input: DeleteViewGroupInput;
}>;


export type DeleteCoreViewGroupMutation = { __typename?: 'Mutation', deleteCoreViewGroup: { __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } };

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


export type DestroyCoreViewFieldMutation = { __typename?: 'Mutation', destroyCoreViewField: { __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DestroyCoreViewFilterMutationVariables = Exact<{
  input: DestroyViewFilterInput;
}>;


export type DestroyCoreViewFilterMutation = { __typename?: 'Mutation', destroyCoreViewFilter: { __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DestroyCoreViewFilterGroupMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DestroyCoreViewFilterGroupMutation = { __typename?: 'Mutation', destroyCoreViewFilterGroup: boolean };

export type DestroyCoreViewGroupMutationVariables = Exact<{
  input: DestroyViewGroupInput;
}>;


export type DestroyCoreViewGroupMutation = { __typename?: 'Mutation', destroyCoreViewGroup: { __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DestroyCoreViewSortMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type DestroyCoreViewSortMutation = { __typename?: 'Mutation', destroyCoreViewSort: boolean };

export type UpdateCoreViewMutationVariables = Exact<{
  id: Scalars['String'];
  input: UpdateViewInput;
}>;


export type UpdateCoreViewMutation = { __typename?: 'Mutation', updateCoreView: { __typename?: 'CoreView', id: any, name: string, objectMetadataId: any, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: any | null, mainGroupByFieldMetadataId?: any | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: any | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: any | null, viewFields: Array<{ __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> } };

export type UpdateCoreViewFieldMutationVariables = Exact<{
  input: UpdateViewFieldInput;
}>;


export type UpdateCoreViewFieldMutation = { __typename?: 'Mutation', updateCoreViewField: { __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type UpdateCoreViewFilterMutationVariables = Exact<{
  input: UpdateViewFilterInput;
}>;


export type UpdateCoreViewFilterMutation = { __typename?: 'Mutation', updateCoreViewFilter: { __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type UpdateCoreViewFilterGroupMutationVariables = Exact<{
  id: Scalars['String'];
  input: UpdateViewFilterGroupInput;
}>;


export type UpdateCoreViewFilterGroupMutation = { __typename?: 'Mutation', updateCoreViewFilterGroup: { __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any } };

export type UpdateCoreViewGroupMutationVariables = Exact<{
  input: UpdateViewGroupInput;
}>;


export type UpdateCoreViewGroupMutation = { __typename?: 'Mutation', updateCoreViewGroup: { __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type UpdateCoreViewSortMutationVariables = Exact<{
  id: Scalars['String'];
  input: UpdateViewSortInput;
}>;


export type UpdateCoreViewSortMutation = { __typename?: 'Mutation', updateCoreViewSort: { __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any } };

export type FindAllCoreViewsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindAllCoreViewsQuery = { __typename?: 'Query', getCoreViews: Array<{ __typename?: 'CoreView', id: any, name: string, objectMetadataId: any, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: any | null, mainGroupByFieldMetadataId?: any | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: any | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: any | null, viewFields: Array<{ __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> }> };

export type FindManyCoreViewFieldsQueryVariables = Exact<{
  viewId: Scalars['String'];
}>;


export type FindManyCoreViewFieldsQuery = { __typename?: 'Query', getCoreViewFields: Array<{ __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type FindManyCoreViewFilterGroupsQueryVariables = Exact<{
  viewId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewFilterGroupsQuery = { __typename?: 'Query', getCoreViewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any }> };

export type FindManyCoreViewFiltersQueryVariables = Exact<{
  viewId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewFiltersQuery = { __typename?: 'Query', getCoreViewFilters: Array<{ __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type FindManyCoreViewGroupsQueryVariables = Exact<{
  viewId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewGroupsQuery = { __typename?: 'Query', getCoreViewGroups: Array<{ __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type FindManyCoreViewSortsQueryVariables = Exact<{
  viewId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewSortsQuery = { __typename?: 'Query', getCoreViewSorts: Array<{ __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any }> };

export type FindManyCoreViewsQueryVariables = Exact<{
  objectMetadataId?: InputMaybe<Scalars['String']>;
}>;


export type FindManyCoreViewsQuery = { __typename?: 'Query', getCoreViews: Array<{ __typename?: 'CoreView', id: any, name: string, objectMetadataId: any, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: any | null, mainGroupByFieldMetadataId?: any | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: any | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: any | null, viewFields: Array<{ __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> }> };

export type FindOneCoreViewQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewQuery = { __typename?: 'Query', getCoreView?: { __typename?: 'CoreView', id: any, name: string, objectMetadataId: any, type: ViewType, key?: ViewKey | null, icon: string, position: number, isCompact: boolean, openRecordIn: ViewOpenRecordIn, kanbanAggregateOperation?: AggregateOperations | null, kanbanAggregateOperationFieldMetadataId?: any | null, mainGroupByFieldMetadataId?: any | null, shouldHideEmptyGroups: boolean, anyFieldFilterValue?: string | null, calendarFieldMetadataId?: any | null, calendarLayout?: ViewCalendarLayout | null, visibility: ViewVisibility, createdByUserWorkspaceId?: any | null, viewFields: Array<{ __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilters: Array<{ __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }>, viewFilterGroups: Array<{ __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any }>, viewSorts: Array<{ __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any }>, viewGroups: Array<{ __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null }> } | null };

export type FindOneCoreViewFieldQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewFieldQuery = { __typename?: 'Query', getCoreViewField?: { __typename?: 'CoreViewField', id: any, fieldMetadataId: any, viewId: any, isVisible: boolean, position: number, size: number, aggregateOperation?: AggregateOperations | null, createdAt: string, updatedAt: string, deletedAt?: string | null } | null };

export type FindOneCoreViewFilterQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewFilterQuery = { __typename?: 'Query', getCoreViewFilter?: { __typename?: 'CoreViewFilter', id: any, fieldMetadataId: any, operand: ViewFilterOperand, value: any, viewFilterGroupId?: any | null, positionInViewFilterGroup?: number | null, subFieldName?: string | null, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } | null };

export type FindOneCoreViewFilterGroupQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewFilterGroupQuery = { __typename?: 'Query', getCoreViewFilterGroup?: { __typename?: 'CoreViewFilterGroup', id: any, parentViewFilterGroupId?: any | null, logicalOperator: ViewFilterGroupLogicalOperator, positionInViewFilterGroup?: number | null, viewId: any } | null };

export type FindOneCoreViewGroupQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewGroupQuery = { __typename?: 'Query', getCoreViewGroup?: { __typename?: 'CoreViewGroup', id: any, isVisible: boolean, fieldValue: string, position: number, viewId: any, createdAt: string, updatedAt: string, deletedAt?: string | null } | null };

export type FindOneCoreViewSortQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type FindOneCoreViewSortQuery = { __typename?: 'Query', getCoreViewSort?: { __typename?: 'CoreViewSort', id: any, fieldMetadataId: any, direction: ViewSortDirection, viewId: any } | null };

export const PageLayoutWidgetFragmentFragmentDoc = gql`
    fragment PageLayoutWidgetFragment on PageLayoutWidget {
  id
  title
  type
  objectMetadataId
  createdAt
  updatedAt
  deletedAt
  gridPosition {
    column
    columnSpan
    row
    rowSpan
  }
  configuration {
    ... on BarChartConfiguration {
      configurationType
      aggregateFieldMetadataId
      aggregateOperation
      primaryAxisGroupByFieldMetadataId
      primaryAxisGroupBySubFieldName
      primaryAxisDateGranularity
      primaryAxisOrderBy
      primaryAxisManualSortOrder
      secondaryAxisGroupByFieldMetadataId
      secondaryAxisGroupBySubFieldName
      secondaryAxisGroupByDateGranularity
      secondaryAxisOrderBy
      secondaryAxisManualSortOrder
      omitNullValues
      axisNameDisplay
      displayDataLabel
      displayLegend
      rangeMin
      rangeMax
      color
      description
      filter
      groupMode
      layout
      isCumulative
      timezone
      firstDayOfTheWeek
    }
    ... on LineChartConfiguration {
      configurationType
      aggregateFieldMetadataId
      aggregateOperation
      primaryAxisGroupByFieldMetadataId
      primaryAxisGroupBySubFieldName
      primaryAxisDateGranularity
      primaryAxisOrderBy
      primaryAxisManualSortOrder
      secondaryAxisGroupByFieldMetadataId
      secondaryAxisGroupBySubFieldName
      secondaryAxisGroupByDateGranularity
      secondaryAxisOrderBy
      secondaryAxisManualSortOrder
      omitNullValues
      axisNameDisplay
      displayDataLabel
      displayLegend
      rangeMin
      rangeMax
      color
      description
      filter
      isStacked
      isCumulative
      timezone
      firstDayOfTheWeek
    }
    ... on PieChartConfiguration {
      configurationType
      groupByFieldMetadataId
      aggregateFieldMetadataId
      aggregateOperation
      groupBySubFieldName
      dateGranularity
      orderBy
      manualSortOrder
      displayDataLabel
      showCenterMetric
      displayLegend
      color
      description
      filter
      timezone
      firstDayOfTheWeek
    }
    ... on AggregateChartConfiguration {
      configurationType
      aggregateFieldMetadataId
      aggregateOperation
      label
      displayDataLabel
      format
      description
      filter
      prefix
      suffix
      timezone
      firstDayOfTheWeek
      ratioAggregateConfig {
        fieldMetadataId
        optionValue
      }
    }
    ... on GaugeChartConfiguration {
      configurationType
      aggregateFieldMetadataId
      aggregateOperation
      displayDataLabel
      color
      description
      filter
      timezone
      firstDayOfTheWeek
    }
    ... on IframeConfiguration {
      configurationType
      url
    }
    ... on StandaloneRichTextConfiguration {
      configurationType
      body {
        blocknote
        markdown
      }
    }
  }
  pageLayoutTabId
}
    `;
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
export const UpdatePageLayoutWithTabsAndWidgetsDocument = gql`
    mutation UpdatePageLayoutWithTabsAndWidgets($id: String!, $input: UpdatePageLayoutWithTabsInput!) {
  updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
    id
    name
    type
    objectMetadataId
    createdAt
    updatedAt
    deletedAt
    tabs {
      id
      title
      position
      pageLayoutId
      widgets {
        ...PageLayoutWidgetFragment
      }
      createdAt
      updatedAt
    }
  }
}
    ${PageLayoutWidgetFragmentFragmentDoc}`;
export type UpdatePageLayoutWithTabsAndWidgetsMutationFn = Apollo.MutationFunction<UpdatePageLayoutWithTabsAndWidgetsMutation, UpdatePageLayoutWithTabsAndWidgetsMutationVariables>;

/**
 * __useUpdatePageLayoutWithTabsAndWidgetsMutation__
 *
 * To run a mutation, you first call `useUpdatePageLayoutWithTabsAndWidgetsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePageLayoutWithTabsAndWidgetsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePageLayoutWithTabsAndWidgetsMutation, { data, loading, error }] = useUpdatePageLayoutWithTabsAndWidgetsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePageLayoutWithTabsAndWidgetsMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePageLayoutWithTabsAndWidgetsMutation, UpdatePageLayoutWithTabsAndWidgetsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePageLayoutWithTabsAndWidgetsMutation, UpdatePageLayoutWithTabsAndWidgetsMutationVariables>(UpdatePageLayoutWithTabsAndWidgetsDocument, options);
      }
export type UpdatePageLayoutWithTabsAndWidgetsMutationHookResult = ReturnType<typeof useUpdatePageLayoutWithTabsAndWidgetsMutation>;
export type UpdatePageLayoutWithTabsAndWidgetsMutationResult = Apollo.MutationResult<UpdatePageLayoutWithTabsAndWidgetsMutation>;
export type UpdatePageLayoutWithTabsAndWidgetsMutationOptions = Apollo.BaseMutationOptions<UpdatePageLayoutWithTabsAndWidgetsMutation, UpdatePageLayoutWithTabsAndWidgetsMutationVariables>;
export const OnDbEventDocument = gql`
    subscription OnDbEvent($input: OnDbEventInput!) {
  onDbEvent(input: $input) {
    eventDate
    action
    objectNameSingular
    updatedFields
    record
  }
}
    `;

/**
 * __useOnDbEventSubscription__
 *
 * To run a query within a React component, call `useOnDbEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnDbEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnDbEventSubscription({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useOnDbEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnDbEventSubscription, OnDbEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnDbEventSubscription, OnDbEventSubscriptionVariables>(OnDbEventDocument, options);
      }
export type OnDbEventSubscriptionHookResult = ReturnType<typeof useOnDbEventSubscription>;
export type OnDbEventSubscriptionResult = Apollo.SubscriptionResult<OnDbEventSubscription>;
export const OnSubscriptionMatchDocument = gql`
    subscription OnSubscriptionMatch($subscriptions: [SubscriptionInput!]!) {
  onSubscriptionMatch(subscriptions: $subscriptions) {
    matches {
      subscriptionIds
      event {
        action
        objectNameSingular
        eventDate
        record
        updatedFields
      }
    }
  }
}
    `;

/**
 * __useOnSubscriptionMatchSubscription__
 *
 * To run a query within a React component, call `useOnSubscriptionMatchSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnSubscriptionMatchSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnSubscriptionMatchSubscription({
 *   variables: {
 *      subscriptions: // value for 'subscriptions'
 *   },
 * });
 */
export function useOnSubscriptionMatchSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnSubscriptionMatchSubscription, OnSubscriptionMatchSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnSubscriptionMatchSubscription, OnSubscriptionMatchSubscriptionVariables>(OnSubscriptionMatchDocument, options);
      }
export type OnSubscriptionMatchSubscriptionHookResult = ReturnType<typeof useOnSubscriptionMatchSubscription>;
export type OnSubscriptionMatchSubscriptionResult = Apollo.SubscriptionResult<OnSubscriptionMatchSubscription>;
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