import { i18n } from '@lingui/core';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import { type ReactNode, useState } from 'react';
import { type CompanionState } from '../shared/types';
import { Field } from '@ui/input/Field/Field';
import { MainButton } from '@ui/input/MainButton/MainButton';
import { IconArrowUpRight, IconRefresh } from 'twenty-ui/icon';
import { Button } from '@ui/input/Button/Button';
import { type ActionProps, SetupHeading, Empty } from './components';
import { IS_PREVIEW } from './useCompanion';
import { Permissions } from './Permissions';

const Welcome = ({ state, isPending, command }: ActionProps) => {
  const [serverUrl, setServerUrl] = useState(state.serverUrl);
  return (
    <section className="setup-card welcome">
      <SetupHeading
        title={i18n._('Connect your workspace')}
        description={i18n._(
          'Enter your workspace URL to sign in through your browser.',
        )}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void command({ type: 'connect', serverUrl });
        }}
      >
        <Field.Root className="workspace-url-field">
          <Field.Control
            id="workspace-url"
            aria-label={i18n._('Workspace URL')}
            value={serverUrl}
            onChange={(event) => {
              setServerUrl(event.target.value);
              if (state.connection === 'connecting')
                void command({ type: 'cancel-connect' });
            }}
            placeholder="https://your-workspace.twenty.com"
            type="url"
            required
            autoComplete="url"
          />
          <Field.Error />
        </Field.Root>
        <MainButton
          fullWidth
          type="submit"
          disabled={isPending('connect') || (!window.companion && !IS_PREVIEW)}
          title={
            state.connection === 'connecting'
              ? i18n._('Waiting for your browser…')
              : i18n._('Connect to Twenty')
          }
          Icon={IconArrowUpRight}
        />
      </form>
    </section>
  );
};

const getOnboardingStep = (state: CompanionState) => {
  if (state.connection !== 'connected') return 'welcome';
  if (!state.updatedAt) return 'loading';
  return 'permissions';
};

export const Onboarding = ({ state, isPending, command }: ActionProps) => {
  const step = getOnboardingStep(state);
  let content: ReactNode;
  switch (step) {
    case 'welcome':
      content = (
        <Welcome state={state} command={command} isPending={isPending} />
      );
      break;
    case 'loading':
      content = (
        <Empty
          icon={
            <IconRefresh
              size={THEME_COMMON.icon.size.xl}
              stroke={THEME_COMMON.icon.stroke.sm}
            />
          }
          title={
            state.error
              ? i18n._('Your workspace needs attention')
              : i18n._('Connecting your workspace')
          }
          actions={
            <Button
              disabled={isPending('refresh')}
              onClick={() => void command({ type: 'refresh' })}
              variant="secondary"
              size="medium"
              title={i18n._('Try again')}
            />
          }
        >
          <p>
            {i18n._(
              'Your calendar and recording integration need to finish loading before setup can continue.',
            )}
          </p>
        </Empty>
      );
      break;
    case 'permissions':
      content = (
        <Permissions
          state={state}
          command={command}
          isPending={isPending}
          intentToRecord={
            state.permissionSetup?.intent === 'record' &&
            state.settings.setupCompleted
          }
          onContinue={() => {
            void command(
              state.settings.setupCompleted
                ? { type: 'cancel-permission-setup' }
                : { type: 'complete-setup' },
            );
          }}
        />
      );
      break;
  }
  return (
    <div className="setup-frame">
      <span className="setup-logo" role="img" aria-label="Twenty" />
      <div className="setup-container">{content}</div>
    </div>
  );
};
