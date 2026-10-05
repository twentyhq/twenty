import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { MOSTLY_EMPTY_FIELD_METADATA_IDS } from '@/object-metadata/graphql/queries';

type MostlyEmptyFieldMetadataIdsResult = {
  mostlyEmptyFieldMetadataIds: string[];
};

// Approximate (Postgres planner statistics); on error the hint just does not show
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
