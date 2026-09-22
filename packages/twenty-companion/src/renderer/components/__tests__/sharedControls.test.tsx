// @vitest-environment jsdom
import { i18n } from '@lingui/core';
import { messages } from '../../locales/en';
import userEvent from '@testing-library/user-event';
import { MeetingRow } from '../MeetingRow';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
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

it('keeps meeting options in one keyboard-activated menu item', async () => {
  i18n.load('en', messages);
  i18n.activate('en');
  const user = userEvent.setup();
  const command = vi.fn().mockResolvedValue(undefined);
  render(
    <MeetingRow
      meeting={{
        id: 'meeting',
        title: 'Weekly sync',
        startsAt: '2026-09-22T16:00:00Z',
        endsAt: '2026-09-22T17:00:00Z',
        url: 'https://example.com/meeting',
        recordingEnabled: true,
        usesCalendarBot: false,
      }}
      skipped={false}
      isNext
      autoJoin
      now={Date.parse('2026-09-22T15:00:00Z')}
      command={command}
      isPending={() => false}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Meeting options' }));
  const item = await screen.findByRole('menuitem', { name: 'Skip auto-join' });
  expect(screen.getAllByRole('menuitem')).toHaveLength(1);
  item.focus();
  await user.keyboard('{Enter}');
  expect(command).toHaveBeenCalledExactlyOnceWith({
    type: 'skip',
    meetingId: 'meeting',
  });
});
