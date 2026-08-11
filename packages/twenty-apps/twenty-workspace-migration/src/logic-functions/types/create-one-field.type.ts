import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";
import { RelationType } from "src/logic-functions/types/find-objects-fields.type";

export type RelationCreationPayload = {
  type: RelationType;
  targetObjectMetadataId: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
};

export type CreateOneFieldType = {
  defaultValue: {amountMicros: null, currencyCode: string} // currency type
    | string // (multi-)select type
    | null;
  description: string;
  icon: string;
  isActive: boolean;
  isLabelSyncedWithName: boolean;
  isNullable: boolean;
  isUIEditable: boolean;
  isUIReadOnly: boolean;
  isUnique: boolean;
  label: string;
  morphRelationsCreationPayload?: any; // TODO, morph relations are out of scope
  name: string;
  objectMetadataId: string;
  options?: any; // TODO
  relationCreationPayload?: RelationCreationPayload;
  settings?: any; // TODO
  type: FieldMetadataType;
}