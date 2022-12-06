import styled from '@emotion/styled';

export type NoteEvent = {
  id: number;
  time: string;
  message: string;
  agent: string;
};

type OwnProps = {
  note: NoteEvent;
};

const StyledNote = styled.div`
  display: flex;
  background: #f8f9fa;
  border-left: 4px solid black;
  padding: 8px 20px;
  flex-direction: column;
  margin-top: 12px;
  margin-bottom: 20px;
`;

const StyledLabel = styled.div`
  font-size: 12px;
  color: #2e3138;
  margin-bottom: 8px;
  display: flex;
  flex-direction: row;
`;

const StyledAgent = styled.div`
  text-decoration: underline;
  margin-left: 4px;
  font-size: 12px;
  color: #2e3138;
`;

const StyledMessage = styled.div``;

function Note({ note }: OwnProps) {
  return (
    <StyledNote>
      <StyledLabel>
        Internal Note {note.time} <StyledAgent>by {note.agent}</StyledAgent>
      </StyledLabel>
      <StyledMessage>{note.message}</StyledMessage>
    </StyledNote>
  );
}

export default Note;
