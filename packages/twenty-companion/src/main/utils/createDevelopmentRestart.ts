export const createDevelopmentRestart = (
  isBusy: () => boolean,
  restart: () => void,
) => {
  let timer: ReturnType<typeof setInterval> | undefined;
  let restarting = false;
  const dispose = () => {
    clearInterval(timer);
    timer = undefined;
  };
  const attempt = () => {
    if (isBusy()) return;
    restarting = true;
    dispose();
    restart();
  };
  return {
    request: () => {
      if (timer || restarting) return;
      timer = setInterval(attempt, 250);
      attempt();
    },
    dispose,
  };
};
