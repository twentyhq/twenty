import { apiKeyState } from '@/settings/playground/states/apiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy } from 'react';
import { useRecoilValue } from 'recoil';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledContainer = styled.div`
  height: 100%;
  overflow-y: scroll;
  width: 100%;
`;

const ApiReferenceReact = lazy(() =>
  import('@scalar/api-reference-react').then((module) => ({
    default: module.ApiReferenceReact,
  })),
);

type RestPlaygroundProps = {
  onError(): void;
  schema: PlaygroundSchemas;
};

export const RestPlayground = ({ onError, schema }: RestPlaygroundProps) => {
  const theme = useTheme();
  const apiKey = useRecoilValue(apiKeyState);

  if (!apiKey) {
    onError();
    return null;
  }

  return (
    <StyledContainer>
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
        }}
      />
    </StyledContainer>
  );
};
