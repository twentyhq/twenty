import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';
// @ts-expect-error // Todo: remove usage of react-data-grid
import { type Column, useRowSelection } from 'react-data-grid';
import { createPortal } from 'react-dom';

import {
  type ImportedStructuredRow,
  type SpreadsheetImportFields,
} from '@/spreadsheet-import/types';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

import camelCase from 'lodash.camelcase';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, TooltipDelay } from 'twenty-ui/display';
import { Checkbox, CheckboxVariant, Toggle } from 'twenty-ui/input';
import { type ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';

const StyledHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
`;

const StyledHeaderLabel = styled.span`
  display: flex;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledCheckboxContainer = styled.div`
  align-items: center;
  box-sizing: content-box;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
  line-height: 0;
  width: 100%;
`;

const StyledToggleContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
`;

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  min-height: 100%;
  min-width: 100%;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledDefaultContainer = styled.div`
  min-height: 100%;
  min-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledSelectReadonlyValueContianer = styled.div`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const SELECT_COLUMN_KEY = 'select-row';

const formatSafeId = (columnKey: string) => {
  return camelCase(columnKey.replace('(', '').replace(')', ''));
};

export const generateColumns = (
  fields: SpreadsheetImportFields,
): Column<ImportedStructuredRow & ImportedStructuredRowMetadata>[] => [
  {
    key: SELECT_COLUMN_KEY,
    name: '',
    width: 35,
    minWidth: 35,
    maxWidth: 35,
    resizable: false,
    sortable: false,
    frozen: true,
    formatter: (props: any) => {
      // eslint-disable-next-line  react-hooks/rules-of-hooks
      const [isRowSelected, onRowSelectionChange] = useRowSelection();

      return (
        <StyledCheckboxContainer>
          <Checkbox
            aria-label={t`Select`}
            checked={isRowSelected}
            variant={CheckboxVariant.Tertiary}
            onChange={(event) => {
              onRowSelectionChange({
                row: props.row,
                checked: event.target.checked,
                isShiftClick: (event.nativeEvent as MouseEvent).shiftKey,
              });
            }}
          />
        </StyledCheckboxContainer>
      );
    },
  },
  ...fields.map(
    (
      column,
    ): Column<ImportedStructuredRow & ImportedStructuredRowMetadata> => ({
      key: column.key,
      name: column.label,
      minWidth: 150,
      resizable: true,
      headerRenderer: () => (
        <StyledHeaderContainer>
          <StyledHeaderLabel id={formatSafeId(column.key)}>
            {column.label}
          </StyledHeaderLabel>
          <>
            {column.description &&
              createPortal(
                <AppTooltip
                  anchorSelect={`#${formatSafeId(column.key)}`}
                  place="top"
                  content={column.description}
                />,
                document.body,
              )}
          </>
        </StyledHeaderContainer>
      ),
      editable: column.fieldType.type !== 'checkbox',
      // Todo: remove usage of react-data-grid
      editor: ({ row, onRowChange, onClose }: any) => {
        const columnKey = column.key as keyof (ImportedStructuredRow &
          ImportedStructuredRowMetadata);
        let component;

        switch (column.fieldType.type) {
          case 'select': {
            component = (
              <StyledSelectReadonlyValueContianer>
                {row[columnKey]}
              </StyledSelectReadonlyValueContianer>
            );
            break;
          }
          default:
            component = (
              <SettingsTextInput
                instanceId={`validation-${column.key}-${row.__index}`}
                value={row[columnKey] as string}
                onChange={(value: string) => {
                  onRowChange({ ...row, [columnKey]: value });
                }}
                autoFocus={true}
                onBlur={() => onClose(true)}
              />
            );
        }

        return <StyledInputContainer>{component}</StyledInputContainer>;
      },
      editorOptions: {
        editOnClick: true,
      },
      // Todo: remove usage of react-data-grid
      formatter: ({ row, onRowChange }: { row: any; onRowChange: any }) => {
        const columnKey = column.key as keyof (ImportedStructuredRow &
          ImportedStructuredRowMetadata);
        let component;

        switch (column.fieldType.type) {
          case 'checkbox':
            component = (
              <StyledToggleContainer
                id={formatSafeId(`${columnKey}-${row.__index}`)}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <Toggle
                  value={row[columnKey] as boolean}
                  onChange={() => {
                    onRowChange({
                      ...row,
                      [columnKey]: !row[columnKey],
                    });
                  }}
                />
              </StyledToggleContainer>
            );
            break;
          case 'select':
            component = (
              <StyledDefaultContainer
                id={formatSafeId(`${columnKey}-${row.__index}`)}
              >
                {column.fieldType.options.find(
                  (option) => option.value === row[columnKey],
                )?.label || null}
              </StyledDefaultContainer>
            );
            break;
          default:
            component = (
              <StyledDefaultContainer
                id={formatSafeId(`${columnKey}-${row.__index}`)}
              >
                {row[columnKey]}
              </StyledDefaultContainer>
            );
        }

        if (isDefined(row.__errors?.[columnKey])) {
          return (
            <>
              {component}
              {createPortal(
                <AppTooltip
                  anchorSelect={`#${formatSafeId(`${columnKey}-${row.__index}`)}`}
                  place="top"
                  content={row.__errors?.[columnKey]?.message}
                  delay={TooltipDelay.shortDelay}
                />,
                document.body,
              )}
            </>
          );
        }

        return component;
      },
      cellClass: (row: ImportedStructuredRowMetadata) => {
        switch (row.__errors?.[column.key]?.level) {
          case 'error':
            return 'rdg-cell-error';
          case 'warning':
            return 'rdg-cell-warning';
          case 'info':
            return 'rdg-cell-info';
          default:
            return '';
        }
      },
    }),
  ),
];
