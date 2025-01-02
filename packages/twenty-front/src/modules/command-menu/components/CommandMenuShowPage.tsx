import { commandMenuViewableRecordIdState } from '@/command-menu/states/commandMenuViewableRecordIdState';
import { useRecoilValue } from 'recoil';

export const CommandMenuShowPage = () => {
  const commandMenuViewableRecordId = useRecoilValue(
    commandMenuViewableRecordIdState,
  );

  return <div>{commandMenuViewableRecordId}</div>;
};
