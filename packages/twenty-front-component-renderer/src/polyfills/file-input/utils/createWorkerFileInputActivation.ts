import { isDefined } from 'twenty-shared/utils';

export const createWorkerFileInputActivation = () => {
  const activationIdByEvent = new WeakMap<Event, string>();
  let currentActivationId: string | undefined;

  return {
    register: ({
      event,
      activationId,
    }: {
      event: Event;
      activationId?: string;
    }) => {
      if (isDefined(activationId)) {
        activationIdByEvent.set(event, activationId);
      }
    },
    dispatch: ({
      event,
      dispatch,
    }: {
      event: Event;
      dispatch: () => boolean;
    }): boolean => {
      const activationId = activationIdByEvent.get(event);

      if (!isDefined(activationId)) {
        return dispatch();
      }

      activationIdByEvent.delete(event);
      currentActivationId = activationId;

      try {
        return dispatch();
      } finally {
        currentActivationId = undefined;
      }
    },
    takeActivationId: (): string | undefined => {
      const activationId = currentActivationId;
      currentActivationId = undefined;
      return activationId;
    },
  };
};
