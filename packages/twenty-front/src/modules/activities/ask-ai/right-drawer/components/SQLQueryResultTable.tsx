import styled from '@emotion/styled';

import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { RecordChip } from '@/object-record/components/RecordChip';

interface RecordMetadata {
  objectNameSingular: string;
  name: string;
  nameFirstName?: string;
  nameLastName?: string;
  domainName?: string;
}

type RecordDisplayDataById = Record<string, RecordMetadata>;

interface SQLQueryResultTableProps {
  sqlQueryResult: string;
  recordDisplayDataById: RecordDisplayDataById;
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
  recordMetadata?: RecordMetadata;
}

const Cell = (props: CellProps) => {
  if (props.recordMetadata !== undefined) {
    return (
      <StyledTD>
        <RecordChip
          objectNameSingular={props.recordMetadata.objectNameSingular}
          record={{
            id: props.value,
            __typename: getObjectTypename(
              props.recordMetadata.objectNameSingular,
            ),
            name: props.recordMetadata.name || {
              firstName: props.recordMetadata.nameFirstName,
              lastName: props.recordMetadata.nameLastName,
            }, // TODO: Use existing fns
            domainName: props.recordMetadata.domainName,
          }}
        />
      </StyledTD>
    );
  }
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
            <Cell
              value={value}
              recordMetadata={props.recordDisplayDataById[value]}
            />
          ))}
        </StyledTR>
      ))}
    </StyledTable>
  );
};
