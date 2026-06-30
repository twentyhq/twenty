import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

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

type SidePanelNavigationStackItem = {
  page: SidePanelPages;
  pageTitle: string;
  pageIcon: typeof IconDotsVertical;
  pageId: string;
};

const ROOT_PAGE: SidePanelNavigationStackItem = {
  page: SidePanelPages.CommandMenuDisplay,
  pageTitle: 'Command Menu',
  pageIcon: IconDotsVertical,
  pageId: 'command-menu',
};

const SUBPAGE: SidePanelNavigationStackItem = {
  page: SidePanelPages.CommandMenuEdit,
  pageTitle: 'Edit',
  pageIcon: IconDotsVertical,
  pageId: 'command-menu-edit',
};

const createSidePanelDecorator = (
  navigationStack: SidePanelNavigationStackItem[],
): Decorator => {
  return (Story) => {
    const currentPage = navigationStack[navigationStack.length - 1];

    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(sidePanelPageState.atom, currentPage.page);
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
  decorators: [createSidePanelDecorator([ROOT_PAGE])],
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

export const Subpage: Story = {
  decorators: [createSidePanelDecorator([ROOT_PAGE, SUBPAGE])],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('button', { name: 'Back' })).toBeVisible();
    expect(
      await canvas.findByRole('button', { name: 'Close side panel' }),
    ).toBeVisible();
  },
};
