import styled from '@emotion/styled';
// @ts-expect-error // Todo: remove usage of react-data-grid
import { Column, useRowSelection } from 'react-data-grid';
import { createPortal } from 'react-dom';
import { AppTooltip, Checkbox, CheckboxVariant, Toggle } from 'twenty-ui';

import { MatchColumnSelect } from '@/spreadsheet-import/components/MatchColumnSelect';
import { Fields, ImportedStructuredRow } from '@/spreadsheet-import/types';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDefined } from '~/utils/isDefined';

import { ImportedStructuredRowMetadata } from '../types';

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

const SELECT_COLUMN_KEY = 'select-row';

export const generateColumns = <T extends string>(
  fields: Fields<T>,
): Column<ImportedStructuredRow<T> & ImportedStructuredRowMetadata>[] => [
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
            aria-label="Select"
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
    ): Column<ImportedStructuredRow<T> & ImportedStructuredRowMetadata> => ({
      key: column.key,
      name: column.label,
      minWidth: 150,
      resizable: true,
      headerRenderer: () => (
        <StyledHeaderContainer>
          <StyledHeaderLabel id={`${column.key}`}>
            {column.label}
          </StyledHeaderLabel>
          {column.description &&
            createPortal(
              <AppTooltip
                anchorSelect={`#${column.key}`}
                place="top"
                content={column.description}
              />,
              document.body,
            )}
        </StyledHeaderContainer>
      ),
      editable: column.fieldType.type !== 'checkbox',
      // Todo: remove usage of react-data-grid
      editor: ({ row, onRowChange, onClose }: any) => {
        const columnKey = column.key as keyof (ImportedStructuredRow<T> &
          ImportedStructuredRowMetadata);
        let component;

        switch (column.fieldType.type) {
          case 'select': {
            const value = column.fieldType.options.find(
              (option) => option.value === (row[columnKey] as string),
            );

            component = (
              <MatchColumnSelect
                value={
                  value
                    ? ({
                        icon: undefined,
                        ...value,
                      } as const)
                    : value
                }
                onChange={(value) => {
                  onRowChange({ ...row, [columnKey]: value?.value }, true);
                }}
                options={column.fieldType.options}
              />
            );
            break;
          }
          default:
            component = (
              <TextInput
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
        const columnKey = column.key as keyof (ImportedStructuredRow<T> &
          ImportedStructuredRowMetadata);
        let component;

        switch (column.fieldType.type) {
          case 'checkbox':
            component = (
              <StyledToggleContainer
                id={`${columnKey}-${row.__index}`}
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
              <StyledDefaultContainer id={`${columnKey}-${row.__index}`}>
                {column.fieldType.options.find(
                  (option) => option.value === row[columnKey as T],
                )?.label || null}
              </StyledDefaultContainer>
            );
            break;
          default:
            component = (
              <StyledDefaultContainer id={`${columnKey}-${row.__index}`}>
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
                  anchorSelect={`#${columnKey}-${row.__index}`}
                  place="top"
                  content={row.__errors?.[columnKey]?.message}
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
