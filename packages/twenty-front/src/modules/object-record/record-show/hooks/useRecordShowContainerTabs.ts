import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { BASE_RECORD_LAYOUT } from '@/object-record/record-show/constants/baseRecordLayout';
import { CardType } from '@/object-record/record-show/types/CardType';
import { SingleTabProps } from '@/ui/layout/tab/components/TabList';
import { TabDefinition } from '@/ui/layout/tab/types/TabDefinition';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import {
  IconCalendarEvent,
  IconMail,
  IconNotes,
  IconPrinter,
  IconSettings,
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

  // Object-specific layouts that override or extend the base layout
  const OBJECT_SPECIFIC_LAYOUTS: Partial<
    Record<CoreObjectNameSingular, Record<string, TabDefinition>>
  > = {
    [CoreObjectNameSingular.Note]: {
      richText: {
        title: 'Note',
        position: 0,
        Icon: IconNotes,
        cards: [{ type: CardType.RichTextCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: [],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
    },
    [CoreObjectNameSingular.Task]: {
      richText: {
        title: 'Note',
        position: 0,
        Icon: IconNotes,
        cards: [{ type: CardType.RichTextCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: [],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
    },
    [CoreObjectNameSingular.Company]: {
      emails: {
        title: 'Emails',
        position: 600,
        Icon: IconMail,
        cards: [{ type: CardType.EmailCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: [],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
      calendar: {
        title: 'Calendar',
        position: 700,
        Icon: IconCalendarEvent,
        cards: [{ type: CardType.CalendarCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: [],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
    },
    [CoreObjectNameSingular.Person]: {
      emails: {
        title: 'Emails',
        position: 600,
        Icon: IconMail,
        cards: [{ type: CardType.EmailCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: [],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
      calendar: {
        title: 'Calendar',
        position: 700,
        Icon: IconCalendarEvent,
        cards: [{ type: CardType.CalendarCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: [],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
    },
    [CoreObjectNameSingular.Workflow]: {
      workflow: {
        title: 'Workflow',
        position: 0,
        Icon: IconSettings,
        cards: [{ type: CardType.WorkflowCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: ['IS_WORKFLOW_ENABLED'],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
    },
    [CoreObjectNameSingular.WorkflowVersion]: {
      workflowVersion: {
        title: 'Flow',
        position: 0,
        Icon: IconSettings,
        cards: [{ type: CardType.WorkflowVersionCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: ['IS_WORKFLOW_ENABLED'],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
    },
    [CoreObjectNameSingular.WorkflowRun]: {
      workflowRunOutput: {
        title: 'Output',
        position: 0,
        Icon: IconPrinter,
        cards: [{ type: CardType.WorkflowRunOutputCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: ['IS_WORKFLOW_ENABLED'],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
      workflowRunFlow: {
        title: 'Flow',
        position: 0,
        Icon: IconSettings,
        cards: [{ type: CardType.WorkflowRunCard }],
        hide: {
          ifMobile: false,
          ifDesktop: false,
          ifInRightDrawer: false,
          ifFeaturesDisabled: ['IS_WORKFLOW_ENABLED'],
          ifRequiredObjectsInactive: [],
          ifRelationsMissing: [],
        },
      },
    },
  };

  // Merge base layout with object-specific layout
  const tabDefinitions = {
    ...BASE_RECORD_LAYOUT,
    ...(OBJECT_SPECIFIC_LAYOUTS[targetObjectNameSingular] || {}),
  };

  return Object.entries(tabDefinitions)
    .sort(([, a], [, b]) => a.position - b.position)
    .map(([key, { title, Icon, hide, cards }]) => {
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
          relationsDontExist,
      };
    });
};
