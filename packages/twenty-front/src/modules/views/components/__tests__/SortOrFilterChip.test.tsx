import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';

const renderInI18n = (children: React.ReactNode) =>
  render(<I18nProvider i18n={i18n}>{children}</I18nProvider>);

describe('SortOrFilterChip', () => {
  it('renders the label as a button when onClick is provided', () => {
    const onClick = jest.fn();

    renderInI18n(
      <SortOrFilterChip
        type="filter"
        labelValue="Acme"
        onRemove={jest.fn()}
        onClick={onClick}
      />,
    );

    const labelButton = screen.getByRole('button', { name: 'Acme' });
    fireEvent.click(labelButton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render the label as a button when it is not interactive', () => {
    renderInI18n(
      <SortOrFilterChip type="filter" labelValue="Acme" onRemove={jest.fn()} />,
    );

    const buttons = screen.getAllByRole('button');

    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAccessibleName('Remove filter');
  });

  it('exposes a translated remove control that triggers onRemove', () => {
    const onRemove = jest.fn();

    renderInI18n(
      <SortOrFilterChip type="sort" labelValue="Name" onRemove={onRemove} />,
    );

    const removeButton = screen.getByRole('button', { name: 'Remove sort' });
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not propagate remove clicks to ancestors', () => {
    const onAncestorClick = jest.fn();

    renderInI18n(
      <div onClick={onAncestorClick}>
        <SortOrFilterChip
          type="filter"
          labelValue="Acme"
          onRemove={jest.fn()}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(onAncestorClick).not.toHaveBeenCalled();
  });

  it('exposes dropdown trigger semantics when rendered inside a dropdown', () => {
    const onClick = jest.fn();

    renderInI18n(
      <DropdownComponentInstanceContext.Provider
        value={{ instanceId: 'filter-chip-dropdown' }}
      >
        <SortOrFilterChip
          type="filter"
          labelValue="Acme"
          onRemove={jest.fn()}
          onClick={onClick}
        />
      </DropdownComponentInstanceContext.Provider>,
    );

    const labelButton = screen.getByRole('button', { name: 'Acme' });

    expect(labelButton).toHaveAttribute('aria-haspopup', 'listbox');
    expect(labelButton).toHaveAttribute('aria-expanded', 'false');
    expect(labelButton).toHaveAttribute(
      'aria-controls',
      'filter-chip-dropdown-options',
    );

    fireEvent.click(labelButton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
