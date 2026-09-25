import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type EventLogRecord } from '~/generated-metadata/graphql';

const RECORD_ID_DISPLAYED_LENGTH = 8;

export const getLogConsoleRecordLabel = ({
  entry,
  objectMetadataItem,
}: {
  entry: EventLogRecord;
  objectMetadataItem?: Pick<EnrichedObjectMetadataItem, 'labelSingular'>;
}) => {
  const displayedRecordId =
    entry.recordId?.slice(0, RECORD_ID_DISPLAYED_LENGTH) ?? '';

  return isDefined(objectMetadataItem)
    ? `${objectMetadataItem.labelSingular} ${displayedRecordId}`
    : displayedRecordId;
};
