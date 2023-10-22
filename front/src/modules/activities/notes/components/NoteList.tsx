import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { NoteForList } from '../../types/NoteForList';

import { NoteCard } from './NoteCard';

type NoteListProps = {
  title: string;
  notes: NoteForList[];
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

const StyledTitle = styled.h3`
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

export const NoteList = ({ title, notes, button }: NoteListProps) => (
  <>
    {notes && notes.length > 0 && (
      <StyledContainer>
        <StyledTitleBar>
          <StyledTitle>
            {title} <StyledCount>{notes.length}</StyledCount>
          </StyledTitle>
          {button}
        </StyledTitleBar>
        <StyledNoteContainer>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </StyledNoteContainer>
      </StyledContainer>
    )}
  </>
);
