import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { useIsInRightDrawerOrThrow } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';

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
  const { isInRightDrawer } = useIsInRightDrawerOrThrow();

  return (
    <RecordFieldList
      instanceId={`fields-card-${objectRecordId}-${isInRightDrawer ? 'right-drawer' : ''}`}
      objectNameSingular={objectNameSingular}
      objectRecordId={objectRecordId}
      showDuplicatesSection={showDuplicatesSection}
    />
  );
};
