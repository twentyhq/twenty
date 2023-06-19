import { User as GQLUser } from '../../../generated/graphql';
import { DeepPartial } from '../../utils/utils';

export type User = DeepPartial<GQLUser> & { id: string };

export type GraphqlQueryUser = User;

export type GraphqlMutationUser = User;

export const mapToUser = (user: GraphqlQueryUser): User => user;

export const mapToGqlUser = (user: User): GraphqlMutationUser => user;
