import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

export const getIsBookCallRequired = ({
  companyEnrichment,
  bookCallMinEmployeeCount,
  calendarBookingPageId,
}: {
  companyEnrichment: Pick<WorkspaceCompanyEnrichment, 'employeeCount'> | null;
  bookCallMinEmployeeCount: number | null;
  calendarBookingPageId: string | null;
}) =>
  isNonEmptyString(calendarBookingPageId) &&
  isNumber(bookCallMinEmployeeCount) &&
  isNumber(companyEnrichment?.employeeCount) &&
  companyEnrichment.employeeCount >= bookCallMinEmployeeCount;
