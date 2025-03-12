import { RestPlayground } from '@/settings/playground/components/RestPlayground';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { SettingsPath } from '@/types/SettingsPath';
import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import { Trans } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsRestPlayground = () => {
  const navigateSettings = useNavigateSettings();
  const { schema = PlaygroundSchemas.CORE } = useParams<{
    schema: PlaygroundSchemas;
  }>();

  const handleExitFullScreen = () => {
    navigateSettings(SettingsPath.APIs);
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
          children: <Trans>APIs</Trans>,
          href: getSettingsPath(SettingsPath.APIs),
        },
        { children: <Trans>REST</Trans> },
      ]}
    >
      <RestPlayground
        schema={schema}
        onError={() => navigateSettings(SettingsPath.APIs)}
      />
    </FullScreenContainer>
  );
};
