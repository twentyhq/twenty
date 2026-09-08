import { describe, expect, it, vi } from 'vitest';
import {
  type MenuItemConstructorOptions,
  type MenuItem,
  type KeyboardEvent,
} from 'electron';
import {
  DEFAULT_SETTINGS,
  type CompanionState,
  type Meeting,
} from '../../shared/types';
import { createTrayMenuTemplate, getTrayTitle } from '../tray-menu';

const NOW = Date.parse('2026-09-07T12:00:00Z');
const state = (overrides: Partial<CompanionState> = {}): CompanionState => ({
  connection: 'connected',
  serverUrl: 'https://api.twenty.com',
  workspace: { id: 'workspace', name: 'Apple' },
  meetings: [],
  recordings: [],
  calendarConnected: true,
  detectedCalls: [],
  activeRecording: null,
  permissions: {
    microphone: 'granted',
    accessibility: 'granted',
    'system-audio': 'granted',
  },
  settings: { ...DEFAULT_SETTINGS, setupCompleted: true },
  skippedMeetingIds: [],
  updatedAt: new Date(NOW).toISOString(),
  error: null,
  notice: null,
  sdkReady: true,
  permissionSetup: null,
  ...overrides,
});
const meeting = (overrides: Partial<Meeting> = {}): Meeting => ({
  id: 'f8e44a6f-c367-4003-8ab2-1cc8a22727cb',
  title: 'Product catch-up',
  startsAt: '2026-09-07T13:00:00Z',
  endsAt: '2026-09-07T14:00:00Z',
  url: 'https://meet.google.com/example',
  recordingEnabled: true,
  usesCalendarBot: true,
  ...overrides,
});
const actions = () => ({
  command: vi.fn(),
  openApp: vi.fn(),
  setSetting: vi.fn(),
  quit: vi.fn(),
});
const select = (menu: MenuItemConstructorOptions[], label: string) => {
  const item = menu.find((entry) => entry.label === label);
  expect(item, label).toBeDefined();
  expect(item?.enabled, label).not.toBe(false);
  item?.click?.({} as MenuItem, undefined, {} as KeyboardEvent);
};

describe('native tray menu actions', () => {
  it('can hide the meeting countdown without hiding the active recording indicator', () => {
    const current = state({ meetings: [meeting()] });
    expect(getTrayTitle(current, NOW)).toBe('60m');
    current.settings.showMeetingCountdown = false;
    expect(getTrayTitle(current, NOW)).toBe('');
    current.activeRecording = {
      id: 'recording',
      windowId: 'call',
      title: 'Quick call',
      startedAt: new Date(NOW).toISOString(),
      status: 'recording',
    };
    expect(getTrayTitle(current, NOW)).toBe('●');
    current.activeRecording.status = 'paused';
    expect(getTrayTitle(current, NOW)).toBe('Paused');
  });

  it('opens setup without starting capture when permissions have not been set up', () => {
    const handlers = actions();
    const menu = createTrayMenuTemplate(
      state({ settings: DEFAULT_SETTINGS }),
      handlers,
      NOW,
    );
    select(menu, 'Continue setup…');
    expect(handlers.openApp).toHaveBeenCalledOnce();
    expect(handlers.command).not.toHaveBeenCalled();
    expect(menu.some((item) => item.label === 'New recording')).toBe(false);
  });

  it('offers connection before workspace actions when disconnected', () => {
    const handlers = actions();
    const menu = createTrayMenuTemplate(
      state({ connection: 'disconnected' }),
      handlers,
      NOW,
    );
    select(menu, 'Connect workspace…');
    expect(handlers.openApp).toHaveBeenCalledOnce();
    expect(menu.some((item) => item.label === 'Recordings…')).toBe(false);
  });

  it('routes recording and settings to the existing app commands', () => {
    const handlers = actions();
    const menu = createTrayMenuTemplate(state(), handlers, NOW);
    select(menu, 'New recording');
    select(menu, 'Settings…');
    expect(handlers.command).toHaveBeenCalledWith({ type: 'record' });
    expect(handlers.openApp.mock.calls).toEqual([['settings']]);
  });

  it('allows resume and finish while paused, and locks controls during transitions', () => {
    const handlers = actions();
    const activeRecording = {
      id: 'recording',
      windowId: 'call',
      title: 'Conversation',
      startedAt: new Date(NOW).toISOString(),
      status: 'paused' as const,
    };
    const menu = createTrayMenuTemplate(
      state({ activeRecording }),
      handlers,
      NOW,
    );
    select(menu, 'Resume recording');
    select(menu, 'Finish recording');
    expect(handlers.command.mock.calls).toEqual([
      [{ type: 'resume' }],
      [{ type: 'stop' }],
    ]);
    for (const status of [
      'starting',
      'pausing',
      'resuming',
      'stopping',
    ] as const) {
      const changing = createTrayMenuTemplate(
        state({ activeRecording: { ...activeRecording, status } }),
        handlers,
        NOW,
      );
      expect(
        changing.find((item) => item.label === 'Finish recording')?.enabled,
      ).toBe(false);
      expect(changing.some((item) => item.label === 'New recording')).toBe(
        false,
      );
    }
  });

  it('keeps join and skip tied to the selected meeting and excludes past meetings', () => {
    const handlers = actions();
    const next = meeting();
    const menu = createTrayMenuTemplate(
      state({
        meetings: [
          meeting({ title: 'Past', endsAt: '2026-09-07T11:00:00Z' }),
          next,
        ],
      }),
      handlers,
      NOW,
    );
    const submenu = menu.find((item) =>
      item.label?.includes(next.title),
    )?.submenu;
    expect(Array.isArray(submenu)).toBe(true);
    select(submenu as MenuItemConstructorOptions[], 'Join meeting');
    select(submenu as MenuItemConstructorOptions[], 'Skip auto-join');
    expect(handlers.command.mock.calls).toEqual([
      [{ type: 'join', meetingId: next.id }],
      [{ type: 'skip', meetingId: next.id }],
    ]);
    expect(menu.some((item) => item.label?.includes('Past'))).toBe(false);
    const skipped = createTrayMenuTemplate(
      state({ meetings: [next], skippedMeetingIds: [next.id] }),
      handlers,
      NOW,
    );
    const skippedSubmenu = skipped.find((item) =>
      item.label?.includes(next.title),
    )?.submenu as MenuItemConstructorOptions[];
    expect(
      skippedSubmenu.find((item) => item.label === 'Auto-join skipped')
        ?.enabled,
    ).toBe(false);
  });

  it('updates individual preferences without overwriting the rest of the settings', () => {
    const handlers = actions();
    const menu = createTrayMenuTemplate(state(), handlers, NOW);
    expect(
      menu.find((item) => item.label === 'Automatically join meetings'),
    ).toMatchObject({ type: 'checkbox', checked: true });
    select(menu, 'Automatically join meetings');
    expect(handlers.setSetting.mock.calls).toEqual([['autoJoin', false]]);
    expect(menu.some((item) => item.label === 'Launch at login')).toBe(false);
  });

  it('groups the next three events by local day with titles above their times', () => {
    const localNow = new Date(2026, 8, 7, 12).getTime();
    const at = (day: number, hour: number) =>
      new Date(2026, 8, day, hour).toISOString();
    const menu = createTrayMenuTemplate(
      state({
        meetings: [
          meeting({
            id: 'fourth',
            title: 'Later',
            startsAt: at(10, 10),
            endsAt: at(10, 11),
          }),
          meeting({
            id: 'tomorrow',
            title: 'Planning',
            startsAt: at(8, 10),
            endsAt: at(8, 11),
          }),
          meeting({
            id: 'today',
            title: 'Design sync',
            startsAt: at(7, 13),
            endsAt: at(7, 14),
          }),
          meeting({
            id: 'third',
            title: 'Review',
            startsAt: at(9, 10),
            endsAt: at(9, 11),
          }),
        ],
      }),
      actions(),
      localNow,
      { supportsHeaders: true, supportsSublabels: true },
    );
    expect(
      menu
        .filter((item) => item.type === 'header')
        .slice(0, 2)
        .map((item) => item.label),
    ).toEqual(['Today', 'Tomorrow']);
    const events = menu.filter((item) => item.submenu);
    expect(events.map((item) => item.label)).toEqual([
      'Design sync',
      'Planning',
      'Review',
    ]);
    expect(events[0].sublabel).toContain('In 60 min');
    expect(events[0].sublabel).toContain(' – ');
    expect(events[0].accessibilityLabel).toContain('Today');
  });

  it('offers a direct join action for one imminent meeting without starting capture', () => {
    const handlers = actions();
    const next = meeting({
      startsAt: new Date(NOW + 5 * 60_000).toISOString(),
    });
    const menu = createTrayMenuTemplate(
      state({ meetings: [next] }),
      handlers,
      NOW,
    );
    select(menu, `Join ${next.title}`);
    expect(handlers.command.mock.calls).toEqual([
      [{ type: 'join', meetingId: next.id }],
    ]);
  });

  it('does not promote one event when several meetings overlap or a call is active', () => {
    const imminent = meeting({
      startsAt: new Date(NOW - 60_000).toISOString(),
    });
    for (const current of [
      state({
        meetings: [
          imminent,
          { ...imminent, id: 'other', title: 'Other meeting' },
        ],
      }),
      state({
        meetings: [imminent],
        detectedCalls: [
          { id: 'call', title: 'Live conversation', platform: 'zoom' },
        ],
      }),
    ]) {
      const menu = createTrayMenuTemplate(current, actions(), NOW);
      expect(menu.some((item) => item.label === `Join ${imminent.title}`)).toBe(
        false,
      );
    }
  });

  it('retains event times on platforms without native sublabels and marks missing links', () => {
    const current = state({
      meetings: [meeting({ url: null, recordingEnabled: false })],
    });
    const menu = createTrayMenuTemplate(current, actions(), NOW);
    const event = menu.find((item) => item.submenu);
    expect(event?.sublabel).toBeUndefined();
    expect(event?.label).toContain(' – ');
    expect(event?.label).toContain('No meeting link');
    const submenu = event?.submenu as MenuItemConstructorOptions[];
    expect(
      submenu.find((item) => item.label === 'No meeting link')?.enabled,
    ).toBe(false);
    expect(submenu.some((item) => item.label === 'Recording off')).toBe(true);
    expect(menu.some((item) => item.type === 'header')).toBe(false);
  });

  it('shows an ongoing event as Now and preserves the full title for accessibility', () => {
    const title = 'Product & Design ' + 'review '.repeat(10);
    const menu = createTrayMenuTemplate(
      state({
        meetings: [
          meeting({ title, startsAt: new Date(NOW - 60_000).toISOString() }),
        ],
      }),
      actions(),
      NOW,
      { supportsHeaders: true, supportsSublabels: true },
    );
    const event = menu.find((item) => item.submenu);
    expect(event?.sublabel).toContain('Now');
    expect(event?.label).toContain('…');
    expect(event?.label).toContain('&&');
    expect(event?.accessibilityLabel).toContain(title);
    expect(event?.toolTip).toContain(title);
  });
});
