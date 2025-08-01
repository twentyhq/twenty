import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { MESSAGETHREAD_FLAT_FIELDS_MOCK } from "./messagethread-flat-fields.mock";

export const MESSAGETHREAD_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "a1941fc7-b0b8-4f2e-b323-4e2417050c61",
  standardId: "20202020-849a-4c3e-84f5-a25a7d802271",
  nameSingular: "messageThread",
  namePlural: "messageThreads",
  labelSingular: "Message Thread",
  labelPlural: "Message Threads",
  description: "A group of related messages (e.g. email thread, chat thread)",
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
  labelIdentifierFieldMetadataId: "7e757c8f-9d56-4ced-afed-94a57c3e317d",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-849a-4c3e-84f5-a25a7d802271",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(MESSAGETHREAD_FLAT_FIELDS_MOCK),
});
