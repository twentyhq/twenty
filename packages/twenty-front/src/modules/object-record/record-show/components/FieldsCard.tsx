import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { type FieldCardConfiguration } from '@/object-record/record-show/types/CardConfiguration';
import {
  useLayoutRenderingContext,
  useTargetRecord,
} from '@/ui/layout/contexts/LayoutRenderingContext';

type FieldsCardProps = {
  configuration?: FieldCardConfiguration;
};

export const FieldsCard = ({ configuration }: FieldsCardProps) => {
  const targetRecord = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  return (
    <RecordFieldList
      instanceId={`fields-card-${targetRecord.id}-${isInRightDrawer ? 'right-drawer' : ''}`}
      objectNameSingular={targetRecord.targetObjectNameSingular}
      objectRecordId={targetRecord.id}
      showDuplicatesSection={configuration?.showDuplicatesSection ?? true}
    />
  );
};
