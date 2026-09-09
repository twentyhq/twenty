import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldWidgetDisplay } from '@/page-layout/widgets/field/components/FieldWidgetDisplay';
import { FieldWidgetJunctionRelationCard } from '@/page-layout/widgets/field/components/FieldWidgetJunctionRelationCard';
import { FieldWidgetJunctionRelationField } from '@/page-layout/widgets/field/components/FieldWidgetJunctionRelationField';
import { FieldWidgetRichTextEditor } from '@/page-layout/widgets/field/components/FieldWidgetRichTextEditor';
import { FieldWidgetMorphRelationCard } from '@/page-layout/widgets/field/components/FieldWidgetMorphRelationCard';
import { FieldWidgetMorphRelationField } from '@/page-layout/widgets/field/components/FieldWidgetMorphRelationField';
import { FieldWidgetRelationCard } from '@/page-layout/widgets/field/components/FieldWidgetRelationCard';
import { FieldWidgetRelationField } from '@/page-layout/widgets/field/components/FieldWidgetRelationField';
import { FieldWidgetRelationTable } from '@/page-layout/widgets/field/components/FieldWidgetRelationTable';
import { assertFieldWidgetOrThrow } from '@/page-layout/widgets/field/utils/assertFieldWidgetOrThrow';
import { getFieldWidgetEffectiveDisplayMode } from '@/page-layout/widgets/field/utils/getFieldWidgetEffectiveDisplayMode';
import { FieldWidgetTextEditor } from '@/page-layout/widgets/field/components/FieldWidgetTextEditor';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
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
} from 'twenty-ui/feedback';
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
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

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
          <AnimatedPlaceholderEmptyContainer>
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

  const fieldDisplayMode = getFieldWidgetEffectiveDisplayMode(
    widget.configuration,
  );

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
    const junctionConfig = resolveJunctionConfig({
      settings: fieldDefinition.metadata.settings,
      relationObjectMetadataId:
        fieldDefinition.metadata.relationObjectMetadataId,
      relationTargetFieldMetadataId:
        fieldDefinition.metadata.relationFieldMetadataId,
      sourceObjectMetadataId: objectMetadataItem.id,
      objectMetadataItems,
    });

    if (isDefined(junctionConfig)) {
      if (!isUsableJunctionConfig(junctionConfig)) {
        return null;
      }

      if (fieldDisplayMode === FieldDisplayMode.CARD) {
        return (
          <FieldWidgetJunctionRelationCard
            fieldDefinition={fieldDefinition}
            relationValue={record}
            isInSidePanel={isInSidePanel}
            junctionConfig={junctionConfig}
          />
        );
      }

      if (fieldDisplayMode === FieldDisplayMode.TABLE) {
        return (
          <FieldWidgetRelationTable
            fieldDefinition={fieldDefinition}
            recordId={targetRecord.id}
            junctionConfig={junctionConfig}
          />
        );
      }

      return (
        <FieldWidgetJunctionRelationField
          relationValue={record}
          isInSidePanel={isInSidePanel}
          junctionConfig={junctionConfig}
        />
      );
    }

    if (fieldDisplayMode === FieldDisplayMode.CARD) {
      return (
        <FieldWidgetRelationCard
          fieldDefinition={fieldDefinition}
          relationValue={record}
          isInSidePanel={isInSidePanel}
        />
      );
    }

    if (fieldDisplayMode === FieldDisplayMode.TABLE) {
      return (
        <FieldWidgetRelationTable
          fieldDefinition={fieldDefinition}
          recordId={targetRecord.id}
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

  if (
    isFieldText(fieldDefinition) &&
    fieldDisplayMode === FieldDisplayMode.EDITOR
  ) {
    return (
      <FieldWidgetTextEditor
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
