import { Trans } from '@lingui/react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

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
  const i18n = createI18nInstance(locale);
  const daysLeft = inactiveDaysBeforeDelete - daysSinceInactive;
  const dayOrDays = daysLeft > 1 ? 'days' : 'day';
  const remainingDays = daysLeft > 0 ? daysLeft : 0;

  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('Your workspace is paused')} />
      <MainText>
        {userName?.length > 1 ? (
          <Trans id="Hi {userName}," values={{ userName }} />
        ) : (
          <Trans id="Hello," />
        )}
        <br />
        <br />
        <Trans
          id="Good news first: your workspace <0>{workspaceDisplayName}</0> is only paused — none of your data is gone."
          values={{ workspaceDisplayName }}
          components={{ 0: <b /> }}
        />
        <br />
        <br />
        <Trans
          id="Reactivate it within the next {remainingDays} {dayOrDays} and you'll pick up exactly where you left off, with every record, view and setting right where you left it."
          values={{ remainingDays, dayOrDays }}
        />
        <br />
        <br />
        <Trans id="After that, the workspace and all of its data will be permanently deleted — and we won't be able to bring it back." />
      </MainText>
      <br />
      <CallToAction
        href="https://app.twenty.com/settings/billing"
        value={i18n._('Reactivate workspace')}
      />
      <br />
      <br />
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
