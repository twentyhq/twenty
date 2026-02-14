import * as fs from 'fs';

import { type JsonUpdate } from '../types/JsonUpdate';

import { prettierFormat } from './prettierFormat';

export const updateJsonFile = ({
  content,
  file,
}: {
  content: JsonUpdate;
  file: string;
}) => {
  const updatedJsonFile = JSON.stringify(content);
  const formattedContent = prettierFormat(updatedJsonFile, 'json-stringify');

  fs.writeFileSync(file, formattedContent, 'utf-8');
};
