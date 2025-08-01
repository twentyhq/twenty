import { getFlatObjectMetadataMock } from "src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock.js";
import { VIEWGROUP_FLAT_FIELDS_MOCK } from "./viewgroup-flat-fields.mock";

export const VIEWGROUP_FLAT_OBJECT_MOCK = getFlatObjectMetadataMock({
  id: "727e96dc-0e0b-448a-8906-eccb97b0f199",
  standardId: "20202020-725f-47a4-8008-4255f9519f70",
  nameSingular: "viewGroup",
  namePlural: "viewGroups",
  labelSingular: "View Group",
  labelPlural: "View Groups",
  description: "(System) View Groups",
  icon: "IconTag",
  standardOverrides: null,
  targetTableName: "DEPRECATED",
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  shortcut: null,
  labelIdentifierFieldMetadataId: "c811c6d6-50d6-4fbc-a6ff-801d01214f0c",
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: false,
  workspaceId: "20202020-1c25-4d02-bf25-6aeccf7ea419",
  uniqueIdentifier: "20202020-725f-47a4-8008-4255f9519f70",
  flatIndexMetadatas: [],
  flatFieldMetadatas: Object.values(VIEWGROUP_FLAT_FIELDS_MOCK),
});
