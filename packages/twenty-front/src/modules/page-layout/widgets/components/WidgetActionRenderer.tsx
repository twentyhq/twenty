import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { FieldWidgetRelationEditAction } from '@/page-layout/widgets/field/components/FieldWidgetRelationEditAction';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { type WidgetAction } from '@/page-layout/widgets/types/WidgetAction';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { assertIsDefinedOrThrow, CustomError } from 'twenty-shared/utils';
import { WidgetType } from '~/generated/graphql';
import { useCurrentWidget } from '../hooks/useCurrentWidget';

type WidgetActionRendererProps = {
  action: WidgetAction;
};

export const WidgetActionRenderer = ({ action }: WidgetActionRendererProps) => {
  const widget = useCurrentWidget();
  const targetRecord = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const fieldMetadataId = isFieldWidget(widget)
    ? widget.configuration.fieldMetadataId
    : undefined;

  const resolvedFieldMetadataId = useResolveFieldMetadataIdFromNameOrId(
    fieldMetadataId ?? '',
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  if (action.id === 'edit' && widget.type === WidgetType.FIELD) {
    assertIsDefinedOrThrow(fieldMetadataItem);

    const fieldDefinition = formatFieldMetadataItemAsColumnDefinition({
      field: fieldMetadataItem,
      position: 0,
      objectMetadataItem,
      showLabel: true,
      labelWidth: 90,
    });

    const isRelationField =
      isFieldRelation(fieldDefinition) || isFieldMorphRelation(fieldDefinition);

    if (!isRelationField) {
      throw new Error(
        'Edit action is only available for relation fields for now',
      );
    }

    return (
      <FieldWidgetRelationEditAction
        fieldDefinition={fieldDefinition}
        recordId={targetRecord.id}
      />
    );
  }

  throw new CustomError(
    `Unsupported action renderer for action id: ${action.id}`,
    'UNSUPPORTED_WIDGET_ACTION_RENDERER',
  );
};
