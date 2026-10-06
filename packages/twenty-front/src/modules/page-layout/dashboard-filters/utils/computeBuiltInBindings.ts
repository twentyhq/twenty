import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export type BuiltInBindingObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'fields'
>;

// Built-in slots bind every graph widget to one field of its object chosen by a per-slot rule.
export const computeBuiltInBindings = ({
  widgets,
  objectMetadataItems,
  pickField,
}: {
  widgets: PageLayoutWidget[];
  objectMetadataItems: BuiltInBindingObjectMetadataItem[];
  pickField: (fields: FieldMetadataItem[]) => FieldMetadataItem | undefined;
}): Record<string, DashboardFilterBinding | null> => {
  return Object.fromEntries(
    widgets
      .filter((widget) => widget.type === WidgetType.GRAPH)
      .map((widget) => {
        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItemToFind) =>
            objectMetadataItemToFind.id === widget.objectMetadataId,
        );

        const pickedField = isDefined(objectMetadataItem)
          ? pickField(objectMetadataItem.fields)
          : undefined;

        return [
          widget.id,
          isDefined(pickedField) ? { fieldMetadataId: pickedField.id } : null,
        ];
      }),
  );
};
