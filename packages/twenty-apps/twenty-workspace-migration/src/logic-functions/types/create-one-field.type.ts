import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";
import {
  DefaultValueForFieldMetadataType,
  OptionsForFieldMetadataType,
  RelationType,
  SettingsForFieldMetadataType,
} from "src/logic-functions/types/find-objects-fields.type";

export type RelationCreationPayload = {
  type: RelationType;
  targetObjectMetadataId: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
};

type CreateOneFieldBaseType = {
  description: string;
  icon: string;
  isActive: boolean;
  isLabelSyncedWithName: boolean;
  isNullable: boolean;
  isUIEditable: boolean;
  isUIReadOnly: boolean;
  isUnique: boolean;
  label: string;
  morphRelationsCreationPayload: RelationCreationPayload[] | null;
  name: string;
  objectMetadataId: string;
  relationCreationPayload: RelationCreationPayload | null;
};

export type CreateOneFieldType = {
  [T in FieldMetadataType]: CreateOneFieldBaseType & {
    type: T;
    defaultValue: DefaultValueForFieldMetadataType<T>;
    options: OptionsForFieldMetadataType<T>;
    settings: SettingsForFieldMetadataType<T>;
  };
}[FieldMetadataType];
