import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';
import { type ApplicationContentFilterOption } from '@/settings/applications/types/ApplicationContentFilterOption';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { type ApplicationContentObjectResolver } from '@/settings/applications/types/ApplicationContentObjectResolver';
import { getApplicationContentParentFilterOptions } from '@/settings/applications/utils/getApplicationContentParentFilterOptions';

export type ApplicationContentFilter = {
  key: ApplicationContentFilterKey;
  options: ApplicationContentFilterOption[];
  isSelectable: boolean;
  getItemKeys: (item: ApplicationContentItem) => (string | null | undefined)[];
};

export const getApplicationContentFilters = ({
  contentType,
  content,
  resolveObject,
}: {
  contentType: ApplicationContentType;
  content: ApplicationContent;
  resolveObject: ApplicationContentObjectResolver;
}): ApplicationContentFilter[] => {
  const items = content[contentType];

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
              items
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
          options: getApplicationContentParentFilterOptions({
            items,
            parents: content.views,
            resolveObject,
          }),
          getItemKeys: (item) => [item.parentUniversalIdentifier],
        };
      case 'pageLayout':
        return {
          key,
          isSelectable: true,
          options: getApplicationContentParentFilterOptions({
            items,
            parents: content.pageLayouts,
            resolveObject,
          }),
          getItemKeys: (item) => [item.parentUniversalIdentifier],
        };
      case 'field':
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
