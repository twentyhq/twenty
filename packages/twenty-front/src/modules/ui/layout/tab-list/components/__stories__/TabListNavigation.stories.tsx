import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { Text } from 'twenty-ui/primitives/typography';

import { TabListItem } from '../TabListItem';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { TabListRow } from '../TabListRow';

const TabListNavigationExample = ({
  links = false,
}: {
  links?: boolean;
  sidePanel?: boolean;
}) => {
  const [activeTabId, setActiveTabId] = useState('overview');
  const [selections, setSelections] = useState(0);
  const location = useLocation();
  const navigationType = useNavigationType();

  const selectTab = (id: string) => {
    setActiveTabId(id);
    setSelections((count) => count + 1);
  };

  return (
    <>
      <TabListRow
        activeTabId={activeTabId}
        behaveAsLinks={links}
        isScrollable={false}
        onSelectTab={selectTab}
      >
        {['overview', 'disabled', 'activity'].map((id) => (
          <TabListItem
            key={id}
            tab={{ id, title: id, disabled: id === 'disabled' }}
            active={id === activeTabId}
            mode={links ? 'link' : 'tab'}
            onSelect={selectTab}
          />
        ))}
      </TabListRow>
      <Text role="status">
        {activeTabId}: {selections}
      </Text>
      <Text>
        {location.search}
        {location.hash}
      </Text>
      <Text>{navigationType}</Text>
      <Text>{location.state?.source}</Text>
    </>
  );
};

const meta: Meta<typeof TabListNavigationExample> = {
  title: 'UI/Layout/TabList/Navigation',
  component: TabListNavigationExample,
  decorators: [
    ComponentDecorator,
    (Story, { args }) => (
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/',
            search: '?filter=open',
            state: { source: 'tab-list' },
          },
        ]}
      >
        <WorkspaceSurfaceContext.Provider
          value={{
            type: args.sidePanel ? 'side-panel' : 'main',
            instanceId: 'tab-navigation',
            ownsRouteLocation: true,
          }}
        >
          <Story />
        </WorkspaceSurfaceContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TabListNavigationExample>;

export const KeyboardSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'overview' });
    const activity = canvas.getByRole('tab', { name: 'activity' });

    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(activity).toHaveFocus();
    expect(overview).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(activity).toHaveAttribute('aria-selected', 'true');
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 1');
    await userEvent.click(activity);
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 2');
    await userEvent.keyboard('{Home}');
    expect(overview).toHaveFocus();
  },
};

export const RouteLinks: Story = {
  args: { links: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const activity = canvas.getByRole('link', { name: 'activity' });
    const disabled = canvas.getByRole('link', { name: 'disabled' });

    expect(canvas.queryByRole('tablist')).not.toBeInTheDocument();
    expect(activity).toHaveAttribute('href', '/?filter=open#activity');
    await userEvent.click(activity);
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 1');
    expect(canvas.getByText('?filter=open#activity')).toBeVisible();
    expect(canvas.getByText(args.sidePanel ? 'REPLACE' : 'PUSH')).toBeVisible();
    expect(canvas.getByText('tab-list')).toBeVisible();
    expect(activity).toHaveAttribute('aria-current', 'page');
    await userEvent.click(disabled);
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 1');
    expect(canvas.getByText('?filter=open#activity')).toBeVisible();
  },
};

export const SidePanelRouteLinks: Story = {
  ...RouteLinks,
  args: { links: true, sidePanel: true },
};
