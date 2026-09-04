import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Decorator } from '@storybook/react-vite';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const CALL_RECORDING_OBJECT_METADATA_ID =
  '20202020-0000-0000-0000-000000000010';

const CALL_RECORDING_FIELD_METADATA_IDS = {
  id: '20202020-0000-0000-0000-000000000011',
  status: '20202020-0000-0000-0000-000000000012',
  transcript: '20202020-0000-0000-0000-000000000013',
  summary: '20202020-0000-0000-0000-000000000014',
  video: '20202020-0000-0000-0000-000000000015',
  createdAt: '20202020-0000-0000-0000-000000000016',
} as const;

const getFieldMetadataItemByTypeOrThrow = (
  objectMetadataItems: ReturnType<
    typeof getTestEnrichedObjectMetadataItemsMock
  >,
  type: FieldMetadataType,
): FieldMetadataItem => {
  const fieldMetadataItem = objectMetadataItems
    .flatMap((objectMetadataItem) => objectMetadataItem.fields)
    .find((field) => field.type === type);

  if (!isDefined(fieldMetadataItem)) {
    throw new Error(`No test field metadata found for type ${type}`);
  }

  return fieldMetadataItem;
};

export const getCallRecordingWidgetStoryDecorator =
  ({
    pageLayout,
    tabId,
    widgetId,
  }: {
    pageLayout: PageLayout;
    tabId: string;
    widgetId: string;
  }): Decorator =>
  (Story, context) => {
    const widget = pageLayout.tabs
      .flatMap((tab) => tab.widgets)
      .find((pageLayoutWidget) => pageLayoutWidget.id === widgetId);

    if (!isDefined(widget)) {
      throw new Error(`Widget ${widgetId} was not found in the page layout`);
    }

    const testObjectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
    const calendarEventObjectMetadataItem = getMockObjectMetadataItemOrThrow(
      CoreObjectNameSingular.CalendarEvent,
    );
    const createCallRecordingFieldMetadataItem = ({
      id,
      name,
      label,
      type,
    }: {
      id: string;
      name: string;
      label: string;
      type: FieldMetadataType;
    }): FieldMetadataItem => ({
      ...getFieldMetadataItemByTypeOrThrow(testObjectMetadataItems, type),
      id,
      universalIdentifier: id,
      name,
      label,
      objectMetadataId: CALL_RECORDING_OBJECT_METADATA_ID,
    });
    const callRecordingFieldMetadataItems = [
      createCallRecordingFieldMetadataItem({
        id: CALL_RECORDING_FIELD_METADATA_IDS.id,
        name: 'id',
        label: 'Id',
        type: FieldMetadataType.UUID,
      }),
      createCallRecordingFieldMetadataItem({
        id: CALL_RECORDING_FIELD_METADATA_IDS.status,
        name: 'status',
        label: 'Status',
        type: FieldMetadataType.SELECT,
      }),
      createCallRecordingFieldMetadataItem({
        id: CALL_RECORDING_FIELD_METADATA_IDS.transcript,
        name: 'transcript',
        label: 'Transcript',
        type: FieldMetadataType.RAW_JSON,
      }),
      createCallRecordingFieldMetadataItem({
        id: CALL_RECORDING_FIELD_METADATA_IDS.summary,
        name: 'summary',
        label: 'Summary',
        type: FieldMetadataType.RICH_TEXT,
      }),
      createCallRecordingFieldMetadataItem({
        id: CALL_RECORDING_FIELD_METADATA_IDS.video,
        name: 'video',
        label: 'Video',
        type: FieldMetadataType.FILES,
      }),
      createCallRecordingFieldMetadataItem({
        id: CALL_RECORDING_FIELD_METADATA_IDS.createdAt,
        name: 'createdAt',
        label: 'Creation date',
        type: FieldMetadataType.DATE_TIME,
      }),
    ];

    setTestObjectMetadataItemsInMetadataStore(jotaiStore, [
      ...testObjectMetadataItems,
      {
        ...calendarEventObjectMetadataItem,
        id: CALL_RECORDING_OBJECT_METADATA_ID,
        nameSingular: CoreObjectNameSingular.CallRecording,
        namePlural: 'callRecordings',
        labelSingular: 'Call Recording',
        labelPlural: 'Call Recordings',
        labelIdentifierFieldMetadataId: CALL_RECORDING_FIELD_METADATA_IDS.id,
        fields: callRecordingFieldMetadataItems,
        readableFields: callRecordingFieldMetadataItems,
        updatableFields: callRecordingFieldMetadataItems,
      },
    ]);
    jotaiStore.set(isMinimalMetadataReadyState.atom, true);
    jotaiStore.set(currentUserWorkspaceState.atom, {
      permissionFlags: [],
      twoFactorAuthenticationMethodSummary: null,
      objectsPermissions: [
        {
          objectMetadataId: CALL_RECORDING_OBJECT_METADATA_ID,
          canReadObjectRecords: !isDefined(context.args.restriction),
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      ],
    });
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      pageLayout,
    );
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      pageLayout,
    );

    return (
      <div style={{ display: 'flex', height: 360, width: 500 }}>
        <PageLayoutTestWrapper store={jotaiStore}>
          <LayoutRenderingProvider
            value={{
              layoutType: PageLayoutType.RECORD_PAGE,
              targetRecordIdentifier: {
                id: 'calendar-event-id',
                targetObjectNameSingular: CoreObjectNameSingular.CalendarEvent,
              },
            }}
          >
            <PageLayoutContentProvider
              value={{
                tabId,
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                presentation: 'stack',
              }}
            >
              <WidgetComponentInstanceContext.Provider
                value={{ instanceId: widget.id }}
              >
                <WidgetCard
                  variant="flush"
                  isEditable={false}
                  isEditing={false}
                  isDragging={false}
                  isResizing={false}
                >
                  <WidgetCardHeader
                    className="widget-card-header"
                    widgetId={widget.id}
                    variant="flush"
                    isInEditMode={false}
                    hasAccess={true}
                    isResizing={false}
                    title={widget.title}
                  />
                  <WidgetCardContent
                    variant="flush"
                    hasHeader={true}
                    isEditable={false}
                  >
                    <StyledWidgetScrollContainer>
                      <Story />
                    </StyledWidgetScrollContainer>
                  </WidgetCardContent>
                </WidgetCard>
              </WidgetComponentInstanceContext.Provider>
            </PageLayoutContentProvider>
          </LayoutRenderingProvider>
        </PageLayoutTestWrapper>
      </div>
    );
  };
