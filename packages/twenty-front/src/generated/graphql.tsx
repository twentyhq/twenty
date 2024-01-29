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
  Upload: any;
};

export type Analytics = {
  __typename?: 'Analytics';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type ApiKeyToken = {
  __typename?: 'ApiKeyToken';
  token: Scalars['String'];
};

export type AuthProviders = {
  __typename?: 'AuthProviders';
  google: Scalars['Boolean'];
  magicLink: Scalars['Boolean'];
  password: Scalars['Boolean'];
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

export type Billing = {
  __typename?: 'Billing';
  billingUrl: Scalars['String'];
  isBillingEnabled: Scalars['Boolean'];
};

export type BooleanFieldComparison = {
  is?: InputMaybe<Scalars['Boolean']>;
  isNot?: InputMaybe<Scalars['Boolean']>;
};

export type ClientConfig = {
  __typename?: 'ClientConfig';
  authProviders: AuthProviders;
  billing: Billing;
  debugMode: Scalars['Boolean'];
  sentry: Sentry;
  signInPrefilled: Scalars['Boolean'];
  signUpDisabled: Scalars['Boolean'];
  support: Support;
  telemetry: Telemetry;
};

export type CreateOneRefreshTokenInput = {
  /** The record to create */
  refreshToken: CreateRefreshTokenInput;
};

export type CreateRefreshTokenInput = {
  expiresAt: Scalars['DateTime'];
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

export type EmailPasswordResetLink = {
  __typename?: 'EmailPasswordResetLink';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  id: Scalars['ID'];
  key: Scalars['String'];
  value: Scalars['Boolean'];
  workspaceId: Scalars['String'];
};

export type FeatureFlagFilter = {
  and?: InputMaybe<Array<FeatureFlagFilter>>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<FeatureFlagFilter>>;
};

export type FeatureFlagSort = {
  direction: SortDirection;
  field: FeatureFlagSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export enum FeatureFlagSortFields {
  Id = 'id'
}

export type FieldConnection = {
  __typename?: 'FieldConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int'];
};

export type FieldDeleteResponse = {
  __typename?: 'FieldDeleteResponse';
  createdAt?: Maybe<Scalars['DateTime']>;
  defaultValue?: Maybe<Scalars['JSON']>;
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  isActive?: Maybe<Scalars['Boolean']>;
  isCustom?: Maybe<Scalars['Boolean']>;
  isNullable?: Maybe<Scalars['Boolean']>;
  isSystem?: Maybe<Scalars['Boolean']>;
  label?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['JSON']>;
  type?: Maybe<FieldMetadataType>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** Type of the field */
export enum FieldMetadataType {
  Boolean = 'BOOLEAN',
  Currency = 'CURRENCY',
  DateTime = 'DATE_TIME',
  Email = 'EMAIL',
  FullName = 'FULL_NAME',
  Link = 'LINK',
  MultiSelect = 'MULTI_SELECT',
  Number = 'NUMBER',
  Numeric = 'NUMERIC',
  Phone = 'PHONE',
  Probability = 'PROBABILITY',
  Rating = 'RATING',
  Relation = 'RELATION',
  Select = 'SELECT',
  Text = 'TEXT',
  Uuid = 'UUID'
}

export enum FileFolder {
  Attachment = 'Attachment',
  PersonPicture = 'PersonPicture',
  ProfilePicture = 'ProfilePicture',
  WorkspaceLogo = 'WorkspaceLogo'
}

export type FullName = {
  __typename?: 'FullName';
  firstName: Scalars['String'];
  lastName: Scalars['String'];
};

export type IdFilterComparison = {
  eq?: InputMaybe<Scalars['ID']>;
  gt?: InputMaybe<Scalars['ID']>;
  gte?: InputMaybe<Scalars['ID']>;
  iLike?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<Array<Scalars['ID']>>;
  is?: InputMaybe<Scalars['Boolean']>;
  isNot?: InputMaybe<Scalars['Boolean']>;
  like?: InputMaybe<Scalars['ID']>;
  lt?: InputMaybe<Scalars['ID']>;
  lte?: InputMaybe<Scalars['ID']>;
  neq?: InputMaybe<Scalars['ID']>;
  notILike?: InputMaybe<Scalars['ID']>;
  notIn?: InputMaybe<Array<Scalars['ID']>>;
  notLike?: InputMaybe<Scalars['ID']>;
};

export type InvalidatePassword = {
  __typename?: 'InvalidatePassword';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type LoginToken = {
  __typename?: 'LoginToken';
  loginToken: AuthToken;
};

export type Mutation = {
  __typename?: 'Mutation';
  challenge: LoginToken;
  createEvent: Analytics;
  createOneObject: Object;
  createOneRefreshToken: RefreshToken;
  deleteCurrentWorkspace: Workspace;
  deleteOneObject: ObjectDeleteResponse;
  deleteUser: User;
  emailPasswordResetLink: EmailPasswordResetLink;
  generateApiKeyToken: ApiKeyToken;
  generateTransientToken: TransientToken;
  impersonate: Verify;
  renewToken: AuthTokens;
  signUp: LoginToken;
  updateOneObject: Object;
  updatePasswordViaResetToken: InvalidatePassword;
  updateWorkspace: Workspace;
  uploadFile: Scalars['String'];
  uploadImage: Scalars['String'];
  uploadProfilePicture: Scalars['String'];
  uploadWorkspaceLogo: Scalars['String'];
  verify: Verify;
};


export type MutationChallengeArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCreateEventArgs = {
  data: Scalars['JSON'];
  type: Scalars['String'];
};


export type MutationCreateOneRefreshTokenArgs = {
  input: CreateOneRefreshTokenInput;
};


export type MutationGenerateApiKeyTokenArgs = {
  apiKeyId: Scalars['String'];
  expiresAt: Scalars['String'];
};


export type MutationImpersonateArgs = {
  userId: Scalars['String'];
};


export type MutationRenewTokenArgs = {
  refreshToken: Scalars['String'];
};


export type MutationSignUpArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String'];
  passwordResetToken: Scalars['String'];
};


export type MutationUpdateWorkspaceArgs = {
  data: UpdateWorkspaceInput;
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


export type MutationVerifyArgs = {
  loginToken: Scalars['String'];
};

export type ObjectConnection = {
  __typename?: 'ObjectConnection';
  /** Array of edges. */
  edges: Array<ObjectEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int'];
};

export type ObjectDeleteResponse = {
  __typename?: 'ObjectDeleteResponse';
  createdAt?: Maybe<Scalars['DateTime']>;
  dataSourceId?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  imageIdentifierFieldMetadataId?: Maybe<Scalars['String']>;
  isActive?: Maybe<Scalars['Boolean']>;
  isCustom?: Maybe<Scalars['Boolean']>;
  isSystem?: Maybe<Scalars['Boolean']>;
  labelIdentifierFieldMetadataId?: Maybe<Scalars['String']>;
  labelPlural?: Maybe<Scalars['String']>;
  labelSingular?: Maybe<Scalars['String']>;
  namePlural?: Maybe<Scalars['String']>;
  nameSingular?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type ObjectFieldsConnection = {
  __typename?: 'ObjectFieldsConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int'];
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

export type Query = {
  __typename?: 'Query';
  checkUserExists: UserExists;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  clientConfig: ClientConfig;
  currentUser: User;
  currentWorkspace: Workspace;
  findWorkspaceFromInviteHash: Workspace;
  getTimelineThreadsFromCompanyId: Array<TimelineThread>;
  getTimelineThreadsFromPersonId: Array<TimelineThread>;
  object: Object;
  objects: ObjectConnection;
  validatePasswordResetToken: ValidatePasswordResetToken;
};


export type QueryCheckUserExistsArgs = {
  email: Scalars['String'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String'];
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String'];
};


export type QueryGetTimelineThreadsFromCompanyIdArgs = {
  companyId: Scalars['ID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
};


export type QueryGetTimelineThreadsFromPersonIdArgs = {
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
  personId: Scalars['ID'];
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String'];
};

export type RefreshToken = {
  __typename?: 'RefreshToken';
  createdAt: Scalars['DateTime'];
  expiresAt: Scalars['DateTime'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

export type RefreshTokenEdge = {
  __typename?: 'RefreshTokenEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the RefreshToken */
  node: RefreshToken;
};

export type RelationConnection = {
  __typename?: 'RelationConnection';
  /** Array of edges. */
  edges: Array<RelationEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int'];
};

export type RelationDeleteResponse = {
  __typename?: 'RelationDeleteResponse';
  createdAt?: Maybe<Scalars['DateTime']>;
  fromFieldMetadataId?: Maybe<Scalars['String']>;
  fromObjectMetadataId?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  relationType?: Maybe<RelationMetadataType>;
  toFieldMetadataId?: Maybe<Scalars['String']>;
  toObjectMetadataId?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** Type of the relation */
export enum RelationMetadataType {
  ManyToMany = 'MANY_TO_MANY',
  OneToMany = 'ONE_TO_MANY',
  OneToOne = 'ONE_TO_ONE'
}

export type Sentry = {
  __typename?: 'Sentry';
  dsn?: Maybe<Scalars['String']>;
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

export type Support = {
  __typename?: 'Support';
  supportDriver: Scalars['String'];
  supportFrontChatId?: Maybe<Scalars['String']>;
};

export type Telemetry = {
  __typename?: 'Telemetry';
  anonymizationEnabled: Scalars['Boolean'];
  enabled: Scalars['Boolean'];
};

export type TimelineThread = {
  __typename?: 'TimelineThread';
  firstParticipant: TimelineThreadParticipant;
  id: Scalars['ID'];
  lastMessageBody: Scalars['String'];
  lastMessageReceivedAt: Scalars['DateTime'];
  lastTwoParticipants: Array<TimelineThreadParticipant>;
  numberOfMessagesInThread: Scalars['Float'];
  participantCount: Scalars['Float'];
  read: Scalars['Boolean'];
  subject: Scalars['String'];
};

export type TimelineThreadParticipant = {
  __typename?: 'TimelineThreadParticipant';
  avatarUrl: Scalars['String'];
  displayName: Scalars['String'];
  firstName: Scalars['String'];
  handle: Scalars['String'];
  lastName: Scalars['String'];
  personId?: Maybe<Scalars['ID']>;
  workspaceMemberId?: Maybe<Scalars['ID']>;
};

export type TransientToken = {
  __typename?: 'TransientToken';
  transientToken: AuthToken;
};

export type UpdateWorkspaceInput = {
  allowImpersonation?: InputMaybe<Scalars['Boolean']>;
  displayName?: InputMaybe<Scalars['String']>;
  domainName?: InputMaybe<Scalars['String']>;
  inviteHash?: InputMaybe<Scalars['String']>;
  logo?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  canImpersonate: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  defaultWorkspace: Workspace;
  deletedAt?: Maybe<Scalars['DateTime']>;
  disabled?: Maybe<Scalars['Boolean']>;
  email: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  passwordHash?: Maybe<Scalars['String']>;
  passwordResetToken?: Maybe<Scalars['String']>;
  passwordResetTokenExpiresAt?: Maybe<Scalars['DateTime']>;
  supportUserHash?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  workspaceMember: WorkspaceMember;
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
  exists: Scalars['Boolean'];
};

export type ValidatePasswordResetToken = {
  __typename?: 'ValidatePasswordResetToken';
  email: Scalars['String'];
  id: Scalars['String'];
};

export type Verify = {
  __typename?: 'Verify';
  tokens: AuthTokenPair;
  user: User;
};

export type Workspace = {
  __typename?: 'Workspace';
  allowImpersonation: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  displayName?: Maybe<Scalars['String']>;
  domainName?: Maybe<Scalars['String']>;
  featureFlags?: Maybe<Array<FeatureFlag>>;
  id: Scalars['ID'];
  inviteHash?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
  subscriptionStatus: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


export type WorkspaceFeatureFlagsArgs = {
  filter?: FeatureFlagFilter;
  sorting?: Array<FeatureFlagSort>;
};

export type WorkspaceEdge = {
  __typename?: 'WorkspaceEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the Workspace */
  node: Workspace;
};

export type WorkspaceInviteHashValid = {
  __typename?: 'WorkspaceInviteHashValid';
  isValid: Scalars['Boolean'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']>;
  colorScheme: Scalars['String'];
  id: Scalars['ID'];
  locale: Scalars['String'];
  name: FullName;
};

export type Field = {
  __typename?: 'field';
  createdAt: Scalars['DateTime'];
  defaultValue?: Maybe<Scalars['JSON']>;
  description?: Maybe<Scalars['String']>;
  fromRelationMetadata?: Maybe<Relation>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  isActive?: Maybe<Scalars['Boolean']>;
  isCustom?: Maybe<Scalars['Boolean']>;
  isNullable?: Maybe<Scalars['Boolean']>;
  isSystem?: Maybe<Scalars['Boolean']>;
  label: Scalars['String'];
  name: Scalars['String'];
  options?: Maybe<Scalars['JSON']>;
  toRelationMetadata?: Maybe<Relation>;
  type: FieldMetadataType;
  updatedAt: Scalars['DateTime'];
};

export type FieldEdge = {
  __typename?: 'fieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the field */
  node: Field;
};

export type FieldFilter = {
  and?: InputMaybe<Array<FieldFilter>>;
  id?: InputMaybe<IdFilterComparison>;
  isActive?: InputMaybe<BooleanFieldComparison>;
  isCustom?: InputMaybe<BooleanFieldComparison>;
  isSystem?: InputMaybe<BooleanFieldComparison>;
  or?: InputMaybe<Array<FieldFilter>>;
};

export type Object = {
  __typename?: 'object';
  createdAt: Scalars['DateTime'];
  dataSourceId: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  fields: ObjectFieldsConnection;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  imageIdentifierFieldMetadataId?: Maybe<Scalars['String']>;
  isActive: Scalars['Boolean'];
  isCustom: Scalars['Boolean'];
  isSystem: Scalars['Boolean'];
  labelIdentifierFieldMetadataId?: Maybe<Scalars['String']>;
  labelPlural: Scalars['String'];
  labelSingular: Scalars['String'];
  namePlural: Scalars['String'];
  nameSingular: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


export type ObjectFieldsArgs = {
  filter?: FieldFilter;
  paging?: CursorPaging;
};

export type ObjectEdge = {
  __typename?: 'objectEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the object */
  node: Object;
};

export type Relation = {
  __typename?: 'relation';
  createdAt: Scalars['DateTime'];
  fromFieldMetadataId: Scalars['String'];
  fromObjectMetadata: Object;
  fromObjectMetadataId: Scalars['String'];
  id: Scalars['ID'];
  relationType: RelationMetadataType;
  toFieldMetadataId: Scalars['String'];
  toObjectMetadata: Object;
  toObjectMetadataId: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type RelationEdge = {
  __typename?: 'relationEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the relation */
  node: Relation;
};

export type ParticipantFragmentFragment = { __typename?: 'TimelineThreadParticipant', personId?: string | null, workspaceMemberId?: string | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string };

export type TimelineThreadFragmentFragment = { __typename?: 'TimelineThread', id: string, read: boolean, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: string | null, workspaceMemberId?: string | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: string | null, workspaceMemberId?: string | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> };

export type GetTimelineThreadsFromCompanyIdQueryVariables = Exact<{
  companyId: Scalars['ID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineThreadsFromCompanyIdQuery = { __typename?: 'Query', getTimelineThreadsFromCompanyId: Array<{ __typename?: 'TimelineThread', id: string, read: boolean, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: string | null, workspaceMemberId?: string | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: string | null, workspaceMemberId?: string | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> };

export type GetTimelineThreadsFromPersonIdQueryVariables = Exact<{
  personId: Scalars['ID'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
}>;


export type GetTimelineThreadsFromPersonIdQuery = { __typename?: 'Query', getTimelineThreadsFromPersonId: Array<{ __typename?: 'TimelineThread', id: string, read: boolean, lastMessageReceivedAt: string, lastMessageBody: string, subject: string, numberOfMessagesInThread: number, participantCount: number, firstParticipant: { __typename?: 'TimelineThreadParticipant', personId?: string | null, workspaceMemberId?: string | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }, lastTwoParticipants: Array<{ __typename?: 'TimelineThreadParticipant', personId?: string | null, workspaceMemberId?: string | null, firstName: string, lastName: string, displayName: string, avatarUrl: string, handle: string }> }> };

export type CreateEventMutationVariables = Exact<{
  type: Scalars['String'];
  data: Scalars['JSON'];
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Analytics', success: boolean } };

export type AuthTokenFragmentFragment = { __typename?: 'AuthToken', token: string, expiresAt: string };

export type AuthTokensFragmentFragment = { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } };

export type ChallengeMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type ChallengeMutation = { __typename?: 'Mutation', challenge: { __typename?: 'LoginToken', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } };

export type EmailPasswordResetLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type EmailPasswordResetLinkMutation = { __typename?: 'Mutation', emailPasswordResetLink: { __typename?: 'EmailPasswordResetLink', success: boolean } };

export type GenerateApiKeyTokenMutationVariables = Exact<{
  apiKeyId: Scalars['String'];
  expiresAt: Scalars['String'];
}>;


export type GenerateApiKeyTokenMutation = { __typename?: 'Mutation', generateApiKeyToken: { __typename?: 'ApiKeyToken', token: string } };

export type GenerateTransientTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateTransientTokenMutation = { __typename?: 'Mutation', generateTransientToken: { __typename?: 'TransientToken', transientToken: { __typename?: 'AuthToken', token: string } } };

export type ImpersonateMutationVariables = Exact<{
  userId: Scalars['String'];
}>;


export type ImpersonateMutation = { __typename?: 'Mutation', impersonate: { __typename?: 'Verify', user: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string, canImpersonate: boolean, supportUserHash?: string | null, workspaceMember: { __typename?: 'WorkspaceMember', id: string, colorScheme: string, avatarUrl?: string | null, locale: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }, defaultWorkspace: { __typename?: 'Workspace', id: string, displayName?: string | null, logo?: string | null, domainName?: string | null, inviteHash?: string | null, allowImpersonation: boolean, subscriptionStatus: string, featureFlags?: Array<{ __typename?: 'FeatureFlag', id: string, key: string, value: boolean, workspaceId: string }> | null } }, tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type RenewTokenMutationVariables = Exact<{
  refreshToken: Scalars['String'];
}>;


export type RenewTokenMutation = { __typename?: 'Mutation', renewToken: { __typename?: 'AuthTokens', tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type SignUpMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'LoginToken', loginToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } };

export type UpdatePasswordViaResetTokenMutationVariables = Exact<{
  token: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type UpdatePasswordViaResetTokenMutation = { __typename?: 'Mutation', updatePasswordViaResetToken: { __typename?: 'InvalidatePassword', success: boolean } };

export type VerifyMutationVariables = Exact<{
  loginToken: Scalars['String'];
}>;


export type VerifyMutation = { __typename?: 'Mutation', verify: { __typename?: 'Verify', user: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string, canImpersonate: boolean, supportUserHash?: string | null, workspaceMember: { __typename?: 'WorkspaceMember', id: string, colorScheme: string, avatarUrl?: string | null, locale: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }, defaultWorkspace: { __typename?: 'Workspace', id: string, displayName?: string | null, logo?: string | null, domainName?: string | null, inviteHash?: string | null, allowImpersonation: boolean, subscriptionStatus: string, featureFlags?: Array<{ __typename?: 'FeatureFlag', id: string, key: string, value: boolean, workspaceId: string }> | null } }, tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type CheckUserExistsQueryVariables = Exact<{
  email: Scalars['String'];
}>;


export type CheckUserExistsQuery = { __typename?: 'Query', checkUserExists: { __typename?: 'UserExists', exists: boolean } };

export type ValidatePasswordResetTokenQueryVariables = Exact<{
  token: Scalars['String'];
}>;


export type ValidatePasswordResetTokenQuery = { __typename?: 'Query', validatePasswordResetToken: { __typename?: 'ValidatePasswordResetToken', id: string, email: string } };

export type GetClientConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClientConfigQuery = { __typename?: 'Query', clientConfig: { __typename?: 'ClientConfig', signInPrefilled: boolean, signUpDisabled: boolean, debugMode: boolean, authProviders: { __typename?: 'AuthProviders', google: boolean, password: boolean }, billing: { __typename?: 'Billing', isBillingEnabled: boolean, billingUrl: string }, telemetry: { __typename?: 'Telemetry', enabled: boolean, anonymizationEnabled: boolean }, support: { __typename?: 'Support', supportDriver: string, supportFrontChatId?: string | null }, sentry: { __typename?: 'Sentry', dsn?: string | null } } };

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

export type UserQueryFragmentFragment = { __typename?: 'User', id: string, firstName: string, lastName: string, email: string, canImpersonate: boolean, supportUserHash?: string | null, workspaceMember: { __typename?: 'WorkspaceMember', id: string, colorScheme: string, avatarUrl?: string | null, locale: string, name: { __typename?: 'FullName', firstName: string, lastName: string } }, defaultWorkspace: { __typename?: 'Workspace', id: string, displayName?: string | null, logo?: string | null, domainName?: string | null, inviteHash?: string | null, allowImpersonation: boolean, subscriptionStatus: string, featureFlags?: Array<{ __typename?: 'FeatureFlag', id: string, key: string, value: boolean, workspaceId: string }> | null } };

export type DeleteUserAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserAccountMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'User', id: string } };

export type UploadProfilePictureMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadProfilePictureMutation = { __typename?: 'Mutation', uploadProfilePicture: string };

export type DeleteCurrentWorkspaceMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteCurrentWorkspaceMutation = { __typename?: 'Mutation', deleteCurrentWorkspace: { __typename?: 'Workspace', id: string } };

export type UpdateWorkspaceMutationVariables = Exact<{
  input: UpdateWorkspaceInput;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: string, domainName?: string | null, displayName?: string | null, logo?: string | null, allowImpersonation: boolean, subscriptionStatus: string } };

export type UploadWorkspaceLogoMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadWorkspaceLogoMutation = { __typename?: 'Mutation', uploadWorkspaceLogo: string };

export type GetWorkspaceFromInviteHashQueryVariables = Exact<{
  inviteHash: Scalars['String'];
}>;


export type GetWorkspaceFromInviteHashQuery = { __typename?: 'Query', findWorkspaceFromInviteHash: { __typename?: 'Workspace', id: string, displayName?: string | null, logo?: string | null, allowImpersonation: boolean } };

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
export const UserQueryFragmentFragmentDoc = gql`
    fragment UserQueryFragment on User {
  id
  firstName
  lastName
  email
  canImpersonate
  supportUserHash
  workspaceMember {
    id
    name {
      firstName
      lastName
    }
    colorScheme
    avatarUrl
    locale
  }
  defaultWorkspace {
    id
    displayName
    logo
    domainName
    inviteHash
    allowImpersonation
    subscriptionStatus
    featureFlags {
      id
      key
      value
      workspaceId
    }
  }
}
    `;
export const GetTimelineThreadsFromCompanyIdDocument = gql`
    query GetTimelineThreadsFromCompanyId($companyId: ID!, $page: Int!, $pageSize: Int!) {
  getTimelineThreadsFromCompanyId(
    companyId: $companyId
    page: $page
    pageSize: $pageSize
  ) {
    ...TimelineThreadFragment
  }
}
    ${TimelineThreadFragmentFragmentDoc}`;

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
    query GetTimelineThreadsFromPersonId($personId: ID!, $page: Int!, $pageSize: Int!) {
  getTimelineThreadsFromPersonId(
    personId: $personId
    page: $page
    pageSize: $pageSize
  ) {
    ...TimelineThreadFragment
  }
}
    ${TimelineThreadFragmentFragmentDoc}`;

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
export const CreateEventDocument = gql`
    mutation CreateEvent($type: String!, $data: JSON!) {
  createEvent(type: $type, data: $data) {
    success
  }
}
    `;
export type CreateEventMutationFn = Apollo.MutationFunction<CreateEventMutation, CreateEventMutationVariables>;

/**
 * __useCreateEventMutation__
 *
 * To run a mutation, you first call `useCreateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEventMutation, { data, loading, error }] = useCreateEventMutation({
 *   variables: {
 *      type: // value for 'type'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateEventMutation(baseOptions?: Apollo.MutationHookOptions<CreateEventMutation, CreateEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateEventMutation, CreateEventMutationVariables>(CreateEventDocument, options);
      }
export type CreateEventMutationHookResult = ReturnType<typeof useCreateEventMutation>;
export type CreateEventMutationResult = Apollo.MutationResult<CreateEventMutation>;
export type CreateEventMutationOptions = Apollo.BaseMutationOptions<CreateEventMutation, CreateEventMutationVariables>;
export const ChallengeDocument = gql`
    mutation Challenge($email: String!, $password: String!) {
  challenge(email: $email, password: $password) {
    loginToken {
      ...AuthTokenFragment
    }
  }
}
    ${AuthTokenFragmentFragmentDoc}`;
export type ChallengeMutationFn = Apollo.MutationFunction<ChallengeMutation, ChallengeMutationVariables>;

/**
 * __useChallengeMutation__
 *
 * To run a mutation, you first call `useChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [challengeMutation, { data, loading, error }] = useChallengeMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useChallengeMutation(baseOptions?: Apollo.MutationHookOptions<ChallengeMutation, ChallengeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChallengeMutation, ChallengeMutationVariables>(ChallengeDocument, options);
      }
export type ChallengeMutationHookResult = ReturnType<typeof useChallengeMutation>;
export type ChallengeMutationResult = Apollo.MutationResult<ChallengeMutation>;
export type ChallengeMutationOptions = Apollo.BaseMutationOptions<ChallengeMutation, ChallengeMutationVariables>;
export const EmailPasswordResetLinkDocument = gql`
    mutation EmailPasswordResetLink {
  emailPasswordResetLink {
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
export const ImpersonateDocument = gql`
    mutation Impersonate($userId: String!) {
  impersonate(userId: $userId) {
    user {
      ...UserQueryFragment
    }
    tokens {
      ...AuthTokensFragment
    }
  }
}
    ${UserQueryFragmentFragmentDoc}
${AuthTokensFragmentFragmentDoc}`;
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
    mutation RenewToken($refreshToken: String!) {
  renewToken(refreshToken: $refreshToken) {
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
 *      refreshToken: // value for 'refreshToken'
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
export const SignUpDocument = gql`
    mutation SignUp($email: String!, $password: String!, $workspaceInviteHash: String) {
  signUp(
    email: $email
    password: $password
    workspaceInviteHash: $workspaceInviteHash
  ) {
    loginToken {
      ...AuthTokenFragment
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
export const VerifyDocument = gql`
    mutation Verify($loginToken: String!) {
  verify(loginToken: $loginToken) {
    user {
      ...UserQueryFragment
    }
    tokens {
      ...AuthTokensFragment
    }
  }
}
    ${UserQueryFragmentFragmentDoc}
${AuthTokensFragmentFragmentDoc}`;
export type VerifyMutationFn = Apollo.MutationFunction<VerifyMutation, VerifyMutationVariables>;

/**
 * __useVerifyMutation__
 *
 * To run a mutation, you first call `useVerifyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyMutation, { data, loading, error }] = useVerifyMutation({
 *   variables: {
 *      loginToken: // value for 'loginToken'
 *   },
 * });
 */
export function useVerifyMutation(baseOptions?: Apollo.MutationHookOptions<VerifyMutation, VerifyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyMutation, VerifyMutationVariables>(VerifyDocument, options);
      }
export type VerifyMutationHookResult = ReturnType<typeof useVerifyMutation>;
export type VerifyMutationResult = Apollo.MutationResult<VerifyMutation>;
export type VerifyMutationOptions = Apollo.BaseMutationOptions<VerifyMutation, VerifyMutationVariables>;
export const CheckUserExistsDocument = gql`
    query CheckUserExists($email: String!) {
  checkUserExists(email: $email) {
    exists
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
export const ValidatePasswordResetTokenDocument = gql`
    query validatePasswordResetToken($token: String!) {
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
export const GetClientConfigDocument = gql`
    query GetClientConfig {
  clientConfig {
    authProviders {
      google
      password
    }
    billing {
      isBillingEnabled
      billingUrl
    }
    signInPrefilled
    signUpDisabled
    debugMode
    telemetry {
      enabled
      anonymizationEnabled
    }
    support {
      supportDriver
      supportFrontChatId
    }
    sentry {
      dsn
    }
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
    domainName
    displayName
    logo
    allowImpersonation
    subscriptionStatus
  }
}
    `;
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