import {
  getNamedType,
  type GraphQLType,
  isInputObjectType,
  isObjectType,
} from 'graphql';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { getNodeTypename } from 'twenty-shared/utils';

import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { buildWorkspaceApiNamingBindingsOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/build-workspace-api-naming-bindings-or-throw.util';
import { projectWorkspaceApiNamingMetadataOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/project-workspace-api-naming-metadata-or-throw.util';
import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';
import { GqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/gql-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { WorkspaceGraphQLSchemaGenerator } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const CONVERSATION_ID = 'conversation-id';
const EXECUTION_ID = 'execution-id';

const LEGACY_VIEW: WorkspaceApiNamingView = {
  id: 'legacy',
  objects: {
    conversation: {
      nameSingular: 'conversation',
      namePlural: 'conversations',
    },
  },
  fields: {
    'conversation-title': 'title',
    'conversation-amount': 'amount',
    'conversation-emails': 'emails',
    'conversation-status': 'status',
    'conversation-node': 'node',
    'conversation-edges': 'edges',
    'conversation-connect': 'connectValue',
    'conversation-where': 'where',
    'conversation-executions': 'executions',
    'execution-thread': 'thread',
  },
};

const CURRENT_VIEW: WorkspaceApiNamingView = {
  id: 'current',
  objects: {
    conversation: {
      nameSingular: 'discussion',
      namePlural: 'discussions',
    },
  },
  fields: {
    'conversation-title': 'headline',
    'conversation-amount': 'cost',
    'conversation-emails': 'contactEmails',
    'conversation-status': 'state',
    'conversation-node': 'item',
    'conversation-edges': 'edgeItems',
    'conversation-connect': 'attach',
    'conversation-where': 'criteria',
    'conversation-executions': 'activities',
    'execution-thread': 'discussion',
  },
};

const buildMetadataMaps = <TMetadataEntity extends SyncableFlatEntity>(
  entities: TMetadataEntity[],
): FlatEntityMaps<TMetadataEntity> => {
  let flatEntityMaps: FlatEntityMaps<TMetadataEntity> =
    createEmptyFlatEntityMaps();

  for (const flatEntity of entities) {
    flatEntityMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps,
    });
  }

  return flatEntityMaps;
};

const buildMetadata = (): WorkspaceApiNamingMetadata => {
  const conversationFields = Object.entries({
    title: 'title',
    node: 'node',
    edges: 'edges',
    connect: 'connectValue',
    where: 'where',
  }).map(([identifier, name]) =>
    getFlatFieldMetadataMock({
      name,
      universalIdentifier: `conversation-${identifier}`,
      objectMetadataId: CONVERSATION_ID,
      type: FieldMetadataType.TEXT,
    }),
  );
  const emails = getFlatFieldMetadataMock({
    universalIdentifier: 'conversation-emails',
    objectMetadataId: CONVERSATION_ID,
    type: FieldMetadataType.EMAILS,
    name: 'emails',
  });
  const executionFields = [
    getFlatFieldMetadataMock({
      universalIdentifier: 'execution-id-field',
      objectMetadataId: EXECUTION_ID,
      type: FieldMetadataType.UUID,
      name: 'id',
    }),
    getFlatFieldMetadataMock({
      universalIdentifier: 'execution-thread',
      objectMetadataId: EXECUTION_ID,
      type: FieldMetadataType.RELATION,
      name: 'thread',
      relationTargetObjectMetadataId: CONVERSATION_ID,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'threadId',
      },
    }),
  ];

  conversationFields.push(
    getFlatFieldMetadataMock({
      universalIdentifier: 'conversation-id-field',
      objectMetadataId: CONVERSATION_ID,
      type: FieldMetadataType.UUID,
      name: 'id',
    }),
    emails,
    getFlatFieldMetadataMock({
      universalIdentifier: 'conversation-amount',
      objectMetadataId: CONVERSATION_ID,
      type: FieldMetadataType.CURRENCY,
      name: 'amount',
    }),
    getFlatFieldMetadataMock({
      universalIdentifier: 'conversation-status',
      objectMetadataId: CONVERSATION_ID,
      type: FieldMetadataType.SELECT,
      name: 'status',
      options: [
        {
          id: 'open',
          value: 'OPEN',
          label: 'Open',
          position: 0,
          color: 'green',
        },
      ],
    }),
    getFlatFieldMetadataMock({
      universalIdentifier: 'conversation-executions',
      objectMetadataId: CONVERSATION_ID,
      type: FieldMetadataType.RELATION,
      name: 'executions',
      relationTargetObjectMetadataId: EXECUTION_ID,
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        onDelete: RelationOnDeleteAction.SET_NULL,
      },
    }),
  );

  const conversation = getFlatObjectMetadataMock({
    id: CONVERSATION_ID,
    universalIdentifier: 'conversation',
    nameSingular: 'conversation',
    namePlural: 'conversations',
    fieldIds: conversationFields.map((field) => field.id),
  });
  const execution = getFlatObjectMetadataMock({
    id: EXECUTION_ID,
    universalIdentifier: 'execution',
    nameSingular: 'execution',
    namePlural: 'executions',
    fieldIds: executionFields.map((field) => field.id),
  });
  const index = getFlatIndexMetadataMock({
    universalIdentifier: 'conversation-emails-index',
    objectMetadataId: CONVERSATION_ID,
    objectMetadataUniversalIdentifier: conversation.universalIdentifier,
    applicationUniversalIdentifier: conversation.applicationUniversalIdentifier,
    isUnique: true,
  });

  index.flatIndexFieldMetadatas = [
    {
      id: 'emails-index-field',
      workspaceId: conversation.workspaceId,
      indexMetadataId: index.id,
      fieldMetadataId: emails.id,
      order: 0,
      subFieldName: 'primaryEmail',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    },
  ];
  conversation.indexMetadataIds = [index.id];

  return {
    flatObjectMetadataMaps: buildMetadataMaps([conversation, execution]),
    flatFieldMetadataMaps: buildMetadataMaps([
      ...conversationFields,
      ...executionFields,
    ]),
    flatIndexMaps: buildMetadataMaps([index]),
  };
};

describe('buildWorkspaceApiNamingBindingsOrThrow', () => {
  it.each([LEGACY_VIEW, CURRENT_VIEW])(
    'binds both API views against canonical $id metadata without changing it',
    (canonicalView) => {
      const metadata = projectWorkspaceApiNamingMetadataOrThrow({
        metadata: buildMetadata(),
        view: canonicalView,
      });
      const canonicalConversationName =
        canonicalView.objects.conversation.nameSingular;
      const originalMetadata = structuredClone(metadata);

      for (const view of [LEGACY_VIEW, CURRENT_VIEW]) {
        const bindings = buildWorkspaceApiNamingBindingsOrThrow({
          metadata,
          view,
        });
        const apiConversationName = view.objects.conversation.nameSingular;

        expect(bindings.resolverNameMap.Query[apiConversationName]).toEqual({
          objectMetadataUniversalIdentifier: 'conversation',
          method: 'findOne',
          operationType: 'query',
        });
        expect(
          bindings.canonicalTypeNameByApiTypeName[
            getNodeTypename(apiConversationName)
          ],
        ).toBe(getNodeTypename(canonicalConversationName));
        expect(
          bindings.canonicalFieldNameByApiTypeNameAndApiFieldName.Execution[
            view.fields['execution-thread']
          ],
        ).toBe(canonicalView.fields['execution-thread']);
        expect(
          bindings.resolverNameMap.Query.executionDuplicates,
        ).toBeUndefined();
      }

      expect(metadata).toEqual(originalMetadata);
    },
  );

  it('separates metadata fields, aggregations, relation wrappers and unique composite inputs', () => {
    const metadata = buildMetadata();
    const connectField = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: metadata.flatFieldMetadataMaps,
      universalIdentifier: 'conversation-connect',
    });

    connectField.name = 'connect';

    const bindings = buildWorkspaceApiNamingBindingsOrThrow({
      metadata,
      view: CURRENT_VIEW,
    });
    const fieldsByType =
      bindings.canonicalFieldNameByApiTypeNameAndApiFieldName;

    expect(fieldsByType.Discussion).toMatchObject({
      headline: 'title',
      item: 'node',
      edgeItems: 'edges',
      attach: 'connect',
      criteria: 'where',
      activities: 'executions',
    });
    expect(fieldsByType.Execution).toEqual({
      id: 'id',
      discussion: 'thread',
      discussionId: 'threadId',
    });
    expect(fieldsByType.ExecutionCreateInput.discussionId).toBe('threadId');
    expect(fieldsByType.DiscussionCreateInput.activities).toBeUndefined();
    expect(fieldsByType.DiscussionFilterInput.and).toBe('and');
    expect(fieldsByType.DiscussionConnection).toMatchObject({
      edges: 'edges',
      totalCount: 'totalCount',
      countEmptyHeadline: 'countEmptyTitle',
      sumCostAmountMicros: 'sumAmountAmountMicros',
    });
    expect(fieldsByType.DiscussionConnection.headline).toBeUndefined();
    expect(
      fieldsByType.DiscussionOrderByWithGroupByAggregateInput,
    ).toMatchObject({
      sumCostAmountMicros: 'sumAmountAmountMicros',
    });
    expect(
      fieldsByType.ExecutionOrderByWithGroupByAggregateInput,
    ).toMatchObject({
      discussion: 'thread',
      discussionId: 'threadId',
    });
    expect(fieldsByType.DiscussionEdge).toEqual({
      cursor: 'cursor',
      node: 'node',
    });
    expect(fieldsByType.DiscussionRelationInput).toEqual({
      connect: 'connect',
      create: 'create',
      disconnect: 'disconnect',
    });
    expect(fieldsByType.DiscussionConnectInput).toEqual({ where: 'where' });
    expect(fieldsByType.DiscussionWhereUniqueInput).toEqual({
      id: 'id',
      contactEmails: 'emails',
    });
    expect(fieldsByType.DiscussionContactEmailsWhereInput).toEqual({
      primaryEmail: 'primaryEmail',
    });
    expect(bindings.canonicalTypeNameByApiTypeName).toMatchObject({
      DiscussionStateEnum: 'ConversationStatusEnum',
      DiscussionStateEnumFilter: 'ConversationStatusEnumFilter',
      DiscussionContactEmailsWhereInput: 'ConversationEmailsWhereInput',
    });
  });

  it('matches generated canonical and API schema fields and type references', async () => {
    const metadata = buildMetadata();
    const apiMetadata = projectWorkspaceApiNamingMetadataOrThrow({
      metadata,
      view: CURRENT_VIEW,
    });
    const generator = new WorkspaceGraphQLSchemaGenerator(
      new GqlTypeGenerator(
        new TypeMapperService(),
        new WorkspaceResolverBuilderService(),
      ),
    );
    const canonicalSchema = await generator.generateSchema(metadata);
    const apiSchema = await generator.generateSchema(apiMetadata);
    const bindings = buildWorkspaceApiNamingBindingsOrThrow({
      metadata,
      view: CURRENT_VIEW,
    });

    for (const [apiTypeName, canonicalTypeName] of Object.entries(
      bindings.canonicalTypeNameByApiTypeName,
    )) {
      expect(apiSchema.getType(apiTypeName)).toBeDefined();
      expect(canonicalSchema.getType(canonicalTypeName)).toBeDefined();
    }

    for (const [apiTypeName, fieldBindings] of Object.entries(
      bindings.canonicalFieldNameByApiTypeNameAndApiFieldName,
    )) {
      const apiType = apiSchema.getType(apiTypeName);
      const canonicalType = canonicalSchema.getType(
        bindings.canonicalTypeNameByApiTypeName[apiTypeName],
      );

      if (
        (!isObjectType(apiType) && !isInputObjectType(apiType)) ||
        (!isObjectType(canonicalType) && !isInputObjectType(canonicalType))
      ) {
        throw new Error(`Missing generated type pair for ${apiTypeName}`);
      }

      for (const [apiFieldName, canonicalFieldName] of Object.entries(
        fieldBindings,
      )) {
        expect(apiType.getFields()[apiFieldName]).toBeDefined();
        expect(canonicalType.getFields()[canonicalFieldName]).toBeDefined();
      }

      for (const [apiFieldName, apiField] of Object.entries(
        apiType.getFields(),
      )) {
        const canonicalFieldName = fieldBindings[apiFieldName] ?? apiFieldName;
        const canonicalField = canonicalType.getFields()[canonicalFieldName];
        const apiFieldType: GraphQLType = apiField.type;
        const apiFieldTypeName = getNamedType(apiFieldType).name;

        expect(canonicalField).toBeDefined();
        expect(
          bindings.canonicalTypeNameByApiTypeName[apiFieldTypeName] ??
            apiFieldTypeName,
        ).toBe(getNamedType(canonicalField.type).name);
      }
    }
  });

  it('keeps query and mutation bindings with the same root spelling', () => {
    const bindings = buildWorkspaceApiNamingBindingsOrThrow({
      metadata: buildMetadata(),
      view: {
        ...CURRENT_VIEW,
        objects: {
          ...CURRENT_VIEW.objects,
          execution: {
            nameSingular: 'createDiscussion',
            namePlural: 'createDiscussions',
          },
        },
      },
    });

    expect(bindings.resolverNameMap.Query.createDiscussion).toMatchObject({
      objectMetadataUniversalIdentifier: 'execution',
      method: 'findOne',
    });
    expect(bindings.resolverNameMap.Mutation.createDiscussion).toMatchObject({
      objectMetadataUniversalIdentifier: 'conversation',
      method: 'createOne',
    });
  });

  it('rejects renaming the primary id field', () => {
    expect(() =>
      buildWorkspaceApiNamingBindingsOrThrow({
        metadata: buildMetadata(),
        view: {
          ...CURRENT_VIEW,
          fields: {
            ...CURRENT_VIEW.fields,
            'conversation-id-field': 'recordId',
          },
        },
      }),
    ).toThrow('The primary ID field cannot use a different API name');
  });

  it('preserves existing reserved names while rejecting newly reserved aliases', () => {
    const metadata = buildMetadata();
    const fieldMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: metadata.flatFieldMetadataMaps,
      universalIdentifier: 'conversation-connect',
    });

    fieldMetadata.name = 'connect';

    expect(
      projectWorkspaceApiNamingMetadataOrThrow({
        metadata,
        view: {
          id: 'legacy',
          objects: {},
          fields: { 'conversation-connect': 'connect' },
        },
      }).flatFieldMetadataMaps.byUniversalIdentifier['conversation-connect']
        ?.name,
    ).toBe('connect');
    expect(() =>
      projectWorkspaceApiNamingMetadataOrThrow({
        metadata,
        view: {
          id: 'invalid',
          objects: {},
          fields: { 'conversation-connect': 'create' },
        },
      }),
    ).toThrow(/reserved/);
  });

  it('rejects changing the grouping eligibility of a system date field', () => {
    const metadata = buildMetadata();
    const fieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: 'conversation-created-at',
      objectMetadataId: CONVERSATION_ID,
      type: FieldMetadataType.DATE_TIME,
      name: 'createdAt',
      isSystem: true,
    });

    metadata.flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: fieldMetadata,
      flatEntityMaps: metadata.flatFieldMetadataMaps,
    });

    expect(() =>
      projectWorkspaceApiNamingMetadataOrThrow({
        metadata,
        view: {
          id: 'current',
          objects: {},
          fields: { 'conversation-created-at': 'createdOn' },
        },
      }),
    ).toThrow('API field name "createdOn" changes grouping eligibility');
  });
});
