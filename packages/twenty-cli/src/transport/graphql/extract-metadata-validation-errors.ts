import { isArray, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export type MetadataValidationError = {
  metadataName: string;
  universalIdentifier: string | null;
  name: string | null;
  summary: string | null;
  message: string;
};

export const extractMetadataValidationErrors = (
  extensions: Record<string, unknown>,
): MetadataValidationError[] => {
  if (
    extensions.code !== 'METADATA_VALIDATION_FAILED' ||
    !isPlainObject(extensions.errors)
  ) {
    return [];
  }

  return Object.entries(extensions.errors).flatMap(
    ([metadataName, failedValidations]) =>
      (isArray(failedValidations) ? failedValidations : []).flatMap(
        (failedValidation) => {
          if (
            !isPlainObject(failedValidation) ||
            !isArray(failedValidation.errors)
          ) {
            return [];
          }

          const entity = isPlainObject(
            failedValidation.flatEntityMinimalInformation,
          )
            ? failedValidation.flatEntityMinimalInformation
            : {};

          return failedValidation.errors.flatMap((validationError) =>
            isPlainObject(validationError) && isString(validationError.message)
              ? [
                  {
                    metadataName,
                    universalIdentifier: isString(entity.universalIdentifier)
                      ? entity.universalIdentifier
                      : null,
                    name: isString(entity.name) ? entity.name : null,
                    summary: isString(validationError.userFriendlyMessage)
                      ? validationError.userFriendlyMessage
                      : null,
                    message: validationError.message,
                  },
                ]
              : [],
          );
        },
      ),
  );
};
