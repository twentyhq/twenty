export const isPressLessClick = (event: MouseEvent): boolean =>
  event.type === 'click' && event.detail === 0;
