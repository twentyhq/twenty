import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
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
import { TabList } from '../TabList';
import { type TabListProps } from '../../types/TabListProps';
import { type SingleTabProps } from '../../types/SingleTabProps';

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

type TabListWithAddProps = Pick<
  TabListProps,
  'componentInstanceId' | 'loading' | 'isInRightDrawer' | 'className'
> & {
  initialTabs: SingleTabProps[];
};

const TabListWithAdd = ({
  componentInstanceId,
  loading,
  isInRightDrawer,
  className,
  initialTabs,
}: TabListWithAddProps) => {
  const [currentTabs, setCurrentTabs] = useState<SingleTabProps[]>(initialTabs);
  const [nextTabId, setNextTabId] = useState(initialTabs.length + 1);

  const handleAddTab = () => {
    const newTab: SingleTabProps = {
      id: `new-tab-${nextTabId}`,
      title: `New Tab ${nextTabId}`,
      Icon: IconCheckbox,
    };
    setCurrentTabs([...currentTabs, newTab]);
    setNextTabId(nextTabId + 1);
  };

  return (
    <StyledInteractiveContainer>
      <p>
        <strong>Click the + button to add new tabs!</strong>
      </p>
      <TabList
        tabs={currentTabs}
        componentInstanceId={componentInstanceId}
        loading={loading}
        behaveAsLinks={false}
        isInRightDrawer={isInRightDrawer}
        className={className}
        onAddTab={handleAddTab}
      />
    </StyledInteractiveContainer>
  );
};

export const WithAddTab: Story = {
  args: {
    componentInstanceId: 'tabs-with-add',
    tabs: tabs.slice(0, 3),
  },
  render: (args) => (
    <TabListWithAdd
      componentInstanceId={args.componentInstanceId}
      loading={args.loading}
      isInRightDrawer={args.isInRightDrawer}
      className={args.className}
      initialTabs={args.tabs}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TabList with the ability to add new tabs dynamically using the onAddTab callback. Click the + button to add new tabs.',
      },
    },
  },
};
