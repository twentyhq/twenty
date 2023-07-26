import afterFrame from 'afterframe';

export function measureTotalFrameLoad(id: string) {
  const timerId = `Total loading time for : ${id}`;

  console.time(timerId);

  afterFrame(() => {
    console.timeEnd(timerId);
  });
}
