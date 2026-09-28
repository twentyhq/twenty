import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { OnboardingSkipDialog } from '@/onboarding/components/OnboardingSkipDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const DIALOG_ID = 'onboarding-skip-dialog-test';

const TestSkipDialog = ({
  creditsReward,
  onSkip,
}: {
  creditsReward: number;
  onSkip: () => void;
}) => {
  const { openDialog } = useDialog();

  return (
    <>
      <button type="button" onClick={() => openDialog(DIALOG_ID)}>
        Open
      </button>
      <OnboardingSkipDialog
        dialogId={DIALOG_ID}
        visual={null}
        title="Start with your whole network"
        actions={[{ label: 'Continue with Google', onClick: jest.fn() }]}
        creditsReward={creditsReward}
        onSkip={onSkip}
      />
    </>
  );
};

const renderSkipDialog = (
  creditsReward: number,
  { onSkip = jest.fn() } = {},
) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <TestSkipDialog
          creditsReward={creditsReward}
          onSkip={onSkip}
        />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('OnboardingSkipDialog', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('shows the credits earned on the action button', async () => {
    renderSkipDialog(2.5);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(
      await screen.findByRole('button', {
        name: 'Continue with Google, earn 2.5 free credits',
      }),
    ).toHaveTextContent('+2.5');
  });

  it('skips without showing credits on the skip button', async () => {
    const onSkip = jest.fn();
    renderSkipDialog(2.5, { onSkip });

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Skip anyway' }),
    );

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('hides the credits chip when no credits are at stake', async () => {
    renderSkipDialog(0);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(
      await screen.findByRole('button', { name: /Continue with Google/ }),
    ).toHaveTextContent(/^Continue with Google$/);
  });
});
