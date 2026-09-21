import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { WidgetType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const TRANSCRIPT_TABS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
    .callRecording,
];

export const buildTranscriptPageLayoutUpdates = ({
  flatPageLayoutTabsByUniversalIdentifier,
  flatPageLayoutWidgetsByUniversalIdentifier,
  now,
  direction,
}: {
  flatPageLayoutTabsByUniversalIdentifier: Record<
    string,
    FlatPageLayoutTab | undefined
  >;
  flatPageLayoutWidgetsByUniversalIdentifier: Record<
    string,
    FlatPageLayoutWidget | undefined
  >;
  now: string;
  direction: 'up' | 'down';
}): {
  pageLayoutTabsToUpdate: FlatPageLayoutTab[];
  pageLayoutWidgetsToUpdate: FlatPageLayoutWidget[];
} => {
  const pageLayoutTabsToUpdate = TRANSCRIPT_TABS.flatMap(
    ({ universalIdentifier }) => {
      const tab = flatPageLayoutTabsByUniversalIdentifier[universalIdentifier];

      if (
        !isDefined(tab) ||
        isDefined(tab.deletedAt) ||
        tab.applicationUniversalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
      ) {
        return [];
      }

      const previousTitle =
        direction === 'up' ? 'Call Recording' : 'Transcript';
      const nextTitle = direction === 'up' ? 'Transcript' : 'Call Recording';
      const previousIcon = direction === 'up' ? 'IconVideo' : 'IconBlockquote';
      const nextIcon = direction === 'up' ? 'IconBlockquote' : 'IconVideo';
      const title = tab.title === previousTitle ? nextTitle : tab.title;
      const icon = tab.icon === previousIcon ? nextIcon : tab.icon;

      if (title === tab.title && icon === tab.icon) {
        return [];
      }

      return [{ ...tab, title, icon, updatedAt: now }];
    },
  );

  const pageLayoutWidgetsToUpdate = TRANSCRIPT_TABS.flatMap(({ widgets }) => {
    // Transcript was already the shipped widget title before this upgrade.
    if (direction === 'down') {
      return [];
    }

    const widget =
      flatPageLayoutWidgetsByUniversalIdentifier[
        widgets.transcript.universalIdentifier
      ];

    if (
      !isDefined(widget) ||
      isDefined(widget.deletedAt) ||
      widget.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
      widget.type !== WidgetType.CALL_RECORDING_TRANSCRIPT ||
      widget.title !== 'Call Recording'
    ) {
      return [];
    }

    return [{ ...widget, title: 'Transcript', updatedAt: now }];
  });

  return { pageLayoutTabsToUpdate, pageLayoutWidgetsToUpdate };
};
