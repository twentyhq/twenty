import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const hasTokenPair = () => {
  const tokenPair = getTokenPair();
  return (
    !isUndefinedOrNull(tokenPair) &&
    !isUndefinedOrNull(tokenPair.accessToken?.token)
  );
};
