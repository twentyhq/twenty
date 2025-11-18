import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { type RulesLogic } from 'json-logic-js';
import { type ModifiedProperties, type Nullable } from 'twenty-shared/types';
import {
  type PageLayoutTab as PageLayoutTabGenerated,
  type PageLayoutWidget,
} from '~/generated/graphql';

export type PageLayoutTab = Omit<PageLayoutTabGenerated, 'widgets'> & {
  widgets: ModifiedProperties<
    PageLayoutWidget,
    {
      objectMetadataId?: Nullable<string>;
      conditionalDisplay?: RulesLogic;
    }
  >[];
  /**
   * Only available behind IS_RECORD_PAGE_LAYOUT_ENABLED for now.
   */
  layoutMode?: PageLayoutTabLayoutMode;
  icon?: string;
};
