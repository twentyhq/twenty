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
  RawJSONScalar: any;
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
  id: Scalars['UUID'];
  inboxes: Array<Inbox>;
  isActive: Scalars['Boolean'];
  isAdmin: Scalars['Boolean'];
  memberId: Scalars['String'];
  sectors: Array<Sector>;
  updatedAt: Scalars['DateTime'];
  workspace: Workspace;
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

export type AvailableWorkspaceOutput = {
  __typename?: 'AvailableWorkspaceOutput';
  displayName?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
  sso: Array<SsoConnection>;
  workspaceUrls: WorkspaceUrls;
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
  status: SubscriptionStatus;
};

export type BillingSubscriptionItem = {
  __typename?: 'BillingSubscriptionItem';
  billingProduct?: Maybe<BillingProduct>;
  hasReachedCurrentPeriodCap: Scalars['Boolean'];
  id: Scalars['UUID'];
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

export type Campaign = {
  __typename?: 'Campaign';
  campanha_id?: Maybe<Scalars['ID']>;
  cliente_id?: Maybe<Scalars['String']>;
  nome?: Maybe<Scalars['String']>;
};

export type Captcha = {
  __typename?: 'Captcha';
  provider?: Maybe<CaptchaDriverType>;
  siteKey?: Maybe<Scalars['String']>;
};

export enum CaptchaDriverType {
  GoogleRecaptcha = 'GoogleRecaptcha',
  Turnstile = 'Turnstile'
}

export type ClientConfig = {
  __typename?: 'ClientConfig';
  analyticsEnabled: Scalars['Boolean'];
  api: ApiConfig;
  authProviders: AuthProviders;
  billing: Billing;
  canManageFeatureFlags: Scalars['Boolean'];
  captcha: Captcha;
  chromeExtensionId?: Maybe<Scalars['String']>;
  debugMode: Scalars['Boolean'];
  defaultSubdomain?: Maybe<Scalars['String']>;
  frontDomain: Scalars['String'];
  isAttachmentPreviewEnabled: Scalars['Boolean'];
  isConfigVariablesInDbEnabled: Scalars['Boolean'];
  isEmailVerificationRequired: Scalars['Boolean'];
  isGoogleCalendarEnabled: Scalars['Boolean'];
  isGoogleMessagingEnabled: Scalars['Boolean'];
  isMicrosoftCalendarEnabled: Scalars['Boolean'];
  isMicrosoftMessagingEnabled: Scalars['Boolean'];
  isMultiWorkspaceEnabled: Scalars['Boolean'];
  publicFeatureFlags: Array<PublicFeatureFlag>;
  sentry: Sentry;
  signInPrefilled: Scalars['Boolean'];
  support: Support;
};

export type Component = {
  __typename?: 'Component';
  format?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  type: Scalars['String'];
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

export type CreateAgentInput = {
  inboxesIds: Array<Scalars['String']>;
  isAdmin: Scalars['Boolean'];
  memberId: Scalars['ID'];
  sectorIds: Array<Scalars['String']>;
  workspaceId: Scalars['ID'];
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
  name: Scalars['String'];
  objectMetadataId: Scalars['String'];
  options?: InputMaybe<Scalars['JSON']>;
  settings?: InputMaybe<Scalars['JSON']>;
  type: FieldMetadataType;
};

export type CreateInterIntegrationInput = {
  certificate?: InputMaybe<Scalars['String']>;
  clientId: Scalars['String'];
  clientSecret: Scalars['String'];
  expirationDate?: InputMaybe<Scalars['DateTime']>;
  integrationName: Scalars['String'];
  privateKey?: InputMaybe<Scalars['String']>;
  status?: Scalars['String'];
  workspaceId: Scalars['ID'];
};

export type CreateOneFieldMetadataInput = {
  /** The record to create */
  field: CreateFieldInput;
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

export type CreateSectorInput = {
  icon: Scalars['String'];
  name: Scalars['String'];
  topics?: InputMaybe<Array<Scalars['JSON']>>;
  workspaceId: Scalars['ID'];
};

export type CreateServerlessFunctionInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  timeoutSeconds?: InputMaybe<Scalars['Float']>;
};

export type CreateStripeIntegrationInput = {
  accountId: Scalars['String'];
  workspaceId: Scalars['ID'];
};

export type CreateTelephonyInput = {
  SIPPassword?: InputMaybe<Scalars['String']>;
  advancedFowarding1?: InputMaybe<Scalars['String']>;
  advancedFowarding1Value?: InputMaybe<Scalars['String']>;
  advancedFowarding2?: InputMaybe<Scalars['String']>;
  advancedFowarding2Value?: InputMaybe<Scalars['String']>;
  advancedFowarding3?: InputMaybe<Scalars['String']>;
  advancedFowarding3Value?: InputMaybe<Scalars['String']>;
  advancedFowarding4?: InputMaybe<Scalars['String']>;
  advancedFowarding4Value?: InputMaybe<Scalars['String']>;
  advancedFowarding5?: InputMaybe<Scalars['String']>;
  advancedFowarding5Value?: InputMaybe<Scalars['String']>;
  areaCode?: InputMaybe<Scalars['String']>;
  blockExtension?: InputMaybe<Scalars['Boolean']>;
  callerExternalID?: InputMaybe<Scalars['String']>;
  destinyMailboxAllCallsOrOffline?: InputMaybe<Scalars['String']>;
  destinyMailboxBusy?: InputMaybe<Scalars['String']>;
  dialingPlan?: InputMaybe<Scalars['String']>;
  emailForMailbox?: InputMaybe<Scalars['String']>;
  enableMailbox?: InputMaybe<Scalars['Boolean']>;
  extensionAllCallsOrOffline?: InputMaybe<Scalars['String']>;
  extensionBusy?: InputMaybe<Scalars['String']>;
  extensionGroup?: InputMaybe<Scalars['String']>;
  extensionName?: InputMaybe<Scalars['String']>;
  externalNumberAllCallsOrOffline?: InputMaybe<Scalars['String']>;
  externalNumberBusy?: InputMaybe<Scalars['String']>;
  fowardAllCalls?: InputMaybe<Scalars['String']>;
  fowardBusyNotAvailable?: InputMaybe<Scalars['String']>;
  fowardOfflineWithoutService?: InputMaybe<Scalars['String']>;
  listenToCalls?: InputMaybe<Scalars['Boolean']>;
  memberId?: InputMaybe<Scalars['ID']>;
  numberExtension: Scalars['ID'];
  pullCalls?: InputMaybe<Scalars['String']>;
  ramal_id?: InputMaybe<Scalars['String']>;
  recordCalls?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<Scalars['String']>;
  workspaceId: Scalars['ID'];
};

export type CreateWhatsappIntegrationInput = {
  accessToken: Scalars['String'];
  appId: Scalars['String'];
  appKey: Scalars['String'];
  businessAccountId: Scalars['String'];
  label: Scalars['String'];
  phoneId: Scalars['String'];
  workspaceId: Scalars['ID'];
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

export type DeleteWorkflowVersionStepInput = {
  /** Step to delete ID */
  stepId: Scalars['String'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String'];
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

export type Encaminhamento = {
  __typename?: 'Encaminhamento';
  encaminhamento_destino?: Maybe<Array<Scalars['String']>>;
  encaminhamento_destinos?: Maybe<Array<Scalars['String']>>;
  encaminhamento_tipo?: Maybe<Scalars['String']>;
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
  IsAirtableIntegrationEnabled = 'IsAirtableIntegrationEnabled',
  IsCopilotEnabled = 'IsCopilotEnabled',
  IsCustomDomainEnabled = 'IsCustomDomainEnabled',
  IsJsonFilterEnabled = 'IsJsonFilterEnabled',
  IsMeteredProductBillingEnabled = 'IsMeteredProductBillingEnabled',
  IsNewRelationEnabled = 'IsNewRelationEnabled',
  IsPermissionsV2Enabled = 'IsPermissionsV2Enabled',
  IsPostgreSQLIntegrationEnabled = 'IsPostgreSQLIntegrationEnabled',
  IsStripeIntegrationEnabled = 'IsStripeIntegrationEnabled',
  IsUniqueIndexesEnabled = 'IsUniqueIndexesEnabled',
  IsWorkflowEnabled = 'IsWorkflowEnabled'
}

export type Field = {
  __typename?: 'Field';
  createdAt: Scalars['DateTime'];
  defaultValue?: Maybe<Scalars['JSON']>;
  description?: Maybe<Scalars['String']>;
  fromRelationMetadata?: Maybe<RelationMetadata>;
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
  relationDefinition?: Maybe<RelationDefinition>;
  settings?: Maybe<Scalars['JSON']>;
  standardOverrides?: Maybe<StandardOverrides>;
  toRelationMetadata?: Maybe<RelationMetadata>;
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

export type FullName = {
  __typename?: 'FullName';
  firstName: Scalars['String'];
  lastName: Scalars['String'];
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

export enum HealthIndicatorId {
  app = 'app',
  connectedAccount = 'connectedAccount',
  database = 'database',
  redis = 'redis',
  worker = 'worker'
}

export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']>;
  gt?: InputMaybe<Scalars['ID']>;
  gte?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<Array<Scalars['ID']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['ID']>;
  lte?: InputMaybe<Scalars['ID']>;
  neq?: InputMaybe<Scalars['ID']>;
};

export enum IdentityProviderType {
  OIDC = 'OIDC',
  SAML = 'SAML'
}

export type ImpersonateOutput = {
  __typename?: 'ImpersonateOutput';
  loginToken: AuthToken;
  workspace: WorkspaceUrlsAndId;
};

export type Inbox = {
  __typename?: 'Inbox';
  agents: Array<Agent>;
  id: Scalars['UUID'];
  integrationType: IntegrationType;
  whatsappIntegration?: Maybe<WhatsappIntegration>;
  workspace: Workspace;
};

export type Index = {
  __typename?: 'Index';
  createdAt: Scalars['DateTime'];
  id: Scalars['UUID'];
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

/** Available integration types */
export enum IntegrationType {
  MESSENGER = 'MESSENGER',
  WHATSAPP = 'WHATSAPP'
}

export type InterIntegration = {
  __typename?: 'InterIntegration';
  certificate?: Maybe<Scalars['String']>;
  clientId: Scalars['String'];
  clientSecret: Scalars['String'];
  expirationDate?: Maybe<Scalars['DateTime']>;
  id: Scalars['UUID'];
  integrationName: Scalars['String'];
  privateKey?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  workspace: Workspace;
};

export type InvalidatePassword = {
  __typename?: 'InvalidatePassword';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type LinkLogsWorkspaceEntity = {
  __typename?: 'LinkLogsWorkspaceEntity';
  linkId?: Maybe<Scalars['String']>;
  linkName?: Maybe<Scalars['String']>;
  product: Scalars['String'];
  userAgent?: Maybe<Scalars['String']>;
  userIp?: Maybe<Scalars['String']>;
  utmCampaign: Scalars['String'];
  utmMedium: Scalars['String'];
  utmSource: Scalars['String'];
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

export type MessageAgent = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
  SUBJECT = 'SUBJECT'
}

export type MessageSector = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateWorkflowVersion: Scalars['Boolean'];
  activateWorkspace: Workspace;
  authorizeApp: AuthorizeApp;
  checkCustomDomainValidRecords?: Maybe<CustomDomainValidRecords>;
  checkoutSession: BillingSessionOutput;
  computeStepOutputSchema: Scalars['JSON'];
  createAgent: Agent;
  createApprovedAccessDomain: ApprovedAccessDomain;
  createDatabaseConfigVariable: Scalars['Boolean'];
  createDraftFromWorkflowVersion: WorkflowVersion;
  createInterIntegration: InterIntegration;
  createOIDCIdentityProvider: SetupSsoOutput;
  createObjectEvent: Analytics;
  createOneAppToken: AppToken;
  createOneField: Field;
  createOneObject: Object;
  createOneRole: Role;
  createOneServerlessFunction: ServerlessFunction;
  createSAMLIdentityProvider: SetupSsoOutput;
  createSector: Sector;
  createStripeIntegration: StripeIntegration;
  createTelephony: Telephony;
  createWhatsappIntegration: WhatsappIntegration;
  createWorkflowVersionStep: WorkflowAction;
  deactivateWorkflowVersion: Scalars['Boolean'];
  deleteAgent: Agent;
  deleteApprovedAccessDomain: Scalars['Boolean'];
  deleteCurrentWorkspace: Workspace;
  deleteDatabaseConfigVariable: Scalars['Boolean'];
  deleteOneField: Field;
  deleteOneObject: Object;
  deleteOneRole: Scalars['String'];
  deleteOneServerlessFunction: ServerlessFunction;
  deleteSSOIdentityProvider: DeleteSsoOutput;
  deleteSector: Scalars['Boolean'];
  deleteTelephony: Scalars['Boolean'];
  deleteUser: User;
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
  removeStripeIntegration: Scalars['Boolean'];
  renewToken: AuthTokens;
  resendEmailVerificationToken: ResendEmailVerificationTokenOutput;
  resendWorkspaceInvitation: SendInvitationsOutput;
  runWorkflowVersion: WorkflowRun;
  saveStripeAccountId: StripeIntegration;
  sendEventMessage: Scalars['Boolean'];
  sendInvitations: SendInvitationsOutput;
  sendMessage: Scalars['Boolean'];
  sendTemplate: Scalars['Boolean'];
  signUp: SignUpOutput;
  signUpInNewWorkspace: SignUpOutput;
  skipSyncEmailOnboardingStep: OnboardingStepSuccess;
  submitFormStep: Scalars['Boolean'];
  switchToYearlyInterval: BillingUpdateOutput;
  syncInterData: Scalars['Boolean'];
  toggleAgentStatus: Scalars['Boolean'];
  toggleInterIntegrationStatus: Scalars['String'];
  toggleWhatsappIntegrationStatus: Scalars['Boolean'];
  trackAnalytics: Analytics;
  updateAgent: Agent;
  updateDatabaseConfigVariable: Scalars['Boolean'];
  updateInterIntegration: InterIntegration;
  updateLabPublicFeatureFlag: FeatureFlagDto;
  updateOneField: Field;
  updateOneObject: Object;
  updateOneRole: Role;
  updateOneServerlessFunction: ServerlessFunction;
  updatePasswordViaResetToken: InvalidatePassword;
  updateSector: Sector;
  updateStripeIntegration: StripeIntegration;
  updateTelephony: Telephony;
  updateWhatsappIntegration: WhatsappIntegration;
  updateWhatsappIntegrationServiceLevel: WhatsappIntegration;
  updateWorkflowRunStep: WorkflowAction;
  updateWorkflowVersionStep: WorkflowAction;
  updateWorkspace: Workspace;
  updateWorkspaceFeatureFlag: Scalars['Boolean'];
  updateWorkspaceMemberRole: WorkspaceMember;
  uploadFile: Scalars['String'];
  uploadFileToBucket: Scalars['String'];
  uploadImage: Scalars['String'];
  uploadProfilePicture: Scalars['String'];
  uploadWorkspaceLogo: Scalars['String'];
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


export type MutationCreateAgentArgs = {
  createInput: CreateAgentInput;
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


export type MutationCreateInterIntegrationArgs = {
  createInput: CreateInterIntegrationInput;
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


export type MutationCreateOneFieldArgs = {
  input: CreateOneFieldMetadataInput;
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


export type MutationCreateSectorArgs = {
  createInput: CreateSectorInput;
};


export type MutationCreateStripeIntegrationArgs = {
  createStripeIntegrationInput: CreateStripeIntegrationInput;
};


export type MutationCreateTelephonyArgs = {
  createTelephonyInput: CreateTelephonyInput;
};


export type MutationCreateWhatsappIntegrationArgs = {
  createInput: CreateWhatsappIntegrationInput;
};


export type MutationCreateWorkflowVersionStepArgs = {
  input: CreateWorkflowVersionStepInput;
};


export type MutationDeactivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['String'];
};


export type MutationDeleteAgentArgs = {
  agentId: Scalars['String'];
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


export type MutationDeleteOneRoleArgs = {
  roleId: Scalars['String'];
};


export type MutationDeleteOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type MutationDeleteSsoIdentityProviderArgs = {
  input: DeleteSsoInput;
};


export type MutationDeleteSectorArgs = {
  sectorId: Scalars['String'];
};


export type MutationDeleteTelephonyArgs = {
  telephonyId: Scalars['ID'];
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
};


export type MutationGetAuthorizationUrlForSsoArgs = {
  input: GetAuthorizationUrlForSsoInput;
};


export type MutationGetLoginTokenFromCredentialsArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationGetLoginTokenFromEmailVerificationTokenArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  emailVerificationToken: Scalars['String'];
};


export type MutationImpersonateArgs = {
  userId: Scalars['String'];
  workspaceId: Scalars['String'];
};


export type MutationPublishServerlessFunctionArgs = {
  input: PublishServerlessFunctionInput;
};


export type MutationRemoveStripeIntegrationArgs = {
  accountId: Scalars['String'];
};


export type MutationRenewTokenArgs = {
  appToken: Scalars['String'];
};


export type MutationResendEmailVerificationTokenArgs = {
  email: Scalars['String'];
};


export type MutationResendWorkspaceInvitationArgs = {
  appTokenId: Scalars['String'];
};


export type MutationRunWorkflowVersionArgs = {
  input: RunWorkflowVersionInput;
};


export type MutationSaveStripeAccountIdArgs = {
  accountId: Scalars['String'];
  workspaceId: Scalars['String'];
};


export type MutationSendEventMessageArgs = {
  sendEventMessageInput: SendEventMessageInput;
};


export type MutationSendInvitationsArgs = {
  emails: Array<Scalars['String']>;
};


export type MutationSendMessageArgs = {
  sendMessageInput: SendMessageInput;
};


export type MutationSendTemplateArgs = {
  sendTemplateInput: SendTemplateInput;
};


export type MutationSignUpArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  locale?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  workspaceId?: InputMaybe<Scalars['String']>;
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']>;
};


export type MutationSubmitFormStepArgs = {
  input: SubmitFormStepInput;
};


export type MutationSyncInterDataArgs = {
  integrationId: Scalars['String'];
};


export type MutationToggleAgentStatusArgs = {
  agentId: Scalars['String'];
};


export type MutationToggleInterIntegrationStatusArgs = {
  integrationId: Scalars['String'];
};


export type MutationToggleWhatsappIntegrationStatusArgs = {
  integrationId: Scalars['String'];
};


export type MutationTrackAnalyticsArgs = {
  event?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  properties?: InputMaybe<Scalars['JSON']>;
  type: AnalyticsType;
};


export type MutationUpdateAgentArgs = {
  updateInput: UpdateAgentInput;
};


export type MutationUpdateDatabaseConfigVariableArgs = {
  key: Scalars['String'];
  value: Scalars['JSON'];
};


export type MutationUpdateInterIntegrationArgs = {
  updateInput: UpdateInterIntegrationInput;
};


export type MutationUpdateLabPublicFeatureFlagArgs = {
  input: UpdateLabPublicFeatureFlagInput;
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


export type MutationUpdateOneServerlessFunctionArgs = {
  input: UpdateServerlessFunctionInput;
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String'];
  passwordResetToken: Scalars['String'];
};


export type MutationUpdateSectorArgs = {
  updateInput: UpdateSectorInput;
};


export type MutationUpdateStripeIntegrationArgs = {
  updateStripeIntegrationInput: UpdateStripeIntegrationInput;
};


export type MutationUpdateTelephonyArgs = {
  id: Scalars['ID'];
  updateTelephonyInput: UpdateTelephonyInput;
};


export type MutationUpdateWhatsappIntegrationArgs = {
  updateInput: UpdateWhatsappIntegrationInput;
};


export type MutationUpdateWhatsappIntegrationServiceLevelArgs = {
  integrationId: Scalars['String'];
  sla: Scalars['Int'];
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


export type MutationUploadFileToBucketArgs = {
  file: Scalars['Upload'];
  isInternal?: InputMaybe<Scalars['Boolean']>;
  type: Scalars['String'];
  workspaceId: Scalars['String'];
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
  id: Scalars['String'];
  objectMetadataId: Scalars['String'];
  roleId: Scalars['String'];
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
  id?: InputMaybe<IdFilter>;
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
  COMPLETED = 'COMPLETED',
  INVITE_TEAM = 'INVITE_TEAM',
  PLAN_REQUIRED = 'PLAN_REQUIRED',
  PAYMENT_REQUIRED = "PAYMENT_REQUIRED",
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

export type Phones = {
  __typename?: 'Phones';
  additionalPhones?: Maybe<Scalars['RawJSONScalar']>;
  primaryPhoneCallingCode: Scalars['String'];
  primaryPhoneCountryCode: Scalars['String'];
  primaryPhoneNumber: Scalars['String'];
};

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
  agentById: Agent;
  agentsByWorkspace: Array<Agent>;
  billingPortalSession: BillingSessionOutput;
  checkUserExists: UserExistsOutput;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  clientConfig: ClientConfig;
  currentUser: User;
  currentWorkspace: Workspace;
  field: Field;
  fields: FieldConnection;
  findAllTelephony: Array<Telephony>;
  findManyServerlessFunctions: Array<ServerlessFunction>;
  findOneServerlessFunction: ServerlessFunction;
  findWorkspaceFromInviteHash: Workspace;
  findWorkspaceInvitations: Array<WorkspaceInvitation>;
  getAllExtensions?: Maybe<Array<TelephonyExtension>>;
  getAllStripeIntegrations: Array<StripeIntegration>;
  getApprovedAccessDomains: Array<ApprovedAccessDomain>;
  getAvailablePackages: Scalars['JSON'];
  getConfigVariablesGrouped: ConfigVariablesOutput;
  getDashboardLinklogs: Array<LinkLogsWorkspaceEntity>;
  getDatabaseConfigVariable: ConfigVariable;
  getIndicatorHealthStatus: AdminPanelHealthServiceData;
  getInterAccountInfo: Scalars['String'];
  getMeteredProductsUsage: Array<BillingMeteredProductUsageOutput>;
  getPostgresCredentials?: Maybe<PostgresCredentials>;
  getPublicWorkspaceDataByDomain: PublicWorkspaceDataOutput;
  getQueueMetrics: QueueMetricsData;
  getRoles: Array<Role>;
  getSSOIdentityProviders: Array<FindAvailableSsoidpOutput>;
  getServerlessFunctionSourceCode?: Maybe<Scalars['JSON']>;
  getStripeIntegrationById: StripeIntegration;
  getSystemHealthStatus: SystemHealth;
  getTelephonyCallFlows?: Maybe<Array<TelephonyCallFlow>>;
  getTelephonyDids?: Maybe<Array<TelephonyDids>>;
  getTelephonyPlans?: Maybe<Array<TelephonyDialingPlan>>;
  getTelephonyURAs?: Maybe<Array<Campaign>>;
  getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal;
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  getUserSoftfone?: Maybe<TelephonyExtension>;
  getWhatsappTemplates: WhatsappTemplatesResponse;
  inboxesByWorkspace: Array<Inbox>;
  index: Index;
  indexMetadatas: IndexConnection;
  interIntegrationById?: Maybe<InterIntegration>;
  interIntegrationsByWorkspace: Array<InterIntegration>;
  object: Object;
  objects: ObjectConnection;
  plans: Array<BillingPlanOutput>;
  search: Array<SearchRecord>;
  sectorById: Sector;
  sectorsByWorkspace: Array<Sector>;
  validatePasswordResetToken: ValidatePasswordResetToken;
  versionInfo: VersionInfo;
  whatsappIntegrationById: WhatsappIntegration;
  whatsappIntegrationsByWorkspace: Array<WhatsappIntegration>;
};


export type QueryAgentByIdArgs = {
  agentId: Scalars['String'];
};


export type QueryAgentsByWorkspaceArgs = {
  workspaceId: Scalars['String'];
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


export type QueryFindAllTelephonyArgs = {
  workspaceId: Scalars['ID'];
};


export type QueryFindOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String'];
};


export type QueryGetAllStripeIntegrationsArgs = {
  workspaceId: Scalars['String'];
};


export type QueryGetAvailablePackagesArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryGetDatabaseConfigVariableArgs = {
  key: Scalars['String'];
};


export type QueryGetIndicatorHealthStatusArgs = {
  indicatorId: HealthIndicatorId;
};


export type QueryGetInterAccountInfoArgs = {
  integrationId: Scalars['String'];
};


export type QueryGetQueueMetricsArgs = {
  queueName: Scalars['String'];
  timeRange?: InputMaybe<QueueMetricsTimeRange>;
};


export type QueryGetServerlessFunctionSourceCodeArgs = {
  input: GetServerlessFunctionSourceCodeInput;
};


export type QueryGetStripeIntegrationByIdArgs = {
  id: Scalars['String'];
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


export type QueryGetUserSoftfoneArgs = {
  extNum: Scalars['String'];
};


export type QueryGetWhatsappTemplatesArgs = {
  integrationId: Scalars['String'];
};


export type QueryInboxesByWorkspaceArgs = {
  workspaceId: Scalars['String'];
};


export type QueryInterIntegrationByIdArgs = {
  integrationId: Scalars['String'];
};


export type QueryInterIntegrationsByWorkspaceArgs = {
  workspaceId: Scalars['String'];
};


export type QuerySearchArgs = {
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']>>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']>>;
  limit: Scalars['Int'];
  searchInput: Scalars['String'];
};


export type QuerySectorByIdArgs = {
  sectorId: Scalars['String'];
};


export type QuerySectorsByWorkspaceArgs = {
  workspaceId: Scalars['String'];
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String'];
};


export type QueryWhatsappIntegrationByIdArgs = {
  integrationId: Scalars['String'];
};


export type QueryWhatsappIntegrationsByWorkspaceArgs = {
  workspaceId: Scalars['String'];
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

export type RelationDefinition = {
  __typename?: 'RelationDefinition';
  direction: RelationDefinitionType;
  relationId: Scalars['UUID'];
  sourceFieldMetadata: Field;
  sourceObjectMetadata: Object;
  targetFieldMetadata: Field;
  targetObjectMetadata: Object;
};

/** Relation definition type */
export enum RelationDefinitionType {
  MANY_TO_MANY = 'MANY_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  ONE_TO_ONE = 'ONE_TO_ONE'
}

export type RelationMetadata = {
  __typename?: 'RelationMetadata';
  createdAt: Scalars['DateTime'];
  fromFieldMetadataId: Scalars['String'];
  fromObjectMetadata: Object;
  fromObjectMetadataId: Scalars['String'];
  id: Scalars['UUID'];
  relationType: RelationMetadataType;
  toFieldMetadataId: Scalars['String'];
  toObjectMetadata: Object;
  toObjectMetadataId: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type RelationMetadataConnection = {
  __typename?: 'RelationMetadataConnection';
  /** Array of edges. */
  edges: Array<RelationMetadataEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type RelationMetadataEdge = {
  __typename?: 'RelationMetadataEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the RelationMetadata */
  node: RelationMetadata;
};

/** Type of the relation */
export enum RelationMetadataType {
  MANY_TO_MANY = 'MANY_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  ONE_TO_ONE = 'ONE_TO_ONE'
}

/** Relation type */
export enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  ONE_TO_ONE = 'ONE_TO_ONE'
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

export type Sector = {
  __typename?: 'Sector';
  agents: Array<Agent>;
  createdAt: Scalars['DateTime'];
  icon: Scalars['String'];
  id: Scalars['UUID'];
  name: Scalars['String'];
  topics?: Maybe<Array<Scalars['JSON']>>;
  updatedAt: Scalars['DateTime'];
  workspace: Workspace;
};

export type SendEventMessageInput = {
  agent?: InputMaybe<MessageAgent>;
  eventStatus: Scalars['String'];
  from: Scalars['String'];
  integrationId: Scalars['String'];
  message?: InputMaybe<Scalars['String']>;
  sector?: InputMaybe<MessageSector>;
  status: Scalars['String'];
  to: Scalars['String'];
  type: Scalars['String'];
};

export type SendInvitationsOutput = {
  __typename?: 'SendInvitationsOutput';
  errors: Array<Scalars['String']>;
  result: Array<WorkspaceInvitation>;
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type SendMessageInput = {
  fileId?: InputMaybe<Scalars['String']>;
  integrationId: Scalars['String'];
  message?: InputMaybe<Scalars['String']>;
  to: Scalars['String'];
  type: Scalars['String'];
};

export type SendTemplateInput = {
  agent?: InputMaybe<MessageAgent>;
  integrationId: Scalars['String'];
  language: Scalars['String'];
  message: Scalars['String'];
  templateName: Scalars['String'];
  to: Scalars['String'];
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
  syncStatus: ServerlessFunctionSyncStatus;
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

/** SyncStatus of the serverlessFunction */
export enum ServerlessFunctionSyncStatus {
  BUILDING = 'BUILDING',
  NOT_READY = 'NOT_READY',
  READY = 'READY'
}

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

export type StandardOverrides = {
  __typename?: 'StandardOverrides';
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  translations?: Maybe<Scalars['JSON']>;
};

export type StripeIntegration = {
  __typename?: 'StripeIntegration';
  accountId: Scalars['String'];
  id: Scalars['UUID'];
  workspace: Workspace;
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
  supportDriver: Scalars['String'];
  supportFrontChatId?: Maybe<Scalars['String']>;
};

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

export type Telephony = {
  __typename?: 'Telephony';
  SIPPassword?: Maybe<Scalars['String']>;
  advancedFowarding1?: Maybe<Scalars['String']>;
  advancedFowarding1Value?: Maybe<Scalars['String']>;
  advancedFowarding2?: Maybe<Scalars['String']>;
  advancedFowarding2Value?: Maybe<Scalars['String']>;
  advancedFowarding3?: Maybe<Scalars['String']>;
  advancedFowarding3Value?: Maybe<Scalars['String']>;
  advancedFowarding4?: Maybe<Scalars['String']>;
  advancedFowarding4Value?: Maybe<Scalars['String']>;
  advancedFowarding5?: Maybe<Scalars['String']>;
  advancedFowarding5Value?: Maybe<Scalars['String']>;
  areaCode?: Maybe<Scalars['String']>;
  blockExtension?: Maybe<Scalars['Boolean']>;
  callerExternalID?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  destinyMailboxAllCallsOrOffline?: Maybe<Scalars['String']>;
  destinyMailboxBusy?: Maybe<Scalars['String']>;
  dialingPlan?: Maybe<Scalars['String']>;
  emailForMailbox?: Maybe<Scalars['String']>;
  enableMailbox?: Maybe<Scalars['Boolean']>;
  extensionAllCallsOrOffline?: Maybe<Scalars['String']>;
  extensionBusy?: Maybe<Scalars['String']>;
  extensionGroup?: Maybe<Scalars['String']>;
  extensionName?: Maybe<Scalars['String']>;
  externalNumberAllCallsOrOffline?: Maybe<Scalars['String']>;
  externalNumberBusy?: Maybe<Scalars['String']>;
  fowardAllCalls?: Maybe<Scalars['String']>;
  fowardBusyNotAvailable?: Maybe<Scalars['String']>;
  fowardOfflineWithoutService?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  listenToCalls?: Maybe<Scalars['Boolean']>;
  memberId: Scalars['String'];
  numberExtension: Scalars['String'];
  pullCalls?: Maybe<Scalars['String']>;
  ramal_id?: Maybe<Scalars['String']>;
  recordCalls?: Maybe<Scalars['Boolean']>;
  type?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  workspace: Workspace;
};

export type TelephonyCallFlow = {
  __typename?: 'TelephonyCallFlow';
  fluxo_chamada_id?: Maybe<Scalars['ID']>;
  fluxo_chamada_nome?: Maybe<Scalars['String']>;
};

export type TelephonyDialingPlan = {
  __typename?: 'TelephonyDialingPlan';
  cliente_id?: Maybe<Scalars['String']>;
  nome?: Maybe<Scalars['String']>;
  plano_discagem_id?: Maybe<Scalars['ID']>;
};

export type TelephonyDids = {
  __typename?: 'TelephonyDids';
  apontar_para?: Maybe<Scalars['String']>;
  cliente_id?: Maybe<Scalars['String']>;
  destino?: Maybe<Scalars['String']>;
  did_id?: Maybe<Scalars['ID']>;
  gravar_chamadas?: Maybe<Scalars['String']>;
  habilitar_horario_funcionamento?: Maybe<Scalars['String']>;
  habilitar_registro?: Maybe<Scalars['String']>;
  horario_funcionamento_dias_semana?: Maybe<Array<Scalars['String']>>;
  horario_funcionamento_fim?: Maybe<Scalars['String']>;
  horario_funcionamento_inicio?: Maybe<Scalars['String']>;
  horario_funcionamento_lista_feriados?: Maybe<Array<Scalars['String']>>;
  maximo_chamadas_simultaneas?: Maybe<Scalars['String']>;
  numero?: Maybe<Scalars['String']>;
  registro_dominio?: Maybe<Scalars['String']>;
  registro_senha?: Maybe<Scalars['String']>;
  registro_usuario?: Maybe<Scalars['String']>;
};

export type TelephonyExtension = {
  __typename?: 'TelephonyExtension';
  bloquear_ramal?: Maybe<Scalars['String']>;
  caller_id_externo?: Maybe<Scalars['String']>;
  centro_custo?: Maybe<Scalars['String']>;
  cliente_id?: Maybe<Scalars['String']>;
  codigo_area?: Maybe<Scalars['String']>;
  codigo_incorporacao?: Maybe<Scalars['String']>;
  dupla_autenticacao_ip_permitido?: Maybe<Scalars['String']>;
  dupla_autenticacao_mascara?: Maybe<Scalars['String']>;
  encaminhar_ocupado_indisponivel?: Maybe<Encaminhamento>;
  encaminhar_offline_sem_atendimento?: Maybe<Encaminhamento>;
  encaminhar_todas_chamadas?: Maybe<Encaminhamento>;
  escutar_chamadas?: Maybe<Scalars['String']>;
  gravar_chamadas?: Maybe<Scalars['String']>;
  grupo_musica_espera?: Maybe<Scalars['String']>;
  grupo_ramais?: Maybe<Scalars['String']>;
  habilitar_blf?: Maybe<Scalars['String']>;
  habilitar_dupla_autenticacao?: Maybe<Scalars['String']>;
  habilitar_timers?: Maybe<Scalars['String']>;
  nome?: Maybe<Scalars['String']>;
  numero?: Maybe<Scalars['String']>;
  plano_discagem_id?: Maybe<Scalars['String']>;
  puxar_chamadas?: Maybe<Scalars['String']>;
  ramal_id?: Maybe<Scalars['ID']>;
  senha_sip?: Maybe<Scalars['String']>;
  senha_web?: Maybe<Scalars['String']>;
  tipo?: Maybe<Scalars['String']>;
  usuario_autenticacao?: Maybe<Scalars['String']>;
};

export type Template = {
  __typename?: 'Template';
  category: Scalars['String'];
  components: Array<Component>;
  id: Scalars['String'];
  language: Scalars['String'];
  name: Scalars['String'];
  parameter_format: Scalars['String'];
  status: Scalars['String'];
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
  id: Scalars['String'];
  inboxesIds: Array<Scalars['String']>;
  isAdmin: Scalars['Boolean'];
  memberId: Scalars['ID'];
  sectorIds: Array<Scalars['String']>;
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

export type UpdateInterIntegrationInput = {
  certificate?: InputMaybe<Scalars['String']>;
  clientId?: InputMaybe<Scalars['String']>;
  clientSecret?: InputMaybe<Scalars['String']>;
  expirationDate?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['String'];
  integrationName?: InputMaybe<Scalars['String']>;
  privateKey?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<Scalars['String']>;
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

export type UpdateSectorInput = {
  icon?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  topics?: InputMaybe<Array<Scalars['JSON']>>;
};

export type UpdateServerlessFunctionInput = {
  code: Scalars['JSON'];
  description?: InputMaybe<Scalars['String']>;
  /** Id of the serverless function to execute */
  id: Scalars['UUID'];
  name: Scalars['String'];
  timeoutSeconds?: InputMaybe<Scalars['Float']>;
};

export type UpdateStripeIntegrationInput = {
  accountId?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
};

export type UpdateTelephonyInput = {
  SIPPassword?: InputMaybe<Scalars['String']>;
  advancedFowarding1?: InputMaybe<Scalars['String']>;
  advancedFowarding1Value?: InputMaybe<Scalars['String']>;
  advancedFowarding2?: InputMaybe<Scalars['String']>;
  advancedFowarding2Value?: InputMaybe<Scalars['String']>;
  advancedFowarding3?: InputMaybe<Scalars['String']>;
  advancedFowarding3Value?: InputMaybe<Scalars['String']>;
  advancedFowarding4?: InputMaybe<Scalars['String']>;
  advancedFowarding4Value?: InputMaybe<Scalars['String']>;
  advancedFowarding5?: InputMaybe<Scalars['String']>;
  advancedFowarding5Value?: InputMaybe<Scalars['String']>;
  areaCode?: InputMaybe<Scalars['String']>;
  blockExtension?: InputMaybe<Scalars['Boolean']>;
  callerExternalID?: InputMaybe<Scalars['String']>;
  destinyMailboxAllCallsOrOffline?: InputMaybe<Scalars['String']>;
  destinyMailboxBusy?: InputMaybe<Scalars['String']>;
  dialingPlan?: InputMaybe<Scalars['String']>;
  emailForMailbox?: InputMaybe<Scalars['String']>;
  enableMailbox?: InputMaybe<Scalars['Boolean']>;
  extensionAllCallsOrOffline?: InputMaybe<Scalars['String']>;
  extensionBusy?: InputMaybe<Scalars['String']>;
  extensionGroup?: InputMaybe<Scalars['String']>;
  extensionName?: InputMaybe<Scalars['String']>;
  externalNumberAllCallsOrOffline?: InputMaybe<Scalars['String']>;
  externalNumberBusy?: InputMaybe<Scalars['String']>;
  fowardAllCalls?: InputMaybe<Scalars['String']>;
  fowardBusyNotAvailable?: InputMaybe<Scalars['String']>;
  fowardOfflineWithoutService?: InputMaybe<Scalars['String']>;
  listenToCalls?: InputMaybe<Scalars['Boolean']>;
  memberId?: InputMaybe<Scalars['ID']>;
  numberExtension: Scalars['ID'];
  pullCalls?: InputMaybe<Scalars['String']>;
  ramal_id?: InputMaybe<Scalars['String']>;
  recordCalls?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<Scalars['String']>;
};

export type UpdateWhatsappIntegrationInput = {
  accessToken?: InputMaybe<Scalars['String']>;
  appId?: InputMaybe<Scalars['String']>;
  appKey?: InputMaybe<Scalars['String']>;
  businessAccountId?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  label?: InputMaybe<Scalars['String']>;
  phoneId?: InputMaybe<Scalars['String']>;
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
  canAccessFullAdminPanel: Scalars['Boolean'];
  canImpersonate: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  currentUserWorkspace?: Maybe<UserWorkspace>;
  currentWorkspace?: Maybe<Workspace>;
  defaultAvatarUrl?: Maybe<Scalars['String']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
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
  userVars: Scalars['JSONObject'];
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

export type UserExists = {
  __typename?: 'UserExists';
  availableWorkspaces: Array<AvailableWorkspaceOutput>;
  exists: Scalars['Boolean'];
  isEmailVerified: Scalars['Boolean'];
};

export type UserExistsOutput = UserExists | UserNotExists;

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

export type UserMappingOptionsUser = {
  __typename?: 'UserMappingOptionsUser';
  user?: Maybe<Scalars['String']>;
};

export type UserNotExists = {
  __typename?: 'UserNotExists';
  exists: Scalars['Boolean'];
};

export type UserWorkspace = {
  __typename?: 'UserWorkspace';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['UUID'];
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

export type WhatsappIntegration = {
  __typename?: 'WhatsappIntegration';
  accessToken: Scalars['String'];
  appId: Scalars['String'];
  appKey: Scalars['String'];
  businessAccountId: Scalars['String'];
  disabled: Scalars['Boolean'];
  id: Scalars['UUID'];
  label: Scalars['String'];
  phoneId: Scalars['String'];
  sla: Scalars['Float'];
  verifyToken: Scalars['String'];
  workspace: Workspace;
};

export type WhatsappTemplatesResponse = {
  __typename?: 'WhatsappTemplatesResponse';
  templates: Array<Template>;
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
  creatorEmail?: Maybe<Scalars['String']>;
  currentBillingSubscription?: Maybe<BillingSubscription>;
  customDomain?: Maybe<Scalars['String']>;
  databaseSchema: Scalars['String'];
  databaseUrl: Scalars['String'];
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
  stripeIntegrations: Array<StripeIntegration>;
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
  userDocument?: Maybe<Scalars['String']>;
  userEmail: Scalars['String'];
  userPhone?: Maybe<Phones>;
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

export type TimelineCalendarEventFragmentFragment = { __typename?: 'TimelineCalendarEvent', id: any, title: string, description: string, location: string, startsAt: string, endsAt: string, isFullDay: boolean, visibility: CalendarChannelVisibility, participants: Array<{ __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> };

export type TimelineCalendarEventParticipantFragmentFragment = { __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string };

export type TimelineCalendarEventsWithTotalFragmentFragment = { __typename?: 'TimelineCalendarEventsWithTotal', totalNumberOfCalendarEvents: number, timelineCalendarEvents: Array<{ __typename?: 'TimelineCalendarEvent', id: any, title: string, description: string, location: string, startsAt: string, endsAt: string, isFullDay: boolean, visibility: CalendarChannelVisibility, participants: Array<{ __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> };

export type GetTimelineCalendarEventsFromCompanyIdQueryVariables = Exact<{
  companyId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineCalendarEventsFromCompanyIdQuery = { __typename?: 'Query', getTimelineCalendarEventsFromCompanyId: { __typename?: 'TimelineCalendarEventsWithTotal', totalNumberOfCalendarEvents: number, timelineCalendarEvents: Array<{ __typename?: 'TimelineCalendarEvent', id: any, title: string, description: string, location: string, startsAt: string, endsAt: string, isFullDay: boolean, visibility: CalendarChannelVisibility, participants: Array<{ __typename?: 'TimelineCalendarEventParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> } };

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

export type GetTimelineThreadsFromPersonIdQueryVariables = Exact<{
  personId: Scalars['UUID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineThreadsFromPersonIdQuery = { __typename?: 'Query', getTimelineThreadsFromPersonId: { __typename?: 'TimelineThreadsWithTotal', totalNumberOfThreads: number, timelineThreads: Array<{ __typename?: 'TimelineThread', id: any, read: boolean, visibility: MessageChannelVisibility, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: any | null, workspaceMemberId?: any | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> } };

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


export type UploadFileMutation = { __typename?: 'Mutation', uploadFile: string };

export type UploadImageMutationVariables = Exact<{
  file: Scalars['Upload'];
  fileFolder?: InputMaybe<FileFolder>;
}>;


export type UploadImageMutation = { __typename?: 'Mutation', uploadImage: string };

export type AuthTokenFragmentFragment = { __typename?: 'AuthToken', token: string, expiresAt: string };

export type AuthTokensFragmentFragment = { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } };

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
}>;


export type GetLoginTokenFromCredentialsMutation = { __typename?: 'Mutation', getLoginTokenFromCredentials: { __typename?: 'LoginToken', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } };

export type GetLoginTokenFromEmailVerificationTokenMutationVariables = Exact<{
  emailVerificationToken: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
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
}>;


export type ResendEmailVerificationTokenMutation = { __typename?: 'Mutation', resendEmailVerificationToken: { __typename?: 'ResendEmailVerificationTokenOutput', success: boolean } };

export type SignUpMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']>;
  captchaToken?: InputMaybe<Scalars['String']>;
  workspaceId?: InputMaybe<Scalars['String']>;
  locale?: InputMaybe<Scalars['String']>;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'SignUpOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, workspace: { __typename?: 'WorkspaceUrlsAndId', id: string, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } } };

export type SignUpInNewWorkspaceMutationVariables = Exact<{ [key: string]: never; }>;


export type SignUpInNewWorkspaceMutation = { __typename?: 'Mutation', signUpInNewWorkspace: { __typename?: 'SignUpOutput', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, workspace: { __typename?: 'WorkspaceUrlsAndId', id: string, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } } };

export type UpdatePasswordViaResetTokenMutationVariables = Exact<{
  token: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type UpdatePasswordViaResetTokenMutation = { __typename?: 'Mutation', updatePasswordViaResetToken: { __typename?: 'InvalidatePassword', success: boolean } };

export type CheckUserExistsQueryVariables = Exact<{
  email: Scalars['String'];
  captchaToken?: InputMaybe<Scalars['String']>;
}>;


export type CheckUserExistsQuery = { __typename?: 'Query', checkUserExists: { __typename: 'UserExists', exists: boolean, isEmailVerified: boolean, availableWorkspaces: Array<{ __typename?: 'AvailableWorkspaceOutput', id: string, displayName?: string | null, logo?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, sso: Array<{ __typename?: 'SSOConnection', type: IdentityProviderType, id: string, issuer: string, name: string, status: SsoIdentityProviderStatus }> }> } | { __typename: 'UserNotExists', exists: boolean } };

export type GetPublicWorkspaceDataByDomainQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPublicWorkspaceDataByDomainQuery = { __typename?: 'Query', getPublicWorkspaceDataByDomain: { __typename?: 'PublicWorkspaceDataOutput', id: string, logo?: string | null, displayName?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, authProviders: { __typename?: 'AuthProviders', google: boolean, magicLink: boolean, password: boolean, microsoft: boolean, sso: Array<{ __typename?: 'SSOIdentityProvider', id: string, name: string, type: IdentityProviderType, status: SsoIdentityProviderStatus, issuer: string }> } } };

export type ValidatePasswordResetTokenQueryVariables = Exact<{
  token: Scalars['String'];
}>;


export type ValidatePasswordResetTokenQuery = { __typename?: 'Query', validatePasswordResetToken: { __typename?: 'ValidatePasswordResetToken', id: string, email: string } };

export type BillingBaseProductPricesQueryVariables = Exact<{ [key: string]: never; }>;


export type BillingBaseProductPricesQuery = { __typename?: 'Query', plans: Array<{ __typename?: 'BillingPlanOutput', planKey: BillingPlanKey, baseProduct: { __typename?: 'BillingProduct', name: string, prices?: Array<{ __typename?: 'BillingPriceLicensedDTO', unitAmount: number, stripePriceId: string, recurringInterval: SubscriptionInterval } | { __typename?: 'BillingPriceMeteredDTO' }> | null } }> };

export type BillingPortalSessionQueryVariables = Exact<{
  returnUrlPath?: InputMaybe<Scalars['String']>;
}>;


export type BillingPortalSessionQuery = { __typename?: 'Query', billingPortalSession: { __typename?: 'BillingSessionOutput', url?: string | null } };

export type CheckoutSessionMutationVariables = Exact<{
  recurringInterval: SubscriptionInterval;
  successUrlPath?: InputMaybe<Scalars['String']>;
  plan: BillingPlanKey;
  requirePaymentMethod: Scalars['Boolean'];
}>;


export type CheckoutSessionMutation = { __typename?: 'Mutation', checkoutSession: { __typename?: 'BillingSessionOutput', url?: string | null } };

export type EndSubscriptionTrialPeriodMutationVariables = Exact<{ [key: string]: never; }>;


export type EndSubscriptionTrialPeriodMutation = { __typename?: 'Mutation', endSubscriptionTrialPeriod: { __typename?: 'BillingEndTrialPeriodOutput', status?: SubscriptionStatus | null, hasPaymentMethod: boolean } };

export type GetMeteredProductsUsageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeteredProductsUsageQuery = { __typename?: 'Query', getMeteredProductsUsage: Array<{ __typename?: 'BillingMeteredProductUsageOutput', productKey: BillingProductKey, usageQuantity: number, freeTierQuantity: number, freeTrialQuantity: number, unitPriceCents: number, totalCostCents: number }> };

export type SwitchSubscriptionToYearlyIntervalMutationVariables = Exact<{ [key: string]: never; }>;


export type SwitchSubscriptionToYearlyIntervalMutation = { __typename?: 'Mutation', switchToYearlyInterval: { __typename?: 'BillingUpdateOutput', success: boolean } };

export type SendEventMessageMutationVariables = Exact<{
  sendEventMessageInput: SendEventMessageInput;
}>;


export type SendEventMessageMutation = { __typename?: 'Mutation', sendEventMessage: boolean };

export type SendMessageMutationVariables = Exact<{
  sendMessageInput: SendMessageInput;
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: boolean };

export type SendTemplateMutationVariables = Exact<{
  sendTemplateInput: SendTemplateInput;
}>;


export type SendTemplateMutation = { __typename?: 'Mutation', sendTemplate: boolean };

export type GetWhatsappTemplatesQueryVariables = Exact<{
  integrationId: Scalars['String'];
}>;


export type GetWhatsappTemplatesQuery = { __typename?: 'Query', getWhatsappTemplates: { __typename?: 'WhatsappTemplatesResponse', templates: Array<{ __typename?: 'Template', id: string, status: string, name: string, language: string, parameter_format: string, category: string, components: Array<{ __typename?: 'Component', format?: string | null, text?: string | null, type: string }> }> } };

export type UploadFileToBucketMutationVariables = Exact<{
  file: Scalars['Upload'];
  type: Scalars['String'];
  workspaceId: Scalars['String'];
  isInternal?: InputMaybe<Scalars['Boolean']>;
}>;


export type UploadFileToBucketMutation = { __typename?: 'Mutation', uploadFileToBucket: string };

export type GetClientConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClientConfigQuery = { __typename?: 'Query', clientConfig: { __typename?: 'ClientConfig', signInPrefilled: boolean, isMultiWorkspaceEnabled: boolean, isEmailVerificationRequired: boolean, defaultSubdomain?: string | null, frontDomain: string, debugMode: boolean, analyticsEnabled: boolean, isAttachmentPreviewEnabled: boolean, chromeExtensionId?: string | null, canManageFeatureFlags: boolean, isMicrosoftMessagingEnabled: boolean, isMicrosoftCalendarEnabled: boolean, isGoogleMessagingEnabled: boolean, isGoogleCalendarEnabled: boolean, isConfigVariablesInDbEnabled: boolean, billing: { __typename?: 'Billing', isBillingEnabled: boolean, billingUrl?: string | null, trialPeriods: Array<{ __typename?: 'BillingTrialPeriodDTO', duration: number, isCreditCardRequired: boolean }> }, authProviders: { __typename?: 'AuthProviders', google: boolean, password: boolean, microsoft: boolean, sso: Array<{ __typename?: 'SSOIdentityProvider', id: string, name: string, type: IdentityProviderType, status: SsoIdentityProviderStatus, issuer: string }> }, support: { __typename?: 'Support', supportDriver: string, supportFrontChatId?: string | null }, sentry: { __typename?: 'Sentry', dsn?: string | null, environment?: string | null, release?: string | null }, captcha: { __typename?: 'Captcha', provider?: CaptchaDriverType | null, siteKey?: string | null }, api: { __typename?: 'ApiConfig', mutationMaximumAffectedRecords: number }, publicFeatureFlags: Array<{ __typename?: 'PublicFeatureFlag', key: FeatureFlagKey, metadata: { __typename?: 'PublicFeatureFlagMetadata', label: string, description: string, imagePath: string } }> } };

export type SearchQueryVariables = Exact<{
  searchInput: Scalars['String'];
  limit: Scalars['Int'];
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
}>;


export type SearchQuery = { __typename?: 'Query', search: Array<{ __typename?: 'SearchRecord', recordId: string, objectNameSingular: string, label: string, imageUrl?: string | null, tsRankCD: number, tsRank: number }> };

export type DashboardLinklogsQueryFragmentFragment = { __typename?: 'LinkLogsWorkspaceEntity', product: string, linkName?: string | null, linkId?: string | null, utmSource: string, utmMedium: string, utmCampaign: string, userIp?: string | null, userAgent?: string | null };

export type GetDashboardLinklogsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDashboardLinklogsQuery = { __typename?: 'Query', getDashboardLinklogs: Array<{ __typename?: 'LinkLogsWorkspaceEntity', product: string, linkName?: string | null, linkId?: string | null, utmSource: string, utmMedium: string, utmCampaign: string, userIp?: string | null, userAgent?: string | null }> };

export type SkipSyncEmailOnboardingStepMutationVariables = Exact<{ [key: string]: never; }>;


export type SkipSyncEmailOnboardingStepMutation = { __typename?: 'Mutation', skipSyncEmailOnboardingStep: { __typename?: 'OnboardingStepSuccess', success: boolean } };

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

export type CreateInterIntegrationMutationVariables = Exact<{
  createInput: CreateInterIntegrationInput;
}>;


export type CreateInterIntegrationMutation = { __typename?: 'Mutation', createInterIntegration: { __typename?: 'InterIntegration', id: any, integrationName: string, clientId: string, clientSecret: string, privateKey?: string | null, certificate?: string | null, expirationDate?: string | null, status: string, workspace: { __typename?: 'Workspace', id: any } } };

export type ToggleInterIntegrationStatusMutationVariables = Exact<{
  integrationId: Scalars['String'];
}>;


export type ToggleInterIntegrationStatusMutation = { __typename?: 'Mutation', toggleInterIntegrationStatus: string };

export type UpdateInterIntegrationMutationVariables = Exact<{
  updateInput: UpdateInterIntegrationInput;
}>;


export type UpdateInterIntegrationMutation = { __typename?: 'Mutation', updateInterIntegration: { __typename?: 'InterIntegration', id: any, integrationName: string, clientId: string, clientSecret: string, privateKey?: string | null, certificate?: string | null, expirationDate?: string | null, status: string } };

export type InterIntegrationsByWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['String'];
}>;


export type InterIntegrationsByWorkspaceQuery = { __typename?: 'Query', interIntegrationsByWorkspace: Array<{ __typename?: 'InterIntegration', id: any, integrationName: string, clientId: string, clientSecret: string, privateKey?: string | null, certificate?: string | null, status: string, expirationDate?: string | null, workspace: { __typename?: 'Workspace', id: any } }> };

export type CreateWhatsappIntegrationMutationVariables = Exact<{
  createInput: CreateWhatsappIntegrationInput;
}>;


export type CreateWhatsappIntegrationMutation = { __typename?: 'Mutation', createWhatsappIntegration: { __typename?: 'WhatsappIntegration', id: any, label: string, phoneId: string, businessAccountId: string, accessToken: string, appId: string, appKey: string, disabled: boolean, workspace: { __typename?: 'Workspace', id: any } } };

export type ToggleWhatsappIntegrationStatusMutationVariables = Exact<{
  integrationId: Scalars['String'];
}>;


export type ToggleWhatsappIntegrationStatusMutation = { __typename?: 'Mutation', toggleWhatsappIntegrationStatus: boolean };

export type UpdateWhatsappIntegrationMutationVariables = Exact<{
  updateInput: UpdateWhatsappIntegrationInput;
}>;


export type UpdateWhatsappIntegrationMutation = { __typename?: 'Mutation', updateWhatsappIntegration: { __typename?: 'WhatsappIntegration', id: any, label: string, phoneId: string, businessAccountId: string, accessToken: string, appId: string, appKey: string, disabled: boolean } };

export type WhatsappIntegrationsByWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['String'];
}>;


export type WhatsappIntegrationsByWorkspaceQuery = { __typename?: 'Query', whatsappIntegrationsByWorkspace: Array<{ __typename?: 'WhatsappIntegration', id: any, label: string, phoneId: string, businessAccountId: string, appId: string, appKey: string, disabled: boolean, sla: number, workspace: { __typename?: 'Workspace', id: any } }> };

export type UpdateLabPublicFeatureFlagMutationVariables = Exact<{
  input: UpdateLabPublicFeatureFlagInput;
}>;


export type UpdateLabPublicFeatureFlagMutation = { __typename?: 'Mutation', updateLabPublicFeatureFlag: { __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean } };

export type ObjectPermissionFragmentFragment = { __typename?: 'ObjectPermission', id: string, objectMetadataId: string, roleId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null };

export type RoleFragmentFragment = { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean };

export type SettingPermissionFragmentFragment = { __typename?: 'SettingPermission', id: string, setting: SettingPermissionType, roleId: string };

export type CreateOneRoleMutationVariables = Exact<{
  createRoleInput: CreateRoleInput;
}>;


export type CreateOneRoleMutation = { __typename?: 'Mutation', createOneRole: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } };

export type UpdateOneRoleMutationVariables = Exact<{
  updateRoleInput: UpdateRoleInput;
}>;


export type UpdateOneRoleMutation = { __typename?: 'Mutation', updateOneRole: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } };

export type UpdateWorkspaceMemberRoleMutationVariables = Exact<{
  workspaceMemberId: Scalars['String'];
  roleId: Scalars['String'];
}>;


export type UpdateWorkspaceMemberRoleMutation = { __typename?: 'Mutation', updateWorkspaceMemberRole: { __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, userDocument?: string | null, roles?: Array<{ __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean }> | null, name: { __typename?: 'FullName', firstName: string, lastName: string }, userPhone?: { __typename?: 'Phones', primaryPhoneNumber: string, primaryPhoneCountryCode: string, primaryPhoneCallingCode: string, additionalPhones?: any | null } | null } };

export type UpsertObjectPermissionsMutationVariables = Exact<{
  upsertObjectPermissionsInput: UpsertObjectPermissionsInput;
}>;


export type UpsertObjectPermissionsMutation = { __typename?: 'Mutation', upsertObjectPermissions: Array<{ __typename?: 'ObjectPermission', id: string, objectMetadataId: string, roleId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null }> };

export type UpsertSettingPermissionsMutationVariables = Exact<{
  upsertSettingPermissionsInput: UpsertSettingPermissionsInput;
}>;


export type UpsertSettingPermissionsMutation = { __typename?: 'Mutation', upsertSettingPermissions: Array<{ __typename?: 'SettingPermission', id: string, setting: SettingPermissionType, roleId: string }> };

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = { __typename?: 'Query', getRoles: Array<{ __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean, workspaceMembers: Array<{ __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, userDocument?: string | null, name: { __typename?: 'FullName', firstName: string, lastName: string }, userPhone?: { __typename?: 'Phones', primaryPhoneNumber: string, primaryPhoneCountryCode: string, primaryPhoneCallingCode: string, additionalPhones?: any | null } | null }>, settingPermissions?: Array<{ __typename?: 'SettingPermission', id: string, setting: SettingPermissionType, roleId: string }> | null, objectPermissions?: Array<{ __typename?: 'ObjectPermission', id: string, objectMetadataId: string, roleId: string, canReadObjectRecords?: boolean | null, canUpdateObjectRecords?: boolean | null, canSoftDeleteObjectRecords?: boolean | null, canDestroyObjectRecords?: boolean | null }> | null }> };

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

export type CreateAgentMutationVariables = Exact<{
  createInput: CreateAgentInput;
}>;


export type CreateAgentMutation = { __typename?: 'Mutation', createAgent: { __typename?: 'Agent', id: any } };

export type ToggleAgentStatusMutationVariables = Exact<{
  agentId: Scalars['String'];
}>;


export type ToggleAgentStatusMutation = { __typename?: 'Mutation', toggleAgentStatus: boolean };

export type UpdateAgentMutationVariables = Exact<{
  updateInput: UpdateAgentInput;
}>;


export type UpdateAgentMutation = { __typename?: 'Mutation', updateAgent: { __typename?: 'Agent', id: any, isAdmin: boolean, isActive: boolean, workspace: { __typename?: 'Workspace', id: any, displayName?: string | null } } };

export type AgentsByWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['String'];
}>;


export type AgentsByWorkspaceQuery = { __typename?: 'Query', agentsByWorkspace: Array<{ __typename?: 'Agent', id: any, isAdmin: boolean, isActive: boolean, memberId: string, workspace: { __typename?: 'Workspace', id: any, displayName?: string | null }, sectors: Array<{ __typename?: 'Sector', id: any, name: string }>, inboxes: Array<{ __typename?: 'Inbox', id: any, integrationType: IntegrationType, whatsappIntegration?: { __typename?: 'WhatsappIntegration', id: any, label: string, phoneId: string, disabled: boolean } | null }> }> };

export type InboxesByWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['String'];
}>;


export type InboxesByWorkspaceQuery = { __typename?: 'Query', inboxesByWorkspace: Array<{ __typename?: 'Inbox', id: any, integrationType: IntegrationType, workspace: { __typename?: 'Workspace', id: any, displayName?: string | null }, whatsappIntegration?: { __typename?: 'WhatsappIntegration', id: any, label: string, phoneId: string, disabled: boolean } | null }> };

export type CreateSectorMutationVariables = Exact<{
  createInput: CreateSectorInput;
}>;


export type CreateSectorMutation = { __typename?: 'Mutation', createSector: { __typename?: 'Sector', id: any } };

export type DeleteSectorMutationVariables = Exact<{
  sectorId: Scalars['String'];
}>;


export type DeleteSectorMutation = { __typename?: 'Mutation', deleteSector: boolean };

export type UpdateSectorMutationVariables = Exact<{
  updateInput: UpdateSectorInput;
}>;


export type UpdateSectorMutation = { __typename?: 'Mutation', updateSector: { __typename?: 'Sector', id: any, name: string, topics?: Array<any> | null, icon: string, workspace: { __typename?: 'Workspace', id: any, displayName?: string | null } } };

export type SectorsByWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['String'];
}>;


export type SectorsByWorkspaceQuery = { __typename?: 'Query', sectorsByWorkspace: Array<{ __typename?: 'Sector', id: any, name: string, icon: string, topics?: Array<any> | null, createdAt: string, updatedAt: string, workspace: { __typename?: 'Workspace', id: any, displayName?: string | null } }> };

export type UpdateWhatsappIntegrationServiceLevelMutationVariables = Exact<{
  integrationId: Scalars['String'];
  sla: Scalars['Int'];
}>;


export type UpdateWhatsappIntegrationServiceLevelMutation = { __typename?: 'Mutation', updateWhatsappIntegrationServiceLevel: { __typename?: 'WhatsappIntegration', label: string, sla: number } };

export type CreateTelephonyMutationVariables = Exact<{
  createTelephonyInput: CreateTelephonyInput;
}>;


export type CreateTelephonyMutation = { __typename?: 'Mutation', createTelephony: { __typename?: 'Telephony', id: any } };

export type UpdateTelephonyMutationVariables = Exact<{
  id: Scalars['ID'];
  updateTelephonyInput: UpdateTelephonyInput;
}>;


export type UpdateTelephonyMutation = { __typename?: 'Mutation', updateTelephony: { __typename?: 'Telephony', id: any, memberId: string, numberExtension: string } };

export type GetTelephonyCallFlowsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTelephonyCallFlowsQuery = { __typename?: 'Query', getTelephonyCallFlows?: Array<{ __typename?: 'TelephonyCallFlow', fluxo_chamada_id?: string | null, fluxo_chamada_nome?: string | null }> | null };

export type GetTelephonyPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTelephonyPlansQuery = { __typename?: 'Query', getTelephonyPlans?: Array<{ __typename?: 'TelephonyDialingPlan', plano_discagem_id?: string | null, nome?: string | null, cliente_id?: string | null }> | null };

export type GetTelephonyDidsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTelephonyDidsQuery = { __typename?: 'Query', getTelephonyDids?: Array<{ __typename?: 'TelephonyDids', did_id?: string | null, numero?: string | null }> | null };

export type GetAllExtensionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllExtensionsQuery = { __typename?: 'Query', getAllExtensions?: Array<{ __typename?: 'TelephonyExtension', codigo_incorporacao?: string | null, cliente_id?: string | null, codigo_area?: string | null, nome?: string | null, numero?: string | null, plano_discagem_id?: string | null, ramal_id?: string | null, caller_id_externo?: string | null, usuario_autenticacao?: string | null }> | null };

export type GetAllTelephonysQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type GetAllTelephonysQuery = { __typename?: 'Query', findAllTelephony: Array<{ __typename?: 'Telephony', id: any, memberId: string, numberExtension: string, createdAt: string, updatedAt: string, SIPPassword?: string | null, areaCode?: string | null, blockExtension?: boolean | null, callerExternalID?: string | null, destinyMailboxAllCallsOrOffline?: string | null, destinyMailboxBusy?: string | null, dialingPlan?: string | null, emailForMailbox?: string | null, enableMailbox?: boolean | null, extensionAllCallsOrOffline?: string | null, extensionBusy?: string | null, extensionGroup?: string | null, extensionName?: string | null, externalNumberAllCallsOrOffline?: string | null, externalNumberBusy?: string | null, fowardAllCalls?: string | null, fowardBusyNotAvailable?: string | null, fowardOfflineWithoutService?: string | null, listenToCalls?: boolean | null, pullCalls?: string | null, recordCalls?: boolean | null, type?: string | null, advancedFowarding1?: string | null, advancedFowarding2?: string | null, advancedFowarding3?: string | null, advancedFowarding4?: string | null, advancedFowarding5?: string | null, advancedFowarding1Value?: string | null, advancedFowarding2Value?: string | null, advancedFowarding3Value?: string | null, advancedFowarding4Value?: string | null, advancedFowarding5Value?: string | null, workspace: { __typename?: 'Workspace', id: any } }> };

export type GetTelephonyUrAsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTelephonyUrAsQuery = { __typename?: 'Query', getTelephonyURAs?: Array<{ __typename?: 'Campaign', campanha_id?: string | null, nome?: string | null }> | null };

export type GetUserSoftfoneQueryVariables = Exact<{
  extNum: Scalars['String'];
}>;


export type GetUserSoftfoneQuery = { __typename?: 'Query', getUserSoftfone?: { __typename?: 'TelephonyExtension', codigo_incorporacao?: string | null, cliente_id?: string | null, codigo_area?: string | null, nome?: string | null, numero?: string | null, plano_discagem_id?: string | null, ramal_id?: string | null, caller_id_externo?: string | null, usuario_autenticacao?: string | null, senha_sip?: string | null } | null };

export type OnDbEventSubscriptionVariables = Exact<{
  input: OnDbEventInput;
}>;


export type OnDbEventSubscription = { __typename?: 'Subscription', onDbEvent: { __typename?: 'OnDbEventDTO', eventDate: string, action: DatabaseEventAction, objectNameSingular: string, updatedFields?: Array<string> | null, record: any } };

export type UserQueryFragmentFragment = { __typename?: 'User', id: any, firstName: string, lastName: string, email: string, canAccessFullAdminPanel: boolean, canImpersonate: boolean, supportUserHash?: string | null, onboardingStatus?: OnboardingStatus | null, userVars: any, workspaceMember?: { __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, userDocument?: string | null, name: { __typename?: 'FullName', firstName: string, lastName: string }, userPhone?: { __typename?: 'Phones', primaryPhoneNumber: string, primaryPhoneCountryCode: string, primaryPhoneCallingCode: string, additionalPhones?: any | null } | null } | null, workspaceMembers?: Array<{ __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, userDocument?: string | null, name: { __typename?: 'FullName', firstName: string, lastName: string }, userPhone?: { __typename?: 'Phones', primaryPhoneNumber: string, primaryPhoneCountryCode: string, primaryPhoneCallingCode: string, additionalPhones?: any | null } | null }> | null, currentUserWorkspace?: { __typename?: 'UserWorkspace', settingsPermissions?: Array<SettingPermissionType> | null, objectRecordsPermissions?: Array<PermissionsOnAllObjectRecords> | null } | null, currentWorkspace?: { __typename?: 'Workspace', id: any, displayName?: string | null, logo?: string | null, inviteHash?: string | null, allowImpersonation: boolean, activationStatus: WorkspaceActivationStatus, isPublicInviteLinkEnabled: boolean, isGoogleAuthEnabled: boolean, isMicrosoftAuthEnabled: boolean, isPasswordAuthEnabled: boolean, subdomain: string, creatorEmail?: string | null, hasValidEnterpriseKey: boolean, customDomain?: string | null, isCustomDomainEnabled: boolean, metadataVersion: number, workspaceMembersCount?: number | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, featureFlags?: Array<{ __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean }> | null, currentBillingSubscription?: { __typename?: 'BillingSubscription', id: any, status: SubscriptionStatus, interval?: SubscriptionInterval | null, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItem', id: any, hasReachedCurrentPeriodCap: boolean, billingProduct?: { __typename?: 'BillingProduct', name: string, description: string, metadata: { __typename?: 'BillingProductMetadata', planKey: BillingPlanKey, priceUsageBased: BillingUsageType, productKey: BillingProductKey } } | null }> | null } | null, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: any, status: SubscriptionStatus }>, defaultRole?: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } | null } | null, workspaces: Array<{ __typename?: 'UserWorkspace', workspace?: { __typename?: 'Workspace', id: any, logo?: string | null, displayName?: string | null, subdomain: string, customDomain?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } | null }> };

export type DeleteUserAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserAccountMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'User', id: any } };

export type UploadProfilePictureMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadProfilePictureMutation = { __typename?: 'Mutation', uploadProfilePicture: string };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', id: any, firstName: string, lastName: string, email: string, canAccessFullAdminPanel: boolean, canImpersonate: boolean, supportUserHash?: string | null, onboardingStatus?: OnboardingStatus | null, userVars: any, workspaceMember?: { __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, userDocument?: string | null, name: { __typename?: 'FullName', firstName: string, lastName: string }, userPhone?: { __typename?: 'Phones', primaryPhoneNumber: string, primaryPhoneCountryCode: string, primaryPhoneCallingCode: string, additionalPhones?: any | null } | null } | null, workspaceMembers?: Array<{ __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, userDocument?: string | null, name: { __typename?: 'FullName', firstName: string, lastName: string }, userPhone?: { __typename?: 'Phones', primaryPhoneNumber: string, primaryPhoneCountryCode: string, primaryPhoneCallingCode: string, additionalPhones?: any | null } | null }> | null, currentUserWorkspace?: { __typename?: 'UserWorkspace', settingsPermissions?: Array<SettingPermissionType> | null, objectRecordsPermissions?: Array<PermissionsOnAllObjectRecords> | null } | null, currentWorkspace?: { __typename?: 'Workspace', id: any, displayName?: string | null, logo?: string | null, inviteHash?: string | null, allowImpersonation: boolean, activationStatus: WorkspaceActivationStatus, isPublicInviteLinkEnabled: boolean, isGoogleAuthEnabled: boolean, isMicrosoftAuthEnabled: boolean, isPasswordAuthEnabled: boolean, subdomain: string, creatorEmail?: string | null, hasValidEnterpriseKey: boolean, customDomain?: string | null, isCustomDomainEnabled: boolean, metadataVersion: number, workspaceMembersCount?: number | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null }, featureFlags?: Array<{ __typename?: 'FeatureFlagDTO', key: FeatureFlagKey, value: boolean }> | null, currentBillingSubscription?: { __typename?: 'BillingSubscription', id: any, status: SubscriptionStatus, interval?: SubscriptionInterval | null, billingSubscriptionItems?: Array<{ __typename?: 'BillingSubscriptionItem', id: any, hasReachedCurrentPeriodCap: boolean, billingProduct?: { __typename?: 'BillingProduct', name: string, description: string, metadata: { __typename?: 'BillingProductMetadata', planKey: BillingPlanKey, priceUsageBased: BillingUsageType, productKey: BillingProductKey } } | null }> | null } | null, billingSubscriptions: Array<{ __typename?: 'BillingSubscription', id: any, status: SubscriptionStatus }>, defaultRole?: { __typename?: 'Role', id: string, label: string, description?: string | null, icon?: string | null, canUpdateAllSettings: boolean, isEditable: boolean, canReadAllObjectRecords: boolean, canUpdateAllObjectRecords: boolean, canSoftDeleteAllObjectRecords: boolean, canDestroyAllObjectRecords: boolean } | null } | null, workspaces: Array<{ __typename?: 'UserWorkspace', workspace?: { __typename?: 'Workspace', id: any, logo?: string | null, displayName?: string | null, subdomain: string, customDomain?: string | null, workspaceUrls: { __typename?: 'WorkspaceUrls', subdomainUrl: string, customUrl?: string | null } } | null }> } };

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

export type WorkspaceMemberQueryFragmentFragment = { __typename?: 'WorkspaceMember', id: any, colorScheme: string, avatarUrl?: string | null, locale?: string | null, userEmail: string, timeZone?: string | null, dateFormat?: WorkspaceMemberDateFormatEnum | null, timeFormat?: WorkspaceMemberTimeFormatEnum | null, userDocument?: string | null, name: { __typename?: 'FullName', firstName: string, lastName: string }, userPhone?: { __typename?: 'Phones', primaryPhoneNumber: string, primaryPhoneCountryCode: string, primaryPhoneCallingCode: string, additionalPhones?: any | null } | null };

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


export type UploadWorkspaceLogoMutation = { __typename?: 'Mutation', uploadWorkspaceLogo: string };

export type CheckCustomDomainValidRecordsMutationVariables = Exact<{ [key: string]: never; }>;


export type CheckCustomDomainValidRecordsMutation = { __typename?: 'Mutation', checkCustomDomainValidRecords?: { __typename?: 'CustomDomainValidRecords', id: string, customDomain: string, records: Array<{ __typename?: 'CustomDomainRecord', type: string, key: string, value: string, validationType: string, status: string }> } | null };

export type GetWorkspaceFromInviteHashQueryVariables = Exact<{
  inviteHash: Scalars['String'];
}>;


export type GetWorkspaceFromInviteHashQuery = { __typename?: 'Query', findWorkspaceFromInviteHash: { __typename?: 'Workspace', id: any, displayName?: string | null, logo?: string | null, allowImpersonation: boolean } };

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
export const DashboardLinklogsQueryFragmentFragmentDoc = gql`
    fragment DashboardLinklogsQueryFragment on LinkLogsWorkspaceEntity {
  product
  linkName
  linkId
  utmSource
  utmMedium
  utmCampaign
  userIp
  userAgent
}
    `;
export const ObjectPermissionFragmentFragmentDoc = gql`
    fragment ObjectPermissionFragment on ObjectPermission {
  id
  objectMetadataId
  roleId
  canReadObjectRecords
  canUpdateObjectRecords
  canSoftDeleteObjectRecords
  canDestroyObjectRecords
}
    `;
export const SettingPermissionFragmentFragmentDoc = gql`
    fragment SettingPermissionFragment on SettingPermission {
  id
  setting
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
  userDocument
  userPhone {
    primaryPhoneNumber
    primaryPhoneCountryCode
    primaryPhoneCallingCode
    additionalPhones
  }
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
  currentUserWorkspace {
    settingsPermissions
    objectRecordsPermissions
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
    creatorEmail
    hasValidEnterpriseKey
    customDomain
    isCustomDomainEnabled
    workspaceUrls {
      subdomainUrl
      customUrl
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
      billingSubscriptionItems {
        id
        hasReachedCurrentPeriodCap
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
    }
    workspaceMembersCount
    defaultRole {
      ...RoleFragment
    }
  }
  workspaces {
    workspace {
      id
      logo
      displayName
      subdomain
      customDomain
      workspaceUrls {
        subdomainUrl
        customUrl
      }
    }
  }
  userVars
}
    ${WorkspaceMemberQueryFragmentFragmentDoc}
${RoleFragmentFragmentDoc}`;
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
  uploadFile(file: $file, fileFolder: $fileFolder)
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
  uploadImage(file: $file, fileFolder: $fileFolder)
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
    mutation GetAuthTokensFromLoginToken($loginToken: String!) {
  getAuthTokensFromLoginToken(loginToken: $loginToken) {
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
    mutation GetLoginTokenFromCredentials($email: String!, $password: String!, $captchaToken: String) {
  getLoginTokenFromCredentials(
    email: $email
    password: $password
    captchaToken: $captchaToken
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
    mutation GetLoginTokenFromEmailVerificationToken($emailVerificationToken: String!, $captchaToken: String) {
  getLoginTokenFromEmailVerificationToken(
    emailVerificationToken: $emailVerificationToken
    captchaToken: $captchaToken
  ) {
    loginToken {
      ...AuthTokenFragment
    }
    workspaceUrls {
      subdomainUrl
      customUrl
    }
  }
}
    ${AuthTokenFragmentFragmentDoc}`;
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
 *      captchaToken: // value for 'captchaToken'
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
        subdomainUrl
        customUrl
      }
      id
    }
    loginToken {
      ...AuthTokenFragment
    }
  }
}
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
    mutation ResendEmailVerificationToken($email: String!) {
  resendEmailVerificationToken(email: $email) {
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
export const SignUpDocument = gql`
    mutation SignUp($email: String!, $password: String!, $workspaceInviteHash: String, $workspacePersonalInviteToken: String = null, $captchaToken: String, $workspaceId: String, $locale: String) {
  signUp(
    email: $email
    password: $password
    workspaceInviteHash: $workspaceInviteHash
    workspacePersonalInviteToken: $workspacePersonalInviteToken
    captchaToken: $captchaToken
    workspaceId: $workspaceId
    locale: $locale
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
 *      workspaceInviteHash: // value for 'workspaceInviteHash'
 *      workspacePersonalInviteToken: // value for 'workspacePersonalInviteToken'
 *      captchaToken: // value for 'captchaToken'
 *      workspaceId: // value for 'workspaceId'
 *      locale: // value for 'locale'
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
        subdomainUrl
        customUrl
      }
    }
  }
}
    ${AuthTokenFragmentFragmentDoc}`;
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
    __typename
    ... on UserExists {
      exists
      availableWorkspaces {
        id
        displayName
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
      isEmailVerified
    }
    ... on UserNotExists {
      exists
    }
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
    query GetPublicWorkspaceDataByDomain {
  getPublicWorkspaceDataByDomain {
    id
    logo
    displayName
    workspaceUrls {
      subdomainUrl
      customUrl
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
    `;

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
 *   },
 * });
 */
export function useGetPublicWorkspaceDataByDomainQuery(baseOptions?: Apollo.QueryHookOptions<GetPublicWorkspaceDataByDomainQuery, GetPublicWorkspaceDataByDomainQueryVariables>) {
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
export const SendEventMessageDocument = gql`
    mutation SendEventMessage($sendEventMessageInput: SendEventMessageInput!) {
  sendEventMessage(sendEventMessageInput: $sendEventMessageInput)
}
    `;
export type SendEventMessageMutationFn = Apollo.MutationFunction<SendEventMessageMutation, SendEventMessageMutationVariables>;

/**
 * __useSendEventMessageMutation__
 *
 * To run a mutation, you first call `useSendEventMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendEventMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendEventMessageMutation, { data, loading, error }] = useSendEventMessageMutation({
 *   variables: {
 *      sendEventMessageInput: // value for 'sendEventMessageInput'
 *   },
 * });
 */
export function useSendEventMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendEventMessageMutation, SendEventMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendEventMessageMutation, SendEventMessageMutationVariables>(SendEventMessageDocument, options);
      }
export type SendEventMessageMutationHookResult = ReturnType<typeof useSendEventMessageMutation>;
export type SendEventMessageMutationResult = Apollo.MutationResult<SendEventMessageMutation>;
export type SendEventMessageMutationOptions = Apollo.BaseMutationOptions<SendEventMessageMutation, SendEventMessageMutationVariables>;
export const SendMessageDocument = gql`
    mutation SendMessage($sendMessageInput: SendMessageInput!) {
  sendMessage(sendMessageInput: $sendMessageInput)
}
    `;
export type SendMessageMutationFn = Apollo.MutationFunction<SendMessageMutation, SendMessageMutationVariables>;

/**
 * __useSendMessageMutation__
 *
 * To run a mutation, you first call `useSendMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageMutation, { data, loading, error }] = useSendMessageMutation({
 *   variables: {
 *      sendMessageInput: // value for 'sendMessageInput'
 *   },
 * });
 */
export function useSendMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendMessageMutation, SendMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendMessageMutation, SendMessageMutationVariables>(SendMessageDocument, options);
      }
export type SendMessageMutationHookResult = ReturnType<typeof useSendMessageMutation>;
export type SendMessageMutationResult = Apollo.MutationResult<SendMessageMutation>;
export type SendMessageMutationOptions = Apollo.BaseMutationOptions<SendMessageMutation, SendMessageMutationVariables>;
export const SendTemplateDocument = gql`
    mutation SendTemplate($sendTemplateInput: SendTemplateInput!) {
  sendTemplate(sendTemplateInput: $sendTemplateInput)
}
    `;
export type SendTemplateMutationFn = Apollo.MutationFunction<SendTemplateMutation, SendTemplateMutationVariables>;

/**
 * __useSendTemplateMutation__
 *
 * To run a mutation, you first call `useSendTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendTemplateMutation, { data, loading, error }] = useSendTemplateMutation({
 *   variables: {
 *      sendTemplateInput: // value for 'sendTemplateInput'
 *   },
 * });
 */
export function useSendTemplateMutation(baseOptions?: Apollo.MutationHookOptions<SendTemplateMutation, SendTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendTemplateMutation, SendTemplateMutationVariables>(SendTemplateDocument, options);
      }
export type SendTemplateMutationHookResult = ReturnType<typeof useSendTemplateMutation>;
export type SendTemplateMutationResult = Apollo.MutationResult<SendTemplateMutation>;
export type SendTemplateMutationOptions = Apollo.BaseMutationOptions<SendTemplateMutation, SendTemplateMutationVariables>;
export const GetWhatsappTemplatesDocument = gql`
    query GetWhatsappTemplates($integrationId: String!) {
  getWhatsappTemplates(integrationId: $integrationId) {
    templates {
      id
      status
      name
      language
      parameter_format
      category
      components {
        format
        text
        type
      }
    }
  }
}
    `;

/**
 * __useGetWhatsappTemplatesQuery__
 *
 * To run a query within a React component, call `useGetWhatsappTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWhatsappTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWhatsappTemplatesQuery({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *   },
 * });
 */
export function useGetWhatsappTemplatesQuery(baseOptions: Apollo.QueryHookOptions<GetWhatsappTemplatesQuery, GetWhatsappTemplatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWhatsappTemplatesQuery, GetWhatsappTemplatesQueryVariables>(GetWhatsappTemplatesDocument, options);
      }
export function useGetWhatsappTemplatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWhatsappTemplatesQuery, GetWhatsappTemplatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWhatsappTemplatesQuery, GetWhatsappTemplatesQueryVariables>(GetWhatsappTemplatesDocument, options);
        }
export type GetWhatsappTemplatesQueryHookResult = ReturnType<typeof useGetWhatsappTemplatesQuery>;
export type GetWhatsappTemplatesLazyQueryHookResult = ReturnType<typeof useGetWhatsappTemplatesLazyQuery>;
export type GetWhatsappTemplatesQueryResult = Apollo.QueryResult<GetWhatsappTemplatesQuery, GetWhatsappTemplatesQueryVariables>;
export const UploadFileToBucketDocument = gql`
    mutation UploadFileToBucket($file: Upload!, $type: String!, $workspaceId: String!, $isInternal: Boolean) {
  uploadFileToBucket(
    file: $file
    type: $type
    workspaceId: $workspaceId
    isInternal: $isInternal
  )
}
    `;
export type UploadFileToBucketMutationFn = Apollo.MutationFunction<UploadFileToBucketMutation, UploadFileToBucketMutationVariables>;

/**
 * __useUploadFileToBucketMutation__
 *
 * To run a mutation, you first call `useUploadFileToBucketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadFileToBucketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadFileToBucketMutation, { data, loading, error }] = useUploadFileToBucketMutation({
 *   variables: {
 *      file: // value for 'file'
 *      type: // value for 'type'
 *      workspaceId: // value for 'workspaceId'
 *      isInternal: // value for 'isInternal'
 *   },
 * });
 */
export function useUploadFileToBucketMutation(baseOptions?: Apollo.MutationHookOptions<UploadFileToBucketMutation, UploadFileToBucketMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadFileToBucketMutation, UploadFileToBucketMutationVariables>(UploadFileToBucketDocument, options);
      }
export type UploadFileToBucketMutationHookResult = ReturnType<typeof useUploadFileToBucketMutation>;
export type UploadFileToBucketMutationResult = Apollo.MutationResult<UploadFileToBucketMutation>;
export type UploadFileToBucketMutationOptions = Apollo.BaseMutationOptions<UploadFileToBucketMutation, UploadFileToBucketMutationVariables>;
export const GetClientConfigDocument = gql`
    query GetClientConfig {
  clientConfig {
    billing {
      isBillingEnabled
      billingUrl
      trialPeriods {
        duration
        isCreditCardRequired
      }
    }
    authProviders {
      google
      password
      microsoft
      sso {
        id
        name
        type
        status
        issuer
      }
    }
    signInPrefilled
    isMultiWorkspaceEnabled
    isEmailVerificationRequired
    defaultSubdomain
    frontDomain
    debugMode
    analyticsEnabled
    isAttachmentPreviewEnabled
    support {
      supportDriver
      supportFrontChatId
    }
    sentry {
      dsn
      environment
      release
    }
    captcha {
      provider
      siteKey
    }
    api {
      mutationMaximumAffectedRecords
    }
    chromeExtensionId
    canManageFeatureFlags
    publicFeatureFlags {
      key
      metadata {
        label
        description
        imagePath
      }
    }
    isMicrosoftMessagingEnabled
    isMicrosoftCalendarEnabled
    isGoogleMessagingEnabled
    isGoogleCalendarEnabled
    isConfigVariablesInDbEnabled
  }
}
    `;

/**
 * __useGetClientConfigQuery__
 *
 * To run a query within a React component, call `useGetClientConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClientConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClientConfigQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetClientConfigQuery(baseOptions?: Apollo.QueryHookOptions<GetClientConfigQuery, GetClientConfigQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClientConfigQuery, GetClientConfigQueryVariables>(GetClientConfigDocument, options);
      }
export function useGetClientConfigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClientConfigQuery, GetClientConfigQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClientConfigQuery, GetClientConfigQueryVariables>(GetClientConfigDocument, options);
        }
export type GetClientConfigQueryHookResult = ReturnType<typeof useGetClientConfigQuery>;
export type GetClientConfigLazyQueryHookResult = ReturnType<typeof useGetClientConfigLazyQuery>;
export type GetClientConfigQueryResult = Apollo.QueryResult<GetClientConfigQuery, GetClientConfigQueryVariables>;
export const SearchDocument = gql`
    query Search($searchInput: String!, $limit: Int!, $excludedObjectNameSingulars: [String!], $includedObjectNameSingulars: [String!], $filter: ObjectRecordFilterInput) {
  search(
    searchInput: $searchInput
    limit: $limit
    excludedObjectNameSingulars: $excludedObjectNameSingulars
    includedObjectNameSingulars: $includedObjectNameSingulars
    filter: $filter
  ) {
    recordId
    objectNameSingular
    label
    imageUrl
    tsRankCD
    tsRank
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
export const GetDashboardLinklogsDocument = gql`
    query GetDashboardLinklogs {
  getDashboardLinklogs {
    ...DashboardLinklogsQueryFragment
  }
}
    ${DashboardLinklogsQueryFragmentFragmentDoc}`;

/**
 * __useGetDashboardLinklogsQuery__
 *
 * To run a query within a React component, call `useGetDashboardLinklogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDashboardLinklogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDashboardLinklogsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDashboardLinklogsQuery(baseOptions?: Apollo.QueryHookOptions<GetDashboardLinklogsQuery, GetDashboardLinklogsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDashboardLinklogsQuery, GetDashboardLinklogsQueryVariables>(GetDashboardLinklogsDocument, options);
      }
export function useGetDashboardLinklogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDashboardLinklogsQuery, GetDashboardLinklogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDashboardLinklogsQuery, GetDashboardLinklogsQueryVariables>(GetDashboardLinklogsDocument, options);
        }
export type GetDashboardLinklogsQueryHookResult = ReturnType<typeof useGetDashboardLinklogsQuery>;
export type GetDashboardLinklogsLazyQueryHookResult = ReturnType<typeof useGetDashboardLinklogsLazyQuery>;
export type GetDashboardLinklogsQueryResult = Apollo.QueryResult<GetDashboardLinklogsQuery, GetDashboardLinklogsQueryVariables>;
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
export const CreateInterIntegrationDocument = gql`
    mutation CreateInterIntegration($createInput: CreateInterIntegrationInput!) {
  createInterIntegration(createInput: $createInput) {
    id
    integrationName
    clientId
    clientSecret
    privateKey
    certificate
    expirationDate
    status
    workspace {
      id
    }
  }
}
    `;
export type CreateInterIntegrationMutationFn = Apollo.MutationFunction<CreateInterIntegrationMutation, CreateInterIntegrationMutationVariables>;

/**
 * __useCreateInterIntegrationMutation__
 *
 * To run a mutation, you first call `useCreateInterIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInterIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInterIntegrationMutation, { data, loading, error }] = useCreateInterIntegrationMutation({
 *   variables: {
 *      createInput: // value for 'createInput'
 *   },
 * });
 */
export function useCreateInterIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<CreateInterIntegrationMutation, CreateInterIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateInterIntegrationMutation, CreateInterIntegrationMutationVariables>(CreateInterIntegrationDocument, options);
      }
export type CreateInterIntegrationMutationHookResult = ReturnType<typeof useCreateInterIntegrationMutation>;
export type CreateInterIntegrationMutationResult = Apollo.MutationResult<CreateInterIntegrationMutation>;
export type CreateInterIntegrationMutationOptions = Apollo.BaseMutationOptions<CreateInterIntegrationMutation, CreateInterIntegrationMutationVariables>;
export const ToggleInterIntegrationStatusDocument = gql`
    mutation ToggleInterIntegrationStatus($integrationId: String!) {
  toggleInterIntegrationStatus(integrationId: $integrationId)
}
    `;
export type ToggleInterIntegrationStatusMutationFn = Apollo.MutationFunction<ToggleInterIntegrationStatusMutation, ToggleInterIntegrationStatusMutationVariables>;

/**
 * __useToggleInterIntegrationStatusMutation__
 *
 * To run a mutation, you first call `useToggleInterIntegrationStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleInterIntegrationStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleInterIntegrationStatusMutation, { data, loading, error }] = useToggleInterIntegrationStatusMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *   },
 * });
 */
export function useToggleInterIntegrationStatusMutation(baseOptions?: Apollo.MutationHookOptions<ToggleInterIntegrationStatusMutation, ToggleInterIntegrationStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleInterIntegrationStatusMutation, ToggleInterIntegrationStatusMutationVariables>(ToggleInterIntegrationStatusDocument, options);
      }
export type ToggleInterIntegrationStatusMutationHookResult = ReturnType<typeof useToggleInterIntegrationStatusMutation>;
export type ToggleInterIntegrationStatusMutationResult = Apollo.MutationResult<ToggleInterIntegrationStatusMutation>;
export type ToggleInterIntegrationStatusMutationOptions = Apollo.BaseMutationOptions<ToggleInterIntegrationStatusMutation, ToggleInterIntegrationStatusMutationVariables>;
export const UpdateInterIntegrationDocument = gql`
    mutation UpdateInterIntegration($updateInput: UpdateInterIntegrationInput!) {
  updateInterIntegration(updateInput: $updateInput) {
    id
    integrationName
    clientId
    clientSecret
    privateKey
    certificate
    expirationDate
    status
  }
}
    `;
export type UpdateInterIntegrationMutationFn = Apollo.MutationFunction<UpdateInterIntegrationMutation, UpdateInterIntegrationMutationVariables>;

/**
 * __useUpdateInterIntegrationMutation__
 *
 * To run a mutation, you first call `useUpdateInterIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInterIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInterIntegrationMutation, { data, loading, error }] = useUpdateInterIntegrationMutation({
 *   variables: {
 *      updateInput: // value for 'updateInput'
 *   },
 * });
 */
export function useUpdateInterIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateInterIntegrationMutation, UpdateInterIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateInterIntegrationMutation, UpdateInterIntegrationMutationVariables>(UpdateInterIntegrationDocument, options);
      }
export type UpdateInterIntegrationMutationHookResult = ReturnType<typeof useUpdateInterIntegrationMutation>;
export type UpdateInterIntegrationMutationResult = Apollo.MutationResult<UpdateInterIntegrationMutation>;
export type UpdateInterIntegrationMutationOptions = Apollo.BaseMutationOptions<UpdateInterIntegrationMutation, UpdateInterIntegrationMutationVariables>;
export const InterIntegrationsByWorkspaceDocument = gql`
    query InterIntegrationsByWorkspace($workspaceId: String!) {
  interIntegrationsByWorkspace(workspaceId: $workspaceId) {
    id
    integrationName
    clientId
    clientSecret
    privateKey
    certificate
    status
    expirationDate
    workspace {
      id
    }
  }
}
    `;

/**
 * __useInterIntegrationsByWorkspaceQuery__
 *
 * To run a query within a React component, call `useInterIntegrationsByWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useInterIntegrationsByWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInterIntegrationsByWorkspaceQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useInterIntegrationsByWorkspaceQuery(baseOptions: Apollo.QueryHookOptions<InterIntegrationsByWorkspaceQuery, InterIntegrationsByWorkspaceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InterIntegrationsByWorkspaceQuery, InterIntegrationsByWorkspaceQueryVariables>(InterIntegrationsByWorkspaceDocument, options);
      }
export function useInterIntegrationsByWorkspaceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InterIntegrationsByWorkspaceQuery, InterIntegrationsByWorkspaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InterIntegrationsByWorkspaceQuery, InterIntegrationsByWorkspaceQueryVariables>(InterIntegrationsByWorkspaceDocument, options);
        }
export type InterIntegrationsByWorkspaceQueryHookResult = ReturnType<typeof useInterIntegrationsByWorkspaceQuery>;
export type InterIntegrationsByWorkspaceLazyQueryHookResult = ReturnType<typeof useInterIntegrationsByWorkspaceLazyQuery>;
export type InterIntegrationsByWorkspaceQueryResult = Apollo.QueryResult<InterIntegrationsByWorkspaceQuery, InterIntegrationsByWorkspaceQueryVariables>;
export const CreateWhatsappIntegrationDocument = gql`
    mutation CreateWhatsappIntegration($createInput: CreateWhatsappIntegrationInput!) {
  createWhatsappIntegration(createInput: $createInput) {
    id
    label
    phoneId
    businessAccountId
    accessToken
    appId
    appKey
    disabled
    workspace {
      id
    }
  }
}
    `;
export type CreateWhatsappIntegrationMutationFn = Apollo.MutationFunction<CreateWhatsappIntegrationMutation, CreateWhatsappIntegrationMutationVariables>;

/**
 * __useCreateWhatsappIntegrationMutation__
 *
 * To run a mutation, you first call `useCreateWhatsappIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWhatsappIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWhatsappIntegrationMutation, { data, loading, error }] = useCreateWhatsappIntegrationMutation({
 *   variables: {
 *      createInput: // value for 'createInput'
 *   },
 * });
 */
export function useCreateWhatsappIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<CreateWhatsappIntegrationMutation, CreateWhatsappIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWhatsappIntegrationMutation, CreateWhatsappIntegrationMutationVariables>(CreateWhatsappIntegrationDocument, options);
      }
export type CreateWhatsappIntegrationMutationHookResult = ReturnType<typeof useCreateWhatsappIntegrationMutation>;
export type CreateWhatsappIntegrationMutationResult = Apollo.MutationResult<CreateWhatsappIntegrationMutation>;
export type CreateWhatsappIntegrationMutationOptions = Apollo.BaseMutationOptions<CreateWhatsappIntegrationMutation, CreateWhatsappIntegrationMutationVariables>;
export const ToggleWhatsappIntegrationStatusDocument = gql`
    mutation ToggleWhatsappIntegrationStatus($integrationId: String!) {
  toggleWhatsappIntegrationStatus(integrationId: $integrationId)
}
    `;
export type ToggleWhatsappIntegrationStatusMutationFn = Apollo.MutationFunction<ToggleWhatsappIntegrationStatusMutation, ToggleWhatsappIntegrationStatusMutationVariables>;

/**
 * __useToggleWhatsappIntegrationStatusMutation__
 *
 * To run a mutation, you first call `useToggleWhatsappIntegrationStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleWhatsappIntegrationStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleWhatsappIntegrationStatusMutation, { data, loading, error }] = useToggleWhatsappIntegrationStatusMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *   },
 * });
 */
export function useToggleWhatsappIntegrationStatusMutation(baseOptions?: Apollo.MutationHookOptions<ToggleWhatsappIntegrationStatusMutation, ToggleWhatsappIntegrationStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleWhatsappIntegrationStatusMutation, ToggleWhatsappIntegrationStatusMutationVariables>(ToggleWhatsappIntegrationStatusDocument, options);
      }
export type ToggleWhatsappIntegrationStatusMutationHookResult = ReturnType<typeof useToggleWhatsappIntegrationStatusMutation>;
export type ToggleWhatsappIntegrationStatusMutationResult = Apollo.MutationResult<ToggleWhatsappIntegrationStatusMutation>;
export type ToggleWhatsappIntegrationStatusMutationOptions = Apollo.BaseMutationOptions<ToggleWhatsappIntegrationStatusMutation, ToggleWhatsappIntegrationStatusMutationVariables>;
export const UpdateWhatsappIntegrationDocument = gql`
    mutation UpdateWhatsappIntegration($updateInput: UpdateWhatsappIntegrationInput!) {
  updateWhatsappIntegration(updateInput: $updateInput) {
    id
    label
    phoneId
    businessAccountId
    accessToken
    appId
    appKey
    disabled
  }
}
    `;
export type UpdateWhatsappIntegrationMutationFn = Apollo.MutationFunction<UpdateWhatsappIntegrationMutation, UpdateWhatsappIntegrationMutationVariables>;

/**
 * __useUpdateWhatsappIntegrationMutation__
 *
 * To run a mutation, you first call `useUpdateWhatsappIntegrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWhatsappIntegrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWhatsappIntegrationMutation, { data, loading, error }] = useUpdateWhatsappIntegrationMutation({
 *   variables: {
 *      updateInput: // value for 'updateInput'
 *   },
 * });
 */
export function useUpdateWhatsappIntegrationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWhatsappIntegrationMutation, UpdateWhatsappIntegrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWhatsappIntegrationMutation, UpdateWhatsappIntegrationMutationVariables>(UpdateWhatsappIntegrationDocument, options);
      }
export type UpdateWhatsappIntegrationMutationHookResult = ReturnType<typeof useUpdateWhatsappIntegrationMutation>;
export type UpdateWhatsappIntegrationMutationResult = Apollo.MutationResult<UpdateWhatsappIntegrationMutation>;
export type UpdateWhatsappIntegrationMutationOptions = Apollo.BaseMutationOptions<UpdateWhatsappIntegrationMutation, UpdateWhatsappIntegrationMutationVariables>;
export const WhatsappIntegrationsByWorkspaceDocument = gql`
    query WhatsappIntegrationsByWorkspace($workspaceId: String!) {
  whatsappIntegrationsByWorkspace(workspaceId: $workspaceId) {
    id
    label
    phoneId
    businessAccountId
    appId
    appKey
    disabled
    sla
    workspace {
      id
    }
  }
}
    `;

/**
 * __useWhatsappIntegrationsByWorkspaceQuery__
 *
 * To run a query within a React component, call `useWhatsappIntegrationsByWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useWhatsappIntegrationsByWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWhatsappIntegrationsByWorkspaceQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useWhatsappIntegrationsByWorkspaceQuery(baseOptions: Apollo.QueryHookOptions<WhatsappIntegrationsByWorkspaceQuery, WhatsappIntegrationsByWorkspaceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WhatsappIntegrationsByWorkspaceQuery, WhatsappIntegrationsByWorkspaceQueryVariables>(WhatsappIntegrationsByWorkspaceDocument, options);
      }
export function useWhatsappIntegrationsByWorkspaceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WhatsappIntegrationsByWorkspaceQuery, WhatsappIntegrationsByWorkspaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WhatsappIntegrationsByWorkspaceQuery, WhatsappIntegrationsByWorkspaceQueryVariables>(WhatsappIntegrationsByWorkspaceDocument, options);
        }
export type WhatsappIntegrationsByWorkspaceQueryHookResult = ReturnType<typeof useWhatsappIntegrationsByWorkspaceQuery>;
export type WhatsappIntegrationsByWorkspaceLazyQueryHookResult = ReturnType<typeof useWhatsappIntegrationsByWorkspaceLazyQuery>;
export type WhatsappIntegrationsByWorkspaceQueryResult = Apollo.QueryResult<WhatsappIntegrationsByWorkspaceQuery, WhatsappIntegrationsByWorkspaceQueryVariables>;
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
export const CreateAgentDocument = gql`
    mutation CreateAgent($createInput: CreateAgentInput!) {
  createAgent(createInput: $createInput) {
    id
  }
}
    `;
export type CreateAgentMutationFn = Apollo.MutationFunction<CreateAgentMutation, CreateAgentMutationVariables>;

/**
 * __useCreateAgentMutation__
 *
 * To run a mutation, you first call `useCreateAgentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAgentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAgentMutation, { data, loading, error }] = useCreateAgentMutation({
 *   variables: {
 *      createInput: // value for 'createInput'
 *   },
 * });
 */
export function useCreateAgentMutation(baseOptions?: Apollo.MutationHookOptions<CreateAgentMutation, CreateAgentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAgentMutation, CreateAgentMutationVariables>(CreateAgentDocument, options);
      }
export type CreateAgentMutationHookResult = ReturnType<typeof useCreateAgentMutation>;
export type CreateAgentMutationResult = Apollo.MutationResult<CreateAgentMutation>;
export type CreateAgentMutationOptions = Apollo.BaseMutationOptions<CreateAgentMutation, CreateAgentMutationVariables>;
export const ToggleAgentStatusDocument = gql`
    mutation ToggleAgentStatus($agentId: String!) {
  toggleAgentStatus(agentId: $agentId)
}
    `;
export type ToggleAgentStatusMutationFn = Apollo.MutationFunction<ToggleAgentStatusMutation, ToggleAgentStatusMutationVariables>;

/**
 * __useToggleAgentStatusMutation__
 *
 * To run a mutation, you first call `useToggleAgentStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleAgentStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleAgentStatusMutation, { data, loading, error }] = useToggleAgentStatusMutation({
 *   variables: {
 *      agentId: // value for 'agentId'
 *   },
 * });
 */
export function useToggleAgentStatusMutation(baseOptions?: Apollo.MutationHookOptions<ToggleAgentStatusMutation, ToggleAgentStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleAgentStatusMutation, ToggleAgentStatusMutationVariables>(ToggleAgentStatusDocument, options);
      }
export type ToggleAgentStatusMutationHookResult = ReturnType<typeof useToggleAgentStatusMutation>;
export type ToggleAgentStatusMutationResult = Apollo.MutationResult<ToggleAgentStatusMutation>;
export type ToggleAgentStatusMutationOptions = Apollo.BaseMutationOptions<ToggleAgentStatusMutation, ToggleAgentStatusMutationVariables>;
export const UpdateAgentDocument = gql`
    mutation UpdateAgent($updateInput: UpdateAgentInput!) {
  updateAgent(updateInput: $updateInput) {
    id
    isAdmin
    isActive
    workspace {
      id
      displayName
    }
  }
}
    `;
export type UpdateAgentMutationFn = Apollo.MutationFunction<UpdateAgentMutation, UpdateAgentMutationVariables>;

/**
 * __useUpdateAgentMutation__
 *
 * To run a mutation, you first call `useUpdateAgentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAgentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAgentMutation, { data, loading, error }] = useUpdateAgentMutation({
 *   variables: {
 *      updateInput: // value for 'updateInput'
 *   },
 * });
 */
export function useUpdateAgentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAgentMutation, UpdateAgentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAgentMutation, UpdateAgentMutationVariables>(UpdateAgentDocument, options);
      }
export type UpdateAgentMutationHookResult = ReturnType<typeof useUpdateAgentMutation>;
export type UpdateAgentMutationResult = Apollo.MutationResult<UpdateAgentMutation>;
export type UpdateAgentMutationOptions = Apollo.BaseMutationOptions<UpdateAgentMutation, UpdateAgentMutationVariables>;
export const AgentsByWorkspaceDocument = gql`
    query AgentsByWorkspace($workspaceId: String!) {
  agentsByWorkspace(workspaceId: $workspaceId) {
    id
    isAdmin
    isActive
    memberId
    workspace {
      id
      displayName
    }
    sectors {
      id
      name
    }
    inboxes {
      id
      integrationType
      whatsappIntegration {
        id
        label
        phoneId
        disabled
      }
    }
  }
}
    `;

/**
 * __useAgentsByWorkspaceQuery__
 *
 * To run a query within a React component, call `useAgentsByWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useAgentsByWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAgentsByWorkspaceQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useAgentsByWorkspaceQuery(baseOptions: Apollo.QueryHookOptions<AgentsByWorkspaceQuery, AgentsByWorkspaceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AgentsByWorkspaceQuery, AgentsByWorkspaceQueryVariables>(AgentsByWorkspaceDocument, options);
      }
export function useAgentsByWorkspaceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AgentsByWorkspaceQuery, AgentsByWorkspaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AgentsByWorkspaceQuery, AgentsByWorkspaceQueryVariables>(AgentsByWorkspaceDocument, options);
        }
export type AgentsByWorkspaceQueryHookResult = ReturnType<typeof useAgentsByWorkspaceQuery>;
export type AgentsByWorkspaceLazyQueryHookResult = ReturnType<typeof useAgentsByWorkspaceLazyQuery>;
export type AgentsByWorkspaceQueryResult = Apollo.QueryResult<AgentsByWorkspaceQuery, AgentsByWorkspaceQueryVariables>;
export const InboxesByWorkspaceDocument = gql`
    query InboxesByWorkspace($workspaceId: String!) {
  inboxesByWorkspace(workspaceId: $workspaceId) {
    id
    integrationType
    workspace {
      id
      displayName
    }
    whatsappIntegration {
      id
      label
      phoneId
      disabled
    }
  }
}
    `;

/**
 * __useInboxesByWorkspaceQuery__
 *
 * To run a query within a React component, call `useInboxesByWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useInboxesByWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInboxesByWorkspaceQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useInboxesByWorkspaceQuery(baseOptions: Apollo.QueryHookOptions<InboxesByWorkspaceQuery, InboxesByWorkspaceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InboxesByWorkspaceQuery, InboxesByWorkspaceQueryVariables>(InboxesByWorkspaceDocument, options);
      }
export function useInboxesByWorkspaceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InboxesByWorkspaceQuery, InboxesByWorkspaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InboxesByWorkspaceQuery, InboxesByWorkspaceQueryVariables>(InboxesByWorkspaceDocument, options);
        }
export type InboxesByWorkspaceQueryHookResult = ReturnType<typeof useInboxesByWorkspaceQuery>;
export type InboxesByWorkspaceLazyQueryHookResult = ReturnType<typeof useInboxesByWorkspaceLazyQuery>;
export type InboxesByWorkspaceQueryResult = Apollo.QueryResult<InboxesByWorkspaceQuery, InboxesByWorkspaceQueryVariables>;
export const CreateSectorDocument = gql`
    mutation CreateSector($createInput: CreateSectorInput!) {
  createSector(createInput: $createInput) {
    id
  }
}
    `;
export type CreateSectorMutationFn = Apollo.MutationFunction<CreateSectorMutation, CreateSectorMutationVariables>;

/**
 * __useCreateSectorMutation__
 *
 * To run a mutation, you first call `useCreateSectorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSectorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSectorMutation, { data, loading, error }] = useCreateSectorMutation({
 *   variables: {
 *      createInput: // value for 'createInput'
 *   },
 * });
 */
export function useCreateSectorMutation(baseOptions?: Apollo.MutationHookOptions<CreateSectorMutation, CreateSectorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSectorMutation, CreateSectorMutationVariables>(CreateSectorDocument, options);
      }
export type CreateSectorMutationHookResult = ReturnType<typeof useCreateSectorMutation>;
export type CreateSectorMutationResult = Apollo.MutationResult<CreateSectorMutation>;
export type CreateSectorMutationOptions = Apollo.BaseMutationOptions<CreateSectorMutation, CreateSectorMutationVariables>;
export const DeleteSectorDocument = gql`
    mutation DeleteSector($sectorId: String!) {
  deleteSector(sectorId: $sectorId)
}
    `;
export type DeleteSectorMutationFn = Apollo.MutationFunction<DeleteSectorMutation, DeleteSectorMutationVariables>;

/**
 * __useDeleteSectorMutation__
 *
 * To run a mutation, you first call `useDeleteSectorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSectorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSectorMutation, { data, loading, error }] = useDeleteSectorMutation({
 *   variables: {
 *      sectorId: // value for 'sectorId'
 *   },
 * });
 */
export function useDeleteSectorMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSectorMutation, DeleteSectorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSectorMutation, DeleteSectorMutationVariables>(DeleteSectorDocument, options);
      }
export type DeleteSectorMutationHookResult = ReturnType<typeof useDeleteSectorMutation>;
export type DeleteSectorMutationResult = Apollo.MutationResult<DeleteSectorMutation>;
export type DeleteSectorMutationOptions = Apollo.BaseMutationOptions<DeleteSectorMutation, DeleteSectorMutationVariables>;
export const UpdateSectorDocument = gql`
    mutation UpdateSector($updateInput: UpdateSectorInput!) {
  updateSector(updateInput: $updateInput) {
    id
    name
    topics
    icon
    workspace {
      id
      displayName
    }
  }
}
    `;
export type UpdateSectorMutationFn = Apollo.MutationFunction<UpdateSectorMutation, UpdateSectorMutationVariables>;

/**
 * __useUpdateSectorMutation__
 *
 * To run a mutation, you first call `useUpdateSectorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSectorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSectorMutation, { data, loading, error }] = useUpdateSectorMutation({
 *   variables: {
 *      updateInput: // value for 'updateInput'
 *   },
 * });
 */
export function useUpdateSectorMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSectorMutation, UpdateSectorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSectorMutation, UpdateSectorMutationVariables>(UpdateSectorDocument, options);
      }
export type UpdateSectorMutationHookResult = ReturnType<typeof useUpdateSectorMutation>;
export type UpdateSectorMutationResult = Apollo.MutationResult<UpdateSectorMutation>;
export type UpdateSectorMutationOptions = Apollo.BaseMutationOptions<UpdateSectorMutation, UpdateSectorMutationVariables>;
export const SectorsByWorkspaceDocument = gql`
    query SectorsByWorkspace($workspaceId: String!) {
  sectorsByWorkspace(workspaceId: $workspaceId) {
    id
    name
    icon
    topics
    workspace {
      id
      displayName
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useSectorsByWorkspaceQuery__
 *
 * To run a query within a React component, call `useSectorsByWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useSectorsByWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSectorsByWorkspaceQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useSectorsByWorkspaceQuery(baseOptions: Apollo.QueryHookOptions<SectorsByWorkspaceQuery, SectorsByWorkspaceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SectorsByWorkspaceQuery, SectorsByWorkspaceQueryVariables>(SectorsByWorkspaceDocument, options);
      }
export function useSectorsByWorkspaceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SectorsByWorkspaceQuery, SectorsByWorkspaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SectorsByWorkspaceQuery, SectorsByWorkspaceQueryVariables>(SectorsByWorkspaceDocument, options);
        }
export type SectorsByWorkspaceQueryHookResult = ReturnType<typeof useSectorsByWorkspaceQuery>;
export type SectorsByWorkspaceLazyQueryHookResult = ReturnType<typeof useSectorsByWorkspaceLazyQuery>;
export type SectorsByWorkspaceQueryResult = Apollo.QueryResult<SectorsByWorkspaceQuery, SectorsByWorkspaceQueryVariables>;
export const UpdateWhatsappIntegrationServiceLevelDocument = gql`
    mutation UpdateWhatsappIntegrationServiceLevel($integrationId: String!, $sla: Int!) {
  updateWhatsappIntegrationServiceLevel(integrationId: $integrationId, sla: $sla) {
    label
    sla
  }
}
    `;
export type UpdateWhatsappIntegrationServiceLevelMutationFn = Apollo.MutationFunction<UpdateWhatsappIntegrationServiceLevelMutation, UpdateWhatsappIntegrationServiceLevelMutationVariables>;

/**
 * __useUpdateWhatsappIntegrationServiceLevelMutation__
 *
 * To run a mutation, you first call `useUpdateWhatsappIntegrationServiceLevelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWhatsappIntegrationServiceLevelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWhatsappIntegrationServiceLevelMutation, { data, loading, error }] = useUpdateWhatsappIntegrationServiceLevelMutation({
 *   variables: {
 *      integrationId: // value for 'integrationId'
 *      sla: // value for 'sla'
 *   },
 * });
 */
export function useUpdateWhatsappIntegrationServiceLevelMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWhatsappIntegrationServiceLevelMutation, UpdateWhatsappIntegrationServiceLevelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWhatsappIntegrationServiceLevelMutation, UpdateWhatsappIntegrationServiceLevelMutationVariables>(UpdateWhatsappIntegrationServiceLevelDocument, options);
      }
export type UpdateWhatsappIntegrationServiceLevelMutationHookResult = ReturnType<typeof useUpdateWhatsappIntegrationServiceLevelMutation>;
export type UpdateWhatsappIntegrationServiceLevelMutationResult = Apollo.MutationResult<UpdateWhatsappIntegrationServiceLevelMutation>;
export type UpdateWhatsappIntegrationServiceLevelMutationOptions = Apollo.BaseMutationOptions<UpdateWhatsappIntegrationServiceLevelMutation, UpdateWhatsappIntegrationServiceLevelMutationVariables>;
export const CreateTelephonyDocument = gql`
    mutation CreateTelephony($createTelephonyInput: CreateTelephonyInput!) {
  createTelephony(createTelephonyInput: $createTelephonyInput) {
    id
  }
}
    `;
export type CreateTelephonyMutationFn = Apollo.MutationFunction<CreateTelephonyMutation, CreateTelephonyMutationVariables>;

/**
 * __useCreateTelephonyMutation__
 *
 * To run a mutation, you first call `useCreateTelephonyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTelephonyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTelephonyMutation, { data, loading, error }] = useCreateTelephonyMutation({
 *   variables: {
 *      createTelephonyInput: // value for 'createTelephonyInput'
 *   },
 * });
 */
export function useCreateTelephonyMutation(baseOptions?: Apollo.MutationHookOptions<CreateTelephonyMutation, CreateTelephonyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTelephonyMutation, CreateTelephonyMutationVariables>(CreateTelephonyDocument, options);
      }
export type CreateTelephonyMutationHookResult = ReturnType<typeof useCreateTelephonyMutation>;
export type CreateTelephonyMutationResult = Apollo.MutationResult<CreateTelephonyMutation>;
export type CreateTelephonyMutationOptions = Apollo.BaseMutationOptions<CreateTelephonyMutation, CreateTelephonyMutationVariables>;
export const UpdateTelephonyDocument = gql`
    mutation UpdateTelephony($id: ID!, $updateTelephonyInput: UpdateTelephonyInput!) {
  updateTelephony(id: $id, updateTelephonyInput: $updateTelephonyInput) {
    id
    memberId
    numberExtension
  }
}
    `;
export type UpdateTelephonyMutationFn = Apollo.MutationFunction<UpdateTelephonyMutation, UpdateTelephonyMutationVariables>;

/**
 * __useUpdateTelephonyMutation__
 *
 * To run a mutation, you first call `useUpdateTelephonyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTelephonyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTelephonyMutation, { data, loading, error }] = useUpdateTelephonyMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updateTelephonyInput: // value for 'updateTelephonyInput'
 *   },
 * });
 */
export function useUpdateTelephonyMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTelephonyMutation, UpdateTelephonyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTelephonyMutation, UpdateTelephonyMutationVariables>(UpdateTelephonyDocument, options);
      }
export type UpdateTelephonyMutationHookResult = ReturnType<typeof useUpdateTelephonyMutation>;
export type UpdateTelephonyMutationResult = Apollo.MutationResult<UpdateTelephonyMutation>;
export type UpdateTelephonyMutationOptions = Apollo.BaseMutationOptions<UpdateTelephonyMutation, UpdateTelephonyMutationVariables>;
export const GetTelephonyCallFlowsDocument = gql`
    query getTelephonyCallFlows {
  getTelephonyCallFlows {
    fluxo_chamada_id
    fluxo_chamada_nome
  }
}
    `;

/**
 * __useGetTelephonyCallFlowsQuery__
 *
 * To run a query within a React component, call `useGetTelephonyCallFlowsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTelephonyCallFlowsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTelephonyCallFlowsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTelephonyCallFlowsQuery(baseOptions?: Apollo.QueryHookOptions<GetTelephonyCallFlowsQuery, GetTelephonyCallFlowsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTelephonyCallFlowsQuery, GetTelephonyCallFlowsQueryVariables>(GetTelephonyCallFlowsDocument, options);
      }
export function useGetTelephonyCallFlowsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTelephonyCallFlowsQuery, GetTelephonyCallFlowsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTelephonyCallFlowsQuery, GetTelephonyCallFlowsQueryVariables>(GetTelephonyCallFlowsDocument, options);
        }
export type GetTelephonyCallFlowsQueryHookResult = ReturnType<typeof useGetTelephonyCallFlowsQuery>;
export type GetTelephonyCallFlowsLazyQueryHookResult = ReturnType<typeof useGetTelephonyCallFlowsLazyQuery>;
export type GetTelephonyCallFlowsQueryResult = Apollo.QueryResult<GetTelephonyCallFlowsQuery, GetTelephonyCallFlowsQueryVariables>;
export const GetTelephonyPlansDocument = gql`
    query getTelephonyPlans {
  getTelephonyPlans {
    plano_discagem_id
    nome
    cliente_id
  }
}
    `;

/**
 * __useGetTelephonyPlansQuery__
 *
 * To run a query within a React component, call `useGetTelephonyPlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTelephonyPlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTelephonyPlansQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTelephonyPlansQuery(baseOptions?: Apollo.QueryHookOptions<GetTelephonyPlansQuery, GetTelephonyPlansQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTelephonyPlansQuery, GetTelephonyPlansQueryVariables>(GetTelephonyPlansDocument, options);
      }
export function useGetTelephonyPlansLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTelephonyPlansQuery, GetTelephonyPlansQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTelephonyPlansQuery, GetTelephonyPlansQueryVariables>(GetTelephonyPlansDocument, options);
        }
export type GetTelephonyPlansQueryHookResult = ReturnType<typeof useGetTelephonyPlansQuery>;
export type GetTelephonyPlansLazyQueryHookResult = ReturnType<typeof useGetTelephonyPlansLazyQuery>;
export type GetTelephonyPlansQueryResult = Apollo.QueryResult<GetTelephonyPlansQuery, GetTelephonyPlansQueryVariables>;
export const GetTelephonyDidsDocument = gql`
    query getTelephonyDids {
  getTelephonyDids {
    did_id
    numero
  }
}
    `;

/**
 * __useGetTelephonyDidsQuery__
 *
 * To run a query within a React component, call `useGetTelephonyDidsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTelephonyDidsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTelephonyDidsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTelephonyDidsQuery(baseOptions?: Apollo.QueryHookOptions<GetTelephonyDidsQuery, GetTelephonyDidsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTelephonyDidsQuery, GetTelephonyDidsQueryVariables>(GetTelephonyDidsDocument, options);
      }
export function useGetTelephonyDidsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTelephonyDidsQuery, GetTelephonyDidsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTelephonyDidsQuery, GetTelephonyDidsQueryVariables>(GetTelephonyDidsDocument, options);
        }
export type GetTelephonyDidsQueryHookResult = ReturnType<typeof useGetTelephonyDidsQuery>;
export type GetTelephonyDidsLazyQueryHookResult = ReturnType<typeof useGetTelephonyDidsLazyQuery>;
export type GetTelephonyDidsQueryResult = Apollo.QueryResult<GetTelephonyDidsQuery, GetTelephonyDidsQueryVariables>;
export const GetAllExtensionsDocument = gql`
    query getAllExtensions {
  getAllExtensions {
    codigo_incorporacao
    cliente_id
    codigo_area
    nome
    numero
    plano_discagem_id
    ramal_id
    caller_id_externo
    usuario_autenticacao
    numero
  }
}
    `;

/**
 * __useGetAllExtensionsQuery__
 *
 * To run a query within a React component, call `useGetAllExtensionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllExtensionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllExtensionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllExtensionsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllExtensionsQuery, GetAllExtensionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllExtensionsQuery, GetAllExtensionsQueryVariables>(GetAllExtensionsDocument, options);
      }
export function useGetAllExtensionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllExtensionsQuery, GetAllExtensionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllExtensionsQuery, GetAllExtensionsQueryVariables>(GetAllExtensionsDocument, options);
        }
export type GetAllExtensionsQueryHookResult = ReturnType<typeof useGetAllExtensionsQuery>;
export type GetAllExtensionsLazyQueryHookResult = ReturnType<typeof useGetAllExtensionsLazyQuery>;
export type GetAllExtensionsQueryResult = Apollo.QueryResult<GetAllExtensionsQuery, GetAllExtensionsQueryVariables>;
export const GetAllTelephonysDocument = gql`
    query GetAllTelephonys($workspaceId: ID!) {
  findAllTelephony(workspaceId: $workspaceId) {
    id
    memberId
    numberExtension
    workspace {
      id
    }
    createdAt
    updatedAt
    SIPPassword
    areaCode
    blockExtension
    callerExternalID
    destinyMailboxAllCallsOrOffline
    destinyMailboxBusy
    dialingPlan
    emailForMailbox
    enableMailbox
    extensionAllCallsOrOffline
    extensionBusy
    extensionGroup
    extensionName
    externalNumberAllCallsOrOffline
    externalNumberBusy
    fowardAllCalls
    fowardBusyNotAvailable
    fowardOfflineWithoutService
    listenToCalls
    pullCalls
    recordCalls
    type
    advancedFowarding1
    advancedFowarding2
    advancedFowarding3
    advancedFowarding4
    advancedFowarding5
    advancedFowarding1Value
    advancedFowarding2Value
    advancedFowarding3Value
    advancedFowarding4Value
    advancedFowarding5Value
  }
}
    `;

/**
 * __useGetAllTelephonysQuery__
 *
 * To run a query within a React component, call `useGetAllTelephonysQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllTelephonysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllTelephonysQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetAllTelephonysQuery(baseOptions: Apollo.QueryHookOptions<GetAllTelephonysQuery, GetAllTelephonysQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllTelephonysQuery, GetAllTelephonysQueryVariables>(GetAllTelephonysDocument, options);
      }
export function useGetAllTelephonysLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllTelephonysQuery, GetAllTelephonysQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllTelephonysQuery, GetAllTelephonysQueryVariables>(GetAllTelephonysDocument, options);
        }
export type GetAllTelephonysQueryHookResult = ReturnType<typeof useGetAllTelephonysQuery>;
export type GetAllTelephonysLazyQueryHookResult = ReturnType<typeof useGetAllTelephonysLazyQuery>;
export type GetAllTelephonysQueryResult = Apollo.QueryResult<GetAllTelephonysQuery, GetAllTelephonysQueryVariables>;
export const GetTelephonyUrAsDocument = gql`
    query getTelephonyURAs {
  getTelephonyURAs {
    campanha_id
    nome
  }
}
    `;

/**
 * __useGetTelephonyUrAsQuery__
 *
 * To run a query within a React component, call `useGetTelephonyUrAsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTelephonyUrAsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTelephonyUrAsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTelephonyUrAsQuery(baseOptions?: Apollo.QueryHookOptions<GetTelephonyUrAsQuery, GetTelephonyUrAsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTelephonyUrAsQuery, GetTelephonyUrAsQueryVariables>(GetTelephonyUrAsDocument, options);
      }
export function useGetTelephonyUrAsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTelephonyUrAsQuery, GetTelephonyUrAsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTelephonyUrAsQuery, GetTelephonyUrAsQueryVariables>(GetTelephonyUrAsDocument, options);
        }
export type GetTelephonyUrAsQueryHookResult = ReturnType<typeof useGetTelephonyUrAsQuery>;
export type GetTelephonyUrAsLazyQueryHookResult = ReturnType<typeof useGetTelephonyUrAsLazyQuery>;
export type GetTelephonyUrAsQueryResult = Apollo.QueryResult<GetTelephonyUrAsQuery, GetTelephonyUrAsQueryVariables>;
export const GetUserSoftfoneDocument = gql`
    query getUserSoftfone($extNum: String!) {
  getUserSoftfone(extNum: $extNum) {
    codigo_incorporacao
    cliente_id
    codigo_area
    nome
    numero
    plano_discagem_id
    ramal_id
    caller_id_externo
    usuario_autenticacao
    numero
    senha_sip
  }
}
    `;

/**
 * __useGetUserSoftfoneQuery__
 *
 * To run a query within a React component, call `useGetUserSoftfoneQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserSoftfoneQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserSoftfoneQuery({
 *   variables: {
 *      extNum: // value for 'extNum'
 *   },
 * });
 */
export function useGetUserSoftfoneQuery(baseOptions: Apollo.QueryHookOptions<GetUserSoftfoneQuery, GetUserSoftfoneQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserSoftfoneQuery, GetUserSoftfoneQueryVariables>(GetUserSoftfoneDocument, options);
      }
export function useGetUserSoftfoneLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserSoftfoneQuery, GetUserSoftfoneQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserSoftfoneQuery, GetUserSoftfoneQueryVariables>(GetUserSoftfoneDocument, options);
        }
export type GetUserSoftfoneQueryHookResult = ReturnType<typeof useGetUserSoftfoneQuery>;
export type GetUserSoftfoneLazyQueryHookResult = ReturnType<typeof useGetUserSoftfoneLazyQuery>;
export type GetUserSoftfoneQueryResult = Apollo.QueryResult<GetUserSoftfoneQuery, GetUserSoftfoneQueryVariables>;
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
  uploadProfilePicture(file: $file)
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
  uploadWorkspaceLogo(file: $file)
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