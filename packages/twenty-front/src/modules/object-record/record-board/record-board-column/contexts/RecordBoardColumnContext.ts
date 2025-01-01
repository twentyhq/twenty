import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordBoardColumnContextProps = {
  columnDefinition: RecordGroupDefinition;
  recordCount: number;
  columnId: string;
  recordIds: string[];
  onUpsertRecord: ({
    recordId,
    fieldName,
    persistField,
  }: {
    recordId: string;
    fieldName: string;
    persistField: () => void;
  }) => void;
  onCloseInlineCell: () => void;
};

export const [RecordBoardColumnContext, useRecordBoardColumnContextOrThrow] =
  createRequiredContext<RecordBoardColumnContextProps>(
    'RecordBoardColumnContext',
  );
