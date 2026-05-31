import { type SyntheticEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

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

const isStringValue = (value: unknown): value is string =>
  typeof value === 'string';

const isNumberValue = (value: unknown): value is number =>
  typeof value === 'number';

const isBooleanValue = (value: unknown): value is boolean =>
  typeof value === 'boolean';

const isUnknownRecord = (value: unknown): value is Record<string, unknown> =>
  isDefined(value) && typeof value === 'object';

const isElement = (value: unknown): value is Element =>
  isUnknownRecord(value) && typeof value.getAttribute === 'function';

const isFileLike = (value: unknown): value is LoggedEventFile =>
  isUnknownRecord(value) &&
  isStringValue(value.name) &&
  isNumberValue(value.size) &&
  isStringValue(value.type);

const isFileListLike = (
  value: unknown,
): value is { length: number } & Record<number, unknown> =>
  isUnknownRecord(value) && isNumberValue(value.length);

const serializeFiles = (value: unknown): LoggedEventFile[] | undefined => {
  if (!isFileListLike(value)) {
    return undefined;
  }

  const serialized: LoggedEventFile[] = [];

  for (let fileIndex = 0; fileIndex < value.length; fileIndex++) {
    const candidate = value[fileIndex];

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

const pickFromRecords = <TValue,>(
  records: Record<string, unknown>[],
  key: string,
  guard: (value: unknown) => value is TValue,
): TValue | undefined => {
  for (const record of records) {
    const value = record[key];
    if (guard(value)) {
      return value;
    }
  }
  return undefined;
};

const readTestId = (
  source: unknown,
  target: Record<string, unknown>,
): string => {
  if (isElement(source)) {
    const testId = source.getAttribute('data-testid');
    if (isDefined(testId)) {
      return testId;
    }
  }

  const targetTestId = target['data-testid'];
  if (isStringValue(targetTestId)) {
    return targetTestId;
  }

  return 'unknown';
};

const toUnknownRecord = (value: unknown): Record<string, unknown> =>
  isUnknownRecord(value) ? value : {};

export const useEventLog = () => {
  const [entries, setEntries] = useState<LoggedEventEntry[]>([]);

  const pushEvent = (event: SyntheticEvent<Element>) => {
    setEntries((previousEntries) => {
      const eventRecord = event as unknown as Record<string, unknown>;
      const target = toUnknownRecord(eventRecord.target);
      const detail = toUnknownRecord(eventRecord.detail);
      const records = [eventRecord, detail];

      const entry: LoggedEventEntry = {
        index: previousEntries.length,
        type: isStringValue(event.type) ? event.type : 'unknown',
        testId: readTestId(
          eventRecord.currentTarget ?? eventRecord.target,
          target,
        ),
      };

      const value = pickFromRecords([target, detail], 'value', isStringValue);
      if (isDefined(value)) {
        entry.value = value;
      }

      const checked = pickFromRecords(
        [target, detail],
        'checked',
        isBooleanValue,
      );
      if (isDefined(checked)) {
        entry.checked = checked;
      }

      const files =
        serializeFiles(target.files) ?? serializeFiles(detail.files);
      if (isDefined(files)) {
        entry.files = files;
      }

      const key = pickFromRecords(records, 'key', isStringValue);
      if (isDefined(key)) {
        entry.key = key;
      }

      const code = pickFromRecords(records, 'code', isStringValue);
      if (isDefined(code)) {
        entry.code = code;
      }

      const shiftKey = pickFromRecords(records, 'shiftKey', isBooleanValue);
      if (isDefined(shiftKey)) {
        entry.shiftKey = shiftKey;
      }

      const ctrlKey = pickFromRecords(records, 'ctrlKey', isBooleanValue);
      if (isDefined(ctrlKey)) {
        entry.ctrlKey = ctrlKey;
      }

      const metaKey = pickFromRecords(records, 'metaKey', isBooleanValue);
      if (isDefined(metaKey)) {
        entry.metaKey = metaKey;
      }

      const altKey = pickFromRecords(records, 'altKey', isBooleanValue);
      if (isDefined(altKey)) {
        entry.altKey = altKey;
      }

      const scrollTop = pickFromRecords(records, 'scrollTop', isNumberValue);
      if (isDefined(scrollTop)) {
        entry.scrollTop = scrollTop;
      }

      const scrollLeft = pickFromRecords(records, 'scrollLeft', isNumberValue);
      if (isDefined(scrollLeft)) {
        entry.scrollLeft = scrollLeft;
      }

      const deltaX = pickFromRecords(records, 'deltaX', isNumberValue);
      if (isDefined(deltaX)) {
        entry.deltaX = deltaX;
      }

      const deltaY = pickFromRecords(records, 'deltaY', isNumberValue);
      if (isDefined(deltaY)) {
        entry.deltaY = deltaY;
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
