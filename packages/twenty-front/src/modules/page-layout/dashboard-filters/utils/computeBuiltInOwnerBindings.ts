import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInOwnerDashboardFilterSlotId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  CoreObjectNameSingular,
  type DashboardFilterBinding,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type FieldMetadataType,
  type RelationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const PREFERRED_OWNER_FIELD_NAMES = ['accountOwner', 'owner', 'assignee'];

type OwnerBindingCandidateField = {
  id: string;
  name: string;
  type: FieldMetadataType;
  isActive?: boolean | null;
  relation?: {
    type: RelationType;
    targetObjectMetadata: { nameSingular: string };
  } | null;
};

export type ComputeBuiltInOwnerBindingsArgs = {
  widgets: Pick<PageLayoutWidget, 'id' | 'type' | 'objectMetadataId'>[];
  objectMetadataItems: {
    id: string;
    fields: OwnerBindingCandidateField[];
  }[];
};

// Metadata field order is not stable across workspaces, so ties fall back to a locale-independent name order.
const compareFieldNames = (
  fieldA: OwnerBindingCandidateField,
  fieldB: OwnerBindingCandidateField,
) => {
  if (fieldA.name < fieldB.name) {
    return -1;
  }

  return fieldA.name > fieldB.name ? 1 : 0;
};

const findOwnerField = (fields: OwnerBindingCandidateField[]) => {
  const ownerFieldCandidates = fields.filter(
    (field) =>
      field.isActive === true &&
      isManyToOneRelationField(field) &&
      field.relation.targetObjectMetadata.nameSingular ===
        CoreObjectNameSingular.WorkspaceMember,
  );

  const preferredOwnerField = PREFERRED_OWNER_FIELD_NAMES.map(
    (preferredFieldName) =>
      ownerFieldCandidates.find((field) => field.name === preferredFieldName),
  ).find(isDefined);

  return (
    preferredOwnerField ?? [...ownerFieldCandidates].sort(compareFieldNames)[0]
  );
};

export const computeBuiltInOwnerBindings = ({
  widgets,
  objectMetadataItems,
}: ComputeBuiltInOwnerBindingsArgs): Record<
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

      const objectMetadataItem = objectMetadataItemById.get(
        widget.objectMetadataId,
      );

      if (!isDefined(objectMetadataItem)) {
        return [];
      }

      const ownerField = findOwnerField(objectMetadataItem.fields);

      if (!isDefined(ownerField)) {
        return [];
      }

      return [
        [
          widget.id,
          {
            [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
              fieldMetadataId: ownerField.id,
            },
          },
        ],
      ];
    }),
  );
};
