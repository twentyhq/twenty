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

  const tabDefinitions: TabDefinition[] = [
    {
      id: 'richText',
      title: 'Note',
      Icon: IconNotes,
      cards: [{ type: CardType.RichTextCard }],

      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        requiredObjectsNotActive: [],
        requiresRelations: [],
        ifCurrentObjectIsNotIn: [
          CoreObjectNameSingular.Note,
          CoreObjectNameSingular.Task,
        ],
      },
    },
    {
      id: 'fields',
      title: 'Fields',
      Icon: IconList,
      cards: [{ type: CardType.FieldCard }],

      hide: {
        onMobile: false,
        onDesktop: true,
        inRightDrawer: false,
        requiresFeatures: [],
        requiredObjectsNotActive: [],
        requiresRelations: [],
        ifCurrentObjectIsNotIn: Object.values(CoreObjectNameSingular),
      },
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
      cards: [{ type: CardType.TimelineCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: true,
        requiresFeatures: [],
        requiredObjectsNotActive: [],
        requiresRelations: [],
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
    {
      id: 'tasks',
      title: 'Tasks',
      Icon: IconCheckbox,
      cards: [{ type: CardType.TaskCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        requiredObjectsNotActive: [CoreObjectNameSingular.Task],
        requiresRelations: ['taskTargets'],
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
    {
      id: 'notes',
      title: 'Notes',
      Icon: IconNotes,
      cards: [{ type: CardType.NoteCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        requiredObjectsNotActive: [CoreObjectNameSingular.Note],
        requiresRelations: ['noteTargets'],
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
    {
      id: 'files',
      title: 'Files',
      Icon: IconPaperclip,
      cards: [{ type: CardType.FileCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        requiredObjectsNotActive: [CoreObjectNameSingular.Attachment],
        requiresRelations: ['attachments'],
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
    {
      id: 'emails',
      title: 'Emails',
      Icon: IconMail,
      cards: [{ type: CardType.EmailCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        requiredObjectsNotActive: [],
        requiresRelations: [],
        ifCurrentObjectIsNotIn: [
          CoreObjectNameSingular.Company,
          CoreObjectNameSingular.Person,
        ],
      },
    },
    {
      id: 'calendar',
      title: 'Calendar',
      Icon: IconCalendarEvent,
      cards: [{ type: CardType.CalendarCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        requiredObjectsNotActive: [],
        requiresRelations: [],
        ifCurrentObjectIsNotIn: [
          CoreObjectNameSingular.Company,
          CoreObjectNameSingular.Person,
        ],
      },
    },
    {
      id: 'workflow',
      title: 'Workflow',
      Icon: IconSettings,
      cards: [{ type: CardType.WorkflowCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: ['IS_WORKFLOW_ENABLED'],
        requiredObjectsNotActive: [],
        requiresRelations: [],
        ifCurrentObjectIsNotIn: [CoreObjectNameSingular.Workflow],
      },
    },
    {
      id: 'workflowVersion',
      title: 'Flow',
      Icon: IconSettings,
      cards: [{ type: CardType.WorkflowVersionCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: ['IS_WORKFLOW_ENABLED'],
        requiredObjectsNotActive: [],
        requiresRelations: [],
        ifCurrentObjectIsNotIn: [CoreObjectNameSingular.WorkflowVersion],
      },
    },
    {
      id: 'workflowRunOutput',
      title: 'Output',
      Icon: IconPrinter,
      cards: [{ type: CardType.WorkflowRunOutputCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: ['IS_WORKFLOW_ENABLED'],
        requiredObjectsNotActive: [],
        requiresRelations: [],
        ifCurrentObjectIsNotIn: [CoreObjectNameSingular.WorkflowRun],
      },
    },
    {
      id: 'workflowRunFlow',
      title: 'Flow',
      Icon: IconSettings,
      cards: [{ type: CardType.WorkflowRunCard }],
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: ['IS_WORKFLOW_ENABLED'],
        requiredObjectsNotActive: [],
        requiresRelations: [],
        ifCurrentObjectIsNotIn: [CoreObjectNameSingular.WorkflowRun],
      },
    },
  ];

  return tabDefinitions.map(({ id, title, Icon, hide, cards }) => {
    // Special handling for fields tab
    if (id === 'fields') {
      return {
        id,
        title,
        Icon,
        cards,
        hide: !(isMobile || isInRightDrawer),
      };
    }

    const baseHide =
      (hide.onMobile && isMobile) ||
      (hide.onDesktop && !isMobile) ||
      (hide.inRightDrawer && isInRightDrawer);

    const featureNotEnabled =
      hide.requiresFeatures.length > 0 &&
      !hide.requiresFeatures.every((flag) => {
        if (flag === 'IS_WORKFLOW_ENABLED') return isWorkflowEnabled;
        return false;
      });

    const requiredObjectsInactive =
      hide.requiredObjectsNotActive.length > 0 &&
      !hide.requiredObjectsNotActive.every((obj) =>
        objectMetadataItems.some(
          (item) => item.nameSingular === obj && item.isActive,
        ),
      );

    const relationsDontExist =
      hide.requiresRelations.length > 0 &&
      !hide.requiresRelations.every((rel) =>
        objectMetadataItem.fields.some(
          (field) =>
            field.type === FieldMetadataType.Relation &&
            field.name === rel &&
            field.isActive,
        ),
      );

    const currentObjectNotInAllowedList = !hide.ifCurrentObjectIsNotIn.includes(
      targetObjectNameSingular,
    );

    return {
      id,
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
  });
};
