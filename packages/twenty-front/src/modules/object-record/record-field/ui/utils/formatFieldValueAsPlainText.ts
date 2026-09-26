import { t } from '@lingui/core/macro';
import { isArray, isNonEmptyString, isNumber, isString } from '@sniptt/guards';

import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldDateMetadataSettings,
  type FieldMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldActor } from '@/object-record/record-field/ui/types/guards/isFieldActor';
import { isFieldActorValue } from '@/object-record/record-field/ui/types/guards/isFieldActorValue';
import { isFieldAddress } from '@/object-record/record-field/ui/types/guards/isFieldAddress';
import { isFieldAddressValue } from '@/object-record/record-field/ui/types/guards/isFieldAddressValue';
import { isFieldArray } from '@/object-record/record-field/ui/types/guards/isFieldArray';
import { isFieldArrayValue } from '@/object-record/record-field/ui/types/guards/isFieldArrayValue';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { isFieldDate } from '@/object-record/record-field/ui/types/guards/isFieldDate';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldEmailsValue } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { isFieldFiles } from '@/object-record/record-field/ui/types/guards/isFieldFiles';
import { isFieldFilesValue } from '@/object-record/record-field/ui/types/guards/isFieldFilesValue';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldMorphRelationManyToOneValue } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOneValue';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldMorphRelationOneToManyValue } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToManyValue';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { isFieldPhonesValue } from '@/object-record/record-field/ui/types/guards/isFieldPhonesValue';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';
import { isFieldRichTextValue } from '@/object-record/record-field/ui/types/guards/isFieldRichTextValue';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';
import { formatFullNameFieldValue } from '@/object-record/record-field/ui/utils/formatFullNameFieldValue';
import { formatNumberFieldValue } from '@/object-record/record-field/ui/utils/formatNumberFieldValue';
import { isObjectWithId } from '@/object-record/record-field/ui/utils/junction/isObjectWithId';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { formatAddressDisplay } from '~/utils/formatAddressDisplay';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';

export type FieldValuePlainTextFormatters = {
  formatNumber: (value: number, options?: { decimals?: number }) => string;
  formatDate: (
    value: string,
    dateFieldSettings?: FieldDateMetadataSettings,
  ) => string;
  formatDateTime: (
    value: string,
    dateFieldSettings?: FieldDateMetadataSettings,
  ) => string;
  getRecordLabel: (record: ObjectRecord, objectNameSingular: string) => string;
};

const joinNonEmpty = (
  values: (string | null | undefined)[],
  separator = ', ',
) => values.filter(isNonEmptyString).join(separator);

export const formatFieldValueAsPlainText = ({
  fieldDefinition,
  fieldValue,
  formatters,
}: {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  fieldValue: unknown;
  formatters: FieldValuePlainTextFormatters;
}): string => {
  if (!isDefined(fieldValue)) {
    return '';
  }

  if (isFieldNumber(fieldDefinition) && isNumber(fieldValue)) {
    return formatNumberFieldValue({
      value: fieldValue,
      settings: fieldDefinition.metadata.settings,
      formatNumber: formatters.formatNumber,
    });
  }

  if (isFieldCurrency(fieldDefinition) && isFieldCurrencyValue(fieldValue)) {
    if (!isDefined(fieldValue.amountMicros)) {
      return '';
    }

    const amount = formatters.formatNumber(fieldValue.amountMicros / 1000000, {
      decimals:
        fieldDefinition.metadata.settings?.decimals ?? DEFAULT_DECIMAL_VALUE,
    });

    return joinNonEmpty([amount, fieldValue.currencyCode], ' ');
  }

  if (isFieldDate(fieldDefinition) && isString(fieldValue)) {
    return formatters.formatDate(fieldValue, fieldDefinition.metadata.settings);
  }

  if (isFieldDateTime(fieldDefinition) && isString(fieldValue)) {
    return formatters.formatDateTime(
      fieldValue,
      fieldDefinition.metadata.settings,
    );
  }

  if (isFieldBoolean(fieldDefinition)) {
    return fieldValue === true ? t`True` : t`False`;
  }

  if (isFieldSelect(fieldDefinition)) {
    return (
      fieldDefinition.metadata.options.find(
        (option) => option.value === fieldValue,
      )?.label ?? ''
    );
  }

  if (isFieldMultiSelect(fieldDefinition) && isArray(fieldValue)) {
    return joinNonEmpty(
      fieldValue.map(
        (value) =>
          fieldDefinition.metadata.options.find(
            (option) => option.value === value,
          )?.label,
      ),
    );
  }

  if (isFieldRating(fieldDefinition) && isString(fieldValue)) {
    return fieldValue.replace('RATING_', '');
  }

  if (isFieldFullName(fieldDefinition) && isFieldFullNameValue(fieldValue)) {
    return formatFullNameFieldValue(fieldValue);
  }

  if (isFieldAddress(fieldDefinition) && isFieldAddressValue(fieldValue)) {
    return formatAddressDisplay(
      fieldValue,
      fieldDefinition.metadata.settings?.subFields,
    );
  }

  if (isFieldEmails(fieldDefinition) && isFieldEmailsValue(fieldValue)) {
    return joinNonEmpty([
      fieldValue.primaryEmail,
      ...(fieldValue.additionalEmails ?? []),
    ]);
  }

  if (isFieldPhones(fieldDefinition) && isFieldPhonesValue(fieldValue)) {
    return joinNonEmpty(
      createPhonesFromFieldValue(fieldValue).map(
        ({ callingCode, number }) => `${callingCode}${number}`,
      ),
    );
  }

  if (isFieldLinks(fieldDefinition) && isFieldLinksValue(fieldValue)) {
    return joinNonEmpty(
      getFieldLinkDefinedLinks(fieldValue).map((link) => link.url),
    );
  }

  if (isFieldArray(fieldDefinition) && isFieldArrayValue(fieldValue)) {
    return joinNonEmpty(fieldValue);
  }

  if (isFieldFiles(fieldDefinition) && isFieldFilesValue(fieldValue)) {
    return joinNonEmpty(fieldValue.map((file) => file.label));
  }

  if (isFieldRichText(fieldDefinition) && isFieldRichTextValue(fieldValue)) {
    return fieldValue.markdown?.trim() ?? '';
  }

  if (isFieldActor(fieldDefinition) && isFieldActorValue(fieldValue)) {
    return fieldValue.name;
  }

  if (isFieldRawJson(fieldDefinition)) {
    return isString(fieldValue)
      ? fieldValue
      : JSON.stringify(fieldValue, null, 2);
  }

  if (isFieldRelation(fieldDefinition)) {
    const { relationObjectMetadataNameSingular } = fieldDefinition.metadata;
    const records = isArray(fieldValue) ? fieldValue : [fieldValue];

    return joinNonEmpty(
      records
        .filter(isObjectWithId)
        .map((record) =>
          formatters.getRecordLabel(record, relationObjectMetadataNameSingular),
        ),
    );
  }

  if (
    isFieldMorphRelationManyToOne(fieldDefinition) &&
    isFieldMorphRelationManyToOneValue(fieldValue)
  ) {
    return isDefined(fieldValue.value)
      ? formatters.getRecordLabel(
          fieldValue.value,
          fieldValue.objectNameSingular,
        )
      : '';
  }

  if (
    isFieldMorphRelationOneToMany(fieldDefinition) &&
    isFieldMorphRelationOneToManyValue(fieldValue)
  ) {
    return joinNonEmpty(
      fieldValue.flatMap(({ objectNameSingular, value }) =>
        value.map((record) =>
          formatters.getRecordLabel(record, objectNameSingular),
        ),
      ),
    );
  }

  if (isString(fieldValue) || isNumber(fieldValue)) {
    return `${fieldValue}`;
  }

  return '';
};
