import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';

export const WORKFLOW_VERSION_RECORD_LAYOUT: RecordLayout = {
  tabs: {
    workflowVersion: {
      title: 'Flow',
      position: 101,
      icon: 'IconSettings',
      cards: [{ type: CardType.WorkflowVersionCard }],
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
