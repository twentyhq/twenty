import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useContext } from 'react';
import { expect, within } from 'storybook/test';
import {
  type CommandMenuContextApi,
  ContextStorePageType,
  CoreObjectNameSingular,
} from 'twenty-shared/types';
import { Badge } from 'twenty-ui/primitives/data-display';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderContent } from '@/command-menu-item/contexts/CommandMenuContextProviderContent';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { EngineComponentKey } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';

const SharePinState = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  return commandMenuItems.map((item) => (
    <Badge key={item.id}>
      {item.isPinned ? 'Pinned share' : 'Unpinned share'}
    </Badge>
  ));
};

const CHAT_SHARING_CONTEXT_API: CommandMenuContextApi = {
  ...EMPTY_COMMAND_MENU_CONTEXT_API,
  pageType: ContextStorePageType.Record,
  numberOfSelectedRecords: 1,
  selectedRecords: [{ id: 'chat' }],
  objectMetadataItem: {
    nameSingular: CoreObjectNameSingular.AgentChatThread,
  },
  featureFlags: { IS_AI_CHAT_INBOX_ENABLED: true },
};

const meta: Meta<typeof CommandMenuContextProviderContent> = {
  title: 'Modules/CommandMenu/CommandMenuContextProviderContent/ChatSharing',
  component: CommandMenuContextProviderContent,
  decorators: [MemoryRouterDecorator],
  args: {
    displayType: 'button',
    containerType: CommandMenuItemContainerType.ShowPageHeader,
    isInPreviewMode: false,
    commandMenuContextApi: CHAT_SHARING_CONTEXT_API,
    children: <SharePinState />,
  },
  beforeEach: ({ parameters }) => {
    jotaiStore.set(metadataStoreState.atomFamily('commandMenuItems'), {
      current: [
        {
          ...mockedCommandMenuItems[0],
          engineComponentKey: EngineComponentKey.SHARE_RECORD,
          isPinned: false,
          conditionalAvailabilityExpression:
            parameters.isSharingAvailable === false ? 'false' : null,
          conditionalPinnedExpression: null,
          availabilityObjectMetadataId: null,
        },
      ],
      draft: [],
      status: 'up-to-date',
    });
  },
};

export default meta;

type Story = StoryObj<typeof CommandMenuContextProviderContent>;

const expectUnpinnedShare: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  expect(canvas.getByText('Unpinned share')).toBeVisible();
  expect(canvas.queryByText('Pinned share')).not.toBeInTheDocument();
};

export const InboxHeader: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getAllByText('Pinned share')).toHaveLength(1);
    expect(canvas.queryByText('Unpinned share')).not.toBeInTheDocument();
  },
};

export const UnavailableSharing: Story = {
  parameters: { isSharingAvailable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Pinned share')).not.toBeInTheDocument();
    expect(canvas.queryByText('Unpinned share')).not.toBeInTheDocument();
  },
};

export const CompanyHeader: Story = {
  args: {
    commandMenuContextApi: {
      ...CHAT_SHARING_CONTEXT_API,
      objectMetadataItem: { nameSingular: CoreObjectNameSingular.Company },
    },
  },
  play: expectUnpinnedShare,
};

export const SidePanelFooter: Story = {
  args: { containerType: CommandMenuItemContainerType.SidePanelFooter },
  play: expectUnpinnedShare,
};

export const CommandMenuList: Story = {
  args: { containerType: CommandMenuItemContainerType.CommandMenuList },
  play: expectUnpinnedShare,
};

export const InboxDisabled: Story = {
  args: {
    commandMenuContextApi: {
      ...CHAT_SHARING_CONTEXT_API,
      featureFlags: { IS_AI_CHAT_INBOX_ENABLED: false },
    },
  },
  play: expectUnpinnedShare,
};
