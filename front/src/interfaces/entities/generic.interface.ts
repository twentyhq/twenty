import {
  CompanyWhereInput as Companies_Bool_Exp,
  PersonWhereInput as People_Bool_Exp,
  UserWhereInput as Users_Bool_Exp,
} from '../../generated/graphql';
import { Company, GraphqlQueryCompany } from './company.interface';
import { GraphqlQueryPerson, Person } from './person.interface';
import { GraphqlQueryUser, User } from './user.interface';

export type AnyEntity = {
  id: string;
  __typename: string;
} & Record<string, any>;

export type UnknownType = void;

export type GqlType<T> = T extends Company
  ? GraphqlQueryCompany
  : T extends Person
  ? GraphqlQueryPerson
  : T extends User
  ? GraphqlQueryUser
  : never;

export type BoolExpType<T> = T extends Company
  ? Companies_Bool_Exp
  : T extends Person
  ? People_Bool_Exp
  : T extends User
  ? Users_Bool_Exp
  : never;
