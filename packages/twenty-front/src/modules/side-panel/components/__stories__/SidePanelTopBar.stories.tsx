import { type Decorator, type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { SidePanelTopBar } from '@/side-panel/components/SidePanelTopBar';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

type NavigationStackItem = {
  page: SidePanelPages;
  pageTitle: string;
  pageIcon: typeof IconDotsVertical;
  pageId: string;
};

const ROOT_COMMAND_MENU_STACK: NavigationStackItem[] = [
  {
    page: SidePanelPages.CommandMenuDisplay,
    pageTitle: 'Command Menu',
    pageIcon: IconDotsVertical,
    pageId: 'command-menu',
  },
];

const COMMAND_MENU_SUBPAGE_STACK: NavigationStackItem[] = [
  ...ROOT_COMMAND_MENU_STACK,
  {
    page: SidePanelPages.CommandMenuEdit,
    pageTitle: 'Edit',
    pageIcon: IconDotsVertical,
    pageId: 'command-menu-edit',
  },
];

const DIRECTLY_OPENED_RECORD_STACK: NavigationStackItem[] = [
  {
    page: SidePanelPages.ViewRecord,
    pageTitle: 'Company',
    pageIcon: IconDotsVertical,
    pageId: 'view-record',
  },
];

const createSidePanelStateDecorator = (
  navigationStack: NavigationStackItem[],
): Decorator => {
  return (Story) => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(sidePanelPageState.atom, navigationStack.at(-1)!.page);
    jotaiStore.set(sidePanelNavigationStackState.atom, navigationStack);

    return <Story />;
  };
};

const meta: Meta<typeof SidePanelTopBar> = {
  title: 'Modules/SidePanel/SidePanelTopBar',
  component: SidePanelTopBar,
  decorators: [
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentWithRouterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof SidePanelTopBar>;

export const RootCommandMenu: Story = {
  decorators: [createSidePanelStateDecorator(ROOT_COMMAND_MENU_STACK)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Close side panel' }),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Back' }),
    ).not.toBeInTheDocument();
  },
};

export const CommandMenuSubpage: Story = {
  decorators: [createSidePanelStateDecorator(COMMAND_MENU_SUBPAGE_STACK)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('button', { name: 'Back' })).toBeVisible();
    expect(
      await canvas.findByRole('button', { name: 'Close side panel' }),
    ).toBeVisible();
  },
};

export const OpenedDirectly: Story = {
  decorators: [createSidePanelStateDecorator(DIRECTLY_OPENED_RECORD_STACK)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Close side panel' }),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Back' }),
    ).not.toBeInTheDocument();
  },
};

// On mobile the close button must stay available when there is no back button,
// otherwise the side panel cannot be dismissed.
export const MobileRoot: Story = {
  decorators: [createSidePanelStateDecorator(ROOT_COMMAND_MENU_STACK)],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Close side panel' }),
    ).toBeVisible();
  },
};

// On mobile the back button doubles as the dismiss action, so the close button
// is hidden to avoid redundancy when a back button is available.
export const MobileSubpage: Story = {
  decorators: [createSidePanelStateDecorator(COMMAND_MENU_SUBPAGE_STACK)],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('button', { name: 'Back' })).toBeVisible();
    await waitFor(() => {
      expect(
        canvas.queryByRole('button', { name: 'Close side panel' }),
      ).not.toBeInTheDocument();
    });
  },
};
