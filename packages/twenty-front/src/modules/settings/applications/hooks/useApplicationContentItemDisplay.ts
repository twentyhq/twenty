import { useLingui } from '@lingui/react/macro';
import {
  buildObjectMetadataLabelPlaceholderValues,
  interpolateMessagePlaceholders,
} from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

type ApplicationContentDisplayItem = Pick<
  ApplicationContentItem,
  'label' | 'icon' | 'objectUniversalIdentifier'
>;

// Command menu items store templated labels and icons resolved per object
export const useApplicationContentItemDisplay = (
  content: Pick<ApplicationContent, 'objects'> | undefined,
) => {
  const { t } = useLingui();
  const resolveObject = useApplicationContentObjectResolver(content);

  const getPlaceholderValues = (item: ApplicationContentDisplayItem) => {
    const object = resolveObject(item.objectUniversalIdentifier);
    const labelPlural = object?.label ?? t`Records`;

    return buildObjectMetadataLabelPlaceholderValues({
      label: labelPlural,
      labelPlural,
      labelSingular: object?.labelSingular ?? t`Record`,
      icon: object?.icon,
    });
  };

  const getItemLabel = ({
    contentType,
    item,
  }: {
    contentType: ApplicationContentType;
    item: ApplicationContentDisplayItem;
  }) =>
    contentType === 'commandMenuItems'
      ? interpolateMessagePlaceholders(item.label, getPlaceholderValues(item))
      : item.label;

  const getItemIcon = ({
    contentType,
    item,
  }: {
    contentType: ApplicationContentType;
    item: ApplicationContentDisplayItem;
  }) =>
    contentType === 'commandMenuItems' && isDefined(item.icon)
      ? interpolateMessagePlaceholders(item.icon, getPlaceholderValues(item))
      : item.icon;

  return { getItemLabel, getItemIcon };
};
