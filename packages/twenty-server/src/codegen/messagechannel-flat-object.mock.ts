import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { MESSAGECHANNEL_FLAT_FIELDS_MOCK } from "./messagechannel-flat-fields.mock";

export const MESSAGECHANNEL_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "6251b066-7342-4295-8601-e857ebed8d3c",
  standardId: "20202020-fe8c-40bc-a681-b80b771449b7",
  nameSingular: "messageChannel",
  namePlural: "messageChannels",
  labelSingular: "Message Channel",
  labelPlural: "Message Channels",
  description: "Message Channels",
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
  labelIdentifierFieldMetadataId: "d5104ed9-b558-43fc-8704-56569c78d26a",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-fe8c-40bc-a681-b80b771449b7",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(MESSAGECHANNEL_FLAT_FIELDS_MOCK),
});
