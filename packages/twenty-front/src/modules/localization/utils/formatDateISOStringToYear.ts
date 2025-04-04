import { getYear } from "date-fns";

export const formatDateISOStringToYear = (
  date: string,
) => {
  return getYear(new Date(date)).toString()
};
