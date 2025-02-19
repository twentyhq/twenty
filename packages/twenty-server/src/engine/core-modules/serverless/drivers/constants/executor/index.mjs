import { promises as fs } from 'fs';
import { v4 } from 'uuid';


export const handler = async (event) => {
  const mainPath = `/tmp/${v4()}.mjs`;

  try {
    const { code, params } = event;

    await fs.writeFile(mainPath, code, 'utf8');

    process.env = {}

    const mainFile = await import(mainPath);

    return  await mainFile.main(params);
  } finally {
    await fs.rm(mainPath, { force: true });
  }
};
