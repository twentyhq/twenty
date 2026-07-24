import { styled } from '@linaria/react';

import { type Note } from '@/activities/types/Note';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NoteTile } from './NoteTile';

type NoteListProps = {
  notes: Note[];
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]};
`;

const StyledNoteContainer = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  width: 100%;
`;

export const NoteList = ({ notes }: NoteListProps) => {
  return (
    <>
      {notes.length > 0 && (
        <StyledContainer>
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
};
