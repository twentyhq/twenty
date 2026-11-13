// A fresh instance per field keeps a stale option from staying selected
export const getRecordIndexTabListInstanceId = ({
  recordIndexId,
  recordIndexTabFieldMetadataId,
}: {
  recordIndexId: string;
  recordIndexTabFieldMetadataId: string | undefined;
}) =>
  `record-index-tabs-${recordIndexId}-${recordIndexTabFieldMetadataId ?? 'custom'}`;
