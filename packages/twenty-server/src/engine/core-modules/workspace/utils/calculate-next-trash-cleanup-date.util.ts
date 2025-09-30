export function calculateNextTrashCleanupDate(
  trashRetentionDays: number,
): Date {
  const nextDate = new Date();

  nextDate.setUTCDate(nextDate.getUTCDate() + trashRetentionDays);
  nextDate.setUTCHours(0, 0, 0, 0);

  return nextDate;
}
