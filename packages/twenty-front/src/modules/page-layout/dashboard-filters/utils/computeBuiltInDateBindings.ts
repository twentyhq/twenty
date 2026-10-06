import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBinding,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

const BUILT_IN_DATE_FIELD_NAME = 'createdAt';

export const computeBuiltInDateBindings = ({
  widgets,
  objectMetadataItems,
}: {
  widgets: PageLayoutWidget[];
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'fields'>[];
}): Record<string, DashboardFilterBinding | null> => {
  return Object.fromEntries(
    widgets
      .filter((widget) => widget.type === WidgetType.GRAPH)
      .map((widget) => {
        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItemToFind) =>
            objectMetadataItemToFind.id === widget.objectMetadataId,
        );

        const createdAtField = objectMetadataItem?.fields.find(
          (field) =>
            field.name === BUILT_IN_DATE_FIELD_NAME &&
            field.type === FieldMetadataType.DATE_TIME &&
            field.isActive,
        );

        return [
          widget.id,
          isDefined(createdAtField)
            ? { fieldMetadataId: createdAtField.id }
            : null,
        ];
      }),
  );
};
