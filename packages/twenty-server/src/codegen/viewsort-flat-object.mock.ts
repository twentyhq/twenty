import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { VIEWSORT_FLAT_FIELDS_MOCK } from './viewsort-flat-fields.mock';

export const VIEWSORT_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '28e83c94-ce6d-48cd-9573-8624b873b532',
  standardId: '20202020-e46a-47a8-939a-e5d911f83531',
  nameSingular: 'viewSort',
  namePlural: 'viewSorts',
  labelSingular: 'View Sort',
  labelPlural: 'View Sorts',
  description: '(System) View Sorts',
  icon: 'IconArrowsSort',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: '2f5290b5-1cb9-4942-becd-b3216d7aaf93',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-e46a-47a8-939a-e5d911f83531',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(VIEWSORT_FLAT_FIELDS_MOCK),
});
