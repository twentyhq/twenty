import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { widgetCreationTargetTabIdComponentState } from '@/page-layout/states/widgetCreationTargetTabIdComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SidePanelPageLayoutRecordPageWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutRecordPageWidgetTypeSelect';
import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import type * as TwentyIcons from 'twenty-ui/icon';
import type * as RecordTableWidgetLayoutPickerOptions from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { ViewType } from '~/generated-metadata/graphql';

const mockNavigatePageLayoutSidePanel = jest.fn();

jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual<typeof TwentyIcons>('twenty-ui/icon'),
  IconListDetails: () => <svg role="img" aria-label="Fields group icon" />,
  IconListSearch: () => <svg role="img" aria-label="Field icon" />,
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: { frontComponents: [] } }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: { id: 'company' } }),
}));

jest.mock(
  '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields',
  () => ({
    useFieldWidgetEligibleFields: () => [],
  }),
);

const mockCreateRecordPageRelatedRecordsWidget = jest.fn(() => ({
  id: 'new-related-records',
}));

jest.mock('@/page-layout/hooks/useCreateRecordPageRelatedRecordsWidget', () => {
  const { getRecordTableWidgetLayoutPickerOptions } = jest.requireActual<
    typeof RecordTableWidgetLayoutPickerOptions
  >(
    '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions',
  );

  return {
    useCreateRecordPageRelatedRecordsWidget: () => ({
      createRecordPageRelatedRecordsWidget:
        mockCreateRecordPageRelatedRecordsWidget,
      relatedRecordsLayoutOptions: getRecordTableWidgetLayoutPickerOptions({
        isKanbanAvailable: true,
        isCalendarAvailable: false,
      }),
    }),
  };
});

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

jest.mock('@/side-panel/components/SidePanelList', () => ({
  SidePanelList: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@/side-panel/components/SidePanelGroup', () => ({
  SidePanelGroup: ({
    heading,
    children,
  }: {
    heading: string;
    children: ReactNode;
  }) => (
    <section>
      <h2>{heading}</h2>
      {children}
    </section>
  ),
}));

jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/command-menu/components/CommandMenuItem', () => ({
  CommandMenuItem: ({
    label,
    onClick,
    Icon,
    disabled,
  }: {
    label: string;
    onClick: () => void;
    Icon: IconComponent;
    disabled?: boolean;
  }) => (
    <button aria-label={label} onClick={onClick} disabled={disabled}>
      <Icon />
      {label}
    </button>
  ),
}));

describe('SidePanelPageLayoutRecordPageWidgetTypeSelect', () => {
  beforeEach(() => jest.clearAllMocks());

  const renderWidgetTypeSelect = () => {
    const store = createStore();
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      makeDraft([makeTab('tab-1', [])]),
    );
    store.set(
      widgetCreationTargetTabIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      'tab-1',
    );

    render(
      <PageLayoutTestWrapper store={store}>
        <PageLayoutSidePanelTargetContext.Provider
          value={{
            pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
            targetRecordIdentifier: {
              id: 'company-record-id',
              targetObjectNameSingular: 'company',
            },
          }}
        >
          <SidePanelPageLayoutRecordPageWidgetTypeSelect />
        </PageLayoutSidePanelTargetContext.Provider>
      </PageLayoutTestWrapper>,
    );
  };

  it('groups the widgets of this record apart from its related records', () => {
    renderWidgetTypeSelect();

    expect(
      screen.getByRole('heading', { name: 'This record' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Widget type')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Fields group' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Field' })).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Fields group icon' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Field icon' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Related records' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Table' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'List' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Calendar' })).toBeDisabled();
  });

  it('creates related records in the picked layout', async () => {
    renderWidgetTypeSelect();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Kanban' }));

    expect(mockCreateRecordPageRelatedRecordsWidget).toHaveBeenCalledTimes(1);
    expect(mockCreateRecordPageRelatedRecordsWidget).toHaveBeenCalledWith({
      tabId: 'tab-1',
      positionIndex: undefined,
      layoutViewType: ViewType.KANBAN_WIDGET,
    });
  });
});
