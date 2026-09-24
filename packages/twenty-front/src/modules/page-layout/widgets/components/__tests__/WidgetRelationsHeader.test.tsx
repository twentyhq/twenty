import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { FileUploadProvider } from '@/file-upload/components/FileUploadProvider';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { PageLayoutType } from '~/generated-metadata/graphql';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';

const renderHeader = (targetObjectNameSingular: string) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
        __typename: 'Note',
        id: RECORD_ID,
        noteTargets: [],
      });
    },
  });

  return render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <FileUploadProvider>
          <LayoutRenderingProvider
            value={{
              targetRecordIdentifier: {
                id: RECORD_ID,
                targetObjectNameSingular,
              },
              layoutType: PageLayoutType.RECORD_PAGE,
            }}
          >
            <div data-testid="header-slot">
              <WidgetRelationsHeader />
            </div>
          </LayoutRenderingProvider>
        </FileUploadProvider>
      </MemoryRouter>
    </I18nProvider>,
    { wrapper: Wrapper },
  );
};

describe('WidgetRelationsHeader', () => {
  it('renders the relations cell when the object has a morph junction', async () => {
    renderHeader('note');

    expect((await screen.findAllByText('Relations')).length).toBeGreaterThan(0);
  });

  it('renders nothing when the object has no morph junction', () => {
    renderHeader('workspaceMember');

    expect(screen.getByTestId('header-slot')).toBeEmptyDOMElement();
  });
});
