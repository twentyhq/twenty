import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { computeSummaryTabPosition } from 'src/database/commands/upgrade-version-command/2-32/utils/compute-summary-tab-position.util';

const HOME_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs.home
    .universalIdentifier;
const CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording.universalIdentifier;

const buildPageLayoutTab = ({
  universalIdentifier,
  position,
  isActive = true,
  deletedAt = null,
}: {
  universalIdentifier: string;
  position: number;
  isActive?: boolean;
  deletedAt?: string | null;
}) => ({ universalIdentifier, position, isActive, deletedAt });

describe('computeSummaryTabPosition', () => {
  it('places the tab between Home and the Call Recording tab', () => {
    expect(
      computeSummaryTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
          buildPageLayoutTab({
            universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
            position: 20,
          }),
        ],
      }),
    ).toBe(15);
  });

  it('uses the closest predecessor when custom tabs sit before the Call Recording tab', () => {
    expect(
      computeSummaryTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
          buildPageLayoutTab({
            universalIdentifier: 'custom-tab',
            position: 30,
          }),
          buildPageLayoutTab({
            universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
            position: 40,
          }),
        ],
      }),
    ).toBe(35);
  });

  it('places the tab before the Call Recording tab when it is first', () => {
    expect(
      computeSummaryTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 20,
          }),
        ],
      }),
    ).toBe(0);
  });

  it('falls back to inserting after Home when the Call Recording tab is missing', () => {
    expect(
      computeSummaryTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
          buildPageLayoutTab({
            universalIdentifier: 'custom-tab',
            position: 20,
          }),
        ],
      }),
    ).toBe(15);
  });

  it('falls back to inserting after Home when the Call Recording tab is inactive', () => {
    expect(
      computeSummaryTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
          buildPageLayoutTab({
            universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
            position: 20,
            isActive: false,
          }),
        ],
      }),
    ).toBe(15);
  });

  it('ignores soft-deleted tabs when picking the predecessor', () => {
    expect(
      computeSummaryTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
          buildPageLayoutTab({
            universalIdentifier: 'deleted-custom-tab',
            position: 18,
            deletedAt: '2026-01-01T00:00:00.000Z',
          }),
          buildPageLayoutTab({
            universalIdentifier: CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER,
            position: 20,
          }),
        ],
      }),
    ).toBe(15);
  });

  it('uses the first standard position when no tabs exist', () => {
    expect(computeSummaryTabPosition({ existingPageLayoutTabs: [] })).toBe(10);
  });
});
