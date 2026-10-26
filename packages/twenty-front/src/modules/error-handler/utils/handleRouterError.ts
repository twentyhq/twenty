import { type ClientOnErrorFunction } from 'react-router-dom';

import { convertUnknownToError } from '@/error-handler/utils/convertUnknownToError';
import { handleAppError } from '@/error-handler/utils/handleAppError';

export const handleRouterError: ClientOnErrorFunction = (
  error,
  { errorInfo },
) => {
  handleAppError({ error: convertUnknownToError(error), errorInfo });
};
