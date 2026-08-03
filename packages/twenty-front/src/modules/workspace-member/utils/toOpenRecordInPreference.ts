import { DEFAULT_OPEN_RECORD_IN_PREFERENCE } from '@/object-record/record-index/constants/DefaultOpenRecordInPreference';
import { OpenRecordIn } from 'twenty-shared/types';

export const isOpenRecordIn = (value: unknown): value is OpenRecordIn =>
  value === OpenRecordIn.SIDE_PANEL || value === OpenRecordIn.RECORD_PAGE;

export const toOpenRecordInPreference = (
  openRecordIn: string | null | undefined,
): OpenRecordIn =>
  isOpenRecordIn(openRecordIn)
    ? openRecordIn
    : DEFAULT_OPEN_RECORD_IN_PREFERENCE;
