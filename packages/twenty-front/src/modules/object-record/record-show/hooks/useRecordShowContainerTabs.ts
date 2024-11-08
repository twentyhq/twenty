import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SingleTabProps } from '@/ui/layout/tab/components/TabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import {
  IconCalendarEvent,
  IconCheckbox,
  IconComponent,
  IconList,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconPrinter,
  IconSettings,
  IconTimelineEvent,
} from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type TabVisibilityConfig = {
  onMobile: boolean;
  onDesktop: boolean;
  inRightDrawer: boolean;
  requiresFeatures: string[];
  ifObjectsDontExist: CoreObjectNameSingular[]; // For checking if objects are enabled/available
  requiresRelations: string[];
  visibleOnObjectTypes: CoreObjectNameSingular[]; // For controlling which pages show the tab
};

type TabDefinition = {
  id: string;
  title: string;
  Icon: IconComponent;
  hide: TabVisibilityConfig;
};

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
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        ifObjectsDontExist: [CoreObjectNameSingular.Note],
        requiresRelations: [],
        visibleOnObjectTypes: [
          CoreObjectNameSingular.Note,
          CoreObjectNameSingular.Task,
        ],
      },
    },
    {
      id: 'fields',
      title: 'Fields',
      Icon: IconList,
      hide: {
        onMobile: false,
        onDesktop: true,
        inRightDrawer: false,
        requiresFeatures: [],
        ifObjectsDontExist: [],
        requiresRelations: [],
        visibleOnObjectTypes: Object.values(CoreObjectNameSingular),
      },
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: true,
        requiresFeatures: [],
        ifObjectsDontExist: [],
        requiresRelations: [],
        visibleOnObjectTypes: Object.values(CoreObjectNameSingular).filter(
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
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        ifObjectsDontExist: [CoreObjectNameSingular.Task],
        requiresRelations: ['taskTargets'],
        visibleOnObjectTypes: Object.values(CoreObjectNameSingular).filter(
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
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        ifObjectsDontExist: [CoreObjectNameSingular.Note],
        requiresRelations: ['noteTargets'],
        visibleOnObjectTypes: Object.values(CoreObjectNameSingular).filter(
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
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        ifObjectsDontExist: [CoreObjectNameSingular.Attachment],
        requiresRelations: ['attachments'],
        visibleOnObjectTypes: Object.values(CoreObjectNameSingular).filter(
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
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        ifObjectsDontExist: [],
        requiresRelations: [],
        visibleOnObjectTypes: [
          CoreObjectNameSingular.Company,
          CoreObjectNameSingular.Person,
        ],
      },
    },
    {
      id: 'calendar',
      title: 'Calendar',
      Icon: IconCalendarEvent,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: [],
        ifObjectsDontExist: [],
        requiresRelations: [],
        visibleOnObjectTypes: [
          CoreObjectNameSingular.Company,
          CoreObjectNameSingular.Person,
        ],
      },
    },
    {
      id: 'workflow',
      title: 'Workflow',
      Icon: IconSettings,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: ['IS_WORKFLOW_ENABLED'],
        ifObjectsDontExist: [],
        requiresRelations: [],
        visibleOnObjectTypes: [CoreObjectNameSingular.Workflow],
      },
    },
    {
      id: 'workflowVersion',
      title: 'Flow',
      Icon: IconSettings,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: ['IS_WORKFLOW_ENABLED'],
        ifObjectsDontExist: [],
        requiresRelations: [],
        visibleOnObjectTypes: [CoreObjectNameSingular.WorkflowVersion],
      },
    },
    {
      id: 'workflowRunOutput',
      title: 'Output',
      Icon: IconPrinter,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: ['IS_WORKFLOW_ENABLED'],
        ifObjectsDontExist: [],
        requiresRelations: [],
        visibleOnObjectTypes: [CoreObjectNameSingular.WorkflowRun],
      },
    },
    {
      id: 'workflowRunFlow',
      title: 'Flow',
      Icon: IconSettings,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        requiresFeatures: ['IS_WORKFLOW_ENABLED'],
        ifObjectsDontExist: [],
        requiresRelations: [],
        visibleOnObjectTypes: [CoreObjectNameSingular.WorkflowRun],
      },
    },
  ];

  return tabDefinitions.map(({ id, title, Icon, hide }) => {
    // Special handling for fields tab
    if (id === 'fields') {
      return {
        id,
        title,
        Icon,
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

    const objectsDontExist =
      hide.ifObjectsDontExist.length > 0 &&
      !hide.ifObjectsDontExist.every((obj) =>
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

    const notVisibleForObjectType = !hide.visibleOnObjectTypes.includes(
      targetObjectNameSingular,
    );

    return {
      id,
      title,
      Icon,
      hide:
        loading ||
        baseHide ||
        featureNotEnabled ||
        objectsDontExist ||
        relationsDontExist ||
        notVisibleForObjectType,
    };
  });
};
