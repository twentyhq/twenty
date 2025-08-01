import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { WORKFLOWVERSION_FLAT_FIELDS_MOCK } from './workflowversion-flat-fields.mock';

export const WORKFLOWVERSION_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '99cf5f27-b41d-4f25-a23b-9e47d27dae9b',
  standardId: '20202020-d65d-4ab9-9344-d77bfb376a3d',
  nameSingular: 'workflowVersion',
  namePlural: 'workflowVersions',
  labelSingular: 'Workflow Version',
  labelPlural: 'Workflow Versions',
  description: 'A workflow version',
  icon: 'IconVersions',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: '9dc15dd5-0aca-41a4-921b-37f3f0ec4e94',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-d65d-4ab9-9344-d77bfb376a3d',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(WORKFLOWVERSION_FLAT_FIELDS_MOCK),
});
