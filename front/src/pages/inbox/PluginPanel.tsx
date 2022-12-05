import styled from '@emotion/styled';
import ListPanelHeader from './ListPanelHeader';
import ListPanelItem from './ListPanelItem';

const StyledList = styled.div`
  display: flex;
  width: 325px;
  flex-direction: column;
  border-right: 2px solid #eaecee;
`;

export type Task = {
  id: number;
  targetUser: string;
  label: string;
  time: string;
  lastMessage: string;
};

function ListPanel() {
  const tasks: Task[] = [
    {
      id: 1,
      targetUser: 'Sylvie Vartan',
      label: 'Guest at #xxx property',
      time: '3h',
      lastMessage:
        'I’m looking for my order but couldn’t find it. Could you help me find it. I don’t know where ...',
    },
    {
      id: 2,
      targetUser: 'Johnny Halliday',
      label: 'Guest at #xxx property',
      time: '4h',
      lastMessage: 'Hello, this is Johnny',
    },
  ];
  return (
    <StyledList>
      <>
        <ListPanelHeader />
        {tasks.map((item) => (
          <ListPanelItem key={item.id} task={item} />
        ))}
      </>
    </StyledList>
  );
}

export default ListPanel;
