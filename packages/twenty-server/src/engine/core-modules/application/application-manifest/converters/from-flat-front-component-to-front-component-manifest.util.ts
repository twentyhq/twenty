import { type FrontComponentManifest } from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';

export const fromFlatFrontComponentToFrontComponentManifest = (
  component: FlatFrontComponent,
): FrontComponentManifest | undefined => {
  const availability = component.universalWidgetAvailability;
  const pageLayoutType = availability[0]?.pageLayoutType;
  if (availability.some((entry) => entry.pageLayoutType !== pageLayoutType)) {
    return undefined;
  }
  const objects = availability
    .map((entry) => entry.objectMetadataUniversalIdentifier)
    .filter(isDefined);
  if (
    objects.length > 0 &&
    (pageLayoutType !== PageLayoutType.RECORD_PAGE ||
      objects.length !== availability.length)
  ) {
    return undefined;
  }
  return {
    universalIdentifier: component.universalIdentifier,
    name: component.name,
    ...(isDefined(component.description)
      ? { description: component.description }
      : {}),
    sourceComponentPath: component.sourceComponentPath,
    builtComponentPath: component.builtComponentPath,
    builtComponentChecksum: component.builtComponentChecksum,
    componentName: component.componentName,
    isHeadless: component.isHeadless,
    usesSdkClient: component.usesSdkClient,
    ...(isDefined(pageLayoutType)
      ? {
          widgetAvailability:
            pageLayoutType === PageLayoutType.RECORD_PAGE
              ? {
                  pageLayoutType,
                  ...(objects.length > 0
                    ? { objectUniversalIdentifiers: objects }
                    : {}),
                }
              : { pageLayoutType },
        }
      : {}),
  };
};
