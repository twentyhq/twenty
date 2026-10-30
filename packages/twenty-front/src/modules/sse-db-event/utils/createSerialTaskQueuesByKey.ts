export const createSerialTaskQueuesByKey = () => {
  const lastTaskByKey = new Map<string, Promise<void>>();

  const enqueue = ({
    key,
    task,
  }: {
    key: string;
    task: () => Promise<void>;
  }) => {
    const nextTask = (lastTaskByKey.get(key) ?? Promise.resolve()).then(task);
    const settledTask = nextTask.catch(() => undefined);

    lastTaskByKey.set(key, settledTask);

    void settledTask.then(() => {
      if (lastTaskByKey.get(key) === settledTask) {
        lastTaskByKey.delete(key);
      }
    });

    return nextTask;
  };

  return { enqueue };
};
