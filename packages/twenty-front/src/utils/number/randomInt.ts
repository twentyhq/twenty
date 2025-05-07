/**
 *
 * @param min the minimum value
 * @param max the maximum value
 * @returns a number between min and max
 */
export function randomInt(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
