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
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertFieldWidgetOrThrow } from '@/page-layout/widgets/field/utils/assertFieldWidgetOrThrow';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
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
  assertFieldWidgetOrThrow(widget);

  const targetRecord = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  const { isPrefetchLoading } = useRecordShowContainerData({
    objectRecordId: targetRecord.id,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const fieldMetadataId = widget.configuration.fieldMetadataId;

  const resolvedFieldMetadataId =
    useResolveFieldMetadataIdFromNameOrId(fieldMetadataId);

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  const record = useRecoilValue(
    recordStoreFamilySelector({
      recordId: targetRecord.id,
      fieldName: fieldMetadataItem?.name ?? '',
    }),
  );

  if (isPrefetchLoading) {
    return (
      <RightDrawerProvider value={{ isInRightDrawer }}>
        <StyledContainer>
          <PropertyBoxSkeletonLoader />
        </StyledContainer>
      </RightDrawerProvider>
    );
  }

  if (!isDefined(fieldMetadataItem) || !fieldMetadataItem.isActive) {
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

  if (isFieldRelation(fieldDefinition)) {
    const relationValue = record as any;
    const isOneToMany = fieldDefinition.metadata.relationType === 'ONE_TO_MANY';
    const relationObjectNameSingular =
      fieldDefinition.metadata.relationObjectMetadataNameSingular;

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

    if (!isOneToMany && isDefined(relationValue)) {
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
