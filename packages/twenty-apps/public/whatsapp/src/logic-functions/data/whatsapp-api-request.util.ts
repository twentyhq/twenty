import axios from 'axios';
import { isDefined } from 'twenty-sdk/utils';
import { preparedWhatsappAPIAddress } from 'src/logic-functions/data/prepared-whatsapp-api-address.util';
import { type WhatsAppApiEndpoints } from 'src/logic-functions/types/whatsapp-api.type';

type WhatsappApiRequestParams<TEndpoint extends keyof WhatsAppApiEndpoints> = {
  accessToken: string;
  endpoint: TEndpoint;
  pathParams?: Record<string, string>;
  query?: WhatsAppApiEndpoints[TEndpoint]['query'];
  data?: WhatsAppApiEndpoints[TEndpoint]['request'];
};

export const whatsappApiRequest = async <TEndpoint extends keyof WhatsAppApiEndpoints>({
  accessToken,
  endpoint,
  pathParams = {},
  query,
  data,
}: WhatsappApiRequestParams<TEndpoint>): Promise<WhatsAppApiEndpoints[TEndpoint]['response']> => {
  const separatorIndex = endpoint.indexOf(' ');
  const method = endpoint.slice(0, separatorIndex);

  const path = endpoint
    .slice(separatorIndex + 2)
    .replace(/\{(\w+)\}/g, (_, name: string) => {
      const value = pathParams[name];

      if (!isDefined(value)) {
        throw new Error(`Missing path parameter "${name}" for ${endpoint}`);
      }

      return encodeURIComponent(value);
    });

  const response = await axios.request({
    url: preparedWhatsappAPIAddress(path),
    method,
    params: query,
    data,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data;
};
