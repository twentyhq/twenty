import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useContext } from 'react';
import { expect, within } from 'storybook/test';
import {
  type CommandMenuContextApi,
  ContextStorePageType,
  StandardObjectNameSingular,
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

const PinStates = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  return commandMenuItems.map((item) => (
    <Badge key={item.id}>
      {`${item.engineComponentKey} ${item.isPinned ? 'pinned' : 'unpinned'}`}
    </Badge>
  ));
};

const CHAT_CONTEXT_API: CommandMenuContextApi = {
  ...EMPTY_COMMAND_MENU_CONTEXT_API,
  pageType: ContextStorePageType.Record,
  numberOfSelectedRecords: 1,
  selectedRecords: [{ id: 'chat' }],
  objectMetadataItem: {
    id: 'agent-chat-thread-object',
    nameSingular: StandardObjectNameSingular.AgentChatThread,
  },
  featureFlags: { IS_AI_CHAT_INBOX_ENABLED: true },
};

const meta: Meta<typeof CommandMenuContextProviderContent> = {
  title: 'Modules/CommandMenu/CommandMenuContextProviderContent/ChatHeaderPinning',
  component: CommandMenuContextProviderContent,
  decorators: [MemoryRouterDecorator],
  args: {
    displayType: 'button',
    containerType: CommandMenuItemContainerType.ShowPageHeader,
    isInPreviewMode: false,
    commandMenuContextApi: CHAT_CONTEXT_API,
    children: <PinStates />,
  },
  beforeEach: () => {
    jotaiStore.set(metadataStoreState.atomFamily('commandMenuItems'), {
      current: [
        {
          ...mockedCommandMenuItems[0],
          id: 'share',
          engineComponentKey: EngineComponentKey.SHARE_RECORD,
          isPinned: false,
          conditionalAvailabilityExpression: null,
          conditionalPinnedExpression: null,
          availabilityObjectMetadataId: null,
        },
        {
          ...mockedCommandMenuItems[0],
          id: 'add-to-favorites',
          engineComponentKey: EngineComponentKey.ADD_TO_FAVORITES,
          isPinned: true,
          conditionalAvailabilityExpression: null,
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

const expectPinStates =
  ({ isFavoritesPinned }: { isFavoritesPinned: boolean }): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('SHARE_RECORD unpinned')).toBeVisible();
    expect(
      canvas.getByText(
        `ADD_TO_FAVORITES ${isFavoritesPinned ? 'pinned' : 'unpinned'}`,
      ),
    ).toBeVisible();
  };

export const InboxHeader: Story = {
  play: expectPinStates({ isFavoritesPinned: false }),
};

export const CompanyHeader: Story = {
  args: {
    commandMenuContextApi: {
      ...CHAT_CONTEXT_API,
      objectMetadataItem: {
        id: 'company-object',
        nameSingular: StandardObjectNameSingular.Company,
      },
    },
  },
  play: expectPinStates({ isFavoritesPinned: true }),
};

export const SidePanelFooter: Story = {
  args: { containerType: CommandMenuItemContainerType.SidePanelFooter },
  play: expectPinStates({ isFavoritesPinned: true }),
};

export const InboxDisabled: Story = {
  args: {
    commandMenuContextApi: {
      ...CHAT_CONTEXT_API,
      featureFlags: { IS_AI_CHAT_INBOX_ENABLED: false },
    },
  },
  play: expectPinStates({ isFavoritesPinned: true }),
};
