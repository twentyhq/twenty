import { type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';

export const getPhoneText = ({
  callingCode,
  number,
}: Pick<PhoneRecord, 'callingCode' | 'number'>) => callingCode + number;
