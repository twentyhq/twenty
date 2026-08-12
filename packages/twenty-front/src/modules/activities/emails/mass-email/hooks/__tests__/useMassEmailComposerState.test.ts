import { act, renderHook, waitFor } from '@testing-library/react';

import { useMassEmailCampaignDraft } from '@/activities/emails/mass-email/hooks/useMassEmailCampaignDraft';
import { useMassEmailComposerState } from '@/activities/emails/mass-email/hooks/useMassEmailComposerState';
import { useMassEmailRecipients } from '@/activities/emails/mass-email/hooks/useMassEmailRecipients';
import { useSendMassEmail } from '@/activities/emails/mass-email/hooks/useSendMassEmail';

jest.mock('@/activities/emails/mass-email/hooks/useMassEmailCampaignDraft');
jest.mock('@/activities/emails/mass-email/hooks/useMassEmailRecipients');
jest.mock('@/activities/emails/mass-email/hooks/useSendMassEmail');

const recipients = [
  {
    personId: 'person-1',
    email: 'ada@example.com',
    displayName: 'Ada Lovelace',
    avatarUrl: null,
    placeholderValues: {
      first_name: 'Ada',
      last_name: 'Lovelace',
      full_name: 'Ada Lovelace',
      email: 'ada@example.com',
      job_title: '',
      city: '',
      company: '',
    },
  },
];
const saveDraftMock = jest.fn(() =>
  Promise.resolve({ campaignId: 'campaign-1', updatedAt: '2026-07-31' }),
);
const sendMassEmailMock = jest.fn(() =>
  Promise.resolve({ sentCount: 1, failedRecipients: [] }),
);

describe('useMassEmailComposerState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useMassEmailRecipients).mockReturnValue({
      recipients,
      skippedWithoutEmail: [],
      skippedWithoutEmailCount: 0,
      loading: false,
    });
    jest.mocked(useMassEmailCampaignDraft).mockReturnValue({
      saveDraft: saveDraftMock,
      isSaving: false,
    });
    jest.mocked(useSendMassEmail).mockReturnValue({
      sendMassEmail: sendMassEmailMock,
      sending: false,
      sentCount: 0,
    });
  });

  it('creates a campaign draft for the selected people', async () => {
    const { result } = renderHook(() =>
      useMassEmailComposerState({
        connectedAccountId: 'account-1',
        personIds: ['person-1'],
      }),
    );

    await waitFor(() => {
      expect(result.current.draftCampaignId).toBe('campaign-1');
    });

    expect(saveDraftMock).toHaveBeenCalledWith({
      campaignId: undefined,
      connectedAccountId: 'account-1',
      personIds: ['person-1'],
      subject: '',
      body: '',
    });
  });

  it('sends the same campaign record with personalized recipients', async () => {
    const onSent = jest.fn();
    const { result } = renderHook(() =>
      useMassEmailComposerState({
        connectedAccountId: 'account-1',
        personIds: ['person-1'],
        onSent,
      }),
    );

    await waitFor(() => {
      expect(result.current.draftCampaignId).toBe('campaign-1');
    });

    act(() => {
      result.current.setSubjectTemplate('Hello {first_name}');
      result.current.setBodyTemplate('<p>Hi {first_name}</p>');
    });

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMassEmailMock).toHaveBeenCalledWith({
      campaignId: 'campaign-1',
      connectedAccountId: 'account-1',
      emails: [
        {
          personId: 'person-1',
          to: 'ada@example.com',
          subject: 'Hello Ada',
          body: '<p>Hi Ada</p>',
        },
      ],
    });
    expect(onSent).toHaveBeenCalledTimes(1);
  });

  it('resumes an existing draft without creating another campaign', async () => {
    const { result } = renderHook(() =>
      useMassEmailComposerState({
        connectedAccountId: 'account-1',
        personIds: ['person-1'],
        initialDraft: {
          campaignId: 'campaign-1',
          subject: 'Existing subject',
          body: '<p>Existing body</p>',
        },
      }),
    );

    expect(result.current.draftCampaignId).toBe('campaign-1');
    expect(result.current.subjectTemplate).toBe('Existing subject');
    expect(result.current.bodyTemplate).toBe('<p>Existing body</p>');
    expect(saveDraftMock).not.toHaveBeenCalled();
  });
});
