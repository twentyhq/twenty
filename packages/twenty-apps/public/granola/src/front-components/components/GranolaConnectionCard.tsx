import { t } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/data-display';
import { Info } from 'twenty-ui/feedback';
import { IconKey } from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

import { SettingsOptionCardContent } from 'src/front-components/components/SettingsOptionCardContent';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { type GranolaConnectionState } from 'src/front-components/types/granola-connection-state.type';

const STATUS_COLOR_BY_CONNECTION_STATE: Record<
  GranolaConnectionState,
  ThemeColor
> = {
  CONNECTING: 'turquoise',
  CONNECTED: 'green',
  INVALID_KEY: 'red',
  UNREACHABLE: 'orange',
  PAUSED: 'orange',
  SETUP_INCOMPLETE: 'orange',
};

const getStatusText = (connectionState: GranolaConnectionState) =>
  ({
    CONNECTING: t('Connecting'),
    CONNECTED: t('Connected'),
    INVALID_KEY: t('Invalid key'),
    UNREACHABLE: t('Unreachable'),
    PAUSED: t('Paused'),
    SETUP_INCOMPLETE: t('Setup incomplete'),
  })[connectionState];

const getDescription = ({
  connectionState,
  isWorkspaceKey,
}: {
  connectionState: GranolaConnectionState;
  isWorkspaceKey: boolean;
}) => {
  if (connectionState === 'CONNECTING') {
    return t('Setting up live sync. This may take a few seconds.');
  }

  if (connectionState !== 'CONNECTED') {
    return t('Live sync is not running.');
  }

  return isWorkspaceKey
    ? t("Workspace key. Your team's shared notes sync live.")
    : t("Personal key. Only the key owner's notes sync live.");
};

type GranolaConnectionCardProps = {
  connectionState: GranolaConnectionState;
  isWorkspaceKey: boolean;
  onRetry: () => void;
  onReplaceKey: () => void;
};

export const GranolaConnectionCard = ({
  connectionState,
  isWorkspaceKey,
  onRetry,
  onReplaceKey,
}: GranolaConnectionCardProps) => (
  <>
    <StyledSettingsCard>
      <SettingsOptionCardContent
        Icon={IconKey}
        title={t('API key')}
        description={getDescription({ connectionState, isWorkspaceKey })}
      >
        <Status
          color={STATUS_COLOR_BY_CONNECTION_STATE[connectionState]}
          text={getStatusText(connectionState)}
          isLoaderVisible={connectionState === 'CONNECTING'}
          weight="medium"
        />
      </SettingsOptionCardContent>
    </StyledSettingsCard>
    {connectionState === 'INVALID_KEY' && (
      <Info
        accent="danger"
        text={t('Granola rejected this API key.')}
        buttonTitle={t('Use another key')}
        onClick={onReplaceKey}
      />
    )}
    {connectionState === 'UNREACHABLE' && (
      <Info
        accent="danger"
        text={t('Could not reach Granola. Try again in a moment.')}
        buttonTitle={t('Retry')}
        onClick={onRetry}
      />
    )}
    {connectionState === 'SETUP_INCOMPLETE' && (
      <Info
        accent="danger"
        text={t('Could not set up live sync with Granola.')}
        buttonTitle={t('Retry')}
        onClick={onRetry}
      />
    )}
    {connectionState === 'PAUSED' && (
      <Info
        accent="blue"
        text={t(
          'Live sync is paused in Granola, so new notes are not arriving.',
        )}
        buttonTitle={t('Resume')}
        onClick={onRetry}
      />
    )}
  </>
);
