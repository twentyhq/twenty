import {
  ExchangeAuthCodeInput,
  ExchangeAuthCodeResponse,
  Tokens,
} from '~/db/types/auth.types';
import { EXCHANGE_AUTHORIZATION_CODE } from '~/graphql/auth/mutations';
import { isDefined } from '~/utils/isDefined';
import { callMutation } from '~/utils/requestDb';

export const exchangeAuthorizationCode = async (
  exchangeAuthCodeInput: ExchangeAuthCodeInput,
): Promise<Tokens | null> => {
  const data = await callMutation<ExchangeAuthCodeResponse>(
    EXCHANGE_AUTHORIZATION_CODE,
    exchangeAuthCodeInput,
  );
  if (isDefined(data?.exchangeAuthorizationCode))
    return data.exchangeAuthorizationCode;
  else return null;
};

// export const RenewToken = async (appToken: string): Promise<Tokens | null> => {
//   const data = await callQuery<Tokens>(RENEW_TOKEN, { appToken });
//   if (isDefined(data)) return data;
//   else return null;
// };
