import { render, screen } from '@testing-library/react';
import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { RecoilRoot } from 'recoil';
import { enUS } from 'date-fns/locale';
import type { ReactNode } from 'react';

import { MenuItemNavigate } from 'twenty-ui/navigation';
import { useRtl } from '~/hooks/useRtl';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateJalali } from '~/modules/localization/utils/formatDateJalali';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot
    initializeState={({ set }) => {
      set(dateLocaleState, { locale: 'fa-IR', localeCatalog: enUS });
    }}
  >
    {children}
  </RecoilRoot>
);

const RtlProvider = ({ children }: { children: ReactNode }) => {
  useRtl();
  return <>{children}</>;
};

describe('fa-IR components', () => {
  beforeAll(() => {
    i18n.load('fa-IR', {});
    i18n.activate('fa-IR');
  });

  it('renders form, table and modal in RTL with Persian icons and dates', () => {
    const { container } = render(
      <Wrapper>
        <RtlProvider>
          <form aria-label="test-form">
            <table>
              <tbody>
                <tr>
                  <td>
                    {formatDateJalali('2024-03-20T00:00:00.000Z', { locale: 'fa-IR' })}
                  </td>
                </tr>
              </tbody>
            </table>
            <div role="dialog" aria-label="modal">
              <MenuItemNavigate text={t`Next`} />
            </div>
          </form>
        </RtlProvider>
      </Wrapper>,
    );

    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(
      container.querySelector(
        'svg.tabler-icon-chevron-left, svg.icon-tabler-chevron-left',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell')).toHaveTextContent('1403-01-01');
    expect(screen.getByRole('form', { name: 'test-form' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'modal' })).toBeInTheDocument();
  });
});
