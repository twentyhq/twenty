import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { TabButton } from 'twenty-ui/components/navigation';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';

import { TabListRow } from '@/ui/layout/tab-list/components/TabListRow';
import { useScrollActiveTabIntoView } from '@/ui/layout/tab-list/hooks/useScrollActiveTabIntoView';

const TAB_IDS = Array.from(
  { length: 12 },
  (_, index) => `section-${index + 1}`,
);

const ACTIVE_TAB_ID = 'section-11';

const StyledNarrowFrame = styled.div`
  width: 240px;
`;

const ScrollableTabListRow = ({
  behaveAsLinks,
}: {
  behaveAsLinks: boolean;
}) => {
  const { tabRowRef } = useScrollActiveTabIntoView({
    activeTabId: ACTIVE_TAB_ID,
    isScrollable: true,
  });

  const tabs = TAB_IDS.map((tabId) =>
    behaveAsLinks ? (
      <TabButton
        key={tabId}
        active={tabId === ACTIVE_TAB_ID}
        aria-current={tabId === ACTIVE_TAB_ID ? 'page' : undefined}
      >
        {tabId}
      </TabButton>
    ) : (
      <Tabs.Tab key={tabId} value={tabId}>
        {tabId}
      </Tabs.Tab>
    ),
  );

  return (
    <StyledNarrowFrame>
      <Tabs.Root value={ACTIVE_TAB_ID}>
        <TabListRow
          aria-label="Sections"
          behaveAsLinks={behaveAsLinks}
          isScrollable
          ref={tabRowRef}
        >
          {tabs}
        </TabListRow>
      </Tabs.Root>
    </StyledNarrowFrame>
  );
};

const meta: Meta<typeof ScrollableTabListRow> = {
  title: 'UI/Layout/TabList/TabListRow',
  component: ScrollableTabListRow,
  decorators: [ComponentDecorator],
  args: { behaveAsLinks: false },
};

export default meta;
type Story = StoryObj<typeof ScrollableTabListRow>;

const expectTabFullyVisible = async (activeTab: HTMLElement) => {
  const tabRow = activeTab.parentElement;

  await waitFor(() => expect(tabRow?.scrollLeft).toBeGreaterThan(0));
  expect(activeTab.offsetLeft).toBeGreaterThanOrEqual(tabRow?.scrollLeft ?? 0);
  expect(activeTab.offsetLeft + activeTab.offsetWidth).toBeLessThanOrEqual(
    (tabRow?.scrollLeft ?? 0) + (tabRow?.clientWidth ?? 0),
  );
};

export const ScrollsSelectedTabIntoView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const activeTab = await canvas.findByRole('tab', { name: ACTIVE_TAB_ID });

    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    await expectTabFullyVisible(activeTab);
  },
};

export const ScrollsCurrentLinkIntoView: Story = {
  args: { behaveAsLinks: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const activeTab = await canvas.findByRole('button', {
      name: ACTIVE_TAB_ID,
    });

    expect(activeTab).toHaveAttribute('aria-current', 'page');
    await expectTabFullyVisible(activeTab);
  },
};
