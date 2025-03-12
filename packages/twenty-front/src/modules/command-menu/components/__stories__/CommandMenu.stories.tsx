import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { sleep } from '~/utils/sleep';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { CommandMenuRouter } from '@/command-menu/components/CommandMenuRouter';
import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { HttpResponse, graphql } from 'msw';
import { IconDotsVertical } from 'twenty-ui';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';
import { CommandMenu } from '../CommandMenu';

const openTimeout = 50;

const ContextStoreDecorator: Decorator = (Story) => {
  return (
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
    >
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
            >
              <JestContextStoreSetter contextStoreCurrentObjectMetadataNameSingular="company">
                <Story />
              </JestContextStoreSetter>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof CommandMenu> = {
  title: 'Modules/CommandMenu/CommandMenu',
  component: CommandMenuRouter,
  decorators: [
    I18nFrontDecorator,
    (Story) => {
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const setCurrentWorkspaceMember = useSetRecoilState(
        currentWorkspaceMemberState,
      );
      const setIsCommandMenuOpened = useSetRecoilState(
        isCommandMenuOpenedState,
      );
      const setCommandMenuNavigationStack = useSetRecoilState(
        commandMenuNavigationStackState,
      );

      setCurrentWorkspace(mockCurrentWorkspace);
      setCurrentWorkspaceMember(mockedWorkspaceMemberData);
      setIsCommandMenuOpened(true);
      setCommandMenuNavigationStack([
        {
          page: CommandMenuPages.Root,
          pageTitle: 'Command Menu',
          pageIcon: IconDotsVertical,
          pageId: '1',
        },
      ]);

      return <Story />;
    },
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentWithRouterDecorator,
    I18nFrontDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof CommandMenu>;

export const DefaultWithoutSearch: Story = {
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Go to People')).toBeVisible();
    expect(await canvas.findByText('Go to Companies')).toBeVisible();
    expect(await canvas.findByText('Go to Opportunities')).toBeVisible();
    expect(await canvas.findByText('Go to Settings')).toBeVisible();
    expect(await canvas.findByText('Go to Tasks')).toBeVisible();
  },
};

export const MatchingNavigate: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Type anything');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'ta');
    expect(await canvas.findByText('Go to Tasks')).toBeVisible();
  },
};

export const MatchingNavigateShortcuts: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Type anything');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'gp');
    expect(await canvas.findByText('Go to People')).toBeVisible();
  },
};

export const SearchRecordsAction: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchRecordsButton = await canvas.findByText('Search records');
    await userEvent.click(searchRecordsButton);
    const searchInput = await canvas.findByPlaceholderText('Type anything');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'n');
    expect(await canvas.findByText('Linkedin')).toBeVisible();
    const companyTexts = await canvas.findAllByText('Company');
    expect(companyTexts[0]).toBeVisible();
  },
};

export const NoResultsSearchFallback: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Type anything');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'input without results');
    expect(await canvas.findByText('No results found')).toBeVisible();
    const searchRecordsButton = await canvas.findByText('Search records');
    expect(searchRecordsButton).toBeVisible();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('GlobalSearch', () => {
          return HttpResponse.json({
            data: {
              globalSearch: [],
            },
          });
        }),
      ],
    },
  },
};

export const ClickOnSearchRecordsAndGoBack: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchRecordsButton = await canvas.findByText('Search records');
    await userEvent.click(searchRecordsButton);
    await sleep(openTimeout);
    const goBackButton = await canvas.findByTestId(
      'command-menu-go-back-button',
    );
    await userEvent.click(goBackButton);
    expect(await canvas.findByText('Search records')).toBeVisible();
  },
};
