import { Trans } from '@lingui/react/macro';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type CleanSuspendedWorkspaceEmailProps = {
  daysSinceInactive: number;
  userName: string;
  workspaceDisplayName: string | undefined;
};

export const CleanSuspendedWorkspaceEmail = ({
  daysSinceInactive,
  userName,
  workspaceDisplayName,
}: CleanSuspendedWorkspaceEmailProps) => {
  const helloString = userName?.length > 1 ? `Hello ${userName}` : 'Hello';

  return (
    <BaseEmail width={333} locale="en">
      <Title value="Deleted Workspace 🥺" />
      <MainText>
        {helloString},
        <br />
        <br />
        <Trans>
          Your workspace <b>{workspaceDisplayName}</b> has been deleted as your
          subscription expired {daysSinceInactive} days ago.
        </Trans>
        <br />
        <br />
        <Trans>All data in this workspace has been permanently deleted.</Trans>
        <br />
        <br />
        <Trans>
          If you wish to use Twenty again, you can create a new workspace.
        </Trans>
      </MainText>
      <CallToAction
        href="https://app.twenty.com/"
        value="Create a new workspace"
      />
    </BaseEmail>
  );
};
