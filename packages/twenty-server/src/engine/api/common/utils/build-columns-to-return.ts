import { buildColumnsToSelect } from 'src/engine/api/common/utils/build-columns-to-select';

export const buildColumnsToReturn = (
  buildColumnsToSelectArguments: Parameters<typeof buildColumnsToSelect>[0],
): string[] => Object.keys(buildColumnsToSelect(buildColumnsToSelectArguments));
