import type { Column } from 'react-data-grid';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';

import type { Fields } from '@/spreadsheet-import/types';
import { AppTooltip } from '@/ui/tooltip/AppTooltip';

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

const StyledDefaultContainer = styled.div`
  min-height: 100%;
  min-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const generateColumns = <T extends string>(fields: Fields<T>) =>
  fields.map(
    (column): Column<any> => ({
      key: column.key,
      name: column.label,
      minWidth: 150,
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
      formatter: ({ row }) => (
        <StyledDefaultContainer>{row[column.key]}</StyledDefaultContainer>
      ),
    }),
  );
