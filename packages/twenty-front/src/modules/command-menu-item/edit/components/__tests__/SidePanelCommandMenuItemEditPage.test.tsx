import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { SidePanelCommandMenuItemEditPage } from '@/command-menu-item/edit/components/SidePanelCommandMenuItemEditPage';
import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

jest.mock('@/command-menu-item/hooks/useCurrentCommandMenuContextApi', () => ({
  useCurrentCommandMenuContextApi: () => ({
    ...jest.requireActual(
      '@/command-menu-item/constants/EmptyCommandMenuContextApi',
    ).EMPTY_COMMAND_MENU_CONTEXT_API,
    pageCommandKeys: ['SAVE_PAGE'],
  }),
}));

jest.mock('@/ui/layout/draggable-list/components/DraggableList', () => ({
  DraggableList: ({ draggableItems }: { draggableItems: ReactNode }) => (
    <>{draggableItems}</>
  ),
}));

jest.mock('@/ui/layout/draggable-list/components/DraggableItem', () => ({
  DraggableItem: ({ itemComponent }: { itemComponent: ReactNode }) => (
    <>{itemComponent}</>
  ),
}));

const buildCommandMenuItem = (
  overrides: Pick<
    CommandMenuItemFieldsFragment,
    'id' | 'label' | 'engineComponentKey' | 'position'
  > &
    Partial<CommandMenuItemFieldsFragment>,
): CommandMenuItemFieldsFragment => ({
  __typename: 'CommandMenuItem',
  isActive: true,
  frontComponentId: null,
  frontComponent: null,
  icon: null,
  shortLabel: overrides.label,
  isPinned: true,
  isPinLocked: false,
  hotKeys: null,
  conditionalAvailabilityExpression: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  availabilityObjectMetadataId: null,
  payload: null,
  ...overrides,
});

const SAVE_PAGE_ITEM = buildCommandMenuItem({
  id: 'save-page',
  label: 'Save',
  engineComponentKey: EngineComponentKey.SAVE_PAGE,
  position: 81,
  isPinLocked: true,
});

const NEXT_PAGE_STEP_ITEM = buildCommandMenuItem({
  id: 'next-page-step',
  label: 'Next',
  engineComponentKey: EngineComponentKey.NEXT_PAGE_STEP,
  position: 83,
  isPinLocked: true,
});

const GO_TO_PEOPLE_ITEM = buildCommandMenuItem({
  id: 'go-to-people',
  label: 'Go to People',
  engineComponentKey: EngineComponentKey.GO_TO_PEOPLE,
  position: 19,
});

const COMMAND_MENU_ITEMS = [
  SAVE_PAGE_ITEM,
  NEXT_PAGE_STEP_ITEM,
  GO_TO_PEOPLE_ITEM,
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MockedProvider>
      <I18nProvider i18n={i18n}>
        <ToastProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </MockedProvider>
  </JotaiProvider>
);

const getDraftItem = (id: string) =>
  jotaiStore
    .get(commandMenuItemsDraftState.atom)
    ?.find((item) => item.id === id);

describe('SidePanelCommandMenuItemEditPage', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(metadataStoreState.atomFamily('commandMenuItems'), {
      current: COMMAND_MENU_ITEMS,
      draft: [],
      status: 'up-to-date',
    });
    jotaiStore.set(commandMenuItemsDraftState.atom, COMMAND_MENU_ITEMS);
  });

  it('lists only the page commands the current page offers', () => {
    render(<SidePanelCommandMenuItemEditPage />, { wrapper: Wrapper });

    expect(screen.getByText('Save')).toBeVisible();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('offers no way to unpin a command that is always pinned', async () => {
    const user = userEvent.setup();

    render(<SidePanelCommandMenuItemEditPage />, { wrapper: Wrapper });

    const unpinButtons = screen.getAllByRole('button', { name: 'Unpin' });

    expect(unpinButtons).toHaveLength(1);

    await user.click(unpinButtons[0]);

    expect(getDraftItem(GO_TO_PEOPLE_ITEM.id)?.isPinned).toBe(false);
    expect(getDraftItem(SAVE_PAGE_ITEM.id)?.isPinned).toBe(true);
  });
});
