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
  height: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: start;
`;

const StyledTD = styled.td`
  border: 1px solid ${({ theme }) => theme.color.gray20};
  height: ${({ theme }) => theme.spacing(4)};
  text-align: start;
  padding: ${({ theme }) => theme.spacing(2)};
  max-width: 480px;
  word-wrap: break-word;
  overflow: hidden;
`;

interface CellProps {
  value: any;
}

const Cell = (props: CellProps) => {
  return <StyledTD>{props.value}</StyledTD>;
};

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
          {Object.values(row).map((value) => (
            <Cell value={value} />
          ))}
        </StyledTR>
      ))}
    </StyledTable>
  );
};
