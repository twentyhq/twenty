import { Observable } from '@apollo/client';

export const promiseToObservable = <T>(promise: Promise<T>) =>
  new Observable<T>((subscriber) => {
    promise.then(
      (value) => {
        if (subscriber.closed) {
          return;
        }

        subscriber.next(value);
        subscriber.complete();
      },
      (err) => subscriber.error(err),
    );
  });
