// @ts-expect-error - Vite worker inline import
import RemoteWorker from '../remote-worker?worker&inline';

export const createRemoteWorker = (): Worker => {
  return new RemoteWorker();
};
