import { type SyntheticEvent, useState } from 'react';

export type LoggedEventFile = {
  name: string;
  size: number;
  type: string;
};

export type LoggedEventEntry = {
  index: number;
  type: string;
  testId: string;
  value?: string;
  checked?: boolean;
  files?: LoggedEventFile[];
  key?: string;
  code?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  scrollTop?: number;
  scrollLeft?: number;
  deltaX?: number;
  deltaY?: number;
};

const EVENT_LOG_STYLE = {
  margin: 0,
  padding: '8px 12px',
  border: '1px solid #d4d4d8',
  borderRadius: 6,
  backgroundColor: '#fafafa',
  fontSize: 11,
  fontFamily: 'monospace',
  color: '#1f2937',
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 2,
  maxHeight: 220,
  overflow: 'auto',
};

const isFileLike = (
  value: unknown,
): value is { name: string; size: number; type: string } => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.size === 'number' &&
    typeof candidate.type === 'string'
  );
};

const serializeFiles = (value: unknown): LoggedEventFile[] | undefined => {
  if (value === null || typeof value !== 'object') {
    return undefined;
  }

  const fileListLike = value as { length?: unknown } & Record<number, unknown>;

  if (typeof fileListLike.length !== 'number') {
    return undefined;
  }

  const serialized: LoggedEventFile[] = [];

  for (let fileIndex = 0; fileIndex < fileListLike.length; fileIndex++) {
    const candidate = fileListLike[fileIndex];

    if (isFileLike(candidate)) {
      serialized.push({
        name: candidate.name,
        size: candidate.size,
        type: candidate.type,
      });
    }
  }

  return serialized;
};

export const useEventLog = () => {
  const [entries, setEntries] = useState<LoggedEventEntry[]>([]);

  const pushEvent = (event: SyntheticEvent<HTMLElement>) => {
    setEntries((previousEntries) => {
      const eventRecord = event as unknown as Record<string, unknown>;
      const target =
        typeof eventRecord.target === 'object' && eventRecord.target !== null
          ? (eventRecord.target as Record<string, unknown>)
          : {};
      const detailRecord =
        typeof eventRecord.detail === 'object' && eventRecord.detail !== null
          ? (eventRecord.detail as Record<string, unknown>)
          : {};
      const targetElement = eventRecord.target as HTMLElement | null;
      const testIdSource =
        (eventRecord.currentTarget as HTMLElement | null) ?? targetElement;
      const pickString = (key: string): string | undefined => {
        if (typeof eventRecord[key] === 'string') {
          return eventRecord[key] as string;
        }
        if (typeof detailRecord[key] === 'string') {
          return detailRecord[key] as string;
        }
        return undefined;
      };
      const pickBoolean = (key: string): boolean | undefined => {
        if (typeof eventRecord[key] === 'boolean') {
          return eventRecord[key] as boolean;
        }
        if (typeof detailRecord[key] === 'boolean') {
          return detailRecord[key] as boolean;
        }
        return undefined;
      };
      const pickNumber = (key: string): number | undefined => {
        if (typeof eventRecord[key] === 'number') {
          return eventRecord[key] as number;
        }
        if (typeof detailRecord[key] === 'number') {
          return detailRecord[key] as number;
        }
        return undefined;
      };

      const entry: LoggedEventEntry = {
        index: previousEntries.length,
        type: typeof event.type === 'string' ? event.type : 'unknown',
        testId:
          (typeof testIdSource?.getAttribute === 'function'
            ? testIdSource.getAttribute('data-testid')
            : null) ??
          (typeof target['data-testid'] === 'string'
            ? (target['data-testid'] as string)
            : 'unknown'),
      };

      if (typeof target.value === 'string') {
        entry.value = target.value;
      } else if (typeof detailRecord.value === 'string') {
        entry.value = detailRecord.value as string;
      }

      if (typeof target.checked === 'boolean') {
        entry.checked = target.checked;
      } else if (typeof detailRecord.checked === 'boolean') {
        entry.checked = detailRecord.checked as boolean;
      }

      const files =
        serializeFiles(target.files) ?? serializeFiles(detailRecord.files);

      if (files !== undefined) {
        entry.files = files;
      }

      const keyValue = pickString('key');
      if (keyValue !== undefined) {
        entry.key = keyValue;
      }

      const codeValue = pickString('code');
      if (codeValue !== undefined) {
        entry.code = codeValue;
      }

      const shiftKeyValue = pickBoolean('shiftKey');
      if (shiftKeyValue !== undefined) {
        entry.shiftKey = shiftKeyValue;
      }

      const ctrlKeyValue = pickBoolean('ctrlKey');
      if (ctrlKeyValue !== undefined) {
        entry.ctrlKey = ctrlKeyValue;
      }

      const metaKeyValue = pickBoolean('metaKey');
      if (metaKeyValue !== undefined) {
        entry.metaKey = metaKeyValue;
      }

      const altKeyValue = pickBoolean('altKey');
      if (altKeyValue !== undefined) {
        entry.altKey = altKeyValue;
      }

      const scrollTopValue = pickNumber('scrollTop');
      if (scrollTopValue !== undefined) {
        entry.scrollTop = scrollTopValue;
      }

      const scrollLeftValue = pickNumber('scrollLeft');
      if (scrollLeftValue !== undefined) {
        entry.scrollLeft = scrollLeftValue;
      }

      const deltaXValue = pickNumber('deltaX');
      if (deltaXValue !== undefined) {
        entry.deltaX = deltaXValue;
      }

      const deltaYValue = pickNumber('deltaY');
      if (deltaYValue !== undefined) {
        entry.deltaY = deltaYValue;
      }

      return [...previousEntries, entry];
    });
  };

  return { entries, pushEvent };
};

type EventLogProps = {
  entries: LoggedEventEntry[];
};

export const EventLog = ({ entries }: EventLogProps) => (
  <ol data-testid="event-log" style={EVENT_LOG_STYLE}>
    {entries.map((entry) => (
      <li key={entry.index} data-testid={`event-${entry.index}`}>
        {JSON.stringify(entry)}
      </li>
    ))}
  </ol>
);
