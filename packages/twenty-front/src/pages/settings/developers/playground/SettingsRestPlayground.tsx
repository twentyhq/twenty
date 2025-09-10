import { RestPlayground } from '@/settings/playground/components/RestPlayground';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { Trans } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsRestPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const { schema = PlaygroundSchemas.CORE } = useParams<{
    schema: PlaygroundSchemas;
  }>();

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.ApiWebhooks);
  };

  return (
    <FullScreenContainer
      exitFullScreen={handleExitFullScreen}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>APIs & Webhooks</Trans>,
          href: getSettingsPath(SettingsPath.ApiWebhooks),
        },
        { children: <Trans>REST</Trans> },
      ]}
    >
      <RestPlayground
        schema={schema}
        onError={() => navigateSettings(SettingsPath.ApiWebhooks)}
      />
    </FullScreenContainer>
  );
};
