import { isArray, isNonEmptyString, isString } from '@sniptt/guards';

import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { isDefined } from 'src/utils/is-defined';

const INVALID_REQUIRED_FIELDS_MESSAGE =
  'Required fields must be a selection of supported output fields.';

const getConfiguredRequiredFields = (envVarName: string): unknown => {
  const configuredRequiredFields = process.env[envVarName];

  if (!isNonEmptyString(configuredRequiredFields?.trim())) {
    return [];
  }

  try {
    return JSON.parse(configuredRequiredFields);
  } catch {
    throw new PdlConfigError(INVALID_REQUIRED_FIELDS_MESSAGE);
  }
};

export const resolveRequiredFields = ({
  requiredFields,
  envVarName,
  options,
}: {
  requiredFields?: string[] | null;
  envVarName: string;
  options: { value: string }[];
}): string | undefined => {
  const resolvedRequiredFields =
    requiredFields ?? getConfiguredRequiredFields(envVarName);
  const areRequiredFieldsValid =
    isArray(resolvedRequiredFields) &&
    resolvedRequiredFields.every(
      (field) =>
        isString(field) && options.some(({ value }) => value === field),
    );

  if (!areRequiredFieldsValid) {
    const ErrorType = isDefined(requiredFields)
      ? PdlInvalidInputError
      : PdlConfigError;

    throw new ErrorType(INVALID_REQUIRED_FIELDS_MESSAGE);
  }

  return [...new Set(resolvedRequiredFields)].join(' AND ') || undefined;
};
