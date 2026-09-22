import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestionRow } from '@/ui/suggestion/components/SuggestionRow';

it('selects a suggestion without moving focus away from its editor', async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  const onSubmit = jest.fn((event) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <input aria-label="Editor" />
      <SuggestionRow selected onSelect={onSelect}>
        Jane
      </SuggestionRow>
    </form>,
  );
  await user.click(screen.getByRole('textbox', { name: 'Editor' }));
  await user.click(screen.getByRole('button', { name: 'Jane' }));
  expect(screen.getByRole('textbox', { name: 'Editor' })).toHaveFocus();
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSubmit).not.toHaveBeenCalled();
});

it('activates with Enter and Space without also invoking host keyboard navigation', async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  const onHostKeyDown = jest.fn();
  render(
    <div onKeyDown={onHostKeyDown}>
      <SuggestionRow onSelect={onSelect}>jane@example.com</SuggestionRow>
    </div>,
  );
  await user.tab();
  onHostKeyDown.mockClear();
  await user.keyboard('{Enter}');
  expect(onSelect).toHaveBeenCalledTimes(1);
  await user.keyboard(' ');
  expect(onSelect).toHaveBeenCalledTimes(2);
  expect(onHostKeyDown).not.toHaveBeenCalled();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
