import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { canFieldsBeUpdatedByAutomation } from 'src/engine/core-modules/record-crud/utils/can-fields-be-updated-by-automation.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';
const STANDARD_APPLICATION_ID = 'twenty-standard-application-id';
const INSTALLED_APPLICATION_ID = 'installed-application-id';

const companyName = getFlatFieldMetadataMock({
  universalIdentifier: 'company-name',
  objectMetadataId: 'company',
  type: FieldMetadataType.TEXT,
  name: 'name',
  applicationId: STANDARD_APPLICATION_ID,
});

const messageThreadSubject = getFlatFieldMetadataMock({
  universalIdentifier: 'message-thread-subject',
  objectMetadataId: 'messageThread',
  type: FieldMetadataType.TEXT,
  name: 'subject',
  applicationId: STANDARD_APPLICATION_ID,
});

const messageThreadCategory = getFlatFieldMetadataMock({
  universalIdentifier: 'message-thread-category',
  objectMetadataId: 'messageThread',
  type: FieldMetadataType.SELECT,
  name: 'category',
  applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
});

const messageThreadDeal = getFlatFieldMetadataMock({
  universalIdentifier: 'message-thread-deal',
  objectMetadataId: 'messageThread',
  type: FieldMetadataType.RELATION,
  name: 'deal',
  applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const messageThreadSyncCursor = getFlatFieldMetadataMock({
  universalIdentifier: 'message-thread-sync-cursor',
  objectMetadataId: 'messageThread',
  type: FieldMetadataType.TEXT,
  name: 'syncCursor',
  applicationId: INSTALLED_APPLICATION_ID,
});

const workspaceMemberCategory = getFlatFieldMetadataMock({
  universalIdentifier: 'workspace-member-category',
  objectMetadataId: 'workspaceMember',
  type: FieldMetadataType.SELECT,
  name: 'category',
  applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
});

const flatFieldMetadatas = [
  companyName,
  messageThreadSubject,
  messageThreadCategory,
  messageThreadDeal,
  messageThreadSyncCursor,
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
      messageThreadSyncCursor.id,
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
    ['messageThread', ['syncCursor'], false],
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
          workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        }),
      ).toBe(expected);
    },
  );
});
