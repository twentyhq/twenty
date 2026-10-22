import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFocusedElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectFocusedElementWithinScrollport';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectScrollPositionStable } from '@/__stories__/twenty-ui-gallery/utils/expectScrollPositionStable';

const TAB_LISTS = [
  { label: 'Sections', isRightToLeft: false },
  { label: 'Sections RTL', isRightToLeft: true },
];

const expectTabFocusedWithinList = ({
  tabList,
  tabName,
}: {
  tabList: HTMLElement;
  tabName: string;
}) =>
  expectFocusedElementWithinScrollport({
    findElement: () => within(tabList).getByRole('tab', { name: tabName }),
    findScrollContainer: () => tabList,
  });

export const tabsOverflowTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  for (const { label, isRightToLeft } of TAB_LISTS) {
    const tabList = canvas.getByRole('tablist', { name: label });

    await userEvent.click(
      within(tabList).getByRole('tab', { name: 'Section 01' }),
    );
    await userEvent.keyboard('{End}');
    await expectTabFocusedWithinList({ tabList, tabName: 'Section 12' });
    await expectScrollPositionStable(tabList);
    await expect(Math.abs(tabList.scrollLeft)).toBeGreaterThan(0);
    await expect(tabList.scrollLeft < 0).toBe(isRightToLeft);

    await userEvent.keyboard('{End}');
    await expectTabFocusedWithinList({ tabList, tabName: 'Section 12' });
    await expectScrollPositionStable(tabList);

    await userEvent.keyboard('{Home}');
    await expectTabFocusedWithinList({ tabList, tabName: 'Section 01' });
    await expectScrollPositionStable(tabList);
  }

  await expect(errorHandler).not.toHaveBeenCalled();
};
