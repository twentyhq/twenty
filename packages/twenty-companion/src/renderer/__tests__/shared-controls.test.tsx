// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { IconSettings } from 'twenty-ui/icon';
import { IconButton } from '@ui/input/IconButton/IconButton';
import { Button } from '@ui/input/Button/Button';

afterEach(cleanup);

it('keeps a native accessible name on composed icon buttons', () => {
  render(<IconButton Icon={IconSettings} aria-label="Open settings" />);
  expect(screen.getByRole('button', { name: 'Open settings' })).toBeDefined();
});

it('keeps the legacy accessible name when both name props are supplied', () => {
  render(
    <IconButton
      Icon={IconSettings}
      ariaLabel="Settings"
      aria-label="Native label"
    />,
  );
  expect(screen.getByRole('button', { name: 'Settings' })).toBeDefined();
});

it('places the disclosure state on the actual button', () => {
  render(<Button title="See more" ariaExpanded={false} />);
  expect(
    screen
      .getByRole('button', { name: /See more/ })
      .getAttribute('aria-expanded'),
  ).toBe('false');
});
