import { type FrontComponentStorageArea } from 'twenty-sdk/front-component';

export const getBrowserStorageForArea = (
  area: FrontComponentStorageArea,
): Storage => (area === 'local' ? window.localStorage : window.sessionStorage);
