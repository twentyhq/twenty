import {
  GRANOLA_MAX_PAGE_SIZE,
  GRANOLA_PAGE_INTERVAL_MILLISECONDS,
} from 'src/constants/granola-api.constant';
import { type GranolaFolder } from 'src/logic-functions/types/granola-api.type';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { getGranolaNextPage } from 'src/logic-functions/utils/get-granola-next-page.util';

export const listAllGranolaFoldersOrThrow = async ({
  client = createGranolaClientOrThrow(),
}: {
  client?: Pick<ReturnType<typeof createGranolaClientOrThrow>, 'listFolders'>;
} = {}): Promise<GranolaFolder[]> => {
  const folders: GranolaFolder[] = [];
  let cursor: string | undefined;

  for (let pageIndex = 0; ; pageIndex++) {
    const page = await client.listFolders({
      cursor,
      page_size: GRANOLA_MAX_PAGE_SIZE,
    });
    folders.push(...page.folders);

    const nextPage = getGranolaNextPage({
      ...page,
      previousCursor: cursor,
      pageIndex,
    });

    if (nextPage.kind === 'complete') {
      return folders;
    }

    if (nextPage.kind === 'stalled') {
      throw new Error(nextPage.reason);
    }

    cursor = nextPage.cursor;
    await new Promise((resolve) =>
      setTimeout(resolve, GRANOLA_PAGE_INTERVAL_MILLISECONDS),
    );
  }
};
