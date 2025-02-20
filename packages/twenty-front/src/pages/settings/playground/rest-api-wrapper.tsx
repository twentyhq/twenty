import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { Trans } from '@lingui/react/macro';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';


export const RestApiWrapper = ({ token, baseurl, subdoc, openApiJson }: any) => {
  //prepare the theme for the playground
       let  colorScheme = useColorScheme().colorScheme
        const systemColorScheme = useSystemColorScheme();
        if(colorScheme === 'System') {
          colorScheme = systemColorScheme;
        }

  return (
    <div
      style={{
        height: 'calc(100vh - var(--ifm-navbar-height) - 45px)',
        width: '100%',
        overflow: 'auto',
        textTransform: 'capitalize',
      }}
    >
        <SubMenuTopBarContainer
           links={[
                              { children: <Trans>APIs</Trans>, href: getSettingsPath(SettingsPath.DevelopersApiKeysMain) },
                              { children: <Trans>Rest</Trans> },
                              { children: <Trans>{subdoc}</Trans> },
                            ]}
        >
        <ApiReferenceReact
          configuration={{
            spec:{
              content: openApiJson
            },
            baseServerURL: baseurl,
          forceDarkModeState: colorScheme.toLowerCase() as any,
          hideDarkModeToggle: true,
          authentication: {
            apiKey: {
              token
            }
          }
          }
          }
    />
        </SubMenuTopBarContainer>
    </div>
  );
};
