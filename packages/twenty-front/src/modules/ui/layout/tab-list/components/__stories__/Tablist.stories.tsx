import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { type ComponentProps } from 'react';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  IconCalendar,
  IconCheckbox,
  IconHeart,
  IconHome,
  IconMail,
  IconPhone,
  IconUser,
} from 'twenty-ui/icon';
import { AVATAR_URL_MOCK } from 'twenty-ui/testing';

const tabs = [
  { id: 'general', title: 'General', logo: AVATAR_URL_MOCK },
  { id: 'contacts', title: 'Contacts', Icon: IconUser },
  { id: 'messages', title: 'Messages', Icon: IconMail },
  { id: 'calls', title: 'Calls', Icon: IconPhone },
  { id: 'calendar', title: 'Calendar', Icon: IconCalendar },
  { id: 'sales', title: 'Sales', Icon: IconHome, disabled: true },
  { id: 'hidden', title: 'Hidden Tab', Icon: IconCheckbox, hide: true },
  {
    id: 'time',
    title: 'Time Tracking',
    logo: AVATAR_URL_MOCK,
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

import { themeCssVariables } from 'twenty-ui/theme';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const StyledInteractiveContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.strong};
  max-width: 100%;
  min-width: 300px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[5]};
  resize: horizontal;
  width: 600px;
`;

const meta: Meta<typeof TabList> = {
  title: 'UI/Layout/TabList/TabList',
  component: TabList,
  args: {
    'aria-label': 'Record sections',
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
      <TabListRoot
        componentInstanceId={args.componentInstanceId}
        enabled={args.behaveAsLinks === false}
      >
        <TabList
          aria-label={args['aria-label']}
          tabs={args.tabs}
          componentInstanceId={args.componentInstanceId}
          loading={args.loading}
          behaveAsLinks={args.behaveAsLinks}
          className={args.className}
        />
        {args.behaveAsLinks === false &&
          args.tabs
            .filter((tab) => !tab.hide)
            .map((tab) => (
              <Tabs.Panel key={tab.id} value={tab.id}>
                <Text>{tab.title} content</Text>
              </Tabs.Panel>
            ))}
      </TabListRoot>
    </StyledInteractiveContainer>
  ),
};

export const Overflow: Story = {
  args: { behaveAsLinks: false },
  render: (args) => (
    <StyledInteractiveContainer style={{ width: 300 }}>
      <TabListRoot componentInstanceId={args.componentInstanceId}>
        <TabList {...args} />
      </TabListRoot>
    </StyledInteractiveContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const moreButton = await canvas.findByRole('button', { name: /More/ });
    await userEvent.click(moreButton);
    const popup = await body.findByRole('dialog', { name: /More/ });
    const sales = await body.findByRole('button', { name: 'Sales' });
    expect(sales).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(sales);
    expect(sales).toHaveAttribute('aria-pressed', 'false');
    expect(popup).toBeVisible();
    sales.focus();
    await userEvent.keyboard('{Enter}[Space]');
    expect(sales).toHaveAttribute('aria-pressed', 'false');
    expect(canvas.getByRole('tab', { name: 'General' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(popup).toBeVisible();
    await userEvent.click(body.getByRole('button', { name: 'Favorites' }));
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: /More/ }),
      ).not.toBeInTheDocument(),
    );
    expect(moreButton).toHaveAttribute('data-active');
    await userEvent.click(moreButton);
    expect(
      await body.findByRole('button', { name: 'Favorites' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(moreButton).toHaveFocus());
  },
};

const TabListInDialog = (args: ComponentProps<typeof TabList>) => {
  const { openDialog } = useDialog();

  return (
    <>
      <Button onClick={() => openDialog('tab-list-dialog')}>
        Open tab dialog
      </Button>
      <DialogInstance dialogId="tab-list-dialog" dismissible>
        {(popupProps) => (
          <Dialog.Popup {...popupProps}>
            <Dialog.Header>
              <Dialog.Title>Record tabs</Dialog.Title>
              <Dialog.Description>Choose a record section.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <StyledInteractiveContainer style={{ width: 300 }}>
                <TabListRoot componentInstanceId={args.componentInstanceId}>
                  <TabList {...args} />
                </TabListRoot>
              </StyledInteractiveContainer>
            </Dialog.Body>
          </Dialog.Popup>
        )}
      </DialogInstance>
    </>
  );
};

export const OverflowInsideDialog: Story = {
  args: { behaveAsLinks: false, componentInstanceId: 'dialog-tabs' },
  render: (args) => <TabListInDialog {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open tab dialog' }),
    );
    const dialog = await body.findByRole('dialog', { name: 'Record tabs' });
    const moreButton = await within(dialog).findByRole('button', {
      name: /More/,
    });
    await userEvent.click(moreButton);
    await userEvent.click(
      await body.findByRole('button', { name: 'Favorites' }),
    );
    expect(dialog).toBeVisible();
    expect(moreButton).toHaveAttribute('data-active');
    await userEvent.click(moreButton);
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: /More/ }),
      ).not.toBeInTheDocument(),
    );
    expect(dialog).toBeVisible();
  },
};
