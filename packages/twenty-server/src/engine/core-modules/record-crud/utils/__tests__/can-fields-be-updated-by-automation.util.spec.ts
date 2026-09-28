import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { canFieldsBeUpdatedByAutomation } from 'src/engine/core-modules/record-crud/utils/can-fields-be-updated-by-automation.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER = 'workspace-custom-application';

const companyName = getFlatFieldMetadataMock({
  universalIdentifier: 'company-name',
  objectMetadataId: 'company',
  type: FieldMetadataType.TEXT,
  name: 'name',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
});

const messageThreadSubject = getFlatFieldMetadataMock({
  universalIdentifier: 'message-thread-subject',
  objectMetadataId: 'messageThread',
  type: FieldMetadataType.TEXT,
  name: 'subject',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
});

const messageThreadCategory = getFlatFieldMetadataMock({
  universalIdentifier: 'message-thread-category',
  objectMetadataId: 'messageThread',
  type: FieldMetadataType.SELECT,
  name: 'category',
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
});

const messageThreadDeal = getFlatFieldMetadataMock({
  universalIdentifier: 'message-thread-deal',
  objectMetadataId: 'messageThread',
  type: FieldMetadataType.RELATION,
  name: 'deal',
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const workspaceMemberCategory = getFlatFieldMetadataMock({
  universalIdentifier: 'workspace-member-category',
  objectMetadataId: 'workspaceMember',
  type: FieldMetadataType.SELECT,
  name: 'category',
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
});

const flatFieldMetadatas = [
  companyName,
  messageThreadSubject,
  messageThreadCategory,
  messageThreadDeal,
  workspaceMemberCategory,
];

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
};

const FLAT_OBJECT_METADATA_BY_NAME = {
  company: getFlatObjectMetadataMock({
    universalIdentifier: 'company',
    nameSingular: 'company',
    fieldIds: [companyName.id],
  }),
  messageThread: getFlatObjectMetadataMock({
    universalIdentifier: 'messageThread',
    nameSingular: 'messageThread',
    fieldIds: [
      messageThreadSubject.id,
      messageThreadCategory.id,
      messageThreadDeal.id,
    ],
  }),
  workspaceMember: getFlatObjectMetadataMock({
    universalIdentifier: 'workspaceMember',
    nameSingular: 'workspaceMember',
    fieldIds: [workspaceMemberCategory.id],
  }),
};

describe('canFieldsBeUpdatedByAutomation', () => {
  it.each<[keyof typeof FLAT_OBJECT_METADATA_BY_NAME, string[], boolean]>([
    ['company', ['name'], true],
    ['messageThread', ['category'], true],
    ['messageThread', ['dealId'], true],
    ['messageThread', ['subject'], false],
    ['messageThread', ['category', 'subject'], false],
    ['messageThread', ['unknownField'], false],
    ['messageThread', [], false],
    ['workspaceMember', ['category'], false],
  ])(
    'should allow automation to update %s fields %j: %s',
    (objectName, fieldNames, expected) => {
      expect(
        canFieldsBeUpdatedByAutomation({
          flatObjectMetadata: FLAT_OBJECT_METADATA_BY_NAME[objectName],
          flatFieldMetadataMaps,
          fieldNames,
        }),
      ).toBe(expected);
    },
  );
});
