import { SetMetadata } from '@nestjs/common';

import { METADATA_RESOLVED_FIELD_RESOLVER_METADATA_KEY } from 'src/engine/api/common/common-metadata-resolved-fields/constants/metadata-resolved-field-resolver-metadata-key.constant';

export const MetadataResolvedFieldResolver = (): ClassDecorator =>
  SetMetadata(METADATA_RESOLVED_FIELD_RESOLVER_METADATA_KEY, true);
