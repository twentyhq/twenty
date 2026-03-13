import { isNonEmptyString } from '@sniptt/guards';
import { t } from '@lingui/core/macro';
import { v4 } from 'uuid';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const UNTITLED_PLACEHOLDER = 'Untitled';

// Unlike prefillRecord/generateEmptyFieldValue which produce empty/display values
// (null, ''), this utility produces valid non-null placeholders for required
// fields so the create mutation can succeed. The backend rejects null/empty
// for required TEXT fields.

type GetRecordInputPlaceholdersForRequiredFieldsResult = {
  placeholders: Partial<ObjectRecord>;
  missingRequiredRelationFields: FieldMetadataItem[];
  missingRequiredFieldsUnfillable: FieldMetadataItem[];
};

const getPlaceholderForFieldType = (
  field: FieldMetadataItem,
  objectMetadataItem: ObjectMetadataItem,
): unknown => {
  const { defaultValue } = field;
  const isLabelIdentifier =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem)?.id === field.id;
  const untitledLabel = isLabelIdentifier
    ? t`Untitled ${objectMetadataItem.labelSingular}`
    : UNTITLED_PLACEHOLDER;

  if (field.type === FieldMetadataType.TEXT) {
    if (isNonEmptyString(defaultValue)) {
      return defaultValue;
    }
    return untitledLabel;
  }

  if (field.type === FieldMetadataType.FULL_NAME) {
    const defaultFirstName =
      defaultValue && typeof defaultValue === 'object' && 'firstName' in defaultValue
        ? (defaultValue as { firstName?: string }).firstName
        : undefined;
    const firstName = isNonEmptyString(defaultFirstName)
      ? defaultFirstName
      : untitledLabel;
    return { firstName, lastName: '' };
  }

  if (field.type === FieldMetadataType.UUID) {
    return v4();
  }

  if (field.type === FieldMetadataType.BOOLEAN) {
    return field.defaultValue ?? true;
  }

  if (
    field.type === FieldMetadataType.NUMBER ||
    field.type === FieldMetadataType.NUMERIC ||
    field.type === FieldMetadataType.RATING ||
    field.type === FieldMetadataType.POSITION
  ) {
    return defaultValue ?? 0;
  }

  if (field.type === FieldMetadataType.DATE) {
    return (
      defaultValue ??
      new Date().toISOString().split('T')[0]
    );
  }

  if (field.type === FieldMetadataType.DATE_TIME) {
    return defaultValue ?? new Date().toISOString();
  }

  if (field.type === FieldMetadataType.SELECT) {
    const options = field.options?.map((opt) => opt.value) ?? [];
    if (isDefined(defaultValue) && options.includes(defaultValue)) {
      return defaultValue;
    }
    return options[0] ?? undefined;
  }

  if (field.type === FieldMetadataType.MULTI_SELECT) {
    return defaultValue ?? [];
  }

  if (field.type === FieldMetadataType.LINKS) {
    return {
      primaryLinkUrl: '',
      primaryLinkLabel: untitledLabel,
      secondaryLinks: [],
    };
  }

  if (field.type === FieldMetadataType.ADDRESS) {
    return {
      addressStreet1: untitledLabel,
      addressStreet2: '',
      addressCity: '',
      addressState: '',
      addressCountry: '',
      addressPostcode: '',
      addressLat: null,
      addressLng: null,
    };
  }

  if (field.type === FieldMetadataType.EMAILS) {
    return {
      primaryEmail: 'untitled@example.com',
      additionalEmails: null,
    };
  }

  if (field.type === FieldMetadataType.PHONES) {
    return {
      primaryPhoneNumber: untitledLabel,
      primaryPhoneCountryCode: '',
      primaryPhoneCallingCode: '',
      additionalPhones: null,
    };
  }

  if (field.type === FieldMetadataType.RICH_TEXT_V2) {
    return {
      blocknote: null,
      markdown: untitledLabel,
    };
  }

  if (field.type === FieldMetadataType.CURRENCY) {
    const defaultCurrency =
      defaultValue && typeof defaultValue === 'object' && 'currencyCode' in defaultValue
        ? (defaultValue as { amountMicros?: number; currencyCode?: string })
        : undefined;
    return {
      amountMicros: defaultCurrency?.amountMicros ?? 0,
      currencyCode: defaultCurrency?.currencyCode ?? 'USD',
    };
  }

  return undefined;
};

const canProvidePlaceholderForFieldType = (
  fieldType: string,
): boolean => {
  const placeholderableTypes = [
    FieldMetadataType.TEXT,
    FieldMetadataType.FULL_NAME,
    FieldMetadataType.UUID,
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.NUMBER,
    FieldMetadataType.NUMERIC,
    FieldMetadataType.RATING,
    FieldMetadataType.POSITION,
    FieldMetadataType.DATE,
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.LINKS,
    FieldMetadataType.ADDRESS,
    FieldMetadataType.EMAILS,
    FieldMetadataType.PHONES,
    FieldMetadataType.RICH_TEXT_V2,
    FieldMetadataType.CURRENCY,
  ];
  return placeholderableTypes.includes(fieldType);
};

const isRequiredRelationField = (field: FieldMetadataItem): boolean =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === RelationType.MANY_TO_ONE &&
  field.isNullable === false;

const isRequiredMorphRelationField = (field: FieldMetadataItem): boolean =>
  field.type === FieldMetadataType.MORPH_RELATION &&
  field.settings?.relationType === RelationType.MANY_TO_ONE &&
  field.isNullable === false;

export const getRecordInputPlaceholdersForRequiredFields = (
  objectMetadataItem: ObjectMetadataItem,
  recordInput: Partial<ObjectRecord>,
): GetRecordInputPlaceholdersForRequiredFieldsResult => {
  const placeholders: Partial<ObjectRecord> = {};
  const missingRequiredRelationFields: FieldMetadataItem[] = [];
  const missingRequiredFieldsUnfillable: FieldMetadataItem[] = [];

  for (const field of objectMetadataItem.fields) {
    if (field.isNullable !== false) {
      continue;
    }

    // Skip if value already provided (filters, RLS, or explicit input)
    const existingValue = recordInput[field.name];
    const relationJoinColumnName =
      isRequiredRelationField(field) || isRequiredMorphRelationField(field)
        ? getJoinColumnName(field.settings) ?? `${field.name}Id`
        : undefined;
    const joinColumnValue = relationJoinColumnName
      ? recordInput[relationJoinColumnName]
      : undefined;
    if (isDefined(existingValue) || isDefined(joinColumnValue)) {
      continue;
    }

    if (isRequiredRelationField(field) || isRequiredMorphRelationField(field)) {
      missingRequiredRelationFields.push(field);
      continue;
    }

    if (!canProvidePlaceholderForFieldType(field.type)) {
      missingRequiredFieldsUnfillable.push(field);
      continue;
    }

    const placeholder = getPlaceholderForFieldType(field, objectMetadataItem);
    if (isDefined(placeholder)) {
      placeholders[field.name] = placeholder;
    } else {
      missingRequiredFieldsUnfillable.push(field);
    }
  }

  return {
    placeholders,
    missingRequiredRelationFields,
    missingRequiredFieldsUnfillable,
  };
};

export const REQUIRED_RELATION_FIELDS_MISSING_ERROR_CODE =
  'REQUIRED_RELATION_FIELDS_MISSING' as const;

export const REQUIRED_FIELDS_UNFILLABLE_ERROR_CODE =
  'REQUIRED_FIELDS_UNFILLABLE' as const;

export const getRequiredRelationFieldsMissingErrorMessage = (
  missingRequiredRelationFields: FieldMetadataItem[],
): string => {
  const fieldLabels = missingRequiredRelationFields
    .map((field) => field.label)
    .join(', ');
  return `Cannot create record: the field(s) "${fieldLabels}" are required but cannot be auto-filled. Make them optional in Settings > Data model, or add a default value.`;
};

export const getRequiredFieldsUnfillableErrorMessage = (
  missingRequiredFieldsUnfillable: FieldMetadataItem[],
): string => {
  const fieldLabels = missingRequiredFieldsUnfillable
    .map((field) => field.label)
    .join(', ');
  return `Cannot create record: the field(s) "${fieldLabels}" are required but cannot be auto-filled (e.g. SELECT with no options). Make them optional in Settings > Data model, or add a default value.`;
};
