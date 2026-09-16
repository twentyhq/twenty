// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { IconSettings } from 'twenty-ui/icon';
import { IconButton } from '@ui/components/IconButton/IconButton';
import { Button } from '@ui/primitives/input/Button/Button';

afterEach(cleanup);

it('keeps a native accessible name on composed icon buttons', () => {
  render(
    <IconButton aria-label="Open settings">
      <IconSettings />
    </IconButton>,
  );
  expect(screen.getByRole('button', { name: 'Open settings' })).toBeDefined();
});

it('places the disclosure state on the actual button', () => {
  render(<Button aria-expanded={false}>See more</Button>);
  expect(
    screen
      .getByRole('button', { name: /See more/ })
      .getAttribute('aria-expanded'),
  ).toBe('false');
});
