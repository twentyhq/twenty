import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { WEBHOOK_FLAT_FIELDS_MOCK } from './webhook-flat-fields.mock';

export const WEBHOOK_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'c63e78c9-0405-47be-bfdb-30fd98c870c0',
  standardId: '20202020-be4d-4e08-811d-0fffcd13ffd4',
  nameSingular: 'webhook',
  namePlural: 'webhooks',
  labelSingular: 'Webhook',
  labelPlural: 'Webhooks',
  description: 'A webhook',
  icon: 'IconRobot',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: '36843688-a383-4fde-bb04-7ea16485e9e9',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-be4d-4e08-811d-0fffcd13ffd4',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(WEBHOOK_FLAT_FIELDS_MOCK),
});
