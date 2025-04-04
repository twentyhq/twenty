import { format } from "date-fns";

export const formatDateISOStringToYear = (date: string) => {
  return format(new Date(date), "yyyy");
};
