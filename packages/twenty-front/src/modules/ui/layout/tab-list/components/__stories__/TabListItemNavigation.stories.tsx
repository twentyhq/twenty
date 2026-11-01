import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { Text } from 'twenty-ui/primitives/typography';

import { TabListItem } from '@/ui/layout/tab-list/components/TabListItem';
import { type TabListItemProps } from '@/ui/layout/tab-list/types/TabListItemProps';

type TabListItemNavigationExampleProps = Extract<
  TabListItemProps,
  { mode: 'link' }
>;

const TabListItemNavigationExample = (
  args: TabListItemNavigationExampleProps,
) => {
  const location = useLocation();

  return (
    <>
      <TabListItem {...args} active={location.hash === '#activity'} />
      <Text role="status">
        {location.pathname}
        {location.search}
        {location.hash}
      </Text>
      <Text>{location.state?.source}</Text>
    </>
  );
};

const meta = {
  title: 'UI/Layout/TabList/ItemNavigation',
  component: TabListItemNavigationExample,
  args: {
    tab: { id: 'activity', title: 'Activity' },
    mode: 'link',
    active: false,
    onSelect: fn(),
    ref: fn(),
  },
  decorators: [
    ComponentDecorator,
    (Story) => (
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/object/company/record-1',
            search: '?filter=open',
            state: { source: 'record-route' },
          },
        ]}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof TabListItemNavigationExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RouteLinkComposition: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const activity = await canvas.findByRole('link', { name: 'Activity' });

    expect(activity.tagName).toBe('A');
    expect(args.ref).toHaveBeenCalledWith(activity);
    expect(activity).toHaveAttribute(
      'href',
      '/object/company/record-1?filter=open#activity',
    );
    expect(activity).not.toHaveAttribute('type');
    expect(activity).not.toHaveAttribute('aria-current');
    expect(activity).not.toHaveAttribute('aria-selected');
    expect(activity).not.toHaveAttribute('aria-controls');
    expect(canvas.queryByRole('tab')).not.toBeInTheDocument();
    expect(canvas.queryByRole('tablist')).not.toBeInTheDocument();
    expect(canvas.queryByRole('tabpanel')).not.toBeInTheDocument();

    activity.focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onSelect).toHaveBeenCalledTimes(1);
    expect(args.onSelect).toHaveBeenCalledWith('activity');
    expect(canvas.getByRole('status')).toHaveTextContent(
      '/object/company/record-1?filter=open#activity',
    );
    expect(canvas.getByText('record-route')).toBeVisible();
    expect(activity).toHaveAttribute('aria-current', 'page');
    expect(activity).toHaveFocus();
  },
};
