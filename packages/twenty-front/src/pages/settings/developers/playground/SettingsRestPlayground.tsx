import { apiKeyState } from '@/settings/playground/states/apiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { SettingsPath } from '@/types/SettingsPath';
import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { lazy } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledNestedContainer = styled.div`
  height: 100%;
  overflow-y: scroll;
  width: 100%;
`;

const ApiReferenceReact = lazy(() =>
  import('@scalar/api-reference-react').then((module) => ({
    default: module.ApiReferenceReact,
  })),
);

export const SettingsRestPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const { schema = PlaygroundSchemas.CORE } = useParams<{
    schema: PlaygroundSchemas;
  }>();

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.APIs);
  };

  const theme = useTheme();

  const apiKey = useRecoilValue(apiKeyState);

  if (!apiKey) {
    navigateSettings(SettingsPath.APIs);
  }

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
      <StyledNestedContainer>
        <ApiReferenceReact
          configuration={{
            spec: {
              url: `${REACT_APP_SERVER_BASE_URL}/open-api/${schema}?token=${apiKey}`,
            },
            authentication: {
              http: {
                bearer: apiKey ? { token: apiKey } : undefined,
              },
            },
            baseServerURL: REACT_APP_SERVER_BASE_URL + '/' + schema,
            forceDarkModeState: theme.name === 'dark' ? 'dark' : 'light',
            hideClientButton: true,
            hideDarkModeToggle: true,
            pathRouting: {
              basePath: getSettingsPath(SettingsPath.RestPlayground, {
                schema,
              }),
            },
          }}
        />
      </StyledNestedContainer>
    </FullScreenContainer>
  );
};
