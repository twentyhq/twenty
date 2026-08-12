import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";

export type FindObjectsFieldsType = {
  data: {
    objects: {
      edges: {
        node: ObjectType
      }[]
    }
  }
};

export type ObjectType = {
  applicationId: string;
  color: string;
  description: string;
  fieldsList: FieldsListType[];
  icon: string;
  id: string;
  isActive: boolean;
  isLabelSyncedWithName: boolean;
  isSystem: boolean;
  labelIdentifierFieldMetadataId: string;
  labelPlural: string;
  labelSingular: string;
  namePlural: string;
  nameSingular: string;
  openRecordIn: string;
  universalIdentifier: string;
}

export enum RelationType {
  ONE_TO_MANY = "ONE_TO_MANY",
  MANY_TO_ONE = "MANY_TO_ONE",
}

export enum RelationOnDeleteAction {
  CASCADE = "CASCADE",
  RESTRICT = "RESTRICT",
  SET_NULL = "SET_NULL",
  NO_ACTION = "NO_ACTION",
}

export type NumberFieldSettings = {
  dataType?: "float" | "int" | "bigint";
  decimals?: number;
  type?: "number" | "percentage";
} | null;

export type CurrencyFieldSettings = {
  format?: "short" | "full";
  decimals?: number;
} | null;

export type TextFieldSettings = {
  displayedMaxRows?: number;
} | null;

export type DateFieldSettings = {
  displayFormat?: "RELATIVE" | "USER_SETTINGS" | "CUSTOM";
} | null;

export type AddressFieldSettings = {
  subFields?: (
    | "addressStreet1"
    | "addressStreet2"
    | "addressCity"
    | "addressState"
    | "addressPostcode"
    | "addressCountry"
    | "addressLat"
    | "addressLng"
  )[];
} | null;

export type RelationFieldSettings = {
  relationType: RelationType;
  onDelete?: RelationOnDeleteAction;
  joinColumnName?: string | null;
  // Points to the target field on the junction object
  junctionTargetFieldId?: string;
};

export type MultiItemFieldSettings = {
  maxNumberOfValues?: number;
  clickAction?: "COPY" | "OPEN_LINK" | "OPEN_IN_APP";
} | null;

export type FilesFieldSettings = {
  maxNumberOfValues: number;
};

// Maps each field type to its settings shape; types not listed carry no settings.
export type FieldMetadataSettingsMapping = {
  [FieldMetadataType.NUMBER]: NumberFieldSettings;
  [FieldMetadataType.CURRENCY]: CurrencyFieldSettings;
  [FieldMetadataType.DATE]: DateFieldSettings;
  [FieldMetadataType.DATE_TIME]: DateFieldSettings;
  [FieldMetadataType.TEXT]: TextFieldSettings;
  [FieldMetadataType.ADDRESS]: AddressFieldSettings;
  [FieldMetadataType.RELATION]: RelationFieldSettings;
  [FieldMetadataType.MORPH_RELATION]: RelationFieldSettings;
  [FieldMetadataType.PHONES]: MultiItemFieldSettings;
  [FieldMetadataType.EMAILS]: MultiItemFieldSettings;
  [FieldMetadataType.LINKS]: MultiItemFieldSettings;
  [FieldMetadataType.ARRAY]: MultiItemFieldSettings;
  [FieldMetadataType.FILES]: FilesFieldSettings;
};

type SettingsForFieldMetadataType<T extends FieldMetadataType> =
  T extends keyof FieldMetadataSettingsMapping
    ? FieldMetadataSettingsMapping[T]
    : null;

export type TagColor =
  | "red"
  | "ruby"
  | "crimson"
  | "tomato"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "grass"
  | "green"
  | "jade"
  | "mint"
  | "turquoise"
  | "cyan"
  | "sky"
  | "blue"
  | "iris"
  | "violet"
  | "purple"
  | "plum"
  | "pink"
  | "bronze"
  | "gold"
  | "brown"
  | "gray";

export type FieldMetadataDefaultOption = {
  id?: string;
  position: number;
  label: string;
  value: string;
};

export type FieldMetadataComplexOption = FieldMetadataDefaultOption & {
  color: TagColor;
};

export type FieldMetadataOptionsMapping = {
  [FieldMetadataType.RATING]: FieldMetadataDefaultOption[];
  [FieldMetadataType.SELECT]: FieldMetadataComplexOption[];
  [FieldMetadataType.MULTI_SELECT]: FieldMetadataComplexOption[];
};

type OptionsForFieldMetadataType<T extends FieldMetadataType> =
  T extends keyof FieldMetadataOptionsMapping
    ? FieldMetadataOptionsMapping[T]
    : null;

type FieldsListBaseType = {
  applicationId: string;
  defaultValue: string | null;
  description: string;
  icon: string;
  id: string;
  isActive: boolean;
  isLabelSyncedWithName: boolean;
  isNullable: boolean;
  isSystem: boolean;
  isUIEditable: boolean;
  isUIReadOnly: boolean;
  isUnique: boolean;
  label: string;
  morphId?: string; // TODO
  morphRelations?: {} // TODO
  name: string;
  objectMetadataId: string;
  relation: {
    type: RelationType;
    targetObjectMetadata: { universalIdentifier: string };
  } | null;
  universalIdentifier: string;
};

export type FieldsListType = {
  [T in FieldMetadataType]: FieldsListBaseType & {
    type: T;
    settings: SettingsForFieldMetadataType<T>;
    options: OptionsForFieldMetadataType<T>;
  };
}[FieldMetadataType];