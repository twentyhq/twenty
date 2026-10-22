export const createNumberedLabels = ({
  prefix,
  count,
}: {
  prefix: string;
  count: number;
}): string[] =>
  Array.from(
    { length: count },
    (_, index) => `${prefix} ${String(index + 1).padStart(2, '0')}`,
  );
