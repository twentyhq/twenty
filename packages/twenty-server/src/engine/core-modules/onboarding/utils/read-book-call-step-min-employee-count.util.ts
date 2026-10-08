import { getBookCallStepMinEmployeeCount } from 'src/engine/core-modules/onboarding/utils/get-book-call-step-min-employee-count.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const readBookCallStepMinEmployeeCount = (
  twentyConfigService: TwentyConfigService,
): number | null =>
  getBookCallStepMinEmployeeCount({
    calendarBookingPageId: twentyConfigService.get('CALENDAR_BOOKING_PAGE_ID'),
    minEmployeeCount: twentyConfigService.get(
      'ONBOARDING_BOOK_CALL_MIN_EMPLOYEE_COUNT',
    ),
  });
