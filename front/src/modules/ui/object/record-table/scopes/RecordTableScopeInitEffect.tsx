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
  onEntityCountChange,
}: RecordTableScopeInitEffectProps) => {
  const { onColumnsChangeState, onEntityCountChangeState } =
    useRecordTableScopedStates();

  const setOnEntityCountChange = useSetRecoilState(onEntityCountChangeState);
  const setOnColumnsChange = useSetRecoilState(onColumnsChangeState);

  useEffect(() => {
    setOnEntityCountChange(() => onEntityCountChange);
    setOnColumnsChange(() => onColumnsChange);
  }, [
    onColumnsChange,
    onEntityCountChange,
    setOnColumnsChange,
    setOnEntityCountChange,
  ]);

  return <></>;
};
