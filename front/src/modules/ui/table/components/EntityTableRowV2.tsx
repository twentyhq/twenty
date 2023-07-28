import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ViewFieldContext } from '../states/ViewFieldContext';
import { viewFieldsState } from '../states/viewFieldsState';

import { CheckboxCell } from './CheckboxCell';
import { EntityTableCell } from './EntityTableCellV2';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.background.secondary : 'none'};
`;

export function EntityTableRow({ rowId }: { rowId: string }) {
  const entityFieldMetadataArray = useRecoilValue(viewFieldsState);

  return (
    <StyledRow data-testid={`row-id-${rowId}`} selected={false}>
      <td>
        <CheckboxCell />
      </td>
      {entityFieldMetadataArray.map((entityFieldMetadata, columnIndex) => {
        return (
          <ViewFieldContext.Provider
            value={entityFieldMetadata}
            key={entityFieldMetadata.columnOrder}
          >
            <EntityTableCell cellIndex={columnIndex} />
          </ViewFieldContext.Provider>
        );
      })}
      <td></td>
    </StyledRow>
  );
}
