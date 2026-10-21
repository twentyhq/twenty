import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
} from 'twenty-shared/types';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderContent } from '@/command-menu-item/contexts/CommandMenuContextProviderContent';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { EngineComponentKey } from '~/generated-metadata/graphql';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';

jest.mock(
  '@/command-menu-item/hooks/useGlobalRecordCreationCommandMenuItems',
  () => ({
    useGlobalRecordCreationCommandMenuItems: () => ({
      hasGlobalRecordCreationCommandTemplate: false,
      globalRecordCreationCommandMenuItems: [],
    }),
  }),
);
jest.mock(
  '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage',
  () => ({
    useIsLayoutCustomizationAllowedOnCurrentPage: () => false,
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
jest.mock('@/command-menu-item/states/commandMenuItemsSelector', () => ({
  commandMenuItemsSelector: {},
}));
jest.mock('@/command-menu-item/edit/states/commandMenuItemsDraftState', () => ({
  commandMenuItemsDraftState: {},
}));
jest.mock('@/page-layout/states/currentPageLayoutIdState', () => ({
  currentPageLayoutIdState: {},
  PageLayoutIdContext: jest.requireActual('react').createContext(undefined),
}));

const SharePinState = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  return commandMenuItems.map((item) => (
    <div key={item.id}>{item.isPinned ? 'Pinned share' : 'Unpinned share'}</div>
  ));
};

const renderSharingCommands = ({
  objectNameSingular = CoreObjectNameSingular.AgentChatThread,
  containerType = CommandMenuItemContainerType.ShowPageHeader,
  isInboxEnabled = true,
  isAvailable = true,
}: {
  objectNameSingular?: CoreObjectNameSingular;
  containerType?: CommandMenuItemContainerType;
  isInboxEnabled?: boolean;
  isAvailable?: boolean;
} = {}) => {
  const shareCommand = {
    ...mockedCommandMenuItems[0],
    engineComponentKey: EngineComponentKey.SHARE_RECORD,
    isPinned: false,
    conditionalAvailabilityExpression: isAvailable ? null : 'false',
    conditionalPinnedExpression: null,
    availabilityObjectMetadataId: null,
  };

  jest
    .mocked(useAtomStateValue)
    .mockImplementation((state) =>
      state === commandMenuItemsSelector ? [shareCommand] : null,
    );

  return render(
    <CommandMenuContextProviderContent
      displayType="button"
      containerType={containerType}
      isInPreviewMode={false}
      commandMenuContextApi={{
        ...EMPTY_COMMAND_MENU_CONTEXT_API,
        pageType: ContextStorePageType.Record,
        numberOfSelectedRecords: 1,
        selectedRecords: [{ id: 'chat' }],
        objectMetadataItem: { nameSingular: objectNameSingular },
        featureFlags: { IS_AI_CHAT_INBOX_ENABLED: isInboxEnabled },
      }}
    >
      <SharePinState />
    </CommandMenuContextProviderContent>,
  );
};

describe('chat header sharing command', () => {
  it('pins one available share command in the inbox header', () => {
    renderSharingCommands();

    expect(screen.getAllByText('Pinned share')).toHaveLength(1);
    expect(screen.queryByText('Unpinned share')).not.toBeInTheDocument();
  });

  it('keeps unavailable sharing commands hidden', () => {
    renderSharingCommands({ isAvailable: false });

    expect(screen.queryByText('Pinned share')).not.toBeInTheDocument();
    expect(screen.queryByText('Unpinned share')).not.toBeInTheDocument();
  });

  it.each([
    { objectNameSingular: CoreObjectNameSingular.Company },
    { containerType: CommandMenuItemContainerType.SidePanelFooter },
    { containerType: CommandMenuItemContainerType.CommandMenuList },
    { isInboxEnabled: false },
  ])('preserves pinning outside the inbox header for %j', (context) => {
    renderSharingCommands(context);

    expect(screen.getByText('Unpinned share')).toBeVisible();
    expect(screen.queryByText('Pinned share')).not.toBeInTheDocument();
  });
});
