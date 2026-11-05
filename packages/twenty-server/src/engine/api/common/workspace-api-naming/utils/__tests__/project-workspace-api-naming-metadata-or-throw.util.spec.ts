import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { projectWorkspaceApiNamingMetadataOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/project-workspace-api-naming-metadata-or-throw.util';
import { WorkspaceApiNamingException } from 'src/engine/api/common/workspace-api-naming/workspace-api-naming.exception';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';

const CONVERSATION_ID = '20202020-1111-4111-8111-111111111111';
const CONVERSATION_UNIVERSAL_IDENTIFIER =
  '20202020-2222-4222-8222-222222222222';
const EXECUTION_ID = '20202020-3333-4333-8333-333333333333';
const EXECUTION_UNIVERSAL_IDENTIFIER = '20202020-4444-4444-8444-444444444444';
const TITLE_UNIVERSAL_IDENTIFIER = '20202020-5555-4555-8555-555555555555';
const SUMMARY_UNIVERSAL_IDENTIFIER = '20202020-6666-4666-8666-666666666666';
const THREAD_UNIVERSAL_IDENTIFIER = '20202020-7777-4777-8777-777777777777';
const REFERENCE_UNIVERSAL_IDENTIFIER = '20202020-8888-4888-8888-888888888888';
const STATUS_UNIVERSAL_IDENTIFIER = '20202020-9999-4999-8999-999999999999';

const LEGACY_VIEW = {
  id: 'legacy',
  objects: {
    [CONVERSATION_UNIVERSAL_IDENTIFIER]: {
      nameSingular: 'conversation',
      namePlural: 'conversations',
    },
  },
  fields: { [TITLE_UNIVERSAL_IDENTIFIER]: 'title' },
} satisfies WorkspaceApiNamingView;

const CURRENT_VIEW = {
  id: 'current',
  objects: {
    [CONVERSATION_UNIVERSAL_IDENTIFIER]: {
      nameSingular: 'discussion',
      namePlural: 'discussions',
    },
  },
  fields: { [TITLE_UNIVERSAL_IDENTIFIER]: 'headline' },
} satisfies WorkspaceApiNamingView;

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

const buildMetadata = ({
  conversationNameSingular,
  conversationNamePlural,
  titleName,
  titleType = FieldMetadataType.TEXT,
}: {
  conversationNameSingular: string;
  conversationNamePlural: string;
  titleName: string;
  titleType?: FieldMetadataType;
}): WorkspaceApiNamingMetadata => {
  const title = getFlatFieldMetadataMock({
    universalIdentifier: TITLE_UNIVERSAL_IDENTIFIER,
    objectMetadataId: CONVERSATION_ID,
    objectMetadataUniversalIdentifier: CONVERSATION_UNIVERSAL_IDENTIFIER,
    type: titleType,
    name: titleName,
  });
  const summary = getFlatFieldMetadataMock({
    universalIdentifier: SUMMARY_UNIVERSAL_IDENTIFIER,
    objectMetadataId: CONVERSATION_ID,
    objectMetadataUniversalIdentifier: CONVERSATION_UNIVERSAL_IDENTIFIER,
    type: FieldMetadataType.TEXT,
    name: 'summary',
  });
  const thread = getFlatFieldMetadataMock({
    universalIdentifier: THREAD_UNIVERSAL_IDENTIFIER,
    objectMetadataId: EXECUTION_ID,
    objectMetadataUniversalIdentifier: EXECUTION_UNIVERSAL_IDENTIFIER,
    type: FieldMetadataType.RELATION,
    name: 'thread',
    relationTargetObjectMetadataId: CONVERSATION_ID,
    relationTargetObjectMetadataUniversalIdentifier:
      CONVERSATION_UNIVERSAL_IDENTIFIER,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
      joinColumnName: 'threadId',
    },
  });
  const reference = getFlatFieldMetadataMock({
    universalIdentifier: REFERENCE_UNIVERSAL_IDENTIFIER,
    objectMetadataId: EXECUTION_ID,
    objectMetadataUniversalIdentifier: EXECUTION_UNIVERSAL_IDENTIFIER,
    type: FieldMetadataType.UUID,
    name: 'threadReferenceId',
  });

  const status = getFlatFieldMetadataMock({
    universalIdentifier: STATUS_UNIVERSAL_IDENTIFIER,
    objectMetadataId: EXECUTION_ID,
    objectMetadataUniversalIdentifier: EXECUTION_UNIVERSAL_IDENTIFIER,
    type: FieldMetadataType.SELECT,
    name: 'status',
    options: [],
  });

  return {
    flatObjectMetadataMaps: buildMetadataMaps([
      getFlatObjectMetadataMock({
        id: CONVERSATION_ID,
        universalIdentifier: CONVERSATION_UNIVERSAL_IDENTIFIER,
        nameSingular: conversationNameSingular,
        namePlural: conversationNamePlural,
        targetTableName: 'storedConversation',
        fieldIds: [title.id, summary.id],
        fieldUniversalIdentifiers: [
          TITLE_UNIVERSAL_IDENTIFIER,
          SUMMARY_UNIVERSAL_IDENTIFIER,
        ],
      }),
      getFlatObjectMetadataMock({
        id: EXECUTION_ID,
        universalIdentifier: EXECUTION_UNIVERSAL_IDENTIFIER,
        nameSingular: 'execution',
        namePlural: 'executions',
        fieldIds: [thread.id, reference.id, status.id],
        fieldUniversalIdentifiers: [
          THREAD_UNIVERSAL_IDENTIFIER,
          REFERENCE_UNIVERSAL_IDENTIFIER,
          STATUS_UNIVERSAL_IDENTIFIER,
        ],
      }),
    ]),
    flatFieldMetadataMaps: buildMetadataMaps([
      title,
      summary,
      thread,
      reference,
      status,
    ]),
    flatIndexMaps: createEmptyFlatEntityMaps(),
  };
};

describe('projectWorkspaceApiNamingMetadataOrThrow', () => {
  it.each([
    {
      conversationNameSingular: 'conversation',
      conversationNamePlural: 'conversations',
      titleName: 'title',
    },
    {
      conversationNameSingular: 'discussion',
      conversationNamePlural: 'discussions',
      titleName: 'headline',
    },
  ])(
    'projects both API views from canonical $conversationNameSingular metadata',
    (canonicalNames) => {
      const metadata = buildMetadata(canonicalNames);
      const originalMetadata = structuredClone(metadata);

      for (const view of [LEGACY_VIEW, CURRENT_VIEW]) {
        const projected = projectWorkspaceApiNamingMetadataOrThrow({
          view,
          metadata,
        });

        expect(
          projected.flatObjectMetadataMaps.byUniversalIdentifier[
            CONVERSATION_UNIVERSAL_IDENTIFIER
          ],
        ).toEqual({
          ...metadata.flatObjectMetadataMaps.byUniversalIdentifier[
            CONVERSATION_UNIVERSAL_IDENTIFIER
          ],
          ...view.objects[CONVERSATION_UNIVERSAL_IDENTIFIER],
        });
        expect(
          projected.flatFieldMetadataMaps.byUniversalIdentifier[
            TITLE_UNIVERSAL_IDENTIFIER
          ],
        ).toEqual({
          ...metadata.flatFieldMetadataMaps.byUniversalIdentifier[
            TITLE_UNIVERSAL_IDENTIFIER
          ],
          name: view.fields[TITLE_UNIVERSAL_IDENTIFIER],
        });
        expect(
          projected.flatFieldMetadataMaps.byUniversalIdentifier[
            THREAD_UNIVERSAL_IDENTIFIER
          ],
        ).toEqual(
          metadata.flatFieldMetadataMaps.byUniversalIdentifier[
            THREAD_UNIVERSAL_IDENTIFIER
          ],
        );
        expect(
          projected.flatObjectMetadataMaps.byUniversalIdentifier[
            EXECUTION_UNIVERSAL_IDENTIFIER
          ],
        ).toEqual(
          metadata.flatObjectMetadataMaps.byUniversalIdentifier[
            EXECUTION_UNIVERSAL_IDENTIFIER
          ],
        );
        expect(
          projected.flatObjectMetadataMaps.universalIdentifierById,
        ).toEqual(metadata.flatObjectMetadataMaps.universalIdentifierById);
        expect(projected.flatFieldMetadataMaps.universalIdentifierById).toEqual(
          metadata.flatFieldMetadataMaps.universalIdentifierById,
        );
        expect(projected.flatIndexMaps).toBe(metadata.flatIndexMaps);
      }

      expect(metadata).toEqual(originalMetadata);
    },
  );

  it.each<{
    name: string;
    view: WorkspaceApiNamingView;
    error: RegExp;
  }>([
    {
      name: 'an empty view ID',
      view: { ...LEGACY_VIEW, id: ' ' },
      error: /view ID is empty/,
    },
    {
      name: 'an unknown object',
      view: {
        ...LEGACY_VIEW,
        objects: { unknown: { nameSingular: 'item', namePlural: 'items' } },
      },
      error: /Unknown object universal identifier/,
    },
    {
      name: 'an unknown field',
      view: { ...LEGACY_VIEW, fields: { unknown: 'headline' } },
      error: /Unknown field universal identifier/,
    },
    {
      name: 'an invalid object name',
      view: {
        ...LEGACY_VIEW,
        objects: {
          [CONVERSATION_UNIVERSAL_IDENTIFIER]: {
            nameSingular: 'invalid-name',
            namePlural: 'items',
          },
        },
      },
      error: /Name is not valid/,
    },
    {
      name: 'an invalid field name',
      view: {
        ...LEGACY_VIEW,
        fields: { [TITLE_UNIVERSAL_IDENTIFIER]: 'invalid-name' },
      },
      error: /Name is not valid/,
    },
    {
      name: 'an object name shared with another plural',
      view: {
        ...LEGACY_VIEW,
        objects: {
          [CONVERSATION_UNIVERSAL_IDENTIFIER]: {
            nameSingular: 'executions',
            namePlural: 'discussions',
          },
        },
      },
      error: /API name "executions" is shared/,
    },
    {
      name: 'a generated type collision',
      view: {
        ...LEGACY_VIEW,
        objects: {
          [CONVERSATION_UNIVERSAL_IDENTIFIER]: {
            nameSingular: 'executionEdge',
            namePlural: 'executionEdges',
          },
        },
      },
      error: /API name "ExecutionEdge" is shared/,
    },
    {
      name: 'a generated root resolver collision',
      view: {
        ...LEGACY_VIEW,
        objects: {
          [CONVERSATION_UNIVERSAL_IDENTIFIER]: {
            nameSingular: 'executionDuplicates',
            namePlural: 'discussionItems',
          },
        },
      },
      error: /API name "executionDuplicates" is shared/,
    },
    {
      name: 'a duplicate field on the same object',
      view: {
        ...LEGACY_VIEW,
        fields: { [TITLE_UNIVERSAL_IDENTIFIER]: 'summary' },
      },
      error: /API name "summary" is shared/,
    },
    {
      name: 'a generated relation ID collision',
      view: {
        ...LEGACY_VIEW,
        fields: { [THREAD_UNIVERSAL_IDENTIFIER]: 'threadReference' },
      },
      error: /API name "threadReferenceId" is shared/,
    },
  ])('rejects $name', ({ view, error }) => {
    const metadata = buildMetadata({
      conversationNameSingular: 'conversation',
      conversationNamePlural: 'conversations',
      titleName: 'title',
    });

    expect(() =>
      projectWorkspaceApiNamingMetadataOrThrow({ view, metadata }),
    ).toThrow(error);
    expect(() =>
      projectWorkspaceApiNamingMetadataOrThrow({ view, metadata }),
    ).toThrow(WorkspaceApiNamingException);
  });

  it.each([
    'dateFilter',
    'actorContext',
    'orderByDirection',
    'fullNameCreateInput',
    'actorSourceEnum',
    'executionStatusEnum',
    'executionStatusEnumFilter',
  ])(
    'rejects an object name colliding with the GraphQL type %s',
    (nameSingular) => {
      const metadata = buildMetadata({
        conversationNameSingular: 'conversation',
        conversationNamePlural: 'conversations',
        titleName: 'title',
      });

      expect(() =>
        projectWorkspaceApiNamingMetadataOrThrow({
          metadata,
          view: {
            ...LEGACY_VIEW,
            objects: {
              [CONVERSATION_UNIVERSAL_IDENTIFIER]: {
                nameSingular,
                namePlural: `${nameSingular}s`,
              },
            },
          },
        }),
      ).toThrow(WorkspaceApiNamingException);
    },
  );

  it('validates enum types using the projected field name', () => {
    const metadata = buildMetadata({
      conversationNameSingular: 'conversation',
      conversationNamePlural: 'conversations',
      titleName: 'title',
    });

    expect(() =>
      projectWorkspaceApiNamingMetadataOrThrow({
        metadata,
        view: {
          id: 'current',
          objects: {
            [CONVERSATION_UNIVERSAL_IDENTIFIER]: {
              nameSingular: 'executionPhaseEnum',
              namePlural: 'executionPhaseEnums',
            },
          },
          fields: { [STATUS_UNIVERSAL_IDENTIFIER]: 'phase' },
        },
      }),
    ).toThrow(/API name "ExecutionPhaseEnum" is shared/);
  });

  it('reserves composite WhereInput names only for indexed unique fields', () => {
    const metadata = buildMetadata({
      conversationNameSingular: 'conversation',
      conversationNamePlural: 'conversations',
      titleName: 'emailAddress',
      titleType: FieldMetadataType.EMAILS,
    });
    const conversation = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: metadata.flatObjectMetadataMaps,
      universalIdentifier: CONVERSATION_UNIVERSAL_IDENTIFIER,
    });
    const title = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: metadata.flatFieldMetadataMaps,
      universalIdentifier: TITLE_UNIVERSAL_IDENTIFIER,
    });
    const primaryKeyField = getFlatFieldMetadataMock({
      universalIdentifier: '20202020-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      objectMetadataId: CONVERSATION_ID,
      objectMetadataUniversalIdentifier: CONVERSATION_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.UUID,
      name: 'id',
    });
    metadata.flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: primaryKeyField,
      flatEntityMaps: metadata.flatFieldMetadataMaps,
    });
    conversation.fieldIds.push(primaryKeyField.id);
    const index = getFlatIndexMetadataMock({
      universalIdentifier: '20202020-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      objectMetadataId: CONVERSATION_ID,
      objectMetadataUniversalIdentifier: CONVERSATION_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier:
        conversation.applicationUniversalIdentifier,
    });
    index.flatIndexFieldMetadatas = [
      {
        id: '20202020-cccc-4ccc-8ccc-cccccccccccc',
        workspaceId: conversation.workspaceId,
        indexMetadataId: index.id,
        fieldMetadataId: title.id,
        order: 0,
        subFieldName: 'primaryEmail',
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    ];
    metadata.flatIndexMaps = buildMetadataMaps([index]);
    conversation.indexMetadataIds.push(index.id);
    const view = {
      ...CURRENT_VIEW,
      objects: {
        ...CURRENT_VIEW.objects,
        [EXECUTION_UNIVERSAL_IDENTIFIER]: {
          nameSingular: 'discussionEmailsWhereInput',
          namePlural: 'discussionEmailsWhereInputs',
        },
      },
      fields: { [TITLE_UNIVERSAL_IDENTIFIER]: 'emails' },
    };

    expect(() =>
      projectWorkspaceApiNamingMetadataOrThrow({ metadata, view }),
    ).not.toThrow();
    index.isUnique = true;
    expect(() =>
      projectWorkspaceApiNamingMetadataOrThrow({ metadata, view }),
    ).toThrow(/API name "DiscussionEmailsWhereInput" is shared/);
  });

  it('keeps storage join columns unchanged when projecting a relation name', () => {
    const metadata = buildMetadata({
      conversationNameSingular: 'conversation',
      conversationNamePlural: 'conversations',
      titleName: 'title',
    });
    const projected = projectWorkspaceApiNamingMetadataOrThrow({
      view: {
        ...CURRENT_VIEW,
        fields: { [THREAD_UNIVERSAL_IDENTIFIER]: 'conversation' },
      },
      metadata,
    });

    expect(
      projected.flatFieldMetadataMaps.byUniversalIdentifier[
        THREAD_UNIVERSAL_IDENTIFIER
      ],
    ).toMatchObject({
      name: 'conversation',
      relationTargetObjectMetadataId: CONVERSATION_ID,
      settings: { joinColumnName: 'threadId' },
    });
    expect(
      metadata.flatFieldMetadataMaps.byUniversalIdentifier[
        THREAD_UNIVERSAL_IDENTIFIER
      ]?.name,
    ).toBe('thread');
  });

  it('allows the same field name on different objects', () => {
    const metadata = buildMetadata({
      conversationNameSingular: 'conversation',
      conversationNamePlural: 'conversations',
      titleName: 'title',
    });

    expect(() =>
      projectWorkspaceApiNamingMetadataOrThrow({
        view: {
          ...LEGACY_VIEW,
          fields: { [TITLE_UNIVERSAL_IDENTIFIER]: 'threadReferenceId' },
        },
        metadata,
      }),
    ).not.toThrow();
  });
});
