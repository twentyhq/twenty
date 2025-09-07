import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { enUS } from 'date-fns/locale';
import type { ReactNode } from 'react';

import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { useRtl } from '../useRtl';

describe('useRtl', () => {
  beforeEach(() => {
    document.documentElement.dir = '';
  });

  it('sets document direction to rtl when locale is rtl', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(dateLocaleState, { locale: 'fa-IR', localeCatalog: enUS });
        }}
      >
        {children}
      </RecoilRoot>
    );

    renderHook(() => useRtl(), { wrapper });

    expect(document.documentElement.dir).toBe('rtl');
  });

  it('sets document direction to ltr when locale is not rtl', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(dateLocaleState, { locale: 'en-US', localeCatalog: enUS });
        }}
      >
        {children}
      </RecoilRoot>
    );

    renderHook(() => useRtl(), { wrapper });

    expect(document.documentElement.dir).toBe('ltr');
  });
});
