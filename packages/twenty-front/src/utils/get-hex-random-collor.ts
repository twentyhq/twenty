/**
 * Generates a random hexadecimal color code
 * @returns A string representing a random color in hexadecimal format (e.g., "#1a2b3c")
 */
export function getRandomHexColor(): string {
  // Generate random values for red, green, and blue components
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  // Convert each component to hexadecimal and pad with zero if needed
  const redHex = red.toString(16).padStart(2, '0');
  const greenHex = green.toString(16).padStart(2, '0');
  const blueHex = blue.toString(16).padStart(2, '0');

  // Combine components into a hex color string
  return `#${redHex}${greenHex}${blueHex}`;
}
