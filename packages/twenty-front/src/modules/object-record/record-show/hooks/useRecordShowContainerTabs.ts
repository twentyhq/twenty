import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
  IconSettings,
  IconTimelineEvent,
} from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useRecordShowContainerTabs = (
  loading: boolean,
  targetObjectNameSingular: CoreObjectNameSingular,
  isInRightDrawer: boolean,
  objectMetadataItem: ObjectMetadataItem,
) => {
  const isMobile = useIsMobile();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');
  const isWorkflow =
    isWorkflowEnabled &&
    targetObjectNameSingular === CoreObjectNameSingular.Workflow;
  const isWorkflowVersion =
    isWorkflowEnabled &&
    targetObjectNameSingular === CoreObjectNameSingular.WorkflowVersion;

  const isCompanyOrPerson = [
    CoreObjectNameSingular.Company,
    CoreObjectNameSingular.Person,
  ].includes(targetObjectNameSingular);
  const shouldDisplayCalendarTab = isCompanyOrPerson;
  const shouldDisplayEmailsTab = isCompanyOrPerson;
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

  const shouldDisplayNotesTab =
    isNotesObjectActive &&
    objectMetadataItem.fields.some(
      (field) =>
        field.type === FieldMetadataType.Relation &&
        field.name === 'noteTargets' &&
        field.isActive,
    );

  const shouldDisplayTasksTab =
    isTasksObjectActive &&
    objectMetadataItem.fields.some(
      (field) =>
        field.type === FieldMetadataType.Relation &&
        field.name === 'taskTargets' &&
        field.isActive,
    );

  const shouldDisplayFilesTab =
    isAttachmentsObjectActive &&
    objectMetadataItem.fields.some(
      (field) =>
        field.type === FieldMetadataType.Relation &&
        field.name === 'attachments' &&
        field.isActive,
    );

  return [
    {
      id: 'richText',
      title: 'Note',
      Icon: IconNotes,
      hide:
        loading ||
        (targetObjectNameSingular !== CoreObjectNameSingular.Note &&
          targetObjectNameSingular !== CoreObjectNameSingular.Task) ||
        !shouldDisplayNotesTab,
    },
    {
      id: 'fields',
      title: 'Fields',
      Icon: IconList,
      hide: !(isMobile || isInRightDrawer),
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
      hide: isInRightDrawer || isWorkflow || isWorkflowVersion,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      Icon: IconCheckbox,
      hide:
        targetObjectNameSingular === CoreObjectNameSingular.Note ||
        targetObjectNameSingular === CoreObjectNameSingular.Task ||
        isWorkflow ||
        isWorkflowVersion ||
        !shouldDisplayTasksTab,
    },
    {
      id: 'notes',
      title: 'Notes',
      Icon: IconNotes,
      hide:
        targetObjectNameSingular === CoreObjectNameSingular.Note ||
        targetObjectNameSingular === CoreObjectNameSingular.Task ||
        isWorkflow ||
        isWorkflowVersion ||
        !shouldDisplayNotesTab,
    },
    {
      id: 'files',
      title: 'Files',
      Icon: IconPaperclip,
      hide: isWorkflow || isWorkflowVersion || !shouldDisplayFilesTab,
    },
    {
      id: 'emails',
      title: 'Emails',
      Icon: IconMail,
      hide: !shouldDisplayEmailsTab,
    },
    {
      id: 'calendar',
      title: 'Calendar',
      Icon: IconCalendarEvent,
      hide: !shouldDisplayCalendarTab,
    },
    {
      id: 'workflow',
      title: 'Workflow',
      Icon: IconSettings,
      hide: !isWorkflow,
    },
    {
      id: 'workflowVersion',
      title: 'Workflow Version',
      Icon: IconSettings,
      hide: !isWorkflowVersion,
    },
  ];
};
