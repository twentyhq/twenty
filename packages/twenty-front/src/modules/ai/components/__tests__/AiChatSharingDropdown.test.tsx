import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

import { AiChatSharingDropdown } from '@/ai/components/AiChatSharingDropdown';

const useSharing = jest.fn();

jest.mock('@/ai/hooks/useChatThreadSharing', () => ({
  useChatThreadSharing: () => useSharing(),
}));
jest.mock('@/ui/layout/dropdown/components/Dropdown', () => ({
  Dropdown: ({
    clickableComponent,
    dropdownComponents,
  }: {
    clickableComponent: ReactNode;
    dropdownComponents: ReactNode;
  }) => (
    <>
      {clickableComponent}
      {dropdownComponents}
    </>
  ),
}));
jest.mock('@/ai/components/AiChatSharingDropdownContent', () => ({
  AiChatSharingDropdownContent: () => <div>Share conversation</div>,
}));

describe('Conversation sharing availability', () => {
  it.each([
    { sharing: { isEnabled: false } },
    { sharing: undefined },
    { sharing: undefined, loading: true },
    { sharing: undefined, error: new Error('Unavailable') },
  ])('hides sharing when its availability is not confirmed: %j', (state) => {
    useSharing.mockReturnValue(state);
    render(
      <I18nProvider i18n={i18n}>
        <AiChatSharingDropdown threadId="thread" />
      </I18nProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Share' })).toBeNull();
    expect(screen.queryByText('Share conversation')).toBeNull();
  });

  it.each([false, true])(
    'keeps confirmed sharing available while refreshing=%s without a frontend rollout flag',
    (loading) => {
      useSharing.mockReturnValue({ sharing: { isEnabled: true }, loading });
      render(
        <I18nProvider i18n={i18n}>
          <AiChatSharingDropdown threadId="thread" />
        </I18nProvider>,
      );
      expect(screen.getByRole('button', { name: 'Share' })).toBeVisible();
      expect(screen.getByText('Share conversation')).toBeVisible();
    },
  );

  it('keeps retry reachable after a refresh fails for enabled sharing', () => {
    useSharing.mockReturnValue({
      sharing: { isEnabled: true },
      error: new Error('Unavailable'),
    });
    render(
      <I18nProvider i18n={i18n}>
        <AiChatSharingDropdown threadId="thread" />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Share' })).toBeVisible();
    expect(screen.getByText('Share conversation')).toBeVisible();
  });

  it('removes the control and panel when sharing becomes unavailable', () => {
    useSharing.mockReturnValue({ sharing: { isEnabled: true } });
    const content = (
      <I18nProvider i18n={i18n}>
        <AiChatSharingDropdown threadId="thread" />
      </I18nProvider>
    );
    const { rerender } = render(content);
    expect(screen.getByText('Share conversation')).toBeVisible();
    useSharing.mockReturnValue({ sharing: { isEnabled: false } });
    rerender(
      <I18nProvider i18n={i18n}>
        <AiChatSharingDropdown threadId="thread" />
      </I18nProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Share' })).toBeNull();
    expect(screen.queryByText('Share conversation')).toBeNull();
  });
});
