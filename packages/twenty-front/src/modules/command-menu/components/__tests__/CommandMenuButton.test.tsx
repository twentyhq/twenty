import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { IconDownload, IconSearch } from 'twenty-ui/icon';

describe('CommandMenuButton', () => {
  it.each([
    {
      variant: 'labeled button',
      shortLabel: 'Search',
      to: undefined,
      role: 'button',
    },
    {
      variant: 'labeled link',
      shortLabel: 'Search',
      to: '/search',
      role: 'link',
    },
    {
      variant: 'icon button',
      shortLabel: undefined,
      to: undefined,
      role: 'button',
    },
  ])(
    'shows the shortcut when tabbing to the $variant',
    async ({ shortLabel, to, role }) => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <CommandMenuButton
            command={{
              key: 'search',
              label: 'Search records',
              shortLabel,
              Icon: IconSearch,
              hotKeys: ['/'],
            }}
            to={to}
          />
        </MemoryRouter>,
      );

      await user.tab();

      expect(screen.getByRole(role, { name: 'Search records' })).toHaveFocus();
      expect(
        await screen.findByRole('tooltip', {}, { timeout: 2000 }),
      ).toHaveTextContent('Search records (/)');
    },
  );
});

it('shows a disabled percentage button during export and restores the action afterward', async () => {
  const onClick = jest.fn();
  const command = {
    key: 'export',
    label: 'Export',
    shortLabel: 'Export',
    Icon: IconDownload,
  };
  const { rerender } = render(
    <CommandMenuButton
      command={command}
      onClick={onClick}
      disabled
      loading
      progress={0}
    />,
  );
  const button = screen.getByRole('button', { name: 'Export' });
  expect(button).toBeDisabled();
  expect(button).toHaveTextContent('Preparing…');
  rerender(
    <CommandMenuButton
      command={command}
      onClick={onClick}
      disabled
      loading
      progress={42}
    />,
  );
  expect(button).toHaveTextContent('42%');
  await userEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
  rerender(<CommandMenuButton command={command} onClick={onClick} />);
  expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
  await userEvent.click(screen.getByRole('button', { name: 'Export' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});
