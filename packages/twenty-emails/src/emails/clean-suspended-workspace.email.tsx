import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared/translations';

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
      <Title value={i18n._('Deleted Workspace')} />
      <MainText>
        {userName?.length > 1 ? (
          <Trans id="Dear {userName}," values={{ userName }} />
        ) : (
          <Trans id="Hello," />
        )}
        <br />
        <br />
        <Trans
          id="Your workspace <0>{workspaceDisplayName}</0> has been deleted as your subscription expired {daysSinceInactive} days ago."
          values={{ workspaceDisplayName, daysSinceInactive }}
          components={{ 0: <b /> }}
        />
        <br />
        <br />
        <Trans id="All data in this workspace has been permanently deleted." />
        <br />
        <br />
        <Trans id="If you wish to use Twenty again, you can create a new workspace." />
      </MainText>
      <br />
      <CallToAction
        href="https://app.twenty.com/"
        value={i18n._('Create a new workspace')}
      />
      <br />
      <br />
    </BaseEmail>
  );
};

CleanSuspendedWorkspaceEmail.PreviewProps = {
  daysSinceInactive: 1,
  userName: 'John Doe',
  workspaceDisplayName: 'My Workspace',
  locale: 'en',
} as CleanSuspendedWorkspaceEmailProps;

export default CleanSuspendedWorkspaceEmail;
