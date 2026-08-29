import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { SidePanelPathUrlSyncEffect } from '@/side-panel/routing/components/SidePanelPathUrlSyncEffect';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';
const OBJECT_PATH = '/settings/objects/companies';

const openRoutedPageInSidePanelMock = jest.fn();

jest.mock('@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel', () => ({
  useOpenRoutedPageInSidePanel: () => ({
    openRoutedPageInSidePanel: openRoutedPageInSidePanelMock,
  }),
}));

const LocationSearch = () => <div>search:{useLocation().search}</div>;

const renderSyncEffect = ({
  initialEntry,
  sidePanelPage,
  routedPath,
}: {
  initialEntry: string;
  sidePanelPage: SidePanelPages;
  routedPath: string | null;
}) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(sidePanelPageState.atom, sidePanelPage);
      store.set(sidePanelPageInfoState.atom, {
        title: '',
        Icon: undefined,
        instanceId: PAGE_INSTANCE_ID,
      });
      store.set(
        sidePanelRoutedPagePathComponentState.atomFamily({
          instanceId: PAGE_INSTANCE_ID,
        }),
        routedPath,
      );
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <MemoryRouter initialEntries={[initialEntry]}>
        {children}
        <LocationSearch />
      </MemoryRouter>
    </BaseWrapper>
  );

  return render(<SidePanelPathUrlSyncEffect />, { wrapper });
};

describe('SidePanelPathUrlSyncEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should put the hosted path in the url', () => {
    renderSyncEffect({
      initialEntry: '/chat',
      sidePanelPage: SidePanelPages.RoutedPage,
      routedPath: OBJECT_PATH,
    });

    expect(
      screen.getByText(`search:?panel=${encodeURIComponent(OBJECT_PATH)}`),
    ).toBeInTheDocument();
  });

  it('should drop the param when the panel shows a page that has no url', () => {
    renderSyncEffect({
      initialEntry: `/chat?panel=${encodeURIComponent(OBJECT_PATH)}`,
      sidePanelPage: SidePanelPages.AskAI,
      routedPath: null,
    });

    expect(screen.getByText('search:')).toBeInTheDocument();
  });

  it('should reopen the hosted path the url names', () => {
    renderSyncEffect({
      initialEntry: `/chat?panel=${encodeURIComponent(OBJECT_PATH)}`,
      sidePanelPage: SidePanelPages.CommandMenuDisplay,
      routedPath: null,
    });

    expect(openRoutedPageInSidePanelMock).toHaveBeenCalledWith({
      path: OBJECT_PATH,
    });
  });
});
