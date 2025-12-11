import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';

export const TASK_RECORD_LAYOUT: RecordLayout = {
  tabs: {
    richText: {
      title: 'Note',
      position: 101,
      icon: 'IconNotes',
      cards: [{ type: CardType.FieldRichTextCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    tasks: null,
    notes: null,
  },
};
