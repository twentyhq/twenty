import {
  type FrontComponentManifest,
  type FrontComponentWidgetAvailabilityManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFrontComponentWidgetAvailability } from 'src/engine/metadata-modules/flat-front-component/types/universal-front-component-widget-availability.type';
import { DEFAULT_FRONT_COMPONENT_WIDGET_AVAILABILITY } from 'src/engine/metadata-modules/front-component/constants/default-front-component-widget-availability.constant';
import { type UniversalFlatFrontComponent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-front-component.type';

const fromWidgetAvailabilityManifestToUniversalWidgetAvailability = (
  widgetAvailabilityManifest: FrontComponentWidgetAvailabilityManifest[],
): UniversalFrontComponentWidgetAvailability[] =>
  widgetAvailabilityManifest.flatMap(
    ({ pageLayoutType, objectUniversalIdentifiers }) =>
      isDefined(objectUniversalIdentifiers)
        ? objectUniversalIdentifiers.map(
            (objectMetadataUniversalIdentifier) => ({
              pageLayoutType,
              objectMetadataUniversalIdentifier,
            }),
          )
        : [{ pageLayoutType }],
  );

const getUniversalWidgetAvailability = ({
  widgetAvailabilityManifest,
  isOfferedInWidgetPickersByDefault,
}: {
  widgetAvailabilityManifest?: FrontComponentWidgetAvailabilityManifest[];
  isOfferedInWidgetPickersByDefault: boolean;
}): UniversalFrontComponentWidgetAvailability[] => {
  if (isDefined(widgetAvailabilityManifest)) {
    return fromWidgetAvailabilityManifestToUniversalWidgetAvailability(
      widgetAvailabilityManifest,
    );
  }

  if (isOfferedInWidgetPickersByDefault) {
    return DEFAULT_FRONT_COMPONENT_WIDGET_AVAILABILITY;
  }

  return [];
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
  const universalWidgetAvailability = getUniversalWidgetAvailability({
    widgetAvailabilityManifest: frontComponentManifest.widgetAvailability,
    isOfferedInWidgetPickersByDefault:
      !frontComponentManifest.isHeadless && !isSettingsFrontComponent,
  });

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
    universalWidgetAvailability,
    usesSdkClient: frontComponentManifest.usesSdkClient ?? false,
    createdAt: now,
    updatedAt: now,
  };
};
