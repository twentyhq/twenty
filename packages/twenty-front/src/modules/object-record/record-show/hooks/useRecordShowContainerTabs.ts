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

type TabHideConfig = {
  onMobile: boolean;
  onDesktop: boolean;
  inRightDrawer: boolean;
  ifFeatureFlagsEnabled: string[];
  ifObjectsDontExist: string[];
  ifRelationsDontExist: string[];
};

type TabDefinition = {
  id: string;
  title: string;
  Icon: IconComponent;
  hide: TabHideConfig;
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

  // Computing conditions
  const isWorkflow =
    isWorkflowEnabled &&
    targetObjectNameSingular === CoreObjectNameSingular.Workflow;

  const isWorkflowVersion =
    isWorkflowEnabled &&
    targetObjectNameSingular === CoreObjectNameSingular.WorkflowVersion;

  const isWorkflowRun =
    isWorkflowEnabled &&
    targetObjectNameSingular === CoreObjectNameSingular.WorkflowRun;

  const isWorkflowRelated = isWorkflow || isWorkflowVersion || isWorkflowRun;

  const isCompanyOrPerson = [
    CoreObjectNameSingular.Company,
    CoreObjectNameSingular.Person,
  ].includes(targetObjectNameSingular);

  const isNoteOrTask = [
    CoreObjectNameSingular.Note,
    CoreObjectNameSingular.Task,
  ].includes(targetObjectNameSingular);

  const isNotesObjectActive = objectMetadataItems.some(
    (item) =>
      item.nameSingular === CoreObjectNameSingular.Note && item.isActive,
  );

  const isTasksObjectActive = objectMetadataItems.some(
    (item) =>
      item.nameSingular === CoreObjectNameSingular.Task && item.isActive,
  );

  const isAttachmentsObjectActive = objectMetadataItems.some(
    (item) =>
      item.nameSingular === CoreObjectNameSingular.Attachment && item.isActive,
  );

  const hasNoteTargets = objectMetadataItem.fields.some(
    (field) =>
      field.type === FieldMetadataType.Relation &&
      field.name === 'noteTargets' &&
      field.isActive,
  );

  const hasTaskTargets = objectMetadataItem.fields.some(
    (field) =>
      field.type === FieldMetadataType.Relation &&
      field.name === 'taskTargets' &&
      field.isActive,
  );

  const hasAttachments = objectMetadataItem.fields.some(
    (field) =>
      field.type === FieldMetadataType.Relation &&
      field.name === 'attachments' &&
      field.isActive,
  );

  // Define all possible tabs
  const tabDefinitions: TabDefinition[] = [
    {
      id: 'richText',
      title: 'Note',
      Icon: IconNotes,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: [],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    },
    {
      id: 'fields',
      title: 'Fields',
      Icon: IconList,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: [],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: true,
        ifFeatureFlagsEnabled: [],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    },
    {
      id: 'tasks',
      title: 'Tasks',
      Icon: IconCheckbox,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: [],
        ifObjectsDontExist: ['Task'],
        ifRelationsDontExist: ['taskTargets']
      }
    },
    {
      id: 'notes',
      title: 'Notes',
      Icon: IconNotes,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: [],
        ifObjectsDontExist: ['Note'],
        ifRelationsDontExist: ['noteTargets']
      }
    },
    {
      id: 'files',
      title: 'Files',
      Icon: IconPaperclip,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: [],
        ifObjectsDontExist: ['Attachment'],
        ifRelationsDontExist: ['attachments']
      }
    },
    {
      id: 'emails',
      title: 'Emails',
      Icon: IconMail,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: [],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    },
    {
      id: 'calendar',
      title: 'Calendar',
      Icon: IconCalendarEvent,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: [],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    },
    {
      id: 'workflow',
      title: 'Workflow',
      Icon: IconSettings,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: ['IS_WORKFLOW_ENABLED'],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    },
    {
      id: 'workflowVersion',
      title: 'Flow',
      Icon: IconSettings,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: ['IS_WORKFLOW_ENABLED'],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    },
    {
      id: 'workflowRunOutput',
      title: 'Output',
      Icon: IconPrinter,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: ['IS_WORKFLOW_ENABLED'],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    },
    {
      id: 'workflowRunFlow',
      title: 'Flow',
      Icon: IconSettings,
      hide: {
        onMobile: false,
        onDesktop: false,
        inRightDrawer: false,
        ifFeatureFlagsEnabled: ['IS_WORKFLOW_ENABLED'],
        ifObjectsDontExist: [],
        ifRelationsDontExist: []
      }
    }
  ];

  // Process tabs and apply visibility logic
  return tabDefinitions.map(({ id, title, Icon, hide }) => {
    // Special handling for fields tab
    if (id === 'fields') {
      return {
        id,
        title,
        Icon,
        hide: !(isMobile || isInRightDrawer)  // Show only on mobile or in right drawer
      };
    }

    const baseHide = (
      (hide.onMobile && isMobile) ||
      (hide.onDesktop && !isMobile) ||
      (hide.inRightDrawer && isInRightDrawer) ||
      (hide.ifFeatureFlagsEnabled.length > 0 &&
        !hide.ifFeatureFlagsEnabled.every(flag => {
          if (flag === 'IS_WORKFLOW_ENABLED') return isWorkflowEnabled;
          return false;
        }))
    );

    const objectsDontExist = hide.ifObjectsDontExist.length > 0 && !hide.ifObjectsDontExist.every(obj => {
      switch (obj) {
        case 'Note':
          return isNotesObjectActive;
        case 'Task':
          return isTasksObjectActive;
        case 'Attachment':
          return isAttachmentsObjectActive;
        default:
          return objectMetadataItems.some(
            item => item.nameSingular === obj && item.isActive
          );
      }
    });

    const relationsDontExist = hide.ifRelationsDontExist.length > 0 && !hide.ifRelationsDontExist.every(rel =>
      objectMetadataItem.fields.some(
        field =>
          field.type === FieldMetadataType.Relation &&
          field.name === rel &&
          field.isActive
      )
    );

    let isHidden = loading || baseHide || objectsDontExist || relationsDontExist;

    // Special case handling from original code
    if (!isHidden) {
      switch (id) {
        case 'richText':
         
      isHidden = !(targetObjectNameSingular === CoreObjectNameSingular.Note || 
                  targetObjectNameSingular === CoreObjectNameSingular.Task)
      break;
        case 'timeline':
          isHidden = isWorkflowRelated;
          break;
        case 'tasks':
          isHidden = (isNoteOrTask || isWorkflowRelated || !hasTaskTargets);
          break;
        case 'notes':
          isHidden = (isNoteOrTask || isWorkflowRelated || !hasNoteTargets);
          break;
        case 'files':
          isHidden = (isWorkflowRelated || !hasAttachments);
          break;
        case 'emails':
          isHidden = !isCompanyOrPerson;
          break;
        case 'calendar':
          isHidden = !isCompanyOrPerson;
          break;
        case 'workflow':
          isHidden = !isWorkflow;
          break;
        case 'workflowVersion':
          isHidden = !isWorkflowVersion;
          break;
        case 'workflowRunOutput':
        case 'workflowRunFlow':
          isHidden = !isWorkflowRun;
          break;
      }
    }

    return {
      id,
      title,
      Icon,
      hide: isHidden
    };
  });
};