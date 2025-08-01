import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { WORKFLOW_FLAT_FIELDS_MOCK } from "./workflow-flat-fields.mock";

export const WORKFLOW_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "664c19a5-0693-45d4-a4e5-76c3717db83c",
  standardId: "20202020-62be-406c-b9ca-8caa50d51392",
  nameSingular: "workflow",
  namePlural: "workflows",
  labelSingular: "Workflow",
  labelPlural: "Workflows",
  description: "A workflow",
  icon: "IconSettingsAutomation",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: "W",
  labelIdentifierFieldMetadataId: "f9126ed9-260a-4969-bf6d-71eb3679c3e8",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-62be-406c-b9ca-8caa50d51392",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(WORKFLOW_FLAT_FIELDS_MOCK),
});
