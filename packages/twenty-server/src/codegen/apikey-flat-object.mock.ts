import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { APIKEY_FLAT_FIELDS_MOCK } from "./apikey-flat-fields.mock";

export const APIKEY_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "9caf42e5-09a6-416a-8373-b3d9e8e4a20e",
  standardId: "20202020-4c00-401d-8cda-ec6a4c41cd7d",
  nameSingular: "apiKey",
  namePlural: "apiKeys",
  labelSingular: "API Key",
  labelPlural: "API Keys",
  description: "An API key",
  icon: "IconRobot",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: "5ccbb8b5-e056-45c6-8402-67bc653c11cd",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-4c00-401d-8cda-ec6a4c41cd7d",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(APIKEY_FLAT_FIELDS_MOCK),
});
