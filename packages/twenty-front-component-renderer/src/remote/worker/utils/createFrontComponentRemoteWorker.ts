// @ts-expect-error - Vite worker inline import
import RemoteWorker from '../remote-worker?worker&inline';

export const createFrontComponentRemoteWorker = (): Worker => {
  return new RemoteWorker();
};
