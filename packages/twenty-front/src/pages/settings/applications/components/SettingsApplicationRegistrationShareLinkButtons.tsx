import { Button } from 'twenty-ui/input';
import { IconCopy, IconInfoCircle } from 'twenty-ui/display';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useLingui } from '@lingui/react/macro';

const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationShareLinkButtons = ({
  shareLink,
}: {
  shareLink: string;
}) => {
  const { t } = useLingui();

  const { copyToClipboard } = useCopyToClipboard();

  return (
    <StyledButtonGroup>
      <Button
        Icon={IconCopy}
        title={t`Copy sharing link`}
        variant="secondary"
        disabled={!shareLink}
        onClick={async () => {
          if (shareLink) {
            await copyToClipboard(
              `${window.location.origin}${shareLink}`,
              t`Sharing link copied to clipboard`,
            );
          }
        }}
      />
      <Button
        Icon={IconInfoCircle}
        title={t`See app page`}
        variant="secondary"
        disabled={!shareLink}
        to={shareLink}
      />
    </StyledButtonGroup>
  );
};
