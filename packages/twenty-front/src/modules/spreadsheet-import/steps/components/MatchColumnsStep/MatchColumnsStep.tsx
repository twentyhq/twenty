import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Heading } from '@/spreadsheet-import/components/Heading';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { ImportedRow, ImportedStructuredRow } from '@/spreadsheet-import/types';
import { findUnmatchedRequiredFields } from '@/spreadsheet-import/utils/findUnmatchedRequiredFields';
import { getMatchedColumns } from '@/spreadsheet-import/utils/getMatchedColumns';
import { normalizeTableData } from '@/spreadsheet-import/utils/normalizeTableData';
import { setColumn } from '@/spreadsheet-import/utils/setColumn';
import { setIgnoreColumn } from '@/spreadsheet-import/utils/setIgnoreColumn';
import { setSubColumn } from '@/spreadsheet-import/utils/setSubColumn';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { Modal } from '@/ui/layout/modal/components/Modal';

import { DO_NOT_IMPORT_OPTION_KEY } from '@/spreadsheet-import/constants/DoNotImportOptionKey';
import { UnmatchColumn } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/UnmatchColumn';
import { initialComputedColumnsSelector } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/initialComputedColumnsState';
import { SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetImportField } from '@/spreadsheet-import/types/SpreadsheetImportField';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { ColumnGrid } from './components/ColumnGrid';
import { TemplateColumn } from './components/TemplateColumn';
import { UserTableColumn } from './components/UserTableColumn';

const StyledContent = styled(Modal.Content)`
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-right: ${({ theme }) => theme.spacing(6)};
`;

const StyledColumnsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledColumns = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledColumn = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export type MatchColumnsStepProps = {
  data: ImportedRow[];
  headerValues: ImportedRow;
  onBack?: () => void;
  setCurrentStepState: (currentStepState: SpreadsheetImportStep) => void;
  setPreviousStepState: (currentStepState: SpreadsheetImportStep) => void;
  currentStepState: SpreadsheetImportStep;
  nextStep: () => void;
  onError: (message: string) => void;
};

export const MatchColumnsStep = <T extends string>({
  data,
  headerValues,
  onBack,
  setCurrentStepState,
  setPreviousStepState,
  currentStepState,
  nextStep,
  onError,
}: MatchColumnsStepProps) => {
  const { enqueueDialog } = useDialogManager();
  const { enqueueSnackBar } = useSnackBar();
  const dataExample = data.slice(0, 2);
  const { fields, autoMapHeaders, autoMapDistance } =
    useSpreadsheetImportInternal<T>();
  const [isLoading, setIsLoading] = useState(false);
  const [columns, setColumns] = useRecoilState(
    initialComputedColumnsSelector(headerValues),
  );

  const { matchColumnsStepHook } = useSpreadsheetImportInternal();

  const { t } = useLingui();

  const onIgnore = useCallback(
    (columnIndex: number) => {
      setColumns(
        columns.map((column, index) =>
          columnIndex === index ? setIgnoreColumn<string>(column) : column,
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

  const onChange = useCallback(
    (value: T, columnIndex: number) => {
      if (value === DO_NOT_IMPORT_OPTION_KEY) {
        if (columns[columnIndex].type === SpreadsheetColumnType.ignored) {
          onRevertIgnore(columnIndex);
        } else {
          onIgnore(columnIndex);
        }
      } else {
        const field = fields.find(
          (field) => field.key === value,
        ) as unknown as SpreadsheetImportField<T>;
        const existingFieldIndex = columns.findIndex(
          (column) => 'value' in column && column.value === field.key,
        );
        setColumns(
          columns.map<SpreadsheetColumn<string>>((column, index) => {
            if (columnIndex === index) {
              return setColumn(column, field, data);
            } else if (index === existingFieldIndex) {
              enqueueSnackBar('Another column unselected', {
                detailedMessage: 'Columns cannot duplicate',
                variant: SnackBarVariant.Error,
              });
              return setColumn(column);
            } else {
              return column;
            }
          }),
        );
      }
    },
    [
      columns,
      onRevertIgnore,
      onIgnore,
      fields,
      setColumns,
      data,
      enqueueSnackBar,
    ],
  );

  const handleContinue = useCallback(
    async (
      values: ImportedStructuredRow<string>[],
      rawData: ImportedRow[],
      columns: SpreadsheetColumns<string>,
    ) => {
      try {
        const data = await matchColumnsStepHook(values, rawData, columns);
        setCurrentStepState({
          type: SpreadsheetImportStepType.validateData,
          data,
          importedColumns: columns,
        });
        setPreviousStepState(currentStepState);
        nextStep();
      } catch (e) {
        onError((e as Error).message);
      }
    },
    [
      onError,
      matchColumnsStepHook,
      nextStep,
      setPreviousStepState,
      setCurrentStepState,
      currentStepState,
    ],
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

  const handleAlertOnContinue = useCallback(async () => {
    setIsLoading(true);
    await handleContinue(
      normalizeTableData(columns, data, fields),
      data,
      columns,
    );
    setIsLoading(false);
  }, [handleContinue, columns, data, fields]);

  const handleOnContinue = useCallback(async () => {
    if (unmatchedRequiredFields.length > 0) {
      enqueueDialog({
        title: t`Not all columns matched`,
        message: t`There are required columns that are not matched or ignored. Do you want to continue?`,
        children: (
          <StyledColumnsContainer>
            <StyledColumns>
              <Trans>Columns not matched:</Trans>
            </StyledColumns>
            {unmatchedRequiredFields.map((field) => (
              <StyledColumn key={field}>{field}</StyledColumn>
            ))}
          </StyledColumnsContainer>
        ),
        buttons: [
          { title: t`Cancel` },
          {
            title: t`Continue`,
            onClick: handleAlertOnContinue,
            variant: 'primary',
            role: 'confirm',
          },
        ],
      });
    } else {
      setIsLoading(true);
      await handleContinue(
        normalizeTableData(columns, data, fields),
        data,
        columns,
      );
      setIsLoading(false);
    }
  }, [
    unmatchedRequiredFields,
    enqueueDialog,
    handleAlertOnContinue,
    handleContinue,
    columns,
    data,
    fields,
    t,
  ]);

  useEffect(() => {
    const isInitialColumnsState = columns.every(
      (column) => column.type === SpreadsheetColumnType.empty,
    );
    if (autoMapHeaders && isInitialColumnsState) {
      setColumns(getMatchedColumns(columns, fields, data, autoMapDistance));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ScrollWrapper componentInstanceId="scroll-wrapper-modal-content">
        <StyledContent>
          <Heading
            title={t`Match Columns`}
            description={t`Select the correct field for each column you'd like to import.`}
          />
          <ColumnGrid
            columns={columns}
            renderUserColumn={(columns, columnIndex) => (
              <UserTableColumn
                column={columns[columnIndex]}
                importedRow={dataExample.map(
                  (row) => row[columns[columnIndex].index],
                )}
              />
            )}
            renderTemplateColumn={(columns, columnIndex) => (
              <TemplateColumn
                columns={columns}
                columnIndex={columnIndex}
                onChange={onChange}
              />
            )}
            renderUnmatchedColumn={(columns, columnIndex) => (
              <UnmatchColumn
                columns={columns}
                columnIndex={columnIndex}
                onSubChange={onSubChange}
              />
            )}
          />
        </StyledContent>
      </ScrollWrapper>
      <StepNavigationButton
        onClick={handleOnContinue}
        isLoading={isLoading}
        title={t`Next Step`}
        onBack={() => {
          onBack?.();
          setColumns([]);
        }}
      />
    </>
  );
};
