import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { SettingsPath } from '@/types/SettingsPath';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { Button, IconX, ThemeContext, useIsMobile } from 'twenty-ui';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledMainContainer = styled.div<{ showPlayground?: boolean }>`
  width: 100%;
  overflow-y: scroll;
`;

export const RestPlayground = () => {
  const [openAPIReference] = useRecoilState(openAPIReferenceState);
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  
  const links= [
    {
      children: <Trans>Workspace</Trans>,
      href: getSettingsPath(SettingsPath.Workspace),
    },
    {
      children: <Trans>APIs</Trans>,
      href: getSettingsPath(SettingsPath.APIs),
    },
    { children: <Trans>Rest API Playground</Trans> },
  ]

  const closePlayground = () => {
    navigateSettings(SettingsPath.APIs);
  }

  return (
    <StyledPage>
      <PageHeader title={<Breadcrumb links={links} />}>
        <Button
          Icon={IconX}
          dataTestId="close-button"
          size={isMobile ? 'medium' : 'small'}
          variant="secondary"
          accent="default"
          onClick={closePlayground}
          ariaLabel={t`Close playground`}
        />
      </PageHeader>
      <StyledMainContainer>
        <ApiReferenceReact
          configuration={{
            spec: {
              content: openAPIReference,
            },
            forceDarkModeState: theme.name as 'dark' | 'light'
          }}
        />
      </StyledMainContainer>
    </StyledPage>
  );
};
