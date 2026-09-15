import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconDownload } from 'twenty-ui/icon';

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
      progress={42}
    />,
  );
  const button = screen.getByRole('button', { name: 'Export' });
  expect(button).toBeDisabled();
  expect(button).toHaveTextContent('42%');
  await userEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
  rerender(<CommandMenuButton command={command} onClick={onClick} />);
  expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
  await userEvent.click(screen.getByRole('button', { name: 'Export' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});
