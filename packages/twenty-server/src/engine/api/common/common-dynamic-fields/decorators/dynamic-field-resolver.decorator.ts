import { SetMetadata } from '@nestjs/common';

import { DYNAMIC_FIELD_RESOLVER_METADATA_KEY } from 'src/engine/api/common/common-dynamic-fields/constants/dynamic-field-resolver-metadata-key.constant';

export const DynamicFieldResolver = (): ClassDecorator =>
  SetMetadata(DYNAMIC_FIELD_RESOLVER_METADATA_KEY, true);
