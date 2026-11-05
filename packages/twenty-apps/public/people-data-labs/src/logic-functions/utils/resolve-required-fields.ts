import { isArray } from '@sniptt/guards';

import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { toText } from 'src/logic-functions/utils/to-text';
import { type RequiredFieldOption } from 'src/types/required-field-option';
import { isDefined } from 'src/utils/is-defined';

const INVALID_REQUIRED_FIELDS_MESSAGE =
  'Required fields must be a selection of supported output fields.';

const toRequiredFieldName = ({
  field,
  options,
}: {
  field: unknown;
  options: RequiredFieldOption[];
}): string | undefined =>
  options.find(({ label, value }) => field === value || field === label)?.value;

const toRequiredFieldNames = ({
  fields,
  options,
}: {
  fields: unknown;
  options: RequiredFieldOption[];
}): string[] =>
  isArray(fields)
    ? fields
        .map((field) => toRequiredFieldName({ field, options }))
        .filter(isDefined)
    : [];

const findInvalidRequiredFieldsMessage = ({
  fields,
  options,
}: {
  fields: unknown;
  options: RequiredFieldOption[];
}): string | undefined => {
  if (!isArray(fields)) {
    return INVALID_REQUIRED_FIELDS_MESSAGE;
  }

  const unsupportedFields = fields.filter(
    (field) => !isDefined(toRequiredFieldName({ field, options })),
  );

  if (unsupportedFields.length === 0) {
    return undefined;
  }

  const unsupportedFieldList = unsupportedFields
    .map((field) => JSON.stringify(field))
    .join(', ');

  return `${INVALID_REQUIRED_FIELDS_MESSAGE} Unsupported values: ${unsupportedFieldList}.`;
};

const parseConfiguredRequiredFields = (envVarName: string): unknown => {
  const configuredRequiredFields = toText(process.env[envVarName]);

  if (!isDefined(configuredRequiredFields)) {
    return [];
  }

  try {
    return JSON.parse(configuredRequiredFields);
  } catch {
    throw new PdlConfigError(INVALID_REQUIRED_FIELDS_MESSAGE);
  }
};

const getConfiguredRequiredFieldNames = ({
  envVarName,
  options,
}: {
  envVarName: string;
  options: RequiredFieldOption[];
}): string[] => {
  const configuredRequiredFields = parseConfiguredRequiredFields(envVarName);
  const invalidRequiredFieldsMessage = findInvalidRequiredFieldsMessage({
    fields: configuredRequiredFields,
    options,
  });

  if (isDefined(invalidRequiredFieldsMessage)) {
    throw new PdlConfigError(invalidRequiredFieldsMessage);
  }

  return toRequiredFieldNames({ fields: configuredRequiredFields, options });
};

export const resolveRequiredFields = ({
  requiredFields,
  envVarName,
  options,
}: {
  requiredFields?: string[] | null;
  envVarName: string;
  options: RequiredFieldOption[];
}): string | undefined => {
  const invalidRequiredFieldsMessage = isDefined(requiredFields)
    ? findInvalidRequiredFieldsMessage({ fields: requiredFields, options })
    : undefined;

  if (isDefined(invalidRequiredFieldsMessage)) {
    throw new PdlInvalidInputError(invalidRequiredFieldsMessage);
  }

  const workflowRequiredFieldNames = toRequiredFieldNames({
    fields: requiredFields,
    options,
  });
  const requiredFieldNames =
    workflowRequiredFieldNames.length > 0
      ? workflowRequiredFieldNames
      : getConfiguredRequiredFieldNames({ envVarName, options });

  return [...new Set(requiredFieldNames)].join(' AND ') || undefined;
};
