import { type RemoteReceiver } from '@remote-dom/core/receivers';

type FrontComponentWorkerEffectProps = {
  sourceCode: string;
  receiver: RemoteReceiver;
  onError: () => void;
};

export const FrontComponentWorkerEffect = ({
  sourceCode: _sourceCode,
  receiver: _receiver,
  onError: _onError,
}: FrontComponentWorkerEffectProps) => {
  // TODO: connect to the workek here
  return null;
};
