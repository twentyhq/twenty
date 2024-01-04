import { useEffect } from 'react';

import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { ColumnDefinition } from '../types/ColumnDefinition';

type RecordTableScopeInitEffectProps = {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
  onEntityCountChange?: (count: number) => void | Promise<void>;
};

export const RecordTableScopeInitEffect = ({
  onColumnsChange,
}: RecordTableScopeInitEffectProps) => {
  const { setOnColumnsChange } = useRecordTable();

  useEffect(() => {
    setOnColumnsChange(() => onColumnsChange);
  }, [onColumnsChange, setOnColumnsChange]);

  return <></>;
};
