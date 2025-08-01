import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { SURVEYRESULT_FLAT_FIELDS_MOCK } from './surveyresult-flat-fields.mock';

export const SURVEYRESULT_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '713da753-0340-49b5-b1fa-add34d2dc9a8',
  standardId: null,
  nameSingular: 'surveyResult',
  namePlural: 'surveyResults',
  labelSingular: 'Survey result',
  labelPlural: 'Survey results',
  description: null,
  icon: 'IconRulerMeasure',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: true,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: null,
  labelIdentifierFieldMetadataId: '4efe5a87-b1fc-445f-b64a-72ffecbe07b8',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '713da753-0340-49b5-b1fa-add34d2dc9a8',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(SURVEYRESULT_FLAT_FIELDS_MOCK),
});
