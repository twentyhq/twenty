import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { CONNECTEDACCOUNT_FLAT_FIELDS_MOCK } from './connectedaccount-flat-fields.mock';

export const CONNECTEDACCOUNT_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'fdfdcb53-77e9-4b0e-b815-0faca4095b47',
  standardId: '20202020-977e-46b2-890b-c3002ddfd5c5',
  nameSingular: 'connectedAccount',
  namePlural: 'connectedAccounts',
  labelSingular: 'Connected Account',
  labelPlural: 'Connected Accounts',
  description: 'A connected account',
  icon: 'IconAt',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: '13565e8c-59e6-416a-a555-cd366e819096',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-977e-46b2-890b-c3002ddfd5c5',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(CONNECTEDACCOUNT_FLAT_FIELDS_MOCK),
});
