import { isDefined } from 'twenty-shared/utils';

const URL_PROTOCOL_PATTERN = /^https?:\/\//i;

export const splitUrlProtocol = (
  url: string,
): { protocol: string | undefined; urlWithoutProtocol: string } => {
  const protocol = url.match(URL_PROTOCOL_PATTERN)?.[0];

  return {
    protocol,
    urlWithoutProtocol: isDefined(protocol) ? url.slice(protocol.length) : url,
  };
};
