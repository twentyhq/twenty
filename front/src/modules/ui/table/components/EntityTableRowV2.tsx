import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { entityFieldMetadataArrayState } from '../states/entityFieldMetadataArrayState';
import { EntityFieldMetadataContext } from '../states/EntityFieldMetadataContext';

import { CheckboxCell } from './CheckboxCell';
import { EntityTableCell } from './EntityTableCellV2';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.background.secondary : 'none'};
`;

export function EntityTableRow({ rowId }: { rowId: string }) {
  const entityFieldMetadataArray = useRecoilValue(
    entityFieldMetadataArrayState,
  );

  return (
    <StyledRow data-testid={`row-id-${rowId}`} selected={false}>
      <td>
        <CheckboxCell />
      </td>
      {entityFieldMetadataArray.map((entityFieldMetadata, columnIndex) => {
        return (
          <EntityFieldMetadataContext.Provider
            value={entityFieldMetadata}
            key={entityFieldMetadata.columnOrder}
          >
            <EntityTableCell cellIndex={columnIndex} />
          </EntityFieldMetadataContext.Provider>
        );
      })}
      <td></td>
    </StyledRow>
  );
}
