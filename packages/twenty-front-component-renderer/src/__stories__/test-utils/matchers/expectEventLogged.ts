import { expect, waitFor, within } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '../probe-timeouts';

type Canvas = ReturnType<typeof within>;

type LoggedEventMatcher = {
  index?: number;
  type?: string;
  testId?: string;
  value?: string;
  checked?: boolean;
  key?: string;
  code?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  files?: { name?: string; type?: string }[];
};

type ParsedLogEntry = Record<string, unknown> & {
  type?: unknown;
  testId?: unknown;
};

const parseEntries = (canvas: Canvas): ParsedLogEntry[] => {
  const log = canvas.queryByTestId('event-log');

  if (log === null) {
    return [];
  }

  const items = within(log).queryAllByRole('listitem');

  return items.map((item): ParsedLogEntry => {
    try {
      return JSON.parse(item.textContent ?? '{}') as ParsedLogEntry;
    } catch {
      return {};
    }
  });
};

const matchesEntry = (
  entry: ParsedLogEntry,
  matcher: LoggedEventMatcher,
): boolean => {
  for (const [key, expectedValue] of Object.entries(matcher)) {
    const actualValue = (entry as Record<string, unknown>)[key];

    if (key === 'files') {
      const expectedFiles = expectedValue as { name?: string; type?: string }[];
      const actualFiles = actualValue as
        | { name?: string; type?: string }[]
        | undefined;

      if (
        actualFiles === undefined ||
        actualFiles.length < expectedFiles.length
      ) {
        return false;
      }

      for (let fileIndex = 0; fileIndex < expectedFiles.length; fileIndex++) {
        const expectedFile = expectedFiles[fileIndex];
        const actualFile = actualFiles[fileIndex];

        if (
          (expectedFile.name !== undefined &&
            actualFile.name !== expectedFile.name) ||
          (expectedFile.type !== undefined &&
            actualFile.type !== expectedFile.type)
        ) {
          return false;
        }
      }
      continue;
    }

    if (actualValue !== expectedValue) {
      return false;
    }
  }

  return true;
};

type ExpectEventLoggedParams = {
  canvas: Canvas;
  matcher: LoggedEventMatcher;
  timeout?: number;
};

export const expectEventLogged = async ({
  canvas,
  matcher,
  timeout = INTERACTION_TIMEOUT,
}: ExpectEventLoggedParams): Promise<void> => {
  await waitFor(
    () => {
      const entries = parseEntries(canvas);
      const found = entries.some((entry) => matchesEntry(entry, matcher));

      expect(found).toBe(true);
    },
    { timeout },
  );
};

type ExpectLastEventLoggedParams = {
  canvas: Canvas;
  matcher: LoggedEventMatcher;
  timeout?: number;
};

export const expectLastEventLogged = async ({
  canvas,
  matcher,
  timeout = INTERACTION_TIMEOUT,
}: ExpectLastEventLoggedParams): Promise<void> => {
  await waitFor(
    () => {
      const entries = parseEntries(canvas);

      expect(entries.length).toBeGreaterThan(0);

      const lastEntry = entries[entries.length - 1];

      expect(matchesEntry(lastEntry, matcher)).toBe(true);
    },
    { timeout },
  );
};
