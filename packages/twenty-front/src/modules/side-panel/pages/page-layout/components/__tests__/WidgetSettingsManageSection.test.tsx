import { WidgetSettingsManageSection } from '@/side-panel/pages/page-layout/components/WidgetSettingsManageSection';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

const mockNavigatePageLayoutSidePanel = jest.fn();
const mockUseAtomComponentStateValue = jest.fn();
let mockPageLayoutType = PageLayoutType.DASHBOARD;

jest.mock('@/command-menu/components/CommandMenuItem', () => ({
  CommandMenuItem: ({
    label,
    onClick,
  }: {
    label: ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{label}</button>,
}));

jest.mock('@/command-menu/components/CommandMenuItemDropdown', () => ({
  CommandMenuItemDropdown: ({ label }: { label: ReactNode }) => (
    <div>{label}</div>
  ),
}));

jest.mock('@/page-layout/hooks/useDeletePageLayoutWidget', () => ({
  useDeletePageLayoutWidget: () => ({
    deletePageLayoutWidget: jest.fn(),
  }),
}));

jest.mock('@/page-layout/hooks/useResetPageLayoutWidgetToDefault', () => ({
  useResetPageLayoutWidgetToDefault: () => ({
    resetPageLayoutWidgetToDefault: jest.fn(),
  }),
}));

jest.mock('@/side-panel/components/SidePanelGroup', () => ({
  SidePanelGroup: ({ children }: { children: ReactNode }) => children,
}));

jest.mock(
  '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityDropdownContent',
  () => ({
    WidgetVisibilityDropdownContent: () => null,
  }),
);

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useTranslatedVisibilityLabel',
  () => ({
    useTranslatedVisibilityLabel: () => 'Always',
  }),
);

jest.mock('@/side-panel/pages/page-layout/hooks/useWidgetInEditMode', () => ({
  useWidgetInEditMode: () => ({
    widgetInEditMode: {
      applicationId: null,
      conditionalAvailabilityExpression: null,
    },
  }),
}));

jest.mock('@/ui/layout/dropdown/components/DropdownContent', () => ({
  DropdownContent: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/ui/layout/modal/components/ConfirmationModal', () => ({
  ConfirmationModal: () => null,
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({ openModal: jest.fn() }),
}));

jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: ReactNode }) => children,
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (...args: unknown[]) =>
      mockUseAtomComponentStateValue(...args),
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({
    workspaceCustomApplication: { id: 'custom-application-id' },
  }),
}));

jest.mock('twenty-ui/surfaces', () => ({
  AppTooltip: () => null,
}));

const renderWidgetSettingsManageSection = () =>
  render(
    <I18nProvider i18n={i18n}>
      <WidgetSettingsManageSection pageLayoutId="page-layout-id" />
    </I18nProvider>,
  );

describe('WidgetSettingsManageSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPageLayoutType = PageLayoutType.DASHBOARD;
    mockUseAtomComponentStateValue.mockImplementation((componentState) =>
      componentState === pageLayoutDraftComponentState
        ? { type: mockPageLayoutType }
        : 'widget-id',
    );
  });

  it('routes dashboard widget replacement to the dashboard widget picker', async () => {
    mockPageLayoutType = PageLayoutType.DASHBOARD;
    const user = userEvent.setup();

    renderWidgetSettingsManageSection();
    await user.click(screen.getByRole('button', { name: 'Replace widget' }));

    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
    });
  });

  it('routes record-page widget replacement to the record-page widget picker', async () => {
    mockPageLayoutType = PageLayoutType.RECORD_PAGE;
    const user = userEvent.setup();

    renderWidgetSettingsManageSection();
    await user.click(screen.getByRole('button', { name: 'Replace widget' }));

    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    });
  });
});
