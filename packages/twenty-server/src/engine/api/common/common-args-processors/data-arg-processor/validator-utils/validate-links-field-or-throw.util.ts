import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isNull } from '@sniptt/guards';
import {
  type FieldLinksVariant,
  type LinkMetadataNullable,
} from 'twenty-shared/types';
import { isValidDomain } from 'twenty-shared/utils';

import { parseArrayOrJsonStringToArray } from 'src/engine/api/graphql/graphql-query-runner/utils/parse-additional-items.util';
import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type LinksFieldGraphQLInput } from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';

const assertDomainOrThrow = (value: unknown, fieldName: string) => {
  if (!isNonEmptyString(value)) {
    return;
  }

  if (!isValidDomain(value)) {
    throw new CommonQueryRunnerException(
      `"${value}" is not a domain name, for domain-typed links field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Please enter a domain name, like twenty.com` },
    );
  }
};

export const validateLinksFieldOrThrow = ({
  value,
  fieldName,
  linksVariant,
}: {
  value: unknown;
  fieldName: string;
  linksVariant?: FieldLinksVariant;
}): LinksFieldGraphQLInput | null => {
  const preValidatedValue = validateRawJsonFieldOrThrow(value, fieldName);

  if (isNull(preValidatedValue)) return null;

  const isDomainField = linksVariant === 'domain';

  for (const [subField, subFieldValue] of Object.entries(preValidatedValue)) {
    switch (subField) {
      case 'primaryLinkUrl':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);

        if (isDomainField) {
          assertDomainOrThrow(subFieldValue, `${fieldName}.${subField}`);
        }
        break;
      case 'primaryLinkLabel':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'secondaryLinks':
        validateRawJsonFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);

        if (isDomainField) {
          for (const link of parseArrayOrJsonStringToArray<LinkMetadataNullable>(
            subFieldValue as LinkMetadataNullable[] | string | null,
          )) {
            assertDomainOrThrow(link.url, `${fieldName}.${subField}`);
          }
        }
        break;
      default:
        throw new CommonQueryRunnerException(
          `Invalid subfield ${subField} for links field "${fieldName}"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`Invalid value for links.` },
        );
    }
  }

  return value as LinksFieldGraphQLInput;
};
