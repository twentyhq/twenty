import { DEFAULT_OPEN_RECORD_IN_PREFERENCE } from '@/object-record/record-index/constants/DefaultOpenRecordInPreference';
import {
  type ResolvedOpenRecordIn,
  ViewOpenRecordIn,
} from 'twenty-shared/types';

// GraphQL cannot express that a member's preference excludes USER_PREFERENCE,
// so the narrowing happens here rather than through a cast that could lie.
export const toOpenRecordInPreference = (
  openRecordIn: ViewOpenRecordIn | null | undefined,
): ResolvedOpenRecordIn =>
  openRecordIn === ViewOpenRecordIn.RECORD_PAGE ||
  openRecordIn === ViewOpenRecordIn.SIDE_PANEL
    ? openRecordIn
    : DEFAULT_OPEN_RECORD_IN_PREFERENCE;
