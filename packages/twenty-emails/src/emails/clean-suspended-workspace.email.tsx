import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type CleanSuspendedWorkspaceEmailProps = {
  inactiveDaysBeforeDelete: number;
  userName: string;
  workspaceDisplayName: string | undefined;
};

export const CleanSuspendedWorkspaceEmail = ({
  inactiveDaysBeforeDelete,
  userName,
  workspaceDisplayName,
}: CleanSuspendedWorkspaceEmailProps) => {
  const helloString = userName?.length > 1 ? `Hello ${userName}` : 'Hello';

  return (
    <BaseEmail width={333}>
      <Title value="Deleted Workspace 🥺" />
      <MainText>
        {helloString},
        <br />
        <br />
        We wanted to inform you that your{''}
        <b>{workspaceDisplayName}</b> workspace has been deleted as it remained
        suspended for {inactiveDaysBeforeDelete} days following your
        subscription expiration.
        <br />
        <br />
        All associated data within this workspace has been permanently deleted.
        <br />
        <br />
        If you wish to continue using Twenty, you can create a new workspace.
      </MainText>
      <CallToAction
        href="https://app.twenty.com/"
        value="Create a new workspace"
      />
    </BaseEmail>
  );
};
