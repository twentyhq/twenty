import {
  type FrontComponentManifest,
  type FrontComponentWidgetAvailabilityManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFrontComponentWidgetAvailability } from 'src/engine/metadata-modules/flat-front-component/utils/from-front-component-widget-availability-to-universal-widget-availability.util';
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

export const fromFrontComponentManifestToUniversalFlatFrontComponent = ({
  frontComponentManifest,
  applicationUniversalIdentifier,
  isSettingsFrontComponent,
  isReferencedByCommandMenuItem,
  now,
}: {
  frontComponentManifest: FrontComponentManifest;
  applicationUniversalIdentifier: string;
  isSettingsFrontComponent: boolean;
  isReferencedByCommandMenuItem: boolean;
  now: string;
}): UniversalFlatFrontComponent => {
  const isOfferedInWidgetPickersByDefault =
    !frontComponentManifest.isHeadless &&
    !isSettingsFrontComponent &&
    !isReferencedByCommandMenuItem;

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
    universalWidgetAvailability: isDefined(
      frontComponentManifest.widgetAvailability,
    )
      ? fromWidgetAvailabilityManifestToUniversalWidgetAvailability(
          frontComponentManifest.widgetAvailability,
        )
      : isOfferedInWidgetPickersByDefault
        ? DEFAULT_FRONT_COMPONENT_WIDGET_AVAILABILITY
        : [],
    usesSdkClient: frontComponentManifest.usesSdkClient ?? false,
    createdAt: now,
    updatedAt: now,
  };
};
