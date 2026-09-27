import { msg } from '@lingui/core/macro';
import Papa from 'papaparse';
import { pipeline, type Readable, Transform } from 'stream';

import {
  RECORD_IMPORT_MAX_CELL_LENGTH,
  RECORD_IMPORT_MAX_COLUMN_COUNT,
} from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { RecordImportException } from 'src/engine/core-modules/record-import/record-import.exception';
import { type RecordImportRow } from 'src/engine/core-modules/record-import/types/record-import-session.type';

const createDecoder = (encoding: string) => {
  const decoder = new TextDecoder(encoding);

  return new Transform({
    readableObjectMode: false,
    transform(chunk: Buffer, _encoding, callback) {
      callback(null, decoder.decode(chunk, { stream: true }));
    },
    flush(callback) {
      callback(null, decoder.decode());
    },
  });
};

export const assertRecordImportRowWithinLimits = (cells: string[]) => {
  if (cells.length > RECORD_IMPORT_MAX_COLUMN_COUNT) {
    throw new RecordImportException(
      `Row has ${cells.length} columns`,
      'FILE_LIMIT_EXCEEDED',
      {
        userFriendlyMessage: msg`The file has too many columns. The limit is ${RECORD_IMPORT_MAX_COLUMN_COUNT}.`,
      },
    );
  }

  if (cells.some((cell) => cell.length > RECORD_IMPORT_MAX_CELL_LENGTH)) {
    throw new RecordImportException('Cell is too long', 'FILE_LIMIT_EXCEEDED', {
      userFriendlyMessage: msg`A cell in the file is longer than ${RECORD_IMPORT_MAX_CELL_LENGTH} characters.`,
    });
  }
};

// Guessed on a sample with blank lines skipped: Papa Parse's own guess, made
// while keeping blank lines, falls back to a comma whenever the text ends with
// a line break.
export const guessRecordImportCsvDelimiter = (sample: string): string =>
  Papa.parse(sample.slice(0, sample.lastIndexOf('\n') + 1) || sample, {
    delimitersToGuess: [',', ';', '\t', '|'],
    skipEmptyLines: 'greedy',
    preview: 100,
  }).meta.delimiter;

// Streams records, so memory stays flat whatever the file size. A record may
// span several lines when a quoted cell contains line breaks; row numbers count
// records, as spreadsheet applications do.
export async function* readRecordImportCsvRows({
  stream,
  encoding,
  delimiter,
}: {
  stream: Readable;
  encoding: string;
  delimiter: string;
}): AsyncGenerator<RecordImportRow> {
  const parser = pipeline(
    stream,
    createDecoder(encoding),
    Papa.parse(Papa.NODE_STREAM_INPUT, { delimiter }),
    (error) => {
      if (error) {
        parser.destroy(error);
      }
    },
  );

  let rowNumber = 0;

  for await (const cells of parser as AsyncIterable<string[]>) {
    rowNumber++;

    if (cells.every((cell) => cell === '')) {
      continue;
    }

    assertRecordImportRowWithinLimits(cells);

    yield { rowNumber, cells };
  }
}
