import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { Section } from 'twenty-ui/components/layout';
import {
  IconBell,
  IconBrandGithub,
  IconCpu,
  IconDatabase,
  IconExternalLink,
  IconHistory,
  IconLock,
  IconMap,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsCardSeparator } from '@/settings/components/SettingsCardSeparator';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { TWENTY_REPOSITORY_URL } from '@/settings/privacy/constants/TwentyRepositoryUrl';
import { type PrivacyAudience } from '@/settings/privacy/types/PrivacyAudience';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

type SettingsPrivacySafeguardsProps = {
  privacyAudience: PrivacyAudience;
};

export const SettingsPrivacySafeguards = ({
  privacyAudience,
}: SettingsPrivacySafeguardsProps) => {
  const { t } = useLingui();

  const backupsByAudience = {
    eu: {
      title: t`EU backups`,
      description: t`Encrypted daily snapshots, kept 30 days in the EU`,
    },
    global: {
      title: t`Daily backups`,
      description: t`Encrypted daily snapshots, kept 30 days`,
    },
  } satisfies Record<PrivacyAudience, { title: string; description: string }>;

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
      Icon: IconCpu,
      title: t`No training on your data`,
      description: t`No AI provider trains on your data, and neither does Twenty`,
    },
    {
      Icon: IconHistory,
      ...backupsByAudience[privacyAudience],
    },
    {
      Icon: IconBell,
      title: t`Breach notification`,
      description: t`We notify you within 72 hours, as set out in the DPA`,
    },
    ...(privacyAudience === 'global'
      ? [
          {
            Icon: IconMap,
            title: t`Hosting`,
            description: t`Workspaces run on AWS in Frankfurt, Germany`,
          },
        ]
      : []),
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
