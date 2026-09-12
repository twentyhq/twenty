import { isNonEmptyString } from "@sniptt/guards";

const DUE_TIME_OF_DAY_UTC = 'T12:00:00.000Z';

export const normalizeDueDate = (due: string | undefined): string | null => {
  if (!isNonEmptyString(due)) {
    return null;
  }

  const dueDate = new Date(due);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  return `${dueDate.toISOString().slice(0, 10)}${DUE_TIME_OF_DAY_UTC}`;
};
