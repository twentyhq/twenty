import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { useRecordTableScopedStates } from '../hooks/internal/useRecordTableScopedStates';
import { ColumnDefinition } from '../types/ColumnDefinition';

type RecordTableScopeInitEffectProps = {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
  onEntityCountChange?: (count: number) => void | Promise<void>;
};

export const RecordTableScopeInitEffect = ({
  onColumnsChange,
}: RecordTableScopeInitEffectProps) => {
  const { onColumnsChangeState } = useRecordTableScopedStates();

  const setOnColumnsChange = useSetRecoilState(onColumnsChangeState);

  useEffect(() => {
    setOnColumnsChange(() => onColumnsChange);
  }, [onColumnsChange, setOnColumnsChange]);

  return <></>;
};
