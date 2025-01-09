import { isDefined } from 'twenty-ui';
import { editor, MarkerSeverity } from 'monaco-editor';

const getSubstringCoordinate = (
  text: string,
  substring: string,
): { line: number; column: number } | null => {
  const lines = text.split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const columnIndex = lines[lineIndex].indexOf(substring);
    if (columnIndex !== -1) {
      return {
        line: lineIndex + 1, // 1-based line number
        column: columnIndex + 1, // 1-based column number
      };
    }
  }

  return null;
};

export const getWrongExportedFunctionMarkers = (
  value: string,
): editor.IMarkerData[] => {
  const validRegex = /export\s+const\s+main\s*=/g;
  const invalidRegex = /export\s+const\s+\S*/g;
  const exportRegex = /export\s+const/g;
  const validMatch = value.match(validRegex);
  const invalidMatch = value.match(invalidRegex);
  const exportMatch = value.match(exportRegex);
  const markers: editor.IMarkerData[] = [];

  if (!validMatch && !!invalidMatch) {
    const coordinates = getSubstringCoordinate(value, invalidMatch[0]);
    if (isDefined(coordinates)) {
      const endColumn = invalidMatch[0].length + coordinates.column;
      markers.push({
        severity: MarkerSeverity.Error,
        message: 'Exported arrow function should be named "main"',
        code: 'export const main',
        startLineNumber: coordinates.line,
        startColumn: coordinates.column,
        endLineNumber: 1,
        endColumn,
      });
    }
  }

  if (!exportMatch) {
    markers.push({
      severity: MarkerSeverity.Error,
      message: 'An exported "main" arrow function is required.',
      code: 'export const main',
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    });
  }

  return markers;
};
