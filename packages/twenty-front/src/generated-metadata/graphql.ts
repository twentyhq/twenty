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

export type Analytics = {
  __typename?: 'Analytics';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type AnalyticsTinybirdJwtMap = {
  __typename?: 'AnalyticsTinybirdJwtMap';
  getPageviewsAnalytics: Scalars['String']['output'];
  getServerlessFunctionDuration: Scalars['String']['output'];
  getServerlessFunctionErrorCount: Scalars['String']['output'];
  getServerlessFunctionSuccessRate: Scalars['String']['output'];
  getUsersAnalytics: Scalars['String']['output'];
  getWebhookAnalytics: Scalars['String']['output'];
};

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
  subdomain: Scalars['String']['output'];
};

export type Billing = {
  __typename?: 'Billing';
  billingUrl?: Maybe<Scalars['String']['output']>;
  isBillingEnabled: Scalars['Boolean']['output'];
  trialPeriods: Array<TrialPeriodDto>;
};

/** The different billing plans available */
export enum BillingPlanKey {
  Enterprise = 'ENTERPRISE',
  Pro = 'PRO'
}

export type BillingSubscription = {
  __typename?: 'BillingSubscription';
  id: Scalars['UUID']['output'];
  interval?: Maybe<SubscriptionInterval>;
  status: SubscriptionStatus;
};

export type BillingSubscriptionFilter = {
  and?: InputMaybe<Array<BillingSubscriptionFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  or?: InputMaybe<Array<BillingSubscriptionFilter>>;
};

export type BillingSubscriptionSort = {
  direction: SortDirection;
  field: BillingSubscriptionSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export enum BillingSubscriptionSortFields {
  Id = 'id'
}

export type BooleanFieldComparison = {
  is?: InputMaybe<Scalars['Boolean']['input']>;
  isNot?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum CalendarChannelVisibility {
  Metadata = 'METADATA',
  ShareEverything = 'SHARE_EVERYTHING'
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
  isEmailVerificationRequired: Scalars['Boolean']['output'];
  isMultiWorkspaceEnabled: Scalars['Boolean']['output'];
  sentry: Sentry;
  signInPrefilled: Scalars['Boolean']['output'];
  support: Support;
};

export type ComputeStepOutputSchemaInput = {
  /** Step JSON format */
  step: Scalars['JSON']['input'];
};

export type CreateAppTokenInput = {
  expiresAt: Scalars['DateTime']['input'];
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

export type CreateOneRelationInput = {
  /** The record to create */
  relation: CreateRelationInput;
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

export type CreateServerlessFunctionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateWorkflowVersionStepInput = {
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
  ColumnsAdded = 'COLUMNS_ADDED',
  ColumnsDeleted = 'COLUMNS_DELETED',
  ColumnsTypeChanged = 'COLUMNS_TYPE_CHANGED',
  TableDeleted = 'TABLE_DELETED'
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

export enum FeatureFlagKey {
  IsAdvancedFiltersEnabled = 'IsAdvancedFiltersEnabled',
  IsAirtableIntegrationEnabled = 'IsAirtableIntegrationEnabled',
  IsAnalyticsV2Enabled = 'IsAnalyticsV2Enabled',
  IsCommandMenuV2Enabled = 'IsCommandMenuV2Enabled',
  IsCopilotEnabled = 'IsCopilotEnabled',
  IsEventObjectEnabled = 'IsEventObjectEnabled',
  IsFreeAccessEnabled = 'IsFreeAccessEnabled',
  IsFunctionSettingsEnabled = 'IsFunctionSettingsEnabled',
  IsGmailSendEmailScopeEnabled = 'IsGmailSendEmailScopeEnabled',
  IsJsonFilterEnabled = 'IsJsonFilterEnabled',
  IsMicrosoftSyncEnabled = 'IsMicrosoftSyncEnabled',
  IsPostgreSqlIntegrationEnabled = 'IsPostgreSQLIntegrationEnabled',
  IsStripeIntegrationEnabled = 'IsStripeIntegrationEnabled',
  IsUniqueIndexesEnabled = 'IsUniqueIndexesEnabled',
  IsWorkflowEnabled = 'IsWorkflowEnabled'
}

export type FieldConnection = {
  __typename?: 'FieldConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

/** Type of the field */
export enum FieldMetadataType {
  Actor = 'ACTOR',
  Address = 'ADDRESS',
  Array = 'ARRAY',
  Boolean = 'BOOLEAN',
  Currency = 'CURRENCY',
  Date = 'DATE',
  DateTime = 'DATE_TIME',
  Emails = 'EMAILS',
  FullName = 'FULL_NAME',
  Links = 'LINKS',
  MultiSelect = 'MULTI_SELECT',
  Number = 'NUMBER',
  Numeric = 'NUMERIC',
  Phones = 'PHONES',
  Position = 'POSITION',
  Rating = 'RATING',
  RawJson = 'RAW_JSON',
  Relation = 'RELATION',
  RichText = 'RICH_TEXT',
  Select = 'SELECT',
  Text = 'TEXT',
  TsVector = 'TS_VECTOR',
  Uuid = 'UUID'
}

export enum FileFolder {
  Attachment = 'Attachment',
  PersonPicture = 'PersonPicture',
  ProfilePicture = 'ProfilePicture',
  ServerlessFunction = 'ServerlessFunction',
  WorkspaceLogo = 'WorkspaceLogo'
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

export type GetAuthorizationUrlInput = {
  identityProviderId: Scalars['String']['input'];
};

export type GetAuthorizationUrlOutput = {
  __typename?: 'GetAuthorizationUrlOutput';
  authorizationURL: Scalars['String']['output'];
  id: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type GetServerlessFunctionSourceCodeInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
  /** The version of the function */
  version?: Scalars['String']['input'];
};

export enum IdentityProviderType {
  Oidc = 'OIDC',
  Saml = 'SAML'
}

export type ImpersonateOutput = {
  __typename?: 'ImpersonateOutput';
  loginToken: AuthToken;
  workspace: WorkspaceSubdomainAndId;
};

export type IndexConnection = {
  __typename?: 'IndexConnection';
  /** Array of edges. */
  edges: Array<IndexEdge>;
  /** Paging information */
  pageInfo: PageInfo;
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
  Btree = 'BTREE',
  Gin = 'GIN'
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
  Metadata = 'METADATA',
  ShareEverything = 'SHARE_EVERYTHING',
  Subject = 'SUBJECT'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateWorkflowVersion: Scalars['Boolean']['output'];
  activateWorkspace: Workspace;
  addUserToWorkspace: User;
  addUserToWorkspaceByInviteToken: User;
  authorizeApp: AuthorizeApp;
  challenge: LoginToken;
  checkoutSession: SessionEntity;
  computeStepOutputSchema: Scalars['JSON']['output'];
  createDraftFromWorkflowVersion: Scalars['Boolean']['output'];
  createOIDCIdentityProvider: SetupSsoOutput;
  createOneAppToken: AppToken;
  createOneField: Field;
  createOneObject: Object;
  createOneRelation: Relation;
  createOneRemoteServer: RemoteServer;
  createOneServerlessFunction: ServerlessFunction;
  createSAMLIdentityProvider: SetupSsoOutput;
  createWorkflowVersionStep: WorkflowAction;
  deactivateWorkflowVersion: Scalars['Boolean']['output'];
  deleteCurrentWorkspace: Workspace;
  deleteOneField: Field;
  deleteOneObject: Object;
  deleteOneRelation: Relation;
  deleteOneRemoteServer: RemoteServer;
  deleteOneServerlessFunction: ServerlessFunction;
  deleteSSOIdentityProvider: DeleteSsoOutput;
  deleteUser: User;
  deleteWorkflowVersionStep: WorkflowAction;
  deleteWorkspaceInvitation: Scalars['String']['output'];
  disablePostgresProxy: PostgresCredentials;
  editSSOIdentityProvider: EditSsoOutput;
  emailPasswordResetLink: EmailPasswordResetLink;
  enablePostgresProxy: PostgresCredentials;
  executeOneServerlessFunction: ServerlessFunctionExecutionResult;
  generateApiKeyToken: ApiKeyToken;
  generateTransientToken: TransientToken;
  getAuthorizationUrl: GetAuthorizationUrlOutput;
  getLoginTokenFromEmailVerificationToken: LoginToken;
  impersonate: ImpersonateOutput;
  publishServerlessFunction: ServerlessFunction;
  renewToken: AuthTokens;
  resendEmailVerificationToken: ResendEmailVerificationTokenOutput;
  resendWorkspaceInvitation: SendInvitationsOutput;
  runWorkflowVersion: WorkflowRun;
  sendInvitations: SendInvitationsOutput;
  signUp: SignUpOutput;
  skipSyncEmailOnboardingStep: OnboardingStepSuccess;
  switchWorkspace: PublicWorkspaceDataOutput;
  syncRemoteTable: RemoteTable;
  syncRemoteTableSchemaChanges: RemoteTable;
  track: Analytics;
  unsyncRemoteTable: RemoteTable;
  updateBillingSubscription: UpdateBillingEntity;
  updateOneField: Field;
  updateOneObject: Object;
  updateOneRemoteServer: RemoteServer;
  updateOneServerlessFunction: ServerlessFunction;
  updatePasswordViaResetToken: InvalidatePassword;
  updateWorkflowVersionStep: WorkflowAction;
  updateWorkspace: Workspace;
  updateWorkspaceFeatureFlag: Scalars['Boolean']['output'];
  uploadFile: Scalars['String']['output'];
  uploadImage: Scalars['String']['output'];
  uploadProfilePicture: Scalars['String']['output'];
  uploadWorkspaceLogo: Scalars['String']['output'];
  userLookupAdminPanel: UserLookup;
  verify: AuthTokens;
};


export type MutationActivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['String']['input'];
};


export type MutationActivateWorkspaceArgs = {
  data: ActivateWorkspaceInput;
};


export type MutationAddUserToWorkspaceArgs = {
  inviteHash: Scalars['String']['input'];
};


export type MutationAddUserToWorkspaceByInviteTokenArgs = {
  inviteToken: Scalars['String']['input'];
};


export type MutationAuthorizeAppArgs = {
  clientId: Scalars['String']['input'];
  codeChallenge?: InputMaybe<Scalars['String']['input']>;
  redirectUrl: Scalars['String']['input'];
};


export type MutationChallengeArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
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


export type MutationCreateOneRelationArgs = {
  input: CreateOneRelationInput;
};


export type MutationCreateOneRemoteServerArgs = {
  input: CreateRemoteServerInput;
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
};


export type MutationExecuteOneServerlessFunctionArgs = {
  input: ExecuteServerlessFunctionInput;
};


export type MutationGenerateApiKeyTokenArgs = {
  apiKeyId: Scalars['String']['input'];
  expiresAt: Scalars['String']['input'];
};


export type MutationGetAuthorizationUrlArgs = {
  input: GetAuthorizationUrlInput;
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
  password: Scalars['String']['input'];
  workspaceId?: InputMaybe<Scalars['String']['input']>;
  workspaceInviteHash?: InputMaybe<Scalars['String']['input']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSwitchWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
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


export type MutationUnsyncRemoteTableArgs = {
  input: RemoteTableInput;
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


export type MutationUpdateOneServerlessFunctionArgs = {
  input: UpdateServerlessFunctionInput;
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String']['input'];
  passwordResetToken: Scalars['String']['input'];
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


export type MutationUserLookupAdminPanelArgs = {
  userIdentifier: Scalars['String']['input'];
};


export type MutationVerifyArgs = {
  loginToken: Scalars['String']['input'];
};

export type ObjectConnection = {
  __typename?: 'ObjectConnection';
  /** Array of edges. */
  edges: Array<ObjectEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectFieldsConnection = {
  __typename?: 'ObjectFieldsConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectIndexMetadatasConnection = {
  __typename?: 'ObjectIndexMetadatasConnection';
  /** Array of edges. */
  edges: Array<IndexEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

/** Onboarding status */
export enum OnboardingStatus {
  Completed = 'COMPLETED',
  InviteTeam = 'INVITE_TEAM',
  PlanRequired = 'PLAN_REQUIRED',
  ProfileCreation = 'PROFILE_CREATION',
  SyncEmail = 'SYNC_EMAIL',
  WorkspaceActivation = 'WORKSPACE_ACTIVATION'
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

export type PostgresCredentials = {
  __typename?: 'PostgresCredentials';
  id: Scalars['UUID']['output'];
  password: Scalars['String']['output'];
  user: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type ProductPriceEntity = {
  __typename?: 'ProductPriceEntity';
  created: Scalars['Float']['output'];
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String']['output'];
  unitAmount: Scalars['Float']['output'];
};

export type ProductPricesEntity = {
  __typename?: 'ProductPricesEntity';
  productPrices: Array<ProductPriceEntity>;
  totalNumberOfPrices: Scalars['Int']['output'];
};

export type PublicWorkspaceDataOutput = {
  __typename?: 'PublicWorkspaceDataOutput';
  authProviders: AuthProviders;
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  subdomain: Scalars['String']['output'];
};

export type PublishServerlessFunctionInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  billingPortalSession: SessionEntity;
  checkUserExists: UserExistsOutput;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  clientConfig: ClientConfig;
  currentUser: User;
  currentWorkspace: Workspace;
  field: Field;
  fields: FieldConnection;
  findAvailableWorkspacesByEmail: Array<AvailableWorkspaceOutput>;
  findDistantTablesWithStatus: Array<RemoteTable>;
  findManyRemoteServersByType: Array<RemoteServer>;
  findManyServerlessFunctions: Array<ServerlessFunction>;
  findOneRemoteServerById: RemoteServer;
  findOneServerlessFunction: ServerlessFunction;
  findWorkspaceFromInviteHash: Workspace;
  findWorkspaceInvitations: Array<WorkspaceInvitation>;
  getAvailablePackages: Scalars['JSON']['output'];
  getPostgresCredentials?: Maybe<PostgresCredentials>;
  getProductPrices: ProductPricesEntity;
  getPublicWorkspaceDataBySubdomain: PublicWorkspaceDataOutput;
  getServerlessFunctionSourceCode?: Maybe<Scalars['JSON']['output']>;
  getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal;
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  index: Index;
  indexMetadatas: IndexConnection;
  listSSOIdentityProvidersByWorkspaceId: Array<FindAvailableSsoidpOutput>;
  object: Object;
  objects: ObjectConnection;
  relation: Relation;
  relations: RelationConnection;
  validatePasswordResetToken: ValidatePasswordResetToken;
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


export type QueryFindAvailableWorkspacesByEmailArgs = {
  email: Scalars['String']['input'];
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


export type QueryGetProductPricesArgs = {
  product: Scalars['String']['input'];
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


export type QueryRelationArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryRelationsArgs = {
  paging?: CursorPaging;
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String']['input'];
};

export type RelationConnection = {
  __typename?: 'RelationConnection';
  /** Array of edges. */
  edges: Array<RelationEdge>;
  /** Paging information */
  pageInfo: PageInfo;
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
  ManyToMany = 'MANY_TO_MANY',
  ManyToOne = 'MANY_TO_ONE',
  OneToMany = 'ONE_TO_MANY',
  OneToOne = 'ONE_TO_ONE'
}

/** Type of the relation */
export enum RelationMetadataType {
  ManyToMany = 'MANY_TO_MANY',
  ManyToOne = 'MANY_TO_ONE',
  OneToMany = 'ONE_TO_MANY',
  OneToOne = 'ONE_TO_ONE'
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
  NotSynced = 'NOT_SYNCED',
  Synced = 'SYNCED'
}

export type ResendEmailVerificationTokenOutput = {
  __typename?: 'ResendEmailVerificationTokenOutput';
  success: Scalars['Boolean']['output'];
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
  /** Execution status */
  status: ServerlessFunctionExecutionStatus;
};

/** Status of the serverless function execution */
export enum ServerlessFunctionExecutionStatus {
  Error = 'ERROR',
  Success = 'SUCCESS'
}

export type ServerlessFunctionIdInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
};

/** SyncStatus of the serverlessFunction */
export enum ServerlessFunctionSyncStatus {
  NotReady = 'NOT_READY',
  Ready = 'READY'
}

export type SessionEntity = {
  __typename?: 'SessionEntity';
  url?: Maybe<Scalars['String']['output']>;
};

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
  workspace: WorkspaceSubdomainAndId;
};

/** Sort Directions */
export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Sort Nulls Options */
export enum SortNulls {
  NullsFirst = 'NULLS_FIRST',
  NullsLast = 'NULLS_LAST'
}

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

export type TrialPeriodDto = {
  __typename?: 'TrialPeriodDTO';
  duration: Scalars['Float']['output'];
  isCreditCardRequired: Scalars['Boolean']['output'];
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

export type UpdateBillingEntity = {
  __typename?: 'UpdateBillingEntity';
  /** Boolean that confirms query was successful */
  success: Scalars['Boolean']['output'];
};

export type UpdateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isCustom?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isNullable?: InputMaybe<Scalars['Boolean']['input']>;
  isSystem?: InputMaybe<Scalars['Boolean']['input']>;
  isUnique?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  options?: InputMaybe<Scalars['JSON']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
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

export type UpdateServerlessFunctionInput = {
  code: Scalars['JSON']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  /** Id of the serverless function to execute */
  id: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
};

export type UpdateWorkflowVersionStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON']['input'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
};

export type UpdateWorkspaceInput = {
  allowImpersonation?: InputMaybe<Scalars['Boolean']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  domainName?: InputMaybe<Scalars['String']['input']>;
  inviteHash?: InputMaybe<Scalars['String']['input']>;
  isGoogleAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isMicrosoftAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPasswordAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPublicInviteLinkEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  subdomain?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  analyticsTinybirdJwts?: Maybe<AnalyticsTinybirdJwtMap>;
  canImpersonate: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentWorkspace?: Maybe<Workspace>;
  defaultAvatarUrl?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  disabled?: Maybe<Scalars['Boolean']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
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
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['String']['output'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['String']['output'];
};

export type ValidatePasswordResetToken = {
  __typename?: 'ValidatePasswordResetToken';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
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

export type Workspace = {
  __typename?: 'Workspace';
  activationStatus: WorkspaceActivationStatus;
  allowImpersonation: Scalars['Boolean']['output'];
  billingCustomers?: Maybe<Array<BillingCustomer>>;
  billingEntitlements?: Maybe<Array<BillingEntitlement>>;
  billingSubscriptions?: Maybe<Array<BillingSubscription>>;
  createdAt: Scalars['DateTime']['output'];
  currentBillingSubscription?: Maybe<BillingSubscription>;
  databaseSchema: Scalars['String']['output'];
  databaseUrl: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  domainName?: Maybe<Scalars['String']['output']>;
  featureFlags?: Maybe<Array<FeatureFlag>>;
  hasValidEntrepriseKey: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  inviteHash?: Maybe<Scalars['String']['output']>;
  isGoogleAuthEnabled: Scalars['Boolean']['output'];
  isMicrosoftAuthEnabled: Scalars['Boolean']['output'];
  isPasswordAuthEnabled: Scalars['Boolean']['output'];
  isPublicInviteLinkEnabled: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  metadataVersion: Scalars['Float']['output'];
  subdomain: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workspaceMembersCount?: Maybe<Scalars['Float']['output']>;
};


export type WorkspaceBillingCustomersArgs = {
  filter?: BillingCustomerFilter;
  sorting?: Array<BillingCustomerSort>;
};


export type WorkspaceBillingEntitlementsArgs = {
  filter?: BillingEntitlementFilter;
  sorting?: Array<BillingEntitlementSort>;
};


export type WorkspaceBillingSubscriptionsArgs = {
  filter?: BillingSubscriptionFilter;
  sorting?: Array<BillingSubscriptionSort>;
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
  timeFormat?: Maybe<WorkspaceMemberTimeFormatEnum>;
  timeZone?: Maybe<Scalars['String']['output']>;
};

/** Date format as Month first, Day first, Year first or system as default */
export enum WorkspaceMemberDateFormatEnum {
  DayFirst = 'DAY_FIRST',
  MonthFirst = 'MONTH_FIRST',
  System = 'SYSTEM',
  YearFirst = 'YEAR_FIRST'
}

/** Time time as Military, Standard or system as default */
export enum WorkspaceMemberTimeFormatEnum {
  Hour_12 = 'HOUR_12',
  Hour_24 = 'HOUR_24',
  System = 'SYSTEM'
}

export type WorkspaceNameAndId = {
  __typename?: 'WorkspaceNameAndId';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
};

export type WorkspaceSubdomainAndId = {
  __typename?: 'WorkspaceSubdomainAndId';
  id: Scalars['String']['output'];
  subdomain: Scalars['String']['output'];
};

export type BillingCustomer = {
  __typename?: 'billingCustomer';
  id: Scalars['UUID']['output'];
};

export type BillingCustomerFilter = {
  and?: InputMaybe<Array<BillingCustomerFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  or?: InputMaybe<Array<BillingCustomerFilter>>;
};

export type BillingCustomerSort = {
  direction: SortDirection;
  field: BillingCustomerSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export enum BillingCustomerSortFields {
  Id = 'id'
}

export type BillingEntitlement = {
  __typename?: 'billingEntitlement';
  id: Scalars['UUID']['output'];
  key: Scalars['String']['output'];
  value: Scalars['Boolean']['output'];
  workspaceId: Scalars['String']['output'];
};

export type BillingEntitlementFilter = {
  and?: InputMaybe<Array<BillingEntitlementFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  or?: InputMaybe<Array<BillingEntitlementFilter>>;
};

export type BillingEntitlementSort = {
  direction: SortDirection;
  field: BillingEntitlementSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export enum BillingEntitlementSortFields {
  Id = 'id'
}

export type Field = {
  __typename?: 'field';
  createdAt: Scalars['DateTime']['output'];
  defaultValue?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fromRelationMetadata?: Maybe<Relation>;
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
  relationDefinition?: Maybe<RelationDefinition>;
  settings?: Maybe<Scalars['JSON']['output']>;
  toRelationMetadata?: Maybe<Relation>;
  type: FieldMetadataType;
  updatedAt: Scalars['DateTime']['output'];
};

export type FieldEdge = {
  __typename?: 'fieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the field */
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

export type Index = {
  __typename?: 'index';
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

export type IndexEdge = {
  __typename?: 'indexEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the index */
  node: Index;
};

export type IndexField = {
  __typename?: 'indexField';
  createdAt: Scalars['DateTime']['output'];
  fieldMetadataId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  order: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type IndexFieldEdge = {
  __typename?: 'indexFieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the indexField */
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

export type Object = {
  __typename?: 'object';
  createdAt: Scalars['DateTime']['output'];
  dataSourceId: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fields: ObjectFieldsConnection;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  imageIdentifierFieldMetadataId?: Maybe<Scalars['String']['output']>;
  indexMetadatas: ObjectIndexMetadatasConnection;
  isActive: Scalars['Boolean']['output'];
  isCustom: Scalars['Boolean']['output'];
  isLabelSyncedWithName: Scalars['Boolean']['output'];
  isRemote: Scalars['Boolean']['output'];
  isSystem: Scalars['Boolean']['output'];
  labelIdentifierFieldMetadataId?: Maybe<Scalars['String']['output']>;
  labelPlural: Scalars['String']['output'];
  labelSingular: Scalars['String']['output'];
  namePlural: Scalars['String']['output'];
  nameSingular: Scalars['String']['output'];
  shortcut?: Maybe<Scalars['String']['output']>;
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

export type ObjectEdge = {
  __typename?: 'objectEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the object */
  node: Object;
};

export type ObjectFilter = {
  and?: InputMaybe<Array<ObjectFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  isActive?: InputMaybe<BooleanFieldComparison>;
  isCustom?: InputMaybe<BooleanFieldComparison>;
  isRemote?: InputMaybe<BooleanFieldComparison>;
  isSystem?: InputMaybe<BooleanFieldComparison>;
  or?: InputMaybe<Array<ObjectFilter>>;
};

export type Relation = {
  __typename?: 'relation';
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

export type RelationEdge = {
  __typename?: 'relationEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the relation */
  node: Relation;
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


export type CreateOneObjectMetadataItemMutation = { __typename?: 'Mutation', createOneObject: { __typename?: 'object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null } };

export type CreateOneFieldMetadataItemMutationVariables = Exact<{
  input: CreateOneFieldMetadataInput;
}>;


export type CreateOneFieldMetadataItemMutation = { __typename?: 'Mutation', createOneField: { __typename?: 'field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null, defaultValue?: any | null, options?: any | null } };

export type CreateOneRelationMetadataMutationVariables = Exact<{
  input: CreateOneRelationInput;
}>;


export type CreateOneRelationMetadataMutation = { __typename?: 'Mutation', createOneRelation: { __typename?: 'relation', id: any, relationType: RelationMetadataType, fromObjectMetadataId: string, toObjectMetadataId: string, fromFieldMetadataId: string, toFieldMetadataId: string, createdAt: any, updatedAt: any } };

export type UpdateOneFieldMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID']['input'];
  updatePayload: UpdateFieldInput;
}>;


export type UpdateOneFieldMetadataItemMutation = { __typename?: 'Mutation', updateOneField: { __typename?: 'field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null, isLabelSyncedWithName?: boolean | null } };

export type UpdateOneObjectMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID']['input'];
  updatePayload: UpdateObjectPayload;
}>;


export type UpdateOneObjectMetadataItemMutation = { __typename?: 'Mutation', updateOneObject: { __typename?: 'object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null } };

export type DeleteOneObjectMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID']['input'];
}>;


export type DeleteOneObjectMetadataItemMutation = { __typename?: 'Mutation', deleteOneObject: { __typename?: 'object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null } };

export type DeleteOneFieldMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID']['input'];
}>;


export type DeleteOneFieldMetadataItemMutation = { __typename?: 'Mutation', deleteOneField: { __typename?: 'field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null } };

export type DeleteOneRelationMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID']['input'];
}>;


export type DeleteOneRelationMetadataItemMutation = { __typename?: 'Mutation', deleteOneRelation: { __typename?: 'relation', id: any } };

export type ObjectMetadataItemsQueryVariables = Exact<{
  objectFilter?: InputMaybe<ObjectFilter>;
  fieldFilter?: InputMaybe<FieldFilter>;
}>;


export type ObjectMetadataItemsQuery = { __typename?: 'Query', objects: { __typename?: 'ObjectConnection', edges: Array<{ __typename?: 'objectEdge', node: { __typename?: 'object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isRemote: boolean, isActive: boolean, isSystem: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, shortcut?: string | null, isLabelSyncedWithName: boolean, indexMetadatas: { __typename?: 'ObjectIndexMetadatasConnection', edges: Array<{ __typename?: 'indexEdge', node: { __typename?: 'index', id: any, createdAt: any, updatedAt: any, name: string, indexWhereClause?: string | null, indexType: IndexType, isUnique: boolean, indexFieldMetadatas: { __typename?: 'IndexIndexFieldMetadatasConnection', edges: Array<{ __typename?: 'indexFieldEdge', node: { __typename?: 'indexField', id: any, createdAt: any, updatedAt: any, order: number, fieldMetadataId: any } }> } } }> }, fields: { __typename?: 'ObjectFieldsConnection', edges: Array<{ __typename?: 'fieldEdge', node: { __typename?: 'field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isSystem?: boolean | null, isNullable?: boolean | null, isUnique?: boolean | null, createdAt: any, updatedAt: any, defaultValue?: any | null, options?: any | null, settings?: any | null, isLabelSyncedWithName?: boolean | null, relationDefinition?: { __typename?: 'RelationDefinition', relationId: any, direction: RelationDefinitionType, sourceObjectMetadata: { __typename?: 'object', id: any, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'field', id: any, name: string }, targetObjectMetadata: { __typename?: 'object', id: any, nameSingular: string, namePlural: string }, targetFieldMetadata: { __typename?: 'field', id: any, name: string } } | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: any | null, endCursor?: any | null } } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: any | null, endCursor?: any | null } } };

export type ServerlessFunctionFieldsFragment = { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any };

export type CreateOneServerlessFunctionItemMutationVariables = Exact<{
  input: CreateServerlessFunctionInput;
}>;


export type CreateOneServerlessFunctionItemMutation = { __typename?: 'Mutation', createOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type DeleteOneServerlessFunctionMutationVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type DeleteOneServerlessFunctionMutation = { __typename?: 'Mutation', deleteOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type ExecuteOneServerlessFunctionMutationVariables = Exact<{
  input: ExecuteServerlessFunctionInput;
}>;


export type ExecuteOneServerlessFunctionMutation = { __typename?: 'Mutation', executeOneServerlessFunction: { __typename?: 'ServerlessFunctionExecutionResult', data?: any | null, duration: number, status: ServerlessFunctionExecutionStatus, error?: any | null } };

export type PublishOneServerlessFunctionMutationVariables = Exact<{
  input: PublishServerlessFunctionInput;
}>;


export type PublishOneServerlessFunctionMutation = { __typename?: 'Mutation', publishServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type UpdateOneServerlessFunctionMutationVariables = Exact<{
  input: UpdateServerlessFunctionInput;
}>;


export type UpdateOneServerlessFunctionMutation = { __typename?: 'Mutation', updateOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type FindManyAvailablePackagesQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type FindManyAvailablePackagesQuery = { __typename?: 'Query', getAvailablePackages: any };

export type GetManyServerlessFunctionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetManyServerlessFunctionsQuery = { __typename?: 'Query', findManyServerlessFunctions: Array<{ __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any }> };

export type GetOneServerlessFunctionQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type GetOneServerlessFunctionQuery = { __typename?: 'Query', findOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, syncStatus: ServerlessFunctionSyncStatus, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type FindOneServerlessFunctionSourceCodeQueryVariables = Exact<{
  input: GetServerlessFunctionSourceCodeInput;
}>;


export type FindOneServerlessFunctionSourceCodeQuery = { __typename?: 'Query', getServerlessFunctionSourceCode?: any | null };

export const RemoteServerFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<RemoteServerFieldsFragment, unknown>;
export const RemoteTableFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<RemoteTableFieldsFragment, unknown>;
export const ServerlessFunctionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ServerlessFunctionFieldsFragment, unknown>;
export const CreateServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRemoteServerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<CreateServerMutation, CreateServerMutationVariables>;
export const DeleteServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteServerMutation, DeleteServerMutationVariables>;
export const SyncRemoteTableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"syncRemoteTable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncRemoteTable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<SyncRemoteTableMutation, SyncRemoteTableMutationVariables>;
export const SyncRemoteTableSchemaChangesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"syncRemoteTableSchemaChanges"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncRemoteTableSchemaChanges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<SyncRemoteTableSchemaChangesMutation, SyncRemoteTableSchemaChangesMutationVariables>;
export const UnsyncRemoteTableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"unsyncRemoteTable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsyncRemoteTable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<UnsyncRemoteTableMutation, UnsyncRemoteTableMutationVariables>;
export const UpdateServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRemoteServerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<UpdateServerMutation, UpdateServerMutationVariables>;
export const GetManyDatabaseConnectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyDatabaseConnections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerTypeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findManyRemoteServersByType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<GetManyDatabaseConnectionsQuery, GetManyDatabaseConnectionsQueryVariables>;
export const GetManyRemoteTablesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyRemoteTables"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FindManyRemoteTablesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findDistantTablesWithStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<GetManyRemoteTablesQuery, GetManyRemoteTablesQueryVariables>;
export const GetOneDatabaseConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOneDatabaseConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findOneRemoteServerById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<GetOneDatabaseConnectionQuery, GetOneDatabaseConnectionQueryVariables>;
export const CreateOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneObjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}}]}}]}}]} as unknown as DocumentNode<CreateOneObjectMetadataItemMutation, CreateOneObjectMetadataItemMutationVariables>;
export const CreateOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneFieldMetadataInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"options"}}]}}]}}]} as unknown as DocumentNode<CreateOneFieldMetadataItemMutation, CreateOneFieldMetadataItemMutationVariables>;
export const CreateOneRelationMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneRelationMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneRelationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneRelation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"relationType"}},{"kind":"Field","name":{"kind":"Name","value":"fromObjectMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"toObjectMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"fromFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"toFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateOneRelationMetadataMutation, CreateOneRelationMetadataMutationVariables>;
export const UpdateOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"update"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<UpdateOneFieldMetadataItemMutation, UpdateOneFieldMetadataItemMutationVariables>;
export const UpdateOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateObjectPayload"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"update"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}}]}}]}}]} as unknown as DocumentNode<UpdateOneObjectMetadataItemMutation, UpdateOneObjectMetadataItemMutationVariables>;
export const DeleteOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}}]}}]}}]} as unknown as DocumentNode<DeleteOneObjectMetadataItemMutation, DeleteOneObjectMetadataItemMutationVariables>;
export const DeleteOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}}]}}]}}]} as unknown as DocumentNode<DeleteOneFieldMetadataItemMutation, DeleteOneFieldMetadataItemMutationVariables>;
export const DeleteOneRelationMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneRelationMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneRelation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteOneRelationMetadataItemMutation, DeleteOneRelationMetadataItemMutationVariables>;
export const ObjectMetadataItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ObjectMetadataItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"objectFilter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"objectFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fieldFilter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"fieldFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"objectFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isRemote"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSystem"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"shortcut"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}},{"kind":"Field","name":{"kind":"Name","value":"indexMetadatas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"indexWhereClause"}},{"kind":"Field","name":{"kind":"Name","value":"indexType"}},{"kind":"Field","name":{"kind":"Name","value":"isUnique"}},{"kind":"Field","name":{"kind":"Name","value":"indexFieldMetadatas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"fieldMetadataId"}}]}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fieldFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSystem"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"isUnique"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}},{"kind":"Field","name":{"kind":"Name","value":"relationDefinition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"relationId"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"sourceObjectMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceFieldMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"targetObjectMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}}]}},{"kind":"Field","name":{"kind":"Name","value":"targetFieldMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>;
export const CreateOneServerlessFunctionItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneServerlessFunctionItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateOneServerlessFunctionItemMutation, CreateOneServerlessFunctionItemMutationVariables>;
export const DeleteOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<DeleteOneServerlessFunctionMutation, DeleteOneServerlessFunctionMutationVariables>;
export const ExecuteOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExecuteOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExecuteServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"executeOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<ExecuteOneServerlessFunctionMutation, ExecuteOneServerlessFunctionMutationVariables>;
export const PublishOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublishServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PublishOneServerlessFunctionMutation, PublishOneServerlessFunctionMutationVariables>;
export const UpdateOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateOneServerlessFunctionMutation, UpdateOneServerlessFunctionMutationVariables>;
export const FindManyAvailablePackagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindManyAvailablePackages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAvailablePackages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<FindManyAvailablePackagesQuery, FindManyAvailablePackagesQueryVariables>;
export const GetManyServerlessFunctionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyServerlessFunctions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findManyServerlessFunctions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetManyServerlessFunctionsQuery, GetManyServerlessFunctionsQueryVariables>;
export const GetOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"syncStatus"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetOneServerlessFunctionQuery, GetOneServerlessFunctionQueryVariables>;
export const FindOneServerlessFunctionSourceCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindOneServerlessFunctionSourceCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetServerlessFunctionSourceCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getServerlessFunctionSourceCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<FindOneServerlessFunctionSourceCodeQuery, FindOneServerlessFunctionSourceCodeQueryVariables>;
