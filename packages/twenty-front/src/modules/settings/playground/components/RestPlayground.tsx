import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { SettingsPath } from '@/types/SettingsPath';
import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/components/PageHeader';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ThemeContext } from 'twenty-ui';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledNestedContainer = styled.div<{ pageBarHeight: number }>`
  height: 100%;
  width: 100%;

  [data-v-app] {
    max-height: ${({ theme, pageBarHeight }) =>
      `calc(
        100dvh 
        - ${pageBarHeight * 3}px 
        - ${theme.spacing(3)}
      ) !important`};
  }
`;

export const RestPlayground = () => {
  const [openAPIReference] = useRecoilState(openAPIReferenceState);
  const { theme } = useContext(ThemeContext);
  const navigateSettings = useNavigateSettings();

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.APIs);
  };

  return (
    <FullScreenContainer
      exitFullScreen={handleExitFullScreen}
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
      <ScrollWrapper
        contextProviderName="playgroundPageContainer"
        componentInstanceId={'scroll-wrapper-playground-page-container'}
      >
        <StyledNestedContainer pageBarHeight={PAGE_BAR_MIN_HEIGHT}>
          <ApiReferenceReact
            configuration={{
              spec: {
                content: openAPIReference,
              },
              forceDarkModeState: theme.name as 'dark' | 'light',
            }}
          />
        </StyledNestedContainer>
      </ScrollWrapper>
    </FullScreenContainer>
  );
};
