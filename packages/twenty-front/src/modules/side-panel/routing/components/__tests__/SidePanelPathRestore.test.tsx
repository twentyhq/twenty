import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, waitFor } from '@testing-library/react';
import { type getDefaultStore } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { SidePanelPathUrlSyncEffect } from '@/side-panel/routing/components/SidePanelPathUrlSyncEffect';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const OBJECT_PATH = `/settings/objects/${companyObjectMetadataItem.namePlural}`;
const FIELD_PATH = `${OBJECT_PATH}/${nameFieldMetadataItem.name}`;

// Restoring opens the panel, which is what the sync effect writes the param
// from. Writing before that lands would clear the param being restored, so
// this records every value the url took rather than only where it settled.
const useRecordedSearchValues = (recorded: string[]) => {
  const { search } = useLocation();

  if (recorded.at(-1) !== search) {
    recorded.push(search);
  }
};

const SearchRecorderEffect = ({ recorded }: { recorded: string[] }) => {
  useRecordedSearchValues(recorded);

  return null;
};

describe('restoring the panel from the url', () => {
  it('should open the panel without ever dropping the param it read', async () => {
    const recordedSearchValues: string[] = [];
    let capturedStore: ReturnType<typeof getDefaultStore> | undefined;

    const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      onInitializeJotaiStore: (store) => {
        capturedStore = store;
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BaseWrapper>
        <I18nProvider i18n={i18n}>
          <MemoryRouter
            initialEntries={[`/chat?panel=${encodeURIComponent(OBJECT_PATH)}`]}
          >
            {children}
            <SearchRecorderEffect recorded={recordedSearchValues} />
          </MemoryRouter>
        </I18nProvider>
      </BaseWrapper>
    );

    render(<SidePanelPathUrlSyncEffect />, { wrapper });

    await waitFor(() => {
      expect(capturedStore?.get(sidePanelPageState.atom)).toBe(
        SidePanelPages.RoutedPage,
      );
    });

    expect(recordedSearchValues).not.toContain('');
  });

  it('should follow the panel when it navigates to another hosted route', async () => {
    let openNext: ((path: string) => void) | undefined;

    const OpenerEffect = () => {
      const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

      openNext = (path: string) => openRoutedPageInSidePanel({ path });

      return null;
    };

    const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
    });

    const recordedSearchValues: string[] = [];

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BaseWrapper>
        <I18nProvider i18n={i18n}>
          <MemoryRouter
            initialEntries={[`/chat?panel=${encodeURIComponent(OBJECT_PATH)}`]}
          >
            {children}
            <OpenerEffect />
            <SearchRecorderEffect recorded={recordedSearchValues} />
          </MemoryRouter>
        </I18nProvider>
      </BaseWrapper>
    );

    render(<SidePanelPathUrlSyncEffect />, { wrapper });

    await waitFor(() => expect(openNext).toBeDefined());

    act(() => openNext?.(FIELD_PATH));

    await waitFor(() => {
      expect(recordedSearchValues.at(-1)).toBe(
        `?panel=${encodeURIComponent(FIELD_PATH)}`,
      );
    });
  });
});
