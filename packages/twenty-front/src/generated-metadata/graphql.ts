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
  Date: any;
  DateTime: string;
  JSON: any;
  JSONObject: any;
  UUID: any;
  Upload: any;
};

export type AccountType = {
  type: Scalars['String'];
};

export type ActivateWorkspaceInput = {
  displayName?: InputMaybe<Scalars['String']>;
};

export type AdminPanelHealthServiceData = {
  __typename?: 'AdminPanelHealthServiceData';
  description: Scalars['String'];
  details?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
  id: Scalars['String'];
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
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  modelId: Scalars['String'];
  name: Scalars['String'];
  prompt: Scalars['String'];
  responseFormat?: Maybe<Scalars['JSON']>;
  roleId?: Maybe<Scalars['UUID']>;
  updatedAt: Scalars['DateTime'];
};

export type AgentIdInput = {
  /** The id of the agent. */
  id: Scalars['UUID'];
};

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
  updatedAt: Scalars['DateTime'];
  workspace: Workspace;
  workspaceId: Scalars['String'];
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

export type ApprovedAccessDomain = {
  __typename?: 'ApprovedAccessDomain';
  createdAt: Scalars['DateTime'];
  domain: Scalars['String'];
  id: Scalars['UUID'];
  isValidated: Scalars['Boolean'];
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
  accessToken: AuthToken;
  refreshToken: AuthToken;
};

export type AuthTokens = {
  __typename?: 'AuthTokens';
  tokens: AuthTokenPair;
};

export type AuthorizeApp = {
  __typename?: 'AuthorizeApp';
  redirectUrl: Scalars['String'];
};

export type AvailableWorkspace = {
  __typename?: 'AvailableWorkspace';
  displayName?: Maybe<Scalars['String']>;
  id: Scalars['String'];
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

export type Billing = {
  __typename?: 'Billing';
  billingUrl?: Maybe<Scalars['String']>;
  isBillingEnabled: Scalars['Boolean'];
  trialPeriods: Array<BillingTrialPeriodDto>;
};

export type BillingEndTrialPeriodOutput = {
  __typename?: 'BillingEndTrialPeriodOutput';
  /** Boolean that confirms if a payment method was found */
  hasPaymentMethod: Scalars['Boolean'];
  /** Updated subscription status */
  status?: Maybe<SubscriptionStatus>;
};

export type BillingMeteredProductUsageOutput = {
  __typename?: 'BillingMeteredProductUsageOutput';
  freeTierQuantity: Scalars['Float'];
  freeTrialQuantity: Scalars['Float'];
  periodEnd: Scalars['DateTime'];
  periodStart: Scalars['DateTime'];
  productKey: BillingProductKey;
  totalCostCents: Scalars['Float'];
  unitPriceCents: Scalars['Float'];
  usageQuantity: Scalars['Float'];
};

/** The different billing plans available */
export enum BillingPlanKey {
  ENTERPRISE = 'ENTERPRISE',
  PRO = 'PRO'
}

export type BillingPlanOutput = {
  __typename?: 'BillingPlanOutput';
  baseProduct: BillingProduct;
  meteredProducts: Array<BillingProduct>;
  otherLicensedProducts: Array<BillingProduct>;
  planKey: BillingPlanKey;
};

export type BillingPriceLicensedDto = {
  __typename?: 'BillingPriceLicensedDTO';
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String'];
  unitAmount: Scalars['Float'];
};

export type BillingPriceMeteredDto = {
  __typename?: 'BillingPriceMeteredDTO';
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String'];
  tiers?: Maybe<Array<BillingPriceTierDto>>;
  tiersMode?: Maybe<BillingPriceTiersMode>;
};

export type BillingPriceTierDto = {
  __typename?: 'BillingPriceTierDTO';
  flatAmount?: Maybe<Scalars['Float']>;
  unitAmount?: Maybe<Scalars['Float']>;
  upTo?: Maybe<Scalars['Float']>;
};

/** The different billing price tiers modes */
export enum BillingPriceTiersMode {
  GRADUATED = 'GRADUATED',
  VOLUME = 'VOLUME'
}

export type BillingPriceUnionDto = BillingPriceLicensedDto | BillingPriceMeteredDto;

export type BillingProduct = {
  __typename?: 'BillingProduct';
  description: Scalars['String'];
  images?: Maybe<Array<Scalars['String']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String'];
  prices?: Maybe<Array<BillingPriceUnionDto>>;
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
  billingSubscriptionItems?: Maybe<Array<BillingSubscriptionItem>>;
  id: Scalars['UUID'];
  interval?: Maybe<SubscriptionInterval>;
  metadata: Scalars['JSON'];
  status: SubscriptionStatus;
};

export type BillingSubscriptionItem = {
  __typename?: 'BillingSubscriptionItem';
  billingProduct?: Maybe<BillingProduct>;
  hasReachedCurrentPeriodCap: Scalars['Boolean'];
  id: Scalars['UUID'];
  quantity?: Maybe<Scalars['Float']>;
};

export type BillingTrialPeriodDto = {
  __typename?: 'BillingTrialPeriodDTO';
  duration: Scalars['Float'];
  isCreditCardRequired: Scalars['Boolean'];
};

export type BillingUpdateOutput = {
  __typename?: 'BillingUpdateOutput';
  /** Boolean that confirms query was successful */
  success: Scalars['Boolean'];
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

export type CheckUserExistOutput = {
  __typename?: 'CheckUserExistOutput';
  availableWorkspacesCount: Scalars['Float'];
  exists: Scalars['Boolean'];
  isEmailVerified: Scalars['Boolean'];
};

export type ClientAiModelConfig = {
  __typename?: 'ClientAIModelConfig';
  inputCostPer1kTokensInCredits: Scalars['Float'];
  label: Scalars['String'];
  modelId: Scalars['String'];
  outputCostPer1kTokensInCredits: Scalars['Float'];
  provider: ModelProvider;
};

export type ComputeStepOutputSchemaInput = {
  /** Step JSON format */
  step: Scalars['JSON'];
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
  AnalyticsConfig = 'AnalyticsConfig',
  BillingConfig = 'BillingConfig',
  CaptchaConfig = 'CaptchaConfig',
  CloudflareConfig = 'CloudflareConfig',
  EmailSettings = 'EmailSettings',
  ExceptionHandler = 'ExceptionHandler',
  GoogleAuth = 'GoogleAuth',
  LLM = 'LLM',
  Logging = 'Logging',
  Metering = 'Metering',
  MicrosoftAuth = 'MicrosoftAuth',
  Other = 'Other',
  RateLimiting = 'RateLimiting',
  SSL = 'SSL',
  ServerConfig = 'ServerConfig',
  ServerlessConfig = 'ServerlessConfig',
  StorageConfig = 'StorageConfig',
  SupportChatConfig = 'SupportChatConfig',
  TokensDuration = 'TokensDuration'
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
  accountOwnerId: Scalars['String'];
  connectionParameters?: Maybe<ImapSmtpCaldavConnectionParameters>;
  handle: Scalars['String'];
  id: Scalars['String'];
  provider: Scalars['String'];
};

export type ConnectionParameters = {
  host: Scalars['String'];
  password: Scalars['String'];
  port: Scalars['Float'];
  secure?: InputMaybe<Scalars['Boolean']>;
};

export type ConnectionParametersOutput = {
  __typename?: 'ConnectionParametersOutput';
  host: Scalars['String'];
  password: Scalars['String'];
  port: Scalars['Float'];
  secure?: Maybe<Scalars['Boolean']>;
};

export type CreateApiKeyDto = {
  expiresAt: Scalars['String'];
  name: Scalars['String'];
  revokedAt?: InputMaybe<Scalars['String']>;
};

export type CreateAppTokenInput = {
  expiresAt: Scalars['DateTime'];
};

export type CreateApprovedAccessDomainInput = {
  domain: Scalars['String'];
  email: Scalars['String'];
};

export type CreateDraftFromWorkflowVersionInput = {
  /** Workflow ID */
  workflowId: Scalars['String'];
  /** Workflow version ID */
  workflowVersionIdToCopy: Scalars['String'];
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
  isUnique?: InputMaybe<Scalars['Boolean']>;
  label: Scalars['String'];
  morphRelationsCreationPayload?: InputMaybe<Array<Scalars['JSON']>>;
  name: Scalars['String'];
  objectMetadataId: Scalars['String'];
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
  /** The record to create */
  object: CreateObjectInput;
};

export type CreateRemoteServerInput = {
  foreignDataWrapperOptions: Scalars['JSON'];
  foreignDataWrapperType: Scalars['String'];
  label: Scalars['String'];
  schema?: InputMaybe<Scalars['String']>;
  userMappingOptions?: InputMaybe<UserMappingOptions>;
};

export type CreateRoleInput = {
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

export type CreateServerlessFunctionInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  timeoutSeconds?: InputMaybe<Scalars['Float']>;
};

export type CreateWebhookDto = {
  description?: InputMaybe<Scalars['String']>;
  operations: Array<Scalars['String']>;
  secret?: InputMaybe<Scalars['String']>;
  targetUrl: Scalars['String'];
};

export type CreateWorkflowVersionStepInput = {
  /** Next step ID */
  nextStepId?: InputMaybe<Scalars['String']>;
  /** Parent step ID */
  parentStepId?: InputMaybe<Scalars['String']>;
  /** New step type */
  stepType: Scalars['String'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String'];
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

export type CustomDomainRecord = {
  __typename?: 'CustomDomainRecord';
  key: Scalars['String'];
  status: Scalars['String'];
  type: Scalars['String'];
  validationType: Scalars['String'];
  value: Scalars['String'];
};

export type CustomDomainValidRecords = {
  __typename?: 'CustomDomainValidRecords';
  customDomain: Scalars['String'];
  id: Scalars['String'];
  records: Array<CustomDomainRecord>;
};

/** Database Event Action */
export enum DatabaseEventAction {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  DESTROYED = 'DESTROYED',
  RESTORED = 'RESTORED',
  UPDATED = 'UPDATED'
}

export type DateFilter = {
  eq?: InputMaybe<Scalars['Date']>;
  gt?: InputMaybe<Scalars['Date']>;
  gte?: InputMaybe<Scalars['Date']>;
  in?: InputMaybe<Array<Scalars['Date']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']>;
  lte?: InputMaybe<Scalars['Date']>;
  neq?: InputMaybe<Scalars['Date']>;
};

export type DeleteApprovedAccessDomainInput = {
  id: Scalars['String'];
};

export type DeleteOneFieldInput = {
  /** The id of the field to delete. */
  id: Scalars['UUID'];
};

export type DeleteOneObjectInput = {
  /** The id of the record to delete. */
  id: Scalars['UUID'];
};

export type DeleteSsoInput = {
  identityProviderId: Scalars['String'];
};

export type DeleteSsoOutput = {
  __typename?: 'DeleteSsoOutput';
  identityProviderId: Scalars['String'];
};

export type DeleteWebhookDto = {
  id: Scalars['String'];
};

export type DeleteWorkflowVersionStepInput = {
  /** Step to delete ID */
  stepId: Scalars['String'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String'];
};

export type DeletedWorkspaceMember = {
  __typename?: 'DeletedWorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  name: FullName;
  userEmail: Scalars['String'];
  userWorkspaceId?: Maybe<Scalars['String']>;
};

/** Schema update on a table */
export enum DistantTableUpdate {
  COLUMNS_ADDED = 'COLUMNS_ADDED',
  COLUMNS_DELETED = 'COLUMNS_DELETED',
  COLUMNS_TYPE_CHANGED = 'COLUMNS_TYPE_CHANGED',
  TABLE_DELETED = 'TABLE_DELETED'
}

export type EditSsoInput = {
  id: Scalars['String'];
  status: SsoIdentityProviderStatus;
};

export type EditSsoOutput = {
  __typename?: 'EditSsoOutput';
  id: Scalars['String'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type EmailPasswordResetLink = {
  __typename?: 'EmailPasswordResetLink';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

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
  workspaceId: Scalars['String'];
};

export type FeatureFlagDto = {
  __typename?: 'FeatureFlagDTO';
  key: FeatureFlagKey;
  value: Scalars['Boolean'];
};

export enum FeatureFlagKey {
  IS_AIRTABLE_INTEGRATION_ENABLED = 'IS_AIRTABLE_INTEGRATION_ENABLED',
  IS_AI_ENABLED = 'IS_AI_ENABLED',
  IS_FIELDS_PERMISSIONS_ENABLED = 'IS_FIELDS_PERMISSIONS_ENABLED',
  IS_IMAP_SMTP_CALDAV_ENABLED = 'IS_IMAP_SMTP_CALDAV_ENABLED',
  IS_JSON_FILTER_ENABLED = 'IS_JSON_FILTER_ENABLED',
  IS_MORPH_RELATION_ENABLED = 'IS_MORPH_RELATION_ENABLED',
  IS_POSTGRESQL_INTEGRATION_ENABLED = 'IS_POSTGRESQL_INTEGRATION_ENABLED',
  IS_RELATION_CONNECT_ENABLED = 'IS_RELATION_CONNECT_ENABLED',
  IS_STRIPE_INTEGRATION_ENABLED = 'IS_STRIPE_INTEGRATION_ENABLED',
  IS_UNIQUE_INDEXES_ENABLED = 'IS_UNIQUE_INDEXES_ENABLED',
  IS_WORKFLOW_FILTERING_ENABLED = 'IS_WORKFLOW_FILTERING_ENABLED',
  IS_WORKSPACE_API_KEY_WEBHOOK_GRAPHQL_ENABLED = 'IS_WORKSPACE_API_KEY_WEBHOOK_GRAPHQL_ENABLED'
}

export type Field = {
  __typename?: 'Field';
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
  isUnique?: Maybe<Scalars['Boolean']>;
  label: Scalars['String'];
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
  fieldMetadataId: Scalars['String'];
  id: Scalars['String'];
  objectMetadataId: Scalars['String'];
  roleId: Scalars['String'];
};

export type FieldPermissionInput = {
  canReadFieldValue?: InputMaybe<Scalars['Boolean']>;
  canUpdateFieldValue?: InputMaybe<Scalars['Boolean']>;
  fieldMetadataId: Scalars['String'];
  objectMetadataId: Scalars['String'];
};

export enum FileFolder {
  Attachment = 'Attachment',
  PersonPicture = 'PersonPicture',
  ProfilePicture = 'ProfilePicture',
  ServerlessFunction = 'ServerlessFunction',
  WorkspaceLogo = 'WorkspaceLogo'
}

export enum FilterIs {
  NotNull = 'NotNull',
  Null = 'Null'
}

export type FindAvailableSsoidpOutput = {
  __typename?: 'FindAvailableSSOIDPOutput';
  id: Scalars['String'];
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

export type GetApiKeyDto = {
  id: Scalars['String'];
};

export type GetAuthorizationUrlForSsoInput = {
  identityProviderId: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
};

export type GetAuthorizationUrlForSsoOutput = {
  __typename?: 'GetAuthorizationUrlForSSOOutput';
  authorizationURL: Scalars['String'];
  id: Scalars['String'];
  type: Scalars['String'];
};

export type GetLoginTokenFromEmailVerificationTokenOutput = {
  __typename?: 'GetLoginTokenFromEmailVerificationTokenOutput';
  loginToken: AuthToken;
  workspaceUrls: WorkspaceUrls;
};

export type GetServerlessFunctionSourceCodeInput = {
  /** The id of the function. */
  id: Scalars['ID'];
  /** The version of the function */
  version?: Scalars['String'];
};

export type GetWebhookDto = {
  id: Scalars['String'];
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

export type ImapSmtpCaldavConnectionParameters = {
  __typename?: 'ImapSmtpCaldavConnectionParameters';
  CALDAV?: Maybe<ConnectionParametersOutput>;
  IMAP?: Maybe<ConnectionParametersOutput>;
  SMTP?: Maybe<ConnectionParametersOutput>;
};

export type ImapSmtpCaldavConnectionSuccess = {
  __typename?: 'ImapSmtpCaldavConnectionSuccess';
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

export type InvalidatePassword = {
  __typename?: 'InvalidatePassword';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
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

export type LoginToken = {
  __typename?: 'LoginToken';
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
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateWorkflowVersion: Scalars['Boolean'];
  activateWorkspace: Workspace;
  assignRoleToAgent: Scalars['Boolean'];
  authorizeApp: AuthorizeApp;
  checkCustomDomainValidRecords?: Maybe<CustomDomainValidRecords>;
  checkoutSession: BillingSessionOutput;
  computeStepOutputSchema: Scalars['JSON'];
  createApiKey: ApiKey;
  createApprovedAccessDomain: ApprovedAccessDomain;
  createDatabaseConfigVariable: Scalars['Boolean'];
  createDraftFromWorkflowVersion: WorkflowVersion;
  createOIDCIdentityProvider: SetupSsoOutput;
  createObjectEvent: Analytics;
  createOneAppToken: AppToken;
  createOneField: Field;
  createOneObject: Object;
  createOneRemoteServer: RemoteServer;
  createOneRole: Role;
  createOneServerlessFunction: ServerlessFunction;
  createSAMLIdentityProvider: SetupSsoOutput;
  createWebhook: Webhook;
  createWorkflowVersionStep: WorkflowAction;
  deactivateWorkflowVersion: Scalars['Boolean'];
  deleteApprovedAccessDomain: Scalars['Boolean'];
  deleteCurrentWorkspace: Workspace;
  deleteDatabaseConfigVariable: Scalars['Boolean'];
  deleteOneField: Field;
  deleteOneObject: Object;
  deleteOneRemoteServer: RemoteServer;
  deleteOneRole: Scalars['String'];
  deleteOneServerlessFunction: ServerlessFunction;
  deleteSSOIdentityProvider: DeleteSsoOutput;
  deleteUser: User;
  deleteWebhook: Scalars['Boolean'];
  deleteWorkflowVersionStep: WorkflowAction;
  deleteWorkspaceInvitation: Scalars['String'];
  disablePostgresProxy: PostgresCredentials;
  editSSOIdentityProvider: EditSsoOutput;
  emailPasswordResetLink: EmailPasswordResetLink;
  enablePostgresProxy: PostgresCredentials;
  endSubscriptionTrialPeriod: BillingEndTrialPeriodOutput;
  executeOneServerlessFunction: ServerlessFunctionExecutionResult;
  generateApiKeyToken: ApiKeyToken;
  generateTransientToken: TransientToken;
  getAuthTokensFromLoginToken: AuthTokens;
  getAuthorizationUrlForSSO: GetAuthorizationUrlForSsoOutput;
  getLoginTokenFromCredentials: LoginToken;
  getLoginTokenFromEmailVerificationToken: GetLoginTokenFromEmailVerificationTokenOutput;
  impersonate: ImpersonateOutput;
  publishServerlessFunction: ServerlessFunction;
  removeRoleFromAgent: Scalars['Boolean'];
  renewToken: AuthTokens;
  resendEmailVerificationToken: ResendEmailVerificationTokenOutput;
  resendWorkspaceInvitation: SendInvitationsOutput;
  revokeApiKey?: Maybe<ApiKey>;
  runWorkflowVersion: WorkflowRun;
  saveImapSmtpCaldav: ImapSmtpCaldavConnectionSuccess;
  sendInvitations: SendInvitationsOutput;
  signIn: AvailableWorkspacesAndAccessTokensOutput;
  signUp: AvailableWorkspacesAndAccessTokensOutput;
  signUpInNewWorkspace: SignUpOutput;
  signUpInWorkspace: SignUpOutput;
  skipBookOnboardingStep: OnboardingStepSuccess;
  skipSyncEmailOnboardingStep: OnboardingStepSuccess;
  submitFormStep: Scalars['Boolean'];
  switchToEnterprisePlan: BillingUpdateOutput;
  switchToYearlyInterval: BillingUpdateOutput;
  syncRemoteTable: RemoteTable;
  syncRemoteTableSchemaChanges: RemoteTable;
  trackAnalytics: Analytics;
  unsyncRemoteTable: RemoteTable;
  updateApiKey?: Maybe<ApiKey>;
  updateDatabaseConfigVariable: Scalars['Boolean'];
  updateLabPublicFeatureFlag: FeatureFlagDto;
  updateOneAgent: Agent;
  updateOneField: Field;
  updateOneObject: Object;
  updateOneRemoteServer: RemoteServer;
  updateOneRole: Role;
  updateOneServerlessFunction: ServerlessFunction;
  updatePasswordViaResetToken: InvalidatePassword;
  updateWebhook?: Maybe<Webhook>;
  updateWorkflowRunStep: WorkflowAction;
  updateWorkflowVersionStep: WorkflowAction;
  updateWorkspace: Workspace;
  updateWorkspaceFeatureFlag: Scalars['Boolean'];
  updateWorkspaceMemberRole: WorkspaceMember;
  uploadFile: SignedFileDto;
  uploadImage: SignedFileDto;
  uploadProfilePicture: SignedFileDto;
  uploadWorkspaceLogo: SignedFileDto;
  upsertFieldPermissions: Array<FieldPermission>;
  upsertObjectPermissions: Array<ObjectPermission>;
  upsertSettingPermissions: Array<SettingPermission>;
  userLookupAdminPanel: UserLookup;
  validateApprovedAccessDomain: ApprovedAccessDomain;
};


export type MutationActivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['String'];
};


export type MutationActivateWorkspaceArgs = {
  data: ActivateWorkspaceInput;
};


export type MutationAssignRoleToAgentArgs = {
  agentId: Scalars['UUID'];
  roleId: Scalars['UUID'];
};


export type MutationAuthorizeAppArgs = {
  clientId: Scalars['String'];
  codeChallenge?: InputMaybe<Scalars['String']>;
  redirectUrl: Scalars['String'];
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
  input: CreateApiKeyDto;
};


export type MutationCreateApprovedAccessDomainArgs = {
  input: CreateApprovedAccessDomainInput;
};


export type MutationCreateDatabaseConfigVariableArgs = {
  key: Scalars['String'];
  value: Scalars['JSON'];
};


export type MutationCreateDraftFromWorkflowVersionArgs = {
  input: CreateDraftFromWorkflowVersionInput;
};


export type MutationCreateOidcIdentityProviderArgs = {
  input: SetupOidcSsoInput;
};


export type MutationCreateObjectEventArgs = {
  event: Scalars['String'];
  objectMetadataId: Scalars['String'];
  properties?: InputMaybe<Scalars['JSON']>;
  recordId: Scalars['String'];
};


export type MutationCreateOneAppTokenArgs = {
  input: CreateOneAppTokenInput;
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


export type MutationCreateOneServerlessFunctionArgs = {
  input: CreateServerlessFunctionInput;
};


export type MutationCreateSamlIdentityProviderArgs = {
  input: SetupSamlSsoInput;
};


export type MutationCreateWebhookArgs = {
  input: CreateWebhookDto;
};


export type MutationCreateWorkflowVersionStepArgs = {
  input: CreateWorkflowVersionStepInput;
};


export type MutationDeactivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['String'];
};


export type MutationDeleteApprovedAccessDomainArgs = {
  input: DeleteApprovedAccessDomainInput;
};


export type MutationDeleteDatabaseConfigVariableArgs = {
  key: Scalars['String'];
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
  roleId: Scalars['String'];
};


export type MutationDeleteOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type MutationDeleteSsoIdentityProviderArgs = {
  input: DeleteSsoInput;
};


export type MutationDeleteWebhookArgs = {
  input: DeleteWebhookDto;
};


export type MutationDeleteWorkflowVersionStepArgs = {
  input: DeleteWorkflowVersionStepInput;
};


export type MutationDeleteWorkspaceInvitationArgs = {
  appTokenId: Scalars['String'];
};


export type MutationEditSsoIdentityProviderArgs = {
  input: EditSsoInput;
};


export type MutationEmailPasswordResetLinkArgs = {
  email: Scalars['String'];
  workspaceId: Scalars['String'];
};


export type MutationExecuteOneServerlessFunctionArgs = {
  input: ExecuteServerlessFunctionInput;
};


export type MutationGenerateApiKeyTokenArgs = {
  apiKeyId: Scalars['String'];
  expiresAt: Scalars['String'];
};


export type MutationGetAuthTokensFromLoginTokenArgs = {
  loginToken: Scalars['String'];
  origin: Scalars['String'];
};


export type MutationGetAuthorizationUrlForSsoArgs = {
  input: GetAuthorizationUrlForSsoInput;
};


export type MutationGetLoginTokenFromCredentialsArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  origin: Scalars['String'];
  password: Scalars['String'];
};


export type MutationGetLoginTokenFromEmailVerificationTokenArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  emailVerificationToken: Scalars['String'];
  origin: Scalars['String'];
};


export type MutationImpersonateArgs = {
  userId: Scalars['String'];
  workspaceId: Scalars['String'];
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


export type MutationRevokeApiKeyArgs = {
  input: RevokeApiKeyDto;
};


export type MutationRunWorkflowVersionArgs = {
  input: RunWorkflowVersionInput;
};


export type MutationSaveImapSmtpCaldavArgs = {
  accountOwnerId: Scalars['String'];
  accountType: AccountType;
  connectionParameters: ConnectionParameters;
  handle: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
};


export type MutationSendInvitationsArgs = {
  emails: Array<Scalars['String']>;
};


export type MutationSignInArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationSignUpArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationSignUpInWorkspaceArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  verifyEmailNextPath?: InputMaybe<Scalars['String']>;
  workspaceId?: InputMaybe<Scalars['String']>;
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']>;
};


export type MutationSubmitFormStepArgs = {
  input: SubmitFormStepInput;
};


export type MutationSyncRemoteTableArgs = {
  input: RemoteTableInput;
};


export type MutationSyncRemoteTableSchemaChangesArgs = {
  input: RemoteTableInput;
};


export type MutationTrackAnalyticsArgs = {
  event?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  properties?: InputMaybe<Scalars['JSON']>;
  type: AnalyticsType;
};


export type MutationUnsyncRemoteTableArgs = {
  input: RemoteTableInput;
};


export type MutationUpdateApiKeyArgs = {
  input: UpdateApiKeyDto;
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


export type MutationUpdateOneServerlessFunctionArgs = {
  input: UpdateServerlessFunctionInput;
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String'];
  passwordResetToken: Scalars['String'];
};


export type MutationUpdateWebhookArgs = {
  input: UpdateWebhookDto;
};


export type MutationUpdateWorkflowRunStepArgs = {
  input: UpdateWorkflowRunStepInput;
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
  workspaceId: Scalars['String'];
};


export type MutationUpdateWorkspaceMemberRoleArgs = {
  roleId: Scalars['String'];
  workspaceMemberId: Scalars['String'];
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
};


export type MutationUploadImageArgs = {
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
};


export type MutationUploadProfilePictureArgs = {
  file: Scalars['Upload'];
};


export type MutationUploadWorkspaceLogoArgs = {
  file: Scalars['Upload'];
};


export type MutationUpsertFieldPermissionsArgs = {
  upsertFieldPermissionsInput: UpsertFieldPermissionsInput;
};


export type MutationUpsertObjectPermissionsArgs = {
  upsertObjectPermissionsInput: UpsertObjectPermissionsInput;
};


export type MutationUpsertSettingPermissionsArgs = {
  upsertSettingPermissionsInput: UpsertSettingPermissionsInput;
};


export type MutationUserLookupAdminPanelArgs = {
  userIdentifier: Scalars['String'];
};


export type MutationValidateApprovedAccessDomainArgs = {
  input: ValidateApprovedAccessDomainInput;
};

export type Object = {
  __typename?: 'Object';
  createdAt: Scalars['DateTime'];
  dataSourceId: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  duplicateCriteria?: Maybe<Array<Array<Scalars['String']>>>;
  fields: ObjectFieldsConnection;
  fieldsList: Array<Field>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  imageIdentifierFieldMetadataId?: Maybe<Scalars['String']>;
  indexMetadataList: Array<Index>;
  indexMetadatas: ObjectIndexMetadatasConnection;
  isActive: Scalars['Boolean'];
  isCustom: Scalars['Boolean'];
  isLabelSyncedWithName: Scalars['Boolean'];
  isRemote: Scalars['Boolean'];
  isSearchable: Scalars['Boolean'];
  isSystem: Scalars['Boolean'];
  labelIdentifierFieldMetadataId?: Maybe<Scalars['String']>;
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
  objectMetadataId: Scalars['String'];
};

export type ObjectPermissionInput = {
  canDestroyObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canReadObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canSoftDeleteObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canUpdateObjectRecords?: InputMaybe<Scalars['Boolean']>;
  objectMetadataId: Scalars['String'];
};

export type ObjectRecordFilterInput = {
  and?: InputMaybe<Array<ObjectRecordFilterInput>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<ObjectRecordFilterInput>;
  or?: InputMaybe<Array<ObjectRecordFilterInput>>;
  updatedAt?: InputMaybe<DateFilter>;
};

export type ObjectStandardOverrides = {
  __typename?: 'ObjectStandardOverrides';
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  labelPlural?: Maybe<Scalars['String']>;
  labelSingular?: Maybe<Scalars['String']>;
  translations?: Maybe<Scalars['JSON']>;
};

export type OnDbEventDto = {
  __typename?: 'OnDbEventDTO';
  action: DatabaseEventAction;
  eventDate: Scalars['DateTime'];
  objectNameSingular: Scalars['String'];
  record: Scalars['JSON'];
  updatedFields?: Maybe<Array<Scalars['String']>>;
};

export type OnDbEventInput = {
  action?: InputMaybe<DatabaseEventAction>;
  objectNameSingular?: InputMaybe<Scalars['String']>;
  recordId?: InputMaybe<Scalars['String']>;
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

export enum PermissionsOnAllObjectRecords {
  DESTROY_ALL_OBJECT_RECORDS = 'DESTROY_ALL_OBJECT_RECORDS',
  READ_ALL_OBJECT_RECORDS = 'READ_ALL_OBJECT_RECORDS',
  SOFT_DELETE_ALL_OBJECT_RECORDS = 'SOFT_DELETE_ALL_OBJECT_RECORDS',
  UPDATE_ALL_OBJECT_RECORDS = 'UPDATE_ALL_OBJECT_RECORDS'
}

export type PostgresCredentials = {
  __typename?: 'PostgresCredentials';
  id: Scalars['UUID'];
  password: Scalars['String'];
  user: Scalars['String'];
  workspaceId: Scalars['String'];
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
  authProviders: AuthProviders;
  displayName?: Maybe<Scalars['String']>;
  id: Scalars['String'];
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
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  currentUser: User;
  currentWorkspace: Workspace;
  field: Field;
  fields: FieldConnection;
  findDistantTablesWithStatus: Array<RemoteTable>;
  findManyRemoteServersByType: Array<RemoteServer>;
  findManyServerlessFunctions: Array<ServerlessFunction>;
  findOneAgent: Agent;
  findOneRemoteServerById: RemoteServer;
  findOneServerlessFunction: ServerlessFunction;
  findWorkspaceFromInviteHash: Workspace;
  findWorkspaceInvitations: Array<WorkspaceInvitation>;
  getApprovedAccessDomains: Array<ApprovedAccessDomain>;
  getAvailablePackages: Scalars['JSON'];
  getConfigVariablesGrouped: ConfigVariablesOutput;
  getConnectedImapSmtpCaldavAccount: ConnectedImapSmtpCaldavAccount;
  getDatabaseConfigVariable: ConfigVariable;
  getIndicatorHealthStatus: AdminPanelHealthServiceData;
  getMeteredProductsUsage: Array<BillingMeteredProductUsageOutput>;
  getPostgresCredentials?: Maybe<PostgresCredentials>;
  getPublicWorkspaceDataByDomain: PublicWorkspaceDataOutput;
  getQueueMetrics: QueueMetricsData;
  getRoles: Array<Role>;
  getSSOIdentityProviders: Array<FindAvailableSsoidpOutput>;
  getServerlessFunctionSourceCode?: Maybe<Scalars['JSON']>;
  getSystemHealthStatus: SystemHealth;
  getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal;
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  index: Index;
  indexMetadatas: IndexConnection;
  object: Object;
  objects: ObjectConnection;
  plans: Array<BillingPlanOutput>;
  search: SearchResultConnection;
  validatePasswordResetToken: ValidatePasswordResetToken;
  versionInfo: VersionInfo;
  webhook?: Maybe<Webhook>;
  webhooks: Array<Webhook>;
};


export type QueryApiKeyArgs = {
  input: GetApiKeyDto;
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


export type QueryFindOneRemoteServerByIdArgs = {
  input: RemoteServerIdInput;
};


export type QueryFindOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String'];
};


export type QueryGetAvailablePackagesArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryGetConnectedImapSmtpCaldavAccountArgs = {
  id: Scalars['String'];
};


export type QueryGetDatabaseConfigVariableArgs = {
  key: Scalars['String'];
};


export type QueryGetIndicatorHealthStatusArgs = {
  indicatorId: HealthIndicatorId;
};


export type QueryGetPublicWorkspaceDataByDomainArgs = {
  origin?: InputMaybe<Scalars['String']>;
};


export type QueryGetQueueMetricsArgs = {
  queueName: Scalars['String'];
  timeRange?: InputMaybe<QueueMetricsTimeRange>;
};


export type QueryGetServerlessFunctionSourceCodeArgs = {
  input: GetServerlessFunctionSourceCodeInput;
};


export type QueryGetTimelineCalendarEventsFromCompanyIdArgs = {
  companyId: Scalars['UUID'];
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


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String'];
};


export type QueryWebhookArgs = {
  input: GetWebhookDto;
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
  foreignDataWrapperId: Scalars['ID'];
  foreignDataWrapperOptions?: Maybe<Scalars['JSON']>;
  foreignDataWrapperType: Scalars['String'];
  id: Scalars['ID'];
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
  remoteServerId: Scalars['ID'];
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

export type RevokeApiKeyDto = {
  id: Scalars['String'];
};

export type Role = {
  __typename?: 'Role';
  canDestroyAllObjectRecords: Scalars['Boolean'];
  canReadAllObjectRecords: Scalars['Boolean'];
  canSoftDeleteAllObjectRecords: Scalars['Boolean'];
  canUpdateAllObjectRecords: Scalars['Boolean'];
  canUpdateAllSettings: Scalars['Boolean'];
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  isEditable: Scalars['Boolean'];
  label: Scalars['String'];
  objectPermissions?: Maybe<Array<ObjectPermission>>;
  settingPermissions?: Maybe<Array<SettingPermission>>;
  workspaceMembers: Array<WorkspaceMember>;
};

export type RunWorkflowVersionInput = {
  /** Execution result in JSON format */
  payload?: InputMaybe<Scalars['JSON']>;
  /** Workflow run ID */
  workflowRunId?: InputMaybe<Scalars['String']>;
  /** Workflow version ID */
  workflowVersionId: Scalars['String'];
};

export type SsoConnection = {
  __typename?: 'SSOConnection';
  id: Scalars['String'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type SsoIdentityProvider = {
  __typename?: 'SSOIdentityProvider';
  id: Scalars['String'];
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
  recordId: Scalars['String'];
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
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  latestVersion?: Maybe<Scalars['String']>;
  latestVersionInputSchema?: Maybe<Scalars['JSON']>;
  name: Scalars['String'];
  publishedVersions: Array<Scalars['String']>;
  runtime: Scalars['String'];
  timeoutSeconds: Scalars['Float'];
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

export type SettingPermission = {
  __typename?: 'SettingPermission';
  id: Scalars['String'];
  roleId: Scalars['String'];
  setting: SettingPermissionType;
};

export enum SettingPermissionType {
  ADMIN_PANEL = 'ADMIN_PANEL',
  API_KEYS_AND_WEBHOOKS = 'API_KEYS_AND_WEBHOOKS',
  DATA_MODEL = 'DATA_MODEL',
  ROLES = 'ROLES',
  SECURITY = 'SECURITY',
  WORKFLOWS = 'WORKFLOWS',
  WORKSPACE = 'WORKSPACE',
  WORKSPACE_MEMBERS = 'WORKSPACE_MEMBERS'
}

export type SetupOidcSsoInput = {
  clientID: Scalars['String'];
  clientSecret: Scalars['String'];
  issuer: Scalars['String'];
  name: Scalars['String'];
};

export type SetupSamlSsoInput = {
  certificate: Scalars['String'];
  fingerprint?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  issuer: Scalars['String'];
  name: Scalars['String'];
  ssoURL: Scalars['String'];
};

export type SetupSsoOutput = {
  __typename?: 'SetupSsoOutput';
  id: Scalars['String'];
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

export type SignedFileDto = {
  __typename?: 'SignedFileDTO';
  path: Scalars['String'];
  token: Scalars['String'];
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
  /** Workflow version ID */
  stepId: Scalars['String'];
  /** Workflow run ID */
  workflowRunId: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  onDbEvent: OnDbEventDto;
};


export type SubscriptionOnDbEventArgs = {
  input: OnDbEventInput;
};

export enum SubscriptionInterval {
  Day = 'Day',
  Month = 'Month',
  Week = 'Week',
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

export type TransientToken = {
  __typename?: 'TransientToken';
  transientToken: AuthToken;
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
  id: Scalars['UUID'];
  modelId: Scalars['String'];
  name: Scalars['String'];
  prompt: Scalars['String'];
  responseFormat?: InputMaybe<Scalars['JSON']>;
};

export type UpdateApiKeyDto = {
  expiresAt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  revokedAt?: InputMaybe<Scalars['String']>;
};

export type UpdateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']>;
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']>;
  isNullable?: InputMaybe<Scalars['Boolean']>;
  isSystem?: InputMaybe<Scalars['Boolean']>;
  isUnique?: InputMaybe<Scalars['Boolean']>;
  label?: InputMaybe<Scalars['String']>;
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
  imageIdentifierFieldMetadataId?: InputMaybe<Scalars['String']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']>;
  labelIdentifierFieldMetadataId?: InputMaybe<Scalars['String']>;
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

export type UpdateRemoteServerInput = {
  foreignDataWrapperOptions?: InputMaybe<Scalars['JSON']>;
  id: Scalars['String'];
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
  canDestroyAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canReadAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canSoftDeleteAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canUpdateAllObjectRecords?: InputMaybe<Scalars['Boolean']>;
  canUpdateAllSettings?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  label?: InputMaybe<Scalars['String']>;
};

export type UpdateServerlessFunctionInput = {
  code: Scalars['JSON'];
  description?: InputMaybe<Scalars['String']>;
  /** Id of the serverless function to execute */
  id: Scalars['UUID'];
  name: Scalars['String'];
  timeoutSeconds?: InputMaybe<Scalars['Float']>;
};

export type UpdateWebhookDto = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  operations?: InputMaybe<Array<Scalars['String']>>;
  secret?: InputMaybe<Scalars['String']>;
  targetUrl?: InputMaybe<Scalars['String']>;
};

export type UpdateWorkflowRunStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON'];
  /** Workflow run ID */
  workflowRunId: Scalars['String'];
};

export type UpdateWorkflowVersionStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String'];
};

export type UpdateWorkspaceInput = {
  allowImpersonation?: InputMaybe<Scalars['Boolean']>;
  customDomain?: InputMaybe<Scalars['String']>;
  defaultRoleId?: InputMaybe<Scalars['String']>;
  displayName?: InputMaybe<Scalars['String']>;
  inviteHash?: InputMaybe<Scalars['String']>;
  isGoogleAuthEnabled?: InputMaybe<Scalars['Boolean']>;
  isMicrosoftAuthEnabled?: InputMaybe<Scalars['Boolean']>;
  isPasswordAuthEnabled?: InputMaybe<Scalars['Boolean']>;
  isPublicInviteLinkEnabled?: InputMaybe<Scalars['Boolean']>;
  logo?: InputMaybe<Scalars['String']>;
  subdomain?: InputMaybe<Scalars['String']>;
};

export type UpsertFieldPermissionsInput = {
  fieldPermissions: Array<FieldPermissionInput>;
  roleId: Scalars['String'];
};

export type UpsertObjectPermissionsInput = {
  objectPermissions: Array<ObjectPermissionInput>;
  roleId: Scalars['String'];
};

export type UpsertSettingPermissionsInput = {
  roleId: Scalars['String'];
  settingPermissionKeys: Array<SettingPermissionType>;
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
  id: Scalars['UUID'];
  isEmailVerified: Scalars['Boolean'];
  lastName: Scalars['String'];
  locale: Scalars['String'];
  onboardingStatus?: Maybe<OnboardingStatus>;
  passwordHash?: Maybe<Scalars['String']>;
  supportUserHash?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  userVars?: Maybe<Scalars['JSONObject']>;
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
  id: Scalars['String'];
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
  /** @deprecated Use objectPermissions instead */
  objectRecordsPermissions?: Maybe<Array<PermissionsOnAllObjectRecords>>;
  settingsPermissions?: Maybe<Array<SettingPermissionType>>;
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['String'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['String'];
};

export type ValidateApprovedAccessDomainInput = {
  approvedAccessDomainId: Scalars['String'];
  validationToken: Scalars['String'];
};

export type ValidatePasswordResetToken = {
  __typename?: 'ValidatePasswordResetToken';
  email: Scalars['String'];
  id: Scalars['String'];
};

export type VersionInfo = {
  __typename?: 'VersionInfo';
  currentVersion?: Maybe<Scalars['String']>;
  latestVersion: Scalars['String'];
};

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
  workspace: Workspace;
  workspaceId: Scalars['String'];
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

export type WorkflowAction = {
  __typename?: 'WorkflowAction';
  id: Scalars['UUID'];
  name: Scalars['String'];
  nextStepIds?: Maybe<Array<Scalars['UUID']>>;
  settings: Scalars['JSON'];
  type: Scalars['String'];
  valid: Scalars['Boolean'];
};

export type WorkflowRun = {
  __typename?: 'WorkflowRun';
  workflowRunId: Scalars['UUID'];
};

export type WorkflowVersion = {
  __typename?: 'WorkflowVersion';
  id: Scalars['UUID'];
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
  defaultAgent?: Maybe<Agent>;
  defaultRole?: Maybe<Role>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  displayName?: Maybe<Scalars['String']>;
  featureFlags?: Maybe<Array<FeatureFlagDto>>;
  hasValidEnterpriseKey: Scalars['Boolean'];
  id: Scalars['UUID'];
  inviteHash?: Maybe<Scalars['String']>;
  isCustomDomainEnabled: Scalars['Boolean'];
  isGoogleAuthEnabled: Scalars['Boolean'];
  isMicrosoftAuthEnabled: Scalars['Boolean'];
  isPasswordAuthEnabled: Scalars['Boolean'];
  isPublicInviteLinkEnabled: Scalars['Boolean'];
  logo?: Maybe<Scalars['String']>;
  metadataVersion: Scalars['Float'];
  subdomain: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  version?: Maybe<Scalars['String']>;
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
  id: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  totalUsers: Scalars['Float'];
  users: Array<UserInfo>;
};

export type WorkspaceInvitation = {
  __typename?: 'WorkspaceInvitation';
  email: Scalars['String'];
  expiresAt: Scalars['DateTime'];
  id: Scalars['UUID'];
};

export type WorkspaceInviteHashValid = {
  __typename?: 'WorkspaceInviteHashValid';
  isValid: Scalars['Boolean'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']>;
  colorScheme: Scalars['String'];
  dateFormat?: Maybe<WorkspaceMemberDateFormatEnum>;
  id: Scalars['UUID'];
  locale?: Maybe<Scalars['String']>;
  name: FullName;
  roles?: Maybe<Array<Role>>;
  timeFormat?: Maybe<WorkspaceMemberTimeFormatEnum>;
  timeZone?: Maybe<Scalars['String']>;
  userEmail: Scalars['String'];
  userWorkspaceId?: Maybe<Scalars['String']>;
};

/** Date format as Month first, Day first, Year first or system as default */
export enum WorkspaceMemberDateFormatEnum {
  DAY_FIRST = 'DAY_FIRST',
  MONTH_FIRST = 'MONTH_FIRST',
  SYSTEM = 'SYSTEM',
  YEAR_FIRST = 'YEAR_FIRST'
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
  id: Scalars['String'];
};

export type WorkspaceUrls = {
  __typename?: 'WorkspaceUrls';
  customUrl?: Maybe<Scalars['String']>;
  subdomainUrl: Scalars['String'];
};

export type WorkspaceUrlsAndId = {
  __typename?: 'WorkspaceUrlsAndId';
  id: Scalars['String'];
  workspaceUrls: WorkspaceUrls;
};

export type TrackAnalyticsMutationVariables = Exact<{
  type: AnalyticsType;
  event?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  properties?: InputMaybe<Scalars['JSON']>;
}>;


export type TrackAnalyticsMutation = { __typename?: 'Mutation', trackAnalytics: { __typename?: 'Analytics', success: boolean } };

export type UploadFileMutationVariables = Exact<{
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
}>;


export type UploadFileMutation = { __typename?: 'Mutation', uploadFile: { __typename?: 'SignedFileDTO', path: string, token: string } };

export type UploadImageMutationVariables = Exact<{
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
}>;


export type UploadImageMutation = { __typename?: 'Mutation', uploadImage: { __typename?: 'SignedFileDTO', path: string, token: string } };

export type AuthTokenFragmentFragment = { __typename?: 'AuthToken', token: string, expiresAt: string };

export type AuthTokensFragmentFragment = { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } };

export type AvailableWorkspaceFragmentFragment = { __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> };

export type AvailableWorkspacesFragmentFragment = { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> };

export type AvailableSsoIdentityProvidersFragmentFragment = { __typename?: 'FindAvailableSSOIDPOutput', id: string, issuer: string, name: string, status: SsoIdentityProviderStatus, workspace: { __typename?: 'WorkspaceNameAndId', id: string, displayName?: string | null } };

export type AuthorizeAppMutationVariables = Exact<{
  clientId: Scalars['String'];
  codeChallenge: Scalars['String'];
  redirectUrl: Scalars['String'];
}>;


export type AuthorizeAppMutation = { __typename?: 'Mutation', authorizeApp: { __typename?: 'AuthorizeApp', redirectUrl: string } };

export type EmailPasswordResetLinkMutationVariables = Exact<{
  email: Scalars['String'];
  workspaceId: Scalars['String'];
}>;


export type EmailPasswordResetLinkMutation = { __typename?: 'Mutation', emailPasswordResetLink: { __typename?: 'EmailPasswordResetLink', success: boolean } };

export type GenerateApiKeyTokenMutationVariables = Exact<{
  apiKeyId: Scalars['String'];
  expiresAt: Scalars['String'];
}>;


export type GenerateApiKeyTokenMutation = { __typename?: 'Mutation', generateApiKeyToken: { __typename?: 'ApiKeyToken', token: string } };

export type GenerateTransientTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateTransientTokenMutation = { __typename?: 'Mutation', generateTransientToken: { __typename?: 'TransientToken', transientToken: { __typename?: 'AuthToken', token: string } } };

export type GetAuthTokensFromLoginTokenMutationVariables = Exact<{
  loginToken: Scalars['String'];
  origin: Scalars['String'];
}>;


export type GetAuthTokensFromLoginTokenMutation = { __typename?: 'Mutation', getAuthTokensFromLoginToken: { __typename?: 'AuthTokens', tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

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


export type GetLoginTokenFromCredentialsMutation = { __typename?: 'Mutation', getLoginTokenFromCredentials: { __typename?: 'LoginToken', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } };

export type GetLoginTokenFromEmailVerificationTokenMutationVariables = Exact<{
  emailVerificationToken: Scalars['String'];
  email: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
  origin: Scalars['String'];
}>;


export type GetLoginTokenFromEmailVerificationTokenMutation = { __typename?: 'Mutation', getLoginTokenFromEmailVerificationToken: { __typename?: 'GetLoginTokenFromEmailVerificationTokenOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } };

export type ImpersonateMutationVariables = Exact<{
  userId: Scalars['String'];
  workspaceId: Scalars['String'];
}>;


export type ImpersonateMutation = { __typename?: 'Mutation', impersonate: { __typename?: 'ImpersonateOutput', workspace: { __typename?: 'WorkspaceUrlsAndId', id: string, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } }, loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } };

export type RenewTokenMutationVariables = Exact<{
  appToken: Scalars['String'];
}>;


export type RenewTokenMutation = { __typename?: 'Mutation', renewToken: { __typename?: 'AuthTokens', tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type ResendEmailVerificationTokenMutationVariables = Exact<{
  email: Scalars['String'];
  origin: Scalars['String'];
}>;


export type ResendEmailVerificationTokenMutation = { __typename?: 'Mutation', resendEmailVerificationToken: { __typename?: 'ResendEmailVerificationTokenOutput', success: boolean } };

export type SignInMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
}>;


export type SignInMutation = { __typename?: 'Mutation', signIn: { __typename?: 'AvailableWorkspacesAndAccessTokensOutput', availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> }, tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type SignUpMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'AvailableWorkspacesAndAccessTokensOutput', availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> }, tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type SignUpInNewWorkspaceMutationVariables = Exact<{ [key: string]: never; }>;


export type SignUpInNewWorkspaceMutation = { __typename?: 'Mutation', signUpInNewWorkspace: { __typename?: 'SignUpOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, workspace: { __typename?: 'WorkspaceUrlsAndId', id: string, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } } };

export type SignUpInWorkspaceMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']>;
  captchaToken?: InputMaybe<Scalars['String']>;
  workspaceId?: InputMaybe<Scalars['String']>;
  locale?: InputMaybe<Scalars['String']>;
  verifyEmailNextPath?: InputMaybe<Scalars['String']>;
}>;


export type SignUpInWorkspaceMutation = { __typename?: 'Mutation', signUpInWorkspace: { __typename?: 'SignUpOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, workspace: { __typename?: 'WorkspaceUrlsAndId', id: string, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } } };

export type UpdatePasswordViaResetTokenMutationVariables = Exact<{
  token: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type UpdatePasswordViaResetTokenMutation = { __typename?: 'Mutation', updatePasswordViaResetToken: { __typename?: 'InvalidatePassword', success: boolean } };

export type CheckUserExistsQueryVariables = Exact<{
  email: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
}>;


export type CheckUserExistsQuery = { __typename?: 'Query', checkUserExists: { __typename?: 'CheckUserExistOutput', exists: boolean, availableWorkspacesCount: number, isEmailVerified: boolean } };

export type GetPublicWorkspaceDataByDomainQueryVariables = Exact<{
  origin: Scalars['String'];
}>;


export type GetPublicWorkspaceDataByDomainQuery = { __typename?: 'Query', getPublicWorkspaceDataByDomain: { __typename?: 'PublicWorkspaceDataOutput', id: string, logo?: string | null, displayName?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, authProviders: { __typename?: 'AuthProviders', google: boolean, magicLink: boolean, password: boolean, microsoft: boolean, sso: Array<{ __typename?: 'SSOIdentityProvider', id: string, name: string, type: IdentityProviderType, status: SsoIdentityProviderStatus, issuer: string }> } } };

export type ValidatePasswordResetTokenQueryVariables = Exact<{
  token: Scalars['String'];
}>;


export type ValidatePasswordResetTokenQuery = { __typename?: 'Query', validatePasswordResetToken: { __typename?: 'ValidatePasswordResetToken', id: string, email: string } };

export type CheckoutSessionMutationVariables = Exact<{
  recurringInterval: SubscriptionInterval;
  successUrlPath?: InputMaybe<Scalars['String']>;
  plan: BillingPlanKey;
  requirePaymentMethod: Scalars['Boolean'];
}>;


export type CheckoutSessionMutation = { __typename?: 'Mutation', checkoutSession: { __typename?: 'BillingSessionOutput', url?: string | null } };

export type EndSubscriptionTrialPeriodMutationVariables = Exact<{ [key: string]: never; }>;


export type EndSubscriptionTrialPeriodMutation = { __typename?: 'Mutation', endSubscriptionTrialPeriod: { __typename?: 'BillingEndTrialPeriodOutput', status?: SubscriptionStatus | null, hasPaymentMethod: boolean } };

export type SwitchSubscriptionToEnterprisePlanMutationVariables = Exact<{ [key: string]: never; }>;


export type SwitchSubscriptionToEnterprisePlanMutation = { __typename?: 'Mutation', switchToEnterprisePlan: { __typename?: 'BillingUpdateOutput', success: boolean } };

export type SwitchSubscriptionToYearlyIntervalMutationVariables = Exact<{ [key: string]: never; }>;


export type SwitchSubscriptionToYearlyIntervalMutation = { __typename?: 'Mutation', switchToYearlyInterval: { __typename?: 'BillingUpdateOutput', success: boolean } };

export type BillingBaseProductPricesQueryVariables = Exact<{ [key: string]: never; }>;


export type BillingBaseProductPricesQuery = { __typename?: 'Query', plans: Array<{ __typename?: 'BillingPlanOutput', planKey: BillingPlanKey, baseProduct: { __typename?: 'BillingProduct', name: string, prices?: Array<{ __typename?: 'BillingPriceLicensedDTO', unitAmount: number, stripePriceId: string, recurringInterval: SubscriptionInterval } | { __typename?: 'BillingPriceMeteredDTO' }> | null } }> };

export type BillingPortalSessionQueryVariables = Exact<{
  returnUrlPath?: InputMaybe<Scalars['String']>;
}>;


export type BillingPortalSessionQuery = { __typename?: 'Query', billingPortalSession: { __typename?: 'BillingSessionOutput', url?: string | null } };

export type GetMeteredProductsUsageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeteredProductsUsageQuery = { __typename?: 'Query', getMeteredProductsUsage: Array<{ __typename?: 'BillingMeteredProductUsageOutput', productKey: BillingProductKey, usageQuantity: number, freeTierQuantity: number, freeTrialQuantity: number, unitPriceCents: number, totalCostCents: number }> };

export type RemoteServerFieldsFragment = { __typename?: 'RemoteServer', id: string, createdAt: string, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: string, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null };

export type RemoteTableFieldsFragment = { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null };

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


export type SyncRemoteTableMutation = { __typename?: 'Mutation', syncRemoteTable: { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

export type SyncRemoteTableSchemaChangesMutationVariables = Exact<{
  input: RemoteTableInput;
}>;


export type SyncRemoteTableSchemaChangesMutation = { __typename?: 'Mutation', syncRemoteTableSchemaChanges: { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

export type UnsyncRemoteTableMutationVariables = Exact<{
  input: RemoteTableInput;
}>;


export type UnsyncRemoteTableMutation = { __typename?: 'Mutation', unsyncRemoteTable: { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

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


export type GetManyRemoteTablesQuery = { __typename?: 'Query', findDistantTablesWithStatus: Array<{ __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null }> };

export type GetOneDatabaseConnectionQueryVariables = Exact<{
  input: RemoteServerIdInput;
}>;


export type GetOneDatabaseConnectionQuery = { __typename?: 'Query', findOneRemoteServerById: { __typename?: 'RemoteServer', id: string, createdAt: string, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: string, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type CreateOneObjectMetadataItemMutationVariables = Exact<{
  input: CreateOneObjectInput;
}>;


export type CreateOneObjectMetadataItemMutation = { __typename?: 'Mutation', createOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type CreateOneFieldMetadataItemMutationVariables = Exact<{
  input: CreateOneFieldMetadataInput;
}>;


export type CreateOneFieldMetadataItemMutation = { __typename?: 'Mutation', createOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: string, updatedAt: string, settings?: any | null, defaultValue?: any | null, options?: any | null, isLabelSyncedWithName?: boolean | null } };

export type UpdateOneFieldMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID'];
  updatePayload: UpdateFieldInput;
}>;


export type UpdateOneFieldMetadataItemMutation = { __typename?: 'Mutation', updateOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: string, updatedAt: string, settings?: any | null, isLabelSyncedWithName?: boolean | null } };

export type UpdateOneObjectMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID'];
  updatePayload: UpdateObjectPayload;
}>;


export type UpdateOneObjectMetadataItemMutation = { __typename?: 'Mutation', updateOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type DeleteOneObjectMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID'];
}>;


export type DeleteOneObjectMetadataItemMutation = { __typename?: 'Mutation', deleteOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type DeleteOneFieldMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID'];
}>;


export type DeleteOneFieldMetadataItemMutation = { __typename?: 'Mutation', deleteOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: string, updatedAt: string, settings?: any | null } };

export type ObjectMetadataItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type ObjectMetadataItemsQuery = { __typename?: 'Query', objects: { __typename?: 'ObjectConnection', edges: Array<{ __typename?: 'ObjectEdge', node: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isRemote: boolean, isActive: boolean, isSystem: boolean, createdAt: string, updatedAt: string, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, shortcut?: string | null, isLabelSyncedWithName: boolean, isSearchable: boolean, duplicateCriteria?: Array<Array<string>> | null, indexMetadataList: Array<{ __typename?: 'Index', id: any, createdAt: string, updatedAt: string, name: string, indexWhereClause?: string | null, indexType: IndexType, isUnique: boolean, indexFieldMetadataList: Array<{ __typename?: 'IndexField', id: any, fieldMetadataId: any, createdAt: string, updatedAt: string, order: number }> }>, fieldsList: Array<{ __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isSystem?: boolean | null, isNullable?: boolean | null, isUnique?: boolean | null, createdAt: string, updatedAt: string, defaultValue?: any | null, options?: any | null, settings?: any | null, isLabelSyncedWithName?: boolean | null, relation?: { __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: any, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: any, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: any, name: string }, targetFieldMetadata: { __typename?: 'Field', id: any, name: string } } | null }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: any | null, endCursor?: any | null } } };

export type SkipBookOnboardingStepMutationVariables = Exact<{ [key: string]: never; }>;


export type SkipBookOnboardingStepMutation = { __typename?: 'Mutation', skipBookOnboardingStep: { __typename?: 'OnboardingStepSuccess', success: boolean } };

export type SkipSyncEmailOnboardingStepMutationVariables = Exact<{ [key: string]: never; }>;


export type SkipSyncEmailOnboardingStepMutation = { __typename?: 'Mutation', skipSyncEmailOnboardingStep: { __typename?: 'OnboardingStepSuccess', success: boolean } };

export type SaveImapSmtpCaldavMutationVariables = Exact<{
  accountOwnerId: Scalars['String'];
  handle: Scalars['String'];
  accountType: AccountType;
  connectionParameters: ConnectionParameters;
  id?: InputMaybe<Scalars['String']>;
}>;


export type SaveImapSmtpCaldavMutation = { __typename?: 'Mutation', saveImapSmtpCaldav: { __typename?: 'ImapSmtpCaldavConnectionSuccess', success: boolean } };

export type GetConnectedImapSmtpCaldavAccountQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetConnectedImapSmtpCaldavAccountQuery = { __typename?: 'Query', getConnectedImapSmtpCaldavAccount: { __typename?: 'ConnectedImapSmtpCaldavAccount', id: string, handle: string, provider: string, accountOwnerId: string, connectionParameters?: { __typename?: 'ImapSmtpCaldavConnectionParameters', IMAP?: { __typename?: 'ConnectionParametersOutput', host: string, port: number, secure?: boolean | null, password: string } | null, SMTP?: { __typename?: 'ConnectionParametersOutput', host: string, port: number, secure?: boolean | null, password: string } | null, CALDAV?: { __typename?: 'ConnectionParametersOutput', host: string, port: number, secure?: boolean | null, password: string } | null } | null } };

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
  workspaceId: Scalars['String'];
  featureFlag: Scalars['String'];
  value: Scalars['Boolean'];
}>;


export type UpdateWorkspaceFeatureFlagMutation = { __typename?: 'Mutation', updateWorkspaceFeatureFlag: boolean };

export type UserLookupAdminPanelMutationVariables = Exact<{
  userIdentifier: Scalars['String'];
}>;


export type UserLookupAdminPanelMutation = { __typename?: 'Mutation', userLookupAdminPanel: { __typename?: 'UserLookup', user: { __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null }, workspaces: Array<{ __typename?: 'WorkspaceInfo', id: string, name: string, logo?: string | null, totalUsers: number, allowImpersonation: boolean, users: Array<{ __typename?: 'UserInfo', id: string, email: string, firstName?: string | null, lastName?: string | null }>, featureFlags: Array<{ __typename?: 'FeatureFlag', key: FeatureFlagKey, value: boolean }> }> } };

export type GetVersionInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVersionInfoQuery = { __typename?: 'Query', versionInfo: { __typename?: 'VersionInfo', currentVersion?: string | null, latestVersion: string } };

export type GetIndicatorHealthStatusQueryVariables = Exact<{
  indicatorId: HealthIndicatorId;
}>;


export type GetIndicatorHealthStatusQuery = { __typename?: 'Query', getIndicatorHealthStatus: { __typename?: 'AdminPanelHealthServiceData', id: string, label: string, description: string, status: AdminPanelHealthServiceStatus, errorMessage?: string | null, details?: string | null, queues?: Array<{ __typename?: 'AdminPanelWorkerQueueHealth', id: string, queueName: string, status: AdminPanelHealthServiceStatus }> | null } };

export type GetQueueMetricsQueryVariables = Exact<{
  queueName: Scalars['String'];
  timeRange?: InputMaybe<QueueMetricsTimeRange>;
}>;


export type GetQueueMetricsQuery = { __typename?: 'Query', getQueueMetrics: { __typename?: 'QueueMetricsData', queueName: string, timeRange: QueueMetricsTimeRange, workers: number, details?: { __typename?: 'WorkerQueueMetrics', failed: number, completed: number, waiting: number, active: number, delayed: number, failureRate: number } | null, data: Array<{ __typename?: 'QueueMetricsSeries', id: string, data: Array<{ __typename?: 'QueueMetricsDataPoint', x: number, y: number }> }> } };

export type GetSystemHealthStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSystemHealthStatusQuery = { __typename?: 'Query', getSystemHealthStatus: { __typename?: 'SystemHealth', services: Array<{ __typename?: 'SystemHealthService', id: HealthIndicatorId, label: string, status: AdminPanelHealthServiceStatus }> } };

export type ApiKeyFragmentFragment = { __typename?: 'ApiKey', id: any, name: string, expiresAt: string, revokedAt?: string | null };

export type WebhookFragmentFragment = { __typename?: 'Webhook', id: any, targetUrl: string, operations: Array<string>, description?: string | null, secret: string };

export type CreateApiKeyMutationVariables = Exact<{
  input: CreateApiKeyDto;
}>;


export type CreateApiKeyMutation = { __typename?: 'Mutation', createApiKey: { __typename?: 'ApiKey', id: any, name: string, expiresAt: string, revokedAt?: string | null } };

export type CreateWebhookMutationVariables = Exact<{
  input: CreateWebhookDto;
}>;


export type CreateWebhookMutation = { __typename?: 'Mutation', createWebhook: { __typename?: 'Webhook', id: any, targetUrl: string, operations: Array<string>, description?: string | null, secret: string } };

export type DeleteWebhookMutationVariables = Exact<{
  input: DeleteWebhookDto;
}>;


export type DeleteWebhookMutation = { __typename?: 'Mutation', deleteWebhook: boolean };

export type RevokeApiKeyMutationVariables = Exact<{
  input: RevokeApiKeyDto;
}>;


export type RevokeApiKeyMutation = { __typename?: 'Mutation', revokeApiKey?: { __typename?: 'ApiKey', id: any } | null };

export type UpdateApiKeyMutationVariables = Exact<{
  input: UpdateApiKeyDto;
}>;


export type UpdateApiKeyMutation = { __typename?: 'Mutation', updateApiKey?: { __typename?: 'ApiKey', id: any, name: string, expiresAt: string, revokedAt?: string | null } | null };

export type UpdateWebhookMutationVariables = Exact<{
  input: UpdateWebhookDto;
}>;


export type UpdateWebhookMutation = { __typename?: 'Mutation', updateWebhook?: { __typename?: 'Webhook', id: any, targetUrl: string, operations: Array<string>, description?: string | null, secret: string } | null };

export type GetApiKeyQueryVariables = Exact<{
  input: GetApiKeyDto;
}>;


export type GetApiKeyQuery = { __typename?: 'Query', apiKey?: { __typename?: 'ApiKey', createdAt: string, id: any, name: string, expiresAt: string, revokedAt?: string | null } | null };

export type GetApiKeysQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApiKeysQuery = { __typename?: 'Query', apiKeys: Array<{ __typename?: 'ApiKey', id: any, name: string, expiresAt: string, revokedAt?: string | null }> };

export type GetWebhookQueryVariables = Exact<{
  input: GetWebhookDto;
}>;


export type GetWebhookQuery = { __typename?: 'Query', webhook?: { __typename?: 'Webhook', id: any, targetUrl: string, operations: Array<string>, description?: string | null, secret: string } | null };

export type GetWebhooksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWebhooksQuery = { __typename?: 'Query', webhooks: Array<{ __typename?: 'Webhook', id: any, targetUrl: string, operations: Array<string>, description?: string | null, secret: string }> };

export type UpdateLabPublicFeatureFlagMutationVariables = Exact<{
  input: UpdateLabPublicFeatureFlagInput;
}>;


export type UpdateLabPublicFeatureFlagMutation = { __typename?: 'Mutation', updateLabPublicFeatureFlag: { __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean } };

export type ObjectPermissionFragmentFragment = { __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null };

export type RoleFragmentFragment = { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean };

export type SettingPermissionFragmentFragment = { __typename?: 'SettingPermission', id: string, setting: SettingPermissionType, roleId: string };

export type CreateOneRoleMutationVariables = Exact<{
  createRoleInput: CreateRoleInput;
}>;


export type CreateOneRoleMutation = { __typename?: 'Mutation', createOneRole: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } };

export type DeleteOneRoleMutationVariables = Exact<{
  roleId: Scalars['String'];
}>;


export type DeleteOneRoleMutation = { __typename?: 'Mutation', deleteOneRole: string };

export type UpdateOneRoleMutationVariables = Exact<{
  updateRoleInput: UpdateRoleInput;
}>;


export type UpdateOneRoleMutation = { __typename?: 'Mutation', updateOneRole: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } };

export type UpdateWorkspaceMemberRoleMutationVariables = Exact<{
  workspaceMemberId: Scalars['String'];
  roleId: Scalars['String'];
}>;


export type UpdateWorkspaceMemberRoleMutation = { __typename?: 'Mutation', updateWorkspaceMemberRole: { __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, roles?: Array<{ __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean }> | null, name: { __typename?: 'FullName', firstName: string, lastName: string } } };

export type UpsertObjectPermissionsMutationVariables = Exact<{
  upsertObjectPermissionsInput: UpsertObjectPermissionsInput;
}>;


export type UpsertObjectPermissionsMutation = { __typename?: 'Mutation', upsertObjectPermissions: Array<{ __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null }> };

export type UpsertSettingPermissionsMutationVariables = Exact<{
  upsertSettingPermissionsInput: UpsertSettingPermissionsInput;
}>;


export type UpsertSettingPermissionsMutation = { __typename?: 'Mutation', upsertSettingPermissions: Array<{ __typename?: 'SettingPermission', id: string, setting: SettingPermissionType, roleId: string }> };

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = { __typename?: 'Query', getRoles: Array<{ __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, workspaceMembers: Array<{ __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } }>, settingPermissions?: Array<{ __typename?: 'SettingPermission', id: string, setting: SettingPermissionType, roleId: string }> | null, objectPermissions?: Array<{ __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null }> | null }> };

export type CreateApprovedAccessDomainMutationVariables = Exact<{
  input: CreateApprovedAccessDomainInput;
}>;


export type CreateApprovedAccessDomainMutation = { __typename?: 'Mutation', createApprovedAccessDomain: { __typename?: 'ApprovedAccessDomain', id: any, domain: string, isValidated: boolean, createdAt: string } };

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


export type ValidateApprovedAccessDomainMutation = { __typename?: 'Mutation', validateApprovedAccessDomain: { __typename?: 'ApprovedAccessDomain', id: any, isValidated: boolean, domain: string, createdAt: string } };

export type GetApprovedAccessDomainsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetApprovedAccessDomainsQuery = { __typename?: 'Query', getApprovedAccessDomains: Array<{ __typename?: 'ApprovedAccessDomain', id: any, createdAt: string, domain: string, isValidated: boolean }> };

export type GetSsoIdentityProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSsoIdentityProvidersQuery = { __typename?: 'Query', getSSOIdentityProviders: Array<{ __typename?: 'FindAvailableSSOIDPOutput', type: IdentityProviderType, id: string, name: string, issuer: string, status: SsoIdentityProviderStatus }> };

export type ServerlessFunctionFieldsFragment = { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: string, updatedAt: string };

export type CreateOneServerlessFunctionItemMutationVariables = Exact<{
  input: CreateServerlessFunctionInput;
}>;


export type CreateOneServerlessFunctionItemMutation = { __typename?: 'Mutation', createOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: string, updatedAt: string } };

export type DeleteOneServerlessFunctionMutationVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type DeleteOneServerlessFunctionMutation = { __typename?: 'Mutation', deleteOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: string, updatedAt: string } };

export type ExecuteOneServerlessFunctionMutationVariables = Exact<{
  input: ExecuteServerlessFunctionInput;
}>;


export type ExecuteOneServerlessFunctionMutation = { __typename?: 'Mutation', executeOneServerlessFunction: { __typename?: 'ServerlessFunctionExecutionResult', data?: any | null, logs: string, duration: number, status: ServerlessFunctionExecutionStatus, error?: any | null } };

export type PublishOneServerlessFunctionMutationVariables = Exact<{
  input: PublishServerlessFunctionInput;
}>;


export type PublishOneServerlessFunctionMutation = { __typename?: 'Mutation', publishServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: string, updatedAt: string } };

export type UpdateOneServerlessFunctionMutationVariables = Exact<{
  input: UpdateServerlessFunctionInput;
}>;


export type UpdateOneServerlessFunctionMutation = { __typename?: 'Mutation', updateOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: string, updatedAt: string } };

export type FindManyAvailablePackagesQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type FindManyAvailablePackagesQuery = { __typename?: 'Query', getAvailablePackages: any };

export type GetManyServerlessFunctionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetManyServerlessFunctionsQuery = { __typename?: 'Query', findManyServerlessFunctions: Array<{ __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: string, updatedAt: string }> };

export type GetOneServerlessFunctionQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type GetOneServerlessFunctionQuery = { __typename?: 'Query', findOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: string, updatedAt: string } };

export type FindOneServerlessFunctionSourceCodeQueryVariables = Exact<{
  input: GetServerlessFunctionSourceCodeInput;
}>;


export type FindOneServerlessFunctionSourceCodeQuery = { __typename?: 'Query', getServerlessFunctionSourceCode?: any | null };

export type UserQueryFragmentFragment = { __typename?: 'User', id: any, firstName: string, lastName: string, email: string, canAccessFullAdminPanel: boolean, canImpersonate: boolean, supportUserHash?: string | null, onboardingStatus?: OnboardingStatus | null, userVars?: any | null, workspaceMember?: { __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } } | null, workspaceMembers?: Array<{ __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } }> | null, deletedWorkspaceMembers?: Array<{ __typename?: 'DeletedWorkspaceMember', id: any, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }> | null, currentUserWorkspace?: { __typename?: 'UserWorkspace', settingsPermissions?: Array<SettingPermissionType> | null, objectRecordsPermissions?: Array<PermissionsOnAllObjectRecords> | null, objectPermissions?: Array<{ __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null }> | null } | null, currentWorkspace?: { __typename?: 'Workspace', id: any, displayName?: string | null, logo?: string | null, inviteHash?: string | null, allowImpersonation: boolean, activationStatus: WorkspaceActivationStatus, isPublicInviteLinkEnabled: boolean, isGoogleAuthEnabled: boolean, isMicrosoftAuthEnabled: boolean, isPasswordAuthEnabled: boolean, subdomain: string, hasValidEnterpriseKey: boolean, customDomain?: string | null, isCustomDomainEnabled: boolean, metadataVersion: number, workspaceMembersCount?: number | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, featureFlags?: Array<{ __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean }> | null, currentBillingSubscription?: { __typename?: 'BillingSubscription', id: any, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItem', id: any, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, billingProduct?: { __typename?: 'BillingProduct', name: string, description: string, metadata: { __typename?: 'BillingProductMetadata', planKey: BillingPlanKey, priceUsageBased: BillingUsageType, productKey: BillingProductKey } } | null }> | null } | null, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: any, status: SubscriptionStatus, metadata: any }>, defaultRole?: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } | null, defaultAgent?: { __typename?: 'Agent', id: any } | null } | null, availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> } };

export type WorkspaceUrlsFragmentFragment = { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null };

export type DeleteUserAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserAccountMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'User', id: any } };

export type UploadProfilePictureMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadProfilePictureMutation = { __typename?: 'Mutation', uploadProfilePicture: { __typename?: 'SignedFileDTO', path: string, token: string } };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', id: any, firstName: string, lastName: string, email: string, canAccessFullAdminPanel: boolean, canImpersonate: boolean, supportUserHash?: string | null, onboardingStatus?: OnboardingStatus | null, userVars?: any | null, workspaceMember?: { __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } } | null, workspaceMembers?: Array<{ __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } }> | null, deletedWorkspaceMembers?: Array<{ __typename?: 'DeletedWorkspaceMember', id: any, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }> | null, currentUserWorkspace?: { __typename?: 'UserWorkspace', settingsPermissions?: Array<SettingPermissionType> | null, objectRecordsPermissions?: Array<PermissionsOnAllObjectRecords> | null, objectPermissions?: Array<{ __typename?: 'ObjectPermission', objectMetadataId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null }> | null } | null, currentWorkspace?: { __typename?: 'Workspace', id: any, displayName?: string | null, logo?: string | null, inviteHash?: string | null, allowImpersonation: boolean, activationStatus: WorkspaceActivationStatus, isPublicInviteLinkEnabled: boolean, isGoogleAuthEnabled: boolean, isMicrosoftAuthEnabled: boolean, isPasswordAuthEnabled: boolean, subdomain: string, hasValidEnterpriseKey: boolean, customDomain?: string | null, isCustomDomainEnabled: boolean, metadataVersion: number, workspaceMembersCount?: number | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, featureFlags?: Array<{ __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean }> | null, currentBillingSubscription?: { __typename?: 'BillingSubscription', id: any, status: SubscriptionStatus, interval?: SubscriptionInterval | null, metadata: any, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItem', id: any, hasReachedCurrentPeriodCap: boolean, quantity?: number | null, billingProduct?: { __typename?: 'BillingProduct', name: string, description: string, metadata: { __typename?: 'BillingProductMetadata', planKey: BillingPlanKey, priceUsageBased: BillingUsageType, productKey: BillingProductKey } } | null }> | null } | null, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: any, status: SubscriptionStatus, metadata: any }>, defaultRole?: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } | null, defaultAgent?: { __typename?: 'Agent', id: any } | null } | null, availableWorkspaces: { __typename?: 'AvailableWorkspaces', availableWorkspacesForSignIn: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }>, availableWorkspacesForSignUp: Array<{ __typename?: 'AvailableWorkspace', id: string, displayName?: string | null, loginToken?: string | null, inviteHash?: string | null, personalInviteToken?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> } } };

export type ActivateWorkflowVersionMutationVariables = Exact<{
  workflowVersionId: Scalars['String'];
}>;


export type ActivateWorkflowVersionMutation = { __typename?: 'Mutation', activateWorkflowVersion: boolean };

export type ComputeStepOutputSchemaMutationVariables = Exact<{
  input: ComputeStepOutputSchemaInput;
}>;


export type ComputeStepOutputSchemaMutation = { __typename?: 'Mutation', computeStepOutputSchema: any };

export type CreateDraftFromWorkflowVersionMutationVariables = Exact<{
  input: CreateDraftFromWorkflowVersionInput;
}>;


export type CreateDraftFromWorkflowVersionMutation = { __typename?: 'Mutation', createDraftFromWorkflowVersion: { __typename?: 'WorkflowVersion', id: any } };

export type CreateWorkflowVersionStepMutationVariables = Exact<{
  input: CreateWorkflowVersionStepInput;
}>;


export type CreateWorkflowVersionStepMutation = { __typename?: 'Mutation', createWorkflowVersionStep: { __typename?: 'WorkflowAction', id: any, name: string, type: string, settings: any, valid: boolean, nextStepIds?: Array<any> | null } };

export type DeactivateWorkflowVersionMutationVariables = Exact<{
  workflowVersionId: Scalars['String'];
}>;


export type DeactivateWorkflowVersionMutation = { __typename?: 'Mutation', deactivateWorkflowVersion: boolean };

export type DeleteWorkflowVersionStepMutationVariables = Exact<{
  input: DeleteWorkflowVersionStepInput;
}>;


export type DeleteWorkflowVersionStepMutation = { __typename?: 'Mutation', deleteWorkflowVersionStep: { __typename?: 'WorkflowAction', id: any, name: string, type: string, settings: any, valid: boolean, nextStepIds?: Array<any> | null } };

export type RunWorkflowVersionMutationVariables = Exact<{
  input: RunWorkflowVersionInput;
}>;


export type RunWorkflowVersionMutation = { __typename?: 'Mutation', runWorkflowVersion: { __typename?: 'WorkflowRun', workflowRunId: any } };

export type UpdateWorkflowRunStepMutationVariables = Exact<{
  input: UpdateWorkflowRunStepInput;
}>;


export type UpdateWorkflowRunStepMutation = { __typename?: 'Mutation', updateWorkflowRunStep: { __typename?: 'WorkflowAction', id: any, name: string, type: string, settings: any, valid: boolean, nextStepIds?: Array<any> | null } };

export type UpdateWorkflowVersionStepMutationVariables = Exact<{
  input: UpdateWorkflowVersionStepInput;
}>;


export type UpdateWorkflowVersionStepMutation = { __typename?: 'Mutation', updateWorkflowVersionStep: { __typename?: 'WorkflowAction', id: any, name: string, type: string, settings: any, valid: boolean, nextStepIds?: Array<any> | null } };

export type AssignRoleToAgentMutationVariables = Exact<{
  agentId: Scalars['UUID'];
  roleId: Scalars['UUID'];
}>;


export type AssignRoleToAgentMutation = { __typename?: 'Mutation', assignRoleToAgent: boolean };

export type RemoveRoleFromAgentMutationVariables = Exact<{
  agentId: Scalars['UUID'];
}>;


export type RemoveRoleFromAgentMutation = { __typename?: 'Mutation', removeRoleFromAgent: boolean };

export type UpdateOneAgentMutationVariables = Exact<{
  input: UpdateAgentInput;
}>;


export type UpdateOneAgentMutation = { __typename?: 'Mutation', updateOneAgent: { __typename?: 'Agent', id: any, name: string, description?: string | null, prompt: string, modelId: string, responseFormat?: any | null } };

export type FindOneAgentQueryVariables = Exact<{
  id: Scalars['UUID'];
}>;


export type FindOneAgentQuery = { __typename?: 'Query', findOneAgent: { __typename?: 'Agent', id: any, name: string, description?: string | null, prompt: string, modelId: string, responseFormat?: any | null, roleId?: any | null } };

export type SubmitFormStepMutationVariables = Exact<{
  input: SubmitFormStepInput;
}>;


export type SubmitFormStepMutation = { __typename?: 'Mutation', submitFormStep: boolean };

export type DeleteWorkspaceInvitationMutationVariables = Exact<{
  appTokenId: Scalars['String'];
}>;


export type DeleteWorkspaceInvitationMutation = { __typename?: 'Mutation', deleteWorkspaceInvitation: string };

export type ResendWorkspaceInvitationMutationVariables = Exact<{
  appTokenId: Scalars['String'];
}>;


export type ResendWorkspaceInvitationMutation = { __typename?: 'Mutation', resendWorkspaceInvitation: { __typename?: 'SendInvitationsOutput', success: boolean, errors: Array<string>, result: Array<{ __typename?: 'WorkspaceInvitation', id: any, email: string, expiresAt: string }> } };

export type SendInvitationsMutationVariables = Exact<{
  emails: Array<Scalars['String']> | Scalars['String'];
}>;


export type SendInvitationsMutation = { __typename?: 'Mutation', sendInvitations: { __typename?: 'SendInvitationsOutput', success: boolean, errors: Array<string>, result: Array<{ __typename?: 'WorkspaceInvitation', id: any, email: string, expiresAt: string }> } };

export type GetWorkspaceInvitationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspaceInvitationsQuery = { __typename?: 'Query', findWorkspaceInvitations: Array<{ __typename?: 'WorkspaceInvitation', id: any, email: string, expiresAt: string }> };

export type DeletedWorkspaceMemberQueryFragmentFragment = { __typename?: 'DeletedWorkspaceMember', id: any, avatarUrl?: string | null, userEmail: string, name: { __typename?: 'FullName', firstName: string, lastName: string } };

export type WorkspaceMemberQueryFragmentFragment = { __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, name: { __typename?: 'FullName', firstName: string, lastName: string } };

export type ActivateWorkspaceMutationVariables = Exact<{
  input: ActivateWorkspaceInput;
}>;


export type ActivateWorkspaceMutation = { __typename?: 'Mutation', activateWorkspace: { __typename?: 'Workspace', id: any } };

export type DeleteCurrentWorkspaceMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteCurrentWorkspaceMutation = { __typename?: 'Mutation', deleteCurrentWorkspace: { __typename?: 'Workspace', id: any } };

export type UpdateWorkspaceMutationVariables = Exact<{
  input: UpdateWorkspaceInput;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: any, customDomain?: string | null, subdomain: string, displayName?: string | null, logo?: string | null, allowImpersonation: boolean, isPublicInviteLinkEnabled: boolean, isGoogleAuthEnabled: boolean, isMicrosoftAuthEnabled: boolean, isPasswordAuthEnabled: boolean, defaultRole?: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } | null } };

export type UploadWorkspaceLogoMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadWorkspaceLogoMutation = { __typename?: 'Mutation', uploadWorkspaceLogo: { __typename?: 'SignedFileDTO', path: string, token: string } };

export type CheckCustomDomainValidRecordsMutationVariables = Exact<{ [key: string]: never; }>;


export type CheckCustomDomainValidRecordsMutation = { __typename?: 'Mutation', checkCustomDomainValidRecords?: { __typename?: 'CustomDomainValidRecords', id: string, customDomain: string, records: Array<{ __typename?: 'CustomDomainRecord', type: string, key: string, value: string, validationType: string, status: string }> } | null };

export type GetWorkspaceFromInviteHashQueryVariables = Exact<{
  inviteHash: Scalars['String'];
}>;


export type GetWorkspaceFromInviteHashQuery = { __typename?: 'Query', findWorkspaceFromInviteHash: { __typename?: 'Workspace', id: any, displayName?: string | null, logo?: string | null, allowImpersonation: boolean } };

export const AuthTokenFragmentFragmentDoc = gql`
    fragment AuthTokenFragment on AuthToken {
  token
  expiresAt
}
    `;
export const AuthTokensFragmentFragmentDoc = gql`
    fragment AuthTokensFragment on AuthTokenPair {
  accessToken {
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
export const SettingPermissionFragmentFragmentDoc = gql`
    fragment SettingPermissionFragment on SettingPermission {
  id
  setting
  roleId
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
  latestVersionInputSchema
  publishedVersions
  createdAt
  updatedAt
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
}
    `;
export const WorkspaceUrlsFragmentFragmentDoc = gql`
    fragment WorkspaceUrlsFragment on WorkspaceUrls {
  subdomainUrl
  customUrl
}
    `;
export const RoleFragmentFragmentDoc = gql`
    fragment RoleFragment on Role {
  id
  label
  description
  icon
  canUpdateAllSettings
  isEditable
  canReadAllObjectRecords
  canUpdateAllObjectRecords
  canSoftDeleteAllObjectRecords
  canDestroyAllObjectRecords
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
  canAccessFullAdminPanel
  canImpersonate
  supportUserHash
  onboardingStatus
  workspaceMember {
    ...WorkspaceMemberQueryFragment
  }
  workspaceMembers {
    ...WorkspaceMemberQueryFragment
  }
  deletedWorkspaceMembers {
    ...DeletedWorkspaceMemberQueryFragment
  }
  currentUserWorkspace {
    settingsPermissions
    objectRecordsPermissions
    objectPermissions {
      ...ObjectPermissionFragment
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
    subdomain
    hasValidEnterpriseKey
    customDomain
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
      id
      status
      interval
      metadata
      billingSubscriptionItems {
        id
        hasReachedCurrentPeriodCap
        quantity
        billingProduct {
          name
          description
          metadata {
            planKey
            priceUsageBased
            productKey
          }
        }
      }
    }
    billingSubscriptions {
      id
      status
      metadata
    }
    workspaceMembersCount
    defaultRole {
      ...RoleFragment
    }
    defaultAgent {
      id
    }
  }
  availableWorkspaces {
    ...AvailableWorkspacesFragment
  }
  userVars
}
    ${WorkspaceMemberQueryFragmentFragmentDoc}
${DeletedWorkspaceMemberQueryFragmentFragmentDoc}
${ObjectPermissionFragmentFragmentDoc}
${WorkspaceUrlsFragmentFragmentDoc}
${RoleFragmentFragmentDoc}
${AvailableWorkspacesFragmentFragmentDoc}`;
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
    mutation EmailPasswordResetLink($email: String!, $workspaceId: String!) {
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
    mutation GenerateApiKeyToken($apiKeyId: String!, $expiresAt: String!) {
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
    mutation GetAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
  getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
    tokens {
      ...AuthTokensFragment
    }
  }
}
    ${AuthTokensFragmentFragmentDoc}`;
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
export const GetLoginTokenFromEmailVerificationTokenDocument = gql`
    mutation GetLoginTokenFromEmailVerificationToken($emailVerificationToken: String!, $email: String!, $captchaToken: String, $origin: String!) {
  getLoginTokenFromEmailVerificationToken(
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
export type GetLoginTokenFromEmailVerificationTokenMutationFn = Apollo.MutationFunction<GetLoginTokenFromEmailVerificationTokenMutation, GetLoginTokenFromEmailVerificationTokenMutationVariables>;

/**
 * __useGetLoginTokenFromEmailVerificationTokenMutation__
 *
 * To run a mutation, you first call `useGetLoginTokenFromEmailVerificationTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGetLoginTokenFromEmailVerificationTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [getLoginTokenFromEmailVerificationTokenMutation, { data, loading, error }] = useGetLoginTokenFromEmailVerificationTokenMutation({
 *   variables: {
 *      emailVerificationToken: // value for 'emailVerificationToken'
 *      email: // value for 'email'
 *      captchaToken: // value for 'captchaToken'
 *      origin: // value for 'origin'
 *   },
 * });
 */
export function useGetLoginTokenFromEmailVerificationTokenMutation(baseOptions?: Apollo.MutationHookOptions<GetLoginTokenFromEmailVerificationTokenMutation, GetLoginTokenFromEmailVerificationTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GetLoginTokenFromEmailVerificationTokenMutation, GetLoginTokenFromEmailVerificationTokenMutationVariables>(GetLoginTokenFromEmailVerificationTokenDocument, options);
      }
export type GetLoginTokenFromEmailVerificationTokenMutationHookResult = ReturnType<typeof useGetLoginTokenFromEmailVerificationTokenMutation>;
export type GetLoginTokenFromEmailVerificationTokenMutationResult = Apollo.MutationResult<GetLoginTokenFromEmailVerificationTokenMutation>;
export type GetLoginTokenFromEmailVerificationTokenMutationOptions = Apollo.BaseMutationOptions<GetLoginTokenFromEmailVerificationTokenMutation, GetLoginTokenFromEmailVerificationTokenMutationVariables>;
export const ImpersonateDocument = gql`
    mutation Impersonate($userId: String!, $workspaceId: String!) {
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
export const RenewTokenDocument = gql`
    mutation RenewToken($appToken: String!) {
  renewToken(appToken: $appToken) {
    tokens {
      ...AuthTokensFragment
    }
  }
}
    ${AuthTokensFragmentFragmentDoc}`;
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
export const SignInDocument = gql`
    mutation SignIn($email: String!, $password: String!, $captchaToken: String) {
  signIn(email: $email, password: $password, captchaToken: $captchaToken) {
    availableWorkspaces {
      ...AvailableWorkspacesFragment
    }
    tokens {
      ...AuthTokensFragment
    }
  }
}
    ${AvailableWorkspacesFragmentFragmentDoc}
${AuthTokensFragmentFragmentDoc}`;
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
    mutation SignUp($email: String!, $password: String!, $captchaToken: String) {
  signUp(email: $email, password: $password, captchaToken: $captchaToken) {
    availableWorkspaces {
      ...AvailableWorkspacesFragment
    }
    tokens {
      ...AuthTokensFragment
    }
  }
}
    ${AvailableWorkspacesFragmentFragmentDoc}
${AuthTokensFragmentFragmentDoc}`;
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
    mutation SignUpInWorkspace($email: String!, $password: String!, $workspaceInviteHash: String, $workspacePersonalInviteToken: String = null, $captchaToken: String, $workspaceId: String, $locale: String, $verifyEmailNextPath: String) {
  signUpInWorkspace(
    email: $email
    password: $password
    workspaceInviteHash: $workspaceInviteHash
    workspacePersonalInviteToken: $workspacePersonalInviteToken
    captchaToken: $captchaToken
    workspaceId: $workspaceId
    locale: $locale
    verifyEmailNextPath: $verifyEmailNextPath
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
 *      verifyEmailNextPath: // value for 'verifyEmailNextPath'
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
export const SwitchSubscriptionToEnterprisePlanDocument = gql`
    mutation SwitchSubscriptionToEnterprisePlan {
  switchToEnterprisePlan {
    success
  }
}
    `;
export type SwitchSubscriptionToEnterprisePlanMutationFn = Apollo.MutationFunction<SwitchSubscriptionToEnterprisePlanMutation, SwitchSubscriptionToEnterprisePlanMutationVariables>;

/**
 * __useSwitchSubscriptionToEnterprisePlanMutation__
 *
 * To run a mutation, you first call `useSwitchSubscriptionToEnterprisePlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSwitchSubscriptionToEnterprisePlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [switchSubscriptionToEnterprisePlanMutation, { data, loading, error }] = useSwitchSubscriptionToEnterprisePlanMutation({
 *   variables: {
 *   },
 * });
 */
export function useSwitchSubscriptionToEnterprisePlanMutation(baseOptions?: Apollo.MutationHookOptions<SwitchSubscriptionToEnterprisePlanMutation, SwitchSubscriptionToEnterprisePlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SwitchSubscriptionToEnterprisePlanMutation, SwitchSubscriptionToEnterprisePlanMutationVariables>(SwitchSubscriptionToEnterprisePlanDocument, options);
      }
export type SwitchSubscriptionToEnterprisePlanMutationHookResult = ReturnType<typeof useSwitchSubscriptionToEnterprisePlanMutation>;
export type SwitchSubscriptionToEnterprisePlanMutationResult = Apollo.MutationResult<SwitchSubscriptionToEnterprisePlanMutation>;
export type SwitchSubscriptionToEnterprisePlanMutationOptions = Apollo.BaseMutationOptions<SwitchSubscriptionToEnterprisePlanMutation, SwitchSubscriptionToEnterprisePlanMutationVariables>;
export const SwitchSubscriptionToYearlyIntervalDocument = gql`
    mutation SwitchSubscriptionToYearlyInterval {
  switchToYearlyInterval {
    success
  }
}
    `;
export type SwitchSubscriptionToYearlyIntervalMutationFn = Apollo.MutationFunction<SwitchSubscriptionToYearlyIntervalMutation, SwitchSubscriptionToYearlyIntervalMutationVariables>;

/**
 * __useSwitchSubscriptionToYearlyIntervalMutation__
 *
 * To run a mutation, you first call `useSwitchSubscriptionToYearlyIntervalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSwitchSubscriptionToYearlyIntervalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [switchSubscriptionToYearlyIntervalMutation, { data, loading, error }] = useSwitchSubscriptionToYearlyIntervalMutation({
 *   variables: {
 *   },
 * });
 */
export function useSwitchSubscriptionToYearlyIntervalMutation(baseOptions?: Apollo.MutationHookOptions<SwitchSubscriptionToYearlyIntervalMutation, SwitchSubscriptionToYearlyIntervalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SwitchSubscriptionToYearlyIntervalMutation, SwitchSubscriptionToYearlyIntervalMutationVariables>(SwitchSubscriptionToYearlyIntervalDocument, options);
      }
export type SwitchSubscriptionToYearlyIntervalMutationHookResult = ReturnType<typeof useSwitchSubscriptionToYearlyIntervalMutation>;
export type SwitchSubscriptionToYearlyIntervalMutationResult = Apollo.MutationResult<SwitchSubscriptionToYearlyIntervalMutation>;
export type SwitchSubscriptionToYearlyIntervalMutationOptions = Apollo.BaseMutationOptions<SwitchSubscriptionToYearlyIntervalMutation, SwitchSubscriptionToYearlyIntervalMutationVariables>;
export const BillingBaseProductPricesDocument = gql`
    query billingBaseProductPrices {
  plans {
    planKey
    baseProduct {
      name
      prices {
        ... on BillingPriceLicensedDTO {
          unitAmount
          stripePriceId
          recurringInterval
        }
      }
    }
  }
}
    `;

/**
 * __useBillingBaseProductPricesQuery__
 *
 * To run a query within a React component, call `useBillingBaseProductPricesQuery` and pass it any options that fit your needs.
 * When your component renders, `useBillingBaseProductPricesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBillingBaseProductPricesQuery({
 *   variables: {
 *   },
 * });
 */
export function useBillingBaseProductPricesQuery(baseOptions?: Apollo.QueryHookOptions<BillingBaseProductPricesQuery, BillingBaseProductPricesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<BillingBaseProductPricesQuery, BillingBaseProductPricesQueryVariables>(BillingBaseProductPricesDocument, options);
      }
export function useBillingBaseProductPricesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BillingBaseProductPricesQuery, BillingBaseProductPricesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<BillingBaseProductPricesQuery, BillingBaseProductPricesQueryVariables>(BillingBaseProductPricesDocument, options);
        }
export type BillingBaseProductPricesQueryHookResult = ReturnType<typeof useBillingBaseProductPricesQuery>;
export type BillingBaseProductPricesLazyQueryHookResult = ReturnType<typeof useBillingBaseProductPricesLazyQuery>;
export type BillingBaseProductPricesQueryResult = Apollo.QueryResult<BillingBaseProductPricesQuery, BillingBaseProductPricesQueryVariables>;
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
    usageQuantity
    freeTierQuantity
    freeTrialQuantity
    unitPriceCents
    totalCostCents
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
export const CreateOneObjectMetadataItemDocument = gql`
    mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
  createOneObject(input: $input) {
    id
    dataSourceId
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
    isNullable
    createdAt
    updatedAt
    settings
    defaultValue
    options
    isLabelSyncedWithName
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
    isNullable
    createdAt
    updatedAt
    settings
    isLabelSyncedWithName
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
    dataSourceId
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
    dataSourceId
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
    isNullable
    createdAt
    updatedAt
    settings
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
        id
        dataSourceId
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
        createdAt
        updatedAt
        labelIdentifierFieldMetadataId
        imageIdentifierFieldMetadataId
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
          isNullable
          isUnique
          createdAt
          updatedAt
          defaultValue
          options
          settings
          isLabelSyncedWithName
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
        }
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
    `;

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
export const SaveImapSmtpCaldavDocument = gql`
    mutation SaveImapSmtpCaldav($accountOwnerId: String!, $handle: String!, $accountType: AccountType!, $connectionParameters: ConnectionParameters!, $id: String) {
  saveImapSmtpCaldav(
    accountOwnerId: $accountOwnerId
    handle: $handle
    accountType: $accountType
    connectionParameters: $connectionParameters
    id: $id
  ) {
    success
  }
}
    `;
export type SaveImapSmtpCaldavMutationFn = Apollo.MutationFunction<SaveImapSmtpCaldavMutation, SaveImapSmtpCaldavMutationVariables>;

/**
 * __useSaveImapSmtpCaldavMutation__
 *
 * To run a mutation, you first call `useSaveImapSmtpCaldavMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveImapSmtpCaldavMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveImapSmtpCaldavMutation, { data, loading, error }] = useSaveImapSmtpCaldavMutation({
 *   variables: {
 *      accountOwnerId: // value for 'accountOwnerId'
 *      handle: // value for 'handle'
 *      accountType: // value for 'accountType'
 *      connectionParameters: // value for 'connectionParameters'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSaveImapSmtpCaldavMutation(baseOptions?: Apollo.MutationHookOptions<SaveImapSmtpCaldavMutation, SaveImapSmtpCaldavMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveImapSmtpCaldavMutation, SaveImapSmtpCaldavMutationVariables>(SaveImapSmtpCaldavDocument, options);
      }
export type SaveImapSmtpCaldavMutationHookResult = ReturnType<typeof useSaveImapSmtpCaldavMutation>;
export type SaveImapSmtpCaldavMutationResult = Apollo.MutationResult<SaveImapSmtpCaldavMutation>;
export type SaveImapSmtpCaldavMutationOptions = Apollo.BaseMutationOptions<SaveImapSmtpCaldavMutation, SaveImapSmtpCaldavMutationVariables>;
export const GetConnectedImapSmtpCaldavAccountDocument = gql`
    query GetConnectedImapSmtpCaldavAccount($id: String!) {
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
        password
      }
      SMTP {
        host
        port
        secure
        password
      }
      CALDAV {
        host
        port
        secure
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
    mutation UpdateWorkspaceFeatureFlag($workspaceId: String!, $featureFlag: String!, $value: Boolean!) {
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
export const CreateApiKeyDocument = gql`
    mutation CreateApiKey($input: CreateApiKeyDTO!) {
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
    mutation CreateWebhook($input: CreateWebhookDTO!) {
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
    mutation DeleteWebhook($input: DeleteWebhookDTO!) {
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
    mutation RevokeApiKey($input: RevokeApiKeyDTO!) {
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
    mutation UpdateApiKey($input: UpdateApiKeyDTO!) {
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
    mutation UpdateWebhook($input: UpdateWebhookDTO!) {
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
    query GetApiKey($input: GetApiKeyDTO!) {
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
    query GetWebhook($input: GetWebhookDTO!) {
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
    mutation DeleteOneRole($roleId: String!) {
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
    mutation UpdateWorkspaceMemberRole($workspaceMemberId: String!, $roleId: String!) {
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
export const UpsertSettingPermissionsDocument = gql`
    mutation UpsertSettingPermissions($upsertSettingPermissionsInput: UpsertSettingPermissionsInput!) {
  upsertSettingPermissions(
    upsertSettingPermissionsInput: $upsertSettingPermissionsInput
  ) {
    ...SettingPermissionFragment
  }
}
    ${SettingPermissionFragmentFragmentDoc}`;
export type UpsertSettingPermissionsMutationFn = Apollo.MutationFunction<UpsertSettingPermissionsMutation, UpsertSettingPermissionsMutationVariables>;

/**
 * __useUpsertSettingPermissionsMutation__
 *
 * To run a mutation, you first call `useUpsertSettingPermissionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSettingPermissionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSettingPermissionsMutation, { data, loading, error }] = useUpsertSettingPermissionsMutation({
 *   variables: {
 *      upsertSettingPermissionsInput: // value for 'upsertSettingPermissionsInput'
 *   },
 * });
 */
export function useUpsertSettingPermissionsMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSettingPermissionsMutation, UpsertSettingPermissionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSettingPermissionsMutation, UpsertSettingPermissionsMutationVariables>(UpsertSettingPermissionsDocument, options);
      }
export type UpsertSettingPermissionsMutationHookResult = ReturnType<typeof useUpsertSettingPermissionsMutation>;
export type UpsertSettingPermissionsMutationResult = Apollo.MutationResult<UpsertSettingPermissionsMutation>;
export type UpsertSettingPermissionsMutationOptions = Apollo.BaseMutationOptions<UpsertSettingPermissionsMutation, UpsertSettingPermissionsMutationVariables>;
export const GetRolesDocument = gql`
    query GetRoles {
  getRoles {
    ...RoleFragment
    workspaceMembers {
      ...WorkspaceMemberQueryFragment
    }
    settingPermissions {
      ...SettingPermissionFragment
    }
    objectPermissions {
      ...ObjectPermissionFragment
    }
  }
}
    ${RoleFragmentFragmentDoc}
${WorkspaceMemberQueryFragmentFragmentDoc}
${SettingPermissionFragmentFragmentDoc}
${ObjectPermissionFragmentFragmentDoc}`;

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
export const UploadProfilePictureDocument = gql`
    mutation UploadProfilePicture($file: Upload!) {
  uploadProfilePicture(file: $file) {
    path
    token
  }
}
    `;
export type UploadProfilePictureMutationFn = Apollo.MutationFunction<UploadProfilePictureMutation, UploadProfilePictureMutationVariables>;

/**
 * __useUploadProfilePictureMutation__
 *
 * To run a mutation, you first call `useUploadProfilePictureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadProfilePictureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadProfilePictureMutation, { data, loading, error }] = useUploadProfilePictureMutation({
 *   variables: {
 *      file: // value for 'file'
 *   },
 * });
 */
export function useUploadProfilePictureMutation(baseOptions?: Apollo.MutationHookOptions<UploadProfilePictureMutation, UploadProfilePictureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadProfilePictureMutation, UploadProfilePictureMutationVariables>(UploadProfilePictureDocument, options);
      }
export type UploadProfilePictureMutationHookResult = ReturnType<typeof useUploadProfilePictureMutation>;
export type UploadProfilePictureMutationResult = Apollo.MutationResult<UploadProfilePictureMutation>;
export type UploadProfilePictureMutationOptions = Apollo.BaseMutationOptions<UploadProfilePictureMutation, UploadProfilePictureMutationVariables>;
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
export const ActivateWorkflowVersionDocument = gql`
    mutation ActivateWorkflowVersion($workflowVersionId: String!) {
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
export const CreateWorkflowVersionStepDocument = gql`
    mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
  createWorkflowVersionStep(input: $input) {
    id
    name
    type
    settings
    valid
    nextStepIds
  }
}
    `;
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
    mutation DeactivateWorkflowVersion($workflowVersionId: String!) {
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
export const DeleteWorkflowVersionStepDocument = gql`
    mutation DeleteWorkflowVersionStep($input: DeleteWorkflowVersionStepInput!) {
  deleteWorkflowVersionStep(input: $input) {
    id
    name
    type
    settings
    valid
    nextStepIds
  }
}
    `;
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
export const UpdateWorkflowRunStepDocument = gql`
    mutation UpdateWorkflowRunStep($input: UpdateWorkflowRunStepInput!) {
  updateWorkflowRunStep(input: $input) {
    id
    name
    type
    settings
    valid
    nextStepIds
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
export const UpdateOneAgentDocument = gql`
    mutation UpdateOneAgent($input: UpdateAgentInput!) {
  updateOneAgent(input: $input) {
    id
    name
    description
    prompt
    modelId
    responseFormat
  }
}
    `;
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
export const FindOneAgentDocument = gql`
    query FindOneAgent($id: UUID!) {
  findOneAgent(input: {id: $id}) {
    id
    name
    description
    prompt
    modelId
    responseFormat
    roleId
  }
}
    `;

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
    customDomain
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