import * as path from 'path';

import { TWENTY_UI_ROOT_PATH } from '../constants/TwentyUiRootPath';

const TWENTY_UI_SRC_PATH = path.join(TWENTY_UI_ROOT_PATH, 'src');

export const getTwentyUiComponentCategoryIndexPath = (
  category: string,
): string => path.join(TWENTY_UI_SRC_PATH, `${category}/index.ts`);
