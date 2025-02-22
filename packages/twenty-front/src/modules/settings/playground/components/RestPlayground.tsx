import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { SettingsPath } from '@/types/SettingsPath';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ThemeContext } from 'twenty-ui';
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

  return (
    <StyledPage>
      <PageHeader title={<Breadcrumb links={links} />}>
        {/* {actionButton} */}
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
