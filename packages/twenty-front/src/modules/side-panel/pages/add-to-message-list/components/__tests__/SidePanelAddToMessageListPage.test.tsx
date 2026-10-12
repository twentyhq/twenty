import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { SidePanelAddToMessageListPage } from '@/side-panel/pages/add-to-message-list/components/SidePanelAddToMessageListPage';
import { addToMessageListPersonFilterComponentState } from '@/side-panel/pages/add-to-message-list/states/addToMessageListPersonFilterComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const addPeopleToMessageList = jest.fn();
const closeSidePanelMenu = jest.fn();
const createOneRecord = jest.fn();
const enqueueToast = jest.fn();

jest.mock(
  '@/side-panel/pages/add-to-message-list/hooks/useAddPeopleToMessageList',
  () => ({
    useAddPeopleToMessageList: () => ({ addPeopleToMessageList }),
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu }),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord }),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({
    records: [
      { id: 'list-1', name: 'Developer program members' },
      { id: 'list-2', name: 'Founders' },
    ],
    loading: false,
  }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast }),
}));

const PAGE_ID = 'add-to-message-list-page';
const PERSON_FILTER = { id: { in: ['p1', 'p2'] } };

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: PAGE_ID }}
      >
        <MemoryRouter>{children}</MemoryRouter>
      </SidePanelPageComponentInstanceContext.Provider>
    </I18nProvider>
  </JotaiProvider>
);

const renderPage = () =>
  render(<SidePanelAddToMessageListPage />, { wrapper: Wrapper });

describe('SidePanelAddToMessageListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(
      addToMessageListPersonFilterComponentState.atomFamily({
        instanceId: PAGE_ID,
      }),
      PERSON_FILTER,
    );
  });

  it('adds the selected people to the clicked list', async () => {
    addPeopleToMessageList.mockResolvedValue({
      addedCount: 2,
      alreadyInListCount: 0,
    });
    renderPage();

    await userEvent.click(screen.getByText('Developer program members'));

    expect(closeSidePanelMenu).toHaveBeenCalled();
    expect(addPeopleToMessageList).toHaveBeenCalledWith({
      listId: 'list-1',
      personFilter: PERSON_FILTER,
    });
    expect(enqueueToast).toHaveBeenCalledWith({
      variant: 'success',
      children: '2 people added to Developer program members',
    });
  });

  it('says so when everyone is already in the list', async () => {
    addPeopleToMessageList.mockResolvedValue({
      addedCount: 0,
      alreadyInListCount: 2,
    });
    renderPage();

    await userEvent.click(screen.getByText('Founders'));

    expect(enqueueToast).toHaveBeenCalledWith({
      variant: 'info',
      children: 'Everyone is already in Founders',
    });
  });

  it('creates a list named after the search and adds the people to it', async () => {
    createOneRecord.mockResolvedValue({ id: 'list-3', name: 'VIPs' });
    addPeopleToMessageList.mockResolvedValue({
      addedCount: 2,
      alreadyInListCount: 0,
    });
    renderPage();

    await userEvent.type(screen.getByPlaceholderText('Search lists'), 'VIPs');
    await userEvent.click(screen.getByText('Create "VIPs"'));

    expect(createOneRecord).toHaveBeenCalledWith({ name: 'VIPs' });
    expect(addPeopleToMessageList).toHaveBeenCalledWith({
      listId: 'list-3',
      personFilter: PERSON_FILTER,
    });
  });

  it('reports a failure', async () => {
    addPeopleToMessageList.mockRejectedValue(new Error('Network error'));
    renderPage();

    await userEvent.click(screen.getByText('Founders'));

    expect(enqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Could not add people to Founders',
    });
  });
});
