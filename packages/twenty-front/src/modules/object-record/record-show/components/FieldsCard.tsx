import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';

type FieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
  showDuplicatesSection?: boolean;
};

export const FieldsCard = ({
  objectNameSingular,
  objectRecordId,
  showDuplicatesSection = true,
}: FieldsCardProps) => {
  return (
    <RecordFieldList
      objectNameSingular={objectNameSingular}
      objectRecordId={objectRecordId}
      showDuplicatesSection={showDuplicatesSection}
    />
  );
};
