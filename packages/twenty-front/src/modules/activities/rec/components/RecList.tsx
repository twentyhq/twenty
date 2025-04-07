import styled from '@emotion/styled';
import { ReactElement } from 'react';

import { RecCard } from './RecCard';

type RecListProps = {
  title: string;
  records: any[];
  button?: ReactElement | false;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 24px;
`;

const StyledTitleBar = styled.h3`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledNoteContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  width: 100%;
`;

export const RecList = ({ title, records, button }: RecListProps) => (
  <>
    {records && records.length > 0 && (
      <StyledContainer>
        <StyledTitleBar>
          <StyledTitle>
            {title} <StyledCount>{records.length}</StyledCount>
          </StyledTitle>
          {button}
        </StyledTitleBar>
        <StyledNoteContainer>
          {records.map((record) => (
            <RecCard
              key={record.id}
              record={record}
              isSingleNote={records.length === 1}
            />
          ))}
        </StyledNoteContainer>
      </StyledContainer>
    )}
  </>
);
