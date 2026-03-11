import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { type PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, lazy, Suspense } from 'react';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  height: 100%;
  overflow-y: scroll;
  width: 100%;

  .scalar-api-reference {
    --scalar-background-1: ${themeCssVariables.background.primary};
    --scalar-background-2: ${themeCssVariables.background.secondary};
    --scalar-background-3: ${themeCssVariables.background.tertiary};
    --scalar-background-accent: ${themeCssVariables.background.transparent
      .lighter};
    --scalar-border-color: ${themeCssVariables.border.color.medium};
    --scalar-color-1: ${themeCssVariables.font.color.primary};
    --scalar-color-2: ${themeCssVariables.font.color.secondary};
    --scalar-color-3: ${themeCssVariables.font.color.tertiary};
  }

  .scalar-app .text-pretty {
    overflow-wrap: break-word;
    white-space: normal;
    word-break: normal;
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
  const { theme, colorScheme } = useContext(ThemeContext);
  const playgroundApiKey = useAtomStateValue(playgroundApiKeyState);

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
            forceDarkModeState: colorScheme === 'dark' ? 'dark' : 'light',
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
