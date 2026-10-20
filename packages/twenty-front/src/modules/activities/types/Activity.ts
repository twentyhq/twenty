import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export type Activity = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  bodyV2?: FieldRichTextValue;
};
