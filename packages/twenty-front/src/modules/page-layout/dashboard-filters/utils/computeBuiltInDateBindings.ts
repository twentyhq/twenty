import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

const CREATED_AT_FIELD_NAME = 'createdAt';

type ComputeBuiltInDateBindingsArgs = {
  widgets: Pick<PageLayoutWidget, 'id' | 'type' | 'objectMetadataId'>[];
  objectMetadataItems: {
    id: string;
    fields: { id: string; name: string; isActive?: boolean | null }[];
  }[];
};

export const computeBuiltInDateBindings = ({
  widgets,
  objectMetadataItems,
}: ComputeBuiltInDateBindingsArgs): Record<
  string,
  Record<string, DashboardFilterBinding | null>
> => {
  const objectMetadataItemById = new Map(
    objectMetadataItems.map((objectMetadataItem) => [
      objectMetadataItem.id,
      objectMetadataItem,
    ]),
  );

  return Object.fromEntries(
    widgets.flatMap((widget) => {
      if (
        widget.type !== WidgetType.GRAPH ||
        !isDefined(widget.objectMetadataId)
      ) {
        return [];
      }

      const createdAtField = objectMetadataItemById
        .get(widget.objectMetadataId)
        ?.fields.find(
          (field) =>
            field.name === CREATED_AT_FIELD_NAME && field.isActive === true,
        );

      if (!isDefined(createdAtField)) {
        return [];
      }

      return [
        [
          widget.id,
          {
            [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
              fieldMetadataId: createdAtField.id,
            },
          },
        ],
      ];
    }),
  );
};
