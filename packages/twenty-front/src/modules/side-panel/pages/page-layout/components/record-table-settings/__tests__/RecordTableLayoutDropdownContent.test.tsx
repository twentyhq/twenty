import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import { RecordTableLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableLayoutDropdownContent';
import { ViewType } from '~/generated-metadata/graphql';

const OBJECT_METADATA_ID = '11111111-1111-4111-8111-111111111111';

const mockHandleLayoutChange = jest.fn();
const mockCloseDropdown = jest.fn();
const mockUseIsFeatureEnabled = jest.fn();
const mockIsAvailableAsGroupByField = jest.fn();
const mockIsAvailableAsCalendarField = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: jest.fn(() => ({
    objectMetadataItems: [
      { id: OBJECT_METADATA_ID, readableFields: [{ id: 'field-id' }] },
    ],
  })),
}));
jest.mock(
  '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField',
  () => ({
    isFieldMetadataItemAvailableAsCalendarField: (...args: unknown[]) =>
      mockIsAvailableAsCalendarField(...args),
  }),
);
jest.mock(
  '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField',
  () => ({
    isFieldMetadataItemAvailableAsWidgetGroupByField: (...args: unknown[]) =>
      mockIsAvailableAsGroupByField(...args),
  }),
);
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks',
  () => ({
    useRecordTableWidgetLayoutCallbacks: jest.fn(() => ({
      handleLayoutChange: mockHandleLayoutChange,
    })),
  }),
);
jest.mock('@/ui/layout/dropdown/components/DropdownMenuItemsContainer', () => ({
  DropdownMenuItemsContainer: ({ children }: { children: React.ReactNode }) =>
    children,
}));
jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: jest.fn(() => ({ closeDropdown: mockCloseDropdown })),
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableList', () => ({
  SelectableList: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: jest.fn(() => 'dropdown-id'),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: jest.fn(() => null),
  }),
);
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: (...args: unknown[]) => mockUseIsFeatureEnabled(...args),
}));
jest.mock('twenty-ui/navigation', () => ({
  MenuItemSelect: ({
    contextualText,
    disabled,
    onClick,
    selected,
    text,
  }: {
    contextualText?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    selected: boolean;
    text: string;
  }) => (
    <button data-selected={selected} disabled={disabled} onClick={onClick}>
      <span>{text}</span>
      {contextualText}
    </button>
  ),
}));

const renderDropdown = (
  currentLayoutViewType = ViewType.TABLE_WIDGET as never,
) =>
  render(
    <I18nProvider i18n={i18n}>
      <RecordTableLayoutDropdownContent
        pageLayoutId="page-layout-id"
        widgetId="widget-id"
        objectMetadataId={OBJECT_METADATA_ID}
        currentLayoutViewType={currentLayoutViewType}
      />
    </I18nProvider>,
  );

const layoutLabels = () =>
  screen
    .getAllByRole('button')
    .map((button) => button.querySelector('span')?.textContent);

describe('RecordTableLayoutDropdownContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsFeatureEnabled.mockReturnValue(true);
    mockIsAvailableAsGroupByField.mockReturnValue(true);
    mockIsAvailableAsCalendarField.mockReturnValue(true);
  });

  it('should offer every layout in picker order', () => {
    renderDropdown();

    expect(layoutLabels()).toEqual(['Table', 'Kanban', 'List', 'Calendar']);
  });

  it('should hide the list layout while the feature flag is off', () => {
    mockUseIsFeatureEnabled.mockReturnValue(false);

    renderDropdown();

    expect(layoutLabels()).toEqual(['Table', 'Kanban', 'Calendar']);
  });

  it('should mark the current layout as selected', () => {
    renderDropdown(ViewType.LIST_WIDGET as never);

    expect(screen.getByText('List').closest('button')?.dataset.selected).toBe(
      'true',
    );
    expect(screen.getByText('Table').closest('button')?.dataset.selected).toBe(
      'false',
    );
  });

  it('should switch the widget to the picked layout and close the dropdown', () => {
    renderDropdown();

    fireEvent.click(screen.getByText('List').closest('button') as HTMLElement);

    expect(mockHandleLayoutChange).toHaveBeenCalledWith(
      expect.objectContaining({ targetViewType: ViewType.LIST_WIDGET }),
    );
    expect(mockCloseDropdown).toHaveBeenCalled();
  });

  it.each([
    ['Kanban', 'Needs a Select field', mockIsAvailableAsGroupByField],
    ['Calendar', 'Needs a Date field', mockIsAvailableAsCalendarField],
  ])(
    'should keep %s visible but disabled with its reason when unavailable',
    (label, reason, availability) => {
      availability.mockReturnValue(false);

      renderDropdown();

      const button = screen.getByText(label).closest('button');

      expect(button).toBeDisabled();
      expect(button?.textContent).toContain(reason);

      fireEvent.click(button as HTMLElement);

      expect(mockHandleLayoutChange).not.toHaveBeenCalled();
    },
  );
});
