import { createWorkerFileInputActivation } from '../createWorkerFileInputActivation';

describe('createWorkerFileInputActivation', () => {
  it('limits one-use activation to synchronous dispatch and preserves it through nested local events', () => {
    const activation = createWorkerFileInputActivation();
    const event = new Event('click');
    activation.register({ event, activationId: 'trusted-click' });
    expect(activation.takeActivationId()).toBeUndefined();
    activation.dispatch({
      event,
      dispatch: () => {
        activation.dispatch({
          event: new Event('click'),
          dispatch: () => {
            expect(activation.takeActivationId()).toBe('trusted-click');
            expect(activation.takeActivationId()).toBeUndefined();
            return true;
          },
        });
        return true;
      },
    });
    expect(activation.takeActivationId()).toBeUndefined();
  });

  it('clears dispatch context after an exception and does not reauthorize replayed events', () => {
    const activation = createWorkerFileInputActivation();
    const event = new Event('click');
    activation.register({ event, activationId: 'trusted-click' });
    expect(() =>
      activation.dispatch({
        event,
        dispatch: () => {
          throw new Error('handler failed');
        },
      }),
    ).toThrow('handler failed');
    expect(activation.takeActivationId()).toBeUndefined();
    activation.dispatch({
      event,
      dispatch: () => {
        expect(activation.takeActivationId()).toBeUndefined();
        return true;
      },
    });
  });
});
