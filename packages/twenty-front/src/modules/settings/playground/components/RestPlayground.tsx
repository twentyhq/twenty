import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy, Suspense } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useRecoilValue } from 'recoil';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 100%;
  overflow-y: scroll;
  width: 100%;

  .scalar-api-reference {
    --scalar-background-1: ${({ theme }) => theme.background.primary};
    --scalar-background-2: ${({ theme }) => theme.background.secondary};
    --scalar-background-3: ${({ theme }) => theme.background.tertiary};
    --scalar-background-accent: ${({ theme }) =>
      theme.background.transparent.lighter};
    --scalar-border-color: ${({ theme }) => theme.border.color.medium};
    --scalar-color-1: ${({ theme }) => theme.font.color.primary};
    --scalar-color-2: ${({ theme }) => theme.font.color.secondary};
    --scalar-color-3: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const ApiReferenceReact = lazy(() =>
  import('@scalar/api-reference-react').then((module) => {
    import('@scalar/api-reference-react/style.css?inline');
    return {
      default: module.ApiReferenceReact,
    };
  }),
);

type RestPlaygroundProps = {
  onError(): void;
  schema: PlaygroundSchemas;
};

export const RestPlayground = ({ onError, schema }: RestPlaygroundProps) => {
  const theme = useTheme();
  const playgroundApiKey = useRecoilValue(playgroundApiKeyState);

  if (!playgroundApiKey) {
    onError();
    return null;
  }

  return (
    <StyledContainer>
      <Suspense
        fallback={
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <Skeleton width="100%" height="100%" />
          </SkeletonTheme>
        }
      >
        <ApiReferenceReact
          configuration={{
            spec: {
              url: `${REACT_APP_SERVER_BASE_URL}/rest/open-api/${schema}?token=${playgroundApiKey}`,
            },
            authentication: {
              http: {
                bearer: playgroundApiKey
                  ? { token: playgroundApiKey }
                  : undefined,
              },
            },
            baseServerURL: REACT_APP_SERVER_BASE_URL + '/' + schema,
            forceDarkModeState: theme.name === 'dark' ? 'dark' : 'light',
            hideClientButton: true,
            hideDarkModeToggle: true,
            hideModels: schema === 'metadata',
            pathRouting: {
              basePath: getSettingsPath(SettingsPath.RestPlayground, {
                schema,
              }),
            },
          }}
        />
      </Suspense>
    </StyledContainer>
  );
};
