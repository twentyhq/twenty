import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import {
  FieldActorMetadata,
  FieldAddressMetadata,
  FieldArrayMetadata,
  FieldBooleanMetadata,
  FieldCurrencyMetadata,
  FieldDateMetadata,
  FieldDateTimeMetadata,
  FieldEmailMetadata,
  FieldEmailsMetadata,
  FieldFullNameMetadata,
  FieldLinkMetadata,
  FieldLinksMetadata,
  FieldMetadata,
  FieldMultiSelectMetadata,
  FieldNumberMetadata,
  FieldPhoneMetadata,
  FieldPhonesMetadata,
  FieldRatingMetadata,
  FieldRawJsonMetadata,
  FieldRelationMetadata,
  FieldRichTextMetadata,
  FieldSelectMetadata,
  FieldTextMetadata,
  FieldUuidMetadata,
} from '../FieldMetadata';

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
                                : E extends 'TEXT'
                                  ? FieldTextMetadata
                                  : E extends 'UUID'
                                    ? FieldUuidMetadata
                                    : E extends 'ADDRESS'
                                      ? FieldAddressMetadata
                                      : E extends 'RAW_JSON'
                                        ? FieldRawJsonMetadata
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
