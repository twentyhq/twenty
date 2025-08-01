import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { VIEWFILTERGROUP_FLAT_FIELDS_MOCK } from './viewfiltergroup-flat-fields.mock';

export const VIEWFILTERGROUP_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: 'ba64214b-38b5-4011-8b2d-0b11fbf7e134',
  standardId: '20202020-b920-4b11-92aa-9b07d878e542',
  nameSingular: 'viewFilterGroup',
  namePlural: 'viewFilterGroups',
  labelSingular: 'View Filter Group',
  labelPlural: 'View Filter Groups',
  description: '(System) View Filter Groups',
  icon: 'IconFilterBolt',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: '9c4faa16-7ed7-4055-9213-0df8dcda7798',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-b920-4b11-92aa-9b07d878e542',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(VIEWFILTERGROUP_FLAT_FIELDS_MOCK),
});
