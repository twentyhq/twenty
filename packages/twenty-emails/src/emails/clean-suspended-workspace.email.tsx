import { Trans } from '@lingui/react/macro';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared';

type CleanSuspendedWorkspaceEmailProps = {
  daysSinceInactive: number;
  userName: string;
  workspaceDisplayName: string | undefined;
  locale: keyof typeof APP_LOCALES;
};

export const CleanSuspendedWorkspaceEmail = ({
  daysSinceInactive,
  userName,
  workspaceDisplayName,
  locale,
}: CleanSuspendedWorkspaceEmailProps) => {
  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={<Trans>Deleted Workspace</Trans>} />
      <MainText>
        {userName?.length > 1 ? (
          <Trans>Dear {userName},</Trans>
        ) : (
          <Trans>Hello,</Trans>
        )}
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
        value={<Trans>Create a new workspace</Trans>}
      />
    </BaseEmail>
  );
};
