import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';

export const getConditionalAvailabilityEditorItemKey = ({
  metadataName,
  itemId,
}: {
  metadataName: ConditionalAvailabilityMetadataName;
  itemId: string;
}) => `${metadataName}:${itemId}`;
