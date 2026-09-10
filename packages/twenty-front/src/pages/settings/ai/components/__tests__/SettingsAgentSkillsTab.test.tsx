import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  TWENTY_STANDARD_APPLICATION_NAME,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { FindManySkillsDocument } from '~/generated-metadata/graphql';
import { SettingsAgentSkillsTab } from '~/pages/settings/ai/components/SettingsAgentSkillsTab';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const STANDARD_APPLICATION = {
  id: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  name: TWENTY_STANDARD_APPLICATION_NAME,
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  logoUrl: null,
};

const ACME_APPLICATION = {
  id: '20202020-8b19-4c2a-9e1f-3d4b5c6a7e88',
  name: 'Acme',
  universalIdentifier: '20202020-5f0e-4a2b-9c3d-1e2f3a4b5c6d',
  logoUrl: null,
};

const buildSkill = ({
  id,
  name,
  label,
  applicationId,
}: {
  id: string;
  name: string;
  label: string;
  applicationId: string;
}) => ({
  __typename: 'Skill' as const,
  id,
  name,
  label,
  description: null,
  icon: 'IconBook',
  content: 'Some skill content',
  isCustom: false,
  isActive: true,
  applicationId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const WORD_DOCUMENTS_SKILL = buildSkill({
  id: '20202020-3f1d-4c5b-8a2e-9d7c6b5a4f31',
  name: 'docx',
  label: 'Word Documents',
  applicationId: STANDARD_APPLICATION.id,
});

const RESEARCH_SKILL = buildSkill({
  id: '20202020-7a6b-4d3c-9e2f-1b0a9c8d7e64',
  name: 'research',
  label: 'Research',
  applicationId: ACME_APPLICATION.id,
});

const renderSkillsTab = () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [
      {
        request: { query: FindManySkillsDocument },
        result: {
          data: { skills: [WORD_DOCUMENTS_SKILL, RESEARCH_SKILL] },
        },
      },
    ],
    onInitializeJotaiStore: (store) => {
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        installedApplications: [STANDARD_APPLICATION, ACME_APPLICATION],
      });
    },
  });

  return render(<SettingsAgentSkillsTab />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Wrapper>
        <I18nProvider i18n={i18n}>
          <MemoryRouter>{children}</MemoryRouter>
        </I18nProvider>
      </Wrapper>
    ),
  });
};

describe('SettingsAgentSkillsTab', () => {
  it('shows the application each skill belongs to', async () => {
    renderSkillsTab();

    expect(await screen.findByText('Acme')).toBeInTheDocument();
    expect(
      screen.getByText(TWENTY_STANDARD_APPLICATION_NAME),
    ).toBeInTheDocument();
  });

  it('orders skills by the label it displays, not by their technical name', async () => {
    renderSkillsTab();

    await screen.findByText('Research');

    const [firstRow, secondRow] = screen.getAllByRole('link');

    expect(within(firstRow).getByText('Research')).toBeInTheDocument();
    expect(within(secondRow).getByText('Word Documents')).toBeInTheDocument();
  });

  it('filters skills by application name', async () => {
    renderSkillsTab();

    await screen.findByText('Word Documents');

    await userEvent.type(
      screen.getByPlaceholderText('Search a skill...'),
      'Acme',
    );

    expect(screen.getByText('Research')).toBeInTheDocument();
    expect(screen.queryByText('Word Documents')).not.toBeInTheDocument();
  });
});
