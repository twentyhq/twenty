import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { WIDGET_TYPES_REQUIRING_RELATION_FIELD } from '@/page-layout/constants/WidgetTypesRequiringRelationField';
import { WIDGET_TYPE_TO_RELATION_FIELD_NAME } from '@/page-layout/constants/WidgetTypeToRelationFieldName';
import { WIDGET_TYPE_TO_SELF_SOURCE_OBJECT_NAME } from '@/page-layout/constants/WidgetTypeToSelfSourceObjectName';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type GetTabsRenderableForTargetObjectParams = {
  tabs: PageLayoutTab[];
  targetObjectFields:
    | Pick<FieldMetadataItem, 'name' | 'isActive' | 'type'>[]
    | undefined;
  targetObjectNameSingular: string | undefined;
};

// A relation-scoped widget renders only if the target object supports it: a
// deactivated relation always hides the widget, while a missing relation hides
// it only for widgets that read their records through the relation itself.
// A widget whose source object is the target object itself needs no relation.
export const getTabsRenderableForTargetObject = ({
  tabs,
  targetObjectFields,
  targetObjectNameSingular,
}: GetTabsRenderableForTargetObjectParams): PageLayoutTab[] => {
  if (!isDefined(targetObjectFields)) {
    return tabs;
  }

  const relationFieldsByName = new Map(
    targetObjectFields
      .filter(
        (field) =>
          field.type === FieldMetadataType.RELATION ||
          field.type === FieldMetadataType.MORPH_RELATION,
      )
      .map((field) => [field.name, field]),
  );

  return tabs.filter((tab) =>
    tab.widgets.every((widget) => {
      if (
        isDefined(targetObjectNameSingular) &&
        WIDGET_TYPE_TO_SELF_SOURCE_OBJECT_NAME[widget.type] ===
          targetObjectNameSingular
      ) {
        return true;
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
