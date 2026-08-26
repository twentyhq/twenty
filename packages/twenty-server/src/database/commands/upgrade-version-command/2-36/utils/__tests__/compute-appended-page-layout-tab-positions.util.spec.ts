import { computeAppendedPageLayoutTabPositions } from 'src/database/commands/upgrade-version-command/2-36/utils/compute-appended-page-layout-tab-positions.util';

const buildPageLayoutTab = ({
  position,
  deletedAt = null,
}: {
  position: number;
  deletedAt?: string | null;
}) => ({ position, deletedAt });

describe('computeAppendedPageLayoutTabPositions', () => {
  it('appends after the last existing tab', () => {
    expect(
      computeAppendedPageLayoutTabPositions({
        existingPageLayoutTabs: [
          buildPageLayoutTab({ position: 10 }),
          buildPageLayoutTab({ position: 20 }),
        ],
        appendedTabCount: 2,
      }),
    ).toEqual([30, 40]);
  });

  it('appends after custom tabs that sit beyond the standard positions', () => {
    expect(
      computeAppendedPageLayoutTabPositions({
        existingPageLayoutTabs: [
          buildPageLayoutTab({ position: 10 }),
          buildPageLayoutTab({ position: 20 }),
          buildPageLayoutTab({ position: 45 }),
        ],
        appendedTabCount: 2,
      }),
    ).toEqual([55, 65]);
  });

  it('ignores soft-deleted tabs', () => {
    expect(
      computeAppendedPageLayoutTabPositions({
        existingPageLayoutTabs: [
          buildPageLayoutTab({ position: 10 }),
          buildPageLayoutTab({
            position: 90,
            deletedAt: '2026-01-01T00:00:00.000Z',
          }),
        ],
        appendedTabCount: 1,
      }),
    ).toEqual([20]);
  });

  it('starts from the first standard position when no tabs exist', () => {
    expect(
      computeAppendedPageLayoutTabPositions({
        existingPageLayoutTabs: [],
        appendedTabCount: 2,
      }),
    ).toEqual([10, 20]);
  });

  it('returns nothing when there is no tab to append', () => {
    expect(
      computeAppendedPageLayoutTabPositions({
        existingPageLayoutTabs: [buildPageLayoutTab({ position: 10 })],
        appendedTabCount: 0,
      }),
    ).toEqual([]);
  });
});
