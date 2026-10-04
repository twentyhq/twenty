import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type Editor } from '@tiptap/core';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { MentionSuggestionMenu } from '@/mention/components/MentionSuggestionMenu';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const editor = {
  view: { coordsAtPos: () => ({ left: 0, top: 0, bottom: 16 }) },
} as unknown as Editor;

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
                CoreObjectNameSingular.WorkspaceMember,
                'Teammates',
              ),
              buildResult('Acme', CoreObjectNameSingular.Company, 'Companies'),
              buildResult(
                'Ada Lovelace',
                CoreObjectNameSingular.Person,
                'People',
              ),
              buildResult(
                'Globex',
                CoreObjectNameSingular.Company,
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
});
