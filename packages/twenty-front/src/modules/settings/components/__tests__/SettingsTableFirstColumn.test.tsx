import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { SettingsTableFirstColumn } from '@/settings/components/SettingsTableFirstColumn';
import { Checkbox } from 'twenty-ui/input';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const LABEL = 'Documentation https://example.com';

describe('SettingsTableFirstColumn', () => {
  it('keeps URL-like labels as plain text inside linked rows', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TableRow to="/settings/api-keys/key-id">
          <SettingsTableFirstColumn
            label={LABEL}
            leadingContent={<span aria-hidden="true">Icon</span>}
          />
        </TableRow>
        <button>Next action</button>
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: LABEL })).toHaveAttribute(
      'href',
      '/settings/api-keys/key-id',
    );

    await user.tab();
    expect(screen.getByRole('link', { name: LABEL })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next action' })).toHaveFocus();
  });

  it('preserves row clicks for URL-like labels', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <TableRow onClick={onClick}>
        <SettingsTableFirstColumn label={LABEL} />
      </TableRow>,
    );

    await user.click(screen.getByText(LABEL));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('allows standalone labels to opt into keyboard focus', async () => {
    const user = userEvent.setup();

    render(
      <SettingsTableFirstColumn
        label="Record sharing"
        tooltipContent="IS_RECORD_SHARING_ENABLED"
        isFocusable
      />,
    );

    await user.tab();
    expect(screen.getByText('Record sharing')).toHaveFocus();
  });
  it('keeps selection outside the name and prevents selection clicks opening the row', async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();
    const onCheckedChange = jest.fn();

    render(
      <TableRow gridTemplateColumns="32px minmax(0, 1fr)" onClick={onRowClick}>
        <TableCell onClick={(event) => event.stopPropagation()}>
          <Checkbox aria-label="Select job" onCheckedChange={onCheckedChange} />
        </TableCell>
        <TableCell>
          <SettingsTableFirstColumn label="Import contacts" />
        </TableCell>
      </TableRow>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Select job' });
    await user.tab();
    expect(checkbox).toHaveFocus();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
    await user.click(screen.getByText('Import contacts'));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});
