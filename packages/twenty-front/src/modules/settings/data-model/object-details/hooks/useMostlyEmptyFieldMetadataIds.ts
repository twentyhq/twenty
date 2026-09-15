import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { MOSTLY_EMPTY_FIELD_METADATA_IDS } from '@/object-metadata/graphql/queries';

type MostlyEmptyFieldMetadataIdsResult = {
  mostlyEmptyFieldMetadataIds: string[];
};

// Approximate, computed server-side from Postgres planner statistics; on any
// error the hint simply doesn't show
export const useMostlyEmptyFieldMetadataIds = ({
  objectMetadataItemId,
  skip,
}: {
  objectMetadataItemId: string;
  skip?: boolean;
}) => {
  const { data } = useQuery<MostlyEmptyFieldMetadataIdsResult>(
    MOSTLY_EMPTY_FIELD_METADATA_IDS,
    {
      variables: { objectMetadataId: objectMetadataItemId },
      skip,
    },
  );

  const mostlyEmptyFieldMetadataIds = useMemo(
    () => new Set(data?.mostlyEmptyFieldMetadataIds ?? []),
    [data],
  );

  return { mostlyEmptyFieldMetadataIds };
};
