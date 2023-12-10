export const mapPaginatedRecordsToRecords = <
  RecordType extends { id: string } & Record<string, any>,
  RecordTypeQuery extends {
    [objectNamePlural: string]: {
      edges: RecordEdge[];
    };
  },
  RecordEdge extends {
    node: RecordType;
  },
>({
  pagedRecords,
  objectNamePlural,
}: {
  pagedRecords: RecordTypeQuery | undefined;
  objectNamePlural: string;
}) => {
  const formattedRecords: RecordType[] =
    pagedRecords?.[objectNamePlural]?.edges?.map((recordEdge: RecordEdge) => ({
      ...recordEdge.node,
    })) ?? [];

  return formattedRecords;
};
