import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';

import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export const SettingsApplicationContentTag = ({
  contentType,
  tag,
}: {
  contentType: ApplicationContentType;
  tag: string;
}) => {
  const { t } = useLingui();
  const tagConfig = APPLICATION_CONTENT_TYPE_CONFIGS[contentType].tags?.[tag];

  return (
    <Tag color={tagConfig?.color ?? 'gray'}>
      {isDefined(tagConfig) ? t(tagConfig.label) : tag}
    </Tag>
  );
};
