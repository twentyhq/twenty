import { describe, expect, it } from 'vitest';
import { shortcutFromKeyboardEvent } from '../shortcutFromKeyboardEvent';

const key = {
  key: 'a',
  code: 'KeyA',
  repeat: false,
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
};

describe('shortcut capture', () => {
  it.each([
    [{ ...key, metaKey: true, shiftKey: true }, 'Command+Shift+A'],
    [
      { ...key, ctrlKey: true, altKey: true, code: 'Digit4', key: '4' },
      'Control+Alt+4',
    ],
    [{ ...key, altKey: true, code: 'Space', key: ' ' }, 'Alt+Space'],
    [{ ...key, ctrlKey: true, code: 'F12', key: 'F12' }, 'Control+F12'],
    [
      { ...key, ctrlKey: true, code: 'F12', key: 'Unidentified' },
      'Control+F12',
    ],
    [{ ...key, metaKey: true, key: 'q' }, 'Command+A'],
  ])('creates an Electron accelerator from %o', (event, expected) => {
    expect(shortcutFromKeyboardEvent(event)).toBe(expected);
  });
  it.each([
    key,
    { ...key, shiftKey: true },
    { ...key, metaKey: true, repeat: true },
    { ...key, metaKey: true, key: 'Escape', code: 'Escape' },
    { ...key, metaKey: true, key: 'Meta', code: 'MetaLeft' },
  ])('ignores unsupported or incomplete combinations: %o', (event) => {
    expect(shortcutFromKeyboardEvent(event)).toBeNull();
  });
});
