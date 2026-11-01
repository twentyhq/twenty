import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { FieldDescriptionTooltipProvider } from '@/object-record/record-field/ui/components/FieldDescriptionTooltipProvider';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldsWidgetCellEditModePortal } from '@/page-layout/widgets/fields/components/FieldsWidgetCellEditModePortal';
import { FieldsWidgetCellHoveredPortal } from '@/page-layout/widgets/fields/components/FieldsWidgetCellHoveredPortal';
import { FieldsWidgetFieldList } from '@/page-layout/widgets/fields/components/FieldsWidgetFieldList';
import { FieldsWidgetGroupContainer } from '@/page-layout/widgets/fields/components/FieldsWidgetGroupContainer';
import { useFieldsWidgetGroupsForDisplay } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetGroupsForDisplay';
import { useFieldsWidgetHiddenFieldsForDisplay } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetHiddenFieldsForDisplay';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useMemo } from 'react';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { themeCssVariables } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';
import { type FieldsConfiguration } from '~/generated-metadata/graphql';

const StyledPropertyBox = styled.div`
  align-self: stretch;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledInlineFieldsPropertyBox = styled.div<{
  hasMoreGroup: boolean;
}>`
  align-self: stretch;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${({ hasMoreGroup }) =>
    hasMoreGroup ? themeCssVariables.spacing[3] : '0'};
  padding-top: 0;
`;

type FieldsWidgetProps = {
  widget: PageLayoutWidget;
};

export const FieldsWidget = ({ widget }: FieldsWidgetProps) => {
  const targetRecord = useTargetRecord();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';

  const instanceId = `fields-${widget.id}-${targetRecord.id}${isInSidePanel ? '-side-panel' : ''}`;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const fieldsConfiguration = widget.configuration as FieldsConfiguration;

  const { groups, displayMode } = useFieldsWidgetGroupsForDisplay({
    widgetId: widget.id,
    viewId: fieldsConfiguration.viewId ?? null,
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const { hiddenFields } = useFieldsWidgetHiddenFieldsForDisplay({
    widgetId: widget.id,
    viewId: fieldsConfiguration.viewId ?? null,
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  // Field-level permissions: fields the role has No Access to stay hidden
  // on the record page, like in the table. Editor paths (layout settings)
  // keep the unfiltered field list from useFieldsWidgetFields.
  const readableFieldMetadataIds = useMemo(
    () =>
      isDefined(objectMetadataItem)
        ? new Set(objectMetadataItem.readableFields.map((field) => field.id))
        : null,
    [objectMetadataItem],
  );

  const permittedGroups = useMemo(() => {
    if (readableFieldMetadataIds === null) {
      return groups;
    }

    let nextGlobalIndex = 0;

    return groups
      .map((group) => ({
        ...group,
        fields: group.fields
          .filter((field) =>
            readableFieldMetadataIds.has(field.fieldMetadataItem.id),
          )
          // Reindex so globalIndex matches the flattened list below;
          // hover and edit portals resolve metadata by globalIndex.
          .map((field) => ({ ...field, globalIndex: nextGlobalIndex++ })),
      }))
      .filter((group) => group.fields.length > 0);
  }, [groups, readableFieldMetadataIds]);

  const permittedHiddenFields = useMemo(() => {
    if (readableFieldMetadataIds === null) {
      return hiddenFields;
    }

    return hiddenFields.filter((field) =>
      readableFieldMetadataIds.has(field.fieldMetadataItem.id),
    );
  }, [hiddenFields, readableFieldMetadataIds]);

  const shouldShowHiddenFields =
    fieldsConfiguration.shouldAllowUserToSeeHiddenFields === true &&
    permittedHiddenFields.length > 0;

  const visibleFields = permittedGroups.flatMap((group) => group.fields);

  const hiddenFieldsWithOffsetGlobalIndex = shouldShowHiddenFields
    ? permittedHiddenFields.map((field) => ({
        ...field,
        globalIndex: field.globalIndex + visibleFields.length,
      }))
    : [];

  const flattenedFieldMetadataItems = [
    ...visibleFields.map((field) => field.fieldMetadataItem),
    ...hiddenFieldsWithOffsetGlobalIndex.map(
      (field) => field.fieldMetadataItem,
    ),
  ];

  const hasFieldsToDisplay =
    permittedGroups.length > 0 || shouldShowHiddenFields;

  const shouldDisplayGroupHeaders =
    displayMode === 'grouped' && permittedGroups.length > 1;

  if (!hasFieldsToDisplay) {
    return (
      <SidePanelProvider value={{ isInSidePanel }}>
        <StyledWidgetScrollContainer>
          <EmptyState.Root>
            <AnimatedPlaceholder type="noRecord" />
            <EmptyState.Content>
              <EmptyState.Title>{t`No fields to display`}</EmptyState.Title>
              <EmptyState.Description>
                {t`Configure this widget to display fields`}
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState.Root>
        </StyledWidgetScrollContainer>
      </SidePanelProvider>
    );
  }

  return (
    <FieldDescriptionTooltipProvider>
      <StyledWidgetScrollContainer>
        <RecordFieldListComponentInstanceContext.Provider
          value={{
            instanceId,
          }}
        >
          {shouldDisplayGroupHeaders ? (
            permittedGroups.map((group) => (
              <FieldsWidgetGroupContainer key={group.id} title={group.name}>
                <StyledPropertyBox>
                  <FieldsWidgetFieldList
                    fields={group.fields}
                    instanceId={instanceId}
                  />
                </StyledPropertyBox>
              </FieldsWidgetGroupContainer>
            ))
          ) : (
            <StyledInlineFieldsPropertyBox
              hasMoreGroup={shouldShowHiddenFields}
            >
              <FieldsWidgetFieldList
                fields={visibleFields}
                instanceId={instanceId}
              />
            </StyledInlineFieldsPropertyBox>
          )}

          {shouldShowHiddenFields && (
            <FieldsWidgetGroupContainer
              title={t`More (${hiddenFieldsWithOffsetGlobalIndex.length})`}
              defaultExpanded={false}
            >
              <StyledPropertyBox>
                <FieldsWidgetFieldList
                  fields={hiddenFieldsWithOffsetGlobalIndex}
                  instanceId={instanceId}
                />
              </StyledPropertyBox>
            </FieldsWidgetGroupContainer>
          )}

          <FieldsWidgetCellHoveredPortal
            objectMetadataItem={objectMetadataItem}
            recordId={targetRecord.id}
            flattenedFieldMetadataItems={flattenedFieldMetadataItems}
          />
          <FieldsWidgetCellEditModePortal
            objectMetadataItem={objectMetadataItem}
            recordId={targetRecord.id}
            flattenedFieldMetadataItems={flattenedFieldMetadataItems}
          />
        </RecordFieldListComponentInstanceContext.Provider>
      </StyledWidgetScrollContainer>
    </FieldDescriptionTooltipProvider>
  );
};
