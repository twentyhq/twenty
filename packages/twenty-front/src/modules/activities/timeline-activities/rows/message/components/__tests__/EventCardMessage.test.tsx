import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { EventCardMessage } from '@/activities/timeline-activities/rows/message/components/EventCardMessage';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: jest.fn(),
}));
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel: jest.fn() }),
}));

const renderCard = () =>
  render(
    <I18nProvider i18n={i18n}>
      <EventCardMessage messageId="message-id" authorFullName="Ada Lovelace" />
    </I18nProvider>,
  );

describe('EventCardMessage', () => {
  it('does not render fields masked by metadata visibility', () => {
    jest.mocked(useFindOneRecord).mockReturnValue({
      record: {
        id: 'message-id',
        subject: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        messageThreadId: 'thread-id',
        messageParticipants: [{ handle: 'private@example.com' }],
      },
      loading: false,
      error: undefined,
    } as never);

    renderCard();

    expect(screen.getByText('Subject not shared')).toBeInTheDocument();
    expect(screen.getByText('Not shared by Ada Lovelace')).toBeInTheDocument();
    expect(
      screen.queryByText(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('private@example.com')).not.toBeInTheDocument();
  });

  it('renders the not-shared state when record access is forbidden', () => {
    jest.mocked(useFindOneRecord).mockReturnValue({
      record: undefined,
      loading: false,
      error: new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Forbidden',
            extensions: { code: 'FORBIDDEN' },
          },
        ],
      }),
    } as never);

    renderCard();

    expect(screen.getByText('Subject not shared')).toBeInTheDocument();
    expect(screen.getByText('Not shared by Ada Lovelace')).toBeInTheDocument();
  });

  it('fails closed when a hidden record is omitted without an error', () => {
    jest.mocked(useFindOneRecord).mockReturnValue({
      record: undefined,
      loading: false,
      error: undefined,
    } as never);

    renderCard();

    expect(screen.getByText('Subject not shared')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
