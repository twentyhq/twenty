import {
  type GraphQLEnumType,
  type GraphQLInputObjectType,
  type GraphQLObjectType,
} from 'graphql';

export interface StoredGqlType<T> {
  key: string;
  type: T;
}

export interface StoredInputType
  extends StoredGqlType<GraphQLInputObjectType> {}

export interface StoredObjectType extends StoredGqlType<GraphQLObjectType> {}

export interface StoredEnumGqlType extends StoredGqlType<GraphQLEnumType> {}
