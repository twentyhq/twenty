import { Person as GQLPerson } from '../../../generated/graphql';
import { DeepPartial } from '../../utils/utils';

export type Person = DeepPartial<GQLPerson> & { id: GQLPerson['id'] };

export type GraphqlQueryPerson = Person;

export type GraphqlMutationPerson = Person;

export const mapToPerson = (person: GraphqlQueryPerson): Person => person;

export const mapToGqlPerson = (person: Person): GraphqlMutationPerson => person;
