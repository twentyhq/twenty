import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { MESSAGEFOLDER_FLAT_FIELDS_MOCK } from "./messagefolder-flat-fields.mock";

export const MESSAGEFOLDER_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "9f87cdba-bb7f-4db0-b1ec-ad50e9fce8ee",
  standardId: "20202020-4955-4fd9-8e59-2dbd373f2a46",
  nameSingular: "messageFolder",
  namePlural: "messageFolders",
  labelSingular: "Message Folder",
  labelPlural: "Message Folders",
  description: "Folder for Message Channel",
  icon: "IconFolder",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: false,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: "a6cc763a-4231-43f1-9a49-cb0db9228462",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-4955-4fd9-8e59-2dbd373f2a46",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(MESSAGEFOLDER_FLAT_FIELDS_MOCK),
});
