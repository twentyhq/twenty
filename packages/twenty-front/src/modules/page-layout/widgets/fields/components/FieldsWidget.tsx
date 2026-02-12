import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { isActivityTargetField } from '@/object-record/record-field-list/utils/categorizeRelationFields';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldsWidgetCellEditModePortal } from '@/page-layout/widgets/fields/components/FieldsWidgetCellEditModePortal';
import { FieldsWidgetCellHoveredPortal } from '@/page-layout/widgets/fields/components/FieldsWidgetCellHoveredPortal';
import { FieldsWidgetSectionContainer } from '@/page-layout/widgets/fields/components/FieldsWidgetSectionContainer';
import { useFieldsWidgetSectionsWithIndices } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetSectionsWithIndices';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledPropertyBox = styled.div`
  align-self: stretch;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

type FieldsWidgetProps = {
  widget: PageLayoutWidget;
};

export const FieldsWidget = ({ widget }: FieldsWidgetProps) => {
  const targetRecord = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  const instanceId = `${widget.id}-${targetRecord.id}${isInRightDrawer ? '-right-drawer' : ''}`;

  const { recordLoading, isPrefetchLoading } = useRecordShowContainerData({
    objectRecordId: targetRecord.id,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: targetRecord.id,
    objectMetadataId: objectMetadataItem.id,
  });

  const setRecordFieldListHoverPosition = useSetRecoilComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  const { sectionsWithFieldIndices } = useFieldsWidgetSectionsWithIndices(
    targetRecord.targetObjectNameSingular,
  );

  const hasFieldsToDisplay = sectionsWithFieldIndices.length > 0;

  if (!hasFieldsToDisplay) {
    return (
      <RightDrawerProvider value={{ isInRightDrawer }}>
        <StyledContainer>
          <AnimatedPlaceholderEmptyContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
          >
            <AnimatedPlaceholder type="noRecord" />
            <AnimatedPlaceholderEmptyTextContainer>
              <AnimatedPlaceholderEmptyTitle>
                {t`No fields to display`}
              </AnimatedPlaceholderEmptyTitle>
              <AnimatedPlaceholderEmptySubTitle>
                {t`Configure this widget to display fields`}
              </AnimatedPlaceholderEmptySubTitle>
            </AnimatedPlaceholderEmptyTextContainer>
          </AnimatedPlaceholderEmptyContainer>
        </StyledContainer>
      </RightDrawerProvider>
    );
  }

  return (
    <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
      <StyledContainer>
        <RecordFieldListComponentInstanceContext.Provider
          value={{
            instanceId,
          }}
        >
          {sectionsWithFieldIndices.map((section) => (
            <FieldsWidgetSectionContainer
              key={section.id}
              title={section.title}
            >
              <StyledPropertyBox>
                {isPrefetchLoading ? (
                  <PropertyBoxSkeletonLoader />
                ) : (
                  <>
                    {section.fields.map(
                      ({ field: fieldMetadataItem, globalIndex }) => {
                        const isActivityTarget = isActivityTargetField(
                          fieldMetadataItem.name,
                          targetRecord.targetObjectNameSingular,
                        );

                        return (
                          <FieldContext.Provider
                            key={targetRecord.id + fieldMetadataItem.id}
                            value={{
                              recordId: targetRecord.id,
                              maxWidth: 200,
                              isLabelIdentifier: false,
                              fieldDefinition:
                                formatFieldMetadataItemAsColumnDefinition({
                                  field: fieldMetadataItem,
                                  position: globalIndex,
                                  objectMetadataItem,
                                  showLabel: true,
                                  labelWidth: 90,
                                }),
                              useUpdateRecord: useUpdateOneObjectRecordMutation,
                              isDisplayModeFixHeight: true,
                              isRecordFieldReadOnly: isRecordFieldReadOnly({
                                isRecordReadOnly,
                                objectPermissions:
                                  getObjectPermissionsFromMapByObjectMetadataId(
                                    {
                                      objectPermissionsByObjectMetadataId,
                                      objectMetadataId: objectMetadataItem.id,
                                    },
                                  ),
                                fieldMetadataItem: {
                                  id: fieldMetadataItem.id,
                                  isUIReadOnly:
                                    fieldMetadataItem.isUIReadOnly ?? false,
                                },
                              }),
                              onMouseEnter: () =>
                                setRecordFieldListHoverPosition(globalIndex),
                              anchorId: `${getRecordFieldInputInstanceId({
                                recordId: targetRecord.id,
                                fieldName: fieldMetadataItem.name,
                                prefix: instanceId,
                              })}`,
                            }}
                          >
                            {isActivityTarget ? (
                              <ActivityTargetsInlineCell
                                componentInstanceId={getRecordFieldInputInstanceId(
                                  {
                                    recordId: targetRecord.id,
                                    fieldName: fieldMetadataItem.name,
                                    prefix: instanceId,
                                  },
                                )}
                                activityObjectNameSingular={
                                  targetRecord.targetObjectNameSingular as
                                    | CoreObjectNameSingular.Note
                                    | CoreObjectNameSingular.Task
                                }
                                activityRecordId={targetRecord.id}
                                showLabel={true}
                                maxWidth={200}
                              />
                            ) : (
                              <RecordFieldComponentInstanceContext.Provider
                                value={{
                                  instanceId: getRecordFieldInputInstanceId({
                                    recordId: targetRecord.id,
                                    fieldName: fieldMetadataItem.name,
                                    prefix: instanceId,
                                  }),
                                }}
                              >
                                <RecordInlineCell loading={recordLoading} />
                              </RecordFieldComponentInstanceContext.Provider>
                            )}
                          </FieldContext.Provider>
                        );
                      },
                    )}
                  </>
                )}
              </StyledPropertyBox>
            </FieldsWidgetSectionContainer>
          ))}

          <FieldsWidgetCellHoveredPortal
            objectMetadataItem={objectMetadataItem}
            recordId={targetRecord.id}
          />
          <FieldsWidgetCellEditModePortal
            objectMetadataItem={objectMetadataItem}
            recordId={targetRecord.id}
          />
        </RecordFieldListComponentInstanceContext.Provider>
      </StyledContainer>
    </RecordFieldsScopeContextProvider>
  );
};
