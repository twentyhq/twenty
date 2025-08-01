import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { BLOCKLIST_FLAT_FIELDS_MOCK } from "./blocklist-flat-fields.mock";

export const BLOCKLIST_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "4024f24d-d322-43bc-aa28-e6d105af7908",
  standardId: "20202020-0408-4f38-b8a8-4d5e3e26e24d",
  nameSingular: "blocklist",
  namePlural: "blocklists",
  labelSingular: "Blocklist",
  labelPlural: "Blocklists",
  description: "Blocklist",
  icon: "IconForbid2",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: "3b551c08-8733-4c43-86c0-49b58cf48a53",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-0408-4f38-b8a8-4d5e3e26e24d",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(BLOCKLIST_FLAT_FIELDS_MOCK),
});
