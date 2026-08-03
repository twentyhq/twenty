import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { AppPath } from 'twenty-shared/types';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { BookCall } from '~/pages/onboarding/BookCall';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const mockOnboardingStatus = jest.fn();

jest.mock('@/onboarding/hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: () => mockOnboardingStatus(),
}));

jest.mock('@/onboarding/components/BookCallEmbed', () => ({
  BookCallEmbed: ({
    calendarBookingPageId,
  }: {
    calendarBookingPageId: string;
  }) => <div data-testid="book-call-embed">{calendarBookingPageId}</div>,
}));

jest.mock('@/onboarding/components/BookCallOnboardingStepActions', () => ({
  BookCallOnboardingStepActions: () => <div>Skip</div>,
}));

dynamicActivate(SOURCE_LOCALE);

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={[AppPath.BookCall]}>
      <JotaiProvider store={jotaiStore}>
        <I18nProvider i18n={i18n}>
          <Routes>
            <Route path={AppPath.BookCall} element={<BookCall />} />
            <Route
              path={AppPath.PlanRequired}
              element={<div>Choose your plan</div>}
            />
          </Routes>
        </I18nProvider>
      </JotaiProvider>
    </MemoryRouter>,
  );

describe('BookCall', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
    mockOnboardingStatus.mockReturnValue(OnboardingStatus.BOOK_CALL);
  });

  it('should render the step heading alongside the embed', () => {
    jotaiStore.set(calendarBookingPageIdState.atom, 'team/twenty/talk-to-us');

    renderPage();

    expect(screen.getByText('Talk to our team')).toBeInTheDocument();
    expect(screen.getByTestId('book-call-embed')).toHaveTextContent(
      'team/twenty/talk-to-us',
    );
  });

  it('should redirect to the plan step rather than render an empty embed', () => {
    renderPage();

    expect(screen.getByText('Choose your plan')).toBeInTheDocument();
    expect(screen.queryByTestId('book-call-embed')).not.toBeInTheDocument();
  });
});
