import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildWorkflowManifestObjectMetadataMaps } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-object-metadata-maps.util';
import { preallocateWorkflowReferenceIds } from 'src/engine/core-modules/application/application-manifest/utils/preallocate-workflow-reference-ids.util';
import {
  mockFlatFieldMetadataMaps,
  mockFlatObjectMetadataMaps,
} from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getObjectMetadataInfoOrThrow } from 'src/modules/workflow/common/utils/get-object-metadata-info-or-throw.util';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';

const OWNER_APPLICATION_ID = 'owner-application-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const TICKET_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';
const PERSON_UNIVERSAL_IDENTIFIER = '20202020-8dec-43d5-b2ff-6eef05095bec';
const COMPANY_UNIVERSAL_IDENTIFIER = '20202020-c03c-45d6-a4b0-04afe1357c5c';

const ticket = {
  universalIdentifier: TICKET_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  nameSingular: 'ticket',
  namePlural: 'tickets',
  labelSingular: 'Ticket',
  labelPlural: 'Tickets',
  description: null,
  icon: 'IconTicket',
} as FlatObjectMetadata;

const applicationField = ({
  universalIdentifier,
  objectMetadataUniversalIdentifier = TICKET_UNIVERSAL_IDENTIFIER,
  name,
  type = FieldMetadataType.TEXT,
  universalSettings = null,
}: {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier?: string;
  name: string;
  type?: FieldMetadataType;
  universalSettings?: object | null;
}) =>
  ({
    universalIdentifier,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier,
    name,
    label: name,
    type,
    icon: null,
    isActive: true,
    isSystem: false,
    overrides: null,
    universalSettings,
  }) as FlatFieldMetadata;

const existingWorkspaceMaps = (): AllFlatEntityMaps => ({
  ...createEmptyAllFlatEntityMaps(),
  flatObjectMetadataMaps: structuredClone(mockFlatObjectMetadataMaps),
  flatFieldMetadataMaps: structuredClone(mockFlatFieldMetadataMaps),
});

const build = ({
  existing,
  installed,
  proposed,
}: {
  existing: AllFlatEntityMaps;
  installed: AllFlatEntityMaps;
  proposed: AllFlatEntityMaps;
}) => {
  const idByUniversalIdentifierByMetadataName = preallocateWorkflowReferenceIds(
    {
      fromAllFlatEntityMaps: installed,
      toAllUniversalFlatEntityMaps: proposed,
    },
  );

  return {
    idByUniversalIdentifierByMetadataName,
    objectMetadataMaps: buildWorkflowManifestObjectMetadataMaps({
      toAllUniversalFlatEntityMaps: proposed,
      existingAllFlatEntityMaps: existing,
      ownerApplicationId: OWNER_APPLICATION_ID,
      idByUniversalIdentifierByMetadataName,
    }),
  };
};

describe('buildWorkflowManifestObjectMetadataMaps', () => {
  it('describes a new application object with the IDs its fields will be created with', () => {
    const proposed = createEmptyAllFlatEntityMaps();
    proposed.flatObjectMetadataMaps.byUniversalIdentifier[
      TICKET_UNIVERSAL_IDENTIFIER
    ] = ticket;
    proposed.flatFieldMetadataMaps.byUniversalIdentifier.subject =
      applicationField({ universalIdentifier: 'subject', name: 'subject' });
    proposed.flatFieldMetadataMaps.byUniversalIdentifier.company =
      applicationField({
        universalIdentifier: 'company',
        name: 'company',
        type: FieldMetadataType.RELATION,
        universalSettings: { relationType: RelationType.MANY_TO_ONE },
      });

    const { idByUniversalIdentifierByMetadataName, objectMetadataMaps } = build(
      {
        existing: existingWorkspaceMaps(),
        installed: createEmptyAllFlatEntityMaps(),
        proposed,
      },
    );

    const record = generateFakeObjectRecord({
      objectMetadataInfo: getObjectMetadataInfoOrThrow({
        objectNameSingular: 'ticket',
        objectMetadataMaps,
      }),
    });
    const fieldIds = idByUniversalIdentifierByMetadataName.fieldMetadata ?? {};

    expect(record.object).toMatchObject({
      label: 'Ticket',
      objectMetadataId:
        idByUniversalIdentifierByMetadataName.objectMetadata?.[
          TICKET_UNIVERSAL_IDENTIFIER
        ],
    });
    expect(Object.keys(record.fields).sort()).toEqual(
      [
        'companyId',
        'createdAt',
        'createdBy',
        'deletedAt',
        'id',
        'subject',
        'updatedAt',
        'updatedBy',
      ].sort(),
    );
    expect(record.fields.subject.fieldMetadataId).toBe(fieldIds.subject);
    expect(record.fields.companyId.fieldMetadataId).toBe(fieldIds.company);
    expect(record.fields.id.fieldMetadataId).toBe(
      fieldIds[
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: TICKET_UNIVERSAL_IDENTIFIER,
          name: 'id',
        })
      ],
    );
  });

  it('replaces the installed fields of an application object with the proposed ones', () => {
    const existing = existingWorkspaceMaps();
    const installed = createEmptyAllFlatEntityMaps();
    const installedTicket = {
      ...ticket,
      id: 'ticket-id',
      applicationId: OWNER_APPLICATION_ID,
      fieldIds: ['id-field-id', 'removed-field-id', 'subject-field-id'],
    } as FlatObjectMetadata;
    const installedFields = [
      {
        ...applicationField({ universalIdentifier: 'id-field', name: 'id' }),
        id: 'id-field-id',
        type: FieldMetadataType.UUID,
        isSystem: true,
      },
      {
        ...applicationField({
          universalIdentifier: 'removed',
          name: 'removed',
        }),
        id: 'removed-field-id',
      },
      {
        ...applicationField({
          universalIdentifier: 'subject',
          name: 'subject',
        }),
        id: 'subject-field-id',
      },
    ].map((field) => ({ ...field, applicationId: OWNER_APPLICATION_ID }));

    for (const maps of [existing, installed]) {
      maps.flatObjectMetadataMaps.byUniversalIdentifier[
        TICKET_UNIVERSAL_IDENTIFIER
      ] = installedTicket;
      maps.flatObjectMetadataMaps.universalIdentifierById['ticket-id'] =
        TICKET_UNIVERSAL_IDENTIFIER;
      for (const field of installedFields) {
        maps.flatFieldMetadataMaps.byUniversalIdentifier[
          field.universalIdentifier
        ] = field;
        maps.flatFieldMetadataMaps.universalIdentifierById[field.id] =
          field.universalIdentifier;
      }
    }

    const proposed = createEmptyAllFlatEntityMaps();
    proposed.flatObjectMetadataMaps.byUniversalIdentifier[
      TICKET_UNIVERSAL_IDENTIFIER
    ] = { ...ticket, labelSingular: 'Support ticket' };
    proposed.flatFieldMetadataMaps.byUniversalIdentifier.subject =
      applicationField({ universalIdentifier: 'subject', name: 'title' });

    const { objectMetadataMaps } = build({ existing, installed, proposed });

    const record = generateFakeObjectRecord({
      objectMetadataInfo: getObjectMetadataInfoOrThrow({
        objectNameSingular: 'ticket',
        objectMetadataMaps,
      }),
    });

    expect(record.object).toMatchObject({
      label: 'Support ticket',
      objectMetadataId: 'ticket-id',
    });
    expect(record.fields).toEqual({
      id: expect.objectContaining({ fieldMetadataId: 'id-field-id' }),
      title: expect.objectContaining({ fieldMetadataId: 'subject-field-id' }),
    });
  });

  it('adds application fields to the objects they extend', () => {
    const proposed = createEmptyAllFlatEntityMaps();
    proposed.flatFieldMetadataMaps.byUniversalIdentifier.nickname =
      applicationField({
        universalIdentifier: 'nickname',
        objectMetadataUniversalIdentifier: PERSON_UNIVERSAL_IDENTIFIER,
        name: 'nickname',
      });

    const { idByUniversalIdentifierByMetadataName, objectMetadataMaps } = build(
      {
        existing: existingWorkspaceMaps(),
        installed: createEmptyAllFlatEntityMaps(),
        proposed,
      },
    );

    const personRecord = generateFakeObjectRecord({
      objectMetadataInfo: getObjectMetadataInfoOrThrow({
        objectNameSingular: 'person',
        objectMetadataMaps,
      }),
    });
    const companyRecord = generateFakeObjectRecord({
      objectMetadataInfo: getObjectMetadataInfoOrThrow({
        objectNameSingular: 'company',
        objectMetadataMaps,
      }),
    });

    expect(Object.keys(personRecord.fields)).toEqual(['name', 'nickname']);
    expect(personRecord.fields.nickname.fieldMetadataId).toBe(
      idByUniversalIdentifierByMetadataName.fieldMetadata?.nickname,
    );
    expect(companyRecord.object.objectMetadataId).toBe(
      COMPANY_UNIVERSAL_IDENTIFIER,
    );
  });
});
