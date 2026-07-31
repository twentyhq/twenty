import { DEFAULT_OPEN_RECORD_IN_PREFERENCE } from '@/object-record/record-index/constants/DefaultOpenRecordInPreference';
import { OpenRecordIn } from 'twenty-shared/types';

// The member's preference crosses the wire as a plain string field, so the
// narrowing to the enum happens here rather than through a cast that could
// lie.
export const toOpenRecordInPreference = (
  openRecordIn: string | null | undefined,
): OpenRecordIn =>
  openRecordIn === OpenRecordIn.RECORD_PAGE ||
  openRecordIn === OpenRecordIn.SIDE_PANEL
    ? openRecordIn
    : DEFAULT_OPEN_RECORD_IN_PREFERENCE;
