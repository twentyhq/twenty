
export const resolveNumberViewFilterValue = (
  viewFilterValue: string
) => {
  return viewFilterValue === '' ? null : +viewFilterValue;
};
