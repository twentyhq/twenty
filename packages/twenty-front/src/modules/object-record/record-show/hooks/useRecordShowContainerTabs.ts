import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { BASE_RECORD_LAYOUT } from '@/object-record/record-show/constants/BaseRecordLayout';
import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { type RecordLayoutTab } from '@/ui/layout/tab-list/types/RecordLayoutTab';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconHome,
  IconLayoutDashboard,
  IconMail,
  IconNotes,
  IconSettings,
} from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useRecordShowContainerTabs = (
  loading: boolean,
  targetObjectNameSingular: CoreObjectNameSingular,
  isInRightDrawer: boolean,
  objectMetadataItem: ObjectMetadataItem,
): { layout: RecordLayout; tabs: SingleTabProps[] } => {
  const isMobile = useIsMobile();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  // Object-specific layouts that override or extend the base layout
  const OBJECT_SPECIFIC_LAYOUTS: Partial<
    Record<CoreObjectNameSingular, RecordLayout>
  > = useMemo(
    () => ({
      [CoreObjectNameSingular.Note]: {
        tabs: {
          richText: {
            title: 'Note',
            position: 101,
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
          tasks: null,
          notes: null,
        },
      },
      [CoreObjectNameSingular.Task]: {
        tabs: {
          richText: {
            title: 'Note',
            position: 101,
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
          tasks: null,
          notes: null,
        },
      },
      [CoreObjectNameSingular.Company]: {
        tabs: {
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
      },
      [CoreObjectNameSingular.Person]: {
        tabs: {
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
      },
      [CoreObjectNameSingular.Opportunity]: {
        tabs: {
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
      },
      [CoreObjectNameSingular.Workflow]: {
        hideSummaryAndFields: true,
        tabs: {
          workflow: {
            title: 'Flow',
            position: 101,
            Icon: IconSettings,
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
      },
      [CoreObjectNameSingular.WorkflowVersion]: {
        tabs: {
          workflowVersion: {
            title: 'Flow',
            position: 101,
            Icon: IconSettings,
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
      },
      [CoreObjectNameSingular.WorkflowRun]: {
        tabs: {
          workflowRun: {
            title: 'Flow',
            position: 101,
            Icon: IconSettings,
            cards: [{ type: CardType.WorkflowRunCard }],
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
      },
      [CoreObjectNameSingular.Dashboard]: {
        hideSummaryAndFields: true,
        hideFieldsInSidePanel: true,
        tabs: {
          dashboard: {
            title: 'Dashboard',
            position: 101,
            Icon: IconLayoutDashboard,
            cards: [{ type: CardType.DashboardCard }],
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
      },
    }),
    [],
  );

  const baseRecordLayout = BASE_RECORD_LAYOUT;

  // Merge base layout with object-specific layout
  const recordLayout: RecordLayout = useMemo(() => {
    return {
      ...baseRecordLayout,
      ...(OBJECT_SPECIFIC_LAYOUTS[targetObjectNameSingular] || {}),
      tabs: {
        ...baseRecordLayout.tabs,
        ...(OBJECT_SPECIFIC_LAYOUTS[targetObjectNameSingular]?.tabs || {}),
      },
    };
  }, [OBJECT_SPECIFIC_LAYOUTS, baseRecordLayout, targetObjectNameSingular]);

  return {
    layout: recordLayout,
    tabs: Object.entries(recordLayout.tabs)
      .filter(
        (entry): entry is [string, NonNullable<RecordLayoutTab>] =>
          entry[1] !== null && entry[1] !== undefined,
      )
      .sort(([, a], [, b]) => a.position - b.position)
      .map(([key, { title, Icon, hide, cards, targetObjectNameSingular }]) => {
        // Special handling for fields tab
        if (key === 'fields') {
          return {
            id: key,
            title,
            Icon,
            cards,
            hide:
              !(isMobile || isInRightDrawer) ||
              recordLayout.hideFieldsInSidePanel,
          };
        }

        const baseHide =
          (hide.ifMobile && isMobile) ||
          (hide.ifDesktop && !isMobile) ||
          (hide.ifInRightDrawer && isInRightDrawer);

        const featureNotEnabled =
          hide.ifFeaturesDisabled.length > 0 &&
          !hide.ifFeaturesDisabled.every((flagKey) => {
            return !!currentWorkspace?.featureFlags?.find(
              (flag) => flag.key === flagKey && flag.value,
            );
          });

        const targetObjectMetadataId = objectMetadataItems.find(
          (item) => item.nameSingular === targetObjectNameSingular,
        )?.id;

        const permissionHide =
          hide.ifNoReadPermission &&
          isDefined(targetObjectNameSingular) &&
          !getObjectPermissionsFromMapByObjectMetadataId({
            objectPermissionsByObjectMetadataId,
            objectMetadataId: targetObjectMetadataId ?? '',
          })?.canReadObjectRecords;

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
                field.type === FieldMetadataType.RELATION &&
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
            relationsDontExist ||
            permissionHide,
        };
      })
      // When isInRightDrawer === true, we merge first and second tab into first tab
      .reduce<SingleTabProps[]>((acc, tab, index, array) => {
        if (isInRightDrawer && array.length > 1) {
          if (index === 0) {
            return [
              ...acc,
              {
                id: 'home',
                title: 'Home',
                Icon: IconHome,
                cards: [
                  ...(tab.hide ? [] : tab.cards),
                  ...(array[1].hide ? [] : array[1].cards),
                ],
                hide: false,
              },
            ];
          }
          if (index === 1) {
            return acc;
          }
        }
        return [...acc, tab];
      }, []),
  };
};
