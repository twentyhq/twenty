const scannedPositions = new Set();
let biggestPosition = -1;

// Sort options by position for consistent processing
const sortedOptions = [
  { name: 'a', position: 2 },
  { name: 'b', position: 1 },
  { name: 'c', position: 1 },
  { name: 'd', position: 2 },
].sort((a, b) => a.position - b.position);

for (const option of sortedOptions) {
  if (scannedPositions.has(option.position)) {
    option.position = biggestPosition + 1;
  }

  biggestPosition = Math.max(biggestPosition, option.position);
  scannedPositions.add(option.position);
}

console.log('Sorted options:', sortedOptions);
