import { ExchangeAuthCodeInput, ExchangeAuthCodeResponse } from '~/db/types/auth.types';
import { EXCHANGE_AUTHORIZATION_CODE } from '~/graphql/auth/mutations';
import { callMutation } from '~/utils/requestDb';

export const exchangeAuthorizationCode = async (exchangeAuthCodeInput: ExchangeAuthCodeInput): Promise<ExchangeAuthCodeResponse | null> => {
  const data = await callMutation<ExchangeAuthCodeResponse>(EXCHANGE_AUTHORIZATION_CODE, exchangeAuthCodeInput);
  return data;
};
