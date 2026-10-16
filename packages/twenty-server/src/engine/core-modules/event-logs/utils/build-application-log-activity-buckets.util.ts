import { type ApplicationLogActivityBucket } from 'src/engine/core-modules/event-logs/dtos/event-log-result.dto';

export const buildApplicationLogActivityBuckets = ({
  start,
  end,
  duration,
  rows,
}: {
  start: Date;
  end: Date;
  duration: number;
  rows: { bucket: number; info: number; warning: number; error: number }[];
}): ApplicationLogActivityBucket[] => {
  const byBucket = new Map(rows.map((row) => [Number(row.bucket), row]));
  return Array.from(
    {
      length: Math.min(
        48,
        Math.max(0, Math.ceil((end.getTime() - start.getTime()) / duration)),
      ),
    },
    (_, index) => {
      const row = byBucket.get(index);
      return {
        start: new Date(start.getTime() + index * duration),
        end: new Date(
          Math.min(end.getTime(), start.getTime() + (index + 1) * duration),
        ),
        info: Number(row?.info ?? 0),
        warning: Number(row?.warning ?? 0),
        error: Number(row?.error ?? 0),
      };
    },
  );
};
