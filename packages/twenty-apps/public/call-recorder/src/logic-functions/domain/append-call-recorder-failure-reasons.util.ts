import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const appendCallRecorderFailureReasons = ({
  callRecorderFailureReason,
  failureReasons,
}: {
  callRecorderFailureReason: string | undefined;
  failureReasons: string[];
}): string =>
  [callRecorderFailureReason, ...failureReasons]
    .filter(isNonEmptyString)
    .join(',');
