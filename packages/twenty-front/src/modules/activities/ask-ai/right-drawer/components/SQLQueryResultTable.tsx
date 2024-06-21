import styled from '@emotion/styled';

interface SQLQueryResultTableProps {
  sqlQueryResult: string;
}

const StyledTable = styled.table`
  border-collapse: collapse;
`;

const StyledTR = styled.tr``;

const StyledTH = styled.th`
  border: 1px solid ${({ theme }) => theme.color.gray20};
  height: 16px;
  padding: 8px ${({ theme }) => theme.table.horizontalCellPadding};
  text-align: start;
`;

const StyledTD = styled.td`
  border: 1px solid ${({ theme }) => theme.color.gray20};
  height: 16px;
  text-align: start;
  padding: 8px ${({ theme }) => theme.table.horizontalCellPadding};
`;

export const SQLQueryResultTable = (props: SQLQueryResultTableProps) => {
  const sqlQueryResult: Array<Record<string, any>> = JSON.parse(
    props.sqlQueryResult,
  );

  return (
    <StyledTable>
      <StyledTR>
        {Object.keys(sqlQueryResult[0]).map((colName) => (
          <StyledTH>{colName}</StyledTH>
        ))}
      </StyledTR>
      {sqlQueryResult.map((row) => (
        <StyledTR>
          {Object.entries(row).map(([colName, value]) => (
            <StyledTD>{value}</StyledTD>
          ))}
        </StyledTR>
      ))}
    </StyledTable>
  );
};
