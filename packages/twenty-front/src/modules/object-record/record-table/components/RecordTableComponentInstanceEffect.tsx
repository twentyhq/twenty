import { useEffect } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

type RecordTableComponentInstanceEffectProps = {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableComponentInstanceEffect = ({
  onColumnsChange,
}: RecordTableComponentInstanceEffectProps) => {
  const { setOnColumnsChange } = useRecordTable();

  useEffect(() => {
    setOnColumnsChange(() => onColumnsChange);
  }, [onColumnsChange, setOnColumnsChange]);

  return <></>;
};
