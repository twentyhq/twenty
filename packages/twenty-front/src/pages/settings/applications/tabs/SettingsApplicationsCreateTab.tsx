import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import {
  CommandBlock,
  H2Title,
  IconCopy,
  IconFileInfo,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

export const SettingsApplicationsCreateTab = () => {
  const { t } = useLingui();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { copyToClipboard } = useCopyToClipboard();

  const commands = [
    // eslint-disable-next-line lingui/no-unlocalized-strings
    'npx create-twenty-app@latest my-twenty-app',
    // eslint-disable-next-line lingui/no-unlocalized-strings
    'cd my-twenty-app',
  ];

  const button = (
    <Button
      onClick={() => {
        copyToClipboard(commands.join('\n'), t`Commands copied to clipboard`);
      }}
      ariaLabel={t`Copy commands`}
      Icon={IconCopy}
    />
  );

  return (
    <Section>
      <H2Title
        title={t`Create an application`}
        description={t`You can either create a private app or share it to others`}
      />
      <CommandBlock commands={commands} button={button} />
      <StyledButtonContainer>
        <Button
          Icon={IconFileInfo}
          title={t`Read documentation`}
          onClick={() =>
            window.open(
              getDocumentationUrl({
                locale: currentWorkspaceMember?.locale,
                path: '/developers/extend/capabilities/apps',
              }),
              '_blank',
            )
          }
        />
      </StyledButtonContainer>
    </Section>
  );
};
