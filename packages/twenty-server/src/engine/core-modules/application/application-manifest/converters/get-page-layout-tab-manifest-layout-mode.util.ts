import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
} from 'twenty-shared/application';
import { PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-shared/types';

export const getPageLayoutTabManifestLayoutMode = ({
  pageLayoutTabManifest,
  pageLayoutType,
}: {
  pageLayoutTabManifest: Pick<PageLayoutTabManifest, 'layoutMode'>;
  pageLayoutType: PageLayoutManifest['type'] | undefined;
}): PageLayoutTabLayoutMode =>
  pageLayoutTabManifest.layoutMode ??
  (pageLayoutType === PageLayoutType.STANDALONE_PAGE
    ? PageLayoutTabLayoutMode.VERTICAL_LIST
    : PageLayoutTabLayoutMode.GRID);
