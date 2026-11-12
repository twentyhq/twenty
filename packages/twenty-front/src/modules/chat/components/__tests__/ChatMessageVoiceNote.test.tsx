import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatMessageVoiceNote } from '@/chat/components/ChatMessageVoiceNote';

const renderVoiceNote = (onError = jest.fn()) =>
  render(
    <I18nProvider i18n={i18n}>
      <ChatMessageVoiceNote
        src="https://files.test/voice-note.m4a"
        label="voice-note.m4a"
        onError={onError}
      />
    </I18nProvider>,
  );

describe('ChatMessageVoiceNote', () => {
  it('shows the pause action while the voice note plays and resets when its source reloads', async () => {
    const user = userEvent.setup();
    const play = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    renderVoiceNote();

    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.play(screen.getByLabelText('voice-note.m4a'));

    expect(screen.getByRole('button', { name: 'Pause' })).toBeVisible();

    fireEvent.emptied(screen.getByLabelText('voice-note.m4a'));

    expect(screen.getByRole('button', { name: 'Play' })).toBeVisible();
  });

  it('reports a playback the browser refuses', async () => {
    const user = userEvent.setup();
    const onError = jest.fn();

    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValue(new DOMException('Refused', 'NotAllowedError'));

    renderVoiceNote(onError);

    await user.click(screen.getByRole('button', { name: 'Play' }));

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
  });
});
