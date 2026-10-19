import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { Section } from 'twenty-ui/components/layout';
import {
  IconBell,
  IconBrandGithub,
  IconDatabase,
  IconExternalLink,
  IconHistory,
  IconLock,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsCardSeparator } from '@/settings/components/SettingsCardSeparator';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { TWENTY_REPOSITORY_URL } from '@/settings/privacy/constants/TwentyRepositoryUrl';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

export const SettingsPrivacySafeguards = () => {
  const { t } = useLingui();

  const safeguards = [
    {
      Icon: IconLock,
      title: t`Encrypted everywhere`,
      description: t`Data is encrypted in transit and at rest, with keys rotated regularly`,
    },
    {
      Icon: IconDatabase,
      title: t`Isolated workspace`,
      description: t`Each workspace has its own database schema`,
    },
    {
      Icon: IconHistory,
      title: t`EU backups`,
      description: t`Encrypted daily snapshots, kept 30 days in the EU`,
    },
    {
      Icon: IconBell,
      title: t`Breach notification`,
      description: t`We notify you within 72 hours, as set out in the DPA`,
    },
  ];

  return (
    <Section.Root>
      <Section.Header
        title={t`How your data is protected`}
        description={t`The safeguards behind every Twenty Cloud workspace.`}
      />
      <Card.Root>
        {safeguards.map(({ Icon, title, description }) => (
          <Fragment key={title}>
            <SettingsOptionCardContentButton
              Icon={Icon}
              title={title}
              description={description}
            />
            <SettingsCardSeparator />
          </Fragment>
        ))}
        <SettingsOptionCardContentButton
          Icon={IconBrandGithub}
          title={t`Open source`}
          description={t`Every line of code is public, so you can audit it yourself`}
          Button={
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconExternalLink />}
              onClick={() => openUrlInNewTab(TWENTY_REPOSITORY_URL)}
            >{t`GitHub`}</Button>
          }
        />
      </Card.Root>
    </Section.Root>
  );
};
