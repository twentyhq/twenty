import { useEffect } from 'react';

import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { useRecordBoardDeprecated } from '@/object-record/record-board-deprecated/hooks/useRecordBoardDeprecated';
import { BoardFieldDefinition } from '@/object-record/record-board-deprecated/types/BoardFieldDefinition';

type RecordBoardDeprecatedEffectProps = {
  recordBoardId: string;
  onFieldsChange: (fields: BoardFieldDefinition<FieldMetadata>[]) => void;
};

export const RecordBoardDeprecatedEffect = ({
  recordBoardId,
  onFieldsChange,
}: RecordBoardDeprecatedEffectProps) => {
  const { setOnFieldsChange } = useRecordBoardDeprecated({
    recordBoardScopeId: recordBoardId,
  });

  useEffect(() => {
    setOnFieldsChange(() => onFieldsChange);
  }, [onFieldsChange, setOnFieldsChange]);

  return <></>;
};
