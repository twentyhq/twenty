import { styled } from '@linaria/react';
import { type ReactElement } from 'react';

import { type Note } from '@/activities/types/Note';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NoteTile } from './NoteTile';

type NoteListProps = {
  title: string;
  notes: Note[];
  button?: ReactElement | false | null;
  totalCount: number;
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
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledNoteContainer = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  width: 100%;
`;

export const NoteList = ({
  title,
  notes,
  totalCount,
  button,
}: NoteListProps) => (
  <>
    {notes && notes.length > 0 && (
      <StyledContainer>
        <StyledTitleBar>
          <StyledTitle>
            {title} <StyledCount>{totalCount}</StyledCount>
          </StyledTitle>
          {button}
        </StyledTitleBar>
        <StyledNoteContainer>
          {notes.map((note) => (
            <NoteTile
              key={note.id}
              note={note}
              isSingleNote={notes.length === 1}
            />
          ))}
        </StyledNoteContainer>
      </StyledContainer>
    )}
  </>
);
