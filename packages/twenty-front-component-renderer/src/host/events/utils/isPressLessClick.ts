export const isPressLessClick = (
  event: Pick<MouseEvent, 'type' | 'detail'>,
): boolean => event.type === 'click' && event.detail === 0;
