import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { MESSAGE_FLAT_FIELDS_MOCK } from "./message-flat-fields.mock";

export const MESSAGE_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "94cbbd4a-be93-489e-b3c6-51d9135e35f9",
  standardId: "20202020-3f6b-4425-80ab-e468899ab4b2",
  nameSingular: "message",
  namePlural: "messages",
  labelSingular: "Message",
  labelPlural: "Messages",
  description:
    "A message sent or received through a messaging channel (email, chat, etc.)",
  icon: "IconMessage",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: false,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: "10fe1763-7fd2-42d8-a7bc-ed424c0c4920",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-3f6b-4425-80ab-e468899ab4b2",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(MESSAGE_FLAT_FIELDS_MOCK),
});
