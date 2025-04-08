import { format } from "date-fns";

export function validateCustomDateFormat(formatString: string): boolean {
    try {
      format(new Date(), formatString);
      return true;
    } catch {
      return false;
    }
  }