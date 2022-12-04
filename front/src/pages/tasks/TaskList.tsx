import styled from '@emotion/styled';
import TaskListHeader from './TaskListHeader';
import TaskListItem from './TaskListItem';

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

function TaskList() {
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
        <TaskListHeader />
        {tasks.map((item) => (
          <TaskListItem key={item.id} task={item} />
        ))}
      </>
    </StyledList>
  );
}

export default TaskList;
