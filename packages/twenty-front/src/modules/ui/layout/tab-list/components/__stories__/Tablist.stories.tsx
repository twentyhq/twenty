import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import {
  IconCalendar,
  IconCheckbox,
  IconHeart,
  IconHome,
  IconMail,
  IconPhone,
  IconUser,
} from 'twenty-ui/display';
import { ComponentWithRouterDecorator } from 'twenty-ui/testing';
import { TabList } from '@/ui/layout/tab-list/components/TabList';

const tabs = [
  { id: 'general', title: 'General', logo: 'https://picsum.photos/200' },
  { id: 'contacts', title: 'Contacts', Icon: IconUser },
  { id: 'messages', title: 'Messages', Icon: IconMail },
  { id: 'calls', title: 'Calls', Icon: IconPhone },
  { id: 'calendar', title: 'Calendar', Icon: IconCalendar },
  { id: 'sales', title: 'Sales', Icon: IconHome, disabled: true },
  { id: 'hidden', title: 'Hidden Tab', Icon: IconCheckbox, hide: true },
  {
    id: 'time',
    title: 'Time Tracking',
    logo: 'https://picsum.photos/192/192',
  },
  {
    id: 'activity',
    title: 'Activity',
    logo: 'https://twenty-front-screenshots.s3.eu-west-3.amazonaws.com/server-icon.png',
    disabled: true,
  },
  { id: 'favorites', title: 'Favorites', Icon: IconHeart },
  { id: 'reports', title: 'Reports', Icon: IconCheckbox },
];

const StyledInteractiveContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  max-width: 100%;
  min-width: 300px;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(5)};
  resize: horizontal;
  width: 600px;
`;

const meta: Meta<typeof TabList> = {
  title: 'UI/Layout/TabList/TabList',
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
  args: {
    tabs: tabs,
    componentInstanceId: 'resizable-tabs',
  },
  render: (args) => (
    <StyledInteractiveContainer>
      <p>
        <strong>↔ Drag the bottom-right corner to resize!</strong>
      </p>
      <TabList
        tabs={args.tabs}
        componentInstanceId={args.componentInstanceId}
        loading={args.loading}
        behaveAsLinks={args.behaveAsLinks}
        isInRightDrawer={args.isInRightDrawer}
        className={args.className}
      />
    </StyledInteractiveContainer>
  ),
};
