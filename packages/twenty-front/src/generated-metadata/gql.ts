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
    "\n  fragment RemoteServerFields on RemoteServer {\n    id\n    createdAt\n    foreignDataWrapperId\n    foreignDataWrapperOptions\n    foreignDataWrapperType\n    userMappingOptions {\n      user\n    }\n    updatedAt\n    schema\n    label\n  }\n": types.RemoteServerFieldsFragmentDoc,
    "\n  fragment RemoteTableFields on RemoteTable {\n    id\n    name\n    schema\n    status\n    schemaPendingUpdates\n  }\n": types.RemoteTableFieldsFragmentDoc,
    "\n  \n  mutation createServer($input: CreateRemoteServerInput!) {\n    createOneRemoteServer(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n": types.CreateServerDocument,
    "\n  mutation deleteServer($input: RemoteServerIdInput!) {\n    deleteOneRemoteServer(input: $input) {\n      id\n    }\n  }\n": types.DeleteServerDocument,
    "\n  \n  mutation syncRemoteTable($input: RemoteTableInput!) {\n    syncRemoteTable(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n": types.SyncRemoteTableDocument,
    "\n  \n  mutation syncRemoteTableSchemaChanges($input: RemoteTableInput!) {\n    syncRemoteTableSchemaChanges(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n": types.SyncRemoteTableSchemaChangesDocument,
    "\n  \n  mutation unsyncRemoteTable($input: RemoteTableInput!) {\n    unsyncRemoteTable(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n": types.UnsyncRemoteTableDocument,
    "\n  \n  mutation updateServer($input: UpdateRemoteServerInput!) {\n    updateOneRemoteServer(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n": types.UpdateServerDocument,
    "\n  \n  query GetManyDatabaseConnections($input: RemoteServerTypeInput!) {\n    findManyRemoteServersByType(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n": types.GetManyDatabaseConnectionsDocument,
    "\n  \n  query GetManyRemoteTables($input: FindManyRemoteTablesInput!) {\n    findDistantTablesWithStatus(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n": types.GetManyRemoteTablesDocument,
    "\n  \n  query GetOneDatabaseConnection($input: RemoteServerIdInput!) {\n    findOneRemoteServerById(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n": types.GetOneDatabaseConnectionDocument,
    "\n  mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {\n    createOneObject(input: $input) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n": types.CreateOneObjectMetadataItemDocument,
    "\n  mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {\n    createOneField(input: $input) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n      defaultValue\n      options\n    }\n  }\n": types.CreateOneFieldMetadataItemDocument,
    "\n  mutation CreateOneRelationMetadata($input: CreateOneRelationInput!) {\n    createOneRelation(input: $input) {\n      id\n      relationType\n      fromObjectMetadataId\n      toObjectMetadataId\n      fromFieldMetadataId\n      toFieldMetadataId\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateOneRelationMetadataDocument,
    "\n  mutation UpdateOneFieldMetadataItem(\n    $idToUpdate: UUID!\n    $updatePayload: UpdateFieldInput!\n  ) {\n    updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n      isLabelSyncedWithName\n    }\n  }\n": types.UpdateOneFieldMetadataItemDocument,
    "\n  mutation UpdateOneObjectMetadataItem(\n    $idToUpdate: UUID!\n    $updatePayload: UpdateObjectPayload!\n  ) {\n    updateOneObject(input: { id: $idToUpdate, update: $updatePayload }) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n": types.UpdateOneObjectMetadataItemDocument,
    "\n  mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {\n    deleteOneObject(input: { id: $idToDelete }) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n": types.DeleteOneObjectMetadataItemDocument,
    "\n  mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {\n    deleteOneField(input: { id: $idToDelete }) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n    }\n  }\n": types.DeleteOneFieldMetadataItemDocument,
    "\n  mutation DeleteOneRelationMetadataItem($idToDelete: UUID!) {\n    deleteOneRelation(input: { id: $idToDelete }) {\n      id\n    }\n  }\n": types.DeleteOneRelationMetadataItemDocument,
    "\n  query ObjectMetadataItems(\n    $objectFilter: objectFilter\n    $fieldFilter: fieldFilter\n  ) {\n    objects(paging: { first: 1000 }, filter: $objectFilter) {\n      edges {\n        node {\n          id\n          dataSourceId\n          nameSingular\n          namePlural\n          labelSingular\n          labelPlural\n          description\n          icon\n          isCustom\n          isRemote\n          isActive\n          isSystem\n          createdAt\n          updatedAt\n          labelIdentifierFieldMetadataId\n          imageIdentifierFieldMetadataId\n          shortcut\n          isLabelSyncedWithName\n          indexMetadatas(paging: { first: 100 }) {\n            edges {\n              node {\n                id\n                createdAt\n                updatedAt\n                name\n                indexWhereClause\n                indexType\n                isUnique\n                indexFieldMetadatas(paging: { first: 100 }) {\n                  edges {\n                    node {\n                      id\n                      createdAt\n                      updatedAt\n                      order\n                      fieldMetadataId\n                    }\n                  }\n                }\n              }\n            }\n          }\n          fields(paging: { first: 1000 }, filter: $fieldFilter) {\n            edges {\n              node {\n                id\n                type\n                name\n                label\n                description\n                icon\n                isCustom\n                isActive\n                isSystem\n                isNullable\n                isUnique\n                createdAt\n                updatedAt\n                defaultValue\n                options\n                settings\n                isLabelSyncedWithName\n                relationDefinition {\n                  relationId\n                  direction\n                  sourceObjectMetadata {\n                    id\n                    nameSingular\n                    namePlural\n                  }\n                  sourceFieldMetadata {\n                    id\n                    name\n                  }\n                  targetObjectMetadata {\n                    id\n                    nameSingular\n                    namePlural\n                  }\n                  targetFieldMetadata {\n                    id\n                    name\n                  }\n                }\n              }\n            }\n            pageInfo {\n              hasNextPage\n              hasPreviousPage\n              startCursor\n              endCursor\n            }\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": types.ObjectMetadataItemsDocument,
    "\n  fragment ServerlessFunctionFields on ServerlessFunction {\n    id\n    name\n    description\n    runtime\n    timeoutSeconds\n    syncStatus\n    latestVersion\n    latestVersionInputSchema\n    publishedVersions\n    createdAt\n    updatedAt\n  }\n": types.ServerlessFunctionFieldsFragmentDoc,
    "\n  \n  mutation CreateOneServerlessFunctionItem(\n    $input: CreateServerlessFunctionInput!\n  ) {\n    createOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n": types.CreateOneServerlessFunctionItemDocument,
    "\n  \n  mutation DeleteOneServerlessFunction($input: ServerlessFunctionIdInput!) {\n    deleteOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n": types.DeleteOneServerlessFunctionDocument,
    "\n  mutation ExecuteOneServerlessFunction(\n    $input: ExecuteServerlessFunctionInput!\n  ) {\n    executeOneServerlessFunction(input: $input) {\n      data\n      duration\n      status\n      error\n    }\n  }\n": types.ExecuteOneServerlessFunctionDocument,
    "\n  \n  mutation PublishOneServerlessFunction(\n    $input: PublishServerlessFunctionInput!\n  ) {\n    publishServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n": types.PublishOneServerlessFunctionDocument,
    "\n  \n  mutation UpdateOneServerlessFunction($input: UpdateServerlessFunctionInput!) {\n    updateOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n": types.UpdateOneServerlessFunctionDocument,
    "\n  query FindManyAvailablePackages($input: ServerlessFunctionIdInput!) {\n    getAvailablePackages(input: $input)\n  }\n": types.FindManyAvailablePackagesDocument,
    "\n  \n  query GetManyServerlessFunctions {\n    findManyServerlessFunctions {\n      ...ServerlessFunctionFields\n    }\n  }\n": types.GetManyServerlessFunctionsDocument,
    "\n  \n  query GetOneServerlessFunction($input: ServerlessFunctionIdInput!) {\n    findOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n": types.GetOneServerlessFunctionDocument,
    "\n  query FindOneServerlessFunctionSourceCode(\n    $input: GetServerlessFunctionSourceCodeInput!\n  ) {\n    getServerlessFunctionSourceCode(input: $input)\n  }\n": types.FindOneServerlessFunctionSourceCodeDocument,
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
export function graphql(source: "\n  fragment RemoteServerFields on RemoteServer {\n    id\n    createdAt\n    foreignDataWrapperId\n    foreignDataWrapperOptions\n    foreignDataWrapperType\n    userMappingOptions {\n      user\n    }\n    updatedAt\n    schema\n    label\n  }\n"): (typeof documents)["\n  fragment RemoteServerFields on RemoteServer {\n    id\n    createdAt\n    foreignDataWrapperId\n    foreignDataWrapperOptions\n    foreignDataWrapperType\n    userMappingOptions {\n      user\n    }\n    updatedAt\n    schema\n    label\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RemoteTableFields on RemoteTable {\n    id\n    name\n    schema\n    status\n    schemaPendingUpdates\n  }\n"): (typeof documents)["\n  fragment RemoteTableFields on RemoteTable {\n    id\n    name\n    schema\n    status\n    schemaPendingUpdates\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation createServer($input: CreateRemoteServerInput!) {\n    createOneRemoteServer(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation createServer($input: CreateRemoteServerInput!) {\n    createOneRemoteServer(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteServer($input: RemoteServerIdInput!) {\n    deleteOneRemoteServer(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation deleteServer($input: RemoteServerIdInput!) {\n    deleteOneRemoteServer(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation syncRemoteTable($input: RemoteTableInput!) {\n    syncRemoteTable(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation syncRemoteTable($input: RemoteTableInput!) {\n    syncRemoteTable(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation syncRemoteTableSchemaChanges($input: RemoteTableInput!) {\n    syncRemoteTableSchemaChanges(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation syncRemoteTableSchemaChanges($input: RemoteTableInput!) {\n    syncRemoteTableSchemaChanges(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation unsyncRemoteTable($input: RemoteTableInput!) {\n    unsyncRemoteTable(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation unsyncRemoteTable($input: RemoteTableInput!) {\n    unsyncRemoteTable(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation updateServer($input: UpdateRemoteServerInput!) {\n    updateOneRemoteServer(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation updateServer($input: UpdateRemoteServerInput!) {\n    updateOneRemoteServer(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query GetManyDatabaseConnections($input: RemoteServerTypeInput!) {\n    findManyRemoteServersByType(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n"): (typeof documents)["\n  \n  query GetManyDatabaseConnections($input: RemoteServerTypeInput!) {\n    findManyRemoteServersByType(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query GetManyRemoteTables($input: FindManyRemoteTablesInput!) {\n    findDistantTablesWithStatus(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n"): (typeof documents)["\n  \n  query GetManyRemoteTables($input: FindManyRemoteTablesInput!) {\n    findDistantTablesWithStatus(input: $input) {\n      ...RemoteTableFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query GetOneDatabaseConnection($input: RemoteServerIdInput!) {\n    findOneRemoteServerById(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n"): (typeof documents)["\n  \n  query GetOneDatabaseConnection($input: RemoteServerIdInput!) {\n    findOneRemoteServerById(input: $input) {\n      ...RemoteServerFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {\n    createOneObject(input: $input) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {\n    createOneObject(input: $input) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {\n    createOneField(input: $input) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n      defaultValue\n      options\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {\n    createOneField(input: $input) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n      defaultValue\n      options\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOneRelationMetadata($input: CreateOneRelationInput!) {\n    createOneRelation(input: $input) {\n      id\n      relationType\n      fromObjectMetadataId\n      toObjectMetadataId\n      fromFieldMetadataId\n      toFieldMetadataId\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOneRelationMetadata($input: CreateOneRelationInput!) {\n    createOneRelation(input: $input) {\n      id\n      relationType\n      fromObjectMetadataId\n      toObjectMetadataId\n      fromFieldMetadataId\n      toFieldMetadataId\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOneFieldMetadataItem(\n    $idToUpdate: UUID!\n    $updatePayload: UpdateFieldInput!\n  ) {\n    updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n      isLabelSyncedWithName\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateOneFieldMetadataItem(\n    $idToUpdate: UUID!\n    $updatePayload: UpdateFieldInput!\n  ) {\n    updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n      isLabelSyncedWithName\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOneObjectMetadataItem(\n    $idToUpdate: UUID!\n    $updatePayload: UpdateObjectPayload!\n  ) {\n    updateOneObject(input: { id: $idToUpdate, update: $updatePayload }) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateOneObjectMetadataItem(\n    $idToUpdate: UUID!\n    $updatePayload: UpdateObjectPayload!\n  ) {\n    updateOneObject(input: { id: $idToUpdate, update: $updatePayload }) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {\n    deleteOneObject(input: { id: $idToDelete }) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {\n    deleteOneObject(input: { id: $idToDelete }) {\n      id\n      dataSourceId\n      nameSingular\n      namePlural\n      labelSingular\n      labelPlural\n      description\n      icon\n      isCustom\n      isActive\n      createdAt\n      updatedAt\n      labelIdentifierFieldMetadataId\n      imageIdentifierFieldMetadataId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {\n    deleteOneField(input: { id: $idToDelete }) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {\n    deleteOneField(input: { id: $idToDelete }) {\n      id\n      type\n      name\n      label\n      description\n      icon\n      isCustom\n      isActive\n      isNullable\n      createdAt\n      updatedAt\n      settings\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteOneRelationMetadataItem($idToDelete: UUID!) {\n    deleteOneRelation(input: { id: $idToDelete }) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteOneRelationMetadataItem($idToDelete: UUID!) {\n    deleteOneRelation(input: { id: $idToDelete }) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ObjectMetadataItems(\n    $objectFilter: objectFilter\n    $fieldFilter: fieldFilter\n  ) {\n    objects(paging: { first: 1000 }, filter: $objectFilter) {\n      edges {\n        node {\n          id\n          dataSourceId\n          nameSingular\n          namePlural\n          labelSingular\n          labelPlural\n          description\n          icon\n          isCustom\n          isRemote\n          isActive\n          isSystem\n          createdAt\n          updatedAt\n          labelIdentifierFieldMetadataId\n          imageIdentifierFieldMetadataId\n          shortcut\n          isLabelSyncedWithName\n          indexMetadatas(paging: { first: 100 }) {\n            edges {\n              node {\n                id\n                createdAt\n                updatedAt\n                name\n                indexWhereClause\n                indexType\n                isUnique\n                indexFieldMetadatas(paging: { first: 100 }) {\n                  edges {\n                    node {\n                      id\n                      createdAt\n                      updatedAt\n                      order\n                      fieldMetadataId\n                    }\n                  }\n                }\n              }\n            }\n          }\n          fields(paging: { first: 1000 }, filter: $fieldFilter) {\n            edges {\n              node {\n                id\n                type\n                name\n                label\n                description\n                icon\n                isCustom\n                isActive\n                isSystem\n                isNullable\n                isUnique\n                createdAt\n                updatedAt\n                defaultValue\n                options\n                settings\n                isLabelSyncedWithName\n                relationDefinition {\n                  relationId\n                  direction\n                  sourceObjectMetadata {\n                    id\n                    nameSingular\n                    namePlural\n                  }\n                  sourceFieldMetadata {\n                    id\n                    name\n                  }\n                  targetObjectMetadata {\n                    id\n                    nameSingular\n                    namePlural\n                  }\n                  targetFieldMetadata {\n                    id\n                    name\n                  }\n                }\n              }\n            }\n            pageInfo {\n              hasNextPage\n              hasPreviousPage\n              startCursor\n              endCursor\n            }\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query ObjectMetadataItems(\n    $objectFilter: objectFilter\n    $fieldFilter: fieldFilter\n  ) {\n    objects(paging: { first: 1000 }, filter: $objectFilter) {\n      edges {\n        node {\n          id\n          dataSourceId\n          nameSingular\n          namePlural\n          labelSingular\n          labelPlural\n          description\n          icon\n          isCustom\n          isRemote\n          isActive\n          isSystem\n          createdAt\n          updatedAt\n          labelIdentifierFieldMetadataId\n          imageIdentifierFieldMetadataId\n          shortcut\n          isLabelSyncedWithName\n          indexMetadatas(paging: { first: 100 }) {\n            edges {\n              node {\n                id\n                createdAt\n                updatedAt\n                name\n                indexWhereClause\n                indexType\n                isUnique\n                indexFieldMetadatas(paging: { first: 100 }) {\n                  edges {\n                    node {\n                      id\n                      createdAt\n                      updatedAt\n                      order\n                      fieldMetadataId\n                    }\n                  }\n                }\n              }\n            }\n          }\n          fields(paging: { first: 1000 }, filter: $fieldFilter) {\n            edges {\n              node {\n                id\n                type\n                name\n                label\n                description\n                icon\n                isCustom\n                isActive\n                isSystem\n                isNullable\n                isUnique\n                createdAt\n                updatedAt\n                defaultValue\n                options\n                settings\n                isLabelSyncedWithName\n                relationDefinition {\n                  relationId\n                  direction\n                  sourceObjectMetadata {\n                    id\n                    nameSingular\n                    namePlural\n                  }\n                  sourceFieldMetadata {\n                    id\n                    name\n                  }\n                  targetObjectMetadata {\n                    id\n                    nameSingular\n                    namePlural\n                  }\n                  targetFieldMetadata {\n                    id\n                    name\n                  }\n                }\n              }\n            }\n            pageInfo {\n              hasNextPage\n              hasPreviousPage\n              startCursor\n              endCursor\n            }\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ServerlessFunctionFields on ServerlessFunction {\n    id\n    name\n    description\n    runtime\n    timeoutSeconds\n    syncStatus\n    latestVersion\n    latestVersionInputSchema\n    publishedVersions\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment ServerlessFunctionFields on ServerlessFunction {\n    id\n    name\n    description\n    runtime\n    timeoutSeconds\n    syncStatus\n    latestVersion\n    latestVersionInputSchema\n    publishedVersions\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation CreateOneServerlessFunctionItem(\n    $input: CreateServerlessFunctionInput!\n  ) {\n    createOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateOneServerlessFunctionItem(\n    $input: CreateServerlessFunctionInput!\n  ) {\n    createOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation DeleteOneServerlessFunction($input: ServerlessFunctionIdInput!) {\n    deleteOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation DeleteOneServerlessFunction($input: ServerlessFunctionIdInput!) {\n    deleteOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ExecuteOneServerlessFunction(\n    $input: ExecuteServerlessFunctionInput!\n  ) {\n    executeOneServerlessFunction(input: $input) {\n      data\n      duration\n      status\n      error\n    }\n  }\n"): (typeof documents)["\n  mutation ExecuteOneServerlessFunction(\n    $input: ExecuteServerlessFunctionInput!\n  ) {\n    executeOneServerlessFunction(input: $input) {\n      data\n      duration\n      status\n      error\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation PublishOneServerlessFunction(\n    $input: PublishServerlessFunctionInput!\n  ) {\n    publishServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation PublishOneServerlessFunction(\n    $input: PublishServerlessFunctionInput!\n  ) {\n    publishServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  mutation UpdateOneServerlessFunction($input: UpdateServerlessFunctionInput!) {\n    updateOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateOneServerlessFunction($input: UpdateServerlessFunctionInput!) {\n    updateOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManyAvailablePackages($input: ServerlessFunctionIdInput!) {\n    getAvailablePackages(input: $input)\n  }\n"): (typeof documents)["\n  query FindManyAvailablePackages($input: ServerlessFunctionIdInput!) {\n    getAvailablePackages(input: $input)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query GetManyServerlessFunctions {\n    findManyServerlessFunctions {\n      ...ServerlessFunctionFields\n    }\n  }\n"): (typeof documents)["\n  \n  query GetManyServerlessFunctions {\n    findManyServerlessFunctions {\n      ...ServerlessFunctionFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  \n  query GetOneServerlessFunction($input: ServerlessFunctionIdInput!) {\n    findOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"): (typeof documents)["\n  \n  query GetOneServerlessFunction($input: ServerlessFunctionIdInput!) {\n    findOneServerlessFunction(input: $input) {\n      ...ServerlessFunctionFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneServerlessFunctionSourceCode(\n    $input: GetServerlessFunctionSourceCodeInput!\n  ) {\n    getServerlessFunctionSourceCode(input: $input)\n  }\n"): (typeof documents)["\n  query FindOneServerlessFunctionSourceCode(\n    $input: GetServerlessFunctionSourceCodeInput!\n  ) {\n    getServerlessFunctionSourceCode(input: $input)\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;