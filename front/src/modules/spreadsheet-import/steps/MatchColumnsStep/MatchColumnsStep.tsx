import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';

import { UnmatchedFieldsAlert } from '../../components/Alerts/UnmatchedFieldsAlert';
import { useRsi } from '../../hooks/useRsi';
import type { Field, RawData } from '../../types';

import { ColumnGrid } from './components/ColumnGrid';
import { TemplateColumn } from './components/TemplateColumn';
import { UserTableColumn } from './components/UserTableColumn';
import { findUnmatchedRequiredFields } from './utils/findUnmatchedRequiredFields';
import { getMatchedColumns } from './utils/getMatchedColumns';
import { normalizeTableData } from './utils/normalizeTableData';
import { setColumn } from './utils/setColumn';
import { setIgnoreColumn } from './utils/setIgnoreColumn';
import { setSubColumn } from './utils/setSubColumn';

export type MatchColumnsProps<T extends string> = {
  data: RawData[];
  headerValues: RawData;
  onContinue: (data: any[], rawData: RawData[], columns: Columns<T>) => void;
};

export enum ColumnType {
  empty,
  ignored,
  matched,
  matchedCheckbox,
  matchedSelect,
  matchedSelectOptions,
}

export type MatchedOptions<T> = {
  entry: string;
  value: T;
};

type EmptyColumn = { type: ColumnType.empty; index: number; header: string };
type IgnoredColumn = {
  type: ColumnType.ignored;
  index: number;
  header: string;
};
type MatchedColumn<T> = {
  type: ColumnType.matched;
  index: number;
  header: string;
  value: T;
};
type MatchedSwitchColumn<T> = {
  type: ColumnType.matchedCheckbox;
  index: number;
  header: string;
  value: T;
};
export type MatchedSelectColumn<T> = {
  type: ColumnType.matchedSelect;
  index: number;
  header: string;
  value: T;
  matchedOptions: Partial<MatchedOptions<T>>[];
};
export type MatchedSelectOptionsColumn<T> = {
  type: ColumnType.matchedSelectOptions;
  index: number;
  header: string;
  value: T;
  matchedOptions: MatchedOptions<T>[];
};

export type Column<T extends string> =
  | EmptyColumn
  | IgnoredColumn
  | MatchedColumn<T>
  | MatchedSwitchColumn<T>
  | MatchedSelectColumn<T>
  | MatchedSelectOptionsColumn<T>;

export type Columns<T extends string> = Column<T>[];

export const MatchColumnsStep = <T extends string>({
  data,
  headerValues,
  onContinue,
}: MatchColumnsProps<T>) => {
  const { enqueueSnackBar } = useSnackBar();
  const dataExample = data.slice(0, 2);
  const { fields, autoMapHeaders, autoMapDistance } = useRsi<T>();
  const [isLoading, setIsLoading] = useState(false);
  const [columns, setColumns] = useState<Columns<T>>(
    // Do not remove spread, it indexes empty array elements, otherwise map() skips over them
    ([...headerValues] as string[]).map((value, index) => ({
      type: ColumnType.empty,
      index,
      header: value ?? '',
    })),
  );
  const [showUnmatchedFieldsAlert, setShowUnmatchedFieldsAlert] =
    useState(false);

  const onChange = useCallback(
    (value: T, columnIndex: number) => {
      const field = fields.find(
        (field) => field.key === value,
      ) as unknown as Field<T>;
      const existingFieldIndex = columns.findIndex(
        (column) => 'value' in column && column.value === field.key,
      );
      setColumns(
        columns.map<Column<T>>((column, index) => {
          if (columnIndex === index) {
            return setColumn(column, field, data);
          } else if (index === existingFieldIndex) {
            enqueueSnackBar('Columns cannot duplicate', {
              title: 'Another column unselected',
              variant: 'error',
            });
            return setColumn(column);
          } else {
            return column;
          }
        }),
      );
    },
    [columns, data, fields, enqueueSnackBar],
  );

  const onIgnore = useCallback(
    (columnIndex: number) => {
      setColumns(
        columns.map((column, index) =>
          columnIndex === index ? setIgnoreColumn<T>(column) : column,
        ),
      );
    },
    [columns, setColumns],
  );

  const onRevertIgnore = useCallback(
    (columnIndex: number) => {
      setColumns(
        columns.map((column, index) =>
          columnIndex === index ? setColumn(column) : column,
        ),
      );
    },
    [columns, setColumns],
  );

  const onSubChange = useCallback(
    (value: string, columnIndex: number, entry: string) => {
      setColumns(
        columns.map((column, index) =>
          columnIndex === index && 'matchedOptions' in column
            ? setSubColumn(column, entry, value)
            : column,
        ),
      );
    },
    [columns, setColumns],
  );
  const unmatchedRequiredFields = useMemo(
    () => findUnmatchedRequiredFields(fields, columns),
    [fields, columns],
  );

  const handleOnContinue = useCallback(async () => {
    if (unmatchedRequiredFields.length > 0) {
      setShowUnmatchedFieldsAlert(true);
    } else {
      setIsLoading(true);
      await onContinue(
        normalizeTableData(columns, data, fields),
        data,
        columns,
      );
      setIsLoading(false);
    }
  }, [unmatchedRequiredFields.length, onContinue, columns, data, fields]);

  const handleAlertOnContinue = useCallback(async () => {
    setShowUnmatchedFieldsAlert(false);
    setIsLoading(true);
    await onContinue(normalizeTableData(columns, data, fields), data, columns);
    setIsLoading(false);
  }, [onContinue, columns, data, fields]);

  useEffect(() => {
    if (autoMapHeaders) {
      setColumns(getMatchedColumns(columns, fields, data, autoMapDistance));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <UnmatchedFieldsAlert
        isOpen={showUnmatchedFieldsAlert}
        onClose={() => setShowUnmatchedFieldsAlert(false)}
        fields={unmatchedRequiredFields}
        onConfirm={handleAlertOnContinue}
      />
      <ColumnGrid
        columns={columns}
        onContinue={handleOnContinue}
        isLoading={isLoading}
        userColumn={(column) => (
          <UserTableColumn
            column={column}
            onIgnore={onIgnore}
            onRevertIgnore={onRevertIgnore}
            entries={dataExample.map((row) => row[column.index])}
          />
        )}
        templateColumn={(column) => (
          <TemplateColumn
            column={column}
            onChange={onChange}
            onSubChange={onSubChange}
          />
        )}
      />
    </>
  );
};
