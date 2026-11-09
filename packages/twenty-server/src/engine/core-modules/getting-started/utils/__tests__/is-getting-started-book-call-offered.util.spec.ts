import { isGettingStartedBookCallOffered } from 'src/engine/core-modules/getting-started/utils/is-getting-started-book-call-offered.util';

const calendarBookingPageId = 'team/twenty/talk-to-us';

describe('isGettingStartedBookCallOffered', () => {
  it('should offer the call to every team, whatever its employee count', () => {
    expect(
      isGettingStartedBookCallOffered({
        profile: 'TEAM',
        calendarBookingPageId,
        minEmployeeCount: null,
        employeeCount: null,
      }),
    ).toBe(true);
  });

  it('should offer the call to a small team at or above the threshold', () => {
    expect(
      isGettingStartedBookCallOffered({
        profile: 'SMALL_TEAM',
        calendarBookingPageId,
        minEmployeeCount: 5,
        employeeCount: 8,
      }),
    ).toBe(true);
  });

  it('should not offer the call to a small team below the threshold', () => {
    expect(
      isGettingStartedBookCallOffered({
        profile: 'SMALL_TEAM',
        calendarBookingPageId,
        minEmployeeCount: 20,
        employeeCount: 8,
      }),
    ).toBe(false);
  });

  it('should not offer the call without a booking page', () => {
    expect(
      isGettingStartedBookCallOffered({
        profile: 'TEAM',
        calendarBookingPageId: undefined,
        minEmployeeCount: 20,
        employeeCount: 500,
      }),
    ).toBe(false);
  });
});
