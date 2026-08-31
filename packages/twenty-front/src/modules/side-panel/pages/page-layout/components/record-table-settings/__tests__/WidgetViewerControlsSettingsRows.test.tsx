import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import { WidgetViewerControlsSettingsRows } from '@/side-panel/pages/page-layout/components/record-table-settings/WidgetViewerControlsSettingsRows';

jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/command-menu/components/CommandMenuItemToggle', () => ({
  CommandMenuItemToggle: ({
    text,
    toggled,
    onToggleChange,
  }: {
    text: string;
    toggled: boolean;
    onToggleChange: (toggled: boolean) => void;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={toggled}
      onClick={() => onToggleChange(!toggled)}
    >
      {text}
    </button>
  ),
}));

describe('WidgetViewerControlsSettingsRows', () => {
  it('shows the persisted values and reports each toggle independently', () => {
    const onViewerControlsChange = jest.fn();

    render(
      <I18nProvider i18n={i18n}>
        <WidgetViewerControlsSettingsRows
          viewerControls={{ filter: true, sort: false }}
          onViewerControlsChange={onViewerControlsChange}
        />
      </I18nProvider>,
    );

    const filterToggle = screen.getByRole('switch', { name: 'Show filter' });
    const sortToggle = screen.getByRole('switch', { name: 'Show sort' });

    expect(filterToggle).toBeChecked();
    expect(sortToggle).not.toBeChecked();

    fireEvent.click(filterToggle);
    fireEvent.click(sortToggle);

    expect(onViewerControlsChange).toHaveBeenNthCalledWith(1, {
      filter: false,
      sort: false,
    });
    expect(onViewerControlsChange).toHaveBeenNthCalledWith(2, {
      filter: true,
      sort: true,
    });
  });

  it('hides the sort setting when sorting is unavailable', () => {
    render(
      <I18nProvider i18n={i18n}>
        <WidgetViewerControlsSettingsRows
          isSortAvailable={false}
          onViewerControlsChange={jest.fn()}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole('switch', { name: 'Show filter' })).toBeVisible();
    expect(
      screen.queryByRole('switch', { name: 'Show sort' }),
    ).not.toBeInTheDocument();
  });
});
