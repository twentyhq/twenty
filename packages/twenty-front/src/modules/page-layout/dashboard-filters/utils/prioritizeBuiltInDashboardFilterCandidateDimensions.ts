import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import { getDashboardFilterRelationTargetDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRelationTargetDimensionKey';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const CREATED_AT_FIELD_NAME = 'createdAt';

export const getBuiltInDateDimensionKey = () =>
  getDashboardFilterFieldDimensionKey({
    name: CREATED_AT_FIELD_NAME,
    type: FieldMetadataType.DATE_TIME,
  });

// The first custom filter drops the built-in Date and Owner, so their equivalents lead the list under the
// built-in labels until the dashboard has a slot standing for each of them again.
export const prioritizeBuiltInDashboardFilterCandidateDimensions = ({
  dimensions,
  workspaceMemberObjectMetadataId,
  dateLabel,
  ownerLabel,
  hasDateEquivalentSlot = false,
  hasOwnerEquivalentSlot = false,
}: {
  dimensions: DashboardFilterCandidateDimension[];
  workspaceMemberObjectMetadataId: string | undefined;
  dateLabel: string;
  ownerLabel: string;
  hasDateEquivalentSlot?: boolean;
  hasOwnerEquivalentSlot?: boolean;
}): DashboardFilterCandidateDimension[] => {
  const dateDimensionKey = getBuiltInDateDimensionKey();

  const ownerDimensionKey = isDefined(workspaceMemberObjectMetadataId)
    ? getDashboardFilterRelationTargetDimensionKey(
        workspaceMemberObjectMetadataId,
      )
    : undefined;

  const dateDimension = hasDateEquivalentSlot
    ? undefined
    : dimensions.find((dimension) => dimension.key === dateDimensionKey);

  const ownerDimension = hasOwnerEquivalentSlot
    ? undefined
    : dimensions.find((dimension) => dimension.key === ownerDimensionKey);

  return [
    ...(isDefined(dateDimension)
      ? [{ ...dateDimension, label: dateLabel }]
      : []),
    ...(isDefined(ownerDimension)
      ? [{ ...ownerDimension, label: ownerLabel }]
      : []),
    ...dimensions.filter(
      (dimension) =>
        dimension !== dateDimension && dimension !== ownerDimension,
    ),
  ];
};
