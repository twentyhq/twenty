import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';
import { type ApplicationContentFilterOption } from '@/settings/applications/types/ApplicationContentFilterOption';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

type ApplicationContentFilter = {
  key: ApplicationContentFilterKey;
  options: ApplicationContentFilterOption[];
  isSelectable: boolean;
  getItemKeys: (item: ApplicationContentItem) => (string | null | undefined)[];
};

export const useApplicationContentFilters = (
  contentType: ApplicationContentType,
  content: ApplicationContent,
): ApplicationContentFilter[] => {
  const resolveObject = useApplicationContentObjectResolver(content);

  const buildFilter = (
    key: ApplicationContentFilterKey,
  ): ApplicationContentFilter => {
    switch (key) {
      case 'object':
        return {
          key,
          isSelectable: true,
          options: [
            ...new Set(
              content[contentType]
                .map((item) => item.objectUniversalIdentifier)
                .filter(isDefined),
            ),
          ]
            .map(resolveObject)
            .filter(isDefined),
          getItemKeys: (item) => [item.objectUniversalIdentifier],
        };
      case 'view':
        return {
          key,
          isSelectable: true,
          options: content.views.map((view) => ({
            universalIdentifier: view.universalIdentifier,
            label: view.label,
            icon: view.icon,
            color: resolveObject(view.objectUniversalIdentifier)?.color,
          })),
          getItemKeys: (item) => [item.parentUniversalIdentifier],
        };
      case 'pageLayout':
        return {
          key,
          isSelectable: true,
          options: content.pageLayouts.map((pageLayout) => ({
            universalIdentifier: pageLayout.universalIdentifier,
            label: pageLayout.label,
            icon: pageLayout.icon,
            color: resolveObject(pageLayout.objectUniversalIdentifier)?.color,
          })),
          getItemKeys: (item) => [item.parentUniversalIdentifier],
        };
      case 'field':
        // A view shows a field when one of its view fields points to it
        return {
          key,
          isSelectable: false,
          options: content.fields.map((field) => ({
            universalIdentifier: field.universalIdentifier,
            label: field.label,
            icon: field.icon,
          })),
          getItemKeys: (item) =>
            content.viewFields
              .filter(
                (viewField) =>
                  viewField.parentUniversalIdentifier ===
                  item.universalIdentifier,
              )
              .map((viewField) => viewField.fieldUniversalIdentifier),
        };
    }
  };

  return (APPLICATION_CONTENT_TYPE_CONFIGS[contentType].filters ?? []).map(
    buildFilter,
  );
};
