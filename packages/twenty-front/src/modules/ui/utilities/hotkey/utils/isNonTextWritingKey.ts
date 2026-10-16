export const isNonTextWritingKey = (key: string) => {
  const nonTextWritingKeys = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Enter',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Tab',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Shift',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Escape',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Delete',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Backspace',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Meta',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Alt',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Control',
    'CapsLock',
    'NumLock',
    'ScrollLock',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Pause',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Insert',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Home',
    'PageUp',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'Delete',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- These values must match KeyboardEvent.key identifiers.
    'End',
    'PageDown',
    'ContextMenu',
    'PrintScreen',
    'BrowserBack',
    'BrowserForward',
    'BrowserRefresh',
    'BrowserStop',
    'BrowserSearch',
    'BrowserFavorites',
    'BrowserHome',
    'VolumeMute',
    'VolumeDown',
    'VolumeUp',
    'MediaTrackNext',
    'MediaTrackPrevious',
    'MediaStop',
    'MediaPlayPause',
  ];

  return nonTextWritingKeys.includes(key);
};
