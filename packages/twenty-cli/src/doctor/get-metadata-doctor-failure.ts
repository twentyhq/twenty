import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type DoctorCheck } from '@/doctor/types/doctor-check.type';
import { CliError } from '@/output/cli-error';
import { type CliErrorCode } from '@/output/types/cli-error-code.type';

const FAILURE_MESSAGES: Partial<
  Record<CliErrorCode, { message: string; hint: string }>
> = {
  AUTH_REQUIRED: {
    message: 'The metadata endpoint rejected these credentials.',
    hint: 'Check the configured credentials, or sign in again.',
  },
  PERMISSION_DENIED: {
    message: 'The metadata endpoint denied access to the workspace identity.',
    hint: 'Check the selected remote and the permissions granted to its credentials.',
  },
  INVALID_RESPONSE: {
    message: 'The server did not return a valid metadata API response.',
    hint: 'Check the API URL and base path, and whether a proxy returned another page.',
  },
  UNSUPPORTED_RESPONSE_TYPE: {
    message: 'The metadata endpoint returned an unsupported response type.',
    hint: 'Check the API URL and base path, and whether a proxy returned another page.',
  },
  REDIRECT_NOT_FOLLOWED: {
    message:
      'The metadata endpoint redirected the request. No redirect was followed.',
    hint: 'Configure the final Twenty API URL, including the correct protocol and base path.',
  },
  TIMEOUT: {
    message:
      'The metadata endpoint did not respond before the request timed out.',
    hint: 'Check server availability and the network connection.',
  },
  NETWORK_ERROR: {
    message: 'Could not connect to the metadata endpoint.',
    hint: 'Check the API URL, network connection, server availability and TLS configuration.',
  },
};

const NETWORK_FAILURE_MESSAGES: Partial<Record<string, string>> = {
  ENOTFOUND: 'DNS could not resolve the metadata endpoint hostname.',
  EAI_AGAIN: 'DNS resolution of the metadata endpoint temporarily failed.',
  ECONNREFUSED: 'The metadata endpoint refused the connection.',
  ECONNRESET: 'The connection to the metadata endpoint was reset.',
  EHOSTUNREACH: 'The metadata endpoint host is unreachable.',
  ENETUNREACH: 'The network containing the metadata endpoint is unreachable.',
  ETIMEDOUT: 'The connection to the metadata endpoint timed out.',
  UND_ERR_CONNECT_TIMEOUT: 'The connection to the metadata endpoint timed out.',
  CERT_HAS_EXPIRED: 'The metadata endpoint TLS certificate has expired.',
  ERR_TLS_CERT_ALTNAME_INVALID:
    'The metadata endpoint TLS certificate does not match its hostname.',
  DEPTH_ZERO_SELF_SIGNED_CERT:
    'The metadata endpoint uses an untrusted self-signed TLS certificate.',
  SELF_SIGNED_CERT_IN_CHAIN:
    'The metadata endpoint TLS certificate chain contains an untrusted self-signed certificate.',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE:
    'The metadata endpoint TLS certificate chain could not be verified.',
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY:
    'The metadata endpoint TLS certificate issuer is not trusted locally.',
};

export const getMetadataDoctorFailure = (error: unknown): DoctorCheck => {
  const code = error instanceof CliError ? error.code : 'INTERNAL_ERROR';
  const description = FAILURE_MESSAGES[code] ?? {
    message: `The metadata endpoint could not be verified (${code}).`,
    hint: 'Check the API URL and server availability.',
  };
  const networkCode =
    error instanceof CliError && code === 'NETWORK_ERROR'
      ? error.details?.networkCode
      : undefined;
  const networkMessage =
    isString(networkCode) &&
    Object.hasOwn(NETWORK_FAILURE_MESSAGES, networkCode)
      ? NETWORK_FAILURE_MESSAGES[networkCode]
      : undefined;

  return {
    id: 'metadata-api',
    status: 'fail',
    code,
    message: networkMessage ?? description.message,
    hint:
      error instanceof CliError &&
      code === 'AUTH_REQUIRED' &&
      isDefined(error.hint)
        ? error.hint
        : description.hint,
    ...(isDefined(networkMessage) ? { details: { networkCode } } : {}),
  };
};
