import unzipper from 'unzipper';

export const unzipFile = async (
  sourcePath: string,
  outDirPath: string,
): Promise<void> => {
  const directory = await unzipper.Open.file(sourcePath);

  await directory.extract({ path: outDirPath });
};
