// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { i18n } from '@lingui/core';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';
import { createInitialState } from '../../../shared/utils/createInitialState';
import { messages } from '../../locales/en';
import { Settings } from '../Settings';
import { IconSettings } from 'twenty-ui/icon';
import { IconButton } from '@ui/components/input/IconButton/IconButton';
import { Button } from '@ui/primitives/input/Button/Button';

beforeEach(() => {
  i18n.load('en', messages);
  i18n.activate('en');
});
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

it('saves appearance as a single choice and reflects the confirmed setting', async () => {
  const state = createInitialState();
  const command = vi.fn().mockResolvedValue(undefined);
  const { rerender } = render(
    <ThemeProvider colorScheme="light">
      <Settings state={state} command={command} isPending={() => false} />
    </ThemeProvider>,
  );
  const dark = screen.getByRole('radio', { name: 'Dark' });
  await userEvent.setup().click(dark);
  expect(command).toHaveBeenCalledExactlyOnceWith({
    type: 'settings',
    settings: { appearance: 'dark' },
  });
  expect(
    screen.getByRole('radio', { name: 'System' }).getAttribute('aria-checked'),
  ).toBe('true');

  rerender(
    <ThemeProvider colorScheme="light">
      <Settings
        state={{
          ...state,
          settings: { ...state.settings, appearance: 'dark' },
        }}
        command={command}
        isPending={() => false}
      />
    </ThemeProvider>,
  );
  expect(dark.getAttribute('aria-checked')).toBe('true');
});

it('blocks all appearance choices while settings are pending', async () => {
  const command = vi.fn().mockResolvedValue(undefined);
  render(
    <ThemeProvider colorScheme="light">
      <Settings
        state={createInitialState()}
        command={command}
        isPending={() => true}
      />
    </ThemeProvider>,
  );
  for (const choice of screen.getAllByRole<HTMLButtonElement>('radio')) {
    expect(choice.disabled).toBe(true);
  }
  await userEvent.setup().click(screen.getByRole('radio', { name: 'Dark' }));
  expect(command).not.toHaveBeenCalled();
});
