import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { ComponentWithRouterDecorator } from 'twenty-ui/testing';

import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';

const StyledRecordPanel = styled.section`
  height: 320px;
  width: 600px;
`;

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledScrollContainer = styled.div`
  container-type: size;
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const meta: Meta<typeof TabListRoot> = {
  title: 'UI/Layout/TabList/Root',
  component: TabListRoot,
  decorators: [ComponentWithRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof TabListRoot>;

export const FixedHeightRecordPanel: Story = {
  render: () => (
    <StyledRecordPanel aria-label="Company record">
      <TabListRoot componentInstanceId="record-layout">
        <StyledLayout>
          <TabList
            aria-label="Record sections"
            componentInstanceId="record-layout"
            behaveAsLinks={false}
            tabs={[
              { id: 'home', title: 'Home' },
              { id: 'timeline', title: 'Timeline' },
            ]}
          />
          <StyledScrollContainer role="region" aria-label="Record content">
            <Tabs.Panel value="home">Company details</Tabs.Panel>
            <Tabs.Panel value="timeline">Company activity</Tabs.Panel>
          </StyledScrollContainer>
        </StyledLayout>
      </TabListRoot>
    </StyledRecordPanel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const homePanel = await canvas.findByRole('tabpanel', { name: 'Home' });
    const scrollContainer = canvas.getByRole('region', {
      name: 'Record content',
    });
    const contentBounds = scrollContainer.getBoundingClientRect();

    expect(contentBounds.height).toBeGreaterThan(200);
    expect(homePanel.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      contentBounds.bottom,
    );
    expect(homePanel).toHaveTextContent('Company details');

    await userEvent.click(canvas.getByRole('tab', { name: 'Timeline' }));

    const timelinePanel = canvas.getByRole('tabpanel', { name: 'Timeline' });

    expect(timelinePanel).toHaveTextContent('Company activity');
    expect(scrollContainer.getBoundingClientRect().height).toBeGreaterThan(200);
    expect(timelinePanel.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      contentBounds.bottom,
    );
  },
};
