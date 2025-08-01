import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { VIEWFIELD_FLAT_FIELDS_MOCK } from './viewfield-flat-fields.mock';

export const VIEWFIELD_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '44c3525e-208f-4de7-8200-043ef22898cc',
  standardId: '20202020-4d19-4655-95bf-b2a04cf206d4',
  nameSingular: 'viewField',
  namePlural: 'viewFields',
  labelSingular: 'View Field',
  labelPlural: 'View Fields',
  description: '(System) View Fields',
  icon: 'IconTag',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: 'b7500f90-c13e-4208-be1c-f616f9b476ae',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-4d19-4655-95bf-b2a04cf206d4',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(VIEWFIELD_FLAT_FIELDS_MOCK),
});
