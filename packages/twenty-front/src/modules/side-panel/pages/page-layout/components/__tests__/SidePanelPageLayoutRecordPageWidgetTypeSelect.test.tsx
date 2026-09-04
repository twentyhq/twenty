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
import { render, screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import type * as TwentyIcons from 'twenty-ui/icon';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

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

jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      objectNameSingular: 'company',
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
  }: {
    label: string;
    onClick: () => void;
    Icon: IconComponent;
  }) => (
    <button aria-label={label} onClick={onClick}>
      <Icon />
      {label}
    </button>
  ),
}));

describe('SidePanelPageLayoutRecordPageWidgetTypeSelect', () => {
  beforeEach(() => jest.clearAllMocks());

  it('labels standard widgets and distinguishes a fields group from a single field', () => {
    const store = createStore();
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      makeDraft([makeTab('tab-1', [])]),
    );
    store.set(
      widgetCreationTargetTabIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      'tab-1',
    );

    render(
      <PageLayoutTestWrapper store={store}>
        <SidePanelPageLayoutRecordPageWidgetTypeSelect />
      </PageLayoutTestWrapper>,
    );

    expect(
      screen.getByRole('heading', { name: 'Standard widgets' }),
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
  });
});
