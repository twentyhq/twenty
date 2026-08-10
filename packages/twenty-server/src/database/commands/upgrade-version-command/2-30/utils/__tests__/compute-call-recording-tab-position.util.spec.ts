import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { computeCallRecordingTabPosition } from 'src/database/commands/upgrade-version-command/2-30/utils/compute-call-recording-tab-position.util';

const HOME_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs.home
    .universalIdentifier;
const TIMELINE_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .timeline.universalIdentifier;

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

describe('computeCallRecordingTabPosition', () => {
  it('places the tab directly after Home when Home is the last tab', () => {
    expect(
      computeCallRecordingTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
        ],
      }),
    ).toBe(20);
  });

  it('uses a fractional position before a custom tab', () => {
    expect(
      computeCallRecordingTabPosition({
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

  it('uses a fractional position before the hidden legacy Timeline tab', () => {
    expect(
      computeCallRecordingTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
          buildPageLayoutTab({
            universalIdentifier: TIMELINE_TAB_UNIVERSAL_IDENTIFIER,
            position: 20,
          }),
        ],
      }),
    ).toBe(15);
  });

  it('appends the tab when Home is missing or inactive', () => {
    expect(
      computeCallRecordingTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({ universalIdentifier: 'custom-tab', position: 50 }),
        ],
      }),
    ).toBe(60);

    expect(
      computeCallRecordingTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
            isActive: false,
          }),
          buildPageLayoutTab({ universalIdentifier: 'custom-tab', position: 20 }),
        ],
      }),
    ).toBe(30);
  });

  it('uses the first standard position when no tabs exist', () => {
    expect(
      computeCallRecordingTabPosition({ existingPageLayoutTabs: [] }),
    ).toBe(10);
  });

  it('ignores soft-deleted tabs', () => {
    expect(
      computeCallRecordingTabPosition({
        existingPageLayoutTabs: [
          buildPageLayoutTab({
            universalIdentifier: HOME_TAB_UNIVERSAL_IDENTIFIER,
            position: 10,
          }),
          buildPageLayoutTab({
            universalIdentifier: 'deleted-custom-tab',
            position: 40,
            deletedAt: '2026-01-01T00:00:00.000Z',
          }),
        ],
      }),
    ).toBe(20);
  });
});
