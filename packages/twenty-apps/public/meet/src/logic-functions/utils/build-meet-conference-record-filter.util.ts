export const buildMeetConferenceRecordFilter = ({
  startedAfter,
  startedBefore,
}: {
  startedAfter: Date;
  startedBefore: Date;
}): string =>
  `start_time>="${startedAfter.toISOString()}" AND start_time<="${startedBefore.toISOString()}"`;
