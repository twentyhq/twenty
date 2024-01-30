import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandType } from '@/command-menu/types/Command';
import { IconCheckbox, IconNotes } from '@/ui/display/icon';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockDefaultWorkspace } from '~/testing/mock-data/users';
import { sleep } from '~/testing/sleep';

import { CommandMenu } from '../CommandMenu';

const openTimeout = 50;

const meta: Meta<typeof CommandMenu> = {
  title: 'Modules/CommandMenu/CommandMenu',
  component: CommandMenu,
  decorators: [
    (Story) => {
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const { addToCommandMenu, setToIntitialCommandMenu, openCommandMenu } =
        useCommandMenu();

      setCurrentWorkspace(mockDefaultWorkspace);

      useEffect(() => {
        setToIntitialCommandMenu();
        addToCommandMenu([
          {
            id: 'create-task',
            to: '',
            label: 'Create Task',
            type: CommandType.Create,
            Icon: IconCheckbox,
            onCommandClick: () => console.log('create task click'),
          },
          {
            id: 'create-note',
            to: '',
            label: 'Create Note',
            type: CommandType.Create,
            Icon: IconNotes,
            onCommandClick: () => console.log('create note click'),
          },
        ]);
        openCommandMenu();
      }, [addToCommandMenu, setToIntitialCommandMenu, openCommandMenu]);

      return <Story />;
    },
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentWithRouterDecorator,
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

    expect(await canvas.findByText('Create Task')).toBeInTheDocument();
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
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'n');
    expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
    expect(await canvas.findByText('Airbnb')).toBeInTheDocument();
    expect(await canvas.findByText('My very first note')).toBeInTheDocument();
    expect(await canvas.findByText('Create Note')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Companies')).toBeInTheDocument();
  },
};

export const OnlyMatchingCreateAndNavigate: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'ta');
    expect(await canvas.findByText('Create Task')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Tasks')).toBeInTheDocument();
  },
};

export const AtleastMatchingOnePerson: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'alex');
    expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
  },
};

export const NotMatchingAnything: Story = {
  play: async () => {
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(openTimeout);
    await userEvent.type(searchInput, 'asdasdasd');
    // FIXME: We need to fix the filters in graphql
    // expect(await canvas.findByText('No results found')).toBeInTheDocument();
  },
};
