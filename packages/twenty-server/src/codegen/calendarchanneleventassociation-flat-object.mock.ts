import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { CALENDARCHANNELEVENTASSOCIATION_FLAT_FIELDS_MOCK } from './calendarchanneleventassociation-flat-fields.mock';

export const CALENDARCHANNELEVENTASSOCIATION_FLAT_OBJECT_MOCK =
  getFlatObjectMetadataMock({
    id: '54490da5-d933-46e5-a753-6c37ad09f506',
    standardId: '20202020-491b-4aaa-9825-afd1bae6ae00',
    nameSingular: 'calendarChannelEventAssociation',
    namePlural: 'calendarChannelEventAssociations',
    labelSingular: 'Calendar Channel Event Association',
    labelPlural: 'Calendar Channel Event Associations',
    description: 'Calendar Channel Event Associations',
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
    labelIdentifierFieldMetadataId: 'c12e7c97-dcb0-4d10-93cb-46c58aa5bf60',
    imageIdentifierFieldMetadataId: null,
    isLabelSyncedWithName: false,
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    uniqueIdentifier: '20202020-491b-4aaa-9825-afd1bae6ae00',
    flatIndexMetadatas: [],
    flatFieldMetadatas: Object.values(
      CALENDARCHANNELEVENTASSOCIATION_FLAT_FIELDS_MOCK,
    ),
  });
