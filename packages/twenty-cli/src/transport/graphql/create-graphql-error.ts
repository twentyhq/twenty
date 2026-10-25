import { isArray, isNonEmptyArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { getAuthenticationHint } from '@/target/get-authentication-hint';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import {
  extractMetadataValidationErrors,
  type MetadataValidationError,
} from '@/transport/graphql/extract-metadata-validation-errors';
import { pickSafeResponseHeaders } from '@/transport/pick-safe-response-headers';

const toPublicGraphqlError = (error: unknown) => {
  const entry: Record<string, unknown> = isPlainObject(error) ? error : {};
  const extensions = isPlainObject(entry.extensions) ? entry.extensions : {};
  const validationErrors = extractMetadataValidationErrors(extensions);

  return {
    message: isString(entry.message) ? entry.message : 'Unknown GraphQL error',
    path: isArray(entry.path) ? entry.path : null,
    code: isString(extensions.code) ? extensions.code : null,
    ...(isString(extensions.subCode) ? { subCode: extensions.subCode } : {}),
    ...(isNonEmptyArray(validationErrors) ? { validationErrors } : {}),
  };
};

const formatValidationError = ({
  metadataName,
  universalIdentifier,
  name,
  summary,
  message,
}: MetadataValidationError) =>
  `  ${metadataName} ${name ?? universalIdentifier ?? '(unknown)'}: ${
    isDefined(summary) && summary !== message
      ? `${summary} (${message})`
      : message
  }`;

const summarizeMessages = (
  errors: { message: string; validationErrors?: MetadataValidationError[] }[],
) => {
  const summary =
    errors.length === 1
      ? errors[0].message
      : `${errors[0].message} (and ${errors.length - 1} more errors)`;
  const validationErrors = errors.flatMap(
    (error) => error.validationErrors ?? [],
  );

  return [summary, ...validationErrors.map(formatValidationError)].join('\n');
};

export const createGraphqlError = ({
  errors,
  data,
  status,
  headers,
  target,
}: {
  errors: unknown[];
  data: unknown;
  status: number;
  headers: Headers;
  target: ResolvedTarget;
}) => {
  const publicErrors = errors.map(toPublicGraphqlError);
  const errorCodes = publicErrors.map((error) => error.code);
  const details = {
    status,
    headers: pickSafeResponseHeaders(headers),
    errors: publicErrors,
    data: data ?? null,
  };

  if (status === 401 || errorCodes.includes('UNAUTHENTICATED')) {
    return new CliError({
      code: 'AUTH_REQUIRED',
      exitCode: EXIT_CODE.AUTHENTICATION,
      message: `${target.apiUrl} rejected the credentials.`,
      hint: getAuthenticationHint(target),
      details,
    });
  }

  if (status === 403 || errorCodes.includes('FORBIDDEN')) {
    return new CliError({
      code: 'PERMISSION_DENIED',
      exitCode: EXIT_CODE.AUTHENTICATION,
      message: summarizeMessages(publicErrors),
      details,
    });
  }

  return new CliError({
    code: 'GRAPHQL_ERROR',
    message: summarizeMessages(publicErrors),
    details,
  });
};
