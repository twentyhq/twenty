import { PlaygroundPage } from '@/settings/playground/components/PlaygroundPage';
import { openAPIReferenceState } from '@/settings/playground/states/openAPIReference';
import { SettingsPath } from '@/types/SettingsPath';
import { Trans } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ThemeContext } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const RestPlayground = () => {
  const [openAPIReference] = useRecoilState(openAPIReferenceState);
  const { theme } = useContext(ThemeContext);

  return (
    <PlaygroundPage
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
      <ApiReferenceReact
        configuration={{
          spec: {
            content: openAPIReference,
          },
          forceDarkModeState: theme.name as 'dark' | 'light',
        }}
      />
    </PlaygroundPage>
  );
};
