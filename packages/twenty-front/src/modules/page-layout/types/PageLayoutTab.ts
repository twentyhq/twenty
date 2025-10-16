import { type ModifiedProperties, type Nullable } from 'twenty-shared/types';
import {
  type PageLayoutTab as PageLayoutTabGenerated,
  type PageLayoutWidget,
} from '~/generated/graphql';

export type PageLayoutTab = Omit<PageLayoutTabGenerated, 'widgets'> & {
  widgets: ModifiedProperties<
    PageLayoutWidget,
    { objectMetadataId?: Nullable<string> }
  >[];
};
