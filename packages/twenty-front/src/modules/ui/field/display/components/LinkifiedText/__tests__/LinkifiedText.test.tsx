import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LinkifiedText } from '@/ui/field/display/components/LinkifiedText/LinkifiedText';

it('keeps field URL navigation explicit and separate from its row action', async () => {
  const user = userEvent.setup();
  const onClick = jest.fn();

  render(
    <div onClick={onClick}>
      <LinkifiedText text="Read https://twenty.com/docs today" />
    </div>,
  );

  const link = screen.getByRole('link', { name: 'https://twenty.com/docs' });
  expect(link).toHaveAttribute('href', 'https://twenty.com/docs');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');

  await user.click(link);

  expect(onClick).not.toHaveBeenCalled();
});
