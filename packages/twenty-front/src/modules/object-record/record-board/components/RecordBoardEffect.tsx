import { useEffect } from 'react';

import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { BoardFieldDefinition } from '@/object-record/record-board/types/BoardFieldDefinition';

type RecordBoardEffectProps = {
  recordBoardId: string;
  onFieldsChange: (fields: BoardFieldDefinition<FieldMetadata>[]) => void;
};

export const RecordBoardEffect = ({
  recordBoardId,
  onFieldsChange,
}: RecordBoardEffectProps) => {
  const { setOnFieldsChange } = useRecordBoard({
    recordBoardScopeId: recordBoardId,
  });

  useEffect(() => {
    setOnFieldsChange(() => onFieldsChange);
  }, [onFieldsChange, setOnFieldsChange]);

  return <></>;
};
