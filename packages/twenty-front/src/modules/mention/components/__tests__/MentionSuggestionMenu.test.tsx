import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { MentionSuggestionMenu } from '@/mention/components/MentionSuggestionMenu';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const editor = new Editor({ extensions: [Document, Paragraph, Text] });

jest
  .spyOn(editor.view, 'coordsAtPos')
  .mockReturnValue({ left: 0, right: 0, top: 0, bottom: 16 });

const buildResult = (
  label: string,
  objectNameSingular: string,
  objectLabelPlural: string,
): MentionSearchResult => ({
  recordId: `${label}-id`,
  objectNameSingular,
  objectLabelSingular: objectNameSingular,
  objectLabelPlural,
  label,
  imageUrl: '',
});

describe('MentionSuggestionMenu', () => {
  it('lists teammates first, then each object in its own section', () => {
    const Wrapper = getJestMetadataAndApolloMocksWrapper({});

    render(
      <Wrapper>
        <I18nProvider i18n={i18n}>
          <MentionSuggestionMenu
            items={[
              buildResult(
                'Grace Hopper',
                StandardObjectNameSingular.WorkspaceMember,
                'Teammates',
              ),
              buildResult(
                'Acme',
                StandardObjectNameSingular.Company,
                'Companies',
              ),
              buildResult(
                'Ada Lovelace',
                StandardObjectNameSingular.Person,
                'People',
              ),
              buildResult(
                'Globex',
                StandardObjectNameSingular.Company,
                'Companies',
              ),
            ]}
            onSelect={jest.fn()}
            editor={editor}
            range={{ from: 0, to: 1 }}
          />
        </I18nProvider>
      </Wrapper>,
    );

    expect(
      screen
        .getAllByText(
          /^(Teammates|Companies|People|Grace Hopper|Acme|Ada Lovelace|Globex)$/,
        )
        .map((element) => element.textContent),
    ).toEqual([
      'Teammates',
      'Grace Hopper',
      'Companies',
      'Acme',
      'Globex',
      'People',
      'Ada Lovelace',
    ]);
  });

  it('keeps objects sharing a plural label in separate sections', () => {
    const Wrapper = getJestMetadataAndApolloMocksWrapper({});

    render(
      <Wrapper>
        <I18nProvider i18n={i18n}>
          <MentionSuggestionMenu
            items={[
              buildResult(
                'Acme',
                StandardObjectNameSingular.Company,
                'Accounts',
              ),
              buildResult('Globex', 'account', 'Accounts'),
            ]}
            onSelect={jest.fn()}
            editor={editor}
            range={{ from: 0, to: 1 }}
          />
        </I18nProvider>
      </Wrapper>,
    );

    expect(screen.getAllByText('Accounts')).toHaveLength(2);
  });

  it('lists the assistant with teammates under one section', () => {
    const Wrapper = getJestMetadataAndApolloMocksWrapper({});

    render(
      <Wrapper>
        <I18nProvider i18n={i18n}>
          <MentionSuggestionMenu
            items={[
              buildResult(
                'Grace Hopper',
                StandardObjectNameSingular.WorkspaceMember,
                'Teammates',
              ),
              buildResult(
                'Ada',
                AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
                'Teammates',
              ),
            ]}
            onSelect={jest.fn()}
            editor={editor}
            range={{ from: 0, to: 1 }}
          />
        </I18nProvider>
      </Wrapper>,
    );

    expect(
      screen
        .getAllByText(/^(Teammates|Grace Hopper|Ada)$/)
        .map((element) => element.textContent),
    ).toEqual(['Teammates', 'Ada', 'Grace Hopper']);
  });
});
