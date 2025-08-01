import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { CALENDAREVENTPARTICIPANT_FLAT_FIELDS_MOCK } from './calendareventparticipant-flat-fields.mock';

export const CALENDAREVENTPARTICIPANT_FLAT_OBJECT_MOCK =
  getFlatObjectMetadataMock({
    id: 'a4c662b6-e08d-40a5-ae55-82ed8f4edf78',
    standardId: '20202020-a1c3-47a6-9732-27e5b1e8436d',
    nameSingular: 'calendarEventParticipant',
    namePlural: 'calendarEventParticipants',
    labelSingular: 'Calendar event participant',
    labelPlural: 'Calendar event participants',
    description: 'Calendar event participants',
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
    labelIdentifierFieldMetadataId: '26eaa2fb-174a-4c85-9532-e66166630268',
    imageIdentifierFieldMetadataId: null,
    isLabelSyncedWithName: false,
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    uniqueIdentifier: '20202020-a1c3-47a6-9732-27e5b1e8436d',
    flatIndexMetadatas: [],
    flatFieldMetadatas: Object.values(
      CALENDAREVENTPARTICIPANT_FLAT_FIELDS_MOCK,
    ),
  });
