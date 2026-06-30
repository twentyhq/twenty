export const buildRecentCallRecordingFilter = ({
  lowerBound,
}: {
  lowerBound: Date;
}): Record<string, unknown> => {
  const lowerBoundIsoString = lowerBound.toISOString();

  return {
    or: [
      { createdAt: { gte: lowerBoundIsoString } },
      { startedAt: { gte: lowerBoundIsoString } },
      { endedAt: { gte: lowerBoundIsoString } },
      { calendarEvent: { startsAt: { gte: lowerBoundIsoString } } },
      { calendarEvent: { endsAt: { gte: lowerBoundIsoString } } },
    ],
  };
};
