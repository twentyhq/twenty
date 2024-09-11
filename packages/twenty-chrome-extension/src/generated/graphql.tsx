import * as Apollo from '@apollo/client';
import { gql } from '@apollo/client';
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
  Position: any;
  RawJSONScalar: any;
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
  /** Activity assignee */
  assignee?: Maybe<WorkspaceMember>;
  /** Activity assignee id foreign key */
  assigneeId?: Maybe<Scalars['UUID']>;
  /** Activity attachments */
  attachments?: Maybe<AttachmentConnection>;
  /** Activity author */
  author?: Maybe<WorkspaceMember>;
  /** Activity author id foreign key */
  authorId?: Maybe<Scalars['UUID']>;
  /** Activity body */
  body?: Maybe<Scalars['String']>;
  /** Activity comments */
  comments?: Maybe<CommentConnection>;
  /** Activity completion date */
  completedAt?: Maybe<Scalars['DateTime']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Activity due date */
  dueAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Activity reminder date */
  reminderAt?: Maybe<Scalars['DateTime']>;
  /** Activity title */
  title?: Maybe<Scalars['String']>;
  /** Activity type */
  type?: Maybe<Scalars['String']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};


/** An activity */
export type ActivityActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityTargetOrderByInput>>>;
};


/** An activity */
export type ActivityAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<AttachmentOrderByInput>>>;
};


/** An activity */
export type ActivityCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CommentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CommentOrderByInput>>>;
};

/** An activity */
export type ActivityConnection = {
  edges?: Maybe<Array<ActivityEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An activity */
export type ActivityCreateInput = {
  /** Activity assignee id foreign key */
  assigneeId?: InputMaybe<Scalars['UUID']>;
  /** Activity author id foreign key */
  authorId?: InputMaybe<Scalars['UUID']>;
  /** Activity body */
  body?: InputMaybe<Scalars['String']>;
  /** Activity completion date */
  completedAt?: InputMaybe<Scalars['DateTime']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Activity due date */
  dueAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Activity reminder date */
  reminderAt?: InputMaybe<Scalars['DateTime']>;
  /** Activity title */
  title?: InputMaybe<Scalars['String']>;
  /** Activity type */
  type?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An activity */
export type ActivityEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Activity>;
};

/** An activity */
export type ActivityFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ActivityFilterInput>>>;
  /** Activity assignee id foreign key */
  assigneeId?: InputMaybe<IdFilter>;
  /** Activity author id foreign key */
  authorId?: InputMaybe<IdFilter>;
  /** Activity body */
  body?: InputMaybe<StringFilter>;
  /** Activity completion date */
  completedAt?: InputMaybe<DateFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Activity due date */
  dueAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<ActivityFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ActivityFilterInput>>>;
  /** Activity reminder date */
  reminderAt?: InputMaybe<DateFilter>;
  /** Activity title */
  title?: InputMaybe<StringFilter>;
  /** Activity type */
  type?: InputMaybe<StringFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** An activity */
export type ActivityOrderByInput = {
  /** Activity assignee id foreign key */
  assigneeId?: InputMaybe<OrderByDirection>;
  /** Activity author id foreign key */
  authorId?: InputMaybe<OrderByDirection>;
  /** Activity body */
  body?: InputMaybe<OrderByDirection>;
  /** Activity completion date */
  completedAt?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Activity due date */
  dueAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Activity reminder date */
  reminderAt?: InputMaybe<OrderByDirection>;
  /** Activity title */
  title?: InputMaybe<OrderByDirection>;
  /** Activity type */
  type?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** An activity target */
export type ActivityTarget = {
  /** ActivityTarget activity */
  activity?: Maybe<Activity>;
  /** ActivityTarget activity id foreign key */
  activityId?: Maybe<Scalars['UUID']>;
  /** ActivityTarget company */
  company?: Maybe<Company>;
  /** ActivityTarget company id foreign key */
  companyId?: Maybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** ActivityTarget opportunity */
  opportunity?: Maybe<Opportunity>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: Maybe<Scalars['UUID']>;
  /** ActivityTarget person */
  person?: Maybe<Person>;
  /** ActivityTarget person id foreign key */
  personId?: Maybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** An activity target */
export type ActivityTargetConnection = {
  edges?: Maybe<Array<ActivityTargetEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An activity target */
export type ActivityTargetCreateInput = {
  /** ActivityTarget activity id foreign key */
  activityId?: InputMaybe<Scalars['UUID']>;
  /** ActivityTarget company id foreign key */
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['UUID']>;
  /** ActivityTarget person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An activity target */
export type ActivityTargetEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<ActivityTarget>;
};

/** An activity target */
export type ActivityTargetFilterInput = {
  /** ActivityTarget activity id foreign key */
  activityId?: InputMaybe<IdFilter>;
  and?: InputMaybe<Array<InputMaybe<ActivityTargetFilterInput>>>;
  /** ActivityTarget company id foreign key */
  companyId?: InputMaybe<IdFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<ActivityTargetFilterInput>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: InputMaybe<IdFilter>;
  or?: InputMaybe<Array<InputMaybe<ActivityTargetFilterInput>>>;
  /** ActivityTarget person id foreign key */
  personId?: InputMaybe<IdFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** An activity target */
export type ActivityTargetOrderByInput = {
  /** ActivityTarget activity id foreign key */
  activityId?: InputMaybe<OrderByDirection>;
  /** ActivityTarget company id foreign key */
  companyId?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: InputMaybe<OrderByDirection>;
  /** ActivityTarget person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** An activity target */
export type ActivityTargetUpdateInput = {
  /** ActivityTarget activity id foreign key */
  activityId?: InputMaybe<Scalars['UUID']>;
  /** ActivityTarget company id foreign key */
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** ActivityTarget opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['UUID']>;
  /** ActivityTarget person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An activity */
export type ActivityUpdateInput = {
  /** Activity assignee id foreign key */
  assigneeId?: InputMaybe<Scalars['UUID']>;
  /** Activity author id foreign key */
  authorId?: InputMaybe<Scalars['UUID']>;
  /** Activity body */
  body?: InputMaybe<Scalars['String']>;
  /** Activity completion date */
  completedAt?: InputMaybe<Scalars['DateTime']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Activity due date */
  dueAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Activity reminder date */
  reminderAt?: InputMaybe<Scalars['DateTime']>;
  /** Activity title */
  title?: InputMaybe<Scalars['String']>;
  /** Activity type */
  type?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Address = {
  addressCity?: Maybe<Scalars['String']>;
  addressCountry?: Maybe<Scalars['String']>;
  addressLat?: Maybe<Scalars['BigFloat']>;
  addressLng?: Maybe<Scalars['BigFloat']>;
  addressPostcode?: Maybe<Scalars['String']>;
  addressState?: Maybe<Scalars['String']>;
  addressStreet1?: Maybe<Scalars['String']>;
  addressStreet2?: Maybe<Scalars['String']>;
};

export type AddressCreateInput = {
  addressCity?: InputMaybe<Scalars['String']>;
  addressCountry?: InputMaybe<Scalars['String']>;
  addressLat?: InputMaybe<Scalars['BigFloat']>;
  addressLng?: InputMaybe<Scalars['BigFloat']>;
  addressPostcode?: InputMaybe<Scalars['String']>;
  addressState?: InputMaybe<Scalars['String']>;
  addressStreet1?: InputMaybe<Scalars['String']>;
  addressStreet2?: InputMaybe<Scalars['String']>;
};

export type AddressFilterInput = {
  addressCity?: InputMaybe<StringFilter>;
  addressCountry?: InputMaybe<StringFilter>;
  addressLat?: InputMaybe<BigFloatFilter>;
  addressLng?: InputMaybe<BigFloatFilter>;
  addressPostcode?: InputMaybe<StringFilter>;
  addressState?: InputMaybe<StringFilter>;
  addressStreet1?: InputMaybe<StringFilter>;
  addressStreet2?: InputMaybe<StringFilter>;
};

export type AddressOrderByInput = {
  addressCity?: InputMaybe<OrderByDirection>;
  addressCountry?: InputMaybe<OrderByDirection>;
  addressLat?: InputMaybe<OrderByDirection>;
  addressLng?: InputMaybe<OrderByDirection>;
  addressPostcode?: InputMaybe<OrderByDirection>;
  addressState?: InputMaybe<OrderByDirection>;
  addressStreet1?: InputMaybe<OrderByDirection>;
  addressStreet2?: InputMaybe<OrderByDirection>;
};

export type AddressUpdateInput = {
  addressCity?: InputMaybe<Scalars['String']>;
  addressCountry?: InputMaybe<Scalars['String']>;
  addressLat?: InputMaybe<Scalars['BigFloat']>;
  addressLng?: InputMaybe<Scalars['BigFloat']>;
  addressPostcode?: InputMaybe<Scalars['String']>;
  addressState?: InputMaybe<Scalars['String']>;
  addressStreet1?: InputMaybe<Scalars['String']>;
  addressStreet2?: InputMaybe<Scalars['String']>;
};

export type Analytics = {
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type ApiConfig = {
  mutationMaximumAffectedRecords: Scalars['Float'];
};

/** An api key */
export type ApiKey = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** ApiKey expiration date */
  expiresAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** ApiKey name */
  name?: Maybe<Scalars['String']>;
  /** ApiKey revocation date */
  revokedAt?: Maybe<Scalars['DateTime']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** An api key */
export type ApiKeyConnection = {
  edges?: Maybe<Array<ApiKeyEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An api key */
export type ApiKeyCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** ApiKey expiration date */
  expiresAt: Scalars['DateTime'];
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** ApiKey name */
  name?: InputMaybe<Scalars['String']>;
  /** ApiKey revocation date */
  revokedAt?: InputMaybe<Scalars['DateTime']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An api key */
export type ApiKeyEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<ApiKey>;
};

/** An api key */
export type ApiKeyFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ApiKeyFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** ApiKey expiration date */
  expiresAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** ApiKey name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<ApiKeyFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ApiKeyFilterInput>>>;
  /** ApiKey revocation date */
  revokedAt?: InputMaybe<DateFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** An api key */
export type ApiKeyOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** ApiKey expiration date */
  expiresAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** ApiKey name */
  name?: InputMaybe<OrderByDirection>;
  /** ApiKey revocation date */
  revokedAt?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type ApiKeyToken = {
  token: Scalars['String'];
};

/** An api key */
export type ApiKeyUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** ApiKey expiration date */
  expiresAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** ApiKey name */
  name?: InputMaybe<Scalars['String']>;
  /** ApiKey revocation date */
  revokedAt?: InputMaybe<Scalars['DateTime']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type AppToken = {
  createdAt: Scalars['DateTime'];
  expiresAt: Scalars['DateTime'];
  id: Scalars['UUID'];
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type AppTokenEdge = {
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor'];
  /** The node containing the AppToken */
  node: AppToken;
};

/** An attachment */
export type Attachment = {
  /** Attachment activity */
  activity?: Maybe<Activity>;
  /** Attachment activity id foreign key */
  activityId?: Maybe<Scalars['UUID']>;
  /** Attachment author */
  author?: Maybe<WorkspaceMember>;
  /** Attachment author id foreign key */
  authorId?: Maybe<Scalars['UUID']>;
  /** Attachment company */
  company?: Maybe<Company>;
  /** Attachment company id foreign key */
  companyId?: Maybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Attachment full path */
  fullPath?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Attachment name */
  name?: Maybe<Scalars['String']>;
  /** Attachment opportunity */
  opportunity?: Maybe<Opportunity>;
  /** Attachment opportunity id foreign key */
  opportunityId?: Maybe<Scalars['UUID']>;
  /** Attachment person */
  person?: Maybe<Person>;
  /** Attachment person id foreign key */
  personId?: Maybe<Scalars['UUID']>;
  /** Attachment type */
  type?: Maybe<Scalars['String']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** An attachment */
export type AttachmentConnection = {
  edges?: Maybe<Array<AttachmentEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An attachment */
export type AttachmentCreateInput = {
  /** Attachment activity id foreign key */
  activityId?: InputMaybe<Scalars['UUID']>;
  /** Attachment author id foreign key */
  authorId: Scalars['UUID'];
  /** Attachment company id foreign key */
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Attachment full path */
  fullPath?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Attachment name */
  name?: InputMaybe<Scalars['String']>;
  /** Attachment opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['UUID']>;
  /** Attachment person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Attachment type */
  type?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An attachment */
export type AttachmentEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Attachment>;
};

/** An attachment */
export type AttachmentFilterInput = {
  /** Attachment activity id foreign key */
  activityId?: InputMaybe<IdFilter>;
  and?: InputMaybe<Array<InputMaybe<AttachmentFilterInput>>>;
  /** Attachment author id foreign key */
  authorId?: InputMaybe<IdFilter>;
  /** Attachment company id foreign key */
  companyId?: InputMaybe<IdFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Attachment full path */
  fullPath?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Attachment name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<AttachmentFilterInput>;
  /** Attachment opportunity id foreign key */
  opportunityId?: InputMaybe<IdFilter>;
  or?: InputMaybe<Array<InputMaybe<AttachmentFilterInput>>>;
  /** Attachment person id foreign key */
  personId?: InputMaybe<IdFilter>;
  /** Attachment type */
  type?: InputMaybe<StringFilter>;
  /** Update date */
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
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Attachment full path */
  fullPath?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Attachment name */
  name?: InputMaybe<OrderByDirection>;
  /** Attachment opportunity id foreign key */
  opportunityId?: InputMaybe<OrderByDirection>;
  /** Attachment person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Attachment type */
  type?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** An attachment */
export type AttachmentUpdateInput = {
  /** Attachment activity id foreign key */
  activityId?: InputMaybe<Scalars['UUID']>;
  /** Attachment author id foreign key */
  authorId?: InputMaybe<Scalars['UUID']>;
  /** Attachment company id foreign key */
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Attachment full path */
  fullPath?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Attachment name */
  name?: InputMaybe<Scalars['String']>;
  /** Attachment opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['UUID']>;
  /** Attachment person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Attachment type */
  type?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An audit log of actions performed in the system */
export type AuditLog = {
  /** Json object to provide context (user, device, workspace, etc.) */
  context?: Maybe<Scalars['RawJSONScalar']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Event name/type */
  name?: Maybe<Scalars['String']>;
  /** If the event is related to a particular object */
  objectMetadataId?: Maybe<Scalars['String']>;
  /** If the event is related to a particular object */
  objectName?: Maybe<Scalars['String']>;
  /** Json value for event details */
  properties?: Maybe<Scalars['RawJSONScalar']>;
  /** Event name/type */
  recordId?: Maybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Event workspace member */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

/** An audit log of actions performed in the system */
export type AuditLogConnection = {
  edges?: Maybe<Array<AuditLogEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An audit log of actions performed in the system */
export type AuditLogCreateInput = {
  /** Json object to provide context (user, device, workspace, etc.) */
  context?: InputMaybe<Scalars['RawJSONScalar']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Event name/type */
  name?: InputMaybe<Scalars['String']>;
  /** If the event is related to a particular object */
  objectMetadataId?: InputMaybe<Scalars['String']>;
  /** If the event is related to a particular object */
  objectName?: InputMaybe<Scalars['String']>;
  /** Json value for event details */
  properties?: InputMaybe<Scalars['RawJSONScalar']>;
  /** Event name/type */
  recordId?: InputMaybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

/** An audit log of actions performed in the system */
export type AuditLogEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<AuditLog>;
};

/** An audit log of actions performed in the system */
export type AuditLogFilterInput = {
  and?: InputMaybe<Array<InputMaybe<AuditLogFilterInput>>>;
  /** Json object to provide context (user, device, workspace, etc.) */
  context?: InputMaybe<RawJsonFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Event name/type */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<AuditLogFilterInput>;
  /** If the event is related to a particular object */
  objectMetadataId?: InputMaybe<StringFilter>;
  /** If the event is related to a particular object */
  objectName?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InputMaybe<AuditLogFilterInput>>>;
  /** Json value for event details */
  properties?: InputMaybe<RawJsonFilter>;
  /** Event name/type */
  recordId?: InputMaybe<IdFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: InputMaybe<IdFilter>;
};

/** An audit log of actions performed in the system */
export type AuditLogOrderByInput = {
  /** Json object to provide context (user, device, workspace, etc.) */
  context?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Event name/type */
  name?: InputMaybe<OrderByDirection>;
  /** If the event is related to a particular object */
  objectMetadataId?: InputMaybe<OrderByDirection>;
  /** If the event is related to a particular object */
  objectName?: InputMaybe<OrderByDirection>;
  /** Json value for event details */
  properties?: InputMaybe<OrderByDirection>;
  /** Event name/type */
  recordId?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: InputMaybe<OrderByDirection>;
};

/** An audit log of actions performed in the system */
export type AuditLogUpdateInput = {
  /** Json object to provide context (user, device, workspace, etc.) */
  context?: InputMaybe<Scalars['RawJSONScalar']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Event name/type */
  name?: InputMaybe<Scalars['String']>;
  /** If the event is related to a particular object */
  objectMetadataId?: InputMaybe<Scalars['String']>;
  /** If the event is related to a particular object */
  objectName?: InputMaybe<Scalars['String']>;
  /** Json value for event details */
  properties?: InputMaybe<Scalars['RawJSONScalar']>;
  /** Event name/type */
  recordId?: InputMaybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

export type AuthProviders = {
  google: Scalars['Boolean'];
  magicLink: Scalars['Boolean'];
  microsoft: Scalars['Boolean'];
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

export type AuthorizeApp = {
  redirectUrl: Scalars['String'];
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
  billingUrl?: Maybe<Scalars['String']>;
  isBillingEnabled: Scalars['Boolean'];
};

export type BillingSubscription = {
  id: Scalars['UUID'];
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

/** Blocklist */
export type Blocklist = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Handle */
  handle?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** WorkspaceMember */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

/** Blocklist */
export type BlocklistConnection = {
  edges?: Maybe<Array<BlocklistEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Blocklist */
export type BlocklistCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId: Scalars['UUID'];
};

/** Blocklist */
export type BlocklistEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Blocklist>;
};

/** Blocklist */
export type BlocklistFilterInput = {
  and?: InputMaybe<Array<InputMaybe<BlocklistFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Handle */
  handle?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<BlocklistFilterInput>;
  or?: InputMaybe<Array<InputMaybe<BlocklistFilterInput>>>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId?: InputMaybe<IdFilter>;
};

/** Blocklist */
export type BlocklistOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Handle */
  handle?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId?: InputMaybe<OrderByDirection>;
};

/** Blocklist */
export type BlocklistUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** WorkspaceMember id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

export type BooleanFieldComparison = {
  is?: InputMaybe<Scalars['Boolean']>;
  isNot?: InputMaybe<Scalars['Boolean']>;
};

export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']>;
  is?: InputMaybe<FilterIs>;
};

/** Calendar Channels */
export type CalendarChannel = {
  /** Calendar Channel Event Associations */
  calendarChannelEventAssociations?: Maybe<CalendarChannelEventAssociationConnection>;
  /** Connected Account */
  connectedAccount?: Maybe<ConnectedAccount>;
  /** Connected Account id foreign key */
  connectedAccountId?: Maybe<Scalars['UUID']>;
  /** Automatically create records for people you participated with in an event. */
  contactAutoCreationPolicy?: Maybe<CalendarChannelContactAutoCreationPolicyEnum>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Handle */
  handle?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: Maybe<Scalars['Boolean']>;
  /** Is Sync Enabled */
  isSyncEnabled?: Maybe<Scalars['Boolean']>;
  /** Sync Cursor. Used for syncing events from the calendar provider */
  syncCursor?: Maybe<Scalars['String']>;
  /** Sync stage */
  syncStage?: Maybe<CalendarChannelSyncStageEnum>;
  /** Sync stage started at */
  syncStageStartedAt?: Maybe<Scalars['DateTime']>;
  /** Sync status */
  syncStatus?: Maybe<CalendarChannelSyncStatusEnum>;
  /** Throttle Failure Count */
  throttleFailureCount?: Maybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Visibility */
  visibility?: Maybe<CalendarChannelVisibilityEnum>;
};


/** Calendar Channels */
export type CalendarChannelCalendarChannelEventAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarChannelEventAssociationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarChannelEventAssociationOrderByInput>>>;
};

/** Calendar Channels */
export type CalendarChannelConnection = {
  edges?: Maybe<Array<CalendarChannelEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Automatically create records for people you participated with in an event. */
export enum CalendarChannelContactAutoCreationPolicyEnum {
  /** As Organizer */
  AsOrganizer = 'AS_ORGANIZER',
  /** As Participant */
  AsParticipant = 'AS_PARTICIPANT',
  /** As Participant and Organizer */
  AsParticipantAndOrganizer = 'AS_PARTICIPANT_AND_ORGANIZER',
  /** None */
  None = 'NONE'
}

export type CalendarChannelContactAutoCreationPolicyEnumFilter = {
  eq?: InputMaybe<CalendarChannelContactAutoCreationPolicyEnum>;
  in?: InputMaybe<Array<InputMaybe<CalendarChannelContactAutoCreationPolicyEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<CalendarChannelContactAutoCreationPolicyEnum>;
};

/** Calendar Channels */
export type CalendarChannelCreateInput = {
  /** Connected Account id foreign key */
  connectedAccountId: Scalars['UUID'];
  /** Automatically create records for people you participated with in an event. */
  contactAutoCreationPolicy?: InputMaybe<CalendarChannelContactAutoCreationPolicyEnum>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Is Sync Enabled */
  isSyncEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Sync Cursor. Used for syncing events from the calendar provider */
  syncCursor?: InputMaybe<Scalars['String']>;
  /** Sync stage */
  syncStage?: InputMaybe<CalendarChannelSyncStageEnum>;
  /** Sync stage started at */
  syncStageStartedAt?: InputMaybe<Scalars['DateTime']>;
  /** Sync status */
  syncStatus?: InputMaybe<CalendarChannelSyncStatusEnum>;
  /** Throttle Failure Count */
  throttleFailureCount?: InputMaybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Visibility */
  visibility?: InputMaybe<CalendarChannelVisibilityEnum>;
};

/** Calendar Channels */
export type CalendarChannelEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<CalendarChannel>;
};

/** Calendar Channel Event Associations */
export type CalendarChannelEventAssociation = {
  /** Channel ID */
  calendarChannel?: Maybe<CalendarChannel>;
  /** Channel ID id foreign key */
  calendarChannelId?: Maybe<Scalars['UUID']>;
  /** Event ID */
  calendarEvent?: Maybe<CalendarEvent>;
  /** Event ID id foreign key */
  calendarEventId?: Maybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Event external ID */
  eventExternalId?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** Calendar Channel Event Associations */
export type CalendarChannelEventAssociationConnection = {
  edges?: Maybe<Array<CalendarChannelEventAssociationEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Calendar Channel Event Associations */
export type CalendarChannelEventAssociationCreateInput = {
  /** Channel ID id foreign key */
  calendarChannelId: Scalars['UUID'];
  /** Event ID id foreign key */
  calendarEventId: Scalars['UUID'];
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Event external ID */
  eventExternalId?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Calendar Channel Event Associations */
export type CalendarChannelEventAssociationEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<CalendarChannelEventAssociation>;
};

/** Calendar Channel Event Associations */
export type CalendarChannelEventAssociationFilterInput = {
  and?: InputMaybe<Array<InputMaybe<CalendarChannelEventAssociationFilterInput>>>;
  /** Channel ID id foreign key */
  calendarChannelId?: InputMaybe<IdFilter>;
  /** Event ID id foreign key */
  calendarEventId?: InputMaybe<IdFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Event external ID */
  eventExternalId?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<CalendarChannelEventAssociationFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CalendarChannelEventAssociationFilterInput>>>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** Calendar Channel Event Associations */
export type CalendarChannelEventAssociationOrderByInput = {
  /** Channel ID id foreign key */
  calendarChannelId?: InputMaybe<OrderByDirection>;
  /** Event ID id foreign key */
  calendarEventId?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Event external ID */
  eventExternalId?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Calendar Channel Event Associations */
export type CalendarChannelEventAssociationUpdateInput = {
  /** Channel ID id foreign key */
  calendarChannelId?: InputMaybe<Scalars['UUID']>;
  /** Event ID id foreign key */
  calendarEventId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Event external ID */
  eventExternalId?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Calendar Channels */
export type CalendarChannelFilterInput = {
  and?: InputMaybe<Array<InputMaybe<CalendarChannelFilterInput>>>;
  /** Connected Account id foreign key */
  connectedAccountId?: InputMaybe<IdFilter>;
  /** Automatically create records for people you participated with in an event. */
  contactAutoCreationPolicy?: InputMaybe<CalendarChannelContactAutoCreationPolicyEnumFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Handle */
  handle?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<BooleanFilter>;
  /** Is Sync Enabled */
  isSyncEnabled?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<CalendarChannelFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CalendarChannelFilterInput>>>;
  /** Sync Cursor. Used for syncing events from the calendar provider */
  syncCursor?: InputMaybe<StringFilter>;
  /** Sync stage */
  syncStage?: InputMaybe<CalendarChannelSyncStageEnumFilter>;
  /** Sync stage started at */
  syncStageStartedAt?: InputMaybe<DateFilter>;
  /** Sync status */
  syncStatus?: InputMaybe<CalendarChannelSyncStatusEnumFilter>;
  /** Throttle Failure Count */
  throttleFailureCount?: InputMaybe<FloatFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** Visibility */
  visibility?: InputMaybe<CalendarChannelVisibilityEnumFilter>;
};

/** Calendar Channels */
export type CalendarChannelOrderByInput = {
  /** Connected Account id foreign key */
  connectedAccountId?: InputMaybe<OrderByDirection>;
  /** Automatically create records for people you participated with in an event. */
  contactAutoCreationPolicy?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Handle */
  handle?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<OrderByDirection>;
  /** Is Sync Enabled */
  isSyncEnabled?: InputMaybe<OrderByDirection>;
  /** Sync Cursor. Used for syncing events from the calendar provider */
  syncCursor?: InputMaybe<OrderByDirection>;
  /** Sync stage */
  syncStage?: InputMaybe<OrderByDirection>;
  /** Sync stage started at */
  syncStageStartedAt?: InputMaybe<OrderByDirection>;
  /** Sync status */
  syncStatus?: InputMaybe<OrderByDirection>;
  /** Throttle Failure Count */
  throttleFailureCount?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Visibility */
  visibility?: InputMaybe<OrderByDirection>;
};

/** Sync stage */
export enum CalendarChannelSyncStageEnum {
  /** Calendar events import ongoing */
  CalendarEventsImportOngoing = 'CALENDAR_EVENTS_IMPORT_ONGOING',
  /** Calendar events import pending */
  CalendarEventsImportPending = 'CALENDAR_EVENTS_IMPORT_PENDING',
  /** Calendar event list fetch ongoing */
  CalendarEventListFetchOngoing = 'CALENDAR_EVENT_LIST_FETCH_ONGOING',
  /** Failed */
  Failed = 'FAILED',
  /** Full calendar event list fetch pending */
  FullCalendarEventListFetchPending = 'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING',
  /** Partial calendar event list fetch pending */
  PartialCalendarEventListFetchPending = 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING'
}

export type CalendarChannelSyncStageEnumFilter = {
  eq?: InputMaybe<CalendarChannelSyncStageEnum>;
  in?: InputMaybe<Array<InputMaybe<CalendarChannelSyncStageEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<CalendarChannelSyncStageEnum>;
};

/** Sync status */
export enum CalendarChannelSyncStatusEnum {
  /** Active */
  Active = 'ACTIVE',
  /** Failed Insufficient Permissions */
  FailedInsufficientPermissions = 'FAILED_INSUFFICIENT_PERMISSIONS',
  /** Failed Unknown */
  FailedUnknown = 'FAILED_UNKNOWN',
  /** Not Synced */
  NotSynced = 'NOT_SYNCED',
  /** Ongoing */
  Ongoing = 'ONGOING'
}

export type CalendarChannelSyncStatusEnumFilter = {
  eq?: InputMaybe<CalendarChannelSyncStatusEnum>;
  in?: InputMaybe<Array<InputMaybe<CalendarChannelSyncStatusEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<CalendarChannelSyncStatusEnum>;
};

/** Calendar Channels */
export type CalendarChannelUpdateInput = {
  /** Connected Account id foreign key */
  connectedAccountId?: InputMaybe<Scalars['UUID']>;
  /** Automatically create records for people you participated with in an event. */
  contactAutoCreationPolicy?: InputMaybe<CalendarChannelContactAutoCreationPolicyEnum>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Is Sync Enabled */
  isSyncEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Sync Cursor. Used for syncing events from the calendar provider */
  syncCursor?: InputMaybe<Scalars['String']>;
  /** Sync stage */
  syncStage?: InputMaybe<CalendarChannelSyncStageEnum>;
  /** Sync stage started at */
  syncStageStartedAt?: InputMaybe<Scalars['DateTime']>;
  /** Sync status */
  syncStatus?: InputMaybe<CalendarChannelSyncStatusEnum>;
  /** Throttle Failure Count */
  throttleFailureCount?: InputMaybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Visibility */
  visibility?: InputMaybe<CalendarChannelVisibilityEnum>;
};

/** Visibility of the calendar channel */
export enum CalendarChannelVisibility {
  Metadata = 'METADATA',
  ShareEverything = 'SHARE_EVERYTHING'
}

/** Visibility */
export enum CalendarChannelVisibilityEnum {
  /** Metadata */
  Metadata = 'METADATA',
  /** Share Everything */
  ShareEverything = 'SHARE_EVERYTHING'
}

export type CalendarChannelVisibilityEnumFilter = {
  eq?: InputMaybe<CalendarChannelVisibilityEnum>;
  in?: InputMaybe<Array<InputMaybe<CalendarChannelVisibilityEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<CalendarChannelVisibilityEnum>;
};

/** Calendar events */
export type CalendarEvent = {
  /** Calendar Channel Event Associations */
  calendarChannelEventAssociations?: Maybe<CalendarChannelEventAssociationConnection>;
  /** Event Participants */
  calendarEventParticipants?: Maybe<CalendarEventParticipantConnection>;
  /** Meet Link */
  conferenceLink?: Maybe<Link>;
  /** Conference Solution */
  conferenceSolution?: Maybe<Scalars['String']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Description */
  description?: Maybe<Scalars['String']>;
  /** End Date */
  endsAt?: Maybe<Scalars['DateTime']>;
  /** Creation DateTime */
  externalCreatedAt?: Maybe<Scalars['DateTime']>;
  /** Update DateTime */
  externalUpdatedAt?: Maybe<Scalars['DateTime']>;
  /** iCal UID */
  iCalUID?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Is canceled */
  isCanceled?: Maybe<Scalars['Boolean']>;
  /** Is Full Day */
  isFullDay?: Maybe<Scalars['Boolean']>;
  /** Location */
  location?: Maybe<Scalars['String']>;
  /** Recurring Event ID */
  recurringEventExternalId?: Maybe<Scalars['String']>;
  /** Start Date */
  startsAt?: Maybe<Scalars['DateTime']>;
  /** Title */
  title?: Maybe<Scalars['String']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};


/** Calendar events */
export type CalendarEventCalendarChannelEventAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarChannelEventAssociationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarChannelEventAssociationOrderByInput>>>;
};


/** Calendar events */
export type CalendarEventCalendarEventParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarEventParticipantFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarEventParticipantOrderByInput>>>;
};

/** Calendar events */
export type CalendarEventConnection = {
  edges?: Maybe<Array<CalendarEventEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Calendar events */
export type CalendarEventCreateInput = {
  /** Meet Link */
  conferenceLink?: InputMaybe<LinkCreateInput>;
  /** Conference Solution */
  conferenceSolution?: InputMaybe<Scalars['String']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Description */
  description?: InputMaybe<Scalars['String']>;
  /** End Date */
  endsAt?: InputMaybe<Scalars['DateTime']>;
  /** Creation DateTime */
  externalCreatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Update DateTime */
  externalUpdatedAt?: InputMaybe<Scalars['DateTime']>;
  /** iCal UID */
  iCalUID?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Is canceled */
  isCanceled: Scalars['Boolean'];
  /** Is Full Day */
  isFullDay: Scalars['Boolean'];
  /** Location */
  location?: InputMaybe<Scalars['String']>;
  /** Recurring Event ID */
  recurringEventExternalId?: InputMaybe<Scalars['String']>;
  /** Start Date */
  startsAt?: InputMaybe<Scalars['DateTime']>;
  /** Title */
  title?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Calendar events */
export type CalendarEventEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<CalendarEvent>;
};

/** Calendar events */
export type CalendarEventFilterInput = {
  and?: InputMaybe<Array<InputMaybe<CalendarEventFilterInput>>>;
  /** Meet Link */
  conferenceLink?: InputMaybe<LinkFilterInput>;
  /** Conference Solution */
  conferenceSolution?: InputMaybe<StringFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Description */
  description?: InputMaybe<StringFilter>;
  /** End Date */
  endsAt?: InputMaybe<DateFilter>;
  /** Creation DateTime */
  externalCreatedAt?: InputMaybe<DateFilter>;
  /** Update DateTime */
  externalUpdatedAt?: InputMaybe<DateFilter>;
  /** iCal UID */
  iCalUID?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Is canceled */
  isCanceled?: InputMaybe<BooleanFilter>;
  /** Is Full Day */
  isFullDay?: InputMaybe<BooleanFilter>;
  /** Location */
  location?: InputMaybe<StringFilter>;
  not?: InputMaybe<CalendarEventFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CalendarEventFilterInput>>>;
  /** Recurring Event ID */
  recurringEventExternalId?: InputMaybe<StringFilter>;
  /** Start Date */
  startsAt?: InputMaybe<DateFilter>;
  /** Title */
  title?: InputMaybe<StringFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** Calendar events */
export type CalendarEventOrderByInput = {
  /** Meet Link */
  conferenceLink?: InputMaybe<LinkOrderByInput>;
  /** Conference Solution */
  conferenceSolution?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Description */
  description?: InputMaybe<OrderByDirection>;
  /** End Date */
  endsAt?: InputMaybe<OrderByDirection>;
  /** Creation DateTime */
  externalCreatedAt?: InputMaybe<OrderByDirection>;
  /** Update DateTime */
  externalUpdatedAt?: InputMaybe<OrderByDirection>;
  /** iCal UID */
  iCalUID?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Is canceled */
  isCanceled?: InputMaybe<OrderByDirection>;
  /** Is Full Day */
  isFullDay?: InputMaybe<OrderByDirection>;
  /** Location */
  location?: InputMaybe<OrderByDirection>;
  /** Recurring Event ID */
  recurringEventExternalId?: InputMaybe<OrderByDirection>;
  /** Start Date */
  startsAt?: InputMaybe<OrderByDirection>;
  /** Title */
  title?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Calendar event participants */
export type CalendarEventParticipant = {
  /** Event ID */
  calendarEvent?: Maybe<CalendarEvent>;
  /** Event ID id foreign key */
  calendarEventId?: Maybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Display Name */
  displayName?: Maybe<Scalars['String']>;
  /** Handle */
  handle?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Is Organizer */
  isOrganizer?: Maybe<Scalars['Boolean']>;
  /** Person */
  person?: Maybe<Person>;
  /** Person id foreign key */
  personId?: Maybe<Scalars['UUID']>;
  /** Response Status */
  responseStatus?: Maybe<CalendarEventParticipantResponseStatusEnum>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Workspace Member */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** Workspace Member id foreign key */
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

/** Calendar event participants */
export type CalendarEventParticipantConnection = {
  edges?: Maybe<Array<CalendarEventParticipantEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Calendar event participants */
export type CalendarEventParticipantCreateInput = {
  /** Event ID id foreign key */
  calendarEventId: Scalars['UUID'];
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Display Name */
  displayName?: InputMaybe<Scalars['String']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Is Organizer */
  isOrganizer?: InputMaybe<Scalars['Boolean']>;
  /** Person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Response Status */
  responseStatus?: InputMaybe<CalendarEventParticipantResponseStatusEnum>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Workspace Member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

/** Calendar event participants */
export type CalendarEventParticipantEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<CalendarEventParticipant>;
};

/** Calendar event participants */
export type CalendarEventParticipantFilterInput = {
  and?: InputMaybe<Array<InputMaybe<CalendarEventParticipantFilterInput>>>;
  /** Event ID id foreign key */
  calendarEventId?: InputMaybe<IdFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Display Name */
  displayName?: InputMaybe<StringFilter>;
  /** Handle */
  handle?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Is Organizer */
  isOrganizer?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<CalendarEventParticipantFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CalendarEventParticipantFilterInput>>>;
  /** Person id foreign key */
  personId?: InputMaybe<IdFilter>;
  /** Response Status */
  responseStatus?: InputMaybe<CalendarEventParticipantResponseStatusEnumFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** Workspace Member id foreign key */
  workspaceMemberId?: InputMaybe<IdFilter>;
};

/** Calendar event participants */
export type CalendarEventParticipantOrderByInput = {
  /** Event ID id foreign key */
  calendarEventId?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Display Name */
  displayName?: InputMaybe<OrderByDirection>;
  /** Handle */
  handle?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Is Organizer */
  isOrganizer?: InputMaybe<OrderByDirection>;
  /** Person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Response Status */
  responseStatus?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Workspace Member id foreign key */
  workspaceMemberId?: InputMaybe<OrderByDirection>;
};

/** Response Status */
export enum CalendarEventParticipantResponseStatusEnum {
  /** Accepted */
  Accepted = 'ACCEPTED',
  /** Declined */
  Declined = 'DECLINED',
  /** Needs Action */
  NeedsAction = 'NEEDS_ACTION',
  /** Tentative */
  Tentative = 'TENTATIVE'
}

export type CalendarEventParticipantResponseStatusEnumFilter = {
  eq?: InputMaybe<CalendarEventParticipantResponseStatusEnum>;
  in?: InputMaybe<Array<InputMaybe<CalendarEventParticipantResponseStatusEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<CalendarEventParticipantResponseStatusEnum>;
};

/** Calendar event participants */
export type CalendarEventParticipantUpdateInput = {
  /** Event ID id foreign key */
  calendarEventId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Display Name */
  displayName?: InputMaybe<Scalars['String']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Is Organizer */
  isOrganizer?: InputMaybe<Scalars['Boolean']>;
  /** Person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Response Status */
  responseStatus?: InputMaybe<CalendarEventParticipantResponseStatusEnum>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Workspace Member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

/** Calendar events */
export type CalendarEventUpdateInput = {
  /** Meet Link */
  conferenceLink?: InputMaybe<LinkUpdateInput>;
  /** Conference Solution */
  conferenceSolution?: InputMaybe<Scalars['String']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Description */
  description?: InputMaybe<Scalars['String']>;
  /** End Date */
  endsAt?: InputMaybe<Scalars['DateTime']>;
  /** Creation DateTime */
  externalCreatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Update DateTime */
  externalUpdatedAt?: InputMaybe<Scalars['DateTime']>;
  /** iCal UID */
  iCalUID?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Is canceled */
  isCanceled?: InputMaybe<Scalars['Boolean']>;
  /** Is Full Day */
  isFullDay?: InputMaybe<Scalars['Boolean']>;
  /** Location */
  location?: InputMaybe<Scalars['String']>;
  /** Recurring Event ID */
  recurringEventExternalId?: InputMaybe<Scalars['String']>;
  /** Start Date */
  startsAt?: InputMaybe<Scalars['DateTime']>;
  /** Title */
  title?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Captcha = {
  provider?: Maybe<CaptchaDriverType>;
  siteKey?: Maybe<Scalars['String']>;
};

export enum CaptchaDriverType {
  GoogleRecaptcha = 'GoogleRecaptcha',
  Turnstile = 'Turnstile'
}

export type ClientConfig = {
  api: ApiConfig;
  authProviders: AuthProviders;
  billing: Billing;
  captcha: Captcha;
  chromeExtensionId?: Maybe<Scalars['String']>;
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
  activityId?: Maybe<Scalars['UUID']>;
  /** Comment author */
  author?: Maybe<WorkspaceMember>;
  /** Comment author id foreign key */
  authorId?: Maybe<Scalars['UUID']>;
  /** Comment body */
  body?: Maybe<Scalars['String']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** A comment */
export type CommentConnection = {
  edges?: Maybe<Array<CommentEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A comment */
export type CommentCreateInput = {
  /** Comment activity id foreign key */
  activityId: Scalars['UUID'];
  /** Comment author id foreign key */
  authorId: Scalars['UUID'];
  /** Comment body */
  body?: InputMaybe<Scalars['String']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A comment */
export type CommentEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Comment>;
};

/** A comment */
export type CommentFilterInput = {
  /** Comment activity id foreign key */
  activityId?: InputMaybe<IdFilter>;
  and?: InputMaybe<Array<InputMaybe<CommentFilterInput>>>;
  /** Comment author id foreign key */
  authorId?: InputMaybe<IdFilter>;
  /** Comment body */
  body?: InputMaybe<StringFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<CommentFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CommentFilterInput>>>;
  /** Update date */
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
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** A comment */
export type CommentUpdateInput = {
  /** Comment activity id foreign key */
  activityId?: InputMaybe<Scalars['UUID']>;
  /** Comment author id foreign key */
  authorId?: InputMaybe<Scalars['UUID']>;
  /** Comment body */
  body?: InputMaybe<Scalars['String']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A company */
export type Company = {
  /** Your team member responsible for managing the company account */
  accountOwner?: Maybe<WorkspaceMember>;
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: Maybe<Scalars['UUID']>;
  /** Activities tied to the company */
  activityTargets?: Maybe<ActivityTargetConnection>;
  /** The company address */
  address?: Maybe<Scalars['String']>;
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: Maybe<Currency>;
  /** Attachments linked to the company */
  attachments?: Maybe<AttachmentConnection>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: Maybe<Scalars['String']>;
  /** Number of employees in the company */
  employees?: Maybe<Scalars['Float']>;
  /** Favorites linked to the company */
  favorites?: Maybe<FavoriteConnection>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: Maybe<Scalars['Boolean']>;
  /** The company Linkedin account */
  linkedinLink?: Maybe<Link>;
  /** The company name */
  name?: Maybe<Scalars['String']>;
  /** Opportunities linked to the company. */
  opportunities?: Maybe<OpportunityConnection>;
  /** People linked to the company. */
  people?: Maybe<PersonConnection>;
  /** Company record position */
  position?: Maybe<Scalars['Position']>;
  /** Timeline Activities linked to the company */
  timelineActivities?: Maybe<TimelineActivityConnection>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** The company Twitter/X account */
  xLink?: Maybe<Link>;
};


/** A company */
export type CompanyActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityTargetOrderByInput>>>;
};


/** A company */
export type CompanyAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<AttachmentOrderByInput>>>;
};


/** A company */
export type CompanyFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<FavoriteOrderByInput>>>;
};


/** A company */
export type CompanyOpportunitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<OpportunityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<OpportunityOrderByInput>>>;
};


/** A company */
export type CompanyPeopleArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PersonFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<PersonOrderByInput>>>;
};


/** A company */
export type CompanyTimelineActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<TimelineActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<TimelineActivityOrderByInput>>>;
};

/** A company */
export type CompanyConnection = {
  edges?: Maybe<Array<CompanyEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A company */
export type CompanyCreateInput = {
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: InputMaybe<Scalars['UUID']>;
  /** The company address */
  address?: InputMaybe<Scalars['String']>;
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: InputMaybe<CurrencyCreateInput>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: InputMaybe<Scalars['String']>;
  /** Number of employees in the company */
  employees?: InputMaybe<Scalars['Float']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: InputMaybe<Scalars['Boolean']>;
  /** The company Linkedin account */
  linkedinLink?: InputMaybe<LinkCreateInput>;
  /** The company name */
  name?: InputMaybe<Scalars['String']>;
  /** Company record position */
  position?: InputMaybe<Scalars['Position']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** The company Twitter/X account */
  xLink?: InputMaybe<LinkCreateInput>;
};

/** A company */
export type CompanyEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Company>;
};

/** A company */
export type CompanyFilterInput = {
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: InputMaybe<IdFilter>;
  /** The company address */
  address?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<InputMaybe<CompanyFilterInput>>>;
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: InputMaybe<CurrencyFilterInput>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: InputMaybe<StringFilter>;
  /** Number of employees in the company */
  employees?: InputMaybe<FloatFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: InputMaybe<BooleanFilter>;
  /** The company Linkedin account */
  linkedinLink?: InputMaybe<LinkFilterInput>;
  /** The company name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<CompanyFilterInput>;
  or?: InputMaybe<Array<InputMaybe<CompanyFilterInput>>>;
  /** Company record position */
  position?: InputMaybe<FloatFilter>;
  /** Update date */
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
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: InputMaybe<OrderByDirection>;
  /** Number of employees in the company */
  employees?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: InputMaybe<OrderByDirection>;
  /** The company Linkedin account */
  linkedinLink?: InputMaybe<LinkOrderByInput>;
  /** The company name */
  name?: InputMaybe<OrderByDirection>;
  /** Company record position */
  position?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** The company Twitter/X account */
  xLink?: InputMaybe<LinkOrderByInput>;
};

/** A company */
export type CompanyUpdateInput = {
  /** Your team member responsible for managing the company account id foreign key */
  accountOwnerId?: InputMaybe<Scalars['UUID']>;
  /** The company address */
  address?: InputMaybe<Scalars['String']>;
  /** Annual Recurring Revenue: The actual or estimated annual revenue of the company */
  annualRecurringRevenue?: InputMaybe<CurrencyUpdateInput>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** The company website URL. We use this url to fetch the company icon */
  domainName?: InputMaybe<Scalars['String']>;
  /** Number of employees in the company */
  employees?: InputMaybe<Scalars['Float']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you */
  idealCustomerProfile?: InputMaybe<Scalars['Boolean']>;
  /** The company Linkedin account */
  linkedinLink?: InputMaybe<LinkUpdateInput>;
  /** The company name */
  name?: InputMaybe<Scalars['String']>;
  /** Company record position */
  position?: InputMaybe<Scalars['Position']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** The company Twitter/X account */
  xLink?: InputMaybe<LinkUpdateInput>;
};

/** A connected account */
export type ConnectedAccount = {
  /** Messaging provider access token */
  accessToken?: Maybe<Scalars['String']>;
  /** Account Owner */
  accountOwner?: Maybe<WorkspaceMember>;
  /** Account Owner id foreign key */
  accountOwnerId?: Maybe<Scalars['UUID']>;
  /** Auth failed at */
  authFailedAt?: Maybe<Scalars['DateTime']>;
  /** Calendar Channels */
  calendarChannels?: Maybe<CalendarChannelConnection>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Last sync history ID */
  lastSyncHistoryId?: Maybe<Scalars['String']>;
  /** Message Channels */
  messageChannels?: Maybe<MessageChannelConnection>;
  /** The account provider */
  provider?: Maybe<Scalars['String']>;
  /** Messaging provider refresh token */
  refreshToken?: Maybe<Scalars['String']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};


/** A connected account */
export type ConnectedAccountCalendarChannelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarChannelFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarChannelOrderByInput>>>;
};


/** A connected account */
export type ConnectedAccountMessageChannelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageChannelOrderByInput>>>;
};

/** A connected account */
export type ConnectedAccountConnection = {
  edges?: Maybe<Array<ConnectedAccountEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A connected account */
export type ConnectedAccountCreateInput = {
  /** Messaging provider access token */
  accessToken?: InputMaybe<Scalars['String']>;
  /** Account Owner id foreign key */
  accountOwnerId: Scalars['UUID'];
  /** Auth failed at */
  authFailedAt?: InputMaybe<Scalars['DateTime']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Last sync history ID */
  lastSyncHistoryId?: InputMaybe<Scalars['String']>;
  /** The account provider */
  provider?: InputMaybe<Scalars['String']>;
  /** Messaging provider refresh token */
  refreshToken?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A connected account */
export type ConnectedAccountEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<ConnectedAccount>;
};

/** A connected account */
export type ConnectedAccountFilterInput = {
  /** Messaging provider access token */
  accessToken?: InputMaybe<StringFilter>;
  /** Account Owner id foreign key */
  accountOwnerId?: InputMaybe<IdFilter>;
  and?: InputMaybe<Array<InputMaybe<ConnectedAccountFilterInput>>>;
  /** Auth failed at */
  authFailedAt?: InputMaybe<DateFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Last sync history ID */
  lastSyncHistoryId?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConnectedAccountFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ConnectedAccountFilterInput>>>;
  /** The account provider */
  provider?: InputMaybe<StringFilter>;
  /** Messaging provider refresh token */
  refreshToken?: InputMaybe<StringFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** A connected account */
export type ConnectedAccountOrderByInput = {
  /** Messaging provider access token */
  accessToken?: InputMaybe<OrderByDirection>;
  /** Account Owner id foreign key */
  accountOwnerId?: InputMaybe<OrderByDirection>;
  /** Auth failed at */
  authFailedAt?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Last sync history ID */
  lastSyncHistoryId?: InputMaybe<OrderByDirection>;
  /** The account provider */
  provider?: InputMaybe<OrderByDirection>;
  /** Messaging provider refresh token */
  refreshToken?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** A connected account */
export type ConnectedAccountUpdateInput = {
  /** Messaging provider access token */
  accessToken?: InputMaybe<Scalars['String']>;
  /** Account Owner id foreign key */
  accountOwnerId?: InputMaybe<Scalars['UUID']>;
  /** Auth failed at */
  authFailedAt?: InputMaybe<Scalars['DateTime']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** The account handle (email, username, phone number, etc.) */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Last sync history ID */
  lastSyncHistoryId?: InputMaybe<Scalars['String']>;
  /** The account provider */
  provider?: InputMaybe<Scalars['String']>;
  /** Messaging provider refresh token */
  refreshToken?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Currency = {
  amountMicros?: Maybe<Scalars['BigFloat']>;
  currencyCode?: Maybe<Scalars['String']>;
};

export type CurrencyCreateInput = {
  amountMicros?: InputMaybe<Scalars['BigFloat']>;
  currencyCode?: InputMaybe<Scalars['String']>;
};

export type CurrencyFilterInput = {
  amountMicros?: InputMaybe<BigFloatFilter>;
  currencyCode?: InputMaybe<StringFilter>;
};

export type CurrencyOrderByInput = {
  amountMicros?: InputMaybe<OrderByDirection>;
  currencyCode?: InputMaybe<OrderByDirection>;
};

export type CurrencyUpdateInput = {
  amountMicros?: InputMaybe<Scalars['BigFloat']>;
  currencyCode?: InputMaybe<Scalars['String']>;
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
  id: Scalars['UUID'];
};

/** Schema update on a table */
export enum DistantTableUpdate {
  ColumnsAdded = 'COLUMNS_ADDED',
  ColumnsDeleted = 'COLUMNS_DELETED',
  ColumnsTypeChanged = 'COLUMNS_TYPE_CHANGED',
  TableDeleted = 'TABLE_DELETED'
}

export type EmailPasswordResetLink = {
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type ExchangeAuthCode = {
  accessToken: AuthToken;
  loginToken: AuthToken;
  refreshToken: AuthToken;
};

/** A favorite */
export type Favorite = {
  /** Favorite company */
  company?: Maybe<Company>;
  /** Favorite company id foreign key */
  companyId?: Maybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Favorite opportunity */
  opportunity?: Maybe<Opportunity>;
  /** Favorite opportunity id foreign key */
  opportunityId?: Maybe<Scalars['UUID']>;
  /** Favorite person */
  person?: Maybe<Person>;
  /** Favorite person id foreign key */
  personId?: Maybe<Scalars['UUID']>;
  /** Favorite position */
  position?: Maybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Favorite workspace member */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

/** A favorite */
export type FavoriteConnection = {
  edges?: Maybe<Array<FavoriteEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A favorite */
export type FavoriteCreateInput = {
  /** Favorite company id foreign key */
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Favorite opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['UUID']>;
  /** Favorite person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Favorite position */
  position?: InputMaybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId: Scalars['UUID'];
};

/** A favorite */
export type FavoriteEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Favorite>;
};

/** A favorite */
export type FavoriteFilterInput = {
  and?: InputMaybe<Array<InputMaybe<FavoriteFilterInput>>>;
  /** Favorite company id foreign key */
  companyId?: InputMaybe<IdFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<FavoriteFilterInput>;
  /** Favorite opportunity id foreign key */
  opportunityId?: InputMaybe<IdFilter>;
  or?: InputMaybe<Array<InputMaybe<FavoriteFilterInput>>>;
  /** Favorite person id foreign key */
  personId?: InputMaybe<IdFilter>;
  /** Favorite position */
  position?: InputMaybe<FloatFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId?: InputMaybe<IdFilter>;
};

/** A favorite */
export type FavoriteOrderByInput = {
  /** Favorite company id foreign key */
  companyId?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Favorite opportunity id foreign key */
  opportunityId?: InputMaybe<OrderByDirection>;
  /** Favorite person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Favorite position */
  position?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId?: InputMaybe<OrderByDirection>;
};

/** A favorite */
export type FavoriteUpdateInput = {
  /** Favorite company id foreign key */
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Favorite opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['UUID']>;
  /** Favorite person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Favorite position */
  position?: InputMaybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Favorite workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

export type FeatureFlag = {
  id: Scalars['UUID'];
  key: Scalars['String'];
  value: Scalars['Boolean'];
  workspaceId: Scalars['String'];
};

export type FeatureFlagFilter = {
  and?: InputMaybe<Array<FeatureFlagFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
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
};

/** Type of the field */
export enum FieldMetadataType {
  Address = 'ADDRESS',
  Boolean = 'BOOLEAN',
  Currency = 'CURRENCY',
  Date = 'DATE',
  DateTime = 'DATE_TIME',
  Email = 'EMAIL',
  FullName = 'FULL_NAME',
  Link = 'LINK',
  Links = 'LINKS',
  MultiSelect = 'MULTI_SELECT',
  Number = 'NUMBER',
  Numeric = 'NUMERIC',
  Phone = 'PHONE',
  Phones = 'PHONES',
  Position = 'POSITION',
  Rating = 'RATING',
  RawJson = 'RAW_JSON',
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
  firstName: Scalars['String'];
  lastName: Scalars['String'];
};

export type FullNameCreateInput = {
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
};

export type FullNameFilterInput = {
  firstName?: InputMaybe<StringFilter>;
  lastName?: InputMaybe<StringFilter>;
};

export type FullNameOrderByInput = {
  firstName?: InputMaybe<OrderByDirection>;
  lastName?: InputMaybe<OrderByDirection>;
};

export type FullNameUpdateInput = {
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
};

export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']>;
  gt?: InputMaybe<Scalars['ID']>;
  gte?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['ID']>;
  lte?: InputMaybe<Scalars['ID']>;
  neq?: InputMaybe<Scalars['ID']>;
};

export type InvalidatePassword = {
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type Link = {
  label?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type LinkCreateInput = {
  label?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};

export type LinkFilterInput = {
  label?: InputMaybe<StringFilter>;
  url?: InputMaybe<StringFilter>;
};

export type LinkMetadata = {
  label: Scalars['String'];
  url: Scalars['String'];
};

export type LinkOrderByInput = {
  label?: InputMaybe<OrderByDirection>;
  url?: InputMaybe<OrderByDirection>;
};

export type LinkUpdateInput = {
  label?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};

export type Links = {
  primaryLinkLabel?: Maybe<Scalars['String']>;
  primaryLinkUrl?: Maybe<Scalars['String']>;
  secondaryLinks?: Maybe<Scalars['RawJSONScalar']>;
};

export type LinksCreateInput = {
  primaryLinkLabel?: InputMaybe<Scalars['String']>;
  primaryLinkUrl?: InputMaybe<Scalars['String']>;
  secondaryLinks?: InputMaybe<Scalars['RawJSONScalar']>;
};

export type LinksFilterInput = {
  primaryLinkLabel?: InputMaybe<StringFilter>;
  primaryLinkUrl?: InputMaybe<StringFilter>;
  secondaryLinks?: InputMaybe<RawJsonFilter>;
};

export type LinksOrderByInput = {
  primaryLinkLabel?: InputMaybe<OrderByDirection>;
  primaryLinkUrl?: InputMaybe<OrderByDirection>;
  secondaryLinks?: InputMaybe<OrderByDirection>;
};

export type LinksUpdateInput = {
  primaryLinkLabel?: InputMaybe<Scalars['String']>;
  primaryLinkUrl?: InputMaybe<Scalars['String']>;
  secondaryLinks?: InputMaybe<Scalars['RawJSONScalar']>;
};

export type LoginToken = {
  loginToken: AuthToken;
};

/** Message */
export type Message = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Message Direction */
  direction?: Maybe<MessageDirectionEnum>;
  /** Message id from the message header */
  headerMessageId?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Messages from the channel. */
  messageChannelMessageAssociations?: Maybe<MessageChannelMessageAssociationConnection>;
  /** Message Participants */
  messageParticipants?: Maybe<MessageParticipantConnection>;
  /** Message Thread Id */
  messageThread?: Maybe<MessageThread>;
  /** Message Thread Id id foreign key */
  messageThreadId?: Maybe<Scalars['UUID']>;
  /** The date the message was received */
  receivedAt?: Maybe<Scalars['DateTime']>;
  /** Subject */
  subject?: Maybe<Scalars['String']>;
  /** Text */
  text?: Maybe<Scalars['String']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};


/** Message */
export type MessageMessageChannelMessageAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationOrderByInput>>>;
};


/** Message */
export type MessageMessageParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageParticipantOrderByInput>>>;
};

/** Message Channels */
export type MessageChannel = {
  /** Connected Account */
  connectedAccount?: Maybe<ConnectedAccount>;
  /** Connected Account id foreign key */
  connectedAccountId?: Maybe<Scalars['UUID']>;
  /** Automatically create People records when receiving or sending emails */
  contactAutoCreationPolicy?: Maybe<MessageChannelContactAutoCreationPolicyEnum>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Exclude group emails */
  excludeGroupEmails?: Maybe<Scalars['Boolean']>;
  /** Exclude non professional emails */
  excludeNonProfessionalEmails?: Maybe<Scalars['Boolean']>;
  /** Handle */
  handle?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: Maybe<Scalars['Boolean']>;
  /** Is Sync Enabled */
  isSyncEnabled?: Maybe<Scalars['Boolean']>;
  /** Messages from the channel. */
  messageChannelMessageAssociations?: Maybe<MessageChannelMessageAssociationConnection>;
  /** Last sync cursor */
  syncCursor?: Maybe<Scalars['String']>;
  /** Sync stage */
  syncStage?: Maybe<MessageChannelSyncStageEnum>;
  /** Sync stage started at */
  syncStageStartedAt?: Maybe<Scalars['DateTime']>;
  /** Sync status */
  syncStatus?: Maybe<MessageChannelSyncStatusEnum>;
  /** Last sync date */
  syncedAt?: Maybe<Scalars['DateTime']>;
  /** Throttle Failure Count */
  throttleFailureCount?: Maybe<Scalars['Float']>;
  /** Channel Type */
  type?: Maybe<MessageChannelTypeEnum>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Visibility */
  visibility?: Maybe<MessageChannelVisibilityEnum>;
};


/** Message Channels */
export type MessageChannelMessageChannelMessageAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationOrderByInput>>>;
};

/** Message Channels */
export type MessageChannelConnection = {
  edges?: Maybe<Array<MessageChannelEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Automatically create People records when receiving or sending emails */
export enum MessageChannelContactAutoCreationPolicyEnum {
  /** None */
  None = 'NONE',
  /** Sent */
  Sent = 'SENT',
  /** Sent and Received */
  SentAndReceived = 'SENT_AND_RECEIVED'
}

export type MessageChannelContactAutoCreationPolicyEnumFilter = {
  eq?: InputMaybe<MessageChannelContactAutoCreationPolicyEnum>;
  in?: InputMaybe<Array<InputMaybe<MessageChannelContactAutoCreationPolicyEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageChannelContactAutoCreationPolicyEnum>;
};

/** Message Channels */
export type MessageChannelCreateInput = {
  /** Connected Account id foreign key */
  connectedAccountId: Scalars['UUID'];
  /** Automatically create People records when receiving or sending emails */
  contactAutoCreationPolicy?: InputMaybe<MessageChannelContactAutoCreationPolicyEnum>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Exclude group emails */
  excludeGroupEmails?: InputMaybe<Scalars['Boolean']>;
  /** Exclude non professional emails */
  excludeNonProfessionalEmails?: InputMaybe<Scalars['Boolean']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Is Sync Enabled */
  isSyncEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Last sync cursor */
  syncCursor?: InputMaybe<Scalars['String']>;
  /** Sync stage */
  syncStage?: InputMaybe<MessageChannelSyncStageEnum>;
  /** Sync stage started at */
  syncStageStartedAt?: InputMaybe<Scalars['DateTime']>;
  /** Sync status */
  syncStatus?: InputMaybe<MessageChannelSyncStatusEnum>;
  /** Last sync date */
  syncedAt?: InputMaybe<Scalars['DateTime']>;
  /** Throttle Failure Count */
  throttleFailureCount?: InputMaybe<Scalars['Float']>;
  /** Channel Type */
  type?: InputMaybe<MessageChannelTypeEnum>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Visibility */
  visibility?: InputMaybe<MessageChannelVisibilityEnum>;
};

/** Message Channels */
export type MessageChannelEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<MessageChannel>;
};

/** Message Channels */
export type MessageChannelFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageChannelFilterInput>>>;
  /** Connected Account id foreign key */
  connectedAccountId?: InputMaybe<IdFilter>;
  /** Automatically create People records when receiving or sending emails */
  contactAutoCreationPolicy?: InputMaybe<MessageChannelContactAutoCreationPolicyEnumFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Exclude group emails */
  excludeGroupEmails?: InputMaybe<BooleanFilter>;
  /** Exclude non professional emails */
  excludeNonProfessionalEmails?: InputMaybe<BooleanFilter>;
  /** Handle */
  handle?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<BooleanFilter>;
  /** Is Sync Enabled */
  isSyncEnabled?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<MessageChannelFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageChannelFilterInput>>>;
  /** Last sync cursor */
  syncCursor?: InputMaybe<StringFilter>;
  /** Sync stage */
  syncStage?: InputMaybe<MessageChannelSyncStageEnumFilter>;
  /** Sync stage started at */
  syncStageStartedAt?: InputMaybe<DateFilter>;
  /** Sync status */
  syncStatus?: InputMaybe<MessageChannelSyncStatusEnumFilter>;
  /** Last sync date */
  syncedAt?: InputMaybe<DateFilter>;
  /** Throttle Failure Count */
  throttleFailureCount?: InputMaybe<FloatFilter>;
  /** Channel Type */
  type?: InputMaybe<MessageChannelTypeEnumFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** Visibility */
  visibility?: InputMaybe<MessageChannelVisibilityEnumFilter>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociation = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Message Id */
  message?: Maybe<Message>;
  /** Message Channel Id */
  messageChannel?: Maybe<MessageChannel>;
  /** Message Channel Id id foreign key */
  messageChannelId?: Maybe<Scalars['UUID']>;
  /** Message id from the messaging provider */
  messageExternalId?: Maybe<Scalars['String']>;
  /** Message Id id foreign key */
  messageId?: Maybe<Scalars['UUID']>;
  /** Message Thread Id */
  messageThread?: Maybe<MessageThread>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: Maybe<Scalars['String']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: Maybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationConnection = {
  edges?: Maybe<Array<MessageChannelMessageAssociationEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Message Channel Id id foreign key */
  messageChannelId?: InputMaybe<Scalars['UUID']>;
  /** Message id from the messaging provider */
  messageExternalId?: InputMaybe<Scalars['String']>;
  /** Message Id id foreign key */
  messageId?: InputMaybe<Scalars['UUID']>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: InputMaybe<Scalars['String']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<MessageChannelMessageAssociation>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Message Channel Id id foreign key */
  messageChannelId?: InputMaybe<IdFilter>;
  /** Message id from the messaging provider */
  messageExternalId?: InputMaybe<StringFilter>;
  /** Message Id id foreign key */
  messageId?: InputMaybe<IdFilter>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: InputMaybe<StringFilter>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<IdFilter>;
  not?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationFilterInput>>>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
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
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Message Synced with a Message Channel */
export type MessageChannelMessageAssociationUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Message Channel Id id foreign key */
  messageChannelId?: InputMaybe<Scalars['UUID']>;
  /** Message id from the messaging provider */
  messageExternalId?: InputMaybe<Scalars['String']>;
  /** Message Id id foreign key */
  messageId?: InputMaybe<Scalars['UUID']>;
  /** Thread id from the messaging provider */
  messageThreadExternalId?: InputMaybe<Scalars['String']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message Channels */
export type MessageChannelOrderByInput = {
  /** Connected Account id foreign key */
  connectedAccountId?: InputMaybe<OrderByDirection>;
  /** Automatically create People records when receiving or sending emails */
  contactAutoCreationPolicy?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Exclude group emails */
  excludeGroupEmails?: InputMaybe<OrderByDirection>;
  /** Exclude non professional emails */
  excludeNonProfessionalEmails?: InputMaybe<OrderByDirection>;
  /** Handle */
  handle?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<OrderByDirection>;
  /** Is Sync Enabled */
  isSyncEnabled?: InputMaybe<OrderByDirection>;
  /** Last sync cursor */
  syncCursor?: InputMaybe<OrderByDirection>;
  /** Sync stage */
  syncStage?: InputMaybe<OrderByDirection>;
  /** Sync stage started at */
  syncStageStartedAt?: InputMaybe<OrderByDirection>;
  /** Sync status */
  syncStatus?: InputMaybe<OrderByDirection>;
  /** Last sync date */
  syncedAt?: InputMaybe<OrderByDirection>;
  /** Throttle Failure Count */
  throttleFailureCount?: InputMaybe<OrderByDirection>;
  /** Channel Type */
  type?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Visibility */
  visibility?: InputMaybe<OrderByDirection>;
};

/** Sync stage */
export enum MessageChannelSyncStageEnum {
  /** Failed */
  Failed = 'FAILED',
  /** Full messages list fetch pending */
  FullMessageListFetchPending = 'FULL_MESSAGE_LIST_FETCH_PENDING',
  /** Messages import ongoing */
  MessagesImportOngoing = 'MESSAGES_IMPORT_ONGOING',
  /** Messages import pending */
  MessagesImportPending = 'MESSAGES_IMPORT_PENDING',
  /** Messages list fetch ongoing */
  MessageListFetchOngoing = 'MESSAGE_LIST_FETCH_ONGOING',
  /** Partial messages list fetch pending */
  PartialMessageListFetchPending = 'PARTIAL_MESSAGE_LIST_FETCH_PENDING'
}

export type MessageChannelSyncStageEnumFilter = {
  eq?: InputMaybe<MessageChannelSyncStageEnum>;
  in?: InputMaybe<Array<InputMaybe<MessageChannelSyncStageEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageChannelSyncStageEnum>;
};

/** Sync status */
export enum MessageChannelSyncStatusEnum {
  /** Active */
  Active = 'ACTIVE',
  /** Failed */
  Failed = 'FAILED',
  /** Failed Insufficient Permissions */
  FailedInsufficientPermissions = 'FAILED_INSUFFICIENT_PERMISSIONS',
  /** Failed Unknown */
  FailedUnknown = 'FAILED_UNKNOWN',
  /** Not Synced */
  NotSynced = 'NOT_SYNCED',
  /** Ongoing */
  Ongoing = 'ONGOING',
  /** Pending */
  Pending = 'PENDING',
  /** Succeeded */
  Succeeded = 'SUCCEEDED'
}

export type MessageChannelSyncStatusEnumFilter = {
  eq?: InputMaybe<MessageChannelSyncStatusEnum>;
  in?: InputMaybe<Array<InputMaybe<MessageChannelSyncStatusEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageChannelSyncStatusEnum>;
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
  connectedAccountId?: InputMaybe<Scalars['UUID']>;
  /** Automatically create People records when receiving or sending emails */
  contactAutoCreationPolicy?: InputMaybe<MessageChannelContactAutoCreationPolicyEnum>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Exclude group emails */
  excludeGroupEmails?: InputMaybe<Scalars['Boolean']>;
  /** Exclude non professional emails */
  excludeNonProfessionalEmails?: InputMaybe<Scalars['Boolean']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Is Contact Auto Creation Enabled */
  isContactAutoCreationEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Is Sync Enabled */
  isSyncEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Last sync cursor */
  syncCursor?: InputMaybe<Scalars['String']>;
  /** Sync stage */
  syncStage?: InputMaybe<MessageChannelSyncStageEnum>;
  /** Sync stage started at */
  syncStageStartedAt?: InputMaybe<Scalars['DateTime']>;
  /** Sync status */
  syncStatus?: InputMaybe<MessageChannelSyncStatusEnum>;
  /** Last sync date */
  syncedAt?: InputMaybe<Scalars['DateTime']>;
  /** Throttle Failure Count */
  throttleFailureCount?: InputMaybe<Scalars['Float']>;
  /** Channel Type */
  type?: InputMaybe<MessageChannelTypeEnum>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Visibility */
  visibility?: InputMaybe<MessageChannelVisibilityEnum>;
};

/** Visibility of the message channel */
export enum MessageChannelVisibility {
  Metadata = 'METADATA',
  ShareEverything = 'SHARE_EVERYTHING',
  Subject = 'SUBJECT'
}

/** Visibility */
export enum MessageChannelVisibilityEnum {
  /** Metadata */
  Metadata = 'METADATA',
  /** Share Everything */
  ShareEverything = 'SHARE_EVERYTHING',
  /** Subject */
  Subject = 'SUBJECT'
}

export type MessageChannelVisibilityEnumFilter = {
  eq?: InputMaybe<MessageChannelVisibilityEnum>;
  in?: InputMaybe<Array<InputMaybe<MessageChannelVisibilityEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<MessageChannelVisibilityEnum>;
};

/** Message */
export type MessageConnection = {
  edges?: Maybe<Array<MessageEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message */
export type MessageCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Message Direction */
  direction?: InputMaybe<MessageDirectionEnum>;
  /** Message id from the message header */
  headerMessageId?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<Scalars['UUID']>;
  /** The date the message was received */
  receivedAt?: InputMaybe<Scalars['DateTime']>;
  /** Subject */
  subject?: InputMaybe<Scalars['String']>;
  /** Text */
  text?: InputMaybe<Scalars['String']>;
  /** Update date */
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
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Message>;
};

/** Message */
export type MessageFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Message Direction */
  direction?: InputMaybe<MessageDirectionEnumFilter>;
  /** Message id from the message header */
  headerMessageId?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<IdFilter>;
  not?: InputMaybe<MessageFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageFilterInput>>>;
  /** The date the message was received */
  receivedAt?: InputMaybe<DateFilter>;
  /** Subject */
  subject?: InputMaybe<StringFilter>;
  /** Text */
  text?: InputMaybe<StringFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** Message */
export type MessageOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Message Direction */
  direction?: InputMaybe<OrderByDirection>;
  /** Message id from the message header */
  headerMessageId?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<OrderByDirection>;
  /** The date the message was received */
  receivedAt?: InputMaybe<OrderByDirection>;
  /** Subject */
  subject?: InputMaybe<OrderByDirection>;
  /** Text */
  text?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Message Participants */
export type MessageParticipant = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Display Name */
  displayName?: Maybe<Scalars['String']>;
  /** Handle */
  handle?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Message */
  message?: Maybe<Message>;
  /** Message id foreign key */
  messageId?: Maybe<Scalars['UUID']>;
  /** Person */
  person?: Maybe<Person>;
  /** Person id foreign key */
  personId?: Maybe<Scalars['UUID']>;
  /** Role */
  role?: Maybe<MessageParticipantRoleEnum>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Workspace member */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** Workspace member id foreign key */
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

/** Message Participants */
export type MessageParticipantConnection = {
  edges?: Maybe<Array<MessageParticipantEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message Participants */
export type MessageParticipantCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Display Name */
  displayName?: InputMaybe<Scalars['String']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Message id foreign key */
  messageId: Scalars['UUID'];
  /** Person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Role */
  role?: InputMaybe<MessageParticipantRoleEnum>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

/** Message Participants */
export type MessageParticipantEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<MessageParticipant>;
};

/** Message Participants */
export type MessageParticipantFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageParticipantFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Display Name */
  displayName?: InputMaybe<StringFilter>;
  /** Handle */
  handle?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Message id foreign key */
  messageId?: InputMaybe<IdFilter>;
  not?: InputMaybe<MessageParticipantFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageParticipantFilterInput>>>;
  /** Person id foreign key */
  personId?: InputMaybe<IdFilter>;
  /** Role */
  role?: InputMaybe<MessageParticipantRoleEnumFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** Workspace member id foreign key */
  workspaceMemberId?: InputMaybe<IdFilter>;
};

/** Message Participants */
export type MessageParticipantOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Display Name */
  displayName?: InputMaybe<OrderByDirection>;
  /** Handle */
  handle?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Message id foreign key */
  messageId?: InputMaybe<OrderByDirection>;
  /** Person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Role */
  role?: InputMaybe<OrderByDirection>;
  /** Update date */
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
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Display Name */
  displayName?: InputMaybe<Scalars['String']>;
  /** Handle */
  handle?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Message id foreign key */
  messageId?: InputMaybe<Scalars['UUID']>;
  /** Person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Role */
  role?: InputMaybe<MessageParticipantRoleEnum>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

/** Message Thread */
export type MessageThread = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Messages from the channel */
  messageChannelMessageAssociations?: Maybe<MessageChannelMessageAssociationConnection>;
  /** Messages from the thread. */
  messages?: Maybe<MessageConnection>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};


/** Message Thread */
export type MessageThreadMessageChannelMessageAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationOrderByInput>>>;
};


/** Message Thread */
export type MessageThreadMessagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageOrderByInput>>>;
};

/** Message Thread */
export type MessageThreadConnection = {
  edges?: Maybe<Array<MessageThreadEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Message Thread */
export type MessageThreadCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message Thread */
export type MessageThreadEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<MessageThread>;
};

/** Message Thread */
export type MessageThreadFilterInput = {
  and?: InputMaybe<Array<InputMaybe<MessageThreadFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<MessageThreadFilterInput>;
  or?: InputMaybe<Array<InputMaybe<MessageThreadFilterInput>>>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** Message Thread */
export type MessageThreadOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** Message Thread */
export type MessageThreadUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** Message */
export type MessageUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Message Direction */
  direction?: InputMaybe<MessageDirectionEnum>;
  /** Message id from the message header */
  headerMessageId?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Message Thread Id id foreign key */
  messageThreadId?: InputMaybe<Scalars['UUID']>;
  /** The date the message was received */
  receivedAt?: InputMaybe<Scalars['DateTime']>;
  /** Subject */
  subject?: InputMaybe<Scalars['String']>;
  /** Text */
  text?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Mutation = {
  activateWorkspace: Workspace;
  addUserToWorkspace: User;
  authorizeApp: AuthorizeApp;
  challenge: LoginToken;
  checkoutSession: SessionEntity;
  createActivities?: Maybe<Array<Activity>>;
  createActivity?: Maybe<Activity>;
  createActivityTarget?: Maybe<ActivityTarget>;
  createActivityTargets?: Maybe<Array<ActivityTarget>>;
  createApiKey?: Maybe<ApiKey>;
  createApiKeys?: Maybe<Array<ApiKey>>;
  createAttachment?: Maybe<Attachment>;
  createAttachments?: Maybe<Array<Attachment>>;
  createAuditLog?: Maybe<AuditLog>;
  createAuditLogs?: Maybe<Array<AuditLog>>;
  createBlocklist?: Maybe<Blocklist>;
  createBlocklists?: Maybe<Array<Blocklist>>;
  createCalendarChannel?: Maybe<CalendarChannel>;
  createCalendarChannelEventAssociation?: Maybe<CalendarChannelEventAssociation>;
  createCalendarChannelEventAssociations?: Maybe<Array<CalendarChannelEventAssociation>>;
  createCalendarChannels?: Maybe<Array<CalendarChannel>>;
  createCalendarEvent?: Maybe<CalendarEvent>;
  createCalendarEventParticipant?: Maybe<CalendarEventParticipant>;
  createCalendarEventParticipants?: Maybe<Array<CalendarEventParticipant>>;
  createCalendarEvents?: Maybe<Array<CalendarEvent>>;
  createComment?: Maybe<Comment>;
  createComments?: Maybe<Array<Comment>>;
  createCompanies?: Maybe<Array<Company>>;
  createCompany?: Maybe<Company>;
  createConnectedAccount?: Maybe<ConnectedAccount>;
  createConnectedAccounts?: Maybe<Array<ConnectedAccount>>;
  createFavorite?: Maybe<Favorite>;
  createFavorites?: Maybe<Array<Favorite>>;
  createMessage?: Maybe<Message>;
  createMessageChannel?: Maybe<MessageChannel>;
  createMessageChannelMessageAssociation?: Maybe<MessageChannelMessageAssociation>;
  createMessageChannelMessageAssociations?: Maybe<Array<MessageChannelMessageAssociation>>;
  createMessageChannels?: Maybe<Array<MessageChannel>>;
  createMessageParticipant?: Maybe<MessageParticipant>;
  createMessageParticipants?: Maybe<Array<MessageParticipant>>;
  createMessageThread?: Maybe<MessageThread>;
  createMessageThreads?: Maybe<Array<MessageThread>>;
  createMessages?: Maybe<Array<Message>>;
  createOneAppToken: AppToken;
  createOneObject: Object;
  createOpportunities?: Maybe<Array<Opportunity>>;
  createOpportunity?: Maybe<Opportunity>;
  createPeople?: Maybe<Array<Person>>;
  createPerson?: Maybe<Person>;
  createTimelineActivities?: Maybe<Array<TimelineActivity>>;
  createTimelineActivity?: Maybe<TimelineActivity>;
  createView?: Maybe<View>;
  createViewField?: Maybe<ViewField>;
  createViewFields?: Maybe<Array<ViewField>>;
  createViewFilter?: Maybe<ViewFilter>;
  createViewFilters?: Maybe<Array<ViewFilter>>;
  createViewSort?: Maybe<ViewSort>;
  createViewSorts?: Maybe<Array<ViewSort>>;
  createViews?: Maybe<Array<View>>;
  createWebhook?: Maybe<Webhook>;
  createWebhooks?: Maybe<Array<Webhook>>;
  createWorkspaceMember?: Maybe<WorkspaceMember>;
  createWorkspaceMembers?: Maybe<Array<WorkspaceMember>>;
  deleteActivities?: Maybe<Array<Activity>>;
  deleteActivity?: Maybe<Activity>;
  deleteActivityTarget?: Maybe<ActivityTarget>;
  deleteActivityTargets?: Maybe<Array<ActivityTarget>>;
  deleteApiKey?: Maybe<ApiKey>;
  deleteApiKeys?: Maybe<Array<ApiKey>>;
  deleteAttachment?: Maybe<Attachment>;
  deleteAttachments?: Maybe<Array<Attachment>>;
  deleteAuditLog?: Maybe<AuditLog>;
  deleteAuditLogs?: Maybe<Array<AuditLog>>;
  deleteBlocklist?: Maybe<Blocklist>;
  deleteBlocklists?: Maybe<Array<Blocklist>>;
  deleteCalendarChannel?: Maybe<CalendarChannel>;
  deleteCalendarChannelEventAssociation?: Maybe<CalendarChannelEventAssociation>;
  deleteCalendarChannelEventAssociations?: Maybe<Array<CalendarChannelEventAssociation>>;
  deleteCalendarChannels?: Maybe<Array<CalendarChannel>>;
  deleteCalendarEvent?: Maybe<CalendarEvent>;
  deleteCalendarEventParticipant?: Maybe<CalendarEventParticipant>;
  deleteCalendarEventParticipants?: Maybe<Array<CalendarEventParticipant>>;
  deleteCalendarEvents?: Maybe<Array<CalendarEvent>>;
  deleteComment?: Maybe<Comment>;
  deleteComments?: Maybe<Array<Comment>>;
  deleteCompanies?: Maybe<Array<Company>>;
  deleteCompany?: Maybe<Company>;
  deleteConnectedAccount?: Maybe<ConnectedAccount>;
  deleteConnectedAccounts?: Maybe<Array<ConnectedAccount>>;
  deleteCurrentWorkspace: Workspace;
  deleteFavorite?: Maybe<Favorite>;
  deleteFavorites?: Maybe<Array<Favorite>>;
  deleteMessage?: Maybe<Message>;
  deleteMessageChannel?: Maybe<MessageChannel>;
  deleteMessageChannelMessageAssociation?: Maybe<MessageChannelMessageAssociation>;
  deleteMessageChannelMessageAssociations?: Maybe<Array<MessageChannelMessageAssociation>>;
  deleteMessageChannels?: Maybe<Array<MessageChannel>>;
  deleteMessageParticipant?: Maybe<MessageParticipant>;
  deleteMessageParticipants?: Maybe<Array<MessageParticipant>>;
  deleteMessageThread?: Maybe<MessageThread>;
  deleteMessageThreads?: Maybe<Array<MessageThread>>;
  deleteMessages?: Maybe<Array<Message>>;
  deleteOneObject: Object;
  deleteOpportunities?: Maybe<Array<Opportunity>>;
  deleteOpportunity?: Maybe<Opportunity>;
  deletePeople?: Maybe<Array<Person>>;
  deletePerson?: Maybe<Person>;
  deleteTimelineActivities?: Maybe<Array<TimelineActivity>>;
  deleteTimelineActivity?: Maybe<TimelineActivity>;
  deleteUser: User;
  deleteView?: Maybe<View>;
  deleteViewField?: Maybe<ViewField>;
  deleteViewFields?: Maybe<Array<ViewField>>;
  deleteViewFilter?: Maybe<ViewFilter>;
  deleteViewFilters?: Maybe<Array<ViewFilter>>;
  deleteViewSort?: Maybe<ViewSort>;
  deleteViewSorts?: Maybe<Array<ViewSort>>;
  deleteViews?: Maybe<Array<View>>;
  deleteWebhook?: Maybe<Webhook>;
  deleteWebhooks?: Maybe<Array<Webhook>>;
  deleteWorkspaceMember?: Maybe<WorkspaceMember>;
  deleteWorkspaceMembers?: Maybe<Array<WorkspaceMember>>;
  disablePostgresProxy: PostgresCredentials;
  emailPasswordResetLink: EmailPasswordResetLink;
  enablePostgresProxy: PostgresCredentials;
  exchangeAuthorizationCode: ExchangeAuthCode;
  executeQuickActionOnActivity?: Maybe<Activity>;
  executeQuickActionOnActivityTarget?: Maybe<ActivityTarget>;
  executeQuickActionOnApiKey?: Maybe<ApiKey>;
  executeQuickActionOnAttachment?: Maybe<Attachment>;
  executeQuickActionOnAuditLog?: Maybe<AuditLog>;
  executeQuickActionOnBlocklist?: Maybe<Blocklist>;
  executeQuickActionOnCalendarChannel?: Maybe<CalendarChannel>;
  executeQuickActionOnCalendarChannelEventAssociation?: Maybe<CalendarChannelEventAssociation>;
  executeQuickActionOnCalendarEvent?: Maybe<CalendarEvent>;
  executeQuickActionOnCalendarEventParticipant?: Maybe<CalendarEventParticipant>;
  executeQuickActionOnComment?: Maybe<Comment>;
  executeQuickActionOnCompany?: Maybe<Company>;
  executeQuickActionOnConnectedAccount?: Maybe<ConnectedAccount>;
  executeQuickActionOnFavorite?: Maybe<Favorite>;
  executeQuickActionOnMessage?: Maybe<Message>;
  executeQuickActionOnMessageChannel?: Maybe<MessageChannel>;
  executeQuickActionOnMessageChannelMessageAssociation?: Maybe<MessageChannelMessageAssociation>;
  executeQuickActionOnMessageParticipant?: Maybe<MessageParticipant>;
  executeQuickActionOnMessageThread?: Maybe<MessageThread>;
  executeQuickActionOnOpportunity?: Maybe<Opportunity>;
  executeQuickActionOnPerson?: Maybe<Person>;
  executeQuickActionOnTimelineActivity?: Maybe<TimelineActivity>;
  executeQuickActionOnView?: Maybe<View>;
  executeQuickActionOnViewField?: Maybe<ViewField>;
  executeQuickActionOnViewFilter?: Maybe<ViewFilter>;
  executeQuickActionOnViewSort?: Maybe<ViewSort>;
  executeQuickActionOnWebhook?: Maybe<Webhook>;
  executeQuickActionOnWorkspaceMember?: Maybe<WorkspaceMember>;
  generateApiKeyToken: ApiKeyToken;
  generateJWT: AuthTokens;
  generateTransientToken: TransientToken;
  impersonate: Verify;
  renewToken: AuthTokens;
  sendInviteLink: SendInviteLink;
  signUp: LoginToken;
  skipSyncEmailOnboardingStep: OnboardingStepSuccess;
  track: Analytics;
  updateActivities?: Maybe<Array<Activity>>;
  updateActivity?: Maybe<Activity>;
  updateActivityTarget?: Maybe<ActivityTarget>;
  updateActivityTargets?: Maybe<Array<ActivityTarget>>;
  updateApiKey?: Maybe<ApiKey>;
  updateApiKeys?: Maybe<Array<ApiKey>>;
  updateAttachment?: Maybe<Attachment>;
  updateAttachments?: Maybe<Array<Attachment>>;
  updateAuditLog?: Maybe<AuditLog>;
  updateAuditLogs?: Maybe<Array<AuditLog>>;
  updateBillingSubscription: UpdateBillingEntity;
  updateBlocklist?: Maybe<Blocklist>;
  updateBlocklists?: Maybe<Array<Blocklist>>;
  updateCalendarChannel?: Maybe<CalendarChannel>;
  updateCalendarChannelEventAssociation?: Maybe<CalendarChannelEventAssociation>;
  updateCalendarChannelEventAssociations?: Maybe<Array<CalendarChannelEventAssociation>>;
  updateCalendarChannels?: Maybe<Array<CalendarChannel>>;
  updateCalendarEvent?: Maybe<CalendarEvent>;
  updateCalendarEventParticipant?: Maybe<CalendarEventParticipant>;
  updateCalendarEventParticipants?: Maybe<Array<CalendarEventParticipant>>;
  updateCalendarEvents?: Maybe<Array<CalendarEvent>>;
  updateComment?: Maybe<Comment>;
  updateComments?: Maybe<Array<Comment>>;
  updateCompanies?: Maybe<Array<Company>>;
  updateCompany?: Maybe<Company>;
  updateConnectedAccount?: Maybe<ConnectedAccount>;
  updateConnectedAccounts?: Maybe<Array<ConnectedAccount>>;
  updateFavorite?: Maybe<Favorite>;
  updateFavorites?: Maybe<Array<Favorite>>;
  updateMessage?: Maybe<Message>;
  updateMessageChannel?: Maybe<MessageChannel>;
  updateMessageChannelMessageAssociation?: Maybe<MessageChannelMessageAssociation>;
  updateMessageChannelMessageAssociations?: Maybe<Array<MessageChannelMessageAssociation>>;
  updateMessageChannels?: Maybe<Array<MessageChannel>>;
  updateMessageParticipant?: Maybe<MessageParticipant>;
  updateMessageParticipants?: Maybe<Array<MessageParticipant>>;
  updateMessageThread?: Maybe<MessageThread>;
  updateMessageThreads?: Maybe<Array<MessageThread>>;
  updateMessages?: Maybe<Array<Message>>;
  updateOneObject: Object;
  updateOpportunities?: Maybe<Array<Opportunity>>;
  updateOpportunity?: Maybe<Opportunity>;
  updatePasswordViaResetToken: InvalidatePassword;
  updatePeople?: Maybe<Array<Person>>;
  updatePerson?: Maybe<Person>;
  updateTimelineActivities?: Maybe<Array<TimelineActivity>>;
  updateTimelineActivity?: Maybe<TimelineActivity>;
  updateView?: Maybe<View>;
  updateViewField?: Maybe<ViewField>;
  updateViewFields?: Maybe<Array<ViewField>>;
  updateViewFilter?: Maybe<ViewFilter>;
  updateViewFilters?: Maybe<Array<ViewFilter>>;
  updateViewSort?: Maybe<ViewSort>;
  updateViewSorts?: Maybe<Array<ViewSort>>;
  updateViews?: Maybe<Array<View>>;
  updateWebhook?: Maybe<Webhook>;
  updateWebhooks?: Maybe<Array<Webhook>>;
  updateWorkspace: Workspace;
  updateWorkspaceMember?: Maybe<WorkspaceMember>;
  updateWorkspaceMembers?: Maybe<Array<WorkspaceMember>>;
  uploadFile: Scalars['String'];
  uploadImage: Scalars['String'];
  uploadProfilePicture: Scalars['String'];
  uploadWorkspaceLogo: Scalars['String'];
  verify: Verify;
};


export type MutationActivateWorkspaceArgs = {
  data: ActivateWorkspaceInput;
};


export type MutationAddUserToWorkspaceArgs = {
  inviteHash: Scalars['String'];
};


export type MutationAuthorizeAppArgs = {
  clientId: Scalars['String'];
  codeChallenge?: InputMaybe<Scalars['String']>;
  redirectUrl: Scalars['String'];
};


export type MutationChallengeArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCheckoutSessionArgs = {
  recurringInterval: SubscriptionInterval;
  successUrlPath?: InputMaybe<Scalars['String']>;
};


export type MutationCreateActivitiesArgs = {
  data?: InputMaybe<Array<ActivityCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateActivityArgs = {
  data?: InputMaybe<ActivityCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateActivityTargetArgs = {
  data?: InputMaybe<ActivityTargetCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateActivityTargetsArgs = {
  data?: InputMaybe<Array<ActivityTargetCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateApiKeyArgs = {
  data?: InputMaybe<ApiKeyCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateApiKeysArgs = {
  data?: InputMaybe<Array<ApiKeyCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateAttachmentArgs = {
  data?: InputMaybe<AttachmentCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateAttachmentsArgs = {
  data?: InputMaybe<Array<AttachmentCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateAuditLogArgs = {
  data?: InputMaybe<AuditLogCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateAuditLogsArgs = {
  data?: InputMaybe<Array<AuditLogCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateBlocklistArgs = {
  data?: InputMaybe<BlocklistCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateBlocklistsArgs = {
  data?: InputMaybe<Array<BlocklistCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCalendarChannelArgs = {
  data?: InputMaybe<CalendarChannelCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCalendarChannelEventAssociationArgs = {
  data?: InputMaybe<CalendarChannelEventAssociationCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCalendarChannelEventAssociationsArgs = {
  data?: InputMaybe<Array<CalendarChannelEventAssociationCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCalendarChannelsArgs = {
  data?: InputMaybe<Array<CalendarChannelCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCalendarEventArgs = {
  data?: InputMaybe<CalendarEventCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCalendarEventParticipantArgs = {
  data?: InputMaybe<CalendarEventParticipantCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCalendarEventParticipantsArgs = {
  data?: InputMaybe<Array<CalendarEventParticipantCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCalendarEventsArgs = {
  data?: InputMaybe<Array<CalendarEventCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCommentArgs = {
  data?: InputMaybe<CommentCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCommentsArgs = {
  data?: InputMaybe<Array<CommentCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCompaniesArgs = {
  data?: InputMaybe<Array<CompanyCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateCompanyArgs = {
  data?: InputMaybe<CompanyCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateConnectedAccountArgs = {
  data?: InputMaybe<ConnectedAccountCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateConnectedAccountsArgs = {
  data?: InputMaybe<Array<ConnectedAccountCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateFavoriteArgs = {
  data?: InputMaybe<FavoriteCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateFavoritesArgs = {
  data?: InputMaybe<Array<FavoriteCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageArgs = {
  data?: InputMaybe<MessageCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageChannelArgs = {
  data?: InputMaybe<MessageChannelCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageChannelMessageAssociationArgs = {
  data?: InputMaybe<MessageChannelMessageAssociationCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageChannelMessageAssociationsArgs = {
  data?: InputMaybe<Array<MessageChannelMessageAssociationCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageChannelsArgs = {
  data?: InputMaybe<Array<MessageChannelCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageParticipantArgs = {
  data?: InputMaybe<MessageParticipantCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageParticipantsArgs = {
  data?: InputMaybe<Array<MessageParticipantCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageThreadArgs = {
  data?: InputMaybe<MessageThreadCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessageThreadsArgs = {
  data?: InputMaybe<Array<MessageThreadCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateMessagesArgs = {
  data?: InputMaybe<Array<MessageCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateOpportunitiesArgs = {
  data?: InputMaybe<Array<OpportunityCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateOpportunityArgs = {
  data?: InputMaybe<OpportunityCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreatePeopleArgs = {
  data?: InputMaybe<Array<PersonCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreatePersonArgs = {
  data?: InputMaybe<PersonCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateTimelineActivitiesArgs = {
  data?: InputMaybe<Array<TimelineActivityCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateTimelineActivityArgs = {
  data?: InputMaybe<TimelineActivityCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateViewArgs = {
  data?: InputMaybe<ViewCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateViewFieldArgs = {
  data?: InputMaybe<ViewFieldCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateViewFieldsArgs = {
  data?: InputMaybe<Array<ViewFieldCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateViewFilterArgs = {
  data?: InputMaybe<ViewFilterCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateViewFiltersArgs = {
  data?: InputMaybe<Array<ViewFilterCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateViewSortArgs = {
  data?: InputMaybe<ViewSortCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateViewSortsArgs = {
  data?: InputMaybe<Array<ViewSortCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateViewsArgs = {
  data?: InputMaybe<Array<ViewCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateWebhookArgs = {
  data?: InputMaybe<WebhookCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateWebhooksArgs = {
  data?: InputMaybe<Array<WebhookCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateWorkspaceMemberArgs = {
  data?: InputMaybe<WorkspaceMemberCreateInput>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateWorkspaceMembersArgs = {
  data?: InputMaybe<Array<WorkspaceMemberCreateInput>>;
  upsert?: InputMaybe<Scalars['Boolean']>;
};


export type MutationDeleteActivitiesArgs = {
  filter?: InputMaybe<ActivityFilterInput>;
};


export type MutationDeleteActivityArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteActivityTargetArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteActivityTargetsArgs = {
  filter?: InputMaybe<ActivityTargetFilterInput>;
};


export type MutationDeleteApiKeyArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteApiKeysArgs = {
  filter?: InputMaybe<ApiKeyFilterInput>;
};


export type MutationDeleteAttachmentArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteAttachmentsArgs = {
  filter?: InputMaybe<AttachmentFilterInput>;
};


export type MutationDeleteAuditLogArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteAuditLogsArgs = {
  filter?: InputMaybe<AuditLogFilterInput>;
};


export type MutationDeleteBlocklistArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteBlocklistsArgs = {
  filter?: InputMaybe<BlocklistFilterInput>;
};


export type MutationDeleteCalendarChannelArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteCalendarChannelEventAssociationArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteCalendarChannelEventAssociationsArgs = {
  filter?: InputMaybe<CalendarChannelEventAssociationFilterInput>;
};


export type MutationDeleteCalendarChannelsArgs = {
  filter?: InputMaybe<CalendarChannelFilterInput>;
};


export type MutationDeleteCalendarEventArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteCalendarEventParticipantArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteCalendarEventParticipantsArgs = {
  filter?: InputMaybe<CalendarEventParticipantFilterInput>;
};


export type MutationDeleteCalendarEventsArgs = {
  filter?: InputMaybe<CalendarEventFilterInput>;
};


export type MutationDeleteCommentArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteCommentsArgs = {
  filter?: InputMaybe<CommentFilterInput>;
};


export type MutationDeleteCompaniesArgs = {
  filter?: InputMaybe<CompanyFilterInput>;
};


export type MutationDeleteCompanyArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteConnectedAccountArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteConnectedAccountsArgs = {
  filter?: InputMaybe<ConnectedAccountFilterInput>;
};


export type MutationDeleteFavoriteArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteFavoritesArgs = {
  filter?: InputMaybe<FavoriteFilterInput>;
};


export type MutationDeleteMessageArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteMessageChannelArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteMessageChannelMessageAssociationArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteMessageChannelMessageAssociationsArgs = {
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
};


export type MutationDeleteMessageChannelsArgs = {
  filter?: InputMaybe<MessageChannelFilterInput>;
};


export type MutationDeleteMessageParticipantArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteMessageParticipantsArgs = {
  filter?: InputMaybe<MessageParticipantFilterInput>;
};


export type MutationDeleteMessageThreadArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteMessageThreadsArgs = {
  filter?: InputMaybe<MessageThreadFilterInput>;
};


export type MutationDeleteMessagesArgs = {
  filter?: InputMaybe<MessageFilterInput>;
};


export type MutationDeleteOneObjectArgs = {
  input: DeleteOneObjectInput;
};


export type MutationDeleteOpportunitiesArgs = {
  filter?: InputMaybe<OpportunityFilterInput>;
};


export type MutationDeleteOpportunityArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeletePeopleArgs = {
  filter?: InputMaybe<PersonFilterInput>;
};


export type MutationDeletePersonArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteTimelineActivitiesArgs = {
  filter?: InputMaybe<TimelineActivityFilterInput>;
};


export type MutationDeleteTimelineActivityArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteViewArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteViewFieldArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteViewFieldsArgs = {
  filter?: InputMaybe<ViewFieldFilterInput>;
};


export type MutationDeleteViewFilterArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteViewFiltersArgs = {
  filter?: InputMaybe<ViewFilterFilterInput>;
};


export type MutationDeleteViewSortArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteViewSortsArgs = {
  filter?: InputMaybe<ViewSortFilterInput>;
};


export type MutationDeleteViewsArgs = {
  filter?: InputMaybe<ViewFilterInput>;
};


export type MutationDeleteWebhookArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteWebhooksArgs = {
  filter?: InputMaybe<WebhookFilterInput>;
};


export type MutationDeleteWorkspaceMemberArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationDeleteWorkspaceMembersArgs = {
  filter?: InputMaybe<WorkspaceMemberFilterInput>;
};


export type MutationEmailPasswordResetLinkArgs = {
  email: Scalars['String'];
};


export type MutationExchangeAuthorizationCodeArgs = {
  authorizationCode: Scalars['String'];
  clientSecret?: InputMaybe<Scalars['String']>;
  codeVerifier?: InputMaybe<Scalars['String']>;
};


export type MutationExecuteQuickActionOnActivityArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnActivityTargetArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnApiKeyArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnAttachmentArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnAuditLogArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnBlocklistArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnCalendarChannelArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnCalendarChannelEventAssociationArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnCalendarEventArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnCalendarEventParticipantArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnCommentArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnCompanyArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnConnectedAccountArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnFavoriteArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnMessageArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnMessageChannelArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnMessageChannelMessageAssociationArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnMessageParticipantArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnMessageThreadArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnOpportunityArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnPersonArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnTimelineActivityArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnViewArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnViewFieldArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnViewFilterArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnViewSortArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnWebhookArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationExecuteQuickActionOnWorkspaceMemberArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationGenerateApiKeyTokenArgs = {
  apiKeyId: Scalars['String'];
  expiresAt: Scalars['String'];
};


export type MutationGenerateJwtArgs = {
  workspaceId: Scalars['String'];
};


export type MutationImpersonateArgs = {
  userId: Scalars['String'];
};


export type MutationRenewTokenArgs = {
  appToken: Scalars['String'];
};


export type MutationSendInviteLinkArgs = {
  emails: Array<Scalars['String']>;
};


export type MutationSignUpArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
};


export type MutationTrackArgs = {
  data: Scalars['JSON'];
  type: Scalars['String'];
};


export type MutationUpdateActivitiesArgs = {
  data?: InputMaybe<ActivityUpdateInput>;
  filter?: InputMaybe<ActivityFilterInput>;
};


export type MutationUpdateActivityArgs = {
  data?: InputMaybe<ActivityUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateActivityTargetArgs = {
  data?: InputMaybe<ActivityTargetUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateActivityTargetsArgs = {
  data?: InputMaybe<ActivityTargetUpdateInput>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
};


export type MutationUpdateApiKeyArgs = {
  data?: InputMaybe<ApiKeyUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateApiKeysArgs = {
  data?: InputMaybe<ApiKeyUpdateInput>;
  filter?: InputMaybe<ApiKeyFilterInput>;
};


export type MutationUpdateAttachmentArgs = {
  data?: InputMaybe<AttachmentUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateAttachmentsArgs = {
  data?: InputMaybe<AttachmentUpdateInput>;
  filter?: InputMaybe<AttachmentFilterInput>;
};


export type MutationUpdateAuditLogArgs = {
  data?: InputMaybe<AuditLogUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateAuditLogsArgs = {
  data?: InputMaybe<AuditLogUpdateInput>;
  filter?: InputMaybe<AuditLogFilterInput>;
};


export type MutationUpdateBlocklistArgs = {
  data?: InputMaybe<BlocklistUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateBlocklistsArgs = {
  data?: InputMaybe<BlocklistUpdateInput>;
  filter?: InputMaybe<BlocklistFilterInput>;
};


export type MutationUpdateCalendarChannelArgs = {
  data?: InputMaybe<CalendarChannelUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateCalendarChannelEventAssociationArgs = {
  data?: InputMaybe<CalendarChannelEventAssociationUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateCalendarChannelEventAssociationsArgs = {
  data?: InputMaybe<CalendarChannelEventAssociationUpdateInput>;
  filter?: InputMaybe<CalendarChannelEventAssociationFilterInput>;
};


export type MutationUpdateCalendarChannelsArgs = {
  data?: InputMaybe<CalendarChannelUpdateInput>;
  filter?: InputMaybe<CalendarChannelFilterInput>;
};


export type MutationUpdateCalendarEventArgs = {
  data?: InputMaybe<CalendarEventUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateCalendarEventParticipantArgs = {
  data?: InputMaybe<CalendarEventParticipantUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateCalendarEventParticipantsArgs = {
  data?: InputMaybe<CalendarEventParticipantUpdateInput>;
  filter?: InputMaybe<CalendarEventParticipantFilterInput>;
};


export type MutationUpdateCalendarEventsArgs = {
  data?: InputMaybe<CalendarEventUpdateInput>;
  filter?: InputMaybe<CalendarEventFilterInput>;
};


export type MutationUpdateCommentArgs = {
  data?: InputMaybe<CommentUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateCommentsArgs = {
  data?: InputMaybe<CommentUpdateInput>;
  filter?: InputMaybe<CommentFilterInput>;
};


export type MutationUpdateCompaniesArgs = {
  data?: InputMaybe<CompanyUpdateInput>;
  filter?: InputMaybe<CompanyFilterInput>;
};


export type MutationUpdateCompanyArgs = {
  data?: InputMaybe<CompanyUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateConnectedAccountArgs = {
  data?: InputMaybe<ConnectedAccountUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateConnectedAccountsArgs = {
  data?: InputMaybe<ConnectedAccountUpdateInput>;
  filter?: InputMaybe<ConnectedAccountFilterInput>;
};


export type MutationUpdateFavoriteArgs = {
  data?: InputMaybe<FavoriteUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateFavoritesArgs = {
  data?: InputMaybe<FavoriteUpdateInput>;
  filter?: InputMaybe<FavoriteFilterInput>;
};


export type MutationUpdateMessageArgs = {
  data?: InputMaybe<MessageUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateMessageChannelArgs = {
  data?: InputMaybe<MessageChannelUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateMessageChannelMessageAssociationArgs = {
  data?: InputMaybe<MessageChannelMessageAssociationUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateMessageChannelMessageAssociationsArgs = {
  data?: InputMaybe<MessageChannelMessageAssociationUpdateInput>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
};


export type MutationUpdateMessageChannelsArgs = {
  data?: InputMaybe<MessageChannelUpdateInput>;
  filter?: InputMaybe<MessageChannelFilterInput>;
};


export type MutationUpdateMessageParticipantArgs = {
  data?: InputMaybe<MessageParticipantUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateMessageParticipantsArgs = {
  data?: InputMaybe<MessageParticipantUpdateInput>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
};


export type MutationUpdateMessageThreadArgs = {
  data?: InputMaybe<MessageThreadUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateMessageThreadsArgs = {
  data?: InputMaybe<MessageThreadUpdateInput>;
  filter?: InputMaybe<MessageThreadFilterInput>;
};


export type MutationUpdateMessagesArgs = {
  data?: InputMaybe<MessageUpdateInput>;
  filter?: InputMaybe<MessageFilterInput>;
};


export type MutationUpdateOneObjectArgs = {
  input: UpdateOneObjectInput;
};


export type MutationUpdateOpportunitiesArgs = {
  data?: InputMaybe<OpportunityUpdateInput>;
  filter?: InputMaybe<OpportunityFilterInput>;
};


export type MutationUpdateOpportunityArgs = {
  data?: InputMaybe<OpportunityUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String'];
  passwordResetToken: Scalars['String'];
};


export type MutationUpdatePeopleArgs = {
  data?: InputMaybe<PersonUpdateInput>;
  filter?: InputMaybe<PersonFilterInput>;
};


export type MutationUpdatePersonArgs = {
  data?: InputMaybe<PersonUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateTimelineActivitiesArgs = {
  data?: InputMaybe<TimelineActivityUpdateInput>;
  filter?: InputMaybe<TimelineActivityFilterInput>;
};


export type MutationUpdateTimelineActivityArgs = {
  data?: InputMaybe<TimelineActivityUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateViewArgs = {
  data?: InputMaybe<ViewUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateViewFieldArgs = {
  data?: InputMaybe<ViewFieldUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateViewFieldsArgs = {
  data?: InputMaybe<ViewFieldUpdateInput>;
  filter?: InputMaybe<ViewFieldFilterInput>;
};


export type MutationUpdateViewFilterArgs = {
  data?: InputMaybe<ViewFilterUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateViewFiltersArgs = {
  data?: InputMaybe<ViewFilterUpdateInput>;
  filter?: InputMaybe<ViewFilterFilterInput>;
};


export type MutationUpdateViewSortArgs = {
  data?: InputMaybe<ViewSortUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateViewSortsArgs = {
  data?: InputMaybe<ViewSortUpdateInput>;
  filter?: InputMaybe<ViewSortFilterInput>;
};


export type MutationUpdateViewsArgs = {
  data?: InputMaybe<ViewUpdateInput>;
  filter?: InputMaybe<ViewFilterInput>;
};


export type MutationUpdateWebhookArgs = {
  data?: InputMaybe<WebhookUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateWebhooksArgs = {
  data?: InputMaybe<WebhookUpdateInput>;
  filter?: InputMaybe<WebhookFilterInput>;
};


export type MutationUpdateWorkspaceArgs = {
  data: UpdateWorkspaceInput;
};


export type MutationUpdateWorkspaceMemberArgs = {
  data?: InputMaybe<WorkspaceMemberUpdateInput>;
  id?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateWorkspaceMembersArgs = {
  data?: InputMaybe<WorkspaceMemberUpdateInput>;
  filter?: InputMaybe<WorkspaceMemberFilterInput>;
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
};

export type ObjectFieldsConnection = {
  /** Array of edges. */
  edges: Array<FieldEdge>;
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
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

/** An opportunity */
export type Opportunity = {
  /** Activities tied to the opportunity */
  activityTargets?: Maybe<ActivityTargetConnection>;
  /** Opportunity amount */
  amount?: Maybe<Currency>;
  /** Attachments linked to the opportunity */
  attachments?: Maybe<AttachmentConnection>;
  /** Opportunity close date */
  closeDate?: Maybe<Scalars['DateTime']>;
  /** Opportunity company */
  company?: Maybe<Company>;
  /** Opportunity company id foreign key */
  companyId?: Maybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Favorites linked to the opportunity */
  favorites?: Maybe<FavoriteConnection>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** The opportunity name */
  name?: Maybe<Scalars['String']>;
  /** Opportunity point of contact */
  pointOfContact?: Maybe<Person>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: Maybe<Scalars['UUID']>;
  /** Opportunity record position */
  position?: Maybe<Scalars['Position']>;
  /** Opportunity probability */
  probability?: Maybe<Scalars['String']>;
  /** Opportunity stage */
  stage?: Maybe<OpportunityStageEnum>;
  /** Timeline Activities linked to the opportunity. */
  timelineActivities?: Maybe<TimelineActivityConnection>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};


/** An opportunity */
export type OpportunityActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityTargetOrderByInput>>>;
};


/** An opportunity */
export type OpportunityAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<AttachmentOrderByInput>>>;
};


/** An opportunity */
export type OpportunityFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<FavoriteOrderByInput>>>;
};


/** An opportunity */
export type OpportunityTimelineActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<TimelineActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<TimelineActivityOrderByInput>>>;
};

/** An opportunity */
export type OpportunityConnection = {
  edges?: Maybe<Array<OpportunityEdge>>;
  pageInfo?: Maybe<PageInfo>;
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
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** The opportunity name */
  name?: InputMaybe<Scalars['String']>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: InputMaybe<Scalars['UUID']>;
  /** Opportunity record position */
  position?: InputMaybe<Scalars['Position']>;
  /** Opportunity probability */
  probability?: InputMaybe<Scalars['String']>;
  /** Opportunity stage */
  stage?: InputMaybe<OpportunityStageEnum>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** An opportunity */
export type OpportunityEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Opportunity>;
};

/** An opportunity */
export type OpportunityFilterInput = {
  /** Opportunity amount */
  amount?: InputMaybe<CurrencyFilterInput>;
  and?: InputMaybe<Array<InputMaybe<OpportunityFilterInput>>>;
  /** Opportunity close date */
  closeDate?: InputMaybe<DateFilter>;
  /** Opportunity company id foreign key */
  companyId?: InputMaybe<IdFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** The opportunity name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<OpportunityFilterInput>;
  or?: InputMaybe<Array<InputMaybe<OpportunityFilterInput>>>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: InputMaybe<IdFilter>;
  /** Opportunity record position */
  position?: InputMaybe<FloatFilter>;
  /** Opportunity probability */
  probability?: InputMaybe<StringFilter>;
  /** Opportunity stage */
  stage?: InputMaybe<OpportunityStageEnumFilter>;
  /** Update date */
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
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** The opportunity name */
  name?: InputMaybe<OrderByDirection>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: InputMaybe<OrderByDirection>;
  /** Opportunity record position */
  position?: InputMaybe<OrderByDirection>;
  /** Opportunity probability */
  probability?: InputMaybe<OrderByDirection>;
  /** Opportunity stage */
  stage?: InputMaybe<OrderByDirection>;
  /** Update date */
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
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** The opportunity name */
  name?: InputMaybe<Scalars['String']>;
  /** Opportunity point of contact id foreign key */
  pointOfContactId?: InputMaybe<Scalars['UUID']>;
  /** Opportunity record position */
  position?: InputMaybe<Scalars['Position']>;
  /** Opportunity probability */
  probability?: InputMaybe<Scalars['String']>;
  /** Opportunity stage */
  stage?: InputMaybe<OpportunityStageEnum>;
  /** Update date */
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
  avatarUrl?: Maybe<Scalars['String']>;
  /** Calendar Event Participants */
  calendarEventParticipants?: Maybe<CalendarEventParticipantConnection>;
  /** Contact’s city */
  city?: Maybe<Scalars['String']>;
  /** Contact’s company */
  company?: Maybe<Company>;
  /** Contact’s company id foreign key */
  companyId?: Maybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Contact’s Email */
  email?: Maybe<Scalars['String']>;
  /** Favorites linked to the contact */
  favorites?: Maybe<FavoriteConnection>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Contact’s job title */
  jobTitle?: Maybe<Scalars['String']>;
  /** Contact’s Linkedin account */
  linkedinLink?: Maybe<Link>;
  /** Message Participants */
  messageParticipants?: Maybe<MessageParticipantConnection>;
  /** Contact’s name */
  name?: Maybe<FullName>;
  /** Contact’s phone number */
  phone?: Maybe<Scalars['String']>;
  /** Point of Contact for Opportunities */
  pointOfContactForOpportunities?: Maybe<OpportunityConnection>;
  /** Person record Position */
  position?: Maybe<Scalars['Position']>;
  /** Events linked to the company */
  timelineActivities?: Maybe<TimelineActivityConnection>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Contact’s X/Twitter account */
  xLink?: Maybe<Link>;
};


/** A person */
export type PersonActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityTargetOrderByInput>>>;
};


/** A person */
export type PersonAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<AttachmentOrderByInput>>>;
};


/** A person */
export type PersonCalendarEventParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarEventParticipantFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarEventParticipantOrderByInput>>>;
};


/** A person */
export type PersonFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<FavoriteOrderByInput>>>;
};


/** A person */
export type PersonMessageParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageParticipantOrderByInput>>>;
};


/** A person */
export type PersonPointOfContactForOpportunitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<OpportunityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<OpportunityOrderByInput>>>;
};


/** A person */
export type PersonTimelineActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<TimelineActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<TimelineActivityOrderByInput>>>;
};

/** A person */
export type PersonConnection = {
  edges?: Maybe<Array<PersonEdge>>;
  pageInfo?: Maybe<PageInfo>;
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
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Contact’s Email */
  email?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Contact’s job title */
  jobTitle?: InputMaybe<Scalars['String']>;
  /** Contact’s Linkedin account */
  linkedinLink?: InputMaybe<LinkCreateInput>;
  /** Contact’s name */
  name?: InputMaybe<FullNameCreateInput>;
  /** Contact’s phone number */
  phone?: InputMaybe<Scalars['String']>;
  /** Person record Position */
  position?: InputMaybe<Scalars['Position']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Contact’s X/Twitter account */
  xLink?: InputMaybe<LinkCreateInput>;
};

/** A person */
export type PersonEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Person>;
};

/** A person */
export type PersonFilterInput = {
  and?: InputMaybe<Array<InputMaybe<PersonFilterInput>>>;
  /** Contact’s avatar */
  avatarUrl?: InputMaybe<StringFilter>;
  /** Contact’s city */
  city?: InputMaybe<StringFilter>;
  /** Contact’s company id foreign key */
  companyId?: InputMaybe<IdFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Contact’s Email */
  email?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
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
  /** Person record Position */
  position?: InputMaybe<FloatFilter>;
  /** Update date */
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
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Contact’s Email */
  email?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Contact’s job title */
  jobTitle?: InputMaybe<OrderByDirection>;
  /** Contact’s Linkedin account */
  linkedinLink?: InputMaybe<LinkOrderByInput>;
  /** Contact’s name */
  name?: InputMaybe<FullNameOrderByInput>;
  /** Contact’s phone number */
  phone?: InputMaybe<OrderByDirection>;
  /** Person record Position */
  position?: InputMaybe<OrderByDirection>;
  /** Update date */
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
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Contact’s Email */
  email?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Contact’s job title */
  jobTitle?: InputMaybe<Scalars['String']>;
  /** Contact’s Linkedin account */
  linkedinLink?: InputMaybe<LinkUpdateInput>;
  /** Contact’s name */
  name?: InputMaybe<FullNameUpdateInput>;
  /** Contact’s phone number */
  phone?: InputMaybe<Scalars['String']>;
  /** Person record Position */
  position?: InputMaybe<Scalars['Position']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Contact’s X/Twitter account */
  xLink?: InputMaybe<LinkUpdateInput>;
};

export type PostgresCredentials = {
  id: Scalars['UUID'];
  password: Scalars['String'];
  user: Scalars['String'];
  workspaceId: Scalars['String'];
};

export type ProductPriceEntity = {
  created: Scalars['Float'];
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String'];
  unitAmount: Scalars['Float'];
};

export type ProductPricesEntity = {
  productPrices: Array<ProductPriceEntity>;
  totalNumberOfPrices: Scalars['Int'];
};

export type Query = {
  activities?: Maybe<ActivityConnection>;
  activity?: Maybe<Activity>;
  activityDuplicates?: Maybe<Array<ActivityConnection>>;
  activityTarget?: Maybe<ActivityTarget>;
  activityTargetDuplicates?: Maybe<Array<ActivityTargetConnection>>;
  activityTargets?: Maybe<ActivityTargetConnection>;
  apiKey?: Maybe<ApiKey>;
  apiKeyDuplicates?: Maybe<Array<ApiKeyConnection>>;
  apiKeys?: Maybe<ApiKeyConnection>;
  attachment?: Maybe<Attachment>;
  attachmentDuplicates?: Maybe<Array<AttachmentConnection>>;
  attachments?: Maybe<AttachmentConnection>;
  auditLog?: Maybe<AuditLog>;
  auditLogDuplicates?: Maybe<Array<AuditLogConnection>>;
  auditLogs?: Maybe<AuditLogConnection>;
  billingPortalSession: SessionEntity;
  blocklist?: Maybe<Blocklist>;
  blocklistDuplicates?: Maybe<Array<BlocklistConnection>>;
  blocklists?: Maybe<BlocklistConnection>;
  calendarChannel?: Maybe<CalendarChannel>;
  calendarChannelDuplicates?: Maybe<Array<CalendarChannelConnection>>;
  calendarChannelEventAssociation?: Maybe<CalendarChannelEventAssociation>;
  calendarChannelEventAssociationDuplicates?: Maybe<Array<CalendarChannelEventAssociationConnection>>;
  calendarChannelEventAssociations?: Maybe<CalendarChannelEventAssociationConnection>;
  calendarChannels?: Maybe<CalendarChannelConnection>;
  calendarEvent?: Maybe<CalendarEvent>;
  calendarEventDuplicates?: Maybe<Array<CalendarEventConnection>>;
  calendarEventParticipant?: Maybe<CalendarEventParticipant>;
  calendarEventParticipantDuplicates?: Maybe<Array<CalendarEventParticipantConnection>>;
  calendarEventParticipants?: Maybe<CalendarEventParticipantConnection>;
  calendarEvents?: Maybe<CalendarEventConnection>;
  checkUserExists: UserExists;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  clientConfig: ClientConfig;
  comment?: Maybe<Comment>;
  commentDuplicates?: Maybe<Array<CommentConnection>>;
  comments?: Maybe<CommentConnection>;
  companies?: Maybe<CompanyConnection>;
  company?: Maybe<Company>;
  companyDuplicates?: Maybe<Array<CompanyConnection>>;
  connectedAccount?: Maybe<ConnectedAccount>;
  connectedAccountDuplicates?: Maybe<Array<ConnectedAccountConnection>>;
  connectedAccounts?: Maybe<ConnectedAccountConnection>;
  currentUser: User;
  currentWorkspace: Workspace;
  favorite?: Maybe<Favorite>;
  favoriteDuplicates?: Maybe<Array<FavoriteConnection>>;
  favorites?: Maybe<FavoriteConnection>;
  findWorkspaceFromInviteHash: Workspace;
  getPostgresCredentials?: Maybe<PostgresCredentials>;
  getProductPrices: ProductPricesEntity;
  getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal;
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  message?: Maybe<Message>;
  messageChannel?: Maybe<MessageChannel>;
  messageChannelDuplicates?: Maybe<Array<MessageChannelConnection>>;
  messageChannelMessageAssociation?: Maybe<MessageChannelMessageAssociation>;
  messageChannelMessageAssociationDuplicates?: Maybe<Array<MessageChannelMessageAssociationConnection>>;
  messageChannelMessageAssociations?: Maybe<MessageChannelMessageAssociationConnection>;
  messageChannels?: Maybe<MessageChannelConnection>;
  messageDuplicates?: Maybe<Array<MessageConnection>>;
  messageParticipant?: Maybe<MessageParticipant>;
  messageParticipantDuplicates?: Maybe<Array<MessageParticipantConnection>>;
  messageParticipants?: Maybe<MessageParticipantConnection>;
  messageThread?: Maybe<MessageThread>;
  messageThreadDuplicates?: Maybe<Array<MessageThreadConnection>>;
  messageThreads?: Maybe<MessageThreadConnection>;
  messages?: Maybe<MessageConnection>;
  object: Object;
  objects: ObjectConnection;
  opportunities?: Maybe<OpportunityConnection>;
  opportunity?: Maybe<Opportunity>;
  opportunityDuplicates?: Maybe<Array<OpportunityConnection>>;
  people?: Maybe<PersonConnection>;
  person?: Maybe<Person>;
  personDuplicates?: Maybe<Array<PersonConnection>>;
  timelineActivities?: Maybe<TimelineActivityConnection>;
  timelineActivity?: Maybe<TimelineActivity>;
  timelineActivityDuplicates?: Maybe<Array<TimelineActivityConnection>>;
  validatePasswordResetToken: ValidatePasswordResetToken;
  view?: Maybe<View>;
  viewDuplicates?: Maybe<Array<ViewConnection>>;
  viewField?: Maybe<ViewField>;
  viewFieldDuplicates?: Maybe<Array<ViewFieldConnection>>;
  viewFields?: Maybe<ViewFieldConnection>;
  viewFilter?: Maybe<ViewFilter>;
  viewFilterDuplicates?: Maybe<Array<ViewFilterConnection>>;
  viewFilters?: Maybe<ViewFilterConnection>;
  viewSort?: Maybe<ViewSort>;
  viewSortDuplicates?: Maybe<Array<ViewSortConnection>>;
  viewSorts?: Maybe<ViewSortConnection>;
  views?: Maybe<ViewConnection>;
  webhook?: Maybe<Webhook>;
  webhookDuplicates?: Maybe<Array<WebhookConnection>>;
  webhooks?: Maybe<WebhookConnection>;
  workspaceMember?: Maybe<WorkspaceMember>;
  workspaceMemberDuplicates?: Maybe<Array<WorkspaceMemberConnection>>;
  workspaceMembers?: Maybe<WorkspaceMemberConnection>;
};


export type QueryActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityOrderByInput>>>;
};


export type QueryActivityArgs = {
  filter?: InputMaybe<ActivityFilterInput>;
};


export type QueryActivityDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<ActivityCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryActivityTargetArgs = {
  filter?: InputMaybe<ActivityTargetFilterInput>;
};


export type QueryActivityTargetDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<ActivityTargetCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryActivityTargetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityTargetFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityTargetOrderByInput>>>;
};


export type QueryApiKeyArgs = {
  filter?: InputMaybe<ApiKeyFilterInput>;
};


export type QueryApiKeyDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<ApiKeyCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryApiKeysArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ApiKeyFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ApiKeyOrderByInput>>>;
};


export type QueryAttachmentArgs = {
  filter?: InputMaybe<AttachmentFilterInput>;
};


export type QueryAttachmentDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<AttachmentCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<AttachmentOrderByInput>>>;
};


export type QueryAuditLogArgs = {
  filter?: InputMaybe<AuditLogFilterInput>;
};


export type QueryAuditLogDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<AuditLogCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryAuditLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AuditLogFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<AuditLogOrderByInput>>>;
};


export type QueryBillingPortalSessionArgs = {
  returnUrlPath?: InputMaybe<Scalars['String']>;
};


export type QueryBlocklistArgs = {
  filter?: InputMaybe<BlocklistFilterInput>;
};


export type QueryBlocklistDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<BlocklistCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryBlocklistsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<BlocklistFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<BlocklistOrderByInput>>>;
};


export type QueryCalendarChannelArgs = {
  filter?: InputMaybe<CalendarChannelFilterInput>;
};


export type QueryCalendarChannelDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<CalendarChannelCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryCalendarChannelEventAssociationArgs = {
  filter?: InputMaybe<CalendarChannelEventAssociationFilterInput>;
};


export type QueryCalendarChannelEventAssociationDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<CalendarChannelEventAssociationCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryCalendarChannelEventAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarChannelEventAssociationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarChannelEventAssociationOrderByInput>>>;
};


export type QueryCalendarChannelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarChannelFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarChannelOrderByInput>>>;
};


export type QueryCalendarEventArgs = {
  filter?: InputMaybe<CalendarEventFilterInput>;
};


export type QueryCalendarEventDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<CalendarEventCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryCalendarEventParticipantArgs = {
  filter?: InputMaybe<CalendarEventParticipantFilterInput>;
};


export type QueryCalendarEventParticipantDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<CalendarEventParticipantCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryCalendarEventParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarEventParticipantFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarEventParticipantOrderByInput>>>;
};


export type QueryCalendarEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarEventFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarEventOrderByInput>>>;
};


export type QueryCheckUserExistsArgs = {
  captchaToken?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String'];
};


export type QueryCommentArgs = {
  filter?: InputMaybe<CommentFilterInput>;
};


export type QueryCommentDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<CommentCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CommentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CommentOrderByInput>>>;
};


export type QueryCompaniesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CompanyFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CompanyOrderByInput>>>;
};


export type QueryCompanyArgs = {
  filter?: InputMaybe<CompanyFilterInput>;
};


export type QueryCompanyDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<CompanyCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryConnectedAccountArgs = {
  filter?: InputMaybe<ConnectedAccountFilterInput>;
};


export type QueryConnectedAccountDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<ConnectedAccountCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryConnectedAccountsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ConnectedAccountFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ConnectedAccountOrderByInput>>>;
};


export type QueryFavoriteArgs = {
  filter?: InputMaybe<FavoriteFilterInput>;
};


export type QueryFavoriteDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<FavoriteCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<FavoriteOrderByInput>>>;
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String'];
};


export type QueryGetProductPricesArgs = {
  product: Scalars['String'];
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


export type QueryMessageArgs = {
  filter?: InputMaybe<MessageFilterInput>;
};


export type QueryMessageChannelArgs = {
  filter?: InputMaybe<MessageChannelFilterInput>;
};


export type QueryMessageChannelDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<MessageChannelCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryMessageChannelMessageAssociationArgs = {
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
};


export type QueryMessageChannelMessageAssociationDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryMessageChannelMessageAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelMessageAssociationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageChannelMessageAssociationOrderByInput>>>;
};


export type QueryMessageChannelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageChannelFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageChannelOrderByInput>>>;
};


export type QueryMessageDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<MessageCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryMessageParticipantArgs = {
  filter?: InputMaybe<MessageParticipantFilterInput>;
};


export type QueryMessageParticipantDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<MessageParticipantCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryMessageParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageParticipantOrderByInput>>>;
};


export type QueryMessageThreadArgs = {
  filter?: InputMaybe<MessageThreadFilterInput>;
};


export type QueryMessageThreadDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<MessageThreadCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryMessageThreadsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageThreadFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageThreadOrderByInput>>>;
};


export type QueryMessagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageOrderByInput>>>;
};


export type QueryOpportunitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<OpportunityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<OpportunityOrderByInput>>>;
};


export type QueryOpportunityArgs = {
  filter?: InputMaybe<OpportunityFilterInput>;
};


export type QueryOpportunityDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<OpportunityCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryPeopleArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<PersonFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<PersonOrderByInput>>>;
};


export type QueryPersonArgs = {
  filter?: InputMaybe<PersonFilterInput>;
};


export type QueryPersonDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<PersonCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryTimelineActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<TimelineActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<TimelineActivityOrderByInput>>>;
};


export type QueryTimelineActivityArgs = {
  filter?: InputMaybe<TimelineActivityFilterInput>;
};


export type QueryTimelineActivityDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<TimelineActivityCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String'];
};


export type QueryViewArgs = {
  filter?: InputMaybe<ViewFilterInput>;
};


export type QueryViewDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<ViewCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryViewFieldArgs = {
  filter?: InputMaybe<ViewFieldFilterInput>;
};


export type QueryViewFieldDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<ViewFieldCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryViewFieldsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFieldFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ViewFieldOrderByInput>>>;
};


export type QueryViewFilterArgs = {
  filter?: InputMaybe<ViewFilterFilterInput>;
};


export type QueryViewFilterDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<ViewFilterCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryViewFiltersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFilterFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ViewFilterOrderByInput>>>;
};


export type QueryViewSortArgs = {
  filter?: InputMaybe<ViewSortFilterInput>;
};


export type QueryViewSortDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<ViewSortCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryViewSortsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewSortFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ViewSortOrderByInput>>>;
};


export type QueryViewsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ViewOrderByInput>>>;
};


export type QueryWebhookArgs = {
  filter?: InputMaybe<WebhookFilterInput>;
};


export type QueryWebhookDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<WebhookCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryWebhooksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<WebhookFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<WebhookOrderByInput>>>;
};


export type QueryWorkspaceMemberArgs = {
  filter?: InputMaybe<WorkspaceMemberFilterInput>;
};


export type QueryWorkspaceMemberDuplicatesArgs = {
  data?: InputMaybe<Array<InputMaybe<WorkspaceMemberCreateInput>>>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryWorkspaceMembersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<WorkspaceMemberFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<WorkspaceMemberOrderByInput>>>;
};

export type RawJsonFilter = {
  is?: InputMaybe<FilterIs>;
};

export type RelationConnection = {
  /** Array of edges. */
  edges: Array<RelationEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type RelationDefinition = {
  direction: RelationDefinitionType;
  relationId: Scalars['UUID'];
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
  id?: Maybe<Scalars['UUID']>;
  name: Scalars['String'];
  schema?: Maybe<Scalars['String']>;
  schemaPendingUpdates?: Maybe<Array<DistantTableUpdate>>;
  status: RemoteTableStatus;
};

/** Status of the table */
export enum RemoteTableStatus {
  NotSynced = 'NOT_SYNCED',
  Synced = 'SYNCED'
}

export type SendInviteLink = {
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type Sentry = {
  dsn?: Maybe<Scalars['String']>;
  environment?: Maybe<Scalars['String']>;
  release?: Maybe<Scalars['String']>;
};

export type SessionEntity = {
  url?: Maybe<Scalars['String']>;
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
  supportDriver: Scalars['String'];
  supportFrontChatId?: Maybe<Scalars['String']>;
};

export type Telemetry = {
  enabled: Scalars['Boolean'];
};

/** Aggregated / filtered event to be displayed on the timeline */
export type TimelineActivity = {
  /** Event company */
  company?: Maybe<Company>;
  /** Event company id foreign key */
  companyId?: Maybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Creation date */
  happensAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** inked Object Metadata Id */
  linkedObjectMetadataId?: Maybe<Scalars['UUID']>;
  /** Cached record name */
  linkedRecordCachedName?: Maybe<Scalars['String']>;
  /** Linked Record id */
  linkedRecordId?: Maybe<Scalars['UUID']>;
  /** Event name */
  name?: Maybe<Scalars['String']>;
  /** Event opportunity */
  opportunity?: Maybe<Opportunity>;
  /** Event opportunity id foreign key */
  opportunityId?: Maybe<Scalars['UUID']>;
  /** Event person */
  person?: Maybe<Person>;
  /** Event person id foreign key */
  personId?: Maybe<Scalars['UUID']>;
  /** Json value for event details */
  properties?: Maybe<Scalars['RawJSONScalar']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Event workspace member */
  workspaceMember?: Maybe<WorkspaceMember>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

/** Aggregated / filtered event to be displayed on the timeline */
export type TimelineActivityConnection = {
  edges?: Maybe<Array<TimelineActivityEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** Aggregated / filtered event to be displayed on the timeline */
export type TimelineActivityCreateInput = {
  /** Event company id foreign key */
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Creation date */
  happensAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** inked Object Metadata Id */
  linkedObjectMetadataId?: InputMaybe<Scalars['UUID']>;
  /** Cached record name */
  linkedRecordCachedName?: InputMaybe<Scalars['String']>;
  /** Linked Record id */
  linkedRecordId?: InputMaybe<Scalars['UUID']>;
  /** Event name */
  name?: InputMaybe<Scalars['String']>;
  /** Event opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['UUID']>;
  /** Event person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Json value for event details */
  properties?: InputMaybe<Scalars['RawJSONScalar']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

/** Aggregated / filtered event to be displayed on the timeline */
export type TimelineActivityEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<TimelineActivity>;
};

/** Aggregated / filtered event to be displayed on the timeline */
export type TimelineActivityFilterInput = {
  and?: InputMaybe<Array<InputMaybe<TimelineActivityFilterInput>>>;
  /** Event company id foreign key */
  companyId?: InputMaybe<IdFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Creation date */
  happensAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** inked Object Metadata Id */
  linkedObjectMetadataId?: InputMaybe<IdFilter>;
  /** Cached record name */
  linkedRecordCachedName?: InputMaybe<StringFilter>;
  /** Linked Record id */
  linkedRecordId?: InputMaybe<IdFilter>;
  /** Event name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<TimelineActivityFilterInput>;
  /** Event opportunity id foreign key */
  opportunityId?: InputMaybe<IdFilter>;
  or?: InputMaybe<Array<InputMaybe<TimelineActivityFilterInput>>>;
  /** Event person id foreign key */
  personId?: InputMaybe<IdFilter>;
  /** Json value for event details */
  properties?: InputMaybe<RawJsonFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: InputMaybe<IdFilter>;
};

/** Aggregated / filtered event to be displayed on the timeline */
export type TimelineActivityOrderByInput = {
  /** Event company id foreign key */
  companyId?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Creation date */
  happensAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** inked Object Metadata Id */
  linkedObjectMetadataId?: InputMaybe<OrderByDirection>;
  /** Cached record name */
  linkedRecordCachedName?: InputMaybe<OrderByDirection>;
  /** Linked Record id */
  linkedRecordId?: InputMaybe<OrderByDirection>;
  /** Event name */
  name?: InputMaybe<OrderByDirection>;
  /** Event opportunity id foreign key */
  opportunityId?: InputMaybe<OrderByDirection>;
  /** Event person id foreign key */
  personId?: InputMaybe<OrderByDirection>;
  /** Json value for event details */
  properties?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: InputMaybe<OrderByDirection>;
};

/** Aggregated / filtered event to be displayed on the timeline */
export type TimelineActivityUpdateInput = {
  /** Event company id foreign key */
  companyId?: InputMaybe<Scalars['UUID']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Creation date */
  happensAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** inked Object Metadata Id */
  linkedObjectMetadataId?: InputMaybe<Scalars['UUID']>;
  /** Cached record name */
  linkedRecordCachedName?: InputMaybe<Scalars['String']>;
  /** Linked Record id */
  linkedRecordId?: InputMaybe<Scalars['UUID']>;
  /** Event name */
  name?: InputMaybe<Scalars['String']>;
  /** Event opportunity id foreign key */
  opportunityId?: InputMaybe<Scalars['UUID']>;
  /** Event person id foreign key */
  personId?: InputMaybe<Scalars['UUID']>;
  /** Json value for event details */
  properties?: InputMaybe<Scalars['RawJSONScalar']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Event workspace member id foreign key */
  workspaceMemberId?: InputMaybe<Scalars['UUID']>;
};

export type TimelineCalendarEvent = {
  conferenceLink: LinkMetadata;
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
  avatarUrl: Scalars['String'];
  displayName: Scalars['String'];
  firstName: Scalars['String'];
  handle: Scalars['String'];
  lastName: Scalars['String'];
  personId?: Maybe<Scalars['UUID']>;
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

export type TimelineCalendarEventsWithTotal = {
  timelineCalendarEvents: Array<TimelineCalendarEvent>;
  totalNumberOfCalendarEvents: Scalars['Int'];
};

export type TimelineThread = {
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
  avatarUrl: Scalars['String'];
  displayName: Scalars['String'];
  firstName: Scalars['String'];
  handle: Scalars['String'];
  lastName: Scalars['String'];
  personId?: Maybe<Scalars['UUID']>;
  workspaceMemberId?: Maybe<Scalars['UUID']>;
};

export type TimelineThreadsWithTotal = {
  timelineThreads: Array<TimelineThread>;
  totalNumberOfThreads: Scalars['Int'];
};

export type TransientToken = {
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

export type UpdateBillingEntity = {
  /** Boolean that confirms query was successful */
  success: Scalars['Boolean'];
};

export type UpdateObjectPayload = {
  description?: InputMaybe<Scalars['String']>;
  icon?: InputMaybe<Scalars['String']>;
  imageIdentifierFieldMetadataId?: InputMaybe<Scalars['String']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  labelIdentifierFieldMetadataId?: InputMaybe<Scalars['String']>;
  labelPlural?: InputMaybe<Scalars['String']>;
  labelSingular?: InputMaybe<Scalars['String']>;
  namePlural?: InputMaybe<Scalars['String']>;
  nameSingular?: InputMaybe<Scalars['String']>;
};

export type UpdateOneObjectInput = {
  /** The id of the object to update */
  id: Scalars['UUID'];
  update: UpdateObjectPayload;
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
  defaultWorkspaceId: Scalars['String'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  disabled?: Maybe<Scalars['Boolean']>;
  email: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  firstName: Scalars['String'];
  id: Scalars['UUID'];
  lastName: Scalars['String'];
  onboardingStatus?: Maybe<OnboardingStatus>;
  passwordHash?: Maybe<Scalars['String']>;
  /** @deprecated field migrated into the AppTokens Table ref: https://github.com/twentyhq/twenty/issues/5021 */
  passwordResetToken?: Maybe<Scalars['String']>;
  /** @deprecated field migrated into the AppTokens Table ref: https://github.com/twentyhq/twenty/issues/5021 */
  passwordResetTokenExpiresAt?: Maybe<Scalars['DateTime']>;
  supportUserHash?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  workspaceMember?: Maybe<WorkspaceMember>;
  workspaces: Array<UserWorkspace>;
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

export type UserMappingOptionsUser = {
  user?: Maybe<Scalars['String']>;
};

export type UserWorkspace = {
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['UUID'];
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['String'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['String'];
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
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** View icon */
  icon?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Describes if the view is in compact mode */
  isCompact?: Maybe<Scalars['Boolean']>;
  /** View Kanban column field */
  kanbanFieldMetadataId?: Maybe<Scalars['String']>;
  /** View key */
  key?: Maybe<ViewKeyEnum>;
  /** View name */
  name?: Maybe<Scalars['String']>;
  /** View target object */
  objectMetadataId?: Maybe<Scalars['UUID']>;
  /** View position */
  position?: Maybe<Scalars['Position']>;
  /** View type */
  type?: Maybe<Scalars['String']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
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
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ViewFieldOrderByInput>>>;
};


/** (System) Views */
export type ViewViewFiltersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewFilterFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ViewFilterOrderByInput>>>;
};


/** (System) Views */
export type ViewViewSortsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ViewSortFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ViewSortOrderByInput>>>;
};

/** (System) Views */
export type ViewConnection = {
  edges?: Maybe<Array<ViewEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** (System) Views */
export type ViewCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** View icon */
  icon?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Describes if the view is in compact mode */
  isCompact?: InputMaybe<Scalars['Boolean']>;
  /** View Kanban column field */
  kanbanFieldMetadataId?: InputMaybe<Scalars['String']>;
  /** View key */
  key?: InputMaybe<ViewKeyEnum>;
  /** View name */
  name?: InputMaybe<Scalars['String']>;
  /** View target object */
  objectMetadataId: Scalars['UUID'];
  /** View position */
  position?: InputMaybe<Scalars['Position']>;
  /** View type */
  type?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** (System) Views */
export type ViewEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<View>;
};

/** (System) View Fields */
export type ViewField = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** View Field target field */
  fieldMetadataId?: Maybe<Scalars['UUID']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** View Field visibility */
  isVisible?: Maybe<Scalars['Boolean']>;
  /** View Field position */
  position?: Maybe<Scalars['Float']>;
  /** View Field size */
  size?: Maybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** View Field related view */
  view?: Maybe<View>;
  /** View Field related view id foreign key */
  viewId?: Maybe<Scalars['UUID']>;
};

/** (System) View Fields */
export type ViewFieldConnection = {
  edges?: Maybe<Array<ViewFieldEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** (System) View Fields */
export type ViewFieldCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** View Field target field */
  fieldMetadataId: Scalars['UUID'];
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** View Field visibility */
  isVisible?: InputMaybe<Scalars['Boolean']>;
  /** View Field position */
  position?: InputMaybe<Scalars['Float']>;
  /** View Field size */
  size?: InputMaybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Field related view id foreign key */
  viewId?: InputMaybe<Scalars['UUID']>;
};

/** (System) View Fields */
export type ViewFieldEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<ViewField>;
};

/** (System) View Fields */
export type ViewFieldFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ViewFieldFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** View Field target field */
  fieldMetadataId?: InputMaybe<IdFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** View Field visibility */
  isVisible?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<ViewFieldFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ViewFieldFilterInput>>>;
  /** View Field position */
  position?: InputMaybe<FloatFilter>;
  /** View Field size */
  size?: InputMaybe<FloatFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** View Field related view id foreign key */
  viewId?: InputMaybe<IdFilter>;
};

/** (System) View Fields */
export type ViewFieldOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** View Field target field */
  fieldMetadataId?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** View Field visibility */
  isVisible?: InputMaybe<OrderByDirection>;
  /** View Field position */
  position?: InputMaybe<OrderByDirection>;
  /** View Field size */
  size?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** View Field related view id foreign key */
  viewId?: InputMaybe<OrderByDirection>;
};

/** (System) View Fields */
export type ViewFieldUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** View Field target field */
  fieldMetadataId?: InputMaybe<Scalars['UUID']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** View Field visibility */
  isVisible?: InputMaybe<Scalars['Boolean']>;
  /** View Field position */
  position?: InputMaybe<Scalars['Float']>;
  /** View Field size */
  size?: InputMaybe<Scalars['Float']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Field related view id foreign key */
  viewId?: InputMaybe<Scalars['UUID']>;
};

/** (System) View Filters */
export type ViewFilter = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** View Filter Display Value */
  displayValue?: Maybe<Scalars['String']>;
  /** View Filter target field */
  fieldMetadataId?: Maybe<Scalars['UUID']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** View Filter operand */
  operand?: Maybe<Scalars['String']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** View Filter value */
  value?: Maybe<Scalars['String']>;
  /** View Filter related view */
  view?: Maybe<View>;
  /** View Filter related view id foreign key */
  viewId?: Maybe<Scalars['UUID']>;
};

/** (System) View Filters */
export type ViewFilterConnection = {
  edges?: Maybe<Array<ViewFilterEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** (System) View Filters */
export type ViewFilterCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** View Filter Display Value */
  displayValue?: InputMaybe<Scalars['String']>;
  /** View Filter target field */
  fieldMetadataId: Scalars['UUID'];
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** View Filter operand */
  operand?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Filter value */
  value?: InputMaybe<Scalars['String']>;
  /** View Filter related view id foreign key */
  viewId?: InputMaybe<Scalars['UUID']>;
};

/** (System) View Filters */
export type ViewFilterEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<ViewFilter>;
};

/** (System) View Filters */
export type ViewFilterFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ViewFilterFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** View Filter Display Value */
  displayValue?: InputMaybe<StringFilter>;
  /** View Filter target field */
  fieldMetadataId?: InputMaybe<IdFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<ViewFilterFilterInput>;
  /** View Filter operand */
  operand?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InputMaybe<ViewFilterFilterInput>>>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** View Filter value */
  value?: InputMaybe<StringFilter>;
  /** View Filter related view id foreign key */
  viewId?: InputMaybe<IdFilter>;
};

/** (System) Views */
export type ViewFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ViewFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** View icon */
  icon?: InputMaybe<StringFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Describes if the view is in compact mode */
  isCompact?: InputMaybe<BooleanFilter>;
  /** View Kanban column field */
  kanbanFieldMetadataId?: InputMaybe<StringFilter>;
  /** View key */
  key?: InputMaybe<ViewKeyEnumFilter>;
  /** View name */
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<ViewFilterInput>;
  /** View target object */
  objectMetadataId?: InputMaybe<IdFilter>;
  or?: InputMaybe<Array<InputMaybe<ViewFilterInput>>>;
  /** View position */
  position?: InputMaybe<FloatFilter>;
  /** View type */
  type?: InputMaybe<StringFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** (System) View Filters */
export type ViewFilterOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** View Filter Display Value */
  displayValue?: InputMaybe<OrderByDirection>;
  /** View Filter target field */
  fieldMetadataId?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** View Filter operand */
  operand?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** View Filter value */
  value?: InputMaybe<OrderByDirection>;
  /** View Filter related view id foreign key */
  viewId?: InputMaybe<OrderByDirection>;
};

/** (System) View Filters */
export type ViewFilterUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** View Filter Display Value */
  displayValue?: InputMaybe<Scalars['String']>;
  /** View Filter target field */
  fieldMetadataId?: InputMaybe<Scalars['UUID']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** View Filter operand */
  operand?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Filter value */
  value?: InputMaybe<Scalars['String']>;
  /** View Filter related view id foreign key */
  viewId?: InputMaybe<Scalars['UUID']>;
};

/** View key */
export enum ViewKeyEnum {
  /** Index */
  Index = 'INDEX'
}

export type ViewKeyEnumFilter = {
  eq?: InputMaybe<ViewKeyEnum>;
  in?: InputMaybe<Array<InputMaybe<ViewKeyEnum>>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<ViewKeyEnum>;
};

/** (System) Views */
export type ViewOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** View icon */
  icon?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Describes if the view is in compact mode */
  isCompact?: InputMaybe<OrderByDirection>;
  /** View Kanban column field */
  kanbanFieldMetadataId?: InputMaybe<OrderByDirection>;
  /** View key */
  key?: InputMaybe<OrderByDirection>;
  /** View name */
  name?: InputMaybe<OrderByDirection>;
  /** View target object */
  objectMetadataId?: InputMaybe<OrderByDirection>;
  /** View position */
  position?: InputMaybe<OrderByDirection>;
  /** View type */
  type?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** (System) View Sorts */
export type ViewSort = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** View Sort direction */
  direction?: Maybe<Scalars['String']>;
  /** View Sort target field */
  fieldMetadataId?: Maybe<Scalars['UUID']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** View Sort related view */
  view?: Maybe<View>;
  /** View Sort related view id foreign key */
  viewId?: Maybe<Scalars['UUID']>;
};

/** (System) View Sorts */
export type ViewSortConnection = {
  edges?: Maybe<Array<ViewSortEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** (System) View Sorts */
export type ViewSortCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** View Sort direction */
  direction?: InputMaybe<Scalars['String']>;
  /** View Sort target field */
  fieldMetadataId: Scalars['UUID'];
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Sort related view id foreign key */
  viewId?: InputMaybe<Scalars['UUID']>;
};

/** (System) View Sorts */
export type ViewSortEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<ViewSort>;
};

/** (System) View Sorts */
export type ViewSortFilterInput = {
  and?: InputMaybe<Array<InputMaybe<ViewSortFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** View Sort direction */
  direction?: InputMaybe<StringFilter>;
  /** View Sort target field */
  fieldMetadataId?: InputMaybe<IdFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<ViewSortFilterInput>;
  or?: InputMaybe<Array<InputMaybe<ViewSortFilterInput>>>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** View Sort related view id foreign key */
  viewId?: InputMaybe<IdFilter>;
};

/** (System) View Sorts */
export type ViewSortOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** View Sort direction */
  direction?: InputMaybe<OrderByDirection>;
  /** View Sort target field */
  fieldMetadataId?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
  /** View Sort related view id foreign key */
  viewId?: InputMaybe<OrderByDirection>;
};

/** (System) View Sorts */
export type ViewSortUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** View Sort direction */
  direction?: InputMaybe<Scalars['String']>;
  /** View Sort target field */
  fieldMetadataId?: InputMaybe<Scalars['UUID']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** View Sort related view id foreign key */
  viewId?: InputMaybe<Scalars['UUID']>;
};

/** (System) Views */
export type ViewUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** View icon */
  icon?: InputMaybe<Scalars['String']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Describes if the view is in compact mode */
  isCompact?: InputMaybe<Scalars['Boolean']>;
  /** View Kanban column field */
  kanbanFieldMetadataId?: InputMaybe<Scalars['String']>;
  /** View key */
  key?: InputMaybe<ViewKeyEnum>;
  /** View name */
  name?: InputMaybe<Scalars['String']>;
  /** View target object */
  objectMetadataId?: InputMaybe<Scalars['UUID']>;
  /** View position */
  position?: InputMaybe<Scalars['Position']>;
  /** View type */
  type?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A webhook */
export type Webhook = {
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Id */
  id?: Maybe<Scalars['UUID']>;
  /** Webhook operation */
  operation?: Maybe<Scalars['String']>;
  /** Webhook target url */
  targetUrl?: Maybe<Scalars['String']>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** A webhook */
export type WebhookConnection = {
  edges?: Maybe<Array<WebhookEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A webhook */
export type WebhookCreateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Webhook operation */
  operation?: InputMaybe<Scalars['String']>;
  /** Webhook target url */
  targetUrl?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

/** A webhook */
export type WebhookEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<Webhook>;
};

/** A webhook */
export type WebhookFilterInput = {
  and?: InputMaybe<Array<InputMaybe<WebhookFilterInput>>>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  not?: InputMaybe<WebhookFilterInput>;
  /** Webhook operation */
  operation?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InputMaybe<WebhookFilterInput>>>;
  /** Webhook target url */
  targetUrl?: InputMaybe<StringFilter>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
};

/** A webhook */
export type WebhookOrderByInput = {
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Webhook operation */
  operation?: InputMaybe<OrderByDirection>;
  /** Webhook target url */
  targetUrl?: InputMaybe<OrderByDirection>;
  /** Update date */
  updatedAt?: InputMaybe<OrderByDirection>;
};

/** A webhook */
export type WebhookUpdateInput = {
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Webhook operation */
  operation?: InputMaybe<Scalars['String']>;
  /** Webhook target url */
  targetUrl?: InputMaybe<Scalars['String']>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Workspace = {
  activationStatus: Scalars['String'];
  allowImpersonation: Scalars['Boolean'];
  billingSubscriptions?: Maybe<Array<BillingSubscription>>;
  createdAt: Scalars['DateTime'];
  currentBillingSubscription?: Maybe<BillingSubscription>;
  metadataVersion?: Maybe<Scalars['String']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  displayName?: Maybe<Scalars['String']>;
  domainName?: Maybe<Scalars['String']>;
  featureFlags?: Maybe<Array<FeatureFlag>>;
  id: Scalars['UUID'];
  inviteHash?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  workspaceMembersCount?: Maybe<Scalars['Float']>;
};


export type WorkspaceBillingSubscriptionsArgs = {
  filter?: BillingSubscriptionFilter;
  sorting?: Array<BillingSubscriptionSort>;
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
  /** Audit Logs linked to the workspace member */
  auditLogs?: Maybe<AuditLogConnection>;
  /** Activities created by the workspace member */
  authoredActivities?: Maybe<ActivityConnection>;
  /** Attachments created by the workspace member */
  authoredAttachments?: Maybe<AttachmentConnection>;
  /** Authored comments */
  authoredComments?: Maybe<CommentConnection>;
  /** Workspace member avatar */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Blocklisted handles */
  blocklist?: Maybe<BlocklistConnection>;
  /** Calendar Event Participants */
  calendarEventParticipants?: Maybe<CalendarEventParticipantConnection>;
  /** Preferred color scheme */
  colorScheme: Scalars['String'];
  /** Connected accounts */
  connectedAccounts?: Maybe<ConnectedAccountConnection>;
  /** Creation date */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Favorites linked to the workspace member */
  favorites?: Maybe<FavoriteConnection>;
  /** Id */
  id: Scalars['UUID'];
  /** Preferred language */
  locale: Scalars['String'];
  /** Message Participants */
  messageParticipants?: Maybe<MessageParticipantConnection>;
  /** Workspace member name */
  name: FullName;
  /** Events linked to the workspace member */
  timelineActivities?: Maybe<TimelineActivityConnection>;
  /** Update date */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** Related user email address */
  userEmail?: Maybe<Scalars['String']>;
  /** Associated User Id */
  userId?: Maybe<Scalars['UUID']>;
};


/** A workspace member */
export type WorkspaceMemberAccountOwnerForCompaniesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CompanyFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CompanyOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberAssignedActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberAuditLogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AuditLogFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<AuditLogOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberAuthoredActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberAuthoredAttachmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AttachmentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<AttachmentOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberAuthoredCommentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CommentFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CommentOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberBlocklistArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<BlocklistFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<BlocklistOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberCalendarEventParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CalendarEventParticipantFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<CalendarEventParticipantOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberConnectedAccountsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ConnectedAccountFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<ConnectedAccountOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberFavoritesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FavoriteFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<FavoriteOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberMessageParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<MessageParticipantFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<MessageParticipantOrderByInput>>>;
};


/** A workspace member */
export type WorkspaceMemberTimelineActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<TimelineActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<InputMaybe<TimelineActivityOrderByInput>>>;
};

/** A workspace member */
export type WorkspaceMemberConnection = {
  edges?: Maybe<Array<WorkspaceMemberEdge>>;
  pageInfo?: Maybe<PageInfo>;
  /** Total number of records in the connection */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A workspace member */
export type WorkspaceMemberCreateInput = {
  /** Workspace member avatar */
  avatarUrl?: InputMaybe<Scalars['String']>;
  /** Preferred color scheme */
  colorScheme?: InputMaybe<Scalars['String']>;
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Preferred language */
  locale?: InputMaybe<Scalars['String']>;
  /** Workspace member name */
  name?: InputMaybe<FullNameCreateInput>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Related user email address */
  userEmail?: InputMaybe<Scalars['String']>;
  /** Associated User Id */
  userId: Scalars['UUID'];
};

/** A workspace member */
export type WorkspaceMemberEdge = {
  cursor?: Maybe<Scalars['Cursor']>;
  node?: Maybe<WorkspaceMember>;
};

/** A workspace member */
export type WorkspaceMemberFilterInput = {
  and?: InputMaybe<Array<InputMaybe<WorkspaceMemberFilterInput>>>;
  /** Workspace member avatar */
  avatarUrl?: InputMaybe<StringFilter>;
  /** Preferred color scheme */
  colorScheme?: InputMaybe<StringFilter>;
  /** Creation date */
  createdAt?: InputMaybe<DateFilter>;
  /** Id */
  id?: InputMaybe<IdFilter>;
  /** Preferred language */
  locale?: InputMaybe<StringFilter>;
  /** Workspace member name */
  name?: InputMaybe<FullNameFilterInput>;
  not?: InputMaybe<WorkspaceMemberFilterInput>;
  or?: InputMaybe<Array<InputMaybe<WorkspaceMemberFilterInput>>>;
  /** Update date */
  updatedAt?: InputMaybe<DateFilter>;
  /** Related user email address */
  userEmail?: InputMaybe<StringFilter>;
  /** Associated User Id */
  userId?: InputMaybe<IdFilter>;
};

/** A workspace member */
export type WorkspaceMemberOrderByInput = {
  /** Workspace member avatar */
  avatarUrl?: InputMaybe<OrderByDirection>;
  /** Preferred color scheme */
  colorScheme?: InputMaybe<OrderByDirection>;
  /** Creation date */
  createdAt?: InputMaybe<OrderByDirection>;
  /** Id */
  id?: InputMaybe<OrderByDirection>;
  /** Preferred language */
  locale?: InputMaybe<OrderByDirection>;
  /** Workspace member name */
  name?: InputMaybe<FullNameOrderByInput>;
  /** Update date */
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
  /** Creation date */
  createdAt?: InputMaybe<Scalars['DateTime']>;
  /** Id */
  id?: InputMaybe<Scalars['ID']>;
  /** Preferred language */
  locale?: InputMaybe<Scalars['String']>;
  /** Workspace member name */
  name?: InputMaybe<FullNameUpdateInput>;
  /** Update date */
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  /** Related user email address */
  userEmail?: InputMaybe<Scalars['String']>;
  /** Associated User Id */
  userId?: InputMaybe<Scalars['UUID']>;
};

export type Field = {
  createdAt: Scalars['DateTime'];
  defaultValue?: Maybe<Scalars['JSON']>;
  description?: Maybe<Scalars['String']>;
  fromRelationMetadata?: Maybe<Relation>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['UUID'];
  isActive?: Maybe<Scalars['Boolean']>;
  isCustom?: Maybe<Scalars['Boolean']>;
  isNullable?: Maybe<Scalars['Boolean']>;
  isSystem?: Maybe<Scalars['Boolean']>;
  label: Scalars['String'];
  name: Scalars['String'];
  options?: Maybe<Scalars['JSON']>;
  relationDefinition?: Maybe<RelationDefinition>;
  settings?: Maybe<Scalars['JSON']>;
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
  id?: InputMaybe<UuidFilterComparison>;
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
  id: Scalars['UUID'];
  imageIdentifierFieldMetadataId?: Maybe<Scalars['String']>;
  isActive: Scalars['Boolean'];
  isCustom: Scalars['Boolean'];
  isRemote: Scalars['Boolean'];
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
  id: Scalars['UUID'];
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

export type ExchangeAuthorizationCodeMutationVariables = Exact<{
  authorizationCode: Scalars['String'];
  codeVerifier?: InputMaybe<Scalars['String']>;
  clientSecret?: InputMaybe<Scalars['String']>;
}>;


export type ExchangeAuthorizationCodeMutation = { exchangeAuthorizationCode: { loginToken: { token: string, expiresAt: any }, accessToken: { token: string, expiresAt: any }, refreshToken: { token: string, expiresAt: any } } };

export type RenewTokenMutationVariables = Exact<{
  appToken: Scalars['String'];
}>;


export type RenewTokenMutation = { renewToken: { tokens: { accessToken: { token: string, expiresAt: any }, refreshToken: { token: string, expiresAt: any } } } };

export type CreateOneCompanyMutationVariables = Exact<{
  input: CompanyCreateInput;
}>;


export type CreateOneCompanyMutation = { createCompany?: { id?: any | null } | null };

export type FindCompanyQueryVariables = Exact<{
  filter: CompanyFilterInput;
}>;


export type FindCompanyQuery = { companies?: { edges?: Array<{ node?: { id?: any | null, name?: string | null, linkedinLink?: { url?: string | null, label?: string | null } | null } | null }> | null } | null };

export type CreateOnePersonMutationVariables = Exact<{
  input: PersonCreateInput;
}>;


export type CreateOnePersonMutation = { createPerson?: { id?: any | null } | null };

export type FindPersonQueryVariables = Exact<{
  filter: PersonFilterInput;
}>;


export type FindPersonQuery = { people?: { edges?: Array<{ node?: { id?: any | null, name?: { firstName: string, lastName: string } | null, linkedinLink?: { url?: string | null, label?: string | null } | null } | null }> | null } | null };


export const ExchangeAuthorizationCodeDocument = gql`
    mutation ExchangeAuthorizationCode($authorizationCode: String!, $codeVerifier: String, $clientSecret: String) {
  exchangeAuthorizationCode(
    authorizationCode: $authorizationCode
    codeVerifier: $codeVerifier
    clientSecret: $clientSecret
  ) {
    loginToken {
      token
      expiresAt
    }
    accessToken {
      token
      expiresAt
    }
    refreshToken {
      token
      expiresAt
    }
  }
}
    `;
export type ExchangeAuthorizationCodeMutationFn = Apollo.MutationFunction<ExchangeAuthorizationCodeMutation, ExchangeAuthorizationCodeMutationVariables>;

/**
 * __useExchangeAuthorizationCodeMutation__
 *
 * To run a mutation, you first call `useExchangeAuthorizationCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExchangeAuthorizationCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [exchangeAuthorizationCodeMutation, { data, loading, error }] = useExchangeAuthorizationCodeMutation({
 *   variables: {
 *      authorizationCode: // value for 'authorizationCode'
 *      codeVerifier: // value for 'codeVerifier'
 *      clientSecret: // value for 'clientSecret'
 *   },
 * });
 */
export function useExchangeAuthorizationCodeMutation(baseOptions?: Apollo.MutationHookOptions<ExchangeAuthorizationCodeMutation, ExchangeAuthorizationCodeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExchangeAuthorizationCodeMutation, ExchangeAuthorizationCodeMutationVariables>(ExchangeAuthorizationCodeDocument, options);
      }
export type ExchangeAuthorizationCodeMutationHookResult = ReturnType<typeof useExchangeAuthorizationCodeMutation>;
export type ExchangeAuthorizationCodeMutationResult = Apollo.MutationResult<ExchangeAuthorizationCodeMutation>;
export type ExchangeAuthorizationCodeMutationOptions = Apollo.BaseMutationOptions<ExchangeAuthorizationCodeMutation, ExchangeAuthorizationCodeMutationVariables>;
export const RenewTokenDocument = gql`
    mutation RenewToken($appToken: String!) {
  renewToken(appToken: $appToken) {
    tokens {
      accessToken {
        token
        expiresAt
      }
      refreshToken {
        token
        expiresAt
      }
    }
  }
}
    `;
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
export const CreateOneCompanyDocument = gql`
    mutation CreateOneCompany($input: CompanyCreateInput!) {
  createCompany(data: $input) {
    id
  }
}
    `;
export type CreateOneCompanyMutationFn = Apollo.MutationFunction<CreateOneCompanyMutation, CreateOneCompanyMutationVariables>;

/**
 * __useCreateOneCompanyMutation__
 *
 * To run a mutation, you first call `useCreateOneCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOneCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOneCompanyMutation, { data, loading, error }] = useCreateOneCompanyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOneCompanyMutation(baseOptions?: Apollo.MutationHookOptions<CreateOneCompanyMutation, CreateOneCompanyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOneCompanyMutation, CreateOneCompanyMutationVariables>(CreateOneCompanyDocument, options);
      }
export type CreateOneCompanyMutationHookResult = ReturnType<typeof useCreateOneCompanyMutation>;
export type CreateOneCompanyMutationResult = Apollo.MutationResult<CreateOneCompanyMutation>;
export type CreateOneCompanyMutationOptions = Apollo.BaseMutationOptions<CreateOneCompanyMutation, CreateOneCompanyMutationVariables>;
export const FindCompanyDocument = gql`
    query FindCompany($filter: CompanyFilterInput!) {
  companies(filter: $filter) {
    edges {
      node {
        id
        name
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
export const CreateOnePersonDocument = gql`
    mutation CreateOnePerson($input: PersonCreateInput!) {
  createPerson(data: $input) {
    id
  }
}
    `;
export type CreateOnePersonMutationFn = Apollo.MutationFunction<CreateOnePersonMutation, CreateOnePersonMutationVariables>;

/**
 * __useCreateOnePersonMutation__
 *
 * To run a mutation, you first call `useCreateOnePersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOnePersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOnePersonMutation, { data, loading, error }] = useCreateOnePersonMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOnePersonMutation(baseOptions?: Apollo.MutationHookOptions<CreateOnePersonMutation, CreateOnePersonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOnePersonMutation, CreateOnePersonMutationVariables>(CreateOnePersonDocument, options);
      }
export type CreateOnePersonMutationHookResult = ReturnType<typeof useCreateOnePersonMutation>;
export type CreateOnePersonMutationResult = Apollo.MutationResult<CreateOnePersonMutation>;
export type CreateOnePersonMutationOptions = Apollo.BaseMutationOptions<CreateOnePersonMutation, CreateOnePersonMutationVariables>;
export const FindPersonDocument = gql`
    query FindPerson($filter: PersonFilterInput!) {
  people(filter: $filter) {
    edges {
      node {
        id
        name {
          firstName
          lastName
        }
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
 * __useFindPersonQuery__
 *
 * To run a query within a React component, call `useFindPersonQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindPersonQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindPersonQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useFindPersonQuery(baseOptions: Apollo.QueryHookOptions<FindPersonQuery, FindPersonQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindPersonQuery, FindPersonQueryVariables>(FindPersonDocument, options);
      }
export function useFindPersonLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindPersonQuery, FindPersonQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindPersonQuery, FindPersonQueryVariables>(FindPersonDocument, options);
        }
export type FindPersonQueryHookResult = ReturnType<typeof useFindPersonQuery>;
export type FindPersonLazyQueryHookResult = ReturnType<typeof useFindPersonLazyQuery>;
export type FindPersonQueryResult = Apollo.QueryResult<FindPersonQuery, FindPersonQueryVariables>;