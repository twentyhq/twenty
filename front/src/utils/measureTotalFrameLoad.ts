import afterFrame from 'afterframe';

export const measureTotalFrameLoad = (id: string) => {
  const timerId = `Total loading time for : ${id}`;

  console.time(timerId);

  afterFrame(() => {
    console.timeEnd(timerId);
  });
};
