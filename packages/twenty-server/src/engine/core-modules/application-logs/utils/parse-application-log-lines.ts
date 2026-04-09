import { type ParsedLogLine } from 'src/engine/core-modules/application-logs/types/parsed-log-line.type';

// Matches: 2024-01-01T00:00:00.000Z INFO some message
const LOG_LINE_REGEX =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+(INFO|ERROR|WARN|DEBUG)\s+(.*)$/;

export const parseApplicationLogLines = (rawLogs: string): ParsedLogLine[] => {
  if (!rawLogs) {
    return [];
  }

  const lines = rawLogs.split('\n').filter(Boolean);

  return lines.map((line) => {
    const match = line.match(LOG_LINE_REGEX);

    if (match) {
      return {
        timestamp: new Date(match[1]),
        level: match[2],
        message: match[3],
      };
    }

    return {
      timestamp: new Date(),
      level: 'INFO',
      message: line,
    };
  });
};
