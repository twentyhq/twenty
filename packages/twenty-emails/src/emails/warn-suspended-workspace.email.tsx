import { i18n } from '@lingui/core';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { APP_LOCALES } from 'twenty-shared/translations';

type WarnSuspendedWorkspaceEmailProps = {
  daysSinceInactive: number;
  inactiveDaysBeforeDelete: number;
  userName: string;
  workspaceDisplayName: string | undefined;
  locale: keyof typeof APP_LOCALES;
};

export const WarnSuspendedWorkspaceEmail = ({
  daysSinceInactive,
  inactiveDaysBeforeDelete,
  userName,
  workspaceDisplayName,
  locale,
}: WarnSuspendedWorkspaceEmailProps) => {
  const daysLeft = inactiveDaysBeforeDelete - daysSinceInactive;
  const dayOrDays = daysLeft > 1 ? 'days' : 'day';
  const remainingDays = daysLeft > 0 ? `${daysLeft} ` : '';

  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('Suspended Workspace')} />
      <MainText>
        {userName?.length > 1 ? i18n._(`Dear ${userName},`) : i18n._('Hello,')}
        <br />
        <br />
        {i18n._(
          `It appears that your workspace <b>${workspaceDisplayName}</b> has been suspended for ${daysSinceInactive} days.`,
        )}
        <br />
        <br />
        {i18n._(
          `The workspace will be deactivated in ${remainingDays} ${dayOrDays}, and all its data will be deleted.`,
        )}
        <br />
        <br />
        {i18n._(
          `If you wish to continue using Twenty, please update your subscription within the next ${remainingDays} ${dayOrDays}.`,
        )}
      </MainText>
      <CallToAction
        href="https://app.twenty.com/settings/billing"
        value={i18n._('Update your subscription')}
      />
    </BaseEmail>
  );
};

WarnSuspendedWorkspaceEmail.PreviewProps = {
  daysSinceInactive: 10,
  inactiveDaysBeforeDelete: 14,
  userName: 'John Doe',
  workspaceDisplayName: 'Acme Inc.',
  locale: 'en',
};

export default WarnSuspendedWorkspaceEmail;
