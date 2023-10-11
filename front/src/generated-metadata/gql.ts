/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query Objects {\n    objects {\n      edges {\n        node {\n          id\n          displayName\n          displayNameSingular\n          displayNamePlural\n          description\n          icon\n          isCustom\n          isActive\n          createdAt\n          updatedAt\n          fields {\n            edges {\n              node {\n                id\n                type\n                displayName\n                description\n                icon\n                placeholder\n                isCustom\n                isActive\n                isNullable\n                updatedAt\n                createdAt\n              }\n            }\n            pageInfo {\n              hasNextPage\n              hasPreviousPage\n              startCursor\n              endCursor\n            }\n            totalCount\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.ObjectsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Objects {\n    objects {\n      edges {\n        node {\n          id\n          displayName\n          displayNameSingular\n          displayNamePlural\n          description\n          icon\n          isCustom\n          isActive\n          createdAt\n          updatedAt\n          fields {\n            edges {\n              node {\n                id\n                type\n                displayName\n                description\n                icon\n                placeholder\n                isCustom\n                isActive\n                isNullable\n                updatedAt\n                createdAt\n              }\n            }\n            pageInfo {\n              hasNextPage\n              hasPreviousPage\n              startCursor\n              endCursor\n            }\n            totalCount\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query Objects {\n    objects {\n      edges {\n        node {\n          id\n          displayName\n          displayNameSingular\n          displayNamePlural\n          description\n          icon\n          isCustom\n          isActive\n          createdAt\n          updatedAt\n          fields {\n            edges {\n              node {\n                id\n                type\n                displayName\n                description\n                icon\n                placeholder\n                isCustom\n                isActive\n                isNullable\n                updatedAt\n                createdAt\n              }\n            }\n            pageInfo {\n              hasNextPage\n              hasPreviousPage\n              startCursor\n              endCursor\n            }\n            totalCount\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;