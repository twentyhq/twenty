import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { IconSearch } from 'twenty-ui/icon';

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
