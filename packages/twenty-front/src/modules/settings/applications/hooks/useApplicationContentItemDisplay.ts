import { useLingui } from '@lingui/react/macro';

import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentItemDisplay } from '@/settings/applications/utils/getApplicationContentItemDisplay';

type ApplicationContentItemDisplayArgs = {
  contentType: ApplicationContentType;
  item: Pick<
    ApplicationContentItem,
    'label' | 'icon' | 'objectUniversalIdentifier'
  >;
};

export const useApplicationContentItemDisplay = (
  content: Pick<ApplicationContent, 'objects'> | undefined,
) => {
  const { t } = useLingui();
  const resolveObject = useApplicationContentObjectResolver(content);

  const getItemDisplay = ({
    contentType,
    item,
  }: ApplicationContentItemDisplayArgs) =>
    getApplicationContentItemDisplay({
      contentType,
      item,
      object: resolveObject(item.objectUniversalIdentifier),
      fallbackLabelPlural: t`Records`,
      fallbackLabelSingular: t`Record`,
    });

  return {
    getItemLabel: (args: ApplicationContentItemDisplayArgs) =>
      getItemDisplay(args).label,
    getItemIcon: (args: ApplicationContentItemDisplayArgs) =>
      getItemDisplay(args).icon,
  };
};
