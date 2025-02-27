import { usePlaygroundSession } from '@/settings/playground/hooks/usePlaygroundSession';
import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ThemeContext } from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const RestPlayground = ({ onError }: { onError(): void }) => {
  const [openAPIReference] = useRecoilState(openAPIReferenceState);
  const { theme } = useContext(ThemeContext);

  const { isValid, apiKey } = usePlaygroundSession();

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
        baseServerURL: REACT_APP_SERVER_BASE_URL,
        authentication: {
          apiKey: {
            token: apiKey,
          },
        },
        forceDarkModeState: theme.name as 'dark' | 'light',
      }}
    />
  );
};
