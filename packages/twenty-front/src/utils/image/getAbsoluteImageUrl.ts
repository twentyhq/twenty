import { isNonEmptyString } from '@sniptt/guards';
import { getImageAbsoluteURI } from 'twenty-shared/utils';

import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const getAbsoluteImageUrl = (
  imageUrl?: string | null,
): string | undefined =>
  isNonEmptyString(imageUrl)
    ? getImageAbsoluteURI({ imageUrl, baseUrl: REACT_APP_SERVER_BASE_URL })
    : undefined;
