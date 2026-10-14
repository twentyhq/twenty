import {
  type Manifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const getFrontComponentWidgetAvailabilityWarnings = ({
  manifest,
  pageLayoutWidgets,
}: {
  manifest: Pick<
    Manifest,
    | 'application'
    | 'frontComponents'
    | 'settingsMenuItems'
    | 'commandMenuItems'
    | 'timelineActivityTypes'
  >;
  pageLayoutWidgets: PageLayoutWidgetManifest[];
}): string[] => {
  const frontComponentUniversalIdentifiersRenderedElsewhere = new Set(
    [
      manifest.application.settingsFrontComponent?.universalIdentifier,
      ...manifest.settingsMenuItems.map(
        (settingsMenuItem) => settingsMenuItem.frontComponentUniversalIdentifier,
      ),
      ...manifest.commandMenuItems.map(
        (commandMenuItem) => commandMenuItem.frontComponentUniversalIdentifier,
      ),
      ...manifest.timelineActivityTypes.map(
        (timelineActivityType) =>
          timelineActivityType.frontComponentUniversalIdentifier,
      ),
      ...pageLayoutWidgets.map(({ configuration }) =>
        isDefined(configuration) &&
        'frontComponentUniversalIdentifier' in configuration
          ? configuration.frontComponentUniversalIdentifier
          : undefined,
      ),
    ].filter(isDefined),
  );

  return manifest.frontComponents
    .filter(
      (frontComponent) =>
        !frontComponent.isHeadless &&
        !isDefined(frontComponent.widgetAvailability) &&
        !frontComponentUniversalIdentifiersRenderedElsewhere.has(
          frontComponent.universalIdentifier,
        ),
    )
    .map(
      (frontComponent) =>
        `Front component "${frontComponent.name ?? frontComponent.componentName}" declares no widgetAvailability, so it is not offered in any widget picker. Set widgetAvailability to let users add it to record pages or dashboards.`,
    );
};
