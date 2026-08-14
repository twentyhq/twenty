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

export enum ObjectOpenRecordIn {
  SIDE_PANEL = "SIDE_PANEL",
  RECORD_PAGE = "RECORD_PAGE",
  USER_CHOICE = "USER_CHOICE",
}

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
  openRecordIn: ObjectOpenRecordIn;
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

export type SettingsForFieldMetadataType<T extends FieldMetadataType> =
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

export type OptionsForFieldMetadataType<T extends FieldMetadataType> =
  T extends keyof FieldMetadataOptionsMapping
    ? FieldMetadataOptionsMapping[T]
    : null;

export type FieldMetadataDefaultValueCurrency = {
  amountMicros: string | null;
  currencyCode: string | null;
};

export type FieldMetadataDefaultValueFullName = {
  firstName: string | null;
  lastName: string | null;
};

export type FieldMetadataDefaultValueAddress = {
  addressStreet1: string | null;
  addressStreet2: string | null;
  addressCity: string | null;
  addressPostcode: string | null;
  addressState: string | null;
  addressCountry: string | null;
  addressLat: number | null;
  addressLng: number | null;
};

export type FieldMetadataDefaultValueLink = {
  label: string;
  url: string;
};

export type FieldMetadataDefaultValueLinks = {
  primaryLinkLabel: string | null;
  primaryLinkUrl: string | null;
  secondaryLinks: FieldMetadataDefaultValueLink[] | null;
};

export type FieldMetadataDefaultValueEmails = {
  primaryEmail: string | null;
  additionalEmails: string[] | null;
};

export type FieldMetadataDefaultValuePhones = {
  primaryPhoneNumber: string | null;
  primaryPhoneCountryCode: string | null;
  primaryPhoneCallingCode: string | null;
  additionalPhones: string[] | null;
};

export type FieldMetadataDefaultValueRichText = {
  blocknote: string | null;
  markdown: string | null;
};

export type FieldMetadataDefaultValueActor = {
  source: string;
  workspaceMemberId?: string | null;
  name: string;
};

// Ground truth: packages/twenty-shared/src/types/FieldMetadataDefaultValue.ts
// Types not listed here (RELATION, MORPH_RELATION, FILES, TS_VECTOR) don't support a default value.
export type FieldMetadataDefaultValueMapping = {
  [FieldMetadataType.UUID]: string | null;
  [FieldMetadataType.TEXT]: string | null;
  [FieldMetadataType.PHONES]: FieldMetadataDefaultValuePhones | null;
  [FieldMetadataType.EMAILS]: FieldMetadataDefaultValueEmails | null;
  [FieldMetadataType.DATE_TIME]: string | null;
  [FieldMetadataType.DATE]: string | null;
  [FieldMetadataType.BOOLEAN]: boolean | null;
  [FieldMetadataType.NUMBER]: number | null;
  [FieldMetadataType.POSITION]: number | null;
  [FieldMetadataType.NUMERIC]: string | null;
  [FieldMetadataType.LINKS]: FieldMetadataDefaultValueLinks | null;
  [FieldMetadataType.CURRENCY]: FieldMetadataDefaultValueCurrency | null;
  [FieldMetadataType.FULL_NAME]: FieldMetadataDefaultValueFullName | null;
  [FieldMetadataType.ADDRESS]: FieldMetadataDefaultValueAddress | null;
  [FieldMetadataType.RATING]: string | null;
  [FieldMetadataType.SELECT]: string | null;
  [FieldMetadataType.MULTI_SELECT]: string[] | null;
  [FieldMetadataType.RAW_JSON]: object | null;
  [FieldMetadataType.RICH_TEXT]: FieldMetadataDefaultValueRichText | null;
  [FieldMetadataType.ACTOR]: FieldMetadataDefaultValueActor | null;
  [FieldMetadataType.ARRAY]: string[] | null;
};

export type DefaultValueForFieldMetadataType<T extends FieldMetadataType> =
  T extends keyof FieldMetadataDefaultValueMapping
    ? FieldMetadataDefaultValueMapping[T]
    : null;

type FieldRelationInfo = {
  type: RelationType;
  targetObjectMetadata: { nameSingular: string };
  targetFieldMetadata: { icon: string, label: string };
};

type RelationForFieldMetadataType<T extends FieldMetadataType> =
  T extends FieldMetadataType.RELATION ? FieldRelationInfo : null;

type MorphRelationsForFieldMetadataType<T extends FieldMetadataType> =
  T extends FieldMetadataType.MORPH_RELATION ? FieldRelationInfo[] : null;

type FieldsListBaseType = {
  applicationId: string;
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
  morphId: string | null;
  name: string;
  objectMetadataId: string;
  universalIdentifier: string;
};

export type FieldsListType = {
  [T in FieldMetadataType]: FieldsListBaseType & {
    type: T;
    defaultValue: DefaultValueForFieldMetadataType<T>;
    settings: SettingsForFieldMetadataType<T>;
    options: OptionsForFieldMetadataType<T>;
    relation: RelationForFieldMetadataType<T>;
    morphRelations: MorphRelationsForFieldMetadataType<T>;
  };
}[FieldMetadataType];