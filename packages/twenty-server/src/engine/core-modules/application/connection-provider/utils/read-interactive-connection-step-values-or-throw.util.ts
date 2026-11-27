import { isString } from '@sniptt/guards';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { INTERACTIVE_CONNECTION_LIMITS } from 'src/engine/core-modules/application/connection-provider/constants/interactive-connection-limits.constant';
import { type InteractiveConnectionAction } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-action.type';
import { type InteractiveConnectionFlowSession } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-flow-session.type';

export const readInteractiveConnectionStepValuesOrThrow = ({
  action,
  session,
  values,
}: {
  action: Exclude<InteractiveConnectionAction, 'cancel'>;
  session: Pick<
    InteractiveConnectionFlowSession,
    'screenType' | 'fieldKeys' | 'submitCount'
  >;
  values: Record<string, unknown>;
}): Record<string, string> => {
  const isScreenAcceptingAction =
    action === 'submit'
      ? session.screenType === 'form'
      : session.screenType === 'waiting' || session.screenType === 'qr-code';

  if (!isScreenAcceptingAction) {
    throw new ConnectionProviderException(
      `Cannot ${action} on a ${session.screenType} screen`,
      ConnectionProviderExceptionCode.INVALID_REQUEST,
    );
  }

  if (action === 'poll') {
    return {};
  }

  if (session.submitCount >= INTERACTIVE_CONNECTION_LIMITS.maxSubmitCount) {
    throw new ConnectionProviderException(
      'Interactive connection flow reached its submit limit',
      ConnectionProviderExceptionCode.INTERACTIVE_CONNECTION_EXPIRED,
    );
  }

  const fieldKeys = new Set(session.fieldKeys);
  const stringValues: Record<string, string> = {};

  for (const [key, value] of Object.entries(values)) {
    if (
      !fieldKeys.has(key) ||
      !isString(value) ||
      value.length > INTERACTIVE_CONNECTION_LIMITS.maxValueLength
    ) {
      throw new ConnectionProviderException(
        'Submitted values do not match the fields of the current screen',
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }

    stringValues[key] = value;
  }

  return stringValues;
};
