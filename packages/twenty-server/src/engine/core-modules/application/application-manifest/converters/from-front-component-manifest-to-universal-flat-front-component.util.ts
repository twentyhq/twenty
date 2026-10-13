import {
  type FrontComponentManifest,
  type FrontComponentWidgetAvailabilityManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFrontComponentWidgetAvailability } from 'src/engine/metadata-modules/flat-front-component/types/universal-front-component-widget-availability.type';
import { type UniversalFlatFrontComponent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-front-component.type';

const fromWidgetAvailabilityManifestToUniversalWidgetAvailability = (
  widgetAvailabilityManifest?: FrontComponentWidgetAvailabilityManifest,
): UniversalFrontComponentWidgetAvailability[] => {
  if (!isDefined(widgetAvailabilityManifest)) {
    return [];
  }

  if (
    'objectUniversalIdentifiers' in widgetAvailabilityManifest &&
    isDefined(widgetAvailabilityManifest.objectUniversalIdentifiers)
  ) {
    return widgetAvailabilityManifest.objectUniversalIdentifiers.map(
      (objectMetadataUniversalIdentifier) => ({
        pageLayoutType: widgetAvailabilityManifest.pageLayoutType,
        objectMetadataUniversalIdentifier,
      }),
    );
  }

  return [{ pageLayoutType: widgetAvailabilityManifest.pageLayoutType }];
};

export const fromFrontComponentManifestToUniversalFlatFrontComponent = ({
  frontComponentManifest,
  applicationUniversalIdentifier,
  isSettingsFrontComponent,
  now,
}: {
  frontComponentManifest: FrontComponentManifest;
  applicationUniversalIdentifier: string;
  isSettingsFrontComponent: boolean;
  now: string;
}): UniversalFlatFrontComponent => {
  return {
    universalIdentifier: frontComponentManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: frontComponentManifest.name ?? frontComponentManifest.componentName,
    description: frontComponentManifest.description ?? null,
    sourceComponentPath: frontComponentManifest.sourceComponentPath,
    builtComponentPath: frontComponentManifest.builtComponentPath,
    componentName: frontComponentManifest.componentName,
    builtComponentChecksum: frontComponentManifest.builtComponentChecksum,
    // A settings front component always renders visible UI.
    isHeadless: isSettingsFrontComponent
      ? false
      : (frontComponentManifest.isHeadless ?? false),
    universalWidgetAvailability:
      fromWidgetAvailabilityManifestToUniversalWidgetAvailability(
        frontComponentManifest.widgetAvailability,
      ),
    usesSdkClient: frontComponentManifest.usesSdkClient ?? false,
    createdAt: now,
    updatedAt: now,
  };
};
