import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';

const TRANSCRIPT_TAB_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
    .callRecording.universalIdentifier,
];

const CALL_RECORDING_TAB_DEFAULTS = {
  title: 'Call Recording',
  icon: 'IconVideo',
};

const TRANSCRIPT_TAB_DEFAULTS = {
  title: 'Transcript',
  icon: 'IconBlockquote',
};

export const buildTranscriptPageLayoutTabUpdates = ({
  flatPageLayoutTabsByUniversalIdentifier,
  now,
  direction,
}: {
  flatPageLayoutTabsByUniversalIdentifier: Record<
    string,
    FlatPageLayoutTab | undefined
  >;
  now: string;
  direction: 'up' | 'down';
}): FlatPageLayoutTab[] => {
  const [previousDefaults, nextDefaults] =
    direction === 'up'
      ? [CALL_RECORDING_TAB_DEFAULTS, TRANSCRIPT_TAB_DEFAULTS]
      : [TRANSCRIPT_TAB_DEFAULTS, CALL_RECORDING_TAB_DEFAULTS];

  return TRANSCRIPT_TAB_UNIVERSAL_IDENTIFIERS.flatMap((universalIdentifier) => {
    const tab = flatPageLayoutTabsByUniversalIdentifier[universalIdentifier];

    if (
      !isDefined(tab) ||
      isDefined(tab.deletedAt) ||
      tab.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return [];
    }

    const title =
      tab.title === previousDefaults.title ? nextDefaults.title : tab.title;
    const icon =
      tab.icon === previousDefaults.icon ? nextDefaults.icon : tab.icon;

    if (title === tab.title && icon === tab.icon) {
      return [];
    }

    return [{ ...tab, title, icon, updatedAt: now }];
  });
};
