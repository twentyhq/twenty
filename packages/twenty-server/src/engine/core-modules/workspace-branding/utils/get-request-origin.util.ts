import { type Request } from 'express';

export const getRequestOrigin = (request: Request): string => {
  const forwardedProto = request.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string'
      ? forwardedProto.split(',')[0]?.trim()
      : request.protocol;

  const forwardedHost = request.headers['x-forwarded-host'];
  const hostHeader =
    typeof forwardedHost === 'string'
      ? forwardedHost.split(',')[0]?.trim()
      : request.headers.host;

  const hostname = hostHeader ?? request.hostname;

  return `${protocol}://${hostname}`;
};
