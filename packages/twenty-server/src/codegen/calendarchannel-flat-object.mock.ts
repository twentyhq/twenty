import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { CALENDARCHANNEL_FLAT_FIELDS_MOCK } from './calendarchannel-flat-fields.mock';

export const CALENDARCHANNEL_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'd9e0a502-5531-4346-9637-4fe7383f7ef2',
  standardId: '20202020-e8f2-40e1-a39c-c0e0039c5034',
  nameSingular: 'calendarChannel',
  namePlural: 'calendarChannels',
  labelSingular: 'Calendar Channel',
  labelPlural: 'Calendar Channels',
  description: 'Calendar Channels',
  icon: 'IconCalendar',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: false,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: 'b2a52896-9a9f-43da-a3ee-ffef2c786338',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-e8f2-40e1-a39c-c0e0039c5034',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(CALENDARCHANNEL_FLAT_FIELDS_MOCK),
});
