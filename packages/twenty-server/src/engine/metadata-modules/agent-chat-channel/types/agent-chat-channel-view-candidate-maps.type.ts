import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export type AgentChatChannelViewCandidateMaps<
  TFlatView extends Pick<FlatView, 'presetFilter'>,
> = {
  flatViewMaps: { byUniversalIdentifier: Partial<Record<string, TFlatView>> };
  flatViewFilterMaps: {
    byUniversalIdentifier: Partial<
      Record<
        string,
        Pick<
          FlatViewFilter,
          | 'viewUniversalIdentifier'
          | 'fieldMetadataUniversalIdentifier'
          | 'operand'
          | 'value'
          | 'viewFilterGroupId'
        >
      >
    >;
  };
};
