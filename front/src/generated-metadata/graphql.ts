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
};

export type Activity = {
  __typename?: 'Activity';
  activityTargets?: Maybe<Array<ActivityTarget>>;
  assignee?: Maybe<User>;
  assigneeId?: Maybe<Scalars['String']['output']>;
  attachments?: Maybe<Array<Attachment>>;
  author: User;
  authorId: Scalars['String']['output'];
  body?: Maybe<Scalars['String']['output']>;
  comments?: Maybe<Array<Comment>>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dueAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  reminderAt?: Maybe<Scalars['DateTime']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type: ActivityType;
  updatedAt: Scalars['DateTime']['output'];
  workspaceMemberAssignee?: Maybe<WorkspaceMember>;
  workspaceMemberAssigneeId?: Maybe<Scalars['String']['output']>;
  workspaceMemberAuthor?: Maybe<WorkspaceMember>;
  workspaceMemberAuthorId?: Maybe<Scalars['String']['output']>;
};

export type ActivityTarget = {
  __typename?: 'ActivityTarget';
  activity: Activity;
  activityId: Scalars['String']['output'];
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  person?: Maybe<Person>;
  personId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export enum ActivityType {
  Note = 'Note',
  Task = 'Task'
}

export type ApiKey = {
  __typename?: 'ApiKey';
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Attachment = {
  __typename?: 'Attachment';
  activity?: Maybe<Activity>;
  activityId?: Maybe<Scalars['String']['output']>;
  author: User;
  authorId: Scalars['String']['output'];
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  fullPath: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  person?: Maybe<Person>;
  personId?: Maybe<Scalars['String']['output']>;
  type: AttachmentType;
  updatedAt: Scalars['DateTime']['output'];
  workspace: Workspace;
  workspaceMemberAuthor?: Maybe<WorkspaceMember>;
  workspaceMemberAuthorId?: Maybe<Scalars['String']['output']>;
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

export type AuthProviders = {
  __typename?: 'AuthProviders';
  google: Scalars['Boolean']['output'];
  magicLink: Scalars['Boolean']['output'];
  password: Scalars['Boolean']['output'];
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

export enum ColorScheme {
  Dark = 'Dark',
  Light = 'Light',
  System = 'System'
}

export type Comment = {
  __typename?: 'Comment';
  activity?: Maybe<Activity>;
  activityId?: Maybe<Scalars['String']['output']>;
  author: User;
  authorId: Scalars['String']['output'];
  body: Scalars['String']['output'];
  commentThreadId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workspaceMemberAuthor?: Maybe<WorkspaceMember>;
  workspaceMemberAuthorId?: Maybe<Scalars['String']['output']>;
};

export type Company = {
  __typename?: 'Company';
  ActivityTarget?: Maybe<Array<ActivityTarget>>;
  Attachment?: Maybe<Array<Attachment>>;
  Favorite?: Maybe<Array<Favorite>>;
  PipelineProgress?: Maybe<Array<PipelineProgress>>;
  accountOwner?: Maybe<User>;
  accountOwnerId?: Maybe<Scalars['String']['output']>;
  address: Scalars['String']['output'];
  annualRecurringRevenue?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domainName: Scalars['String']['output'];
  employees?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  idealCustomerProfile: Scalars['Boolean']['output'];
  linkedinUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  people?: Maybe<Array<Person>>;
  updatedAt: Scalars['DateTime']['output'];
  workspaceMemberAccountOwner?: Maybe<WorkspaceMember>;
  workspaceMemberAccountOwnerId?: Maybe<Scalars['String']['output']>;
  xUrl?: Maybe<Scalars['String']['output']>;
};

export type CreateFieldInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  name: Scalars['String']['input'];
  objectMetadataId: Scalars['String']['input'];
  type: FieldMetadataType;
};

export type CreateObjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  labelPlural: Scalars['String']['input'];
  labelSingular: Scalars['String']['input'];
  namePlural: Scalars['String']['input'];
  nameSingular: Scalars['String']['input'];
};

export type CreateOneFieldInput = {
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
  fromIcon?: InputMaybe<Scalars['String']['input']>;
  fromLabel: Scalars['String']['input'];
  fromName: Scalars['String']['input'];
  fromObjectMetadataId: Scalars['String']['input'];
  relationType: Scalars['String']['input'];
  toIcon?: InputMaybe<Scalars['String']['input']>;
  toLabel: Scalars['String']['input'];
  toName: Scalars['String']['input'];
  toObjectMetadataId: Scalars['String']['input'];
};

export enum Currency {
  Aed = 'AED',
  Afn = 'AFN',
  All = 'ALL',
  Amd = 'AMD',
  Ang = 'ANG',
  Aoa = 'AOA',
  Ars = 'ARS',
  Aud = 'AUD',
  Awg = 'AWG',
  Azn = 'AZN',
  Bam = 'BAM',
  Bbd = 'BBD',
  Bdt = 'BDT',
  Bgn = 'BGN',
  Bhd = 'BHD',
  Bif = 'BIF',
  Bmd = 'BMD',
  Bnd = 'BND',
  Bob = 'BOB',
  Bov = 'BOV',
  Brl = 'BRL',
  Bsd = 'BSD',
  Btn = 'BTN',
  Bwp = 'BWP',
  Byn = 'BYN',
  Bzd = 'BZD',
  Cad = 'CAD',
  Cdf = 'CDF',
  Chf = 'CHF',
  Clf = 'CLF',
  Clp = 'CLP',
  Cny = 'CNY',
  Cop = 'COP',
  Cou = 'COU',
  Crc = 'CRC',
  Cuc = 'CUC',
  Cup = 'CUP',
  Cve = 'CVE',
  Czk = 'CZK',
  Djf = 'DJF',
  Dkk = 'DKK',
  Dop = 'DOP',
  Dzd = 'DZD',
  Egp = 'EGP',
  Ern = 'ERN',
  Etb = 'ETB',
  Eur = 'EUR',
  Fjd = 'FJD',
  Fkp = 'FKP',
  Gbp = 'GBP',
  Gel = 'GEL',
  Ghs = 'GHS',
  Gip = 'GIP',
  Gmd = 'GMD',
  Gnf = 'GNF',
  Gtq = 'GTQ',
  Gyd = 'GYD',
  Hkd = 'HKD',
  Hnl = 'HNL',
  Hrk = 'HRK',
  Htg = 'HTG',
  Huf = 'HUF',
  Idr = 'IDR',
  Ils = 'ILS',
  Inr = 'INR',
  Iqd = 'IQD',
  Irr = 'IRR',
  Isk = 'ISK',
  Jmd = 'JMD',
  Jod = 'JOD',
  Jpy = 'JPY',
  Kes = 'KES',
  Kgs = 'KGS',
  Khr = 'KHR',
  Kmf = 'KMF',
  Kpw = 'KPW',
  Krw = 'KRW',
  Kwd = 'KWD',
  Kyd = 'KYD',
  Kzt = 'KZT',
  Lak = 'LAK',
  Lbp = 'LBP',
  Lkr = 'LKR',
  Lrd = 'LRD',
  Lsl = 'LSL',
  Lyd = 'LYD',
  Mad = 'MAD',
  Mdl = 'MDL',
  Mga = 'MGA',
  Mkd = 'MKD',
  Mmk = 'MMK',
  Mnt = 'MNT',
  Mop = 'MOP',
  Mro = 'MRO',
  Mru = 'MRU',
  Mur = 'MUR',
  Mvr = 'MVR',
  Mwk = 'MWK',
  Mxn = 'MXN',
  Mxv = 'MXV',
  Myr = 'MYR',
  Mzn = 'MZN',
  Nad = 'NAD',
  Ngn = 'NGN',
  Nio = 'NIO',
  Nok = 'NOK',
  Npr = 'NPR',
  Nzd = 'NZD',
  Omr = 'OMR',
  Pab = 'PAB',
  Pen = 'PEN',
  Pgk = 'PGK',
  Php = 'PHP',
  Pkr = 'PKR',
  Pln = 'PLN',
  Pyg = 'PYG',
  Qar = 'QAR',
  Ron = 'RON',
  Rsd = 'RSD',
  Rub = 'RUB',
  Rwf = 'RWF',
  Sar = 'SAR',
  Sbd = 'SBD',
  Scr = 'SCR',
  Sdd = 'SDD',
  Sdg = 'SDG',
  Sek = 'SEK',
  Sgd = 'SGD',
  Shp = 'SHP',
  Sll = 'SLL',
  Sos = 'SOS',
  Srd = 'SRD',
  Ssp = 'SSP',
  Std = 'STD',
  Stn = 'STN',
  Svc = 'SVC',
  Syp = 'SYP',
  Szl = 'SZL',
  Thb = 'THB',
  Tjs = 'TJS',
  Tmm = 'TMM',
  Tmt = 'TMT',
  Tnd = 'TND',
  Top = 'TOP',
  Try = 'TRY',
  Ttd = 'TTD',
  Twd = 'TWD',
  Tzs = 'TZS',
  Uah = 'UAH',
  Ugx = 'UGX',
  Usd = 'USD',
  Uyu = 'UYU',
  Uzs = 'UZS',
  Vef = 'VEF',
  Ves = 'VES',
  Vnd = 'VND',
  Vuv = 'VUV',
  Wst = 'WST',
  Xaf = 'XAF',
  Xcd = 'XCD',
  Xof = 'XOF',
  Xpf = 'XPF',
  Xsu = 'XSU',
  Xua = 'XUA',
  Yer = 'YER',
  Zar = 'ZAR',
  Zmw = 'ZMW',
  Zwl = 'ZWL'
}

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
  /** The id of the record to delete. */
  id: Scalars['ID']['input'];
};

export type DeleteOneObjectInput = {
  /** The id of the record to delete. */
  id: Scalars['ID']['input'];
};

export type Favorite = {
  __typename?: 'Favorite';
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  person?: Maybe<Person>;
  personId?: Maybe<Scalars['String']['output']>;
  position: Scalars['Float']['output'];
  workspaceId?: Maybe<Scalars['String']['output']>;
  workspaceMember?: Maybe<WorkspaceMember>;
  workspaceMemberId?: Maybe<Scalars['String']['output']>;
};

export type FieldConnection = {
  __typename?: 'FieldConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int']['output'];
};

export type FieldDeleteResponse = {
  __typename?: 'FieldDeleteResponse';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  isNullable?: Maybe<Scalars['Boolean']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use label name instead */
  placeholder?: Maybe<Scalars['String']['output']>;
  type?: Maybe<FieldMetadataType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Type of the field */
export enum FieldMetadataType {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Email = 'EMAIL',
  Enum = 'ENUM',
  Probability = 'PROBABILITY',
  Money = 'MONEY',
  Number = 'NUMBER',
  Phone = 'PHONE',
  Relation = 'RELATION',
  Text = 'TEXT',
  Url = 'URL',
  Uuid = 'UUID'
}

export type Mutation = {
  __typename?: 'Mutation';
  createOneField: Field;
  createOneObject: Object;
  createOneRelation: Relation;
  deleteOneField: FieldDeleteResponse;
  deleteOneObject: ObjectDeleteResponse;
  updateOneField: Field;
  updateOneObject: Object;
};


export type MutationCreateOneFieldArgs = {
  input: CreateOneFieldInput;
};


export type MutationCreateOneObjectArgs = {
  input: CreateOneObjectInput;
};


export type MutationCreateOneRelationArgs = {
  input: CreateOneRelationInput;
};


export type MutationDeleteOneFieldArgs = {
  input: DeleteOneFieldInput;
};


export type MutationDeleteOneObjectArgs = {
  input: DeleteOneObjectInput;
};


export type MutationUpdateOneFieldArgs = {
  input: UpdateOneFieldInput;
};


export type MutationUpdateOneObjectArgs = {
  input: UpdateOneObjectInput;
};

export type ObjectConnection = {
  __typename?: 'ObjectConnection';
  /** Array of edges. */
  edges: Array<ObjectEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int']['output'];
};

export type ObjectDeleteResponse = {
  __typename?: 'ObjectDeleteResponse';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  dataSourceId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  labelPlural?: Maybe<Scalars['String']['output']>;
  labelSingular?: Maybe<Scalars['String']['output']>;
  namePlural?: Maybe<Scalars['String']['output']>;
  nameSingular?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ObjectFieldsConnection = {
  __typename?: 'ObjectFieldsConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int']['output'];
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

export type Person = {
  __typename?: 'Person';
  ActivityTarget?: Maybe<Array<ActivityTarget>>;
  Attachment?: Maybe<Array<Attachment>>;
  Favorite?: Maybe<Array<Favorite>>;
  PipelineProgress?: Maybe<Array<PipelineProgress>>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['String']['output']>;
  contactPipelineProgresses?: Maybe<Array<PipelineProgress>>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jobTitle?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  linkedinUrl?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  xUrl?: Maybe<Scalars['String']['output']>;
};

export type Pipeline = {
  __typename?: 'Pipeline';
  createdAt: Scalars['DateTime']['output'];
  currency: Currency;
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  pipelineProgressableType: PipelineProgressableType;
  pipelineProgresses?: Maybe<Array<PipelineProgress>>;
  pipelineStages?: Maybe<Array<PipelineStage>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PipelineProgress = {
  __typename?: 'PipelineProgress';
  amount?: Maybe<Scalars['Int']['output']>;
  closeDate?: Maybe<Scalars['DateTime']['output']>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  person?: Maybe<Person>;
  personId?: Maybe<Scalars['String']['output']>;
  pipeline: Pipeline;
  pipelineId: Scalars['String']['output'];
  pipelineStage: PipelineStage;
  pipelineStageId: Scalars['String']['output'];
  pointOfContact?: Maybe<Person>;
  pointOfContactId?: Maybe<Scalars['String']['output']>;
  probability?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export enum PipelineProgressableType {
  Company = 'Company',
  Person = 'Person'
}

export type PipelineStage = {
  __typename?: 'PipelineStage';
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  pipeline: Pipeline;
  pipelineId: Scalars['String']['output'];
  pipelineProgresses?: Maybe<Array<PipelineProgress>>;
  position?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Query = {
  __typename?: 'Query';
  field: Field;
  fields: FieldConnection;
  object: Object;
  objects: ObjectConnection;
  relation: Relation;
  relations: RelationConnection;
};


export type QueryFieldArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFieldsArgs = {
  paging?: CursorPaging;
};


export type QueryObjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryObjectsArgs = {
  paging?: CursorPaging;
};


export type QueryRelationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRelationsArgs = {
  paging?: CursorPaging;
};

export type RelationConnection = {
  __typename?: 'RelationConnection';
  /** Array of edges. */
  edges: Array<RelationEdge>;
  /** Paging information */
  pageInfo: PageInfo;
  /** Fetch total count of records */
  totalCount: Scalars['Int']['output'];
};

export type Support = {
  __typename?: 'Support';
  supportDriver: Scalars['String']['output'];
  supportFrontChatId?: Maybe<Scalars['String']['output']>;
};

export type Telemetry = {
  __typename?: 'Telemetry';
  anonymizationEnabled: Scalars['Boolean']['output'];
  enabled: Scalars['Boolean']['output'];
};

export type UpdateFieldInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateObjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  labelPlural?: InputMaybe<Scalars['String']['input']>;
  labelSingular?: InputMaybe<Scalars['String']['input']>;
  namePlural?: InputMaybe<Scalars['String']['input']>;
  nameSingular?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOneFieldInput = {
  /** The id of the record to update */
  id: Scalars['ID']['input'];
  /** The update to apply. */
  update: UpdateFieldInput;
};

export type UpdateOneObjectInput = {
  /** The id of the record to update */
  id: Scalars['ID']['input'];
  /** The update to apply. */
  update: UpdateObjectInput;
};

export type User = {
  __typename?: 'User';
  assignedActivities?: Maybe<Array<Activity>>;
  authoredActivities?: Maybe<Array<Activity>>;
  authoredAttachments?: Maybe<Array<Attachment>>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  canImpersonate: Scalars['Boolean']['output'];
  comments?: Maybe<Array<Comment>>;
  companies?: Maybe<Array<Company>>;
  createdAt: Scalars['DateTime']['output'];
  disabled: Scalars['Boolean']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  lastSeen?: Maybe<Scalars['DateTime']['output']>;
  locale: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  settings: UserSettings;
  settingsId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workspaceMember?: Maybe<WorkspaceMember>;
};

export type UserSettings = {
  __typename?: 'UserSettings';
  WorkspaceMember?: Maybe<Array<WorkspaceMember>>;
  colorScheme: ColorScheme;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  locale: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
};

export type WebHook = {
  __typename?: 'WebHook';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  operation: Scalars['String']['output'];
  targetUrl: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Workspace = {
  __typename?: 'Workspace';
  Attachment?: Maybe<Array<Attachment>>;
  activities?: Maybe<Array<Activity>>;
  activityTargets?: Maybe<Array<ActivityTarget>>;
  apiKeys?: Maybe<Array<ApiKey>>;
  comments?: Maybe<Array<Comment>>;
  companies?: Maybe<Array<Company>>;
  createdAt: Scalars['DateTime']['output'];
  displayName?: Maybe<Scalars['String']['output']>;
  domainName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inviteHash?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  people?: Maybe<Array<Person>>;
  pipelineProgresses?: Maybe<Array<PipelineProgress>>;
  pipelineStages?: Maybe<Array<PipelineStage>>;
  pipelines?: Maybe<Array<Pipeline>>;
  updatedAt: Scalars['DateTime']['output'];
  webHooks?: Maybe<Array<WebHook>>;
  workspaceMember?: Maybe<Array<WorkspaceMember>>;
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  Favorite?: Maybe<Array<Favorite>>;
  allowImpersonation: Scalars['Boolean']['output'];
  assignedActivities?: Maybe<Array<Activity>>;
  authoredActivities?: Maybe<Array<Activity>>;
  authoredAttachments?: Maybe<Array<Attachment>>;
  comments?: Maybe<Array<Comment>>;
  companies?: Maybe<Array<Company>>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  settings?: Maybe<UserSettings>;
  settingsId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['String']['output'];
  workspace: Workspace;
};

export type Field = {
  __typename?: 'field';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fromRelationMetadata?: Maybe<Relation>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isCustom: Scalars['Boolean']['output'];
  isNullable: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** @deprecated Use label name instead */
  placeholder?: Maybe<Scalars['String']['output']>;
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

export type Object = {
  __typename?: 'object';
  createdAt: Scalars['DateTime']['output'];
  dataSourceId: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fields: ObjectFieldsConnection;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isCustom: Scalars['Boolean']['output'];
  labelPlural: Scalars['String']['output'];
  labelSingular: Scalars['String']['output'];
  namePlural: Scalars['String']['output'];
  nameSingular: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};


export type ObjectFieldsArgs = {
  paging?: CursorPaging;
};

export type ObjectEdge = {
  __typename?: 'objectEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the object */
  node: Object;
};

export type Relation = {
  __typename?: 'relation';
  createdAt: Scalars['DateTime']['output'];
  fromFieldMetadataId: Scalars['String']['output'];
  fromObjectMetadata: Object;
  fromObjectMetadataId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  relationType: Scalars['String']['output'];
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

export type CreateOneObjectMetadataItemMutationVariables = Exact<{
  input: CreateOneObjectInput;
}>;


export type CreateOneObjectMetadataItemMutation = { __typename?: 'Mutation', createOneObject: { __typename?: 'object', id: string, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, createdAt: any, updatedAt: any } };

export type CreateOneFieldMetadataItemMutationVariables = Exact<{
  input: CreateOneFieldInput;
}>;


export type CreateOneFieldMetadataItemMutation = { __typename?: 'Mutation', createOneField: { __typename?: 'field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, placeholder?: string | null, isCustom: boolean, isActive: boolean, isNullable: boolean, createdAt: any, updatedAt: any } };

export type UpdateOneFieldMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['ID']['input'];
  updatePayload: UpdateFieldInput;
}>;


export type UpdateOneFieldMetadataItemMutation = { __typename?: 'Mutation', updateOneField: { __typename?: 'field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, placeholder?: string | null, isCustom: boolean, isActive: boolean, isNullable: boolean, createdAt: any, updatedAt: any } };

export type UpdateOneObjectMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['ID']['input'];
  updatePayload: UpdateObjectInput;
}>;


export type UpdateOneObjectMetadataItemMutation = { __typename?: 'Mutation', updateOneObject: { __typename?: 'object', id: string, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, createdAt: any, updatedAt: any } };

export type DeleteOneObjectMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['ID']['input'];
}>;


export type DeleteOneObjectMetadataItemMutation = { __typename?: 'Mutation', deleteOneObject: { __typename?: 'ObjectDeleteResponse', id?: string | null, dataSourceId?: string | null, nameSingular?: string | null, namePlural?: string | null, labelSingular?: string | null, labelPlural?: string | null, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, createdAt?: any | null, updatedAt?: any | null } };

export type DeleteOneFieldMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['ID']['input'];
}>;


export type DeleteOneFieldMetadataItemMutation = { __typename?: 'Mutation', deleteOneField: { __typename?: 'FieldDeleteResponse', id?: string | null, type?: FieldMetadataType | null, name?: string | null, label?: string | null, description?: string | null, icon?: string | null, placeholder?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt?: any | null, updatedAt?: any | null } };

export type ObjectMetadataItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type ObjectMetadataItemsQuery = { __typename?: 'Query', objects: { __typename?: 'ObjectConnection', totalCount: number, edges: Array<{ __typename?: 'objectEdge', node: { __typename?: 'object', id: string, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, createdAt: any, updatedAt: any, fields: { __typename?: 'ObjectFieldsConnection', totalCount: number, edges: Array<{ __typename?: 'fieldEdge', node: { __typename?: 'field', id: string, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, placeholder?: string | null, isCustom: boolean, isActive: boolean, isNullable: boolean, createdAt: any, updatedAt: any, fromRelationMetadata?: { __typename?: 'relation', id: string, relationType: string } | null, toRelationMetadata?: { __typename?: 'relation', id: string, relationType: string } | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: any | null, endCursor?: any | null } } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: any | null, endCursor?: any | null } } };


export const CreateOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneObjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateOneObjectMetadataItemMutation, CreateOneObjectMetadataItemMutationVariables>;
export const CreateOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateOneFieldMetadataItemMutation, CreateOneFieldMetadataItemMutationVariables>;
export const UpdateOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"update"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateOneFieldMetadataItemMutation, UpdateOneFieldMetadataItemMutationVariables>;
export const UpdateOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateObjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"update"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateOneObjectMetadataItemMutation, UpdateOneObjectMetadataItemMutationVariables>;
export const DeleteOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<DeleteOneObjectMetadataItemMutation, DeleteOneObjectMetadataItemMutationVariables>;
export const DeleteOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<DeleteOneFieldMetadataItemMutation, DeleteOneFieldMetadataItemMutationVariables>;
export const ObjectMetadataItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ObjectMetadataItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"placeholder"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"fromRelationMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"relationType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"toRelationMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"relationType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>;