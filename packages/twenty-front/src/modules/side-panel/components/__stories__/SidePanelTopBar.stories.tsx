import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SidePanelTopBar } from '@/side-panel/components/SidePanelTopBar';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  type SidePanelNavigationStackItem,
  sidePanelNavigationStackState,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

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
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(sidePanelNavigationStackState.atom, navigationStack);

    return <Story />;
  };
};

const meta: Meta<typeof SidePanelTopBar> = {
  title: 'Modules/SidePanel/SidePanelTopBar',
  component: SidePanelTopBar,
  decorators: [
    ObjectMetadataItemsDecorator,
    ToastDecorator,
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

export const HistoryNavigation: Story = {
  decorators: [
    createSidePanelDecorator([
      ROOT_PAGE,
      SUBPAGE,
      {
        page: SidePanelPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconDotsVertical,
        pageId: 'search-records',
      },
    ]),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const backButton = await canvas.findByRole('button', { name: 'Back' });

    await userEvent.pointer({ target: backButton, keys: '[MouseRight]' });

    const history = await body.findByRole('menu', {
      name: 'Navigation history',
    });

    await userEvent.click(
      within(history).getByRole('menuitem', { name: 'Edit' }),
    );

    await waitFor(() => {
      expect(body.queryByRole('menu')).not.toBeInTheDocument();
      expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toHaveLength(
        2,
      );
    });

    await userEvent.pointer({ target: backButton, keys: '[MouseRight]' });
    await body.findByRole('menu', { name: 'Navigation history' });
    await userEvent.click(backButton);

    await waitFor(() => {
      expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toHaveLength(
        1,
      );
      expect(body.queryByRole('menu')).not.toBeInTheDocument();
    });
  },
};
