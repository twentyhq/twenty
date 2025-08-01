import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { WORKSPACEMEMBER_FLAT_FIELDS_MOCK } from "./workspacemember-flat-fields.mock";

export const WORKSPACEMEMBER_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "7d8264db-2b55-4b74-81ff-b7064ed43840",
  standardId: "20202020-3319-4234-a34c-82d5c0e881a6",
  nameSingular: "workspaceMember",
  namePlural: "workspaceMembers",
  labelSingular: "Workspace Member",
  labelPlural: "Workspace Members",
  description: "A workspace member",
  icon: "IconUserCircle",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: true,
  shortcut: null,
  labelIdentifierFieldMetadataId: "ec986b0e-0817-4cdf-8302-4ffe2615c375",
  imageIdentifierFieldMetadataId: "0d979542-af55-416f-9dbf-2ab2cf16c482",
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-3319-4234-a34c-82d5c0e881a6",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(WORKSPACEMEMBER_FLAT_FIELDS_MOCK),
});
