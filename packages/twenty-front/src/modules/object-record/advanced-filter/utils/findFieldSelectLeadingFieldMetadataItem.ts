import { type FieldSelectLeadingSection } from '@/object-record/advanced-filter/types/FieldSelectLeadingSection';

export const findFieldSelectLeadingFieldMetadataItem = ({
  fieldSelectLeadingSections,
  fieldMetadataId,
}: {
  fieldSelectLeadingSections: FieldSelectLeadingSection[] | undefined;
  fieldMetadataId: string | undefined;
}) =>
  fieldSelectLeadingSections
    ?.flatMap((section) => section.fieldMetadataItems)
    .find((fieldMetadataItem) => fieldMetadataItem.id === fieldMetadataId);
