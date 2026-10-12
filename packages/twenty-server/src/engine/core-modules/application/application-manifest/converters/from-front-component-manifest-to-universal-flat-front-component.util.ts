import {
  DEFAULT_FRONT_COMPONENT_AVAILABLE_ON,
  type FrontComponentManifest,
} from 'twenty-shared/application';

import { type UniversalFlatFrontComponent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-front-component.type';

export const fromFrontComponentManifestToUniversalFlatFrontComponent = ({
  frontComponentManifest,
  applicationUniversalIdentifier,
  isSettingsFrontComponent,
  isReferencedByMenuItem,
  now,
}: {
  frontComponentManifest: FrontComponentManifest;
  applicationUniversalIdentifier: string;
  isSettingsFrontComponent: boolean;
  isReferencedByMenuItem: boolean;
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
    // A settings page or a command form expects to be opened from its menu,
    // not dropped into a layout, so it stays out of the widget pickers.
    availableOn: [
      ...(frontComponentManifest.availableOn ??
        (isSettingsFrontComponent || isReferencedByMenuItem
          ? []
          : DEFAULT_FRONT_COMPONENT_AVAILABLE_ON)),
    ],
    usesSdkClient: frontComponentManifest.usesSdkClient ?? false,
    createdAt: now,
    updatedAt: now,
  };
};
