import { isDefined } from 'twenty-shared/utils';

import {
  type ResolverNameMapEntry,
  buildResolverNameMap,
} from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeGraphQLResolverNameMap = ({
  flatObjectMetadataMaps,
}: {
  flatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<
        string,
        Pick<
          FlatObjectMetadata,
          'universalIdentifier' | 'nameSingular' | 'namePlural'
        >
      >
    >;
  };
}): Record<string, ResolverNameMapEntry> =>
  buildResolverNameMap(
    Object.values(flatObjectMetadataMaps.byUniversalIdentifier).filter(
      isDefined,
    ),
  );
