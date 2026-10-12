import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildWorkflowManifestObjectMetadataMaps } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-object-metadata-maps.util';
import { preallocateWorkflowReferenceIds } from 'src/engine/core-modules/application/application-manifest/utils/preallocate-workflow-reference-ids.util';
import {
  mockFlatFieldMetadataMaps,
  mockFlatObjectMetadataMaps,
} from 'src/engine/core-modules/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getObjectMetadataInfoOrThrow } from 'src/modules/workflow/common/utils/get-object-metadata-info-or-throw.util';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';

const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const TICKET_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';

const ticketField = (name: string, type: FieldMetadataType) =>
  ({
    universalIdentifier: name,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier: TICKET_UNIVERSAL_IDENTIFIER,
    name,
    label: name,
    type,
    isActive: true,
    isSystem: false,
    overrides: null,
    universalSettings:
      type === FieldMetadataType.RELATION
        ? { relationType: RelationType.MANY_TO_ONE }
        : null,
  }) as FlatFieldMetadata;

describe('buildWorkflowManifestObjectMetadataMaps', () => {
  it('describes a new application object with the IDs its fields will be created with', () => {
    const proposed = createEmptyAllFlatEntityMaps();
    proposed.flatObjectMetadataMaps.byUniversalIdentifier[
      TICKET_UNIVERSAL_IDENTIFIER
    ] = {
      universalIdentifier: TICKET_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      nameSingular: 'ticket',
      labelSingular: 'Ticket',
    } as FlatObjectMetadata;
    proposed.flatFieldMetadataMaps.byUniversalIdentifier.subject = ticketField(
      'subject',
      FieldMetadataType.TEXT,
    );
    proposed.flatFieldMetadataMaps.byUniversalIdentifier.company = ticketField(
      'company',
      FieldMetadataType.RELATION,
    );

    const ids = preallocateWorkflowReferenceIds({
      fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      toAllUniversalFlatEntityMaps: proposed,
    });
    const objectMetadataMaps = buildWorkflowManifestObjectMetadataMaps({
      toAllUniversalFlatEntityMaps: proposed,
      existingAllFlatEntityMaps: {
        ...createEmptyAllFlatEntityMaps(),
        flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
        flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
      },
      ownerApplicationId: 'owner-application-id',
      idByUniversalIdentifierByMetadataName: ids,
    });

    const record = generateFakeObjectRecord({
      objectMetadataInfo: getObjectMetadataInfoOrThrow({
        objectNameSingular: 'ticket',
        objectMetadataMaps,
      }),
    });
    const fieldIds = ids.fieldMetadata ?? {};

    expect(record.object.objectMetadataId).toBe(
      ids.objectMetadata?.[TICKET_UNIVERSAL_IDENTIFIER],
    );
    expect(Object.keys(record.fields).sort()).toEqual([
      'companyId',
      'createdAt',
      'createdBy',
      'deletedAt',
      'id',
      'subject',
      'updatedAt',
      'updatedBy',
    ]);
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
});
