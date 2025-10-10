import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';

export const DASHBOARD_RECORD_LAYOUT: RecordLayout = {
  hideSummaryAndFields: true,
  hideFieldsInSidePanel: true,
  tabs: {
    dashboard: {
      title: 'Dashboard',
      position: 101,
      icon: 'IconLayoutDashboard',
      cards: [{ type: CardType.DashboardCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    timeline: null,
    tasks: null,
    notes: null,
    files: null,
  },
};
