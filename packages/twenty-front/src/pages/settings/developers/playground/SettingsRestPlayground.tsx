import { RestPlayground } from '@/settings/playground/components/RestPlayground';
import { SettingsPath } from '@/types/SettingsPath';
import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/components/PageHeader';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledNestedContainer = styled.div`
  height: 100%;
  width: 100%;

  [data-v-app] {
    max-height: ${({ theme }) =>
      `calc(
        100dvh 
        - ${PAGE_BAR_MIN_HEIGHT * 3}px 
        - ${theme.spacing(3)}
      ) !important`};
  }
`;

export const SettingsRestPlayground = () => {
  const navigateSettings = useNavigateSettings();

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.APIs);
  };

  const handleError = () => {
    handleExitFullScreen();
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
        { children: <Trans>REST</Trans> },
      ]}
    >
      <ScrollWrapper
        contextProviderName="playgroundPageContainer"
        componentInstanceId={'scroll-wrapper-playground-page-container'}
      >
        <StyledNestedContainer>
          <RestPlayground onError={handleError} />
        </StyledNestedContainer>
      </ScrollWrapper>
    </FullScreenContainer>
  );
};
