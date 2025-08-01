import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { CALENDAREVENT_FLAT_FIELDS_MOCK } from './calendarevent-flat-fields.mock';

export const CALENDAREVENT_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '7eea5b5d-8b05-45ad-a3e1-de02efd82a6a',
  standardId: '20202020-8f1d-4eef-9f85-0d1965e27221',
  nameSingular: 'calendarEvent',
  namePlural: 'calendarEvents',
  labelSingular: 'Calendar event',
  labelPlural: 'Calendar events',
  description: 'Calendar events',
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
  labelIdentifierFieldMetadataId: 'f7e3b431-21f6-422c-86ae-27cce5fdc275',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-8f1d-4eef-9f85-0d1965e27221',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(CALENDAREVENT_FLAT_FIELDS_MOCK),
});
