import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { isDefined } from 'twenty-shared/utils';

export const hasTokenPair = () => {
  const tokenPair = getTokenPair();
  // getTokenPair now handles validation internally, so if it returns a tokenPair,
  // it's guaranteed to have the correct structure
  return isDefined(tokenPair);
};
