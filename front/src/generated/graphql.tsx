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
  DateTime: string;
  JSON: any;
  Upload: any;
};

export enum ActivityType {
  Note = 'Note',
  Task = 'Task'
}

export type AffectedRows = {
  __typename?: 'AffectedRows';
  count: Scalars['Int'];
};

export type Analytics = {
  __typename?: 'Analytics';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean'];
};

export type Attachment = {
  __typename?: 'Attachment';
  activity: CommentThread;
  activityId: Scalars['String'];
  author: User;
  authorId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  fullPath: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  type: AttachmentType;
  updatedAt: Scalars['DateTime'];
};

export type AttachmentCreateNestedManyWithoutActivityInput = {
  connect?: InputMaybe<Array<AttachmentWhereUniqueInput>>;
};

export type AttachmentListRelationFilter = {
  every?: InputMaybe<AttachmentWhereInput>;
  none?: InputMaybe<AttachmentWhereInput>;
  some?: InputMaybe<AttachmentWhereInput>;
};

export type AttachmentOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export enum AttachmentType {
  Archive = 'Archive',
  Audio = 'Audio',
  Image = 'Image',
  Other = 'Other',
  Spreadsheet = 'Spreadsheet',
  TextDocument = 'TextDocument',
  Video = 'Video'
}

export type AttachmentUpdateManyWithoutActivityNestedInput = {
  connect?: InputMaybe<Array<AttachmentWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<AttachmentWhereUniqueInput>>;
  set?: InputMaybe<Array<AttachmentWhereUniqueInput>>;
};

export type AttachmentUpdateManyWithoutAuthorNestedInput = {
  connect?: InputMaybe<Array<AttachmentWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<AttachmentWhereUniqueInput>>;
  set?: InputMaybe<Array<AttachmentWhereUniqueInput>>;
};

export type AttachmentWhereInput = {
  AND?: InputMaybe<Array<AttachmentWhereInput>>;
  NOT?: InputMaybe<Array<AttachmentWhereInput>>;
  OR?: InputMaybe<Array<AttachmentWhereInput>>;
  activity?: InputMaybe<CommentThreadRelationFilter>;
  activityId?: InputMaybe<StringFilter>;
  author?: InputMaybe<UserRelationFilter>;
  authorId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  fullPath?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  type?: InputMaybe<EnumAttachmentTypeFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type AttachmentWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
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

export type BoolFilter = {
  equals?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<NestedBoolFilter>;
};

export type ClientConfig = {
  __typename?: 'ClientConfig';
  authProviders: AuthProviders;
  debugMode: Scalars['Boolean'];
  demoMode: Scalars['Boolean'];
  telemetry: Telemetry;
};

export enum ColorScheme {
  Dark = 'Dark',
  Light = 'Light',
  System = 'System'
}

export type Comment = {
  __typename?: 'Comment';
  author: User;
  authorId: Scalars['String'];
  body: Scalars['String'];
  commentThread: CommentThread;
  commentThreadId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

export type CommentCreateInput = {
  author: UserCreateNestedOneWithoutCommentsInput;
  body: Scalars['String'];
  commentThread: CommentThreadCreateNestedOneWithoutCommentsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateNestedManyWithoutCommentThreadInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
};

export type CommentListRelationFilter = {
  every?: InputMaybe<CommentWhereInput>;
  none?: InputMaybe<CommentWhereInput>;
  some?: InputMaybe<CommentWhereInput>;
};

export type CommentOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type CommentThread = {
  __typename?: 'CommentThread';
  assignee?: Maybe<User>;
  assigneeId?: Maybe<Scalars['String']>;
  attachments?: Maybe<Array<Attachment>>;
  author: User;
  authorId: Scalars['String'];
  body?: Maybe<Scalars['String']>;
  commentThreadTargets?: Maybe<Array<CommentThreadTarget>>;
  comments?: Maybe<Array<Comment>>;
  completedAt?: Maybe<Scalars['DateTime']>;
  createdAt: Scalars['DateTime'];
  dueAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  reminderAt?: Maybe<Scalars['DateTime']>;
  title?: Maybe<Scalars['String']>;
  type: ActivityType;
  updatedAt: Scalars['DateTime'];
};

export type CommentThreadCreateInput = {
  assignee?: InputMaybe<UserCreateNestedOneWithoutAssignedCommentThreadsInput>;
  attachments?: InputMaybe<AttachmentCreateNestedManyWithoutActivityInput>;
  author: UserCreateNestedOneWithoutAuthoredCommentThreadsInput;
  body?: InputMaybe<Scalars['String']>;
  commentThreadTargets?: InputMaybe<CommentThreadTargetCreateNestedManyWithoutCommentThreadInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutCommentThreadInput>;
  completedAt?: InputMaybe<Scalars['DateTime']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  dueAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  reminderAt?: InputMaybe<Scalars['DateTime']>;
  title?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<ActivityType>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentThreadCreateNestedOneWithoutCommentsInput = {
  connect?: InputMaybe<CommentThreadWhereUniqueInput>;
};

export type CommentThreadListRelationFilter = {
  every?: InputMaybe<CommentThreadWhereInput>;
  none?: InputMaybe<CommentThreadWhereInput>;
  some?: InputMaybe<CommentThreadWhereInput>;
};

export type CommentThreadOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type CommentThreadOrderByWithRelationInput = {
  assignee?: InputMaybe<UserOrderByWithRelationInput>;
  assigneeId?: InputMaybe<SortOrder>;
  attachments?: InputMaybe<AttachmentOrderByRelationAggregateInput>;
  author?: InputMaybe<UserOrderByWithRelationInput>;
  authorId?: InputMaybe<SortOrder>;
  body?: InputMaybe<SortOrder>;
  commentThreadTargets?: InputMaybe<CommentThreadTargetOrderByRelationAggregateInput>;
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  completedAt?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  dueAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  reminderAt?: InputMaybe<SortOrder>;
  title?: InputMaybe<SortOrder>;
  type?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type CommentThreadRelationFilter = {
  is?: InputMaybe<CommentThreadWhereInput>;
  isNot?: InputMaybe<CommentThreadWhereInput>;
};

export enum CommentThreadScalarFieldEnum {
  AssigneeId = 'assigneeId',
  AuthorId = 'authorId',
  Body = 'body',
  CompletedAt = 'completedAt',
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  DueAt = 'dueAt',
  Id = 'id',
  ReminderAt = 'reminderAt',
  Title = 'title',
  Type = 'type',
  UpdatedAt = 'updatedAt',
  WorkspaceId = 'workspaceId'
}

export type CommentThreadTarget = {
  __typename?: 'CommentThreadTarget';
  commentThread: CommentThread;
  commentThreadId: Scalars['String'];
  commentableId: Scalars['String'];
  commentableType: CommentableType;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

export type CommentThreadTargetCreateManyCommentThreadInput = {
  commentableId: Scalars['String'];
  commentableType: CommentableType;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentThreadTargetCreateManyCommentThreadInputEnvelope = {
  data: Array<CommentThreadTargetCreateManyCommentThreadInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type CommentThreadTargetCreateNestedManyWithoutCommentThreadInput = {
  connect?: InputMaybe<Array<CommentThreadTargetWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentThreadTargetCreateOrConnectWithoutCommentThreadInput>>;
  create?: InputMaybe<Array<CommentThreadTargetCreateWithoutCommentThreadInput>>;
  createMany?: InputMaybe<CommentThreadTargetCreateManyCommentThreadInputEnvelope>;
};

export type CommentThreadTargetCreateOrConnectWithoutCommentThreadInput = {
  create: CommentThreadTargetCreateWithoutCommentThreadInput;
  where: CommentThreadTargetWhereUniqueInput;
};

export type CommentThreadTargetCreateWithoutCommentThreadInput = {
  commentableId: Scalars['String'];
  commentableType: CommentableType;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentThreadTargetListRelationFilter = {
  every?: InputMaybe<CommentThreadTargetWhereInput>;
  none?: InputMaybe<CommentThreadTargetWhereInput>;
  some?: InputMaybe<CommentThreadTargetWhereInput>;
};

export type CommentThreadTargetOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type CommentThreadTargetUpdateManyWithoutCommentThreadNestedInput = {
  connect?: InputMaybe<Array<CommentThreadTargetWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentThreadTargetCreateOrConnectWithoutCommentThreadInput>>;
  create?: InputMaybe<Array<CommentThreadTargetCreateWithoutCommentThreadInput>>;
  createMany?: InputMaybe<CommentThreadTargetCreateManyCommentThreadInputEnvelope>;
  delete?: InputMaybe<Array<CommentThreadTargetWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CommentThreadTargetWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentThreadTargetWhereUniqueInput>>;
};

export type CommentThreadTargetWhereInput = {
  AND?: InputMaybe<Array<CommentThreadTargetWhereInput>>;
  NOT?: InputMaybe<Array<CommentThreadTargetWhereInput>>;
  OR?: InputMaybe<Array<CommentThreadTargetWhereInput>>;
  commentThread?: InputMaybe<CommentThreadRelationFilter>;
  commentThreadId?: InputMaybe<StringFilter>;
  commentableId?: InputMaybe<StringFilter>;
  commentableType?: InputMaybe<EnumCommentableTypeFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CommentThreadTargetWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type CommentThreadUpdateInput = {
  assignee?: InputMaybe<UserUpdateOneWithoutAssignedCommentThreadsNestedInput>;
  attachments?: InputMaybe<AttachmentUpdateManyWithoutActivityNestedInput>;
  author?: InputMaybe<UserUpdateOneRequiredWithoutAuthoredCommentThreadsNestedInput>;
  body?: InputMaybe<Scalars['String']>;
  commentThreadTargets?: InputMaybe<CommentThreadTargetUpdateManyWithoutCommentThreadNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutCommentThreadNestedInput>;
  completedAt?: InputMaybe<Scalars['DateTime']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  dueAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  reminderAt?: InputMaybe<Scalars['DateTime']>;
  title?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<ActivityType>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentThreadUpdateManyWithoutAssigneeNestedInput = {
  connect?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
};

export type CommentThreadUpdateManyWithoutAuthorNestedInput = {
  connect?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
};

export type CommentThreadUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentThreadWhereUniqueInput>>;
};

export type CommentThreadWhereInput = {
  AND?: InputMaybe<Array<CommentThreadWhereInput>>;
  NOT?: InputMaybe<Array<CommentThreadWhereInput>>;
  OR?: InputMaybe<Array<CommentThreadWhereInput>>;
  assignee?: InputMaybe<UserRelationFilter>;
  assigneeId?: InputMaybe<StringNullableFilter>;
  attachments?: InputMaybe<AttachmentListRelationFilter>;
  author?: InputMaybe<UserRelationFilter>;
  authorId?: InputMaybe<StringFilter>;
  body?: InputMaybe<StringNullableFilter>;
  commentThreadTargets?: InputMaybe<CommentThreadTargetListRelationFilter>;
  comments?: InputMaybe<CommentListRelationFilter>;
  completedAt?: InputMaybe<DateTimeNullableFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  dueAt?: InputMaybe<DateTimeNullableFilter>;
  id?: InputMaybe<StringFilter>;
  reminderAt?: InputMaybe<DateTimeNullableFilter>;
  title?: InputMaybe<StringNullableFilter>;
  type?: InputMaybe<EnumActivityTypeFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CommentThreadWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type CommentUpdateManyWithoutAuthorNestedInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentWhereUniqueInput>>;
};

export type CommentUpdateManyWithoutCommentThreadNestedInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentWhereUniqueInput>>;
};

export type CommentUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentWhereUniqueInput>>;
};

export type CommentWhereInput = {
  AND?: InputMaybe<Array<CommentWhereInput>>;
  NOT?: InputMaybe<Array<CommentWhereInput>>;
  OR?: InputMaybe<Array<CommentWhereInput>>;
  author?: InputMaybe<UserRelationFilter>;
  authorId?: InputMaybe<StringFilter>;
  body?: InputMaybe<StringFilter>;
  commentThread?: InputMaybe<CommentThreadRelationFilter>;
  commentThreadId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CommentWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export enum CommentableType {
  Company = 'Company',
  Person = 'Person'
}

export type Company = {
  __typename?: 'Company';
  _commentThreadCount: Scalars['Int'];
  accountOwner?: Maybe<User>;
  accountOwnerId?: Maybe<Scalars['String']>;
  address: Scalars['String'];
  commentThreads: Array<CommentThread>;
  comments: Array<Comment>;
  createdAt: Scalars['DateTime'];
  domainName: Scalars['String'];
  employees?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  people?: Maybe<Array<Person>>;
  updatedAt: Scalars['DateTime'];
};

export type CompanyCreateInput = {
  accountOwner?: InputMaybe<UserCreateNestedOneWithoutCompaniesInput>;
  address: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  domainName: Scalars['String'];
  employees?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  people?: InputMaybe<PersonCreateNestedManyWithoutCompanyInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CompanyCreateNestedOneWithoutPeopleInput = {
  connect?: InputMaybe<CompanyWhereUniqueInput>;
};

export type CompanyListRelationFilter = {
  every?: InputMaybe<CompanyWhereInput>;
  none?: InputMaybe<CompanyWhereInput>;
  some?: InputMaybe<CompanyWhereInput>;
};

export type CompanyOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type CompanyOrderByWithRelationInput = {
  accountOwner?: InputMaybe<UserOrderByWithRelationInput>;
  accountOwnerId?: InputMaybe<SortOrder>;
  address?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  domainName?: InputMaybe<SortOrder>;
  employees?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  people?: InputMaybe<PersonOrderByRelationAggregateInput>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type CompanyRelationFilter = {
  is?: InputMaybe<CompanyWhereInput>;
  isNot?: InputMaybe<CompanyWhereInput>;
};

export enum CompanyScalarFieldEnum {
  AccountOwnerId = 'accountOwnerId',
  Address = 'address',
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  DomainName = 'domainName',
  Employees = 'employees',
  Id = 'id',
  Name = 'name',
  UpdatedAt = 'updatedAt',
  WorkspaceId = 'workspaceId'
}

export type CompanyUpdateInput = {
  accountOwner?: InputMaybe<UserUpdateOneWithoutCompaniesNestedInput>;
  address?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  domainName?: InputMaybe<Scalars['String']>;
  employees?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  people?: InputMaybe<PersonUpdateManyWithoutCompanyNestedInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CompanyUpdateManyWithoutAccountOwnerNestedInput = {
  connect?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  set?: InputMaybe<Array<CompanyWhereUniqueInput>>;
};

export type CompanyUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  set?: InputMaybe<Array<CompanyWhereUniqueInput>>;
};

export type CompanyUpdateOneWithoutPeopleNestedInput = {
  connect?: InputMaybe<CompanyWhereUniqueInput>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
};

export type CompanyWhereInput = {
  AND?: InputMaybe<Array<CompanyWhereInput>>;
  NOT?: InputMaybe<Array<CompanyWhereInput>>;
  OR?: InputMaybe<Array<CompanyWhereInput>>;
  accountOwner?: InputMaybe<UserRelationFilter>;
  accountOwnerId?: InputMaybe<StringNullableFilter>;
  address?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  domainName?: InputMaybe<StringFilter>;
  employees?: InputMaybe<IntNullableFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  people?: InputMaybe<PersonListRelationFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CompanyWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type DateTimeFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<NestedDateTimeFilter>;
  notIn?: InputMaybe<Array<Scalars['DateTime']>>;
};

export type DateTimeNullableFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<NestedDateTimeNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['DateTime']>>;
};

export type EnumActivityTypeFilter = {
  equals?: InputMaybe<ActivityType>;
  in?: InputMaybe<Array<ActivityType>>;
  not?: InputMaybe<NestedEnumActivityTypeFilter>;
  notIn?: InputMaybe<Array<ActivityType>>;
};

export type EnumAttachmentTypeFilter = {
  equals?: InputMaybe<AttachmentType>;
  in?: InputMaybe<Array<AttachmentType>>;
  not?: InputMaybe<NestedEnumAttachmentTypeFilter>;
  notIn?: InputMaybe<Array<AttachmentType>>;
};

export type EnumColorSchemeFilter = {
  equals?: InputMaybe<ColorScheme>;
  in?: InputMaybe<Array<ColorScheme>>;
  not?: InputMaybe<NestedEnumColorSchemeFilter>;
  notIn?: InputMaybe<Array<ColorScheme>>;
};

export type EnumCommentableTypeFilter = {
  equals?: InputMaybe<CommentableType>;
  in?: InputMaybe<Array<CommentableType>>;
  not?: InputMaybe<NestedEnumCommentableTypeFilter>;
  notIn?: InputMaybe<Array<CommentableType>>;
};

export type EnumPipelineProgressableTypeFilter = {
  equals?: InputMaybe<PipelineProgressableType>;
  in?: InputMaybe<Array<PipelineProgressableType>>;
  not?: InputMaybe<NestedEnumPipelineProgressableTypeFilter>;
  notIn?: InputMaybe<Array<PipelineProgressableType>>;
};

export enum FileFolder {
  Attachment = 'Attachment',
  ProfilePicture = 'ProfilePicture',
  WorkspaceLogo = 'WorkspaceLogo'
}

export type IntNullableFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type JsonNullableFilter = {
  array_contains?: InputMaybe<Scalars['JSON']>;
  array_ends_with?: InputMaybe<Scalars['JSON']>;
  array_starts_with?: InputMaybe<Scalars['JSON']>;
  equals?: InputMaybe<Scalars['JSON']>;
  gt?: InputMaybe<Scalars['JSON']>;
  gte?: InputMaybe<Scalars['JSON']>;
  lt?: InputMaybe<Scalars['JSON']>;
  lte?: InputMaybe<Scalars['JSON']>;
  not?: InputMaybe<Scalars['JSON']>;
  path?: InputMaybe<Array<Scalars['String']>>;
  string_contains?: InputMaybe<Scalars['String']>;
  string_ends_with?: InputMaybe<Scalars['String']>;
  string_starts_with?: InputMaybe<Scalars['String']>;
};

export type LoginToken = {
  __typename?: 'LoginToken';
  loginToken: AuthToken;
};

export type Mutation = {
  __typename?: 'Mutation';
  challenge: LoginToken;
  createEvent: Analytics;
  createOneComment: Comment;
  createOneCommentThread: CommentThread;
  createOneCompany: Company;
  createOnePerson: Person;
  createOnePipelineProgress: PipelineProgress;
  deleteManyCommentThreads: AffectedRows;
  deleteManyCompany: AffectedRows;
  deleteManyPerson: AffectedRows;
  deleteManyPipelineProgress: AffectedRows;
  deleteWorkspaceMember: WorkspaceMember;
  renewToken: AuthTokens;
  signUp: LoginToken;
  updateOneCommentThread: CommentThread;
  updateOneCompany?: Maybe<Company>;
  updateOnePerson?: Maybe<Person>;
  updateOnePipelineProgress?: Maybe<PipelineProgress>;
  updateOnePipelineStage?: Maybe<PipelineStage>;
  updateUser: User;
  updateWorkspace: Workspace;
  uploadAttachment: Scalars['String'];
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


export type MutationCreateOneCommentArgs = {
  data: CommentCreateInput;
};


export type MutationCreateOneCommentThreadArgs = {
  data: CommentThreadCreateInput;
};


export type MutationCreateOneCompanyArgs = {
  data: CompanyCreateInput;
};


export type MutationCreateOnePersonArgs = {
  data: PersonCreateInput;
};


export type MutationCreateOnePipelineProgressArgs = {
  data: PipelineProgressCreateInput;
};


export type MutationDeleteManyCommentThreadsArgs = {
  where?: InputMaybe<CommentThreadWhereInput>;
};


export type MutationDeleteManyCompanyArgs = {
  where?: InputMaybe<CompanyWhereInput>;
};


export type MutationDeleteManyPersonArgs = {
  where?: InputMaybe<PersonWhereInput>;
};


export type MutationDeleteManyPipelineProgressArgs = {
  where?: InputMaybe<PipelineProgressWhereInput>;
};


export type MutationDeleteWorkspaceMemberArgs = {
  where: WorkspaceMemberWhereUniqueInput;
};


export type MutationRenewTokenArgs = {
  refreshToken: Scalars['String'];
};


export type MutationSignUpArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateOneCommentThreadArgs = {
  data: CommentThreadUpdateInput;
  where: CommentThreadWhereUniqueInput;
};


export type MutationUpdateOneCompanyArgs = {
  data: CompanyUpdateInput;
  where: CompanyWhereUniqueInput;
};


export type MutationUpdateOnePersonArgs = {
  data: PersonUpdateInput;
  where: PersonWhereUniqueInput;
};


export type MutationUpdateOnePipelineProgressArgs = {
  data: PipelineProgressUpdateInput;
  where: PipelineProgressWhereUniqueInput;
};


export type MutationUpdateOnePipelineStageArgs = {
  data: PipelineStageUpdateInput;
  where: PipelineStageWhereUniqueInput;
};


export type MutationUpdateUserArgs = {
  data: UserUpdateInput;
  where: UserWhereUniqueInput;
};


export type MutationUpdateWorkspaceArgs = {
  data: WorkspaceUpdateInput;
};


export type MutationUploadAttachmentArgs = {
  activityId: Scalars['String'];
  file: Scalars['Upload'];
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

export type NestedBoolFilter = {
  equals?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<NestedBoolFilter>;
};

export type NestedDateTimeFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<NestedDateTimeFilter>;
  notIn?: InputMaybe<Array<Scalars['DateTime']>>;
};

export type NestedDateTimeNullableFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<NestedDateTimeNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['DateTime']>>;
};

export type NestedEnumActivityTypeFilter = {
  equals?: InputMaybe<ActivityType>;
  in?: InputMaybe<Array<ActivityType>>;
  not?: InputMaybe<NestedEnumActivityTypeFilter>;
  notIn?: InputMaybe<Array<ActivityType>>;
};

export type NestedEnumAttachmentTypeFilter = {
  equals?: InputMaybe<AttachmentType>;
  in?: InputMaybe<Array<AttachmentType>>;
  not?: InputMaybe<NestedEnumAttachmentTypeFilter>;
  notIn?: InputMaybe<Array<AttachmentType>>;
};

export type NestedEnumColorSchemeFilter = {
  equals?: InputMaybe<ColorScheme>;
  in?: InputMaybe<Array<ColorScheme>>;
  not?: InputMaybe<NestedEnumColorSchemeFilter>;
  notIn?: InputMaybe<Array<ColorScheme>>;
};

export type NestedEnumCommentableTypeFilter = {
  equals?: InputMaybe<CommentableType>;
  in?: InputMaybe<Array<CommentableType>>;
  not?: InputMaybe<NestedEnumCommentableTypeFilter>;
  notIn?: InputMaybe<Array<CommentableType>>;
};

export type NestedEnumPipelineProgressableTypeFilter = {
  equals?: InputMaybe<PipelineProgressableType>;
  in?: InputMaybe<Array<PipelineProgressableType>>;
  not?: InputMaybe<NestedEnumPipelineProgressableTypeFilter>;
  notIn?: InputMaybe<Array<PipelineProgressableType>>;
};

export type NestedIntNullableFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type NestedStringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NestedStringFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type NestedStringNullableFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NestedStringNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type Person = {
  __typename?: 'Person';
  PipelineProgress?: Maybe<Array<PipelineProgress>>;
  _commentThreadCount: Scalars['Int'];
  city: Scalars['String'];
  commentThreads: Array<CommentThread>;
  comments: Array<Comment>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  displayName: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  phone: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type PersonCreateInput = {
  PipelineProgress?: InputMaybe<PipelineProgressCreateNestedManyWithoutPointOfContactInput>;
  city: Scalars['String'];
  company?: InputMaybe<CompanyCreateNestedOneWithoutPeopleInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  email: Scalars['String'];
  firstName: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  lastName: Scalars['String'];
  phone: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PersonCreateNestedManyWithoutCompanyInput = {
  connect?: InputMaybe<Array<PersonWhereUniqueInput>>;
};

export type PersonCreateNestedOneWithoutPipelineProgressInput = {
  connect?: InputMaybe<PersonWhereUniqueInput>;
};

export type PersonListRelationFilter = {
  every?: InputMaybe<PersonWhereInput>;
  none?: InputMaybe<PersonWhereInput>;
  some?: InputMaybe<PersonWhereInput>;
};

export type PersonOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type PersonOrderByWithRelationInput = {
  PipelineProgress?: InputMaybe<PipelineProgressOrderByRelationAggregateInput>;
  city?: InputMaybe<SortOrder>;
  company?: InputMaybe<CompanyOrderByWithRelationInput>;
  companyId?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  email?: InputMaybe<SortOrder>;
  firstName?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  lastName?: InputMaybe<SortOrder>;
  phone?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type PersonRelationFilter = {
  is?: InputMaybe<PersonWhereInput>;
  isNot?: InputMaybe<PersonWhereInput>;
};

export enum PersonScalarFieldEnum {
  City = 'city',
  CompanyId = 'companyId',
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  Email = 'email',
  FirstName = 'firstName',
  Id = 'id',
  LastName = 'lastName',
  Phone = 'phone',
  UpdatedAt = 'updatedAt',
  WorkspaceId = 'workspaceId'
}

export type PersonUpdateInput = {
  PipelineProgress?: InputMaybe<PipelineProgressUpdateManyWithoutPointOfContactNestedInput>;
  city?: InputMaybe<Scalars['String']>;
  company?: InputMaybe<CompanyUpdateOneWithoutPeopleNestedInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PersonUpdateManyWithoutCompanyNestedInput = {
  connect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  set?: InputMaybe<Array<PersonWhereUniqueInput>>;
};

export type PersonUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  set?: InputMaybe<Array<PersonWhereUniqueInput>>;
};

export type PersonUpdateOneWithoutPipelineProgressNestedInput = {
  connect?: InputMaybe<PersonWhereUniqueInput>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
};

export type PersonWhereInput = {
  AND?: InputMaybe<Array<PersonWhereInput>>;
  NOT?: InputMaybe<Array<PersonWhereInput>>;
  OR?: InputMaybe<Array<PersonWhereInput>>;
  PipelineProgress?: InputMaybe<PipelineProgressListRelationFilter>;
  city?: InputMaybe<StringFilter>;
  company?: InputMaybe<CompanyRelationFilter>;
  companyId?: InputMaybe<StringNullableFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  email?: InputMaybe<StringFilter>;
  firstName?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  lastName?: InputMaybe<StringFilter>;
  phone?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type PersonWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Pipeline = {
  __typename?: 'Pipeline';
  createdAt: Scalars['DateTime'];
  icon: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  pipelineProgressableType: PipelineProgressableType;
  pipelineProgresses?: Maybe<Array<PipelineProgress>>;
  pipelineStages?: Maybe<Array<PipelineStage>>;
  updatedAt: Scalars['DateTime'];
};

export type PipelineCreateNestedOneWithoutPipelineProgressesInput = {
  connect?: InputMaybe<PipelineWhereUniqueInput>;
};

export type PipelineOrderByWithRelationInput = {
  createdAt?: InputMaybe<SortOrder>;
  icon?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  pipelineProgressableType?: InputMaybe<SortOrder>;
  pipelineProgresses?: InputMaybe<PipelineProgressOrderByRelationAggregateInput>;
  pipelineStages?: InputMaybe<PipelineStageOrderByRelationAggregateInput>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type PipelineProgress = {
  __typename?: 'PipelineProgress';
  amount?: Maybe<Scalars['Int']>;
  closeDate?: Maybe<Scalars['DateTime']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  pipeline: Pipeline;
  pipelineId: Scalars['String'];
  pipelineStage: PipelineStage;
  pipelineStageId: Scalars['String'];
  pointOfContact?: Maybe<Person>;
  pointOfContactId?: Maybe<Scalars['String']>;
  probability?: Maybe<Scalars['Int']>;
  progressableId: Scalars['String'];
  progressableType: PipelineProgressableType;
  updatedAt: Scalars['DateTime'];
};

export type PipelineProgressCreateInput = {
  amount?: InputMaybe<Scalars['Int']>;
  closeDate?: InputMaybe<Scalars['DateTime']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  pipeline: PipelineCreateNestedOneWithoutPipelineProgressesInput;
  pipelineStage: PipelineStageCreateNestedOneWithoutPipelineProgressesInput;
  pointOfContact?: InputMaybe<PersonCreateNestedOneWithoutPipelineProgressInput>;
  probability?: InputMaybe<Scalars['Int']>;
  progressableId: Scalars['String'];
  progressableType: PipelineProgressableType;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PipelineProgressCreateNestedManyWithoutPointOfContactInput = {
  connect?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
};

export type PipelineProgressListRelationFilter = {
  every?: InputMaybe<PipelineProgressWhereInput>;
  none?: InputMaybe<PipelineProgressWhereInput>;
  some?: InputMaybe<PipelineProgressWhereInput>;
};

export type PipelineProgressOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type PipelineProgressOrderByWithRelationInput = {
  amount?: InputMaybe<SortOrder>;
  closeDate?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  pipeline?: InputMaybe<PipelineOrderByWithRelationInput>;
  pipelineId?: InputMaybe<SortOrder>;
  pipelineStage?: InputMaybe<PipelineStageOrderByWithRelationInput>;
  pipelineStageId?: InputMaybe<SortOrder>;
  pointOfContact?: InputMaybe<PersonOrderByWithRelationInput>;
  pointOfContactId?: InputMaybe<SortOrder>;
  probability?: InputMaybe<SortOrder>;
  progressableId?: InputMaybe<SortOrder>;
  progressableType?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export enum PipelineProgressScalarFieldEnum {
  Amount = 'amount',
  CloseDate = 'closeDate',
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  Id = 'id',
  PipelineId = 'pipelineId',
  PipelineStageId = 'pipelineStageId',
  PointOfContactId = 'pointOfContactId',
  Probability = 'probability',
  ProgressableId = 'progressableId',
  ProgressableType = 'progressableType',
  UpdatedAt = 'updatedAt',
  WorkspaceId = 'workspaceId'
}

export type PipelineProgressUpdateInput = {
  amount?: InputMaybe<Scalars['Int']>;
  closeDate?: InputMaybe<Scalars['DateTime']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  pipeline?: InputMaybe<PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput>;
  pipelineStage?: InputMaybe<PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput>;
  pointOfContact?: InputMaybe<PersonUpdateOneWithoutPipelineProgressNestedInput>;
  probability?: InputMaybe<Scalars['Int']>;
  progressableId?: InputMaybe<Scalars['String']>;
  progressableType?: InputMaybe<PipelineProgressableType>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PipelineProgressUpdateManyWithoutPipelineStageNestedInput = {
  connect?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
  set?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
};

export type PipelineProgressUpdateManyWithoutPointOfContactNestedInput = {
  connect?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
  set?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
};

export type PipelineProgressUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
  set?: InputMaybe<Array<PipelineProgressWhereUniqueInput>>;
};

export type PipelineProgressWhereInput = {
  AND?: InputMaybe<Array<PipelineProgressWhereInput>>;
  NOT?: InputMaybe<Array<PipelineProgressWhereInput>>;
  OR?: InputMaybe<Array<PipelineProgressWhereInput>>;
  amount?: InputMaybe<IntNullableFilter>;
  closeDate?: InputMaybe<DateTimeNullableFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<StringFilter>;
  pipeline?: InputMaybe<PipelineRelationFilter>;
  pipelineId?: InputMaybe<StringFilter>;
  pipelineStage?: InputMaybe<PipelineStageRelationFilter>;
  pipelineStageId?: InputMaybe<StringFilter>;
  pointOfContact?: InputMaybe<PersonRelationFilter>;
  pointOfContactId?: InputMaybe<StringNullableFilter>;
  probability?: InputMaybe<IntNullableFilter>;
  progressableId?: InputMaybe<StringFilter>;
  progressableType?: InputMaybe<EnumPipelineProgressableTypeFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type PipelineProgressWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export enum PipelineProgressableType {
  Company = 'Company',
  Person = 'Person'
}

export type PipelineRelationFilter = {
  is?: InputMaybe<PipelineWhereInput>;
  isNot?: InputMaybe<PipelineWhereInput>;
};

export enum PipelineScalarFieldEnum {
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  Icon = 'icon',
  Id = 'id',
  Name = 'name',
  PipelineProgressableType = 'pipelineProgressableType',
  UpdatedAt = 'updatedAt',
  WorkspaceId = 'workspaceId'
}

export type PipelineStage = {
  __typename?: 'PipelineStage';
  color: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  index?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  pipeline: Pipeline;
  pipelineId: Scalars['String'];
  pipelineProgresses?: Maybe<Array<PipelineProgress>>;
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type PipelineStageCreateNestedOneWithoutPipelineProgressesInput = {
  connect?: InputMaybe<PipelineStageWhereUniqueInput>;
};

export type PipelineStageListRelationFilter = {
  every?: InputMaybe<PipelineStageWhereInput>;
  none?: InputMaybe<PipelineStageWhereInput>;
  some?: InputMaybe<PipelineStageWhereInput>;
};

export type PipelineStageOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type PipelineStageOrderByWithRelationInput = {
  color?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  index?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  pipeline?: InputMaybe<PipelineOrderByWithRelationInput>;
  pipelineId?: InputMaybe<SortOrder>;
  pipelineProgresses?: InputMaybe<PipelineProgressOrderByRelationAggregateInput>;
  type?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type PipelineStageRelationFilter = {
  is?: InputMaybe<PipelineStageWhereInput>;
  isNot?: InputMaybe<PipelineStageWhereInput>;
};

export enum PipelineStageScalarFieldEnum {
  Color = 'color',
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  Id = 'id',
  Index = 'index',
  Name = 'name',
  PipelineId = 'pipelineId',
  Type = 'type',
  UpdatedAt = 'updatedAt',
  WorkspaceId = 'workspaceId'
}

export type PipelineStageUpdateInput = {
  color?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  index?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  pipeline?: InputMaybe<PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput>;
  pipelineProgresses?: InputMaybe<PipelineProgressUpdateManyWithoutPipelineStageNestedInput>;
  type?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PipelineStageUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<PipelineStageWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<PipelineStageWhereUniqueInput>>;
  set?: InputMaybe<Array<PipelineStageWhereUniqueInput>>;
};

export type PipelineStageUpdateOneRequiredWithoutPipelineProgressesNestedInput = {
  connect?: InputMaybe<PipelineStageWhereUniqueInput>;
};

export type PipelineStageWhereInput = {
  AND?: InputMaybe<Array<PipelineStageWhereInput>>;
  NOT?: InputMaybe<Array<PipelineStageWhereInput>>;
  OR?: InputMaybe<Array<PipelineStageWhereInput>>;
  color?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<StringFilter>;
  index?: InputMaybe<IntNullableFilter>;
  name?: InputMaybe<StringFilter>;
  pipeline?: InputMaybe<PipelineRelationFilter>;
  pipelineId?: InputMaybe<StringFilter>;
  pipelineProgresses?: InputMaybe<PipelineProgressListRelationFilter>;
  type?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type PipelineStageWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type PipelineUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<PipelineWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<PipelineWhereUniqueInput>>;
  set?: InputMaybe<Array<PipelineWhereUniqueInput>>;
};

export type PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput = {
  connect?: InputMaybe<PipelineWhereUniqueInput>;
};

export type PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput = {
  connect?: InputMaybe<PipelineWhereUniqueInput>;
};

export type PipelineWhereInput = {
  AND?: InputMaybe<Array<PipelineWhereInput>>;
  NOT?: InputMaybe<Array<PipelineWhereInput>>;
  OR?: InputMaybe<Array<PipelineWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  icon?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  pipelineProgressableType?: InputMaybe<EnumPipelineProgressableTypeFilter>;
  pipelineProgresses?: InputMaybe<PipelineProgressListRelationFilter>;
  pipelineStages?: InputMaybe<PipelineStageListRelationFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type PipelineWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  checkUserExists: UserExists;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  clientConfig: ClientConfig;
  currentUser: User;
  currentWorkspace: Workspace;
  findManyCommentThreads: Array<CommentThread>;
  findManyCompany: Array<Company>;
  findManyPerson: Array<Person>;
  findManyPipeline: Array<Pipeline>;
  findManyPipelineProgress: Array<PipelineProgress>;
  findManyPipelineStage: Array<PipelineStage>;
  findManyUser: Array<User>;
  findManyWorkspaceMember: Array<WorkspaceMember>;
  findUniqueCompany: Company;
  findUniquePerson: Person;
};


export type QueryCheckUserExistsArgs = {
  email: Scalars['String'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String'];
};


export type QueryFindManyCommentThreadsArgs = {
  cursor?: InputMaybe<CommentThreadWhereUniqueInput>;
  distinct?: InputMaybe<Array<CommentThreadScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<CommentThreadOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CommentThreadWhereInput>;
};


export type QueryFindManyCompanyArgs = {
  cursor?: InputMaybe<CompanyWhereUniqueInput>;
  distinct?: InputMaybe<Array<CompanyScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<CompanyOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CompanyWhereInput>;
};


export type QueryFindManyPersonArgs = {
  cursor?: InputMaybe<PersonWhereUniqueInput>;
  distinct?: InputMaybe<Array<PersonScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<PersonOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PersonWhereInput>;
};


export type QueryFindManyPipelineArgs = {
  cursor?: InputMaybe<PipelineWhereUniqueInput>;
  distinct?: InputMaybe<Array<PipelineScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<PipelineOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PipelineWhereInput>;
};


export type QueryFindManyPipelineProgressArgs = {
  cursor?: InputMaybe<PipelineProgressWhereUniqueInput>;
  distinct?: InputMaybe<Array<PipelineProgressScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<PipelineProgressOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PipelineProgressWhereInput>;
};


export type QueryFindManyPipelineStageArgs = {
  cursor?: InputMaybe<PipelineStageWhereUniqueInput>;
  distinct?: InputMaybe<Array<PipelineStageScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<PipelineStageOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PipelineStageWhereInput>;
};


export type QueryFindManyUserArgs = {
  cursor?: InputMaybe<UserWhereUniqueInput>;
  distinct?: InputMaybe<Array<UserScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<UserOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<UserWhereInput>;
};


export type QueryFindManyWorkspaceMemberArgs = {
  cursor?: InputMaybe<WorkspaceMemberWhereUniqueInput>;
  distinct?: InputMaybe<Array<WorkspaceMemberScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<WorkspaceMemberOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<WorkspaceMemberWhereInput>;
};


export type QueryFindUniqueCompanyArgs = {
  id: Scalars['String'];
};


export type QueryFindUniquePersonArgs = {
  id: Scalars['String'];
};

export enum QueryMode {
  Default = 'default',
  Insensitive = 'insensitive'
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<QueryMode>;
  not?: InputMaybe<NestedStringFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type StringNullableFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<QueryMode>;
  not?: InputMaybe<NestedStringNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type Telemetry = {
  __typename?: 'Telemetry';
  anonymizationEnabled: Scalars['Boolean'];
  enabled: Scalars['Boolean'];
};

export type User = {
  __typename?: 'User';
  assignedCommentThreads?: Maybe<Array<CommentThread>>;
  authoredAttachments?: Maybe<Array<Attachment>>;
  authoredCommentThreads?: Maybe<Array<CommentThread>>;
  avatarUrl?: Maybe<Scalars['String']>;
  comments?: Maybe<Array<Comment>>;
  companies?: Maybe<Array<Company>>;
  createdAt: Scalars['DateTime'];
  disabled: Scalars['Boolean'];
  displayName: Scalars['String'];
  email: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName?: Maybe<Scalars['String']>;
  lastSeen?: Maybe<Scalars['DateTime']>;
  locale: Scalars['String'];
  metadata?: Maybe<Scalars['JSON']>;
  phoneNumber?: Maybe<Scalars['String']>;
  settings: UserSettings;
  settingsId: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  workspaceMember?: Maybe<WorkspaceMember>;
};

export type UserCreateNestedOneWithoutAssignedCommentThreadsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
};

export type UserCreateNestedOneWithoutAuthoredCommentThreadsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
};

export type UserCreateNestedOneWithoutCommentsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
};

export type UserCreateNestedOneWithoutCompaniesInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
};

export type UserExists = {
  __typename?: 'UserExists';
  exists: Scalars['Boolean'];
};

export type UserOrderByWithRelationInput = {
  assignedCommentThreads?: InputMaybe<CommentThreadOrderByRelationAggregateInput>;
  authoredAttachments?: InputMaybe<AttachmentOrderByRelationAggregateInput>;
  authoredCommentThreads?: InputMaybe<CommentThreadOrderByRelationAggregateInput>;
  avatarUrl?: InputMaybe<SortOrder>;
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  companies?: InputMaybe<CompanyOrderByRelationAggregateInput>;
  createdAt?: InputMaybe<SortOrder>;
  disabled?: InputMaybe<SortOrder>;
  email?: InputMaybe<SortOrder>;
  emailVerified?: InputMaybe<SortOrder>;
  firstName?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  lastName?: InputMaybe<SortOrder>;
  lastSeen?: InputMaybe<SortOrder>;
  locale?: InputMaybe<SortOrder>;
  metadata?: InputMaybe<SortOrder>;
  phoneNumber?: InputMaybe<SortOrder>;
  settings?: InputMaybe<UserSettingsOrderByWithRelationInput>;
  settingsId?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type UserRelationFilter = {
  is?: InputMaybe<UserWhereInput>;
  isNot?: InputMaybe<UserWhereInput>;
};

export enum UserScalarFieldEnum {
  AvatarUrl = 'avatarUrl',
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  Disabled = 'disabled',
  Email = 'email',
  EmailVerified = 'emailVerified',
  FirstName = 'firstName',
  Id = 'id',
  LastName = 'lastName',
  LastSeen = 'lastSeen',
  Locale = 'locale',
  Metadata = 'metadata',
  PasswordHash = 'passwordHash',
  PhoneNumber = 'phoneNumber',
  SettingsId = 'settingsId',
  UpdatedAt = 'updatedAt'
}

export type UserSettings = {
  __typename?: 'UserSettings';
  colorScheme: ColorScheme;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  locale: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user?: Maybe<User>;
};

export type UserSettingsOrderByWithRelationInput = {
  colorScheme?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  locale?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
  user?: InputMaybe<UserOrderByWithRelationInput>;
};

export type UserSettingsRelationFilter = {
  is?: InputMaybe<UserSettingsWhereInput>;
  isNot?: InputMaybe<UserSettingsWhereInput>;
};

export type UserSettingsUpdateOneRequiredWithoutUserNestedInput = {
  update?: InputMaybe<UserSettingsUpdateWithoutUserInput>;
};

export type UserSettingsUpdateWithoutUserInput = {
  colorScheme?: InputMaybe<ColorScheme>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  id?: InputMaybe<Scalars['String']>;
  locale?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type UserSettingsWhereInput = {
  AND?: InputMaybe<Array<UserSettingsWhereInput>>;
  NOT?: InputMaybe<Array<UserSettingsWhereInput>>;
  OR?: InputMaybe<Array<UserSettingsWhereInput>>;
  colorScheme?: InputMaybe<EnumColorSchemeFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<StringFilter>;
  locale?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
};

export type UserUpdateInput = {
  assignedCommentThreads?: InputMaybe<CommentThreadUpdateManyWithoutAssigneeNestedInput>;
  authoredAttachments?: InputMaybe<AttachmentUpdateManyWithoutAuthorNestedInput>;
  authoredCommentThreads?: InputMaybe<CommentThreadUpdateManyWithoutAuthorNestedInput>;
  avatarUrl?: InputMaybe<Scalars['String']>;
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  companies?: InputMaybe<CompanyUpdateManyWithoutAccountOwnerNestedInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  emailVerified?: InputMaybe<Scalars['Boolean']>;
  firstName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  lastSeen?: InputMaybe<Scalars['DateTime']>;
  locale?: InputMaybe<Scalars['String']>;
  metadata?: InputMaybe<Scalars['JSON']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  settings?: InputMaybe<UserSettingsUpdateOneRequiredWithoutUserNestedInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type UserUpdateOneRequiredWithoutAuthoredCommentThreadsNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
};

export type UserUpdateOneWithoutAssignedCommentThreadsNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
};

export type UserUpdateOneWithoutCompaniesNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
};

export type UserWhereInput = {
  AND?: InputMaybe<Array<UserWhereInput>>;
  NOT?: InputMaybe<Array<UserWhereInput>>;
  OR?: InputMaybe<Array<UserWhereInput>>;
  assignedCommentThreads?: InputMaybe<CommentThreadListRelationFilter>;
  authoredAttachments?: InputMaybe<AttachmentListRelationFilter>;
  authoredCommentThreads?: InputMaybe<CommentThreadListRelationFilter>;
  avatarUrl?: InputMaybe<StringNullableFilter>;
  comments?: InputMaybe<CommentListRelationFilter>;
  companies?: InputMaybe<CompanyListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  disabled?: InputMaybe<BoolFilter>;
  email?: InputMaybe<StringFilter>;
  emailVerified?: InputMaybe<BoolFilter>;
  firstName?: InputMaybe<StringNullableFilter>;
  id?: InputMaybe<StringFilter>;
  lastName?: InputMaybe<StringNullableFilter>;
  lastSeen?: InputMaybe<DateTimeNullableFilter>;
  locale?: InputMaybe<StringFilter>;
  metadata?: InputMaybe<JsonNullableFilter>;
  phoneNumber?: InputMaybe<StringNullableFilter>;
  settings?: InputMaybe<UserSettingsRelationFilter>;
  settingsId?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type UserWhereUniqueInput = {
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  settingsId?: InputMaybe<Scalars['String']>;
};

export type Verify = {
  __typename?: 'Verify';
  tokens: AuthTokenPair;
  user: User;
};

export type Workspace = {
  __typename?: 'Workspace';
  commentThreads?: Maybe<Array<CommentThread>>;
  comments?: Maybe<Array<Comment>>;
  companies?: Maybe<Array<Company>>;
  createdAt: Scalars['DateTime'];
  displayName?: Maybe<Scalars['String']>;
  domainName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  inviteHash?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
  people?: Maybe<Array<Person>>;
  pipelineProgresses?: Maybe<Array<PipelineProgress>>;
  pipelineStages?: Maybe<Array<PipelineStage>>;
  pipelines?: Maybe<Array<Pipeline>>;
  updatedAt: Scalars['DateTime'];
  workspaceMember?: Maybe<Array<WorkspaceMember>>;
};

export type WorkspaceInviteHashValid = {
  __typename?: 'WorkspaceInviteHashValid';
  isValid: Scalars['Boolean'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['String'];
  workspace: Workspace;
};

export type WorkspaceMemberOrderByWithRelationInput = {
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
  user?: InputMaybe<UserOrderByWithRelationInput>;
  userId?: InputMaybe<SortOrder>;
};

export enum WorkspaceMemberScalarFieldEnum {
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  Id = 'id',
  UpdatedAt = 'updatedAt',
  UserId = 'userId',
  WorkspaceId = 'workspaceId'
}

export type WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<WorkspaceMemberWhereUniqueInput>>;
  disconnect?: InputMaybe<Array<WorkspaceMemberWhereUniqueInput>>;
  set?: InputMaybe<Array<WorkspaceMemberWhereUniqueInput>>;
};

export type WorkspaceMemberWhereInput = {
  AND?: InputMaybe<Array<WorkspaceMemberWhereInput>>;
  NOT?: InputMaybe<Array<WorkspaceMemberWhereInput>>;
  OR?: InputMaybe<Array<WorkspaceMemberWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type WorkspaceMemberWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
};

export type WorkspaceUpdateInput = {
  commentThreads?: InputMaybe<CommentThreadUpdateManyWithoutWorkspaceNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutWorkspaceNestedInput>;
  companies?: InputMaybe<CompanyUpdateManyWithoutWorkspaceNestedInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  displayName?: InputMaybe<Scalars['String']>;
  domainName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  inviteHash?: InputMaybe<Scalars['String']>;
  logo?: InputMaybe<Scalars['String']>;
  people?: InputMaybe<PersonUpdateManyWithoutWorkspaceNestedInput>;
  pipelineProgresses?: InputMaybe<PipelineProgressUpdateManyWithoutWorkspaceNestedInput>;
  pipelineStages?: InputMaybe<PipelineStageUpdateManyWithoutWorkspaceNestedInput>;
  pipelines?: InputMaybe<PipelineUpdateManyWithoutWorkspaceNestedInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  workspaceMember?: InputMaybe<WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput>;
};

export type CreateCommentMutationVariables = Exact<{
  commentId: Scalars['String'];
  commentText: Scalars['String'];
  authorId: Scalars['String'];
  commentThreadId: Scalars['String'];
  createdAt: Scalars['DateTime'];
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createOneComment: { __typename?: 'Comment', id: string, createdAt: string, body: string, commentThreadId: string, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null } } };

export type CreateCommentThreadMutationVariables = Exact<{
  commentThreadId: Scalars['String'];
  body?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  type: ActivityType;
  authorId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  commentThreadTargetArray: Array<CommentThreadTargetCreateManyCommentThreadInput> | CommentThreadTargetCreateManyCommentThreadInput;
}>;


export type CreateCommentThreadMutation = { __typename?: 'Mutation', createOneCommentThread: { __typename?: 'CommentThread', id: string, createdAt: string, updatedAt: string, authorId: string, type: ActivityType, commentThreadTargets?: Array<{ __typename?: 'CommentThreadTarget', id: string, createdAt: string, updatedAt: string, commentThreadId: string, commentableType: CommentableType, commentableId: string }> | null, comments?: Array<{ __typename?: 'Comment', id: string, createdAt: string, updatedAt: string, body: string, author: { __typename?: 'User', id: string } }> | null } };

export type GetCommentThreadsByTargetsQueryVariables = Exact<{
  commentThreadTargetIds: Array<Scalars['String']> | Scalars['String'];
  orderBy?: InputMaybe<Array<CommentThreadOrderByWithRelationInput> | CommentThreadOrderByWithRelationInput>;
}>;


export type GetCommentThreadsByTargetsQuery = { __typename?: 'Query', findManyCommentThreads: Array<{ __typename?: 'CommentThread', id: string, createdAt: string, title?: string | null, body?: string | null, type: ActivityType, author: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null }, comments?: Array<{ __typename?: 'Comment', id: string, body: string, createdAt: string, updatedAt: string, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null } }> | null, commentThreadTargets?: Array<{ __typename?: 'CommentThreadTarget', id: string, commentableId: string, commentableType: CommentableType }> | null }> };

export type GetCommentThreadQueryVariables = Exact<{
  commentThreadId: Scalars['String'];
}>;


export type GetCommentThreadQuery = { __typename?: 'Query', findManyCommentThreads: Array<{ __typename?: 'CommentThread', id: string, createdAt: string, body?: string | null, title?: string | null, type: ActivityType, author: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null }, comments?: Array<{ __typename?: 'Comment', id: string, body: string, createdAt: string, updatedAt: string, author: { __typename?: 'User', id: string, displayName: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null } }> | null, commentThreadTargets?: Array<{ __typename?: 'CommentThreadTarget', id: string, commentableId: string, commentableType: CommentableType }> | null }> };

export type AddCommentThreadTargetOnCommentThreadMutationVariables = Exact<{
  commentThreadId: Scalars['String'];
  commentThreadTargetCreationDate: Scalars['DateTime'];
  commentThreadTargetId: Scalars['String'];
  commentableEntityId: Scalars['String'];
  commentableEntityType: CommentableType;
}>;


export type AddCommentThreadTargetOnCommentThreadMutation = { __typename?: 'Mutation', updateOneCommentThread: { __typename?: 'CommentThread', id: string, createdAt: string, updatedAt: string, commentThreadTargets?: Array<{ __typename?: 'CommentThreadTarget', id: string, createdAt: string, updatedAt: string, commentableType: CommentableType, commentableId: string }> | null } };

export type RemoveCommentThreadTargetOnCommentThreadMutationVariables = Exact<{
  commentThreadId: Scalars['String'];
  commentThreadTargetId: Scalars['String'];
}>;


export type RemoveCommentThreadTargetOnCommentThreadMutation = { __typename?: 'Mutation', updateOneCommentThread: { __typename?: 'CommentThread', id: string, createdAt: string, updatedAt: string, commentThreadTargets?: Array<{ __typename?: 'CommentThreadTarget', id: string, createdAt: string, updatedAt: string, commentableType: CommentableType, commentableId: string }> | null } };

export type DeleteCommentThreadMutationVariables = Exact<{
  commentThreadId: Scalars['String'];
}>;


export type DeleteCommentThreadMutation = { __typename?: 'Mutation', deleteManyCommentThreads: { __typename?: 'AffectedRows', count: number } };

export type UpdateCommentThreadMutationVariables = Exact<{
  id: Scalars['String'];
  body?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<ActivityType>;
}>;


export type UpdateCommentThreadMutation = { __typename?: 'Mutation', updateOneCommentThread: { __typename?: 'CommentThread', id: string, body?: string | null, title?: string | null, type: ActivityType } };

export type UploadAttachmentMutationVariables = Exact<{
  file: Scalars['Upload'];
  activityId: Scalars['String'];
}>;


export type UploadAttachmentMutation = { __typename?: 'Mutation', uploadAttachment: string };

export type CreateEventMutationVariables = Exact<{
  type: Scalars['String'];
  data: Scalars['JSON'];
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Analytics', success: boolean } };

export type CheckUserExistsQueryVariables = Exact<{
  email: Scalars['String'];
}>;


export type CheckUserExistsQuery = { __typename?: 'Query', checkUserExists: { __typename?: 'UserExists', exists: boolean } };

export type ChallengeMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type ChallengeMutation = { __typename?: 'Mutation', challenge: { __typename?: 'LoginToken', loginToken: { __typename?: 'AuthToken', expiresAt: string, token: string } } };

export type SignUpMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  workspaceInviteHash?: InputMaybe<Scalars['String']>;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'LoginToken', loginToken: { __typename?: 'AuthToken', expiresAt: string, token: string } } };

export type VerifyMutationVariables = Exact<{
  loginToken: Scalars['String'];
}>;


export type VerifyMutation = { __typename?: 'Mutation', verify: { __typename?: 'Verify', user: { __typename?: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null, workspaceMember?: { __typename?: 'WorkspaceMember', id: string, workspace: { __typename?: 'Workspace', id: string, domainName?: string | null, displayName?: string | null, logo?: string | null } } | null }, tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', token: string, expiresAt: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type RenewTokenMutationVariables = Exact<{
  refreshToken: Scalars['String'];
}>;


export type RenewTokenMutation = { __typename?: 'Mutation', renewToken: { __typename?: 'AuthTokens', tokens: { __typename?: 'AuthTokenPair', accessToken: { __typename?: 'AuthToken', expiresAt: string, token: string }, refreshToken: { __typename?: 'AuthToken', token: string, expiresAt: string } } } };

export type GetClientConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClientConfigQuery = { __typename?: 'Query', clientConfig: { __typename?: 'ClientConfig', demoMode: boolean, debugMode: boolean, authProviders: { __typename?: 'AuthProviders', google: boolean, password: boolean }, telemetry: { __typename?: 'Telemetry', enabled: boolean, anonymizationEnabled: boolean } } };

export type GetCompaniesQueryVariables = Exact<{
  orderBy?: InputMaybe<Array<CompanyOrderByWithRelationInput> | CompanyOrderByWithRelationInput>;
  where?: InputMaybe<CompanyWhereInput>;
}>;


export type GetCompaniesQuery = { __typename?: 'Query', companies: Array<{ __typename?: 'Company', id: string, domainName: string, name: string, createdAt: string, address: string, employees?: number | null, _commentThreadCount: number, accountOwner?: { __typename?: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null } | null }> };

export type GetCompanyQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetCompanyQuery = { __typename?: 'Query', findUniqueCompany: { __typename?: 'Company', id: string, domainName: string, name: string, createdAt: string, address: string, employees?: number | null, _commentThreadCount: number, accountOwner?: { __typename?: 'User', id: string, email: string, displayName: string, avatarUrl?: string | null } | null } };

export type UpdateCompanyMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  domainName?: InputMaybe<Scalars['String']>;
  accountOwnerId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  address?: InputMaybe<Scalars['String']>;
  employees?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateCompanyMutation = { __typename?: 'Mutation', updateOneCompany?: { __typename?: 'Company', address: string, createdAt: string, domainName: string, employees?: number | null, id: string, name: string, accountOwner?: { __typename?: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null } | null } | null };

export type InsertCompanyMutationVariables = Exact<{
  id: Scalars['String'];
  name: Scalars['String'];
  domainName: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  address: Scalars['String'];
  employees?: InputMaybe<Scalars['Int']>;
}>;


export type InsertCompanyMutation = { __typename?: 'Mutation', createOneCompany: { __typename?: 'Company', address: string, createdAt: string, domainName: string, employees?: number | null, id: string, name: string } };

export type DeleteCompaniesMutationVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type DeleteCompaniesMutation = { __typename?: 'Mutation', deleteManyCompany: { __typename?: 'AffectedRows', count: number } };

export type GetPeopleQueryVariables = Exact<{
  orderBy?: InputMaybe<Array<PersonOrderByWithRelationInput> | PersonOrderByWithRelationInput>;
  where?: InputMaybe<PersonWhereInput>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type GetPeopleQuery = { __typename?: 'Query', people: Array<{ __typename?: 'Person', id: string, phone: string, email: string, city: string, firstName: string, lastName: string, createdAt: string, _commentThreadCount: number, company?: { __typename?: 'Company', id: string, name: string, domainName: string } | null }> };

export type GetPersonPhoneByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPersonPhoneByIdQuery = { __typename?: 'Query', person: { __typename?: 'Person', id: string, phone: string } };

export type GetPersonEmailByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPersonEmailByIdQuery = { __typename?: 'Query', person: { __typename?: 'Person', id: string, email: string } };

export type GetPersonNamesAndCommentCountByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPersonNamesAndCommentCountByIdQuery = { __typename?: 'Query', person: { __typename?: 'Person', id: string, firstName: string, lastName: string, _commentThreadCount: number } };

export type GetPersonCompanyByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPersonCompanyByIdQuery = { __typename?: 'Query', person: { __typename?: 'Person', id: string, company?: { __typename?: 'Company', id: string, name: string, domainName: string } | null } };

export type GetPersonCommentCountByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPersonCommentCountByIdQuery = { __typename?: 'Query', person: { __typename?: 'Person', id: string, _commentThreadCount: number } };

export type GetPersonCreatedAtByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPersonCreatedAtByIdQuery = { __typename?: 'Query', person: { __typename?: 'Person', id: string, createdAt: string } };

export type GetPersonCityByIdQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPersonCityByIdQuery = { __typename?: 'Query', person: { __typename?: 'Person', id: string, city: string } };

export type GetPersonQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPersonQuery = { __typename?: 'Query', findUniquePerson: { __typename?: 'Person', id: string, firstName: string, lastName: string, displayName: string, email: string, createdAt: string, city: string, phone: string, _commentThreadCount: number, company?: { __typename?: 'Company', id: string, name: string, domainName: string } | null } };

export type UpdatePeopleMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  companyId?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
}>;


export type UpdatePeopleMutation = { __typename?: 'Mutation', updateOnePerson?: { __typename?: 'Person', id: string, city: string, email: string, firstName: string, lastName: string, phone: string, createdAt: string, company?: { __typename?: 'Company', domainName: string, name: string, id: string } | null } | null };

export type InsertPersonMutationVariables = Exact<{
  id: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  phone: Scalars['String'];
  city: Scalars['String'];
  email: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
}>;


export type InsertPersonMutation = { __typename?: 'Mutation', createOnePerson: { __typename?: 'Person', id: string, city: string, email: string, firstName: string, lastName: string, phone: string, createdAt: string, company?: { __typename?: 'Company', domainName: string, name: string, id: string } | null } };

export type DeletePeopleMutationVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type DeletePeopleMutation = { __typename?: 'Mutation', deleteManyPerson: { __typename?: 'AffectedRows', count: number } };

export type GetPipelinesQueryVariables = Exact<{
  where?: InputMaybe<PipelineWhereInput>;
}>;


export type GetPipelinesQuery = { __typename?: 'Query', findManyPipeline: Array<{ __typename?: 'Pipeline', id: string, name: string, pipelineProgressableType: PipelineProgressableType, pipelineStages?: Array<{ __typename?: 'PipelineStage', id: string, name: string, color: string, index?: number | null }> | null }> };

export type GetPipelineProgressQueryVariables = Exact<{
  where?: InputMaybe<PipelineProgressWhereInput>;
  orderBy?: InputMaybe<Array<PipelineProgressOrderByWithRelationInput> | PipelineProgressOrderByWithRelationInput>;
}>;


export type GetPipelineProgressQuery = { __typename?: 'Query', findManyPipelineProgress: Array<{ __typename?: 'PipelineProgress', id: string, pipelineStageId: string, progressableType: PipelineProgressableType, progressableId: string, amount?: number | null, closeDate?: string | null, pointOfContactId?: string | null, probability?: number | null, pointOfContact?: { __typename?: 'Person', id: string, firstName: string, lastName: string } | null }> };

export type UpdateOnePipelineProgressMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  amount?: InputMaybe<Scalars['Int']>;
  closeDate?: InputMaybe<Scalars['DateTime']>;
  probability?: InputMaybe<Scalars['Int']>;
  pointOfContactId?: InputMaybe<Scalars['String']>;
}>;


export type UpdateOnePipelineProgressMutation = { __typename?: 'Mutation', updateOnePipelineProgress?: { __typename?: 'PipelineProgress', id: string, amount?: number | null, closeDate?: string | null } | null };

export type UpdateOnePipelineProgressStageMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  pipelineStageId?: InputMaybe<Scalars['String']>;
}>;


export type UpdateOnePipelineProgressStageMutation = { __typename?: 'Mutation', updateOnePipelineProgress?: { __typename?: 'PipelineProgress', id: string } | null };

export type CreateOnePipelineProgressMutationVariables = Exact<{
  uuid: Scalars['String'];
  entityType: PipelineProgressableType;
  entityId: Scalars['String'];
  pipelineId: Scalars['String'];
  pipelineStageId: Scalars['String'];
}>;


export type CreateOnePipelineProgressMutation = { __typename?: 'Mutation', createOnePipelineProgress: { __typename?: 'PipelineProgress', id: string } };

export type DeleteManyPipelineProgressMutationVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type DeleteManyPipelineProgressMutation = { __typename?: 'Mutation', deleteManyPipelineProgress: { __typename?: 'AffectedRows', count: number } };

export type UpdatePipelineStageMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
}>;


export type UpdatePipelineStageMutation = { __typename?: 'Mutation', updateOnePipelineStage?: { __typename?: 'PipelineStage', id: string, name: string } | null };

export type SearchPeopleQueryVariables = Exact<{
  where?: InputMaybe<PersonWhereInput>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<PersonOrderByWithRelationInput> | PersonOrderByWithRelationInput>;
}>;


export type SearchPeopleQuery = { __typename?: 'Query', searchResults: Array<{ __typename?: 'Person', id: string, phone: string, email: string, city: string, firstName: string, lastName: string, createdAt: string }> };

export type SearchUserQueryVariables = Exact<{
  where?: InputMaybe<UserWhereInput>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<UserOrderByWithRelationInput> | UserOrderByWithRelationInput>;
}>;


export type SearchUserQuery = { __typename?: 'Query', searchResults: Array<{ __typename?: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null }> };

export type EmptyQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type EmptyQueryQuery = { __typename?: 'Query', searchResults: Array<{ __typename?: 'User', id: string }> };

export type SearchCompanyQueryVariables = Exact<{
  where?: InputMaybe<CompanyWhereInput>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<CompanyOrderByWithRelationInput> | CompanyOrderByWithRelationInput>;
}>;


export type SearchCompanyQuery = { __typename?: 'Query', searchResults: Array<{ __typename?: 'Company', id: string, name: string, domainName: string }> };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', currentUser: { __typename?: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null, workspaceMember?: { __typename?: 'WorkspaceMember', id: string, workspace: { __typename?: 'Workspace', id: string, domainName?: string | null, displayName?: string | null, logo?: string | null, inviteHash?: string | null } } | null, settings: { __typename?: 'UserSettings', id: string, locale: string, colorScheme: ColorScheme } } };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { __typename?: 'Query', findManyUser: Array<{ __typename?: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null }> };

export type UpdateUserMutationVariables = Exact<{
  data: UserUpdateInput;
  where: UserWhereUniqueInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, email: string, displayName: string, firstName?: string | null, lastName?: string | null, avatarUrl?: string | null, workspaceMember?: { __typename?: 'WorkspaceMember', id: string, workspace: { __typename?: 'Workspace', id: string, domainName?: string | null, displayName?: string | null, logo?: string | null, inviteHash?: string | null } } | null, settings: { __typename?: 'UserSettings', id: string, locale: string, colorScheme: ColorScheme } } };

export type UploadProfilePictureMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadProfilePictureMutation = { __typename?: 'Mutation', uploadProfilePicture: string };

export type RemoveProfilePictureMutationVariables = Exact<{
  where: UserWhereUniqueInput;
}>;


export type RemoveProfilePictureMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, avatarUrl?: string | null } };

export type GetWorkspaceMembersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkspaceMembersQuery = { __typename?: 'Query', workspaceMembers: Array<{ __typename?: 'WorkspaceMember', id: string, user: { __typename?: 'User', id: string, email: string, avatarUrl?: string | null, firstName?: string | null, lastName?: string | null } }> };

export type UpdateWorkspaceMutationVariables = Exact<{
  data: WorkspaceUpdateInput;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: string, domainName?: string | null, displayName?: string | null, logo?: string | null } };

export type UploadWorkspaceLogoMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type UploadWorkspaceLogoMutation = { __typename?: 'Mutation', uploadWorkspaceLogo: string };

export type RemoveWorkspaceLogoMutationVariables = Exact<{ [key: string]: never; }>;


export type RemoveWorkspaceLogoMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: string } };

export type RemoveWorkspaceMemberMutationVariables = Exact<{
  where: WorkspaceMemberWhereUniqueInput;
}>;


export type RemoveWorkspaceMemberMutation = { __typename?: 'Mutation', deleteWorkspaceMember: { __typename?: 'WorkspaceMember', id: string } };


export const CreateCommentDocument = gql`
    mutation CreateComment($commentId: String!, $commentText: String!, $authorId: String!, $commentThreadId: String!, $createdAt: DateTime!) {
  createOneComment(
    data: {id: $commentId, createdAt: $createdAt, body: $commentText, author: {connect: {id: $authorId}}, commentThread: {connect: {id: $commentThreadId}}}
  ) {
    id
    createdAt
    body
    author {
      id
      displayName
      firstName
      lastName
      avatarUrl
    }
    commentThreadId
  }
}
    `;
export type CreateCommentMutationFn = Apollo.MutationFunction<CreateCommentMutation, CreateCommentMutationVariables>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      commentText: // value for 'commentText'
 *      authorId: // value for 'authorId'
 *      commentThreadId: // value for 'commentThreadId'
 *      createdAt: // value for 'createdAt'
 *   },
 * });
 */
export function useCreateCommentMutation(baseOptions?: Apollo.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, options);
      }
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = Apollo.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<CreateCommentMutation, CreateCommentMutationVariables>;
export const CreateCommentThreadDocument = gql`
    mutation CreateCommentThread($commentThreadId: String!, $body: String, $title: String, $type: ActivityType!, $authorId: String!, $createdAt: DateTime!, $commentThreadTargetArray: [CommentThreadTargetCreateManyCommentThreadInput!]!) {
  createOneCommentThread(
    data: {id: $commentThreadId, createdAt: $createdAt, updatedAt: $createdAt, author: {connect: {id: $authorId}}, body: $body, title: $title, type: $type, commentThreadTargets: {createMany: {data: $commentThreadTargetArray, skipDuplicates: true}}}
  ) {
    id
    createdAt
    updatedAt
    authorId
    type
    commentThreadTargets {
      id
      createdAt
      updatedAt
      commentThreadId
      commentableType
      commentableId
    }
    comments {
      id
      createdAt
      updatedAt
      body
      author {
        id
      }
    }
  }
}
    `;
export type CreateCommentThreadMutationFn = Apollo.MutationFunction<CreateCommentThreadMutation, CreateCommentThreadMutationVariables>;

/**
 * __useCreateCommentThreadMutation__
 *
 * To run a mutation, you first call `useCreateCommentThreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentThreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentThreadMutation, { data, loading, error }] = useCreateCommentThreadMutation({
 *   variables: {
 *      commentThreadId: // value for 'commentThreadId'
 *      body: // value for 'body'
 *      title: // value for 'title'
 *      type: // value for 'type'
 *      authorId: // value for 'authorId'
 *      createdAt: // value for 'createdAt'
 *      commentThreadTargetArray: // value for 'commentThreadTargetArray'
 *   },
 * });
 */
export function useCreateCommentThreadMutation(baseOptions?: Apollo.MutationHookOptions<CreateCommentThreadMutation, CreateCommentThreadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCommentThreadMutation, CreateCommentThreadMutationVariables>(CreateCommentThreadDocument, options);
      }
export type CreateCommentThreadMutationHookResult = ReturnType<typeof useCreateCommentThreadMutation>;
export type CreateCommentThreadMutationResult = Apollo.MutationResult<CreateCommentThreadMutation>;
export type CreateCommentThreadMutationOptions = Apollo.BaseMutationOptions<CreateCommentThreadMutation, CreateCommentThreadMutationVariables>;
export const GetCommentThreadsByTargetsDocument = gql`
    query GetCommentThreadsByTargets($commentThreadTargetIds: [String!]!, $orderBy: [CommentThreadOrderByWithRelationInput!]) {
  findManyCommentThreads(
    orderBy: $orderBy
    where: {commentThreadTargets: {some: {commentableId: {in: $commentThreadTargetIds}}}}
  ) {
    id
    createdAt
    title
    body
    type
    author {
      id
      firstName
      lastName
    }
    comments {
      id
      body
      createdAt
      updatedAt
      author {
        id
        displayName
        firstName
        lastName
        avatarUrl
      }
    }
    commentThreadTargets {
      id
      commentableId
      commentableType
    }
  }
}
    `;

/**
 * __useGetCommentThreadsByTargetsQuery__
 *
 * To run a query within a React component, call `useGetCommentThreadsByTargetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentThreadsByTargetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentThreadsByTargetsQuery({
 *   variables: {
 *      commentThreadTargetIds: // value for 'commentThreadTargetIds'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetCommentThreadsByTargetsQuery(baseOptions: Apollo.QueryHookOptions<GetCommentThreadsByTargetsQuery, GetCommentThreadsByTargetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommentThreadsByTargetsQuery, GetCommentThreadsByTargetsQueryVariables>(GetCommentThreadsByTargetsDocument, options);
      }
export function useGetCommentThreadsByTargetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommentThreadsByTargetsQuery, GetCommentThreadsByTargetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommentThreadsByTargetsQuery, GetCommentThreadsByTargetsQueryVariables>(GetCommentThreadsByTargetsDocument, options);
        }
export type GetCommentThreadsByTargetsQueryHookResult = ReturnType<typeof useGetCommentThreadsByTargetsQuery>;
export type GetCommentThreadsByTargetsLazyQueryHookResult = ReturnType<typeof useGetCommentThreadsByTargetsLazyQuery>;
export type GetCommentThreadsByTargetsQueryResult = Apollo.QueryResult<GetCommentThreadsByTargetsQuery, GetCommentThreadsByTargetsQueryVariables>;
export const GetCommentThreadDocument = gql`
    query GetCommentThread($commentThreadId: String!) {
  findManyCommentThreads(where: {id: {equals: $commentThreadId}}) {
    id
    createdAt
    body
    title
    type
    author {
      id
      firstName
      lastName
    }
    comments {
      id
      body
      createdAt
      updatedAt
      author {
        id
        displayName
        firstName
        lastName
        avatarUrl
      }
    }
    commentThreadTargets {
      id
      commentableId
      commentableType
    }
  }
}
    `;

/**
 * __useGetCommentThreadQuery__
 *
 * To run a query within a React component, call `useGetCommentThreadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentThreadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentThreadQuery({
 *   variables: {
 *      commentThreadId: // value for 'commentThreadId'
 *   },
 * });
 */
export function useGetCommentThreadQuery(baseOptions: Apollo.QueryHookOptions<GetCommentThreadQuery, GetCommentThreadQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommentThreadQuery, GetCommentThreadQueryVariables>(GetCommentThreadDocument, options);
      }
export function useGetCommentThreadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommentThreadQuery, GetCommentThreadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommentThreadQuery, GetCommentThreadQueryVariables>(GetCommentThreadDocument, options);
        }
export type GetCommentThreadQueryHookResult = ReturnType<typeof useGetCommentThreadQuery>;
export type GetCommentThreadLazyQueryHookResult = ReturnType<typeof useGetCommentThreadLazyQuery>;
export type GetCommentThreadQueryResult = Apollo.QueryResult<GetCommentThreadQuery, GetCommentThreadQueryVariables>;
export const AddCommentThreadTargetOnCommentThreadDocument = gql`
    mutation AddCommentThreadTargetOnCommentThread($commentThreadId: String!, $commentThreadTargetCreationDate: DateTime!, $commentThreadTargetId: String!, $commentableEntityId: String!, $commentableEntityType: CommentableType!) {
  updateOneCommentThread(
    where: {id: $commentThreadId}
    data: {commentThreadTargets: {connectOrCreate: {create: {id: $commentThreadTargetId, createdAt: $commentThreadTargetCreationDate, commentableType: $commentableEntityType, commentableId: $commentableEntityId}, where: {id: $commentThreadTargetId}}}}
  ) {
    id
    createdAt
    updatedAt
    commentThreadTargets {
      id
      createdAt
      updatedAt
      commentableType
      commentableId
    }
  }
}
    `;
export type AddCommentThreadTargetOnCommentThreadMutationFn = Apollo.MutationFunction<AddCommentThreadTargetOnCommentThreadMutation, AddCommentThreadTargetOnCommentThreadMutationVariables>;

/**
 * __useAddCommentThreadTargetOnCommentThreadMutation__
 *
 * To run a mutation, you first call `useAddCommentThreadTargetOnCommentThreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCommentThreadTargetOnCommentThreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCommentThreadTargetOnCommentThreadMutation, { data, loading, error }] = useAddCommentThreadTargetOnCommentThreadMutation({
 *   variables: {
 *      commentThreadId: // value for 'commentThreadId'
 *      commentThreadTargetCreationDate: // value for 'commentThreadTargetCreationDate'
 *      commentThreadTargetId: // value for 'commentThreadTargetId'
 *      commentableEntityId: // value for 'commentableEntityId'
 *      commentableEntityType: // value for 'commentableEntityType'
 *   },
 * });
 */
export function useAddCommentThreadTargetOnCommentThreadMutation(baseOptions?: Apollo.MutationHookOptions<AddCommentThreadTargetOnCommentThreadMutation, AddCommentThreadTargetOnCommentThreadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddCommentThreadTargetOnCommentThreadMutation, AddCommentThreadTargetOnCommentThreadMutationVariables>(AddCommentThreadTargetOnCommentThreadDocument, options);
      }
export type AddCommentThreadTargetOnCommentThreadMutationHookResult = ReturnType<typeof useAddCommentThreadTargetOnCommentThreadMutation>;
export type AddCommentThreadTargetOnCommentThreadMutationResult = Apollo.MutationResult<AddCommentThreadTargetOnCommentThreadMutation>;
export type AddCommentThreadTargetOnCommentThreadMutationOptions = Apollo.BaseMutationOptions<AddCommentThreadTargetOnCommentThreadMutation, AddCommentThreadTargetOnCommentThreadMutationVariables>;
export const RemoveCommentThreadTargetOnCommentThreadDocument = gql`
    mutation RemoveCommentThreadTargetOnCommentThread($commentThreadId: String!, $commentThreadTargetId: String!) {
  updateOneCommentThread(
    where: {id: $commentThreadId}
    data: {commentThreadTargets: {delete: {id: $commentThreadTargetId}}}
  ) {
    id
    createdAt
    updatedAt
    commentThreadTargets {
      id
      createdAt
      updatedAt
      commentableType
      commentableId
    }
  }
}
    `;
export type RemoveCommentThreadTargetOnCommentThreadMutationFn = Apollo.MutationFunction<RemoveCommentThreadTargetOnCommentThreadMutation, RemoveCommentThreadTargetOnCommentThreadMutationVariables>;

/**
 * __useRemoveCommentThreadTargetOnCommentThreadMutation__
 *
 * To run a mutation, you first call `useRemoveCommentThreadTargetOnCommentThreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCommentThreadTargetOnCommentThreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCommentThreadTargetOnCommentThreadMutation, { data, loading, error }] = useRemoveCommentThreadTargetOnCommentThreadMutation({
 *   variables: {
 *      commentThreadId: // value for 'commentThreadId'
 *      commentThreadTargetId: // value for 'commentThreadTargetId'
 *   },
 * });
 */
export function useRemoveCommentThreadTargetOnCommentThreadMutation(baseOptions?: Apollo.MutationHookOptions<RemoveCommentThreadTargetOnCommentThreadMutation, RemoveCommentThreadTargetOnCommentThreadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveCommentThreadTargetOnCommentThreadMutation, RemoveCommentThreadTargetOnCommentThreadMutationVariables>(RemoveCommentThreadTargetOnCommentThreadDocument, options);
      }
export type RemoveCommentThreadTargetOnCommentThreadMutationHookResult = ReturnType<typeof useRemoveCommentThreadTargetOnCommentThreadMutation>;
export type RemoveCommentThreadTargetOnCommentThreadMutationResult = Apollo.MutationResult<RemoveCommentThreadTargetOnCommentThreadMutation>;
export type RemoveCommentThreadTargetOnCommentThreadMutationOptions = Apollo.BaseMutationOptions<RemoveCommentThreadTargetOnCommentThreadMutation, RemoveCommentThreadTargetOnCommentThreadMutationVariables>;
export const DeleteCommentThreadDocument = gql`
    mutation DeleteCommentThread($commentThreadId: String!) {
  deleteManyCommentThreads(where: {id: {equals: $commentThreadId}}) {
    count
  }
}
    `;
export type DeleteCommentThreadMutationFn = Apollo.MutationFunction<DeleteCommentThreadMutation, DeleteCommentThreadMutationVariables>;

/**
 * __useDeleteCommentThreadMutation__
 *
 * To run a mutation, you first call `useDeleteCommentThreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentThreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentThreadMutation, { data, loading, error }] = useDeleteCommentThreadMutation({
 *   variables: {
 *      commentThreadId: // value for 'commentThreadId'
 *   },
 * });
 */
export function useDeleteCommentThreadMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentThreadMutation, DeleteCommentThreadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentThreadMutation, DeleteCommentThreadMutationVariables>(DeleteCommentThreadDocument, options);
      }
export type DeleteCommentThreadMutationHookResult = ReturnType<typeof useDeleteCommentThreadMutation>;
export type DeleteCommentThreadMutationResult = Apollo.MutationResult<DeleteCommentThreadMutation>;
export type DeleteCommentThreadMutationOptions = Apollo.BaseMutationOptions<DeleteCommentThreadMutation, DeleteCommentThreadMutationVariables>;
export const UpdateCommentThreadDocument = gql`
    mutation UpdateCommentThread($id: String!, $body: String, $title: String, $type: ActivityType) {
  updateOneCommentThread(
    where: {id: $id}
    data: {body: $body, title: $title, type: $type}
  ) {
    id
    body
    title
    type
  }
}
    `;
export type UpdateCommentThreadMutationFn = Apollo.MutationFunction<UpdateCommentThreadMutation, UpdateCommentThreadMutationVariables>;

/**
 * __useUpdateCommentThreadMutation__
 *
 * To run a mutation, you first call `useUpdateCommentThreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentThreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentThreadMutation, { data, loading, error }] = useUpdateCommentThreadMutation({
 *   variables: {
 *      id: // value for 'id'
 *      body: // value for 'body'
 *      title: // value for 'title'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useUpdateCommentThreadMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentThreadMutation, UpdateCommentThreadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentThreadMutation, UpdateCommentThreadMutationVariables>(UpdateCommentThreadDocument, options);
      }
export type UpdateCommentThreadMutationHookResult = ReturnType<typeof useUpdateCommentThreadMutation>;
export type UpdateCommentThreadMutationResult = Apollo.MutationResult<UpdateCommentThreadMutation>;
export type UpdateCommentThreadMutationOptions = Apollo.BaseMutationOptions<UpdateCommentThreadMutation, UpdateCommentThreadMutationVariables>;
export const UploadAttachmentDocument = gql`
    mutation UploadAttachment($file: Upload!, $activityId: String!) {
  uploadAttachment(file: $file, activityId: $activityId)
}
    `;
export type UploadAttachmentMutationFn = Apollo.MutationFunction<UploadAttachmentMutation, UploadAttachmentMutationVariables>;

/**
 * __useUploadAttachmentMutation__
 *
 * To run a mutation, you first call `useUploadAttachmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadAttachmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadAttachmentMutation, { data, loading, error }] = useUploadAttachmentMutation({
 *   variables: {
 *      file: // value for 'file'
 *      activityId: // value for 'activityId'
 *   },
 * });
 */
export function useUploadAttachmentMutation(baseOptions?: Apollo.MutationHookOptions<UploadAttachmentMutation, UploadAttachmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadAttachmentMutation, UploadAttachmentMutationVariables>(UploadAttachmentDocument, options);
      }
export type UploadAttachmentMutationHookResult = ReturnType<typeof useUploadAttachmentMutation>;
export type UploadAttachmentMutationResult = Apollo.MutationResult<UploadAttachmentMutation>;
export type UploadAttachmentMutationOptions = Apollo.BaseMutationOptions<UploadAttachmentMutation, UploadAttachmentMutationVariables>;
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
export const ChallengeDocument = gql`
    mutation Challenge($email: String!, $password: String!) {
  challenge(email: $email, password: $password) {
    loginToken {
      expiresAt
      token
    }
  }
}
    `;
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
export const SignUpDocument = gql`
    mutation SignUp($email: String!, $password: String!, $workspaceInviteHash: String) {
  signUp(
    email: $email
    password: $password
    workspaceInviteHash: $workspaceInviteHash
  ) {
    loginToken {
      expiresAt
      token
    }
  }
}
    `;
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
export const VerifyDocument = gql`
    mutation Verify($loginToken: String!) {
  verify(loginToken: $loginToken) {
    user {
      id
      email
      displayName
      firstName
      lastName
      workspaceMember {
        id
        workspace {
          id
          domainName
          displayName
          logo
        }
      }
    }
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
export const RenewTokenDocument = gql`
    mutation RenewToken($refreshToken: String!) {
  renewToken(refreshToken: $refreshToken) {
    tokens {
      accessToken {
        expiresAt
        token
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
export const GetClientConfigDocument = gql`
    query GetClientConfig {
  clientConfig {
    authProviders {
      google
      password
    }
    demoMode
    debugMode
    telemetry {
      enabled
      anonymizationEnabled
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
export const GetCompaniesDocument = gql`
    query GetCompanies($orderBy: [CompanyOrderByWithRelationInput!], $where: CompanyWhereInput) {
  companies: findManyCompany(orderBy: $orderBy, where: $where) {
    id
    domainName
    name
    createdAt
    address
    employees
    _commentThreadCount
    accountOwner {
      id
      email
      displayName
      firstName
      lastName
      avatarUrl
    }
  }
}
    `;

/**
 * __useGetCompaniesQuery__
 *
 * To run a query within a React component, call `useGetCompaniesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompaniesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompaniesQuery({
 *   variables: {
 *      orderBy: // value for 'orderBy'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetCompaniesQuery(baseOptions?: Apollo.QueryHookOptions<GetCompaniesQuery, GetCompaniesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompaniesQuery, GetCompaniesQueryVariables>(GetCompaniesDocument, options);
      }
export function useGetCompaniesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompaniesQuery, GetCompaniesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompaniesQuery, GetCompaniesQueryVariables>(GetCompaniesDocument, options);
        }
export type GetCompaniesQueryHookResult = ReturnType<typeof useGetCompaniesQuery>;
export type GetCompaniesLazyQueryHookResult = ReturnType<typeof useGetCompaniesLazyQuery>;
export type GetCompaniesQueryResult = Apollo.QueryResult<GetCompaniesQuery, GetCompaniesQueryVariables>;
export const GetCompanyDocument = gql`
    query GetCompany($id: String!) {
  findUniqueCompany(id: $id) {
    id
    domainName
    name
    createdAt
    address
    employees
    _commentThreadCount
    accountOwner {
      id
      email
      displayName
      avatarUrl
    }
  }
}
    `;

/**
 * __useGetCompanyQuery__
 *
 * To run a query within a React component, call `useGetCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCompanyQuery(baseOptions: Apollo.QueryHookOptions<GetCompanyQuery, GetCompanyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompanyQuery, GetCompanyQueryVariables>(GetCompanyDocument, options);
      }
export function useGetCompanyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompanyQuery, GetCompanyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompanyQuery, GetCompanyQueryVariables>(GetCompanyDocument, options);
        }
export type GetCompanyQueryHookResult = ReturnType<typeof useGetCompanyQuery>;
export type GetCompanyLazyQueryHookResult = ReturnType<typeof useGetCompanyLazyQuery>;
export type GetCompanyQueryResult = Apollo.QueryResult<GetCompanyQuery, GetCompanyQueryVariables>;
export const UpdateCompanyDocument = gql`
    mutation UpdateCompany($id: String, $name: String, $domainName: String, $accountOwnerId: String, $createdAt: DateTime, $address: String, $employees: Int) {
  updateOneCompany(
    where: {id: $id}
    data: {accountOwner: {connect: {id: $accountOwnerId}}, address: $address, domainName: $domainName, employees: $employees, name: $name, createdAt: $createdAt}
  ) {
    accountOwner {
      id
      email
      displayName
      firstName
      lastName
    }
    address
    createdAt
    domainName
    employees
    id
    name
  }
}
    `;
export type UpdateCompanyMutationFn = Apollo.MutationFunction<UpdateCompanyMutation, UpdateCompanyMutationVariables>;

/**
 * __useUpdateCompanyMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyMutation, { data, loading, error }] = useUpdateCompanyMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      domainName: // value for 'domainName'
 *      accountOwnerId: // value for 'accountOwnerId'
 *      createdAt: // value for 'createdAt'
 *      address: // value for 'address'
 *      employees: // value for 'employees'
 *   },
 * });
 */
export function useUpdateCompanyMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCompanyMutation, UpdateCompanyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCompanyMutation, UpdateCompanyMutationVariables>(UpdateCompanyDocument, options);
      }
export type UpdateCompanyMutationHookResult = ReturnType<typeof useUpdateCompanyMutation>;
export type UpdateCompanyMutationResult = Apollo.MutationResult<UpdateCompanyMutation>;
export type UpdateCompanyMutationOptions = Apollo.BaseMutationOptions<UpdateCompanyMutation, UpdateCompanyMutationVariables>;
export const InsertCompanyDocument = gql`
    mutation InsertCompany($id: String!, $name: String!, $domainName: String!, $createdAt: DateTime, $address: String!, $employees: Int) {
  createOneCompany(
    data: {id: $id, name: $name, domainName: $domainName, createdAt: $createdAt, address: $address, employees: $employees}
  ) {
    address
    createdAt
    domainName
    employees
    id
    name
  }
}
    `;
export type InsertCompanyMutationFn = Apollo.MutationFunction<InsertCompanyMutation, InsertCompanyMutationVariables>;

/**
 * __useInsertCompanyMutation__
 *
 * To run a mutation, you first call `useInsertCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertCompanyMutation, { data, loading, error }] = useInsertCompanyMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      domainName: // value for 'domainName'
 *      createdAt: // value for 'createdAt'
 *      address: // value for 'address'
 *      employees: // value for 'employees'
 *   },
 * });
 */
export function useInsertCompanyMutation(baseOptions?: Apollo.MutationHookOptions<InsertCompanyMutation, InsertCompanyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertCompanyMutation, InsertCompanyMutationVariables>(InsertCompanyDocument, options);
      }
export type InsertCompanyMutationHookResult = ReturnType<typeof useInsertCompanyMutation>;
export type InsertCompanyMutationResult = Apollo.MutationResult<InsertCompanyMutation>;
export type InsertCompanyMutationOptions = Apollo.BaseMutationOptions<InsertCompanyMutation, InsertCompanyMutationVariables>;
export const DeleteCompaniesDocument = gql`
    mutation DeleteCompanies($ids: [String!]) {
  deleteManyCompany(where: {id: {in: $ids}}) {
    count
  }
}
    `;
export type DeleteCompaniesMutationFn = Apollo.MutationFunction<DeleteCompaniesMutation, DeleteCompaniesMutationVariables>;

/**
 * __useDeleteCompaniesMutation__
 *
 * To run a mutation, you first call `useDeleteCompaniesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCompaniesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCompaniesMutation, { data, loading, error }] = useDeleteCompaniesMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteCompaniesMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCompaniesMutation, DeleteCompaniesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCompaniesMutation, DeleteCompaniesMutationVariables>(DeleteCompaniesDocument, options);
      }
export type DeleteCompaniesMutationHookResult = ReturnType<typeof useDeleteCompaniesMutation>;
export type DeleteCompaniesMutationResult = Apollo.MutationResult<DeleteCompaniesMutation>;
export type DeleteCompaniesMutationOptions = Apollo.BaseMutationOptions<DeleteCompaniesMutation, DeleteCompaniesMutationVariables>;
export const GetPeopleDocument = gql`
    query GetPeople($orderBy: [PersonOrderByWithRelationInput!], $where: PersonWhereInput, $limit: Int) {
  people: findManyPerson(orderBy: $orderBy, where: $where, take: $limit) {
    id
    phone
    email
    city
    firstName
    lastName
    createdAt
    _commentThreadCount
    company {
      id
      name
      domainName
    }
  }
}
    `;

/**
 * __useGetPeopleQuery__
 *
 * To run a query within a React component, call `useGetPeopleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPeopleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPeopleQuery({
 *   variables: {
 *      orderBy: // value for 'orderBy'
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetPeopleQuery(baseOptions?: Apollo.QueryHookOptions<GetPeopleQuery, GetPeopleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPeopleQuery, GetPeopleQueryVariables>(GetPeopleDocument, options);
      }
export function useGetPeopleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPeopleQuery, GetPeopleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPeopleQuery, GetPeopleQueryVariables>(GetPeopleDocument, options);
        }
export type GetPeopleQueryHookResult = ReturnType<typeof useGetPeopleQuery>;
export type GetPeopleLazyQueryHookResult = ReturnType<typeof useGetPeopleLazyQuery>;
export type GetPeopleQueryResult = Apollo.QueryResult<GetPeopleQuery, GetPeopleQueryVariables>;
export const GetPersonPhoneByIdDocument = gql`
    query GetPersonPhoneById($id: String!) {
  person: findUniquePerson(id: $id) {
    id
    phone
  }
}
    `;

/**
 * __useGetPersonPhoneByIdQuery__
 *
 * To run a query within a React component, call `useGetPersonPhoneByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonPhoneByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonPhoneByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPersonPhoneByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPersonPhoneByIdQuery, GetPersonPhoneByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonPhoneByIdQuery, GetPersonPhoneByIdQueryVariables>(GetPersonPhoneByIdDocument, options);
      }
export function useGetPersonPhoneByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonPhoneByIdQuery, GetPersonPhoneByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonPhoneByIdQuery, GetPersonPhoneByIdQueryVariables>(GetPersonPhoneByIdDocument, options);
        }
export type GetPersonPhoneByIdQueryHookResult = ReturnType<typeof useGetPersonPhoneByIdQuery>;
export type GetPersonPhoneByIdLazyQueryHookResult = ReturnType<typeof useGetPersonPhoneByIdLazyQuery>;
export type GetPersonPhoneByIdQueryResult = Apollo.QueryResult<GetPersonPhoneByIdQuery, GetPersonPhoneByIdQueryVariables>;
export const GetPersonEmailByIdDocument = gql`
    query GetPersonEmailById($id: String!) {
  person: findUniquePerson(id: $id) {
    id
    email
  }
}
    `;

/**
 * __useGetPersonEmailByIdQuery__
 *
 * To run a query within a React component, call `useGetPersonEmailByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonEmailByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonEmailByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPersonEmailByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPersonEmailByIdQuery, GetPersonEmailByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonEmailByIdQuery, GetPersonEmailByIdQueryVariables>(GetPersonEmailByIdDocument, options);
      }
export function useGetPersonEmailByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonEmailByIdQuery, GetPersonEmailByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonEmailByIdQuery, GetPersonEmailByIdQueryVariables>(GetPersonEmailByIdDocument, options);
        }
export type GetPersonEmailByIdQueryHookResult = ReturnType<typeof useGetPersonEmailByIdQuery>;
export type GetPersonEmailByIdLazyQueryHookResult = ReturnType<typeof useGetPersonEmailByIdLazyQuery>;
export type GetPersonEmailByIdQueryResult = Apollo.QueryResult<GetPersonEmailByIdQuery, GetPersonEmailByIdQueryVariables>;
export const GetPersonNamesAndCommentCountByIdDocument = gql`
    query GetPersonNamesAndCommentCountById($id: String!) {
  person: findUniquePerson(id: $id) {
    id
    firstName
    lastName
    _commentThreadCount
  }
}
    `;

/**
 * __useGetPersonNamesAndCommentCountByIdQuery__
 *
 * To run a query within a React component, call `useGetPersonNamesAndCommentCountByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonNamesAndCommentCountByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonNamesAndCommentCountByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPersonNamesAndCommentCountByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPersonNamesAndCommentCountByIdQuery, GetPersonNamesAndCommentCountByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonNamesAndCommentCountByIdQuery, GetPersonNamesAndCommentCountByIdQueryVariables>(GetPersonNamesAndCommentCountByIdDocument, options);
      }
export function useGetPersonNamesAndCommentCountByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonNamesAndCommentCountByIdQuery, GetPersonNamesAndCommentCountByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonNamesAndCommentCountByIdQuery, GetPersonNamesAndCommentCountByIdQueryVariables>(GetPersonNamesAndCommentCountByIdDocument, options);
        }
export type GetPersonNamesAndCommentCountByIdQueryHookResult = ReturnType<typeof useGetPersonNamesAndCommentCountByIdQuery>;
export type GetPersonNamesAndCommentCountByIdLazyQueryHookResult = ReturnType<typeof useGetPersonNamesAndCommentCountByIdLazyQuery>;
export type GetPersonNamesAndCommentCountByIdQueryResult = Apollo.QueryResult<GetPersonNamesAndCommentCountByIdQuery, GetPersonNamesAndCommentCountByIdQueryVariables>;
export const GetPersonCompanyByIdDocument = gql`
    query GetPersonCompanyById($id: String!) {
  person: findUniquePerson(id: $id) {
    id
    company {
      id
      name
      domainName
    }
  }
}
    `;

/**
 * __useGetPersonCompanyByIdQuery__
 *
 * To run a query within a React component, call `useGetPersonCompanyByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonCompanyByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonCompanyByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPersonCompanyByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPersonCompanyByIdQuery, GetPersonCompanyByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonCompanyByIdQuery, GetPersonCompanyByIdQueryVariables>(GetPersonCompanyByIdDocument, options);
      }
export function useGetPersonCompanyByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonCompanyByIdQuery, GetPersonCompanyByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonCompanyByIdQuery, GetPersonCompanyByIdQueryVariables>(GetPersonCompanyByIdDocument, options);
        }
export type GetPersonCompanyByIdQueryHookResult = ReturnType<typeof useGetPersonCompanyByIdQuery>;
export type GetPersonCompanyByIdLazyQueryHookResult = ReturnType<typeof useGetPersonCompanyByIdLazyQuery>;
export type GetPersonCompanyByIdQueryResult = Apollo.QueryResult<GetPersonCompanyByIdQuery, GetPersonCompanyByIdQueryVariables>;
export const GetPersonCommentCountByIdDocument = gql`
    query GetPersonCommentCountById($id: String!) {
  person: findUniquePerson(id: $id) {
    id
    _commentThreadCount
  }
}
    `;

/**
 * __useGetPersonCommentCountByIdQuery__
 *
 * To run a query within a React component, call `useGetPersonCommentCountByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonCommentCountByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonCommentCountByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPersonCommentCountByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPersonCommentCountByIdQuery, GetPersonCommentCountByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonCommentCountByIdQuery, GetPersonCommentCountByIdQueryVariables>(GetPersonCommentCountByIdDocument, options);
      }
export function useGetPersonCommentCountByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonCommentCountByIdQuery, GetPersonCommentCountByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonCommentCountByIdQuery, GetPersonCommentCountByIdQueryVariables>(GetPersonCommentCountByIdDocument, options);
        }
export type GetPersonCommentCountByIdQueryHookResult = ReturnType<typeof useGetPersonCommentCountByIdQuery>;
export type GetPersonCommentCountByIdLazyQueryHookResult = ReturnType<typeof useGetPersonCommentCountByIdLazyQuery>;
export type GetPersonCommentCountByIdQueryResult = Apollo.QueryResult<GetPersonCommentCountByIdQuery, GetPersonCommentCountByIdQueryVariables>;
export const GetPersonCreatedAtByIdDocument = gql`
    query GetPersonCreatedAtById($id: String!) {
  person: findUniquePerson(id: $id) {
    id
    createdAt
  }
}
    `;

/**
 * __useGetPersonCreatedAtByIdQuery__
 *
 * To run a query within a React component, call `useGetPersonCreatedAtByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonCreatedAtByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonCreatedAtByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPersonCreatedAtByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPersonCreatedAtByIdQuery, GetPersonCreatedAtByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonCreatedAtByIdQuery, GetPersonCreatedAtByIdQueryVariables>(GetPersonCreatedAtByIdDocument, options);
      }
export function useGetPersonCreatedAtByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonCreatedAtByIdQuery, GetPersonCreatedAtByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonCreatedAtByIdQuery, GetPersonCreatedAtByIdQueryVariables>(GetPersonCreatedAtByIdDocument, options);
        }
export type GetPersonCreatedAtByIdQueryHookResult = ReturnType<typeof useGetPersonCreatedAtByIdQuery>;
export type GetPersonCreatedAtByIdLazyQueryHookResult = ReturnType<typeof useGetPersonCreatedAtByIdLazyQuery>;
export type GetPersonCreatedAtByIdQueryResult = Apollo.QueryResult<GetPersonCreatedAtByIdQuery, GetPersonCreatedAtByIdQueryVariables>;
export const GetPersonCityByIdDocument = gql`
    query GetPersonCityById($id: String!) {
  person: findUniquePerson(id: $id) {
    id
    city
  }
}
    `;

/**
 * __useGetPersonCityByIdQuery__
 *
 * To run a query within a React component, call `useGetPersonCityByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonCityByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonCityByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPersonCityByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPersonCityByIdQuery, GetPersonCityByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonCityByIdQuery, GetPersonCityByIdQueryVariables>(GetPersonCityByIdDocument, options);
      }
export function useGetPersonCityByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonCityByIdQuery, GetPersonCityByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonCityByIdQuery, GetPersonCityByIdQueryVariables>(GetPersonCityByIdDocument, options);
        }
export type GetPersonCityByIdQueryHookResult = ReturnType<typeof useGetPersonCityByIdQuery>;
export type GetPersonCityByIdLazyQueryHookResult = ReturnType<typeof useGetPersonCityByIdLazyQuery>;
export type GetPersonCityByIdQueryResult = Apollo.QueryResult<GetPersonCityByIdQuery, GetPersonCityByIdQueryVariables>;
export const GetPersonDocument = gql`
    query GetPerson($id: String!) {
  findUniquePerson(id: $id) {
    id
    firstName
    lastName
    displayName
    email
    createdAt
    city
    phone
    _commentThreadCount
    company {
      id
      name
      domainName
    }
  }
}
    `;

/**
 * __useGetPersonQuery__
 *
 * To run a query within a React component, call `useGetPersonQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPersonQuery(baseOptions: Apollo.QueryHookOptions<GetPersonQuery, GetPersonQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonQuery, GetPersonQueryVariables>(GetPersonDocument, options);
      }
export function useGetPersonLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonQuery, GetPersonQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonQuery, GetPersonQueryVariables>(GetPersonDocument, options);
        }
export type GetPersonQueryHookResult = ReturnType<typeof useGetPersonQuery>;
export type GetPersonLazyQueryHookResult = ReturnType<typeof useGetPersonLazyQuery>;
export type GetPersonQueryResult = Apollo.QueryResult<GetPersonQuery, GetPersonQueryVariables>;
export const UpdatePeopleDocument = gql`
    mutation UpdatePeople($id: String, $firstName: String, $lastName: String, $phone: String, $city: String, $companyId: String, $email: String, $createdAt: DateTime) {
  updateOnePerson(
    where: {id: $id}
    data: {city: $city, company: {connect: {id: $companyId}}, email: $email, firstName: $firstName, id: $id, lastName: $lastName, phone: $phone, createdAt: $createdAt}
  ) {
    id
    city
    company {
      domainName
      name
      id
    }
    email
    firstName
    lastName
    phone
    createdAt
  }
}
    `;
export type UpdatePeopleMutationFn = Apollo.MutationFunction<UpdatePeopleMutation, UpdatePeopleMutationVariables>;

/**
 * __useUpdatePeopleMutation__
 *
 * To run a mutation, you first call `useUpdatePeopleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePeopleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePeopleMutation, { data, loading, error }] = useUpdatePeopleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *      phone: // value for 'phone'
 *      city: // value for 'city'
 *      companyId: // value for 'companyId'
 *      email: // value for 'email'
 *      createdAt: // value for 'createdAt'
 *   },
 * });
 */
export function useUpdatePeopleMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePeopleMutation, UpdatePeopleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePeopleMutation, UpdatePeopleMutationVariables>(UpdatePeopleDocument, options);
      }
export type UpdatePeopleMutationHookResult = ReturnType<typeof useUpdatePeopleMutation>;
export type UpdatePeopleMutationResult = Apollo.MutationResult<UpdatePeopleMutation>;
export type UpdatePeopleMutationOptions = Apollo.BaseMutationOptions<UpdatePeopleMutation, UpdatePeopleMutationVariables>;
export const InsertPersonDocument = gql`
    mutation InsertPerson($id: String!, $firstName: String!, $lastName: String!, $phone: String!, $city: String!, $email: String!, $createdAt: DateTime) {
  createOnePerson(
    data: {id: $id, firstName: $firstName, lastName: $lastName, phone: $phone, city: $city, email: $email, createdAt: $createdAt}
  ) {
    id
    city
    company {
      domainName
      name
      id
    }
    email
    firstName
    lastName
    phone
    createdAt
  }
}
    `;
export type InsertPersonMutationFn = Apollo.MutationFunction<InsertPersonMutation, InsertPersonMutationVariables>;

/**
 * __useInsertPersonMutation__
 *
 * To run a mutation, you first call `useInsertPersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertPersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertPersonMutation, { data, loading, error }] = useInsertPersonMutation({
 *   variables: {
 *      id: // value for 'id'
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *      phone: // value for 'phone'
 *      city: // value for 'city'
 *      email: // value for 'email'
 *      createdAt: // value for 'createdAt'
 *   },
 * });
 */
export function useInsertPersonMutation(baseOptions?: Apollo.MutationHookOptions<InsertPersonMutation, InsertPersonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertPersonMutation, InsertPersonMutationVariables>(InsertPersonDocument, options);
      }
export type InsertPersonMutationHookResult = ReturnType<typeof useInsertPersonMutation>;
export type InsertPersonMutationResult = Apollo.MutationResult<InsertPersonMutation>;
export type InsertPersonMutationOptions = Apollo.BaseMutationOptions<InsertPersonMutation, InsertPersonMutationVariables>;
export const DeletePeopleDocument = gql`
    mutation DeletePeople($ids: [String!]) {
  deleteManyPerson(where: {id: {in: $ids}}) {
    count
  }
}
    `;
export type DeletePeopleMutationFn = Apollo.MutationFunction<DeletePeopleMutation, DeletePeopleMutationVariables>;

/**
 * __useDeletePeopleMutation__
 *
 * To run a mutation, you first call `useDeletePeopleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePeopleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePeopleMutation, { data, loading, error }] = useDeletePeopleMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeletePeopleMutation(baseOptions?: Apollo.MutationHookOptions<DeletePeopleMutation, DeletePeopleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePeopleMutation, DeletePeopleMutationVariables>(DeletePeopleDocument, options);
      }
export type DeletePeopleMutationHookResult = ReturnType<typeof useDeletePeopleMutation>;
export type DeletePeopleMutationResult = Apollo.MutationResult<DeletePeopleMutation>;
export type DeletePeopleMutationOptions = Apollo.BaseMutationOptions<DeletePeopleMutation, DeletePeopleMutationVariables>;
export const GetPipelinesDocument = gql`
    query GetPipelines($where: PipelineWhereInput) {
  findManyPipeline(where: $where) {
    id
    name
    pipelineProgressableType
    pipelineStages {
      id
      name
      color
      index
    }
  }
}
    `;

/**
 * __useGetPipelinesQuery__
 *
 * To run a query within a React component, call `useGetPipelinesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPipelinesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPipelinesQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetPipelinesQuery(baseOptions?: Apollo.QueryHookOptions<GetPipelinesQuery, GetPipelinesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPipelinesQuery, GetPipelinesQueryVariables>(GetPipelinesDocument, options);
      }
export function useGetPipelinesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPipelinesQuery, GetPipelinesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPipelinesQuery, GetPipelinesQueryVariables>(GetPipelinesDocument, options);
        }
export type GetPipelinesQueryHookResult = ReturnType<typeof useGetPipelinesQuery>;
export type GetPipelinesLazyQueryHookResult = ReturnType<typeof useGetPipelinesLazyQuery>;
export type GetPipelinesQueryResult = Apollo.QueryResult<GetPipelinesQuery, GetPipelinesQueryVariables>;
export const GetPipelineProgressDocument = gql`
    query GetPipelineProgress($where: PipelineProgressWhereInput, $orderBy: [PipelineProgressOrderByWithRelationInput!]) {
  findManyPipelineProgress(where: $where, orderBy: $orderBy) {
    id
    pipelineStageId
    progressableType
    progressableId
    amount
    closeDate
    pointOfContactId
    pointOfContact {
      id
      firstName
      lastName
    }
    probability
  }
}
    `;

/**
 * __useGetPipelineProgressQuery__
 *
 * To run a query within a React component, call `useGetPipelineProgressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPipelineProgressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPipelineProgressQuery({
 *   variables: {
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetPipelineProgressQuery(baseOptions?: Apollo.QueryHookOptions<GetPipelineProgressQuery, GetPipelineProgressQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPipelineProgressQuery, GetPipelineProgressQueryVariables>(GetPipelineProgressDocument, options);
      }
export function useGetPipelineProgressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPipelineProgressQuery, GetPipelineProgressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPipelineProgressQuery, GetPipelineProgressQueryVariables>(GetPipelineProgressDocument, options);
        }
export type GetPipelineProgressQueryHookResult = ReturnType<typeof useGetPipelineProgressQuery>;
export type GetPipelineProgressLazyQueryHookResult = ReturnType<typeof useGetPipelineProgressLazyQuery>;
export type GetPipelineProgressQueryResult = Apollo.QueryResult<GetPipelineProgressQuery, GetPipelineProgressQueryVariables>;
export const UpdateOnePipelineProgressDocument = gql`
    mutation UpdateOnePipelineProgress($id: String, $amount: Int, $closeDate: DateTime, $probability: Int, $pointOfContactId: String) {
  updateOnePipelineProgress(
    where: {id: $id}
    data: {amount: $amount, closeDate: $closeDate, probability: $probability, pointOfContact: {connect: {id: $pointOfContactId}}}
  ) {
    id
    amount
    closeDate
  }
}
    `;
export type UpdateOnePipelineProgressMutationFn = Apollo.MutationFunction<UpdateOnePipelineProgressMutation, UpdateOnePipelineProgressMutationVariables>;

/**
 * __useUpdateOnePipelineProgressMutation__
 *
 * To run a mutation, you first call `useUpdateOnePipelineProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOnePipelineProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOnePipelineProgressMutation, { data, loading, error }] = useUpdateOnePipelineProgressMutation({
 *   variables: {
 *      id: // value for 'id'
 *      amount: // value for 'amount'
 *      closeDate: // value for 'closeDate'
 *      probability: // value for 'probability'
 *      pointOfContactId: // value for 'pointOfContactId'
 *   },
 * });
 */
export function useUpdateOnePipelineProgressMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOnePipelineProgressMutation, UpdateOnePipelineProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOnePipelineProgressMutation, UpdateOnePipelineProgressMutationVariables>(UpdateOnePipelineProgressDocument, options);
      }
export type UpdateOnePipelineProgressMutationHookResult = ReturnType<typeof useUpdateOnePipelineProgressMutation>;
export type UpdateOnePipelineProgressMutationResult = Apollo.MutationResult<UpdateOnePipelineProgressMutation>;
export type UpdateOnePipelineProgressMutationOptions = Apollo.BaseMutationOptions<UpdateOnePipelineProgressMutation, UpdateOnePipelineProgressMutationVariables>;
export const UpdateOnePipelineProgressStageDocument = gql`
    mutation UpdateOnePipelineProgressStage($id: String, $pipelineStageId: String) {
  updateOnePipelineProgress(
    where: {id: $id}
    data: {pipelineStage: {connect: {id: $pipelineStageId}}}
  ) {
    id
  }
}
    `;
export type UpdateOnePipelineProgressStageMutationFn = Apollo.MutationFunction<UpdateOnePipelineProgressStageMutation, UpdateOnePipelineProgressStageMutationVariables>;

/**
 * __useUpdateOnePipelineProgressStageMutation__
 *
 * To run a mutation, you first call `useUpdateOnePipelineProgressStageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOnePipelineProgressStageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOnePipelineProgressStageMutation, { data, loading, error }] = useUpdateOnePipelineProgressStageMutation({
 *   variables: {
 *      id: // value for 'id'
 *      pipelineStageId: // value for 'pipelineStageId'
 *   },
 * });
 */
export function useUpdateOnePipelineProgressStageMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOnePipelineProgressStageMutation, UpdateOnePipelineProgressStageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOnePipelineProgressStageMutation, UpdateOnePipelineProgressStageMutationVariables>(UpdateOnePipelineProgressStageDocument, options);
      }
export type UpdateOnePipelineProgressStageMutationHookResult = ReturnType<typeof useUpdateOnePipelineProgressStageMutation>;
export type UpdateOnePipelineProgressStageMutationResult = Apollo.MutationResult<UpdateOnePipelineProgressStageMutation>;
export type UpdateOnePipelineProgressStageMutationOptions = Apollo.BaseMutationOptions<UpdateOnePipelineProgressStageMutation, UpdateOnePipelineProgressStageMutationVariables>;
export const CreateOnePipelineProgressDocument = gql`
    mutation CreateOnePipelineProgress($uuid: String!, $entityType: PipelineProgressableType!, $entityId: String!, $pipelineId: String!, $pipelineStageId: String!) {
  createOnePipelineProgress(
    data: {id: $uuid, progressableType: $entityType, progressableId: $entityId, pipeline: {connect: {id: $pipelineId}}, pipelineStage: {connect: {id: $pipelineStageId}}}
  ) {
    id
  }
}
    `;
export type CreateOnePipelineProgressMutationFn = Apollo.MutationFunction<CreateOnePipelineProgressMutation, CreateOnePipelineProgressMutationVariables>;

/**
 * __useCreateOnePipelineProgressMutation__
 *
 * To run a mutation, you first call `useCreateOnePipelineProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOnePipelineProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOnePipelineProgressMutation, { data, loading, error }] = useCreateOnePipelineProgressMutation({
 *   variables: {
 *      uuid: // value for 'uuid'
 *      entityType: // value for 'entityType'
 *      entityId: // value for 'entityId'
 *      pipelineId: // value for 'pipelineId'
 *      pipelineStageId: // value for 'pipelineStageId'
 *   },
 * });
 */
export function useCreateOnePipelineProgressMutation(baseOptions?: Apollo.MutationHookOptions<CreateOnePipelineProgressMutation, CreateOnePipelineProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOnePipelineProgressMutation, CreateOnePipelineProgressMutationVariables>(CreateOnePipelineProgressDocument, options);
      }
export type CreateOnePipelineProgressMutationHookResult = ReturnType<typeof useCreateOnePipelineProgressMutation>;
export type CreateOnePipelineProgressMutationResult = Apollo.MutationResult<CreateOnePipelineProgressMutation>;
export type CreateOnePipelineProgressMutationOptions = Apollo.BaseMutationOptions<CreateOnePipelineProgressMutation, CreateOnePipelineProgressMutationVariables>;
export const DeleteManyPipelineProgressDocument = gql`
    mutation DeleteManyPipelineProgress($ids: [String!]) {
  deleteManyPipelineProgress(where: {id: {in: $ids}}) {
    count
  }
}
    `;
export type DeleteManyPipelineProgressMutationFn = Apollo.MutationFunction<DeleteManyPipelineProgressMutation, DeleteManyPipelineProgressMutationVariables>;

/**
 * __useDeleteManyPipelineProgressMutation__
 *
 * To run a mutation, you first call `useDeleteManyPipelineProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteManyPipelineProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteManyPipelineProgressMutation, { data, loading, error }] = useDeleteManyPipelineProgressMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteManyPipelineProgressMutation(baseOptions?: Apollo.MutationHookOptions<DeleteManyPipelineProgressMutation, DeleteManyPipelineProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteManyPipelineProgressMutation, DeleteManyPipelineProgressMutationVariables>(DeleteManyPipelineProgressDocument, options);
      }
export type DeleteManyPipelineProgressMutationHookResult = ReturnType<typeof useDeleteManyPipelineProgressMutation>;
export type DeleteManyPipelineProgressMutationResult = Apollo.MutationResult<DeleteManyPipelineProgressMutation>;
export type DeleteManyPipelineProgressMutationOptions = Apollo.BaseMutationOptions<DeleteManyPipelineProgressMutation, DeleteManyPipelineProgressMutationVariables>;
export const UpdatePipelineStageDocument = gql`
    mutation UpdatePipelineStage($id: String, $name: String) {
  updateOnePipelineStage(where: {id: $id}, data: {name: $name}) {
    id
    name
  }
}
    `;
export type UpdatePipelineStageMutationFn = Apollo.MutationFunction<UpdatePipelineStageMutation, UpdatePipelineStageMutationVariables>;

/**
 * __useUpdatePipelineStageMutation__
 *
 * To run a mutation, you first call `useUpdatePipelineStageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePipelineStageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePipelineStageMutation, { data, loading, error }] = useUpdatePipelineStageMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdatePipelineStageMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePipelineStageMutation, UpdatePipelineStageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePipelineStageMutation, UpdatePipelineStageMutationVariables>(UpdatePipelineStageDocument, options);
      }
export type UpdatePipelineStageMutationHookResult = ReturnType<typeof useUpdatePipelineStageMutation>;
export type UpdatePipelineStageMutationResult = Apollo.MutationResult<UpdatePipelineStageMutation>;
export type UpdatePipelineStageMutationOptions = Apollo.BaseMutationOptions<UpdatePipelineStageMutation, UpdatePipelineStageMutationVariables>;
export const SearchPeopleDocument = gql`
    query SearchPeople($where: PersonWhereInput, $limit: Int, $orderBy: [PersonOrderByWithRelationInput!]) {
  searchResults: findManyPerson(where: $where, take: $limit, orderBy: $orderBy) {
    id
    phone
    email
    city
    firstName
    lastName
    createdAt
  }
}
    `;

/**
 * __useSearchPeopleQuery__
 *
 * To run a query within a React component, call `useSearchPeopleQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchPeopleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchPeopleQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useSearchPeopleQuery(baseOptions?: Apollo.QueryHookOptions<SearchPeopleQuery, SearchPeopleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchPeopleQuery, SearchPeopleQueryVariables>(SearchPeopleDocument, options);
      }
export function useSearchPeopleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchPeopleQuery, SearchPeopleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchPeopleQuery, SearchPeopleQueryVariables>(SearchPeopleDocument, options);
        }
export type SearchPeopleQueryHookResult = ReturnType<typeof useSearchPeopleQuery>;
export type SearchPeopleLazyQueryHookResult = ReturnType<typeof useSearchPeopleLazyQuery>;
export type SearchPeopleQueryResult = Apollo.QueryResult<SearchPeopleQuery, SearchPeopleQueryVariables>;
export const SearchUserDocument = gql`
    query SearchUser($where: UserWhereInput, $limit: Int, $orderBy: [UserOrderByWithRelationInput!]) {
  searchResults: findManyUser(where: $where, take: $limit, orderBy: $orderBy) {
    id
    email
    displayName
    firstName
    lastName
    avatarUrl
  }
}
    `;

/**
 * __useSearchUserQuery__
 *
 * To run a query within a React component, call `useSearchUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchUserQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useSearchUserQuery(baseOptions?: Apollo.QueryHookOptions<SearchUserQuery, SearchUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, options);
      }
export function useSearchUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchUserQuery, SearchUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, options);
        }
export type SearchUserQueryHookResult = ReturnType<typeof useSearchUserQuery>;
export type SearchUserLazyQueryHookResult = ReturnType<typeof useSearchUserLazyQuery>;
export type SearchUserQueryResult = Apollo.QueryResult<SearchUserQuery, SearchUserQueryVariables>;
export const EmptyQueryDocument = gql`
    query EmptyQuery {
  searchResults: findManyUser {
    id
  }
}
    `;

/**
 * __useEmptyQueryQuery__
 *
 * To run a query within a React component, call `useEmptyQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useEmptyQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEmptyQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useEmptyQueryQuery(baseOptions?: Apollo.QueryHookOptions<EmptyQueryQuery, EmptyQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EmptyQueryQuery, EmptyQueryQueryVariables>(EmptyQueryDocument, options);
      }
export function useEmptyQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EmptyQueryQuery, EmptyQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EmptyQueryQuery, EmptyQueryQueryVariables>(EmptyQueryDocument, options);
        }
export type EmptyQueryQueryHookResult = ReturnType<typeof useEmptyQueryQuery>;
export type EmptyQueryLazyQueryHookResult = ReturnType<typeof useEmptyQueryLazyQuery>;
export type EmptyQueryQueryResult = Apollo.QueryResult<EmptyQueryQuery, EmptyQueryQueryVariables>;
export const SearchCompanyDocument = gql`
    query SearchCompany($where: CompanyWhereInput, $limit: Int, $orderBy: [CompanyOrderByWithRelationInput!]) {
  searchResults: findManyCompany(where: $where, take: $limit, orderBy: $orderBy) {
    id
    name
    domainName
  }
}
    `;

/**
 * __useSearchCompanyQuery__
 *
 * To run a query within a React component, call `useSearchCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchCompanyQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useSearchCompanyQuery(baseOptions?: Apollo.QueryHookOptions<SearchCompanyQuery, SearchCompanyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchCompanyQuery, SearchCompanyQueryVariables>(SearchCompanyDocument, options);
      }
export function useSearchCompanyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchCompanyQuery, SearchCompanyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchCompanyQuery, SearchCompanyQueryVariables>(SearchCompanyDocument, options);
        }
export type SearchCompanyQueryHookResult = ReturnType<typeof useSearchCompanyQuery>;
export type SearchCompanyLazyQueryHookResult = ReturnType<typeof useSearchCompanyLazyQuery>;
export type SearchCompanyQueryResult = Apollo.QueryResult<SearchCompanyQuery, SearchCompanyQueryVariables>;
export const GetCurrentUserDocument = gql`
    query GetCurrentUser {
  currentUser {
    id
    email
    displayName
    firstName
    lastName
    avatarUrl
    workspaceMember {
      id
      workspace {
        id
        domainName
        displayName
        logo
        inviteHash
      }
    }
    settings {
      id
      locale
      colorScheme
    }
  }
}
    `;

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
export const GetUsersDocument = gql`
    query GetUsers {
  findManyUser {
    id
    email
    displayName
    firstName
    lastName
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($data: UserUpdateInput!, $where: UserWhereUniqueInput!) {
  updateUser(data: $data, where: $where) {
    id
    email
    displayName
    firstName
    lastName
    avatarUrl
    workspaceMember {
      id
      workspace {
        id
        domainName
        displayName
        logo
        inviteHash
      }
    }
    settings {
      id
      locale
      colorScheme
    }
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      data: // value for 'data'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
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
export const RemoveProfilePictureDocument = gql`
    mutation RemoveProfilePicture($where: UserWhereUniqueInput!) {
  updateUser(data: {avatarUrl: null}, where: $where) {
    id
    avatarUrl
  }
}
    `;
export type RemoveProfilePictureMutationFn = Apollo.MutationFunction<RemoveProfilePictureMutation, RemoveProfilePictureMutationVariables>;

/**
 * __useRemoveProfilePictureMutation__
 *
 * To run a mutation, you first call `useRemoveProfilePictureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveProfilePictureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeProfilePictureMutation, { data, loading, error }] = useRemoveProfilePictureMutation({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useRemoveProfilePictureMutation(baseOptions?: Apollo.MutationHookOptions<RemoveProfilePictureMutation, RemoveProfilePictureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveProfilePictureMutation, RemoveProfilePictureMutationVariables>(RemoveProfilePictureDocument, options);
      }
export type RemoveProfilePictureMutationHookResult = ReturnType<typeof useRemoveProfilePictureMutation>;
export type RemoveProfilePictureMutationResult = Apollo.MutationResult<RemoveProfilePictureMutation>;
export type RemoveProfilePictureMutationOptions = Apollo.BaseMutationOptions<RemoveProfilePictureMutation, RemoveProfilePictureMutationVariables>;
export const GetWorkspaceMembersDocument = gql`
    query GetWorkspaceMembers {
  workspaceMembers: findManyWorkspaceMember {
    id
    user {
      id
      email
      avatarUrl
      firstName
      lastName
    }
  }
}
    `;

/**
 * __useGetWorkspaceMembersQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceMembersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWorkspaceMembersQuery(baseOptions?: Apollo.QueryHookOptions<GetWorkspaceMembersQuery, GetWorkspaceMembersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceMembersQuery, GetWorkspaceMembersQueryVariables>(GetWorkspaceMembersDocument, options);
      }
export function useGetWorkspaceMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceMembersQuery, GetWorkspaceMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceMembersQuery, GetWorkspaceMembersQueryVariables>(GetWorkspaceMembersDocument, options);
        }
export type GetWorkspaceMembersQueryHookResult = ReturnType<typeof useGetWorkspaceMembersQuery>;
export type GetWorkspaceMembersLazyQueryHookResult = ReturnType<typeof useGetWorkspaceMembersLazyQuery>;
export type GetWorkspaceMembersQueryResult = Apollo.QueryResult<GetWorkspaceMembersQuery, GetWorkspaceMembersQueryVariables>;
export const UpdateWorkspaceDocument = gql`
    mutation UpdateWorkspace($data: WorkspaceUpdateInput!) {
  updateWorkspace(data: $data) {
    id
    domainName
    displayName
    logo
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
 *      data: // value for 'data'
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
export const RemoveWorkspaceLogoDocument = gql`
    mutation RemoveWorkspaceLogo {
  updateWorkspace(data: {logo: null}) {
    id
  }
}
    `;
export type RemoveWorkspaceLogoMutationFn = Apollo.MutationFunction<RemoveWorkspaceLogoMutation, RemoveWorkspaceLogoMutationVariables>;

/**
 * __useRemoveWorkspaceLogoMutation__
 *
 * To run a mutation, you first call `useRemoveWorkspaceLogoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveWorkspaceLogoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeWorkspaceLogoMutation, { data, loading, error }] = useRemoveWorkspaceLogoMutation({
 *   variables: {
 *   },
 * });
 */
export function useRemoveWorkspaceLogoMutation(baseOptions?: Apollo.MutationHookOptions<RemoveWorkspaceLogoMutation, RemoveWorkspaceLogoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveWorkspaceLogoMutation, RemoveWorkspaceLogoMutationVariables>(RemoveWorkspaceLogoDocument, options);
      }
export type RemoveWorkspaceLogoMutationHookResult = ReturnType<typeof useRemoveWorkspaceLogoMutation>;
export type RemoveWorkspaceLogoMutationResult = Apollo.MutationResult<RemoveWorkspaceLogoMutation>;
export type RemoveWorkspaceLogoMutationOptions = Apollo.BaseMutationOptions<RemoveWorkspaceLogoMutation, RemoveWorkspaceLogoMutationVariables>;
export const RemoveWorkspaceMemberDocument = gql`
    mutation RemoveWorkspaceMember($where: WorkspaceMemberWhereUniqueInput!) {
  deleteWorkspaceMember(where: $where) {
    id
  }
}
    `;
export type RemoveWorkspaceMemberMutationFn = Apollo.MutationFunction<RemoveWorkspaceMemberMutation, RemoveWorkspaceMemberMutationVariables>;

/**
 * __useRemoveWorkspaceMemberMutation__
 *
 * To run a mutation, you first call `useRemoveWorkspaceMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveWorkspaceMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeWorkspaceMemberMutation, { data, loading, error }] = useRemoveWorkspaceMemberMutation({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useRemoveWorkspaceMemberMutation(baseOptions?: Apollo.MutationHookOptions<RemoveWorkspaceMemberMutation, RemoveWorkspaceMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveWorkspaceMemberMutation, RemoveWorkspaceMemberMutationVariables>(RemoveWorkspaceMemberDocument, options);
      }
export type RemoveWorkspaceMemberMutationHookResult = ReturnType<typeof useRemoveWorkspaceMemberMutation>;
export type RemoveWorkspaceMemberMutationResult = Apollo.MutationResult<RemoveWorkspaceMemberMutation>;
export type RemoveWorkspaceMemberMutationOptions = Apollo.BaseMutationOptions<RemoveWorkspaceMemberMutation, RemoveWorkspaceMemberMutationVariables>;