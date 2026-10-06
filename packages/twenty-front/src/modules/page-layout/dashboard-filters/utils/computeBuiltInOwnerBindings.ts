import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type BuiltInBindingObjectMetadataItem,
  computeBuiltInBindings,
} from '@/page-layout/dashboard-filters/utils/computeBuiltInBindings';
import {
  CoreObjectNameSingular,
  type DashboardFilterBinding,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

// Standard objects name their owner field one of these; a custom object falls back to its first one alphabetically.
const PREFERRED_OWNER_FIELD_NAMES = ['accountOwner', 'assignee'];

const isWorkspaceMemberManyToOneField = (field: FieldMetadataItem) =>
  field.isActive === true &&
  field.relation?.type === RelationType.MANY_TO_ONE &&
  field.relation.targetObjectMetadata.nameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

// Field order from the API is not stable, so ties are broken by name to keep the binding deterministic.
const pickBuiltInOwnerField = (fields: FieldMetadataItem[]) => {
  const candidateFields = fields
    .filter(isWorkspaceMemberManyToOneField)
    .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name));

  return (
    PREFERRED_OWNER_FIELD_NAMES.map((preferredFieldName) =>
      candidateFields.find((field) => field.name === preferredFieldName),
    ).find(isDefined) ?? candidateFields[0]
  );
};

export const computeBuiltInOwnerBindings = ({
  widgets,
  objectMetadataItems,
}: {
  widgets: PageLayoutWidget[];
  objectMetadataItems: BuiltInBindingObjectMetadataItem[];
}): Record<string, DashboardFilterBinding | null> =>
  computeBuiltInBindings({
    widgets,
    objectMetadataItems,
    pickField: pickBuiltInOwnerField,
  });
