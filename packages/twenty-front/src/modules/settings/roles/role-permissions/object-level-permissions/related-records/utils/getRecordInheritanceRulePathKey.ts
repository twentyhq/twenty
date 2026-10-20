export const getRecordInheritanceRulePathKey = ({
  fieldMetadataId,
  junctionFieldMetadataId,
}: {
  fieldMetadataId: string;
  junctionFieldMetadataId?: string | null;
}) => `${fieldMetadataId}-${junctionFieldMetadataId ?? ''}`;
