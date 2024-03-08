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
  BigFloat: any;
  ConnectionCursor: any;
  Cursor: any;
  Date: any;
  DateTime: any;
  JSON: any;
  UUID: any;
  Upload: any;
};

export type ActivateWorkspaceInput = {
  displayName?: InputMaybe<Scalars['String']>;
};

/** An activity */
export type Activity = {
  /** Activity targets */
  activityTargets?: Maybe<ActivityTargetConnection>;
  /** Acitivity assignee */
  assignee?: Maybe<WorkspaceMember>;
  /** Acitivity assignee id foreign key */
  assigneeId?: Maybe<Scalars['ID']>;
  /** Activity attachments */
  attachments?: Maybe<AttachmentConnection>;
  /** Activity author */
  author?: Maybe<WorkspaceMember>;
  /** Activity author id foreign key */
  authorId: Scalars['ID'];
  /** Activity body */
  body: Scalars['String'];
  /** Activity comments */
  comments?: Maybe<CommentConnection>;
  /** Activity completion date */
  completedAt?: Maybe<Scalars['DateTime']>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Activity due date */
  dueAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Activity reminder date */
  reminderAt?: Maybe<Scalars['DateTime']>;
  /** Activity title */
  title: Scalars['String'];
  /** Activity type */
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** An activity */
export type ActivityActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ActivityTargetOrderByInput>;
};


/** An activity */
export type ActivityAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<AttachmentOrderByInput>;
};


/** An activity */
export type ActivityCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CommentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<CommentOrderByInput>;
};

/** An activity */
export type ActivityConnection = {
  edges: Array<ActivityEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An activity */
export type ActivityCreateInput = {
  /** Acitivity assignee id foreign key */
  assigneeId?: InputMaybe<Scalars['ID']>;
  /** Activity author id foreign key */
  authorId: Scalars['ID'];
  /** Activity body */
  body?: InputMaybe<Scalars['String']>;
  /** Activity completion date */
  completedAt?: InputMaybe<Scalars['DateTime']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Activity due date */
  dueAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Activity reminder date */
  reminderAt?: InputMaybe<Scalars['DateTime']>;
  /** Activity title */
  title?: InputMaybe<Scalars['String']>;
  /** Activity type */
  type?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An activity */
export type ActivityEdge = {
  cursor: Scalars['Cursor'];
  node: Activity;
};

/** An activity */
export type ActivityFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ActivityFilterInput>>>;
  /** Acitivity assignee id foreign key */
  assigneeId?: InputMaybe<UuidFilter>;
  /** Activity author id foreign key */
  authorId?: InputMaybe<UuidFilter>;
  /** Activity body */
  body?: InputMaybe<StringFilter>;
  /** Activity completion date */
  completedAt?: InputMaybe<DateFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** Activity due date */
  dueAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<ActivityFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ActivityFilterInput>>>;
  /** Activity reminder date */
  reminderAt?: InputMaybe<DateFilter>;
  /** Activity title */
  title?: InputMaybe<StringFilter>;
  /** Activity type */
  type?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** An activity */
export type ActivityOrderByInput = {
  /** Acitivity assignee id foreign key */
  assigneeId?: InputMaybe<OrderByDirection>;
  /** Activity author id foreign key */
  authorId?: InputMaybe<OrderByDirection>;
  /** Activity body */
  body?: InputMaybe<OrderByDirection>;
  /** Activity completion date */
  completedAt?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** Activity due date */
  dueAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Activity reminder date */
  reminderAt?: InputMaybe<OrderByDirection>;
  /** Activity title */
  title?: InputMaybe<OrderByDirection>;
  /** Activity type */
  type?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** An activity target */
export type ActivityTarget = {
  /** ActivityTarget activity */
  activity?: Maybe<Activity>;
  /** ActivityTarget activity id foreign key */
  activityId?: Maybe<Scalars['ID']>;
  /** ActivityTarget company */
  company?: Maybe<Company>;
  /** ActivityTarget company id foreign key */
  companyId?: Maybe<Scalars['ID']>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** ActivityTarget opportunity */
  opportunity?: Maybe<Opportunity>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: Maybe<Scalars['ID']>;
  /** ActivityTarget person */
  person?: Maybe<Person>;
  /** ActivityTarget person id foreign key */
  personId?: Maybe<Scalars['ID']>;
  updatedAt: Scalars['DateTime'];
};

/** An activity target */
export type ActivityTargetConnection = {
  edges: Array<ActivityTargetEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An activity target */
export type ActivityTargetCreateInput = {
  /** ActivityTarget activity id foreign key */
  activityId?: InputMaybe<Scalars['ID']>;
  /** ActivityTarget company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['ID']>;
  /** ActivityTarget person id foreign key */
  personId?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An activity target */
export type ActivityTargetEdge = {
  cursor: Scalars['Cursor'];
  node: ActivityTarget;
};

/** An activity target */
export type ActivityTargetFilterInput = {
  /** ActivityTarget activity id foreign key */
  activityId?: InputMaybe<UuidFilter>;
  and?: InputMaybe<Array<InputMaybe<ActivityTargetFilterInput>>>;
  /** ActivityTarget company id foreign key */
  companyId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<ActivityTargetFilterInput>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: InputMaybe<UuidFilter>;
  or?: InputMaybe<Array<InputMaybe<ActivityTargetFilterInput>>>;
  /** ActivityTarget person id foreign key */
  personId?: InputMaybe<UuidFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** An activity target */
export type ActivityTargetOrderByInput = {
  /** ActivityTarget activity id foreign key */
  activityId?: InputMaybe<OrderByDirection>;
  /** ActivityTarget company id foreign key */
  companyId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: InputMaybe<OrderByDirection>;
  /** ActivityTarget person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** An activity target */
export type ActivityTargetUpdateInput = {
  /** ActivityTarget activity id foreign key */
  activityId?: InputMaybe<Scalars['ID']>;
  /** ActivityTarget company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['ID']>;
  /** ActivityTarget person id foreign key */
  personId?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An activity */
export type ActivityUpdateInput = {
  /** Acitivity assignee id foreign key */
  assigneeId?: InputMaybe<Scalars['ID']>;
  /** Activity author id foreign key */
  authorId?: InputMaybe<Scalars['ID']>;
  /** Activity body */
  body?: InputMaybe<Scalars['String']>;
  /** Activity completion date */
  completedAt?: InputMaybe<Scalars['DateTime']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Activity due date */
  dueAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Activity reminder date */
  reminderAt?: InputMaybe<Scalars['DateTime']>;
  /** Activity title */
  title?: InputMaybe<Scalars['String']>;
  /** Activity type */
  type?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Analytics = {
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

/** An api key */
export type ApiKey = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** ApiKey expiration date */
  expiresAt: Scalars['DateTime'];
  id: Scalars['ID'];
  /** ApiKey name */
  name: Scalars['String'];
  /** ApiKey revocation date */
  revokedAt?: Maybe<Scalars['DateTime']>;
  updatedAt: Scalars['DateTime'];
};

/** An api key */
export type ApiKeyConnection = {
  edges: Array<ApiKeyEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An api key */
export type ApiKeyCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** ApiKey expiration date */
  expiresAt: Scalars['DateTime'];
  id?: InputMaybe<Scalars['ID']>;
  /** ApiKey name */
  name?: InputMaybe<Scalars['String']>;
  /** ApiKey revocation date */
  revokedAt?: InputMaybe<Scalars['DateTime']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An api key */
export type ApiKeyEdge = {
  cursor: Scalars['Cursor'];
  node: ApiKey;
};

/** An api key */
export type ApiKeyFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ApiKeyFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** ApiKey expiration date */
  expiresAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  /** ApiKey name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<ApiKeyFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ApiKeyFilterInput>>>;
  /** ApiKey revocation date */
  revokedAt?: InputMaybe<DateFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** An api key */
export type ApiKeyOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** ApiKey expiration date */
  expiresAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** ApiKey name */
  name?: InputMaybe<OrderByDirection>;
  /** ApiKey revocation date */
  revokedAt?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type ApiKeyToken = {
  token: Scalars['String'];
};

/** An api key */
export type ApiKeyUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** ApiKey expiration date */
  expiresAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** ApiKey name */
  name?: InputMaybe<Scalars['String']>;
  /** ApiKey revocation date */
  revokedAt?: InputMaybe<Scalars['DateTime']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An attachment */
export type Attachment = {
  /** Attachment activity */
  activity?: Maybe<Activity>;
  /** Attachment activity id foreign key */
  activityId?: Maybe<Scalars['ID']>;
  /** Attachment author */
  author?: Maybe<WorkspaceMember>;
  /** Attachment author id foreign key */
  authorId: Scalars['ID'];
  /** Attachment company */
  company?: Maybe<Company>;
  /** Attachment company id foreign key */
  companyId?: Maybe<Scalars['ID']>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Attachment full path */
  fullPath: Scalars['String'];
  id: Scalars['ID'];
  /** Attachment name */
  name: Scalars['String'];
  /** Attachment opportunity */
  opportunity?: Maybe<Opportunity>;
  /** Attachment opportunity id foreign key */
  opportunityId?: Maybe<Scalars['ID']>;
  /** Attachment person */
  person?: Maybe<Person>;
  /** Attachment person id foreign key */
  personId?: Maybe<Scalars['ID']>;
  /** Attachment type */
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

/** An attachment */
export type AttachmentConnection = {
  edges: Array<AttachmentEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An attachment */
export type AttachmentCreateInput = {
  /** Attachment activity id foreign key */
  activityId?: InputMaybe<Scalars['ID']>;
  /** Attachment author id foreign key */
  authorId: Scalars['ID'];
  /** Attachment company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Attachment full path */
  fullPath?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Attachment name */
  name?: InputMaybe<Scalars['String']>;
  /** Attachment opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['ID']>;
  /** Attachment person id foreign key */
  personId?: InputMaybe<Scalars['ID']>;
  /** Attachment type */
  type?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An attachment */
export type AttachmentEdge = {
  cursor: Scalars['Cursor'];
  node: Attachment;
};

/** An attachment */
export type AttachmentFilterInput = {
  /** Attachment activity id foreign key */
  activityId?: InputMaybe<UuidFilter>;
  and?: InputMaybe<Array<InputMaybe<AttachmentFilterInput>>>;
  /** Attachment author id foreign key */
  authorId?: InputMaybe<UuidFilter>;
  /** Attachment company id foreign key */
  companyId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** Attachment full path */
  fullPath?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Attachment name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<AttachmentFilterInput>;
  /** Attachment opportunity id foreign key */
  opportunityId?: InputMaybe<UuidFilter>;
  or?: InputMaybe<Array<InputMaybe<AttachmentFilterInput>>>;
  /** Attachment person id foreign key */
  personId?: InputMaybe<UuidFilter>;
  /** Attachment type */
  type?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** An attachment */
export type AttachmentOrderByInput = {
  /** Attachment activity id foreign key */
  activityId?: InputMaybe<OrderByDirection>;
  /** Attachment author id foreign key */
  authorId?: InputMaybe<OrderByDirection>;
  /** Attachment company id foreign key */
  companyId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** Attachment full path */
  fullPath?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Attachment name */
  name?: InputMaybe<OrderByDirection>;
  /** Attachment opportunity id foreign key */
  opportunityId?: InputMaybe<OrderByDirection>;
  /** Attachment person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Attachment type */
  type?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** An attachment */
export type AttachmentUpdateInput = {
  /** Attachment activity id foreign key */
  activityId?: InputMaybe<Scalars['ID']>;
  /** Attachment author id foreign key */
  authorId?: InputMaybe<Scalars['ID']>;
  /** Attachment company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Attachment full path */
  fullPath?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Attachment name */
  name?: InputMaybe<Scalars['String']>;
  /** Attachment opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['ID']>;
  /** Attachment person id foreign key */
  personId?: InputMaybe<Scalars['ID']>;
  /** Attachment type */
  type?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type AuthProviders = {
  google: Scalars['Boolean'];
  magicLink: Scalars['Boolean'];
  password: Scalars['Boolean'];
};

export type AuthToken = {
  expiresAt: Scalars['DateTime'];
  token: Scalars['String'];
};

export type AuthTokenPair = {
  accessToken: AuthToken;
  refreshToken: AuthToken;
};

export type AuthTokens = {
  tokens: AuthTokenPair;
};

export type BigFloatFilter = {
  eq?: InputMaybe<Scalars['BigFloat']>;
  gt?: InputMaybe<Scalars['BigFloat']>;
  gte?: InputMaybe<Scalars['BigFloat']>;
  in?: InputMaybe<Array<Scalars['BigFloat']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigFloat']>;
  lte?: InputMaybe<Scalars['BigFloat']>;
  neq?: InputMaybe<Scalars['BigFloat']>;
};

export type Billing = {
  billingFreeTrialDurationInDays?: Maybe<Scalars['Float']>;
  billingUrl: Scalars['String'];
  isBillingEnabled: Scalars['Boolean'];
};

/** Blocklist */
export type Blocklist = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Handle */
  handle: Scalars['String'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  /** WorkspaceMember */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId: Scalars['ID'];
};

/** Blocklist */
export type BlocklistConnection = {
  edges: Array<BlocklistEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Blocklist */
export type BlocklistCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId: Scalars['ID'];
};

/** Blocklist */
export type BlocklistEdge = {
  cursor: Scalars['Cursor'];
  node: Blocklist;
};

/** Blocklist */
export type BlocklistFilterInput = {
  and?: InputMaybe<Array<InputMaybe<BlocklistFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** Handle */
  handle?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<BlocklistFilterInput>;
  or?: InputMaybe<Array<InputMaybe<BlocklistFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId?: InputMaybe<UuidFilter>;
};

/** Blocklist */
export type BlocklistOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** Handle */
  handle?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId?: InputMaybe<OrderByDirection>;
};

/** Blocklist */
export type BlocklistUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['ID']>;
};

export type BooleanFieldComparison = {
  is?: InputMaybe<Scalars['Boolean']>;
  isNot?: InputMaybe<Scalars['Boolean']>;
};

export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']>;
  is?: InputMaybe<FilterIs>;
};

export type CheckoutEntity = {
  url: Scalars['String'];
};

export type ClientConfig = {
  authProviders: AuthProviders;
  billing: Billing;
  debugMode: Scalars['Boolean'];
  sentry: Sentry;
  signInPrefilled: Scalars['Boolean'];
  signUpDisabled: Scalars['Boolean'];
  support: Support;
  telemetry: Telemetry;
};

/** A comment */
export type Comment = {
  /** Comment activity */
  activity?: Maybe<Activity>;
  /** Comment activity id foreign key */
  activityId: Scalars['ID'];
  /** Comment author */
  author?: Maybe<WorkspaceMember>;
  /** Comment author id foreign key */
  authorId: Scalars['ID'];
  /** Comment body */
  body: Scalars['String'];
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

/** A comment */
export type CommentConnection = {
  edges: Array<CommentEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A comment */
export type CommentCreateInput = {
  /** Comment activity id foreign key */
  activityId: Scalars['ID'];
  /** Comment author id foreign key */
  authorId: Scalars['ID'];
  /** Comment body */
  body?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A comment */
export type CommentEdge = {
  cursor: Scalars['Cursor'];
  node: Comment;
};

/** A comment */
export type CommentFilterInput = {
  /** Comment activity id foreign key */
  activityId?: InputMaybe<UuidFilter>;
  and?: InputMaybe<Array<InputMaybe<CommentFilterInput>>>;
  /** Comment author id foreign key */
  authorId?: InputMaybe<UuidFilter>;
  /** Comment body */
  body?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<CommentFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CommentFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** A comment */
export type CommentOrderByInput = {
  /** Comment activity id foreign key */
  activityId?: InputMaybe<OrderByDirection>;
  /** Comment author id foreign key */
  authorId?: InputMaybe<OrderByDirection>;
  /** Comment body */
  body?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** A comment */
export type CommentUpdateInput = {
  /** Comment activity id foreign key */
  activityId?: InputMaybe<Scalars['ID']>;
  /** Comment author id foreign key */
  authorId?: InputMaybe<Scalars['ID']>;
  /** Comment body */
  body?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A company */
export type Company = {
  /** Your team member responsible for managing the company account */
  accountOwner?: Maybe<WorkspaceMember>;
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: Maybe<Scalars['ID']>;
  /** Activities tied to the company */
  activityTargets?: Maybe<ActivityTargetConnection>;
  /** The company address */
  address: Scalars['String'];
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: Maybe<Currency>;
  /** Attachments linked to the company. */
  attachments?: Maybe<AttachmentConnection>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName: Scalars['String'];
  /** Number of employees in the company */
  employees?: Maybe<Scalars['Float']>;
  /** Favorites linked to the company */
  favorites?: Maybe<FavoriteConnection>;
  id: Scalars['ID'];
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile: Scalars['Boolean'];
  /** The company Linkedin account */
  linkedinLink?: Maybe<Link>;
  /** The company name */
  name: Scalars['String'];
  /** Opportunities linked to the company. */
  opportunities?: Maybe<OpportunityConnection>;
  /** People linked to the company. */
  people?: Maybe<PersonConnection>;
  /** Position */
  position?: Maybe<Scalars['Float']>;
  updatedAt: Scalars['DateTime'];
  /** The company Twitter/X account */
  xLink?: Maybe<Link>;
};


/** A company */
export type CompanyActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ActivityTargetOrderByInput>;
};


/** A company */
export type CompanyAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<AttachmentOrderByInput>;
};


/** A company */
export type CompanyFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<FavoriteOrderByInput>;
};


/** A company */
export type CompanyOpportunitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<OpportunityFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<OpportunityOrderByInput>;
};


/** A company */
export type CompanyPeopleArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PersonFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<PersonOrderByInput>;
};

/** A company */
export type CompanyConnection = {
  edges: Array<CompanyEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A company */
export type CompanyCreateInput = {
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: InputMaybe<Scalars['ID']>;
  /** The company address */
  address?: InputMaybe<Scalars['String']>;
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: InputMaybe<CurrencyCreateInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: InputMaybe<Scalars['String']>;
  /** Number of employees in the company */
  employees?: InputMaybe<Scalars['Float']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: InputMaybe<Scalars['Boolean']>;
  /** The company Linkedin account */
  linkedinLink?: InputMaybe<LinkCreateInput>;
  /** The company name */
  name?: InputMaybe<Scalars['String']>;
  /** Position */
  position?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** The company Twitter/X account */
  xLink?: InputMaybe<LinkCreateInput>;
};

/** A company */
export type CompanyEdge = {
  cursor: Scalars['Cursor'];
  node: Company;
};

/** A company */
export type CompanyFilterInput = {
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: InputMaybe<UuidFilter>;
  /** The company address */
  address?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<InputMaybe<CompanyFilterInput>>>;
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: InputMaybe<CurrencyFilterInput>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: InputMaybe<StringFilter>;
  /** Number of employees in the company */
  employees?: InputMaybe<FloatFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: InputMaybe<BooleanFilter>;
  /** The company Linkedin account */
  linkedinLink?: InputMaybe<LinkFilterInput>;
  /** The company name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<CompanyFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CompanyFilterInput>>>;
  /** Position */
  position?: InputMaybe<FloatFilter>;
  updatedAt?: InputMaybe<DateFilter>;
  /** The company Twitter/X account */
  xLink?: InputMaybe<LinkFilterInput>;
};

/** A company */
export type CompanyOrderByInput = {
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: InputMaybe<OrderByDirection>;
  /** The company address */
  address?: InputMaybe<OrderByDirection>;
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: InputMaybe<CurrencyOrderByInput>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: InputMaybe<OrderByDirection>;
  /** Number of employees in the company */
  employees?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: InputMaybe<OrderByDirection>;
  /** The company Linkedin account */
  linkedinLink?: InputMaybe<LinkOrderByInput>;
  /** The company name */
  name?: InputMaybe<OrderByDirection>;
  /** Position */
  position?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** The company Twitter/X account */
  xLink?: InputMaybe<LinkOrderByInput>;
};

/** A company */
export type CompanyUpdateInput = {
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: InputMaybe<Scalars['ID']>;
  /** The company address */
  address?: InputMaybe<Scalars['String']>;
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: InputMaybe<CurrencyUpdateInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: InputMaybe<Scalars['String']>;
  /** Number of employees in the company */
  employees?: InputMaybe<Scalars['Float']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: InputMaybe<Scalars['Boolean']>;
  /** The company Linkedin account */
  linkedinLink?: InputMaybe<LinkUpdateInput>;
  /** The company name */
  name?: InputMaybe<Scalars['String']>;
  /** Position */
  position?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** The company Twitter/X account */
  xLink?: InputMaybe<LinkUpdateInput>;
};

/** A connected account */
export type ConnectedAccount = {
  /** Messaging provider access token */
  accessToken: Scalars['String'];
  /** Account Owner */
  accountOwner?: Maybe<WorkspaceMember>;
  /** Account Owner id foreign key */
  accountOwnerId: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** The account handle (email, username, phone number, etc.) */
  handle: Scalars['String'];
  id: Scalars['ID'];
  /** Last sync history ID */
  lastSyncHistoryId: Scalars['String'];
  /** Message Channel */
  messageChannels?: Maybe<MessageChannelConnection>;
  /** The account provider */
  provider: Scalars['String'];
  /** Messaging provider refresh token */
  refreshToken: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** A connected account */
export type ConnectedAccountMessageChannelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageChannelOrderByInput>;
};

/** A connected account */
export type ConnectedAccountConnection = {
  edges: Array<ConnectedAccountEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A connected account */
export type ConnectedAccountCreateInput = {
  /** Messaging provider access token */
  accessToken?: InputMaybe<Scalars['String']>;
  /** Account Owner id foreign key */
  accountOwnerId: Scalars['ID'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Last sync history ID */
  lastSyncHistoryId?: InputMaybe<Scalars['String']>;
  /** The account provider */
  provider?: InputMaybe<Scalars['String']>;
  /** Messaging provider refresh token */
  refreshToken?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A connected account */
export type ConnectedAccountEdge = {
  cursor: Scalars['Cursor'];
  node: ConnectedAccount;
};

/** A connected account */
export type ConnectedAccountFilterInput = {
  /** Messaging provider access token */
  accessToken?: InputMaybe<StringFilter>;
  /** Account Owner id foreign key */
  accountOwnerId?: InputMaybe<UuidFilter>;
  and?: InputMaybe<Array<InputMaybe<ConnectedAccountFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Last sync history ID */
  lastSyncHistoryId?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConnectedAccountFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ConnectedAccountFilterInput>>>;
  /** The account provider */
  provider?: InputMaybe<StringFilter>;
  /** Messaging provider refresh token */
  refreshToken?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** A connected account */
export type ConnectedAccountOrderByInput = {
  /** Messaging provider access token */
  accessToken?: InputMaybe<OrderByDirection>;
  /** Account Owner id foreign key */
  accountOwnerId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Last sync history ID */
  lastSyncHistoryId?: InputMaybe<OrderByDirection>;
  /** The account provider */
  provider?: InputMaybe<OrderByDirection>;
  /** Messaging provider refresh token */
  refreshToken?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** A connected account */
export type ConnectedAccountUpdateInput = {
  /** Messaging provider access token */
  accessToken?: InputMaybe<Scalars['String']>;
  /** Account Owner id foreign key */
  accountOwnerId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Last sync history ID */
  lastSyncHistoryId?: InputMaybe<Scalars['String']>;
  /** The account provider */
  provider?: InputMaybe<Scalars['String']>;
  /** Messaging provider refresh token */
  refreshToken?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Currency = {
  amountMicros?: Maybe<Scalars['BigFloat']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  currencyCode?: Maybe<Scalars['String']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  id?: Maybe<Scalars['ID']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type CurrencyCreateInput = {
  amountMicros?: InputMaybe<Scalars['BigFloat']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CurrencyFilterInput = {
  amountMicros?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<InputMaybe<CurrencyFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  currencyCode?: InputMaybe<StringFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<CurrencyFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CurrencyFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
};

export type CurrencyOrderByInput = {
  amountMicros?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  currencyCode?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type CurrencyUpdateInput = {
  amountMicros?: InputMaybe<Scalars['BigFloat']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
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

export type DeleteOneObjectInput = {
  /** The id of the record to delete. */
  id: Scalars['ID'];
};

export type EmailPasswordResetLink = {
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

/** A favorite */
export type Favorite = {
  /** Favorite company */
  company?: Maybe<Company>;
  /** Favorite company id foreign key */
  companyId?: Maybe<Scalars['ID']>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Favorite opportunity */
  opportunity?: Maybe<Opportunity>;
  /** Favorite opportunity id foreign key */
  opportunityId?: Maybe<Scalars['ID']>;
  /** Favorite person */
  person?: Maybe<Person>;
  /** Favorite person id foreign key */
  personId?: Maybe<Scalars['ID']>;
  /** Favorite position */
  position: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
  /** Favorite workspace member */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId: Scalars['ID'];
};

/** A favorite */
export type FavoriteConnection = {
  edges: Array<FavoriteEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A favorite */
export type FavoriteCreateInput = {
  /** Favorite company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Favorite opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['ID']>;
  /** Favorite person id foreign key */
  personId?: InputMaybe<Scalars['ID']>;
  /** Favorite position */
  position?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId: Scalars['ID'];
};

/** A favorite */
export type FavoriteEdge = {
  cursor: Scalars['Cursor'];
  node: Favorite;
};

/** A favorite */
export type FavoriteFilterInput = {
  and?: InputMaybe<Array<InputMaybe<FavoriteFilterInput>>>;
  /** Favorite company id foreign key */
  companyId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<FavoriteFilterInput>;
  /** Favorite opportunity id foreign key */
  opportunityId?: InputMaybe<UuidFilter>;
  or?: InputMaybe<Array<InputMaybe<FavoriteFilterInput>>>;
  /** Favorite person id foreign key */
  personId?: InputMaybe<UuidFilter>;
  /** Favorite position */
  position?: InputMaybe<FloatFilter>;
  updatedAt?: InputMaybe<DateFilter>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId?: InputMaybe<UuidFilter>;
};

/** A favorite */
export type FavoriteOrderByInput = {
  /** Favorite company id foreign key */
  companyId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Favorite opportunity id foreign key */
  opportunityId?: InputMaybe<OrderByDirection>;
  /** Favorite person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Favorite position */
  position?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId?: InputMaybe<OrderByDirection>;
};

/** A favorite */
export type FavoriteUpdateInput = {
  /** Favorite company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Favorite opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['ID']>;
  /** Favorite person id foreign key */
  personId?: InputMaybe<Scalars['ID']>;
  /** Favorite position */
  position?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['ID']>;
};

export type FeatureFlag = {
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
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int'];
};

export type FieldDeleteResponse = {
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

/** This enum to filter by nullability */
export enum FilterIs {
  /** Non-nulish values */
  NotNull = 'NOT_NULL',
  /** Nulish values */
  Null = 'NULL'
}

export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']>;
  gt?: InputMaybe<Scalars['Float']>;
  gte?: InputMaybe<Scalars['Float']>;
  in?: InputMaybe<Array<Scalars['Float']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Float']>;
  lte?: InputMaybe<Scalars['Float']>;
  neq?: InputMaybe<Scalars['Float']>;
};

export type FullName = {
  createdAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  firstName: Scalars['String'];
  id?: Maybe<Scalars['ID']>;
  lastName: Scalars['String'];
  updatedAt?: Maybe<Scalars['DateTime']>;
};

export type FullNameCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  firstName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  lastName?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type FullNameFilterInput = {
  and?: InputMaybe<Array<InputMaybe<FullNameFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  firstName?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  lastName?: InputMaybe<StringFilter>;
  not?: InputMaybe<FullNameFilterInput>;
  or?: InputMaybe<Array<InputMaybe<FullNameFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
};

export type FullNameOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  firstName?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  lastName?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type FullNameUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  firstName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  lastName?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
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
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type Link = {
  createdAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  id?: Maybe<Scalars['ID']>;
  label?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  url?: Maybe<Scalars['String']>;
};

export type LinkCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  label?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  url?: InputMaybe<Scalars['String']>;
};

export type LinkFilterInput = {
  and?: InputMaybe<Array<InputMaybe<LinkFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  label?: InputMaybe<StringFilter>;
  not?: InputMaybe<LinkFilterInput>;
  or?: InputMaybe<Array<InputMaybe<LinkFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
  url?: InputMaybe<StringFilter>;
};

export type LinkOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  label?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  url?: InputMaybe<OrderByDirection>;
};

export type LinkUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  label?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  url?: InputMaybe<Scalars['String']>;
};

export type LoginToken = {
  loginToken: AuthToken;
};

/** Message */
export type Message = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Message Direction */
  direction: MessageDirectionEnum;
  /** Message id from the message header */
  headerMessageId: Scalars['String'];
  id: Scalars['ID'];
  /** Messages from the channel. */
  messageChannelMessageAssociations?: Maybe<MessageChannelMessageAssociationConnection>;
  /** Message Participants */
  messageParticipants?: Maybe<MessageParticipantConnection>;
  /** Message Thread Id */
  messageThread?: Maybe<MessageThread>;
  /** Message Thread Id id foreign key */
  messageThreadId?: Maybe<Scalars['ID']>;
  /** The date the message was received */
  receivedAt?: Maybe<Scalars['DateTime']>;
  /** Subject */
  subject: Scalars['String'];
  /** Text */
  text: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Message */
export type MessageMessageChannelMessageAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageChannelMessageAssociationOrderByInput>;
};


/** Message */
export type MessageMessageParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageParticipantOrderByInput>;
};

/** Message Channels */
export type MessageChannel = {
  /** Connected Account */
  connectedAccount?: Maybe<ConnectedAccount>;
  /** Connected Account id foreign key */
  connectedAccountId: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Handle */
  handle: Scalars['String'];
  id: Scalars['ID'];
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled: Scalars['Boolean'];
  /** Messages from the channel. */
  messageChannelMessageAssociations?: Maybe<MessageChannelMessageAssociationConnection>;
  /** Channel Type */
  type: MessageChannelTypeEnum;
  updatedAt: Scalars['DateTime'];
  /** Visibility */
  visibility: MessageChannelVisibilityEnum;
};


/** Message Channels */
export type MessageChannelMessageChannelMessageAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageChannelMessageAssociationOrderByInput>;
};

/** Message Channels */
export type MessageChannelConnection = {
  edges: Array<MessageChannelEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message Channels */
export type MessageChannelCreateInput = {
  /** Connected Account id foreign key */
  connectedAccountId: Scalars['ID'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Channel Type */
  type?: InputMaybe<MessageChannelTypeEnum>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Visibility */
  visibility?: InputMaybe<MessageChannelVisibilityEnum>;
};

/** Message Channels */
export type MessageChannelEdge = {
  cursor: Scalars['Cursor'];
  node: MessageChannel;
};

/** Message Channels */
export type MessageChannelFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageChannelFilterInput>>>;
  /** Connected Account id foreign key */
  connectedAccountId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** Handle */
  handle?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<MessageChannelFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageChannelFilterInput>>>;
  /** Channel Type */
  type?: InputMaybe<MessageChannelTypeEnumFilter>;
  updatedAt?: InputMaybe<DateFilter>;
  /** Visibility */
  visibility?: InputMaybe<MessageChannelVisibilityEnumFilter>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociation = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Message Id */
  message?: Maybe<Message>;
  /** Message Channel Id */
  messageChannel?: Maybe<MessageChannel>;
  /** Message Channel Id id foreign key */
  messageChannelId?: Maybe<Scalars['ID']>;
  /** Message id from the messaging provider */
  messageExternalId?: Maybe<Scalars['String']>;
  /** Message Id id foreign key */
  messageId?: Maybe<Scalars['ID']>;
  /** Message Thread Id */
  messageThread?: Maybe<MessageThread>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: Maybe<Scalars['String']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: Maybe<Scalars['ID']>;
  updatedAt: Scalars['DateTime'];
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationConnection = {
  edges: Array<MessageChannelMessageAssociationEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Message Channel Id id foreign key */
  messageChannelId?: InputMaybe<Scalars['ID']>;
  /** Message id from the messaging provider */
  messageExternalId?: InputMaybe<Scalars['String']>;
  /** Message Id id foreign key */
  messageId?: InputMaybe<Scalars['ID']>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: InputMaybe<Scalars['String']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationEdge = {
  cursor: Scalars['Cursor'];
  node: MessageChannelMessageAssociation;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Message Channel Id id foreign key */
  messageChannelId?: InputMaybe<UuidFilter>;
  /** Message id from the messaging provider */
  messageExternalId?: InputMaybe<StringFilter>;
  /** Message Id id foreign key */
  messageId?: InputMaybe<UuidFilter>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: InputMaybe<StringFilter>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<UuidFilter>;
  not?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Message Channel Id id foreign key */
  messageChannelId?: InputMaybe<OrderByDirection>;
  /** Message id from the messaging provider */
  messageExternalId?: InputMaybe<OrderByDirection>;
  /** Message Id id foreign key */
  messageId?: InputMaybe<OrderByDirection>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: InputMaybe<OrderByDirection>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Message Channel Id id foreign key */
  messageChannelId?: InputMaybe<Scalars['ID']>;
  /** Message id from the messaging provider */
  messageExternalId?: InputMaybe<Scalars['String']>;
  /** Message Id id foreign key */
  messageId?: InputMaybe<Scalars['ID']>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: InputMaybe<Scalars['String']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message Channels */
export type MessageChannelOrderByInput = {
  /** Connected Account id foreign key */
  connectedAccountId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** Handle */
  handle?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<OrderByDirection>;
  /** Channel Type */
  type?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Visibility */
  visibility?: InputMaybe<OrderByDirection>;
};

/** Channel Type */
export enum MessageChannelTypeEnum {
  /** Email */
  Email = 'email',
  /** SMS */
  Sms = 'sms'
}

export type MessageChannelTypeEnumFilter = {
  eq?: InputMaybe<MessageChannelTypeEnum>;
  in?: InputMaybe<Array<InputMaybe<MessageChannelTypeEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageChannelTypeEnum>;
};

/** Message Channels */
export type MessageChannelUpdateInput = {
  /** Connected Account id foreign key */
  connectedAccountId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Channel Type */
  type?: InputMaybe<MessageChannelTypeEnum>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Visibility */
  visibility?: InputMaybe<MessageChannelVisibilityEnum>;
};

/** Visibility */
export enum MessageChannelVisibilityEnum {
  /** Metadata */
  Metadata = 'metadata',
  /** Share Everything */
  ShareEverything = 'share_everything',
  /** Subject */
  Subject = 'subject'
}

export type MessageChannelVisibilityEnumFilter = {
  eq?: InputMaybe<MessageChannelVisibilityEnum>;
  in?: InputMaybe<Array<InputMaybe<MessageChannelVisibilityEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageChannelVisibilityEnum>;
};

/** Message */
export type MessageConnection = {
  edges: Array<MessageEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message */
export type MessageCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Message Direction */
  direction?: InputMaybe<MessageDirectionEnum>;
  /** Message id from the message header */
  headerMessageId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<Scalars['ID']>;
  /** The date the message was received */
  receivedAt?: InputMaybe<Scalars['DateTime']>;
  /** Subject */
  subject?: InputMaybe<Scalars['String']>;
  /** Text */
  text?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message Direction */
export enum MessageDirectionEnum {
  /** Incoming */
  Incoming = 'incoming',
  /** Outgoing */
  Outgoing = 'outgoing'
}

export type MessageDirectionEnumFilter = {
  eq?: InputMaybe<MessageDirectionEnum>;
  in?: InputMaybe<Array<InputMaybe<MessageDirectionEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageDirectionEnum>;
};

/** Message */
export type MessageEdge = {
  cursor: Scalars['Cursor'];
  node: Message;
};

/** Message */
export type MessageFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** Message Direction */
  direction?: InputMaybe<MessageDirectionEnumFilter>;
  /** Message id from the message header */
  headerMessageId?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<UuidFilter>;
  not?: InputMaybe<MessageFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageFilterInput>>>;
  /** The date the message was received */
  receivedAt?: InputMaybe<DateFilter>;
  /** Subject */
  subject?: InputMaybe<StringFilter>;
  /** Text */
  text?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** Message */
export type MessageOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** Message Direction */
  direction?: InputMaybe<OrderByDirection>;
  /** Message id from the message header */
  headerMessageId?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<OrderByDirection>;
  /** The date the message was received */
  receivedAt?: InputMaybe<OrderByDirection>;
  /** Subject */
  subject?: InputMaybe<OrderByDirection>;
  /** Text */
  text?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Message Participants */
export type MessageParticipant = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Display Name */
  displayName: Scalars['String'];
  /** Handle */
  handle: Scalars['String'];
  id: Scalars['ID'];
  /** Message */
  message?: Maybe<Message>;
  /** Message id foreign key */
  messageId: Scalars['ID'];
  /** Person */
  person?: Maybe<Person>;
  /** Person id foreign key */
  personId?: Maybe<Scalars['ID']>;
  /** Role */
  role: MessageParticipantRoleEnum;
  updatedAt: Scalars['DateTime'];
  /** Workspace member */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** Workspace member id foreign key */
  workspaceMemberId?: Maybe<Scalars['ID']>;
};

/** Message Participants */
export type MessageParticipantConnection = {
  edges: Array<MessageParticipantEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message Participants */
export type MessageParticipantCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Display Name */
  displayName?: InputMaybe<Scalars['String']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Message id foreign key */
  messageId: Scalars['ID'];
  /** Person id foreign key */
  personId?: InputMaybe<Scalars['ID']>;
  /** Role */
  role?: InputMaybe<MessageParticipantRoleEnum>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['ID']>;
};

/** Message Participants */
export type MessageParticipantEdge = {
  cursor: Scalars['Cursor'];
  node: MessageParticipant;
};

/** Message Participants */
export type MessageParticipantFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageParticipantFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** Display Name */
  displayName?: InputMaybe<StringFilter>;
  /** Handle */
  handle?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Message id foreign key */
  messageId?: InputMaybe<UuidFilter>;
  not?: InputMaybe<MessageParticipantFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageParticipantFilterInput>>>;
  /** Person id foreign key */
  personId?: InputMaybe<UuidFilter>;
  /** Role */
  role?: InputMaybe<MessageParticipantRoleEnumFilter>;
  updatedAt?: InputMaybe<DateFilter>;
  /** Workspace member id foreign key */
  workspaceMemberId?: InputMaybe<UuidFilter>;
};

/** Message Participants */
export type MessageParticipantOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** Display Name */
  displayName?: InputMaybe<OrderByDirection>;
  /** Handle */
  handle?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Message id foreign key */
  messageId?: InputMaybe<OrderByDirection>;
  /** Person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Role */
  role?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Workspace member id foreign key */
  workspaceMemberId?: InputMaybe<OrderByDirection>;
};

/** Role */
export enum MessageParticipantRoleEnum {
  /** Bcc */
  Bcc = 'bcc',
  /** Cc */
  Cc = 'cc',
  /** From */
  From = 'from',
  /** To */
  To = 'to'
}

export type MessageParticipantRoleEnumFilter = {
  eq?: InputMaybe<MessageParticipantRoleEnum>;
  in?: InputMaybe<Array<InputMaybe<MessageParticipantRoleEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageParticipantRoleEnum>;
};

/** Message Participants */
export type MessageParticipantUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Display Name */
  displayName?: InputMaybe<Scalars['String']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Message id foreign key */
  messageId?: InputMaybe<Scalars['ID']>;
  /** Person id foreign key */
  personId?: InputMaybe<Scalars['ID']>;
  /** Role */
  role?: InputMaybe<MessageParticipantRoleEnum>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['ID']>;
};

/** Message Thread */
export type MessageThread = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Messages from the channel. */
  messageChannelMessageAssociations?: Maybe<MessageChannelMessageAssociationConnection>;
  /** Messages from the thread. */
  messages?: Maybe<MessageConnection>;
  updatedAt: Scalars['DateTime'];
};


/** Message Thread */
export type MessageThreadMessageChannelMessageAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageChannelMessageAssociationOrderByInput>;
};


/** Message Thread */
export type MessageThreadMessagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageOrderByInput>;
};

/** Message Thread */
export type MessageThreadConnection = {
  edges: Array<MessageThreadEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message Thread */
export type MessageThreadCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message Thread */
export type MessageThreadEdge = {
  cursor: Scalars['Cursor'];
  node: MessageThread;
};

/** Message Thread */
export type MessageThreadFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageThreadFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<MessageThreadFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageThreadFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** Message Thread */
export type MessageThreadOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Message Thread */
export type MessageThreadUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message */
export type MessageUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Message Direction */
  direction?: InputMaybe<MessageDirectionEnum>;
  /** Message id from the message header */
  headerMessageId?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<Scalars['ID']>;
  /** The date the message was received */
  receivedAt?: InputMaybe<Scalars['DateTime']>;
  /** Subject */
  subject?: InputMaybe<Scalars['String']>;
  /** Text */
  text?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Mutation = {
  activateWorkspace: Workspace;
  challenge: LoginToken;
  checkout: CheckoutEntity;
  createActivities: Array<Activity>;
  createActivity: Activity;
  createActivityTarget: ActivityTarget;
  createActivityTargets: Array<ActivityTarget>;
  createApiKey: ApiKey;
  createApiKeys: Array<ApiKey>;
  createAttachment: Attachment;
  createAttachments: Array<Attachment>;
  createBlocklist: Blocklist;
  createBlocklists: Array<Blocklist>;
  createComment: Comment;
  createComments: Array<Comment>;
  createCompanies: Array<Company>;
  createCompany: Company;
  createConnectedAccount: ConnectedAccount;
  createConnectedAccounts: Array<ConnectedAccount>;
  createEvent: Analytics;
  createFavorite: Favorite;
  createFavorites: Array<Favorite>;
  createMessage: Message;
  createMessageChannel: MessageChannel;
  createMessageChannelMessageAssociation: MessageChannelMessageAssociation;
  createMessageChannelMessageAssociations: Array<MessageChannelMessageAssociation>;
  createMessageChannels: Array<MessageChannel>;
  createMessageParticipant: MessageParticipant;
  createMessageParticipants: Array<MessageParticipant>;
  createMessageThread: MessageThread;
  createMessageThreads: Array<MessageThread>;
  createMessages: Array<Message>;
  createOneObject: Object;
  createOneRefreshToken: RefreshToken;
  createOpportunities: Array<Opportunity>;
  createOpportunity: Opportunity;
  createPeople: Array<Person>;
  createPerson: Person;
  createPipelineStep: PipelineStep;
  createPipelineSteps: Array<PipelineStep>;
  createView: View;
  createViewField: ViewField;
  createViewFields: Array<ViewField>;
  createViewFilter: ViewFilter;
  createViewFilters: Array<ViewFilter>;
  createViewSort: ViewSort;
  createViewSorts: Array<ViewSort>;
  createViews: Array<View>;
  createWebhook: Webhook;
  createWebhooks: Array<Webhook>;
  createWorkspaceMember: WorkspaceMember;
  createWorkspaceMembers: Array<WorkspaceMember>;
  deleteActivities: Array<Activity>;
  deleteActivity: Activity;
  deleteActivityTarget: ActivityTarget;
  deleteActivityTargets: Array<ActivityTarget>;
  deleteApiKey: ApiKey;
  deleteApiKeys: Array<ApiKey>;
  deleteAttachment: Attachment;
  deleteAttachments: Array<Attachment>;
  deleteBlocklist: Blocklist;
  deleteBlocklists: Array<Blocklist>;
  deleteComment: Comment;
  deleteComments: Array<Comment>;
  deleteCompanies: Array<Company>;
  deleteCompany: Company;
  deleteConnectedAccount: ConnectedAccount;
  deleteConnectedAccounts: Array<ConnectedAccount>;
  deleteCurrentWorkspace: Workspace;
  deleteFavorite: Favorite;
  deleteFavorites: Array<Favorite>;
  deleteMessage: Message;
  deleteMessageChannel: MessageChannel;
  deleteMessageChannelMessageAssociation: MessageChannelMessageAssociation;
  deleteMessageChannelMessageAssociations: Array<MessageChannelMessageAssociation>;
  deleteMessageChannels: Array<MessageChannel>;
  deleteMessageParticipant: MessageParticipant;
  deleteMessageParticipants: Array<MessageParticipant>;
  deleteMessageThread: MessageThread;
  deleteMessageThreads: Array<MessageThread>;
  deleteMessages: Array<Message>;
  deleteOneObject: Object;
  deleteOpportunities: Array<Opportunity>;
  deleteOpportunity: Opportunity;
  deletePeople: Array<Person>;
  deletePerson: Person;
  deletePipelineStep: PipelineStep;
  deletePipelineSteps: Array<PipelineStep>;
  deleteUser: User;
  deleteView: View;
  deleteViewField: ViewField;
  deleteViewFields: Array<ViewField>;
  deleteViewFilter: ViewFilter;
  deleteViewFilters: Array<ViewFilter>;
  deleteViewSort: ViewSort;
  deleteViewSorts: Array<ViewSort>;
  deleteViews: Array<View>;
  deleteWebhook: Webhook;
  deleteWebhooks: Array<Webhook>;
  deleteWorkspaceMember: WorkspaceMember;
  deleteWorkspaceMembers: Array<WorkspaceMember>;
  emailPasswordResetLink: EmailPasswordResetLink;
  executeQuickActionOnActivity: Activity;
  executeQuickActionOnActivityTarget: ActivityTarget;
  executeQuickActionOnApiKey: ApiKey;
  executeQuickActionOnAttachment: Attachment;
  executeQuickActionOnBlocklist: Blocklist;
  executeQuickActionOnComment: Comment;
  executeQuickActionOnCompany: Company;
  executeQuickActionOnConnectedAccount: ConnectedAccount;
  executeQuickActionOnFavorite: Favorite;
  executeQuickActionOnMessage: Message;
  executeQuickActionOnMessageChannel: MessageChannel;
  executeQuickActionOnMessageChannelMessageAssociation: MessageChannelMessageAssociation;
  executeQuickActionOnMessageParticipant: MessageParticipant;
  executeQuickActionOnMessageThread: MessageThread;
  executeQuickActionOnOpportunity: Opportunity;
  executeQuickActionOnPerson: Person;
  executeQuickActionOnPipelineStep: PipelineStep;
  executeQuickActionOnView: View;
  executeQuickActionOnViewField: ViewField;
  executeQuickActionOnViewFilter: ViewFilter;
  executeQuickActionOnViewSort: ViewSort;
  executeQuickActionOnWebhook: Webhook;
  executeQuickActionOnWorkspaceMember: WorkspaceMember;
  generateApiKeyToken: ApiKeyToken;
  generateTransientToken: TransientToken;
  impersonate: Verify;
  renewToken: AuthTokens;
  signUp: LoginToken;
  updateActivities: Array<Activity>;
  updateActivity: Activity;
  updateActivityTarget: ActivityTarget;
  updateActivityTargets: Array<ActivityTarget>;
  updateApiKey: ApiKey;
  updateApiKeys: Array<ApiKey>;
  updateAttachment: Attachment;
  updateAttachments: Array<Attachment>;
  updateBlocklist: Blocklist;
  updateBlocklists: Array<Blocklist>;
  updateComment: Comment;
  updateComments: Array<Comment>;
  updateCompanies: Array<Company>;
  updateCompany: Company;
  updateConnectedAccount: ConnectedAccount;
  updateConnectedAccounts: Array<ConnectedAccount>;
  updateFavorite: Favorite;
  updateFavorites: Array<Favorite>;
  updateMessage: Message;
  updateMessageChannel: MessageChannel;
  updateMessageChannelMessageAssociation: MessageChannelMessageAssociation;
  updateMessageChannelMessageAssociations: Array<MessageChannelMessageAssociation>;
  updateMessageChannels: Array<MessageChannel>;
  updateMessageParticipant: MessageParticipant;
  updateMessageParticipants: Array<MessageParticipant>;
  updateMessageThread: MessageThread;
  updateMessageThreads: Array<MessageThread>;
  updateMessages: Array<Message>;
  updateOneObject: Object;
  updateOpportunities: Array<Opportunity>;
  updateOpportunity: Opportunity;
  updatePasswordViaResetToken: InvalidatePassword;
  updatePeople: Array<Person>;
  updatePerson: Person;
  updatePipelineStep: PipelineStep;
  updatePipelineSteps: Array<PipelineStep>;
  updateView: View;
  updateViewField: ViewField;
  updateViewFields: Array<ViewField>;
  updateViewFilter: ViewFilter;
  updateViewFilters: Array<ViewFilter>;
  updateViewSort: ViewSort;
  updateViewSorts: Array<ViewSort>;
  updateViews: Array<View>;
  updateWebhook: Webhook;
  updateWebhooks: Array<Webhook>;
  updateWorkspace: Workspace;
  updateWorkspaceMember: WorkspaceMember;
  updateWorkspaceMembers: Array<WorkspaceMember>;
  uploadFile: Scalars['String'];
  uploadImage: Scalars['String'];
  uploadProfilePicture: Scalars['String'];
  uploadWorkspaceLogo: Scalars['String'];
  verify: Verify;
};


export type MutationActivateWorkspaceArgs = {
  data: ActivateWorkspaceInput;
};


export type MutationChallengeArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCheckoutArgs = {
  recurringInterval: Scalars['String'];
  successUrlPath?: InputMaybe<Scalars['String']>;
};


export type MutationCreateActivitiesArgs = {
  data: Array<ActivityCreateInput>;
};


export type MutationCreateActivityArgs = {
  data: ActivityCreateInput;
};


export type MutationCreateActivityTargetArgs = {
  data: ActivityTargetCreateInput;
};


export type MutationCreateActivityTargetsArgs = {
  data: Array<ActivityTargetCreateInput>;
};


export type MutationCreateApiKeyArgs = {
  data: ApiKeyCreateInput;
};


export type MutationCreateApiKeysArgs = {
  data: Array<ApiKeyCreateInput>;
};


export type MutationCreateAttachmentArgs = {
  data: AttachmentCreateInput;
};


export type MutationCreateAttachmentsArgs = {
  data: Array<AttachmentCreateInput>;
};


export type MutationCreateBlocklistArgs = {
  data: BlocklistCreateInput;
};


export type MutationCreateBlocklistsArgs = {
  data: Array<BlocklistCreateInput>;
};


export type MutationCreateCommentArgs = {
  data: CommentCreateInput;
};


export type MutationCreateCommentsArgs = {
  data: Array<CommentCreateInput>;
};


export type MutationCreateCompaniesArgs = {
  data: Array<CompanyCreateInput>;
};


export type MutationCreateCompanyArgs = {
  data: CompanyCreateInput;
};


export type MutationCreateConnectedAccountArgs = {
  data: ConnectedAccountCreateInput;
};


export type MutationCreateConnectedAccountsArgs = {
  data: Array<ConnectedAccountCreateInput>;
};


export type MutationCreateEventArgs = {
  data: Scalars['JSON'];
  type: Scalars['String'];
};


export type MutationCreateFavoriteArgs = {
  data: FavoriteCreateInput;
};


export type MutationCreateFavoritesArgs = {
  data: Array<FavoriteCreateInput>;
};


export type MutationCreateMessageArgs = {
  data: MessageCreateInput;
};


export type MutationCreateMessageChannelArgs = {
  data: MessageChannelCreateInput;
};


export type MutationCreateMessageChannelMessageAssociationArgs = {
  data: MessageChannelMessageAssociationCreateInput;
};


export type MutationCreateMessageChannelMessageAssociationsArgs = {
  data: Array<MessageChannelMessageAssociationCreateInput>;
};


export type MutationCreateMessageChannelsArgs = {
  data: Array<MessageChannelCreateInput>;
};


export type MutationCreateMessageParticipantArgs = {
  data: MessageParticipantCreateInput;
};


export type MutationCreateMessageParticipantsArgs = {
  data: Array<MessageParticipantCreateInput>;
};


export type MutationCreateMessageThreadArgs = {
  data: MessageThreadCreateInput;
};


export type MutationCreateMessageThreadsArgs = {
  data: Array<MessageThreadCreateInput>;
};


export type MutationCreateMessagesArgs = {
  data: Array<MessageCreateInput>;
};


export type MutationCreateOpportunitiesArgs = {
  data: Array<OpportunityCreateInput>;
};


export type MutationCreateOpportunityArgs = {
  data: OpportunityCreateInput;
};


export type MutationCreatePeopleArgs = {
  data: Array<PersonCreateInput>;
};


export type MutationCreatePersonArgs = {
  data: PersonCreateInput;
};


export type MutationCreatePipelineStepArgs = {
  data: PipelineStepCreateInput;
};


export type MutationCreatePipelineStepsArgs = {
  data: Array<PipelineStepCreateInput>;
};


export type MutationCreateViewArgs = {
  data: ViewCreateInput;
};


export type MutationCreateViewFieldArgs = {
  data: ViewFieldCreateInput;
};


export type MutationCreateViewFieldsArgs = {
  data: Array<ViewFieldCreateInput>;
};


export type MutationCreateViewFilterArgs = {
  data: ViewFilterCreateInput;
};


export type MutationCreateViewFiltersArgs = {
  data: Array<ViewFilterCreateInput>;
};


export type MutationCreateViewSortArgs = {
  data: ViewSortCreateInput;
};


export type MutationCreateViewSortsArgs = {
  data: Array<ViewSortCreateInput>;
};


export type MutationCreateViewsArgs = {
  data: Array<ViewCreateInput>;
};


export type MutationCreateWebhookArgs = {
  data: WebhookCreateInput;
};


export type MutationCreateWebhooksArgs = {
  data: Array<WebhookCreateInput>;
};


export type MutationCreateWorkspaceMemberArgs = {
  data: WorkspaceMemberCreateInput;
};


export type MutationCreateWorkspaceMembersArgs = {
  data: Array<WorkspaceMemberCreateInput>;
};


export type MutationDeleteActivitiesArgs = {
  filter: ActivityFilterInput;
};


export type MutationDeleteActivityArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteActivityTargetArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteActivityTargetsArgs = {
  filter: ActivityTargetFilterInput;
};


export type MutationDeleteApiKeyArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteApiKeysArgs = {
  filter: ApiKeyFilterInput;
};


export type MutationDeleteAttachmentArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteAttachmentsArgs = {
  filter: AttachmentFilterInput;
};


export type MutationDeleteBlocklistArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteBlocklistsArgs = {
  filter: BlocklistFilterInput;
};


export type MutationDeleteCommentArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteCommentsArgs = {
  filter: CommentFilterInput;
};


export type MutationDeleteCompaniesArgs = {
  filter: CompanyFilterInput;
};


export type MutationDeleteCompanyArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteConnectedAccountArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteConnectedAccountsArgs = {
  filter: ConnectedAccountFilterInput;
};


export type MutationDeleteFavoriteArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteFavoritesArgs = {
  filter: FavoriteFilterInput;
};


export type MutationDeleteMessageArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteMessageChannelArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteMessageChannelMessageAssociationArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteMessageChannelMessageAssociationsArgs = {
  filter: MessageChannelMessageAssociationFilterInput;
};


export type MutationDeleteMessageChannelsArgs = {
  filter: MessageChannelFilterInput;
};


export type MutationDeleteMessageParticipantArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteMessageParticipantsArgs = {
  filter: MessageParticipantFilterInput;
};


export type MutationDeleteMessageThreadArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteMessageThreadsArgs = {
  filter: MessageThreadFilterInput;
};


export type MutationDeleteMessagesArgs = {
  filter: MessageFilterInput;
};


export type MutationDeleteOneObjectArgs = {
  input: DeleteOneObjectInput;
};


export type MutationDeleteOpportunitiesArgs = {
  filter: OpportunityFilterInput;
};


export type MutationDeleteOpportunityArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePeopleArgs = {
  filter: PersonFilterInput;
};


export type MutationDeletePersonArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePipelineStepArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePipelineStepsArgs = {
  filter: PipelineStepFilterInput;
};


export type MutationDeleteViewArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteViewFieldArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteViewFieldsArgs = {
  filter: ViewFieldFilterInput;
};


export type MutationDeleteViewFilterArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteViewFiltersArgs = {
  filter: ViewFilterFilterInput;
};


export type MutationDeleteViewSortArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteViewSortsArgs = {
  filter: ViewSortFilterInput;
};


export type MutationDeleteViewsArgs = {
  filter: ViewFilterInput;
};


export type MutationDeleteWebhookArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteWebhooksArgs = {
  filter: WebhookFilterInput;
};


export type MutationDeleteWorkspaceMemberArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteWorkspaceMembersArgs = {
  filter: WorkspaceMemberFilterInput;
};


export type MutationEmailPasswordResetLinkArgs = {
  email: Scalars['String'];
};


export type MutationExecuteQuickActionOnActivityArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnActivityTargetArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnApiKeyArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnAttachmentArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnBlocklistArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnCommentArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnCompanyArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnConnectedAccountArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnFavoriteArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnMessageArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnMessageChannelArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnMessageChannelMessageAssociationArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnMessageParticipantArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnMessageThreadArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnOpportunityArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnPersonArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnPipelineStepArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnViewArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnViewFieldArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnViewFilterArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnViewSortArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnWebhookArgs = {
  id: Scalars['ID'];
};


export type MutationExecuteQuickActionOnWorkspaceMemberArgs = {
  id: Scalars['ID'];
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


export type MutationUpdateActivitiesArgs = {
  data: ActivityUpdateInput;
  filter: ActivityFilterInput;
};


export type MutationUpdateActivityArgs = {
  data: ActivityUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateActivityTargetArgs = {
  data: ActivityTargetUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateActivityTargetsArgs = {
  data: ActivityTargetUpdateInput;
  filter: ActivityTargetFilterInput;
};


export type MutationUpdateApiKeyArgs = {
  data: ApiKeyUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateApiKeysArgs = {
  data: ApiKeyUpdateInput;
  filter: ApiKeyFilterInput;
};


export type MutationUpdateAttachmentArgs = {
  data: AttachmentUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateAttachmentsArgs = {
  data: AttachmentUpdateInput;
  filter: AttachmentFilterInput;
};


export type MutationUpdateBlocklistArgs = {
  data: BlocklistUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateBlocklistsArgs = {
  data: BlocklistUpdateInput;
  filter: BlocklistFilterInput;
};


export type MutationUpdateCommentArgs = {
  data: CommentUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateCommentsArgs = {
  data: CommentUpdateInput;
  filter: CommentFilterInput;
};


export type MutationUpdateCompaniesArgs = {
  data: CompanyUpdateInput;
  filter: CompanyFilterInput;
};


export type MutationUpdateCompanyArgs = {
  data: CompanyUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateConnectedAccountArgs = {
  data: ConnectedAccountUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateConnectedAccountsArgs = {
  data: ConnectedAccountUpdateInput;
  filter: ConnectedAccountFilterInput;
};


export type MutationUpdateFavoriteArgs = {
  data: FavoriteUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateFavoritesArgs = {
  data: FavoriteUpdateInput;
  filter: FavoriteFilterInput;
};


export type MutationUpdateMessageArgs = {
  data: MessageUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateMessageChannelArgs = {
  data: MessageChannelUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateMessageChannelMessageAssociationArgs = {
  data: MessageChannelMessageAssociationUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateMessageChannelMessageAssociationsArgs = {
  data: MessageChannelMessageAssociationUpdateInput;
  filter: MessageChannelMessageAssociationFilterInput;
};


export type MutationUpdateMessageChannelsArgs = {
  data: MessageChannelUpdateInput;
  filter: MessageChannelFilterInput;
};


export type MutationUpdateMessageParticipantArgs = {
  data: MessageParticipantUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateMessageParticipantsArgs = {
  data: MessageParticipantUpdateInput;
  filter: MessageParticipantFilterInput;
};


export type MutationUpdateMessageThreadArgs = {
  data: MessageThreadUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateMessageThreadsArgs = {
  data: MessageThreadUpdateInput;
  filter: MessageThreadFilterInput;
};


export type MutationUpdateMessagesArgs = {
  data: MessageUpdateInput;
  filter: MessageFilterInput;
};


export type MutationUpdateOpportunitiesArgs = {
  data: OpportunityUpdateInput;
  filter: OpportunityFilterInput;
};


export type MutationUpdateOpportunityArgs = {
  data: OpportunityUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String'];
  passwordResetToken: Scalars['String'];
};


export type MutationUpdatePeopleArgs = {
  data: PersonUpdateInput;
  filter: PersonFilterInput;
};


export type MutationUpdatePersonArgs = {
  data: PersonUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdatePipelineStepArgs = {
  data: PipelineStepUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdatePipelineStepsArgs = {
  data: PipelineStepUpdateInput;
  filter: PipelineStepFilterInput;
};


export type MutationUpdateViewArgs = {
  data: ViewUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateViewFieldArgs = {
  data: ViewFieldUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateViewFieldsArgs = {
  data: ViewFieldUpdateInput;
  filter: ViewFieldFilterInput;
};


export type MutationUpdateViewFilterArgs = {
  data: ViewFilterUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateViewFiltersArgs = {
  data: ViewFilterUpdateInput;
  filter: ViewFilterFilterInput;
};


export type MutationUpdateViewSortArgs = {
  data: ViewSortUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateViewSortsArgs = {
  data: ViewSortUpdateInput;
  filter: ViewSortFilterInput;
};


export type MutationUpdateViewsArgs = {
  data: ViewUpdateInput;
  filter: ViewFilterInput;
};


export type MutationUpdateWebhookArgs = {
  data: WebhookUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateWebhooksArgs = {
  data: WebhookUpdateInput;
  filter: WebhookFilterInput;
};


export type MutationUpdateWorkspaceArgs = {
  data: UpdateWorkspaceInput;
};


export type MutationUpdateWorkspaceMemberArgs = {
  data: WorkspaceMemberUpdateInput;
  id: Scalars['ID'];
};


export type MutationUpdateWorkspaceMembersArgs = {
  data: WorkspaceMemberUpdateInput;
  filter: WorkspaceMemberFilterInput;
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
  /** Array of edges. */
  edges: Array<ObjectEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int'];
};

export type ObjectFieldsConnection = {
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int'];
};

/** An opportunity */
export type Opportunity = {
  /** Activities tied to the opportunity */
  activityTargets?: Maybe<ActivityTargetConnection>;
  /** Opportunity amount */
  amount?: Maybe<Currency>;
  /** Attachments linked to the opportunity. */
  attachments?: Maybe<AttachmentConnection>;
  /** Opportunity close date */
  closeDate?: Maybe<Scalars['DateTime']>;
  /** Opportunity company */
  company?: Maybe<Company>;
  /** Opportunity company id foreign key */
  companyId?: Maybe<Scalars['ID']>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Favorites linked to the opportunity */
  favorites?: Maybe<FavoriteConnection>;
  id: Scalars['ID'];
  /** The opportunity name */
  name: Scalars['String'];
  /** Opportunity pipeline step */
  pipelineStep?: Maybe<PipelineStep>;
  /** Opportunity pipeline step id foreign key */
  pipelineStepId?: Maybe<Scalars['ID']>;
  /** Opportunity point of contact */
  pointOfContact?: Maybe<Person>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: Maybe<Scalars['ID']>;
  /** Position */
  position?: Maybe<Scalars['Float']>;
  /** Opportunity probability */
  probability: Scalars['String'];
  /** Opportunity stage */
  stage: OpportunityStageEnum;
  updatedAt: Scalars['DateTime'];
};


/** An opportunity */
export type OpportunityActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ActivityTargetOrderByInput>;
};


/** An opportunity */
export type OpportunityAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<AttachmentOrderByInput>;
};


/** An opportunity */
export type OpportunityFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<FavoriteOrderByInput>;
};

/** An opportunity */
export type OpportunityConnection = {
  edges: Array<OpportunityEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An opportunity */
export type OpportunityCreateInput = {
  /** Opportunity amount */
  amount?: InputMaybe<CurrencyCreateInput>;
  /** Opportunity close date */
  closeDate?: InputMaybe<Scalars['DateTime']>;
  /** Opportunity company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** The opportunity name */
  name?: InputMaybe<Scalars['String']>;
  /** Opportunity pipeline step id foreign key */
  pipelineStepId?: InputMaybe<Scalars['ID']>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: InputMaybe<Scalars['ID']>;
  /** Position */
  position?: InputMaybe<Scalars['Float']>;
  /** Opportunity probability */
  probability?: InputMaybe<Scalars['String']>;
  /** Opportunity stage */
  stage?: InputMaybe<OpportunityStageEnum>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An opportunity */
export type OpportunityEdge = {
  cursor: Scalars['Cursor'];
  node: Opportunity;
};

/** An opportunity */
export type OpportunityFilterInput = {
  /** Opportunity amount */
  amount?: InputMaybe<CurrencyFilterInput>;
  and?: InputMaybe<Array<InputMaybe<OpportunityFilterInput>>>;
  /** Opportunity close date */
  closeDate?: InputMaybe<DateFilter>;
  /** Opportunity company id foreign key */
  companyId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  /** The opportunity name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<OpportunityFilterInput>;
  or?: InputMaybe<Array<InputMaybe<OpportunityFilterInput>>>;
  /** Opportunity pipeline step id foreign key */
  pipelineStepId?: InputMaybe<UuidFilter>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: InputMaybe<UuidFilter>;
  /** Position */
  position?: InputMaybe<FloatFilter>;
  /** Opportunity probability */
  probability?: InputMaybe<StringFilter>;
  /** Opportunity stage */
  stage?: InputMaybe<OpportunityStageEnumFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** An opportunity */
export type OpportunityOrderByInput = {
  /** Opportunity amount */
  amount?: InputMaybe<CurrencyOrderByInput>;
  /** Opportunity close date */
  closeDate?: InputMaybe<OrderByDirection>;
  /** Opportunity company id foreign key */
  companyId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** The opportunity name */
  name?: InputMaybe<OrderByDirection>;
  /** Opportunity pipeline step id foreign key */
  pipelineStepId?: InputMaybe<OrderByDirection>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: InputMaybe<OrderByDirection>;
  /** Position */
  position?: InputMaybe<OrderByDirection>;
  /** Opportunity probability */
  probability?: InputMaybe<OrderByDirection>;
  /** Opportunity stage */
  stage?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Opportunity stage */
export enum OpportunityStageEnum {
  /** Customer */
  Customer = 'CUSTOMER',
  /** Meeting */
  Meeting = 'MEETING',
  /** New */
  New = 'NEW',
  /** Proposal */
  Proposal = 'PROPOSAL',
  /** Screening */
  Screening = 'SCREENING'
}

export type OpportunityStageEnumFilter = {
  eq?: InputMaybe<OpportunityStageEnum>;
  in?: InputMaybe<Array<InputMaybe<OpportunityStageEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<OpportunityStageEnum>;
};

/** An opportunity */
export type OpportunityUpdateInput = {
  /** Opportunity amount */
  amount?: InputMaybe<CurrencyUpdateInput>;
  /** Opportunity close date */
  closeDate?: InputMaybe<Scalars['DateTime']>;
  /** Opportunity company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** The opportunity name */
  name?: InputMaybe<Scalars['String']>;
  /** Opportunity pipeline step id foreign key */
  pipelineStepId?: InputMaybe<Scalars['ID']>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: InputMaybe<Scalars['ID']>;
  /** Position */
  position?: InputMaybe<Scalars['Float']>;
  /** Opportunity probability */
  probability?: InputMaybe<Scalars['String']>;
  /** Opportunity stage */
  stage?: InputMaybe<OpportunityStageEnum>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** This enum is used to specify the order of results */
export enum OrderByDirection {
  /** Ascending order, nulls first */
  AscNullsFirst = 'AscNullsFirst',
  /** Ascending order, nulls last */
  AscNullsLast = 'AscNullsLast',
  /** Descending order, nulls first */
  DescNullsFirst = 'DescNullsFirst',
  /** Descending order, nulls last */
  DescNullsLast = 'DescNullsLast'
}

export type PageInfo = {
  /** The cursor of the last returned record. */
  endCursor?: Maybe<Scalars['ConnectionCursor']>;
  /** true if paging forward and there are more records. */
  hasNextPage: Scalars['Boolean'];
  /** true if paging backwards and there are more records. */
  hasPreviousPage: Scalars['Boolean'];
  /** The cursor of the first returned record. */
  startCursor?: Maybe<Scalars['ConnectionCursor']>;
};

/** A person */
export type Person = {
  /** Activities tied to the contact */
  activityTargets?: Maybe<ActivityTargetConnection>;
  /** Attachments linked to the contact. */
  attachments?: Maybe<AttachmentConnection>;
  /** Contact’s avatar */
  avatarUrl: Scalars['String'];
  /** Contact’s city */
  city: Scalars['String'];
  /** Contact’s company */
  company?: Maybe<Company>;
  /** Contact’s company id foreign key */
  companyId?: Maybe<Scalars['ID']>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Contact’s Email */
  email: Scalars['String'];
  /** Favorites linked to the contact */
  favorites?: Maybe<FavoriteConnection>;
  id: Scalars['ID'];
  /** Contact’s job title */
  jobTitle: Scalars['String'];
  /** Contact’s Linkedin account */
  linkedinLink?: Maybe<Link>;
  /** Message Participants */
  messageParticipants?: Maybe<MessageParticipantConnection>;
  /** Contact’s name */
  name?: Maybe<FullName>;
  /** Contact’s phone number */
  phone: Scalars['String'];
  /** Point of Contact for Opportunities */
  pointOfContactForOpportunities?: Maybe<OpportunityConnection>;
  /** Record Position */
  position?: Maybe<Scalars['Float']>;
  updatedAt: Scalars['DateTime'];
  /** Contact’s X/Twitter account */
  xLink?: Maybe<Link>;
};


/** A person */
export type PersonActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ActivityTargetOrderByInput>;
};


/** A person */
export type PersonAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<AttachmentOrderByInput>;
};


/** A person */
export type PersonFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<FavoriteOrderByInput>;
};


/** A person */
export type PersonMessageParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageParticipantOrderByInput>;
};


/** A person */
export type PersonPointOfContactForOpportunitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<OpportunityFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<OpportunityOrderByInput>;
};

/** A person */
export type PersonConnection = {
  edges: Array<PersonEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A person */
export type PersonCreateInput = {
  /** Contact’s avatar */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** Contact’s city */
  city?: InputMaybe<Scalars['String']>;
  /** Contact’s company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Contact’s Email */
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Contact’s job title */
  jobTitle?: InputMaybe<Scalars['String']>;
  /** Contact’s Linkedin account */
  linkedinLink?: InputMaybe<LinkCreateInput>;
  /** Contact’s name */
  name?: InputMaybe<FullNameCreateInput>;
  /** Contact’s phone number */
  phone?: InputMaybe<Scalars['String']>;
  /** Record Position */
  position?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Contact’s X/Twitter account */
  xLink?: InputMaybe<LinkCreateInput>;
};

/** A person */
export type PersonEdge = {
  cursor: Scalars['Cursor'];
  node: Person;
};

/** A person */
export type PersonFilterInput = {
  and?: InputMaybe<Array<InputMaybe<PersonFilterInput>>>;
  /** Contact’s avatar */
  avatarUrl?: InputMaybe<StringFilter>;
  /** Contact’s city */
  city?: InputMaybe<StringFilter>;
  /** Contact’s company id foreign key */
  companyId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** Contact’s Email */
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Contact’s job title */
  jobTitle?: InputMaybe<StringFilter>;
  /** Contact’s Linkedin account */
  linkedinLink?: InputMaybe<LinkFilterInput>;
  /** Contact’s name */
  name?: InputMaybe<FullNameFilterInput>;
  not?: InputMaybe<PersonFilterInput>;
  or?: InputMaybe<Array<InputMaybe<PersonFilterInput>>>;
  /** Contact’s phone number */
  phone?: InputMaybe<StringFilter>;
  /** Record Position */
  position?: InputMaybe<FloatFilter>;
  updatedAt?: InputMaybe<DateFilter>;
  /** Contact’s X/Twitter account */
  xLink?: InputMaybe<LinkFilterInput>;
};

/** A person */
export type PersonOrderByInput = {
  /** Contact’s avatar */
  avatarUrl?: InputMaybe<OrderByDirection>;
  /** Contact’s city */
  city?: InputMaybe<OrderByDirection>;
  /** Contact’s company id foreign key */
  companyId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** Contact’s Email */
  email?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Contact’s job title */
  jobTitle?: InputMaybe<OrderByDirection>;
  /** Contact’s Linkedin account */
  linkedinLink?: InputMaybe<LinkOrderByInput>;
  /** Contact’s name */
  name?: InputMaybe<FullNameOrderByInput>;
  /** Contact’s phone number */
  phone?: InputMaybe<OrderByDirection>;
  /** Record Position */
  position?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Contact’s X/Twitter account */
  xLink?: InputMaybe<LinkOrderByInput>;
};

/** A person */
export type PersonUpdateInput = {
  /** Contact’s avatar */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** Contact’s city */
  city?: InputMaybe<Scalars['String']>;
  /** Contact’s company id foreign key */
  companyId?: InputMaybe<Scalars['ID']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** Contact’s Email */
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Contact’s job title */
  jobTitle?: InputMaybe<Scalars['String']>;
  /** Contact’s Linkedin account */
  linkedinLink?: InputMaybe<LinkUpdateInput>;
  /** Contact’s name */
  name?: InputMaybe<FullNameUpdateInput>;
  /** Contact’s phone number */
  phone?: InputMaybe<Scalars['String']>;
  /** Record Position */
  position?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Contact’s X/Twitter account */
  xLink?: InputMaybe<LinkUpdateInput>;
};

/** A pipeline step */
export type PipelineStep = {
  /** Pipeline Step color */
  color: Scalars['String'];
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Pipeline Step name */
  name: Scalars['String'];
  /** Opportunities linked to the step. */
  opportunities?: Maybe<OpportunityConnection>;
  /** Pipeline Step position */
  position?: Maybe<Scalars['Float']>;
  updatedAt: Scalars['DateTime'];
};


/** A pipeline step */
export type PipelineStepOpportunitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<OpportunityFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<OpportunityOrderByInput>;
};

/** A pipeline step */
export type PipelineStepConnection = {
  edges: Array<PipelineStepEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A pipeline step */
export type PipelineStepCreateInput = {
  /** Pipeline Step color */
  color?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Pipeline Step name */
  name?: InputMaybe<Scalars['String']>;
  /** Pipeline Step position */
  position?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A pipeline step */
export type PipelineStepEdge = {
  cursor: Scalars['Cursor'];
  node: PipelineStep;
};

/** A pipeline step */
export type PipelineStepFilterInput = {
  and?: InputMaybe<Array<InputMaybe<PipelineStepFilterInput>>>;
  /** Pipeline Step color */
  color?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Pipeline Step name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<PipelineStepFilterInput>;
  or?: InputMaybe<Array<InputMaybe<PipelineStepFilterInput>>>;
  /** Pipeline Step position */
  position?: InputMaybe<FloatFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** A pipeline step */
export type PipelineStepOrderByInput = {
  /** Pipeline Step color */
  color?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Pipeline Step name */
  name?: InputMaybe<OrderByDirection>;
  /** Pipeline Step position */
  position?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** A pipeline step */
export type PipelineStepUpdateInput = {
  /** Pipeline Step color */
  color?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Pipeline Step name */
  name?: InputMaybe<Scalars['String']>;
  /** Pipeline Step position */
  position?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type ProductPriceEntity = {
  created: Scalars['Float'];
  recurringInterval: Scalars['String'];
  stripePriceId: Scalars['String'];
  unitAmount: Scalars['Float'];
};

export type ProductPricesEntity = {
  productPrices: Array<ProductPriceEntity>;
  totalNumberOfPrices: Scalars['Int'];
};

export type Query = {
  activities: ActivityConnection;
  activity: Activity;
  activityDuplicates: ActivityConnection;
  activityTarget: ActivityTarget;
  activityTargetDuplicates: ActivityTargetConnection;
  activityTargets: ActivityTargetConnection;
  apiKey: ApiKey;
  apiKeyDuplicates: ApiKeyConnection;
  apiKeys: ApiKeyConnection;
  attachment: Attachment;
  attachmentDuplicates: AttachmentConnection;
  attachments: AttachmentConnection;
  blocklist: Blocklist;
  blocklistDuplicates: BlocklistConnection;
  blocklists: BlocklistConnection;
  checkUserExists: UserExists;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  clientConfig: ClientConfig;
  comment: Comment;
  commentDuplicates: CommentConnection;
  comments: CommentConnection;
  companies: CompanyConnection;
  company: Company;
  companyDuplicates: CompanyConnection;
  connectedAccount: ConnectedAccount;
  connectedAccountDuplicates: ConnectedAccountConnection;
  connectedAccounts: ConnectedAccountConnection;
  currentUser: User;
  currentWorkspace: Workspace;
  favorite: Favorite;
  favoriteDuplicates: FavoriteConnection;
  favorites: FavoriteConnection;
  findWorkspaceFromInviteHash: Workspace;
  getProductPrices: ProductPricesEntity;
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  message: Message;
  messageChannel: MessageChannel;
  messageChannelDuplicates: MessageChannelConnection;
  messageChannelMessageAssociation: MessageChannelMessageAssociation;
  messageChannelMessageAssociationDuplicates: MessageChannelMessageAssociationConnection;
  messageChannelMessageAssociations: MessageChannelMessageAssociationConnection;
  messageChannels: MessageChannelConnection;
  messageDuplicates: MessageConnection;
  messageParticipant: MessageParticipant;
  messageParticipantDuplicates: MessageParticipantConnection;
  messageParticipants: MessageParticipantConnection;
  messageThread: MessageThread;
  messageThreadDuplicates: MessageThreadConnection;
  messageThreads: MessageThreadConnection;
  messages: MessageConnection;
  object: Object;
  objects: ObjectConnection;
  opportunities: OpportunityConnection;
  opportunity: Opportunity;
  opportunityDuplicates: OpportunityConnection;
  people: PersonConnection;
  person: Person;
  personDuplicates: PersonConnection;
  pipelineStep: PipelineStep;
  pipelineStepDuplicates: PipelineStepConnection;
  pipelineSteps: PipelineStepConnection;
  validatePasswordResetToken: ValidatePasswordResetToken;
  view: View;
  viewDuplicates: ViewConnection;
  viewField: ViewField;
  viewFieldDuplicates: ViewFieldConnection;
  viewFields: ViewFieldConnection;
  viewFilter: ViewFilter;
  viewFilterDuplicates: ViewFilterConnection;
  viewFilters: ViewFilterConnection;
  viewSort: ViewSort;
  viewSortDuplicates: ViewSortConnection;
  viewSorts: ViewSortConnection;
  views: ViewConnection;
  webhook: Webhook;
  webhookDuplicates: WebhookConnection;
  webhooks: WebhookConnection;
  workspaceMember: WorkspaceMember;
  workspaceMemberDuplicates: WorkspaceMemberConnection;
  workspaceMembers: WorkspaceMemberConnection;
};


export type QueryActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ActivityOrderByInput>;
};


export type QueryActivityArgs = {
  filter: ActivityFilterInput;
};


export type QueryActivityDuplicatesArgs = {
  data?: InputMaybe<ActivityCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryActivityTargetArgs = {
  filter: ActivityTargetFilterInput;
};


export type QueryActivityTargetDuplicatesArgs = {
  data?: InputMaybe<ActivityTargetCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ActivityTargetOrderByInput>;
};


export type QueryApiKeyArgs = {
  filter: ApiKeyFilterInput;
};


export type QueryApiKeyDuplicatesArgs = {
  data?: InputMaybe<ApiKeyCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryApiKeysArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ApiKeyFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ApiKeyOrderByInput>;
};


export type QueryAttachmentArgs = {
  filter: AttachmentFilterInput;
};


export type QueryAttachmentDuplicatesArgs = {
  data?: InputMaybe<AttachmentCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<AttachmentOrderByInput>;
};


export type QueryBlocklistArgs = {
  filter: BlocklistFilterInput;
};


export type QueryBlocklistDuplicatesArgs = {
  data?: InputMaybe<BlocklistCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryBlocklistsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<BlocklistFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<BlocklistOrderByInput>;
};


export type QueryCheckUserExistsArgs = {
  email: Scalars['String'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String'];
};


export type QueryCommentArgs = {
  filter: CommentFilterInput;
};


export type QueryCommentDuplicatesArgs = {
  data?: InputMaybe<CommentCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CommentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<CommentOrderByInput>;
};


export type QueryCompaniesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CompanyFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<CompanyOrderByInput>;
};


export type QueryCompanyArgs = {
  filter: CompanyFilterInput;
};


export type QueryCompanyDuplicatesArgs = {
  data?: InputMaybe<CompanyCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryConnectedAccountArgs = {
  filter: ConnectedAccountFilterInput;
};


export type QueryConnectedAccountDuplicatesArgs = {
  data?: InputMaybe<ConnectedAccountCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryConnectedAccountsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ConnectedAccountFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ConnectedAccountOrderByInput>;
};


export type QueryFavoriteArgs = {
  filter: FavoriteFilterInput;
};


export type QueryFavoriteDuplicatesArgs = {
  data?: InputMaybe<FavoriteCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<FavoriteOrderByInput>;
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String'];
};


export type QueryGetProductPricesArgs = {
  product: Scalars['String'];
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


export type QueryMessageArgs = {
  filter: MessageFilterInput;
};


export type QueryMessageChannelArgs = {
  filter: MessageChannelFilterInput;
};


export type QueryMessageChannelDuplicatesArgs = {
  data?: InputMaybe<MessageChannelCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryMessageChannelMessageAssociationArgs = {
  filter: MessageChannelMessageAssociationFilterInput;
};


export type QueryMessageChannelMessageAssociationDuplicatesArgs = {
  data?: InputMaybe<MessageChannelMessageAssociationCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryMessageChannelMessageAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageChannelMessageAssociationOrderByInput>;
};


export type QueryMessageChannelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageChannelOrderByInput>;
};


export type QueryMessageDuplicatesArgs = {
  data?: InputMaybe<MessageCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryMessageParticipantArgs = {
  filter: MessageParticipantFilterInput;
};


export type QueryMessageParticipantDuplicatesArgs = {
  data?: InputMaybe<MessageParticipantCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryMessageParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageParticipantOrderByInput>;
};


export type QueryMessageThreadArgs = {
  filter: MessageThreadFilterInput;
};


export type QueryMessageThreadDuplicatesArgs = {
  data?: InputMaybe<MessageThreadCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryMessageThreadsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageThreadFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageThreadOrderByInput>;
};


export type QueryMessagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageOrderByInput>;
};


export type QueryOpportunitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<OpportunityFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<OpportunityOrderByInput>;
};


export type QueryOpportunityArgs = {
  filter: OpportunityFilterInput;
};


export type QueryOpportunityDuplicatesArgs = {
  data?: InputMaybe<OpportunityCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryPeopleArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PersonFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<PersonOrderByInput>;
};


export type QueryPersonArgs = {
  filter: PersonFilterInput;
};


export type QueryPersonDuplicatesArgs = {
  data?: InputMaybe<PersonCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryPipelineStepArgs = {
  filter: PipelineStepFilterInput;
};


export type QueryPipelineStepDuplicatesArgs = {
  data?: InputMaybe<PipelineStepCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryPipelineStepsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PipelineStepFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<PipelineStepOrderByInput>;
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String'];
};


export type QueryViewArgs = {
  filter: ViewFilterInput;
};


export type QueryViewDuplicatesArgs = {
  data?: InputMaybe<ViewCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryViewFieldArgs = {
  filter: ViewFieldFilterInput;
};


export type QueryViewFieldDuplicatesArgs = {
  data?: InputMaybe<ViewFieldCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryViewFieldsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFieldFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ViewFieldOrderByInput>;
};


export type QueryViewFilterArgs = {
  filter: ViewFilterFilterInput;
};


export type QueryViewFilterDuplicatesArgs = {
  data?: InputMaybe<ViewFilterCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryViewFiltersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFilterFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ViewFilterOrderByInput>;
};


export type QueryViewSortArgs = {
  filter: ViewSortFilterInput;
};


export type QueryViewSortDuplicatesArgs = {
  data?: InputMaybe<ViewSortCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryViewSortsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewSortFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ViewSortOrderByInput>;
};


export type QueryViewsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ViewOrderByInput>;
};


export type QueryWebhookArgs = {
  filter: WebhookFilterInput;
};


export type QueryWebhookDuplicatesArgs = {
  data?: InputMaybe<WebhookCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryWebhooksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<WebhookFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<WebhookOrderByInput>;
};


export type QueryWorkspaceMemberArgs = {
  filter: WorkspaceMemberFilterInput;
};


export type QueryWorkspaceMemberDuplicatesArgs = {
  data?: InputMaybe<WorkspaceMemberCreateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryWorkspaceMembersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<WorkspaceMemberFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<WorkspaceMemberOrderByInput>;
};

export type RefreshToken = {
  createdAt: Scalars['DateTime'];
  expiresAt: Scalars['DateTime'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

export type RefreshTokenEdge = {
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the RefreshToken */
  node: RefreshToken;
};

export type RelationConnection = {
  /** Array of edges. */
  edges: Array<RelationEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int'];
};

export type RelationDeleteResponse = {
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

export type StringFilter = {
  eq?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  ilike?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  iregex?: InputMaybe<Scalars['String']>;
  is?: InputMaybe<FilterIs>;
  like?: InputMaybe<Scalars['String']>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  neq?: InputMaybe<Scalars['String']>;
  regex?: InputMaybe<Scalars['String']>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type Support = {
  supportDriver: Scalars['String'];
  supportFrontChatId?: Maybe<Scalars['String']>;
};

export type Telemetry = {
  anonymizationEnabled: Scalars['Boolean'];
  enabled: Scalars['Boolean'];
};

export type TimelineThread = {
  firstParticipant: TimelineThreadParticipant;
  id: Scalars['ID'];
  lastMessageBody: Scalars['String'];
  lastMessageReceivedAt: Scalars['DateTime'];
  lastTwoParticipants: Array<TimelineThreadParticipant>;
  numberOfMessagesInThread: Scalars['Float'];
  participantCount: Scalars['Float'];
  read: Scalars['Boolean'];
  subject: Scalars['String'];
  visibility: Scalars['String'];
};

export type TimelineThreadParticipant = {
  avatarUrl: Scalars['String'];
  displayName: Scalars['String'];
  firstName: Scalars['String'];
  handle: Scalars['String'];
  lastName: Scalars['String'];
  personId?: Maybe<Scalars['ID']>;
  workspaceMemberId?: Maybe<Scalars['ID']>;
};

export type TimelineThreadsWithTotal = {
  timelineThreads: Array<TimelineThread>;
  totalNumberOfThreads: Scalars['Int'];
};

export type TransientToken = {
  transientToken: AuthToken;
};

export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['UUID']>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Scalars['UUID']>;
};

export type UpdateWorkspaceInput = {
  allowImpersonation?: InputMaybe<Scalars['Boolean']>;
  displayName?: InputMaybe<Scalars['String']>;
  domainName?: InputMaybe<Scalars['String']>;
  inviteHash?: InputMaybe<Scalars['String']>;
  logo?: InputMaybe<Scalars['String']>;
};

export type User = {
  canImpersonate: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  defaultAvatarUrl?: Maybe<Scalars['String']>;
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
  workspaceMember?: Maybe<WorkspaceMember>;
};

export type UserEdge = {
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the User */
  node: User;
};

export type UserExists = {
  exists: Scalars['Boolean'];
};

export type ValidatePasswordResetToken = {
  email: Scalars['String'];
  id: Scalars['String'];
};

export type Verify = {
  tokens: AuthTokenPair;
  user: User;
};

/** (System) Views */
export type View = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Describes if the view is in compact mode */
  isCompact: Scalars['Boolean'];
  /** View name */
  name: Scalars['String'];
  /** View target object */
  objectMetadataId: Scalars['ID'];
  /** View type */
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  /** View Fields */
  viewFields?: Maybe<ViewFieldConnection>;
  /** View Filters */
  viewFilters?: Maybe<ViewFilterConnection>;
  /** View Sorts */
  viewSorts?: Maybe<ViewSortConnection>;
};


/** (System) Views */
export type ViewViewFieldsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFieldFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ViewFieldOrderByInput>;
};


/** (System) Views */
export type ViewViewFiltersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFilterFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ViewFilterOrderByInput>;
};


/** (System) Views */
export type ViewViewSortsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewSortFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ViewSortOrderByInput>;
};

/** (System) Views */
export type ViewConnection = {
  edges: Array<ViewEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** (System) Views */
export type ViewCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Describes if the view is in compact mode */
  isCompact?: InputMaybe<Scalars['Boolean']>;
  /** View name */
  name?: InputMaybe<Scalars['String']>;
  /** View target object */
  objectMetadataId: Scalars['ID'];
  /** View type */
  type?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** (System) Views */
export type ViewEdge = {
  cursor: Scalars['Cursor'];
  node: View;
};

/** (System) View Fields */
export type ViewField = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** View Field target field */
  fieldMetadataId: Scalars['ID'];
  id: Scalars['ID'];
  /** View Field visibility */
  isVisible: Scalars['Boolean'];
  /** View Field position */
  position: Scalars['Float'];
  /** View Field size */
  size: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
  /** View Field related view */
  view?: Maybe<View>;
  /** View Field related view id foreign key */
  viewId?: Maybe<Scalars['ID']>;
};

/** (System) View Fields */
export type ViewFieldConnection = {
  edges: Array<ViewFieldEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** (System) View Fields */
export type ViewFieldCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Field target field */
  fieldMetadataId: Scalars['ID'];
  id?: InputMaybe<Scalars['ID']>;
  /** View Field visibility */
  isVisible?: InputMaybe<Scalars['Boolean']>;
  /** View Field position */
  position?: InputMaybe<Scalars['Float']>;
  /** View Field size */
  size?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Field related view id foreign key */
  viewId?: InputMaybe<Scalars['ID']>;
};

/** (System) View Fields */
export type ViewFieldEdge = {
  cursor: Scalars['Cursor'];
  node: ViewField;
};

/** (System) View Fields */
export type ViewFieldFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ViewFieldFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** View Field target field */
  fieldMetadataId?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  /** View Field visibility */
  isVisible?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<ViewFieldFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ViewFieldFilterInput>>>;
  /** View Field position */
  position?: InputMaybe<FloatFilter>;
  /** View Field size */
  size?: InputMaybe<FloatFilter>;
  updatedAt?: InputMaybe<DateFilter>;
  /** View Field related view id foreign key */
  viewId?: InputMaybe<UuidFilter>;
};

/** (System) View Fields */
export type ViewFieldOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** View Field target field */
  fieldMetadataId?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** View Field visibility */
  isVisible?: InputMaybe<OrderByDirection>;
  /** View Field position */
  position?: InputMaybe<OrderByDirection>;
  /** View Field size */
  size?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** View Field related view id foreign key */
  viewId?: InputMaybe<OrderByDirection>;
};

/** (System) View Fields */
export type ViewFieldUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Field target field */
  fieldMetadataId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  /** View Field visibility */
  isVisible?: InputMaybe<Scalars['Boolean']>;
  /** View Field position */
  position?: InputMaybe<Scalars['Float']>;
  /** View Field size */
  size?: InputMaybe<Scalars['Float']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Field related view id foreign key */
  viewId?: InputMaybe<Scalars['ID']>;
};

/** (System) View Filters */
export type ViewFilter = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** View Filter Display Value */
  displayValue: Scalars['String'];
  /** View Filter target field */
  fieldMetadataId: Scalars['ID'];
  id: Scalars['ID'];
  /** View Filter operand */
  operand: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  /** View Filter value */
  value: Scalars['String'];
  /** View Filter related view */
  view?: Maybe<View>;
  /** View Filter related view id foreign key */
  viewId?: Maybe<Scalars['ID']>;
};

/** (System) View Filters */
export type ViewFilterConnection = {
  edges: Array<ViewFilterEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** (System) View Filters */
export type ViewFilterCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Filter Display Value */
  displayValue?: InputMaybe<Scalars['String']>;
  /** View Filter target field */
  fieldMetadataId: Scalars['ID'];
  id?: InputMaybe<Scalars['ID']>;
  /** View Filter operand */
  operand?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Filter value */
  value?: InputMaybe<Scalars['String']>;
  /** View Filter related view id foreign key */
  viewId?: InputMaybe<Scalars['ID']>;
};

/** (System) View Filters */
export type ViewFilterEdge = {
  cursor: Scalars['Cursor'];
  node: ViewFilter;
};

/** (System) View Filters */
export type ViewFilterFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ViewFilterFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** View Filter Display Value */
  displayValue?: InputMaybe<StringFilter>;
  /** View Filter target field */
  fieldMetadataId?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<ViewFilterFilterInput>;
  /** View Filter operand */
  operand?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InputMaybe<ViewFilterFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
  /** View Filter value */
  value?: InputMaybe<StringFilter>;
  /** View Filter related view id foreign key */
  viewId?: InputMaybe<UuidFilter>;
};

/** (System) Views */
export type ViewFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ViewFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Describes if the view is in compact mode */
  isCompact?: InputMaybe<BooleanFilter>;
  /** View name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<ViewFilterInput>;
  /** View target object */
  objectMetadataId?: InputMaybe<UuidFilter>;
  or?: InputMaybe<Array<InputMaybe<ViewFilterInput>>>;
  /** View type */
  type?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** (System) View Filters */
export type ViewFilterOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** View Filter Display Value */
  displayValue?: InputMaybe<OrderByDirection>;
  /** View Filter target field */
  fieldMetadataId?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** View Filter operand */
  operand?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** View Filter value */
  value?: InputMaybe<OrderByDirection>;
  /** View Filter related view id foreign key */
  viewId?: InputMaybe<OrderByDirection>;
};

/** (System) View Filters */
export type ViewFilterUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Filter Display Value */
  displayValue?: InputMaybe<Scalars['String']>;
  /** View Filter target field */
  fieldMetadataId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  /** View Filter operand */
  operand?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Filter value */
  value?: InputMaybe<Scalars['String']>;
  /** View Filter related view id foreign key */
  viewId?: InputMaybe<Scalars['ID']>;
};

/** (System) Views */
export type ViewOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Describes if the view is in compact mode */
  isCompact?: InputMaybe<OrderByDirection>;
  /** View name */
  name?: InputMaybe<OrderByDirection>;
  /** View target object */
  objectMetadataId?: InputMaybe<OrderByDirection>;
  /** View type */
  type?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** (System) View Sorts */
export type ViewSort = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** View Sort direction */
  direction: Scalars['String'];
  /** View Sort target field */
  fieldMetadataId: Scalars['ID'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  /** View Sort related view */
  view?: Maybe<View>;
  /** View Sort related view id foreign key */
  viewId?: Maybe<Scalars['ID']>;
};

/** (System) View Sorts */
export type ViewSortConnection = {
  edges: Array<ViewSortEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** (System) View Sorts */
export type ViewSortCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Sort direction */
  direction?: InputMaybe<Scalars['String']>;
  /** View Sort target field */
  fieldMetadataId: Scalars['ID'];
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Sort related view id foreign key */
  viewId?: InputMaybe<Scalars['ID']>;
};

/** (System) View Sorts */
export type ViewSortEdge = {
  cursor: Scalars['Cursor'];
  node: ViewSort;
};

/** (System) View Sorts */
export type ViewSortFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ViewSortFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  /** View Sort direction */
  direction?: InputMaybe<StringFilter>;
  /** View Sort target field */
  fieldMetadataId?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<ViewSortFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ViewSortFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
  /** View Sort related view id foreign key */
  viewId?: InputMaybe<UuidFilter>;
};

/** (System) View Sorts */
export type ViewSortOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  /** View Sort direction */
  direction?: InputMaybe<OrderByDirection>;
  /** View Sort target field */
  fieldMetadataId?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** View Sort related view id foreign key */
  viewId?: InputMaybe<OrderByDirection>;
};

/** (System) View Sorts */
export type ViewSortUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Sort direction */
  direction?: InputMaybe<Scalars['String']>;
  /** View Sort target field */
  fieldMetadataId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Sort related view id foreign key */
  viewId?: InputMaybe<Scalars['ID']>;
};

/** (System) Views */
export type ViewUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Describes if the view is in compact mode */
  isCompact?: InputMaybe<Scalars['Boolean']>;
  /** View name */
  name?: InputMaybe<Scalars['String']>;
  /** View target object */
  objectMetadataId?: InputMaybe<Scalars['ID']>;
  /** View type */
  type?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A webhook */
export type Webhook = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Webhook operation */
  operation: Scalars['String'];
  /** Webhook target url */
  targetUrl: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

/** A webhook */
export type WebhookConnection = {
  edges: Array<WebhookEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A webhook */
export type WebhookCreateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Webhook operation */
  operation?: InputMaybe<Scalars['String']>;
  /** Webhook target url */
  targetUrl?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A webhook */
export type WebhookEdge = {
  cursor: Scalars['Cursor'];
  node: Webhook;
};

/** A webhook */
export type WebhookFilterInput = {
  and?: InputMaybe<Array<InputMaybe<WebhookFilterInput>>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<WebhookFilterInput>;
  /** Webhook operation */
  operation?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InputMaybe<WebhookFilterInput>>>;
  /** Webhook target url */
  targetUrl?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateFilter>;
};

/** A webhook */
export type WebhookOrderByInput = {
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Webhook operation */
  operation?: InputMaybe<OrderByDirection>;
  /** Webhook target url */
  targetUrl?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** A webhook */
export type WebhookUpdateInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Webhook operation */
  operation?: InputMaybe<Scalars['String']>;
  /** Webhook target url */
  targetUrl?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Workspace = {
  activationStatus: Scalars['String'];
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
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the Workspace */
  node: Workspace;
};

export type WorkspaceInviteHashValid = {
  isValid: Scalars['Boolean'];
};

/** A workspace member */
export type WorkspaceMember = {
  /** Account owner for companies */
  accountOwnerForCompanies?: Maybe<CompanyConnection>;
  /** Activities assigned to the workspace member */
  assignedActivities?: Maybe<ActivityConnection>;
  /** Activities created by the workspace member */
  authoredActivities?: Maybe<ActivityConnection>;
  /** Attachments created by the workspace member */
  authoredAttachments?: Maybe<AttachmentConnection>;
  /** Authored comments */
  authoredComments?: Maybe<CommentConnection>;
  /** Workspace member avatar */
  avatarUrl: Scalars['String'];
  /** Blocklisted handles */
  blocklist?: Maybe<BlocklistConnection>;
  /** Preferred color scheme */
  colorScheme: Scalars['String'];
  /** Connected accounts */
  connectedAccounts?: Maybe<ConnectedAccountConnection>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  /** Favorites linked to the workspace member */
  favorites?: Maybe<FavoriteConnection>;
  id: Scalars['ID'];
  /** Preferred language */
  locale: Scalars['String'];
  /** Message Participants */
  messageParticipants?: Maybe<MessageParticipantConnection>;
  /** Workspace member name */
  name: FullName;
  updatedAt: Scalars['DateTime'];
  /** Related user email address */
  userEmail: Scalars['String'];
  /** Associated User Id */
  userId: Scalars['ID'];
};


/** A workspace member */
export type WorkspaceMemberAccountOwnerForCompaniesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CompanyFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<CompanyOrderByInput>;
};


/** A workspace member */
export type WorkspaceMemberAssignedActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ActivityOrderByInput>;
};


/** A workspace member */
export type WorkspaceMemberAuthoredActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ActivityOrderByInput>;
};


/** A workspace member */
export type WorkspaceMemberAuthoredAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<AttachmentOrderByInput>;
};


/** A workspace member */
export type WorkspaceMemberAuthoredCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CommentFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<CommentOrderByInput>;
};


/** A workspace member */
export type WorkspaceMemberBlocklistArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<BlocklistFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<BlocklistOrderByInput>;
};


/** A workspace member */
export type WorkspaceMemberConnectedAccountsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ConnectedAccountFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<ConnectedAccountOrderByInput>;
};


/** A workspace member */
export type WorkspaceMemberFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<FavoriteOrderByInput>;
};


/** A workspace member */
export type WorkspaceMemberMessageParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  orderBy?: InputMaybe<MessageParticipantOrderByInput>;
};

/** A workspace member */
export type WorkspaceMemberConnection = {
  edges: Array<WorkspaceMemberEdge>;
  pageInfo: PageInfo;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A workspace member */
export type WorkspaceMemberCreateInput = {
  /** Workspace member avatar */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** Preferred color scheme */
  colorScheme?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Preferred language */
  locale?: InputMaybe<Scalars['String']>;
  /** Workspace member name */
  name?: InputMaybe<FullNameCreateInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Related user email address */
  userEmail?: InputMaybe<Scalars['String']>;
  /** Associated User Id */
  userId: Scalars['ID'];
};

/** A workspace member */
export type WorkspaceMemberEdge = {
  cursor: Scalars['Cursor'];
  node: WorkspaceMember;
};

/** A workspace member */
export type WorkspaceMemberFilterInput = {
  and?: InputMaybe<Array<InputMaybe<WorkspaceMemberFilterInput>>>;
  /** Workspace member avatar */
  avatarUrl?: InputMaybe<StringFilter>;
  /** Preferred color scheme */
  colorScheme?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  /** Preferred language */
  locale?: InputMaybe<StringFilter>;
  /** Workspace member name */
  name?: InputMaybe<FullNameFilterInput>;
  not?: InputMaybe<WorkspaceMemberFilterInput>;
  or?: InputMaybe<Array<InputMaybe<WorkspaceMemberFilterInput>>>;
  updatedAt?: InputMaybe<DateFilter>;
  /** Related user email address */
  userEmail?: InputMaybe<StringFilter>;
  /** Associated User Id */
  userId?: InputMaybe<UuidFilter>;
};

/** A workspace member */
export type WorkspaceMemberOrderByInput = {
  /** Workspace member avatar */
  avatarUrl?: InputMaybe<OrderByDirection>;
  /** Preferred color scheme */
  colorScheme?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  deletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  /** Preferred language */
  locale?: InputMaybe<OrderByDirection>;
  /** Workspace member name */
  name?: InputMaybe<FullNameOrderByInput>;
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Related user email address */
  userEmail?: InputMaybe<OrderByDirection>;
  /** Associated User Id */
  userId?: InputMaybe<OrderByDirection>;
};

/** A workspace member */
export type WorkspaceMemberUpdateInput = {
  /** Workspace member avatar */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** Preferred color scheme */
  colorScheme?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['ID']>;
  /** Preferred language */
  locale?: InputMaybe<Scalars['String']>;
  /** Workspace member name */
  name?: InputMaybe<FullNameUpdateInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Related user email address */
  userEmail?: InputMaybe<Scalars['String']>;
  /** Associated User Id */
  userId?: InputMaybe<Scalars['ID']>;
};

export type Field = {
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
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the object */
  node: Object;
};

export type Relation = {
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
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the relation */
  node: Relation;
};

export type FindCompanyQueryVariables = Exact<{
  filter: CompanyFilterInput;
}>;


export type FindCompanyQuery = { companies: { edges: Array<{ node: { linkedinLink?: { url?: string | null, label?: string | null } | null } }> } };


export const FindCompanyDocument = gql`
    query FindCompany($filter: CompanyFilterInput!) {
  companies(filter: $filter) {
    edges {
      node {
        linkedinLink {
          url
          label
        }
      }
    }
  }
}
    `;

/**
 * __useFindCompanyQuery__
 *
 * To run a query within a React component, call `useFindCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindCompanyQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useFindCompanyQuery(baseOptions: Apollo.QueryHookOptions<FindCompanyQuery, FindCompanyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindCompanyQuery, FindCompanyQueryVariables>(FindCompanyDocument, options);
      }
export function useFindCompanyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindCompanyQuery, FindCompanyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindCompanyQuery, FindCompanyQueryVariables>(FindCompanyDocument, options);
        }
export type FindCompanyQueryHookResult = ReturnType<typeof useFindCompanyQuery>;
export type FindCompanyLazyQueryHookResult = ReturnType<typeof useFindCompanyLazyQuery>;
export type FindCompanyQueryResult = Apollo.QueryResult<FindCompanyQuery, FindCompanyQueryVariables>;