import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { MESSAGECHANNELMESSAGEASSOCIATION_FLAT_FIELDS_MOCK } from './messagechannelmessageassociation-flat-fields.mock';

export const MESSAGECHANNELMESSAGEASSOCIATION_FLAT_OBJECT_MOCK =
  getFlatObjectMetadataMock({
    id: '0466ccc3-463b-41f9-be8d-4dcf156da197',
    standardId: '20202020-ad1e-4127-bccb-d83ae04d2ccb',
    nameSingular: 'messageChannelMessageAssociation',
    namePlural: 'messageChannelMessageAssociations',
    labelSingular: 'Message Channel Message Association',
    labelPlural: 'Message Channel Message Associations',
    description: 'Message Synced with a Message Channel',
    icon: 'IconMessage',
    standardOverrides: null,
    targetTableName: 'DEPRECATED',
    isCustom: false,
    isRemote: false,
    isActive: true,
    isSystem: true,
    isAuditLogged: false,
    isSearchable: false,
    shortcut: null,
    labelIdentifierFieldMetadataId: '08870a6a-cbb1-4ec3-bbaa-25a48551bf28',
    imageIdentifierFieldMetadataId: null,
    isLabelSyncedWithName: false,
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    uniqueIdentifier: '20202020-ad1e-4127-bccb-d83ae04d2ccb',
    flatIndexMetadatas: [],
    flatFieldMetadatas: Object.values(
      MESSAGECHANNELMESSAGEASSOCIATION_FLAT_FIELDS_MOCK,
    ),
  });
