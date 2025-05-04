/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Cursor for paging through collections */
  ConnectionCursor: { input: any; output: any; }
  /** Date custom scalar type */
  Date: { input: any; output: any; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
  /** A UUID scalar type */
  UUID: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type ActivateWorkspaceInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
};

export type AdminPanelHealthServiceData = {
  __typename?: 'AdminPanelHealthServiceData';
  description: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  queues?: Maybe<Array<AdminPanelWorkerQueueHealth>>;
  status: AdminPanelHealthServiceStatus;
};

export enum AdminPanelHealthServiceStatus {
  OPERATIONAL = 'OPERATIONAL',
  OUTAGE = 'OUTAGE'
}

export type AdminPanelWorkerQueueHealth = {
  __typename?: 'AdminPanelWorkerQueueHealth';
  id: Scalars['String']['output'];
  queueName: Scalars['String']['output'];
  status: AdminPanelHealthServiceStatus;
};

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

export type ApiKeyToken = {
  __typename?: 'ApiKeyToken';
  token: Scalars['String']['output'];
};

export type AppToken = {
  __typename?: 'AppToken';
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AppTokenEdge = {
  __typename?: 'AppTokenEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the AppToken */
  node: AppToken;
};

export type ApprovedAccessDomain = {
  __typename?: 'ApprovedAccessDomain';
  createdAt: Scalars['DateTime']['output'];
  domain: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isValidated: Scalars['Boolean']['output'];
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
  accessToken: AuthToken;
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

export type AvailableWorkspaceOutput = {
  __typename?: 'AvailableWorkspaceOutput';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  sso: Array<SsoConnection>;
  workspaceUrls: WorkspaceUrls;
};

export type Billing = {
  __typename?: 'Billing';
  billingUrl?: Maybe<Scalars['String']['output']>;
  isBillingEnabled: Scalars['Boolean']['output'];
  trialPeriods: Array<BillingTrialPeriodDto>;
};

export type BillingEndTrialPeriodOutput = {
  __typename?: 'BillingEndTrialPeriodOutput';
  /** Boolean that confirms if a payment method was found */
  hasPaymentMethod: Scalars['Boolean']['output'];
  /** Updated subscription status */
  status?: Maybe<SubscriptionStatus>;
};

export type BillingMeteredProductUsageOutput = {
  __typename?: 'BillingMeteredProductUsageOutput';
  freeTierQuantity: Scalars['Float']['output'];
  freeTrialQuantity: Scalars['Float']['output'];
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
  productKey: BillingProductKey;
  totalCostCents: Scalars['Float']['output'];
  unitPriceCents: Scalars['Float']['output'];
  usageQuantity: Scalars['Float']['output'];
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
  stripePriceId: Scalars['String']['output'];
  unitAmount: Scalars['Float']['output'];
};

export type BillingPriceMeteredDto = {
  __typename?: 'BillingPriceMeteredDTO';
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String']['output'];
  tiers?: Maybe<Array<BillingPriceTierDto>>;
  tiersMode?: Maybe<BillingPriceTiersMode>;
};

export type BillingPriceTierDto = {
  __typename?: 'BillingPriceTierDTO';
  flatAmount?: Maybe<Scalars['Float']['output']>;
  unitAmount?: Maybe<Scalars['Float']['output']>;
  upTo?: Maybe<Scalars['Float']['output']>;
};

/** The different billing price tiers modes */
export enum BillingPriceTiersMode {
  GRADUATED = 'GRADUATED',
  VOLUME = 'VOLUME'
}

export type BillingPriceUnionDto = BillingPriceLicensedDto | BillingPriceMeteredDto;

export type BillingProduct = {
  __typename?: 'BillingProduct';
  description: Scalars['String']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String']['output'];
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
  url?: Maybe<Scalars['String']['output']>;
};

export type BillingSubscription = {
  __typename?: 'BillingSubscription';
  billingSubscriptionItems?: Maybe<Array<BillingSubscriptionItem>>;
  id: Scalars['UUID']['output'];
  interval?: Maybe<SubscriptionInterval>;
  status: SubscriptionStatus;
};

export type BillingSubscriptionItem = {
  __typename?: 'BillingSubscriptionItem';
  billingProduct?: Maybe<BillingProduct>;
  hasReachedCurrentPeriodCap: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
};

export type BillingTrialPeriodDto = {
  __typename?: 'BillingTrialPeriodDTO';
  duration: Scalars['Float']['output'];
  isCreditCardRequired: Scalars['Boolean']['output'];
};

export type BillingUpdateOutput = {
  __typename?: 'BillingUpdateOutput';
  /** Boolean that confirms query was successful */
  success: Scalars['Boolean']['output'];
};

export enum BillingUsageType {
  LICENSED = 'LICENSED',
  METERED = 'METERED'
}

export type BooleanFieldComparison = {
  is?: InputMaybe<Scalars['Boolean']['input']>;
  isNot?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING'
}

export type Captcha = {
  __typename?: 'Captcha';
  provider?: Maybe<CaptchaDriverType>;
  siteKey?: Maybe<Scalars['String']['output']>;
};

export enum CaptchaDriverType {
  GoogleRecaptcha = 'GoogleRecaptcha',
  Turnstile = 'Turnstile'
}

export type ClientConfig = {
  __typename?: 'ClientConfig';
  analyticsEnabled: Scalars['Boolean']['output'];
  api: ApiConfig;
  authProviders: AuthProviders;
  billing: Billing;
  canManageFeatureFlags: Scalars['Boolean']['output'];
  captcha: Captcha;
  chromeExtensionId?: Maybe<Scalars['String']['output']>;
  debugMode: Scalars['Boolean']['output'];
  defaultSubdomain?: Maybe<Scalars['String']['output']>;
  frontDomain: Scalars['String']['output'];
  isAttachmentPreviewEnabled: Scalars['Boolean']['output'];
  isEmailVerificationRequired: Scalars['Boolean']['output'];
  isGoogleCalendarEnabled: Scalars['Boolean']['output'];
  isGoogleMessagingEnabled: Scalars['Boolean']['output'];
  isMicrosoftCalendarEnabled: Scalars['Boolean']['output'];
  isMicrosoftMessagingEnabled: Scalars['Boolean']['output'];
  isMultiWorkspaceEnabled: Scalars['Boolean']['output'];
  publicFeatureFlags: Array<PublicFeatureFlag>;
  sentry: Sentry;
  signInPrefilled: Scalars['Boolean']['output'];
  support: Support;
};

export type ComputeStepOutputSchemaInput = {
  /** Step JSON format */
  step: Scalars['JSON']['input'];
};

export type ConfigVariable = {
  __typename?: 'ConfigVariable';
  description: Scalars['String']['output'];
  isSensitive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

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
  description: Scalars['String']['output'];
  isHiddenOnLoad: Scalars['Boolean']['output'];
  name: ConfigVariablesGroup;
  variables: Array<ConfigVariable>;
};

export type ConfigVariablesOutput = {
  __typename?: 'ConfigVariablesOutput';
  groups: Array<ConfigVariablesGroupData>;
};

export type CreateAppTokenInput = {
  expiresAt: Scalars['DateTime']['input'];
};

export type CreateApprovedAccessDomainInput = {
  domain: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type CreateDraftFromWorkflowVersionInput = {
  /** Workflow ID */
  workflowId: Scalars['String']['input'];
  /** Workflow version ID */
  workflowVersionIdToCopy: Scalars['String']['input'];
};

export type CreateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isCustom?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isNullable?: InputMaybe<Scalars['Boolean']['input']>;
  isRemoteCreation?: InputMaybe<Scalars['Boolean']['input']>;
  isSystem?: InputMaybe<Scalars['Boolean']['input']>;
  isUnique?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  name: Scalars['String']['input'];
  objectMetadataId: Scalars['String']['input'];
  options?: InputMaybe<Scalars['JSON']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  type: FieldMetadataType;
};

export type CreateObjectInput = {
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

export type CreateOneRelationMetadataInput = {
  /** The record to create */
  relationMetadata: CreateRelationInput;
};

export type CreateRelationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fromDescription?: InputMaybe<Scalars['String']['input']>;
  fromIcon?: InputMaybe<Scalars['String']['input']>;
  fromLabel: Scalars['String']['input'];
  fromName: Scalars['String']['input'];
  fromObjectMetadataId: Scalars['String']['input'];
  relationType: RelationMetadataType;
  toDescription?: InputMaybe<Scalars['String']['input']>;
  toIcon?: InputMaybe<Scalars['String']['input']>;
  toLabel: Scalars['String']['input'];
  toName: Scalars['String']['input'];
  toObjectMetadataId: Scalars['String']['input'];
};

export type CreateRemoteServerInput = {
  foreignDataWrapperOptions: Scalars['JSON']['input'];
  foreignDataWrapperType: Scalars['String']['input'];
  label: Scalars['String']['input'];
  schema?: InputMaybe<Scalars['String']['input']>;
  userMappingOptions?: InputMaybe<UserMappingOptions>;
};

export type CreateRoleInput = {
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

export type CreateServerlessFunctionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  timeoutSeconds?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateWorkflowVersionStepInput = {
  /** Next step ID */
  nextStepId?: InputMaybe<Scalars['String']['input']>;
  /** Parent step ID */
  parentStepId?: InputMaybe<Scalars['String']['input']>;
  /** New step type */
  stepType: Scalars['String']['input'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
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

export type CustomDomainRecord = {
  __typename?: 'CustomDomainRecord';
  key: Scalars['String']['output'];
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
  validationType: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type CustomDomainValidRecords = {
  __typename?: 'CustomDomainValidRecords';
  customDomain: Scalars['String']['output'];
  id: Scalars['String']['output'];
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
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  neq?: InputMaybe<Scalars['Date']['input']>;
};

export type DeleteApprovedAccessDomainInput = {
  id: Scalars['String']['input'];
};

export type DeleteOneFieldInput = {
  /** The id of the field to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteOneObjectInput = {
  /** The id of the record to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteOneRelationInput = {
  /** The id of the relation to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteSsoInput = {
  identityProviderId: Scalars['String']['input'];
};

export type DeleteSsoOutput = {
  __typename?: 'DeleteSsoOutput';
  identityProviderId: Scalars['String']['output'];
};

export type DeleteWorkflowVersionStepInput = {
  /** Step to delete ID */
  stepId: Scalars['String']['input'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
};

/** Schema update on a table */
export enum DistantTableUpdate {
  COLUMNS_ADDED = 'COLUMNS_ADDED',
  COLUMNS_DELETED = 'COLUMNS_DELETED',
  COLUMNS_TYPE_CHANGED = 'COLUMNS_TYPE_CHANGED',
  TABLE_DELETED = 'TABLE_DELETED'
}

export type EditSsoInput = {
  id: Scalars['String']['input'];
  status: SsoIdentityProviderStatus;
};

export type EditSsoOutput = {
  __typename?: 'EditSsoOutput';
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type EmailPasswordResetLink = {
  __typename?: 'EmailPasswordResetLink';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type ExecuteServerlessFunctionInput = {
  /** Id of the serverless function to execute */
  id: Scalars['UUID']['input'];
  /** Payload in JSON format */
  payload: Scalars['JSON']['input'];
  /** Version of the serverless function to execute */
  version?: Scalars['String']['input'];
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  id: Scalars['UUID']['output'];
  key: FeatureFlagKey;
  value: Scalars['Boolean']['output'];
  workspaceId: Scalars['String']['output'];
};

export type FeatureFlagDto = {
  __typename?: 'FeatureFlagDTO';
  key: FeatureFlagKey;
  value: Scalars['Boolean']['output'];
};

export enum FeatureFlagKey {
  IsAirtableIntegrationEnabled = 'IsAirtableIntegrationEnabled',
  IsCopilotEnabled = 'IsCopilotEnabled',
  IsCustomDomainEnabled = 'IsCustomDomainEnabled',
  IsJsonFilterEnabled = 'IsJsonFilterEnabled',
  IsNewRelationEnabled = 'IsNewRelationEnabled',
  IsPermissionsV2Enabled = 'IsPermissionsV2Enabled',
  IsPostgreSQLIntegrationEnabled = 'IsPostgreSQLIntegrationEnabled',
  IsStripeIntegrationEnabled = 'IsStripeIntegrationEnabled',
  IsUniqueIndexesEnabled = 'IsUniqueIndexesEnabled',
  IsWorkflowEnabled = 'IsWorkflowEnabled'
}

export type Field = {
  __typename?: 'Field';
  createdAt: Scalars['DateTime']['output'];
  defaultValue?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fromRelationMetadata?: Maybe<RelationMetadata>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  isLabelSyncedWithName?: Maybe<Scalars['Boolean']['output']>;
  isNullable?: Maybe<Scalars['Boolean']['output']>;
  isSystem?: Maybe<Scalars['Boolean']['output']>;
  isUnique?: Maybe<Scalars['Boolean']['output']>;
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  object?: Maybe<Object>;
  options?: Maybe<Scalars['JSON']['output']>;
  relation?: Maybe<Relation>;
  relationDefinition?: Maybe<RelationDefinition>;
  settings?: Maybe<Scalars['JSON']['output']>;
  standardOverrides?: Maybe<StandardOverrides>;
  toRelationMetadata?: Maybe<RelationMetadata>;
  type: FieldMetadataType;
  updatedAt: Scalars['DateTime']['output'];
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
  cursor: Scalars['ConnectionCursor']['output'];
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
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
  workspace: WorkspaceNameAndId;
};

export type FindManyRemoteTablesInput = {
  /** The id of the remote server. */
  id: Scalars['ID']['input'];
  /** Indicates if pending schema updates status should be computed. */
  shouldFetchPendingSchemaUpdates?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FullName = {
  __typename?: 'FullName';
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
};

export type GetAuthorizationUrlForSsoInput = {
  identityProviderId: Scalars['String']['input'];
  workspaceInviteHash?: InputMaybe<Scalars['String']['input']>;
};

export type GetAuthorizationUrlForSsoOutput = {
  __typename?: 'GetAuthorizationUrlForSSOOutput';
  authorizationURL: Scalars['String']['output'];
  id: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type GetLoginTokenFromEmailVerificationTokenOutput = {
  __typename?: 'GetLoginTokenFromEmailVerificationTokenOutput';
  loginToken: AuthToken;
  workspaceUrls: WorkspaceUrls;
};

export type GetServerlessFunctionSourceCodeInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
  /** The version of the function */
  version?: Scalars['String']['input'];
};

export enum HealthIndicatorId {
  app = 'app',
  connectedAccount = 'connectedAccount',
  database = 'database',
  redis = 'redis',
  worker = 'worker'
}

export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']['input']>;
  gt?: InputMaybe<Scalars['ID']['input']>;
  gte?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<Array<Scalars['ID']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['ID']['input']>;
  lte?: InputMaybe<Scalars['ID']['input']>;
  neq?: InputMaybe<Scalars['ID']['input']>;
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

export type Index = {
  __typename?: 'Index';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  indexFieldMetadatas: IndexIndexFieldMetadatasConnection;
  indexType: IndexType;
  indexWhereClause?: Maybe<Scalars['String']['output']>;
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  isUnique: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  objectMetadata: IndexObjectMetadataConnection;
  updatedAt: Scalars['DateTime']['output'];
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
  updatedAt: Scalars['DateTime']['output'];
};

export type IndexFieldEdge = {
  __typename?: 'IndexFieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
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
  success: Scalars['Boolean']['output'];
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

export type LoginToken = {
  __typename?: 'LoginToken';
  loginToken: AuthToken;
};

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
  SUBJECT = 'SUBJECT'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateWorkflowVersion: Scalars['Boolean']['output'];
  activateWorkspace: Workspace;
  authorizeApp: AuthorizeApp;
  checkCustomDomainValidRecords?: Maybe<CustomDomainValidRecords>;
  checkoutSession: BillingSessionOutput;
  computeStepOutputSchema: Scalars['JSON']['output'];
  createApprovedAccessDomain: ApprovedAccessDomain;
  createDraftFromWorkflowVersion: WorkflowVersion;
  createOIDCIdentityProvider: SetupSsoOutput;
  createOneAppToken: AppToken;
  createOneField: Field;
  createOneObject: Object;
  createOneRelationMetadata: RelationMetadata;
  createOneRemoteServer: RemoteServer;
  createOneRole: Role;
  createOneServerlessFunction: ServerlessFunction;
  createSAMLIdentityProvider: SetupSsoOutput;
  createWorkflowVersionStep: WorkflowAction;
  deactivateWorkflowVersion: Scalars['Boolean']['output'];
  deleteApprovedAccessDomain: Scalars['Boolean']['output'];
  deleteCurrentWorkspace: Workspace;
  deleteOneField: Field;
  deleteOneObject: Object;
  deleteOneRelation: RelationMetadata;
  deleteOneRemoteServer: RemoteServer;
  deleteOneRole: Scalars['String']['output'];
  deleteOneServerlessFunction: ServerlessFunction;
  deleteSSOIdentityProvider: DeleteSsoOutput;
  deleteUser: User;
  deleteWorkflowVersionStep: WorkflowAction;
  deleteWorkspaceInvitation: Scalars['String']['output'];
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
  renewToken: AuthTokens;
  resendEmailVerificationToken: ResendEmailVerificationTokenOutput;
  resendWorkspaceInvitation: SendInvitationsOutput;
  runWorkflowVersion: WorkflowRun;
  sendInvitations: SendInvitationsOutput;
  signUp: SignUpOutput;
  signUpInNewWorkspace: SignUpOutput;
  skipSyncEmailOnboardingStep: OnboardingStepSuccess;
  submitFormStep: Scalars['Boolean']['output'];
  switchToYearlyInterval: BillingUpdateOutput;
  syncRemoteTable: RemoteTable;
  syncRemoteTableSchemaChanges: RemoteTable;
  track: Analytics;
  trackAnalytics: Analytics;
  unsyncRemoteTable: RemoteTable;
  updateLabPublicFeatureFlag: FeatureFlagDto;
  updateOneField: Field;
  updateOneObject: Object;
  updateOneRemoteServer: RemoteServer;
  updateOneRole: Role;
  updateOneServerlessFunction: ServerlessFunction;
  updatePasswordViaResetToken: InvalidatePassword;
  updateWorkflowRunStep: WorkflowAction;
  updateWorkflowVersionStep: WorkflowAction;
  updateWorkspace: Workspace;
  updateWorkspaceFeatureFlag: Scalars['Boolean']['output'];
  updateWorkspaceMemberRole: WorkspaceMember;
  uploadFile: Scalars['String']['output'];
  uploadImage: Scalars['String']['output'];
  uploadProfilePicture: Scalars['String']['output'];
  uploadWorkspaceLogo: Scalars['String']['output'];
  upsertObjectPermissions: Array<ObjectPermission>;
  upsertSettingPermissions: Array<SettingPermission>;
  userLookupAdminPanel: UserLookup;
  validateApprovedAccessDomain: ApprovedAccessDomain;
};


export type MutationActivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['String']['input'];
};


export type MutationActivateWorkspaceArgs = {
  data: ActivateWorkspaceInput;
};


export type MutationAuthorizeAppArgs = {
  clientId: Scalars['String']['input'];
  codeChallenge?: InputMaybe<Scalars['String']['input']>;
  redirectUrl: Scalars['String']['input'];
};


export type MutationCheckoutSessionArgs = {
  plan?: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
  requirePaymentMethod?: Scalars['Boolean']['input'];
  successUrlPath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationComputeStepOutputSchemaArgs = {
  input: ComputeStepOutputSchemaInput;
};


export type MutationCreateApprovedAccessDomainArgs = {
  input: CreateApprovedAccessDomainInput;
};


export type MutationCreateDraftFromWorkflowVersionArgs = {
  input: CreateDraftFromWorkflowVersionInput;
};


export type MutationCreateOidcIdentityProviderArgs = {
  input: SetupOidcSsoInput;
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


export type MutationCreateOneRelationMetadataArgs = {
  input: CreateOneRelationMetadataInput;
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


export type MutationCreateWorkflowVersionStepArgs = {
  input: CreateWorkflowVersionStepInput;
};


export type MutationDeactivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['String']['input'];
};


export type MutationDeleteApprovedAccessDomainArgs = {
  input: DeleteApprovedAccessDomainInput;
};


export type MutationDeleteOneFieldArgs = {
  input: DeleteOneFieldInput;
};


export type MutationDeleteOneObjectArgs = {
  input: DeleteOneObjectInput;
};


export type MutationDeleteOneRelationArgs = {
  input: DeleteOneRelationInput;
};


export type MutationDeleteOneRemoteServerArgs = {
  input: RemoteServerIdInput;
};


export type MutationDeleteOneRoleArgs = {
  roleId: Scalars['String']['input'];
};


export type MutationDeleteOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type MutationDeleteSsoIdentityProviderArgs = {
  input: DeleteSsoInput;
};


export type MutationDeleteWorkflowVersionStepArgs = {
  input: DeleteWorkflowVersionStepInput;
};


export type MutationDeleteWorkspaceInvitationArgs = {
  appTokenId: Scalars['String']['input'];
};


export type MutationEditSsoIdentityProviderArgs = {
  input: EditSsoInput;
};


export type MutationEmailPasswordResetLinkArgs = {
  email: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationExecuteOneServerlessFunctionArgs = {
  input: ExecuteServerlessFunctionInput;
};


export type MutationGenerateApiKeyTokenArgs = {
  apiKeyId: Scalars['String']['input'];
  expiresAt: Scalars['String']['input'];
};


export type MutationGetAuthTokensFromLoginTokenArgs = {
  loginToken: Scalars['String']['input'];
};


export type MutationGetAuthorizationUrlForSsoArgs = {
  input: GetAuthorizationUrlForSsoInput;
};


export type MutationGetLoginTokenFromCredentialsArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationGetLoginTokenFromEmailVerificationTokenArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  emailVerificationToken: Scalars['String']['input'];
};


export type MutationImpersonateArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationPublishServerlessFunctionArgs = {
  input: PublishServerlessFunctionInput;
};


export type MutationRenewTokenArgs = {
  appToken: Scalars['String']['input'];
};


export type MutationResendEmailVerificationTokenArgs = {
  email: Scalars['String']['input'];
};


export type MutationResendWorkspaceInvitationArgs = {
  appTokenId: Scalars['String']['input'];
};


export type MutationRunWorkflowVersionArgs = {
  input: RunWorkflowVersionInput;
};


export type MutationSendInvitationsArgs = {
  emails: Array<Scalars['String']['input']>;
};


export type MutationSignUpArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  workspaceId?: InputMaybe<Scalars['String']['input']>;
  workspaceInviteHash?: InputMaybe<Scalars['String']['input']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']['input']>;
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


export type MutationTrackArgs = {
  action: Scalars['String']['input'];
  payload: Scalars['JSON']['input'];
};


export type MutationTrackAnalyticsArgs = {
  event?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  properties?: InputMaybe<Scalars['JSON']['input']>;
  type: AnalyticsType;
};


export type MutationUnsyncRemoteTableArgs = {
  input: RemoteTableInput;
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
  newPassword: Scalars['String']['input'];
  passwordResetToken: Scalars['String']['input'];
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
  featureFlag: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationUpdateWorkspaceMemberRoleArgs = {
  roleId: Scalars['String']['input'];
  workspaceMemberId: Scalars['String']['input'];
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload']['input'];
  fileFolder?: InputMaybe<FileFolder>;
};


export type MutationUploadImageArgs = {
  file: Scalars['Upload']['input'];
  fileFolder?: InputMaybe<FileFolder>;
};


export type MutationUploadProfilePictureArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadWorkspaceLogoArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUpsertObjectPermissionsArgs = {
  upsertObjectPermissionsInput: UpsertObjectPermissionsInput;
};


export type MutationUpsertSettingPermissionsArgs = {
  upsertSettingPermissionsInput: UpsertSettingPermissionsInput;
};


export type MutationUserLookupAdminPanelArgs = {
  userIdentifier: Scalars['String']['input'];
};


export type MutationValidateApprovedAccessDomainArgs = {
  input: ValidateApprovedAccessDomainInput;
};

export type Object = {
  __typename?: 'Object';
  createdAt: Scalars['DateTime']['output'];
  dataSourceId: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  duplicateCriteria?: Maybe<Array<Array<Scalars['String']['output']>>>;
  fields: ObjectFieldsConnection;
  fieldsList: Array<Field>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  imageIdentifierFieldMetadataId?: Maybe<Scalars['String']['output']>;
  indexMetadatas: ObjectIndexMetadatasConnection;
  isActive: Scalars['Boolean']['output'];
  isCustom: Scalars['Boolean']['output'];
  isLabelSyncedWithName: Scalars['Boolean']['output'];
  isRemote: Scalars['Boolean']['output'];
  isSearchable: Scalars['Boolean']['output'];
  isSystem: Scalars['Boolean']['output'];
  labelIdentifierFieldMetadataId?: Maybe<Scalars['String']['output']>;
  labelPlural: Scalars['String']['output'];
  labelSingular: Scalars['String']['output'];
  namePlural: Scalars['String']['output'];
  nameSingular: Scalars['String']['output'];
  shortcut?: Maybe<Scalars['String']['output']>;
  standardOverrides?: Maybe<ObjectStandardOverrides>;
  updatedAt: Scalars['DateTime']['output'];
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
  canDestroyObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canReadObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canSoftDeleteObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canUpdateObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  objectMetadataId: Scalars['String']['output'];
  roleId: Scalars['String']['output'];
};

export type ObjectPermissionInput = {
  canDestroyObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canReadObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canSoftDeleteObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  objectMetadataId: Scalars['String']['input'];
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
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  labelPlural?: Maybe<Scalars['String']['output']>;
  labelSingular?: Maybe<Scalars['String']['output']>;
  translations?: Maybe<Scalars['JSON']['output']>;
};

export type OnDbEventDto = {
  __typename?: 'OnDbEventDTO';
  action: DatabaseEventAction;
  eventDate: Scalars['DateTime']['output'];
  objectNameSingular: Scalars['String']['output'];
  record: Scalars['JSON']['output'];
  updatedFields?: Maybe<Array<Scalars['String']['output']>>;
};

export type OnDbEventInput = {
  action?: InputMaybe<DatabaseEventAction>;
  objectNameSingular?: InputMaybe<Scalars['String']['input']>;
  recordId?: InputMaybe<Scalars['String']['input']>;
};

/** Onboarding status */
export enum OnboardingStatus {
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
  success: Scalars['Boolean']['output'];
};

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

export enum PermissionsOnAllObjectRecords {
  DESTROY_ALL_OBJECT_RECORDS = 'DESTROY_ALL_OBJECT_RECORDS',
  READ_ALL_OBJECT_RECORDS = 'READ_ALL_OBJECT_RECORDS',
  SOFT_DELETE_ALL_OBJECT_RECORDS = 'SOFT_DELETE_ALL_OBJECT_RECORDS',
  UPDATE_ALL_OBJECT_RECORDS = 'UPDATE_ALL_OBJECT_RECORDS'
}

export type PostgresCredentials = {
  __typename?: 'PostgresCredentials';
  id: Scalars['UUID']['output'];
  password: Scalars['String']['output'];
  user: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type PublicFeatureFlag = {
  __typename?: 'PublicFeatureFlag';
  key: FeatureFlagKey;
  metadata: PublicFeatureFlagMetadata;
};

export type PublicFeatureFlagMetadata = {
  __typename?: 'PublicFeatureFlagMetadata';
  description: Scalars['String']['output'];
  imagePath: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type PublicWorkspaceDataOutput = {
  __typename?: 'PublicWorkspaceDataOutput';
  authProviders: AuthProviders;
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  workspaceUrls: WorkspaceUrls;
};

export type PublishServerlessFunctionInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  billingPortalSession: BillingSessionOutput;
  checkUserExists: UserExistsOutput;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  clientConfig: ClientConfig;
  currentUser: User;
  currentWorkspace: Workspace;
  field: Field;
  fields: FieldConnection;
  findDistantTablesWithStatus: Array<RemoteTable>;
  findManyRemoteServersByType: Array<RemoteServer>;
  findManyServerlessFunctions: Array<ServerlessFunction>;
  findOneRemoteServerById: RemoteServer;
  findOneServerlessFunction: ServerlessFunction;
  findWorkspaceFromInviteHash: Workspace;
  findWorkspaceInvitations: Array<WorkspaceInvitation>;
  getApprovedAccessDomains: Array<ApprovedAccessDomain>;
  getAvailablePackages: Scalars['JSON']['output'];
  getConfigVariablesGrouped: ConfigVariablesOutput;
  getIndicatorHealthStatus: AdminPanelHealthServiceData;
  getMeteredProductsUsage: Array<BillingMeteredProductUsageOutput>;
  getPostgresCredentials?: Maybe<PostgresCredentials>;
  getPublicWorkspaceDataByDomain: PublicWorkspaceDataOutput;
  getQueueMetrics: QueueMetricsData;
  getRoles: Array<Role>;
  getSSOIdentityProviders: Array<FindAvailableSsoidpOutput>;
  getServerlessFunctionSourceCode?: Maybe<Scalars['JSON']['output']>;
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
  relationMetadata: RelationMetadataConnection;
  search: Array<SearchRecord>;
  validatePasswordResetToken: ValidatePasswordResetToken;
  versionInfo: VersionInfo;
};


export type QueryBillingPortalSessionArgs = {
  returnUrlPath?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCheckUserExistsArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String']['input'];
};


export type QueryFieldArgs = {
  id: Scalars['UUID']['input'];
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


export type QueryFindOneRemoteServerByIdArgs = {
  input: RemoteServerIdInput;
};


export type QueryFindOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String']['input'];
};


export type QueryGetAvailablePackagesArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryGetIndicatorHealthStatusArgs = {
  indicatorId: HealthIndicatorId;
};


export type QueryGetQueueMetricsArgs = {
  queueName: Scalars['String']['input'];
  timeRange?: InputMaybe<QueueMetricsTimeRange>;
};


export type QueryGetServerlessFunctionSourceCodeArgs = {
  input: GetServerlessFunctionSourceCodeInput;
};


export type QueryGetTimelineCalendarEventsFromCompanyIdArgs = {
  companyId: Scalars['UUID']['input'];
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


export type QueryGetTimelineThreadsFromPersonIdArgs = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  personId: Scalars['UUID']['input'];
};


export type QueryIndexArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryIndexMetadatasArgs = {
  filter?: IndexFilter;
  paging?: CursorPaging;
};


export type QueryObjectArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryObjectsArgs = {
  filter?: ObjectFilter;
  paging?: CursorPaging;
};


export type QueryRelationMetadataArgs = {
  paging?: CursorPaging;
};


export type QuerySearchArgs = {
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']['input']>>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']['input']>>;
  limit: Scalars['Int']['input'];
  searchInput: Scalars['String']['input'];
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String']['input'];
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
  relationId: Scalars['UUID']['output'];
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
  createdAt: Scalars['DateTime']['output'];
  fromFieldMetadataId: Scalars['String']['output'];
  fromObjectMetadata: Object;
  fromObjectMetadataId: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  relationType: RelationMetadataType;
  toFieldMetadataId: Scalars['String']['output'];
  toObjectMetadata: Object;
  toObjectMetadataId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  cursor: Scalars['ConnectionCursor']['output'];
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
  createdAt: Scalars['DateTime']['output'];
  foreignDataWrapperId: Scalars['ID']['output'];
  foreignDataWrapperOptions?: Maybe<Scalars['JSON']['output']>;
  foreignDataWrapperType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  schema?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userMappingOptions?: Maybe<UserMappingOptionsUser>;
};

export type RemoteServerIdInput = {
  /** The id of the record. */
  id: Scalars['ID']['input'];
};

export type RemoteServerTypeInput = {
  foreignDataWrapperType: Scalars['String']['input'];
};

export type RemoteTable = {
  __typename?: 'RemoteTable';
  id?: Maybe<Scalars['UUID']['output']>;
  name: Scalars['String']['output'];
  schema?: Maybe<Scalars['String']['output']>;
  schemaPendingUpdates?: Maybe<Array<DistantTableUpdate>>;
  status: RemoteTableStatus;
};

export type RemoteTableInput = {
  name: Scalars['String']['input'];
  remoteServerId: Scalars['ID']['input'];
};

/** Status of the table */
export enum RemoteTableStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  SYNCED = 'SYNCED'
}

export type ResendEmailVerificationTokenOutput = {
  __typename?: 'ResendEmailVerificationTokenOutput';
  success: Scalars['Boolean']['output'];
};

export type Role = {
  __typename?: 'Role';
  canDestroyAllObjectRecords: Scalars['Boolean']['output'];
  canReadAllObjectRecords: Scalars['Boolean']['output'];
  canSoftDeleteAllObjectRecords: Scalars['Boolean']['output'];
  canUpdateAllObjectRecords: Scalars['Boolean']['output'];
  canUpdateAllSettings: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isEditable: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  objectPermissions?: Maybe<Array<ObjectPermission>>;
  settingPermissions?: Maybe<Array<SettingPermission>>;
  workspaceMembers: Array<WorkspaceMember>;
};

export type RunWorkflowVersionInput = {
  /** Execution result in JSON format */
  payload?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
};

export type SsoConnection = {
  __typename?: 'SSOConnection';
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type SsoIdentityProvider = {
  __typename?: 'SSOIdentityProvider';
  id: Scalars['String']['output'];
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

export type SearchRecord = {
  __typename?: 'SearchRecord';
  imageUrl?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  objectNameSingular: Scalars['String']['output'];
  recordId: Scalars['String']['output'];
  tsRank: Scalars['Float']['output'];
  tsRankCD: Scalars['Float']['output'];
};

export type SendInvitationsOutput = {
  __typename?: 'SendInvitationsOutput';
  errors: Array<Scalars['String']['output']>;
  result: Array<WorkspaceInvitation>;
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type Sentry = {
  __typename?: 'Sentry';
  dsn?: Maybe<Scalars['String']['output']>;
  environment?: Maybe<Scalars['String']['output']>;
  release?: Maybe<Scalars['String']['output']>;
};

export type ServerlessFunction = {
  __typename?: 'ServerlessFunction';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  latestVersion?: Maybe<Scalars['String']['output']>;
  latestVersionInputSchema?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  publishedVersions: Array<Scalars['String']['output']>;
  runtime: Scalars['String']['output'];
  syncStatus: ServerlessFunctionSyncStatus;
  timeoutSeconds: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ServerlessFunctionExecutionResult = {
  __typename?: 'ServerlessFunctionExecutionResult';
  /** Execution result in JSON format */
  data?: Maybe<Scalars['JSON']['output']>;
  /** Execution duration in milliseconds */
  duration: Scalars['Float']['output'];
  /** Execution error in JSON format */
  error?: Maybe<Scalars['JSON']['output']>;
  /** Execution Logs */
  logs: Scalars['String']['output'];
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
  id: Scalars['ID']['input'];
};

/** SyncStatus of the serverlessFunction */
export enum ServerlessFunctionSyncStatus {
  BUILDING = 'BUILDING',
  NOT_READY = 'NOT_READY',
  READY = 'READY'
}

export type SettingPermission = {
  __typename?: 'SettingPermission';
  id: Scalars['String']['output'];
  roleId: Scalars['String']['output'];
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
  clientID: Scalars['String']['input'];
  clientSecret: Scalars['String']['input'];
  issuer: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type SetupSamlSsoInput = {
  certificate: Scalars['String']['input'];
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  issuer: Scalars['String']['input'];
  name: Scalars['String']['input'];
  ssoURL: Scalars['String']['input'];
};

export type SetupSsoOutput = {
  __typename?: 'SetupSsoOutput';
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
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
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  translations?: Maybe<Scalars['JSON']['output']>;
};

export type SubmitFormStepInput = {
  /** Form response in JSON format */
  response: Scalars['JSON']['input'];
  /** Workflow version ID */
  stepId: Scalars['String']['input'];
  /** Workflow run ID */
  workflowRunId: Scalars['String']['input'];
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
  supportDriver: Scalars['String']['output'];
  supportFrontChatId?: Maybe<Scalars['String']['output']>;
};

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

export type TimelineCalendarEvent = {
  __typename?: 'TimelineCalendarEvent';
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

export type TimelineCalendarEventsWithTotal = {
  __typename?: 'TimelineCalendarEventsWithTotal';
  timelineCalendarEvents: Array<TimelineCalendarEvent>;
  totalNumberOfCalendarEvents: Scalars['Int']['output'];
};

export type TimelineThread = {
  __typename?: 'TimelineThread';
  firstParticipant: TimelineThreadParticipant;
  id: Scalars['UUID']['output'];
  lastMessageBody: Scalars['String']['output'];
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

export type TimelineThreadsWithTotal = {
  __typename?: 'TimelineThreadsWithTotal';
  timelineThreads: Array<TimelineThread>;
  totalNumberOfThreads: Scalars['Int']['output'];
};

export type TransientToken = {
  __typename?: 'TransientToken';
  transientToken: AuthToken;
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

export type UpdateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isNullable?: InputMaybe<Scalars['Boolean']['input']>;
  isSystem?: InputMaybe<Scalars['Boolean']['input']>;
  isUnique?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  options?: InputMaybe<Scalars['JSON']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateLabPublicFeatureFlagInput = {
  publicFeatureFlag: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};

export type UpdateObjectPayload = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  imageIdentifierFieldMetadataId?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  labelIdentifierFieldMetadataId?: InputMaybe<Scalars['String']['input']>;
  labelPlural?: InputMaybe<Scalars['String']['input']>;
  labelSingular?: InputMaybe<Scalars['String']['input']>;
  namePlural?: InputMaybe<Scalars['String']['input']>;
  nameSingular?: InputMaybe<Scalars['String']['input']>;
  shortcut?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOneFieldMetadataInput = {
  /** The id of the record to update */
  id: Scalars['UUID']['input'];
  /** The record to update */
  update: UpdateFieldInput;
};

export type UpdateOneObjectInput = {
  /** The id of the object to update */
  id: Scalars['UUID']['input'];
  update: UpdateObjectPayload;
};

export type UpdateRemoteServerInput = {
  foreignDataWrapperOptions?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['String']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  schema?: InputMaybe<Scalars['String']['input']>;
  userMappingOptions?: InputMaybe<UserMappingOptionsUpdateInput>;
};

export type UpdateRoleInput = {
  /** The id of the role to update */
  id: Scalars['UUID']['input'];
  update: UpdateRolePayload;
};

export type UpdateRolePayload = {
  canDestroyAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canReadAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canSoftDeleteAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllSettings?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateServerlessFunctionInput = {
  code: Scalars['JSON']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  /** Id of the serverless function to execute */
  id: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
  timeoutSeconds?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateWorkflowRunStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON']['input'];
  /** Workflow run ID */
  workflowRunId: Scalars['String']['input'];
};

export type UpdateWorkflowVersionStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON']['input'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
};

export type UpdateWorkspaceInput = {
  allowImpersonation?: InputMaybe<Scalars['Boolean']['input']>;
  customDomain?: InputMaybe<Scalars['String']['input']>;
  defaultRoleId?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  inviteHash?: InputMaybe<Scalars['String']['input']>;
  isGoogleAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isMicrosoftAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPasswordAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPublicInviteLinkEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  subdomain?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertObjectPermissionsInput = {
  objectPermissions: Array<ObjectPermissionInput>;
  roleId: Scalars['String']['input'];
};

export type UpsertSettingPermissionsInput = {
  roleId: Scalars['String']['input'];
  settingPermissionKeys: Array<SettingPermissionType>;
};

export type User = {
  __typename?: 'User';
  canAccessFullAdminPanel: Scalars['Boolean']['output'];
  canImpersonate: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentUserWorkspace?: Maybe<UserWorkspace>;
  currentWorkspace?: Maybe<Workspace>;
  defaultAvatarUrl?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  disabled?: Maybe<Scalars['Boolean']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  onboardingStatus?: Maybe<OnboardingStatus>;
  passwordHash?: Maybe<Scalars['String']['output']>;
  supportUserHash?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userVars: Scalars['JSONObject']['output'];
  workspaceMember?: Maybe<WorkspaceMember>;
  workspaceMembers?: Maybe<Array<WorkspaceMember>>;
  workspaces: Array<UserWorkspace>;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the User */
  node: User;
};

export type UserExists = {
  __typename?: 'UserExists';
  availableWorkspaces: Array<AvailableWorkspaceOutput>;
  exists: Scalars['Boolean']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
};

export type UserExistsOutput = UserExists | UserNotExists;

export type UserInfo = {
  __typename?: 'UserInfo';
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
};

export type UserLookup = {
  __typename?: 'UserLookup';
  user: UserInfo;
  workspaces: Array<WorkspaceInfo>;
};

export type UserMappingOptions = {
  password?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
};

export type UserMappingOptionsUpdateInput = {
  password?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
};

export type UserMappingOptionsUser = {
  __typename?: 'UserMappingOptionsUser';
  user?: Maybe<Scalars['String']['output']>;
};

export type UserNotExists = {
  __typename?: 'UserNotExists';
  exists: Scalars['Boolean']['output'];
};

export type UserWorkspace = {
  __typename?: 'UserWorkspace';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  objectRecordsPermissions?: Maybe<Array<PermissionsOnAllObjectRecords>>;
  settingsPermissions?: Maybe<Array<SettingPermissionType>>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['String']['output'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['String']['output'];
};

export type ValidateApprovedAccessDomainInput = {
  approvedAccessDomainId: Scalars['String']['input'];
  validationToken: Scalars['String']['input'];
};

export type ValidatePasswordResetToken = {
  __typename?: 'ValidatePasswordResetToken';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type VersionInfo = {
  __typename?: 'VersionInfo';
  currentVersion?: Maybe<Scalars['String']['output']>;
  latestVersion: Scalars['String']['output'];
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

export type WorkflowAction = {
  __typename?: 'WorkflowAction';
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  settings: Scalars['JSON']['output'];
  type: Scalars['String']['output'];
  valid: Scalars['Boolean']['output'];
};

export type WorkflowRun = {
  __typename?: 'WorkflowRun';
  workflowRunId: Scalars['UUID']['output'];
};

export type WorkflowVersion = {
  __typename?: 'WorkflowVersion';
  id: Scalars['UUID']['output'];
};

export type Workspace = {
  __typename?: 'Workspace';
  activationStatus: WorkspaceActivationStatus;
  allowImpersonation: Scalars['Boolean']['output'];
  billingSubscriptions: Array<BillingSubscription>;
  createdAt: Scalars['DateTime']['output'];
  currentBillingSubscription?: Maybe<BillingSubscription>;
  customDomain?: Maybe<Scalars['String']['output']>;
  databaseSchema: Scalars['String']['output'];
  databaseUrl: Scalars['String']['output'];
  defaultRole?: Maybe<Role>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  featureFlags?: Maybe<Array<FeatureFlagDto>>;
  hasValidEnterpriseKey: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  inviteHash?: Maybe<Scalars['String']['output']>;
  isCustomDomainEnabled: Scalars['Boolean']['output'];
  isGoogleAuthEnabled: Scalars['Boolean']['output'];
  isMicrosoftAuthEnabled: Scalars['Boolean']['output'];
  isPasswordAuthEnabled: Scalars['Boolean']['output'];
  isPublicInviteLinkEnabled: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  metadataVersion: Scalars['Float']['output'];
  subdomain: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  version?: Maybe<Scalars['String']['output']>;
  workspaceMembersCount?: Maybe<Scalars['Float']['output']>;
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
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the Workspace */
  node: Workspace;
};

export type WorkspaceInfo = {
  __typename?: 'WorkspaceInfo';
  allowImpersonation: Scalars['Boolean']['output'];
  featureFlags: Array<FeatureFlag>;
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  totalUsers: Scalars['Float']['output'];
  users: Array<UserInfo>;
};

export type WorkspaceInvitation = {
  __typename?: 'WorkspaceInvitation';
  email: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
};

export type WorkspaceInviteHashValid = {
  __typename?: 'WorkspaceInviteHashValid';
  isValid: Scalars['Boolean']['output'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  colorScheme: Scalars['String']['output'];
  dateFormat?: Maybe<WorkspaceMemberDateFormatEnum>;
  id: Scalars['UUID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  name: FullName;
  roles?: Maybe<Array<Role>>;
  timeFormat?: Maybe<WorkspaceMemberTimeFormatEnum>;
  timeZone?: Maybe<Scalars['String']['output']>;
  userEmail: Scalars['String']['output'];
  userWorkspaceId?: Maybe<Scalars['String']['output']>;
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
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
};

export type WorkspaceUrls = {
  __typename?: 'WorkspaceUrls';
  customUrl?: Maybe<Scalars['String']['output']>;
  subdomainUrl: Scalars['String']['output'];
};

export type WorkspaceUrlsAndId = {
  __typename?: 'WorkspaceUrlsAndId';
  id: Scalars['String']['output'];
  workspaceUrls: WorkspaceUrls;
};

export type RemoteServerFieldsFragment = { __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null };

export type RemoteTableFieldsFragment = { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null };

export type CreateServerMutationVariables = Exact<{
  input: CreateRemoteServerInput;
}>;


export type CreateServerMutation = { __typename?: 'Mutation', createOneRemoteServer: { __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

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


export type UpdateServerMutation = { __typename?: 'Mutation', updateOneRemoteServer: { __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type GetManyDatabaseConnectionsQueryVariables = Exact<{
  input: RemoteServerTypeInput;
}>;


export type GetManyDatabaseConnectionsQuery = { __typename?: 'Query', findManyRemoteServersByType: Array<{ __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null }> };

export type GetManyRemoteTablesQueryVariables = Exact<{
  input: FindManyRemoteTablesInput;
}>;


export type GetManyRemoteTablesQuery = { __typename?: 'Query', findDistantTablesWithStatus: Array<{ __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null }> };

export type GetOneDatabaseConnectionQueryVariables = Exact<{
  input: RemoteServerIdInput;
}>;


export type GetOneDatabaseConnectionQuery = { __typename?: 'Query', findOneRemoteServerById: { __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type CreateOneObjectMetadataItemMutationVariables = Exact<{
  input: CreateOneObjectInput;
}>;


export type CreateOneObjectMetadataItemMutation = { __typename?: 'Mutation', createOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type CreateOneFieldMetadataItemMutationVariables = Exact<{
  input: CreateOneFieldMetadataInput;
}>;


export type CreateOneFieldMetadataItemMutation = { __typename?: 'Mutation', createOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null, defaultValue?: any | null, options?: any | null, isLabelSyncedWithName?: boolean | null } };

export type CreateOneRelationMetadataItemMutationVariables = Exact<{
  input: CreateOneRelationMetadataInput;
}>;


export type CreateOneRelationMetadataItemMutation = { __typename?: 'Mutation', createOneRelationMetadata: { __typename?: 'RelationMetadata', id: any, relationType: RelationMetadataType, fromObjectMetadataId: string, toObjectMetadataId: string, fromFieldMetadataId: string, toFieldMetadataId: string, createdAt: any, updatedAt: any } };

export type UpdateOneFieldMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID']['input'];
  updatePayload: UpdateFieldInput;
}>;


export type UpdateOneFieldMetadataItemMutation = { __typename?: 'Mutation', updateOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null, isLabelSyncedWithName?: boolean | null } };

export type UpdateOneObjectMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID']['input'];
  updatePayload: UpdateObjectPayload;
}>;


export type UpdateOneObjectMetadataItemMutation = { __typename?: 'Mutation', updateOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type DeleteOneObjectMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID']['input'];
}>;


export type DeleteOneObjectMetadataItemMutation = { __typename?: 'Mutation', deleteOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type DeleteOneFieldMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID']['input'];
}>;


export type DeleteOneFieldMetadataItemMutation = { __typename?: 'Mutation', deleteOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null } };

export type DeleteOneRelationMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID']['input'];
}>;


export type DeleteOneRelationMetadataItemMutation = { __typename?: 'Mutation', deleteOneRelation: { __typename?: 'RelationMetadata', id: any } };

export type ObjectMetadataItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type ObjectMetadataItemsQuery = { __typename?: 'Query', objects: { __typename?: 'ObjectConnection', edges: Array<{ __typename?: 'ObjectEdge', node: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isRemote: boolean, isActive: boolean, isSystem: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, shortcut?: string | null, isLabelSyncedWithName: boolean, isSearchable: boolean, duplicateCriteria?: Array<Array<string>> | null, indexMetadatas: { __typename?: 'ObjectIndexMetadatasConnection', edges: Array<{ __typename?: 'IndexEdge', node: { __typename?: 'Index', id: any, createdAt: any, updatedAt: any, name: string, indexWhereClause?: string | null, indexType: IndexType, isUnique: boolean, indexFieldMetadatas: { __typename?: 'IndexIndexFieldMetadatasConnection', edges: Array<{ __typename?: 'IndexFieldEdge', node: { __typename?: 'IndexField', id: any, createdAt: any, updatedAt: any, order: number, fieldMetadataId: any } }> } } }> }, fieldsList: Array<{ __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isSystem?: boolean | null, isNullable?: boolean | null, isUnique?: boolean | null, createdAt: any, updatedAt: any, defaultValue?: any | null, options?: any | null, settings?: any | null, isLabelSyncedWithName?: boolean | null, relationDefinition?: { __typename?: 'RelationDefinition', relationId: any, direction: RelationDefinitionType, sourceObjectMetadata: { __typename?: 'Object', id: any, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: any, name: string }, targetObjectMetadata: { __typename?: 'Object', id: any, nameSingular: string, namePlural: string }, targetFieldMetadata: { __typename?: 'Field', id: any, name: string } } | null }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: any | null, endCursor?: any | null } } };

export type ServerlessFunctionFieldsFragment = { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any };

export type CreateOneServerlessFunctionItemMutationVariables = Exact<{
  input: CreateServerlessFunctionInput;
}>;


export type CreateOneServerlessFunctionItemMutation = { __typename?: 'Mutation', createOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type DeleteOneServerlessFunctionMutationVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type DeleteOneServerlessFunctionMutation = { __typename?: 'Mutation', deleteOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type ExecuteOneServerlessFunctionMutationVariables = Exact<{
  input: ExecuteServerlessFunctionInput;
}>;


export type ExecuteOneServerlessFunctionMutation = { __typename?: 'Mutation', executeOneServerlessFunction: { __typename?: 'ServerlessFunctionExecutionResult', data?: any | null, logs: string, duration: number, status: ServerlessFunctionExecutionStatus, error?: any | null } };

export type PublishOneServerlessFunctionMutationVariables = Exact<{
  input: PublishServerlessFunctionInput;
}>;


export type PublishOneServerlessFunctionMutation = { __typename?: 'Mutation', publishServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type UpdateOneServerlessFunctionMutationVariables = Exact<{
  input: UpdateServerlessFunctionInput;
}>;


export type UpdateOneServerlessFunctionMutation = { __typename?: 'Mutation', updateOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type FindManyAvailablePackagesQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type FindManyAvailablePackagesQuery = { __typename?: 'Query', getAvailablePackages: any };

export type GetManyServerlessFunctionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetManyServerlessFunctionsQuery = { __typename?: 'Query', findManyServerlessFunctions: Array<{ __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any }> };

export type GetOneServerlessFunctionQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type GetOneServerlessFunctionQuery = { __typename?: 'Query', findOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type FindOneServerlessFunctionSourceCodeQueryVariables = Exact<{
  input: GetServerlessFunctionSourceCodeInput;
}>;


export type FindOneServerlessFunctionSourceCodeQuery = { __typename?: 'Query', getServerlessFunctionSourceCode?: any | null };

export const RemoteServerFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<RemoteServerFieldsFragment, unknown>;
export const RemoteTableFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<RemoteTableFieldsFragment, unknown>;
export const ServerlessFunctionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ServerlessFunctionFieldsFragment, unknown>;
export const CreateServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRemoteServerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<CreateServerMutation, CreateServerMutationVariables>;
export const DeleteServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteServerMutation, DeleteServerMutationVariables>;
export const SyncRemoteTableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"syncRemoteTable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncRemoteTable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<SyncRemoteTableMutation, SyncRemoteTableMutationVariables>;
export const SyncRemoteTableSchemaChangesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"syncRemoteTableSchemaChanges"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncRemoteTableSchemaChanges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<SyncRemoteTableSchemaChangesMutation, SyncRemoteTableSchemaChangesMutationVariables>;
export const UnsyncRemoteTableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"unsyncRemoteTable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsyncRemoteTable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<UnsyncRemoteTableMutation, UnsyncRemoteTableMutationVariables>;
export const UpdateServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRemoteServerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<UpdateServerMutation, UpdateServerMutationVariables>;
export const GetManyDatabaseConnectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyDatabaseConnections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerTypeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findManyRemoteServersByType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<GetManyDatabaseConnectionsQuery, GetManyDatabaseConnectionsQueryVariables>;
export const GetManyRemoteTablesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyRemoteTables"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FindManyRemoteTablesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findDistantTablesWithStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<GetManyRemoteTablesQuery, GetManyRemoteTablesQueryVariables>;
export const GetOneDatabaseConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOneDatabaseConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findOneRemoteServerById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<GetOneDatabaseConnectionQuery, GetOneDatabaseConnectionQueryVariables>;
export const CreateOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneObjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSearchable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<CreateOneObjectMetadataItemMutation, CreateOneObjectMetadataItemMutationVariables>;
export const CreateOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneFieldMetadataInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<CreateOneFieldMetadataItemMutation, CreateOneFieldMetadataItemMutationVariables>;
export const CreateOneRelationMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneRelationMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneRelationMetadataInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneRelationMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"relationType"}},{"kind":"Field","name":{"kind":"Name","value":"fromObjectMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"toObjectMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"fromFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"toFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateOneRelationMetadataItemMutation, CreateOneRelationMetadataItemMutationVariables>;
export const UpdateOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"update"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<UpdateOneFieldMetadataItemMutation, UpdateOneFieldMetadataItemMutationVariables>;
export const UpdateOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateObjectPayload"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"update"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSearchable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<UpdateOneObjectMetadataItemMutation, UpdateOneObjectMetadataItemMutationVariables>;
export const DeleteOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSearchable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<DeleteOneObjectMetadataItemMutation, DeleteOneObjectMetadataItemMutationVariables>;
export const DeleteOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}}]}}]}}]} as unknown as DocumentNode<DeleteOneFieldMetadataItemMutation, DeleteOneFieldMetadataItemMutationVariables>;
export const DeleteOneRelationMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneRelationMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneRelation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteOneRelationMetadataItemMutation, DeleteOneRelationMetadataItemMutationVariables>;
export const ObjectMetadataItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ObjectMetadataItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isRemote"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSystem"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"shortcut"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}},{"kind":"Field","name":{"kind":"Name","value":"isSearchable"}},{"kind":"Field","name":{"kind":"Name","value":"duplicateCriteria"}},{"kind":"Field","name":{"kind":"Name","value":"indexMetadatas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"indexWhereClause"}},{"kind":"Field","name":{"kind":"Name","value":"indexType"}},{"kind":"Field","name":{"kind":"Name","value":"isUnique"}},{"kind":"Field","name":{"kind":"Name","value":"indexFieldMetadatas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"fieldMetadataId"}}]}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"fieldsList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSystem"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"isUnique"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}},{"kind":"Field","name":{"kind":"Name","value":"relationDefinition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"relationId"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"sourceObjectMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceFieldMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"targetObjectMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}}]}},{"kind":"Field","name":{"kind":"Name","value":"targetFieldMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>;
export const CreateOneServerlessFunctionItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneServerlessFunctionItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateOneServerlessFunctionItemMutation, CreateOneServerlessFunctionItemMutationVariables>;
export const DeleteOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<DeleteOneServerlessFunctionMutation, DeleteOneServerlessFunctionMutationVariables>;
export const ExecuteOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExecuteOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExecuteServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"executeOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"logs"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<ExecuteOneServerlessFunctionMutation, ExecuteOneServerlessFunctionMutationVariables>;
export const PublishOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublishServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PublishOneServerlessFunctionMutation, PublishOneServerlessFunctionMutationVariables>;
export const UpdateOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateOneServerlessFunctionMutation, UpdateOneServerlessFunctionMutationVariables>;
export const FindManyAvailablePackagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindManyAvailablePackages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAvailablePackages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<FindManyAvailablePackagesQuery, FindManyAvailablePackagesQueryVariables>;
export const GetManyServerlessFunctionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyServerlessFunctions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findManyServerlessFunctions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetManyServerlessFunctionsQuery, GetManyServerlessFunctionsQueryVariables>;
export const GetOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetOneServerlessFunctionQuery, GetOneServerlessFunctionQueryVariables>;
export const FindOneServerlessFunctionSourceCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindOneServerlessFunctionSourceCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetServerlessFunctionSourceCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getServerlessFunctionSourceCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<FindOneServerlessFunctionSourceCodeQuery, FindOneServerlessFunctionSourceCodeQueryVariables>;