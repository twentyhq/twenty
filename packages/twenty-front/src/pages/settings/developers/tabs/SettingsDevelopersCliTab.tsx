import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { CommandBlock } from 'twenty-ui/components/data-display';
import { Section } from 'twenty-ui/components/layout';
import { IconArrowUpRight, IconCopy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const CLI_COMMAND_REFERENCE_URL =
  'https://github.com/twentyhq/twenty/blob/main/packages/twenty-cli/docs/commands.md';

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsDevelopersCliCommandSectionProps = {
  title: string;
  description: string;
  commands: string[];
  children?: ReactNode;
};

const SettingsDevelopersCliCommandSection = ({
  title,
  description,
  commands,
  children,
}: SettingsDevelopersCliCommandSectionProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <Section.Root>
      <Section.Header title={title} description={description} />
      <CommandBlock
        commands={commands}
        actions={
          <Button
            onClick={() =>
              copyToClipboard(
                commands.join('\n'),
                t`Commands copied to clipboard`,
              )
            }
            aria-label={t`Copy commands`}
            startIcon={<IconCopy />}
          />
        }
      />
      {children}
    </Section.Root>
  );
};

export const SettingsDevelopersCliTab = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return (
    <>
      <SettingsDevelopersCliCommandSection
        title={t`Install`}
        description={t`Install the Twenty CLI globally. Requires Node.js 24.5 or later.`}
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        commands={['npm install -g twenty']}
      />

      <SettingsDevelopersCliCommandSection
        title={t`Connect to this workspace`}
        description={t`Sign in from your browser and make this workspace your default connection.`}
        commands={[
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          `twenty auth login --url ${REACT_APP_SERVER_BASE_URL} --use`,
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          'twenty auth status',
        ]}
      />

      <SettingsDevelopersCliCommandSection
        title={t`Explore your data`}
        description={t`Inspect the data model, query records and send raw API requests.`}
        commands={[
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          'twenty metadata object list',
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          'twenty data list companies --limit 5',
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          "twenty api rest '/rest/people?limit=5'",
        ]}
      />

      <SettingsDevelopersCliCommandSection
        title={t`Build an app`}
        description={t`Scaffold an app, register it in this workspace and sync your changes as you code.`}
        commands={[
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          'twenty app init my-app',
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          'cd my-app',
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          'yarn install',
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          'twenty app apply --create',
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          'twenty app dev',
        ]}
      >
        <StyledButtonContainer>
          <Button
            startIcon={<IconArrowUpRight />}
            size="sm"
            variant="ghost"
            onClick={() => openUrlInNewTab(CLI_COMMAND_REFERENCE_URL)}
          >{t`Command reference`}</Button>
          <Button
            startIcon={<IconArrowUpRight />}
            size="sm"
            variant="outline"
            onClick={() =>
              openUrlInNewTab(
                getDocumentationUrl({
                  locale: currentWorkspaceMember?.locale,
                  path: '/developers/extend/apps/operations/cli',
                }),
              )
            }
          >{t`Read documentation`}</Button>
        </StyledButtonContainer>
      </SettingsDevelopersCliCommandSection>
    </>
  );
};
