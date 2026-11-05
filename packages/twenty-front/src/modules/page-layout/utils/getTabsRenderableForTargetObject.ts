import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { WIDGET_TYPES_REQUIRING_RELATION_FIELD } from '@/page-layout/constants/WidgetTypesRequiringRelationField';
import { WIDGET_TYPE_TO_RELATION_FIELD_NAME } from '@/page-layout/constants/WidgetTypeToRelationFieldName';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';

type GetTabsRenderableForTargetObjectParams = {
  tabs: PageLayoutTab[];
  targetObjectFields:
    | (Pick<FieldMetadataItem, 'name' | 'isActive' | 'type'> & {
        relation?: {
          targetObjectMetadata: Pick<
            FieldMetadataItemRelation['targetObjectMetadata'],
            'id'
          >;
        } | null;
      })[]
    | undefined;
  chatThreadTargetObjectMetadataId?: string;
};

export const getTabsRenderableForTargetObject = ({
  tabs,
  targetObjectFields,
  chatThreadTargetObjectMetadataId,
}: GetTabsRenderableForTargetObjectParams): PageLayoutTab[] => {
  if (!isDefined(targetObjectFields)) {
    return tabs;
  }

  const relationFields = targetObjectFields.filter(
    (field) =>
      field.type === FieldMetadataType.RELATION ||
      field.type === FieldMetadataType.MORPH_RELATION,
  );
  const relationFieldsByName = new Map(
    relationFields.map((field) => [field.name, field]),
  );
  const hasActiveChatThreadTargetRelation =
    isDefined(chatThreadTargetObjectMetadataId) &&
    relationFields.some(
      (field) =>
        field.isActive &&
        field.relation?.targetObjectMetadata.id ===
          chatThreadTargetObjectMetadataId,
    );

  return tabs.filter((tab) =>
    tab.widgets.every((widget) => {
      if (widget.type === WidgetType.CHAT_THREADS) {
        return hasActiveChatThreadTargetRelation;
      }

      const relationFieldName = WIDGET_TYPE_TO_RELATION_FIELD_NAME[widget.type];

      if (!isDefined(relationFieldName)) {
        return true;
      }

      const relationField = relationFieldsByName.get(relationFieldName);

      if (isDefined(relationField)) {
        return relationField.isActive === true;
      }

      return !WIDGET_TYPES_REQUIRING_RELATION_FIELD.includes(widget.type);
    }),
  );
};
