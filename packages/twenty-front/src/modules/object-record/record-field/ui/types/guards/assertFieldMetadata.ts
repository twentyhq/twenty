import { type FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldActorMetadata,
  type FieldAddressMetadata,
  type FieldArrayMetadata,
  type FieldBooleanMetadata,
  type FieldCurrencyMetadata,
  type FieldDateMetadata,
  type FieldDateTimeMetadata,
  type FieldEmailMetadata,
  type FieldEmailsMetadata,
  type FieldFullNameMetadata,
  type FieldLinkMetadata,
  type FieldLinksMetadata,
  type FieldMetadata,
  type FieldMorphRelationMetadata,
  type FieldMultiSelectMetadata,
  type FieldNumberMetadata,
  type FieldPhoneMetadata,
  type FieldPhonesMetadata,
  type FieldRatingMetadata,
  type FieldRawJsonMetadata,
  type FieldRelationMetadata,
  type FieldRichTextMetadata,
  type FieldRichTextV2Metadata,
  type FieldSelectMetadata,
  type FieldTextMetadata,
  type FieldUuidMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

type AssertFieldMetadataFunction = <
  E extends FieldMetadataType,
  T extends E extends 'BOOLEAN'
    ? FieldBooleanMetadata
    : E extends 'CURRENCY'
      ? FieldCurrencyMetadata
      : E extends 'FULL_NAME'
        ? FieldFullNameMetadata
        : E extends 'DATE_TIME'
          ? FieldDateTimeMetadata
          : E extends 'DATE'
            ? FieldDateMetadata
            : E extends 'EMAIL'
              ? FieldEmailMetadata
              : E extends 'EMAILS'
                ? FieldEmailsMetadata
                : E extends 'SELECT'
                  ? FieldSelectMetadata
                  : E extends 'MULTI_SELECT'
                    ? FieldMultiSelectMetadata
                    : E extends 'RATING'
                      ? FieldRatingMetadata
                      : E extends 'LINK'
                        ? FieldLinkMetadata
                        : E extends 'LINKS'
                          ? FieldLinksMetadata
                          : E extends 'NUMBER'
                            ? FieldNumberMetadata
                            : E extends 'PHONE'
                              ? FieldPhoneMetadata
                              : E extends 'RELATION'
                                ? FieldRelationMetadata
                                : E extends 'MORPH_RELATION'
                                  ? FieldMorphRelationMetadata
                                  : E extends 'TEXT'
                                    ? FieldTextMetadata
                                    : E extends 'UUID'
                                      ? FieldUuidMetadata
                                      : E extends 'ADDRESS'
                                        ? FieldAddressMetadata
                                        : E extends 'RAW_JSON'
                                          ? FieldRawJsonMetadata
                                          : E extends 'RICH_TEXT_V2'
                                            ? FieldRichTextV2Metadata
                                            : E extends 'RICH_TEXT'
                                              ? FieldRichTextMetadata
                                              : E extends 'ACTOR'
                                                ? FieldActorMetadata
                                                : E extends 'ARRAY'
                                                  ? FieldArrayMetadata
                                                  : E extends 'PHONES'
                                                    ? FieldPhonesMetadata
                                                    : never,
>(
  fieldType: E,
  fieldTypeGuard: (
    a: FieldDefinition<FieldMetadata>,
  ) => a is FieldDefinition<T>,
  fieldDefinition: FieldDefinition<FieldMetadata>,
) => asserts fieldDefinition is FieldDefinition<T>;

export const assertFieldMetadata: AssertFieldMetadataFunction = (
  fieldType,
  fieldTypeGuard,
  fieldDefinition,
) => {
  const fieldDefinitionType = fieldDefinition.type;

  if (!fieldTypeGuard(fieldDefinition) || fieldDefinitionType !== fieldType) {
    throw new Error(
      `Trying to use a "${fieldDefinitionType}" field as a "${fieldType}" field. Verify that the field is defined as a type "${fieldDefinitionType}" field in assertFieldMetadata.ts.`,
    );
  } else {
    return;
  }
};
