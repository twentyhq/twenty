import { isDefined } from 'twenty-shared/utils';

import {
  type FrontComponent,
  type PageLayoutType,
} from '~/generated-metadata/graphql';

export const isFrontComponentAvailableInWidgetPicker = ({
  frontComponent,
  pageLayoutType,
  objectMetadataId,
}: {
  frontComponent: Pick<FrontComponent, 'isHeadless' | 'widgetAvailability'>;
  pageLayoutType: PageLayoutType;
  objectMetadataId?: string;
}): boolean => {
  return (
    !frontComponent.isHeadless &&
    frontComponent.widgetAvailability.some(
      (availability) =>
        availability.pageLayoutType === pageLayoutType &&
        (!isDefined(availability.objectMetadataId) ||
          availability.objectMetadataId === objectMetadataId),
    )
  );
};
