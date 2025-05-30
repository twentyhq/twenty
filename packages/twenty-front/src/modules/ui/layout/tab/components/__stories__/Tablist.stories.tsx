import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import {
  IconCalendar,
  IconCheckbox,
  IconHeart,
  IconHome,
  IconMail,
  IconPhone,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUser,
} from 'twenty-ui/display';
import { ComponentWithRouterDecorator } from 'twenty-ui/testing';
import { TabList } from '../TabList';

const tabs = [
  {
    id: '1',
    title: 'Tab1',
    Icon: IconCheckbox,
    hide: true,
  },
  {
    id: '2',
    title: 'Tab2',
    Icon: IconCheckbox,
    hide: false,
  },
  {
    id: '3',
    title: 'Tab3',
    Icon: IconCheckbox,
    hide: false,
    disabled: true,
  },
  {
    id: '4',
    title: 'Tab4',
    Icon: IconCheckbox,
    hide: false,
    disabled: false,
  },
];

const manyTabs = [
  { id: 'general', title: 'General', Icon: IconSettings },
  { id: 'contacts', title: 'Contacts', Icon: IconUser },
  { id: 'messages', title: 'Messages', Icon: IconMail },
  { id: 'calls', title: 'Calls', Icon: IconPhone },
  { id: 'calendar', title: 'Calendar', Icon: IconCalendar },
  { id: 'sales', title: 'Sales', Icon: IconHome, disabled: true },
  { id: 'time', title: 'Time Tracking', Icon: IconSearch },
  { id: 'activity', title: 'Activity', Icon: IconPlus, disabled: true },
  { id: 'favorites', title: 'Favorites', Icon: IconHeart },
  { id: 'reports', title: 'Reports', Icon: IconCheckbox },
];

const StyledConstrainedContainer = styled.div<{ width?: string }>`
  width: ${({ width }) => width || '400px'};
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  padding: ${({ theme }) => theme.spacing(4)};
  margin: ${({ theme }) => theme.spacing(4)} 0;
`;

const meta: Meta<typeof TabList> = {
  title: 'UI/Layout/Tab/TabList',
  component: TabList,
  args: {
    tabs: tabs,
    componentInstanceId: 'tab-list',
  },
  decorators: [ComponentWithRouterDecorator],
};

export default meta;

type Story = StoryObj<typeof TabList>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.queryByText('Tab1');
    expect(submitButton).toBeNull();
    expect(await canvas.findByText('Tab2')).toBeInTheDocument();
    expect(await canvas.findByText('Tab3')).toBeInTheDocument();
    expect(await canvas.findByText('Tab4')).toBeInTheDocument();
  },
};

export const ActiveHiddenTab: Story = {
  args: {
    tabs: manyTabs.map((tab, index) => ({
      ...tab,
      active: index === manyTabs.length - 1,
    })),
    componentInstanceId: 'active-hidden-tabs',
  },
  render: (args) => (
    <StyledConstrainedContainer width="300px">
      <p>Active tab is hidden - "+X More" button should be highlighted</p>
      <TabList
        tabs={args.tabs}
        componentInstanceId={args.componentInstanceId}
        loading={args.loading}
        behaveAsLinks={args.behaveAsLinks}
        isInRightDrawer={args.isInRightDrawer}
        className={args.className}
      />
    </StyledConstrainedContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overflowButton = canvas.getByText(/\+\d+ More/);
    expect(overflowButton).toBeInTheDocument();
  },
};

export const ResponsiveDemo: Story = {
  args: {
    tabs: manyTabs,
    componentInstanceId: 'responsive-tabs',
  },
  render: (args) => (
    <div>
      <h3>Responsive Tab Overflow Demo</h3>
      <StyledConstrainedContainer width="300px">
        <strong>Narrow (300px) - Shows overflow</strong>
        <TabList
          tabs={args.tabs}
          componentInstanceId="responsive-tabs-narrow"
          loading={args.loading}
          behaveAsLinks={args.behaveAsLinks}
          isInRightDrawer={args.isInRightDrawer}
          className={args.className}
        />
      </StyledConstrainedContainer>
      <StyledConstrainedContainer width="800px">
        <strong>Wide (800px) - Shows most/all tabs</strong>
        <TabList
          tabs={args.tabs}
          componentInstanceId="responsive-tabs-wide"
          loading={args.loading}
          behaveAsLinks={args.behaveAsLinks}
          isInRightDrawer={args.isInRightDrawer}
          className={args.className}
        />
      </StyledConstrainedContainer>
      <StyledConstrainedContainer width="100%">
        <strong>Full Width - No overflow</strong>
        <TabList
          tabs={args.tabs}
          componentInstanceId="responsive-tabs-full"
          loading={args.loading}
          behaveAsLinks={args.behaveAsLinks}
          isInRightDrawer={args.isInRightDrawer}
          className={args.className}
        />
      </StyledConstrainedContainer>
    </div>
  ),
};
