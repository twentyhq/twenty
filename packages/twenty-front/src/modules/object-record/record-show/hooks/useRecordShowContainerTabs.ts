import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CardType } from '@/object-record/record-show/constants/CardType';
import { SingleTabProps } from '@/ui/layout/tab/components/TabList';
import { TabDefinition } from '@/ui/layout/tab/types/TabDefinition';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import {
  IconCalendarEvent,
  IconCheckbox,
  IconList,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconPrinter,
  IconSettings,
  IconTimelineEvent,
} from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useRecordShowContainerTabs = (
  loading: boolean,
  targetObjectNameSingular: CoreObjectNameSingular,
  isInRightDrawer: boolean,
  objectMetadataItem: ObjectMetadataItem,
): SingleTabProps[] => {
  const isMobile = useIsMobile();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  const tabDefinitions: Record<string, TabDefinition> = {
    richText: {
      title: 'Note',
      Icon: IconNotes,
      cards: [{ type: CardType.RichTextCard }],

      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: [
          CoreObjectNameSingular.Note,
          CoreObjectNameSingular.Task,
        ],
      },
    },
    fields: {
      title: 'Fields',
      Icon: IconList,
      cards: [{ type: CardType.FieldCard }],

      hide: {
        ifMobile: false,
        ifDesktop: true,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: Object.values(CoreObjectNameSingular),
      },
    },
    timeline: {
      title: 'Timeline',
      Icon: IconTimelineEvent,
      cards: [{ type: CardType.TimelineCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: true,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: Object.values(CoreObjectNameSingular).filter(
          (obj) =>
            ![
              CoreObjectNameSingular.Workflow,
              CoreObjectNameSingular.WorkflowVersion,
              CoreObjectNameSingular.WorkflowRun,
            ].includes(obj),
        ),
      },
    },
    tasks: {
      title: 'Tasks',
      Icon: IconCheckbox,
      cards: [{ type: CardType.TaskCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Task],
        ifRelationsMissing: ['taskTargets'],
        ifCurrentObjectIsNotIn: Object.values(CoreObjectNameSingular).filter(
          (obj) =>
            ![
              CoreObjectNameSingular.Note,
              CoreObjectNameSingular.Task,
              CoreObjectNameSingular.Workflow,
              CoreObjectNameSingular.WorkflowVersion,
              CoreObjectNameSingular.WorkflowRun,
            ].includes(obj),
        ),
      },
    },
    notes: {
      title: 'Notes',
      Icon: IconNotes,
      cards: [{ type: CardType.NoteCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Note],
        ifRelationsMissing: ['noteTargets'],
        ifCurrentObjectIsNotIn: Object.values(CoreObjectNameSingular).filter(
          (obj) =>
            ![
              CoreObjectNameSingular.Note,
              CoreObjectNameSingular.Task,
              CoreObjectNameSingular.Workflow,
              CoreObjectNameSingular.WorkflowVersion,
              CoreObjectNameSingular.WorkflowRun,
            ].includes(obj),
        ),
      },
    },
    files: {
      title: 'Files',
      Icon: IconPaperclip,
      cards: [{ type: CardType.FileCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Attachment],
        ifRelationsMissing: ['attachments'],
        ifCurrentObjectIsNotIn: Object.values(CoreObjectNameSingular).filter(
          (obj) =>
            ![
              CoreObjectNameSingular.Workflow,
              CoreObjectNameSingular.WorkflowVersion,
              CoreObjectNameSingular.WorkflowRun,
            ].includes(obj),
        ),
      },
    },
    emails: {
      title: 'Emails',
      Icon: IconMail,
      cards: [{ type: CardType.EmailCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: [
          CoreObjectNameSingular.Company,
          CoreObjectNameSingular.Person,
        ],
      },
    },
    calendar: {
      title: 'Calendar',
      Icon: IconCalendarEvent,
      cards: [{ type: CardType.CalendarCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: [
          CoreObjectNameSingular.Company,
          CoreObjectNameSingular.Person,
        ],
      },
    },
    workflow: {
      title: 'Workflow',
      Icon: IconSettings,
      cards: [{ type: CardType.WorkflowCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: ['IS_WORKFLOW_ENABLED'],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: [CoreObjectNameSingular.Workflow],
      },
    },
    workflowVersion: {
      title: 'Flow',
      Icon: IconSettings,
      cards: [{ type: CardType.WorkflowVersionCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: ['IS_WORKFLOW_ENABLED'],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: [CoreObjectNameSingular.WorkflowVersion],
      },
    },
    workflowRunOutput: {
      title: 'Output',
      Icon: IconPrinter,
      cards: [{ type: CardType.WorkflowRunOutputCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: ['IS_WORKFLOW_ENABLED'],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: [CoreObjectNameSingular.WorkflowRun],
      },
    },
    workflowRunFlow: {
      title: 'Flow',
      Icon: IconSettings,
      cards: [{ type: CardType.WorkflowRunCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: ['IS_WORKFLOW_ENABLED'],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
        ifCurrentObjectIsNotIn: [CoreObjectNameSingular.WorkflowRun],
      },
    },
  };

  return Object.entries(tabDefinitions).map(
    ([key, { title, Icon, hide, cards }]) => {
      // Special handling for fields tab
      if (key === 'fields') {
        return {
          id: key,
          title,
          Icon,
          cards,
          hide: !(isMobile || isInRightDrawer),
        };
      }

      const baseHide =
        (hide.ifMobile && isMobile) ||
        (hide.ifDesktop && !isMobile) ||
        (hide.ifInRightDrawer && isInRightDrawer);

      const featureNotEnabled =
        hide.ifFeaturesDisabled.length > 0 &&
        !hide.ifFeaturesDisabled.every((flag) => {
          if (flag === 'IS_WORKFLOW_ENABLED') return isWorkflowEnabled;
          return false;
        });

      const requiredObjectsInactive =
        hide.ifRequiredObjectsInactive.length > 0 &&
        !hide.ifRequiredObjectsInactive.every((obj) =>
          objectMetadataItems.some(
            (item) => item.nameSingular === obj && item.isActive,
          ),
        );

      const relationsDontExist =
        hide.ifRelationsMissing.length > 0 &&
        !hide.ifRelationsMissing.every((rel) =>
          objectMetadataItem.fields.some(
            (field) =>
              field.type === FieldMetadataType.Relation &&
              field.name === rel &&
              field.isActive,
          ),
        );

      const currentObjectNotInAllowedList =
        !hide.ifCurrentObjectIsNotIn.includes(targetObjectNameSingular);

      return {
        id: key,
        title,
        Icon,
        cards,
        hide:
          loading ||
          baseHide ||
          featureNotEnabled ||
          requiredObjectsInactive ||
          relationsDontExist ||
          currentObjectNotInAllowedList,
      };
    },
  );
};
