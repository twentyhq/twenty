import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ThemeContext } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledContainer = styled.div`
  height: 100vh;
  position: relative;
  width: 100vw;
`;

export const RestApiWrapper = () => {
  const [openAPIReference] = useRecoilState(openAPIReferenceState);
  const { theme } = useContext(ThemeContext);

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>APIs</Trans>,
          href: getSettingsPath(SettingsPath.APIs),
        },
        { children: <Trans>Rest API Playground</Trans> },
      ]}
    >
      <StyledContainer>
        <ApiReferenceReact
          configuration={{
            spec: {
              content: openAPIReference,
            },
            forceDarkModeState: theme.name as 'dark' | 'light'
          }}
        />
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
