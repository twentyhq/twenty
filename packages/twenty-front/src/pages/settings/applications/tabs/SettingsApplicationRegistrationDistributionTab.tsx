import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { CommandBlock, Section } from 'twenty-ui/components';
import { IconCopy } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { SettingsApplicationRegistrationShareLinkButtons } from '~/pages/settings/applications/components/SettingsApplicationRegistrationShareLinkButtons';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';

export const SettingsApplicationRegistrationDistributionTab = ({
  registration,
  fromAdmin,
}: {
  registration: ApplicationRegistrationData;
  fromAdmin?: boolean;
}) => {
  const { t } = useLingui();

  const { copyToClipboard } = useCopyToClipboard();

  const isNpmSource =
    registration.sourceType === ApplicationRegistrationSourceType.NPM;

  const isTarballSource =
    registration.sourceType === ApplicationRegistrationSourceType.TARBALL;

  const shareLink = getSettingsPath(SettingsPath.AvailableApplicationDetail, {
    availableApplicationId: registration.universalIdentifier,
  });

  const publishCommands = ['yarn twenty app:publish'];

  return (
    <>
      {isNpmSource && fromAdmin !== true && (
        <Section.Root>
          <Section.Header
            title={t`Ownership`}
            description={t`This application's registration is claimed by your workspace`}
          />
          <Tag color="green">{t`Claimed by this workspace`}</Tag>
        </Section.Root>
      )}
      <Section.Root>
        <Section.Header
          title={t`Public`}
          description={t`Publish your app to the marketplace so others can install it`}
        />
        {isNpmSource && (
          <SettingsApplicationRegistrationShareLinkButtons
            shareLink={shareLink}
            universalIdentifier={registration.universalIdentifier}
            isNpmSource
            withCopyButton
          />
        )}
        {isTarballSource && (
          <CommandBlock
            commands={publishCommands}
            button={
              <Button
                onClick={() => {
                  copyToClipboard(
                    publishCommands.join('\n'),
                    t`Command copied to clipboard`,
                  );
                }}
                aria-label={t`Copy command`}
                startIcon={<IconCopy />}
              />
            }
          />
        )}
      </Section.Root>
      {isTarballSource && (
        <Section.Root>
          <Section.Header
            title={t`Private`}
            description={t`Share your app to other workspaces without pushing it on the marketplace`}
          />
          <SettingsApplicationRegistrationShareLinkButtons
            shareLink={shareLink}
            universalIdentifier={registration.universalIdentifier}
            withCopyButton
          />
        </Section.Root>
      )}
    </>
  );
};
