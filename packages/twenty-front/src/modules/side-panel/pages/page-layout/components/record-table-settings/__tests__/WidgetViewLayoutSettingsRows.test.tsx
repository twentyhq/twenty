import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { WidgetViewLayoutSettingsRows } from '@/side-panel/pages/page-layout/components/record-table-settings/WidgetViewLayoutSettingsRows';
import { ViewType } from '~/generated-metadata/graphql';

const mockUseRecordTableWidgetViewForDisplay = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: jest.fn(() => ({ objectMetadataItems: [] })),
}));
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks',
  () => ({
    useRecordTableWidgetLayoutCallbacks: jest.fn(() => ({
      handleShouldHideEmptyGroupsChange: jest.fn(),
    })),
  }),
);
jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay',
  () => ({
    useRecordTableWidgetViewForDisplay: () =>
      mockUseRecordTableWidgetViewForDisplay(),
  }),
);
jest.mock(
  '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableCalendarFieldDropdownContent',
  () => ({ RecordTableCalendarFieldDropdownContent: () => null }),
);
jest.mock(
  '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableCalendarLayoutDropdownContent',
  () => ({ RecordTableCalendarLayoutDropdownContent: () => null }),
);
jest.mock(
  '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableGroupByDropdownContent',
  () => ({ RecordTableGroupByDropdownContent: () => null }),
);
jest.mock(
  '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableLayoutDropdownContent',
  () => ({ RecordTableLayoutDropdownContent: () => null }),
);
jest.mock('@/ui/layout/dropdown/components/DropdownContent', () => ({
  DropdownContent: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(() => false),
}));
jest.mock('@/command-menu/components/CommandMenuItemToggle', () => ({
  CommandMenuItemToggle: () => null,
}));
jest.mock('@/command-menu/components/CommandMenuItemDropdown', () => ({
  CommandMenuItemDropdown: ({
    Icon,
    label,
    description,
  }: {
    Icon?: { displayName?: string; name?: string };
    label: string;
    description?: React.ReactNode;
  }) => (
    <div data-testid={`row-${label}`}>
      <span data-icon={Icon?.displayName ?? Icon?.name ?? 'unknown'} />
      <span>{description}</span>
    </div>
  ),
}));

const renderLayoutRows = (widgetViewType: ViewType) => {
  mockUseRecordTableWidgetViewForDisplay.mockReturnValue({
    view: { id: 'view-id', type: widgetViewType },
  });

  render(
    <I18nProvider i18n={i18n}>
      <WidgetViewLayoutSettingsRows
        pageLayoutId="page-layout-id"
        widgetId="widget-id"
        objectMetadataId="object-metadata-id"
        viewId="view-id"
      />
    </I18nProvider>,
  );

  return screen.getByTestId('row-Layout');
};

describe('WidgetViewLayoutSettingsRows', () => {
  beforeEach(() => jest.clearAllMocks());

  // The layout row used to fall through to Table for anything that was not
  // kanban or calendar, so a list widget described itself as a table.
  it.each([
    [ViewType.TABLE_WIDGET, 'Table', 'Table'],
    [ViewType.KANBAN_WIDGET, 'Kanban', 'LayoutKanban'],
    [ViewType.LIST_WIDGET, 'List', 'List'],
    [ViewType.CALENDAR_WIDGET, 'Calendar', 'Calendar'],
  ])(
    'should describe a %s widget with its own label and icon',
    (widgetViewType, expectedLabel, expectedIcon) => {
      const layoutRow = renderLayoutRows(widgetViewType);

      expect(layoutRow).toHaveTextContent(expectedLabel);
      expect(
        layoutRow.querySelector('[data-icon]')?.getAttribute('data-icon'),
      ).toBe(expectedIcon);
    },
  );
});
