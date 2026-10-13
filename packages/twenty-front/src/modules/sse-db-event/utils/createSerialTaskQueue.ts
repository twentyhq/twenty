export const createSerialTaskQueue = () => {
  let lastTask: Promise<void> = Promise.resolve();

  const enqueue = (task: () => Promise<void>) => {
    const nextTask = lastTask.then(task);

    lastTask = nextTask.catch(() => undefined);

    return nextTask;
  };

  return { enqueue };
};
