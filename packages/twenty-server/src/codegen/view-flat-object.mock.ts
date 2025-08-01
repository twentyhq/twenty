import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { VIEW_FLAT_FIELDS_MOCK } from "./view-flat-fields.mock";

export const VIEW_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "8377fc0d-ec1c-4fb5-b6ae-9381d9b22a95",
  standardId: "20202020-722e-4739-8e2c-0c372d661f49",
  nameSingular: "view",
  namePlural: "views",
  labelSingular: "View",
  labelPlural: "Views",
  description: "(System) Views",
  icon: "IconLayoutCollage",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: "3fe1e961-d463-4af3-a02e-a4c6eccec302",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-722e-4739-8e2c-0c372d661f49",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(VIEW_FLAT_FIELDS_MOCK),
});
