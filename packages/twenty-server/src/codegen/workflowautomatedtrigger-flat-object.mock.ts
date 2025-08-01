import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js';

import { WORKFLOWAUTOMATEDTRIGGER_FLAT_FIELDS_MOCK } from './workflowautomatedtrigger-flat-fields.mock';

export const WORKFLOWAUTOMATEDTRIGGER_FLAT_OBJECT_MOCK =
  getFlatObjectMetadataMock({
    id: '726e54b1-2d99-45d7-b00f-468efdc30db8',
    standardId: '20202020-3319-4234-a34c-7f3b9d2e4d1f',
    nameSingular: 'workflowAutomatedTrigger',
    namePlural: 'workflowAutomatedTriggers',
    labelSingular: 'WorkflowAutomatedTrigger',
    labelPlural: 'WorkflowAutomatedTriggers',
    description: 'A workflow automated trigger',
    icon: 'IconSettingsAutomation',
    standardOverrides: null,
    targetTableName: 'DEPRECATED',
    isCustom: false,
    isRemote: false,
    isActive: true,
    isSystem: true,
    isAuditLogged: true,
    isSearchable: false,
    shortcut: null,
    labelIdentifierFieldMetadataId: '0ae8c941-d7aa-4d45-8775-d8fd9fb3cb85',
    imageIdentifierFieldMetadataId: null,
    isLabelSyncedWithName: false,
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    uniqueIdentifier: '20202020-3319-4234-a34c-7f3b9d2e4d1f',
    flatIndexMetadatas: [],
    flatFieldMetadatas: Object.values(
      WORKFLOWAUTOMATEDTRIGGER_FLAT_FIELDS_MOCK,
    ),
  });
