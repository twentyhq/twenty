import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsApplicationSuggestedViewFieldsBanner } from '@/settings/applications/components/SettingsApplicationSuggestedViewFieldsBanner';

const mockDismiss = jest.fn();
const mockOpenAskAiPageWithPreprompt = jest.fn();
const mockUseHasPermissionFlag = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(() => ({
    data: {
      applicationSuggestedViewFields: [
        {
          universalIdentifier: 'suggestion-job-role',
          viewId: 'all-people-view-id',
          objectMetadataId: 'person-id',
          fieldMetadataId: 'job-role-field-id',
          position: 1,
        },
        {
          universalIdentifier: 'suggestion-seniority',
          viewId: 'all-people-view-id',
          objectMetadataId: 'person-id',
          fieldMetadataId: 'seniority-field-id',
          position: 0,
        },
      ],
    },
  })),
  useMutation: jest.fn(() => [mockDismiss]),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      {
        id: 'person-id',
        labelSingular: 'Person',
        labelPlural: 'People',
        fields: [
          { id: 'seniority-field-id', label: 'Seniority' },
          { id: 'job-role-field-id', label: 'Job Role' },
        ],
      },
    ],
  }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () =>
    new Map([
      ['all-people-view-id', { id: 'all-people-view-id', name: 'All People' }],
    ]),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => mockUseHasPermissionFlag(),
}));

jest.mock('@/ai-chat/composer/hooks/useCanSendAiChatMessage', () => ({
  useCanSendAiChatMessage: () => true,
}));

jest.mock('@/ai-chat/hooks/useOpenAskAiPageWithPreprompt', () => ({
  useOpenAskAiPageWithPreprompt: () => ({
    openAskAiPageWithPreprompt: mockOpenAskAiPageWithPreprompt,
  }),
}));

jest.mock(
  '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument',
  () => ({
    serializePlainTextAsAdvancedTextEditorDocument: (text: string) => text,
  }),
);

const renderBanner = () =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationSuggestedViewFieldsBanner
        applicationId="application-id"
        applicationName="People Data Labs"
      />
    </I18nProvider>,
  );

describe('SettingsApplicationSuggestedViewFieldsBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHasPermissionFlag.mockReturnValue(true);
  });

  it('sends a prompt listing the suggested fields per view when the user reviews them', async () => {
    const user = userEvent.setup();

    renderBanner();

    expect(
      screen.getByText(
        'People Data Labs suggests 2 fields that are not in your views yet.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Review' }));

    expect(mockOpenAskAiPageWithPreprompt).toHaveBeenCalledWith({
      serializedDocument: expect.stringContaining(
        '- People, view "All People" (view ID all-people-view-id): Seniority (field ID seniority-field-id), Job Role (field ID job-role-field-id)',
      ),
      mode: 'SEND',
    });
    expect(
      screen.queryByRole('button', { name: 'Review' }),
    ).not.toBeInTheDocument();
  });

  it('dismisses every suggestion shown', async () => {
    const user = userEvent.setup();

    renderBanner();

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(mockDismiss).toHaveBeenCalledWith({
      variables: {
        input: {
          applicationId: 'application-id',
          universalIdentifiers: ['suggestion-job-role', 'suggestion-seniority'],
        },
      },
    });
    expect(
      screen.queryByText(
        'People Data Labs suggests 2 fields that are not in your views yet.',
      ),
    ).not.toBeInTheDocument();
  });

  it('lists the fields to add by hand when the user cannot use AI', () => {
    mockUseHasPermissionFlag.mockReturnValue(false);

    renderBanner();

    expect(
      screen.getByText('All People: Seniority, Job Role'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Add them from the Options menu of each view.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Review' }),
    ).not.toBeInTheDocument();
  });
});
