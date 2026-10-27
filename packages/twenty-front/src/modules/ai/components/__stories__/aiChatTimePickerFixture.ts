import { type AiChatSchedulingAvailability } from '@/ai/types/AiChatSchedulingAvailability';

export const AI_CHAT_TIME_PICKER_FIXTURE = {
  date: '2026-10-07',
  viewedMonth: '2026-10',
  timeZone: 'Europe/Paris',
  availability: {
    status: 'ready',
    date: '2026-10-07',
    slots: [
      {
        id: 'slot-0930',
        startsAt: '2026-10-07T07:30:00Z',
        endsAt: '2026-10-07T08:00:00Z',
      },
      {
        id: 'slot-1100',
        startsAt: '2026-10-07T09:00:00Z',
        endsAt: '2026-10-07T09:30:00Z',
        isRecommended: true,
      },
      {
        id: 'slot-1400',
        startsAt: '2026-10-07T12:00:00Z',
        endsAt: '2026-10-07T12:30:00Z',
      },
      {
        id: 'slot-1600',
        startsAt: '2026-10-07T14:00:00Z',
        endsAt: '2026-10-07T14:30:00Z',
      },
    ],
  },
} as const satisfies {
  date: string;
  viewedMonth: string;
  timeZone: string;
  availability: AiChatSchedulingAvailability;
};
