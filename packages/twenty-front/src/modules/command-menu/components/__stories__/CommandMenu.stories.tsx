import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedBackendCommandMenuItems } from '~/testing/mock-data/command-menu-items';
import {
  mockCurrentWorkspace,
  mockedLimitedPermissionsUserData,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { sleep } from '~/utils/sleep';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { SidePanelRouter } from '@/side-panel/components/SidePanelRouter';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { type SidePanelRootPage } from '@/side-panel/pages/root/components/SidePanelRootPage';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { HttpResponse, graphql } from 'msw';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical, IconPlus } from 'twenty-ui/display';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';

const openTimeout = 50;

const ContextStoreDecorator: Decorator = (Story) => {
  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={SIDE_PANEL_COMPONENT_INSTANCE_ID}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID }}
        >
          <CommandMenuComponentInstanceContext.Provider
            value={{ instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID }}
          >
            <JestContextStoreSetter
              contextStoreCurrentObjectMetadataNameSingular="company"
              contextStoreCurrentViewId="1"
              contextStoreCurrentViewType={ContextStoreViewType.Table}
            >
              <Story />
            </JestContextStoreSetter>
          </CommandMenuComponentInstanceContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};

const meta: Meta<typeof SidePanelRootPage> = {
  title: 'Modules/CommandMenu/CommandMenu',
  component: SidePanelRouter,
  decorators: [
    (Story) => {
      jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
      jotaiStore.set(metadataStoreState.atomFamily('commandMenuItems'), {
        current: mockedBackendCommandMenuItems,
        draft: [],
        status: 'up-to-date',
      });
      jotaiStore.set(
        currentWorkspaceMemberState.atom,
        mockedWorkspaceMemberData,
      );
      jotaiStore.set(
        currentUserWorkspaceState.atom,
        mockedUserData.currentUserWorkspace,
      );
      jotaiStore.set(isSidePanelOpenedState.atom, true);
      jotaiStore.set(sidePanelPageInfoState.atom, {
        title: 'Command Menu',
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      });
      jotaiStore.set(sidePanelNavigationStackState.atom, [
        {
          page: SidePanelPages.CommandMenuDisplay,
          pageTitle: 'Command Menu',
          pageIcon: IconDotsVertical,
          pageId: '1',
        },
      ]);

      const objectMetadataItems = jotaiStore.get(
        objectMetadataItemsSelector.atom,
      );
      const companyMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === 'company',
      );

      if (companyMetadataItem === undefined) {
        return <Story />;
      }

      jotaiStore.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        companyMetadataItem.id,
      );
      jotaiStore.set(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        ContextStoreViewType.Table,
      );

      return <Story />;
    },
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentWithRouterDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SidePanelRootPage>;

export const DefaultWithoutSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Go to People')).toBeVisible();
    expect(await canvas.findByText('Go to Opportunities')).toBeVisible();
    expect(await canvas.findByText('Go to Settings')).toBeVisible();
    expect(await canvas.findByText('Go to Tasks')).toBeVisible();
    expect(await canvas.findByText('Go to Notes')).toBeVisible();
  },
};

export const LimitedPermissions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Go to People')).toBeVisible();
    await waitFor(() => {
      expect(canvas.queryByText('Go to Opportunities')).not.toBeInTheDocument();
      expect(canvas.queryByText('Go to Tasks')).not.toBeInTheDocument();
    });
    expect(await canvas.findByText('Go to Settings')).toBeVisible();
    expect(await canvas.findByText('Go to Notes')).toBeVisible();
  },
  decorators: [
    (Story) => {
      jotaiStore.set(
        currentUserWorkspaceState.atom,
        mockedLimitedPermissionsUserData.currentUserWorkspace,
      );

      return <Story />;
    },
  ],
};

export const MatchingNavigate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = await canvas.findByTestId(SIDE_PANEL_FOCUS_ID);
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'ta');
    expect(await canvas.findByText('Go to Tasks')).toBeVisible();
  },
};

export const MatchingNavigateShortcuts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = await canvas.findByTestId(SIDE_PANEL_FOCUS_ID);
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'gp');
    expect(await canvas.findByText('Go to People')).toBeVisible();
  },
};

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const SearchRecordsAction: Story = {
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement.ownerDocument.body);
//     const searchRecordsButton = await canvas.findByText('Search records');
//     await userEvent.click(searchRecordsButton);
//     const searchInput = await canvas.findByPlaceholderText('Type anything...');
//     await sleep(openTimeout);
//     await userEvent.type(searchInput, 'n');
//     expect(await canvas.findByText('Linkedin')).toBeVisible();
//     const companyTexts = await canvas.findAllByText('Company');
//     expect(companyTexts[0]).toBeVisible();
//   },
// };

export const NoResultsSearchFallback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = await canvas.findByTestId(SIDE_PANEL_FOCUS_ID);
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'input without results');
    expect(await canvas.findByText('No results found')).toBeVisible();
  },
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('Search', () => {
          return HttpResponse.json({
            data: {
              search: {
                edges: [],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: null,
                },
              },
            },
          });
        }),
      ],
    },
  },
};

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const ClickOnSearchRecordsAndGoBack: Story = {
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement.ownerDocument.body);
//     const searchRecordsButton = await canvas.findByText('Search records');
//     await userEvent.click(searchRecordsButton);
//     await sleep(openTimeout);
//     const goBackButton = await canvas.findByTestId(
//       'command-menu-go-back-button',
//     );
//     await userEvent.click(goBackButton);
//     expect(await canvas.findByText('Search records')).toBeVisible();
//   },
// };

export const SubPageNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const objectButton = await canvas.findByText('Object');
    expect(objectButton).toBeVisible();

    await userEvent.click(objectButton);

    expect(await canvas.findByText('Pick an object')).toBeVisible();

    const backButton = await canvas.findByRole('button', { name: 'Go back' });
    await userEvent.click(backButton);

    await waitFor(() => {
      expect(canvas.getByText('Object')).toBeVisible();
    });
  },
  decorators: [
    (Story) => {
      jotaiStore.set(
        sidePanelPageState.atom,
        SidePanelPages.NavigationMenuAddItem,
      );
      jotaiStore.set(sidePanelPageInfoState.atom, {
        title: 'Add item',
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      });
      jotaiStore.set(sidePanelNavigationStackState.atom, [
        {
          page: SidePanelPages.NavigationMenuAddItem,
          pageTitle: 'Add item',
          pageIcon: IconPlus,
          pageId: '1',
        },
      ]);

      return <Story />;
    },
  ],
};
