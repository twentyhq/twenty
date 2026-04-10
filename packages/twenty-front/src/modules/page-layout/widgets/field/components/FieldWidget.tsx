import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldWidgetDisplay } from '@/page-layout/widgets/field/components/FieldWidgetDisplay';
import { FieldWidgetRichTextEditor } from '@/page-layout/widgets/field/components/FieldWidgetRichTextEditor';
import { FieldWidgetMorphRelationCard } from '@/page-layout/widgets/field/components/FieldWidgetMorphRelationCard';
import { FieldWidgetMorphRelationField } from '@/page-layout/widgets/field/components/FieldWidgetMorphRelationField';
import { FieldWidgetRelationCard } from '@/page-layout/widgets/field/components/FieldWidgetRelationCard';
import { FieldWidgetRelationField } from '@/page-layout/widgets/field/components/FieldWidgetRelationField';
import { assertFieldWidgetOrThrow } from '@/page-layout/widgets/field/utils/assertFieldWidgetOrThrow';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
`;

type FieldWidgetProps = {
  widget: PageLayoutWidget;
};

export const FieldWidget = ({ widget }: FieldWidgetProps) => {
  assertFieldWidgetOrThrow(widget);

  const targetRecord = useTargetRecord();
  const { isInSidePanel } = useLayoutRenderingContext();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const fieldMetadataId = widget.configuration.fieldMetadataId;

  const resolvedFieldMetadataId =
    useResolveFieldMetadataIdFromNameOrId(fieldMetadataId);

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  const record = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: targetRecord.id,
    fieldName: fieldMetadataItem?.name ?? '',
  });

  if (!isDefined(fieldMetadataItem) || !fieldMetadataItem.isActive) {
    return (
      <SidePanelProvider value={{ isInSidePanel }}>
        <StyledContainer>
          <AnimatedPlaceholderEmptyContainer
            // oxlint-disable-next-line react/jsx-props-no-spreading
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
      </SidePanelProvider>
    );
  }

  const fieldDefinition = formatFieldMetadataItemAsColumnDefinition({
    field: fieldMetadataItem,
    position: 0,
    objectMetadataItem,
    showLabel: true,
    labelWidth: 90,
  });

  const fieldDisplayMode = widget.configuration.fieldDisplayMode;

  if (isFieldMorphRelation(fieldDefinition)) {
    if (fieldDisplayMode === FieldDisplayMode.CARD) {
      return (
        <FieldWidgetMorphRelationCard
          fieldDefinition={fieldDefinition}
          recordId={targetRecord.id}
          isInSidePanel={isInSidePanel}
        />
      );
    }

    return (
      <FieldWidgetMorphRelationField
        fieldDefinition={fieldDefinition}
        recordId={targetRecord.id}
        isInSidePanel={isInSidePanel}
      />
    );
  }

  if (isFieldRelation(fieldDefinition)) {
    if (fieldDisplayMode === FieldDisplayMode.CARD) {
      return (
        <FieldWidgetRelationCard
          fieldDefinition={fieldDefinition}
          relationValue={record}
          isInSidePanel={isInSidePanel}
        />
      );
    }

    return (
      <FieldWidgetRelationField
        fieldDefinition={fieldDefinition}
        relationValue={record}
        isInSidePanel={isInSidePanel}
      />
    );
  }

  if (
    isFieldRichText(fieldDefinition) &&
    fieldDisplayMode === FieldDisplayMode.EDITOR
  ) {
    return (
      <FieldWidgetRichTextEditor
        fieldMetadataItem={fieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
        recordId={targetRecord.id}
      />
    );
  }

  return (
    <FieldWidgetDisplay
      fieldDefinition={fieldDefinition}
      fieldMetadataItem={fieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={targetRecord.id}
      isInSidePanel={isInSidePanel}
    />
  );
};
