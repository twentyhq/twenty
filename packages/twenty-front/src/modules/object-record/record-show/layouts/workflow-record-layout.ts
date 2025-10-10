import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';

export const WORKFLOW_RECORD_LAYOUT: RecordLayout = {
  hideSummaryAndFields: true,
  tabs: {
    workflow: {
      title: 'Flow',
      position: 101,
      icon: 'IconSettings',
      cards: [{ type: CardType.WorkflowCard }],
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
    fields: null,
    tasks: null,
    notes: null,
    files: null,
  },
};
