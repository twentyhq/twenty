import * as fs from 'fs';
import * as path from 'path';

// Load the error report
const reportPath = path.resolve(__dirname, 'tmp.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as Record<
  string,
  { position: string; rule: string }[]
>;

// Count total errors
const totalErrors = Object.values(report).reduce(
  (acc, occurrences) => acc + occurrences.length,
  0,
);

console.log(`Found ${totalErrors} eslint errors to fix`);

// Process each file
let processedErrors = 0;
let modifiedFiles = 0;
let counter = 1;

for (const [filePath, occurrences] of Object.entries(report)) {
  try {
    // Skip if file doesn't exist
    if (!fs.existsSync(filePath)) {
      console.log(`File doesn't exist: ${filePath}`);
      continue;
    }

    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');

    // Sort occurrences by line and column in descending order
    // This way we can process from bottom to top to avoid line number shifts
    const sortedOccurrences = [...occurrences].sort((a, b) => {
      const [aLine, aCol] = a.position.split(':').map(Number);
      const [bLine, bCol] = b.position.split(':').map(Number);

      if (aLine === bLine) {
        return bCol - aCol;
      }

      return bLine - aLine;
    });

    let modified = false;

    // Process each occurrence
    for (const occurrence of sortedOccurrences) {
      const [lineNum, _] = occurrence.position.split(':').map(Number);

      // Line numbers in the error report are 1-indexed
      const lineIndex = lineNum - 1;

      // Skip if trying to access a line that doesn't exist
      if (lineIndex < 0 || lineIndex >= lines.length) {
        console.log(
          `Line index out of bounds in ${filePath}: ${lineIndex} (max: ${lines.length - 1})`,
        );
        continue;
      }

      // Check if the line already has an eslint-disable-next-line comment above it
      if (
        lineIndex > 0 &&
        lines[lineIndex - 1].includes('eslint-disable-next-line')
      ) {
        processedErrors++;
        continue;
      }

      // Insert eslint-disable comment before the line with the error
      lines.splice(
        lineIndex,
        0,
        `// eslint-disable-next-line @typescript-eslint/no-explicit-any`,
      );
      counter++;
      // Since we added a line, all subsequent line numbers in this file need to be adjusted
      // But since we're processing from bottom to top, this won't affect our processing

      modified = true;
      processedErrors++;
    }

    // Save the modified file only if changes were made
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      modifiedFiles++;
    }

    // Log progress periodically
    if (processedErrors % 50 === 0 || processedErrors === totalErrors) {
      console.log(
        `Progress: ${processedErrors}/${totalErrors} errors processed`,
      );
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

console.log(
  `\nCompleted: ${processedErrors}/${totalErrors} errors processed in ${modifiedFiles} files`,
);
