import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type WarnSuspendedWorkspaceEmailProps = {
  daysSinceInactive: number;
  inactiveDaysBeforeDelete: number;
  userName: string;
  workspaceDisplayName: string | undefined;
};

export const WarnSuspendedWorkspaceEmail = ({
  daysSinceInactive,
  inactiveDaysBeforeDelete,
  userName,
  workspaceDisplayName,
}: WarnSuspendedWorkspaceEmailProps) => {
  const daysLeft = inactiveDaysBeforeDelete - daysSinceInactive;
  const dayOrDays = daysLeft > 1 ? 'days' : 'day';
  const remainingDays = daysLeft > 0 ? `${daysLeft} ` : '';

  const helloString = userName?.length > 1 ? `Hello ${userName}` : 'Hello';

  return (
    <BaseEmail width={333}>
      <Title value="Suspended Workspace 😴" />
      <MainText>
        {helloString},
        <br />
        <br />
        It appears that your workspace <b>{workspaceDisplayName}</b> has been
        suspended for {daysSinceInactive} days.
        <br />
        <br />
        The workspace will be deactivated in {remainingDays} {dayOrDays}, and
        all its data will be deleted.
        <br />
        <br />
        If you wish to continue using Twenty, please update your subscription
        within the next {remainingDays} {dayOrDays}.
      </MainText>
      <CallToAction
        href="https://app.twenty.com/settings/billing"
        value="Update your subscription"
      />
    </BaseEmail>
  );
};
