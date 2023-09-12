export function formatNumber(value: number) {
  // Formats the value to a string and add commas to it ex: 50,000 | 500,000
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
