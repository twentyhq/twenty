import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { sleep } from '~/utils/sleep';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { CommandMenuRouter } from '@/command-menu/components/CommandMenuRouter';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';
import { CommandMenu } from '../CommandMenu';

const companiesMock = getCompaniesMock();

const openTimeout = 50;

const ContextStoreDecorator: Decorator = (Story) => {
  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: 'command-menu' }}
    >
      <ActionMenuComponentInstanceContext.Provider
        value={{ instanceId: 'command-menu' }}
      >
        <JestContextStoreSetter contextStoreCurrentObjectMetadataNameSingular="company">
          <Story />
        </JestContextStoreSetter>
      </ActionMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof CommandMenu> = {
  title: 'Modules/CommandMenu/CommandMenu',
  component: CommandMenuRouter,
  decorators: [
    (Story) => {
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const setCurrentWorkspaceMember = useSetRecoilState(
        currentWorkspaceMemberState,
      );
      const setIsCommandMenuOpened = useSetRecoilState(
        isCommandMenuOpenedState,
      );

      setCurrentWorkspace(mockCurrentWorkspace);
      setCurrentWorkspaceMember(mockedWorkspaceMemberData);
      setIsCommandMenuOpened(true);

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

    expect(await canvas.findByText('Go to People')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Companies')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Opportunities')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Settings')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Tasks')).toBeInTheDocument();
  },
};

export const MatchingPersonCompanyActivityCreateNavigate: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Type anything');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'n');
    expect(await canvas.findByText('Linkedin')).toBeInTheDocument();
    expect(await canvas.findByText(companiesMock[0].name)).toBeInTheDocument();
    expect(await canvas.findByText('Go to Companies')).toBeInTheDocument();
  },
};

export const OnlyMatchingCreateAndNavigate: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Type anything');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'ta');
    expect(await canvas.findByText('Go to Tasks')).toBeInTheDocument();
  },
};

export const AtleastMatchingOnePerson: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Type anything');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'alex');
    expect(await canvas.findByText('Sylvie Palmer')).toBeInTheDocument();
  },
};
