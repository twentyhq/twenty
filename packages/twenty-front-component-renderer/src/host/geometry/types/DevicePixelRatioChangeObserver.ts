export type DevicePixelRatioChangeObserver = {
  observe: () => void;
  disconnect: () => void;
};
