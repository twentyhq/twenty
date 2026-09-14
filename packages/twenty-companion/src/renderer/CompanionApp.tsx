import { i18n } from '@lingui/core';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import {
  IconRefresh,
  IconCircleDot,
  IconHome,
  IconSettings,
} from 'twenty-ui/icon';
import { NavigationModeSwitcher } from './components/NavigationModeSwitcher/NavigationModeSwitcher';
import { useCompanion, IS_PREVIEW } from './useCompanion';
import { Button } from '@ui/input/Button/Button';
import { Empty, Notice, RecordingControls } from './components';
import { Onboarding } from './Onboarding';
import { Home } from './Home';
import { Settings } from './Settings';
import { HalftoneBackground } from './HalftoneBackground';
import { CompanionTheme } from './CompanionTheme';

export const CompanionApp = () => {
  const { state, isPending, loaded, command, page, navigate } = useCompanion();
  const connected = state.connection === 'connected';
  const setup =
    connected && (!state.settings.setupCompleted || !!state.permissionSetup);
  const onboarding = !connected || setup;
  return (
    <CompanionTheme appearance={state.settings.appearance}>
      <main className={'app-shell ' + (onboarding ? 'onboarding' : '')}>
        <div className="main-area">
          {onboarding && <HalftoneBackground />}
          <header
            className={
              'titlebar ' +
              (onboarding ? 'setup-titlebar ' : '') +
              (window.companion && navigator.platform.startsWith('Mac')
                ? 'mac-titlebar'
                : '')
            }
          >
            {!onboarding && (
              <div className="header-navigation">
                <NavigationModeSwitcher
                  ariaLabel={i18n._('Navigation modes')}
                  size="medium"
                  activeItemName={page === 'settings' ? 'settings' : 'home'}
                  items={[
                    {
                      name: 'home',
                      label: i18n._('Home'),
                      Icon: IconHome,
                      onClick: () => navigate('agenda'),
                    },
                    {
                      name: 'settings',
                      label: i18n._('Settings'),
                      Icon: IconSettings,
                      onClick: () => navigate('settings'),
                    },
                  ]}
                />
              </div>
            )}
            {!onboarding && (
              <div className="button-group">
                <Button
                  variant="primary"
                  accent="blue"
                  size="medium"
                  disabled={
                    isPending('record') ||
                    !!state.activeRecording ||
                    !state.updatedAt
                  }
                  onClick={() => void command({ type: 'record' })}
                  Icon={IconCircleDot}
                  title={i18n._('New recording')}
                />
              </div>
            )}
          </header>
          {IS_PREVIEW && (
            <div className="preview-label">
              {i18n._(
                'Interactive preview · sample data · no audio is captured',
              )}
            </div>
          )}
          <Notice state={state} command={command} isPending={isPending} />
          <div className="scroll-area">
            {!loaded ? (
              <Empty
                icon={
                  <IconRefresh
                    size={THEME_COMMON.icon.size.xl}
                    stroke={THEME_COMMON.icon.stroke.sm}
                  />
                }
                title={i18n._('Opening your workspace')}
              >
                <p>{i18n._('Loading your calendar and conversations…')}</p>
              </Empty>
            ) : onboarding ? (
              <Onboarding
                state={state}
                isPending={isPending}
                command={command}
              />
            ) : (
              <div className="page-content">
                <RecordingControls
                  state={state}
                  isPending={isPending}
                  command={command}
                />
                {page === 'settings' ? (
                  <Settings
                    state={state}
                    isPending={isPending}
                    command={command}
                  />
                ) : (
                  <Home state={state} isPending={isPending} command={command} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </CompanionTheme>
  );
};
