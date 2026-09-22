import { Provider, createStore } from 'jotai';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RecordViewsList } from '@/side-panel/pages/record-views/components/RecordViewsList';
import { useRecordViews } from '@/side-panel/pages/record-views/hooks/useRecordViews';
import { type View } from '@/views/types/View';
import { ViewType, ViewVisibility } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockNavigate = jest.fn();
const mockClose = jest.fn();
const mockRetry = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockClose }),
}));
jest.mock('@/side-panel/pages/record-views/hooks/useRecordViews');
jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem }),
}));

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const view: View = {
  id: 'pipeline',
  name: 'Sales pipeline',
  type: ViewType.KANBAN,
  objectMetadataId: objectMetadataItem.id,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  shouldHideEmptyGroups: false,
  position: 0,
  icon: 'IconLayoutKanban',
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
};
const mockResult = {
  views: [view],
  loading: false,
  error: false,
  retry: mockRetry,
};
const renderList = () => {
  const store = createStore();
  store.set(focusStackState.atom, [
    {
      focusId: SIDE_PANEL_FOCUS_ID,
      componentInstance: {
        componentType: FocusComponentType.SIDE_PANEL,
        componentInstanceId: 'side-panel',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: true,
      },
    },
  ]);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RecordViewsList objectNameSingular="company" />
      </MemoryRouter>
    </Provider>,
  );
};

describe('RecordViewsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRecordViews).mockReturnValue(mockResult);
  });

  it('opens the chosen view and closes the picker', async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(screen.getByText('Sales pipeline'));
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/objects/companies?viewId=pipeline',
    );
  });

  it('opens the selected view with Enter', async () => {
    const user = userEvent.setup();
    renderList();
    await user.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith(
      '/objects/companies?viewId=pipeline',
    );
  });

  it('shows loading without prematurely claiming there are no matches', () => {
    jest
      .mocked(useRecordViews)
      .mockReturnValue({ ...mockResult, views: [], loading: true });
    renderList();
    expect(
      screen.queryByText('No views contain this record'),
    ).not.toBeInTheDocument();
  });

  it('shows an empty state when no view matches', () => {
    jest.mocked(useRecordViews).mockReturnValue({ ...mockResult, views: [] });
    renderList();
    expect(screen.getByText('No views contain this record')).toBeVisible();
  });

  it('lets the user retry a failed check', async () => {
    jest
      .mocked(useRecordViews)
      .mockReturnValue({ ...mockResult, views: [], error: true });
    const user = userEvent.setup();
    renderList();
    expect(screen.getByText('Unable to load views')).toBeVisible();
    expect(
      screen.queryByText('No views contain this record'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByText('Try again'));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});
