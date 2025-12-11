import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useTemporaryFieldConfiguration';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledRelationChipsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`;

type FieldWidgetProps = {
  widget: PageLayoutWidget;
};

export const FieldWidget = ({ widget }: FieldWidgetProps) => {
  const targetRecord = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  const configuration = widget.configuration as FieldConfiguration | null;

  const { isPrefetchLoading } = useRecordShowContainerData({
    objectRecordId: targetRecord.id,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  console.log(objectMetadataItem.fields);

  // Resolve field ID from name or ID
  const resolvedFieldMetadataId = useResolveFieldMetadataIdFromNameOrId(
    configuration?.fieldMetadataId ?? '',
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  const record = useRecoilValue(
    recordStoreFamilySelector({
      recordId: targetRecord.id,
      fieldName: fieldMetadataItem?.name ?? '',
    }),
  );

  // Show loading state during prefetch
  if (isPrefetchLoading) {
    return (
      <RightDrawerProvider value={{ isInRightDrawer }}>
        <StyledContainer>
          <PropertyBoxSkeletonLoader />
        </StyledContainer>
      </RightDrawerProvider>
    );
  }

  // Show empty state if no configuration or field not found
  if (!configuration || !fieldMetadataItem || !fieldMetadataItem.isActive) {
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
                {t`No field configured`}
              </AnimatedPlaceholderEmptyTitle>
              <AnimatedPlaceholderEmptySubTitle>
                {t`Select a field to display in this widget`}
              </AnimatedPlaceholderEmptySubTitle>
            </AnimatedPlaceholderEmptyTextContainer>
          </AnimatedPlaceholderEmptyContainer>
        </StyledContainer>
      </RightDrawerProvider>
    );
  }

  const fieldDefinition = formatFieldMetadataItemAsColumnDefinition({
    field: fieldMetadataItem,
    position: 0,
    objectMetadataItem,
    showLabel: true,
    labelWidth: 90,
  });

  // Render relation fields with chips
  if (isFieldRelation(fieldDefinition)) {
    const relationValue = record as any;
    const isOneToMany = fieldDefinition.metadata.relationType === 'ONE_TO_MANY';
    const relationObjectNameSingular =
      fieldDefinition.metadata.relationObjectMetadataNameSingular;

    // Handle ONE_TO_MANY (array of records)
    if (isOneToMany && Array.isArray(relationValue)) {
      return (
        <RightDrawerProvider value={{ isInRightDrawer }}>
          <StyledContainer>
            <StyledRelationChipsContainer>
              {relationValue.map((relatedRecord: any) => (
                <RecordChip
                  key={relatedRecord.id}
                  objectNameSingular={relationObjectNameSingular}
                  record={relatedRecord}
                />
              ))}
            </StyledRelationChipsContainer>
          </StyledContainer>
        </RightDrawerProvider>
      );
    }

    // Handle MANY_TO_ONE (single record or null)
    if (!isOneToMany && relationValue !== null && relationValue !== undefined) {
      return (
        <RightDrawerProvider value={{ isInRightDrawer }}>
          <StyledContainer>
            <RecordChip
              objectNameSingular={relationObjectNameSingular}
              record={relationValue}
            />
          </StyledContainer>
        </RightDrawerProvider>
      );
    }

    // Empty relation
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
                {t`No related records`}
              </AnimatedPlaceholderEmptyTitle>
            </AnimatedPlaceholderEmptyTextContainer>
          </AnimatedPlaceholderEmptyContainer>
        </StyledContainer>
      </RightDrawerProvider>
    );
  }

  // Render standalone fields with FieldDisplay (always readonly)
  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <FieldContext.Provider
          value={{
            recordId: targetRecord.id,
            maxWidth: 200,
            isLabelIdentifier: false,
            fieldDefinition,
            isDisplayModeFixHeight: true,
            isRecordFieldReadOnly: true,
          }}
        >
          <FieldDisplay />
        </FieldContext.Provider>
      </StyledContainer>
    </RightDrawerProvider>
  );
};
