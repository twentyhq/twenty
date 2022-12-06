import Note from '../Note';

export default {
  title: 'DiscussionPanel',
  component: Note,
};

export const NoteDefault = () => (
  <Note
    note={{
      id: 1,
      time: 'just now',
      agent: 'LeslieA',
      message: 'Hello I’m here bla bla bla',
    }}
  />
);
