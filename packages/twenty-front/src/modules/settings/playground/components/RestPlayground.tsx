import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ThemeContext } from 'twenty-ui';

export const RestPlayground = () => {
  const [openAPIReference] = useRecoilState(openAPIReferenceState);
  const { theme } = useContext(ThemeContext);

  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          content: openAPIReference,
        },
        forceDarkModeState: theme.name as 'dark' | 'light',
      }}
    />
  );
};
