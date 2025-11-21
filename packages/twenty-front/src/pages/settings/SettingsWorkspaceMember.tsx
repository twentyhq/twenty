import { useParams } from 'react-router-dom';

export const SettingsWorkspaceMember = () => {
  const { workspaceMemberId } = useParams();
  return <div>{workspaceMemberId}</div>;
};
