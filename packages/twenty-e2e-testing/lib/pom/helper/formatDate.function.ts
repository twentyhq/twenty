const nth = (d: number) => {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

// label looks like this: Choose Wednesday, October 30th, 2024
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function formatDate(value: string): string {
  const date = new Date(value);
  return 'Choose '.concat(
    date.toLocaleDateString('en-US', { weekday: 'long' }),
    ', ',
    date.toLocaleDateString('en-US', { month: 'long' }),
    ' ',
    nth(date.getDate()),
    ', ',
    date.toLocaleDateString('en-US', { year: 'numeric' }),
  );
}
