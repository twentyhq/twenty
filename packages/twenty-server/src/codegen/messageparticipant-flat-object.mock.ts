import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { MESSAGEPARTICIPANT_FLAT_FIELDS_MOCK } from "./messageparticipant-flat-fields.mock";

export const MESSAGEPARTICIPANT_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "edb170fd-a0c2-4619-b1a9-293cf07437c4",
  standardId: "20202020-a433-4456-aa2d-fd9cb26b774a",
  nameSingular: "messageParticipant",
  namePlural: "messageParticipants",
  labelSingular: "Message Participant",
  labelPlural: "Message Participants",
  description: "Message Participants",
  icon: "IconUserCircle",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: false,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: "d8918c00-b920-4327-a739-7d653d13163a",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-a433-4456-aa2d-fd9cb26b774a",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(MESSAGEPARTICIPANT_FLAT_FIELDS_MOCK),
});
