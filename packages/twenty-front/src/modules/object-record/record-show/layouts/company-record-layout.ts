import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';

export const COMPANY_RECORD_LAYOUT: RecordLayout = {
  tabs: {
    emails: {
      title: 'Emails',
      position: 600,
      icon: 'IconMail',
      cards: [{ type: CardType.EmailCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    calendar: {
      title: 'Calendar',
      position: 700,
      icon: 'IconCalendarEvent',
      cards: [{ type: CardType.CalendarCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
  },
};
