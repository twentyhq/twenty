import {
  ExchangeAuthCodeInput,
  ExchangeAuthCodeResponse,
  Tokens,
} from '~/db/types/auth.types';
import { EXCHANGE_AUTHORIZATION_CODE } from '~/graphql/auth/mutations';
import { callMutation } from '~/utils/requestDb';
import { isDefined } from 'twenty-shared/utils';

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
