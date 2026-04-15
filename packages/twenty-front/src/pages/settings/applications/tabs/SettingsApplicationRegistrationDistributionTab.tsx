import { useLingui } from '@lingui/react/macro';
import {
  CommandBlock,
  H2Title,
  IconCopy,
  IconInfoCircle,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsApplicationRegistrationShareLinkButtons } from '~/pages/settings/applications/components/SettingsApplicationRegistrationShareLinkButtons';

const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationDistributionTab = ({
  registration,
}: {
  registration: ApplicationRegistrationData;
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

  const publishCommands = ['yarn twenty publish'];

  return (
    <>
      <Section>
        <H2Title
          title={t`Public`}
          description={t`Publish your app to the marketplace so others can install it`}
        />
        {isNpmSource && (
          <SettingsApplicationRegistrationShareLinkButtons
            shareLink={shareLink}
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
                ariaLabel={t`Copy command`}
                Icon={IconCopy}
              />
            }
          />
        )}
      </Section>
      {isTarballSource && (
        <Section>
          <H2Title
            title={t`Private`}
            description={t`Share your app to other workspaces without pushing it on the marketplace`}
          />
          <SettingsApplicationRegistrationShareLinkButtons
            shareLink={shareLink}
          />
        </Section>
      )}
    </>
  );
};
