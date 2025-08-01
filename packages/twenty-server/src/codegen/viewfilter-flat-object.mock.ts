import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { VIEWFILTER_FLAT_FIELDS_MOCK } from './viewfilter-flat-fields.mock';

export const VIEWFILTER_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '272508cf-e880-44b2-ae90-cbc30e9f1e09',
  standardId: '20202020-6fb6-4631-aded-b7d67e952ec8',
  nameSingular: 'viewFilter',
  namePlural: 'viewFilters',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  description: '(System) View Filters',
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
  labelIdentifierFieldMetadataId: '315f390a-8b55-499c-bf36-523965093091',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-6fb6-4631-aded-b7d67e952ec8',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(VIEWFILTER_FLAT_FIELDS_MOCK),
});
