import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { WORKFLOWRUN_FLAT_FIELDS_MOCK } from './workflowrun-flat-fields.mock';

export const WORKFLOWRUN_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: '06d95e96-b050-443f-946e-dd276d291a2f',
  standardId: '20202020-4e28-4e95-a9d7-6c00874f843c',
  nameSingular: 'workflowRun',
  namePlural: 'workflowRuns',
  labelSingular: 'Workflow Run',
  labelPlural: 'Workflow Runs',
  description: 'A workflow run',
  icon: 'IconHistoryToggle',
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: false,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: 'ec6f5b0f-b724-4be3-9b02-5ce397904db5',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  uniqueIdentifier: '20202020-4e28-4e95-a9d7-6c00874f843c',
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(WORKFLOWRUN_FLAT_FIELDS_MOCK),
});
