import { type Meta, type StoryObj } from '@storybook/react-vite';
import { StrictMode, useState } from 'react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { Button } from 'twenty-ui/primitives/input';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';

const TabGroup = ({
  links,
  instanceId,
}: {
  links: boolean;
  instanceId: string;
}) => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    instanceId,
  );
  const [selections, setSelections] = useState(0);
  const [tabIds, setTabIds] = useState(['overview', 'disabled', 'activity']);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <section aria-label={instanceId}>
      <TabListRoot componentInstanceId={instanceId} enabled={!links}>
        <TabList
          aria-label={`${instanceId} sections`}
          componentInstanceId={instanceId}
          behaveAsLinks={links}
          tabs={tabIds.map((id) => ({
            id,
            title: id,
            disabled: id === 'disabled',
          }))}
          onChangeTab={() => setSelections((count) => count + 1)}
        />
        {!links && activeTabId && (
          <Tabs.Panel value={activeTabId}>
            <Text>{activeTabId} content</Text>
          </Tabs.Panel>
        )}
      </TabListRoot>
      <Text role="status">
        {activeTabId ?? 'none'}: {selections}
      </Text>
      <Button onClick={() => setRenderCount((count) => count + 1)}>
        Rerender {renderCount}
      </Button>
      <Button
        onClick={() =>
          setTabIds((ids) => ids.filter((id) => id !== 'activity'))
        }
      >
        Remove activity
      </Button>
      <Button onClick={() => setTabIds([])}>Remove all tabs</Button>
    </section>
  );
};

const TabListNavigationExample = ({
  links = false,
  multiple = false,
}: {
  links?: boolean;
  sidePanel?: boolean;
  multiple?: boolean;
  hash?: string;
}) => {
  const location = useLocation();
  const navigationType = useNavigationType();

  return (
    <>
      <TabGroup links={links} instanceId="first" />
      {multiple && <TabGroup links={links} instanceId="second" />}
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
      <StrictMode>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/',
              search: '?filter=open',
              hash: args.hash,
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
      </StrictMode>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TabListNavigationExample>;

export const KeyboardSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = await canvas.findByRole('tab', { name: 'overview' });
    const activity = canvas.getByRole('tab', { name: 'activity' });

    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('overview: 1'),
    );
    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(activity).toHaveFocus();
    expect(overview).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(activity).toHaveAttribute('aria-selected', 'true');
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 2');

    const panel = canvas.getByRole('tabpanel', { name: 'activity' });
    expect(panel).toHaveTextContent('activity content');
    expect(activity).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', activity.id);
    await userEvent.tab();
    expect(panel).toHaveFocus();

    await userEvent.click(activity);
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 2');
    await userEvent.click(canvas.getByRole('button', { name: 'Rerender 0' }));
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 2');
    activity.focus();
    await userEvent.keyboard('{Home}');
    expect(overview).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(canvas.getByRole('status')).toHaveTextContent('overview: 3');
    expect(canvas.getByRole('tabpanel', { name: 'overview' })).toBeVisible();
  },
};

export const InPageSelectionIgnoresHash: Story = {
  ...KeyboardSelection,
  args: { hash: '#activity' },
};

export const SelectionFallback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('tab', { name: 'activity' }));
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 2');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove activity' }),
    );
    expect(canvas.getByRole('status')).toHaveTextContent('overview: 3');
    expect(canvas.getByRole('tabpanel', { name: 'overview' })).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove all tabs' }),
    );
    expect(canvas.getByRole('status')).toHaveTextContent('none: 4');
    expect(canvas.queryByRole('tablist')).not.toBeInTheDocument();
  },
};

export const IndependentTabGroups: Story = {
  args: { multiple: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = within(canvas.getByRole('region', { name: 'first' }));
    const second = within(canvas.getByRole('region', { name: 'second' }));
    const firstActivity = await first.findByRole('tab', { name: 'activity' });
    const secondActivity = second.getByRole('tab', { name: 'activity' });

    expect(
      canvas.getByRole('tablist', { name: 'first sections' }),
    ).toBeVisible();
    expect(
      canvas.getByRole('tablist', { name: 'second sections' }),
    ).toBeVisible();
    expect(firstActivity.id).not.toBe(secondActivity.id);
    await userEvent.click(firstActivity);
    expect(first.getByRole('tabpanel', { name: 'activity' })).toBeVisible();
    expect(second.getByRole('tabpanel', { name: 'overview' })).toBeVisible();
    await userEvent.click(secondActivity);
    const firstPanel = first.getByRole('tabpanel', { name: 'activity' });
    const secondPanel = second.getByRole('tabpanel', { name: 'activity' });
    expect(firstPanel.id).not.toBe(secondPanel.id);
    expect(firstActivity).toHaveAttribute('aria-controls', firstPanel.id);
    expect(secondActivity).toHaveAttribute('aria-controls', secondPanel.id);
    const elementsWithIds = [...canvasElement.querySelectorAll('[id]')];
    expect(new Set(elementsWithIds.map((element) => element.id)).size).toBe(
      elementsWithIds.length,
    );
  },
};

export const RouteLinks: Story = {
  args: { links: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const activity = await canvas.findByRole('link', { name: 'activity' });
    const disabled = canvas.getByRole('link', { name: 'disabled' });

    expect(canvas.queryByRole('tablist')).not.toBeInTheDocument();
    expect(canvas.queryByRole('tabpanel')).not.toBeInTheDocument();
    expect(activity).toHaveAttribute('href', '/?filter=open#activity');
    await userEvent.click(activity);
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 2');
    expect(canvas.getByText('?filter=open#activity')).toBeVisible();
    expect(canvas.getByText(args.sidePanel ? 'REPLACE' : 'PUSH')).toBeVisible();
    expect(canvas.getByText('tab-list')).toBeVisible();
    expect(activity).toHaveAttribute('aria-current', 'page');
    await userEvent.click(disabled);
    expect(canvas.getByRole('status')).toHaveTextContent('activity: 2');
    expect(canvas.getByText('?filter=open#activity')).toBeVisible();
  },
};

export const SidePanelRouteLinks: Story = {
  ...RouteLinks,
  args: { links: true, sidePanel: true },
};

export const RouteSelectionFromHash: Story = {
  args: { links: true, hash: '#activity' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('activity: 1'),
    );
    expect(canvas.getByRole('link', { name: 'activity' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
