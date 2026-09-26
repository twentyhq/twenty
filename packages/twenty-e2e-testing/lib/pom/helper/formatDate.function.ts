// label looks like this: Choose Wednesday, October 30, 2024
// oxlint-disable-next-line prefer-arrow/prefer-arrow-functions
export function formatDate(value: string): string {
  return 'Choose '.concat(
    new Date(value).toLocaleDateString('en-US', { dateStyle: 'full' }),
  );
}
