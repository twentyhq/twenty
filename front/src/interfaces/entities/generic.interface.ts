import {
  Companies_Bool_Exp,
  People_Bool_Exp,
  Users_Bool_Exp,
} from '../../generated/graphql';
import { Company, GraphqlQueryCompany } from './company.interface';
import { GraphqlQueryPerson, Person } from './person.interface';
import { GraphqlQueryUser, User } from './user.interface';

export type AnyEntity = {
  id: string;
  __typename: string;
} & Record<string, any>;

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
