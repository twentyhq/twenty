import {
  buildObjectMetadataLabelPlaceholderValues,
  interpolateMessagePlaceholders,
} from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { type ResolvedApplicationContentObject } from '@/settings/applications/types/ResolvedApplicationContentObject';

export const getApplicationContentItemDisplay = ({
  contentType,
  item,
  object,
  fallbackLabelPlural,
  fallbackLabelSingular,
}: {
  contentType: ApplicationContentType;
  item: Pick<ApplicationContentItem, 'label' | 'icon'>;
  object:
    | Pick<ResolvedApplicationContentObject, 'label' | 'labelSingular' | 'icon'>
    | undefined;
  fallbackLabelPlural: string;
  fallbackLabelSingular: string;
}) => {
  if (contentType !== 'commandMenuItems') {
    return { label: item.label, icon: item.icon };
  }

  const labelPlural = object?.label ?? fallbackLabelPlural;
  const placeholderValues = buildObjectMetadataLabelPlaceholderValues({
    label: labelPlural,
    labelPlural,
    labelSingular: object?.labelSingular ?? fallbackLabelSingular,
    icon: object?.icon,
  });

  return {
    label: interpolateMessagePlaceholders(item.label, placeholderValues),
    icon: isDefined(item.icon)
      ? interpolateMessagePlaceholders(item.icon, placeholderValues)
      : item.icon,
  };
};
