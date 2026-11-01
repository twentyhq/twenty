import { type AiChatSchedulingSlot } from '@/ai/types/AiChatSchedulingSlot';

export const hasMixedTimeZoneOffsets = ({
  slots,
  timeZone,
}: {
  slots: readonly AiChatSchedulingSlot[];
  timeZone: string;
}) => {
  const offsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  });
  const offsets = slots.flatMap(({ startsAt, endsAt }) =>
    [startsAt, endsAt].map(
      (instant) =>
        offsetFormatter
          .formatToParts(new Date(instant))
          .find(({ type }) => type === 'timeZoneName')?.value,
    ),
  );

  return new Set(offsets).size > 1;
};
