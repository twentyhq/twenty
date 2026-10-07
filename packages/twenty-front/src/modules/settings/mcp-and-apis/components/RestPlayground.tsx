import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { RestPlaygroundSchemaFetchEffect } from '@/settings/mcp-and-apis/components/RestPlaygroundSchemaFetchEffect';
import {
  isPlaygroundApiKeyFresh,
  playgroundApiKeyState,
} from '@/settings/mcp-and-apis/states/playgroundApiKeyState';
import { type PlaygroundSchemas } from '@/settings/mcp-and-apis/types/PlaygroundSchemas';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useState, lazy, Suspense } from 'react';
import { styled } from '@linaria/react';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useThemeColorScheme, themeCssVariables } from 'twenty-ui/theme';

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
    import('@scalar/api-reference-react/style.css');
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
  const colorScheme = useThemeColorScheme();
  const playgroundApiKey = useAtomStateValue(playgroundApiKeyState);
  const [specContent, setSpecContent] = useState<object | null>(null);

  if (!isPlaygroundApiKeyFresh(playgroundApiKey)) {
    onError();
    return null;
  }

  const fallback = <SkeletonLine width="100%" height="100%" />;

  return (
    <StyledContainer>
      <RestPlaygroundSchemaFetchEffect
        schema={schema}
        apiKey={playgroundApiKey.token}
        onSchemaLoaded={setSpecContent}
        onError={onError}
      />
      {specContent === null ? (
        fallback
      ) : (
        <Suspense fallback={fallback}>
          <ApiReferenceReact
            configuration={{
              content: specContent,
              authentication: {
                preferredSecurityScheme: 'bearerAuth',
                securitySchemes: {
                  bearerAuth: { token: playgroundApiKey.token },
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
      )}
    </StyledContainer>
  );
};
