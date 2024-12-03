import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { CardType } from '@/object-record/record-show/types/CardType';
import { RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import {
  IconCheckbox,
  IconList,
  IconNotes,
  IconPaperclip,
  IconTimelineEvent,
} from 'twenty-ui';

export const BASE_RECORD_LAYOUT: RecordLayout = {
  tabs: {
    fields: {
      title: 'Fields',
      Icon: IconList,
      position: 100,
      cards: [{ type: CardType.FieldCard }],
      hide: {
        ifMobile: false,
        ifDesktop: true,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    timeline: {
      title: 'Timeline',
      Icon: IconTimelineEvent,
      position: 200,
      cards: [{ type: CardType.TimelineCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: true,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    tasks: {
      title: 'Tasks',
      Icon: IconCheckbox,
      position: 300,
      cards: [{ type: CardType.TaskCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Task],
        ifRelationsMissing: ['taskTargets'],
      },
    },
    notes: {
      title: 'Notes',
      Icon: IconNotes,
      position: 400,
      cards: [{ type: CardType.NoteCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Note],
        ifRelationsMissing: ['noteTargets'],
      },
    },
    files: {
      title: 'Files',
      Icon: IconPaperclip,
      position: 500,
      cards: [{ type: CardType.FileCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Attachment],
        ifRelationsMissing: ['attachments'],
      },
    },
  },
};
