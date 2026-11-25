import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export const isApplicationContentType = (
  value: string | undefined,
): value is ApplicationContentType =>
  isDefined(value) && Object.hasOwn(APPLICATION_CONTENT_TYPE_CONFIGS, value);
