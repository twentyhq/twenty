import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import { getDashboardFilterRelationTargetDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRelationTargetDimensionKey';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const CREATED_AT_FIELD_NAME = 'createdAt';

// While a dashboard still runs on the built-ins, picking the first custom filter drops them, so the two equivalents come first.
export const prioritizeBuiltInDashboardFilterCandidateDimensions = ({
  dimensions,
  workspaceMemberObjectMetadataId,
  dateLabel,
  ownerLabel,
}: {
  dimensions: DashboardFilterCandidateDimension[];
  workspaceMemberObjectMetadataId: string | undefined;
  dateLabel: string;
  ownerLabel: string;
}): DashboardFilterCandidateDimension[] => {
  const dateDimensionKey = getDashboardFilterFieldDimensionKey({
    name: CREATED_AT_FIELD_NAME,
    type: FieldMetadataType.DATE_TIME,
  });

  const ownerDimensionKey = isDefined(workspaceMemberObjectMetadataId)
    ? getDashboardFilterRelationTargetDimensionKey(
        workspaceMemberObjectMetadataId,
      )
    : undefined;

  const dateDimension = dimensions.find(
    (dimension) => dimension.key === dateDimensionKey,
  );

  const ownerDimension = dimensions.find(
    (dimension) => dimension.key === ownerDimensionKey,
  );

  return [
    ...(isDefined(dateDimension)
      ? [{ ...dateDimension, label: dateLabel }]
      : []),
    ...(isDefined(ownerDimension)
      ? [{ ...ownerDimension, label: ownerLabel }]
      : []),
    ...dimensions.filter(
      (dimension) =>
        dimension.key !== dateDimensionKey &&
        dimension.key !== ownerDimensionKey,
    ),
  ];
};
