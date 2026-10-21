import { resolveObjectMetadataLabel } from 'twenty-shared/utils';

export const getSelectedRecordsCountLabel = ({
  objectMetadataItem,
  numberOfSelectedRecords,
}: {
  objectMetadataItem: { labelSingular: string; labelPlural: string };
  numberOfSelectedRecords: number;
}) =>
  `${numberOfSelectedRecords} ${resolveObjectMetadataLabel({
    objectMetadataItem,
    numberOfSelectedRecords,
  })}`;
