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
  DateTime: any;
  JSON: any;
};

export type AffectedRows = {
  __typename?: 'AffectedRows';
  count: Scalars['Int'];
};

export type BoolFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['Boolean']>;
};

export type BoolFilter = {
  equals?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<NestedBoolFilter>;
};

export type Company = {
  __typename?: 'Company';
  _count: CompanyCount;
  accountOwner?: Maybe<User>;
  accountOwnerId?: Maybe<Scalars['String']>;
  address: Scalars['String'];
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  domainName: Scalars['String'];
  employees?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  people?: Maybe<Array<Person>>;
  updatedAt: Scalars['DateTime'];
  workspace: Workspace;
  workspaceId: Scalars['String'];
};

export type CompanyCount = {
  __typename?: 'CompanyCount';
  people: Scalars['Int'];
};

export type CompanyCreateInput = {
  accountOwner?: InputMaybe<UserCreateNestedOneWithoutCompaniesInput>;
  address: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  domainName: Scalars['String'];
  employees?: InputMaybe<Scalars['Int']>;
  id: Scalars['String'];
  name: Scalars['String'];
  people?: InputMaybe<PersonCreateNestedManyWithoutCompanyInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CompanyCreateManyWorkspaceInput = {
  accountOwnerId?: InputMaybe<Scalars['String']>;
  address: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  domainName: Scalars['String'];
  employees?: InputMaybe<Scalars['Int']>;
  id: Scalars['String'];
  name: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CompanyCreateManyWorkspaceInputEnvelope = {
  data: Array<CompanyCreateManyWorkspaceInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type CompanyCreateNestedManyWithoutWorkspaceInput = {
  connect?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CompanyCreateOrConnectWithoutWorkspaceInput>>;
  create?: InputMaybe<Array<CompanyCreateWithoutWorkspaceInput>>;
  createMany?: InputMaybe<CompanyCreateManyWorkspaceInputEnvelope>;
};

export type CompanyCreateNestedOneWithoutPeopleInput = {
  connect?: InputMaybe<CompanyWhereUniqueInput>;
  connectOrCreate?: InputMaybe<CompanyCreateOrConnectWithoutPeopleInput>;
  create?: InputMaybe<CompanyCreateWithoutPeopleInput>;
};

export type CompanyCreateOrConnectWithoutPeopleInput = {
  create: CompanyCreateWithoutPeopleInput;
  where: CompanyWhereUniqueInput;
};

export type CompanyCreateOrConnectWithoutWorkspaceInput = {
  create: CompanyCreateWithoutWorkspaceInput;
  where: CompanyWhereUniqueInput;
};

export type CompanyCreateWithoutPeopleInput = {
  accountOwner?: InputMaybe<UserCreateNestedOneWithoutCompaniesInput>;
  address: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  domainName: Scalars['String'];
  employees?: InputMaybe<Scalars['Int']>;
  id: Scalars['String'];
  name: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CompanyCreateWithoutWorkspaceInput = {
  accountOwner?: InputMaybe<UserCreateNestedOneWithoutCompaniesInput>;
  address: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  domainName: Scalars['String'];
  employees?: InputMaybe<Scalars['Int']>;
  id: Scalars['String'];
  name: Scalars['String'];
  people?: InputMaybe<PersonCreateNestedManyWithoutCompanyInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
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
  deletedAt?: InputMaybe<SortOrder>;
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

export type CompanyScalarWhereInput = {
  AND?: InputMaybe<Array<CompanyScalarWhereInput>>;
  NOT?: InputMaybe<Array<CompanyScalarWhereInput>>;
  OR?: InputMaybe<Array<CompanyScalarWhereInput>>;
  accountOwnerId?: InputMaybe<StringNullableFilter>;
  address?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
  domainName?: InputMaybe<StringFilter>;
  employees?: InputMaybe<IntNullableFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CompanyUpdateInput = {
  accountOwner?: InputMaybe<UserUpdateOneWithoutCompaniesNestedInput>;
  address?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  domainName?: InputMaybe<StringFieldUpdateOperationsInput>;
  employees?: InputMaybe<NullableIntFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  people?: InputMaybe<PersonUpdateManyWithoutCompanyNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CompanyUpdateManyMutationInput = {
  address?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  domainName?: InputMaybe<StringFieldUpdateOperationsInput>;
  employees?: InputMaybe<NullableIntFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CompanyUpdateManyWithWhereWithoutWorkspaceInput = {
  data: CompanyUpdateManyMutationInput;
  where: CompanyScalarWhereInput;
};

export type CompanyUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CompanyCreateOrConnectWithoutWorkspaceInput>>;
  create?: InputMaybe<Array<CompanyCreateWithoutWorkspaceInput>>;
  createMany?: InputMaybe<CompanyCreateManyWorkspaceInputEnvelope>;
  delete?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<CompanyScalarWhereInput>>;
  disconnect?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  set?: InputMaybe<Array<CompanyWhereUniqueInput>>;
  update?: InputMaybe<Array<CompanyUpdateWithWhereUniqueWithoutWorkspaceInput>>;
  updateMany?: InputMaybe<Array<CompanyUpdateManyWithWhereWithoutWorkspaceInput>>;
  upsert?: InputMaybe<Array<CompanyUpsertWithWhereUniqueWithoutWorkspaceInput>>;
};

export type CompanyUpdateOneWithoutPeopleNestedInput = {
  connect?: InputMaybe<CompanyWhereUniqueInput>;
  connectOrCreate?: InputMaybe<CompanyCreateOrConnectWithoutPeopleInput>;
  create?: InputMaybe<CompanyCreateWithoutPeopleInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<CompanyUpdateWithoutPeopleInput>;
  upsert?: InputMaybe<CompanyUpsertWithoutPeopleInput>;
};

export type CompanyUpdateWithWhereUniqueWithoutWorkspaceInput = {
  data: CompanyUpdateWithoutWorkspaceInput;
  where: CompanyWhereUniqueInput;
};

export type CompanyUpdateWithoutPeopleInput = {
  accountOwner?: InputMaybe<UserUpdateOneWithoutCompaniesNestedInput>;
  address?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  domainName?: InputMaybe<StringFieldUpdateOperationsInput>;
  employees?: InputMaybe<NullableIntFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CompanyUpdateWithoutWorkspaceInput = {
  accountOwner?: InputMaybe<UserUpdateOneWithoutCompaniesNestedInput>;
  address?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  domainName?: InputMaybe<StringFieldUpdateOperationsInput>;
  employees?: InputMaybe<NullableIntFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  people?: InputMaybe<PersonUpdateManyWithoutCompanyNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CompanyUpsertWithWhereUniqueWithoutWorkspaceInput = {
  create: CompanyCreateWithoutWorkspaceInput;
  update: CompanyUpdateWithoutWorkspaceInput;
  where: CompanyWhereUniqueInput;
};

export type CompanyUpsertWithoutPeopleInput = {
  create: CompanyCreateWithoutPeopleInput;
  update: CompanyUpdateWithoutPeopleInput;
};

export type CompanyWhereInput = {
  AND?: InputMaybe<Array<CompanyWhereInput>>;
  NOT?: InputMaybe<Array<CompanyWhereInput>>;
  OR?: InputMaybe<Array<CompanyWhereInput>>;
  accountOwner?: InputMaybe<UserRelationFilter>;
  accountOwnerId?: InputMaybe<StringNullableFilter>;
  address?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
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

export type DateTimeFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['DateTime']>;
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

export type Mutation = {
  __typename?: 'Mutation';
  createOneCompany: Company;
  createOnePerson: Person;
  deleteManyCompany: AffectedRows;
  deleteManyPerson: AffectedRows;
  deleteOneCompany?: Maybe<Company>;
  updateOneCompany?: Maybe<Company>;
  updateOnePerson?: Maybe<Person>;
};


export type MutationCreateOneCompanyArgs = {
  data: CompanyCreateInput;
};


export type MutationCreateOnePersonArgs = {
  data: PersonCreateInput;
};


export type MutationDeleteManyCompanyArgs = {
  where?: InputMaybe<CompanyWhereInput>;
};


export type MutationDeleteManyPersonArgs = {
  where?: InputMaybe<PersonWhereInput>;
};


export type MutationDeleteOneCompanyArgs = {
  where: CompanyWhereUniqueInput;
};


export type MutationUpdateOneCompanyArgs = {
  data: CompanyUpdateInput;
  where: CompanyWhereUniqueInput;
};


export type MutationUpdateOnePersonArgs = {
  data: PersonUpdateInput;
  where: PersonWhereUniqueInput;
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

export type NullableDateTimeFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['DateTime']>;
};

export type NullableIntFieldUpdateOperationsInput = {
  decrement?: InputMaybe<Scalars['Int']>;
  divide?: InputMaybe<Scalars['Int']>;
  increment?: InputMaybe<Scalars['Int']>;
  multiply?: InputMaybe<Scalars['Int']>;
  set?: InputMaybe<Scalars['Int']>;
};

export type NullableStringFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['String']>;
};

export type Person = {
  __typename?: 'Person';
  city: Scalars['String'];
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  email: Scalars['String'];
  firstname: Scalars['String'];
  id: Scalars['ID'];
  lastname: Scalars['String'];
  phone: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  workspace: Workspace;
  workspaceId: Scalars['String'];
};

export type PersonCreateInput = {
  city: Scalars['String'];
  company?: InputMaybe<CompanyCreateNestedOneWithoutPeopleInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  email: Scalars['String'];
  firstname: Scalars['String'];
  id: Scalars['String'];
  lastname: Scalars['String'];
  phone: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PersonCreateManyCompanyInput = {
  city: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  email: Scalars['String'];
  firstname: Scalars['String'];
  id: Scalars['String'];
  lastname: Scalars['String'];
  phone: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PersonCreateManyCompanyInputEnvelope = {
  data: Array<PersonCreateManyCompanyInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type PersonCreateManyWorkspaceInput = {
  city: Scalars['String'];
  companyId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  email: Scalars['String'];
  firstname: Scalars['String'];
  id: Scalars['String'];
  lastname: Scalars['String'];
  phone: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PersonCreateManyWorkspaceInputEnvelope = {
  data: Array<PersonCreateManyWorkspaceInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type PersonCreateNestedManyWithoutCompanyInput = {
  connect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<PersonCreateOrConnectWithoutCompanyInput>>;
  create?: InputMaybe<Array<PersonCreateWithoutCompanyInput>>;
  createMany?: InputMaybe<PersonCreateManyCompanyInputEnvelope>;
};

export type PersonCreateNestedManyWithoutWorkspaceInput = {
  connect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<PersonCreateOrConnectWithoutWorkspaceInput>>;
  create?: InputMaybe<Array<PersonCreateWithoutWorkspaceInput>>;
  createMany?: InputMaybe<PersonCreateManyWorkspaceInputEnvelope>;
};

export type PersonCreateOrConnectWithoutCompanyInput = {
  create: PersonCreateWithoutCompanyInput;
  where: PersonWhereUniqueInput;
};

export type PersonCreateOrConnectWithoutWorkspaceInput = {
  create: PersonCreateWithoutWorkspaceInput;
  where: PersonWhereUniqueInput;
};

export type PersonCreateWithoutCompanyInput = {
  city: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  email: Scalars['String'];
  firstname: Scalars['String'];
  id: Scalars['String'];
  lastname: Scalars['String'];
  phone: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type PersonCreateWithoutWorkspaceInput = {
  city: Scalars['String'];
  company?: InputMaybe<CompanyCreateNestedOneWithoutPeopleInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  email: Scalars['String'];
  firstname: Scalars['String'];
  id: Scalars['String'];
  lastname: Scalars['String'];
  phone: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
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
  city?: InputMaybe<SortOrder>;
  company?: InputMaybe<CompanyOrderByWithRelationInput>;
  companyId?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  deletedAt?: InputMaybe<SortOrder>;
  email?: InputMaybe<SortOrder>;
  firstname?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  lastname?: InputMaybe<SortOrder>;
  phone?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export enum PersonScalarFieldEnum {
  City = 'city',
  CompanyId = 'companyId',
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  Email = 'email',
  Firstname = 'firstname',
  Id = 'id',
  Lastname = 'lastname',
  Phone = 'phone',
  UpdatedAt = 'updatedAt',
  WorkspaceId = 'workspaceId'
}

export type PersonScalarWhereInput = {
  AND?: InputMaybe<Array<PersonScalarWhereInput>>;
  NOT?: InputMaybe<Array<PersonScalarWhereInput>>;
  OR?: InputMaybe<Array<PersonScalarWhereInput>>;
  city?: InputMaybe<StringFilter>;
  companyId?: InputMaybe<StringNullableFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
  email?: InputMaybe<StringFilter>;
  firstname?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  lastname?: InputMaybe<StringFilter>;
  phone?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type PersonUpdateInput = {
  city?: InputMaybe<StringFieldUpdateOperationsInput>;
  company?: InputMaybe<CompanyUpdateOneWithoutPeopleNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  email?: InputMaybe<StringFieldUpdateOperationsInput>;
  firstname?: InputMaybe<StringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  lastname?: InputMaybe<StringFieldUpdateOperationsInput>;
  phone?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type PersonUpdateManyMutationInput = {
  city?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  email?: InputMaybe<StringFieldUpdateOperationsInput>;
  firstname?: InputMaybe<StringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  lastname?: InputMaybe<StringFieldUpdateOperationsInput>;
  phone?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type PersonUpdateManyWithWhereWithoutCompanyInput = {
  data: PersonUpdateManyMutationInput;
  where: PersonScalarWhereInput;
};

export type PersonUpdateManyWithWhereWithoutWorkspaceInput = {
  data: PersonUpdateManyMutationInput;
  where: PersonScalarWhereInput;
};

export type PersonUpdateManyWithoutCompanyNestedInput = {
  connect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<PersonCreateOrConnectWithoutCompanyInput>>;
  create?: InputMaybe<Array<PersonCreateWithoutCompanyInput>>;
  createMany?: InputMaybe<PersonCreateManyCompanyInputEnvelope>;
  delete?: InputMaybe<Array<PersonWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<PersonScalarWhereInput>>;
  disconnect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  set?: InputMaybe<Array<PersonWhereUniqueInput>>;
  update?: InputMaybe<Array<PersonUpdateWithWhereUniqueWithoutCompanyInput>>;
  updateMany?: InputMaybe<Array<PersonUpdateManyWithWhereWithoutCompanyInput>>;
  upsert?: InputMaybe<Array<PersonUpsertWithWhereUniqueWithoutCompanyInput>>;
};

export type PersonUpdateManyWithoutWorkspaceNestedInput = {
  connect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<PersonCreateOrConnectWithoutWorkspaceInput>>;
  create?: InputMaybe<Array<PersonCreateWithoutWorkspaceInput>>;
  createMany?: InputMaybe<PersonCreateManyWorkspaceInputEnvelope>;
  delete?: InputMaybe<Array<PersonWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<PersonScalarWhereInput>>;
  disconnect?: InputMaybe<Array<PersonWhereUniqueInput>>;
  set?: InputMaybe<Array<PersonWhereUniqueInput>>;
  update?: InputMaybe<Array<PersonUpdateWithWhereUniqueWithoutWorkspaceInput>>;
  updateMany?: InputMaybe<Array<PersonUpdateManyWithWhereWithoutWorkspaceInput>>;
  upsert?: InputMaybe<Array<PersonUpsertWithWhereUniqueWithoutWorkspaceInput>>;
};

export type PersonUpdateWithWhereUniqueWithoutCompanyInput = {
  data: PersonUpdateWithoutCompanyInput;
  where: PersonWhereUniqueInput;
};

export type PersonUpdateWithWhereUniqueWithoutWorkspaceInput = {
  data: PersonUpdateWithoutWorkspaceInput;
  where: PersonWhereUniqueInput;
};

export type PersonUpdateWithoutCompanyInput = {
  city?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  email?: InputMaybe<StringFieldUpdateOperationsInput>;
  firstname?: InputMaybe<StringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  lastname?: InputMaybe<StringFieldUpdateOperationsInput>;
  phone?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type PersonUpdateWithoutWorkspaceInput = {
  city?: InputMaybe<StringFieldUpdateOperationsInput>;
  company?: InputMaybe<CompanyUpdateOneWithoutPeopleNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  email?: InputMaybe<StringFieldUpdateOperationsInput>;
  firstname?: InputMaybe<StringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  lastname?: InputMaybe<StringFieldUpdateOperationsInput>;
  phone?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type PersonUpsertWithWhereUniqueWithoutCompanyInput = {
  create: PersonCreateWithoutCompanyInput;
  update: PersonUpdateWithoutCompanyInput;
  where: PersonWhereUniqueInput;
};

export type PersonUpsertWithWhereUniqueWithoutWorkspaceInput = {
  create: PersonCreateWithoutWorkspaceInput;
  update: PersonUpdateWithoutWorkspaceInput;
  where: PersonWhereUniqueInput;
};

export type PersonWhereInput = {
  AND?: InputMaybe<Array<PersonWhereInput>>;
  NOT?: InputMaybe<Array<PersonWhereInput>>;
  OR?: InputMaybe<Array<PersonWhereInput>>;
  city?: InputMaybe<StringFilter>;
  company?: InputMaybe<CompanyRelationFilter>;
  companyId?: InputMaybe<StringNullableFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
  email?: InputMaybe<StringFilter>;
  firstname?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  lastname?: InputMaybe<StringFilter>;
  phone?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type PersonWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  companies: Array<Company>;
  people: Array<Person>;
  user: User;
  users: Array<User>;
};


export type QueryCompaniesArgs = {
  cursor?: InputMaybe<CompanyWhereUniqueInput>;
  distinct?: InputMaybe<Array<CompanyScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<CompanyOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CompanyWhereInput>;
};


export type QueryPeopleArgs = {
  cursor?: InputMaybe<PersonWhereUniqueInput>;
  distinct?: InputMaybe<Array<PersonScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<PersonOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PersonWhereInput>;
};


export type QueryUserArgs = {
  where: UserWhereUniqueInput;
};


export type QueryUsersArgs = {
  cursor?: InputMaybe<UserWhereUniqueInput>;
  distinct?: InputMaybe<Array<UserScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<UserOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<UserWhereInput>;
};

export enum QueryMode {
  Default = 'default',
  Insensitive = 'insensitive'
}

export type RefreshToken = {
  __typename?: 'RefreshToken';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  refreshToken: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['String'];
};

export type RefreshTokenCreateManyUserInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['String'];
  refreshToken: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type RefreshTokenCreateManyUserInputEnvelope = {
  data: Array<RefreshTokenCreateManyUserInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type RefreshTokenCreateNestedManyWithoutUserInput = {
  connect?: InputMaybe<Array<RefreshTokenWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<RefreshTokenCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<RefreshTokenCreateWithoutUserInput>>;
  createMany?: InputMaybe<RefreshTokenCreateManyUserInputEnvelope>;
};

export type RefreshTokenCreateOrConnectWithoutUserInput = {
  create: RefreshTokenCreateWithoutUserInput;
  where: RefreshTokenWhereUniqueInput;
};

export type RefreshTokenCreateWithoutUserInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['String'];
  refreshToken: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type RefreshTokenListRelationFilter = {
  every?: InputMaybe<RefreshTokenWhereInput>;
  none?: InputMaybe<RefreshTokenWhereInput>;
  some?: InputMaybe<RefreshTokenWhereInput>;
};

export type RefreshTokenOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type RefreshTokenOrderByWithRelationInput = {
  createdAt?: InputMaybe<SortOrder>;
  deletedAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  refreshToken?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
  user?: InputMaybe<UserOrderByWithRelationInput>;
  userId?: InputMaybe<SortOrder>;
};

export enum RefreshTokenScalarFieldEnum {
  CreatedAt = 'createdAt',
  DeletedAt = 'deletedAt',
  Id = 'id',
  RefreshToken = 'refreshToken',
  UpdatedAt = 'updatedAt',
  UserId = 'userId'
}

export type RefreshTokenScalarWhereInput = {
  AND?: InputMaybe<Array<RefreshTokenScalarWhereInput>>;
  NOT?: InputMaybe<Array<RefreshTokenScalarWhereInput>>;
  OR?: InputMaybe<Array<RefreshTokenScalarWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
  id?: InputMaybe<StringFilter>;
  refreshToken?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type RefreshTokenUpdateManyMutationInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  refreshToken?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type RefreshTokenUpdateManyWithWhereWithoutUserInput = {
  data: RefreshTokenUpdateManyMutationInput;
  where: RefreshTokenScalarWhereInput;
};

export type RefreshTokenUpdateManyWithoutUserNestedInput = {
  connect?: InputMaybe<Array<RefreshTokenWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<RefreshTokenCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<RefreshTokenCreateWithoutUserInput>>;
  createMany?: InputMaybe<RefreshTokenCreateManyUserInputEnvelope>;
  delete?: InputMaybe<Array<RefreshTokenWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<RefreshTokenScalarWhereInput>>;
  disconnect?: InputMaybe<Array<RefreshTokenWhereUniqueInput>>;
  set?: InputMaybe<Array<RefreshTokenWhereUniqueInput>>;
  update?: InputMaybe<Array<RefreshTokenUpdateWithWhereUniqueWithoutUserInput>>;
  updateMany?: InputMaybe<Array<RefreshTokenUpdateManyWithWhereWithoutUserInput>>;
  upsert?: InputMaybe<Array<RefreshTokenUpsertWithWhereUniqueWithoutUserInput>>;
};

export type RefreshTokenUpdateWithWhereUniqueWithoutUserInput = {
  data: RefreshTokenUpdateWithoutUserInput;
  where: RefreshTokenWhereUniqueInput;
};

export type RefreshTokenUpdateWithoutUserInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  refreshToken?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type RefreshTokenUpsertWithWhereUniqueWithoutUserInput = {
  create: RefreshTokenCreateWithoutUserInput;
  update: RefreshTokenUpdateWithoutUserInput;
  where: RefreshTokenWhereUniqueInput;
};

export type RefreshTokenWhereInput = {
  AND?: InputMaybe<Array<RefreshTokenWhereInput>>;
  NOT?: InputMaybe<Array<RefreshTokenWhereInput>>;
  OR?: InputMaybe<Array<RefreshTokenWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
  id?: InputMaybe<StringFilter>;
  refreshToken?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type RefreshTokenWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type StringFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['String']>;
};

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

export type User = {
  __typename?: 'User';
  RefreshTokens?: Maybe<Array<RefreshToken>>;
  WorkspaceMember?: Maybe<WorkspaceMember>;
  _count: UserCount;
  avatarUrl?: Maybe<Scalars['String']>;
  companies?: Maybe<Array<Company>>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  disabled: Scalars['Boolean'];
  displayName: Scalars['String'];
  email: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  id: Scalars['ID'];
  lastSeen?: Maybe<Scalars['DateTime']>;
  locale: Scalars['String'];
  metadata?: Maybe<Scalars['JSON']>;
  passwordHash?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


export type UserRefreshTokensArgs = {
  cursor?: InputMaybe<RefreshTokenWhereUniqueInput>;
  distinct?: InputMaybe<Array<RefreshTokenScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<RefreshTokenOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<RefreshTokenWhereInput>;
};


export type UserCompaniesArgs = {
  cursor?: InputMaybe<CompanyWhereUniqueInput>;
  distinct?: InputMaybe<Array<CompanyScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<CompanyOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CompanyWhereInput>;
};

export type UserCount = {
  __typename?: 'UserCount';
  RefreshTokens: Scalars['Int'];
  companies: Scalars['Int'];
};

export type UserCreateNestedOneWithoutCompaniesInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutCompaniesInput>;
  create?: InputMaybe<UserCreateWithoutCompaniesInput>;
};

export type UserCreateOrConnectWithoutCompaniesInput = {
  create: UserCreateWithoutCompaniesInput;
  where: UserWhereUniqueInput;
};

export type UserCreateWithoutCompaniesInput = {
  RefreshTokens?: InputMaybe<RefreshTokenCreateNestedManyWithoutUserInput>;
  WorkspaceMember?: InputMaybe<WorkspaceMemberCreateNestedOneWithoutUserInput>;
  avatarUrl?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  displayName: Scalars['String'];
  email: Scalars['String'];
  emailVerified?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['String'];
  lastSeen?: InputMaybe<Scalars['DateTime']>;
  locale: Scalars['String'];
  metadata?: InputMaybe<Scalars['JSON']>;
  passwordHash?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type UserOrderByWithRelationInput = {
  RefreshTokens?: InputMaybe<RefreshTokenOrderByRelationAggregateInput>;
  WorkspaceMember?: InputMaybe<WorkspaceMemberOrderByWithRelationInput>;
  avatarUrl?: InputMaybe<SortOrder>;
  companies?: InputMaybe<CompanyOrderByRelationAggregateInput>;
  createdAt?: InputMaybe<SortOrder>;
  deletedAt?: InputMaybe<SortOrder>;
  disabled?: InputMaybe<SortOrder>;
  displayName?: InputMaybe<SortOrder>;
  email?: InputMaybe<SortOrder>;
  emailVerified?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  lastSeen?: InputMaybe<SortOrder>;
  locale?: InputMaybe<SortOrder>;
  metadata?: InputMaybe<SortOrder>;
  passwordHash?: InputMaybe<SortOrder>;
  phoneNumber?: InputMaybe<SortOrder>;
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
  DisplayName = 'displayName',
  Email = 'email',
  EmailVerified = 'emailVerified',
  Id = 'id',
  LastSeen = 'lastSeen',
  Locale = 'locale',
  Metadata = 'metadata',
  PasswordHash = 'passwordHash',
  PhoneNumber = 'phoneNumber',
  UpdatedAt = 'updatedAt'
}

export type UserUpdateOneWithoutCompaniesNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutCompaniesInput>;
  create?: InputMaybe<UserCreateWithoutCompaniesInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<UserUpdateWithoutCompaniesInput>;
  upsert?: InputMaybe<UserUpsertWithoutCompaniesInput>;
};

export type UserUpdateWithoutCompaniesInput = {
  RefreshTokens?: InputMaybe<RefreshTokenUpdateManyWithoutUserNestedInput>;
  WorkspaceMember?: InputMaybe<WorkspaceMemberUpdateOneWithoutUserNestedInput>;
  avatarUrl?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  disabled?: InputMaybe<BoolFieldUpdateOperationsInput>;
  displayName?: InputMaybe<StringFieldUpdateOperationsInput>;
  email?: InputMaybe<StringFieldUpdateOperationsInput>;
  emailVerified?: InputMaybe<BoolFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  lastSeen?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  locale?: InputMaybe<StringFieldUpdateOperationsInput>;
  metadata?: InputMaybe<Scalars['JSON']>;
  passwordHash?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  phoneNumber?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type UserUpsertWithoutCompaniesInput = {
  create: UserCreateWithoutCompaniesInput;
  update: UserUpdateWithoutCompaniesInput;
};

export type UserWhereInput = {
  AND?: InputMaybe<Array<UserWhereInput>>;
  NOT?: InputMaybe<Array<UserWhereInput>>;
  OR?: InputMaybe<Array<UserWhereInput>>;
  RefreshTokens?: InputMaybe<RefreshTokenListRelationFilter>;
  WorkspaceMember?: InputMaybe<WorkspaceMemberRelationFilter>;
  avatarUrl?: InputMaybe<StringNullableFilter>;
  companies?: InputMaybe<CompanyListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
  disabled?: InputMaybe<BoolFilter>;
  displayName?: InputMaybe<StringFilter>;
  email?: InputMaybe<StringFilter>;
  emailVerified?: InputMaybe<BoolFilter>;
  id?: InputMaybe<StringFilter>;
  lastSeen?: InputMaybe<DateTimeNullableFilter>;
  locale?: InputMaybe<StringFilter>;
  metadata?: InputMaybe<JsonNullableFilter>;
  passwordHash?: InputMaybe<StringNullableFilter>;
  phoneNumber?: InputMaybe<StringNullableFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type UserWhereUniqueInput = {
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
};

export type Workspace = {
  __typename?: 'Workspace';
  WorkspaceMember?: Maybe<Array<WorkspaceMember>>;
  _count: WorkspaceCount;
  companies?: Maybe<Array<Company>>;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  displayName: Scalars['String'];
  domainName: Scalars['String'];
  id: Scalars['ID'];
  logo?: Maybe<Scalars['String']>;
  people?: Maybe<Array<Person>>;
  updatedAt: Scalars['DateTime'];
};

export type WorkspaceCount = {
  __typename?: 'WorkspaceCount';
  WorkspaceMember: Scalars['Int'];
  companies: Scalars['Int'];
  people: Scalars['Int'];
};

export type WorkspaceCreateNestedOneWithoutWorkspaceMemberInput = {
  connect?: InputMaybe<WorkspaceWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WorkspaceCreateOrConnectWithoutWorkspaceMemberInput>;
  create?: InputMaybe<WorkspaceCreateWithoutWorkspaceMemberInput>;
};

export type WorkspaceCreateOrConnectWithoutWorkspaceMemberInput = {
  create: WorkspaceCreateWithoutWorkspaceMemberInput;
  where: WorkspaceWhereUniqueInput;
};

export type WorkspaceCreateWithoutWorkspaceMemberInput = {
  companies?: InputMaybe<CompanyCreateNestedManyWithoutWorkspaceInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  displayName: Scalars['String'];
  domainName: Scalars['String'];
  id: Scalars['String'];
  logo?: InputMaybe<Scalars['String']>;
  people?: InputMaybe<PersonCreateNestedManyWithoutWorkspaceInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['String'];
  workspace: Workspace;
  workspaceId: Scalars['String'];
};

export type WorkspaceMemberCreateNestedOneWithoutUserInput = {
  connect?: InputMaybe<WorkspaceMemberWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WorkspaceMemberCreateOrConnectWithoutUserInput>;
  create?: InputMaybe<WorkspaceMemberCreateWithoutUserInput>;
};

export type WorkspaceMemberCreateOrConnectWithoutUserInput = {
  create: WorkspaceMemberCreateWithoutUserInput;
  where: WorkspaceMemberWhereUniqueInput;
};

export type WorkspaceMemberCreateWithoutUserInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  workspace: WorkspaceCreateNestedOneWithoutWorkspaceMemberInput;
};

export type WorkspaceMemberListRelationFilter = {
  every?: InputMaybe<WorkspaceMemberWhereInput>;
  none?: InputMaybe<WorkspaceMemberWhereInput>;
  some?: InputMaybe<WorkspaceMemberWhereInput>;
};

export type WorkspaceMemberOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type WorkspaceMemberOrderByWithRelationInput = {
  createdAt?: InputMaybe<SortOrder>;
  deletedAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
  user?: InputMaybe<UserOrderByWithRelationInput>;
  userId?: InputMaybe<SortOrder>;
  workspace?: InputMaybe<WorkspaceOrderByWithRelationInput>;
  workspaceId?: InputMaybe<SortOrder>;
};

export type WorkspaceMemberRelationFilter = {
  is?: InputMaybe<WorkspaceMemberWhereInput>;
  isNot?: InputMaybe<WorkspaceMemberWhereInput>;
};

export type WorkspaceMemberUpdateOneWithoutUserNestedInput = {
  connect?: InputMaybe<WorkspaceMemberWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WorkspaceMemberCreateOrConnectWithoutUserInput>;
  create?: InputMaybe<WorkspaceMemberCreateWithoutUserInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<WorkspaceMemberUpdateWithoutUserInput>;
  upsert?: InputMaybe<WorkspaceMemberUpsertWithoutUserInput>;
};

export type WorkspaceMemberUpdateWithoutUserInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  workspace?: InputMaybe<WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput>;
};

export type WorkspaceMemberUpsertWithoutUserInput = {
  create: WorkspaceMemberCreateWithoutUserInput;
  update: WorkspaceMemberUpdateWithoutUserInput;
};

export type WorkspaceMemberWhereInput = {
  AND?: InputMaybe<Array<WorkspaceMemberWhereInput>>;
  NOT?: InputMaybe<Array<WorkspaceMemberWhereInput>>;
  OR?: InputMaybe<Array<WorkspaceMemberWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
  id?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
  workspace?: InputMaybe<WorkspaceRelationFilter>;
  workspaceId?: InputMaybe<StringFilter>;
};

export type WorkspaceMemberWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
};

export type WorkspaceOrderByWithRelationInput = {
  WorkspaceMember?: InputMaybe<WorkspaceMemberOrderByRelationAggregateInput>;
  companies?: InputMaybe<CompanyOrderByRelationAggregateInput>;
  createdAt?: InputMaybe<SortOrder>;
  deletedAt?: InputMaybe<SortOrder>;
  displayName?: InputMaybe<SortOrder>;
  domainName?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  logo?: InputMaybe<SortOrder>;
  people?: InputMaybe<PersonOrderByRelationAggregateInput>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type WorkspaceRelationFilter = {
  is?: InputMaybe<WorkspaceWhereInput>;
  isNot?: InputMaybe<WorkspaceWhereInput>;
};

export type WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput = {
  connect?: InputMaybe<WorkspaceWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WorkspaceCreateOrConnectWithoutWorkspaceMemberInput>;
  create?: InputMaybe<WorkspaceCreateWithoutWorkspaceMemberInput>;
  update?: InputMaybe<WorkspaceUpdateWithoutWorkspaceMemberInput>;
  upsert?: InputMaybe<WorkspaceUpsertWithoutWorkspaceMemberInput>;
};

export type WorkspaceUpdateWithoutWorkspaceMemberInput = {
  companies?: InputMaybe<CompanyUpdateManyWithoutWorkspaceNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  deletedAt?: InputMaybe<NullableDateTimeFieldUpdateOperationsInput>;
  displayName?: InputMaybe<StringFieldUpdateOperationsInput>;
  domainName?: InputMaybe<StringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  logo?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  people?: InputMaybe<PersonUpdateManyWithoutWorkspaceNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type WorkspaceUpsertWithoutWorkspaceMemberInput = {
  create: WorkspaceCreateWithoutWorkspaceMemberInput;
  update: WorkspaceUpdateWithoutWorkspaceMemberInput;
};

export type WorkspaceWhereInput = {
  AND?: InputMaybe<Array<WorkspaceWhereInput>>;
  NOT?: InputMaybe<Array<WorkspaceWhereInput>>;
  OR?: InputMaybe<Array<WorkspaceWhereInput>>;
  WorkspaceMember?: InputMaybe<WorkspaceMemberListRelationFilter>;
  companies?: InputMaybe<CompanyListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deletedAt?: InputMaybe<DateTimeNullableFilter>;
  displayName?: InputMaybe<StringFilter>;
  domainName?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  logo?: InputMaybe<StringNullableFilter>;
  people?: InputMaybe<PersonListRelationFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type WorkspaceWhereUniqueInput = {
  domainName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
};

export type GetCompaniesQueryVariables = Exact<{
  orderBy?: InputMaybe<Array<CompanyOrderByWithRelationInput> | CompanyOrderByWithRelationInput>;
  where?: InputMaybe<CompanyWhereInput>;
}>;


export type GetCompaniesQuery = { __typename?: 'Query', companies: Array<{ __typename?: 'Company', id: string, name: string, address: string, employees?: number | null, domain_name: string, created_at: any, account_owner?: { __typename?: 'User', id: string, email: string, displayName: string } | null }> };

export type UpdateCompanyMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  domain_name?: InputMaybe<Scalars['String']>;
  account_owner_id?: InputMaybe<Scalars['String']>;
  created_at?: InputMaybe<Scalars['DateTime']>;
  address?: InputMaybe<Scalars['String']>;
  employees?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateCompanyMutation = { __typename?: 'Mutation', updateOneCompany?: { __typename?: 'Company', address: string, employees?: number | null, id: string, name: string, created_at: any, domain_name: string, accountOwner?: { __typename?: 'User', id: string, email: string, display_name: string } | null } | null };

export type InsertCompanyMutationVariables = Exact<{
  id: Scalars['String'];
  name: Scalars['String'];
  domain_name: Scalars['String'];
  created_at?: InputMaybe<Scalars['DateTime']>;
  address: Scalars['String'];
  employees?: InputMaybe<Scalars['Int']>;
}>;


export type InsertCompanyMutation = { __typename?: 'Mutation', createOneCompany: { __typename?: 'Company', address: string, employees?: number | null, id: string, name: string, created_at: any, domain_name: string } };

export type DeleteCompaniesMutationVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type DeleteCompaniesMutation = { __typename?: 'Mutation', deleteManyCompany: { __typename?: 'AffectedRows', count: number } };

export type GetPeopleQueryVariables = Exact<{
  orderBy?: InputMaybe<Array<PersonOrderByWithRelationInput> | PersonOrderByWithRelationInput>;
  where?: InputMaybe<PersonWhereInput>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type GetPeopleQuery = { __typename?: 'Query', people: Array<{ __typename?: 'Person', id: string, phone: string, email: string, city: string, firstname: string, lastname: string, created_at: any, company?: { __typename?: 'Company', id: string, name: string, domain_name: string } | null }> };

export type UpdatePeopleMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  firstname?: InputMaybe<Scalars['String']>;
  lastname?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  company_id?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  created_at?: InputMaybe<Scalars['DateTime']>;
}>;


export type UpdatePeopleMutation = { __typename?: 'Mutation', updateOnePerson?: { __typename?: 'Person', city: string, email: string, firstname: string, id: string, lastname: string, phone: string, created_at: any, company?: { __typename?: 'Company', name: string, id: string, domain_name: string } | null } | null };

export type InsertPersonMutationVariables = Exact<{
  id: Scalars['String'];
  firstname: Scalars['String'];
  lastname: Scalars['String'];
  phone: Scalars['String'];
  city: Scalars['String'];
  email: Scalars['String'];
  created_at?: InputMaybe<Scalars['DateTime']>;
}>;


export type InsertPersonMutation = { __typename?: 'Mutation', createOnePerson: { __typename?: 'Person', city: string, email: string, firstname: string, id: string, lastname: string, phone: string, created_at: any, company?: { __typename?: 'Company', name: string, id: string, domain_name: string } | null } };

export type DeletePeopleMutationVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type DeletePeopleMutation = { __typename?: 'Mutation', deleteManyPerson: { __typename?: 'AffectedRows', count: number } };

export type SearchPeopleQueryQueryVariables = Exact<{
  where?: InputMaybe<PersonWhereInput>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type SearchPeopleQueryQuery = { __typename?: 'Query', searchResults: Array<{ __typename?: 'Person', id: string, phone: string, email: string, city: string, firstname: string, lastname: string, createdAt: any }> };

export type SearchUserQueryQueryVariables = Exact<{
  where?: InputMaybe<UserWhereInput>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type SearchUserQueryQuery = { __typename?: 'Query', searchResults: Array<{ __typename?: 'User', id: string, email: string, displayName: string }> };

export type EmptyQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type EmptyQueryQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string }> };

export type SearchQueryQueryVariables = Exact<{
  where?: InputMaybe<CompanyWhereInput>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type SearchQueryQuery = { __typename?: 'Query', searchResults: Array<{ __typename?: 'Company', id: string, name: string, domain_name: string }> };

export type GetCurrentUserQueryVariables = Exact<{
  uuid?: InputMaybe<Scalars['String']>;
}>;


export type GetCurrentUserQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, email: string, displayName: string, workspace_member?: { __typename?: 'WorkspaceMember', workspace: { __typename?: 'Workspace', id: string, logo?: string | null, domain_name: string, display_name: string } } | null }> };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string }> };


export const GetCompaniesDocument = gql`
    query GetCompanies($orderBy: [CompanyOrderByWithRelationInput!], $where: CompanyWhereInput) {
  companies(orderBy: $orderBy, where: $where) {
    id
    domain_name: domainName
    name
    created_at: createdAt
    address
    employees
    account_owner: accountOwner {
      id
      email
      displayName
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
export const UpdateCompanyDocument = gql`
    mutation UpdateCompany($id: String, $name: String, $domain_name: String, $account_owner_id: String, $created_at: DateTime, $address: String, $employees: Int) {
  updateOneCompany(
    where: {id: $id}
    data: {accountOwner: {connect: {id: $account_owner_id}}, address: {set: $address}, domainName: {set: $domain_name}, employees: {set: $employees}, name: {set: $name}, createdAt: {set: $created_at}}
  ) {
    accountOwner {
      id
      email
      display_name: displayName
    }
    address
    created_at: createdAt
    domain_name: domainName
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
 *      domain_name: // value for 'domain_name'
 *      account_owner_id: // value for 'account_owner_id'
 *      created_at: // value for 'created_at'
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
    mutation InsertCompany($id: String!, $name: String!, $domain_name: String!, $created_at: DateTime, $address: String!, $employees: Int) {
  createOneCompany(
    data: {id: $id, name: $name, domainName: $domain_name, createdAt: $created_at, address: $address, employees: $employees}
  ) {
    address
    created_at: createdAt
    domain_name: domainName
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
 *      domain_name: // value for 'domain_name'
 *      created_at: // value for 'created_at'
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
  people(orderBy: $orderBy, where: $where, take: $limit) {
    id
    phone
    email
    city
    firstname
    lastname
    created_at: createdAt
    company {
      id
      name
      domain_name: domainName
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
export const UpdatePeopleDocument = gql`
    mutation UpdatePeople($id: String, $firstname: String, $lastname: String, $phone: String, $city: String, $company_id: String, $email: String, $created_at: DateTime) {
  updateOnePerson(
    where: {id: $id}
    data: {city: {set: $city}, company: {connect: {id: $company_id}}, email: {set: $email}, firstname: {set: $firstname}, id: {set: $id}, lastname: {set: $lastname}, phone: {set: $phone}, createdAt: {set: $created_at}}
  ) {
    city
    company {
      domain_name: domainName
      name
      id
    }
    email
    firstname
    id
    lastname
    phone
    created_at: createdAt
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
 *      firstname: // value for 'firstname'
 *      lastname: // value for 'lastname'
 *      phone: // value for 'phone'
 *      city: // value for 'city'
 *      company_id: // value for 'company_id'
 *      email: // value for 'email'
 *      created_at: // value for 'created_at'
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
    mutation InsertPerson($id: String!, $firstname: String!, $lastname: String!, $phone: String!, $city: String!, $email: String!, $created_at: DateTime) {
  createOnePerson(
    data: {id: $id, firstname: $firstname, lastname: $lastname, phone: $phone, city: $city, email: $email, createdAt: $created_at}
  ) {
    city
    company {
      domain_name: domainName
      name
      id
    }
    email
    firstname
    id
    lastname
    phone
    created_at: createdAt
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
 *      firstname: // value for 'firstname'
 *      lastname: // value for 'lastname'
 *      phone: // value for 'phone'
 *      city: // value for 'city'
 *      email: // value for 'email'
 *      created_at: // value for 'created_at'
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
export const SearchPeopleQueryDocument = gql`
    query SearchPeopleQuery($where: PersonWhereInput, $limit: Int) {
  searchResults: people(where: $where, take: $limit) {
    id
    phone
    email
    city
    firstname
    lastname
    createdAt
  }
}
    `;

/**
 * __useSearchPeopleQueryQuery__
 *
 * To run a query within a React component, call `useSearchPeopleQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchPeopleQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchPeopleQueryQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchPeopleQueryQuery(baseOptions?: Apollo.QueryHookOptions<SearchPeopleQueryQuery, SearchPeopleQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchPeopleQueryQuery, SearchPeopleQueryQueryVariables>(SearchPeopleQueryDocument, options);
      }
export function useSearchPeopleQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchPeopleQueryQuery, SearchPeopleQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchPeopleQueryQuery, SearchPeopleQueryQueryVariables>(SearchPeopleQueryDocument, options);
        }
export type SearchPeopleQueryQueryHookResult = ReturnType<typeof useSearchPeopleQueryQuery>;
export type SearchPeopleQueryLazyQueryHookResult = ReturnType<typeof useSearchPeopleQueryLazyQuery>;
export type SearchPeopleQueryQueryResult = Apollo.QueryResult<SearchPeopleQueryQuery, SearchPeopleQueryQueryVariables>;
export const SearchUserQueryDocument = gql`
    query SearchUserQuery($where: UserWhereInput, $limit: Int) {
  searchResults: users(where: $where, take: $limit) {
    id
    email
    displayName
  }
}
    `;

/**
 * __useSearchUserQueryQuery__
 *
 * To run a query within a React component, call `useSearchUserQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchUserQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchUserQueryQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchUserQueryQuery(baseOptions?: Apollo.QueryHookOptions<SearchUserQueryQuery, SearchUserQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchUserQueryQuery, SearchUserQueryQueryVariables>(SearchUserQueryDocument, options);
      }
export function useSearchUserQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchUserQueryQuery, SearchUserQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchUserQueryQuery, SearchUserQueryQueryVariables>(SearchUserQueryDocument, options);
        }
export type SearchUserQueryQueryHookResult = ReturnType<typeof useSearchUserQueryQuery>;
export type SearchUserQueryLazyQueryHookResult = ReturnType<typeof useSearchUserQueryLazyQuery>;
export type SearchUserQueryQueryResult = Apollo.QueryResult<SearchUserQueryQuery, SearchUserQueryQueryVariables>;
export const EmptyQueryDocument = gql`
    query EmptyQuery {
  users {
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
export const SearchQueryDocument = gql`
    query SearchQuery($where: CompanyWhereInput, $limit: Int) {
  searchResults: companies(where: $where, take: $limit) {
    id
    name
    domain_name: domainName
  }
}
    `;

/**
 * __useSearchQueryQuery__
 *
 * To run a query within a React component, call `useSearchQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchQueryQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchQueryQuery(baseOptions?: Apollo.QueryHookOptions<SearchQueryQuery, SearchQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchQueryQuery, SearchQueryQueryVariables>(SearchQueryDocument, options);
      }
export function useSearchQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchQueryQuery, SearchQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchQueryQuery, SearchQueryQueryVariables>(SearchQueryDocument, options);
        }
export type SearchQueryQueryHookResult = ReturnType<typeof useSearchQueryQuery>;
export type SearchQueryLazyQueryHookResult = ReturnType<typeof useSearchQueryLazyQuery>;
export type SearchQueryQueryResult = Apollo.QueryResult<SearchQueryQuery, SearchQueryQueryVariables>;
export const GetCurrentUserDocument = gql`
    query getCurrentUser($uuid: String) {
  users(where: {id: {equals: $uuid}}) {
    id
    email
    displayName
    workspace_member: WorkspaceMember {
      workspace {
        id
        domain_name: domainName
        display_name: displayName
        logo
      }
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
 *      uuid: // value for 'uuid'
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
    query getUsers {
  users {
    id
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