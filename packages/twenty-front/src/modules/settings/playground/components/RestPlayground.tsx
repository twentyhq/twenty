import { usePlaygroundSession } from '@/settings/playground/hooks/usePlaygroundSession';
import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { PlaygroundTypes } from '@/settings/playground/types/PlaygroundConfig';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ThemeContext } from 'twenty-ui';

export const RestPlayground = ({ onError }: { onError(): void }) => {
  const [openAPIReference] = useRecoilState(openAPIReferenceState);
  const { theme } = useContext(ThemeContext);

  const { isValid, apiKey, baseUrl } = usePlaygroundSession(
    PlaygroundTypes.REST,
  );

  if (!isValid) {
    onError();
    return null;
  }

  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          content: openAPIReference,
        },
        authentication: {
          apiKey: {
            token: apiKey,
          },
        },
        baseServerURL: baseUrl,
        forceDarkModeState: theme.name as 'dark' | 'light',
      }}
    />
  );
};
