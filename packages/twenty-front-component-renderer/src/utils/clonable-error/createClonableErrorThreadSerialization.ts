import { ThreadSerializationStructuredClone } from '@quilted/threads';
import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_THREAD_ERROR_MARKER } from '@/constants/FrontComponentThreadErrorMarker';
import { buildClonableErrorPayload } from '@/utils/clonable-error/buildClonableErrorPayload';
import { extractClonableErrorPayload } from '@/utils/clonable-error/extractClonableErrorPayload';
import { isErrorLikeValue } from '@/utils/clonable-error/isErrorLikeValue';
import { rehydrateClonableError } from '@/utils/clonable-error/rehydrateClonableError';

export const createClonableErrorThreadSerialization =
  (): ThreadSerializationStructuredClone =>
    new ThreadSerializationStructuredClone({
      serialize: (value) =>
        isErrorLikeValue(value)
          ? {
              [FRONT_COMPONENT_THREAD_ERROR_MARKER]:
                buildClonableErrorPayload(value),
            }
          : undefined,
      deserialize: (value) => {
        const payload = extractClonableErrorPayload(value);

        return isDefined(payload) ? rehydrateClonableError(payload) : undefined;
      },
    });
