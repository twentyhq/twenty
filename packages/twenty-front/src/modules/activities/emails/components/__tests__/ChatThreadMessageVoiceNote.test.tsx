import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatThreadMessageVoiceNote } from '@/activities/emails/components/ChatThreadMessageVoiceNote';

describe('ChatThreadMessageVoiceNote', () => {
  it('plays and pauses the voice note', async () => {
    const user = userEvent.setup();
    const play = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadMessageVoiceNote
          src="https://files.test/voice-note.m4a"
          label="voice-note.m4a"
          onError={jest.fn()}
        />
      </I18nProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.play(screen.getByLabelText('voice-note.m4a'));

    expect(screen.getByRole('button', { name: 'Pause' })).toBeVisible();
  });
});
