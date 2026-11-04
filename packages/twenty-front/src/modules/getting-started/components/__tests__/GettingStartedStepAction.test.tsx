import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { GettingStartedStepAction } from '@/getting-started/components/GettingStartedStepAction';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type GettingStartedStepDefinition,
  GettingStartedStepActionKey,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { mockGettingStartedStepDefinitions } from '~/testing/mock-data/gettingStartedSteps';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const CurrentPathname = () => (
  <span data-testid="pathname">{useLocation().pathname}</span>
);

const findStepDefinition = (actionKey: GettingStartedStepActionKey) => {
  const stepDefinition = mockGettingStartedStepDefinitions.find(
    (mockStepDefinition) => mockStepDefinition.actionKey === actionKey,
  );

  if (stepDefinition === undefined) {
    throw new Error(`Missing mock step ${actionKey}`);
  }

  return stepDefinition;
};

const renderDoneStepAction = (stepDefinition: GettingStartedStepDefinition) =>
  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter initialEntries={['/getting-started']}>
          <MemoryRouterAppNavigatorProvider>
            <GettingStartedStepAction
              stepDefinition={stepDefinition}
              isCompleted
            />
            <CurrentPathname />
          </MemoryRouterAppNavigatorProvider>
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );

describe('GettingStartedStepAction once done', () => {
  it('sends a done invite step to the members settings instead of the form', async () => {
    renderDoneStepAction(
      findStepDefinition(GettingStartedStepActionKey.INVITE_TEAM),
    );

    expect(
      screen.queryByRole('textbox', { name: 'Teammate email 1' }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Invite more' }));

    expect(screen.getByTestId('pathname')).toHaveTextContent(
      '/settings/members',
    );
  });

  it('offers the import conversation of a done import instead of the upload', () => {
    renderDoneStepAction({
      ...findStepDefinition(GettingStartedStepActionKey.IMPORT_DATA),
      doneChatThreadId: '20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90',
    });

    expect(
      screen.queryByRole('button', { name: 'Upload file' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open the thread' }),
    ).toBeVisible();
  });

  it('shows no action on a done import without a conversation', () => {
    renderDoneStepAction(
      findStepDefinition(GettingStartedStepActionKey.IMPORT_DATA),
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('offers the conversation of a done prompt step instead of the composer', () => {
    renderDoneStepAction({
      ...findStepDefinition(GettingStartedStepActionKey.FOLLOW_UP_DEALS),
      doneChatThreadId: '20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90',
    });

    expect(
      screen.queryByRole('group', { name: 'Follow-up instructions' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open the thread' }),
    ).toBeVisible();
  });

  it('shows no action on a done prompt step without a conversation', () => {
    renderDoneStepAction(
      findStepDefinition(GettingStartedStepActionKey.FOLLOW_UP_DEALS),
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'Follow-up instructions' }),
    ).not.toBeInTheDocument();
  });
});
