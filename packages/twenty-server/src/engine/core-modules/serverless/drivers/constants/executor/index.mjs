import { promises as fs } from 'fs';
import { v4 } from 'uuid';


export const handler = async (event) => {
  try {
    const { code, params } = event;

    const mainPath = `/tmp/${v4()}.mjs`;

    await fs.writeFile(mainPath, code, 'utf8');

    const mainFile = await import(mainPath);

    return  await mainFile.main(params);
  } finally {
    await fs.rm(mainPath, { force: true });
  }
};
