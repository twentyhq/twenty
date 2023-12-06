import { useEffect } from 'react';

import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { useRecordBoard } from '@/ui/object/record-board/hooks/useRecordBoard';
import { BoardFieldDefinition } from '@/ui/object/record-board/types/BoardFieldDefinition';

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
