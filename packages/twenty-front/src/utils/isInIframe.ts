export const isInFrame = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};
