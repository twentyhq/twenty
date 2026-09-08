import { DesktopRecorderSetupDocument } from '~/generated-metadata/graphql';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconDownload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

const StyledInstructions = styled.ol`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.6;
  padding-left: ${themeCssVariables.spacing[4]};
`;

export const SettingsDesktopDownloadSection = () => {
  const { t } = useLingui();
  const { data, loading, error } = useQuery(DesktopRecorderSetupDocument, {
    fetchPolicy: 'network-only',
  });
  const setup = data?.desktopRecorderSetup;

  return (
    <Section>
      <H2Title
        title={t`Twenty for macOS`}
        description={
          error
            ? t`Could not load desktop setup. Try reopening this page.`
            : loading
              ? t`Loading desktop setup…`
              : !setup?.installed
                ? t`Install Desktop Recorder in Settings → Apps to get started.`
                : t`Record meetings from your computer and find transcripts and summaries in this workspace.`
        }
      />
      {!loading && !error && setup && !setup.installed && (
        <Button
          title={t`Install Desktop Recorder`}
          to="/settings/applications/available/8bdaaa9f-dc53-4247-a89b-aa386c9b3244"
        />
      )}
      {setup?.installed && (
        <>
          <Button
            Icon={IconDownload}
            title={t`Download Twenty for macOS`}
            variant="primary"
            disabled={!setup.downloadUrl}
            onClick={() => {
              if (setup.downloadUrl)
                window.open(setup.downloadUrl, '_blank', 'noopener,noreferrer');
            }}
          />
          {!setup.downloadUrl && (
            <p>
              <Trans>
                The desktop download is not available yet. Ask your
                administrator to add the published release URL.
              </Trans>
            </p>
          )}
          <StyledInstructions>
            <li>
              <Trans>
                Requires macOS 14.2 or later on Apple silicon. Install Twenty in
                Applications.
              </Trans>
            </li>
            <li>
              <Trans>
                Open Twenty, choose Connect workspace, and enter this
                workspace’s URL.
              </Trans>
            </li>
            <li>
              <Trans>
                Authorize Desktop Recorder in your browser, then allow
                microphone and call audio access on your Mac.
              </Trans>
            </li>
          </StyledInstructions>
          <p>
            <Trans>
              Each person connects their own Twenty account. Disconnecting the
              desktop app does not uninstall Desktop Recorder for the workspace.
            </Trans>
          </p>
        </>
      )}
    </Section>
  );
};
